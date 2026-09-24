import {
  Emitter,
  EventImpl,
  addMs,
  buildDateSpanApiWithContext,
  buildEventInstanceRange,
  buildValidInstanceRange,
  compileEventUis,
  createEmptyEventStore,
  excludeSubEventStore,
  expandRecurring,
  filterEventStoreDefs,
  filterHash,
  getRangeInstantEndMs,
  getRangeInstantStartMs,
  instanceRangeContainsRange,
  instanceRangesIntersect,
  mapHash,
  mergeEventStores,
  parseEvents,
  rangeContainsRange
} from "./chunk-43C3ZVMA.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-J25FJFZE.js";

// node_modules/fullcalendar/chunks/b00ce53f.js
function reduceEventStore(eventStore, action, eventSources, dateProfile, context) {
  switch (action.type) {
    case "RECEIVE_EVENTS":
      return receiveRawEvents(eventStore, eventSources[action.sourceId], action.fetchId, action.fetchRange, action.rawEvents, context);
    case "RESET_RAW_EVENTS":
      return resetRawEvents(eventStore, eventSources[action.sourceId], action.rawEvents, dateProfile.activeRange, context);
    case "ADD_EVENTS":
      return addEvent(
        eventStore,
        action.eventStore,
        // new ones
        dateProfile ? dateProfile.activeRange : null,
        context
      );
    case "RESET_EVENTS":
      return action.eventStore;
    case "MERGE_EVENTS":
      return mergeEventStores(eventStore, action.eventStore);
    case "PREV":
    // TODO: how do we track all actions that affect dateProfile :(
    case "NEXT":
    case "CHANGE_DATE":
    case "CHANGE_VIEW_TYPE":
      if (dateProfile) {
        return expandRecurring(eventStore, dateProfile.activeRange, context);
      }
      return eventStore;
    case "REMOVE_EVENTS":
      return excludeSubEventStore(eventStore, action.eventStore);
    case "REMOVE_EVENT_SOURCE":
      return excludeEventsBySourceId(eventStore, action.sourceId);
    case "REMOVE_ALL_EVENT_SOURCES":
      return filterEventStoreDefs(eventStore, (eventDef) => !eventDef.sourceId);
    case "REMOVE_ALL_EVENTS":
      return createEmptyEventStore();
    default:
      return eventStore;
  }
}
function receiveRawEvents(eventStore, eventSource, fetchId, fetchRange, rawEvents, context) {
  if (eventSource && // not already removed
  fetchId === eventSource.latestFetchId) {
    let subset = parseEvents(transformRawEvents(rawEvents, eventSource, context), eventSource, context);
    if (fetchRange) {
      subset = expandRecurring(subset, fetchRange, context);
    }
    return mergeEventStores(excludeEventsBySourceId(eventStore, eventSource.sourceId), subset);
  }
  return eventStore;
}
function resetRawEvents(existingEventStore, eventSource, rawEvents, activeRange, context) {
  const { defIdMap, instanceIdMap } = buildPublicIdMaps(existingEventStore);
  let newEventStore = parseEvents(transformRawEvents(rawEvents, eventSource, context), eventSource, context, false, defIdMap, instanceIdMap);
  return expandRecurring(newEventStore, activeRange, context);
}
function transformRawEvents(rawEvents, eventSource, context) {
  let calEachTransform = context.options.eventDataTransform;
  let sourceEachTransform = eventSource ? eventSource.eventDataTransform : null;
  if (sourceEachTransform) {
    rawEvents = transformEachRawEvent(rawEvents, sourceEachTransform);
  }
  if (calEachTransform) {
    rawEvents = transformEachRawEvent(rawEvents, calEachTransform);
  }
  return rawEvents;
}
function transformEachRawEvent(rawEvents, func) {
  let refinedEvents;
  if (!func) {
    refinedEvents = rawEvents;
  } else {
    refinedEvents = [];
    for (let rawEvent of rawEvents) {
      let refinedEvent = func(rawEvent);
      if (refinedEvent) {
        refinedEvents.push(refinedEvent);
      } else if (refinedEvent == null) {
        refinedEvents.push(rawEvent);
      }
    }
  }
  return refinedEvents;
}
function addEvent(eventStore, subset, expandRange, context) {
  if (expandRange) {
    subset = expandRecurring(subset, expandRange, context);
  }
  return mergeEventStores(eventStore, subset);
}
function rezoneEventStoreDates(eventStore, oldDateEnv, newDateEnv) {
  let { defs } = eventStore;
  let instances = mapHash(eventStore.instances, (instance) => {
    let def = defs[instance.defId];
    if (def.allDay) {
      return instance;
    }
    let { instantStartMs, instantEndMs } = instance.range;
    let start = instantStartMs != null ? newDateEnv.timestampToMarker(instantStartMs) : newDateEnv.createMarker(oldDateEnv.toDate(instance.range.start));
    let end = instantEndMs != null ? newDateEnv.timestampToMarker(instantEndMs) : newDateEnv.createMarker(oldDateEnv.toDate(instance.range.end));
    return __spreadProps(__spreadValues({}, instance), {
      range: buildValidInstanceRange({ marker: start, instantMs: instantStartMs }, { marker: end, instantMs: instantEndMs }, newDateEnv) ?? buildEventInstanceRange(
        // mixed exact/civil edges whose real order degenerated in the new zone (rare):
        // keep the exact start, apply the old real duration civilly
        start,
        addMs(start, getRangeInstantEndMs(instance.range, oldDateEnv) - getRangeInstantStartMs(instance.range, oldDateEnv)),
        instantStartMs
      )
    });
  });
  return { defs, instances };
}
function excludeEventsBySourceId(eventStore, sourceId) {
  return filterEventStoreDefs(eventStore, (eventDef) => eventDef.sourceId !== sourceId);
}
function excludeInstances(eventStore, removals) {
  return {
    defs: eventStore.defs,
    instances: filterHash(eventStore.instances, (instance) => !removals[instance.instanceId])
  };
}
function buildPublicIdMaps(eventStore) {
  const { defs, instances } = eventStore;
  const defIdMap = {};
  const instanceIdMap = {};
  for (let defId in defs) {
    const def = defs[defId];
    const { publicId } = def;
    if (publicId) {
      defIdMap[publicId] = defId;
    }
  }
  for (let instanceId in instances) {
    const instance = instances[instanceId];
    const def = defs[instance.defId];
    const { publicId } = def;
    if (publicId) {
      instanceIdMap[publicId] = instanceId;
    }
  }
  return { defIdMap, instanceIdMap };
}
var Interaction = class {
  constructor(settings) {
    this.component = settings.component;
    this.isHitComboAllowed = settings.isHitComboAllowed || null;
  }
  destroy() {
  }
};
function parseInteractionSettings(component, input) {
  return {
    component,
    el: input.el,
    useEventCenter: input.useEventCenter != null ? input.useEventCenter : true,
    isHitComboAllowed: input.isHitComboAllowed || null
  };
}
function interactionSettingsToStore(settings) {
  return {
    [settings.component.uid]: settings
  };
}
var interactionSettingsStore = {};

// node_modules/fullcalendar/chunks/f0ab0579.js
var ElementDragging = class {
  constructor(el, selector) {
    this.emitter = new Emitter();
  }
  destroy() {
  }
  setMirrorIsVisible(bool) {
  }
  setMirrorNeedsRevert(bool) {
  }
  setAutoScrollEnabled(bool) {
  }
};
var config = {};
function isInteractionValid(interaction, dateProfile, context) {
  let { instances } = interaction.mutatedEvents;
  for (let instanceId in instances) {
    if (!rangeContainsRange(dateProfile.validRange, instances[instanceId].range)) {
      return false;
    }
  }
  return isNewPropsValid({ eventDrag: interaction }, context);
}
function isDateSelectionValid(dateSelection, dateProfile, context) {
  if (!rangeContainsRange(dateProfile.validRange, dateSelection.range)) {
    return false;
  }
  return isNewPropsValid({ dateSelection }, context);
}
function isNewPropsValid(newProps, context) {
  let calendarState = context.getCurrentData();
  let props = __spreadValues({
    businessHours: calendarState.businessHours,
    dateSelection: "",
    eventStore: calendarState.eventStore,
    eventUiBases: calendarState.eventUiBases,
    eventSelection: "",
    eventDrag: null,
    eventResize: null
  }, newProps);
  return (context.pluginHooks.isPropsValid || isPropsValid)(props, context);
}
function isPropsValid(state, context, dateSpanMeta = {}, filterConfig) {
  if (state.eventDrag && !isInteractionPropsValid(state, context, dateSpanMeta, filterConfig)) {
    return false;
  }
  if (state.dateSelection && !isDateSelectionPropsValid(state, context, dateSpanMeta, filterConfig)) {
    return false;
  }
  return true;
}
function isInteractionPropsValid(state, context, dateSpanMeta, filterConfig) {
  let currentState = context.getCurrentData();
  let interaction = state.eventDrag;
  let subjectEventStore = interaction.mutatedEvents;
  let subjectDefs = subjectEventStore.defs;
  let subjectInstances = subjectEventStore.instances;
  let subjectConfigs = compileEventUis(subjectDefs, interaction.isEvent ? state.eventUiBases : { "": currentState.selectionConfig });
  if (filterConfig) {
    subjectConfigs = mapHash(subjectConfigs, filterConfig);
  }
  let otherEventStore = excludeInstances(state.eventStore, interaction.affectedEvents.instances);
  let otherDefs = otherEventStore.defs;
  let otherInstances = otherEventStore.instances;
  let otherConfigs = compileEventUis(otherDefs, state.eventUiBases);
  for (let subjectInstanceId in subjectInstances) {
    let subjectInstance = subjectInstances[subjectInstanceId];
    let subjectRange = subjectInstance.range;
    let subjectConfig = subjectConfigs[subjectInstance.defId];
    let subjectDef = subjectDefs[subjectInstance.defId];
    if (!allConstraintsPass(subjectConfig.constraints, subjectRange, otherEventStore, state.businessHours, context)) {
      return false;
    }
    let { eventOverlap } = context.options;
    let eventOverlapFunc = typeof eventOverlap === "function" ? eventOverlap : null;
    for (let otherInstanceId in otherInstances) {
      let otherInstance = otherInstances[otherInstanceId];
      if (instanceRangesIntersect(subjectRange, otherInstance.range, context.dateEnv)) {
        let otherOverlap = otherConfigs[otherInstance.defId].overlap;
        if (otherOverlap === false && interaction.isEvent) {
          return false;
        }
        if (subjectConfig.overlap === false) {
          return false;
        }
        if (eventOverlapFunc && !eventOverlapFunc(
          new EventImpl(context, otherDefs[otherInstance.defId], otherInstance),
          // still event
          new EventImpl(context, subjectDef, subjectInstance)
        )) {
          return false;
        }
      }
    }
    let calendarEventStore = currentState.eventStore;
    for (let subjectAllow of subjectConfig.allows) {
      let subjectDateSpan = __spreadProps(__spreadValues({}, dateSpanMeta), {
        range: subjectInstance.range,
        allDay: subjectDef.allDay
      });
      let origDef = calendarEventStore.defs[subjectDef.defId];
      let origInstance = calendarEventStore.instances[subjectInstanceId];
      let eventApi;
      if (origDef) {
        eventApi = new EventImpl(context, origDef, origInstance);
      } else {
        eventApi = new EventImpl(context, subjectDef);
      }
      if (!subjectAllow(buildDateSpanApiWithContext(subjectDateSpan, context), eventApi)) {
        return false;
      }
    }
  }
  return true;
}
function isDateSelectionPropsValid(state, context, dateSpanMeta, filterConfig) {
  let relevantEventStore = state.eventStore;
  let relevantDefs = relevantEventStore.defs;
  let relevantInstances = relevantEventStore.instances;
  let selection = state.dateSelection;
  let selectionRange = buildEventInstanceRange(selection.range.start, selection.range.end, selection.instantStartMs, selection.instantEndMs);
  let { selectionConfig } = context.getCurrentData();
  if (filterConfig) {
    selectionConfig = filterConfig(selectionConfig);
  }
  if (!allConstraintsPass(selectionConfig.constraints, selectionRange, relevantEventStore, state.businessHours, context)) {
    return false;
  }
  let { selectOverlap } = context.options;
  let selectOverlapFunc = typeof selectOverlap === "function" ? selectOverlap : null;
  for (let relevantInstanceId in relevantInstances) {
    let relevantInstance = relevantInstances[relevantInstanceId];
    if (instanceRangesIntersect(selectionRange, relevantInstance.range, context.dateEnv)) {
      if (selectionConfig.overlap === false) {
        return false;
      }
      if (selectOverlapFunc && !selectOverlapFunc(new EventImpl(context, relevantDefs[relevantInstance.defId], relevantInstance), null)) {
        return false;
      }
    }
  }
  for (let selectionAllow of selectionConfig.allows) {
    let fullDateSpan = __spreadValues(__spreadValues({}, dateSpanMeta), selection);
    if (!selectionAllow(buildDateSpanApiWithContext(fullDateSpan, context), null)) {
      return false;
    }
  }
  return true;
}
function allConstraintsPass(constraints, subjectRange, otherEventStore, businessHoursUnexpanded, context) {
  for (let constraint of constraints) {
    if (!anyRangesContainRange(constraintToRanges(constraint, subjectRange, otherEventStore, businessHoursUnexpanded, context), subjectRange, context)) {
      return false;
    }
  }
  return true;
}
function constraintToRanges(constraint, subjectRange, otherEventStore, businessHoursUnexpanded, context) {
  if (constraint === "businessHours") {
    return eventStoreToRanges(expandRecurring(businessHoursUnexpanded, subjectRange, context));
  }
  if (typeof constraint === "string") {
    return eventStoreToRanges(filterEventStoreDefs(otherEventStore, (eventDef) => eventDef.groupId === constraint));
  }
  if (typeof constraint === "object" && constraint) {
    return eventStoreToRanges(expandRecurring(constraint, subjectRange, context));
  }
  return [];
}
function eventStoreToRanges(eventStore) {
  let { instances } = eventStore;
  let ranges = [];
  for (let instanceId in instances) {
    ranges.push(instances[instanceId].range);
  }
  return ranges;
}
function anyRangesContainRange(outerRanges, innerRange, context) {
  for (let outerRange of outerRanges) {
    if (instanceRangeContainsRange(outerRange, innerRange, context.dateEnv)) {
      return true;
    }
  }
  return false;
}

export {
  reduceEventStore,
  rezoneEventStoreDates,
  Interaction,
  parseInteractionSettings,
  interactionSettingsToStore,
  interactionSettingsStore,
  ElementDragging,
  config,
  isInteractionValid,
  isDateSelectionValid
};
//# sourceMappingURL=chunk-5LIOTQ6U.js.map
