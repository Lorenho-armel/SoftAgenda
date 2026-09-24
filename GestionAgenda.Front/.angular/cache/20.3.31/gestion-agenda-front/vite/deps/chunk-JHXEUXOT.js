import {
  computeClippedClientRect
} from "./chunk-MPQAZ5OY.js";
import {
  $,
  BaseComponent,
  ContentContainer,
  DateComponent,
  Scroller,
  StandardEvent,
  ViewContainer,
  WEEKDAY_ONLY_FORMAT,
  afterSize,
  buildDateStr,
  buildNavLinkAttrs,
  findDayNumberText,
  findMonthText,
  findWeekdayText,
  generateClassName,
  getDateMeta,
  getFooterScrollbarSticky,
  getIsHeightAuto,
  getScrollerSyncerClass,
  getTableHeaderSticky,
  isDimsEqual,
  memoize,
  memoizeObjArg,
  renderText,
  setRef,
  watchHeight,
  watchSize,
  watchWidth
} from "./chunk-GX5FAIHT.js";
import {
  EventImpl,
  addDays,
  addMs,
  applyStyle,
  asRoughDays,
  asRoughMs,
  buildEventRangeKey,
  buildRangeEdgeOutput,
  classNames,
  computeElIsRtl,
  computeViewBorderless,
  computeVisibleDayRange,
  constrainMarkerToRange,
  createAriaClickAttrs,
  createDuration,
  createFormatter,
  diffDays,
  diffWholeDays,
  diffWholeWeeks,
  expandRecurring,
  fabricateEventRange,
  flatArray,
  flatMapArray,
  formatDayString,
  formatWithOrdinals,
  getAppendableRoot,
  getEventRangeMeta,
  getEventTargetViaRoot,
  greatestDurationDenominator,
  guid,
  intersectRanges,
  joinDateTimeFormatParts,
  parseRange,
  rangeContainsMarker,
  rangesIntersect,
  setElEventRange,
  sliceEventStore,
  sortEventSegs,
  startOfDay
} from "./chunk-43C3ZVMA.js";
import {
  C,
  M,
  S,
  k,
  u
} from "./chunk-GOSSR2CB.js";
import {
  joinClassNames
} from "./chunk-3AK7CWDL.js";
import {
  __objRest,
  __spreadProps,
  __spreadValues
} from "./chunk-J25FJFZE.js";

// node_modules/fullcalendar/chunks/54e239b5.js
var DateProfileGenerator = class {
  constructor(props) {
    this.props = props;
    this.initHiddenDays();
  }
  /* Date Range Computation
  ------------------------------------------------------------------------------------------------------------------*/
  // Builds a structure with info about what the dates/ranges will be for the "prev" view.
  buildPrev(currentDateProfile, currentDate, nowDate, forceToValid) {
    let { dateEnv } = this.props;
    let prevDate = dateEnv.subtract(
      dateEnv.startOf(currentDate, currentDateProfile.currentRangeUnit),
      // important for start-of-month
      currentDateProfile.dateIncrement
    );
    return this.build(prevDate, nowDate, -1, forceToValid);
  }
  // Builds a structure with info about what the dates/ranges will be for the "next" view.
  buildNext(currentDateProfile, currentDate, nowDate, forceToValid) {
    let { dateEnv } = this.props;
    let nextDate = dateEnv.add(
      dateEnv.startOf(currentDate, currentDateProfile.currentRangeUnit),
      // important for start-of-month
      currentDateProfile.dateIncrement
    );
    return this.build(nextDate, nowDate, 1, forceToValid);
  }
  // Builds a structure holding dates/ranges for rendering around the given date.
  // Optional direction param indicates whether the date is being incremented/decremented
  // from its previous value. decremented = -1, incremented = 1 (default).
  build(currentDate, nowDate, direction, forceToValid = true) {
    let { props } = this;
    let validRange;
    let currentInfo;
    let isRangeAllDay;
    let renderRange;
    let activeRange;
    let isValid;
    validRange = this.buildValidRange(nowDate);
    validRange = this.trimHiddenDays(validRange);
    if (forceToValid) {
      currentDate = constrainMarkerToRange(currentDate, validRange);
    }
    currentInfo = this.buildCurrentRangeInfo(currentDate, direction);
    isRangeAllDay = /^(year|month|week|day)$/.test(currentInfo.unit);
    renderRange = this.buildRenderRange(this.trimHiddenDays(currentInfo.range), currentInfo.unit, isRangeAllDay);
    renderRange = this.trimHiddenDays(renderRange);
    activeRange = renderRange;
    if (!props.showNonCurrentDates) {
      activeRange = intersectRanges(activeRange, currentInfo.range);
    }
    activeRange = this.adjustActiveRange(activeRange);
    activeRange = intersectRanges(activeRange, validRange);
    isValid = rangesIntersect(currentInfo.range, validRange);
    if (!rangeContainsMarker(renderRange, currentDate)) {
      currentDate = renderRange.start;
    }
    return {
      currentDate,
      // constraint for where prev/next operations can go and where events can be dragged/resized to.
      // an object with optional start and end properties.
      validRange,
      // range the view is formally responsible for.
      // for example, a month view might have 1st-31st, excluding padded dates
      currentRange: currentInfo.range,
      // name of largest unit being displayed, like "month" or "week"
      currentRangeUnit: currentInfo.unit,
      isRangeAllDay,
      // dates that display events and accept drag-n-drop
      // will be `null` if no dates accept events
      activeRange,
      // date range with a rendered skeleton
      // includes not-active days that need some sort of DOM
      renderRange,
      // Duration object that denotes the first visible time of any given day
      slotMinTime: props.slotMinTime,
      // Duration object that denotes the exclusive visible end time of any given day
      slotMaxTime: props.slotMaxTime,
      isValid,
      // how far the current date will move for a prev/next operation
      dateIncrement: this.buildDateIncrement(currentInfo.duration)
      // pass a fallback (might be null) ^
    };
  }
  // Builds an object with optional start/end properties.
  // Indicates the minimum/maximum dates to display.
  // not responsible for trimming hidden days.
  buildValidRange(nowDate) {
    let input = this.props.validRangeInput;
    let simpleInput = typeof input === "function" ? input.call(this.props.calendarApi, this.props.dateEnv.toDate(nowDate)) : input;
    return this.refineRange(simpleInput) || { start: null, end: null };
  }
  // Builds a structure with info about the "current" range, the range that is
  // highlighted as being the current month for example.
  // See build() for a description of `direction`.
  // Guaranteed to have `range` and `unit` properties. `duration` is optional.
  buildCurrentRangeInfo(date, direction) {
    let { props } = this;
    let duration = null;
    let unit = null;
    let range = null;
    let dayCount;
    if (props.duration) {
      duration = props.duration;
      unit = props.durationUnit;
      range = this.buildRangeFromDuration(date, direction, duration, unit);
    } else if (dayCount = this.props.dayCount) {
      unit = "day";
      range = this.buildRangeFromDayCount(date, direction, dayCount);
    } else if (range = this.buildCustomVisibleRange(date)) {
      unit = props.dateEnv.greatestWholeUnit(range.start, range.end).unit;
    } else {
      duration = this.getFallbackDuration();
      unit = greatestDurationDenominator(duration).unit;
      range = this.buildRangeFromDuration(date, direction, duration, unit);
    }
    return { duration, unit, range };
  }
  getFallbackDuration() {
    return createDuration({ day: 1 });
  }
  // Returns a new activeRange to have time values (un-ambiguate)
  // slotMinTime or slotMaxTime causes the range to expand.
  adjustActiveRange(range) {
    let { dateEnv, usesMinMaxTime, slotMinTime, slotMaxTime } = this.props;
    let { start, end } = range;
    if (usesMinMaxTime) {
      if (asRoughDays(slotMinTime) < 0) {
        start = startOfDay(start);
        start = dateEnv.add(start, slotMinTime);
      }
      if (asRoughDays(slotMaxTime) > 1) {
        end = startOfDay(end);
        end = addDays(end, -1);
        end = dateEnv.add(end, slotMaxTime);
      }
    }
    return { start, end };
  }
  // Builds the "current" range when it is specified as an explicit duration.
  // `unit` is the already-computed greatestDurationDenominator unit of duration.
  buildRangeFromDuration(date, direction, duration, unit) {
    let { dateEnv, dateAlignment } = this.props;
    let start;
    let end;
    let res;
    if (!dateAlignment) {
      let { dateIncrement } = this.props;
      if (dateIncrement) {
        if (asRoughMs(dateIncrement) < asRoughMs(duration)) {
          dateAlignment = greatestDurationDenominator(dateIncrement).unit;
        } else {
          dateAlignment = unit;
        }
      } else {
        dateAlignment = unit;
      }
    }
    if (asRoughDays(duration) <= 1) {
      if (this.isHiddenDay(start)) {
        start = this.skipHiddenDays(start, direction);
        start = startOfDay(start);
      }
    }
    function computeRes() {
      start = dateEnv.startOf(date, dateAlignment);
      end = dateEnv.add(start, duration);
      res = { start, end };
    }
    computeRes();
    if (!this.trimHiddenDays(res)) {
      date = this.skipHiddenDays(date, direction);
      computeRes();
    }
    return res;
  }
  // Builds the "current" range when a dayCount is specified.
  buildRangeFromDayCount(date, direction, dayCount) {
    let { dateEnv, dateAlignment } = this.props;
    let runningCount = 0;
    let start = date;
    let end;
    if (dateAlignment) {
      start = dateEnv.startOf(start, dateAlignment);
    }
    start = startOfDay(start);
    start = this.skipHiddenDays(start, direction);
    end = start;
    do {
      end = addDays(end, 1);
      if (!this.isHiddenDay(end)) {
        runningCount += 1;
      }
    } while (runningCount < dayCount);
    return { start, end };
  }
  // Builds a normalized range object for the "visible" range,
  // which is a way to define the currentRange and activeRange at the same time.
  buildCustomVisibleRange(date) {
    let { props } = this;
    let input = props.visibleRangeInput;
    let simpleInput = typeof input === "function" ? input.call(props.calendarApi, props.dateEnv.toDate(date)) : input;
    let range = this.refineRange(simpleInput);
    if (range && (range.start == null || range.end == null)) {
      return null;
    }
    return range;
  }
  // Computes the range that will represent the element/cells for *rendering*,
  // but which may have voided days/times.
  // not responsible for trimming hidden days.
  buildRenderRange(currentRange, currentRangeUnit, isRangeAllDay) {
    return currentRange;
  }
  // Compute the duration value that should be added/substracted to the current date
  // when a prev/next operation happens.
  buildDateIncrement(fallback) {
    let { dateIncrement } = this.props;
    let customAlignment;
    if (dateIncrement) {
      return dateIncrement;
    }
    if (customAlignment = this.props.dateAlignment) {
      return createDuration(1, customAlignment);
    }
    if (fallback) {
      return fallback;
    }
    return createDuration({ days: 1 });
  }
  refineRange(rangeInput) {
    if (rangeInput) {
      let range = parseRange(rangeInput, this.props.dateEnv);
      if (range) {
        range = computeVisibleDayRange(range);
      }
      return range;
    }
    return null;
  }
  /* Hidden Days
  ------------------------------------------------------------------------------------------------------------------*/
  // Initializes internal variables related to calculating hidden days-of-week
  initHiddenDays() {
    let hiddenDays = this.props.hiddenDays || [];
    let isHiddenDayHash = [];
    let dayCnt = 0;
    let i;
    if (this.props.weekends === false) {
      hiddenDays.push(0, 6);
    }
    for (i = 0; i < 7; i += 1) {
      if (!(isHiddenDayHash[i] = hiddenDays.indexOf(i) !== -1)) {
        dayCnt += 1;
      }
    }
    if (!dayCnt) {
      throw new Error("invalid hiddenDays");
    }
    this.isHiddenDayHash = isHiddenDayHash;
  }
  // Remove days from the beginning and end of the range that are computed as hidden.
  // If the whole range is trimmed off, returns null
  trimHiddenDays(range) {
    let { start, end } = range;
    if (start) {
      start = this.skipHiddenDays(start);
    }
    if (end) {
      end = this.skipHiddenDays(end, -1, true);
    }
    if (start == null || end == null || start < end) {
      return { start, end };
    }
    return null;
  }
  // Is the current day hidden?
  // `day` is a day-of-week index (0-6), or a Date (used for UTC)
  isHiddenDay(day) {
    if (day instanceof Date) {
      day = day.getUTCDay();
    }
    return this.isHiddenDayHash[day];
  }
  // Incrementing the current day until it is no longer a hidden day, returning a copy.
  // DOES NOT CONSIDER validRange!
  // If the initial value of `date` is not a hidden day, don't do anything.
  // Pass `isExclusive` as `true` if you are dealing with an end date.
  // `inc` defaults to `1` (increment one day forward each time)
  skipHiddenDays(date, inc = 1, isExclusive = false) {
    while (this.isHiddenDayHash[(date.getUTCDay() + (isExclusive ? inc : 0) + 7) % 7]) {
      date = addDays(date, inc);
    }
    return date;
  }
};
function computeMajorUnit(dateProfile, dateEnv) {
  const { currentRange } = dateProfile;
  if (dateProfile.currentRangeUnit === "year") {
    if (dateEnv.diffWholeYears(currentRange.start, currentRange.end) > 1) {
      return "year";
    } else {
      return "month";
    }
  } else if (dateProfile.currentRangeUnit === "month") {
    if (dateEnv.diffWholeMonths(currentRange.start, currentRange.end) > 1) {
      return "month";
    }
  } else if (dateProfile.currentRangeUnit === "week") {
    if (diffWholeWeeks(currentRange.start, currentRange.end) > 1) {
      return "week";
    }
  } else if (dateProfile.currentRangeUnit === "day") {
    if (diffWholeDays(currentRange.start, currentRange.end) > 1) {
      return "day";
    }
  }
}
function isMajorUnit(dateMarker, majorUnit, dateEnv) {
  const isStartOfDay = dateMarker.valueOf() === startOfDay(dateMarker).valueOf();
  if (isStartOfDay) {
    if (majorUnit === "year") {
      return !dateEnv.getMonth(dateMarker) && dateEnv.getDay(dateMarker) === 1;
    } else if (majorUnit === "month") {
      return dateEnv.getDay(dateMarker) === 1;
    } else if (majorUnit === "week") {
      return dateMarker.getUTCDay() === dateEnv.weekDow;
    } else if (majorUnit === "day") {
      return true;
    }
  }
  return false;
}

// node_modules/fullcalendar/chunks/44e811e2.js
var Slicer = class {
  constructor() {
    this.sliceBusinessHours = memoize(this._sliceBusinessHours);
    this.sliceDateSelection = memoize(this._sliceDateSpan);
    this.sliceEventStore = memoize(this._sliceEventStore);
    this.sliceEventDrag = memoize(this._sliceInteraction);
    this.sliceEventResize = memoize(this._sliceInteraction);
    this.forceDayIfListItem = false;
  }
  intersectDateSpan(dateSpan, activeRange, ...extraArgs) {
    const activeDateSpanRange = intersectRanges(dateSpan.range, activeRange);
    if (activeDateSpanRange) {
      const slicedDateSpan = __spreadProps(__spreadValues({}, dateSpan), { range: activeDateSpanRange });
      if (activeDateSpanRange.start.valueOf() !== dateSpan.range.start.valueOf()) {
        delete slicedDateSpan.instantStartMs;
      }
      if (activeDateSpanRange.end.valueOf() !== dateSpan.range.end.valueOf()) {
        delete slicedDateSpan.instantEndMs;
      }
      return slicedDateSpan;
    }
    return null;
  }
  sliceDateSpan(dateSpan, ...extraArgs) {
    return this.sliceRange(dateSpan.range, ...extraArgs);
  }
  sliceProps(props, dateProfile, nextDayThreshold, context, ...extraArgs) {
    let { eventUiBases } = props;
    let eventSegs = this.sliceEventStore(props.eventStore, eventUiBases, dateProfile, nextDayThreshold, ...extraArgs);
    return {
      dateSelectionSegs: this.sliceDateSelection(props.dateSelection, dateProfile, nextDayThreshold, eventUiBases, context, ...extraArgs),
      businessHourSegs: this.sliceBusinessHours(props.businessHours, dateProfile, nextDayThreshold, context, ...extraArgs),
      fgEventSegs: eventSegs.fg,
      bgEventSegs: eventSegs.bg,
      eventDrag: this.sliceEventDrag(props.eventDrag, eventUiBases, dateProfile, nextDayThreshold, ...extraArgs),
      eventResize: this.sliceEventResize(props.eventResize, eventUiBases, dateProfile, nextDayThreshold, ...extraArgs),
      eventSelection: props.eventSelection
    };
  }
  sliceNowDate(date, dateProfile, nextDayThreshold, context, ...extraArgs) {
    return this._sliceDateSpan(
      { range: { start: date, end: addMs(date, 1) }, allDay: false },
      // add 1 ms, protect against null range
      dateProfile,
      nextDayThreshold,
      {},
      context,
      ...extraArgs
    );
  }
  _sliceBusinessHours(businessHours, dateProfile, nextDayThreshold, context, ...extraArgs) {
    if (!businessHours) {
      return [];
    }
    return this._sliceEventStore(expandRecurring(businessHours, computeActiveRange(dateProfile, Boolean(nextDayThreshold)), context), {}, dateProfile, nextDayThreshold, ...extraArgs).bg;
  }
  _sliceEventStore(eventStore, eventUiBases, dateProfile, nextDayThreshold, ...extraArgs) {
    if (eventStore) {
      let rangeRes = sliceEventStore(eventStore, eventUiBases, computeActiveRange(dateProfile, Boolean(nextDayThreshold)), nextDayThreshold);
      return {
        bg: this.sliceEventRanges(rangeRes.bg, extraArgs),
        fg: this.sliceEventRanges(rangeRes.fg, extraArgs)
      };
    }
    return { bg: [], fg: [] };
  }
  _sliceInteraction(interaction, eventUiBases, dateProfile, nextDayThreshold, ...extraArgs) {
    if (!interaction) {
      return null;
    }
    let rangeRes = sliceEventStore(interaction.mutatedEvents, eventUiBases, computeActiveRange(dateProfile, Boolean(nextDayThreshold)), nextDayThreshold);
    return {
      segs: this.sliceEventRanges(rangeRes.fg, extraArgs),
      affectedInstances: interaction.affectedEvents.instances,
      isEvent: interaction.isEvent
    };
  }
  _sliceDateSpan(dateSpan, dateProfile, nextDayThreshold, eventUiBases, context, ...extraArgs) {
    if (!dateSpan) {
      return [];
    }
    let activeRange = computeActiveRange(dateProfile, Boolean(nextDayThreshold));
    let slicedDateSpan = this.intersectDateSpan(dateSpan, activeRange, ...extraArgs);
    if (slicedDateSpan) {
      dateSpan = slicedDateSpan;
      let eventRange = fabricateEventRange(dateSpan, eventUiBases, context);
      let segs = this.sliceDateSpan(dateSpan, ...extraArgs);
      for (let seg of segs) {
        seg.eventRange = eventRange;
      }
      return segs;
    }
    return [];
  }
  /*
  "complete" seg means it has component and eventRange
  */
  sliceEventRanges(eventRanges, extraArgs) {
    let segs = [];
    for (let eventRange of eventRanges) {
      segs.push(...this.sliceEventRange(eventRange, extraArgs));
    }
    return segs;
  }
  /*
  "complete" seg means it has component and eventRange
  */
  sliceEventRange(eventRange, extraArgs) {
    let dateRange = eventRange.range;
    if (this.forceDayIfListItem && eventRange.ui.display === "list-item") {
      dateRange = {
        start: dateRange.start,
        end: addDays(dateRange.start, 1)
      };
    }
    let segs = this.sliceRange(dateRange, ...extraArgs);
    for (let seg of segs) {
      seg.eventRange = eventRange;
      seg.isStart = eventRange.isStart && seg.isStart;
      seg.isEnd = eventRange.isEnd && seg.isEnd;
    }
    return segs;
  }
};
function computeActiveRange(dateProfile, isComponentAllDay) {
  let range = dateProfile.activeRange;
  if (isComponentAllDay) {
    return range;
  }
  return {
    start: addMs(range.start, dateProfile.slotMinTime.milliseconds),
    end: addMs(range.end, dateProfile.slotMaxTime.milliseconds - 864e5)
    // 864e5 = ms in a day
  };
}
var DayTableModel = class {
  constructor(daySeries, breakOnWeeks, dateEnv, majorUnit = "", activeRange) {
    this.daySeries = daySeries;
    this.dateEnv = dateEnv;
    this.majorUnit = majorUnit;
    this.activeRange = activeRange;
    let { dates } = daySeries;
    let daysPerRow;
    let firstDay;
    let rowCount;
    if (breakOnWeeks) {
      firstDay = dates[0].getUTCDay();
      for (daysPerRow = 1; daysPerRow < dates.length; daysPerRow += 1) {
        if (dates[daysPerRow].getUTCDay() === firstDay) {
          break;
        }
      }
      rowCount = Math.ceil(dates.length / daysPerRow);
    } else {
      rowCount = 1;
      daysPerRow = dates.length;
    }
    this.rowCount = rowCount;
    this.colCount = daysPerRow;
    this.cellRows = this.buildCells();
    this.headerDates = this.buildHeaderDates();
  }
  buildCells() {
    let rows = [];
    for (let row = 0; row < this.rowCount; row += 1) {
      let cells = [];
      for (let col = 0; col < this.colCount; col += 1) {
        cells.push(this.buildCell(row, col));
      }
      rows.push(cells);
    }
    return rows;
  }
  buildCell(row, col) {
    let date = this.daySeries.dates[row * this.colCount + col];
    return {
      key: date.toISOString(),
      date,
      isMajor: this.cellIsMajor(date),
      isDisabled: this.activeRange === null || this.activeRange !== void 0 && !rangeContainsMarker(this.activeRange, date)
    };
  }
  cellIsMajor(dateMarker) {
    return this.majorUnit ? isMajorUnit(dateMarker, this.majorUnit, this.dateEnv) : false;
  }
  buildHeaderDates() {
    let dates = [];
    for (let col = 0; col < this.colCount; col += 1) {
      dates.push(this.cellRows[0][col].date);
    }
    return dates;
  }
};
function buildDayGridRanges(seriesRange, daysPerRow) {
  let ranges = [];
  if (seriesRange) {
    const { start, end } = seriesRange;
    let index = start;
    while (index < end) {
      let row = Math.floor(index / daysPerRow);
      let nextIndex = Math.min((row + 1) * daysPerRow, end);
      ranges.push({
        row,
        start: index % daysPerRow,
        end: (nextIndex - 1) % daysPerRow + 1,
        isStart: seriesRange.isStart && index === start,
        isEnd: seriesRange.isEnd && nextIndex === end
      });
      index = nextIndex;
    }
  }
  return ranges;
}
var DayTableSlicer = class extends Slicer {
  constructor() {
    super(...arguments);
    this.forceDayIfListItem = true;
  }
  sliceRange(dateRange, dayTableModel) {
    return buildDayGridRanges(dayTableModel.daySeries.sliceRange(dateRange), dayTableModel.colCount);
  }
};
var DaySeriesSlicer = class extends Slicer {
  constructor() {
    super(...arguments);
    this.forceDayIfListItem = true;
  }
  sliceRange(dateRange, daySeries) {
    return buildDayGridRanges(daySeries.sliceRange(dateRange), daySeries.cnt);
  }
};
var firstSunday = /* @__PURE__ */ new Date(2592e5);
function buildDateRowConfigs(dates, datesRepDistinctDays, dateProfile, todayRange, dayHeaderFormat, context) {
  const rowConfig = buildDateRowConfig(dates, datesRepDistinctDays, dateProfile, todayRange, dayHeaderFormat, context);
  const majorUnit = computeMajorUnit(dateProfile, context.dateEnv);
  if (datesRepDistinctDays && majorUnit !== "day") {
    for (const dataConfig of rowConfig.dataConfigs) {
      if (isMajorUnit(dataConfig.dateMarker, majorUnit, context.dateEnv)) {
        dataConfig.renderProps.isMajor = true;
      }
    }
  }
  return [rowConfig];
}
function buildDateRowConfig(dateMarkers, datesRepDistinctDays, dateProfile, todayRange, dayHeaderFormat, context, colSpan, isMajorMod, totalDateCnt) {
  return {
    isDateRow: true,
    renderConfig: buildDateRenderConfig(dayHeaderFormat, datesRepDistinctDays, context),
    dataConfigs: buildDateDataConfigs(dateMarkers, datesRepDistinctDays, dateProfile, todayRange, dayHeaderFormat, context, colSpan, void 0, void 0, void 0, void 0, isMajorMod, totalDateCnt)
  };
}
function buildDateRenderConfig(dayHeaderFormat, datesRepDistinctDays, context) {
  const { options } = context;
  return {
    generatorName: "dayHeaderContent",
    customGenerator: options.dayHeaderContent,
    classNameGenerator: options.dayHeaderClass,
    innerClassNameGenerator: options.dayHeaderInnerClass,
    didMount: options.dayHeaderDidMount,
    willUnmount: options.dayHeaderWillUnmount,
    align: options.dayHeaderAlign,
    sticky: options._dayHeaderSticky,
    dayHeaderFormat,
    datesRepDistinctDays
  };
}
var dowDates = [];
for (let dow = 0; dow < 7; dow++) {
  dowDates.push(addDays(/* @__PURE__ */ new Date(2592e5), dow));
}
function buildDateDataConfigs(dateMarkers, datesRepDistinctDays, dateProfile, todayRange, dayHeaderFormat, context, colSpan = 1, keyPrefix = "", extraRenderProps = {}, extraAttrs = {}, className = "", isMajorMod, totalDateCnt = dateMarkers.length) {
  const { dateEnv, viewApi, options } = context;
  return datesRepDistinctDays ? dateMarkers.map((dateMarker, i) => {
    const dateMeta = getDateMeta(dateMarker, dateEnv, dateProfile, todayRange);
    const isMajor = isMajorMod != null && !(i % isMajorMod);
    const hasNavLink = options.navLinks && !dateMeta.isDisabled && totalDateCnt > 1;
    const renderProps = __spreadProps(__spreadValues(__spreadValues({}, dateMeta), extraRenderProps), {
      isMajor,
      isSticky: false,
      // HACK. gets overridden
      inPopover: false,
      hasNavLink,
      view: viewApi
    });
    const fullDateStr = buildDateStr(context, dateMarker);
    return {
      key: keyPrefix + dateMarker.toUTCString(),
      dateMarker,
      renderProps,
      attrs: __spreadValues(__spreadProps(__spreadValues({
        "aria-label": fullDateStr
      }, dateMeta.isToday ? { "aria-current": "date" } : {}), {
        // TODO: assign undefined for nonexistent
        "data-date": formatDayString(dateMarker)
      }), extraAttrs),
      // for navlink
      innerAttrs: hasNavLink ? buildNavLinkAttrs(context, dateMarker, void 0, fullDateStr) : { "aria-hidden": true },
      // label already on cell
      colSpan,
      hasNavLink,
      className
    };
  }) : dateMarkers.map((dateMarker, i) => {
    const dow = dateMarker.getUTCDay();
    const normDate = addDays(firstSunday, dow);
    const dateMeta = {
      date: dateEnv.toDate(dateMarker),
      dow,
      isDisabled: false,
      isFuture: false,
      isPast: false,
      isToday: false,
      isOther: false
    };
    const isMajor = isMajorMod != null && !(i % isMajorMod);
    const renderProps = __spreadValues(__spreadProps(__spreadValues({}, dateMeta), {
      date: dowDates[dow],
      isMajor,
      isSticky: false,
      // HACK. gets overridden
      inPopover: false,
      hasNavLink: false,
      view: viewApi
    }), extraRenderProps);
    const fullWeekDayStr = joinDateTimeFormatParts(dateEnv.formatToParts(normDate, WEEKDAY_ONLY_FORMAT));
    return {
      key: keyPrefix + String(dow),
      dateMarker,
      renderProps,
      attrs: __spreadValues({
        "aria-label": fullWeekDayStr
      }, extraAttrs),
      // NOT a navlink
      innerAttrs: {
        "aria-hidden": true
        // label already on cell
      },
      colSpan,
      className
    };
  });
}
var RefMap = class {
  constructor(masterCallback, ignoreDeletes = false) {
    this.masterCallback = masterCallback;
    this.ignoreDeletes = ignoreDeletes;
    this.rev = "";
    this.current = /* @__PURE__ */ new Map();
    this.callbacks = /* @__PURE__ */ new Map();
    this.handleValue = (val, key) => {
      let { current, callbacks } = this;
      let priorExists = current.has(key);
      let priorVal = priorExists ? current.get(key) : null;
      let anyChange = false;
      if (val === null) {
        if (priorExists && !this.ignoreDeletes) {
          current.delete(key);
          callbacks.delete(key);
          anyChange = true;
        }
      } else {
        anyChange = priorVal !== val;
        current.set(key, val);
      }
      if (anyChange) {
        this.rev = guid();
        if (this.masterCallback) {
          this.masterCallback(val, key, priorVal);
        }
      }
    };
  }
  createRef(key) {
    let refCallback = this.callbacks.get(key);
    if (!refCallback) {
      refCallback = (val) => {
        this.handleValue(val, key);
      };
      this.callbacks.set(key, refCallback);
    }
    return refCallback;
  }
};
var Ruler = class extends BaseComponent {
  constructor() {
    super(...arguments);
    this.elRef = M();
  }
  render() {
    return u("div", { ref: this.elRef });
  }
  componentDidMount() {
    this._isUnmounting = false;
    const { props } = this;
    const el = this.elRef.current;
    this.disconnectWidth = watchWidth(el, (width) => {
      if (this._isUnmounting)
        return;
      setRef(props.widthRef, width);
    });
  }
  componentWillUnmount() {
    this._isUnmounting = true;
    this.disconnectWidth();
    const { props } = this;
    if (props.widthRef) {
      setRef(props.widthRef, null);
    }
  }
};
function getDayGridSegKey(seg) {
  return `${seg.eventRange.instance.instanceId}:${seg.start}`;
}
function splitSegsByRow(segs, rowCount) {
  const byRow = [];
  for (let row = 0; row < rowCount; row++) {
    byRow[row] = [];
  }
  for (const seg of segs) {
    byRow[seg.row].push(seg);
  }
  return byRow;
}
function splitInteractionByRow(ui, rowCount) {
  const byRow = [];
  if (!ui) {
    for (let row = 0; row < rowCount; row++) {
      byRow[row] = null;
    }
  } else {
    for (let row = 0; row < rowCount; row++) {
      byRow[row] = {
        affectedInstances: ui.affectedInstances,
        isEvent: ui.isEvent,
        segs: []
      };
    }
    for (const seg of ui.segs) {
      byRow[seg.row].segs.push(seg);
    }
  }
  return byRow;
}
var BgEvent = class extends BaseComponent {
  constructor() {
    super(...arguments);
    this.buildPublicEvent = memoize((context, eventDef, eventInstance) => new EventImpl(context, eventDef, eventInstance));
    this.handleEl = (el) => {
      this.el = el;
      if (el) {
        setElEventRange(el, this.props.eventRange);
      }
    };
  }
  render() {
    const { props, context } = this;
    const { eventRange } = props;
    const { options } = context;
    const eventUi = eventRange.ui;
    const eventApi = this.buildPublicEvent(context, eventRange.def, eventRange.instance);
    const subcontentRenderProps = {
      event: eventApi,
      isNarrow: props.isNarrow || false,
      isShort: props.isShort || false
    };
    const renderProps = {
      event: eventApi,
      view: context.viewApi,
      timeText: "",
      // never display time
      color: eventUi.color || options.backgroundEventColor,
      contrastColor: eventUi.contrastColor,
      isDraggable: false,
      isStartResizable: false,
      isEndResizable: false,
      isMirror: false,
      isStart: props.isStart,
      isEnd: props.isEnd,
      isFirst: false,
      isLast: false,
      isPast: props.isPast,
      isFuture: props.isFuture,
      isToday: props.isToday,
      isSelected: false,
      isDragging: false,
      isResizing: false,
      isInteractive: false,
      level: 0,
      isNarrow: props.isNarrow || false,
      isShort: props.isShort || false,
      timeClass: "",
      // never display time
      titleClass: generateClassName(options.backgroundEventTitleClass, subcontentRenderProps),
      options: { eventOverlap: Boolean(options.eventOverlap) }
    };
    const outerClassName = joinClassNames(eventUi.className, classNames.fill, classNames.internalEvent, classNames.internalBgEvent, props.isVertical ? classNames.flexCol : classNames.flexRow);
    const innerClassName = joinClassNames(generateClassName(options.backgroundEventInnerClass, renderProps), classNames.liquid);
    return u(ContentContainer, { tag: "div", className: outerClassName, style: {
      "--fc-event-color": renderProps.color,
      "--fc-event-contrast-color": renderProps.contrastColor
    }, defaultGenerator: renderInnerContent, elRef: this.handleEl, renderProps, generatorName: "backgroundEventContent", customGenerator: options.backgroundEventContent, classNameGenerator: options.backgroundEventClass, didMount: options.backgroundEventDidMount, willUnmount: options.backgroundEventWillUnmount, children: (InnerContent) => u(InnerContent, { tag: "div", className: innerClassName }) });
  }
  componentDidUpdate(prevProps) {
    if (this.el && this.props.eventRange !== prevProps.eventRange) {
      setElEventRange(this.el, this.props.eventRange);
    }
  }
};
function renderInnerContent(props) {
  let { title } = props.event;
  return title && u("div", { className: props.titleClass, children: props.event.title });
}
function renderFill(fillType, options) {
  return u("div", { className: joinClassNames(fillType === "non-business" ? options.nonBusinessHoursClass : fillType === "highlight" ? options.highlightClass : void 0, classNames.fill) });
}
var COL_BORDER_WIDTH = 1;
var ROW_BORDER_WIDTH = 1;
var SPACE_FROM_VIEWPORT = 10;
var MorePopover = class extends DateComponent {
  constructor() {
    super(...arguments);
    this.getDateMeta = memoize(getDateMeta);
    this.closeRef = M();
    this.focusStartRef = M();
    this.focusEndRef = M();
    this.handleRootEl = (rootEl) => {
      this.rootEl = rootEl;
      if (rootEl) {
        this.context.registerInteractiveComponent(this, {
          el: rootEl,
          useEventCenter: false
        });
      } else {
        this.context.unregisterInteractiveComponent(this);
      }
    };
    this.handleDocumentMouseDown = (ev) => {
      const target = getEventTargetViaRoot(ev);
      if (!this.rootEl.contains(target)) {
        this.handleClose();
      }
    };
    this.handleDocumentKeyDown = (ev) => {
      if (ev.key === "Escape") {
        this.handleClose();
      }
    };
    this.handleClose = () => {
      let { onClose } = this.props;
      if (onClose) {
        onClose();
      }
    };
  }
  render() {
    let { props, context } = this;
    let { options, dateEnv, viewApi } = context;
    let { startDate, todayRange, dateProfile } = props;
    let dateMeta = this.getDateMeta(startDate, dateEnv, dateProfile, todayRange);
    let textParts = dateEnv.formatToParts(startDate, options.popoverFormat);
    let text = joinDateTimeFormatParts(textParts);
    const dayHeaderRenderProps = __spreadProps(__spreadValues({}, dateMeta), {
      isMajor: false,
      isNarrow: false,
      isSticky: false,
      inPopover: true,
      level: 0,
      hasNavLink: false,
      text,
      textParts,
      get weekdayText() {
        return findWeekdayText(textParts);
      },
      get dayNumberText() {
        return findDayNumberText(textParts);
      },
      view: viewApi
      // TODO: should know about the resource!
    });
    const dayCellRenderProps = __spreadProps(__spreadValues({}, dateMeta), {
      isMajor: false,
      isNarrow: false,
      inPopover: true,
      hasNavLink: false,
      get weekdayText() {
        return findWeekdayText(textParts);
      },
      get dayNumberText() {
        return findDayNumberText(textParts);
      },
      get monthText() {
        return findMonthText(textParts);
      },
      view: viewApi,
      text: "",
      textParts: [],
      options: { businessHours: Boolean(options.businessHours) }
    });
    const fullDateStr = formatDayString(startDate);
    const { dayHeaderAlign } = options;
    const align = typeof dayHeaderAlign === "function" ? dayHeaderAlign({ level: 0, inPopover: true, isNarrow: false }) : dayHeaderAlign;
    const isRtl = computeElIsRtl(props.alignEl);
    return $(u("div", {
      "data-date": fullDateStr,
      id: props.id,
      role: "dialog",
      "aria-labelledby": props.titleId,
      className: joinClassNames(options.popoverClass, classNames.flexCol, classNames.popoverZ, classNames.abs, classNames.borderBoxRoot, classNames.internalPopover),
      style: {
        // positioning is mutated directly in updateSize, HOWEVER, we don't want popover to start
        // low on screen because might cause unnecessary scrollbars
        top: 0,
        left: 0
      },
      // HACK because of portal
      dir: isRtl ? "rtl" : void 0,
      "data-color-scheme": options.colorScheme || void 0,
      ref: this.handleRootEl,
      children: [u("div", { tabIndex: 0, style: { outline: "none" }, ref: this.focusStartRef }), u("div", { className: joinClassNames(generateClassName(options.dayHeaderClass, dayHeaderRenderProps), classNames.flexCol, classNames.borderlessX, classNames.borderlessTop, align === "center" ? classNames.alignCenter : align === "end" ? classNames.alignEnd : classNames.alignStart), children: [u("div", { children: u(ContentContainer, { tag: "div", attrs: {
        id: props.titleId
        // NOTE: more-popover never has nav-links
      }, generatorName: "dayHeaderContent", renderProps: dayHeaderRenderProps, customGenerator: options.dayHeaderContent, defaultGenerator: renderText2, classNameGenerator: options.dayHeaderInnerClass, didMount: options.dayHeaderDidMount, willUnmount: options.dayHeaderWillUnmount }) }), u(ContentContainer, { tag: "button", attrs: __spreadValues({
        "aria-label": options.closeHint
      }, createAriaClickAttrs(this.handleClose)), elRef: this.closeRef, className: joinClassNames(options.popoverCloseClass, classNames.flexRow, classNames.cursorPointer), renderProps: {}, customGenerator: options.popoverCloseContent, generatorName: "popoverCloseContent" })] }), u("div", { className: joinClassNames(generateClassName(options.dayCellClass, dayCellRenderProps), classNames.flexCol, classNames.borderless), children: u("div", { className: generateClassName(options.dayCellInnerClass, dayCellRenderProps), children: props.children }) }), u("div", { tabIndex: 0, style: { outline: "none" }, ref: this.focusEndRef })]
    }), getAppendableRoot(props.alignEl));
  }
  queryHit(isRtl, positionLeft, positionTop, elWidth, elHeight) {
    let { rootEl, props } = this;
    if (positionLeft >= 0 && positionLeft < elWidth && positionTop >= 0 && positionTop < elHeight) {
      return {
        dateProfile: props.dateProfile,
        dateSpan: __spreadValues({
          allDay: !props.forceTimed,
          range: {
            start: props.startDate,
            end: props.endDate
          }
        }, props.dateSpanProps),
        getDayEl: () => rootEl,
        rect: {
          left: 0,
          top: 0,
          right: elWidth,
          bottom: elHeight
        },
        layer: 1
        // important when comparing with hits from other components
      };
    }
    return null;
  }
  componentDidMount() {
    document.addEventListener("mousedown", this.handleDocumentMouseDown);
    document.addEventListener("keydown", this.handleDocumentKeyDown);
    this.focusStartRef.current.addEventListener("focus", this.handleClose);
    this.focusEndRef.current.addEventListener("focus", this.handleClose);
    this.closeRef.current.focus({ preventScroll: true });
    this.updateSize();
  }
  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleDocumentMouseDown);
    document.removeEventListener("keydown", this.handleDocumentKeyDown);
    this.focusStartRef.current.removeEventListener("focus", this.handleClose);
    this.focusEndRef.current.removeEventListener("focus", this.handleClose);
  }
  updateSize() {
    let { alignEl, alignParentTop } = this.props;
    let { rootEl: popoverEl } = this;
    const isRtl = computeElIsRtl(alignEl);
    const alignmentRect = computeClippedClientRect(alignEl);
    if (alignmentRect) {
      let popoverDims = popoverEl.getBoundingClientRect();
      let popoverVPTop = alignParentTop ? alignEl.closest(alignParentTop).getBoundingClientRect().top - ROW_BORDER_WIDTH : alignmentRect.top;
      let popoverVPLeft = isRtl ? alignmentRect.right - popoverDims.width : alignmentRect.left;
      popoverVPTop = Math.max(popoverVPTop, SPACE_FROM_VIEWPORT);
      popoverVPLeft = Math.min(popoverVPLeft, document.documentElement.clientWidth - SPACE_FROM_VIEWPORT - popoverDims.width);
      popoverVPLeft = Math.max(popoverVPLeft, SPACE_FROM_VIEWPORT);
      const { offsetParent } = popoverEl;
      let top;
      let left;
      if (!offsetParent || offsetParent === document.body) {
        top = popoverVPTop + window.scrollY;
        left = popoverVPLeft + window.scrollX;
      } else {
        const offsetParentRect = offsetParent.getBoundingClientRect();
        top = popoverVPTop - offsetParentRect.top + offsetParent.scrollTop;
        left = popoverVPLeft - offsetParentRect.left + offsetParent.scrollLeft;
      }
      applyStyle(popoverEl, { top, left });
    }
  }
};
function renderText2(renderProps) {
  return renderProps.text;
}
function computeEarliestStart(segs) {
  return segs.reduce(pickEarliestStart).eventRange.range.start;
}
function computeLatestEnd(segs) {
  return segs.reduce(pickLatestEnd).eventRange.range.end;
}
function pickEarliestStart(r0, r1) {
  return r0.eventRange.range.start < r1.eventRange.range.start ? r0 : r1;
}
function pickLatestEnd(r0, r1) {
  return r0.eventRange.range.end > r1.eventRange.range.end ? r0 : r1;
}
var MoreLinkTrigger = class extends BaseComponent {
  render() {
    const { props, context } = this;
    const { options } = context;
    const renderProps = buildMoreLinkRenderProps(props.num, props.isNarrow, props.isMicro, props.display, context);
    return u(ContentContainer, { tag: "div", elRef: props.elRef, className: joinClassNames(generateClassName(props.display === "row" ? options.rowMoreLinkClass : options.columnMoreLinkClass, renderProps), props.className, props.display === "row" ? classNames.flexRow : classNames.flexCol, classNames.internalMoreLink, classNames.cursorPointer), style: props.style, attrs: props.attrs, renderProps, generatorName: "moreLinkContent", customGenerator: options.moreLinkContent, defaultGenerator: renderMoreLinkText, classNameGenerator: options.moreLinkClass, didMount: props.didMount, willUnmount: props.willUnmount, children: (InnerContent) => u(InnerContent, { tag: "div", className: joinClassNames(generateClassName(options.moreLinkInnerClass, renderProps), generateClassName(props.display === "row" ? options.rowMoreLinkInnerClass : options.columnMoreLinkInnerClass, renderProps), props.display === "row" ? classNames.stickyS : classNames.stickyT) }) });
  }
};
var MoreLinkContainer = class extends BaseComponent {
  constructor() {
    super(...arguments);
    this.state = {
      isPopoverOpen: false
    };
    this.handleLinkEl = (linkEl) => {
      this.linkEl = linkEl;
      if (this.props.elRef) {
        setRef(this.props.elRef, linkEl);
      }
    };
    this.handleClick = (ev) => {
      let { props, context } = this;
      let { dateEnv, options } = context;
      let { moreLinkClick } = options;
      let date = computeRange(props).start;
      function buildPublicSeg(seg) {
        let { def, instance, range } = seg.eventRange;
        const start = buildRangeEdgeOutput(range.start, range.instantStartMs, dateEnv);
        const end = buildRangeEdgeOutput(range.end, range.instantEndMs, dateEnv);
        return {
          event: new EventImpl(context, def, instance),
          start: start.date,
          end: end.date,
          isStart: seg.isStart,
          isEnd: seg.isEnd
        };
      }
      if (typeof moreLinkClick === "function") {
        moreLinkClick = moreLinkClick({
          date: dateEnv.toDate(date),
          allDay: Boolean(props.allDayDate),
          allSegs: props.segs.map(buildPublicSeg),
          hiddenSegs: props.hiddenSegs.map(buildPublicSeg),
          jsEvent: ev,
          view: context.viewApi
        });
      }
      if (!moreLinkClick || moreLinkClick === "popover") {
        this.setState({ isPopoverOpen: true });
      } else if (typeof moreLinkClick === "string") {
        context.calendarApi.zoomTo(date, moreLinkClick);
      }
    };
    this.handlePopoverClose = () => {
      if (this.linkEl) {
        this.linkEl.focus();
      }
      this.setState({ isPopoverOpen: false });
    };
  }
  render() {
    const { props, state, context } = this;
    const { options, baseId } = context;
    const moreCnt = props.hiddenSegs.length;
    const range = computeRange(props);
    const popoverId = baseId + "popover-" + range.start.toISOString();
    const renderProps = buildMoreLinkRenderProps(moreCnt, props.isNarrow, props.isMicro, props.display, context);
    const hint = formatWithOrdinals(options.moreLinkHint, [moreCnt], renderProps.longText);
    return u(S, { children: [Boolean(moreCnt) && u(MoreLinkTrigger, { num: moreCnt, display: props.display, isNarrow: props.isNarrow, isMicro: props.isMicro, elRef: this.handleLinkEl, className: props.className, style: props.style, attrs: __spreadProps(__spreadValues(__spreadValues({}, props.attrs), createAriaClickAttrs(this.handleClick)), {
      title: hint,
      "role": "button",
      "aria-haspopup": "dialog",
      "aria-expanded": state.isPopoverOpen,
      "aria-controls": state.isPopoverOpen ? popoverId : void 0
    }), didMount: options.moreLinkDidMount, willUnmount: options.moreLinkWillUnmount }), state.isPopoverOpen && u(MorePopover, { id: popoverId, titleId: popoverId + "-title", startDate: range.start, endDate: range.end, dateProfile: props.dateProfile, todayRange: props.todayRange, dateSpanProps: props.dateSpanProps, alignEl: props.alignElRef ? props.alignElRef.current : this.linkEl, alignParentTop: props.alignParentTop, forceTimed: props.forceTimed, onClose: this.handlePopoverClose, children: props.popoverContent() })] });
  }
};
function renderMoreLinkText(props) {
  return props.text;
}
function buildMoreLinkRenderProps(num, isNarrow, isMicro, display, context) {
  const { viewApi, options, calendarApi } = context;
  const numericText = `+${num}`;
  const longText = typeof options.moreLinkText === "function" ? options.moreLinkText.call(calendarApi, num) : `${numericText} ${options.moreLinkText}`;
  return {
    num,
    numericText,
    longText,
    text: isMicro || display === "column" ? numericText : longText,
    isNarrow,
    view: viewApi
  };
}
function computeRange(props) {
  if (props.allDayDate) {
    return {
      start: props.allDayDate,
      end: addDays(props.allDayDate, 1)
    };
  }
  return {
    start: computeEarliestStart(props.hiddenSegs),
    end: computeLatestEnd(props.hiddenSegs)
  };
}
var DEFAULT_TABLE_EVENT_TIME_FORMAT = createFormatter({
  hour: "numeric",
  minute: "2-digit",
  omitZeroMinute: true,
  meridiem: "narrow"
});
function hasListItemDisplay(range, eventRange) {
  let { display } = eventRange.ui;
  return display === "list-item" || display === "auto" && !eventRange.def.allDay && range.end - range.start === 1 && // single-day
  range.isStart && // "
  range.isEnd;
}
var DAY_GRID_NON_BUSINESS_Z_CLASS = classNames.z1;
var DAY_GRID_BG_EVENT_Z_CLASS = classNames.z2;
var DAY_GRID_HIGHLIGHT_Z_CLASS = classNames.z3;
var DAY_GRID_CELL_CONTENT_Z_CLASS = classNames.z4;
var DAY_GRID_EVENT_Z_CLASS = classNames.z5;
var DAY_GRID_INTERACTION_Z_CLASS = classNames.z1000;
var DayGridMoreLink = class extends BaseComponent {
  render() {
    let { props } = this;
    return u(MoreLinkContainer, { display: "row", className: joinClassNames(props.className, DAY_GRID_CELL_CONTENT_Z_CLASS), isNarrow: props.isNarrow, isMicro: props.isMicro, dateProfile: props.dateProfile, todayRange: props.todayRange, allDayDate: props.allDayDate, segs: props.segs, hiddenSegs: props.hiddenSegs, alignElRef: props.alignElRef, alignParentTop: props.alignParentTop, dateSpanProps: props.dateSpanProps, popoverContent: () => u(S, { children: props.segs.map((seg) => {
      let { eventRange } = seg;
      let { instanceId } = eventRange.instance;
      let isDragging = Boolean(props.eventDrag && props.eventDrag.affectedInstances[instanceId]);
      let isResizing = Boolean(props.eventResize && props.eventResize.affectedInstances[instanceId]);
      let isInvisible = isDragging || isResizing;
      return u("div", { style: {
        visibility: isInvisible ? "hidden" : void 0
      }, children: u(StandardEvent, __spreadValues({ display: hasListItemDisplay(seg, eventRange) ? "list-item" : "row", eventRange, isStart: seg.isStart, isEnd: seg.isEnd, isDragging, isResizing, isMirror: false, isSelected: instanceId === props.eventSelection, defaultTimeFormat: DEFAULT_TABLE_EVENT_TIME_FORMAT, defaultDisplayEventEnd: false }, getEventRangeMeta(eventRange, props.todayRange))) }, instanceId);
    }) }) });
  }
};
var DayGridCell = class extends DateComponent {
  constructor() {
    super(...arguments);
    this.getDateMeta = memoize(getDayGridCellDateMeta);
    this.refineRenderProps = memoizeObjArg(refineRenderProps);
    this.rootElRef = M();
    this.handleBodyEl = (bodyEl) => {
      if (this.disconnectBodyHeight) {
        this.disconnectBodyHeight();
        this.disconnectBodyHeight = void 0;
        this.headerHeight = void 0;
        setRef(this.props.headerHeightRef, null);
        setRef(this.props.mainHeightRef, null);
      }
      if (bodyEl && (this.props.headerHeightRef || this.props.mainHeightRef)) {
        this.disconnectBodyHeight = watchSize(bodyEl, (_bodyWidth, bodyHeight) => {
          if (this._isUnmounting) {
            return;
          }
          const { props } = this;
          const rootEl = this.rootElRef.current;
          if (!rootEl) {
            return;
          }
          const mainRect = bodyEl.getBoundingClientRect();
          const rootRect = rootEl.getBoundingClientRect();
          const headerHeight = mainRect.top - rootRect.top;
          if (!isDimsEqual(this.headerHeight, headerHeight)) {
            this.headerHeight = headerHeight;
            setRef(props.headerHeightRef, headerHeight);
          }
          setRef(props.mainHeightRef, bodyHeight);
        });
      }
    };
  }
  render() {
    let { props, context } = this;
    let { options, dateEnv } = context;
    const { tableMode } = props;
    const isMonthStart = props.showDayNumber && shouldDisplayMonthStart(props.date, props.dateProfile.currentRange, dateEnv);
    const dateMeta = this.getDateMeta(props.date, dateEnv, props.dateProfile, props.todayRange, props.isDisabled);
    const baseClassName = joinClassNames(classNames.borderlessTop, classNames.borderlessEnd, !props.borderStart && classNames.borderlessStart, !(tableMode && props.borderBottom) && classNames.borderlessBottom, !tableMode && props.width == null && classNames.liquid, !tableMode && classNames.flexCol, classNames.rel, classNames.noMargin, classNames.noPadding);
    const CellTag = tableMode ? "td" : "div";
    const cellStyle = tableMode ? void 0 : { width: props.width };
    const hasNavLink = options.navLinks;
    const renderProps = this.refineRenderProps({
      date: props.date,
      isMajor: props.isMajor,
      isNarrow: props.isNarrow,
      dateMeta,
      hasLabel: props.showDayNumber,
      hasMonthLabel: isMonthStart,
      hasNavLink,
      renderProps: props.renderProps,
      viewApi: context.viewApi,
      dateEnv: context.dateEnv,
      monthStartFormat: options.monthStartFormat,
      dayCellFormat: options.dayCellFormat,
      businessHours: Boolean(options.businessHours)
    });
    if (dateMeta.isDisabled) {
      return u(CellTag, { role: "gridcell", "aria-disabled": true, className: joinClassNames(generateClassName(options.dayCellClass, renderProps), props.className, baseClassName), style: cellStyle, children: props.fills });
    }
    const fullDateStr = buildDateStr(context, props.date);
    return u(ContentContainer, {
      tag: CellTag,
      elRef: this.rootElRef,
      className: joinClassNames(props.className, baseClassName),
      attrs: __spreadProps(__spreadValues(__spreadProps(__spreadValues({}, props.attrs), {
        role: "gridcell",
        "aria-label": fullDateStr
      }), renderProps.isToday ? { "aria-current": "date" } : {}), {
        "data-date": formatDayString(props.date)
      }),
      style: cellStyle,
      renderProps,
      generatorName: "dayCellTopContent",
      customGenerator: options.dayCellTopContent,
      defaultGenerator: renderTopInner,
      classNameGenerator: options.dayCellClass,
      didMount: options.dayCellDidMount,
      willUnmount: options.dayCellWillUnmount,
      children: (InnerContent) => u(S, { children: [props.fills, u("div", { className: joinClassNames(
        classNames.rel,
        // puts it above bg-fills, which are positioned on TOP of this component :|
        DAY_GRID_CELL_CONTENT_Z_CLASS,
        generateClassName(options.dayCellTopClass, renderProps)
      ), children: props.showDayNumber && u(
        InnerContent,
        {
          tag: "div",
          attrs: hasNavLink ? buildNavLinkAttrs(context, props.date, void 0, fullDateStr) : { "aria-hidden": true },
          className: generateClassName(options.dayCellTopInnerClass, renderProps)
        }
      ) }), u("div", { className: joinClassNames(!tableMode && classNames.flexCol, !tableMode && (props.fgLiquidHeight ? classNames.liquid : classNames.grow), tableMode && classNames.printCellContentMinHeight), ref: this.handleBodyEl, children: [u("div", { className: joinClassNames(
        classNames.rel,
        // origin for this cell's foreground event wrappers
        generateClassName(options.dayCellInnerClass, renderProps)
      ), style: { minHeight: props.fgHeight }, children: props.fg }), u(DayGridMoreLink, { className: classNames.rel, allDayDate: props.date, segs: props.segs, hiddenSegs: props.hiddenSegs, alignElRef: this.rootElRef, alignParentTop: props.showDayNumber ? "[role=row]" : `.${classNames.internalView}`, dateSpanProps: props.dateSpanProps, dateProfile: props.dateProfile, eventSelection: props.eventSelection, eventDrag: props.eventDrag, eventResize: props.eventResize, todayRange: props.todayRange, isNarrow: props.isNarrow, isMicro: props.isMicro })] }), u("div", { className: joinClassNames(
        classNames.rel,
        // puts it above bg-fills
        DAY_GRID_CELL_CONTENT_Z_CLASS,
        generateClassName(options.dayCellBottomClass, renderProps)
      ) })] })
    });
  }
  componentDidMount() {
    this._isUnmounting = false;
  }
  componentWillUnmount() {
    this._isUnmounting = true;
  }
};
function getDayGridCellDateMeta(date, dateEnv, dateProfile, todayRange, isDisabled) {
  return __spreadProps(__spreadValues({}, getDateMeta(date, dateEnv, dateProfile, todayRange)), {
    isDisabled
  });
}
function renderTopInner(props) {
  return props.text || u(S, { children: " " });
}
function shouldDisplayMonthStart(date, currentRange, dateEnv) {
  const { start: currentStart, end: currentEnd } = currentRange;
  const currentEndIncl = addMs(currentEnd, -1);
  const currentFirstYear = dateEnv.getYear(currentStart);
  const currentFirstMonth = dateEnv.getMonth(currentStart);
  const currentLastYear = dateEnv.getYear(currentEndIncl);
  const currentLastMonth = dateEnv.getMonth(currentEndIncl);
  return !(currentFirstYear === currentLastYear && currentFirstMonth === currentLastMonth) && Boolean(
    // first date in current view?
    date.valueOf() === currentStart.valueOf() || // a month-start that's within the current range?
    dateEnv.getDay(date) === 1 && date.valueOf() < currentEnd.valueOf()
  );
}
function refineRenderProps(raw) {
  let { date, dateEnv, hasLabel, hasMonthLabel, hasNavLink, businessHours } = raw;
  let textParts = [];
  let text = "";
  if (hasLabel) {
    textParts = dateEnv.formatToParts(date, hasMonthLabel ? raw.monthStartFormat : raw.dayCellFormat);
    text = joinDateTimeFormatParts(textParts);
  }
  return __spreadProps(__spreadValues(__spreadValues({}, raw.dateMeta), raw.renderProps), {
    text,
    textParts,
    isMajor: raw.isMajor,
    isNarrow: raw.isNarrow,
    inPopover: false,
    hasNavLink,
    get weekdayText() {
      return findWeekdayText(textParts);
    },
    get dayNumberText() {
      return findDayNumberText(textParts);
    },
    get monthText() {
      return findMonthText(textParts);
    },
    options: { businessHours },
    view: raw.viewApi
  });
}
var MeasuredHeightHarness = class extends C {
  constructor() {
    super(...arguments);
    this.rootElRef = M();
    this._isUnmounting = false;
  }
  render() {
    const { props } = this;
    return u("div", { className: props.className, style: props.style, ref: this.rootElRef, children: props.children });
  }
  componentDidMount() {
    this._isUnmounting = false;
    const rootEl = this.rootElRef.current;
    this.disconnectHeight = watchHeight(rootEl, (height) => {
      if (this._isUnmounting)
        return;
      this.height = height;
      setRef(this.props.heightRef, height);
    });
  }
  /*
  A wrapper can gain or lose measurement responsibility without remounting,
  because a row switches placement routes (screen<->print, for example) while
  reusing the same keyed nodes. The size observer only fires on an actual size
  change, so hand the newly attached ref what was already observed, and release
  the detached one.
  */
  componentDidUpdate(prevProps) {
    const { heightRef } = this.props;
    if (prevProps.heightRef !== heightRef) {
      setRef(prevProps.heightRef, null);
      if (this.height != null) {
        setRef(heightRef, this.height);
      }
    }
  }
  componentWillUnmount() {
    this._isUnmounting = true;
    this.disconnectHeight?.();
    setRef(this.props.heightRef, null);
  }
};
function doSpansIntersect(a, b) {
  return a.start < b.end && b.start < a.end;
}
function intersectSpans(a, b) {
  const start = Math.max(a.start, b.start);
  const end = Math.min(a.end, b.end);
  return start < end ? { start, end } : null;
}
function getSpanLength(span) {
  return span.end - span.start;
}
function findIntersections(entries, span) {
  let index = findLowerBoundByStart(entries, span.start);
  if (index > 0) {
    index--;
  }
  const matches = [];
  for (; index < entries.length; index++) {
    const entry = entries[index];
    if (entry.start >= span.end) {
      break;
    }
    if (doSpansIntersect(entry, span)) {
      matches.push(entry);
    }
  }
  return matches;
}
function subtractCoveredSpans(span, covered) {
  const result = [];
  let cursor = span.start;
  for (const item of covered) {
    if (item.end <= cursor) {
      continue;
    }
    if (item.start >= span.end) {
      break;
    }
    if (item.start > cursor) {
      result.push({ start: cursor, end: Math.min(item.start, span.end) });
    }
    cursor = Math.max(cursor, item.end);
    if (cursor >= span.end) {
      break;
    }
  }
  if (cursor < span.end) {
    result.push({ start: cursor, end: span.end });
  }
  return result;
}
function addToUnion(spans, addition) {
  const result = [];
  let pending = __spreadValues({}, addition);
  let inserted = false;
  for (const span of spans) {
    if (span.end <= pending.start) {
      result.push(span);
    } else if (pending.end <= span.start) {
      if (!inserted) {
        result.push(pending);
        inserted = true;
      }
      result.push(span);
    } else {
      pending = {
        start: Math.min(pending.start, span.start),
        end: Math.max(pending.end, span.end)
      };
    }
  }
  if (!inserted) {
    result.push(pending);
  }
  spans.splice(0, spans.length, ...result);
}
function insertLaterally(entries, entry) {
  entries.splice(findLowerBoundByStart(entries, entry.start), 0, entry);
}
function findLowerBoundByStart(entries, start) {
  let low = 0;
  let high = entries.length;
  while (low < high) {
    const middle = low + high >>> 1;
    if (entries[middle].start < start) {
      low = middle + 1;
    } else {
      high = middle;
    }
  }
  return low;
}
var GEOMETRY_TOLERANCE = 1e-6;
var DEFAULT_UNMEASURED_EVENT_THICKNESS = 20;
function buildLevelLimitedLayout(segs, eventOrderStrict, eventSlicing, maxLevels, moreLinkLevelTax, sliceHeights) {
  const { segLevels, excludedSegs } = buildSegLevels(segs, eventOrderStrict, maxLevels);
  const placement = placeExtraSlicesInLevels(convertSegLevelsToWholeSlices(segLevels), convertSegsToWholeSlices(excludedSegs), eventOrderStrict, eventSlicing, moreLinkLevelTax);
  const resolution = resolveLevelCoords(placement.sliceLevels, sliceHeights);
  return {
    renderSlices: flatArray(placement.sliceLevels),
    hiddenSlices: placement.hiddenSlices,
    sliceLevels: placement.sliceLevels,
    sliceCoords: resolution.sliceCoords,
    isSettled: resolution.isSettled
  };
}
function buildPixelLimitedLayout(segs, eventOrderStrict, eventSlicing, sliceHeights, canvasHeight, levelCapacity, moreLinkHeight) {
  const { segLevels, excludedSegs } = buildSegLevels(segs, eventOrderStrict, levelCapacity);
  const domWholeSliceLevels = convertSegLevelsToWholeSlices(segLevels);
  const domExcludedWholeSlices = convertSegsToWholeSlices(excludedSegs);
  const wholeResolution = resolveLevelCoords(domWholeSliceLevels, sliceHeights, canvasHeight);
  if (canvasHeight == null || moreLinkHeight == null) {
    return {
      renderSlices: flatArray(domWholeSliceLevels),
      hiddenSlices: domExcludedWholeSlices,
      sliceLevels: domWholeSliceLevels,
      sliceCoords: wholeResolution.sliceCoords,
      isSettled: wholeResolution.isSettled
    };
  }
  const excludedWholeSlices = wholeResolution.excludedSlices.concat(domExcludedWholeSlices);
  excludedWholeSlices.sort(compareByEventOrder);
  const placement = placeExtraSlicesInLevels(
    wholeResolution.placementSliceLevels,
    excludedWholeSlices,
    eventOrderStrict,
    eventSlicing,
    /* moreLinkLevelTax = */
    eventSlicing ? 1 : 0,
    /* requiresSlicing = */
    true,
    /* taxDeepestOccupiedLevel = */
    true
  );
  const sliceResolution = resolveLevelCoords(placement.sliceLevels, sliceHeights);
  const moreLinkEventMax = Math.max(0, canvasHeight - moreLinkHeight);
  const pixelPrunedSlices = prunePixelLimitedSliceLevels(placement.sliceLevels, placement.hiddenSlices, sliceResolution.sliceCoords, sliceHeights, canvasHeight, moreLinkEventMax);
  const renderSlices = flatArray(domWholeSliceLevels).concat(placement.addedSlices);
  const isSettled = wholeResolution.isSettled && sliceResolution.isSettled;
  return {
    renderSlices,
    hiddenSlices: pixelPrunedSlices.concat(placement.hiddenSlices),
    sliceLevels: placement.sliceLevels,
    sliceCoords: sliceResolution.sliceCoords,
    isSettled
  };
}
function buildSegLevels(segs, eventOrderStrict, maxLevels = Infinity) {
  const segLevels = [];
  const excludedSegs = [];
  for (const seg of segs) {
    const levelIndex = findPackedLevelIndex(segLevels, seg, eventOrderStrict);
    if (levelIndex >= maxLevels) {
      excludedSegs.push(seg);
    } else {
      while (segLevels.length <= levelIndex) {
        segLevels.push([]);
      }
      insertLaterally(segLevels[levelIndex], seg);
    }
  }
  return { segLevels, excludedSegs };
}
function findPackedLevelIndex(levels, span, orderStrict) {
  let levelIndex = 0;
  if (orderStrict) {
    for (let i = 0; i < levels.length; i++) {
      if (findIntersections(levels[i], span).length) {
        levelIndex = i + 1;
      }
    }
  } else {
    while (levelIndex < levels.length && findIntersections(levels[levelIndex], span).length) {
      levelIndex++;
    }
  }
  return levelIndex;
}
function convertSegLevelsToWholeSlices(segLevels) {
  return segLevels.map((level) => convertSegsToWholeSlices(level));
}
function convertSegsToWholeSlices(segs) {
  return segs.map(createWholeSlice);
}
function resolveLevelCoords(sliceLevels, sliceHeights, maxPixels = Infinity) {
  const placementSliceLevels = [];
  const sliceCoords = /* @__PURE__ */ new Map();
  let isSettled = true;
  const excludedSlices = [];
  for (let levelIndex = 0; levelIndex < sliceLevels.length; levelIndex++) {
    for (const slice of sliceLevels[levelIndex]) {
      const sliceHeight = sliceHeights.get(getSliceKey(slice));
      if (sliceHeight === void 0) {
        isSettled = false;
        continue;
      }
      const { bottom: levelCoord, levelIndex: packedLevelIndex } = computeLateralSpanPlacement(placementSliceLevels, slice, sliceCoords, sliceHeights);
      if (levelCoord + sliceHeight <= maxPixels + GEOMETRY_TOLERANCE) {
        while (placementSliceLevels.length <= packedLevelIndex) {
          placementSliceLevels.push([]);
        }
        insertLaterally(placementSliceLevels[packedLevelIndex], slice);
        sliceCoords.set(getSliceKey(slice), levelCoord);
      } else {
        excludedSlices.push(slice);
      }
    }
  }
  return { placementSliceLevels, sliceCoords, isSettled, excludedSlices };
}
function computeLateralSpanPlacement(sliceLevels, span, sliceCoords, sliceHeights) {
  let bottom = 0;
  let levelIndex = 0;
  for (let i = 0; i < sliceLevels.length; i++) {
    const level = sliceLevels[i];
    for (const slice of findIntersections(level, span)) {
      const key = getSliceKey(slice);
      const sliceTop = sliceCoords.get(key);
      const sliceHeight = sliceHeights.get(key);
      if (sliceTop !== void 0 && sliceHeight !== void 0) {
        bottom = Math.max(bottom, sliceTop + sliceHeight);
        levelIndex = i + 1;
      }
    }
  }
  return { bottom, levelIndex };
}
function recomputeVisibleCoords(sliceLevels, sliceHeights, sliceCoords) {
  const visibleLevels = sliceLevels.map((level) => level.filter((slice) => sliceCoords.has(getSliceKey(slice))));
  const freshCoords = resolveLevelCoords(visibleLevels, sliceHeights).sliceCoords;
  for (const [key, coord] of freshCoords) {
    sliceCoords.set(key, coord);
  }
}
function getSliceBottom(slice, sliceCoords, sliceHeights) {
  const key = getSliceKey(slice);
  const coord = sliceCoords.get(key);
  const height = sliceHeights.get(key);
  return coord === void 0 || height === void 0 ? void 0 : coord + height;
}
function prunePixelLimitedSliceLevels(sliceLevels, initialHiddenSlices, sliceCoords, sliceHeights, maxPixelHeight, moreLinkMaxPixelHeight) {
  const moreLinkGroups = [];
  const pixelPrunedSlices = [];
  const sliceHideQueue = [];
  let sliceHideIndex = 0;
  for (const hiddenSlice of initialHiddenSlices) {
    addHiddenSliceToGroups(moreLinkGroups, hiddenSlice);
  }
  enqueueViolators();
  while (sliceHideIndex < sliceHideQueue.length) {
    const slice = sliceHideQueue[sliceHideIndex++];
    const sliceBottom = getSliceBottom(slice, sliceCoords, sliceHeights);
    if (sliceBottom === void 0 || !violatesPixelBoundary(slice, sliceBottom)) {
      continue;
    }
    sliceCoords.delete(getSliceKey(slice));
    pixelPrunedSlices.push(slice);
    const newMoreLinkSpans = addHiddenSliceToGroups(moreLinkGroups, slice);
    recomputeVisibleCoords(sliceLevels, sliceHeights, sliceCoords);
    for (const newMoreLinkSpan of newMoreLinkSpans) {
      enqueueViolators(newMoreLinkSpan);
    }
  }
  return pixelPrunedSlices;
  function violatesPixelBoundary(slice, sliceBottom) {
    return sliceBottom > maxPixelHeight + GEOMETRY_TOLERANCE || sliceBottom > moreLinkMaxPixelHeight + GEOMETRY_TOLERANCE && findIntersections(moreLinkGroups, slice).length > 0;
  }
  function enqueueViolators(withinSpan) {
    for (const level of sliceLevels) {
      const candidates = withinSpan ? findIntersections(level, withinSpan) : level;
      for (const slice of candidates) {
        const sliceBottom = getSliceBottom(slice, sliceCoords, sliceHeights);
        if (sliceBottom !== void 0 && violatesPixelBoundary(slice, sliceBottom)) {
          sliceHideQueue.push(slice);
        }
      }
    }
  }
}
function placeExtraSlicesInLevels(sliceLevels, extraSlices, eventOrderStrict, eventSlicing, moreLinkLevelTax, requiresSlicing = false, taxDeepestOccupiedLevel = false) {
  const addedSliceSet = /* @__PURE__ */ new Set();
  const hiddenSlices = [];
  const moreLinkGroups = [];
  const moreLinkReservations = [];
  const placementState = {
    levels: sliceLevels,
    moreLinkReservations,
    eventOrderStrict
  };
  const work = [];
  pushFire(extraSlices, requiresSlicing);
  while (work.length) {
    const item = work.pop();
    if (item.type === "fire") {
      fire(item.slice, item.requiresSlicing);
    } else {
      fireMoreLink(item.span);
    }
  }
  return {
    sliceLevels,
    hiddenSlices,
    addedSlices: [...addedSliceSet]
  };
  function fire(slice, requiresSlicing2) {
    if (!requiresSlicing2) {
      const levelIndex = findInsertionLevel(slice, placementState);
      if (levelIndex !== null) {
        insertLaterally(sliceLevels[levelIndex], slice);
        addedSliceSet.add(slice);
        return;
      }
    }
    if (!eventSlicing) {
      hide(slice);
      return;
    }
    const plan = findBestSlicePlan(slice, placementState, requiresSlicing2);
    if (!plan) {
      hide(slice);
      return;
    }
    for (const visibleSlice of plan.slices) {
      insertLaterally(sliceLevels[plan.levelIndex], visibleSlice);
      addedSliceSet.add(visibleSlice);
    }
    for (const hiddenSlice of subtractSpansFromSlice(slice, plan.slices)) {
      hide(hiddenSlice);
    }
  }
  function hide(slice) {
    hiddenSlices.push(slice);
    const newMoreLinkSpans = addHiddenSliceToGroups(moreLinkGroups, slice);
    if (moreLinkLevelTax) {
      for (let i = newMoreLinkSpans.length - 1; i >= 0; i--) {
        work.push({ type: "moreLink", span: newMoreLinkSpans[i] });
      }
    }
  }
  function fireMoreLink(span) {
    if (!sliceLevels.length) {
      return;
    }
    let taxedLevelIndex = sliceLevels.length - 1;
    let victims = findIntersections(sliceLevels[taxedLevelIndex], span);
    if (taxDeepestOccupiedLevel) {
      while (!victims.length && taxedLevelIndex > 0) {
        taxedLevelIndex--;
        victims = findIntersections(sliceLevels[taxedLevelIndex], span);
      }
    }
    insertLaterally(moreLinkReservations, __spreadProps(__spreadValues({}, span), {
      levelIndex: taxedLevelIndex
    }));
    const taxedLevel = sliceLevels[taxedLevelIndex];
    for (const victim of victims) {
      taxedLevel.splice(taxedLevel.indexOf(victim), 1);
      addedSliceSet.delete(victim);
      if (eventSlicing) {
        hide(intersectSlice(victim, span));
        pushFire(subtractSpansFromSlice(victim, [span]), false);
      } else {
        hide(victim);
      }
    }
  }
  function pushFire(slices, requiresSlicing2) {
    for (let i = slices.length - 1; i >= 0; i--) {
      work.push({ type: "fire", slice: slices[i], requiresSlicing: requiresSlicing2 });
    }
  }
}
function findInsertionLevel(slice, state) {
  const fence = computeLevelFence(slice, state);
  for (let levelIndex = fence.min; levelIndex < fence.maxExclusive; levelIndex++) {
    if (!findIntersections(state.levels[levelIndex], slice).length) {
      return levelIndex;
    }
  }
  return null;
}
function computeLevelFence(slice, state) {
  const { levels } = state;
  let min = 0;
  let maxExclusive = levels.length;
  for (const reservation of findIntersections(state.moreLinkReservations, slice)) {
    maxExclusive = Math.min(maxExclusive, reservation.levelIndex);
  }
  if (state.eventOrderStrict) {
    for (let levelIndex = 0; levelIndex < levels.length; levelIndex++) {
      for (const other of findIntersections(levels[levelIndex], slice)) {
        if (other.sourceSeg.orderIndex < slice.sourceSeg.orderIndex) {
          min = Math.max(min, levelIndex + 1);
        } else if (other.sourceSeg.orderIndex > slice.sourceSeg.orderIndex) {
          maxExclusive = Math.min(maxExclusive, levelIndex);
        }
      }
    }
  }
  return { min, maxExclusive };
}
var MAX_SLICES_PER_PLAN = 3;
var EXTRA_SLICE_PENALTY = 0.15;
function findBestSlicePlan(slice, state, requiresSlicing) {
  let selected = null;
  const sourceLength = getSpanLength(slice);
  for (let levelIndex = 0; levelIndex < state.levels.length; levelIndex++) {
    const blockers = findIntersections(state.levels[levelIndex], slice);
    for (const reservation of state.moreLinkReservations) {
      if (levelIndex >= reservation.levelIndex) {
        addToUnion(blockers, reservation);
      }
    }
    const runs = subtractSpansFromSlice(slice, blockers).filter((run) => isWithinLevelFence(run, levelIndex, state)).sort((a, b) => getSpanLength(b) - getSpanLength(a) || a.start - b.start);
    let visibleLength = 0;
    for (let sliceCount = 1; sliceCount <= Math.min(MAX_SLICES_PER_PLAN, runs.length); sliceCount++) {
      visibleLength += getSpanLength(runs[sliceCount - 1]);
      if (requiresSlicing && visibleLength >= sourceLength - GEOMETRY_TOLERANCE) {
        break;
      }
      const candidate = {
        levelIndex,
        slices: runs.slice(0, sliceCount),
        score: visibleLength / sourceLength - EXTRA_SLICE_PENALTY * (sliceCount - 1)
      };
      if (isBetterSlicePlan(candidate, selected)) {
        selected = candidate;
      }
    }
  }
  if (selected) {
    selected.slices.sort(compareByEventOrder);
  }
  return selected;
}
function isWithinLevelFence(slice, levelIndex, state) {
  const fence = computeLevelFence(slice, state);
  return levelIndex >= fence.min && levelIndex < fence.maxExclusive;
}
function isBetterSlicePlan(candidate, current) {
  if (!current || candidate.score > current.score) {
    return true;
  }
  if (candidate.score < current.score) {
    return false;
  }
  if (candidate.slices.length !== current.slices.length) {
    return candidate.slices.length < current.slices.length;
  }
  return candidate.levelIndex < current.levelIndex;
}
function groupLaterallyIntersecting(hiddenSlices) {
  const groups = [];
  for (const slice of hiddenSlices) {
    addHiddenSliceToGroups(groups, slice);
  }
  return finalizeHiddenGroups(groups);
}
function addHiddenSliceToGroups(groups, slice) {
  const newSpans = subtractCoveredSpans(slice, groups);
  const untouchedGroups = [];
  const mergedSlices = [slice];
  let start = slice.start;
  let end = slice.end;
  for (const group of groups) {
    if (intersectSpans(group, slice)) {
      mergedSlices.push(...group.hiddenSlices);
      start = Math.min(start, group.start);
      end = Math.max(end, group.end);
    } else {
      untouchedGroups.push(group);
    }
  }
  mergedSlices.sort(compareByEventOrder);
  insertLaterally(untouchedGroups, {
    start,
    end,
    hiddenSlices: mergedSlices
  });
  groups.splice(0, groups.length, ...untouchedGroups);
  return newSpans;
}
function finalizeHiddenGroups(groups) {
  return groups.map((group) => {
    const hiddenSlices = mergeAdjacentSlices(group.hiddenSlices);
    return {
      key: getSliceKey(hiddenSlices[0]),
      start: group.start,
      end: group.end,
      hiddenSlices
    };
  });
}
function getSliceKey(slice) {
  if (!isPartialSlice(slice)) {
    return slice.sourceSeg.key;
  }
  return `${slice.sourceSeg.key}:${slice.start}:slice`;
}
function isPartialSlice(slice) {
  return slice.start !== slice.sourceSeg.start || slice.end !== slice.sourceSeg.end;
}
function compareByEventOrder(a, b) {
  return a.sourceSeg.orderIndex - b.sourceSeg.orderIndex || a.start - b.start || b.end - a.end;
}
function sortByEventOrder(slices) {
  return [...slices].sort(compareByEventOrder);
}
function compareByAxisOrder(a, b) {
  return a.start - b.start || a.sourceSeg.orderIndex - b.sourceSeg.orderIndex;
}
function sortByAxisOrder(items) {
  return [...items].sort(compareByAxisOrder);
}
function mergeAdjacentSlices(slices) {
  const merged = [];
  for (const slice of slices) {
    const previous = merged[merged.length - 1];
    if (previous && previous.sourceSeg === slice.sourceSeg) {
      merged[merged.length - 1] = createNarrowerSlice(createWholeSlice(previous.sourceSeg), previous.start, Math.max(previous.end, slice.end));
    } else {
      merged.push(slice);
    }
  }
  return merged;
}
function subtractSpansFromSlice(slice, covered) {
  return subtractCoveredSpans(slice, covered).map((span) => createNarrowerSlice(slice, span.start, span.end));
}
function intersectSlice(slice, barrier) {
  const intersection = intersectSpans(slice, barrier);
  return intersection ? createNarrowerSlice(slice, intersection.start, intersection.end) : null;
}
function createWholeSlice(sourceSeg) {
  return {
    sourceSeg,
    start: sourceSeg.start,
    end: sourceSeg.end,
    isStart: sourceSeg.isStart,
    isEnd: sourceSeg.isEnd
  };
}
function createNarrowerSlice(parent, start, end) {
  return {
    sourceSeg: parent.sourceSeg,
    start,
    end,
    isStart: parent.isStart && start === parent.start,
    isEnd: parent.isEnd && end === parent.end
  };
}
var DEFAULT_UNMEASURED_EVENT_AREA_HEIGHT = 150;
var DEFAULT_LEVEL_CAPACITY = estimateLevelCapacity(DEFAULT_UNMEASURED_EVENT_AREA_HEIGHT, DEFAULT_UNMEASURED_EVENT_THICKNESS);
function buildDayGridSegSources(eventOrderedSegs) {
  return eventOrderedSegs.map((seg, orderIndex) => __spreadProps(__spreadValues({}, seg), {
    key: getDayGridSegKey(seg),
    orderIndex
  }));
}
function buildDayGridLevelPlacements(eventOrderedSegs, maxLevels, moreLinkLevelTax, orderStrict, eventSlicing, columnCount, sliceHeights) {
  const sourceSegs = buildDayGridSegSources(eventOrderedSegs);
  const layout = buildLevelLimitedLayout(sourceSegs, orderStrict, eventSlicing, maxLevels, moreLinkLevelTax, sliceHeights);
  return buildDayGridPlacementLayout(sourceSegs, layout, sliceHeights, columnCount);
}
function buildDayGridPixelPlacements(eventOrderedSegs, orderStrict, eventSlicing, columnCount, canvasHeight, moreLinkHeight, levelCapacity, sliceHeights) {
  const sourceSegs = buildDayGridSegSources(eventOrderedSegs);
  const layout = buildPixelLimitedLayout(sourceSegs, orderStrict, eventSlicing, sliceHeights, canvasHeight, levelCapacity, moreLinkHeight);
  return buildDayGridPlacementLayout(sourceSegs, layout, sliceHeights, columnCount);
}
function buildDayGridPopoverSegs(eventOrderedSegs, hiddenSlices, column) {
  return {
    segs: flatMapArray(eventOrderedSegs, (source) => cutSegToColumn(source, column) ?? []),
    hiddenSegs: flatMapArray(hiddenSlices, (slice) => cutSegToColumn(slice.sourceSeg, column, slice) ?? [])
  };
}
function cutSegToColumn(source, column, intersectionSpan = source) {
  if (intersectionSpan.start >= column + 1 || column >= intersectionSpan.end)
    return null;
  const _a = source, { key, orderIndex } = _a, seg = __objRest(_a, ["key", "orderIndex"]);
  return __spreadProps(__spreadValues({}, seg), {
    start: column,
    end: column + 1,
    isStart: seg.isStart && source.start === column,
    isEnd: seg.isEnd && source.end - 1 === column
  });
}
function resolveDayGridPlacementMode(dayMaxEvents, dayMaxEventRows) {
  if (dayMaxEvents === true || dayMaxEventRows === true) {
    return "auto";
  }
  if (typeof dayMaxEvents === "number") {
    return "maxEvents";
  }
  if (typeof dayMaxEventRows === "number") {
    return "maxEventRows";
  }
  return "unlimited";
}
function computeDayGridDomCandidateMaxLevels(mode, dayMaxEvents, dayMaxEventRows, maxDomLevels) {
  switch (mode) {
    case "auto":
      return maxDomLevels;
    case "maxEvents":
      return dayMaxEvents;
    case "maxEventRows":
      return dayMaxEventRows;
    default:
      return Infinity;
  }
}
function computeDayGridMoreLinkLevelTax(mode) {
  return mode === "maxEventRows" ? 1 : 0;
}
function buildDayGridPlacementLayout(sourceSegs, layout, sliceHeights, columnCount) {
  const { hiddenSlices, renderSlices, sliceCoords } = layout;
  const eventOrderedHiddenSlices = sortByEventOrder(hiddenSlices);
  const slicesByStart = federateSlicesByStart(renderSlices, columnCount);
  const columns = Array.from({ length: columnCount }, (_, column) => __spreadValues({
    // Freshly built per column by federateSlicesByStart; owned outright.
    renderSlices: slicesByStart[column],
    contentHeight: 0
  }, buildDayGridPopoverSegs(sourceSegs, eventOrderedHiddenSlices, column)));
  for (const slice of renderSlices) {
    const key = getSliceKey(slice);
    const sliceTop = sliceCoords.get(key);
    if (sliceTop === void 0) {
      continue;
    }
    const sliceBottom = sliceTop + sliceHeights.get(key);
    for (let column = slice.start; column < slice.end; column += 1) {
      columns[column].contentHeight = Math.max(columns[column].contentHeight, sliceBottom);
    }
  }
  return {
    columns,
    sliceCoords
  };
}
function federateSlicesByStart(renderSlices, columnCount) {
  const slicesByStart = Array.from({ length: columnCount }, () => []);
  for (const slice of renderSlices) {
    slicesByStart[slice.start].push(slice);
  }
  for (const slices of slicesByStart) {
    slices.sort(compareByEventOrder);
  }
  return slicesByStart;
}
function estimateLevelCapacity(eventAreaHeight, eventHeight) {
  return Math.max(1, Math.ceil(eventAreaHeight / eventHeight));
}
var DEFAULT_PRINT_MAX_LEVELS = 200;
function planPrintDomCandidates(eventOrderedSegs, eventOrderStrict, eventSlicing) {
  const { segLevels, excludedSegs } = buildSegLevels(eventOrderedSegs, eventOrderStrict, DEFAULT_PRINT_MAX_LEVELS);
  const placement = placeExtraSlicesInLevels(convertSegLevelsToWholeSlices(segLevels), convertSegsToWholeSlices(excludedSegs), eventOrderStrict, eventSlicing, 0);
  return {
    sliceLevels: placement.sliceLevels,
    hiddenSlices: placement.hiddenSlices
  };
}
function buildPrintEventBands(levels, printEventThicknesses, getPrintEventKey = (slice) => slice.sourceSeg.key, defaultPrintEventThickness = DEFAULT_UNMEASURED_EVENT_THICKNESS) {
  const bands = [];
  for (let levelIndex = 0; levelIndex < levels.length; levelIndex++) {
    const entries = levels[levelIndex];
    if (!entries?.length)
      continue;
    let thickness = 0;
    const slices = entries.map((slice) => {
      thickness = Math.max(thickness, printEventThicknesses.get(getPrintEventKey(slice)) ?? defaultPrintEventThickness);
      return slice;
    });
    bands.push({
      levelIndex,
      slices,
      thickness
    });
  }
  return bands;
}
function buildDayGridPrintPlan(eventOrderedSegs, orderStrict, eventSlicing, columnCount) {
  const sourceSegs = buildDayGridSegSources(eventOrderedSegs);
  const candidatePlan = planPrintDomCandidates(sourceSegs, orderStrict, eventSlicing);
  return __spreadProps(__spreadValues({}, candidatePlan), {
    hiddenSlices: sortByEventOrder(candidatePlan.hiddenSlices),
    sourceSegs,
    columnCount
  });
}
function buildDayGridPrintColumns(plan, printSegHeights) {
  const columns = Array.from({ length: plan.columnCount }, () => []);
  for (const band of buildPrintEventBands(plan.sliceLevels, printSegHeights, getDayGridPrintSliceKey)) {
    const slicesByColumn = Array(plan.columnCount).fill(null);
    for (const slice of band.slices) {
      slicesByColumn[slice.start] = slice;
    }
    for (let column = 0; column < plan.columnCount; column++) {
      columns[column].push({
        levelIndex: band.levelIndex,
        thickness: band.thickness,
        slice: slicesByColumn[column]
      });
    }
  }
  return columns;
}
function getDayGridPrintSliceKey(slice) {
  return `${slice.sourceSeg.key}:${slice.start}:${slice.end}`;
}
var DEFAULT_WEEK_NUM_FORMAT = createFormatter({ week: "narrow" });
var DayGridRow = class extends BaseComponent {
  constructor() {
    super(...arguments);
    this.headerHeightRefMap = new RefMap(() => {
      afterSize(this.handleSegPositioning);
    });
    this.mainHeightRefMap = new RefMap(() => {
      const fgLiquidHeight = this.props.dayMaxEvents === true || this.props.dayMaxEventRows === true;
      if (fgLiquidHeight) {
        afterSize(this.handleSegPositioning);
      }
    });
    this.sliceHeightRefMap = new RefMap(() => {
      afterSize(this.handleSegPositioning);
    });
    this.handlePrintSegHeightChange = () => {
      afterSize(this.handlePrintSegHeights);
    };
    this.printSegHeightRefMap = new RefMap(this.handlePrintSegHeightChange);
    this.buildWeekNumberRenderProps = memoize(buildWeekNumberRenderProps);
    this.buildPrintPlan = memoize(buildDayGridPrintPlan);
    this.sortEventSegs = memoize(sortEventSegs);
    this.levelCapacity = DEFAULT_LEVEL_CAPACITY;
    this.handleRootEl = (rootEl) => {
      this.disconnectHeight?.();
      this.disconnectHeight = void 0;
      setRef(this.props.rootElRef, rootEl);
      if (rootEl) {
        this.disconnectHeight = watchHeight(rootEl, (contentHeight) => {
          setRef(this.props.heightRef, contentHeight);
        });
      }
    };
    this.handleSegPositioning = () => {
      if (this._isUnmounting || this.props.forPrint)
        return;
      this.updateAutoPlacementRatchets();
      this.forceUpdate();
    };
    this.handlePrintSegHeights = () => {
      if (this._isUnmounting || !this.props.forPrint)
        return;
      this.forceUpdate();
    };
  }
  render() {
    const { props, context, headerHeightRefMap, mainHeightRefMap } = this;
    const { cells, tableMode } = props;
    const { options } = context;
    const weekDateMarker = props.cells[0].date;
    const fgEventSegs = this.sortEventSegs(props.fgEventSegs, options.eventOrder);
    const screenFgLiquidHeight = props.dayMaxEvents === true || props.dayMaxEventRows === true;
    let printPlan = null;
    let printColumns = null;
    let screenColumns = null;
    let screenSliceCoords = /* @__PURE__ */ new Map();
    let screenMainOffsetsByCol = [];
    let screenHeightsByCol = [];
    if (props.forPrint) {
      printPlan = this.buildPrintPlan(fgEventSegs, options.eventOrderStrict, options.eventSlicing, cells.length);
      printColumns = buildDayGridPrintColumns(printPlan, this.printSegHeightRefMap.current);
    } else {
      const placementMode = resolveDayGridPlacementMode(props.dayMaxEvents, props.dayMaxEventRows);
      const [maxMainTop, minMainHeight] = this.computeFgDims();
      const screenLayout = placementMode === "auto" ? buildDayGridPixelPlacements(fgEventSegs, options.eventOrderStrict, options.eventSlicing, cells.length, minMainHeight, props.moreLinkHeight, this.levelCapacity, this.sliceHeightRefMap.current) : buildDayGridLevelPlacements(fgEventSegs, computeDayGridDomCandidateMaxLevels(placementMode, props.dayMaxEvents, props.dayMaxEventRows, Infinity), computeDayGridMoreLinkLevelTax(placementMode), options.eventOrderStrict, options.eventSlicing, cells.length, this.sliceHeightRefMap.current);
      screenColumns = screenLayout.columns;
      screenSliceCoords = screenLayout.sliceCoords;
      if (maxMainTop != null) {
        for (let col = 0; col < cells.length; col++) {
          const cellHeaderHeight = headerHeightRefMap.current.get(cells[col].key);
          const mainOffset = cellHeaderHeight != null ? maxMainTop - cellHeaderHeight : void 0;
          screenMainOffsetsByCol.push(mainOffset);
          screenHeightsByCol.push(mainOffset != null ? screenColumns[col].contentHeight + mainOffset : void 0);
        }
      }
    }
    const highlightSegs = this.getHighlightSegs();
    const hasNavLink = options.navLinks;
    const fullWeekStr = buildDateStr(context, weekDateMarker, "week");
    const weekNumberRenderProps = this.buildWeekNumberRenderProps(weekDateMarker, context, props.cellIsNarrow, hasNavLink);
    const fillsByCol = cells.map(() => []);
    const weekNumberNode = props.showWeekNumbers && !props.cellIsMicro ? u(ContentContainer, { tag: "div", attrs: __spreadProps(__spreadValues({}, hasNavLink ? buildNavLinkAttrs(
      context,
      weekDateMarker,
      "week",
      fullWeekStr,
      /* isTabbable = */
      false
    ) : {}), {
      "role": void 0,
      // HACK: a 'link' role can't be child of a 'row' role
      "aria-hidden": true
      // HACK: never part of a11y tree because row already has label and role not allowed
    }), className: DAY_GRID_EVENT_Z_CLASS, renderProps: weekNumberRenderProps, generatorName: "inlineWeekNumberContent", customGenerator: options.inlineWeekNumberContent, defaultGenerator: renderText, classNameGenerator: options.inlineWeekNumberClass, didMount: options.inlineWeekNumberDidMount, willUnmount: options.inlineWeekNumberWillUnmount }) : null;
    if (tableMode && weekNumberNode) {
      fillsByCol[0].push(u("div", { className: joinClassNames(classNames.fillY, classNames.start0, classNames.pointerEventsNone), style: {
        width: this.computeSpanWidth(0, cells.length)
      }, children: weekNumberNode }, "week-number"));
    }
    this.appendFillSegs(fillsByCol, props.businessHourSegs, "non-business", DAY_GRID_NON_BUSINESS_Z_CLASS);
    this.appendFillSegs(fillsByCol, props.bgEventSegs, "bg-event", DAY_GRID_BG_EVENT_Z_CLASS);
    this.appendFillSegs(fillsByCol, highlightSegs, "highlight", DAY_GRID_HIGHLIGHT_Z_CLASS);
    const RowTag = tableMode ? "tr" : "div";
    return u(RowTag, {
      role: props.role,
      "aria-label": props.role === "row" ? fullWeekStr : void 0,
      className: joinClassNames(
        options.dayRowClass,
        props.className,
        tableMode && classNames.borderless,
        !tableMode && classNames.flexRow,
        !tableMode && classNames.rel,
        // origin for the inline week number
        !tableMode && classNames.borderlessX,
        !tableMode && classNames.borderlessTop,
        !tableMode && !props.borderBottom && classNames.borderlessBottom,
        classNames.isolate
      ),
      style: {
        flexBasis: tableMode ? void 0 : props.basis
      },
      ref: this.handleRootEl,
      children: [!tableMode && weekNumberNode, props.cells.map((cell, col) => {
        const printPopover = printPlan ? buildDayGridPopoverSegs(printPlan.sourceSegs, printPlan.hiddenSlices, col) : null;
        let fg;
        if (printPlan) {
          fg = this.renderPrintBandSlots(printColumns[col]);
        } else {
          fg = [
            ...this.renderLevelFgSegs(screenMainOffsetsByCol[col], screenColumns[col].renderSlices, screenSliceCoords),
            ...this.renderMirrorFgSegs(col, screenMainOffsetsByCol[col], screenSliceCoords)
          ];
        }
        return u(DayGridCell, {
          dateProfile: props.dateProfile,
          todayRange: props.todayRange,
          date: cell.date,
          isMajor: cell.isMajor,
          isDisabled: cell.isDisabled,
          showDayNumber: props.showDayNumbers,
          isNarrow: props.cellIsNarrow,
          isMicro: props.cellIsMicro,
          borderStart: Boolean(col),
          borderBottom: props.borderBottom,
          tableMode,
          // content
          fills: fillsByCol[col],
          segs: printPopover ? printPopover.segs : screenColumns[col].segs,
          hiddenSegs: printPopover ? printPopover.hiddenSegs : screenColumns[col].hiddenSegs,
          fgLiquidHeight: printPlan ? false : screenFgLiquidHeight,
          fg,
          eventDrag: printPlan ? null : props.eventDrag,
          eventResize: printPlan ? null : props.eventResize,
          eventSelection: props.eventSelection,
          // render hooks
          renderProps: cell.renderProps,
          dateSpanProps: cell.dateSpanProps,
          attrs: cell.attrs,
          className: cell.className,
          // dimensions
          fgHeight: printPlan ? void 0 : screenHeightsByCol[col],
          width: props.colWidth,
          // refs
          headerHeightRef: printPlan ? void 0 : headerHeightRefMap.createRef(cell.key),
          mainHeightRef: printPlan ? void 0 : mainHeightRefMap.createRef(cell.key)
        }, cell.key);
      })]
    });
  }
  /** Mirrors align with kernel coordinates but bypass admission and measurement. */
  renderMirrorFgSegs(col, mainOffset, sliceCoords) {
    const { props } = this;
    const { eventSelection } = props;
    const nodes = [];
    for (const seg of this.getMirrorSegs()) {
      if (seg.start !== col) {
        continue;
      }
      const key = getDayGridSegKey(seg);
      const { eventRange } = seg;
      const { instanceId } = eventRange.instance;
      const top = mainOffset != null ? mainOffset + (sliceCoords.get(key) ?? 0) : void 0;
      const isDragging = Boolean(props.eventDrag && props.eventDrag.affectedInstances[instanceId]);
      const isResizing = Boolean(props.eventResize && props.eventResize.affectedInstances[instanceId]);
      const isSelected = instanceId === eventSelection;
      nodes.push(u(MeasuredHeightHarness, { className: joinClassNames(classNames.abs, classNames.start0, DAY_GRID_INTERACTION_Z_CLASS), style: {
        top,
        width: this.computeSpanWidth(seg.start, seg.end)
      }, heightRef: null, children: this.renderEventContent(seg, eventRange, {
        isDragging,
        isResizing,
        isMirror: true,
        isSelected
      }) }, `mirror:${key}`));
    }
    return nodes;
  }
  /** Renders every kernel slice with its own measurement ref. */
  renderLevelFgSegs(mainOffset, slices, sliceCoords) {
    const { props } = this;
    const { eventSelection } = props;
    const nodes = [];
    for (const slice of slices) {
      const key = getSliceKey(slice);
      const sliceTop = sliceCoords.get(key);
      const { eventRange } = slice.sourceSeg;
      const { instanceId } = eventRange.instance;
      const top = mainOffset != null && sliceTop != null ? mainOffset + sliceTop : void 0;
      const isDragging = Boolean(props.eventDrag && props.eventDrag.affectedInstances[instanceId]);
      const isResizing = Boolean(props.eventResize && props.eventResize.affectedInstances[instanceId]);
      const isInvisible = isDragging || isResizing || top == null;
      const isSelected = instanceId === eventSelection;
      nodes.push(u(MeasuredHeightHarness, { className: joinClassNames(classNames.abs, classNames.start0, isSelected ? DAY_GRID_INTERACTION_Z_CLASS : DAY_GRID_EVENT_Z_CLASS), style: {
        visibility: isInvisible ? "hidden" : void 0,
        top,
        width: this.computeSpanWidth(slice.start, slice.end)
      }, heightRef: this.sliceHeightRefMap.createRef(key), children: this.renderEventContent(slice, eventRange, {
        isDragging,
        isResizing,
        isSelected
      }) }, key));
    }
    return nodes;
  }
  /**
   * The inner event, identical on both placement routes. Only the wrapper
   * around it differs: the screen route positions it, print lets it sit at the
   * static top of its band slot.
  */
  renderEventContent(range, eventRange, interaction) {
    const { props } = this;
    const isListItem = hasListItemDisplay(range, eventRange);
    return u(StandardEvent, __spreadValues({ display: isListItem ? "list-item" : "row", eventRange, isStart: range.isStart, isEnd: range.isEnd, isDragging: Boolean(interaction.isDragging), isResizing: Boolean(interaction.isResizing), isMirror: Boolean(interaction.isMirror), isSelected: Boolean(interaction.isSelected), isNarrow: props.cellIsNarrow, defaultTimeFormat: DEFAULT_TABLE_EVENT_TIME_FORMAT, defaultDisplayEventEnd: props.cells.length === 1, disableResizing: isListItem, forcedTimeText: props.cellIsMicro ? "" : void 0 }, getEventRangeMeta(eventRange, props.todayRange)));
  }
  /** Renders aligned print slots with in-flow event wrappers that can paginate with their bands. */
  renderPrintBandSlots(slots) {
    const { printSegHeightRefMap } = this;
    return slots.map((slot) => {
      const { slice } = slot;
      let eventNode = null;
      if (slice) {
        const sliceKey = getDayGridPrintSliceKey(slice);
        eventNode = u(MeasuredHeightHarness, { className: joinClassNames(classNames.rel, classNames.flowRoot, DAY_GRID_EVENT_Z_CLASS), style: {
          width: this.computeSpanWidth(slice.start, slice.end)
        }, heightRef: printSegHeightRefMap.createRef(sliceKey), children: this.renderEventContent(slice, slice.sourceSeg.eventRange, {}) }, sliceKey);
      }
      return u("div", { className: classNames.breakInsideAvoid, style: { height: slot.thickness }, children: eventNode }, slot.levelIndex);
    });
  }
  computeSpanWidth(start, end) {
    const span = end - start;
    const percentWidth = `${span * 100}%`;
    const crossedBorderWidth = this.props.tableMode && start === 0 ? 0 : Math.max(0, span - 1) * COL_BORDER_WIDTH;
    return crossedBorderWidth ? `calc(${percentWidth} + ${crossedBorderWidth}px)` : percentWidth;
  }
  /** Places each fill in its first cell while allowing its wrapper to span subsequent cells. */
  appendFillSegs(fillsByCol, segs, fillType, zClassName) {
    const { props, context } = this;
    const { todayRange } = props;
    for (const seg of segs) {
      fillsByCol[seg.start].push(u("div", { className: joinClassNames(classNames.fillY, classNames.start0, zClassName), style: {
        width: this.computeSpanWidth(seg.start, seg.end)
      }, children: fillType === "bg-event" ? u(BgEvent, __spreadValues({ eventRange: seg.eventRange, isStart: seg.isStart, isEnd: seg.isEnd, isNarrow: props.cellIsNarrow, isVertical: false }, getEventRangeMeta(seg.eventRange, todayRange))) : renderFill(fillType, context.options) }, `${fillType}:${buildEventRangeKey(seg.eventRange)}:${seg.start}:${seg.end}`));
    }
  }
  // Sizing
  // -----------------------------------------------------------------------------------------------
  componentDidMount() {
    this._isUnmounting = false;
  }
  componentDidUpdate(prevProps) {
    if (prevProps.forPrint && !this.props.forPrint) {
      this.printSegHeightRefMap = new RefMap(this.handlePrintSegHeightChange);
    }
  }
  componentWillUnmount() {
    this._isUnmounting = true;
    this.disconnectHeight?.();
    setRef(this.props.heightRef, null);
  }
  computeFgDims() {
    const { cells } = this.props;
    const headerHeightMap = this.headerHeightRefMap.current;
    const mainHeightMap = this.mainHeightRefMap.current;
    let maxMainTop;
    let minMainBottom;
    let isComplete = true;
    for (const cell of cells) {
      if (cell.isDisabled) {
        continue;
      }
      const mainTop = headerHeightMap.get(cell.key);
      const mainHeight = mainHeightMap.get(cell.key);
      if (mainTop == null || mainHeight == null) {
        isComplete = false;
      }
      if (mainTop != null) {
        if (maxMainTop === void 0 || mainTop > maxMainTop) {
          maxMainTop = mainTop;
        }
        if (mainHeight != null) {
          const mainBottom = mainTop + mainHeight;
          if (minMainBottom === void 0 || mainBottom < minMainBottom) {
            minMainBottom = mainBottom;
          }
        }
      }
    }
    return [
      maxMainTop,
      isComplete && minMainBottom != null && maxMainTop != null ? minMainBottom - maxMainTop : void 0
    ];
  }
  /**
   * Grows the row-local DOM candidate frontier from one post-size snapshot.
   * This is the only monotone state auto placement needs: the engine itself
   * consumes exact measurements and never predicts a thickness.
   */
  updateAutoPlacementRatchets() {
    if (resolveDayGridPlacementMode(this.props.dayMaxEvents, this.props.dayMaxEventRows) !== "auto")
      return;
    const [, canvasHeight] = this.computeFgDims();
    if (canvasHeight != null) {
      const smallestSliceHeight = Math.min(...this.sliceHeightRefMap.current.values());
      this.levelCapacity = Math.max(this.levelCapacity, estimateLevelCapacity(canvasHeight, smallestSliceHeight));
    }
  }
  // Internal Utils
  // -----------------------------------------------------------------------------------------------
  getMirrorSegs() {
    let { props } = this;
    if (props.eventResize && props.eventResize.segs.length) {
      return props.eventResize.segs;
    }
    return [];
  }
  getHighlightSegs() {
    let { props } = this;
    if (props.eventDrag && props.eventDrag.segs.length) {
      return props.eventDrag.segs;
    }
    if (props.eventResize && props.eventResize.segs.length) {
      return props.eventResize.segs;
    }
    return props.dateSelectionSegs;
  }
};
function buildWeekNumberRenderProps(weekDateMarker, context, isNarrow, hasNavLink) {
  const { dateEnv, options } = context;
  const weekNum = dateEnv.computeWeekNumber(weekDateMarker);
  const weekNumTextParts = dateEnv.formatToParts(weekDateMarker, options.weekNumberFormat || DEFAULT_WEEK_NUM_FORMAT);
  const weekNumText = joinDateTimeFormatParts(weekNumTextParts);
  const weekDateZoned = dateEnv.toDate(weekDateMarker);
  return {
    num: weekNum,
    text: weekNumText,
    textParts: weekNumTextParts,
    date: weekDateZoned,
    isNarrow,
    hasNavLink
  };
}
var DaySeriesModel = class {
  constructor(range, dateProfileGenerator) {
    let date = range.start;
    let { end } = range;
    let entries = [];
    let dates = [];
    let dayIndex = -1;
    while (date < end) {
      if (dateProfileGenerator.isHiddenDay(date)) {
        entries.push({
          kind: "hidden",
          previousIndex: dayIndex,
          nextIndex: dayIndex + 1
        });
      } else {
        dayIndex += 1;
        entries.push({ kind: "visible", index: dayIndex });
        dates.push(date);
      }
      date = addDays(date, 1);
    }
    this.rangeStart = range.start;
    this.dates = dates;
    this.entries = entries;
    this.cnt = dates.length;
  }
  sliceRange(range) {
    let firstResult = this.getDateIndex(range.start);
    let lastResult = this.getDateIndex(addDays(range.end, -1));
    let firstIndex = getFirstVisibleIndex(firstResult);
    let lastIndex = getLastVisibleIndex(lastResult);
    let clippedFirstIndex = Math.max(0, firstIndex);
    let clippedLastIndex = Math.min(this.cnt - 1, lastIndex);
    if (clippedFirstIndex <= clippedLastIndex) {
      return {
        start: clippedFirstIndex,
        end: clippedLastIndex + 1,
        // make exclusive
        isStart: firstResult.kind === "visible" && firstIndex === clippedFirstIndex,
        isEnd: lastResult.kind === "visible" && lastIndex === clippedLastIndex
      };
    }
    return null;
  }
  getDateIndex(date) {
    let dayOffset = Math.floor(diffDays(this.rangeStart, date));
    if (dayOffset < 0) {
      return { kind: "before", index: -1 };
    }
    if (dayOffset >= this.entries.length) {
      return { kind: "after", index: this.cnt };
    }
    return this.entries[dayOffset];
  }
};
function getFirstVisibleIndex(result) {
  return result.kind === "hidden" ? result.nextIndex : result.index;
}
function getLastVisibleIndex(result) {
  return result.kind === "hidden" ? result.previousIndex : result.index;
}
function buildDayTableModel(dateProfile, dateProfileGenerator, dateEnv) {
  const daySeries = new DaySeriesModel(dateProfile.renderRange, dateProfileGenerator);
  const breakOnWeeks = /year|month|week/.test(dateProfile.currentRangeUnit);
  const majorUnit = !breakOnWeeks && computeMajorUnit(dateProfile, dateEnv);
  return new DayTableModel(daySeries, breakOnWeeks, dateEnv, majorUnit !== "day" ? majorUnit : void 0, dateProfile.activeRange);
}
function computeColWidth(colCount, colMinWidth, viewportWidth) {
  if (viewportWidth == null) {
    return [void 0, void 0];
  }
  const colTempWidth = viewportWidth / colCount;
  if (colTempWidth < colMinWidth) {
    return [colMinWidth * colCount, colMinWidth];
  }
  return [viewportWidth, void 0];
}
function computeTopFromDate(date, cellRows, rowHeightMap) {
  let top = 0;
  for (const cells of cellRows) {
    const key = cells[0].key;
    const start = cells[0].date;
    const end = cells[cells.length - 1].date;
    if (date >= start && date <= end) {
      return top;
    }
    const rowHeight = rowHeightMap.get(key);
    if (rowHeight == null) {
      return;
    }
    top += rowHeight;
  }
  return top;
}
function computeColFromPosition(positionLeft, elWidth, colWidth, colCount, isRtl) {
  const realColWidth = colWidth != null ? colWidth : elWidth / colCount;
  const colFromLeft = Math.floor(positionLeft / realColWidth);
  const col = isRtl ? colCount - colFromLeft - 1 : colFromLeft;
  const left = colFromLeft * realColWidth;
  const right = left + realColWidth;
  return { col, left, right };
}
function computeRowFromPosition(positionTop, cellRows, rowHeightMap) {
  let row = 0;
  let top = 0;
  let bottom = 0;
  for (const cells of cellRows) {
    const key = cells[0].key;
    top = bottom;
    bottom = top + rowHeightMap.get(key);
    if (positionTop < bottom) {
      break;
    }
    row++;
  }
  return { row, top, bottom };
}
function getRowEl(rootEl, row) {
  return rootEl.querySelectorAll("[role=row]")[row];
}
function getCellEl(rowEl, col) {
  return rowEl.querySelectorAll("[role=gridcell]")[col];
}
var dayMicroWidth = 60;
var dayHeaderMicroFormat = createFormatter({
  weekday: "narrow"
});
function createDayHeaderFormatter(explicitFormat, datesRepDistinctDays, dateCnt) {
  return explicitFormat || computeFallbackHeaderFormat(datesRepDistinctDays, dateCnt);
}
function computeFallbackHeaderFormat(datesRepDistinctDays, dayCnt) {
  if (!datesRepDistinctDays) {
    return createFormatter({ weekday: "short" });
  }
  if (dayCnt > 1) {
    return createFormatter({
      weekday: "short",
      weekdayJustify: "start",
      day: "numeric",
      omitCommas: true,
      omitTrailing: true
    });
  }
  return createFormatter({
    weekday: "long",
    weekdayJustify: "start",
    day: "numeric",
    omitCommas: true,
    omitTrailing: true
  });
}
var DayGridRows = class extends DateComponent {
  constructor() {
    super(...arguments);
    this.state = {};
    this.splitBusinessHourSegs = memoize(splitSegsByRow);
    this.splitBgEventSegs = memoize(splitAllDaySegsByRow);
    this.splitFgEventSegs = memoize(splitSegsByRow);
    this.splitDateSelectionSegs = memoize(splitSegsByRow);
    this.splitEventDrag = memoize(splitInteractionByRow);
    this.splitEventResize = memoize(splitInteractionByRow);
    this.rowHeightRefMap = new RefMap((height, key) => {
      const { rowHeightRefMap } = this.props;
      if (rowHeightRefMap) {
        rowHeightRefMap.handleValue(height, key);
      }
    });
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
          el: rootEl,
          isHitComboAllowed: this.props.isHitComboAllowed
        });
      } else {
        this.context.unregisterInteractiveComponent(this);
      }
    };
  }
  render() {
    let { props, state, context, rowHeightRefMap } = this;
    let { options } = context;
    let { cellRows, tableMode } = props;
    let rowCount = cellRows.length;
    let firstCellKey = cellRows[0]?.[0]?.key || "";
    let fgEventSegsByRow = this.splitFgEventSegs(props.fgEventSegs, rowCount);
    let bgEventSegsByRow = this.splitBgEventSegs(props.bgEventSegs, rowCount);
    let businessHourSegsByRow = this.splitBusinessHourSegs(props.businessHourSegs, rowCount);
    let dateSelectionSegsByRow = this.splitDateSelectionSegs(props.dateSelectionSegs, rowCount);
    let eventDragByRow = this.splitEventDrag(props.eventDrag, rowCount);
    let eventResizeByRow = this.splitEventResize(props.eventResize, rowCount);
    let isHeightAuto = getIsHeightAuto(options);
    let rowHeightsRedistribute = !props.forPrint && !isHeightAuto;
    let rowBasis = computeRowBasis(props.visibleWidth, rowCount, isHeightAuto, options);
    const needsMoreLinkProbe = !props.forPrint && resolveDayGridPlacementMode(props.dayMaxEvents, props.dayMaxEventRows) === "auto";
    const RowsTag = tableMode ? "tbody" : "div";
    return u(S, { children: [u(RowsTag, { role: "rowgroup", className: joinClassNames(
      props.className,
      // HACK for Safari. Can't do break-inside:avoid with flexbox items, likely b/c it's not standard:
      // https://stackoverflow.com/a/60256345
      !tableMode && !props.forPrint && classNames.flexCol
    ), style: tableMode ? void 0 : { width: props.width }, ref: this.handleRootEl, children: cellRows.map((cells, row) => u(DayGridRow, {
      role: "row",
      dateProfile: props.dateProfile,
      todayRange: props.todayRange,
      cells,
      cellIsNarrow: props.cellIsNarrow,
      cellIsMicro: props.cellIsMicro,
      showDayNumbers: rowCount > 1,
      showWeekNumbers: rowCount > 1 && options.weekNumbers,
      forPrint: props.forPrint,
      tableMode,
      borderBottom: row < rowCount - 1,
      // if not auto-height, distribute height of container somewhat evently to rows
      className: rowHeightsRedistribute ? classNames.grow : void 0,
      // content
      fgEventSegs: fgEventSegsByRow[row],
      bgEventSegs: bgEventSegsByRow[row],
      businessHourSegs: businessHourSegsByRow[row],
      dateSelectionSegs: dateSelectionSegsByRow[row],
      eventSelection: props.eventSelection,
      eventDrag: eventDragByRow[row],
      eventResize: eventResizeByRow[row],
      dayMaxEvents: props.dayMaxEvents,
      dayMaxEventRows: props.dayMaxEventRows,
      // dimensions
      colWidth: props.colWidth,
      basis: rowBasis,
      moreLinkHeight: state.moreLinkHeight,
      // refs
      heightRef: rowHeightRefMap.createRef(cells[0].key)
    }, firstCellKey + ":" + cells[0].key)) }), needsMoreLinkProbe && u(MoreLinkTrigger, { num: 1, display: "row", isNarrow: props.cellIsNarrow, isMicro: props.cellIsMicro, elRef: this.handleMoreLinkEl, className: classNames.offscreen, attrs: {
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
  // Hit System
  // -----------------------------------------------------------------------------------------------
  queryHit(isRtl, positionLeft, positionTop, elWidth) {
    const { props } = this;
    const colCount = props.cellRows[0].length;
    const { col, left, right } = computeColFromPosition(positionLeft, elWidth, props.colWidth, colCount, isRtl);
    const { row, top, bottom } = computeRowFromPosition(positionTop, props.cellRows, this.rowHeightRefMap.current);
    const cell = props.cellRows[row][col];
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
      getDayEl: () => getCellEl(getRowEl(this.rootEl, row), col),
      rect: {
        left,
        right,
        top,
        bottom
      },
      layer: 0
    };
  }
};
function isSegAllDay(seg) {
  return seg.eventRange.def.allDay;
}
function splitAllDaySegsByRow(segs, rowCnt) {
  return splitSegsByRow(segs.filter(isSegAllDay), rowCnt);
}
function computeRowBasis(visibleWidth, rowCount, isHeightAuto, options) {
  if (visibleWidth != null) {
    const rowBasis = visibleWidth / options.aspectRatio / 6;
    return rowCount > 6 || isHeightAuto ? rowBasis : 0;
  }
  return 0;
}
var DayGridHeaderCell = class extends BaseComponent {
  constructor() {
    super(...arguments);
    this.state = {};
    this.buildDayHeaderText = memoize(buildDayHeaderText);
    this.handleInnerEl = (innerEl) => {
      if (this.disconnectSize) {
        this.disconnectSize();
        this.disconnectSize = void 0;
      }
      if (innerEl) {
        this.disconnectSize = watchSize(innerEl, (width, height) => {
          if (this._isUnmounting)
            return;
          setRef(this.props.innerHeightRef, height);
          this.setState({ innerWidth: width });
        });
      } else {
        setRef(this.props.innerHeightRef, null);
      }
    };
  }
  render() {
    const { props, state, context } = this;
    const { renderConfig, dataConfig, tableMode } = props;
    const colSpan = dataConfig.colSpan || 1;
    const totalColWidth = props.colWidth != null ? props.colWidth * colSpan : void 0;
    const isLiquid = !tableMode && totalColWidth == null;
    const isSpanning = isLiquid && colSpan > 1;
    const style = tableMode ? void 0 : isSpanning ? {
      flexGrow: colSpan,
      flexBasis: 0,
      minWidth: 0
    } : {
      width: totalColWidth
    };
    const isDisabled = dataConfig.renderProps.isDisabled;
    const finalRenderProps = renderConfig.dayHeaderFormat ? this.buildDayHeaderRenderProps(dataConfig.renderProps, props.cellIsNarrow, props.rowLevel, props.cellIsMicro, dataConfig.dateMarker, renderConfig.dayHeaderFormat, Boolean(renderConfig.datesRepDistinctDays), context.dateEnv) : __spreadProps(__spreadValues({}, dataConfig.renderProps), {
      isNarrow: props.cellIsNarrow,
      level: props.rowLevel
    });
    const alignInput = renderConfig.align;
    const align = (
      // normalized string-enum value
      typeof alignInput === "function" ? alignInput({ level: props.rowLevel, inPopover: dataConfig.renderProps.inPopover, isNarrow: props.cellIsNarrow }) : alignInput
    );
    const stickyInput = renderConfig.sticky;
    const isSticky = !tableMode && props.rowLevel > 0 && stickyInput !== false && // if center-aligned, and wants to be sticky, must be >75% viewport width,
    // to avoid looking awkwardly aligned
    (align !== "center" || totalColWidth != null && props.viewportWidth != null && totalColWidth > props.viewportWidth * 0.75);
    let edgeCoord;
    if (isSticky) {
      if (align === "center") {
        if (state.innerWidth != null) {
          edgeCoord = `calc(50% - ${state.innerWidth / 2}px)`;
        }
      } else {
        edgeCoord = typeof stickyInput === "number" || typeof stickyInput === "string" ? stickyInput : 0;
      }
    }
    const alignClassName = align === "center" ? classNames.alignCenter : align === "end" ? classNames.alignEnd : classNames.alignStart;
    const CellTag = tableMode ? "th" : "div";
    return u(ContentContainer, { tag: CellTag, attrs: __spreadValues({
      role: "columnheader",
      "aria-colspan": dataConfig.colSpan,
      colSpan: tableMode ? colSpan : void 0
    }, dataConfig.attrs), className: joinClassNames(dataConfig.className, classNames.noMargin, classNames.noPadding, !tableMode && classNames.flexCol, classNames.borderlessTop, classNames.borderlessEnd, !props.borderStart && classNames.borderlessStart, !(tableMode && props.borderBottom) && classNames.borderlessBottom, !tableMode && alignClassName, isLiquid && !isSpanning && classNames.liquid, !isSticky && classNames.crop), style, renderProps: finalRenderProps, generatorName: renderConfig.generatorName, customGenerator: renderConfig.customGenerator, defaultGenerator: renderText, classNameGenerator: (
      // don't use custom classNames if disabled
      // TODO: make DRY with DayCellContainer
      isDisabled ? void 0 : renderConfig.classNameGenerator
    ), didMount: renderConfig.didMount, willUnmount: renderConfig.willUnmount, children: (InnerContainer) => u("div", { ref: this.handleInnerEl, className: joinClassNames(classNames.flexCol, classNames.noShrink, classNames.whiteSpaceNoWrap, tableMode && alignClassName, isSticky && classNames.sticky), style: {
      left: edgeCoord,
      right: edgeCoord
    }, children: u(InnerContainer, { tag: "div", attrs: dataConfig.innerAttrs, className: generateClassName(renderConfig.innerClassNameGenerator, finalRenderProps) }) }) });
  }
  componentDidMount() {
    this._isUnmounting = false;
  }
  componentWillUnmount() {
    this._isUnmounting = true;
  }
  buildDayHeaderRenderProps(renderProps, cellIsNarrow, rowLevel, cellIsMicro, dateMarker, dayHeaderFormat, datesRepDistinctDays, dateEnv) {
    const baseText = this.buildDayHeaderText(datesRepDistinctDays ? dateMarker : renderProps.date, dayHeaderFormat, datesRepDistinctDays, dateEnv);
    const textData = cellIsMicro ? this.buildDayHeaderText(dateMarker, dayHeaderMicroFormat, false, dateEnv) : baseText;
    return __spreadProps(__spreadValues({}, renderProps), {
      isNarrow: cellIsNarrow,
      level: rowLevel,
      text: textData.text,
      textParts: textData.textParts,
      weekdayText: cellIsMicro ? textData.text : baseText.weekdayText,
      dayNumberText: baseText.dayNumberText
    });
  }
};
function buildDayHeaderText(date, formatter, includeDayNumber, dateEnv) {
  const textParts = dateEnv.formatToParts(date, formatter);
  return {
    text: joinDateTimeFormatParts(textParts),
    textParts,
    weekdayText: findWeekdayText(textParts),
    dayNumberText: includeDayNumber ? findDayNumberText(textParts) : ""
  };
}
var DayGridHeaderRow = class extends BaseComponent {
  constructor() {
    super(...arguments);
    this.innerHeightRefMap = new RefMap(() => {
      afterSize(this.handleInnerHeights);
    });
    this.handleInnerHeights = () => {
      if (this._isUnmounting)
        return;
      const innerHeightMap = this.innerHeightRefMap.current;
      let max = 0;
      for (const innerHeight of innerHeightMap.values()) {
        max = Math.max(max, innerHeight);
      }
      if (this.currentInnerHeight !== max) {
        this.currentInnerHeight = max;
        setRef(this.props.innerHeightRef, max);
      }
    };
  }
  render() {
    const { props, context } = this;
    const { tableMode } = props;
    const { options } = context;
    const RowTag = tableMode ? "tr" : "div";
    return u(RowTag, { role: props.role, "aria-rowindex": props.rowIndex != null ? 1 + props.rowIndex : void 0, className: joinClassNames(options.dayHeaderRowClass, props.className, tableMode && classNames.borderless, !tableMode && classNames.flexRow, !tableMode && classNames.contentBox, !tableMode && classNames.borderlessX, !tableMode && classNames.borderlessTop, !tableMode && !props.borderBottom && classNames.borderlessBottom), style: {
      height: props.height
    }, children: props.dataConfigs.map((dataConfig, cellI) => u(DayGridHeaderCell, { renderConfig: props.renderConfig, dataConfig, borderStart: Boolean(cellI), colWidth: props.colWidth, viewportWidth: props.viewportWidth, innerHeightRef: this.innerHeightRefMap.createRef(dataConfig.key), cellIsNarrow: props.cellIsNarrow, cellIsMicro: props.cellIsMicro, rowLevel: props.rowLevel, tableMode, borderBottom: props.borderBottom }, dataConfig.key)) });
  }
  componentDidMount() {
    this._isUnmounting = false;
  }
  componentWillUnmount() {
    this._isUnmounting = true;
    this.currentInnerHeight = void 0;
    setRef(this.props.innerHeightRef, null);
  }
};
var DayGridHeaderRows = class extends BaseComponent {
  render() {
    const { props } = this;
    const { headerTiers, tableMode } = props;
    return headerTiers.map((rowConfig, i) => k(DayGridHeaderRow, __spreadProps(__spreadValues({}, rowConfig), { key: i, role: "row", borderBottom: i < headerTiers.length - 1, colWidth: props.colWidth, viewportWidth: props.viewportWidth, cellIsNarrow: props.cellIsNarrow, cellIsMicro: props.cellIsMicro, rowLevel: headerTiers.length - i - 1, tableMode })));
  }
};
var DayGridLayoutPrint = class extends BaseComponent {
  render() {
    const { props, context } = this;
    const { options } = context;
    const tableDisplayInfo = {
      borderlessX: props.borderlessX,
      borderlessTop: props.borderlessTop,
      borderlessBottom: props.borderlessBottom,
      multiMonthColumns: props.multiMonthColumns
    };
    return u("table", { role: "presentation", className: joinClassNames(generateClassName(options.tableClass, tableDisplayInfo), classNames.printTable), style: props.style, children: [u("colgroup", { children: props.cellRows[0].map((cell) => u("col", {}, cell.key)) }), props.showHeader && u("thead", { ref: props.headerElRef, role: "rowgroup", className: generateClassName(options.tableHeaderClass, __spreadProps(__spreadValues({}, tableDisplayInfo), {
      isSticky: false
    })), children: [u(DayGridHeaderRows, { tableMode: true, headerTiers: props.headerTiers, cellIsNarrow: props.cellIsNarrow, cellIsMicro: props.cellIsMicro }), u("tr", { role: "presentation", children: u("th", { role: "presentation", colSpan: props.cellRows[0].length, className: joinClassNames(classNames.noPadding, generateClassName(options.dayHeaderDividerClass, {
      isSticky: false,
      multiMonthColumns: props.multiMonthColumns,
      options: { allDaySlot: Boolean(options.allDaySlot) }
    })) }) })] }), u(DayGridRows, { dateProfile: props.dateProfile, todayRange: props.todayRange, cellRows: props.cellRows, forPrint: true, tableMode: true, className: generateClassName(options.tableBodyClass, tableDisplayInfo), dayMaxEvents: void 0, dayMaxEventRows: props.dayMaxEventRows, fgEventSegs: props.fgEventSegs, bgEventSegs: props.bgEventSegs, businessHourSegs: props.businessHourSegs, dateSelectionSegs: [], eventDrag: null, eventResize: null, eventSelection: props.eventSelection, visibleWidth: props.visibleWidth, cellIsNarrow: props.cellIsNarrow, cellIsMicro: props.cellIsMicro, rowHeightRefMap: props.rowHeightRefMap })] });
  }
};

// node_modules/fullcalendar/chunks/64c4ade2.js
var DayGridHeader = class extends BaseComponent {
  render() {
    const { props } = this;
    return u("div", { role: "rowgroup", className: joinClassNames(props.className, classNames.flexCol, props.width == null && classNames.liquid), style: {
      width: props.width
    }, children: u(DayGridHeaderRows, { headerTiers: props.headerTiers, colWidth: props.colWidth, viewportWidth: props.viewportWidth, cellIsNarrow: props.cellIsNarrow, cellIsMicro: props.cellIsMicro }) });
  }
};
var DayGridLayoutNormal = class extends BaseComponent {
  constructor() {
    super(...arguments);
    this.state = {};
    this.handleScroller = (scroller) => {
      setRef(this.props.scrollerRef, scroller);
    };
    this.handleTotalWidth = (totalWidth) => {
      if (this._isUnmounting)
        return;
      this.setState({ totalWidth });
    };
    this.handleClientWidth = (clientWidth) => {
      if (this._isUnmounting)
        return;
      this.setState({ clientWidth });
    };
  }
  render() {
    const { props, state, context } = this;
    const { options } = context;
    const { borderlessX, borderlessTop, borderlessBottom } = computeViewBorderless(options);
    const { totalWidth, clientWidth } = state;
    let endScrollbarWidth = totalWidth != null && clientWidth != null ? totalWidth - clientWidth : void 0;
    if (endScrollbarWidth < 3) {
      endScrollbarWidth = 0;
    }
    const verticalScrollbars = !props.forPrint && !getIsHeightAuto(options);
    const tableHeaderSticky = !props.forPrint && getTableHeaderSticky(options);
    const colCount = props.cellRows[0].length;
    const measuredColWidth = clientWidth != null ? clientWidth / colCount : void 0;
    const cellIsMicro = measuredColWidth != null && measuredColWidth <= dayMicroWidth;
    const cellIsNarrow = cellIsMicro || measuredColWidth != null && measuredColWidth <= options.dayNarrowWidth;
    if (props.forPrint) {
      return u(DayGridLayoutPrint, { dateProfile: props.dateProfile, todayRange: props.todayRange, cellRows: props.cellRows, headerTiers: props.headerTiers, showHeader: Boolean(options.dayHeaders), fgEventSegs: props.fgEventSegs, bgEventSegs: props.bgEventSegs, businessHourSegs: props.businessHourSegs, eventSelection: props.eventSelection, dayMaxEventRows: options.dayMaxEventRows, borderlessX, borderlessTop, borderlessBottom, multiMonthColumns: 0, visibleWidth: totalWidth, cellIsNarrow, cellIsMicro, rowHeightRefMap: props.rowHeightRefMap });
    }
    return u(S, { children: [options.dayHeaders && u("div", { className: joinClassNames(generateClassName(options.tableHeaderClass, {
      isSticky: tableHeaderSticky,
      borderlessX,
      borderlessTop,
      borderlessBottom,
      multiMonthColumns: 0
    }), classNames.flexCol, tableHeaderSticky && classNames.tableHeaderSticky), children: [u("div", { className: classNames.flexRow, children: [u(DayGridHeader, { headerTiers: props.headerTiers, cellIsNarrow, cellIsMicro }), Boolean(endScrollbarWidth) && u("div", { className: joinClassNames(generateClassName(options.fillerClass, { inTableHeader: true }), classNames.borderlessY, classNames.borderlessEnd), style: { minWidth: endScrollbarWidth } })] }), u("div", { className: generateClassName(options.dayHeaderDividerClass, {
      isSticky: tableHeaderSticky,
      multiMonthColumns: 0,
      options: { allDaySlot: Boolean(options.allDaySlot) }
    }) })] }), u(Scroller, { vertical: verticalScrollbars, className: joinClassNames(
      generateClassName(options.tableBodyClass, {
        borderlessX,
        borderlessTop,
        borderlessBottom,
        multiMonthColumns: 0
      }),
      // HACK for Safari. Can't do break-inside:avoid with flexbox items, likely b/c it's not standard:
      // https://stackoverflow.com/a/60256345
      !props.forPrint && classNames.flexCol,
      verticalScrollbars && classNames.liquid
    ), ref: this.handleScroller, clientWidthRef: this.handleClientWidth, children: u(DayGridRows, {
      dateProfile: props.dateProfile,
      todayRange: props.todayRange,
      cellRows: props.cellRows,
      forPrint: props.forPrint,
      isHitComboAllowed: props.isHitComboAllowed,
      className: classNames.grow,
      dayMaxEvents: props.forPrint ? void 0 : options.dayMaxEvents,
      dayMaxEventRows: options.dayMaxEventRows,
      // content
      fgEventSegs: props.fgEventSegs,
      bgEventSegs: props.bgEventSegs,
      businessHourSegs: props.businessHourSegs,
      dateSelectionSegs: props.dateSelectionSegs,
      eventDrag: props.eventDrag,
      eventResize: props.eventResize,
      eventSelection: props.eventSelection,
      // dimensions
      visibleWidth: totalWidth,
      cellIsNarrow,
      cellIsMicro,
      // refs
      rowHeightRefMap: props.rowHeightRefMap
    }) }), u(Ruler, { widthRef: this.handleTotalWidth })] });
  }
  componentDidMount() {
    this._isUnmounting = false;
  }
  componentWillUnmount() {
    this._isUnmounting = true;
  }
};
var FooterScrollbar = class extends BaseComponent {
  constructor() {
    super(...arguments);
    this.rootElRef = M();
  }
  render() {
    const { props } = this;
    return u("div", { ref: this.rootElRef, className: joinClassNames(classNames.footerScrollbar, props.isSticky && classNames.footerScrollbarSticky), children: u(Scroller, { horizontal: true, ref: props.scrollerRef, children: u("div", { style: { minWidth: props.canvasWidth } }) }) });
  }
  componentDidMount() {
    this._isUnmounting = false;
    this.disconnectHeight = watchHeight(this.rootElRef.current, (height) => {
      if (this._isUnmounting)
        return;
      setRef(this.props.scrollbarWidthRef, height);
    });
  }
  componentWillUnmount() {
    this._isUnmounting = true;
    this.disconnectHeight();
    setRef(this.props.scrollbarWidthRef, null);
  }
};
var DayGridLayoutPannable = class extends BaseComponent {
  constructor() {
    super(...arguments);
    this.state = {};
    this.headerScrollerRef = M();
    this.bodyScrollerRef = M();
    this.footerScrollerRef = M();
    this.handleTotalWidth = (totalWidth) => {
      if (this._isUnmounting)
        return;
      this.setState({ totalWidth });
    };
    this.handleClientWidth = (clientWidth) => {
      if (this._isUnmounting)
        return;
      this.setState({ clientWidth });
    };
  }
  render() {
    const { props, state, context } = this;
    const { options } = context;
    const { borderlessX, borderlessTop, borderlessBottom } = computeViewBorderless(options);
    const { totalWidth, clientWidth } = state;
    const endScrollbarWidth = totalWidth != null && clientWidth != null ? totalWidth - clientWidth : void 0;
    const verticalScrollbars = !props.forPrint && !getIsHeightAuto(options);
    const tableHeaderSticky = !props.forPrint && getTableHeaderSticky(options);
    const footerScrollbarSticky = !props.forPrint && getFooterScrollbarSticky(options);
    const colCount = props.cellRows[0].length;
    const [canvasWidth, appliedColWidth] = computeColWidth(colCount, props.dayMinWidth, clientWidth);
    const measuredColWidth = appliedColWidth ?? (clientWidth != null ? clientWidth / colCount : void 0);
    const cellIsMicro = measuredColWidth != null && measuredColWidth <= dayMicroWidth;
    const cellIsNarrow = cellIsMicro || measuredColWidth != null && measuredColWidth <= options.dayNarrowWidth;
    if (props.forPrint) {
      return u(DayGridLayoutPrint, { dateProfile: props.dateProfile, todayRange: props.todayRange, cellRows: props.cellRows, headerTiers: props.headerTiers, showHeader: Boolean(options.dayHeaders), fgEventSegs: props.fgEventSegs, bgEventSegs: props.bgEventSegs, businessHourSegs: props.businessHourSegs, eventSelection: props.eventSelection, dayMaxEventRows: options.dayMaxEventRows, borderlessX, borderlessTop, borderlessBottom, multiMonthColumns: 0, visibleWidth: totalWidth, cellIsNarrow, cellIsMicro, rowHeightRefMap: props.rowHeightRefMap });
    }
    return u(S, { children: [options.dayHeaders && u("div", { className: joinClassNames(generateClassName(options.tableHeaderClass, {
      isSticky: tableHeaderSticky,
      borderlessX,
      borderlessTop,
      borderlessBottom,
      multiMonthColumns: 0
    }), classNames.flexCol, tableHeaderSticky && classNames.tableHeaderSticky), children: [u(Scroller, { horizontal: true, hideScrollbars: true, className: classNames.flexRow, ref: this.headerScrollerRef, children: [u(DayGridHeader, { headerTiers: props.headerTiers, colWidth: appliedColWidth, viewportWidth: clientWidth, width: canvasWidth, cellIsNarrow, cellIsMicro }), Boolean(endScrollbarWidth) && u("div", { className: joinClassNames(generateClassName(options.fillerClass, { inTableHeader: true }), classNames.borderlessY, classNames.borderlessEnd), style: { minWidth: endScrollbarWidth } })] }), u("div", { className: generateClassName(options.dayHeaderDividerClass, {
      isSticky: tableHeaderSticky,
      multiMonthColumns: 0,
      options: { allDaySlot: Boolean(options.allDaySlot) }
    }) })] }), u(Scroller, {
      vertical: verticalScrollbars,
      horizontal: true,
      hideScrollbars: footerScrollbarSticky || props.forPrint,
      className: joinClassNames(
        generateClassName(options.tableBodyClass, {
          borderlessX,
          borderlessTop,
          borderlessBottom,
          multiMonthColumns: 0
        }),
        // HACK for Safari. Can't do break-inside:avoid with flexbox items, likely b/c it's not standard:
        // https://stackoverflow.com/a/60256345
        !props.forPrint && classNames.flexCol,
        verticalScrollbars && classNames.liquid
      ),
      ref: this.bodyScrollerRef,
      clientWidthRef: this.handleClientWidth,
      children: u(DayGridRows, {
        dateProfile: props.dateProfile,
        todayRange: props.todayRange,
        cellRows: props.cellRows,
        forPrint: props.forPrint,
        isHitComboAllowed: props.isHitComboAllowed,
        className: classNames.grow,
        dayMaxEvents: props.forPrint ? void 0 : options.dayMaxEvents,
        dayMaxEventRows: options.dayMaxEventRows,
        // content
        fgEventSegs: props.fgEventSegs,
        bgEventSegs: props.bgEventSegs,
        businessHourSegs: props.businessHourSegs,
        dateSelectionSegs: props.dateSelectionSegs,
        eventDrag: props.eventDrag,
        eventResize: props.eventResize,
        eventSelection: props.eventSelection,
        // dimensions
        colWidth: appliedColWidth,
        width: canvasWidth,
        visibleWidth: totalWidth,
        cellIsNarrow,
        cellIsMicro,
        // refs
        rowHeightRefMap: props.rowHeightRefMap
      })
    }), Boolean(footerScrollbarSticky) && u(FooterScrollbar, { isSticky: true, canvasWidth, scrollerRef: this.footerScrollerRef }), u(Ruler, { widthRef: this.handleTotalWidth })] });
  }
  // Lifecycle
  // -----------------------------------------------------------------------------------------------
  componentDidMount() {
    this._isUnmounting = false;
    const ScrollerSyncer = getScrollerSyncerClass(this.context.pluginHooks);
    this.syncedScroller = new ScrollerSyncer(true);
    setRef(this.props.scrollerRef, this.syncedScroller);
    this.updateSyncedScroller();
  }
  componentDidUpdate() {
    this.updateSyncedScroller();
  }
  componentWillUnmount() {
    this._isUnmounting = true;
    this.syncedScroller.destroy();
  }
  // Scrolling
  // -----------------------------------------------------------------------------------------------
  updateSyncedScroller() {
    this.syncedScroller.handleChildren([
      this.headerScrollerRef.current,
      this.bodyScrollerRef.current,
      this.footerScrollerRef.current
    ]);
  }
};
var DayGridLayout = class extends BaseComponent {
  constructor() {
    super(...arguments);
    this.scrollerRef = M();
    this.rowHeightRefMap = new RefMap(() => {
      afterSize(this.updateScrollY);
    });
    this.scrollDate = null;
    this.updateScrollY = () => {
      if (this._isUnmounting)
        return;
      const rowHeightMap = this.rowHeightRefMap.current;
      const scroller = this.scrollerRef.current;
      if (scroller && this.scrollDate) {
        let scrollTop = computeTopFromDate(this.scrollDate, this.props.cellRows, rowHeightMap);
        if (scrollTop != null) {
          if (scrollTop) {
            scrollTop++;
          }
          scroller.scrollTo({ y: scrollTop });
        }
      }
    };
    this.handleScrollEnd = (isDevice) => {
      if (isDevice) {
        this.scrollDate = null;
      }
    };
  }
  render() {
    const { props, context } = this;
    const { options } = context;
    const { borderlessX, borderlessTop, borderlessBottom } = computeViewBorderless(options);
    const dateSelectionSegs = props.forPrint ? [] : props.dateSelectionSegs;
    const eventDrag = props.forPrint ? null : props.eventDrag;
    const eventResize = props.forPrint ? null : props.eventResize;
    const commonLayoutProps = __spreadProps(__spreadValues({}, props), {
      dateSelectionSegs,
      eventDrag,
      eventResize,
      scrollerRef: this.scrollerRef,
      rowHeightRefMap: this.rowHeightRefMap
    });
    return u(ViewContainer, { viewSpec: context.viewSpec, attrs: {
      role: "grid",
      "aria-rowcount": props.headerTiers.length + props.cellRows.length,
      "aria-colcount": props.cellRows[0].length,
      "aria-labelledby": props.labelId,
      "aria-label": props.labelStr
    }, className: joinClassNames(props.className, !props.forPrint && classNames.flexCol, !props.forPrint && generateClassName(options.tableClass, {
      borderlessX,
      borderlessTop,
      borderlessBottom,
      multiMonthColumns: 0
    })), children: options.dayMinWidth ? u(DayGridLayoutPannable, __spreadProps(__spreadValues({}, commonLayoutProps), { dayMinWidth: options.dayMinWidth })) : u(DayGridLayoutNormal, __spreadValues({}, commonLayoutProps)) });
  }
  // Lifecycle
  // -----------------------------------------------------------------------------------------------
  componentDidMount() {
    this._isUnmounting = false;
    if (!this.props.forPrint) {
      this.resetScroll();
      this.scrollerRef.current?.addScrollEndListener(this.handleScrollEnd);
    }
  }
  componentDidUpdate(prevProps) {
    if (prevProps.forPrint && !this.props.forPrint) {
      this.scrollerRef.current?.addScrollEndListener(this.handleScrollEnd);
      this.resetScroll();
    }
    if (prevProps.dateProfile !== this.props.dateProfile && this.context.options.scrollTimeReset) {
      this.resetScroll();
    }
  }
  componentWillUnmount() {
    this._isUnmounting = true;
    this.scrollerRef.current?.removeScrollEndListener(this.handleScrollEnd);
  }
  // Scrolling
  // -----------------------------------------------------------------------------------------------
  resetScroll() {
    this.scrollDate = this.props.dateProfile.currentDate;
    this.updateScrollY();
    this.scrollerRef.current?.scrollTo({ x: 0 });
  }
};

export {
  DateProfileGenerator,
  isMajorUnit,
  Slicer,
  DayTableSlicer,
  DaySeriesSlicer,
  buildDateRowConfigs,
  RefMap,
  Ruler,
  BgEvent,
  renderFill,
  MoreLinkTrigger,
  MoreLinkContainer,
  findIntersections,
  buildSegLevels,
  convertSegsToWholeSlices,
  groupLaterallyIntersecting,
  sortByAxisOrder,
  resolveDayGridPlacementMode,
  DayGridRow,
  DaySeriesModel,
  buildDayTableModel,
  computeColWidth,
  computeColFromPosition,
  getCellEl,
  dayMicroWidth,
  createDayHeaderFormatter,
  DayGridHeaderRow,
  FooterScrollbar,
  DayGridLayout
};
//# sourceMappingURL=chunk-JHXEUXOT.js.map
