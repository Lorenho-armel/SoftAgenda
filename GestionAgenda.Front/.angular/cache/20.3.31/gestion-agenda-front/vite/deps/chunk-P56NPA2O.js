import {
  DateProfileGenerator,
  DayGridLayout,
  DayTableSlicer,
  buildDateRowConfigs,
  buildDayTableModel,
  createDayHeaderFormatter
} from "./chunk-JHXEUXOT.js";
import {
  BaseComponent,
  NowTimer,
  memoize
} from "./chunk-GX5FAIHT.js";
import {
  addDays,
  addWeeks,
  diffWeeks
} from "./chunk-43C3ZVMA.js";
import {
  u
} from "./chunk-GOSSR2CB.js";

// node_modules/fullcalendar/chunks/3057f12c.js
var TableDateProfileGenerator = class extends DateProfileGenerator {
  // Computes the date range that will be rendered
  buildRenderRange(currentRange, currentRangeUnit, isRangeAllDay) {
    let renderRange = super.buildRenderRange(currentRange, currentRangeUnit, isRangeAllDay);
    let { props } = this;
    return buildDayTableRenderRange({
      currentRange: renderRange,
      // ???
      snapToWeek: /^(year|month)$/.test(currentRangeUnit),
      fixedWeekCount: props.fixedWeekCount,
      dateEnv: props.dateEnv
    });
  }
};
function buildDayTableRenderRange(props) {
  let { dateEnv, currentRange } = props;
  let { start, end } = currentRange;
  let endOfWeek;
  if (props.snapToWeek) {
    start = dateEnv.startOfWeek(start);
    endOfWeek = dateEnv.startOfWeek(end);
    if (endOfWeek.valueOf() !== end.valueOf()) {
      end = addWeeks(endOfWeek, 1);
    }
  }
  if (props.fixedWeekCount) {
    let lastMonthRenderStart = dateEnv.startOfWeek(dateEnv.startOfMonth(addDays(currentRange.end, -1)));
    let rowCount = Math.ceil(
      // could be partial weeks due to hiddenDays
      diffWeeks(lastMonthRenderStart, end)
    );
    end = addWeeks(end, 6 - rowCount);
  }
  return { start, end };
}

// node_modules/fullcalendar/chunks/d7bcc98b.js
var DayGridView = class extends BaseComponent {
  constructor() {
    super(...arguments);
    this.buildDayTableModel = memoize(buildDayTableModel);
    this.buildDateRowConfigs = memoize(buildDateRowConfigs);
    this.createDayHeaderFormatter = memoize(createDayHeaderFormatter);
    this.slicer = new DayTableSlicer();
  }
  render() {
    const { props, context } = this;
    const { dateProfile } = props;
    const { options, dateEnv } = context;
    const dayTableModel = this.buildDayTableModel(dateProfile, context.dateProfileGenerator, dateEnv);
    const datesRepDistinctDays = dayTableModel.rowCount === 1;
    const dayHeaderFormat = this.createDayHeaderFormatter(context.options.dayHeaderFormat, datesRepDistinctDays, dayTableModel.colCount);
    const slicedProps = this.slicer.sliceProps(props, dateProfile, options.nextDayThreshold, context, dayTableModel);
    return u(NowTimer, { unit: "day", children: (nowDate, todayRange) => {
      const headerTiers = this.buildDateRowConfigs(dayTableModel.headerDates, datesRepDistinctDays, dateProfile, todayRange, dayHeaderFormat, context);
      return u(DayGridLayout, {
        labelId: props.labelId,
        labelStr: props.labelStr,
        dateProfile,
        todayRange,
        cellRows: dayTableModel.cellRows,
        forPrint: props.forPrint,
        className: props.className,
        // header content
        headerTiers,
        // body content
        fgEventSegs: slicedProps.fgEventSegs,
        bgEventSegs: slicedProps.bgEventSegs,
        businessHourSegs: slicedProps.businessHourSegs,
        dateSelectionSegs: slicedProps.dateSelectionSegs,
        eventDrag: slicedProps.eventDrag,
        eventResize: slicedProps.eventResize,
        eventSelection: slicedProps.eventSelection
      });
    } });
  }
};
var dayGridPlugin = {
  name: "daygrid",
  initialView: "dayGridMonth",
  views: {
    dayGrid: {
      component: DayGridView,
      dateProfileGeneratorClass: TableDateProfileGenerator
    },
    dayGridDay: {
      type: "dayGrid",
      duration: { days: 1 }
    },
    dayGridWeek: {
      type: "dayGrid",
      duration: { weeks: 1 }
    },
    dayGridMonth: {
      type: "dayGrid",
      duration: { months: 1 },
      fixedWeekCount: true
    },
    dayGridYear: {
      type: "dayGrid",
      duration: { years: 1 }
    }
  }
};

export {
  dayGridPlugin
};
//# sourceMappingURL=chunk-P56NPA2O.js.map
