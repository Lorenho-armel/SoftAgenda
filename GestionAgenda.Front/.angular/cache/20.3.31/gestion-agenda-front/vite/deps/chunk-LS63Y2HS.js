import {
  BgEvent,
  DayGridHeaderRow,
  DayGridRow,
  FooterScrollbar,
  MoreLinkContainer,
  MoreLinkTrigger,
  RefMap,
  Ruler,
  Slicer,
  buildSegLevels,
  computeColFromPosition,
  computeColWidth,
  convertSegsToWholeSlices,
  dayMicroWidth,
  findIntersections,
  getCellEl,
  groupLaterallyIntersecting,
  isMajorUnit,
  renderFill,
  resolveDayGridPlacementMode,
  sortByAxisOrder
} from "./chunk-JHXEUXOT.js";
import {
  BaseComponent,
  ContentContainer,
  DateComponent,
  Scroller,
  StandardEvent,
  ViewContainer,
  ViewContextType,
  afterSize,
  buildDateStr,
  buildNavLinkAttrs,
  generateClassName,
  getDateMeta,
  getFooterScrollbarSticky,
  getIsHeightAuto,
  getScrollerSyncerClass,
  getTableHeaderSticky,
  memoize,
  renderText,
  setRef,
  watchHeight,
  watchSize,
  watchWidth
} from "./chunk-GX5FAIHT.js";
import {
  addDays,
  addDurations,
  asRoughMs,
  buildEventRangeKey,
  classNames,
  combineEventUis,
  computeViewBorderless,
  createDuration,
  createEmptyEventStore,
  createFormatter,
  diffDays,
  flatArray,
  formatDayString,
  formatIsoTimeString,
  getEventRangeMeta,
  hasBgRendering,
  intersectRanges,
  isArraysEqual,
  isPropsEqualShallow,
  joinDateTimeFormatParts,
  mapHash,
  multiplyDuration,
  rangeContainsMarker,
  sortEventSegs,
  startOfDay,
  wholeDivideDurations
} from "./chunk-43C3ZVMA.js";
import {
  M,
  S,
  k,
  u
} from "./chunk-GOSSR2CB.js";
import {
  fracToCssDim,
  joinClassNames
} from "./chunk-3AK7CWDL.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-J25FJFZE.js";

// node_modules/fullcalendar/chunks/4b6eee98.js
function buildDayColsFromSeries(daySeries, dateEnv, config = {}) {
  const { slotRange, majorUnit = "", activeRange } = config;
  return daySeries.dates.map((date) => ({
    key: date.toISOString(),
    date,
    range: slotRange ? {
      start: dateEnv.add(date, slotRange.slotMinTime),
      end: dateEnv.add(date, slotRange.slotMaxTime)
    } : {
      start: date,
      end: addDays(date, 1)
    },
    isMajor: majorUnit ? isMajorUnit(date, majorUnit, dateEnv) : false,
    isDisabled: activeRange === null || activeRange !== void 0 && !rangeContainsMarker(activeRange, date)
  }));
}
var EMPTY_EVENT_STORE = createEmptyEventStore();
var Splitter = class {
  constructor() {
    this.getKeysForEventDefs = memoize(this._getKeysForEventDefs);
    this.splitDateSelection = memoize(this._splitDateSpan);
    this.splitEventStore = memoize(this._splitEventStore);
    this.splitIndividualUi = memoize(this._splitIndividualUi);
    this.splitEventDrag = memoize(this._splitInteraction);
    this.splitEventResize = memoize(this._splitInteraction);
    this.eventUiBuilders = {};
  }
  splitProps(props) {
    let keyInfos = this.getKeyInfo(props);
    let defKeys = this.getKeysForEventDefs(props.eventStore);
    let dateSelections = this.splitDateSelection(props.dateSelection);
    let individualUi = this.splitIndividualUi(props.eventUiBases, defKeys);
    let eventStores = this.splitEventStore(props.eventStore, defKeys);
    let eventDrags = this.splitEventDrag(props.eventDrag);
    let eventResizes = this.splitEventResize(props.eventResize);
    let splitProps = {};
    this.eventUiBuilders = mapHash(keyInfos, (info, key) => this.eventUiBuilders[key] || memoize(buildEventUiForKey));
    for (let key in keyInfos) {
      let keyInfo = keyInfos[key];
      let eventStore = eventStores[key] || EMPTY_EVENT_STORE;
      let buildEventUi = this.eventUiBuilders[key];
      splitProps[key] = {
        businessHours: keyInfo.businessHours || props.businessHours,
        dateSelection: dateSelections[key] || null,
        eventStore,
        eventUiBases: buildEventUi(props.eventUiBases[""], keyInfo.ui, individualUi[key]),
        eventDrag: eventDrags[key] || null,
        eventResize: eventResizes[key] || null,
        eventSelection: eventStore.instances[props.eventSelection] ? props.eventSelection : ""
      };
    }
    return splitProps;
  }
  _splitDateSpan(dateSpan) {
    let dateSpans = {};
    if (dateSpan) {
      let keys = this.getKeysForDateSpan(dateSpan);
      for (let key of keys) {
        dateSpans[key] = dateSpan;
      }
    }
    return dateSpans;
  }
  _getKeysForEventDefs(eventStore) {
    return mapHash(eventStore.defs, (eventDef) => this.getKeysForEventDef(eventDef));
  }
  _splitEventStore(eventStore, defKeys) {
    let { defs, instances } = eventStore;
    let splitStores = {};
    for (let defId in defs) {
      for (let key of defKeys[defId]) {
        if (!splitStores[key]) {
          splitStores[key] = createEmptyEventStore();
        }
        splitStores[key].defs[defId] = defs[defId];
      }
    }
    for (let instanceId in instances) {
      let instance = instances[instanceId];
      for (let key of defKeys[instance.defId]) {
        if (splitStores[key]) {
          splitStores[key].instances[instanceId] = instance;
        }
      }
    }
    return splitStores;
  }
  _splitIndividualUi(eventUiBases, defKeys) {
    let splitHashes = {};
    for (let defId in eventUiBases) {
      if (defId) {
        for (let key of defKeys[defId]) {
          if (!splitHashes[key]) {
            splitHashes[key] = {};
          }
          splitHashes[key][defId] = eventUiBases[defId];
        }
      }
    }
    return splitHashes;
  }
  _splitInteraction(interaction) {
    let splitStates = {};
    if (interaction) {
      let affectedStores = this._splitEventStore(interaction.affectedEvents, this._getKeysForEventDefs(interaction.affectedEvents));
      let mutatedKeysByDefId = this._getKeysForEventDefs(interaction.mutatedEvents);
      let mutatedStores = this._splitEventStore(interaction.mutatedEvents, mutatedKeysByDefId);
      let populate = (key) => {
        if (!splitStates[key]) {
          splitStates[key] = {
            affectedEvents: affectedStores[key] || EMPTY_EVENT_STORE,
            mutatedEvents: mutatedStores[key] || EMPTY_EVENT_STORE,
            isEvent: interaction.isEvent
          };
        }
      };
      for (let key in affectedStores) {
        populate(key);
      }
      for (let key in mutatedStores) {
        populate(key);
      }
    }
    return splitStates;
  }
};
function buildEventUiForKey(allUi, eventUiForKey, individualUi) {
  let baseParts = [];
  if (allUi) {
    baseParts.push(allUi);
  }
  if (eventUiForKey) {
    baseParts.push(eventUiForKey);
  }
  let stuff = {
    "": combineEventUis(baseParts)
  };
  if (individualUi) {
    Object.assign(stuff, individualUi);
  }
  return stuff;
}
var AllDaySplitter = class extends Splitter {
  getKeyInfo() {
    return {
      allDay: {},
      timed: {}
    };
  }
  getKeysForDateSpan(dateSpan) {
    if (dateSpan.allDay) {
      return ["allDay"];
    }
    return ["timed"];
  }
  getKeysForEventDef(eventDef) {
    if (!eventDef.allDay) {
      return ["timed"];
    }
    if (hasBgRendering(eventDef)) {
      return ["timed", "allDay"];
    }
    return ["allDay"];
  }
};
var DayTimeColsSlicer = class extends Slicer {
  sliceRange(range, dayRanges) {
    let segs = [];
    for (let col = 0; col < dayRanges.length; col += 1) {
      let segRange = intersectRanges(range, dayRanges[col]);
      if (segRange) {
        segs.push({
          startDate: segRange.start,
          endDate: segRange.end,
          isStart: segRange.start.valueOf() === range.start.valueOf(),
          isEnd: segRange.end.valueOf() === range.end.valueOf(),
          col
        });
      }
    }
    return segs;
  }
};
function organizeSegsByCol(segs, colCount) {
  let segsByCol = [];
  let i;
  for (i = 0; i < colCount; i += 1) {
    segsByCol.push([]);
  }
  if (segs) {
    for (i = 0; i < segs.length; i += 1) {
      segsByCol[segs[i].col].push(segs[i]);
    }
  }
  return segsByCol;
}
function splitInteractionByCol(ui, colCount) {
  let byRow = [];
  if (!ui) {
    for (let i = 0; i < colCount; i += 1) {
      byRow[i] = null;
    }
  } else {
    for (let i = 0; i < colCount; i += 1) {
      byRow[i] = {
        affectedInstances: ui.affectedInstances,
        isEvent: ui.isEvent,
        segs: []
      };
    }
    for (let seg of ui.segs) {
      byRow[seg.col].segs.push(seg);
    }
  }
  return byRow;
}
var STOCK_SUB_DURATIONS = [
  { hours: 1 },
  { minutes: 30 },
  { minutes: 15 },
  { seconds: 30 },
  { seconds: 15 }
];
function buildSlatMetas(slotMinTime, slotMaxTime, explicitLabelInterval, slotDuration, dateEnv) {
  let dayStart = /* @__PURE__ */ new Date(0);
  let slatTime = slotMinTime;
  let slatIterator = createDuration(0);
  let labelInterval = explicitLabelInterval || computeLabelInterval(slotDuration);
  let metas = [];
  let i = 0;
  while (asRoughMs(slatTime) < asRoughMs(slotMaxTime)) {
    let date = dateEnv.add(dayStart, slatTime);
    let isLabeled = wholeDivideDurations(slatIterator, labelInterval) !== null;
    metas.push({
      date,
      time: slatTime,
      key: date.toISOString(),
      // we can't use the isoTimeStr for uniqueness when minTime/maxTime beyone 0h/24h
      isoTimeStr: formatIsoTimeString(date),
      isLabeled,
      isFirst: i === 0
    });
    slatTime = addDurations(slatTime, slotDuration);
    slatIterator = addDurations(slatIterator, slotDuration);
    i += 1;
  }
  return metas;
}
function computeLabelInterval(slotDuration) {
  let i;
  let labelInterval;
  let slotsPerLabel;
  for (i = STOCK_SUB_DURATIONS.length - 1; i >= 0; i -= 1) {
    labelInterval = createDuration(STOCK_SUB_DURATIONS[i]);
    slotsPerLabel = wholeDivideDurations(labelInterval, slotDuration);
    if (slotsPerLabel !== null && slotsPerLabel > 1) {
      return labelInterval;
    }
  }
  return slotDuration;
}
var TimeGridAllDayHeader = class extends BaseComponent {
  constructor() {
    super(...arguments);
    this.innerElRef = M();
  }
  render() {
    let { props } = this;
    let { options, viewApi } = this.context;
    let renderProps = {
      text: options.allDayText,
      view: viewApi,
      isNarrow: props.isNarrow
    };
    return u(ContentContainer, { tag: "div", attrs: {
      role: "rowheader"
    }, className: joinClassNames(classNames.flexRow, classNames.noMargin, classNames.noPadding, classNames.contentBox), style: {
      width: props.width
    }, renderProps, generatorName: "allDayHeaderContent", customGenerator: options.allDayHeaderContent, defaultGenerator: renderAllDayInner, classNameGenerator: options.allDayHeaderClass, didMount: options.allDayHeaderDidMount, willUnmount: options.allDayHeaderWillUnmount, children: (InnerContent) => u("div", { className: joinClassNames(classNames.flexRow, classNames.noShrink, classNames.whiteSpacePre), ref: this.innerElRef, children: u(InnerContent, { tag: "div", className: generateClassName(options.allDayHeaderInnerClass, renderProps) }) }) });
  }
  componentDidMount() {
    this._isUnmounting = false;
    const { props } = this;
    const innerEl = this.innerElRef.current;
    this.disconnectInnerWidth = watchWidth(innerEl, (width) => {
      if (this._isUnmounting)
        return;
      setRef(props.innerWidthRef, width);
    });
  }
  componentWillUnmount() {
    this._isUnmounting = true;
    this.disconnectInnerWidth();
    setRef(this.props.innerWidthRef, null);
  }
};
function renderAllDayInner(renderProps) {
  return renderProps.text;
}
var TimeGridAllDayLane = class extends DateComponent {
  constructor() {
    super(...arguments);
    this.state = {};
    this.heightRef = M();
    this.handleMoreLinkEl = (el) => {
      this.disconnectMoreLinkHeight?.();
      this.disconnectMoreLinkHeight = void 0;
      if (el) {
        this.disconnectMoreLinkHeight = watchHeight(el, (height) => {
          if (this._isUnmounting)
            return;
          this.setState({ moreLinkHeight: height });
        });
      }
    };
    this.handleRootEl = (rootEl) => {
      this.rootEl = rootEl;
      if (rootEl) {
        this.context.registerInteractiveComponent(this, {
          el: rootEl
        });
      } else {
        this.context.unregisterInteractiveComponent(this);
      }
    };
  }
  render() {
    const { props, state } = this;
    const needsMoreLinkProbe = !props.forPrint && resolveDayGridPlacementMode(props.dayMaxEvents, props.dayMaxEventRows) === "auto";
    return u(S, { children: [u(DayGridRow, __spreadProps(__spreadValues({}, props), {
      moreLinkHeight: state.moreLinkHeight,
      /* BAD: these overwrite the props! caller might want to pass them */
      rootElRef: this.handleRootEl,
      heightRef: this.heightRef
    })), needsMoreLinkProbe && u(MoreLinkTrigger, { num: 1, display: "row", isNarrow: props.cellIsNarrow, isMicro: props.cellIsMicro, elRef: this.handleMoreLinkEl, className: classNames.offscreen, attrs: {
      "aria-hidden": true,
      inert: ""
    } })] });
  }
  componentDidMount() {
    this._isUnmounting = false;
  }
  componentWillUnmount() {
    this._isUnmounting = true;
    this.disconnectMoreLinkHeight?.();
  }
  queryHit(isRtl, positionLeft, positionTop, elWidth) {
    const { props, heightRef } = this;
    const colCount = props.cells.length;
    const { col, left, right } = computeColFromPosition(positionLeft, elWidth, props.colWidth, colCount, isRtl);
    const cell = props.cells[col];
    const cellStartDate = cell.date;
    const cellEndDate = addDays(cellStartDate, 1);
    return {
      dateProfile: props.dateProfile,
      dateSpan: __spreadValues({
        range: {
          start: cellStartDate,
          end: cellEndDate
        },
        allDay: true
      }, cell.dateSpanProps),
      getDayEl: () => getCellEl(this.rootEl, col),
      rect: {
        left,
        right,
        top: 0,
        bottom: heightRef.current
      },
      layer: 0
    };
  }
};
function computeSlatHeight(expandRows, slatCnt, explicitSlatMinHeight = 0, slatInnerHeight, scrollerHeight) {
  if (!slatInnerHeight || !scrollerHeight) {
    return [void 0, false];
  }
  const slatMinHeight = Math.max(slatInnerHeight + 1, explicitSlatMinHeight);
  const slatLiquidHeight = scrollerHeight / slatCnt;
  let slatLiquid;
  let slatHeight;
  if (expandRows && slatLiquidHeight >= slatMinHeight) {
    slatLiquid = true;
    slatHeight = slatLiquidHeight;
  } else {
    slatLiquid = false;
    slatHeight = slatMinHeight;
  }
  return [slatHeight, slatLiquid];
}
function computeDateTopFrac(date, dateProfile, startOfDayDate) {
  if (!startOfDayDate) {
    startOfDayDate = startOfDay(date);
  }
  return computeTimeTopFrac(createDuration(date.valueOf() - startOfDayDate.valueOf()), dateProfile);
}
function computeTimeTopFrac(time, dateProfile) {
  const startMs = asRoughMs(dateProfile.slotMinTime);
  const endMs = asRoughMs(dateProfile.slotMaxTime);
  let frac = (time.milliseconds - startMs) / (endMs - startMs);
  frac = Math.max(0, frac);
  frac = Math.min(1, frac);
  return frac;
}
function computeFgSegVerticals(segs, dateProfile, colDate, slatCnt, slatHeight, eventMinHeight, eventShortHeight) {
  const res = [];
  if (slatHeight != null) {
    const totalHeight = slatHeight * slatCnt;
    for (const seg of segs) {
      const startFrac = computeDateTopFrac(seg.startDate, dateProfile, colDate);
      const endFrac = computeDateTopFrac(seg.endDate, dateProfile, colDate);
      const startCoord = startFrac * totalHeight;
      let endCoord = endFrac * totalHeight;
      let height = endCoord - startCoord;
      if (eventMinHeight != null && height < eventMinHeight) {
        height = eventMinHeight;
        endCoord = startCoord + height;
      }
      res.push({
        start: startCoord,
        end: endCoord,
        size: height,
        isShort: height <= eventShortHeight
      });
    }
  }
  return res;
}
function buildTimeGridSegPlacements(segs, segVerticals, eventOrderStrict, eventMaxStack) {
  const sourceSegs = [];
  const segVerticalBySeg = /* @__PURE__ */ new Map();
  for (let orderIndex = 0; orderIndex < segs.length; orderIndex += 1) {
    const seg = segs[orderIndex];
    const segVertical = segVerticals[orderIndex];
    if (segVertical) {
      const sourceSeg = __spreadProps(__spreadValues({}, seg), {
        key: seg.eventRange.instance.instanceId,
        start: segVertical.start,
        end: segVertical.end,
        orderIndex
      });
      sourceSegs.push(sourceSeg);
      segVerticalBySeg.set(sourceSeg, segVertical);
    }
  }
  const layout = layoutTimeGridColumnByMaxLevel(sourceSegs, eventMaxStack ?? Infinity, { orderStrict: eventOrderStrict ?? false });
  return {
    placements: layout.domOrderedPlacements.map((placement) => {
      const seg = placement.sourceSeg;
      return {
        seg,
        segVertical: segVerticalBySeg.get(seg),
        levelCoord: placement.levelCoord,
        thickness: placement.thickness,
        stackDepth: placement.backwardDepth,
        stackForward: placement.forwardDepth
      };
    }),
    hiddenGroups: layout.moreLinkGroups.map((group) => {
      const groupSegs = group.hiddenSlices.map((slice) => slice.sourceSeg);
      return {
        key: group.key,
        start: group.start,
        end: group.end,
        segs: groupSegs
      };
    })
  };
}
function layoutTimeGridColumnByMaxLevel(eventOrderedSegs, maxLevels, options) {
  const { segLevels, excludedSegs } = buildSegLevels(eventOrderedSegs, options.orderStrict, maxLevels);
  const placements = positionTimeGridPlacements(segLevels);
  const moreLinkGroups = groupLaterallyIntersecting(convertSegsToWholeSlices(excludedSegs));
  return {
    domOrderedPlacements: sortByAxisOrder(placements),
    moreLinkGroups
  };
}
function positionTimeGridPlacements(levels) {
  const placementLevels = levels.map((level, levelIndex) => level.map((sourceSeg) => ({
    sourceSeg,
    start: sourceSeg.start,
    end: sourceSeg.end,
    isStart: sourceSeg.isStart,
    isEnd: sourceSeg.isEnd,
    levelIndex
  })));
  const placements = flatArray(placementLevels);
  const collidersByKey = /* @__PURE__ */ new Map();
  const parentByKey = new Map(placements.map((placement) => [
    placement.sourceSeg.key,
    placement.sourceSeg.key
  ]));
  for (const placement of placements) {
    const colliders = [];
    for (let levelIndex = placement.levelIndex + 1; levelIndex < levels.length; levelIndex += 1) {
      colliders.push(...findIntersections(placementLevels[levelIndex], placement));
    }
    collidersByKey.set(placement.sourceSeg.key, colliders);
    for (const collider of colliders) {
      unionPlacementKeys(parentByKey, placement.sourceSeg.key, collider.sourceSeg.key);
    }
  }
  const maxLevelByRoot = /* @__PURE__ */ new Map();
  for (const placement of placements) {
    const root = findPlacementRoot(parentByKey, placement.sourceSeg.key);
    maxLevelByRoot.set(root, Math.max(maxLevelByRoot.get(root) ?? 0, placement.levelIndex));
  }
  const backwardDepthByKey = new Map(placements.map((placement) => [
    placement.sourceSeg.key,
    0
  ]));
  const forwardDepthByKey = new Map(placements.map((placement) => [
    placement.sourceSeg.key,
    0
  ]));
  for (const placement of placements) {
    const depth = backwardDepthByKey.get(placement.sourceSeg.key) + 1;
    for (const collider of collidersByKey.get(placement.sourceSeg.key)) {
      backwardDepthByKey.set(collider.sourceSeg.key, Math.max(backwardDepthByKey.get(collider.sourceSeg.key), depth));
    }
  }
  for (let index = placements.length - 1; index >= 0; index -= 1) {
    const placement = placements[index];
    let depth = 0;
    for (const collider of collidersByKey.get(placement.sourceSeg.key)) {
      depth = Math.max(depth, forwardDepthByKey.get(collider.sourceSeg.key) + 1);
    }
    forwardDepthByKey.set(placement.sourceSeg.key, depth);
  }
  return placements.map((placement) => {
    const key = placement.sourceSeg.key;
    const levelCount = maxLevelByRoot.get(findPlacementRoot(parentByKey, key)) + 1;
    let farLevel = levelCount;
    for (const collider of collidersByKey.get(key)) {
      farLevel = Math.min(farLevel, collider.levelIndex);
    }
    const levelCoord = placement.levelIndex / levelCount;
    const thickness = (farLevel - placement.levelIndex) / levelCount;
    return __spreadProps(__spreadValues({}, placement), {
      levelCoord,
      thickness,
      levelEndCoord: levelCoord + thickness,
      backwardDepth: backwardDepthByKey.get(key),
      forwardDepth: forwardDepthByKey.get(key)
    });
  });
}
function findPlacementRoot(parentByKey, key) {
  const parent = parentByKey.get(key);
  if (parent === key)
    return key;
  const root = findPlacementRoot(parentByKey, parent);
  parentByKey.set(key, root);
  return root;
}
function unionPlacementKeys(parentByKey, first, second) {
  const firstRoot = findPlacementRoot(parentByKey, first);
  const secondRoot = findPlacementRoot(parentByKey, second);
  if (firstRoot !== secondRoot)
    parentByKey.set(secondRoot, firstRoot);
}
var ESTIMATED_SLAT_HEIGHT = 50;
var isBrowserPrintQuirky = (
  /* true || */
  typeof navigator !== "undefined" && navigator.userAgent.toLowerCase().includes("firefox")
);
function computeTimeGridPrintMode(forPrint, eventPrintLayout) {
  if (!forPrint) {
    return "positioned";
  }
  return eventPrintLayout === "stack" || eventPrintLayout !== "grid" && isBrowserPrintQuirky ? "stack" : "positioned";
}
var DEFAULT_TIME_FORMAT = createFormatter({
  hour: "numeric",
  minute: "2-digit",
  meridiem: false
});
var TimeGridEvent = class extends BaseComponent {
  render() {
    const { props } = this;
    return u(StandardEvent, __spreadProps(__spreadValues({}, props), { display: "column", level: props.level, isNarrow: props.isNarrow, isShort: props.isShort, className: (
      // see note in TimeGridCol on why we use flexbox
      props.isLiquid ? classNames.liquid : ""
    ), disableLiquid: !props.isLiquid, defaultTimeFormat: DEFAULT_TIME_FORMAT }));
  }
};
var TimeGridMoreLink = class extends BaseComponent {
  render() {
    let { props } = this;
    return u("div", { className: joinClassNames(classNames.abs, classNames.flexCol, classNames.end0, classNames.z9999), style: {
      top: props.top,
      height: props.height
    }, children: u(MoreLinkContainer, { className: classNames.liquid, display: "column", allDayDate: null, segs: props.hiddenSegs, hiddenSegs: props.hiddenSegs, dateSpanProps: props.dateSpanProps, dateProfile: props.dateProfile, todayRange: props.todayRange, popoverContent: () => renderPlainFgSegs(
      props.hiddenSegs,
      props,
      /* isMirror = */
      false
    ), forceTimed: true, isNarrow: props.isNarrow, isMicro: props.isMicro }) });
  }
};
var NowIndicatorDot = (props) => u(ViewContextType.Consumer, { children: (context) => {
  let { options } = context;
  return u("div", { className: joinClassNames(props.className, options.nowIndicatorDotClass), style: props.style });
} });
var NowIndicatorLineContainer = (props) => u(ViewContextType.Consumer, { children: (context) => {
  let { options } = context;
  let renderProps = {
    date: context.dateEnv.toDate(props.date),
    view: context.viewApi
  };
  return u(ContentContainer, { elRef: props.elRef, tag: props.tag || "div", attrs: props.attrs, className: props.className, style: props.style, renderProps, generatorName: "nowIndicatorLineContent", customGenerator: options.nowIndicatorLineContent, classNameGenerator: options.nowIndicatorLineClass, didMount: options.nowIndicatorLineDidMount, willUnmount: options.nowIndicatorLineWillUnmount, children: props.children });
} });
function TimeGridNowIndicatorLine(props) {
  const top = props.totalHeight != null ? props.totalHeight * computeDateTopFrac(props.nowDate, props.dateProfile, props.dayDate) : void 0;
  return u("div", { className: joinClassNames(classNames.fill, classNames.pointerEventsNone, classNames.z2), children: [u(NowIndicatorLineContainer, { className: joinClassNames(classNames.fillX, classNames.noMarginX, classNames.borderlessX), style: { top }, date: props.nowDate }), (props.showDot ?? true) && u(NowIndicatorDot, { className: joinClassNames(classNames.abs, classNames.start0), style: { top } })] });
}
var TimeGridCol = class extends BaseComponent {
  constructor() {
    super(...arguments);
    this.sortEventSegs = memoize(sortEventSegs);
    this.getDateMeta = memoize(getDateMeta);
  }
  render() {
    let { props, context } = this;
    let { options, dateEnv } = context;
    let isSelectMirror = options.selectMirror;
    let mirrorSegs = (
      // yuck
      props.eventDrag && props.eventDrag.segs || props.eventResize && props.eventResize.segs || isSelectMirror && props.dateSelectionSegs || []
    );
    let dateMeta = this.getDateMeta(props.date, dateEnv, props.dateProfile, props.todayRange);
    const baseClassName = joinClassNames(
      classNames.borderlessY,
      classNames.borderlessEnd,
      !props.borderStart && classNames.borderlessStart,
      props.width == null && classNames.liquid,
      classNames.rel,
      // origin for abs-positioned children within
      classNames.z1
    );
    const baseStyle = {
      width: props.width
    };
    const isStack = this.getIsStack();
    const renderProps = __spreadProps(__spreadValues(__spreadValues({}, dateMeta), props.renderProps), {
      isStack,
      isNarrow: props.isNarrow,
      isMajor: props.isMajor,
      view: context.viewApi
    });
    if (dateMeta.isDisabled) {
      return u("div", { role: "gridcell", "aria-disabled": true, className: joinClassNames(generateClassName(options.dayLaneClass, renderProps), baseClassName), style: baseStyle });
    }
    const innerClassName = joinClassNames(generateClassName(options.dayLaneInnerClass, renderProps), !isStack && classNames.fill, classNames.z1);
    const sortedFgSegs = this.sortEventSegs(props.fgEventSegs, options.eventOrder);
    return u(ContentContainer, { tag: "div", attrs: __spreadProps(__spreadValues(__spreadProps(__spreadValues({}, props.attrs), {
      role: "gridcell"
    }), dateMeta.isToday ? { "aria-current": "date" } : {}), {
      "data-date": formatDayString(props.date)
    }), className: baseClassName, style: baseStyle, renderProps, generatorName: void 0, classNameGenerator: options.dayLaneClass, didMount: options.dayLaneDidMount, willUnmount: options.dayLaneWillUnmount, children: () => u(S, { children: [this.renderFillSegs(props.businessHourSegs, "non-business"), this.renderFillSegs(props.bgEventSegs, "bg-event"), this.renderFillSegs(props.dateSelectionSegs, "highlight"), u("div", { className: innerClassName, children: this.renderFgSegs(
      sortedFgSegs,
      /* isMirror = */
      false
    ) }), Boolean(mirrorSegs.length) && // but only show it when there are actual mirror events, to avoid blocking clicks
    u("div", { className: innerClassName, children: this.renderFgSegs(
      mirrorSegs,
      /* isMirror = */
      true
    ) }), this.renderNowIndicator(props.nowIndicatorSegs)] }) });
  }
  renderFgSegs(sortedFgSegs, isMirror) {
    const { props } = this;
    if (this.getIsStack()) {
      return renderPlainFgSegs(sortedFgSegs, props, isMirror);
    }
    if (isMirror) {
      return this.renderPositionedMirrorSegs(sortedFgSegs);
    }
    return this.renderPositionedFgSegs(sortedFgSegs);
  }
  renderPositionedFgSegs(segs) {
    let { eventMaxStack, eventOrderStrict } = this.context.options;
    let segVerticals = this.computeSegVerticals(segs);
    let { placements, hiddenGroups } = buildTimeGridSegPlacements(segs, segVerticals, eventOrderStrict, eventMaxStack);
    return u(S, { children: [placements.map((placement) => this.renderPositionedSeg(
      placement.seg,
      placement.segVertical,
      this.computeSegHStyle(placement),
      placement.stackDepth,
      /* isMirror = */
      false
    )), this.renderHiddenGroups(hiddenGroups)] });
  }
  // Mirrors bypass normal-event admission so limits cannot hide them or create more links.
  renderPositionedMirrorSegs(segs) {
    let segVerticals = this.computeSegVerticals(segs);
    return segs.map((seg, index) => this.renderPositionedSeg(
      seg,
      segVerticals[index] || {},
      { left: 0, right: 0, zIndex: 0 },
      // full column width
      /* level = */
      0,
      /* isMirror = */
      true
    ));
  }
  renderPositionedSeg(seg, segVertical, hStyle, level, isMirror) {
    let { props } = this;
    let { eventRange } = seg;
    let { instanceId } = eventRange.instance;
    let isSelected = instanceId === props.eventSelection;
    if (isSelected) {
      hStyle.zIndex += 1e3;
    }
    let isDragging = Boolean(props.eventDrag && props.eventDrag.affectedInstances[instanceId]);
    let isResizing = Boolean(props.eventResize && props.eventResize.affectedInstances[instanceId]);
    let isInvisible = !isMirror && (isDragging || isResizing);
    return u("div", {
      // we would have used classNames.fill, but multi-page spanning breaks in Firefox
      // we would have used height:100%, but multi-page spanning breaks in Safari
      className: joinClassNames(classNames.abs, classNames.flexCol),
      style: __spreadValues({
        visibility: isInvisible ? "hidden" : void 0,
        top: segVertical.start,
        height: segVertical.size
      }, hStyle),
      children: u(TimeGridEvent, __spreadValues({ eventRange, slicedStart: seg.startDate, slicedEnd: seg.endDate, isStart: seg.isStart, isEnd: seg.isEnd, isDragging, isResizing, isMirror, isSelected, level, isNarrow: props.isNarrow, isShort: segVertical.isShort || false, isLiquid: true }, getEventRangeMeta(eventRange, props.todayRange, props.nowDate, props.nowMs)))
    }, instanceId);
  }
  /*
  A pixel floor is only meaningful against a real slat height, so it stays off
  while the height is assumed. See ESTIMATED_SLAT_HEIGHT for why, and for what
  the assumed pass does and does not guarantee.
  */
  // TODO: memoize this?
  computeSegVerticals(segs) {
    let { props, context } = this;
    let isMeasured = props.slatHeight != null;
    return computeFgSegVerticals(segs, props.dateProfile, props.date, props.slatCnt, props.slatHeight ?? ESTIMATED_SLAT_HEIGHT, isMeasured ? context.options.eventMinHeight : void 0, context.options.eventShortHeight);
  }
  /*
  NOTE: a group's coordinates come from computeFgSegVerticals, so eventMinHeight
  has already been applied to the segs it was formed from
  */
  renderHiddenGroups(hiddenGroups) {
    let { dateSpanProps, dateProfile, todayRange, nowDate, nowMs, eventSelection, eventDrag, eventResize, isNarrow, isMicro } = this.props;
    return u(S, { children: hiddenGroups.map((hiddenGroup) => {
      return u(TimeGridMoreLink, { hiddenSegs: hiddenGroup.segs, top: hiddenGroup.start, height: hiddenGroup.end - hiddenGroup.start, isNarrow, isMicro, dateSpanProps, dateProfile, todayRange, nowDate, nowMs, eventSelection, eventDrag, eventResize }, hiddenGroup.key);
    }) });
  }
  renderFillSegs(segs, fillType) {
    let { props, context } = this;
    let segVerticals = this.computeSegVerticals(segs);
    return u(S, { children: segs.map((seg, index) => {
      const { eventRange } = seg;
      const segVertical = segVerticals[index] || {};
      return u("div", { className: classNames.fillX, style: {
        top: segVertical.start,
        height: segVertical.size,
        // HACK to get bg fills to overlap cell-start border
        // which matches how dayGrid looks,
        // which is important because all-day background events, in TimeGrid,
        // will render on both at the same time
        marginInlineStart: -1
      }, children: fillType === "bg-event" ? u(BgEvent, __spreadValues({ eventRange, isStart: seg.isStart, isEnd: seg.isEnd, isNarrow: props.isNarrow, isShort: segVertical.isShort || false, isVertical: true }, getEventRangeMeta(eventRange, props.todayRange, props.nowDate, props.nowMs))) : renderFill(fillType, context.options) }, buildEventRangeKey(eventRange));
    }) });
  }
  renderNowIndicator(segs) {
    let { props } = this;
    if (props.forPrint || this.getIsStack()) {
      return;
    }
    return segs.map((seg, i) => u(TimeGridNowIndicatorLine, { nowDate: seg.startDate, dayDate: props.date, dateProfile: props.dateProfile, totalHeight: props.slatHeight != null ? props.slatHeight * props.slatCnt : void 0, showDot: seg.showDot ?? true }, i));
  }
  /*
  TODO: eventually move to width, not left+right
  */
  computeSegHStyle(segRect) {
    let { options } = this.context;
    let shouldOverlap = options.slotEventOverlap;
    let nearCoord = segRect.levelCoord;
    let farCoord = segRect.levelCoord + segRect.thickness;
    if (shouldOverlap) {
      farCoord = Math.min(1, nearCoord + (farCoord - nearCoord) * 2);
    }
    let props = {
      zIndex: segRect.stackDepth + 1,
      // convert from 0-base to 1-based
      insetInlineStart: fracToCssDim(nearCoord),
      insetInlineEnd: fracToCssDim(1 - farCoord),
      marginInlineEnd: void 0
    };
    if (shouldOverlap && segRect.stackForward) {
      props.marginInlineEnd = 10 * 2;
    }
    return props;
  }
  getIsStack() {
    const { eventPrintLayout } = this.context.options;
    return computeTimeGridPrintMode(this.props.forPrint, eventPrintLayout) === "stack";
  }
};
function renderPlainFgSegs(sortedFgSegs, { todayRange, nowDate, nowMs, eventSelection, eventDrag, eventResize }, isMirror) {
  return u(S, { children: sortedFgSegs.map((seg) => {
    let { eventRange } = seg;
    let { instanceId } = eventRange.instance;
    let isDragging = Boolean(eventDrag && eventDrag.affectedInstances[instanceId]);
    let isResizing = Boolean(eventResize && eventResize.affectedInstances[instanceId]);
    let isInvisible = isDragging || isResizing;
    return u("div", { className: classNames.breakInsideAvoid, style: { visibility: isInvisible ? "hidden" : void 0 }, children: u(TimeGridEvent, __spreadValues({ eventRange, slicedStart: seg.startDate, slicedEnd: seg.endDate, isStart: seg.isStart, isEnd: seg.isEnd, isDragging, isResizing, isMirror, isSelected: instanceId === eventSelection, level: 0, isShort: false, isNarrow: false, disableResizing: true }, getEventRangeMeta(eventRange, todayRange, nowDate, nowMs))) }, instanceId);
  }) });
}
var TimeGridCols = class extends DateComponent {
  constructor() {
    super(...arguments);
    this.processSlotOptions = memoize(processSlotOptions);
    this.handleRootEl = (el) => {
      this.rootEl = el;
      if (el) {
        this.context.registerInteractiveComponent(this, {
          el,
          isHitComboAllowed: this.props.isHitComboAllowed
        });
      } else {
        this.context.unregisterInteractiveComponent(this);
      }
    };
  }
  render() {
    const { props } = this;
    return u("div", { role: props.role, className: joinClassNames(props.className, classNames.flexRow), ref: this.handleRootEl, children: props.cells.map((cell, col) => u(TimeGridCol, {
      dateProfile: props.dateProfile,
      nowDate: props.nowDate,
      nowMs: props.nowMs,
      todayRange: props.todayRange,
      date: cell.date,
      isMajor: cell.isMajor,
      slatCnt: props.slatCnt,
      renderProps: cell.renderProps,
      attrs: cell.attrs,
      dateSpanProps: cell.dateSpanProps,
      forPrint: props.forPrint,
      borderStart: Boolean(col),
      isNarrow: props.cellIsNarrow,
      isMicro: props.cellIsMicro,
      // content
      fgEventSegs: props.fgEventSegsByCol[col],
      bgEventSegs: props.bgEventSegsByCol[col],
      businessHourSegs: props.businessHourSegsByCol[col],
      nowIndicatorSegs: props.nowIndicatorSegsByCol[col],
      dateSelectionSegs: props.dateSelectionSegsByCol[col],
      eventDrag: props.eventDragByCol[col],
      eventResize: props.eventResizeByCol[col],
      eventSelection: props.eventSelection,
      // dimensions
      width: props.colWidth,
      slatHeight: props.slatHeight
    }, cell.key)) });
  }
  queryHit(isRtl, positionLeft, positionTop, elWidth) {
    const { dateProfile, cells, colWidth, slatHeight } = this.props;
    const { dateEnv, options } = this.context;
    const { snapDuration, snapsPerSlot } = this.processSlotOptions(options.slotDuration, options.snapDuration);
    const colCount = cells.length;
    const { col, left, right } = computeColFromPosition(positionLeft, elWidth, colWidth, colCount, isRtl);
    const cell = cells[col];
    const slatIndex = Math.floor(positionTop / slatHeight);
    const slatTop = slatIndex * slatHeight;
    const partial = (positionTop - slatTop) / slatHeight;
    const localSnapIndex = Math.floor(partial * snapsPerSlot);
    const snapIndex = slatIndex * snapsPerSlot + localSnapIndex;
    const time = addDurations(dateProfile.slotMinTime, multiplyDuration(snapDuration, snapIndex));
    const start = dateEnv.add(cell.date, time);
    const end = dateEnv.add(start, snapDuration);
    return {
      dateProfile,
      dateSpan: __spreadValues({
        range: { start, end },
        allDay: false
      }, cell.dateSpanProps),
      getDayEl: () => getCellEl(this.rootEl, col),
      rect: {
        left,
        right,
        top: slatTop,
        bottom: slatTop + slatHeight
      },
      layer: 0
    };
  }
};
TimeGridCols.addPropsEquality({
  style: isPropsEqualShallow
});
function processSlotOptions(slotDuration, snapDurationOverride) {
  let snapDuration = snapDurationOverride || slotDuration;
  let snapsPerSlot = wholeDivideDurations(slotDuration, snapDuration);
  if (snapsPerSlot === null) {
    snapDuration = slotDuration;
    snapsPerSlot = 1;
  }
  return { snapDuration, snapsPerSlot };
}
var NowIndicatorHeaderContainer = (props) => u(ViewContextType.Consumer, { children: (context) => {
  let { options } = context;
  let renderProps = {
    date: context.dateEnv.toDate(props.date),
    view: context.viewApi
  };
  return u(ContentContainer, { elRef: props.elRef, tag: props.tag || "div", attrs: props.attrs, className: props.className, style: props.style, renderProps, generatorName: "nowIndicatorHeaderContent", customGenerator: options.nowIndicatorHeaderContent, classNameGenerator: options.nowIndicatorHeaderClass, didMount: options.nowIndicatorHeaderDidMount, willUnmount: options.nowIndicatorHeaderWillUnmount, children: props.children });
} });
function TimeGridNowIndicatorArrow(props) {
  return u("div", {
    // crop any overflow that the arrow/line might cause
    // TODO: just do this on the entire canvas within the scroller
    className: joinClassNames(classNames.fill, classNames.crop, classNames.pointerEventsNone, classNames.z2),
    children: u(NowIndicatorHeaderContainer, { className: classNames.abs, style: {
      top: props.totalHeight != null ? props.totalHeight * computeDateTopFrac(props.nowDate, props.dateProfile) : void 0
    }, date: props.nowDate })
  });
}
var DEFAULT_SLAT_LABEL_FORMAT = createFormatter({
  hour: "numeric",
  minute: "2-digit",
  omitZeroMinute: true,
  meridiem: "short"
});
var TimeGridSlatHeader = class extends BaseComponent {
  constructor() {
    super(...arguments);
    this.createRenderProps = memoize(createRenderProps);
    this.innerElRef = M();
  }
  render() {
    let { props, context } = this;
    let { options } = context;
    let headerFormat = (
      // TODO: fully pre-parse
      options.slotHeaderFormat == null ? DEFAULT_SLAT_LABEL_FORMAT : Array.isArray(options.slotHeaderFormat) ? createFormatter(options.slotHeaderFormat[0]) : createFormatter(options.slotHeaderFormat)
    );
    let renderProps = this.createRenderProps(props.date, props.time, !props.isLabeled, props.isNarrow, props.isFirst, headerFormat, context);
    let className = joinClassNames(props.liquidHeight && classNames.liquid, classNames.flexRow, classNames.alignStart, classNames.noMargin, classNames.noPadding, classNames.borderlessX, classNames.borderlessBottom, !props.borderTop && classNames.borderlessTop);
    if (!props.isLabeled) {
      return u("div", { className: joinClassNames(generateClassName(options.slotHeaderClass, renderProps), className), style: {
        height: props.height
      } });
    }
    return u(ContentContainer, { tag: "div", attrs: {
      "data-time": props.isoTimeStr
    }, style: {
      height: props.height
    }, className, renderProps, generatorName: "slotHeaderContent", customGenerator: options.slotHeaderContent, defaultGenerator: renderInnerContent, classNameGenerator: options.slotHeaderClass, didMount: options.slotHeaderDidMount, willUnmount: options.slotHeaderWillUnmount, children: (InnerContent) => u("div", { ref: this.innerElRef, className: joinClassNames(classNames.noShrink, classNames.whiteSpaceNoWrap, classNames.flexRow), children: u(InnerContent, { tag: "div", className: generateClassName(options.slotHeaderInnerClass, renderProps) }) }) });
  }
  componentDidMount() {
    this._isUnmounting = false;
    const { props } = this;
    const innerEl = this.innerElRef.current;
    if (innerEl) {
      this.disconnectInnerSize = watchSize(innerEl, (width, height) => {
        if (this._isUnmounting)
          return;
        setRef(props.innerWidthRef, width);
        setRef(props.innerHeightRef, height);
      });
    }
  }
  componentWillUnmount() {
    const { props } = this;
    this._isUnmounting = true;
    if (this.disconnectInnerSize) {
      this.disconnectInnerSize();
      setRef(props.innerWidthRef, null);
      setRef(props.innerHeightRef, null);
    }
  }
};
function createRenderProps(date, time, isMinor, isNarrow, isFirst, headerFormat, context) {
  return __spreadProps(__spreadValues({}, getDateMeta(date, context.dateEnv)), {
    level: 0,
    // axis level (for when multiple axes)
    text: joinDateTimeFormatParts(context.dateEnv.formatToParts(date, headerFormat)),
    time,
    isMajor: false,
    isMinor,
    isTime: true,
    isNarrow,
    hasNavLink: false,
    isFirst,
    view: context.viewApi
  });
}
function renderInnerContent(props) {
  return props.text;
}
var TimeGridSlatLane = class extends BaseComponent {
  constructor() {
    super(...arguments);
    this.getDateMeta = memoize(getDateMeta);
  }
  render() {
    let { props, context } = this;
    let { options } = context;
    let renderProps = __spreadProps(__spreadValues({}, this.getDateMeta(props.date, context.dateEnv)), {
      time: props.time,
      isMajor: false,
      isMinor: !props.isLabeled,
      view: context.viewApi
    });
    return u(ContentContainer, { tag: "div", attrs: {
      "data-time": props.isoTimeStr
    }, className: joinClassNames(classNames.noMargin, classNames.noPadding, classNames.liquid, classNames.borderlessX, classNames.borderlessBottom, !props.borderTop && classNames.borderlessTop), renderProps, generatorName: void 0, classNameGenerator: options.slotLaneClass, didMount: options.slotLaneDidMount, willUnmount: options.slotLaneWillUnmount });
  }
};
var DEFAULT_WEEK_NUM_FORMAT = createFormatter({ week: "short" });
var TimeGridWeekNumber = class extends BaseComponent {
  constructor() {
    super(...arguments);
    this.innerElRef = M();
  }
  render() {
    let { props, context } = this;
    let { options, dateEnv } = context;
    let range = props.dateProfile.renderRange;
    let dayCnt = diffDays(range.start, range.end);
    let hasNavLink = dayCnt === 1 && options.navLinks;
    let weekDateMarker = range.start;
    let fullDateStr = buildDateStr(context, weekDateMarker, "week");
    let weekNum = dateEnv.computeWeekNumber(weekDateMarker);
    let weekTextParts = dateEnv.formatToParts(weekDateMarker, options.weekNumberFormat || DEFAULT_WEEK_NUM_FORMAT);
    let weekText = joinDateTimeFormatParts(weekTextParts);
    let weekDateZoned = dateEnv.toDate(weekDateMarker);
    const weekNumberRenderProps = {
      num: weekNum,
      text: weekText,
      textParts: weekTextParts,
      date: weekDateZoned,
      isNarrow: props.isNarrow,
      hasNavLink,
      options: { dayMinWidth: options.dayMinWidth }
    };
    return u(ContentContainer, { tag: "div", attrs: {
      role: "gridcell",
      // doesn't always describe other cells in row, so make generic
      "aria-label": fullDateStr
    }, className: joinClassNames(classNames.flexRow, classNames.noMargin, classNames.noPadding, props.isLiquid ? classNames.liquid : classNames.contentBox), style: {
      width: props.width
    }, renderProps: weekNumberRenderProps, generatorName: "weekNumberHeaderContent", customGenerator: options.weekNumberHeaderContent, defaultGenerator: renderText, classNameGenerator: options.weekNumberHeaderClass, didMount: options.weekNumberHeaderDidMount, willUnmount: options.weekNumberHeaderWillUnmount, children: (InnerContent) => u("div", { ref: this.innerElRef, className: joinClassNames(classNames.flexRow, classNames.noShrink, classNames.whiteSpaceNoWrap), children: u(InnerContent, { tag: "div", attrs: hasNavLink ? buildNavLinkAttrs(context, range.start, "week", fullDateStr) : { "aria-label": fullDateStr }, className: generateClassName(options.weekNumberHeaderInnerClass, weekNumberRenderProps) }) }) });
  }
  componentDidMount() {
    this._isUnmounting = false;
    const { props } = this;
    const innerEl = this.innerElRef.current;
    this.disconnectInnerSize = watchSize(innerEl, (width, height) => {
      if (this._isUnmounting)
        return;
      setRef(props.innerWidthRef, width);
      setRef(props.innerHeightRef, height);
    });
  }
  componentWillUnmount() {
    const { props } = this;
    this._isUnmounting = true;
    this.disconnectInnerSize();
    setRef(props.innerWidthRef, null);
    setRef(props.innerHeightRef, null);
  }
};
function TimeGridAxisEmpty(props) {
  return u("div", {
    role: "gridcell",
    className: props.isLiquid ? classNames.liquid : classNames.contentBox,
    style: { width: props.width }
  });
}
var TimeGridLayoutPannable = class extends BaseComponent {
  constructor() {
    super(...arguments);
    this.state = {
      headerTierHeights: []
    };
    this.headerLabelInnerWidthRefMap = new RefMap(() => {
      afterSize(this.handleAxisWidths);
    });
    this.headerLabelInnerHeightRefMap = new RefMap(() => {
      afterSize(this.handleHeaderHeights);
    });
    this.headerMainInnerHeightRefMap = new RefMap(() => {
      afterSize(this.handleHeaderHeights);
    });
    this.handleAllDayLabelInnerWidth = (width) => {
      this.allDayLabelInnerWidth = width;
      afterSize(this.handleAxisWidths);
    };
    this.slatLabelInnerWidthRefMap = new RefMap(() => {
      afterSize(this.handleAxisWidths);
    });
    this.slatLabelInnerHeightRefMap = new RefMap(() => {
      afterSize(this.handleSlatInnerHeights);
    });
    this.headerScrollerRef = M();
    this.allDayScrollerRef = M();
    this.mainScrollerRef = M();
    this.footScrollerRef = M();
    this.axisScrollerRef = M();
    this.handleTotalWidth = (totalWidth) => {
      if (this._isUnmounting)
        return;
      this.setState({ totalWidth });
    };
    this.handleBodyHeight = (bodyHeight) => {
      if (this._isUnmounting)
        return;
      this.setState({ bodyHeight });
    };
    this.handleClientWidth = (clientWidth) => {
      if (this._isUnmounting)
        return;
      this.setState({ clientWidth });
    };
    this.handleClientHeight = (clientHeight) => {
      if (this._isUnmounting)
        return;
      this.setState({ clientHeight });
    };
    this.handleStickyBottomScrollbarWidth = (sticykBottomScrollbarWidth) => {
      if (this._isUnmounting)
        return;
      this.setState({ sticykBottomScrollbarWidth });
    };
    this.handleHeaderHeights = () => {
      if (this._isUnmounting)
        return;
      const headerLabelInnerHeightMap = this.headerLabelInnerHeightRefMap.current;
      const headerMainInnerHeightMap = this.headerMainInnerHeightRefMap.current;
      const heights = [];
      for (const [tierNum, mainHeight] of headerMainInnerHeightMap.entries()) {
        heights[tierNum] = Math.max(headerLabelInnerHeightMap.get(tierNum) || 0, mainHeight);
      }
      this.setState({ headerTierHeights: heights });
    };
    this.handleSlatInnerHeights = () => {
      if (this._isUnmounting)
        return;
      const slatLabelInnerHeightMap = this.slatLabelInnerHeightRefMap.current;
      let max = 0;
      for (const slatLabelInnerHeight of slatLabelInnerHeightMap.values()) {
        max = Math.max(max, slatLabelInnerHeight);
      }
      if (this.state.slatInnerHeight !== max) {
        this.setState({ slatInnerHeight: max });
      }
    };
    this.handleAxisWidths = () => {
      if (this._isUnmounting)
        return;
      const headerLabelInnerWidthMap = this.headerLabelInnerWidthRefMap.current;
      const slatLabelInnerWidthMap = this.slatLabelInnerWidthRefMap.current;
      let max = this.allDayLabelInnerWidth || 0;
      for (const headerLabelInnerWidth of headerLabelInnerWidthMap.values()) {
        max = Math.max(max, headerLabelInnerWidth);
      }
      for (const slatLableInnerWidth of slatLabelInnerWidthMap.values()) {
        max = Math.max(max, slatLableInnerWidth);
      }
      if (this.state.axisWidth !== max) {
        this.setState({ axisWidth: max });
      }
    };
  }
  render() {
    const { props, state, context, headerLabelInnerWidthRefMap, headerLabelInnerHeightRefMap, headerMainInnerHeightRefMap, slatLabelInnerWidthRefMap, slatLabelInnerHeightRefMap } = this;
    const { nowDate, headerTiers, forPrint } = props;
    const nowTimeMs = nowDate.valueOf() - startOfDay(nowDate).valueOf();
    const { axisWidth, totalWidth, clientWidth, clientHeight, bodyHeight, sticykBottomScrollbarWidth } = state;
    const { options } = context;
    const { borderlessX, borderlessTop, borderlessBottom } = computeViewBorderless(options);
    const endScrollbarWidth = totalWidth != null && clientWidth != null && axisWidth != null ? totalWidth - clientWidth - (axisWidth + 1) : void 0;
    const verticalScrolling = !forPrint && !getIsHeightAuto(options);
    const tableHeaderSticky = !forPrint && getTableHeaderSticky(options);
    const footerScrollbarSticky = !forPrint && getFooterScrollbarSticky(options);
    const printStackEnabled = computeTimeGridPrintMode(forPrint, options.eventPrintLayout) === "stack";
    const absPrint = forPrint && !printStackEnabled;
    const simplePrint = forPrint && printStackEnabled;
    const colCount = props.cells.length;
    const [canvasWidth, appliedColWidth] = computeColWidth(colCount, props.dayMinWidth, clientWidth);
    const measuredColWidth = appliedColWidth ?? (clientWidth != null ? clientWidth / colCount : void 0);
    const cellIsMicro = measuredColWidth != null && measuredColWidth <= dayMicroWidth;
    const cellIsNarrow = cellIsMicro || measuredColWidth != null && measuredColWidth <= options.dayNarrowWidth;
    const slatCnt = props.slatMetas.length;
    const [slatHeight, slatLiquidHeight] = computeSlatHeight(
      // TODO: memo?
      verticalScrolling && options.expandRows,
      slatCnt,
      options.slotMinHeight,
      state.slatInnerHeight,
      clientHeight
    );
    this.slatHeight = slatHeight;
    const totalSlatHeight = (slatHeight || 0) * slatCnt;
    const forcedBodyHeight = absPrint ? totalSlatHeight : void 0;
    const rowsNotExpanding = verticalScrolling && !options.expandRows && clientHeight != null && clientHeight > totalSlatHeight;
    const firstBodyRowIndex = options.dayHeaders ? headerTiers.length + 1 : 1;
    const bottomScrollbarWidth = footerScrollbarSticky ? sticykBottomScrollbarWidth : bodyHeight != null && clientHeight != null ? bodyHeight - clientHeight : void 0;
    return u(S, { children: [options.dayHeaders && u("div", { className: joinClassNames(
      generateClassName(options.tableHeaderClass, {
        isSticky: tableHeaderSticky,
        borderlessX,
        borderlessTop,
        borderlessBottom,
        multiMonthColumns: 0
      }),
      // See the note in TimeGridLayout about why print doesn't use repeating headers.
      classNames.flexCol,
      tableHeaderSticky && classNames.tableHeaderSticky,
      classNames.z1
    ), children: [u("div", { className: classNames.flexRow, children: [u("div", { role: "rowgroup", className: classNames.contentBox, style: { width: axisWidth }, children: headerTiers.map((rowConfig, tierNum) => u("div", { role: "row", "aria-rowindex": tierNum + 1, className: joinClassNames(options.dayHeaderRowClass, classNames.flexRow, classNames.contentBox, classNames.borderlessX, classNames.borderlessTop, tierNum === props.headerTiers.length - 1 && classNames.borderlessBottom), style: {
      height: state.headerTierHeights[tierNum]
    }, children: options.weekNumbers && rowConfig.isDateRow ? u(TimeGridWeekNumber, { dateProfile: props.dateProfile, innerWidthRef: headerLabelInnerWidthRefMap.createRef(tierNum), innerHeightRef: headerLabelInnerHeightRefMap.createRef(tierNum), width: void 0, isLiquid: true, isNarrow: cellIsNarrow }) : u(TimeGridAxisEmpty, { width: void 0, isLiquid: true }) }, tierNum)) }), u("div", { className: generateClassName(options.slotHeaderDividerClass, {
      inTableHeader: true,
      options: { dayMinWidth: options.dayMinWidth }
    }) }), u(Scroller, { horizontal: true, hideScrollbars: true, className: joinClassNames(classNames.flexRow, classNames.liquid), ref: this.headerScrollerRef, children: [u("div", { role: "rowgroup", className: canvasWidth == null ? classNames.liquid : "", style: { width: canvasWidth }, children: props.headerTiers.map((rowConfig, tierNum) => k(DayGridHeaderRow, __spreadProps(__spreadValues({}, rowConfig), { key: tierNum, role: "row", rowIndex: tierNum, borderBottom: tierNum < props.headerTiers.length - 1, height: state.headerTierHeights[tierNum], colWidth: appliedColWidth, viewportWidth: clientWidth, innerHeightRef: headerMainInnerHeightRefMap.createRef(tierNum), cellIsNarrow, cellIsMicro, rowLevel: props.headerTiers.length - tierNum - 1 }))) }), Boolean(endScrollbarWidth) && u("div", { className: joinClassNames(generateClassName(options.fillerClass, { inTableHeader: true }), classNames.borderlessY, classNames.borderlessEnd), style: { minWidth: endScrollbarWidth } })] })] }), u("div", { className: generateClassName(options.dayHeaderDividerClass, {
      isSticky: tableHeaderSticky,
      multiMonthColumns: 0,
      options: { allDaySlot: Boolean(options.allDaySlot) }
    }) })] }), u("div", { role: "rowgroup", className: joinClassNames(generateClassName(options.tableBodyClass, {
      borderlessX,
      borderlessTop,
      borderlessBottom,
      multiMonthColumns: 0
    }), classNames.flexCol, verticalScrolling && classNames.liquid, classNames.isolate, classNames.z0), children: [options.allDaySlot && u(S, { children: [u("div", { role: "row", "aria-rowindex": firstBodyRowIndex, className: joinClassNames(classNames.flexRow, classNames.z1), children: [u(TimeGridAllDayHeader, { width: axisWidth, innerWidthRef: this.handleAllDayLabelInnerWidth, isNarrow: cellIsNarrow }), u("div", { className: generateClassName(options.slotHeaderDividerClass, {
      inTableHeader: false,
      options: { dayMinWidth: options.dayMinWidth }
    }) }), u(Scroller, {
      horizontal: true,
      hideScrollbars: true,
      // fill remaining width
      className: joinClassNames(classNames.flexRow, classNames.liquidX),
      ref: this.allDayScrollerRef,
      children: [u("div", { className: classNames.flexRow, style: { width: canvasWidth }, children: u(TimeGridAllDayLane, {
        dateProfile: props.dateProfile,
        todayRange: props.todayRange,
        cells: props.cells,
        showDayNumbers: false,
        forPrint,
        isHitComboAllowed: props.isHitComboAllowed,
        className: joinClassNames(classNames.borderless, classNames.liquidX),
        cellIsNarrow,
        cellIsMicro,
        // content
        fgEventSegs: props.fgEventSegs,
        bgEventSegs: props.bgEventSegs,
        businessHourSegs: props.businessHourSegs,
        dateSelectionSegs: props.dateSelectionSegs,
        eventSelection: props.eventSelection,
        eventDrag: props.eventDrag,
        eventResize: props.eventResize,
        dayMaxEvents: props.dayMaxEvents,
        dayMaxEventRows: props.dayMaxEventRows,
        // dimensions
        colWidth: appliedColWidth
      }) }), Boolean(endScrollbarWidth) && u("div", { className: joinClassNames(generateClassName(options.fillerClass, { inTableHeader: false }), classNames.borderlessY, classNames.borderlessEnd), style: { minWidth: endScrollbarWidth } })]
    })] }), u("div", { className: joinClassNames(options.allDayDividerClass, classNames.z2) })] }), u("div", { role: "row", "aria-rowindex": firstBodyRowIndex + (options.allDaySlot ? 1 : 0), className: joinClassNames(
      classNames.flexRow,
      classNames.rel,
      // for Ruler.fillStart
      verticalScrolling && classNames.liquid,
      classNames.z0
    ), children: [u(Scroller, { vertical: verticalScrolling, hideScrollbars: true, className: joinClassNames(classNames.flexCol, classNames.contentBox), style: {
      width: axisWidth
    }, ref: this.axisScrollerRef, clientHeightRef: this.handleBodyHeight, children: !simplePrint && u(S, { children: u("div", { role: "rowheader", "aria-label": options.timedText, className: joinClassNames(classNames.flexCol, classNames.grow, classNames.rel), style: {
      height: forcedBodyHeight
    }, children: [u("div", { "aria-hidden": true, className: joinClassNames(classNames.flexCol, verticalScrolling && options.expandRows && classNames.grow, absPrint && classNames.fillX), children: props.slatMetas.map((slatMeta, slatI) => k(TimeGridSlatHeader, __spreadProps(__spreadValues({}, slatMeta), { key: slatMeta.key, innerWidthRef: slatLabelInnerWidthRefMap.createRef(slatMeta.key), innerHeightRef: slatLabelInnerHeightRefMap.createRef(slatMeta.key), borderTop: Boolean(slatI), isNarrow: cellIsNarrow, height: slatLiquidHeight ? void 0 : slatHeight, liquidHeight: slatLiquidHeight }))) }), !forPrint && options.nowIndicator && rangeContainsMarker(props.dateProfile.currentRange, nowDate) && nowTimeMs >= props.dateProfile.slotMinTime.milliseconds && nowTimeMs < props.dateProfile.slotMaxTime.milliseconds && u(TimeGridNowIndicatorArrow, { nowDate, dateProfile: props.dateProfile, totalHeight: slatHeight != null ? slatHeight * slatCnt : void 0 }), Boolean(rowsNotExpanding || bottomScrollbarWidth) && u("div", { className: joinClassNames(generateClassName(options.fillerClass, { inTableHeader: false }), classNames.borderlessX, classNames.borderlessBottom, rowsNotExpanding && classNames.liquid), style: {
      minHeight: bottomScrollbarWidth
    } })] }) }) }), u("div", { className: generateClassName(options.slotHeaderDividerClass, {
      inTableHeader: false,
      options: { dayMinWidth: options.dayMinWidth }
    }) }), u("div", {
      // we need this div because it's bad for Scroller to have left/right borders,
      // AND because we need to containt the FooterScrollbar
      className: joinClassNames(classNames.flexCol, classNames.liquid),
      children: [u(Scroller, { vertical: verticalScrolling, horizontal: true, hideScrollbars: footerScrollbarSticky || // also means height:auto, so won't need vertical scrollbars anyway
      forPrint, className: joinClassNames(
        classNames.flexCol,
        classNames.rel,
        // for Ruler.fillStart
        verticalScrolling && classNames.liquid
      ), ref: this.mainScrollerRef, clientWidthRef: this.handleClientWidth, clientHeightRef: this.handleClientHeight, children: u("div", { className: joinClassNames(classNames.flexCol, classNames.grow, classNames.rel), style: {
        width: canvasWidth,
        height: forcedBodyHeight
      }, children: [u(TimeGridCols, {
        dateProfile: props.dateProfile,
        nowDate: props.nowDate,
        nowMs: props.nowMs,
        todayRange: props.todayRange,
        cells: props.cells,
        slatCnt,
        forPrint,
        isHitComboAllowed: props.isHitComboAllowed,
        className: simplePrint ? "" : classNames.fill,
        // content
        fgEventSegsByCol: props.fgEventSegsByCol,
        bgEventSegsByCol: props.bgEventSegsByCol,
        businessHourSegsByCol: props.businessHourSegsByCol,
        nowIndicatorSegsByCol: props.nowIndicatorSegsByCol,
        dateSelectionSegsByCol: props.dateSelectionSegsByCol,
        eventDragByCol: props.eventDragByCol,
        eventResizeByCol: props.eventResizeByCol,
        eventSelection: props.eventSelection,
        // dimensions
        colWidth: appliedColWidth,
        slatHeight,
        cellIsNarrow,
        cellIsMicro
      }), !simplePrint && u(S, { children: [u("div", { "aria-hidden": true, className: joinClassNames(classNames.flexCol, verticalScrolling && options.expandRows && classNames.grow, absPrint ? classNames.fillX : classNames.rel), children: props.slatMetas.map((slatMeta, slatI) => u("div", { className: joinClassNames(classNames.flexRow, slatLiquidHeight && classNames.liquid), style: {
        height: slatLiquidHeight ? "" : slatHeight
      }, children: k(TimeGridSlatLane, __spreadProps(__spreadValues({}, slatMeta), { key: slatMeta.key, borderTop: Boolean(slatI) })) }, slatMeta.key)) }), rowsNotExpanding && u("div", { className: joinClassNames(generateClassName(options.fillerClass, { inTableHeader: false }), classNames.borderlessX, classNames.borderlessBottom, classNames.liquid) })] })] }) }), Boolean(footerScrollbarSticky) && u(FooterScrollbar, { isSticky: true, canvasWidth, scrollerRef: this.footScrollerRef, scrollbarWidthRef: this.handleStickyBottomScrollbarWidth })]
    })] })] }), u(Ruler, { widthRef: this.handleTotalWidth })] });
  }
  // Lifecycle
  // -----------------------------------------------------------------------------------------------
  componentDidMount() {
    this._isUnmounting = false;
    this.initScrollers();
    this.updateSlatHeight();
  }
  componentDidUpdate() {
    this.updateScrollers();
    this.updateSlatHeight();
  }
  componentWillUnmount() {
    this._isUnmounting = true;
    this.destroyScrollers();
    this.prevSlatHeight = void 0;
    setRef(this.props.slatHeightRef, null);
  }
  updateSlatHeight() {
    if (this.prevSlatHeight !== this.slatHeight) {
      setRef(this.props.slatHeightRef, this.prevSlatHeight = this.slatHeight);
    }
  }
  // Scrolling
  // -----------------------------------------------------------------------------------------------
  initScrollers() {
    const ScrollerSyncer = getScrollerSyncerClass(this.context.pluginHooks);
    this.dayScroller = new ScrollerSyncer(true);
    this.timeScroller = new ScrollerSyncer();
    setRef(this.props.dayScrollerRef, this.dayScroller);
    setRef(this.props.timeScrollerRef, this.timeScroller);
    this.updateScrollers();
  }
  updateScrollers() {
    this.dayScroller.handleChildren([
      this.headerScrollerRef.current,
      this.allDayScrollerRef.current,
      this.mainScrollerRef.current,
      this.footScrollerRef.current
    ]);
    this.timeScroller.handleChildren([
      this.axisScrollerRef.current,
      this.mainScrollerRef.current
    ]);
  }
  destroyScrollers() {
    setRef(this.props.dayScrollerRef, null);
    setRef(this.props.timeScrollerRef, null);
  }
};
TimeGridLayoutPannable.addPropsEquality({
  headerTierHeights: isArraysEqual
});
var TimeGridLayoutNormal = class extends BaseComponent {
  constructor() {
    super(...arguments);
    this.state = {};
    this.headerLabelInnerWidthRefMap = new RefMap(() => {
      afterSize(this.handleAxisInnerWidths);
    });
    this.handleAllDayLabelInnerWidth = (width) => {
      this.allDayLabelInnerWidth = width;
      afterSize(this.handleAxisInnerWidths);
    };
    this.handleWeekNumberInnerWidth = (width) => {
      this.weekNumberInnerWidth = width;
      afterSize(this.handleAxisInnerWidths);
    };
    this.slatLabelInnerWidthRefMap = new RefMap(() => {
      afterSize(this.handleAxisInnerWidths);
    });
    this.slatLabelInnerHeightRefMap = new RefMap(() => {
      afterSize(this.handleSlatInnerHeights);
    });
    this.handleTotalWidth = (totalWidth) => {
      if (this._isUnmounting)
        return;
      requestAnimationFrame(() => {
        if (this._isUnmounting)
          return;
        this.setState({ totalWidth });
      });
    };
    this.handleClientWidth = (clientWidth) => {
      if (this._isUnmounting)
        return;
      this.setState({ clientWidth });
    };
    this.handleClientHeight = (clientHeight) => {
      if (this._isUnmounting)
        return;
      this.setState({ clientHeight });
    };
    this.handleAxisInnerWidths = () => {
      if (this._isUnmounting)
        return;
      const headerLabelInnerWidthMap = this.headerLabelInnerWidthRefMap.current;
      const slatLabelInnerWidthMap = this.slatLabelInnerWidthRefMap.current;
      let max = Math.max(
        this.weekNumberInnerWidth || 0,
        // might not exist
        this.allDayLabelInnerWidth || 0
        // guard against all-day slot hidden
      );
      for (const headerLabelInnerWidth of headerLabelInnerWidthMap.values()) {
        max = Math.max(max, headerLabelInnerWidth);
      }
      for (const slatLabelInnerWidth of slatLabelInnerWidthMap.values()) {
        max = Math.max(max, slatLabelInnerWidth);
      }
      if (this.state.axisWidth !== max) {
        this.setState({ axisWidth: max });
      }
    };
    this.handleSlatInnerHeights = () => {
      if (this._isUnmounting)
        return;
      const slatLabelInnerHeightMap = this.slatLabelInnerHeightRefMap.current;
      let max = 0;
      for (const slatLabelInnerHeight of slatLabelInnerHeightMap.values()) {
        max = Math.max(max, slatLabelInnerHeight);
      }
      if (this.state.slatInnerHeight !== max) {
        this.setState({ slatInnerHeight: max });
      }
    };
  }
  render() {
    const { props, state, context, slatLabelInnerWidthRefMap, slatLabelInnerHeightRefMap, headerLabelInnerWidthRefMap } = this;
    const { nowDate, forPrint } = props;
    const nowTimeMs = nowDate.valueOf() - startOfDay(nowDate).valueOf();
    const { axisWidth, clientWidth, totalWidth } = state;
    const { options } = context;
    const { borderlessX, borderlessTop, borderlessBottom } = computeViewBorderless(options);
    const endScrollbarWidth = totalWidth != null && clientWidth != null && !forPrint ? totalWidth - clientWidth : void 0;
    const verticalScrolling = !forPrint && !getIsHeightAuto(options);
    const tableHeaderSticky = !forPrint && getTableHeaderSticky(options);
    const slatCnt = props.slatMetas.length;
    const [slatHeight, slatLiquidHeight] = computeSlatHeight(verticalScrolling && options.expandRows, slatCnt, options.slotMinHeight, state.slatInnerHeight, state.clientHeight);
    this.slatHeight = slatHeight;
    const totalSlatHeight = (slatHeight || 0) * slatCnt;
    const rowsNotExpanding = verticalScrolling && !options.expandRows && state.clientHeight != null && state.clientHeight > totalSlatHeight;
    const printStackEnabled = computeTimeGridPrintMode(forPrint, options.eventPrintLayout) === "stack";
    const absPrint = forPrint && !printStackEnabled;
    const simplePrint = forPrint && printStackEnabled;
    const forcedBodyHeight = absPrint ? totalSlatHeight : void 0;
    const colCount = props.cells.length;
    const measuredColWidth = clientWidth != null ? clientWidth / colCount : void 0;
    const cellIsMicro = measuredColWidth != null && measuredColWidth <= dayMicroWidth;
    const cellIsNarrow = cellIsMicro || measuredColWidth != null && measuredColWidth <= options.dayNarrowWidth;
    return u(S, { children: [options.dayHeaders && u("div", { role: "rowgroup", className: joinClassNames(
      generateClassName(options.tableHeaderClass, {
        isSticky: tableHeaderSticky,
        borderlessX,
        borderlessTop,
        borderlessBottom,
        multiMonthColumns: 0
      }),
      // See the note in TimeGridLayout about why print doesn't use repeating headers.
      classNames.flexCol,
      tableHeaderSticky && classNames.tableHeaderSticky,
      classNames.z1
    ), children: [props.headerTiers.map((rowConfig, tierNum) => u("div", { role: "row", className: classNames.flexRow, children: [u("div", { className: joinClassNames(options.dayHeaderRowClass, classNames.flexRow, classNames.borderlessX, classNames.borderlessTop, tierNum === props.headerTiers.length - 1 && classNames.borderlessBottom), children: options.weekNumbers && rowConfig.isDateRow ? u(TimeGridWeekNumber, { dateProfile: props.dateProfile, innerWidthRef: this.handleWeekNumberInnerWidth, innerHeightRef: headerLabelInnerWidthRefMap.createRef(tierNum), width: axisWidth, isLiquid: false, isNarrow: cellIsNarrow }) : u(TimeGridAxisEmpty, { width: axisWidth, isLiquid: false }) }), u("div", { className: generateClassName(options.slotHeaderDividerClass, {
      inTableHeader: true,
      options: { dayMinWidth: options.dayMinWidth }
    }) }), u(DayGridHeaderRow, __spreadProps(__spreadValues({}, rowConfig), { className: classNames.liquid, borderBottom: tierNum < props.headerTiers.length - 1, viewportWidth: clientWidth, cellIsNarrow, cellIsMicro, rowLevel: props.headerTiers.length - tierNum - 1 })), Boolean(endScrollbarWidth) && u("div", { className: joinClassNames(generateClassName(options.fillerClass, { inTableHeader: true }), classNames.borderlessY, classNames.borderlessEnd), style: { minWidth: endScrollbarWidth } })] }, tierNum)), u("div", { className: generateClassName(options.dayHeaderDividerClass, {
      isSticky: tableHeaderSticky,
      multiMonthColumns: 0,
      options: { allDaySlot: Boolean(options.allDaySlot) }
    }) })] }), u("div", { role: "rowgroup", className: joinClassNames(generateClassName(options.tableBodyClass, {
      borderlessX,
      borderlessTop,
      borderlessBottom,
      multiMonthColumns: 0
    }), classNames.flexCol, verticalScrolling && classNames.liquid, classNames.isolate, classNames.z0), children: [options.allDaySlot && u(S, { children: [u("div", { role: "row", className: joinClassNames(classNames.flexRow, classNames.z1), children: [u(TimeGridAllDayHeader, { width: axisWidth, innerWidthRef: this.handleAllDayLabelInnerWidth, isNarrow: cellIsNarrow }), u("div", { className: generateClassName(options.slotHeaderDividerClass, {
      inTableHeader: false,
      options: { dayMinWidth: options.dayMinWidth }
    }) }), u(TimeGridAllDayLane, {
      dateProfile: props.dateProfile,
      todayRange: props.todayRange,
      cells: props.cells,
      showDayNumbers: false,
      forPrint,
      isHitComboAllowed: props.isHitComboAllowed,
      className: joinClassNames(classNames.liquidX, classNames.borderless),
      cellIsNarrow,
      cellIsMicro,
      // content
      fgEventSegs: props.fgEventSegs,
      bgEventSegs: props.bgEventSegs,
      businessHourSegs: props.businessHourSegs,
      dateSelectionSegs: props.dateSelectionSegs,
      eventDrag: props.eventDrag,
      eventResize: props.eventResize,
      eventSelection: props.eventSelection,
      dayMaxEvents: props.dayMaxEvents,
      dayMaxEventRows: props.dayMaxEventRows
    }), Boolean(endScrollbarWidth) && u("div", { className: joinClassNames(generateClassName(options.fillerClass, { inTableHeader: false }), classNames.borderlessY, classNames.borderlessEnd), style: { minWidth: endScrollbarWidth } })] }), u("div", { className: joinClassNames(options.allDayDividerClass, classNames.z2) })] }), u(Scroller, { vertical: verticalScrolling, className: joinClassNames(
      classNames.flexCol,
      classNames.rel,
      // for Ruler.fillStart
      verticalScrolling && classNames.liquid,
      classNames.z0
    ), ref: props.timeScrollerRef, clientWidthRef: this.handleClientWidth, clientHeightRef: this.handleClientHeight, children: u("div", { className: joinClassNames(classNames.flexCol, classNames.grow, classNames.rel), style: {
      // in print mode, this div creates the height and everything is absolutely positioned within
      // we need to do this so that slats positioning synces with events's positioning
      // otherwise, get out of sync on second page
      height: forcedBodyHeight
    }, children: [u("div", { role: "row", className: joinClassNames(classNames.flexRow, !simplePrint && classNames.fill), children: [u("div", { role: "rowheader", "aria-label": options.timedText, className: classNames.contentBox, style: { width: axisWidth } }), u("div", { className: generateClassName(options.slotHeaderDividerClass, {
      inTableHeader: false,
      options: { dayMinWidth: options.dayMinWidth }
    }) }), u(TimeGridCols, {
      dateProfile: props.dateProfile,
      nowDate: props.nowDate,
      nowMs: props.nowMs,
      todayRange: props.todayRange,
      cells: props.cells,
      slatCnt,
      forPrint,
      isHitComboAllowed: props.isHitComboAllowed,
      className: classNames.liquid,
      // content
      fgEventSegsByCol: props.fgEventSegsByCol,
      bgEventSegsByCol: props.bgEventSegsByCol,
      businessHourSegsByCol: props.businessHourSegsByCol,
      nowIndicatorSegsByCol: props.nowIndicatorSegsByCol,
      dateSelectionSegsByCol: props.dateSelectionSegsByCol,
      eventDragByCol: props.eventDragByCol,
      eventResizeByCol: props.eventResizeByCol,
      eventSelection: props.eventSelection,
      // dimensions
      slatHeight,
      cellIsNarrow,
      cellIsMicro
    })] }), !simplePrint && u(S, { children: [u("div", { "aria-hidden": true, className: joinClassNames(classNames.flexCol, verticalScrolling && options.expandRows && classNames.grow, absPrint ? classNames.fillX : classNames.rel), children: props.slatMetas.map((slatMeta, slatI) => u("div", { className: joinClassNames(slatLiquidHeight && classNames.liquid, classNames.flexRow), style: {
      height: slatLiquidHeight ? void 0 : slatHeight
    }, children: [u("div", {
      // the pannable version of TimeGrid has axis labels all consecutive in one column
      // simulate this for the non-pannable version
      className: classNames.flexCol,
      style: { width: axisWidth },
      children: k(TimeGridSlatHeader, __spreadProps(__spreadValues({}, slatMeta), { key: slatMeta.key, innerWidthRef: slatLabelInnerWidthRefMap.createRef(slatMeta.key), innerHeightRef: slatLabelInnerHeightRefMap.createRef(slatMeta.key), borderTop: Boolean(slatI), isNarrow: cellIsNarrow }))
    }), u("div", { className: generateClassName(options.slotHeaderDividerClass, {
      inTableHeader: false,
      options: { dayMinWidth: options.dayMinWidth }
    }), style: { visibility: "hidden" } }), k(TimeGridSlatLane, __spreadProps(__spreadValues({}, slatMeta), { key: slatMeta.key, borderTop: Boolean(slatI) }))] }, slatMeta.key)) }), rowsNotExpanding && u("div", { className: joinClassNames(generateClassName(options.fillerClass, { inTableHeader: false }), classNames.borderlessX, classNames.borderlessBottom, classNames.liquid) }), !forPrint && options.nowIndicator && rangeContainsMarker(props.dateProfile.currentRange, nowDate) && nowTimeMs >= props.dateProfile.slotMinTime.milliseconds && nowTimeMs < props.dateProfile.slotMaxTime.milliseconds && u(TimeGridNowIndicatorArrow, { nowDate, dateProfile: props.dateProfile, totalHeight: slatHeight != null ? slatHeight * slatCnt : void 0 })] })] }) })] }), u(Ruler, { widthRef: this.handleTotalWidth })] });
  }
  // Lifecycle
  // -----------------------------------------------------------------------------------------------
  componentDidMount() {
    this._isUnmounting = false;
    this.updateSlatHeight();
  }
  componentDidUpdate() {
    this.updateSlatHeight();
  }
  componentWillUnmount() {
    this._isUnmounting = true;
    this.prevSlatHeight = void 0;
    setRef(this.props.slatHeightRef, null);
  }
  updateSlatHeight() {
    if (this.prevSlatHeight !== this.slatHeight) {
      setRef(this.props.slatHeightRef, this.prevSlatHeight = this.slatHeight);
    }
  }
};
function buildEmptySegCols(segsByCol) {
  return segsByCol.map(() => []);
}
function buildEmptyInteractionCols(interactionsByCol) {
  return interactionsByCol.map(() => null);
}
var TimeGridLayout = class extends BaseComponent {
  constructor() {
    super(...arguments);
    this.buildSlatMetas = memoize(buildSlatMetas);
    this.dayScrollerRef = M();
    this.timeScrollerRef = M();
    this.scrollState = {};
    this.handleSlatHeight = (slatHeight) => {
      if (this._isUnmounting)
        return;
      this.slatHeight = slatHeight;
      if (slatHeight != null) {
        afterSize(this.applyTimeScroll);
      }
    };
    this.handleTimeScrollRequest = (scrollTime) => {
      this.scrollState.time = scrollTime;
      this.scrollState.y = void 0;
      this.applyTimeScroll();
    };
    this.handleTimeScrollEnd = (isDevice) => {
      if (isDevice) {
        const y = this.timeScrollerRef.current.y;
        if (!this.props.forPrint) {
          this.scrollState.y = y;
          this.scrollState.time = void 0;
        }
      }
    };
    this.applyTimeScroll = () => {
      const timeScroller = this.timeScrollerRef.current;
      const { slatHeight, scrollState } = this;
      let { y, time } = scrollState;
      if (y == null && time && slatHeight != null && // Since applyTimeScroll is called by handleSlatHeight, could be called with null during cleanup,
      // and the timeScroller might not exist
      timeScroller) {
        y = computeTimeTopFrac(time, this.props.dateProfile) * (slatHeight * this.currentSlatCnt);
        if (y) {
          y++;
        }
        scrollState.y = y;
      }
      if (y != null) {
        timeScroller.scrollTo({ y });
      }
    };
  }
  render() {
    const { props, context } = this;
    const { dateProfile } = props;
    const { options, dateEnv } = context;
    const { dayMinWidth } = options;
    const { borderlessX, borderlessTop, borderlessBottom } = computeViewBorderless(options);
    const slatMetas = this.buildSlatMetas(dateProfile.slotMinTime, dateProfile.slotMaxTime, options.slotHeaderInterval, options.slotDuration, dateEnv);
    this.currentSlatCnt = slatMetas.length;
    const dateSelectionSegs = props.forPrint ? [] : props.dateSelectionSegs;
    const eventDrag = props.forPrint ? null : props.eventDrag;
    const eventResize = props.forPrint ? null : props.eventResize;
    const dateSelectionSegsByCol = props.forPrint ? buildEmptySegCols(props.dateSelectionSegsByCol) : props.dateSelectionSegsByCol;
    const eventDragByCol = props.forPrint ? buildEmptyInteractionCols(props.eventDragByCol) : props.eventDragByCol;
    const eventResizeByCol = props.forPrint ? buildEmptyInteractionCols(props.eventResizeByCol) : props.eventResizeByCol;
    const commonLayoutProps = __spreadProps(__spreadValues({
      dateProfile,
      nowDate: props.nowDate,
      nowMs: props.nowMs,
      todayRange: props.todayRange,
      cells: props.cells,
      slatMetas,
      forPrint: props.forPrint,
      isHitComboAllowed: props.isHitComboAllowed,
      // header content
      headerTiers: props.headerTiers,
      // all-day content
      fgEventSegs: props.fgEventSegs,
      bgEventSegs: props.bgEventSegs,
      businessHourSegs: props.businessHourSegs,
      dateSelectionSegs,
      eventDrag,
      eventResize
    }, getAllDayMaxEventProps(options)), {
      // timed content
      fgEventSegsByCol: props.fgEventSegsByCol,
      bgEventSegsByCol: props.bgEventSegsByCol,
      businessHourSegsByCol: props.businessHourSegsByCol,
      nowIndicatorSegsByCol: props.nowIndicatorSegsByCol,
      dateSelectionSegsByCol,
      eventDragByCol,
      eventResizeByCol,
      // universal content
      eventSelection: props.eventSelection,
      // refs
      timeScrollerRef: this.timeScrollerRef,
      timeScrollState: this.scrollState,
      slatHeightRef: this.handleSlatHeight,
      borderlessX,
      borderlessBottom
    });
    return u(ViewContainer, { attrs: {
      role: "grid",
      "aria-colcount": props.cells.length,
      "aria-labelledby": props.labelId,
      "aria-label": props.labelStr
    }, className: joinClassNames(
      props.className,
      generateClassName(options.tableClass, {
        borderlessX,
        borderlessTop,
        borderlessBottom,
        multiMonthColumns: 0
      }),
      // We don't use the repeating-header print treatment here because it works poorly:
      // - Firefox >85ish CAN have flexboxes within it, but those cannot do absolute positioning
      // - Chrome works okay, but abs-positioned events cover the repeated header
      //   Also, there's weird padding on the last page at bottom of container, which matches
      //   the height of the repeated header
      // - Safari was never able to do repeated headers in the first place
      !props.forPrint && classNames.flexCol,
      classNames.isolate
    ), viewSpec: context.viewSpec, children: dayMinWidth ? u(TimeGridLayoutPannable, __spreadProps(__spreadValues({}, commonLayoutProps), { dayMinWidth, dayScrollerRef: this.dayScrollerRef })) : u(TimeGridLayoutNormal, __spreadValues({}, commonLayoutProps)) });
  }
  // Lifecycle
  // -----------------------------------------------------------------------------------------------
  componentDidMount() {
    this._isUnmounting = false;
    this.resetScroll();
    this.context.emitter.on("_timeScrollRequest", this.handleTimeScrollRequest);
    const timeScroller = this.timeScrollerRef.current;
    if (timeScroller) {
      timeScroller.addScrollEndListener(this.handleTimeScrollEnd);
    }
  }
  componentDidUpdate(prevProps) {
    if (prevProps.dateProfile !== this.props.dateProfile && this.context.options.scrollTimeReset) {
      this.resetScroll();
    } else if (prevProps.forPrint && !this.props.forPrint) {
      this.applyTimeScroll();
    }
  }
  componentWillUnmount() {
    this._isUnmounting = true;
    this.context.emitter.off("_timeScrollRequest", this.handleTimeScrollRequest);
    const timeScroller = this.timeScrollerRef.current;
    if (timeScroller) {
      timeScroller.removeScrollEndListener(this.handleTimeScrollEnd);
    }
  }
  // Scrolling
  // -----------------------------------------------------------------------------------------------
  resetScroll() {
    this.handleTimeScrollRequest(this.context.options.scrollTime);
    const dayScroller = this.dayScrollerRef.current;
    if (dayScroller) {
      dayScroller.scrollTo({ x: 0 });
    }
  }
};
var AUTO_ALL_DAY_MAX_EVENT_ROWS = 5;
function getAllDayMaxEventProps(options) {
  let { dayMaxEvents, dayMaxEventRows } = options;
  if (dayMaxEvents === true || dayMaxEventRows === true) {
    dayMaxEvents = void 0;
    dayMaxEventRows = AUTO_ALL_DAY_MAX_EVENT_ROWS;
  }
  return { dayMaxEvents, dayMaxEventRows };
}

export {
  buildDayColsFromSeries,
  AllDaySplitter,
  DayTimeColsSlicer,
  organizeSegsByCol,
  splitInteractionByCol,
  TimeGridLayout
};
//# sourceMappingURL=chunk-LS63Y2HS.js.map
