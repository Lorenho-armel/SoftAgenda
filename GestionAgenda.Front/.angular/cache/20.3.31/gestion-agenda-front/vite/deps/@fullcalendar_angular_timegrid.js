import {
  AllDaySplitter,
  DayTimeColsSlicer,
  TimeGridLayout,
  buildDayColsFromSeries,
  organizeSegsByCol,
  splitInteractionByCol
} from "./chunk-LS63Y2HS.js";
import {
  dayGridPlugin
} from "./chunk-P56NPA2O.js";
import {
  DaySeriesModel,
  DaySeriesSlicer,
  buildDateRowConfigs,
  createDayHeaderFormatter
} from "./chunk-JHXEUXOT.js";
import "./chunk-MPQAZ5OY.js";
import {
  DateComponent,
  NowTimer,
  memoize
} from "./chunk-GX5FAIHT.js";
import "./chunk-43C3ZVMA.js";
import {
  u
} from "./chunk-GOSSR2CB.js";
import "./chunk-3AK7CWDL.js";
import "./chunk-J25FJFZE.js";

// node_modules/fullcalendar/chunks/4ec5fb96.js
var TimeGridView = class extends DateComponent {
  constructor() {
    super(...arguments);
    this.createDayHeaderFormatter = memoize(createDayHeaderFormatter);
    this.buildDaySeries = memoize((dateProfile, dateProfileGenerator) => new DaySeriesModel(dateProfile.renderRange, dateProfileGenerator));
    this.buildDayCols = memoize(buildDayColsFromSeries);
    this.extractColDates = memoize((cols) => cols.map((col) => col.date));
    this.extractColRanges = memoize((cols) => cols.map((col) => col.range));
    this.buildDateRowConfigs = memoize(buildDateRowConfigs);
    this.splitFgEventSegs = memoize(organizeSegsByCol);
    this.splitBgEventSegs = memoize(organizeSegsByCol);
    this.splitBusinessHourSegs = memoize(organizeSegsByCol);
    this.splitNowIndicatorSegs = memoize(organizeSegsByCol);
    this.splitDateSelectionSegs = memoize(organizeSegsByCol);
    this.splitEventDrag = memoize(splitInteractionByCol);
    this.splitEventResize = memoize(splitInteractionByCol);
    this.allDaySplitter = new AllDaySplitter();
    this.daySeriesSlicer = new DaySeriesSlicer();
    this.dayTimeColsSlicer = new DayTimeColsSlicer();
  }
  render() {
    const { props, context } = this;
    const { dateProfile } = props;
    const { options, dateProfileGenerator } = context;
    const daySeries = this.buildDaySeries(dateProfile, dateProfileGenerator);
    const cols = this.buildDayCols(daySeries, context.dateEnv, {
      slotRange: dateProfile,
      activeRange: dateProfile.activeRange
    });
    const colDates = this.extractColDates(cols);
    const dayRanges = this.extractColRanges(cols);
    const splitProps = this.allDaySplitter.splitProps(props);
    const allDayProps = this.daySeriesSlicer.sliceProps(splitProps.allDay, dateProfile, options.nextDayThreshold, context, daySeries);
    const timedProps = this.dayTimeColsSlicer.sliceProps(splitProps.timed, dateProfile, null, context, dayRanges);
    const dayHeaderFormat = this.createDayHeaderFormatter(
      context.options.dayHeaderFormat,
      true,
      // datesRepDistinctDays
      cols.length
    );
    return u(NowTimer, { unit: options.nowIndicator ? "minute" : "day", children: (nowDate, todayRange, nowMs) => {
      const colCount = cols.length;
      const nowIndicatorSeg = !props.forPrint && options.nowIndicator && this.dayTimeColsSlicer.sliceNowDate(nowDate, dateProfile, options.nextDayThreshold, context, dayRanges);
      const fgEventSegsByCol = this.splitFgEventSegs(timedProps.fgEventSegs, colCount);
      const bgEventSegsByCol = this.splitBgEventSegs(timedProps.bgEventSegs, colCount);
      const businessHourSegsByCol = this.splitBusinessHourSegs(timedProps.businessHourSegs, colCount);
      const nowIndicatorSegsByCol = this.splitNowIndicatorSegs(nowIndicatorSeg, colCount);
      const dateSelectionSegsByCol = this.splitDateSelectionSegs(timedProps.dateSelectionSegs, colCount);
      const eventDragByCol = this.splitEventDrag(timedProps.eventDrag, colCount);
      const eventResizeByCol = this.splitEventResize(timedProps.eventResize, colCount);
      const headerTiers = this.buildDateRowConfigs(
        colDates,
        true,
        // datesRepDistinctDays
        props.dateProfile,
        todayRange,
        dayHeaderFormat,
        context
      );
      return u(TimeGridLayout, {
        labelId: props.labelId,
        labelStr: props.labelStr,
        dateProfile,
        nowDate,
        nowMs,
        todayRange,
        cells: cols,
        forPrint: props.forPrint,
        className: props.className,
        // header content
        headerTiers,
        // all-day content
        fgEventSegs: allDayProps.fgEventSegs,
        bgEventSegs: allDayProps.bgEventSegs,
        businessHourSegs: allDayProps.businessHourSegs,
        dateSelectionSegs: allDayProps.dateSelectionSegs,
        eventDrag: allDayProps.eventDrag,
        eventResize: allDayProps.eventResize,
        // timed content
        fgEventSegsByCol,
        bgEventSegsByCol,
        businessHourSegsByCol,
        nowIndicatorSegsByCol,
        dateSelectionSegsByCol,
        eventDragByCol,
        eventResizeByCol,
        // universal content
        eventSelection: props.eventSelection
      });
    } });
  }
};
var timeGridPlugin = {
  name: "timegrid",
  initialView: "timeGridWeek",
  deps: [dayGridPlugin],
  views: {
    timeGrid: {
      component: TimeGridView,
      usesMinMaxTime: true,
      // indicates that slotMinTime/slotMaxTime affects rendering
      allDaySlot: true,
      slotDuration: "00:30:00",
      slotEventOverlap: true
      // a bad name. confused with overlap/constraint system
    },
    timeGridDay: {
      type: "timeGrid",
      duration: { days: 1 }
    },
    timeGridWeek: {
      type: "timeGrid",
      duration: { weeks: 1 }
    }
  }
};
export {
  timeGridPlugin as default
};
//# sourceMappingURL=@fullcalendar_angular_timegrid.js.map
