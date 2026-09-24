import {
  BaseComponent,
  ContentContainer,
  DateComponent,
  FULL_DATE_FORMAT,
  NowTimer,
  Scroller,
  StandardEvent,
  ViewContainer,
  WEEKDAY_ONLY_FORMAT,
  buildDateStr,
  buildNavLinkAttrs,
  findDayNumberText,
  findWeekdayText,
  generateClassName,
  getDateMeta,
  getIsHeightAuto,
  memoize,
  renderText
} from "./chunk-GX5FAIHT.js";
import {
  addDays,
  classNames,
  createFormatter,
  formatDayString,
  getEventRangeMeta,
  intersectRanges,
  joinDateTimeFormatParts,
  sliceEventStore,
  sortEventSegs,
  startOfDay
} from "./chunk-43C3ZVMA.js";
import {
  S,
  u
} from "./chunk-GOSSR2CB.js";
import {
  joinClassNames
} from "./chunk-3AK7CWDL.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-J25FJFZE.js";

// node_modules/fullcalendar/chunks/33aacced.js
var ListDayHeaderInner = class extends BaseComponent {
  render() {
    const { props, context } = this;
    const { options } = context;
    const textParts = context.dateEnv.formatToParts(props.dayDate, props.dayFormat);
    const text = joinDateTimeFormatParts(textParts);
    const hasNavLink = options.navLinks;
    const renderProps = __spreadProps(__spreadValues({}, props.dateMeta), {
      view: context.viewApi,
      text,
      textParts,
      get weekdayText() {
        return findWeekdayText(textParts);
      },
      get dayNumberText() {
        return findDayNumberText(textParts);
      },
      hasNavLink,
      level: props.level
    });
    const navLinkAttrs = hasNavLink ? buildNavLinkAttrs(this.context, props.dayDate, void 0, text, this.props.isTabbable) : {};
    return u(ContentContainer, { tag: "div", attrs: navLinkAttrs, renderProps, generatorName: "listDayHeaderContent", customGenerator: options.listDayHeaderContent, defaultGenerator: renderText, classNameGenerator: options.listDayHeaderInnerClass });
  }
};
var ListDayHeader = class extends BaseComponent {
  render() {
    let { options, viewApi, viewSpec } = this.context;
    let { dayDate, dateMeta } = this.props;
    let stickyHeaderDates = !this.props.forPrint;
    const listDayFormat = options.listDayFormat ?? createDefaultListDayFormat(viewSpec);
    const listDayAltFormat = options.listDayAltFormat ?? createDefaultListDaySideFormat(viewSpec);
    let renderProps = __spreadProps(__spreadValues({}, dateMeta), {
      view: viewApi
    });
    return u(ContentContainer, { tag: "div", attrs: __spreadValues({
      "data-date": formatDayString(dayDate)
    }, dateMeta.isToday ? { "aria-current": "date" } : {}), className: stickyHeaderDates ? classNames.stickyT : "", renderProps, generatorName: void 0, classNameGenerator: options.listDayHeaderClass, didMount: options.listDayHeaderDidMount, willUnmount: options.listDayHeaderWillUnmount, children: () => u(S, { children: [Boolean(listDayFormat) && u(ListDayHeaderInner, { dayDate, dayFormat: listDayFormat, isTabbable: true, dateMeta, level: 0 }), Boolean(listDayAltFormat) && u(ListDayHeaderInner, { dayDate, dayFormat: listDayAltFormat, isTabbable: false, dateMeta, level: 1 })] }) });
  }
};
function createDefaultListDayFormat({ durationUnit, singleUnit }) {
  if (singleUnit === "day") {
    return WEEKDAY_ONLY_FORMAT;
  } else if (durationUnit === "day" || singleUnit === "week") {
    return WEEKDAY_ONLY_FORMAT;
  } else {
    return FULL_DATE_FORMAT;
  }
}
function createDefaultListDaySideFormat({ durationUnit, singleUnit }) {
  if (singleUnit === "day") ;
  else if (durationUnit === "day" || singleUnit === "week") {
    return FULL_DATE_FORMAT;
  } else {
    return WEEKDAY_ONLY_FORMAT;
  }
}
var DEFAULT_TIME_FORMAT = createFormatter({
  hour: "numeric",
  minute: "2-digit",
  meridiem: "short"
});
var ListEvent = class extends BaseComponent {
  render() {
    let { props, context } = this;
    let { eventRange } = props;
    const { displayEventTime } = context.options;
    let forcedTimeText = displayEventTime !== false && (eventRange.def.allDay || !props.isStart && !props.isEnd) ? context.options.allDayText : void 0;
    return u(StandardEvent, __spreadProps(__spreadValues({}, props), { attrs: {
      role: "listitem"
    }, forcedTimeText, defaultTimeFormat: DEFAULT_TIME_FORMAT, disableDragging: true, disableResizing: true, disableZindexes: true, display: "list-item" }));
  }
};
var ListDay = class extends BaseComponent {
  constructor() {
    super(...arguments);
    this.getDateMeta = memoize(getDateMeta);
    this.sortEventSegs = memoize(sortEventSegs);
  }
  render() {
    const { props, context } = this;
    const { nowDate, todayRange } = props;
    const { options } = context;
    const dateMeta = this.getDateMeta(props.dayDate, context.dateEnv, void 0, todayRange);
    const segs = this.sortEventSegs(props.segs, options.eventOrder);
    const fullDateStr = buildDateStr(this.context, props.dayDate);
    const listDayData = __spreadProps(__spreadValues({}, dateMeta), {
      isFirst: props.isFirst,
      isLast: props.isLast,
      view: context.viewApi
    });
    const listDayEventsData = __spreadProps(__spreadValues({}, dateMeta), {
      view: context.viewApi
    });
    return u("div", { role: "listitem", "aria-label": fullDateStr, className: generateClassName(options.listDayClass, listDayData), children: [u(ListDayHeader, { dayDate: props.dayDate, dateMeta, forPrint: props.forPrint }), u("div", { role: "list", "aria-label": options.eventsHint, className: joinClassNames(generateClassName(options.listDayBodyClass, listDayEventsData), classNames.flexCol), children: segs.map((seg, index) => {
      const key = seg.eventRange.instance.instanceId;
      const isFirst = index === 0;
      const isLast = index === segs.length - 1;
      return u(ListEvent, __spreadValues({ eventRange: seg.eventRange, slicedStart: seg.slicedStart, slicedEnd: seg.slicedEnd, isStart: seg.isStart, isEnd: seg.isEnd, isFirst, isLast, isDragging: false, isResizing: false, isMirror: false, isSelected: false }, getEventRangeMeta(seg.eventRange, todayRange, nowDate, props.nowMs)), key);
    }) })] });
  }
};
var ListView = class extends DateComponent {
  constructor() {
    super(...arguments);
    this.computeDateVars = memoize(computeDateVars);
    this.eventStoreToSegs = memoize(this._eventStoreToSegs);
    this.setRootEl = (rootEl) => {
      if (rootEl) {
        this.context.registerInteractiveComponent(this, {
          el: rootEl,
          disableHits: true
          // HACK to not do date-clicking/selecting
        });
      } else {
        this.context.unregisterInteractiveComponent(this);
      }
    };
  }
  render() {
    let { props, context } = this;
    let { options } = context;
    let { dayDates, dayRanges } = this.computeDateVars(props.dateProfile);
    let eventSegs = this.eventStoreToSegs(props.eventStore, props.eventUiBases, dayRanges);
    let verticalScrolling = !props.forPrint && !getIsHeightAuto(options);
    return u(ViewContainer, { viewSpec: context.viewSpec, className: joinClassNames(props.className, classNames.flexCol), elRef: this.setRootEl, children: eventSegs.length ? u(
      Scroller,
      { vertical: verticalScrolling, className: joinClassNames(classNames.flexCol, verticalScrolling ? classNames.liquid : ""), children: this.renderSegList(eventSegs, dayDates) }
    ) : this.renderEmptyMessage() });
  }
  renderEmptyMessage() {
    let { options, viewApi } = this.context;
    let renderProps = {
      text: options.noEventsText,
      view: viewApi
    };
    return u(ContentContainer, { tag: "div", attrs: {
      role: "status"
      // does a polite announcement
    }, renderProps, generatorName: "noEventsContent", customGenerator: options.noEventsContent, defaultGenerator: renderNoEventsInner, classNameGenerator: options.noEventsClass, className: classNames.grow, didMount: options.noEventsDidMount, willUnmount: options.noEventsWillUnmount, children: (InnerContent) => u(InnerContent, { tag: "div", className: generateClassName(options.noEventsInnerClass, renderProps) }) });
  }
  renderSegList(allSegs, dayDates) {
    let { options } = this.context;
    let segsByDay = groupSegsByDay(allSegs);
    return u("div", { role: "list", "aria-labelledby": this.props.labelId, "aria-label": this.props.labelStr, className: joinClassNames(classNames.flexCol, joinClassNames(options.listDaysClass)), children: u(NowTimer, { unit: "day", children: (nowDate, todayRange, nowMs) => {
      const dayNodes = [];
      const populatedDayCount = segsByDay.reduce((count, daySegs) => count + (daySegs ? 1 : 0), 0);
      let populatedDayIndex = 0;
      for (let dayIndex = 0; dayIndex < segsByDay.length; dayIndex += 1) {
        let daySegs = segsByDay[dayIndex];
        if (daySegs) {
          const dayDate = dayDates[dayIndex];
          const key = formatDayString(dayDate);
          const isFirst = populatedDayIndex === 0;
          const isLast = populatedDayIndex === populatedDayCount - 1;
          dayNodes.push(u(ListDay, { dayDate, nowDate, nowMs, todayRange, segs: daySegs, isFirst, isLast, forPrint: this.props.forPrint }, key));
          populatedDayIndex += 1;
        }
      }
      return u(S, { children: dayNodes });
    } }) });
  }
  _eventStoreToSegs(eventStore, eventUiBases, dayRanges) {
    return this.eventRangesToSegs(sliceEventStore(
      eventStore,
      eventUiBases,
      // HACKY to reference internal state...
      this.props.dateProfile.activeRange,
      this.context.options.nextDayThreshold
    ).fg, dayRanges);
  }
  eventRangesToSegs(fullDayEventRanges, dayRanges) {
    let segs = [];
    for (let fullDayEventRange of fullDayEventRanges) {
      segs.push(...this.eventRangeToSegs(fullDayEventRange, dayRanges));
    }
    return segs;
  }
  eventRangeToSegs(fullDayEventRange, dayRanges) {
    let fullDayRange = fullDayEventRange.range;
    let dayIndex;
    let segs = [];
    for (dayIndex = 0; dayIndex < dayRanges.length; dayIndex += 1) {
      const slicedFullDayRange = intersectRanges(fullDayRange, dayRanges[dayIndex]);
      if (slicedFullDayRange) {
        segs.push({
          eventRange: fullDayEventRange,
          slicedStart: slicedFullDayRange.start,
          slicedEnd: slicedFullDayRange.end,
          isStart: fullDayEventRange.isStart && fullDayRange.start.valueOf() === slicedFullDayRange.start.valueOf(),
          isEnd: fullDayEventRange.isEnd && fullDayRange.end.valueOf() === slicedFullDayRange.end.valueOf(),
          dayIndex
        });
      }
    }
    return segs;
  }
};
function renderNoEventsInner(renderProps) {
  return renderProps.text;
}
function computeDateVars(dateProfile) {
  let dayStart = startOfDay(dateProfile.renderRange.start);
  let viewEnd = dateProfile.renderRange.end;
  let dayDates = [];
  let dayRanges = [];
  while (dayStart < viewEnd) {
    dayDates.push(dayStart);
    dayRanges.push({
      start: dayStart,
      end: addDays(dayStart, 1)
    });
    dayStart = addDays(dayStart, 1);
  }
  return { dayDates, dayRanges };
}
function groupSegsByDay(segs) {
  let segsByDay = [];
  let i;
  let seg;
  for (i = 0; i < segs.length; i += 1) {
    seg = segs[i];
    (segsByDay[seg.dayIndex] || (segsByDay[seg.dayIndex] = [])).push(seg);
  }
  return segsByDay;
}
var listPlugin = {
  name: "list",
  views: {
    list: {
      component: ListView,
      buttonTextKey: "listText",
      // what to lookup in locale files
      disallowAmbigTitle: true
    },
    listDay: {
      type: "list",
      duration: { days: 1 }
    },
    listWeek: {
      type: "list",
      duration: { weeks: 1 }
    },
    listMonth: {
      type: "list",
      duration: { month: 1 }
    },
    listYear: {
      type: "list",
      duration: { year: 1 }
    }
  }
};
export {
  listPlugin as default
};
//# sourceMappingURL=@fullcalendar_angular_list.js.map
