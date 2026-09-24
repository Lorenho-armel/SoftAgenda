import {
  joinClassNames
} from "./chunk-3AK7CWDL.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-J25FJFZE.js";

// node_modules/temporal-polyfill/chunks/root.js
var NativeTemporal = globalThis.Temporal;

// node_modules/temporal-utils/dist/errorMessages.js
var expectedPositive = (entityName, num) => `Non-positive ${entityName}: ${num}`;
var expectedFinite = (entityName, num) => `Non-finite ${entityName}: ${num}`;
var forbiddenBigIntToNumber = (entityName) => `Cannot convert bigint to ${entityName}`;
var invalidObject = "Invalid object";
var numberOutOfRange = (entityName, val, min, max) => invalidEntity(entityName, val) + `; must be between ${min}-${max}`;
var invalidEntity = (fieldName, val) => `Invalid ${fieldName}: ${val}`;
var unsupportedWeekNumbers = "Calendar week operations forbidden";

// node_modules/temporal-utils/dist/utils.js
var nanoInMicro = 1e3;
var nanoInMilli = 1e6;
var nanoInSec = 1e9;
var nanoInMinute = 6e10;
var nanoInHour = 36e11;
function normalizeOptions(options) {
  if (options === void 0) {
    return /* @__PURE__ */ Object.create(null);
  }
  return requireObjectLike(options);
}
function toFiniteNumber(arg, entityName = "number") {
  if (typeof arg === "bigint") {
    throw new TypeError(forbiddenBigIntToNumber(entityName));
  }
  arg = Number(arg);
  if (!Number.isFinite(arg)) {
    throw new RangeError(expectedFinite(entityName, arg));
  }
  return arg;
}
function toIntegerWithTrunc(arg, entityName) {
  return Math.trunc(toFiniteNumber(arg, entityName)) || 0;
}
function toPositiveIntegerWithTruncation(arg, entityName) {
  return requireNumberIsPositive(toIntegerWithTrunc(arg, entityName), entityName);
}
function requireNumberIsPositive(num, entityName = "number") {
  if (num <= 0) {
    throw new RangeError(expectedPositive(entityName, num));
  }
  return num;
}
function constrainToRange(num, min, max) {
  return Math.min(Math.max(num, min), max);
}
function isObjectLike(arg) {
  return arg !== null && (typeof arg === "object" || typeof arg === "function");
}
function requireObjectLike(arg) {
  if (!isObjectLike(arg)) {
    throw new TypeError(invalidObject);
  }
  return arg;
}

// node_modules/temporal-utils/dist/diff.js
function createDiffFunc(unit) {
  return (date0, date1, options) => {
    const normOptions = normalizeDiffOptions(options);
    if (normOptions.roundingMode || normOptions.roundingIncrement !== void 0) {
      return date0.until(date1, __spreadProps(__spreadValues({}, normOptions), {
        largestUnit: unit,
        smallestUnit: unit
      }))[unit];
    }
    const duration = date0.until(date1, { largestUnit: unit });
    if (duration.blank) {
      return 0;
    }
    if (isTimeUnit(unit)) {
      return duration.total(unit);
    }
    const relativeTo = !("day" in date0) && "toPlainDate" in date0 ? date0.toPlainDate({ day: 1 }) : date0;
    return duration.total({ unit, relativeTo });
  };
}
function isTimeUnit(unit) {
  return unit === "hours" || unit === "minutes" || unit === "seconds" || unit === "milliseconds" || unit === "microseconds" || unit === "nanoseconds";
}
var diffYears = createDiffFunc("years");
var diffMonths = createDiffFunc("months");
var diffWeeks = createDiffFunc("weeks");
var diffDays = createDiffFunc("days");
var diffHours = createDiffFunc("hours");
var diffMinutes = createDiffFunc("minutes");
var diffSeconds = createDiffFunc("seconds");
var diffMilliseconds = createDiffFunc("milliseconds");
var diffMicroseconds = createDiffFunc("microseconds");
var diffNanoseconds = createDiffFunc("nanoseconds");
function normalizeDiffOptions(options) {
  return typeof options === "string" ? { roundingMode: options } : options || {};
}

// node_modules/temporal-polyfill/chunks/options.js
function normalizeOptionsOrString(options, optionName) {
  return "string" == typeof options ? ((optionName2, optionVal) => {
    const res = /* @__PURE__ */ Object.create(null);
    return res[optionName2] = optionVal, res;
  })(optionName, options) : requireObjectLike(options);
}
var smallestUnitStr = "smallestUnit";
var overflowMap = {
  constrain: 0,
  reject: 1
};
var epochDisambigMap = {
  compatible: 0,
  reject: 1,
  earlier: 2,
  later: 3
};
var offsetDisambigMap = {
  reject: 0,
  use: 1,
  prefer: 2,
  ignore: 3
};
var calendarDisplayMap = {
  auto: 0,
  never: 1,
  critical: 2,
  always: 3
};
var timeZoneDisplayMap = {
  auto: 0,
  never: 1,
  critical: 2
};
var offsetDisplayMap = {
  auto: 0,
  never: 1
};
var roundingModeMap = {
  floor: 0,
  halfFloor: 1,
  ceil: 2,
  halfCeil: 3,
  trunc: 4,
  halfTrunc: 5,
  expand: 6,
  halfExpand: 7,
  halfEven: 8
};
var roundingModeFuncs = [Math.floor, roundHalfFloor, Math.ceil, roundHalfCeil, Math.trunc, roundHalfTrunc, roundExpand, roundHalfExpand, roundHalfEven];
var directionMap = {
  previous: -1,
  next: 1
};
function coerceRoundingIncInteger(options) {
  const roundingInc = options.roundingIncrement;
  return void 0 === roundingInc ? 1 : toIntegerWithTrunc(roundingInc, "roundingIncrement");
}
function coerceUnitOption(optionName, options, minUnit = 0, ensureDefined) {
  let unitStr = options[optionName];
  if (void 0 === unitStr) {
    return ensureDefined ? minUnit : void 0;
  }
  if (unitStr = toString(unitStr), "auto" === unitStr) {
    return ensureDefined ? minUnit : null;
  }
  let unit = unitNameMap[unitStr];
  return void 0 === unit && (unit = durationFieldNamesAsc.indexOf(unitStr)), unit < 0 && throwRangeError(invalidChoice(optionName, unitStr, unitNameMap)), unit;
}
function coerceChoiceOption(optionName, enumNameMap, options, defaultChoice = 0) {
  const enumArg = options[optionName];
  if (void 0 === enumArg) {
    return defaultChoice;
  }
  const enumStr = toString(enumArg);
  const enumNum = enumNameMap[enumStr];
  return void 0 === enumNum && throwRangeError(invalidChoice(optionName, enumStr, enumNameMap)), enumNum;
}
var coerceSmallestUnit = bindArgs(coerceUnitOption, smallestUnitStr);
var coerceLargestUnit = bindArgs(coerceUnitOption, "largestUnit");
var coerceTotalUnit = bindArgs(coerceUnitOption, "unit");
var coerceOverflow = bindArgs(coerceChoiceOption, "overflow", overflowMap);
var coerceEpochDisambig = bindArgs(coerceChoiceOption, "disambiguation", epochDisambigMap);
var coerceOffsetDisambig = bindArgs(coerceChoiceOption, "offset", offsetDisambigMap);
var coerceCalendarDisplay = bindArgs(coerceChoiceOption, "calendarName", calendarDisplayMap);
var coerceTimeZoneDisplay = bindArgs(coerceChoiceOption, "timeZoneName", timeZoneDisplayMap);
var coerceOffsetDisplay = bindArgs(coerceChoiceOption, "offset", offsetDisplayMap);
var coerceRoundingMode = bindArgs(coerceChoiceOption, "roundingMode", roundingModeMap);
var coerceDirection = bindArgs(coerceChoiceOption, "direction", directionMap);
function validateRoundingInc(roundingInc, smallestUnit, allowManyLargeUnits, solarMode) {
  const upUnitNano = solarMode ? nanoInUtcDay : unitNanoMap[smallestUnit + 1];
  if (upUnitNano) {
    const unitNano = unitNanoMap[smallestUnit];
    upUnitNano % ((roundingInc = clampEntity("roundingIncrement", roundingInc, 1, upUnitNano / unitNano - (solarMode ? 0 : 1), 1)) * unitNano) && throwRangeError(invalidEntity2("roundingIncrement", roundingInc));
  } else {
    roundingInc = clampEntity("roundingIncrement", roundingInc, 1, allowManyLargeUnits ? 10 ** 9 : 1, 1);
  }
  return roundingInc;
}
function refineUnitDiffOptions(unit, options) {
  return "string" == typeof options || Boolean(options && (options.roundingMode || void 0 !== options.roundingIncrement)) ? ((smallestUnit, options2, allowManyLargeUnits, defaultRoundingMode = 7) => {
    let roundingInc = coerceRoundingIncInteger(options2 = normalizeOptionsOrString(options2, "roundingMode"));
    const roundingMode = coerceRoundingMode(options2, defaultRoundingMode);
    return roundingInc = validateRoundingInc(roundingInc, smallestUnit, allowManyLargeUnits), [roundingInc, roundingMode];
  })(unit, options, 1, 4) : [1, void 0];
}
function refineUnitRoundOptions(smallestUnit, options, solarMode) {
  let roundingInc = coerceRoundingIncInteger(options = normalizeUnitRoundOptions(options));
  const roundingMode = coerceRoundingMode(options, 7);
  return roundingInc = validateRoundingInc(roundingInc, smallestUnit, void 0, solarMode), [roundingInc, roundingMode];
}
function normalizeUnitRoundOptions(options) {
  return void 0 === options ? /* @__PURE__ */ Object.create(null) : normalizeOptionsOrString(options, "roundingMode");
}
function refineOverflowOptions(options) {
  return void 0 === options ? 0 : coerceOverflow(requireObjectLike(options));
}
function refineEpochDisambigOptions(options) {
  return coerceEpochDisambig(normalizeOptions(options));
}

// node_modules/temporal-polyfill/chunks/internal.js
var invalidEntity2 = invalidEntity;
var unsupportedWeekNumbers2 = unsupportedWeekNumbers;
var missingField = (fieldName) => `Missing ${fieldName}`;
var invalidChoice = (fieldName, val, choiceMap) => invalidEntity(fieldName, val) + "; must be " + Object.keys(choiceMap).join();
var forbiddenValueOf = "Cannot use valueOf";
var invalidCallingContext = "Invalid calling context";
var invalidLeapMonth = "Invalid leap month";
var exoticCalendarRequired = (calendarId, remedy) => `Unknown calendar ${calendarId}; might need ${remedy}`;
var invalidTimeZone = (calendarId) => invalidEntity("TimeZone", calendarId);
var outOfBoundsDate = "Out-of-bounds date";
var failedParse = (s) => `Cannot parse: ${s}`;
var invalidSubstring = (substring) => `Invalid substring: ${substring}`;
var constrainToRange2 = constrainToRange;
function throwRangeError(message) {
  throw new RangeError(message);
}
function throwTypeError(message) {
  throw new TypeError(message);
}
function clampProp(props, propName, min, max, overflow) {
  return clampEntity(propName, ((props2, propName2) => {
    const propVal = props2[propName2];
    return void 0 === propVal && throwTypeError(missingField(propName2)), propVal;
  })(props, propName), min, max, overflow);
}
function clampEntity(entityName, num, min, max, overflow, choices) {
  const clamped = constrainToRange2(num, min, max);
  return overflow && num !== clamped && throwRangeError(((entityName2, val, min2, max2, choices2) => choices2 ? numberOutOfRange(entityName2, choices2[val], choices2[min2], choices2[max2]) : numberOutOfRange(entityName2, val, min2, max2))(entityName, num, min, max, choices)), clamped;
}
function memoize(generator, MapClass = Map) {
  const map = new MapClass();
  return (key, ...otherArgs) => {
    if (map.has(key)) {
      return map.get(key);
    }
    const val = generator(key, ...otherArgs);
    return map.set(key, val), val;
  };
}
var createNameDescriptors = (name) => createPropDescriptors({
  name
}, 1);
var createPropDescriptors = (propVals, readonly) => mapProps((value) => ({
  value,
  configurable: 1,
  writable: !readonly
}), propVals);
var createStringTagDescriptors = (value) => ({
  [Symbol.toStringTag]: {
    value,
    configurable: 1
  }
});
function mapProps(transformer, props) {
  const res = {};
  for (const propName in props) {
    res[propName] = transformer(props[propName], propName);
  }
  return res;
}
function zipPropsConst(propNames, propVal) {
  const res = {};
  for (const propName of propNames) {
    res[propName] = propVal;
  }
  return res;
}
function createPropGetters(propNames) {
  const getters = {};
  for (const propName of propNames) {
    getters[propName] = (slots) => slots[propName];
  }
  return getters;
}
function pluckProps(propNames, props, dest = /* @__PURE__ */ Object.create(null)) {
  for (const propName of propNames) {
    dest[propName] = props[propName];
  }
  return dest;
}
function zeroOutProps(propNames, clearUntilI, props) {
  const copy = __spreadValues({}, props);
  for (let i = 0; i < clearUntilI; i++) {
    copy[propNames[i]] = 0;
  }
  return copy;
}
function bindArgs(f, ...boundArgs) {
  return (...dynamicArgs) => f(...boundArgs, ...dynamicArgs);
}
function identity(arg) {
  return arg;
}
function noop() {
}
function capitalize(s) {
  return s[0].toUpperCase() + s.substring(1);
}
function sortStrings(...strss) {
  return [].concat(...strss).sort();
}
function createRegExp(meat) {
  return new RegExp(`^${meat}$`, "i");
}
function parseSubsecNano(fracStr) {
  return parseInt(fracStr.padEnd(9, "0"));
}
function parseSign(s) {
  return s && "+" !== s ? -1 : 1;
}
function parseInt0(s) {
  return void 0 === s ? 0 : parseInt(s);
}
function padNumber(digits, num) {
  return String(num).padStart(digits, "0");
}
var padNumber2 = bindArgs(padNumber, 2);
function compareNumbers(a, b) {
  return Math.sign(a - b);
}
function compareBigInts(a, b) {
  return a < b ? -1 : a > b ? 1 : 0;
}
function divFloorBigInt(num, denom) {
  const whole = num / denom;
  return num % denom < 0n ? whole - 1n : whole;
}
function divModFloorBigInt(num, divisor) {
  const quotient = divFloorBigInt(num, divisor);
  return [quotient, num - quotient * divisor];
}
function divModFloor(num, divisor) {
  return [Math.floor(num / divisor), modFloor(num, divisor)];
}
function modFloor(num, divisor) {
  return (num % divisor + divisor) % divisor;
}
function divTrunc(num, divisor) {
  return Math.trunc(num / divisor) || 0;
}
function modTrunc(num, divisor) {
  return num % divisor || 0;
}
function roundExpand(num) {
  return num < 0 ? Math.floor(num) : Math.ceil(num);
}
function fabricateNearHalfFraction(halfCompare, sign = 1) {
  return sign * (0.5 + halfCompare / 5);
}
function roundHalfExpand(num) {
  return Math.sign(num) * Math.round(Math.abs(num)) || 0;
}
function roundHalfFloor(num) {
  return hasHalf(num) ? Math.floor(num) : Math.round(num);
}
function roundHalfCeil(num) {
  return hasHalf(num) ? Math.ceil(num) : Math.round(num);
}
function roundHalfTrunc(num) {
  return hasHalf(num) ? Math.trunc(num) || 0 : Math.round(num);
}
function roundHalfEven(num) {
  return hasHalf(num) ? (num = Math.trunc(num) || 0) + num % 2 : Math.round(num);
}
function hasHalf(num) {
  return 0.5 === Math.abs(num % 1);
}
function normalizeEraName(era) {
  const normalized = era.normalize("NFD").toLowerCase().replace(/[^a-z0-9]/g, "");
  return "bc" === normalized || "b" === normalized ? "bce" : "ad" === normalized || "a" === normalized ? "ce" : normalized;
}
var isoCalendarImpl = void 0;
function getCalendarSlotId(calendar) {
  return calendar === isoCalendarImpl ? "iso8601" : 0 === calendar ? "gregory" : calendar.id;
}
function formatMonthCode(monthCodeNumber, isLeapMonth) {
  return "M" + padNumber2(monthCodeNumber) + (isLeapMonth ? "L" : "");
}
function monthCodeNumberToMonth(monthCodeNumber, isLeapMonth, leapMonth) {
  return monthCodeNumber + (isLeapMonth || leapMonth && monthCodeNumber >= leapMonth ? 1 : 0);
}
var unitNameMap = {
  nanosecond: 0,
  microsecond: 1,
  millisecond: 2,
  second: 3,
  minute: 4,
  hour: 5,
  day: 6,
  week: 7,
  month: 8,
  year: 9
};
var unitNamesAsc = Object.keys(unitNameMap);
var nanoInMicro2 = nanoInMicro;
var nanoInMilli2 = nanoInMilli;
var nanoInSec2 = nanoInSec;
var nanoInMinute2 = nanoInMinute;
var nanoInHour2 = nanoInHour;
var nanoInUtcDay = 864e11;
var unitNanoMap = [1, nanoInMicro2, nanoInMilli2, nanoInSec2, nanoInMinute2, nanoInHour2, nanoInUtcDay];
var bigNanoInMicro = BigInt(nanoInMicro2);
var bigNanoInMilli = BigInt(nanoInMilli2);
var bigNanoInSec = BigInt(nanoInSec2);
var bigNanoInMinute = BigInt(nanoInMinute2);
var bigNanoInHour = BigInt(nanoInHour2);
var bigNanoInUtcDay = BigInt(nanoInUtcDay);
function divideBigNanoToExactNumber(bigNano, divisorNano) {
  const days = Number(bigNano / bigNanoInUtcDay);
  const timeNano = Number(bigNano % bigNanoInUtcDay);
  return days * (nanoInUtcDay / divisorNano) + (Math.trunc(timeNano / divisorNano) + timeNano % divisorNano / divisorNano);
}
var timeFieldNamesAsc = unitNamesAsc.slice(0, 6);
var timeGetters = createPropGetters(timeFieldNamesAsc);
var yearFieldNamesAsc = ["year"];
var dayFieldNamesAsc = ["day"];
var calendarDateFieldNamesAsc = ["day", "month", "year"];
var offsetFieldNames = ["offset"];
var timeZoneFieldNames = ["timeZone"];
var eraYearFieldNames = ["era", "eraYear"];
var monthFieldNames = ["month", "monthCode"];
var timeFieldNamesAlpha = sortStrings(timeFieldNamesAsc);
var yearFieldNamesWithEraAlpha = sortStrings(eraYearFieldNames, yearFieldNamesAsc);
var yearMonthFieldNamesAlpha = sortStrings(monthFieldNames, yearFieldNamesAsc);
var yearMonthFieldNamesWithEraAlpha = sortStrings(eraYearFieldNames, yearMonthFieldNamesAlpha);
var yearMonthCodeFieldNamesAlpha = sortStrings(["monthCode"], yearFieldNamesAsc);
var yearMonthCodeFieldNamesWithEraAlpha = sortStrings(eraYearFieldNames, yearMonthCodeFieldNamesAlpha);
var monthCodeDayFieldNamesAlpha = sortStrings(dayFieldNamesAsc, ["monthCode"]);
var dateFieldNamesAlpha = sortStrings(dayFieldNamesAsc, yearMonthFieldNamesAlpha);
var dateFieldNamesWithEraAlpha = sortStrings(dayFieldNamesAsc, eraYearFieldNames, yearMonthFieldNamesAlpha);
var dateTimeFieldNamesAlpha = sortStrings(dateFieldNamesAlpha, timeFieldNamesAsc);
var dateTimeFieldNamesWithEraAlpha = sortStrings(dateFieldNamesWithEraAlpha, timeFieldNamesAsc);
var dateTimeAndOffsetFieldNamesAlpha = sortStrings(dateFieldNamesAlpha, timeFieldNamesAsc, offsetFieldNames);
var dateTimeAndOffsetFieldNamesWithEraAlpha = sortStrings(dateFieldNamesWithEraAlpha, timeFieldNamesAsc, offsetFieldNames);
var dateTimeAndZoneFieldNamesAlpha = sortStrings(dateFieldNamesAlpha, timeFieldNamesAsc, offsetFieldNames, timeZoneFieldNames);
var dateTimeAndZoneFieldNamesWithEraAlpha = sortStrings(dateFieldNamesWithEraAlpha, timeFieldNamesAsc, offsetFieldNames, timeZoneFieldNames);
var yearMonthCodeDayFieldNamesAlpha = sortStrings(dayFieldNamesAsc, yearMonthCodeFieldNamesAlpha);
var yearMonthCodeDayFieldNamesWithEraAlpha = sortStrings(dayFieldNamesAsc, eraYearFieldNames, yearMonthCodeFieldNamesAlpha);
var timeFieldDefaults = zipPropsConst(timeFieldNamesAsc, 0);
function validateTimeFields(timeFields) {
  return constrainTimeFields(timeFields, 1), timeFields;
}
var maxValues = {
  hour: 23,
  minute: 59,
  second: 59
};
function constrainTimeFields(timeFields, overflow) {
  const constrainedFields = {};
  for (const fieldName of timeFieldNamesAsc) {
    constrainedFields[fieldName] = clampEntity(fieldName, timeFields[fieldName], 0, maxValues[fieldName] || 999, overflow);
  }
  return constrainedFields;
}
function timeFieldsToNano(timeFields) {
  return timeFieldsToSec(timeFields) * nanoInSec2 + timeFieldsToSubsecNano(timeFields);
}
function timeFieldsToMilli(timeFields) {
  return 1e3 * timeFieldsToSec(timeFields) + timeFields.millisecond;
}
function timeFieldsToSec(timeFields) {
  return 3600 * timeFields.hour + 60 * timeFields.minute + timeFields.second;
}
function timeFieldsToSubsecNano(timeFields) {
  return timeFields.millisecond * nanoInMilli2 + timeFields.microsecond * nanoInMicro2 + timeFields.nanosecond;
}
function nanoToTimeAndDay(nano) {
  const [dayDelta, timeNano] = divModFloor(nano, nanoInUtcDay);
  return [nanoToTimeFields(timeNano), dayDelta];
}
function nanoToTimeFields(timeNano) {
  const [timeMilli, nanoAfterMilli] = divModFloor(timeNano, nanoInMilli2);
  const [microsecond, nanosecond] = divModFloor(nanoAfterMilli, nanoInMicro2);
  return milliToTimeFields(timeMilli, microsecond, nanosecond);
}
function milliToTimeFields(timeMilli, microsecond = 0, nanosecond = 0) {
  const [hour, milliAfterHour] = divModFloor(timeMilli, 36e5);
  const [minute, milliAfterMinute] = divModFloor(milliAfterHour, 6e4);
  const [second, millisecond] = divModFloor(milliAfterMinute, 1e3);
  return {
    hour,
    minute,
    second,
    millisecond,
    microsecond,
    nanosecond
  };
}
function epochNanoToSecMod(epochNano) {
  const [epochSec, nano] = divModFloorBigInt(epochNano, bigNanoInSec);
  return [Number(epochSec), Number(nano)];
}
function epochNanoToMilli(epochNano) {
  return Number(divFloorBigInt(epochNano, bigNanoInMilli));
}
function isoDateTimeToEpochNano(isoDateTime) {
  return isoDateToEpochNano(isoDateTime) + BigInt(timeFieldsToNano(isoDateTime));
}
function isoDateTimeToEpochMilli(isoDateTime) {
  return isoDateToEpochMilli(isoDateTime) + timeFieldsToMilli(isoDateTime);
}
function isoDateToEpochNano(isoDate) {
  return BigInt(isoDateToEpochDays(isoDate)) * bigNanoInUtcDay;
}
function isoDateToEpochMilli(isoDate) {
  return 864e5 * isoDateToEpochDays(isoDate);
}
function isoDateToEpochDays(isoDate) {
  return isoPartsToEpochDays(isoDate.year, isoDate.month, isoDate.day);
}
function isoPartsToEpochDays(isoYear, isoMonth = 1, isoDay = 1) {
  const monthIndex = isoMonth - 1;
  return isoYear += Math.floor(monthIndex / 12), isoMonth = modFloor(monthIndex, 12), Date.UTC(isoYear % 400 - 400, isoMonth, 0) / 864e5 + 146097 * (divTrunc(isoYear, 400) + 1) + isoDay;
}
function epochNanoToIsoDateTime(epochNano) {
  const [epochDays, nanoAfterDay] = divModFloorBigInt(epochNano, bigNanoInUtcDay);
  return __spreadValues(__spreadValues({}, epochDaysToIsoDate(Number(epochDays))), nanoToTimeFields(Number(nanoAfterDay)));
}
function epochDaysToIsoDate(epochDays) {
  const legacyDate = new Date(864e5 * modFloor(epochDays, 146097));
  return {
    year: legacyDate.getUTCFullYear() + 400 * Math.floor(epochDays / 146097),
    month: legacyDate.getUTCMonth() + 1,
    day: legacyDate.getUTCDate()
  };
}
function computeIsoMonthCodeParts(month) {
  return [month, 0];
}
function computeIsoFieldsFromParts(year, month, day) {
  return {
    year,
    month,
    day
  };
}
function computeIsoDaysInMonth(year, month) {
  switch (month) {
    case 2:
      return computeIsoInLeapYear(year) ? 29 : 28;
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
  }
  return 31;
}
function computeIsoDaysInYear(year) {
  return computeIsoInLeapYear(year) ? 366 : 365;
}
function computeIsoInLeapYear(year) {
  return year % 4 == 0 && (year % 100 != 0 || year % 400 == 0);
}
function addIsoMonths(year, month, monthDelta) {
  return year += divTrunc(monthDelta, 12), (month += modTrunc(monthDelta, 12)) < 1 ? (year--, month += 12) : month > 12 && (year++, month -= 12), {
    year,
    month
  };
}
function diffIsoMonthSlots(year0, month0, year1, month1) {
  return 12 * (year1 - year0) + month1 - month0;
}
function computeIsoDayOfWeek(isoDate) {
  return modFloor(isoPartsToEpochDays(isoDate.year, isoDate.month, isoDate.day) + 4, 7) || 7;
}
function computeIsoDayOfYear(isoDate) {
  return isoPartsToEpochDays(isoDate.year, isoDate.month, isoDate.day) - isoPartsToEpochDays(isoDate.year) + 1;
}
function computeIsoWeekFields(isoDate) {
  let yearOfWeek3 = isoDate.year;
  let weekOfYear4 = Math.floor((computeIsoDayOfYear(isoDate) - computeIsoDayOfWeek(isoDate) + 10) / 7);
  let weeksInYear = computeIsoWeeksInYear(yearOfWeek3);
  return weekOfYear4 < 1 ? weekOfYear4 = weeksInYear = computeIsoWeeksInYear(--yearOfWeek3) : weekOfYear4 > weeksInYear && (weekOfYear4 = 1, weeksInYear = computeIsoWeeksInYear(++yearOfWeek3)), {
    weekOfYear: weekOfYear4,
    yearOfWeek: yearOfWeek3,
    De: weeksInYear
  };
}
function computeIsoWeeksInYear(year) {
  const y0DayOfWeek = computeIsoDayOfWeek({
    year,
    month: 1,
    day: 1
  });
  return 4 === y0DayOfWeek || 3 === y0DayOfWeek && computeIsoInLeapYear(year) ? 53 : 52;
}
function computeGregoryEraFields({ year }) {
  return year < 1 ? {
    era: "bce",
    eraYear: 1 - year
  } : {
    era: "ce",
    eraYear: year
  };
}
function validateIsoDateTimeFields(isoDateTime) {
  return validateIsoDateFields(isoDateTime), validateTimeFields(isoDateTime);
}
function validateIsoDateFields(isoInternals) {
  return constrainIsoDateFields(isoInternals, 1), isoInternals;
}
function constrainIsoDateFields(isoDate, overflow) {
  const { year } = isoDate;
  const month = clampProp(isoDate, "month", 1, 12, overflow);
  return {
    year,
    month,
    day: clampProp(isoDate, "day", 1, computeIsoDaysInMonth(year, month), overflow)
  };
}
function computeCalendarDateFields(calendar, isoDate) {
  return calendar ? calendar.de(isoDate) : isoDate;
}
function computeCalendarMonthCodeParts(calendar, year, month) {
  return calendar ? calendar.N(year, month) : computeIsoMonthCodeParts(month);
}
function computeCalendarEraFields(calendar, isoDate) {
  return 0 === calendar ? computeGregoryEraFields(isoDate) : calendar && calendar.h?.(isoDate) || {};
}
function computeCalendarIsoFieldsFromParts(calendar, year, month, day) {
  return calendar ? calendar.fe(year, month, day) : computeIsoFieldsFromParts(year, month, day);
}
function computeCalendarMonthsInYearForYear(calendar, year) {
  return calendar ? calendar.j(year) : 12;
}
function computeCalendarDaysInMonthForYearMonth(calendar, year, month) {
  return calendar ? calendar.o(year, month) : computeIsoDaysInMonth(year, month);
}
function computeCalendarMonthCode(calendar, isoDate) {
  const { year, month } = computeCalendarDateFields(calendar, isoDate);
  const [monthCodeNumber, isLeapMonth] = computeCalendarMonthCodeParts(calendar, year, month);
  return formatMonthCode(monthCodeNumber, isLeapMonth);
}
function computeCalendarDaysInMonth(calendar, isoDate) {
  const { year, month } = computeCalendarDateFields(calendar, isoDate);
  return computeCalendarDaysInMonthForYearMonth(calendar, year, month);
}
function computeCalendarDaysInYear(calendar, isoDate) {
  const { year } = computeCalendarDateFields(calendar, isoDate);
  return calendar ? calendar.i(year) : computeIsoDaysInYear(year);
}
function computeCalendarDayOfYear(calendar, isoDate) {
  if (!calendar) {
    return computeIsoDayOfYear(isoDate);
  }
  const { year } = computeCalendarDateFields(calendar, isoDate);
  const yearStartIsoDate = computeCalendarIsoFieldsFromParts(calendar, year, 1, 1);
  return isoDateToEpochDays(isoDate) - isoDateToEpochDays(yearStartIsoDate) + 1;
}
var durationFieldNamesAsc = unitNamesAsc.map((unitName) => unitName + "s");
var durationGetters = createPropGetters(durationFieldNamesAsc);
var durationFieldNamesAlpha = sortStrings(durationFieldNamesAsc);
var durationTimeFieldNamesAsc = durationFieldNamesAsc.slice(0, 6);
var durationDateFieldNamesAsc = durationFieldNamesAsc.slice(6);
var durationCalendarFieldNamesAsc = durationDateFieldNamesAsc.slice(1);
var durationFieldDefaults = zipPropsConst(durationFieldNamesAsc, 0);
var durationTimeFieldDefaults = zipPropsConst(durationTimeFieldNamesAsc, 0);
var clearDurationFields = bindArgs(zeroOutProps, durationFieldNamesAsc);
var requireString = bindArgs(requireType, "string");
function requireType(typeName, arg, entityName = typeName) {
  return typeof arg !== typeName && throwTypeError(invalidEntity2(entityName, arg)), arg;
}
function requireNumberIsInteger(num, entityName = "number") {
  return Number.isInteger(num) || throwRangeError(((entityName2, num2) => `Non-integer ${entityName2}: ${num2}`)(entityName, num)), num || 0;
}
function toString(arg) {
  return "symbol" == typeof arg && throwTypeError("Cannot convert Symbol to string"), String(arg);
}
function toPrimitiveWithStringHint(arg) {
  if (!isObjectLike(arg)) {
    return arg;
  }
  const exoticToPrimitive = arg[Symbol.toPrimitive];
  if (null != exoticToPrimitive) {
    "function" != typeof exoticToPrimitive && throwTypeError();
    const primitive = Reflect.apply(exoticToPrimitive, arg, ["string"]);
    return isObjectLike(primitive) && throwTypeError(), primitive;
  }
  return Date.prototype[Symbol.toPrimitive].call(arg, "string");
}
function toStrictInteger(arg, entityName) {
  return requireNumberIsInteger(toFiniteNumber(arg, entityName), entityName);
}
function combineDateAndTime(isoDate, time) {
  return pluckProps(calendarDateFieldNamesAsc, isoDate, pluckProps(timeFieldNamesAsc, time));
}
var epochNanoMax = BigInt(1e8) * bigNanoInUtcDay;
var epochNanoMin = BigInt(-1e8) * bigNanoInUtcDay;
var plainDateEpochNanoMin = epochNanoMin - bigNanoInUtcDay;
function checkIsoDateInBounds(isoDate, allowPlainDateLowerEdge = 1) {
  const epochNano = isoDateToEpochNano(isoDate);
  return (epochNano < (allowPlainDateLowerEdge ? plainDateEpochNanoMin : epochNanoMin) || epochNano > epochNanoMax) && throwRangeError(outOfBoundsDate), isoDate;
}
function checkIsoDateTimeInBounds(isoDateTime) {
  return checkIsoDateTimeEpochNanoInBounds(isoDateTimeToEpochNano(isoDateTime)), isoDateTime;
}
function checkIsoDateTimeEpochNanoInBounds(epochNano) {
  return (epochNano <= plainDateEpochNanoMin || epochNano >= epochNanoMax + bigNanoInUtcDay) && throwRangeError(outOfBoundsDate), epochNano;
}
function checkEpochNanoInBounds(epochNano) {
  return (epochNano < epochNanoMin || epochNano > epochNanoMax) && throwRangeError(outOfBoundsDate), epochNano;
}
function isoDateTimeAndOffsetToEpochNano(isoDateTime, offsetNano) {
  return checkEpochNanoInBounds(isoDateToEpochNano(isoDateTime) + BigInt(timeFieldsToNano(isoDateTime) - offsetNano));
}
function roundNumberToInc(num, roundingInc, roundingMode) {
  return roundWithMode(num / roundingInc, roundingMode) * roundingInc;
}
function roundWithMode(num, roundingMode) {
  return roundingModeFuncs[roundingMode](num);
}
function totalRelativeUnit(wholeValue, sign, endEpochNano, moveValueToEpochNano) {
  const unitWindow = clampRelativeUnitValue(wholeValue, sign, moveValueToEpochNano, endEpochNano);
  return interpolateRelativeUnitWindow(unitWindow, Number(endEpochNano - unitWindow.I) / Number(unitWindow.O - unitWindow.I));
}
function roundRelativeUnit(wholeValue, sign, endEpochNano, moveValueToEpochNano, roundingInc, roundingMode) {
  return roundRelativeUnitWindow(clampRelativeUnitValue(divTrunc(wholeValue, roundingInc) * roundingInc, roundingInc * sign, moveValueToEpochNano, endEpochNano), endEpochNano, roundingInc, roundingMode);
}
function roundRelativeUnitWindow(unitWindow, endEpochNano, roundingInc, roundingMode) {
  return roundNumberToInc(interpolateRelativeUnitWindow(unitWindow, computeEpochNanoFrac(endEpochNano, unitWindow.I, unitWindow.O)), roundingInc, roundingMode);
}
function clampRelativeUnitValue(startValue, valueDelta, moveValueToEpochNano, epochNanoProgress) {
  let unitWindow = computeRelativeUnitWindow(startValue, valueDelta, moveValueToEpochNano);
  return ((epochNanoProgress2, epochNano0, epochNano1, sign) => sign > 0 ? epochNano0 <= epochNanoProgress2 && epochNanoProgress2 <= epochNano1 : epochNano1 <= epochNanoProgress2 && epochNanoProgress2 <= epochNano0)(epochNanoProgress, unitWindow.I, unitWindow.O, Math.sign(valueDelta)) || (unitWindow = computeRelativeUnitWindow(startValue + valueDelta, valueDelta, moveValueToEpochNano)), unitWindow;
}
function computeRelativeUnitWindow(startValue, valueDelta, moveValueToEpochNano) {
  const endValue = startValue + valueDelta;
  return {
    ve: startValue,
    qe: endValue,
    I: moveValueToEpochNano(startValue),
    O: moveValueToEpochNano(endValue)
  };
}
function interpolateRelativeUnitWindow(unitWindow, fraction) {
  return unitWindow.ve + fraction * (unitWindow.qe - unitWindow.ve);
}
function computeEpochNanoFrac(epochNanoProgress, epochNano0, epochNano1) {
  const denomBig = epochNano1 - epochNano0;
  const numeratorBig = epochNanoProgress - epochNano0;
  if (!numeratorBig) {
    return 0;
  }
  const absNumerator = numeratorBig < 0n ? -numeratorBig : numeratorBig;
  const absDenom = denomBig < 0n ? -denomBig : denomBig;
  const fracSign = compareBigInts(numeratorBig, 0n) === compareBigInts(denomBig, 0n) ? 1 : -1;
  return compareBigInts(absNumerator, absDenom) <= 0 ? absNumerator === absDenom ? fracSign : fabricateNearHalfFraction(compareBigInts(2n * absNumerator, absDenom), fracSign) : Number(numeratorBig) / Number(denomBig);
}
function createEpochNanoSlots(epochNano) {
  return {
    epochNanoseconds: epochNano
  };
}
function createZonedEpochNanoSlots(epochNano, timeZone, calendar) {
  return {
    calendar,
    timeZone,
    epochNanoseconds: epochNano
  };
}
function createDateTimeSlots(isoDateTime, calendar) {
  return pluckProps(timeFieldNamesAsc, isoDateTime, createDateSlots(isoDateTime, calendar));
}
function createDateSlots(isoDate, calendar) {
  return pluckProps(calendarDateFieldNamesAsc, isoDate, {
    calendar
  });
}
function alignZonedEpoch(computeAlignment, slots) {
  const { calendar, timeZone } = slots;
  return getStartOfDayInstantFor(timeZone, computeAlignment(calendar, zonedEpochSlotsToIso(slots)));
}
function roundZonedEpochToInterval(computeInterval, slots, roundingMode) {
  const { calendar, timeZone } = slots;
  const isoSlots = zonedEpochSlotsToIso(slots);
  const [isoDateTime0, isoDateTime1] = computeInterval(calendar, isoSlots);
  return roundZonedEpochToBounds(slots.epochNanoseconds, getStartOfDayInstantFor(timeZone, isoDateTime0), getStartOfDayInstantFor(timeZone, isoDateTime1), roundingMode);
}
function roundZonedEpochToTime(slots, smallestUnit, roundingInc, roundingMode) {
  if (0 === smallestUnit && 1 === roundingInc) {
    return slots.epochNanoseconds;
  }
  const isoDateTime = zonedEpochSlotsToIso(slots);
  return getMatchingInstantFor(slots.timeZone, roundDateTimeToInc(isoDateTime, computeNanoInc(smallestUnit, roundingInc), roundingMode), isoDateTime.offsetNanoseconds, 2, 0, 1);
}
function roundDateTimeToInc(isoDateTime, nanoInc, roundingMode) {
  const [roundedTimeFields, dayDelta] = roundTimeToInc(isoDateTime, nanoInc, roundingMode);
  const roundedIsoDateTime = combineDateAndTime(moveDateByDays(isoDateTime, dayDelta), roundedTimeFields);
  return checkIsoDateTimeInBounds(roundedIsoDateTime), roundedIsoDateTime;
}
function roundTimeToInc(timeFields, nanoInc, roundingMode) {
  return nanoToTimeAndDay(roundNumberToInc(timeFieldsToNano(timeFields), nanoInc, roundingMode));
}
function roundZonedEpochToBounds(epochNano, epochNano0, epochNano1, roundingMode) {
  return roundWithMode(computeEpochNanoFrac(epochNano < epochNano1 ? epochNano : epochNano1 - 1n, epochNano0, epochNano1), roundingMode) ? epochNano1 : epochNano0;
}
function roundToMinute(offsetNano) {
  return roundNumberToInc(offsetNano, nanoInMinute2, 7);
}
function roundBigNanoToInc(bigNano, bigNanoInc, roundingMode) {
  return roundBigNanoToIncWithTail(bigNano, bigNanoInc, roundingMode, bigNano / bigNanoInc % 2n);
}
function roundBigNanoToDayOriginInc(bigNano, bigNanoInc, roundingMode) {
  const [day, timeNano] = divModFloorBigInt(bigNano, bigNanoInUtcDay);
  const dayOriginNano = day * bigNanoInUtcDay;
  return dayOriginNano + roundBigNanoToIncWithTail(timeNano, bigNanoInc, roundingMode, (dayOriginNano / bigNanoInc + timeNano / bigNanoInc) % 2n);
}
function roundBigNanoToIncWithTail(bigNano, bigNanoInc, roundingMode, quotientTail) {
  const quotient = bigNano / bigNanoInc;
  const remainder = bigNano % bigNanoInc;
  let fraction = 0;
  remainder && (fraction = fabricateNearHalfFraction(compareBigInts(2n * (remainder < 0n ? -remainder : remainder), bigNanoInc), Math.sign(Number(remainder))));
  const roundedTail = roundWithMode(Number(quotientTail) + fraction, roundingMode);
  return (quotient - quotientTail + BigInt(roundedTail)) * bigNanoInc;
}
function computeNanoInc(smallestUnit, roundingInc) {
  return unitNanoMap[smallestUnit] * roundingInc;
}
function computeBigNanoInc(smallestUnit, roundingInc) {
  return BigInt(unitNanoMap[smallestUnit]) * BigInt(roundingInc);
}
var zonedEpochSlotsToIso = memoize(_zonedEpochSlotsToIso, WeakMap);
function _zonedEpochSlotsToIso(slots) {
  const { epochNanoseconds, timeZone } = slots;
  const offsetNanoseconds4 = timeZone.B(epochNanoseconds);
  return __spreadProps(__spreadValues({}, epochNanoToIsoDateTime(epochNanoseconds + BigInt(offsetNanoseconds4))), {
    offsetNanoseconds: offsetNanoseconds4
  });
}
function getMatchingInstantFor(timeZone, isoDateTime, offsetNano, offsetDisambig = 0, epochDisambig = 0, epochFuzzy, hasZ) {
  if (void 0 !== offsetNano && 1 === offsetDisambig && (1 === offsetDisambig || hasZ)) {
    return isoDateTimeAndOffsetToEpochNano(isoDateTime, offsetNano);
  }
  2 !== offsetDisambig && 0 !== offsetDisambig || checkIsoDateInBounds(isoDateTime, 0);
  const possibleEpochNanos = timeZone.R(isoDateTime);
  if (void 0 !== offsetNano && 3 !== offsetDisambig) {
    const matchingEpochNano = ((possibleEpochNanos2, isoDateTime2, offsetNano2, fuzzy) => {
      const zonedEpochNano = isoDateTimeToEpochNano(isoDateTime2);
      fuzzy && (offsetNano2 = roundToMinute(offsetNano2));
      for (const possibleEpochNano of possibleEpochNanos2) {
        let possibleOffsetNano = Number(zonedEpochNano - possibleEpochNano);
        if (fuzzy && (possibleOffsetNano = roundToMinute(possibleOffsetNano)), possibleOffsetNano === offsetNano2) {
          return possibleEpochNano;
        }
      }
    })(possibleEpochNanos, isoDateTime, offsetNano, epochFuzzy);
    if (void 0 !== matchingEpochNano) {
      return matchingEpochNano;
    }
    0 === offsetDisambig && throwRangeError("Invalid TimeZone offset");
  }
  return hasZ ? isoDateTimeToEpochNano(isoDateTime) : getSingleInstantFor(timeZone, isoDateTime, epochDisambig, possibleEpochNanos);
}
function getSingleInstantFor(timeZone, isoDateTime, disambig = 0, possibleEpochNanos = timeZone.R(isoDateTime)) {
  if (1 === possibleEpochNanos.length) {
    return possibleEpochNanos[0];
  }
  if (1 === disambig && throwRangeError("Ambiguous offset"), possibleEpochNanos.length) {
    return possibleEpochNanos[3 === disambig ? 1 : 0];
  }
  const zonedEpochNano = isoDateTimeToEpochNano(isoDateTime);
  const gapNano = ((timeZone2, zonedEpochNano2) => {
    const startOffsetNano = timeZone2.B(zonedEpochNano2 - bigNanoInUtcDay);
    return ((gapNano2) => (gapNano2 > nanoInUtcDay && throwRangeError("Out-of-bounds TimeZone gap"), gapNano2))(timeZone2.B(zonedEpochNano2 + bigNanoInUtcDay) - startOffsetNano);
  })(timeZone, zonedEpochNano);
  const shiftedIsoDateTime = epochNanoToIsoDateTime(zonedEpochNano + BigInt(gapNano * (2 === disambig ? -1 : 1)));
  return (possibleEpochNanos = timeZone.R(shiftedIsoDateTime))[2 === disambig ? 0 : possibleEpochNanos.length - 1];
}
function getStartOfDayInstantFor(timeZone, isoDateTime) {
  const possibleEpochNanos = timeZone.R(isoDateTime);
  if (possibleEpochNanos.length) {
    return possibleEpochNanos[0];
  }
  const zonedEpochNanoDayBefore = isoDateTimeToEpochNano(isoDateTime) - bigNanoInUtcDay;
  return timeZone.C(zonedEpochNanoDayBefore, 1);
}
function moveYearMonthByUnits(calendar, isoDate, years, months, overflow) {
  const first = checkIsoDateInBounds(moveToStartOfMonth(calendar, isoDate));
  return moveToStartOfMonth(calendar, years || months ? checkIsoDateInBounds(moveDateByCalendarUnits(calendar, first, years, months, overflow)) : first);
}
function moveDateTimeByNano(fields, delta) {
  const [time, days] = moveTimeByNano(fields, delta);
  return checkIsoDateTimeInBounds(combineDateAndTime(moveDateByDays(fields, days), time));
}
function moveDate(calendar, isoDate, durationFields, overflow = 0) {
  let { years, months, weeks, days } = durationFields;
  let movedIsoDate;
  if (days += Number(durationTimeToBigNano(durationFields) / bigNanoInUtcDay), years || months) {
    movedIsoDate = moveDateByCalendarUnits(calendar, isoDate, years, months, overflow);
  } else {
    if (!weeks && !days) {
      return isoDate;
    }
    movedIsoDate = isoDate;
  }
  return (weeks || days) && (movedIsoDate = moveDateByDays(movedIsoDate, 7 * weeks + days)), checkIsoDateInBounds(movedIsoDate);
}
function moveToStartOfMonth(calendar, isoDate) {
  return moveDateByDays(isoDate, 1 - computeCalendarDateFields(calendar, isoDate).day);
}
function moveDateByCalendarUnits(calendar, isoDate, years, months, overflow) {
  const dateParts = computeCalendarDateFields(calendar, isoDate);
  let { year, month, day } = dateParts;
  if (years) {
    const [monthCodeNumber, isLeapMonth] = computeCalendarMonthCodeParts(calendar, year, month);
    year += years, month = resolveMonthInMovedYear(calendar, monthCodeNumber, isLeapMonth, calendar ? calendar.p(year) : void 0, overflow), month = clampEntity("month", month, 1, computeCalendarMonthsInYearForYear(calendar, year), overflow);
  }
  if (months) {
    const yearMonthParts = addCalendarMonths(calendar, year, month, months);
    ({ year, month } = yearMonthParts);
  }
  return day = clampEntity("day", day, 1, computeCalendarDaysInMonthForYearMonth(calendar, year, month), overflow), computeCalendarIsoFieldsFromParts(calendar, year, month, day);
}
function addCalendarMonths(calendar, year, month, monthDelta) {
  return calendar ? calendar.ae(year, month, monthDelta) : addIsoMonths(year, month, monthDelta);
}
function resolveMonthInMovedYear(calendar, monthCodeNumber, isLeapMonth, targetLeapMonth, overflow) {
  if (isLeapMonth) {
    const leapMonthMeta = calendar ? calendar.l : void 0;
    return void 0 !== targetLeapMonth && (leapMonthMeta < 0 || targetLeapMonth === monthCodeNumber + 1) ? targetLeapMonth : (1 === overflow && throwRangeError(invalidLeapMonth), leapMonthMeta < 0 ? -leapMonthMeta : monthCodeNumber);
  }
  return monthCodeNumberToMonth(monthCodeNumber, 0, targetLeapMonth);
}
function moveTimeByNano(timeFields, durationBigNano) {
  const durDays = Number(durationBigNano / bigNanoInUtcDay);
  const durTimeNano = Number(durationBigNano % bigNanoInUtcDay);
  const [newTimeFields, overflowDays] = nanoToTimeAndDay(timeFieldsToNano(timeFields) + durTimeNano);
  return [newTimeFields, durDays + overflowDays];
}
function moveEpochNanoByNano(epochNano, deltaNano) {
  return checkEpochNanoInBounds(epochNano + deltaNano);
}
function moveDateByDays(isoDate, days) {
  return days ? epochDaysToIsoDate(isoDateToEpochDays(isoDate) + days) : isoDate;
}
function getCommonCalendar(a, b) {
  return getCalendarSlotId(a) !== getCalendarSlotId(b) && throwRangeError("Mismatching Calendars"), a;
}
function getCommonTimeZone(a, b) {
  return a.m !== b.m && throwRangeError("Mismatching TimeZones"), a;
}
function diffZonedEpochsExact(timeZone, calendar, startZoned, endZoned, largestUnit) {
  return largestUnit < 6 ? __spreadValues(__spreadValues({}, durationFieldDefaults), nanoToDurationDayTimeFields(endZoned.epochNanoseconds - startZoned.epochNanoseconds, largestUnit)) : ((timeZone2, startZoned2, endZoned2) => {
    const sign = compareBigInts(endZoned2.epochNanoseconds, startZoned2.epochNanoseconds);
    if (!sign) {
      return durationFieldDefaults;
    }
    if (!compareIsoDates(zonedEpochSlotsToIso(startZoned2), zonedEpochSlotsToIso(endZoned2))) {
      return __spreadValues(__spreadValues({}, durationFieldDefaults), nanoToDurationDayTimeFields(endZoned2.epochNanoseconds - startZoned2.epochNanoseconds, 5));
    }
    const [startIsoDateTime, endIsoDate, remainderNano] = prepareZonedEpochDiff(timeZone2, startZoned2, endZoned2, sign);
    return __spreadValues(__spreadValues({}, (start = startIsoDateTime, end = endIsoDate, diffCalendarDates(calendar, start, end, largestUnit))), nanoToDurationTimeFields(remainderNano));
    var start, end;
  })(timeZone, startZoned, endZoned);
}
function diffDateTimesExact(calendar, startIsoDateTime, endIsoDateTime, largestUnit) {
  const startEpochNano = isoDateTimeToEpochNano(startIsoDateTime);
  const endEpochNano = isoDateTimeToEpochNano(endIsoDateTime);
  const sign = compareBigInts(endEpochNano, startEpochNano);
  return sign ? largestUnit <= 6 ? __spreadValues(__spreadValues({}, durationFieldDefaults), nanoToDurationDayTimeFields(endEpochNano - startEpochNano, largestUnit)) : diffDateTimesBig(calendar, startIsoDateTime, endIsoDateTime, sign, largestUnit) : durationFieldDefaults;
}
function diffDateTimesBig(calendar, startIsoDateTime, endIsoDateTime, sign, largestUnit) {
  let diffEndDate = endIsoDateTime;
  let timeNano = timeFieldsToNano(endIsoDateTime) - timeFieldsToNano(startIsoDateTime);
  return Math.sign(timeNano) === -sign && (diffEndDate = moveDateByDays(endIsoDateTime, -sign), timeNano += nanoInUtcDay * sign), __spreadValues(__spreadValues({}, diffCalendarDates(calendar, startIsoDateTime, diffEndDate, largestUnit)), nanoToDurationTimeFields(timeNano));
}
function prepareZonedEpochDiff(timeZone, startZoned, endZoned, sign) {
  const startIsoDate = zonedEpochSlotsToIso(startZoned);
  const endIsoDate = zonedEpochSlotsToIso(endZoned);
  const endEpochNano = endZoned.epochNanoseconds;
  let dayCorrection = 0;
  const timeDiffNano = timeFieldsToNano(endIsoDate) - timeFieldsToNano(startIsoDate);
  Math.sign(timeDiffNano) === -sign && dayCorrection++;
  const maxDayCorrection = dayCorrection + (sign > 0 ? 1 : 0);
  for (; ; dayCorrection++) {
    const midIsoDate = moveDateByDays(endIsoDate, dayCorrection * -sign);
    const midEpochNano = getSingleInstantFor(timeZone, combineDateAndTime(midIsoDate, startIsoDate));
    if (dayCorrection === maxDayCorrection || compareBigInts(endEpochNano, midEpochNano) !== -sign) {
      return [startIsoDate, midIsoDate, Number(endEpochNano - midEpochNano)];
    }
  }
}
function diffCalendarDates(calendar, startIsoDate, endIsoDate, largestUnit) {
  if (largestUnit <= 7) {
    return ((asWeeks, start, end) => {
      const days = countIsoDays(start, end);
      return asWeeks ? __spreadProps(__spreadValues({}, durationFieldDefaults), {
        weeks: divTrunc(days, 7),
        days: modTrunc(days, 7)
      }) : __spreadProps(__spreadValues({}, durationFieldDefaults), {
        days
      });
    })(7 === largestUnit, startIsoDate, endIsoDate);
  }
  const yearMonthDayStart = computeCalendarDateFields(calendar, startIsoDate);
  const yearMonthDayEnd = computeCalendarDateFields(calendar, endIsoDate);
  if (8 === largestUnit) {
    const { year: year02, month: month02, day: day02 } = yearMonthDayStart;
    const { year: year12, month: month12, day: day12 } = yearMonthDayEnd;
    const sign = Math.sign(compareNumbers(year12, year02) || compareNumbers(month12, month02) || countIsoDays(startIsoDate, endIsoDate));
    let months = 0;
    let days = 0;
    if (sign) {
      months = calendar ? calendar.ee(year02, month02, year12, month12) : diffIsoMonthSlots(year02, month02, year12, month12);
      let anchorIsoDate = moveDateByCalendarUnits(calendar, startIsoDate, 0, months, 0);
      sign * compareNumbers(day02, day12) > 0 && (months -= sign, anchorIsoDate = moveDateByCalendarUnits(calendar, startIsoDate, 0, months, 0)), days = countIsoDays(anchorIsoDate, endIsoDate);
    }
    return __spreadProps(__spreadValues({}, durationFieldDefaults), {
      months,
      days
    });
  }
  const { year: year0, month: month0, day: day0 } = yearMonthDayStart;
  let { year: year1, month: month1, day: day1 } = yearMonthDayEnd;
  let yearDiff = year1 - year0;
  let monthDiff = month1 - month0;
  let dayDiff = day1 - day0;
  if (yearDiff || monthDiff) {
    const sign = Math.sign(yearDiff || monthDiff);
    let daysInMonth1 = computeCalendarDaysInMonthForYearMonth(calendar, year1, month1);
    let dayCorrect = 0;
    if (Math.sign(day1 - day0) === -sign) {
      const origDaysInMonth1 = daysInMonth1;
      const yearMonthParts = addCalendarMonths(calendar, year1, month1, -sign);
      ({ year: year1, month: month1 } = yearMonthParts), yearDiff = year1 - year0, monthDiff = month1 - month0, daysInMonth1 = computeCalendarDaysInMonthForYearMonth(calendar, year1, month1), dayCorrect = sign < 0 ? -origDaysInMonth1 : daysInMonth1;
    }
    if (dayDiff = day1 - Math.min(day0, daysInMonth1) + dayCorrect, yearDiff) {
      const [monthCodeNumber0, isLeapMonth0] = computeCalendarMonthCodeParts(calendar, year0, month0);
      const [monthCodeNumber1, isLeapMonth1] = computeCalendarMonthCodeParts(calendar, year1, month1);
      const leapMonthMeta = calendar ? calendar.l : void 0;
      if (monthDiff = void 0 !== leapMonthMeta && isLeapMonth0 && !isLeapMonth1 && (leapMonthMeta < 0 ? sign > 0 && monthCodeNumber1 === -leapMonthMeta : sign < 0 && monthCodeNumber1 === monthCodeNumber0) ? 0 : monthCodeNumber1 - monthCodeNumber0 || Number(isLeapMonth1) - Number(isLeapMonth0), Math.sign(monthDiff) === -sign) {
        const monthCorrect = sign < 0 && -computeCalendarMonthsInYearForYear(calendar, year1);
        year1 -= sign, yearDiff = year1 - year0, monthDiff = month1 - resolveMonthInMovedYear(calendar, monthCodeNumber0, isLeapMonth0, calendar ? calendar.p(year1) : void 0, 0) + (monthCorrect || computeCalendarMonthsInYearForYear(calendar, year1));
      } else if (calendar) {
        const month0Projected = resolveMonthInMovedYear(calendar, monthCodeNumber0, isLeapMonth0, calendar.p(year1), 0);
        monthDiff = calendar.ee(year1, month0Projected, year1, month1);
      }
    }
  }
  return __spreadProps(__spreadValues({}, durationFieldDefaults), {
    years: yearDiff,
    months: monthDiff,
    days: dayDiff
  });
}
function compareIsoDates(isoDate0, isoDate1) {
  return compareNumbers(isoDate0.year, isoDate1.year) || compareNumbers(isoDate0.month, isoDate1.month) || compareNumbers(isoDate0.day, isoDate1.day);
}
function countIsoDays(startIsoDate, endIsoDate) {
  return isoDateToEpochDays(endIsoDate) - isoDateToEpochDays(startIsoDate);
}
function moveRelativeMarkerToEpochNano(relativeOps, dateDuration) {
  return durationHasDateParts(dateDuration) ? relativeOps.ke(dateDuration) : relativeOps.ne;
}
function createZonedRelativeOps(calendar, timeZone, slots) {
  const origin = zonedEpochSlotsToIso(slots);
  return {
    ne: slots.epochNanoseconds,
    ke: (duration) => getSingleInstantFor(timeZone, combineDateAndTime(moveDate(calendar, origin, duration), origin))
  };
}
function createDateRelativeOps(calendar, origin) {
  return {
    ne: isoDateToEpochNano(origin),
    ke: (duration) => isoDateToEpochNano(moveDate(calendar, origin, duration))
  };
}
function nanoToGivenFields(nano, largestUnit, fieldNames) {
  const fields = {};
  for (let unit = largestUnit; unit >= 0; unit--) {
    const divisor = unitNanoMap[unit];
    fields[fieldNames[unit]] = divTrunc(nano, divisor), nano = modTrunc(nano, divisor);
  }
  return fields;
}
var maxDurationSeconds = 2 ** 53;
function negateDurationFields(fields) {
  const res = {};
  for (const fieldName of durationFieldNamesAsc) {
    res[fieldName] = -1 * fields[fieldName] || 0;
  }
  return res;
}
function computeDurationSign(fields, fieldNames = durationFieldNamesAsc) {
  let sign = 0;
  for (const fieldName of fieldNames) {
    const fieldSign = Math.sign(fields[fieldName]);
    fieldSign && (sign && sign !== fieldSign && throwRangeError("Cannot mix duration signs"), sign = fieldSign);
  }
  return sign;
}
function validateDurationCalendarUnit(unit, value) {
  return clampEntity(unit, value, -4294967295, 4294967295, 1);
}
function validateDurationTimeUnit(n) {
  Number.isSafeInteger(n) || throwRangeError("Out-of-bounds duration");
}
function durationTimeToBigNano(fields) {
  return BigInt(fields.hours) * bigNanoInHour + BigInt(fields.minutes) * bigNanoInMinute + durationSubMinuteToBigNano(fields);
}
function durationSubMinuteToBigNano(fields) {
  return BigInt(fields.seconds) * bigNanoInSec + BigInt(fields.milliseconds) * bigNanoInMilli + BigInt(fields.microseconds) * bigNanoInMicro + BigInt(fields.nanoseconds);
}
function nanoToDurationDayTimeFields(bigNano, largestUnit = 6) {
  const days = Number(bigNano / bigNanoInUtcDay);
  const timeNano = Number(bigNano % bigNanoInUtcDay);
  const unitNano = unitNanoMap[largestUnit];
  const largestUnitVal = largestUnit <= 3 ? Number(bigNano / BigInt(unitNano)) : days * (nanoInUtcDay / unitNano) + divTrunc(timeNano, unitNano);
  Number.isFinite(largestUnitVal) || throwRangeError(outOfBoundsDate), largestUnit <= 3 && Math.abs(largestUnitVal) / (nanoInSec2 / unitNanoMap[largestUnit]) >= maxDurationSeconds && throwRangeError(outOfBoundsDate);
  const dayTimeFields = nanoToGivenFields(timeNano, largestUnit, durationFieldNamesAsc);
  return dayTimeFields[durationFieldNamesAsc[largestUnit]] = largestUnitVal, dayTimeFields;
}
function nanoToDurationTimeFields(nano, largestUnit = 5) {
  return nanoToGivenFields(nano, largestUnit, durationFieldNamesAsc);
}
function durationHasDateParts(fields) {
  return Boolean(computeDurationSign(fields, durationDateFieldNamesAsc));
}
var offsetRegExp = createRegExp("([+-])(\\d{2})(?::?(\\d{2})(?::?(\\d{2})(?:[.,](\\d{1,9}))?)?)?");
function parseOffsetNano(s) {
  const offsetNano = parseOffsetNanoMaybe(s);
  return void 0 === offsetNano && throwRangeError(failedParse(s)), offsetNano;
}
function parseOffsetNanoMaybe(s, onlyHourMinute) {
  const parts = offsetRegExp.exec(s);
  if (parts && ((s2) => ((s3) => {
    "T" !== s3[0] && "t" !== s3[0] || (s3 = s3.slice(1));
    const fractionIndex = s3.search(/[.,]/);
    const main = fractionIndex < 0 ? s3 : s3.slice(0, fractionIndex);
    const parts2 = main.split(":");
    return 1 === parts2.length ? /^(?:\d{2}|\d{4}|\d{6})$/i.test(main) : (2 === parts2.length || 3 === parts2.length) && parts2.every((part) => 2 === part.length && /^\d{2}$/i.test(part));
  })(s2.slice(1)))(parts[0])) {
    return ((parts2, onlyHourMinute2) => {
      const firstSubMinutePart = parts2[4] || parts2[5];
      onlyHourMinute2 && firstSubMinutePart && throwRangeError(invalidSubstring(firstSubMinutePart));
      const offsetNanoPos = parseInt0(parts2[2]) * nanoInHour2 + parseInt0(parts2[3]) * nanoInMinute2 + parseInt0(parts2[4]) * nanoInSec2 + parseSubsecNano(parts2[5] || "");
      return offsetNano = offsetNanoPos * parseSign(parts2[1]), Math.abs(offsetNano) >= nanoInUtcDay && throwRangeError("Out-of-bounds offset"), offsetNano;
      var offsetNano;
    })(parts, onlyHourMinute);
  }
}
var dateFieldRefiners = {
  era: toString,
  month: toPositiveIntegerWithTruncation,
  monthCode(monthCode, fieldName) {
    return requireString(toPrimitiveWithStringHint(monthCode), fieldName);
  },
  day: toPositiveIntegerWithTruncation
};
var timeFieldRefiners = zipPropsConst(timeFieldNamesAsc, toIntegerWithTrunc);
var durationFieldRefiners = zipPropsConst(durationFieldNamesAsc, toStrictInteger);
var dateTimeFieldRefiners = Object.assign({}, dateFieldRefiners, timeFieldRefiners);
var zonedDateTimeFieldRefiners = __spreadValues({
  offset(offsetString) {
    return parseOffsetNano(requireString(toPrimitiveWithStringHint(offsetString)));
  }
}, dateTimeFieldRefiners);
function createDateTimeFromRefinedFields(isoDate, timeFields = timeFieldDefaults, calendar) {
  const isoDateTime = combineDateAndTime(isoDate, timeFields);
  return checkIsoDateTimeInBounds(isoDateTime), createDateTimeSlots(isoDateTime, calendar);
}
var RawDateTimeFormat = Intl.DateTimeFormat;
function formatEpochMilliToPartsRecord(intlFormat, epochMilli) {
  epochMilli < -864e13 && throwRangeError(outOfBoundsDate);
  const parts = intlFormat.formatToParts(epochMilli);
  const hash = {};
  for (const part of parts) {
    hash[part.type] = part.value;
  }
  return hash;
}
var timeZonePeriodDaysByName = {
  "El_Aaiun": 17,
  "Tucuman": 12,
  "Tirane": 11,
  "Riga": 10,
  "Simferopol": 9,
  "Vienna": 9,
  "Tunis": 8,
  "Boa_Vista": 6,
  "Fortaleza": 6,
  "Maceio": 6,
  "Noronha": 6,
  "Recife": 6,
  "Gaza": 6,
  "Hebron": 6,
  "DeNoronha": 6
};
var minPossibleTransitionSec = -388152e4;
function formatInstantIsoAuto(instantSlots) {
  return formatIsoDateTimeFields(epochNanoToIsoDateTime(instantSlots.epochNanoseconds), void 0) + "Z";
}
function formatZonedDateTimeIsoAuto(zonedDateTimeSlots) {
  const calendar = zonedDateTimeSlots.calendar;
  const timeZone = zonedDateTimeSlots.timeZone;
  const offsetNano = timeZone.B(zonedDateTimeSlots.epochNanoseconds);
  return formatIsoDateTimeFields(epochNanoToIsoDateTime(zonedDateTimeSlots.epochNanoseconds + BigInt(offsetNano)), void 0) + formatOffsetNano(roundToMinute(offsetNano)) + formatTimeZone(timeZone.id, 0) + (calendar === isoCalendarImpl ? "" : formatCalendarId(getCalendarSlotId(calendar), 0));
}
function formatDateTimeIsoAuto(isoDateTimeSlots) {
  const calendar = isoDateTimeSlots.calendar;
  return formatIsoDateTimeFields(isoDateTimeSlots, void 0) + (calendar === isoCalendarImpl ? "" : formatCalendarId(getCalendarSlotId(calendar), 0));
}
function formatDateIsoAuto(plainDateSlots) {
  return formatIsoDateFields(plainDateSlots) + (plainDateSlots.calendar === isoCalendarImpl ? "" : formatCalendarId(getCalendarSlotId(plainDateSlots.calendar), 0));
}
function formatYearMonthIsoAuto(plainYearMonthSlots) {
  const calendar = plainYearMonthSlots.calendar;
  return calendar !== isoCalendarImpl ? formatIsoDateFields(plainYearMonthSlots) + formatCalendarId(getCalendarSlotId(calendar), 0) : formatIsoYearMonthFields(plainYearMonthSlots);
}
function formatMonthDayIsoAuto(plainMonthDaySlots) {
  const calendar = plainMonthDaySlots.calendar;
  return calendar !== isoCalendarImpl ? formatIsoDateFields(plainMonthDaySlots) + formatCalendarId(getCalendarSlotId(calendar), 0) : formatIsoMonthDayFields(plainMonthDaySlots);
}
function formatTimeIsoAuto(slots) {
  return formatTimeFields(slots, void 0);
}
function formatDurationIsoAuto(slots) {
  return formatDurationSlots(slots, void 0);
}
function formatDurationSlots(durationSlots, subsecDigits) {
  const { sign } = durationSlots;
  const abs = -1 === sign ? negateDurationFields(durationSlots) : durationSlots;
  const { hours, minutes } = abs;
  const bigNano = durationSubMinuteToBigNano(abs);
  const wholeSec = Number(bigNano / bigNanoInSec);
  const subsecNano = Number(bigNano % bigNanoInSec);
  validateDurationTimeUnit(wholeSec);
  const subsecNanoString = formatSubsecNano(subsecNano, subsecDigits);
  const forceSec = subsecDigits >= 0 || !sign || subsecNanoString;
  return (sign < 0 ? "-" : "") + "P" + formatDurationFragments({
    "Y": formatDurationNumber(abs.years),
    "M": formatDurationNumber(abs.months),
    "W": formatDurationNumber(abs.weeks),
    "D": formatDurationNumber(abs.days)
  }) + (hours || minutes || wholeSec || forceSec ? "T" + formatDurationFragments({
    "H": formatDurationNumber(hours),
    "M": formatDurationNumber(minutes),
    "S": formatDurationNumber(wholeSec, forceSec) + subsecNanoString
  }) : "");
}
function formatDurationFragments(fragObj) {
  const parts = [];
  for (const fragName in fragObj) {
    const fragVal = fragObj[fragName];
    fragVal && parts.push(fragVal, fragName);
  }
  return parts.join("");
}
function formatDurationNumber(n, force) {
  if (!n && !force) {
    return "";
  }
  const options = /* @__PURE__ */ Object.create(null);
  return options.useGrouping = 0, n.toLocaleString("fullwide", options);
}
function formatIsoDateTimeFields(isoDateTime, subsecDigits) {
  return formatIsoDateFields(isoDateTime) + "T" + formatTimeFields(isoDateTime, subsecDigits);
}
function formatIsoDateFields(isoDate) {
  return formatIsoYearMonthFields(isoDate) + "-" + padNumber2(isoDate.day);
}
function formatIsoYearMonthFields(isoDate) {
  const { year } = isoDate;
  return (year < 0 || year > 9999 ? getSignStr(year) + padNumber(6, Math.abs(year)) : padNumber(4, year)) + "-" + padNumber2(isoDate.month);
}
function formatIsoMonthDayFields(isoDate) {
  return padNumber2(isoDate.month) + "-" + padNumber2(isoDate.day);
}
function formatTimeFields(timeFields, subsecDigits) {
  const parts = [padNumber2(timeFields.hour), padNumber2(timeFields.minute)];
  return -1 !== subsecDigits && parts.push(padNumber2(timeFields.second) + ((millisecond, microsecond, nanosecond, subsecDigits2) => formatSubsecNano(millisecond * nanoInMilli2 + microsecond * nanoInMicro2 + nanosecond, subsecDigits2))(timeFields.millisecond, timeFields.microsecond, timeFields.nanosecond, subsecDigits)), parts.join(":");
}
function formatOffsetNano(offsetNano, offsetDisplay = 0) {
  if (1 === offsetDisplay) {
    return "";
  }
  const [hour, nanoRemainder0] = divModFloor(Math.abs(offsetNano), nanoInHour2);
  const [minute, nanoRemainder1] = divModFloor(nanoRemainder0, nanoInMinute2);
  const [second, nanoRemainder2] = divModFloor(nanoRemainder1, nanoInSec2);
  return getSignStr(offsetNano) + padNumber2(hour) + ":" + padNumber2(minute) + (second || nanoRemainder2 ? ":" + padNumber2(second) + formatSubsecNano(nanoRemainder2) : "");
}
function formatTimeZone(timeZoneId, timeZoneDisplay) {
  return 1 !== timeZoneDisplay ? "[" + (2 === timeZoneDisplay ? "!" : "") + timeZoneId + "]" : "";
}
function formatCalendarId(calendarId, isCritical) {
  return "[" + (isCritical ? "!" : "") + "u-ca=" + calendarId + "]";
}
var trailingZerosRE = /0+$/;
function formatSubsecNano(totalNano, subsecDigits) {
  let s = padNumber(9, totalNano);
  return s = void 0 === subsecDigits ? s.replace(trailingZerosRE, "") : s.slice(0, subsecDigits), s ? "." + s : "";
}
function getSignStr(num) {
  return num < 0 ? "-" : "+";
}
var icuRegExp = /^(AC|AE|AG|AR|AS|BE|BS|CA|CN|CS|CT|EA|EC|IE|IS|JS|MI|NE|NS|PL|PN|PR|PS|SS|VS)T$/;
var badCharactersRegExp = /[^\w\/:+-]+/;
function refineTimeZoneId(rawId) {
  return resolveTimeZoneId(requireString(rawId));
}
function resolveTimeZoneId(rawId) {
  return resolveTimeZoneRecord(rawId).id;
}
function resolveTimeZoneRecord(rawId) {
  const upperRawId = rawId.toUpperCase();
  const offsetRecord = ((upperRawId2) => {
    const offsetNano = parseOffsetNanoMaybe(upperRawId2, 1);
    if (void 0 !== offsetNano) {
      return {
        id: formatOffsetNano(offsetNano),
        Z: offsetNano,
        m: offsetNano
      };
    }
  })(upperRawId);
  if (offsetRecord) {
    return __spreadValues({
      kind: "fixed"
    }, offsetRecord);
  }
  const normId = "UTC" === upperRawId ? "UTC" : ((rawId2) => (badCharactersRegExp.test(rawId2) && throwRangeError(invalidTimeZone(rawId2)), icuRegExp.test(rawId2) && throwRangeError("Forbidden ICU TimeZone"), rawId2.toLowerCase().split("/").map((part, partI) => (part.length <= 3 || /\d/.test(part)) && !/etc|yap/.test(part) ? part.toUpperCase() : part.replace(/baja|dumont|[a-z]+/g, (a, i) => a.length <= 2 && !partI || "in" === a || "chat" === a ? a.toUpperCase() : a.length > 2 || !i ? capitalize(a).replace(/island|noronha|murdo|rivadavia|urville/, capitalize) : a)).join("/")))(rawId);
  return queryNamedTimeZoneRecord(normId);
}
var queryNamedTimeZoneRecord = memoize((normId) => {
  if ("UTC" === normId) {
    return {
      kind: "utc",
      id: normId,
      m: normId
    };
  }
  const upperNormId = normId.toUpperCase();
  const format = queryTimeZoneIntlFormat(upperNormId);
  return {
    kind: "named",
    id: normId,
    format,
    m: format.resolvedOptions().timeZone
  };
});
var queryTimeZoneIntlFormat = memoize((upperNormId) => new RawDateTimeFormat("en-u-hc-h23", {
  calendar: "iso8601",
  timeZone: upperNormId,
  era: "short",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric"
}));
function queryTimeZone(rawTimeZoneId) {
  const record = resolveTimeZoneRecord(rawTimeZoneId);
  return queryTimeZoneRecord(record.id, record);
}
var queryTimeZoneRecord = memoize((normTimeZoneId, record) => "named" === record.kind ? new IntlTimeZone(normTimeZoneId, record.m, record.format) : new FixedTimeZone(normTimeZoneId, record.m, "fixed" === record.kind ? record.Z : 0));
var FixedTimeZone = class {
  constructor(id, compareKey, offsetNano) {
    this.id = id, this.m = compareKey, this.Z = offsetNano;
  }
  B() {
    return this.Z;
  }
  R(isoDateTime) {
    return [isoDateTimeAndOffsetToEpochNano(isoDateTime, this.Z)];
  }
  C() {
  }
};
var IntlTimeZone = class {
  constructor(id, compareKey, format) {
    this.id = id, this.m = compareKey, this.oe = ((computeOffsetSec, periodDays) => {
      const getSample = memoize(computeOffsetSec);
      const getSplit = memoize(createSplitTuple);
      const periodSec = 86400 * periodDays;
      function getOffsetSec(epochSec) {
        const [startEpochSec, endEpochSec] = computePeriod(epochSec, periodSec);
        const clampedStartEpochSec = clampIntlSampleEpochSec(startEpochSec);
        const clampedEndEpochSec = clampIntlSampleEpochSec(endEpochSec);
        const startOffsetSec = getSample(clampedStartEpochSec);
        const endOffsetSec = getSample(clampedEndEpochSec);
        return startOffsetSec === endOffsetSec ? startOffsetSec : pinch(getSplit(clampedStartEpochSec, clampedEndEpochSec), startOffsetSec, endOffsetSec, epochSec);
      }
      function pinch(split, startOffsetSec, endOffsetSec, forEpochSec) {
        let offsetSec;
        let splitDurSec;
        for (; (void 0 === forEpochSec || void 0 === (offsetSec = forEpochSec < split[0] ? startOffsetSec : forEpochSec >= split[1] ? endOffsetSec : void 0)) && (splitDurSec = split[1] - split[0]); ) {
          const middleEpochSec = split[0] + Math.floor(splitDurSec / 2);
          computeOffsetSec(middleEpochSec) === endOffsetSec ? split[1] = middleEpochSec : split[0] = middleEpochSec + 1;
        }
        return offsetSec;
      }
      return {
        Ae(zonedEpochSec) {
          const wideOffsetSec0 = getOffsetSec(zonedEpochSec - 86400);
          const wideOffsetSec1 = getOffsetSec(zonedEpochSec + 86400);
          const wideUtcEpochSec0 = zonedEpochSec - wideOffsetSec0;
          const wideUtcEpochSec1 = zonedEpochSec - wideOffsetSec1;
          if (wideOffsetSec0 === wideOffsetSec1) {
            return [wideUtcEpochSec0];
          }
          const narrowOffsetSec0 = getOffsetSec(wideUtcEpochSec0);
          return narrowOffsetSec0 === getOffsetSec(wideUtcEpochSec1) ? [zonedEpochSec - narrowOffsetSec0] : wideOffsetSec0 > wideOffsetSec1 ? [wideUtcEpochSec0, wideUtcEpochSec1] : [];
        },
        ze: getOffsetSec,
        C: function getTransition(epochSec, direction) {
          if (direction > 0 && epochSec >= 864e10) {
            return;
          }
          if (direction < 0) {
            if (epochSec <= minPossibleTransitionSec) {
              return;
            }
            const lookaheadEpochSec = getCurrentEpochSec() + 94867200;
            if (epochSec > lookaheadEpochSec) {
              return getTransition(lookaheadEpochSec, -1);
            }
          }
          const searchEpochSec = direction > 0 ? Math.max(epochSec, minPossibleTransitionSec) : epochSec;
          let [startEpochSec, endEpochSec] = computePeriod(searchEpochSec, periodSec);
          const inc = periodSec * direction;
          const searchLimit = direction > 0 ? Math.max(epochSec, getCurrentEpochSec()) + 94867200 : minPossibleTransitionSec;
          const inBounds = () => direction < 0 ? endEpochSec > searchLimit : startEpochSec < searchLimit;
          for (; inBounds(); ) {
            const clampedStartEpochSec = clampIntlSampleEpochSec(startEpochSec);
            const clampedEndEpochSec = clampIntlSampleEpochSec(endEpochSec);
            const startOffsetSec = getSample(clampedStartEpochSec);
            const endOffsetSec = getSample(clampedEndEpochSec);
            if (startOffsetSec !== endOffsetSec) {
              const split = getSplit(clampedStartEpochSec, clampedEndEpochSec);
              pinch(split, startOffsetSec, endOffsetSec);
              const transitionEpochSec = split[0];
              if ((compareNumbers(transitionEpochSec, epochSec) || 1) === direction) {
                return transitionEpochSec;
              }
            }
            startEpochSec += inc, endEpochSec += inc;
          }
        }
      };
    })(/* @__PURE__ */ ((format2) => (epochSec) => {
      const intlParts = formatEpochMilliToPartsRecord(format2, 1e3 * epochSec);
      return 86400 * isoPartsToEpochDays(((intlParts2) => {
        const relatedYear = intlParts2.relatedYear;
        if (void 0 !== relatedYear) {
          return parseInt(relatedYear);
        }
        const year = parseInt(intlParts2.year);
        return void 0 !== intlParts2.era && "bce" === normalizeEraName(intlParts2.era) ? 1 - year : year;
      })(intlParts), parseInt(intlParts.month), parseInt(intlParts.day)) + 3600 * parseInt(intlParts.hour) + 60 * parseInt(intlParts.minute) + parseInt(intlParts.second) - epochSec;
    })(format), ((timeZoneId) => {
      const timeZoneName = timeZoneId.split("/").pop();
      return timeZonePeriodDaysByName[timeZoneName] || 60;
    })(id));
  }
  B(epochNano) {
    return this.oe.ze(((epochNano2) => epochNanoToSecMod(epochNano2)[0])(epochNano)) * nanoInSec2;
  }
  R(isoDateTime) {
    const zonedEpochSec = 86400 * isoDateToEpochDays(isoDateTime) + timeFieldsToSec(isoDateTime);
    const subsecNano = timeFieldsToSubsecNano(isoDateTime);
    return this.oe.Ae(zonedEpochSec).map((epochSec) => checkEpochNanoInBounds(BigInt(epochSec) * bigNanoInSec + BigInt(subsecNano)));
  }
  C(epochNano, direction) {
    const [epochSec, subsecNano] = epochNanoToSecMod(epochNano);
    const resEpochSec = this.oe.C(epochSec + (direction > 0 || subsecNano ? 1 : 0), direction);
    if (void 0 !== resEpochSec) {
      return BigInt(resEpochSec) * bigNanoInSec;
    }
  }
};
function getCurrentEpochSec() {
  return Math.floor(Date.now() / 1e3);
}
function createSplitTuple(startEpochSec, endEpochSec) {
  return [startEpochSec, endEpochSec];
}
function computePeriod(epochSec, periodSec) {
  const startEpochSec = Math.floor(epochSec / periodSec) * periodSec;
  return [startEpochSec, startEpochSec + periodSec];
}
function clampIntlSampleEpochSec(epochSec) {
  return constrainToRange2(epochSec, -1e10, 864e10);
}
function timeRegExpStr(separatorIndex) {
  return `(\\d{2})(?:(:?)(\\d{2})(?:\\${separatorIndex}(\\d{2})(?:[.,](\\d{1,9}))?)?)?`;
}
var dateTimeRegExpStr = "(?:(?:([+-])(\\d{6}))|(\\d{4}))(-?)(\\d{2})\\4(\\d{2})(?:[T ]" + timeRegExpStr(8) + "(Z|([+-])" + timeRegExpStr(15) + ")?)?";
var yearMonthRegExp = createRegExp("(?:(?:([+-])(\\d{6}))|(\\d{4}))-?(\\d{2})((?:\\[(!?)([^\\]]*)\\]){0,9})");
var monthDayRegExp = createRegExp("(?:--)?(\\d{2})-?(\\d{2})((?:\\[(!?)([^\\]]*)\\]){0,9})");
var dateTimeRegExp = createRegExp(dateTimeRegExpStr + "((?:\\[(!?)([^\\]]*)\\]){0,9})");
var timeRegExp = createRegExp("T?" + timeRegExpStr(2) + `(([+-])${timeRegExpStr(9)})?((?:\\[(!?)([^\\]]*)\\]){0,9})`);
var annotationRegExp = new RegExp("\\[(!?)([^\\]]*)\\]", "g");
var durationRegExp = createRegExp("([+-])?P(\\d+Y)?(\\d+M)?(\\d+W)?(\\d+D)?(?:T(?!$)(?:(\\d+)(?:[.,](\\d{1,9}))?H)?(?:(\\d+)(?:[.,](\\d{1,9}))?M)?(?:(\\d+)(?:[.,](\\d{1,9}))?S)?)?");
function instantToZonedDateTime(instantSlots, timeZone, calendar) {
  return createZonedEpochNanoSlots(instantSlots.epochNanoseconds, timeZone, calendar);
}
function dateTimeToZonedDateTime(plainDateTimeSlots, timeZone, epochDisambig) {
  return createZonedEpochNanoSlots(checkEpochNanoInBounds(getSingleInstantFor(timeZone, plainDateTimeSlots, epochDisambig)), timeZone, plainDateTimeSlots.calendar);
}
function epochMilliToInstant(epochMilli) {
  return createEpochNanoSlots(checkEpochNanoInBounds(BigInt(toStrictInteger(epochMilli)) * bigNanoInMilli));
}
function applyPlainFormatTimeZone(options) {
  return options.timeZone = "UTC", ["full", "long"].includes(options.timeStyle) && (options.timeStyle = "medium"), options;
}
function checkResolvedCalendarCompatible(format, slots, strictCalendarCheck) {
  const resolvedCalendarId = format.resolvedOptions().calendar;
  !strictCalendarCheck && slots.calendar === isoCalendarImpl || getCalendarSlotId(slots.calendar) === resolvedCalendarId || throwRangeError("Mismatching Calendars");
}
function createOptionsTransformer(shapeFieldNames, invalidShapeFieldNames, ignoredFieldNames, defaultShapeFields, dateStyleReplacementFields) {
  const shapeFieldNameSet = new Set(shapeFieldNames);
  const invalidShapeFieldNameSet = new Set(invalidShapeFieldNames);
  const ignoredFieldNameSet = new Set(ignoredFieldNames);
  return (options, allowPartialOverlap) => {
    let dateStyle;
    let timeStyle;
    const granularShapeFields = {};
    const modifierFields = {};
    const otherFields = {};
    let hasInvalidGranularShapeFields = 0;
    let hasInvalidStyleFields = 0;
    for (const name of Object.keys(options)) {
      const value = options[name];
      void 0 === value || ignoredFieldNameSet.has(name) || (shapeFieldNameSet.has(name) ? "dateStyle" === name ? dateStyle = value : "timeStyle" === name ? timeStyle = value : granularShapeFields[name] = value : "era" === name ? modifierFields[name] = value : invalidShapeFieldNameSet.has(name) ? "dateStyle" === name || "timeStyle" === name ? hasInvalidStyleFields = 1 : hasInvalidGranularShapeFields = 1 : otherFields[name] = value);
    }
    const hasDateStyle = void 0 !== dateStyle;
    const hasTimeStyle = void 0 !== timeStyle;
    const hasAnyStyle = hasDateStyle || hasTimeStyle;
    const hasGranularShapeFields = Object.keys(granularShapeFields).length > 0;
    const hasInvalids = hasInvalidGranularShapeFields || hasInvalidStyleFields;
    const hasShapeFields = hasGranularShapeFields || hasDateStyle || hasTimeStyle;
    const hasModifierFields = Object.keys(modifierFields).length > 0;
    (!allowPartialOverlap && hasInvalids || allowPartialOverlap && hasInvalids && !hasShapeFields || hasAnyStyle && (hasGranularShapeFields || hasModifierFields || hasInvalidGranularShapeFields)) && throwTypeError("Invalid formatting options");
    const transformedOptions = {};
    return hasAnyStyle || hasShapeFields || Object.assign(transformedOptions, defaultShapeFields), Object.assign(transformedOptions, granularShapeFields, modifierFields, otherFields), hasDateStyle && (dateStyleReplacementFields ? Object.assign(transformedOptions, dateStyleReplacementFields[dateStyle]) : transformedOptions.dateStyle = dateStyle), hasTimeStyle && (transformedOptions.timeStyle = timeStyle), transformedOptions;
  };
}
var dateDefaultShapeFields = {
  year: "numeric",
  month: "numeric",
  day: "numeric"
};
var timeDefaultShapeFields = {
  hour: "numeric",
  minute: "numeric",
  second: "numeric"
};
var dateTimeDefaultShapeFields = Object.assign({}, dateDefaultShapeFields, timeDefaultShapeFields);
var dateShapeFieldNames = ["weekday", "year", "month", "day", "dateStyle"];
var timeShapeFieldNames = ["dayPeriod", "hour", "minute", "second", "fractionalSecondDigits", "timeStyle"];
var dateTimeShapeFieldNames = dateShapeFieldNames.concat(timeShapeFieldNames);
var yearMonthIgnoredFieldNames = ["weekday", "day"].concat(timeShapeFieldNames);
var monthDayIgnoredFieldNames = ["weekday", "year"].concat(timeShapeFieldNames);
var transformInstantOptions = createOptionsTransformer(dateTimeShapeFieldNames, [], [], dateTimeDefaultShapeFields);
var transformZonedOptions = createOptionsTransformer(dateTimeShapeFieldNames, [], [], __spreadProps(__spreadValues({}, dateTimeDefaultShapeFields), {
  timeZoneName: "short"
}));
var transformDateTimeOptions = createOptionsTransformer(dateTimeShapeFieldNames, [], ["timeZoneName"], dateTimeDefaultShapeFields);
var transformDateOptions = createOptionsTransformer(dateShapeFieldNames, timeShapeFieldNames, ["timeZoneName"], dateDefaultShapeFields);
var transformTimeOptions = createOptionsTransformer(timeShapeFieldNames, dateShapeFieldNames, ["timeZoneName", "era"], timeDefaultShapeFields);
var transformYearMonthOptions = createOptionsTransformer(["year", "month", "dateStyle"], yearMonthIgnoredFieldNames, ["timeZoneName"], {
  year: "numeric",
  month: "numeric"
}, {
  full: {
    year: "numeric",
    month: "long"
  },
  long: {
    year: "numeric",
    month: "long"
  },
  medium: {
    year: "numeric",
    month: "short"
  },
  short: {
    year: "2-digit",
    month: "numeric"
  }
});
var transformMonthDayOptions = createOptionsTransformer(["month", "day", "dateStyle"], monthDayIgnoredFieldNames, ["timeZoneName", "era"], {
  month: "numeric",
  day: "numeric"
}, {
  full: {
    month: "long",
    day: "numeric"
  },
  long: {
    month: "long",
    day: "numeric"
  },
  medium: {
    month: "short",
    day: "numeric"
  },
  short: {
    month: "numeric",
    day: "numeric"
  }
});
function createDateTimeFormatShell(createArgsProvider, transformOptions = identity) {
  const internalsMap = /* @__PURE__ */ new WeakMap();
  function getInternals(format) {
    const internals = internalsMap.get(format);
    return internals || throwTypeError("Invalid calling context"), internals;
  }
  class ShimDateTimeFormat {
    constructor(locales, options = /* @__PURE__ */ Object.create(null)) {
      const transformedOptions = transformOptions(options);
      const observedOptionNames = [];
      const trackedOptions = new Proxy(/* @__PURE__ */ Object.create(null), {
        get(_target, name) {
          const value = transformedOptions[name];
          return void 0 !== value && observedOptionNames.push(name), value;
        }
      });
      const baseFormat = new RawDateTimeFormat(locales, trackedOptions);
      const resolvedOptions = baseFormat.resolvedOptions();
      const copiedOptions = pluckProps(observedOptionNames, resolvedOptions);
      internalsMap.set(this, {
        $: createArgsProvider({
          t: baseFormat,
          Ce: resolvedOptions.locale,
          G: copiedOptions,
          Ee: transformedOptions
        }),
        t: baseFormat
      });
    }
    get format() {
      const internals = getInternals(this);
      return internals.we || (internals.we = (record) => {
        const [format, ...rest] = internals.$.A(record);
        return format.format(...rest);
      });
    }
    formatToParts(record) {
      const { $: argsProvider } = getInternals(this);
      const [format, ...rest] = argsProvider.A(record);
      return format.formatToParts(...rest);
    }
    resolvedOptions() {
      return getInternals(this).t.resolvedOptions();
    }
  }
  const { prototype } = ShimDateTimeFormat;
  function DateTimeFormat(locales, options) {
    return new ShimDateTimeFormat(locales, options);
  }
  RawDateTimeFormat.prototype.formatRange && Object.defineProperties(prototype, createPropDescriptors({
    formatRange(record0, record1) {
      const { $: argsProvider } = getInternals(this);
      const [format, epochMilli0, epochMilli1] = argsProvider.v(record0, record1);
      return format.formatRange(epochMilli0, epochMilli1);
    },
    formatRangeToParts(record0, record1) {
      const { $: argsProvider } = getInternals(this);
      const [format, epochMilli0, epochMilli1] = argsProvider.v(record0, record1);
      return format.formatRangeToParts(epochMilli0, epochMilli1);
    }
  }));
  const rawStaticDescriptors = Object.getOwnPropertyDescriptors(RawDateTimeFormat);
  return rawStaticDescriptors.prototype.value = prototype, Object.defineProperties(DateTimeFormat, rawStaticDescriptors), prototype.constructor = DateTimeFormat, Object.defineProperties(prototype, createStringTagDescriptors("Intl.DateTimeFormat")), DateTimeFormat;
}
function countEpochNanoUnit(start, end, unit, [roundingInc, roundingMode]) {
  let diffNano = end - start;
  return void 0 !== roundingMode && (diffNano = roundBigNanoToInc(diffNano, computeBigNanoInc(unit, roundingInc), roundingMode)), divideBigNanoToExactNumber(diffNano, unitNanoMap[unit]);
}
function countDateTimeUnit(start, end, unit, rounding) {
  return countEpochNanoUnit(isoDateTimeToEpochNano(start), isoDateTimeToEpochNano(end), unit, rounding);
}
function countTimeUnit(start, end, unit, [roundingInc, roundingMode]) {
  let diffNano = timeFieldsToNano(end) - timeFieldsToNano(start);
  return void 0 !== roundingMode && (diffNano = roundNumberToInc(diffNano, computeNanoInc(unit, roundingInc), roundingMode)), divideBigNanoToExactNumber(BigInt(diffNano), unitNanoMap[unit]);
}
function countYearMonthUnit(calendar, isoDate0, isoDate1, unit, rounding) {
  const start = moveToStartOfMonth(calendar, isoDate0);
  const end = moveToStartOfMonth(calendar, isoDate1);
  return compareIsoDates(start, end) ? (checkIsoDateInBounds(start), checkIsoDateInBounds(end), countRelativeUnit(unit, {
    he: () => diffCalendarDates(calendar, start, end, unit),
    me: createDateRelativeOps(calendar, start),
    ie: isoDateToEpochNano(end)
  }, rounding, 0, 8 === unit)) : 0;
}
function countRelativeUnit(unit, relativeUnitDiff, [roundingInc, roundingMode], isZoned, isPrecisionUnit) {
  const { he: diffExact, me: relativeOps } = relativeUnitDiff;
  const durationFields = diffExact();
  let { ie: endEpochNano } = relativeUnitDiff;
  return computeDurationSign(durationFields) ? void 0 !== roundingMode ? isPrecisionUnit && 1 === roundingInc ? durationFields[durationFieldNamesAsc[unit]] : resolveDurationUnit(unit, durationFields, endEpochNano, relativeOps, roundingInc, roundingMode) : (isZoned ? endEpochNano = checkEpochNanoInBounds(moveRelativeMarkerToEpochNano(relativeOps, __spreadValues(__spreadValues({}, durationFields), durationTimeFieldDefaults)) + durationTimeToBigNano(durationFields)) : (checkIsoDateTimeEpochNanoInBounds(relativeOps.ne), checkIsoDateTimeEpochNanoInBounds(endEpochNano)), resolveDurationUnit(unit, durationFields, endEpochNano, relativeOps, 1, void 0)) : 0;
}
function countZonedDayWeekUnit(unit, timeZone, startZoned, endZoned, [roundingInc, roundingMode]) {
  const daysInUnit = 7 === unit ? 7 : 1;
  const startEpochNano = startZoned.epochNanoseconds;
  const sign = endZoned.epochNanoseconds > startEpochNano ? 1 : -1;
  const originIsoDateTime = zonedEpochSlotsToIso(startZoned);
  let deltaDays = 0;
  let remainderNano;
  if (compareIsoDates(originIsoDateTime, zonedEpochSlotsToIso(endZoned))) {
    const [startIsoDateTime, endIsoDate, timeNano] = prepareZonedEpochDiff(timeZone, startZoned, endZoned, sign);
    deltaDays = isoDateToEpochDays(endIsoDate) - isoDateToEpochDays(startIsoDateTime), remainderNano = timeNano;
  } else {
    remainderNano = Number(endZoned.epochNanoseconds - startEpochNano);
  }
  const moveByDays = (days) => days ? getSingleInstantFor(timeZone, combineDateAndTime(checkIsoDateInBounds(moveDateByDays(originIsoDateTime, days)), originIsoDateTime)) : startEpochNano;
  const endEpochNano = void 0 === roundingMode ? checkEpochNanoInBounds(moveByDays(deltaDays) + BigInt(remainderNano)) : endZoned.epochNanoseconds;
  const wholeValue = Math.trunc(deltaDays / daysInUnit);
  const moveValueToEpochNano = (value) => moveByDays(value * daysInUnit);
  return void 0 === roundingMode ? totalRelativeUnit(wholeValue, sign, endEpochNano, moveValueToEpochNano) : roundRelativeUnit(wholeValue, sign, endEpochNano, moveValueToEpochNano, roundingInc, roundingMode);
}
function resolveDurationUnit(unit, durationFields, endEpochNano, relativeOps, unitWindowInc, roundingMode) {
  const sign = computeDurationSign(durationFields);
  const fieldName = durationFieldNamesAsc[unit];
  const moveValueToEpochNano = (value) => moveRelativeMarkerToEpochNano(relativeOps, __spreadProps(__spreadValues({}, durationFieldDefaults), {
    [fieldName]: value
  }));
  return void 0 === roundingMode ? totalRelativeUnit(durationFields[fieldName], sign, endEpochNano, moveValueToEpochNano) : roundRelativeUnit(durationFields[fieldName], sign, endEpochNano, moveValueToEpochNano, unitWindowInc, roundingMode);
}
function moveToRefinedDayOfYear(calendar, isoDate, dayOfYear3, overflow) {
  return moveDateByDays(isoDate, clampEntity("dayOfMonth", dayOfYear3, 1, computeCalendarDaysInYear(calendar, isoDate), overflow) - computeCalendarDayOfYear(calendar, isoDate));
}
function moveToRefinedDayOfMonth(calendar, isoDate, day, overflow) {
  return moveDateByDays(isoDate, clampEntity("day", day, 1, computeCalendarDaysInMonth(calendar, isoDate), overflow) - computeCalendarDateFields(calendar, isoDate).day);
}
function moveToRefinedDayOfWeek(isoDate, dayOfWeek3, overflow) {
  return moveDateByDays(isoDate, clampEntity("dayOfWeek", dayOfWeek3, 1, 7, overflow) - computeIsoDayOfWeek(isoDate));
}
function moveToRefinedWeekOfYear(calendar, isoDate, weekOfYear4, overflow) {
  calendar !== isoCalendarImpl && throwRangeError(unsupportedWeekNumbers2);
  const { weekOfYear: currentWeekOfYear, De: weeksInYear } = computeIsoWeekFields(isoDate);
  return moveDateByDays(isoDate, 7 * (clampEntity("weekOfYear", weekOfYear4, 1, weeksInYear, overflow) - currentWeekOfYear));
}
function computeDayFloor(slots) {
  return combineDateAndTime(slots, timeFieldDefaults);
}
function computeYearFloor(calendar, slots) {
  const { year: year0 } = computeCalendarDateFields(calendar, slots);
  return computeCalendarDateTimeFromParts(calendar, year0);
}
function computeMonthFloor(calendar, slots) {
  const { year: year0, month: month0 } = computeCalendarDateFields(calendar, slots);
  return computeCalendarDateTimeFromParts(calendar, year0, month0);
}
function computeIsoWeekFloor(_calendar, slots) {
  return combineDateAndTime(moveDateByDays(slots, 1 - computeIsoDayOfWeek(slots)), timeFieldDefaults);
}
function computeYearCeil(calendar, slots) {
  return computeYearInterval(calendar, slots)[1];
}
function computeMonthCeil(calendar, slots) {
  return computeMonthInterval(calendar, slots)[1];
}
function computeIsoWeekCeil(calendar, slots) {
  return combineDateAndTime(moveDateByDays(computeIsoWeekFloor(0, slots), 7), timeFieldDefaults);
}
function computeDayCeil(_calendar, slots) {
  return combineDateAndTime(moveDateByDays(slots, 1), timeFieldDefaults);
}
function computeYearInterval(calendar, slots) {
  return [computeYearFloor(calendar, slots), computeCalendarDateTimeFromParts(calendar, computeCalendarDateFields(calendar, slots).year + 1)];
}
function computeMonthInterval(calendar, slots) {
  const isoDateTime0 = computeMonthFloor(calendar, slots);
  const { year, month } = computeCalendarDateFields(calendar, slots);
  const { year: year1, month: month1 } = addCalendarMonths(calendar, year, month, 1);
  return [isoDateTime0, computeCalendarDateTimeFromParts(calendar, year1, month1)];
}
function computeIsoWeekInterval(calendar, slots) {
  const isoDateTime0 = computeIsoWeekFloor(0, slots);
  return [isoDateTime0, combineDateAndTime(moveDateByDays(isoDateTime0, 7), timeFieldDefaults)];
}
function roundDateToInterval(computeInterval, calendar, slots, roundingMode) {
  return roundEpochNanoToInterval(computeInterval, calendar, slots, isoDateToEpochNano(slots), roundingMode);
}
function computeCalendarDateTimeFromParts(calendar, year, month = 1) {
  return combineDateAndTime(computeCalendarIsoFieldsFromParts(calendar, year, month, 1), timeFieldDefaults);
}
function roundDateTimeToInterval(computeInterval, calendar, slots, roundingMode) {
  return roundEpochNanoToInterval(computeInterval, calendar, slots, isoDateTimeToEpochNano(slots), roundingMode);
}
function roundEpochNanoToInterval(computeInterval, calendar, slots, epochNano, roundingMode) {
  const [isoDateTime0, isoDateTime1] = computeInterval(calendar, slots);
  return roundWithMode(computeEpochNanoFrac(epochNano, isoDateTimeToEpochNano(isoDateTime0), isoDateTimeToEpochNano(isoDateTime1)), roundingMode) ? isoDateTime1 : isoDateTime0;
}

// node_modules/temporal-polyfill/chunks/apiHelpers.js
var PlainYearMonthBranding = "PlainYearMonth";
var PlainMonthDayBranding = "PlainMonthDay";
var PlainDateBranding = "PlainDate";
var PlainDateTimeBranding = "PlainDateTime";
var PlainTimeBranding = "PlainTime";
var ZonedDateTimeBranding = "ZonedDateTime";
var InstantBranding = "Instant";
var DurationBranding = "Duration";
var CalendarBranding = "Calendar";
function defineTemporalClass(branding, cls, getSlots, ...getterMaps) {
  return Object.defineProperties(cls, createNameDescriptors(branding)), Object.defineProperties(cls.prototype, createStringTagDescriptors("Temporal." + branding)), Object.defineProperties(cls.prototype, mapProps((getter) => ({
    get() {
      return getter(getSlots(this));
    },
    configurable: 1
  }), Object.assign({}, ...getterMaps))), cls;
}
var attachDebugString = "noop" === noop.name ? (instance) => {
  Object.defineProperty(instance, "_str_", {
    value: instance.toJSON()
  });
} : noop;
function invalidRecordType() {
  throwTypeError(invalidCallingContext);
}
function forbiddenValueOf2() {
  throwTypeError(forbiddenValueOf);
}
var yearMonthFieldGetters$1 = {
  era(slots) {
    return computeCalendarEraFields(slots.calendar, slots).era;
  },
  eraYear(slots) {
    return computeCalendarEraFields(slots.calendar, slots).eraYear;
  },
  year(slots) {
    return computeCalendarDateFields(slots.calendar, slots).year;
  },
  month(slots) {
    return computeCalendarDateFields(slots.calendar, slots).month;
  },
  monthCode(slots) {
    return computeCalendarMonthCode(slots.calendar, slots);
  }
};
var dateFieldGetters$1 = {
  era(slots) {
    return computeCalendarEraFields(slots.calendar, slots).era;
  },
  eraYear(slots) {
    return computeCalendarEraFields(slots.calendar, slots).eraYear;
  },
  year(slots) {
    return computeCalendarDateFields(slots.calendar, slots).year;
  },
  month(slots) {
    return computeCalendarDateFields(slots.calendar, slots).month;
  },
  monthCode(slots) {
    return computeCalendarMonthCode(slots.calendar, slots);
  },
  day(slots) {
    return computeCalendarDateFields(slots.calendar, slots).day;
  }
};
var monthDayFieldGetters$1 = {
  monthCode(slots) {
    return computeCalendarMonthCode(slots.calendar, slots);
  },
  day(slots) {
    return computeCalendarDateFields(slots.calendar, slots).day;
  }
};
function createNativeGetters(shimGetters) {
  return createPropGetters(Object.keys(shimGetters));
}
var durationGetters2 = createNativeGetters(durationGetters);
var timeGetters2 = createNativeGetters(timeGetters);
var yearMonthFieldGetters = createNativeGetters(yearMonthFieldGetters$1);
var dateFieldGetters = createNativeGetters(dateFieldGetters$1);
var monthDayFieldGetters = createNativeGetters(monthDayFieldGetters$1);
var diffZonedYears = bindArgs(diffZonedCalendarUnit, 9);
var diffZonedMonths = bindArgs(diffZonedCalendarUnit, 8);
var diffZonedWeeks = bindArgs(diffZonedDayWeekUnit, 7);
var diffZonedDays = bindArgs(diffZonedDayWeekUnit, 6);
var diffInstantEpochNanoTimeUnit = diffInstantTimeUnit;
var diffDateYears = bindArgs(diffDateCalendarUnit, 9);
var diffDateMonths = bindArgs(diffDateCalendarUnit, 8);
var diffDateTimeYears = bindArgs(diffDateTimeCalendarUnit, 9);
var diffDateTimeMonths = bindArgs(diffDateTimeCalendarUnit, 8);
var diffYearMonthYears = bindArgs(diffYearMonthUnit, 9);
var diffYearMonthMonths = bindArgs(diffYearMonthUnit, 8);
function diffZonedEpochNanoTimeUnit(unit, slots0, slots1, options) {
  return getCommonCalendar(slots0.calendar, slots1.calendar), diffInstantTimeUnit(unit, slots0, slots1, options);
}
function diffDateTimeEpochNanoTimeUnit(unit, slots0, slots1, options) {
  return getCommonCalendar(slots0.calendar, slots1.calendar), countDateTimeUnit(slots0, slots1, unit, refineUnitDiffOptions(unit, options));
}
function diffTimeNanoOfDayTimeUnit(unit, slots0, slots1, options) {
  return countTimeUnit(slots0, slots1, unit, refineUnitDiffOptions(unit, options));
}
function adaptRecordTimeUnitDiff(diffSlots, getSlots) {
  return (unit, record0, record1, options) => diffSlots(unit, getSlots(record0), getSlots(record1), options);
}
function diffInstantTimeUnit(unit, slots0, slots1, options) {
  return countEpochNanoUnit(slots0.epochNanoseconds, slots1.epochNanoseconds, unit, refineUnitDiffOptions(unit, options));
}
function diffZonedCalendarUnit(unit, slots0, slots1, options) {
  const calendar = getCommonCalendar(slots0.calendar, slots1.calendar);
  const rounding = refineUnitDiffOptions(unit, options);
  if (slots0.epochNanoseconds === slots1.epochNanoseconds) {
    return 0;
  }
  const timeZone = getCommonTimeZone(slots0.timeZone, slots1.timeZone);
  return countRelativeUnit(unit, {
    he: () => diffZonedEpochsExact(timeZone, calendar, slots0, slots1, unit),
    me: createZonedRelativeOps(calendar, timeZone, slots0),
    ie: slots1.epochNanoseconds
  }, rounding, 1);
}
function diffZonedDayWeekUnit(unit, slots0, slots1, options) {
  getCommonCalendar(slots0.calendar, slots1.calendar);
  const rounding = refineUnitDiffOptions(unit, options);
  return slots0.epochNanoseconds === slots1.epochNanoseconds ? 0 : countZonedDayWeekUnit(unit, getCommonTimeZone(slots0.timeZone, slots1.timeZone), slots0, slots1, rounding);
}
function diffDateTimeCalendarUnit(unit, slots0, slots1, options) {
  const calendar = getCommonCalendar(slots0.calendar, slots1.calendar);
  return diffPlainRelativeUnit(unit, options, () => diffDateTimesExact(calendar, slots0, slots1, unit), createDateRelativeOps(calendar, slots0), computeEndEpochNanoFromMidnight(slots0, slots1));
}
function computeEndEpochNanoFromMidnight(isoDateTime0, isoDateTime1) {
  return isoDateTimeToEpochNano(isoDateTime1) - BigInt(timeFieldsToNano(isoDateTime0));
}
function diffDateCalendarUnit(unit, slots0, slots1, options) {
  const calendar = getCommonCalendar(slots0.calendar, slots1.calendar);
  return diffPlainRelativeUnit(unit, options, () => diffCalendarDates(calendar, slots0, slots1, unit), createDateRelativeOps(calendar, slots0), isoDateToEpochNano(slots1));
}
function diffYearMonthUnit(unit, slots0, slots1, options) {
  const calendar = getCommonCalendar(slots0.calendar, slots1.calendar);
  return countYearMonthUnit(calendar, slots0, slots1, unit, refineUnitDiffOptions(unit, options));
}
function diffPlainRelativeUnit(unit, options, diffExact, relativeOps, endEpochNano) {
  return countRelativeUnit(unit, {
    he: diffExact,
    me: relativeOps,
    ie: endEpochNano
  }, refineUnitDiffOptions(unit, options));
}
function reversedMove(f) {
  return (slots, units, options) => f(slots, -units, options);
}
function moveDateByYears(calendar, isoDate, years, options) {
  const overflow = refineOverflowOptions(options);
  return years ? moveDateByCalendarUnits(calendar, isoDate, toStrictInteger(years), 0, overflow) : isoDate;
}
function moveDateByMonths(calendar, isoDate, months, options) {
  const overflow = refineOverflowOptions(options);
  return months ? moveDateByCalendarUnits(calendar, isoDate, 0, toStrictInteger(months), overflow) : isoDate;
}
function moveToDayOfYear(calendar, isoDate, dayOfYear3, options) {
  const overflow = refineOverflowOptions(options);
  return moveToRefinedDayOfYear(calendar, isoDate, toIntegerWithTrunc(dayOfYear3), overflow);
}
function moveToDayOfMonth(calendar, isoDate, day, options) {
  const overflow = refineOverflowOptions(options);
  return moveToRefinedDayOfMonth(calendar, isoDate, toIntegerWithTrunc(day), overflow);
}
function moveToDayOfWeek(_calendar, isoDate, dayOfWeek3, options) {
  const overflow = refineOverflowOptions(options);
  return moveToRefinedDayOfWeek(isoDate, toIntegerWithTrunc(dayOfWeek3), overflow);
}
function moveToWeekOfYear(calendar, isoDate, weekOfYear4, options) {
  const overflow = refineOverflowOptions(options);
  return moveToRefinedWeekOfYear(calendar, isoDate, toIntegerWithTrunc(weekOfYear4), overflow);
}

// node_modules/temporal-polyfill/chunks/funcApi.js
var PlainYearMonthRecordBranding = `${PlainYearMonthBranding}Record`;
var PlainMonthDayRecordBranding = `${PlainMonthDayBranding}Record`;
var PlainDateRecordBranding = `${PlainDateBranding}Record`;
var PlainDateTimeRecordBranding = `${PlainDateTimeBranding}Record`;
var PlainTimeRecordBranding = `${PlainTimeBranding}Record`;
var ZonedDateTimeRecordBranding = `${ZonedDateTimeBranding}Record`;
var InstantRecordBranding = `${InstantBranding}Record`;
var DurationRecordBranding = `${DurationBranding}Record`;
var CalendarRecordBranding = `${CalendarBranding}Record`;
var calendarMap = /* @__PURE__ */ new WeakMap();
var instantMap = /* @__PURE__ */ new WeakMap();
var zonedDateTimeMap = /* @__PURE__ */ new WeakMap();
var plainDateTimeMap = /* @__PURE__ */ new WeakMap();
var plainDateMap = /* @__PURE__ */ new WeakMap();
var plainTimeMap = /* @__PURE__ */ new WeakMap();
var plainYearMonthMap = /* @__PURE__ */ new WeakMap();
var plainMonthDayMap = /* @__PURE__ */ new WeakMap();
var durationMap = /* @__PURE__ */ new WeakMap();
function getCalendarSlots(record) {
  return getCalendarSlotsIfPresent(record) || invalidRecordType();
}
function getCalendarSlotsIfPresent(record) {
  return calendarMap.get(record);
}
function getInstantSlots(record) {
  return getInstantSlotsIfPresent(record) || invalidRecordType();
}
function getInstantSlotsIfPresent(record) {
  return instantMap.get(record);
}
function setInstantSlots(instance, slots) {
  instantMap.set(instance, slots);
}
function getZonedDateTimeSlots(record) {
  return getZonedDateTimeSlotsIfPresent(record) || invalidRecordType();
}
function getZonedDateTimeSlotsIfPresent(record) {
  return zonedDateTimeMap.get(record);
}
function setZonedDateTimeSlots(instance, slots) {
  zonedDateTimeMap.set(instance, slots);
}
function getPlainDateTimeSlots(record) {
  return getPlainDateTimeSlotsIfPresent(record) || invalidRecordType();
}
function getPlainDateTimeSlotsIfPresent(record) {
  return plainDateTimeMap.get(record);
}
function setPlainDateTimeSlots(instance, slots) {
  plainDateTimeMap.set(instance, slots);
}
function getPlainDateSlots(record) {
  return getPlainDateSlotsIfPresent(record) || invalidRecordType();
}
function getPlainDateSlotsIfPresent(record) {
  return plainDateMap.get(record);
}
function setPlainDateSlots(instance, slots) {
  plainDateMap.set(instance, slots);
}
function getPlainTimeSlots(record) {
  return getPlainTimeSlotsIfPresent(record) || invalidRecordType();
}
function getPlainTimeSlotsIfPresent(record) {
  return plainTimeMap.get(record);
}
function setPlainTimeSlots(instance, slots) {
  plainTimeMap.set(instance, slots);
}
function getPlainYearMonthSlots(record) {
  return getPlainYearMonthSlotsIfPresent(record) || invalidRecordType();
}
function getPlainYearMonthSlotsIfPresent(record) {
  return plainYearMonthMap.get(record);
}
function setPlainYearMonthSlots(instance, slots) {
  plainYearMonthMap.set(instance, slots);
}
function getPlainMonthDaySlots(record) {
  return getPlainMonthDaySlotsIfPresent(record) || invalidRecordType();
}
function getPlainMonthDaySlotsIfPresent(record) {
  return plainMonthDayMap.get(record);
}
function getDurationSlots(record) {
  return getDurationSlotsIfPresent(record) || invalidRecordType();
}
function getDurationSlotsIfPresent(record) {
  return durationMap.get(record);
}
var CalendarRecord = defineTemporalClass(CalendarRecordBranding, class {
  toJSON() {
    return getCalendarRecordId(this);
  }
  valueOf() {
    return getCalendarRecordId(this);
  }
});
function getCalendarRecordId(record) {
  return getCalendarSlots(record).id;
}
function getCalendarRecordImplCreator(record) {
  const getImpl = getCalendarSlots(record).xe;
  return getImpl || throwRangeError(exoticCalendarRequired(getCalendarRecordId(record), "getExotic or getAny")), getImpl;
}

// node_modules/temporal-polyfill/chunks/funcApi-native.js
var RawDateTimeFormatClass = RawDateTimeFormat;
function createNativeDateTimeFormatFactory(getNative) {
  class NativeDateTimeFormat extends RawDateTimeFormatClass {
    format(record) {
      return super.format(getNative(record));
    }
    formatToParts(record) {
      return super.formatToParts(getNative(record));
    }
    formatRange(record0, record1) {
      return super.formatRange(getNative(record0), getNative(record1));
    }
    formatRangeToParts(record0, record1) {
      return super.formatRangeToParts(getNative(record0), getNative(record1));
    }
  }
  return (locales, options) => new NativeDateTimeFormat(locales, options);
}
var getNativeDuration = getDurationSlots;
var NativeDurationRecord = defineTemporalClass(DurationRecordBranding, class {
  toJSON() {
    return getNativeDuration(this).toJSON();
  }
  valueOf() {
    return getNativeDuration(this).valueOf();
  }
}, getNativeDuration, durationGetters2);
function createRoundToOptions(smallestUnit, options) {
  return __spreadProps(__spreadValues({}, normalizeUnitRoundOptions(options)), {
    smallestUnit
  });
}
function refineNativeCalendarArgMaybe(calendarRecord) {
  if (void 0 !== calendarRecord) {
    return getValidatedCalendarId(calendarRecord);
  }
}
function getValidatedCalendarId(record) {
  return getCalendarRecordImplCreator(record), getCalendarRecordId(record);
}
var getNativePlainTime = getPlainTimeSlots;
var NativePlainTimeRecord = defineTemporalClass(PlainTimeRecordBranding, class {
  toJSON() {
    return getNativePlainTime(this).toJSON();
  }
  valueOf() {
    return getNativePlainTime(this).valueOf();
  }
}, getNativePlainTime, timeGetters2);
function createNativePlainTimeRecord(native) {
  const instance = Object.create(NativePlainTimeRecord.prototype);
  return setPlainTimeSlots(instance, native), attachDebugString(instance), instance;
}
var createFormat$5 = createNativeDateTimeFormatFactory(getNativePlainTime);
function roundToUnit$1(smallestUnit, record, options) {
  return ((record2, options2) => createNativePlainTimeRecord(getNativePlainTime(record2).round(options2)))(record, createRoundToOptions(smallestUnit, options));
}
var roundToHour$3 = bindArgs(roundToUnit$1, "hour");
var roundToMinute$3 = bindArgs(roundToUnit$1, "minute");
var roundToSecond$3 = bindArgs(roundToUnit$1, "second");
var roundToMillisecond$3 = bindArgs(roundToUnit$1, "millisecond");
var roundToMicrosecond$3 = bindArgs(roundToUnit$1, "microsecond");
var getNativePlainDateTime = getPlainDateTimeSlots;
var NativePlainDateTimeRecord = defineTemporalClass(PlainDateTimeRecordBranding, class {
  get calendarId() {
    return getNativePlainDateTime(this).calendarId;
  }
  toJSON() {
    return getNativePlainDateTime(this).toJSON();
  }
  valueOf() {
    return getNativePlainDateTime(this).valueOf();
  }
}, getNativePlainDateTime, dateFieldGetters, timeGetters2);
function createNativePlainDateTimeRecord(native) {
  const instance = Object.create(NativePlainDateTimeRecord.prototype);
  return setPlainDateTimeSlots(instance, native), attachDebugString(instance), instance;
}
function create$5(isoYear, isoMonth, isoDay, hour, minute, second, millisecond, microsecond, nanosecond, calendar) {
  return createNativePlainDateTimeRecord(new NativeTemporal.PlainDateTime(isoYear, isoMonth, isoDay, hour, minute, second, millisecond, microsecond, nanosecond, refineNativeCalendarArgMaybe(calendar)));
}
var createFormat$4 = createNativeDateTimeFormatFactory(getNativePlainDateTime);
function toZonedDateTime$1(record, timeZoneId, options) {
  return createNativeZonedDateTimeRecord(getNativePlainDateTime(record).toZonedDateTime(timeZoneId, options));
}
function roundToDayTimeUnit$1(smallestUnit, record, options) {
  return ((record2, options2) => createNativePlainDateTimeRecord(getNativePlainDateTime(record2).round(options2)))(record, createRoundToOptions(smallestUnit, options));
}
var roundToDay$1 = bindArgs(roundToDayTimeUnit$1, "day");
var roundToHour$2 = bindArgs(roundToDayTimeUnit$1, "hour");
var roundToMinute$2 = bindArgs(roundToDayTimeUnit$1, "minute");
var roundToSecond$2 = bindArgs(roundToDayTimeUnit$1, "second");
var roundToMillisecond$2 = bindArgs(roundToDayTimeUnit$1, "millisecond");
var roundToMicrosecond$2 = bindArgs(roundToDayTimeUnit$1, "microsecond");
var getNativePlainMonthDay = getPlainMonthDaySlots;
var NativePlainMonthDayRecord = defineTemporalClass(PlainMonthDayRecordBranding, class {
  get calendarId() {
    return getNativePlainMonthDay(this).calendarId;
  }
  toJSON() {
    return getNativePlainMonthDay(this).toJSON();
  }
  valueOf() {
    return getNativePlainMonthDay(this).valueOf();
  }
}, getNativePlainMonthDay, monthDayFieldGetters);
var createFormat$3 = createNativeDateTimeFormatFactory(getNativePlainMonthDay);
var getNativePlainYearMonth = getPlainYearMonthSlots;
var NativePlainYearMonthRecord = defineTemporalClass(PlainYearMonthRecordBranding, class {
  get calendarId() {
    return getNativePlainYearMonth(this).calendarId;
  }
  toJSON() {
    return getNativePlainYearMonth(this).toJSON();
  }
  valueOf() {
    return getNativePlainYearMonth(this).valueOf();
  }
}, getNativePlainYearMonth, yearMonthFieldGetters);
var createFormat$2 = createNativeDateTimeFormatFactory(getNativePlainYearMonth);
var getNativePlainDate = getPlainDateSlots;
var NativePlainDateRecord = defineTemporalClass(PlainDateRecordBranding, class {
  get calendarId() {
    return getNativePlainDate(this).calendarId;
  }
  toJSON() {
    return getNativePlainDate(this).toJSON();
  }
  valueOf() {
    return getNativePlainDate(this).valueOf();
  }
}, getNativePlainDate, dateFieldGetters);
var createFormat$1 = createNativeDateTimeFormatFactory(getNativePlainDate);
var getNativeZonedDateTime = getZonedDateTimeSlots;
var NativeZonedDateTimeRecord = defineTemporalClass(ZonedDateTimeRecordBranding, class {
  get calendarId() {
    return getNativeZonedDateTime(this).calendarId;
  }
  get timeZoneId() {
    return getNativeZonedDateTime(this).timeZoneId;
  }
  get epochMilliseconds() {
    return getNativeZonedDateTime(this).epochMilliseconds;
  }
  get epochNanoseconds() {
    return getNativeZonedDateTime(this).epochNanoseconds;
  }
  toJSON() {
    return getNativeZonedDateTime(this).toJSON();
  }
  valueOf() {
    return getNativeZonedDateTime(this).valueOf();
  }
}, getNativeZonedDateTime, dateFieldGetters, timeGetters2);
function createNativeZonedDateTimeRecord(native) {
  const instance = Object.create(NativeZonedDateTimeRecord.prototype);
  return setZonedDateTimeSlots(instance, native), attachDebugString(instance), instance;
}
function offsetNanoseconds(record) {
  return getNativeZonedDateTime(record).offsetNanoseconds;
}
function roundToDayTimeUnit(smallestUnit, record, options) {
  return ((record2, options2) => createNativeZonedDateTimeRecord(getNativeZonedDateTime(record2).round(options2)))(record, createRoundToOptions(smallestUnit, options));
}
var roundToDay = bindArgs(roundToDayTimeUnit, "day");
var roundToHour$1 = bindArgs(roundToDayTimeUnit, "hour");
var roundToMinute$1 = bindArgs(roundToDayTimeUnit, "minute");
var roundToSecond$1 = bindArgs(roundToDayTimeUnit, "second");
var roundToMillisecond$1 = bindArgs(roundToDayTimeUnit, "millisecond");
var roundToMicrosecond$1 = bindArgs(roundToDayTimeUnit, "microsecond");
var getNativeInstant = getInstantSlots;
var NativeInstantRecord = defineTemporalClass(InstantRecordBranding, class {
  get epochMilliseconds() {
    return getNativeInstant(this).epochMilliseconds;
  }
  get epochNanoseconds() {
    return getNativeInstant(this).epochNanoseconds;
  }
  toJSON() {
    return getNativeInstant(this).toJSON();
  }
  valueOf() {
    return getNativeInstant(this).valueOf();
  }
});
function createNativeInstantRecord(native) {
  const instance = Object.create(NativeInstantRecord.prototype);
  return setInstantSlots(instance, native), attachDebugString(instance), instance;
}
function fromEpochMilliseconds(epochMilliseconds) {
  return createNativeInstantRecord(NativeTemporal.Instant.fromEpochMilliseconds(epochMilliseconds));
}
function toZonedDateTimeISO(record, timeZoneId) {
  return createNativeZonedDateTimeRecord(getNativeInstant(record).toZonedDateTimeISO(timeZoneId));
}
var createFormat = createNativeDateTimeFormatFactory(getNativeInstant);
function roundToUnit(smallestUnit, record, options) {
  return ((record2, options2) => createNativeInstantRecord(getNativeInstant(record2).round(options2)))(record, createRoundToOptions(smallestUnit, options));
}
var roundToHour = bindArgs(roundToUnit, "hour");
var roundToMinute2 = bindArgs(roundToUnit, "minute");
var roundToSecond = bindArgs(roundToUnit, "second");
var roundToMillisecond = bindArgs(roundToUnit, "millisecond");
var roundToMicrosecond = bindArgs(roundToUnit, "microsecond");

// node_modules/temporal-polyfill/chunks/funcApi-shim.js
function createDateTimeFormatFactory(createArgsProvider, transformOptions) {
  const ShimDateTimeFormat = createDateTimeFormatShell(createArgsProvider, transformOptions);
  return Object.setPrototypeOf(ShimDateTimeFormat.prototype, RawDateTimeFormat.prototype), (locales, options) => new ShimDateTimeFormat(locales, options);
}
var getShimDurationSlots = getDurationSlots;
var ShimDurationRecord = defineTemporalClass(DurationRecordBranding, class {
  toJSON() {
    return formatDurationIsoAuto(getShimDurationSlots(this));
  }
  valueOf() {
    return forbiddenValueOf2();
  }
}, getShimDurationSlots, durationGetters);
function refineShimCalendarArgMaybe(calendarRecord) {
  return void 0 === calendarRecord ? isoCalendarImpl : getCalendarRecordImpl(calendarRecord);
}
function getCalendarRecordImpl(record) {
  return getCalendarRecordImplCreator(record)();
}
var getShimPlainTimeSlots = getPlainTimeSlots;
var ShimPlainTimeRecord = defineTemporalClass(PlainTimeRecordBranding, class {
  toJSON() {
    return formatTimeIsoAuto(getShimPlainTimeSlots(this));
  }
  valueOf() {
    return forbiddenValueOf2();
  }
}, getShimPlainTimeSlots, timeGetters);
function createShimPlainTimeRecord(slots) {
  const instance = Object.create(ShimPlainTimeRecord.prototype);
  return setPlainTimeSlots(instance, slots), attachDebugString(instance), instance;
}
var createFormat$52 = createDateTimeFormatFactory((internals) => ({
  A(record) {
    const slots = getShimPlainTimeSlots(record);
    return [internals.t, timeFieldsToMilli(slots)];
  },
  v(record0, record1) {
    const slots0 = getShimPlainTimeSlots(record0);
    const slots1 = getShimPlainTimeSlots(record1);
    return [internals.t, timeFieldsToMilli(slots0), timeFieldsToMilli(slots1)];
  }
}), (options) => applyPlainFormatTimeZone(transformTimeOptions(options, 1)));
function moveByTimeUnit$2(nanoInUnit, record, units) {
  const slots = getShimPlainTimeSlots(record);
  const delta = BigInt(toStrictInteger(units)) * BigInt(nanoInUnit);
  return createShimPlainTimeRecord(moveTimeByNano(slots, delta)[0]);
}
var addHours$3 = bindArgs(moveByTimeUnit$2, nanoInHour2);
var addMinutes$3 = bindArgs(moveByTimeUnit$2, nanoInMinute2);
var addSeconds$3 = bindArgs(moveByTimeUnit$2, nanoInSec2);
var addMilliseconds$3 = bindArgs(moveByTimeUnit$2, nanoInMilli2);
var addMicroseconds$3 = bindArgs(moveByTimeUnit$2, nanoInMicro2);
var addNanoseconds$3 = bindArgs(moveByTimeUnit$2, 1);
var subtractHours$3 = reversedMove(addHours$3);
var subtractMinutes$3 = reversedMove(addMinutes$3);
var subtractSeconds$3 = reversedMove(addSeconds$3);
var subtractMilliseconds$3 = reversedMove(addMilliseconds$3);
var subtractMicroseconds$3 = reversedMove(addMicroseconds$3);
var subtractNanoseconds$3 = reversedMove(addNanoseconds$3);
function roundToUnit$12(smallestUnit, record, options) {
  const slots = getShimPlainTimeSlots(record);
  const [roundingInc, roundingMode] = refineUnitRoundOptions(smallestUnit, options);
  return createShimPlainTimeRecord(roundTimeToInc(slots, computeNanoInc(smallestUnit, roundingInc), roundingMode)[0]);
}
var roundToHour$32 = bindArgs(roundToUnit$12, 5);
var roundToMinute$32 = bindArgs(roundToUnit$12, 4);
var roundToSecond$32 = bindArgs(roundToUnit$12, 3);
var roundToMillisecond$32 = bindArgs(roundToUnit$12, 2);
var roundToMicrosecond$32 = bindArgs(roundToUnit$12, 1);
var diffRecordTimeUnit$3 = adaptRecordTimeUnitDiff(diffTimeNanoOfDayTimeUnit, getShimPlainTimeSlots);
var diffHours$3 = bindArgs(diffRecordTimeUnit$3, 5);
var diffMinutes$3 = bindArgs(diffRecordTimeUnit$3, 4);
var diffSeconds$3 = bindArgs(diffRecordTimeUnit$3, 3);
var diffMilliseconds$3 = bindArgs(diffRecordTimeUnit$3, 2);
var diffMicroseconds$3 = bindArgs(diffRecordTimeUnit$3, 1);
var diffNanoseconds$3 = bindArgs(diffRecordTimeUnit$3, 0);
var getShimPlainDateTimeSlots = getPlainDateTimeSlots;
var ShimPlainDateTimeRecord = defineTemporalClass(PlainDateTimeRecordBranding, class {
  get calendarId() {
    return getCalendarSlotId(getShimPlainDateTimeSlots(this).calendar);
  }
  toJSON() {
    return formatDateTimeIsoAuto(getShimPlainDateTimeSlots(this));
  }
  valueOf() {
    return forbiddenValueOf2();
  }
}, getShimPlainDateTimeSlots, dateFieldGetters$1, timeGetters);
function createShimPlainDateTimeRecord(slots) {
  const instance = Object.create(ShimPlainDateTimeRecord.prototype);
  return setPlainDateTimeSlots(instance, slots), attachDebugString(instance), instance;
}
function create$52(isoYear, isoMonth, isoDay, hour = 0, minute = 0, second = 0, millisecond = 0, microsecond = 0, nanosecond = 0, calendar) {
  const fields = checkIsoDateTimeInBounds(validateIsoDateTimeFields(mapProps(toIntegerWithTrunc, {
    year: isoYear,
    month: isoMonth,
    day: isoDay,
    hour,
    minute,
    second,
    millisecond,
    microsecond,
    nanosecond
  })));
  const calendarImpl = refineShimCalendarArgMaybe(calendar);
  return createShimPlainDateTimeRecord(createDateTimeSlots(fields, calendarImpl));
}
var createFormat$42 = createDateTimeFormatFactory((internals) => ({
  A(record) {
    const slots = getShimPlainDateTimeSlots(record);
    const format = internals.t;
    return checkResolvedCalendarCompatible(format, slots), [format, isoDateTimeToEpochMilli(slots)];
  },
  v(record0, record1) {
    const slots0 = getShimPlainDateTimeSlots(record0);
    const slots1 = getShimPlainDateTimeSlots(record1);
    const format = internals.t;
    return checkResolvedCalendarCompatible(format, slots0), checkResolvedCalendarCompatible(format, slots1), [format, isoDateTimeToEpochMilli(slots0), isoDateTimeToEpochMilli(slots1)];
  }
}), (options) => applyPlainFormatTimeZone(transformDateTimeOptions(options, 1)));
function toZonedDateTime$12(record, timeZoneId, options) {
  return createShimZonedDateTimeRecord(dateTimeToZonedDateTime(getShimPlainDateTimeSlots(record), queryTimeZone(refineTimeZoneId(timeZoneId)), refineEpochDisambigOptions(options)));
}
function addYears$3(record, years, options) {
  const slots = getShimPlainDateTimeSlots(record);
  return createShimPlainDateTimeRecord(createDateTimeFromRefinedFields(moveDateByYears(slots.calendar, slots, years, options), slots, slots.calendar));
}
function addMonths$3(record, months, options) {
  const slots = getShimPlainDateTimeSlots(record);
  return createShimPlainDateTimeRecord(createDateTimeFromRefinedFields(moveDateByMonths(slots.calendar, slots, months, options), slots, slots.calendar));
}
function addWeeks$2(record, weeks) {
  const slots = getShimPlainDateTimeSlots(record);
  return createShimPlainDateTimeRecord(createDateTimeFromRefinedFields(moveDateByDays(slots, 7 * toStrictInteger(weeks)), slots, slots.calendar));
}
function addDays$2(record, days) {
  const slots = getShimPlainDateTimeSlots(record);
  return createShimPlainDateTimeRecord(createDateTimeFromRefinedFields(moveDateByDays(slots, toStrictInteger(days)), slots, slots.calendar));
}
var addHours$2 = bindArgs(moveByTimeUnit$1, nanoInHour2);
var addMinutes$2 = bindArgs(moveByTimeUnit$1, nanoInMinute2);
var addSeconds$2 = bindArgs(moveByTimeUnit$1, nanoInSec2);
var addMilliseconds$2 = bindArgs(moveByTimeUnit$1, nanoInMilli2);
var addMicroseconds$2 = bindArgs(moveByTimeUnit$1, nanoInMicro2);
var addNanoseconds$2 = bindArgs(moveByTimeUnit$1, 1);
var subtractYears$3 = reversedMove(addYears$3);
var subtractMonths$3 = reversedMove(addMonths$3);
var subtractWeeks$2 = reversedMove(addWeeks$2);
var subtractDays$2 = reversedMove(addDays$2);
var subtractHours$2 = reversedMove(addHours$2);
var subtractMinutes$2 = reversedMove(addMinutes$2);
var subtractSeconds$2 = reversedMove(addSeconds$2);
var subtractMilliseconds$2 = reversedMove(addMilliseconds$2);
var subtractMicroseconds$2 = reversedMove(addMicroseconds$2);
var subtractNanoseconds$2 = reversedMove(addNanoseconds$2);
var roundToYear$3 = bindArgs(roundToInterval$2, 9, computeYearInterval);
var roundToMonth$2 = bindArgs(roundToInterval$2, 8, computeMonthInterval);
var roundToWeek$2 = bindArgs(roundToInterval$2, 7, computeIsoWeekInterval);
function roundToDayTimeUnit2(smallestUnit, record, options) {
  const slots = getShimPlainDateTimeSlots(record);
  const [roundingInc, roundingMode] = refineUnitRoundOptions(smallestUnit, options);
  return createShimPlainDateTimeRecord(createDateTimeSlots(roundDateTimeToInc(slots, computeNanoInc(smallestUnit, roundingInc), roundingMode), slots.calendar));
}
var roundToDay$12 = bindArgs(roundToDayTimeUnit2, 6);
var roundToHour$22 = bindArgs(roundToDayTimeUnit2, 5);
var roundToMinute$22 = bindArgs(roundToDayTimeUnit2, 4);
var roundToSecond$22 = bindArgs(roundToDayTimeUnit2, 3);
var roundToMillisecond$22 = bindArgs(roundToDayTimeUnit2, 2);
var roundToMicrosecond$22 = bindArgs(roundToDayTimeUnit2, 1);
var startOfYear$3 = aligned$2(computeYearFloor);
var startOfMonth$2 = aligned$2(computeMonthFloor);
var startOfWeek$2 = aligned$2(computeIsoWeekFloor);
var startOfDay$1 = alignedDateTimeStart(computeDayFloor);
var startOfHour$1 = alignedTimeStart((slots) => ({
  hour: slots.hour,
  minute: 0,
  second: 0,
  millisecond: 0,
  microsecond: 0,
  nanosecond: 0
}));
var startOfMinute$1 = alignedTimeStart((slots) => ({
  hour: slots.hour,
  minute: slots.minute,
  second: 0,
  millisecond: 0,
  microsecond: 0,
  nanosecond: 0
}));
var startOfSecond$1 = alignedTimeStart((slots) => ({
  hour: slots.hour,
  minute: slots.minute,
  second: slots.second,
  millisecond: 0,
  microsecond: 0,
  nanosecond: 0
}));
var startOfMillisecond$1 = alignedTimeStart((slots) => ({
  hour: slots.hour,
  minute: slots.minute,
  second: slots.second,
  millisecond: slots.millisecond,
  microsecond: 0,
  nanosecond: 0
}));
var startOfMicrosecond$1 = alignedTimeStart((slots) => ({
  hour: slots.hour,
  minute: slots.minute,
  second: slots.second,
  millisecond: slots.millisecond,
  microsecond: slots.microsecond,
  nanosecond: 0
}));
var endOfYear$3 = aligned$2(computeYearCeil, -1);
var endOfMonth$2 = aligned$2(computeMonthCeil, -1);
var endOfWeek$2 = aligned$2(computeIsoWeekCeil, -1);
var endOfDay$1 = alignedTimeEnd(() => ({
  hour: 23,
  minute: 59,
  second: 59,
  millisecond: 999,
  microsecond: 999,
  nanosecond: 999
}));
var endOfHour$1 = alignedTimeEnd((slots) => ({
  hour: slots.hour,
  minute: 59,
  second: 59,
  millisecond: 999,
  microsecond: 999,
  nanosecond: 999
}));
var endOfMinute$1 = alignedTimeEnd((slots) => ({
  hour: slots.hour,
  minute: slots.minute,
  second: 59,
  millisecond: 999,
  microsecond: 999,
  nanosecond: 999
}));
var endOfSecond$1 = alignedTimeEnd((slots) => ({
  hour: slots.hour,
  minute: slots.minute,
  second: slots.second,
  millisecond: 999,
  microsecond: 999,
  nanosecond: 999
}));
var endOfMillisecond$1 = alignedTimeEnd((slots) => ({
  hour: slots.hour,
  minute: slots.minute,
  second: slots.second,
  millisecond: slots.millisecond,
  microsecond: 999,
  nanosecond: 999
}));
var endOfMicrosecond$1 = alignedTimeEnd((slots) => ({
  hour: slots.hour,
  minute: slots.minute,
  second: slots.second,
  millisecond: slots.millisecond,
  microsecond: slots.microsecond,
  nanosecond: 999
}));
var diffRecordTimeUnit$2 = adaptRecordTimeUnitDiff(diffDateTimeEpochNanoTimeUnit, getShimPlainDateTimeSlots);
var diffHours$2 = bindArgs(diffRecordTimeUnit$2, 5);
var diffMinutes$2 = bindArgs(diffRecordTimeUnit$2, 4);
var diffSeconds$2 = bindArgs(diffRecordTimeUnit$2, 3);
var diffMilliseconds$2 = bindArgs(diffRecordTimeUnit$2, 2);
var diffMicroseconds$2 = bindArgs(diffRecordTimeUnit$2, 1);
var diffNanoseconds$2 = bindArgs(diffRecordTimeUnit$2, 0);
function moveByTimeUnit$1(nanoInUnit, record, units) {
  const slots = getShimPlainDateTimeSlots(record);
  const delta = BigInt(toStrictInteger(units)) * BigInt(nanoInUnit);
  return createShimPlainDateTimeRecord(createDateTimeSlots(moveDateTimeByNano(slots, delta), slots.calendar));
}
function roundToInterval$2(unit, computeInterval, record, options) {
  const slots = getShimPlainDateTimeSlots(record);
  const [, roundingMode] = refineUnitRoundOptions(unit, options);
  const isoDateTime = roundDateTimeToInterval(computeInterval, slots.calendar, slots, roundingMode);
  return createShimPlainDateTimeRecord(createDateTimeFromRefinedFields(isoDateTime, isoDateTime, slots.calendar));
}
function aligned$2(computeAlignment, nanoDelta = 0) {
  return (record) => {
    const slots = getShimPlainDateTimeSlots(record);
    let isoDateTime = computeAlignment(slots.calendar, slots);
    return nanoDelta && (isoDateTime = epochNanoToIsoDateTime(isoDateTimeToEpochNano(isoDateTime) + BigInt(nanoDelta))), createShimPlainDateTimeRecord(createDateTimeFromRefinedFields(isoDateTime, isoDateTime, slots.calendar));
  };
}
function alignedDateTimeStart(computeAlignment) {
  return (record) => {
    const slots = getShimPlainDateTimeSlots(record);
    return createShimPlainDateTimeRecord(createDateTimeSlots(computeAlignment(slots), slots.calendar));
  };
}
function alignedTimeStart(computeAlignment) {
  return (record) => {
    const slots = getShimPlainDateTimeSlots(record);
    return createShimPlainDateTimeRecord(createDateTimeSlots(combineDateAndTime(slots, computeAlignment(slots)), slots.calendar));
  };
}
function alignedTimeEnd(computeAlignment) {
  return (record) => {
    const slots = getShimPlainDateTimeSlots(record);
    return createShimPlainDateTimeRecord(createDateTimeSlots(combineDateAndTime(slots, computeAlignment(slots)), slots.calendar));
  };
}
var getShimPlainMonthDaySlots = getPlainMonthDaySlots;
var ShimPlainMonthDayRecord = defineTemporalClass(PlainMonthDayRecordBranding, class {
  get calendarId() {
    return getCalendarSlotId(getShimPlainMonthDaySlots(this).calendar);
  }
  toJSON() {
    return formatMonthDayIsoAuto(getShimPlainMonthDaySlots(this));
  }
  valueOf() {
    return forbiddenValueOf2();
  }
}, getShimPlainMonthDaySlots, monthDayFieldGetters$1);
var createFormat$32 = createDateTimeFormatFactory((internals) => ({
  A(record) {
    const slots = getShimPlainMonthDaySlots(record);
    const format = internals.t;
    return checkResolvedCalendarCompatible(format, slots, 1), [format, isoDateToEpochMilli(slots)];
  },
  v(record0, record1) {
    const slots0 = getShimPlainMonthDaySlots(record0);
    const slots1 = getShimPlainMonthDaySlots(record1);
    const format = internals.t;
    return checkResolvedCalendarCompatible(format, slots0, 1), checkResolvedCalendarCompatible(format, slots1, 1), [format, isoDateToEpochMilli(slots0), isoDateToEpochMilli(slots1)];
  }
}), (options) => applyPlainFormatTimeZone(transformMonthDayOptions(options, 1)));
var getShimPlainYearMonthSlots = getPlainYearMonthSlots;
var ShimPlainYearMonthRecord = defineTemporalClass(PlainYearMonthRecordBranding, class {
  get calendarId() {
    return getCalendarSlotId(getShimPlainYearMonthSlots(this).calendar);
  }
  toJSON() {
    return formatYearMonthIsoAuto(getShimPlainYearMonthSlots(this));
  }
  valueOf() {
    return forbiddenValueOf2();
  }
}, getShimPlainYearMonthSlots, yearMonthFieldGetters$1);
function createShimPlainYearMonthRecord(slots) {
  const instance = Object.create(ShimPlainYearMonthRecord.prototype);
  return setPlainYearMonthSlots(instance, slots), attachDebugString(instance), instance;
}
var createFormat$22 = createDateTimeFormatFactory((internals) => ({
  A(record) {
    const slots = getShimPlainYearMonthSlots(record);
    const format = internals.t;
    return checkResolvedCalendarCompatible(format, slots, 1), [format, isoDateToEpochMilli(slots)];
  },
  v(record0, record1) {
    const slots0 = getShimPlainYearMonthSlots(record0);
    const slots1 = getShimPlainYearMonthSlots(record1);
    const format = internals.t;
    return checkResolvedCalendarCompatible(format, slots0, 1), checkResolvedCalendarCompatible(format, slots1, 1), [format, isoDateToEpochMilli(slots0), isoDateToEpochMilli(slots1)];
  }
}), (options) => applyPlainFormatTimeZone(transformYearMonthOptions(options, 1)));
function addYears$2(record, years, options) {
  const slots = getShimPlainYearMonthSlots(record);
  return createShimPlainYearMonthRecord(createDateSlots(moveYearMonthByUnits(slots.calendar, slots, validateDurationCalendarUnit("years", toStrictInteger(years)), 0, refineOverflowOptions(options)), slots.calendar));
}
function addMonths$2(record, months, options) {
  const slots = getShimPlainYearMonthSlots(record);
  return createShimPlainYearMonthRecord(createDateSlots(moveYearMonthByUnits(slots.calendar, slots, 0, validateDurationCalendarUnit("months", toStrictInteger(months)), refineOverflowOptions(options)), slots.calendar));
}
var subtractYears$2 = reversedMove(addYears$2);
var subtractMonths$2 = reversedMove(addMonths$2);
var getShimPlainDateSlots = getPlainDateSlots;
var ShimPlainDateRecord = defineTemporalClass(PlainDateRecordBranding, class {
  get calendarId() {
    return getCalendarSlotId(getShimPlainDateSlots(this).calendar);
  }
  toJSON() {
    return formatDateIsoAuto(getShimPlainDateSlots(this));
  }
  valueOf() {
    return forbiddenValueOf2();
  }
}, getShimPlainDateSlots, dateFieldGetters$1);
function createShimPlainDateRecord(slots) {
  const instance = Object.create(ShimPlainDateRecord.prototype);
  return setPlainDateSlots(instance, slots), attachDebugString(instance), instance;
}
var createFormat$12 = createDateTimeFormatFactory((internals) => ({
  A(record) {
    const slots = getShimPlainDateSlots(record);
    const format = internals.t;
    return checkResolvedCalendarCompatible(format, slots), [format, isoDateToEpochMilli(slots)];
  },
  v(record0, record1) {
    const slots0 = getShimPlainDateSlots(record0);
    const slots1 = getShimPlainDateSlots(record1);
    const format = internals.t;
    return checkResolvedCalendarCompatible(format, slots0), checkResolvedCalendarCompatible(format, slots1), [format, isoDateToEpochMilli(slots0), isoDateToEpochMilli(slots1)];
  }
}), (options) => applyPlainFormatTimeZone(transformDateOptions(options, 1)));
var roundToYear$1 = bindArgs(roundToInterval$1, 9, computeYearInterval);
var roundToMonth$1 = bindArgs(roundToInterval$1, 8, computeMonthInterval);
var roundToWeek$1 = bindArgs(roundToInterval$1, 7, computeIsoWeekInterval);
var startOfYear$1 = aligned$1(computeYearFloor);
var startOfMonth$1 = aligned$1(computeMonthFloor);
var startOfWeek$1 = aligned$1(computeIsoWeekFloor);
var endOfYear$1 = aligned$1(computeYearCeil, -1);
var endOfMonth$1 = aligned$1(computeMonthCeil, -1);
var endOfWeek$1 = aligned$1(computeIsoWeekCeil, -1);
function roundToInterval$1(unit, computeInterval, record, options) {
  const slots = getShimPlainDateSlots(record);
  const [, roundingMode] = refineUnitRoundOptions(unit, options);
  return createRecordFromDateFields(__spreadProps(__spreadValues({}, roundDateToInterval(computeInterval, slots.calendar, slots, roundingMode)), {
    calendar: slots.calendar
  }));
}
function aligned$1(computeAlignment, dayDelta = 0) {
  return (record) => {
    const slots = getShimPlainDateSlots(record);
    return createRecordFromDateFields(__spreadProps(__spreadValues({}, moveDateByDays(computeAlignment(slots.calendar, slots), dayDelta)), {
      calendar: slots.calendar
    }));
  };
}
function createRecordFromDateFields(isoDate) {
  return checkIsoDateInBounds(isoDate), createShimPlainDateRecord(createDateSlots(isoDate, isoDate.calendar));
}
var getShimZonedDateTimeSlots = getZonedDateTimeSlots;
var ShimZonedDateTimeRecord = defineTemporalClass(ZonedDateTimeRecordBranding, class {
  get calendarId() {
    return getCalendarSlotId(getShimZonedDateTimeSlots(this).calendar);
  }
  get timeZoneId() {
    return getShimZonedDateTimeSlots(this).timeZone.id;
  }
  get epochMilliseconds() {
    return epochNanoToMilli(getShimZonedDateTimeSlots(this).epochNanoseconds);
  }
  get epochNanoseconds() {
    return getShimZonedDateTimeSlots(this).epochNanoseconds;
  }
  toJSON() {
    return formatZonedDateTimeIsoAuto(getShimZonedDateTimeSlots(this));
  }
  valueOf() {
    return forbiddenValueOf2();
  }
}, getShimZonedDateTimeIsoSlots, dateFieldGetters$1, timeGetters);
function createShimZonedDateTimeRecord(slots) {
  const instance = Object.create(ShimZonedDateTimeRecord.prototype);
  return setZonedDateTimeSlots(instance, slots), attachDebugString(instance), instance;
}
function getShimZonedDateTimeIsoSlots(record) {
  const slots = getShimZonedDateTimeSlots(record);
  return __spreadProps(__spreadValues({}, zonedEpochSlotsToIso(slots)), {
    calendar: slots.calendar
  });
}
function offsetNanoseconds2(record) {
  return zonedEpochSlotsToIso(getShimZonedDateTimeSlots(record)).offsetNanoseconds;
}
var withDayOfYear2 = zonedTransform(moveToDayOfYear);
var withDayOfMonth = zonedTransform(moveToDayOfMonth);
var withDayOfWeek2 = zonedTransform(moveToDayOfWeek);
var withWeekOfYear2 = zonedTransform(moveToWeekOfYear);
var addYears = zonedTransform(moveDateByYears);
var addMonths = zonedTransform(moveDateByMonths);
var addWeeks = zonedTransform((_calendar, isoDate, weeks) => moveDateByDays(isoDate, 7 * toStrictInteger(weeks)));
var addDays = zonedTransform((_calendar, isoDate, days) => moveDateByDays(isoDate, toStrictInteger(days)));
var addHours$1 = bindArgs(moveByTimeUnit, nanoInHour2);
var addMinutes$1 = bindArgs(moveByTimeUnit, nanoInMinute2);
var addSeconds$1 = bindArgs(moveByTimeUnit, nanoInSec2);
var addMilliseconds$1 = bindArgs(moveByTimeUnit, nanoInMilli2);
var addMicroseconds$1 = bindArgs(moveByTimeUnit, nanoInMicro2);
var addNanoseconds$1 = bindArgs(moveByTimeUnit, 1);
var subtractYears = reversedMove(addYears);
var subtractMonths = reversedMove(addMonths);
var subtractWeeks = reversedMove(addWeeks);
var subtractDays = reversedMove(addDays);
var subtractHours$1 = reversedMove(addHours$1);
var subtractMinutes$1 = reversedMove(addMinutes$1);
var subtractSeconds$1 = reversedMove(addSeconds$1);
var subtractMilliseconds$1 = reversedMove(addMilliseconds$1);
var subtractMicroseconds$1 = reversedMove(addMicroseconds$1);
var subtractNanoseconds$1 = reversedMove(addNanoseconds$1);
var roundToYear2 = bindArgs(roundToInterval, 9, computeYearInterval);
var roundToMonth2 = bindArgs(roundToInterval, 8, computeMonthInterval);
var roundToWeek2 = bindArgs(roundToInterval, 7, computeIsoWeekInterval);
function roundToTimeUnit(smallestUnit, record, options) {
  const slots = getShimZonedDateTimeSlots(record);
  const [roundingInc, roundingMode] = refineUnitRoundOptions(smallestUnit, options);
  return createShimZonedDateTimeRecord(createZonedEpochNanoSlots(roundZonedEpochToTime(slots, smallestUnit, roundingInc, roundingMode), slots.timeZone, slots.calendar));
}
var roundToHour$12 = bindArgs(roundToTimeUnit, 5);
var roundToMinute$12 = bindArgs(roundToTimeUnit, 4);
var roundToSecond$12 = bindArgs(roundToTimeUnit, 3);
var roundToMillisecond$12 = bindArgs(roundToTimeUnit, 2);
var roundToMicrosecond$12 = bindArgs(roundToTimeUnit, 1);
var startOfYear2 = aligned(computeYearFloor);
var startOfMonth2 = aligned(computeMonthFloor);
var startOfWeek2 = aligned(computeIsoWeekFloor);
var startOfHour2 = alignedZonedTime((slots) => ({
  hour: slots.hour,
  minute: 0,
  second: 0,
  millisecond: 0,
  microsecond: 0,
  nanosecond: 0
}));
var startOfMinute2 = alignedZonedTime((slots) => ({
  hour: slots.hour,
  minute: slots.minute,
  second: 0,
  millisecond: 0,
  microsecond: 0,
  nanosecond: 0
}));
var startOfSecond2 = alignedZonedTime((slots) => ({
  hour: slots.hour,
  minute: slots.minute,
  second: slots.second,
  millisecond: 0,
  microsecond: 0,
  nanosecond: 0
}));
var startOfMillisecond2 = alignedZonedTime((slots) => ({
  hour: slots.hour,
  minute: slots.minute,
  second: slots.second,
  millisecond: slots.millisecond,
  microsecond: 0,
  nanosecond: 0
}));
var startOfMicrosecond2 = alignedZonedTime((slots) => ({
  hour: slots.hour,
  minute: slots.minute,
  second: slots.second,
  millisecond: slots.millisecond,
  microsecond: slots.microsecond,
  nanosecond: 0
}));
var endOfYear2 = aligned(computeYearCeil, -1);
var endOfMonth2 = aligned(computeMonthCeil, -1);
var endOfWeek2 = aligned(computeIsoWeekCeil, -1);
var endOfDay2 = aligned(computeDayCeil, -1);
var endOfHour2 = alignedZonedTime((slots) => ({
  hour: slots.hour,
  minute: 0,
  second: 0,
  millisecond: 0,
  microsecond: 0,
  nanosecond: 0
}), nanoInHour2 - 1);
var endOfMinute2 = alignedZonedTime((slots) => ({
  hour: slots.hour,
  minute: slots.minute,
  second: 0,
  millisecond: 0,
  microsecond: 0,
  nanosecond: 0
}), nanoInMinute2 - 1);
var endOfSecond2 = alignedZonedTime((slots) => ({
  hour: slots.hour,
  minute: slots.minute,
  second: slots.second,
  millisecond: 0,
  microsecond: 0,
  nanosecond: 0
}), nanoInSec2 - 1);
var endOfMillisecond2 = alignedZonedTime((slots) => ({
  hour: slots.hour,
  minute: slots.minute,
  second: slots.second,
  millisecond: slots.millisecond,
  microsecond: 0,
  nanosecond: 0
}), nanoInMilli2 - 1);
var endOfMicrosecond2 = alignedZonedTime((slots) => ({
  hour: slots.hour,
  minute: slots.minute,
  second: slots.second,
  millisecond: slots.millisecond,
  microsecond: slots.microsecond,
  nanosecond: 0
}), nanoInMicro2 - 1);
var diffRecordTimeUnit$1 = adaptRecordTimeUnitDiff(diffZonedEpochNanoTimeUnit, getShimZonedDateTimeSlots);
var diffHours$1 = bindArgs(diffRecordTimeUnit$1, 5);
var diffMinutes$1 = bindArgs(diffRecordTimeUnit$1, 4);
var diffSeconds$1 = bindArgs(diffRecordTimeUnit$1, 3);
var diffMilliseconds$1 = bindArgs(diffRecordTimeUnit$1, 2);
var diffMicroseconds$1 = bindArgs(diffRecordTimeUnit$1, 1);
var diffNanoseconds$1 = bindArgs(diffRecordTimeUnit$1, 0);
function moveByTimeUnit(nanoInUnit, record, units) {
  const slots = getShimZonedDateTimeSlots(record);
  const delta = BigInt(toStrictInteger(units)) * BigInt(nanoInUnit);
  return createShimZonedDateTimeRecord(__spreadProps(__spreadValues({}, slots), {
    epochNanoseconds: moveEpochNanoByNano(slots.epochNanoseconds, delta)
  }));
}
function roundToInterval(unit, computeInterval, record, options) {
  const slots = getShimZonedDateTimeSlots(record);
  const [, roundingMode] = refineUnitRoundOptions(unit, options);
  const epochNanoseconds = roundZonedEpochToInterval(computeInterval, slots, roundingMode);
  return createShimZonedDateTimeRecord(__spreadProps(__spreadValues({}, slots), {
    epochNanoseconds: checkEpochNanoInBounds(epochNanoseconds)
  }));
}
function aligned(computeAlignment, nanoDelta = 0) {
  return (record) => {
    const slots = getShimZonedDateTimeSlots(record);
    const epochNanoseconds = alignZonedEpoch(computeAlignment, slots) + BigInt(nanoDelta);
    return createShimZonedDateTimeRecord(__spreadProps(__spreadValues({}, slots), {
      epochNanoseconds: checkEpochNanoInBounds(epochNanoseconds)
    }));
  };
}
function alignedZonedTime(computeAlignment, nanoDelta = 0) {
  return (record) => {
    const slots = getShimZonedDateTimeSlots(record);
    const { timeZone } = slots;
    const isoDateTime = zonedEpochSlotsToIso(slots);
    const alignedIsoDateTime = combineDateAndTime(isoDateTime, computeAlignment(isoDateTime));
    const epochNanoseconds = getMatchingInstantFor(timeZone, alignedIsoDateTime, isoDateTime.offsetNanoseconds, 2, 0, 1) + BigInt(nanoDelta);
    return createShimZonedDateTimeRecord(__spreadProps(__spreadValues({}, slots), {
      epochNanoseconds: checkEpochNanoInBounds(epochNanoseconds)
    }));
  };
}
function zonedTransform(transformIsoDate) {
  return (record, ...args) => {
    const slots = getShimZonedDateTimeSlots(record);
    const { calendar, timeZone } = slots;
    const isoDateTime = zonedEpochSlotsToIso(slots);
    const isoDate = transformIsoDate(calendar, isoDateTime, ...args);
    const epochNanoseconds = getSingleInstantFor(timeZone, combineDateAndTime(isoDate, isoDateTime));
    return createShimZonedDateTimeRecord(__spreadProps(__spreadValues({}, slots), {
      epochNanoseconds: checkEpochNanoInBounds(epochNanoseconds)
    }));
  };
}
var getShimInstantSlots = getInstantSlots;
var ShimInstantRecord = defineTemporalClass(InstantRecordBranding, class {
  get epochMilliseconds() {
    return epochNanoToMilli(getShimInstantSlots(this).epochNanoseconds);
  }
  get epochNanoseconds() {
    return getShimInstantSlots(this).epochNanoseconds;
  }
  toJSON() {
    return formatInstantIsoAuto(getShimInstantSlots(this));
  }
  valueOf() {
    return forbiddenValueOf2();
  }
});
function createShimInstantRecord(slots) {
  const instance = Object.create(ShimInstantRecord.prototype);
  return setInstantSlots(instance, slots), attachDebugString(instance), instance;
}
function fromEpochMilliseconds2(epochMilliseconds) {
  return createShimInstantRecord(epochMilliToInstant(epochMilliseconds));
}
function toZonedDateTimeISO2(record, timeZoneId) {
  return createShimZonedDateTimeRecord(instantToZonedDateTime(getShimInstantSlots(record), queryTimeZone(refineTimeZoneId(timeZoneId))));
}
var createFormat2 = createDateTimeFormatFactory((internals) => ({
  A(record) {
    const slots = getShimInstantSlots(record);
    return [internals.t, epochNanoToMilli(slots.epochNanoseconds)];
  },
  v(record0, record1) {
    const slots0 = getShimInstantSlots(record0);
    const slots1 = getShimInstantSlots(record1);
    return [internals.t, epochNanoToMilli(slots0.epochNanoseconds), epochNanoToMilli(slots1.epochNanoseconds)];
  }
}), (options) => transformInstantOptions(options, 1));
function roundToUnit2(smallestUnit, record, options) {
  const slots = getShimInstantSlots(record);
  const [roundingInc, roundingMode] = refineUnitRoundOptions(smallestUnit, options, 1);
  return createShimInstantRecord(createEpochNanoSlots(roundBigNanoToDayOriginInc(slots.epochNanoseconds, computeBigNanoInc(smallestUnit, roundingInc), roundingMode)));
}
var roundToHour2 = bindArgs(roundToUnit2, 5);
var roundToMinute3 = bindArgs(roundToUnit2, 4);
var roundToSecond2 = bindArgs(roundToUnit2, 3);
var roundToMillisecond2 = bindArgs(roundToUnit2, 2);
var roundToMicrosecond2 = bindArgs(roundToUnit2, 1);
var diffRecordTimeUnit = adaptRecordTimeUnitDiff(diffInstantEpochNanoTimeUnit, getShimInstantSlots);
var diffHours2 = bindArgs(diffRecordTimeUnit, 5);
var diffMinutes2 = bindArgs(diffRecordTimeUnit, 4);
var diffSeconds2 = bindArgs(diffRecordTimeUnit, 3);
var diffMilliseconds2 = bindArgs(diffRecordTimeUnit, 2);
var diffMicroseconds2 = bindArgs(diffRecordTimeUnit, 1);
var diffNanoseconds2 = bindArgs(diffRecordTimeUnit, 0);

// node_modules/temporal-polyfill/fns/ZonedDateTime.js
var offsetNanoseconds3 = NativeTemporal ? offsetNanoseconds : offsetNanoseconds2;

// node_modules/temporal-polyfill/fns/PlainDateTime.js
var create = NativeTemporal ? create$5 : create$52;
var toZonedDateTime = NativeTemporal ? toZonedDateTime$1 : toZonedDateTime$12;

// node_modules/temporal-polyfill/fns/Instant.js
var fromEpochMilliseconds3 = NativeTemporal ? fromEpochMilliseconds : fromEpochMilliseconds2;
var toZonedDateTimeISO3 = NativeTemporal ? toZonedDateTimeISO : toZonedDateTimeISO2;

// node_modules/@full-ui/headless-calendar/index.js
function addWeeks3(m, n) {
  let a = dateToUtcArray(m);
  a[2] += n * 7;
  return arrayToUtcDate(a);
}
function addDays3(m, n) {
  let a = dateToUtcArray(m);
  a[2] += n;
  return arrayToUtcDate(a);
}
function addMs(m, n) {
  let a = dateToUtcArray(m);
  a[6] += n;
  return arrayToUtcDate(a);
}
function diffWeeks4(m0, m1) {
  return diffDays4(m0, m1) / 7;
}
function diffDays4(m0, m1) {
  return (m1.valueOf() - m0.valueOf()) / (1e3 * 60 * 60 * 24);
}
function diffHours4(m0, m1) {
  return (m1.valueOf() - m0.valueOf()) / (1e3 * 60 * 60);
}
function diffMinutes4(m0, m1) {
  return (m1.valueOf() - m0.valueOf()) / (1e3 * 60);
}
function diffSeconds4(m0, m1) {
  return (m1.valueOf() - m0.valueOf()) / 1e3;
}
function diffDayAndTime(m0, m1) {
  let m0day = startOfDay4(m0);
  let m1day = startOfDay4(m1);
  return {
    years: 0,
    months: 0,
    days: Math.round(diffDays4(m0day, m1day)),
    milliseconds: m1.valueOf() - m1day.valueOf() - (m0.valueOf() - m0day.valueOf())
  };
}
function diffWholeWeeks(m0, m1) {
  let d = diffWholeDays(m0, m1);
  if (d !== null && d % 7 === 0) {
    return d / 7;
  }
  return null;
}
function diffWholeDays(m0, m1) {
  if (timeAsMs(m0) === timeAsMs(m1)) {
    return Math.round(diffDays4(m0, m1));
  }
  return null;
}
function startOfDay4(m) {
  return arrayToUtcDate([
    m.getUTCFullYear(),
    m.getUTCMonth(),
    m.getUTCDate()
  ]);
}
function startOfHour4(m) {
  return arrayToUtcDate([
    m.getUTCFullYear(),
    m.getUTCMonth(),
    m.getUTCDate(),
    m.getUTCHours()
  ]);
}
function startOfMinute4(m) {
  return arrayToUtcDate([
    m.getUTCFullYear(),
    m.getUTCMonth(),
    m.getUTCDate(),
    m.getUTCHours(),
    m.getUTCMinutes()
  ]);
}
function startOfSecond4(m) {
  return arrayToUtcDate([
    m.getUTCFullYear(),
    m.getUTCMonth(),
    m.getUTCDate(),
    m.getUTCHours(),
    m.getUTCMinutes(),
    m.getUTCSeconds()
  ]);
}
function weekOfYear3(marker, dow, doy) {
  let y = marker.getUTCFullYear();
  let w = weekOfGivenYear(marker, y, dow, doy);
  if (w < 1) {
    return weekOfGivenYear(marker, y - 1, dow, doy);
  }
  let nextW = weekOfGivenYear(marker, y + 1, dow, doy);
  if (nextW >= 1) {
    return Math.min(w, nextW);
  }
  return w;
}
function weekOfGivenYear(marker, year, dow, doy) {
  let firstWeekStart = arrayToUtcDate([year, 0, 1 + firstWeekOffset(year, dow, doy)]);
  let dayStart = startOfDay4(marker);
  let days = Math.round(diffDays4(firstWeekStart, dayStart));
  return Math.floor(days / 7) + 1;
}
function firstWeekOffset(year, dow, doy) {
  let fwd = 7 + dow - doy;
  let fwdlw = (7 + arrayToUtcDate([year, 0, fwd]).getUTCDay() - dow) % 7;
  return -fwdlw + fwd - 1;
}
function dateToLocalArray(date) {
  return [
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds()
  ];
}
function arrayToLocalDate(a) {
  return new Date(
    a[0],
    a[1] || 0,
    a[2] == null ? 1 : a[2],
    // day of month
    a[3] || 0,
    a[4] || 0,
    a[5] || 0
  );
}
function dateToUtcArray(date) {
  return [
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds()
  ];
}
function arrayToUtcDate(a) {
  if (a.length === 1) {
    a = a.concat([0]);
  }
  return new Date(Date.UTC(...a));
}
function isValidDate(m) {
  return !isNaN(m.valueOf());
}
function timeAsMs(m) {
  return m.getUTCHours() * 1e3 * 60 * 60 + m.getUTCMinutes() * 1e3 * 60 + m.getUTCSeconds() * 1e3 + m.getUTCMilliseconds();
}
var calendarSystemClassMap = {};
function registerCalendarSystem(name, theClass) {
  calendarSystemClassMap[name] = theClass;
}
function createCalendarSystem(name) {
  return new calendarSystemClassMap[name]();
}
var GregorianCalendarSystem = class {
  getMarkerYear(d) {
    return d.getUTCFullYear();
  }
  getMarkerMonth(d) {
    return d.getUTCMonth();
  }
  getMarkerDay(d) {
    return d.getUTCDate();
  }
  arrayToMarker(arr) {
    return arrayToUtcDate(arr);
  }
  markerToArray(marker) {
    return dateToUtcArray(marker);
  }
};
registerCalendarSystem("gregory", GregorianCalendarSystem);
function parseRange(input, dateEnv) {
  let start = null;
  let end = null;
  if (input.start) {
    start = dateEnv.createMarker(input.start);
  }
  if (input.end) {
    end = dateEnv.createMarker(input.end);
  }
  if (!start && !end) {
    return null;
  }
  if (start && end && end < start) {
    return null;
  }
  return { start, end };
}
function invertRanges(ranges, constraintRange) {
  let invertedRanges = [];
  let { start } = constraintRange;
  let i;
  let dateRange;
  ranges.sort(compareRanges);
  for (i = 0; i < ranges.length; i += 1) {
    dateRange = ranges[i];
    if (dateRange.start > start) {
      invertedRanges.push({ start, end: dateRange.start });
    }
    if (dateRange.end > start) {
      start = dateRange.end;
    }
  }
  if (start < constraintRange.end) {
    invertedRanges.push({ start, end: constraintRange.end });
  }
  return invertedRanges;
}
function compareRanges(range0, range1) {
  return range0.start.valueOf() - range1.start.valueOf();
}
function intersectRanges(range0, range1) {
  let { start, end } = range0;
  let newRange = null;
  if (range1.start !== null) {
    if (start === null) {
      start = range1.start;
    } else {
      start = new Date(Math.max(start.valueOf(), range1.start.valueOf()));
    }
  }
  if (range1.end != null) {
    if (end === null) {
      end = range1.end;
    } else {
      end = new Date(Math.min(end.valueOf(), range1.end.valueOf()));
    }
  }
  if (start === null || end === null || start < end) {
    newRange = { start, end };
  }
  return newRange;
}
function rangesEqual(range0, range1) {
  return (range0.start === null ? null : range0.start.valueOf()) === (range1.start === null ? null : range1.start.valueOf()) && (range0.end === null ? null : range0.end.valueOf()) === (range1.end === null ? null : range1.end.valueOf());
}
function rangesIntersect(range0, range1) {
  return (range0.end === null || range1.start === null || range0.end > range1.start) && (range0.start === null || range1.end === null || range0.start < range1.end);
}
function rangeContainsRange(outerRange, innerRange) {
  return (outerRange.start === null || innerRange.start !== null && innerRange.start >= outerRange.start) && (outerRange.end === null || innerRange.end !== null && innerRange.end <= outerRange.end);
}
function rangeContainsMarker(range, date) {
  return (range.start === null || date >= range.start) && (range.end === null || date < range.end);
}
function constrainMarkerToRange(date, range) {
  if (range.start != null && date < range.start) {
    return range.start;
  }
  if (range.end != null && date >= range.end) {
    return new Date(range.end.valueOf() - 1);
  }
  return date;
}
function expandZonedInstant(dateInfo, calendarSystem) {
  let a = calendarSystem.markerToArray(dateInfo.marker);
  return {
    marker: dateInfo.marker,
    instantMs: dateInfo.instantMs,
    timeZoneOffset: (dateInfo.marker.valueOf() - dateInfo.instantMs) / 6e4,
    array: a,
    year: a[0],
    month: a[1],
    day: a[2],
    hour: a[3],
    minute: a[4],
    second: a[5],
    millisecond: a[6]
  };
}
function createVerboseFormattingArg(start, end, context) {
  let startInfo = expandZonedInstant(start, context.calendarSystem);
  let endInfo = end ? expandZonedInstant(end, context.calendarSystem) : null;
  return {
    date: startInfo,
    start: startInfo,
    end: endInfo,
    timeZone: context.timeZone,
    localeCodes: context.locale.codes
  };
}
function isInt(n) {
  return n % 1 === 0;
}
function padStart(val, len) {
  let s = String(val);
  return "000".substr(0, len - s.length) + s;
}
var INTERNAL_UNITS = ["years", "months", "days", "milliseconds"];
var PARSE_RE = /^(-?)(?:(\d+)\.)?(\d+):(\d\d)(?::(\d\d)(?:\.(\d\d\d))?)?/;
function createDuration(input, unit) {
  if (typeof input === "string") {
    return parseString(input);
  }
  if (typeof input === "object" && input) {
    return parseObject(input);
  }
  if (typeof input === "number") {
    return parseObject({ [unit || "milliseconds"]: input });
  }
  return null;
}
function parseString(s) {
  let m = PARSE_RE.exec(s);
  if (m) {
    let sign = m[1] ? -1 : 1;
    return {
      years: 0,
      months: 0,
      days: sign * (m[2] ? parseInt(m[2], 10) : 0),
      milliseconds: sign * ((m[3] ? parseInt(m[3], 10) : 0) * 60 * 60 * 1e3 + // hours
      (m[4] ? parseInt(m[4], 10) : 0) * 60 * 1e3 + // minutes
      (m[5] ? parseInt(m[5], 10) : 0) * 1e3 + // seconds
      (m[6] ? parseInt(m[6], 10) : 0))
    };
  }
  return null;
}
function parseObject(obj) {
  let duration = {
    years: obj.years || obj.year || 0,
    months: obj.months || obj.month || 0,
    days: obj.days || obj.day || 0,
    milliseconds: (obj.hours || obj.hour || 0) * 60 * 60 * 1e3 + // hours
    (obj.minutes || obj.minute || 0) * 60 * 1e3 + // minutes
    (obj.seconds || obj.second || 0) * 1e3 + // seconds
    (obj.milliseconds || obj.millisecond || obj.ms || 0)
    // ms
  };
  let weeks = obj.weeks || obj.week;
  if (weeks) {
    duration.days += weeks * 7;
    duration.specifiedWeeks = true;
  }
  return duration;
}
function durationsEqual(d0, d1) {
  return d0.years === d1.years && d0.months === d1.months && d0.days === d1.days && d0.milliseconds === d1.milliseconds;
}
function addDurations(d0, d1) {
  return {
    years: d0.years + d1.years,
    months: d0.months + d1.months,
    days: d0.days + d1.days,
    milliseconds: d0.milliseconds + d1.milliseconds
  };
}
function subtractDurations(d1, d0) {
  return {
    years: d1.years - d0.years,
    months: d1.months - d0.months,
    days: d1.days - d0.days,
    milliseconds: d1.milliseconds - d0.milliseconds
  };
}
function multiplyDuration(d, n) {
  return {
    years: d.years * n,
    months: d.months * n,
    days: d.days * n,
    milliseconds: d.milliseconds * n
  };
}
function asRoughYears(dur) {
  return asRoughDays(dur) / 365;
}
function asRoughMonths(dur) {
  return asRoughDays(dur) / 30;
}
function asRoughDays(dur) {
  return asRoughMs(dur) / 864e5;
}
function asRoughMs(dur) {
  return dur.years * (365 * 864e5) + dur.months * (30 * 864e5) + dur.days * 864e5 + dur.milliseconds;
}
function wholeDivideDurations(numerator, denominator) {
  let res = null;
  for (let i = 0; i < INTERNAL_UNITS.length; i += 1) {
    let unit = INTERNAL_UNITS[i];
    if (denominator[unit]) {
      let localRes = numerator[unit] / denominator[unit];
      if (!isInt(localRes) || res !== null && res !== localRes) {
        return null;
      }
      res = localRes;
    } else if (numerator[unit]) {
      return null;
    }
  }
  return res;
}
function greatestDurationDenominator(dur) {
  let ms = dur.milliseconds;
  if (ms) {
    if (ms % 1e3 !== 0) {
      return { unit: "millisecond", value: ms };
    }
    if (ms % (1e3 * 60) !== 0) {
      return { unit: "second", value: ms / 1e3 };
    }
    if (ms % (1e3 * 60 * 60) !== 0) {
      return { unit: "minute", value: ms / (1e3 * 60) };
    }
    if (ms) {
      return { unit: "hour", value: ms / (1e3 * 60 * 60) };
    }
  }
  if (dur.days) {
    if (dur.specifiedWeeks && dur.days % 7 === 0) {
      return { unit: "week", value: dur.days / 7 };
    }
    return { unit: "day", value: dur.days };
  }
  if (dur.months) {
    return { unit: "month", value: dur.months };
  }
  if (dur.years) {
    return { unit: "year", value: dur.years };
  }
  return { unit: "millisecond", value: 0 };
}
function buildIsoString(marker, timeZoneOffset, stripZeroTime = false) {
  let s = marker.toISOString();
  s = s.replace(".000", "");
  if (stripZeroTime) {
    s = s.replace("T00:00:00Z", "");
  }
  if (s.length > 10) {
    if (timeZoneOffset == null) {
      s = s.replace("Z", "");
    } else if (timeZoneOffset !== 0) {
      s = s.replace("Z", formatTimeZoneOffset(timeZoneOffset, true));
    }
  }
  return s;
}
function formatDayString(marker) {
  return marker.toISOString().replace(/T.*$/, "");
}
function formatIsoTimeString(marker) {
  return padStart(marker.getUTCHours(), 2) + ":" + padStart(marker.getUTCMinutes(), 2) + ":" + padStart(marker.getUTCSeconds(), 2);
}
function formatTimeZoneOffset(minutes, doIso = false) {
  let sign = minutes < 0 ? "-" : "+";
  let abs = Math.abs(minutes);
  let hours = Math.floor(abs / 60);
  let mins = Math.round(abs % 60);
  if (doIso) {
    return `${sign + padStart(hours, 2)}:${padStart(mins, 2)}`;
  }
  return `GMT${sign}${hours}${mins ? `:${padStart(mins, 2)}` : ""}`;
}
function joinDateTimeFormatParts(parts) {
  let s = "";
  for (const part of parts) {
    s += part.value;
  }
  return s;
}
var ISO_RE = /^\s*(\d{4})(-?(\d{2})(-?(\d{2})([T ](\d{2}):?(\d{2})(:?(\d{2})(\.(\d+))?)?(Z|(([-+])(\d{2})(:?(\d{2}))?))?)?)?)?$/;
function parse(str) {
  let m = ISO_RE.exec(str);
  if (m) {
    let marker = new Date(Date.UTC(Number(m[1]), m[3] ? Number(m[3]) - 1 : 0, Number(m[5] || 1), Number(m[7] || 0), Number(m[8] || 0), Number(m[10] || 0), m[12] ? Number(`0.${m[12]}`) * 1e3 : 0));
    if (isValidDate(marker)) {
      let timeZoneOffset = null;
      if (m[13]) {
        timeZoneOffset = (m[15] === "-" ? -1 : 1) * (Number(m[16] || 0) * 60 + Number(m[18] || 0));
      }
      return {
        marker,
        isTimeUnspecified: !m[6],
        timeZoneOffset
      };
    }
  }
  return null;
}
var DateEnv = class {
  constructor(settings) {
    this.timeZone = settings.timeZone;
    this.calendarSystem = createCalendarSystem(settings.calendarSystem);
    this.locale = settings.locale;
    this.weekDow = settings.locale.week.dow;
    this.weekDoy = settings.locale.week.doy;
    if (settings.weekNumberCalculation === "ISO") {
      this.weekDow = 1;
      this.weekDoy = 4;
    }
    if (typeof settings.firstDay === "number") {
      this.weekDow = settings.firstDay;
    }
    if (typeof settings.weekNumberCalculation === "function") {
      this.weekNumberFunc = settings.weekNumberCalculation;
    }
    this.weekTextLong = settings.weekTextLong;
    this.weekTextShort = settings.weekTextShort ?? settings.weekTextLong;
    this.cmdFormatter = settings.cmdFormatter;
  }
  // Creating / Parsing
  createMarker(input) {
    let meta = this.createMarkerMeta(input);
    if (meta === null) {
      return null;
    }
    return meta.marker;
  }
  createNowMarker() {
    return this.timestampToMarker((/* @__PURE__ */ new Date()).valueOf());
  }
  createMarkerMeta(input) {
    if (typeof input === "string") {
      return this.parse(input);
    }
    let marker = null;
    let instantMs;
    if (typeof input === "number") {
      marker = this.timestampToMarker(input);
      instantMs = input;
    } else if (input instanceof Date) {
      input = input.valueOf();
      if (!isNaN(input)) {
        marker = this.timestampToMarker(input);
        instantMs = input;
      }
    } else if (Array.isArray(input)) {
      marker = arrayToUtcDate(input);
    }
    if (marker === null || !isValidDate(marker)) {
      return null;
    }
    return { marker, isTimeUnspecified: false, instantMs };
  }
  parse(s) {
    let parts = parse(s);
    if (parts === null) {
      return null;
    }
    let { marker } = parts;
    let instantMs;
    if (parts.timeZoneOffset !== null) {
      instantMs = marker.valueOf() - parts.timeZoneOffset * 60 * 1e3;
      marker = this.timestampToMarker(instantMs);
    }
    return { marker, isTimeUnspecified: parts.isTimeUnspecified, instantMs };
  }
  // Accessors
  getYear(marker) {
    return this.calendarSystem.getMarkerYear(marker);
  }
  getMonth(marker) {
    return this.calendarSystem.getMarkerMonth(marker);
  }
  getDay(marker) {
    return this.calendarSystem.getMarkerDay(marker);
  }
  // Adding / Subtracting
  add(marker, dur) {
    let a = this.calendarSystem.markerToArray(marker);
    a[0] += dur.years;
    a[1] += dur.months;
    a[2] += dur.days;
    a[6] += dur.milliseconds;
    return this.calendarSystem.arrayToMarker(a);
  }
  subtract(marker, dur) {
    let a = this.calendarSystem.markerToArray(marker);
    a[0] -= dur.years;
    a[1] -= dur.months;
    a[2] -= dur.days;
    a[6] -= dur.milliseconds;
    return this.calendarSystem.arrayToMarker(a);
  }
  addYears(marker, n) {
    let a = this.calendarSystem.markerToArray(marker);
    a[0] += n;
    return this.calendarSystem.arrayToMarker(a);
  }
  addMonths(marker, n) {
    let a = this.calendarSystem.markerToArray(marker);
    a[1] += n;
    return this.calendarSystem.arrayToMarker(a);
  }
  // Diffing Whole Units
  diffWholeYears(m0, m1) {
    let { calendarSystem } = this;
    if (timeAsMs(m0) === timeAsMs(m1) && calendarSystem.getMarkerDay(m0) === calendarSystem.getMarkerDay(m1) && calendarSystem.getMarkerMonth(m0) === calendarSystem.getMarkerMonth(m1)) {
      return calendarSystem.getMarkerYear(m1) - calendarSystem.getMarkerYear(m0);
    }
    return null;
  }
  diffWholeMonths(m0, m1) {
    let { calendarSystem } = this;
    if (timeAsMs(m0) === timeAsMs(m1) && calendarSystem.getMarkerDay(m0) === calendarSystem.getMarkerDay(m1)) {
      return calendarSystem.getMarkerMonth(m1) - calendarSystem.getMarkerMonth(m0) + (calendarSystem.getMarkerYear(m1) - calendarSystem.getMarkerYear(m0)) * 12;
    }
    return null;
  }
  // Range / Duration
  greatestWholeUnit(m0, m1) {
    let n = this.diffWholeYears(m0, m1);
    if (n !== null) {
      return { unit: "year", value: n };
    }
    n = this.diffWholeMonths(m0, m1);
    if (n !== null) {
      return { unit: "month", value: n };
    }
    n = diffWholeWeeks(m0, m1);
    if (n !== null) {
      return { unit: "week", value: n };
    }
    n = diffWholeDays(m0, m1);
    if (n !== null) {
      return { unit: "day", value: n };
    }
    n = diffHours4(m0, m1);
    if (isInt(n)) {
      return { unit: "hour", value: n };
    }
    n = diffMinutes4(m0, m1);
    if (isInt(n)) {
      return { unit: "minute", value: n };
    }
    n = diffSeconds4(m0, m1);
    if (isInt(n)) {
      return { unit: "second", value: n };
    }
    return { unit: "millisecond", value: m1.valueOf() - m0.valueOf() };
  }
  countDurationsBetween(m0, m1, d) {
    let diff3;
    if (d.years) {
      diff3 = this.diffWholeYears(m0, m1);
      if (diff3 !== null) {
        return diff3 / asRoughYears(d);
      }
    }
    if (d.months) {
      diff3 = this.diffWholeMonths(m0, m1);
      if (diff3 !== null) {
        return diff3 / asRoughMonths(d);
      }
    }
    if (d.days) {
      diff3 = diffWholeDays(m0, m1);
      if (diff3 !== null) {
        return diff3 / asRoughDays(d);
      }
    }
    return (m1.valueOf() - m0.valueOf()) / asRoughMs(d);
  }
  // Start-Of
  // these DON'T return zoned-dates. only UTC start-of dates
  startOf(m, unit) {
    if (unit === "year") {
      return this.startOfYear(m);
    }
    if (unit === "month") {
      return this.startOfMonth(m);
    }
    if (unit === "week") {
      return this.startOfWeek(m);
    }
    if (unit === "day") {
      return startOfDay4(m);
    }
    if (unit === "hour") {
      return startOfHour4(m);
    }
    if (unit === "minute") {
      return startOfMinute4(m);
    }
    if (unit === "second") {
      return startOfSecond4(m);
    }
    return null;
  }
  startOfYear(m) {
    return this.calendarSystem.arrayToMarker([
      this.calendarSystem.getMarkerYear(m)
    ]);
  }
  startOfMonth(m) {
    return this.calendarSystem.arrayToMarker([
      this.calendarSystem.getMarkerYear(m),
      this.calendarSystem.getMarkerMonth(m)
    ]);
  }
  startOfWeek(m) {
    return this.calendarSystem.arrayToMarker([
      this.calendarSystem.getMarkerYear(m),
      this.calendarSystem.getMarkerMonth(m),
      m.getUTCDate() - (m.getUTCDay() - this.weekDow + 7) % 7
    ]);
  }
  // Week Number
  computeWeekNumber(marker) {
    if (this.weekNumberFunc) {
      return this.weekNumberFunc(this.toDate(marker));
    }
    return weekOfYear3(marker, this.weekDow, this.weekDoy);
  }
  formatToParts(marker, formatter, dateOptions = {}) {
    return formatter.formatToParts(this.toZonedInstant(marker, dateOptions.instantMs), this);
  }
  formatRangeToParts(start, end, formatter, dateOptions = {}) {
    let { endInstantMs } = dateOptions;
    if (dateOptions.isEndExclusive) {
      end = addMs(end, -1);
      if (endInstantMs != null) {
        endInstantMs -= 1;
      }
    }
    return formatter.formatRangeToParts(this.toZonedInstant(start, dateOptions.startInstantMs), this.toZonedInstant(end, endInstantMs), this);
  }
  // pairs a wall-clock marker with its real epoch instant (first occurrence when the
  // wall-clock is ambiguous), unless an exact instant is supplied. the marker is
  // re-derived from the instant so the pair always agrees, even when the given marker
  // was nonexistent (DST gap) or expressed in a different offset's reading
  toZonedInstant(marker, instantMs) {
    if (instantMs == null) {
      instantMs = this.toDate(marker).valueOf();
    }
    return { marker: this.timestampToMarker(instantMs), instantMs };
  }
  /*
  DUMB: the omitTime arg is dumb. if we omit the time, we want to omit the timezone offset. and if we do that,
  might as well use buildIsoString or some other util directly
  */
  formatIso(marker, extraOptions = {}) {
    let timeZoneOffset = null;
    if (!extraOptions.omitTimeZoneOffset) {
      timeZoneOffset = this.offsetForMarker(marker);
    }
    return buildIsoString(marker, timeZoneOffset, extraOptions.omitTime);
  }
  // TimeZone
  timestampToMarker(ms) {
    if (this.timeZone === "local") {
      return arrayToUtcDate(dateToLocalArray(new Date(ms)));
    }
    if (this.timeZone === "UTC") {
      return new Date(ms);
    }
    const zdt = toZonedDateTimeISO3(fromEpochMilliseconds3(ms), this.timeZone);
    return new Date(
      // a "Date Marker", which is like PlainDateTime
      Date.UTC(zdt.year, zdt.month - 1, zdt.day, zdt.hour, zdt.minute, zdt.second, zdt.millisecond)
    );
  }
  offsetForMarker(m) {
    if (this.timeZone === "local") {
      return -arrayToLocalDate(dateToUtcArray(m)).getTimezoneOffset();
    }
    if (this.timeZone === "UTC") {
      return 0;
    }
    return offsetNanoseconds3(toZonedDateTime(create(m.getUTCFullYear(), m.getUTCMonth() + 1, m.getUTCDate(), m.getUTCHours(), m.getUTCMinutes(), m.getUTCSeconds(), m.getUTCMilliseconds()), this.timeZone)) / (1e9 * 60);
  }
  // Conversion
  toDate(m) {
    if (this.timeZone === "local") {
      return arrayToLocalDate(dateToUtcArray(m));
    }
    if (this.timeZone === "UTC") {
      return new Date(m.valueOf());
    }
    return new Date(toZonedDateTime(create(m.getUTCFullYear(), m.getUTCMonth() + 1, m.getUTCDate(), m.getUTCHours(), m.getUTCMinutes(), m.getUTCSeconds(), m.getUTCMilliseconds()), this.timeZone).epochMilliseconds);
  }
};
var EXTENDED_SETTINGS = /* @__PURE__ */ new Set([
  "week",
  "meridiem",
  "omitZeroMinute",
  "omitCommas",
  "forceCommas",
  "omitTrailing",
  "weekdayJustify"
]);
var MERIDIEM_RE = /([ap])\.?m\.?/i;
var COMMA_RE = /,/g;
var LTR_RE = /\u200e/g;
var TRAILING_RE = /[\s.,]+$/;
var WHITESPACE_ONLY_RE = /^\s+$/;
var NativeDateFormatter = class {
  constructor(options) {
    const standardOptions = {};
    const extendedOptions = {};
    for (const name in options) {
      if (EXTENDED_SETTINGS.has(name)) {
        extendedOptions[name] = options[name];
      } else {
        standardOptions[name] = options[name];
      }
    }
    if (standardOptions.timeZoneName) {
      standardOptions.timeZoneName = "shortOffset";
    }
    this.timeZoneOnly = Object.keys(standardOptions).length === 1 && Boolean(standardOptions.timeZoneName);
    this.weekOnly = Boolean(!Object.keys(standardOptions).length && extendedOptions.week);
    if (!this.timeZoneOnly) {
      if (standardOptions.timeZoneName) {
        if (!standardOptions.hour) {
          standardOptions.hour = "2-digit";
        }
        if (!standardOptions.minute) {
          standardOptions.minute = "2-digit";
        }
      }
      if (extendedOptions.omitZeroMinute && (standardOptions.second || standardOptions.fractionalSecondDigits)) {
        delete extendedOptions.omitZeroMinute;
      }
    }
    this.standardOptions = standardOptions;
    this.extendedOptions = extendedOptions;
  }
  formatToParts(date, context) {
    const { extendedOptions } = this;
    if (this.timeZoneOnly) {
      return this.getFormats(context).normalFormat.formatToParts(date.instantMs).filter((part) => part.type === "timeZoneName");
    }
    if (this.weekOnly) {
      return formatWeekNumberParts(context.computeWeekNumber(date.marker), context.weekTextLong, context.weekTextShort, context.locale, extendedOptions.week);
    }
    const { normalFormat, zeroFormat } = this.getFormats(context);
    const format = zeroFormat && !date.marker.getUTCMinutes() ? zeroFormat : normalFormat;
    const parts = format.formatToParts(date.instantMs);
    return postProcessParts(parts, extendedOptions);
  }
  formatRangeToParts(start, end, context) {
    const { extendedOptions } = this;
    if (this.timeZoneOnly || this.weekOnly) {
      return this.formatToParts(start, context).map((part) => {
        return __spreadValues({
          source: part.type === "literal" ? "shared" : "startRange"
        }, part);
      });
    }
    const { normalFormat, zeroFormat } = this.getFormats(context);
    const format = zeroFormat && !start.marker.getUTCMinutes() && !end.marker.getUTCMinutes() ? zeroFormat : normalFormat;
    const parts = format.formatRangeToParts(start.instantMs, end.instantMs);
    return postProcessRangeParts(parts, extendedOptions);
  }
  getFormats(context) {
    if (this.cachedContext !== context) {
      const { extendedOptions } = this;
      const { codes } = context.locale;
      const standardOptions = __spreadProps(__spreadValues({}, this.standardOptions), {
        // 'local' means the system zone, which is Intl's default
        timeZone: context.timeZone === "local" ? void 0 : context.timeZone
      });
      const normalFormat = new Intl.DateTimeFormat(codes, standardOptions);
      let zeroFormat;
      if (extendedOptions.omitZeroMinute) {
        const zeroProps = __spreadValues({}, standardOptions);
        delete zeroProps.minute;
        zeroFormat = new Intl.DateTimeFormat(codes, zeroProps);
      }
      this.cachedContext = context;
      this.cachedFormats = { normalFormat, zeroFormat };
    }
    return this.cachedFormats;
  }
};
function processPartsLoop(parts, extendedOptions) {
  let priorLiteral;
  for (const part of parts) {
    const isLiteral = part.type === "literal";
    if (isLiteral || part.type === "dayPeriod") {
      let s = part.value;
      s = s.replace(LTR_RE, "");
      if (extendedOptions.omitCommas) {
        s = s.replace(COMMA_RE, "");
      }
      if (!isLiteral) {
        const { meridiem } = extendedOptions;
        if (meridiem === false) {
          s = s.replace(MERIDIEM_RE, "");
        } else if (meridiem === "narrow") {
          s = s.replace(MERIDIEM_RE, (_m0, m1) => m1.toLocaleLowerCase());
        } else if (meridiem === "short") {
          s = s.replace(MERIDIEM_RE, (_m0, m1) => `${m1.toLocaleLowerCase()}m`);
        } else if (meridiem === "lowercase") {
          s = s.replace(MERIDIEM_RE, (m0) => m0.toLocaleLowerCase());
        }
        if (priorLiteral) {
          priorLiteral.value = priorLiteral.value.trimEnd();
        }
      }
      part.value = s;
    }
    priorLiteral = isLiteral ? part : void 0;
  }
}
function postProcessParts(parts, extendedOptions) {
  processPartsLoop(parts, extendedOptions);
  if (extendedOptions.weekdayJustify && parts.length === 3 && WHITESPACE_ONLY_RE.test(parts[1].value)) {
    if (parts[extendedOptions.weekdayJustify === "start" ? 2 : 0].type === "weekday") {
      parts.reverse();
    }
  }
  if (extendedOptions.forceCommas) {
    for (const part of parts) {
      if (part.type === "literal" && WHITESPACE_ONLY_RE.test(part.value)) {
        part.value = `,${part.value}`;
      }
    }
  }
  if (extendedOptions.omitTrailing) {
    stripTrailingLiteral(parts);
  }
  return parts.filter((part) => part.value);
}
function postProcessRangeParts(parts, extendedOptions) {
  processPartsLoop(parts, extendedOptions);
  if (extendedOptions.forceCommas) {
    for (const part of parts) {
      if (part.type === "literal" && WHITESPACE_ONLY_RE.test(part.value)) {
        part.value = `,${part.value}`;
      }
    }
  }
  if (extendedOptions.omitTrailing) {
    stripTrailingLiteral(parts);
  }
  return parts.filter((part) => part.value);
}
function stripTrailingLiteral(parts) {
  const lastPart = parts[parts.length - 1];
  if (lastPart?.type === "literal") {
    lastPart.value = lastPart.value.replace(TRAILING_RE, "");
    if (!lastPart.value) {
      parts.pop();
    }
  }
}
function formatWeekNumberParts(num, weekTextLong, weekTextShort, locale, display) {
  const parts = [];
  if (display === "long") {
    parts.push({ type: "literal", value: weekTextLong });
  } else if (display === "short" || display === "narrow") {
    parts.push({ type: "literal", value: weekTextShort });
  }
  if (display === "long" || display === "short") {
    parts.push({ type: "literal", value: " " });
  }
  parts.push({
    type: "week",
    value: locale.simpleNumberFormat.format(num)
  });
  if (locale.options.direction === "rtl") {
    parts.reverse();
  }
  return parts;
}
var CmdDateFormatter = class {
  constructor(cmdStr) {
    this.cmdStr = cmdStr;
  }
  formatToParts(date, context) {
    const res = context.cmdFormatter(this.cmdStr, createVerboseFormattingArg(date, null, context));
    if (Array.isArray(res)) {
      return res;
    }
    return [{ type: "literal", value: res }];
  }
  formatRangeToParts(start, end, context) {
    const res = context.cmdFormatter(this.cmdStr, createVerboseFormattingArg(start, end, context));
    if (Array.isArray(res)) {
      return res.map((part) => __spreadValues({
        source: "shared"
      }, part));
    }
    return [{ source: "shared", type: "literal", value: res }];
  }
};
var FuncDateFormatter = class {
  constructor(func) {
    this.func = func;
  }
  formatToParts(date, context) {
    const str = this.func(createVerboseFormattingArg(date, null, context));
    return [{ type: "literal", value: str }];
  }
  formatRangeToParts(start, end, context) {
    const str = this.func(createVerboseFormattingArg(start, end, context));
    return [{ source: "shared", type: "literal", value: str }];
  }
};

// node_modules/fullcalendar/chunks/3b4e987d.js
var classNames = { "popoverZ": "fc-1U", "isolate": "fc-1q", "borderBoxRoot": "fc-pp", "notAllowed": "fc-gm", "noScrollbars": "fc-xp", "noShrink": "fc-J9", "calendarScreenRoot": "fc-oi", "safeTiles": "fc-TV", "calendarPrintRoot": "fc-OY", "cursorPointer": "fc-ky", "cursorResizeT": "fc-Wq", "cursorResizeB": "fc-2H", "cursorResizeS": "fc-lP", "cursorResizeE": "fc-pu", "cursorColResizer": "fc-Mo", "hit": "fc-Bx", "hitX": "fc-rT", "hitY": "fc-1e", "hitXSkinny": "fc-7U", "selectNone": "fc-N6", "invisible": "fc-BW", "borderless": "fc-rf", "borderlessX": "fc-Nq", "borderlessY": "fc-zp", "borderlessTop": "fc-1h", "borderlessBottom": "fc-cZ", "borderlessStart": "fc-G8", "borderlessEnd": "fc-MA", "flexRow": "fc-Dh", "flexCol": "fc-vg", "grow": "fc-85", "liquid": "fc-91", "minHeight0": "fc-Da", "liquidX": "fc-1v", "printTable": "fc-uR", "noPadding": "fc-hF", "noPaddingY": "fc-Ds", "noMargin": "fc-TA", "noMarginY": "fc-rt", "noMarginX": "fc-wS", "whiteSpaceNoWrap": "fc-mV", "whiteSpacePre": "fc-zJ", "overflowAnchorNone": "fc-Fk", "pointerEventsNone": "fc-Ss", "crop": "fc-D6", "cropNowrap": "fc-5x", "rel": "fc-DP", "abs": "fc-P2", "start0": "fc-5a", "end0": "fc-lb", "fill": "fc-0X", "fillTop": "fc-9s", "fillX": "fc-Gk", "fillY": "fc-xh", "fillStart": "fc-XV", "sticky": "fc-XI", "stickyT": "fc-7G", "stickyS": "fc-Rw", "tableHeaderSticky": "fc-yg", "contentBox": "fc-2i", "offscreen": "fc-o2", "alignCenter": "fc-ih", "alignStart": "fc-HJ", "alignEnd": "fc-El", "footerScrollbarSticky": "fc-nF", "footerScrollbar": "fc-Or", "breakInsideAvoid": "fc-6w", "printCellContentMinHeight": "fc-9C", "flowRoot": "fc-GJ", "z0": "fc-d0", "z1": "fc-Og", "z2": "fc-BT", "z3": "fc-XO", "z4": "fc-e8", "z5": "fc-sR", "z1000": "fc-W4", "z9999": "fc-eV", "focusZ2": "fc-4U", "internalTimelineSlot": "fc-YC", "internalEvent": "fc-M0", "internalEventMirror": "fc-N9", "internalEventDraggable": "fc-41", "internalEventSelected": "fc-vO", "internalEventResizable": "fc-i0", "internalEventResizer": "fc-Nc", "internalEventResizerStart": "fc-hg", "internalEventResizerEnd": "fc-dk", "internalBgEvent": "fc-aw", "internalMoreLink": "fc-kw", "internalNavLink": "fc-Zy", "internalPopover": "fc-ox", "internalView": "fc-Q3", "internalScroller": "fc-P4" };

// node_modules/fullcalendar/chunks/642eba18.js
function createFormatter(input) {
  if (typeof input === "object" && input) {
    return new NativeDateFormatter(input);
  }
  if (typeof input === "string") {
    return new CmdDateFormatter(input);
  }
  if (typeof input === "function") {
    return new FuncDateFormatter(input);
  }
  return null;
}
function warn(...args) {
  console.warn("FullCalendar:", ...args);
}
var warnedClassNameOptions = {};
function refineClassName(input, optionName) {
  if (!input || typeof input === "string") {
    return input;
  }
  warnInvalidClassName(optionName);
  return "";
}
function refineClassNameGenerator(input, optionName) {
  if (typeof input === "function") {
    return (renderProps) => refineClassName(input(renderProps), optionName);
  }
  return refineClassName(input, optionName);
}
function warnInvalidClassName(optionName) {
  if (!warnedClassNameOptions[optionName]) {
    warn(`Invalid option \`${optionName}\`: expected a className string or a falsy value.`);
    warnedClassNameOptions[optionName] = true;
  }
}
function preventDefault(ev) {
  ev.preventDefault();
}
function buildDelegationHandler(selector, handler) {
  return (ev) => {
    let matchedChild = ev.target.closest(selector);
    if (matchedChild) {
      handler.call(matchedChild, ev, matchedChild);
    }
  };
}
function listenBySelector(container, eventType, selector, handler) {
  let attachedHandler = buildDelegationHandler(selector, handler);
  container.addEventListener(eventType, attachedHandler);
  return () => {
    container.removeEventListener(eventType, attachedHandler);
  };
}
function listenToHoverBySelector(container, selector, onMouseEnter, onMouseLeave) {
  let currentMatchedChild;
  return listenBySelector(container, "mouseover", selector, (mouseOverEv, matchedChild) => {
    if (matchedChild !== currentMatchedChild) {
      currentMatchedChild = matchedChild;
      onMouseEnter(mouseOverEv, matchedChild);
      let realOnMouseLeave = (mouseLeaveEv) => {
        currentMatchedChild = null;
        onMouseLeave(mouseLeaveEv, matchedChild);
        matchedChild.removeEventListener("mouseleave", realOnMouseLeave);
      };
      matchedChild.addEventListener("mouseleave", realOnMouseLeave);
    }
  });
}
var transitionEventNames = [
  "webkitTransitionEnd",
  "otransitionend",
  "oTransitionEnd",
  "msTransitionEnd",
  "transitionend"
];
function whenTransitionDone(el, callback) {
  let realCallback = (ev) => {
    callback(ev);
    transitionEventNames.forEach((eventName) => {
      el.removeEventListener(eventName, realCallback);
    });
  };
  transitionEventNames.forEach((eventName) => {
    el.addEventListener(eventName, realCallback);
  });
}
function createAriaClickAttrs(handler) {
  return __spreadValues({
    onClick: handler
  }, createAriaKeyboardAttrs(handler));
}
function createAriaKeyboardAttrs(handler) {
  return {
    tabIndex: 0,
    onKeyDown(ev) {
      if (ev.key === "Enter" || ev.key === " ") {
        handler(ev);
        ev.preventDefault();
      }
    }
  };
}
var guidNumber = 0;
function guid() {
  guidNumber += 1;
  return String(guidNumber);
}
function disableCursor() {
  document.body.classList.add(classNames.notAllowed);
}
function enableCursor() {
  document.body.classList.remove(classNames.notAllowed);
}
function preventSelection(el) {
  el.style.userSelect = "none";
  el.style.webkitUserSelect = "none";
  el.addEventListener("selectstart", preventDefault);
}
function allowSelection(el) {
  el.style.userSelect = "";
  el.style.webkitUserSelect = "";
  el.removeEventListener("selectstart", preventDefault);
}
function preventContextMenu(el) {
  el.addEventListener("contextmenu", preventDefault);
}
function allowContextMenu(el) {
  el.removeEventListener("contextmenu", preventDefault);
}
function parseFieldSpecs(input) {
  let specs = [];
  let tokens = [];
  let i;
  let token;
  if (typeof input === "string") {
    tokens = input.split(/\s*,\s*/);
  } else if (typeof input === "function") {
    tokens = [input];
  } else if (Array.isArray(input)) {
    tokens = input;
  }
  for (i = 0; i < tokens.length; i += 1) {
    token = tokens[i];
    if (typeof token === "string") {
      specs.push(token.charAt(0) === "-" ? { field: token.substring(1), order: -1 } : { field: token, order: 1 });
    } else if (typeof token === "function") {
      specs.push({ func: token });
    }
  }
  return specs;
}
function compareByFieldSpecs(obj0, obj1, fieldSpecs) {
  let i;
  let cmp;
  for (i = 0; i < fieldSpecs.length; i += 1) {
    cmp = compareByFieldSpec(obj0, obj1, fieldSpecs[i]);
    if (cmp) {
      return cmp;
    }
  }
  return 0;
}
function compareByFieldSpec(obj0, obj1, fieldSpec) {
  if (fieldSpec.func) {
    return fieldSpec.func(obj0, obj1);
  }
  return flexibleCompare(obj0[fieldSpec.field], obj1[fieldSpec.field]) * (fieldSpec.order || 1);
}
function flexibleCompare(a, b) {
  if (!a && !b) {
    return 0;
  }
  if (b == null) {
    return -1;
  }
  if (a == null) {
    return 1;
  }
  if (typeof a === "string" || typeof b === "string") {
    return String(a).localeCompare(String(b));
  }
  return a - b;
}
function formatWithOrdinals(formatter, args, fallbackText) {
  if (typeof formatter === "function") {
    return formatter(...args);
  }
  if (typeof formatter === "string") {
    return args.reduce((str, arg, index) => str.replace("$" + index, arg || ""), formatter);
  }
  return fallbackText;
}
function compareNumbers2(a, b) {
  return a - b;
}
function valuesIdentical(a, b) {
  return a === b;
}
function computeViewBorderless(options) {
  const borderless = options.borderless;
  return {
    borderlessX: Boolean(options.borderlessX ?? borderless),
    borderlessTop: Boolean(options.borderlessTop ?? borderless),
    borderlessBottom: Boolean(options.borderlessBottom ?? borderless)
  };
}
var { hasOwnProperty } = Object.prototype;
function filterHash(hash, func) {
  let filtered = {};
  for (let key in hash) {
    if (func(hash[key], key)) {
      filtered[key] = hash[key];
    }
  }
  return filtered;
}
function mapHash(hash, func) {
  let newHash = {};
  for (let key in hash) {
    newHash[key] = func(hash[key], key);
  }
  return newHash;
}
function hashValuesToArray(obj) {
  let a = [];
  for (let key in obj) {
    a.push(obj[key]);
  }
  return a;
}
function arrayToHash(a) {
  let hash = {};
  for (let item of a) {
    hash[item] = true;
  }
  return hash;
}
function isMaybePropsEqualDepth1(props0, props1) {
  if (typeof props0 === "object" && props0 && // non-null object
  typeof props1 === "object" && props1) {
    return isPropsEqualWithFunc(props0, props1, isPropsEqualShallow);
  }
  return props0 === props1;
}
function isPropsEqualWithFunc(props0, props1, valuesEqual) {
  if (props0 === props1) {
    return true;
  }
  for (let key in props0) {
    if (hasOwnProperty.call(props0, key)) {
      if (!(key in props1)) {
        return false;
      }
    }
  }
  for (let key in props1) {
    if (hasOwnProperty.call(props1, key)) {
      if (!(key in props0) || !valuesEqual(props0[key], props1[key], key)) {
        return false;
      }
    }
  }
  return true;
}
function isMaybePropsEqualShallow(props0, props1) {
  if (typeof props0 === "object" && typeof props1 === "object" && props0 && props1) {
    return isPropsEqualShallow(props0, props1);
  }
  return props0 === props1;
}
function isPropsEqualShallow(props0, props1) {
  return isPropsEqualWithFunc(props0, props1, valuesIdentical);
}
function isPropsEqualWithMap(props0, props1, equalityFuncMap) {
  return isPropsEqualWithFunc(props0, props1, (val0, val1, key) => {
    const equalityFunc = equalityFuncMap[key];
    const isEqual = equalityFunc ? equalityFunc(val0, val1) : val0 === val1;
    return isEqual;
  });
}
function getUnequalProps(props0, props1) {
  let keys = [];
  for (let key in props0) {
    if (hasOwnProperty.call(props0, key)) {
      if (!(key in props1)) {
        keys.push(key);
      }
    }
  }
  for (let key in props1) {
    if (hasOwnProperty.call(props1, key)) {
      if (props0[key] !== props1[key]) {
        keys.push(key);
      }
    }
  }
  return keys;
}
function mergeMaybePropsDepth1(props0, props1) {
  if (!props0) {
    return props1;
  }
  return mergePropsWithFunc(props0, props1, mergePropsShallow);
}
function mergePropsWithFunc(props0, props1, mergeValues) {
  const dest = {};
  for (let key in props0) {
    if (hasOwnProperty.call(props0, key)) {
      if (!(key in props1)) {
        dest[key] = props0[key];
      }
    }
  }
  for (let key in props1) {
    if (hasOwnProperty.call(props1, key)) {
      if (!(key in props0)) {
        dest[key] = props1[key];
      } else {
        dest[key] = mergeValues(props0[key], props1[key]);
      }
    }
  }
  return dest;
}
function mergePropsShallow(props0, props1) {
  return Object.assign({}, props0, props1);
}
function flatArray(items) {
  const res = [];
  for (const item of items) {
    if (Array.isArray(item)) {
      for (const subItem of item) {
        res.push(subItem);
      }
    } else {
      res.push(item);
    }
  }
  return res;
}
function flatMapArray(inputs, mapFunc) {
  const res = [];
  for (let i = 0; i < inputs.length; i += 1) {
    const output = mapFunc(inputs[i], i);
    if (Array.isArray(output)) {
      for (const subOutput of output) {
        res.push(subOutput);
      }
    } else {
      res.push(output);
    }
  }
  return res;
}
function isMaybeArraysEqual(array0, array1) {
  if (Array.isArray(array0) && Array.isArray(array1)) {
    return isArraysEqual(array0, array1);
  }
  return array0 === array1;
}
function isArraysEqual(array0, array1, itemsEqual = valuesIdentical) {
  if (array0 === array1) {
    return true;
  }
  let len = array0.length;
  let i;
  if (len !== array1.length) {
    return false;
  }
  for (i = 0; i < len; i += 1) {
    if (!itemsEqual(array0[i], array1[i])) {
      return false;
    }
  }
  return true;
}
var BASE_OPTION_REFINERS = {
  navLinkDayClick: identity2,
  navLinkWeekClick: identity2,
  duration: createDuration,
  buttons: identity2,
  toolbarElements: identity2,
  prevText: String,
  nextText: String,
  prevYearText: String,
  nextYearText: String,
  todayText: String,
  yearText: String,
  monthText: String,
  weekTextLong: String,
  weekTextShort: String,
  dayText: String,
  listText: identity2,
  todayHint: identity2,
  prevHint: identity2,
  nextHint: identity2,
  // TODO: make type for hint input
  buttonDisplay: identity2,
  buttonGroupClass: refineClassNameGenerator,
  buttonClass: refineClassNameGenerator,
  defaultAllDayEventDuration: createDuration,
  defaultTimedEventDuration: createDuration,
  nextDayThreshold: createDuration,
  scrollTime: createDuration,
  scrollTimeReset: Boolean,
  slotMinTime: createDuration,
  slotMaxTime: createDuration,
  popoverFormat: createFormatter,
  slotDuration: createDuration,
  snapDuration: createDuration,
  headerToolbar: identity2,
  footerToolbar: identity2,
  forceEventDuration: Boolean,
  // TODO: move to timegrid
  dayLaneClass: refineClassNameGenerator,
  dayLaneInnerClass: refineClassNameGenerator,
  dayLaneDidMount: identity2,
  dayLaneWillUnmount: identity2,
  initialView: String,
  aspectRatio: Number,
  weekends: Boolean,
  weekNumberCalculation: identity2,
  weekNumbers: Boolean,
  weekNumberHeaderClass: refineClassNameGenerator,
  weekNumberHeaderInnerClass: refineClassNameGenerator,
  weekNumberHeaderContent: identity2,
  weekNumberHeaderDidMount: identity2,
  weekNumberHeaderWillUnmount: identity2,
  inlineWeekNumberClass: refineClassNameGenerator,
  inlineWeekNumberContent: identity2,
  inlineWeekNumberDidMount: identity2,
  inlineWeekNumberWillUnmount: identity2,
  editable: Boolean,
  controller: identity2,
  nowIndicator: Boolean,
  nowIndicatorSnap: identity2,
  nowIndicatorHeaderClass: refineClassNameGenerator,
  nowIndicatorHeaderContent: identity2,
  nowIndicatorHeaderDidMount: identity2,
  nowIndicatorHeaderWillUnmount: identity2,
  nowIndicatorDotClass: refineClassName,
  nowIndicatorLineClass: refineClassNameGenerator,
  nowIndicatorLineContent: identity2,
  nowIndicatorLineDidMount: identity2,
  nowIndicatorLineWillUnmount: identity2,
  showNonCurrentDates: Boolean,
  lazyFetching: Boolean,
  startParam: String,
  endParam: String,
  timeZoneParam: String,
  timeZone: String,
  locales: identity2,
  locale: identity2,
  dragRevertDuration: Number,
  dragScroll: Boolean,
  allDayMaintainDuration: Boolean,
  unselectAuto: Boolean,
  dropAccept: identity2,
  // TODO: type draggable
  eventOrder: parseFieldSpecs,
  eventOrderStrict: Boolean,
  eventSlicing: Boolean,
  // default: true
  eventPrintLayout: String,
  longPressDelay: Number,
  eventDragMinDistance: Number,
  expandRows: Boolean,
  height: identity2,
  contentHeight: identity2,
  direction: String,
  colorScheme: String,
  weekNumberFormat: createFormatter,
  eventResizableFromStart: Boolean,
  displayEventTime: Boolean,
  displayEventEnd: Boolean,
  progressiveEventRendering: Boolean,
  businessHours: identity2,
  initialDate: identity2,
  now: identity2,
  eventDataTransform: identity2,
  tableHeaderSticky: identity2,
  footerScrollbarSticky: identity2,
  defaultAllDay: Boolean,
  eventSourceFailure: identity2,
  eventSourceSuccess: identity2,
  eventDisplay: String,
  // TODO: give more specific
  eventStartEditable: Boolean,
  eventDurationEditable: Boolean,
  eventOverlap: identity2,
  eventConstraint: identity2,
  eventAllow: identity2,
  eventColor: String,
  eventContrastColor: String,
  eventDidMount: identity2,
  eventWillUnmount: identity2,
  eventContent: identity2,
  eventClass: refineClassNameGenerator,
  eventInnerClass: refineClassNameGenerator,
  eventTimeClass: refineClassNameGenerator,
  eventTitleClass: refineClassNameGenerator,
  eventBeforeClass: refineClassNameGenerator,
  eventAfterClass: refineClassNameGenerator,
  //
  listItemEventClass: refineClassNameGenerator,
  listItemEventInnerClass: refineClassNameGenerator,
  listItemEventTimeClass: refineClassNameGenerator,
  listItemEventTitleClass: refineClassNameGenerator,
  listItemEventBeforeClass: refineClassNameGenerator,
  listItemEventAfterClass: refineClassNameGenerator,
  //
  blockEventClass: refineClassNameGenerator,
  blockEventInnerClass: refineClassNameGenerator,
  blockEventTimeClass: refineClassNameGenerator,
  blockEventTitleClass: refineClassNameGenerator,
  blockEventBeforeClass: refineClassNameGenerator,
  blockEventAfterClass: refineClassNameGenerator,
  //
  rowEventClass: refineClassNameGenerator,
  rowEventInnerClass: refineClassNameGenerator,
  rowEventTimeClass: refineClassNameGenerator,
  rowEventTitleClass: refineClassNameGenerator,
  rowEventTitleSticky: Boolean,
  rowEventBeforeClass: refineClassNameGenerator,
  rowEventBeforeContent: identity2,
  rowEventAfterClass: refineClassNameGenerator,
  rowEventAfterContent: identity2,
  //
  columnEventClass: refineClassNameGenerator,
  columnEventInnerClass: refineClassNameGenerator,
  columnEventTimeClass: refineClassNameGenerator,
  columnEventTitleClass: refineClassNameGenerator,
  columnEventTitleSticky: Boolean,
  columnEventBeforeClass: refineClassNameGenerator,
  columnEventAfterClass: refineClassNameGenerator,
  //
  backgroundEventClass: refineClassNameGenerator,
  backgroundEventDidMount: identity2,
  backgroundEventWillUnmount: identity2,
  backgroundEventContent: identity2,
  backgroundEventInnerClass: refineClassNameGenerator,
  backgroundEventTitleClass: refineClassNameGenerator,
  backgroundEventColor: String,
  selectConstraint: identity2,
  selectOverlap: identity2,
  selectAllow: identity2,
  droppable: Boolean,
  unselectCancel: String,
  slotHeaderFormat: identity2,
  slotLaneClass: refineClassNameGenerator,
  slotLaneDidMount: identity2,
  slotLaneWillUnmount: identity2,
  slotHeaderClass: refineClassNameGenerator,
  slotHeaderInnerClass: refineClassNameGenerator,
  slotHeaderContent: identity2,
  slotHeaderDidMount: identity2,
  slotHeaderWillUnmount: identity2,
  slotHeaderAlign: identity2,
  slotHeaderSticky: identity2,
  slotHeaderRowClass: refineClassName,
  slotHeaderDividerClass: refineClassNameGenerator,
  dayMaxEvents: identity2,
  dayMaxEventRows: identity2,
  dayMinWidth: Number,
  slotHeaderInterval: createDuration,
  // in core because more-popover needs it
  dayHeaderClass: refineClassNameGenerator,
  dayHeaderInnerClass: refineClassNameGenerator,
  dayHeaderContent: identity2,
  dayHeaderDidMount: identity2,
  dayHeaderWillUnmount: identity2,
  dayHeaderAlign: identity2,
  // stickiness for cell-inner-contents laterally. experimental settings
  _dayHeaderSticky: identity2,
  dayHeaderRowClass: refineClassName,
  dayHeaderDividerClass: refineClassNameGenerator,
  dayRowClass: refineClassName,
  dayCellDidMount: identity2,
  dayCellWillUnmount: identity2,
  dayCellClass: refineClassNameGenerator,
  dayCellInnerClass: refineClassNameGenerator,
  dayCellTopContent: identity2,
  dayCellTopClass: refineClassNameGenerator,
  dayCellTopInnerClass: refineClassNameGenerator,
  dayCellBottomClass: refineClassNameGenerator,
  allDaySlot: Boolean,
  allDayText: String,
  allDayHeaderClass: refineClassNameGenerator,
  allDayHeaderInnerClass: refineClassNameGenerator,
  allDayHeaderContent: identity2,
  allDayHeaderDidMount: identity2,
  allDayHeaderWillUnmount: identity2,
  timedText: String,
  slotMinWidth: Number,
  slotMinHeight: Number,
  navLinks: Boolean,
  eventTimeFormat: createFormatter,
  rerenderDelay: Number,
  // TODO: move to vanilla right? nah keep here
  moreLinkText: identity2,
  // this not enforced :( check others too
  moreLinkHint: identity2,
  selectMinDistance: Number,
  selectable: Boolean,
  selectLongPressDelay: Number,
  eventLongPressDelay: Number,
  selectMirror: Boolean,
  eventMaxStack: Number,
  eventMinHeight: Number,
  eventMinWidth: Number,
  eventShortHeight: Number,
  slotEventOverlap: Boolean,
  firstDay: Number,
  dayCount: Number,
  dateAlignment: String,
  dateIncrement: createDuration,
  hiddenDays: identity2,
  fixedWeekCount: Boolean,
  validRange: identity2,
  // `this` works?
  visibleRange: identity2,
  // `this` works?
  titleFormat: identity2,
  eventInteractive: Boolean,
  // only used by list-view, but languages define the value, so we need it in base options
  noEventsText: String,
  viewHint: identity2,
  viewChangeHint: String,
  // for the tab container
  navLinkHint: identity2,
  closeHint: String,
  eventsHint: String,
  headingLevel: Number,
  moreLinkClick: identity2,
  moreLinkContent: identity2,
  moreLinkDidMount: identity2,
  moreLinkWillUnmount: identity2,
  moreLinkClass: refineClassNameGenerator,
  moreLinkInnerClass: refineClassNameGenerator,
  //
  rowMoreLinkClass: refineClassNameGenerator,
  rowMoreLinkInnerClass: refineClassNameGenerator,
  //
  columnMoreLinkClass: refineClassNameGenerator,
  columnMoreLinkInnerClass: refineClassNameGenerator,
  navLinkClass: refineClassName,
  monthStartFormat: createFormatter,
  dayCellFormat: createFormatter,
  // for connectors
  // (can't be part of plugin system b/c must be provided at runtime)
  handleCustomRendering: identity2,
  customRenderingMetaMap: identity2,
  popoverClass: refineClassName,
  popoverCloseClass: refineClassName,
  popoverCloseContent: identity2,
  dayNarrowWidth: Number,
  borderless: Boolean,
  borderlessX: Boolean,
  borderlessTop: Boolean,
  borderlessBottom: Boolean,
  fillerClass: refineClassNameGenerator,
  headerToolbarClass: refineClassNameGenerator,
  footerToolbarClass: refineClassNameGenerator,
  toolbarClass: refineClassNameGenerator,
  toolbarSectionClass: refineClassNameGenerator,
  toolbarTitleClass: refineClassName,
  tableClass: refineClassNameGenerator,
  tableHeaderClass: refineClassNameGenerator,
  tableBodyClass: refineClassNameGenerator,
  nonBusinessHoursClass: refineClassName,
  highlightClass: refineClassName,
  // daygrid-only
  dayHeaders: Boolean,
  dayHeaderFormat: createFormatter,
  // timegrid-only
  allDayDividerClass: refineClassName,
  // list-only
  listDaysClass: refineClassName,
  // rename this?
  listDayClass: refineClassNameGenerator,
  //
  listDayFormat: createFalsableFormatter,
  // defaults specified in list plugins
  listDayAltFormat: createFalsableFormatter,
  // "
  //
  listDayHeaderDidMount: identity2,
  listDayHeaderWillUnmount: identity2,
  listDayHeaderClass: refineClassNameGenerator,
  listDayHeaderInnerClass: refineClassNameGenerator,
  listDayHeaderContent: identity2,
  //
  listDayBodyClass: refineClassNameGenerator,
  //
  noEventsClass: refineClassNameGenerator,
  noEventsInnerClass: refineClassNameGenerator,
  noEventsContent: identity2,
  noEventsDidMount: identity2,
  noEventsWillUnmount: identity2,
  // noEventsText is defined in base options
  // multimonth-only
  multiMonthMaxColumns: Number,
  //
  singleMonthMinWidth: Number,
  singleMonthTitleFormat: createFormatter,
  singleMonthDidMount: identity2,
  singleMonthWillUnmount: identity2,
  singleMonthClass: refineClassNameGenerator,
  singleMonthHeaderClass: refineClassNameGenerator,
  singleMonthHeaderInnerClass: refineClassNameGenerator
};
var BASE_OPTION_DEFAULTS = {
  buttonDisplay: "auto",
  eventDisplay: "auto",
  defaultTimedEventDuration: "01:00:00",
  defaultAllDayEventDuration: { day: 1 },
  forceEventDuration: false,
  nextDayThreshold: "00:00:00",
  initialView: "",
  aspectRatio: 1.35,
  weekends: true,
  weekNumbers: false,
  weekNumberCalculation: "local",
  editable: false,
  nowIndicator: false,
  scrollTime: "06:00:00",
  scrollTimeReset: true,
  slotMinTime: "00:00:00",
  slotMaxTime: "24:00:00",
  showNonCurrentDates: true,
  lazyFetching: true,
  startParam: "start",
  endParam: "end",
  timeZoneParam: "timeZone",
  timeZone: "local",
  // TODO: throw error if given falsy value?
  locales: [],
  locale: "",
  // blank values means it will compute based off locales[]
  dragRevertDuration: 500,
  dragScroll: true,
  allDayMaintainDuration: false,
  unselectAuto: true,
  dropAccept: "*",
  eventOrder: "start,-duration,allDay,title",
  eventSlicing: true,
  eventPrintLayout: "auto",
  popoverFormat: { month: "long", day: "numeric", year: "numeric" },
  longPressDelay: 1e3,
  eventDragMinDistance: 5,
  // only applies to mouse
  expandRows: false,
  navLinks: false,
  selectable: false,
  eventMinHeight: 15,
  eventMinWidth: 30,
  eventShortHeight: 30,
  monthStartFormat: { month: "long", day: "numeric" },
  dayCellFormat: { day: "numeric", omitTrailing: true },
  headingLevel: 2,
  // like H2
  outerBorder: true,
  dayNarrowWidth: 80,
  eventOverlap: true,
  slotHeaderAlign: "start",
  slotHeaderSticky: true,
  dayHeaderAlign: "start",
  _dayHeaderSticky: true,
  rowEventTitleSticky: true,
  columnEventTitleSticky: true,
  nowIndicatorSnap: "auto",
  // daygrid-only
  dayHeaders: true
};
var CALENDAR_LISTENER_REFINERS = {
  datesSet: identity2,
  eventsSet: identity2,
  eventAdd: identity2,
  eventChange: identity2,
  eventRemove: identity2,
  eventClick: identity2,
  // TODO: resource for scheduler????
  eventMouseEnter: identity2,
  eventMouseLeave: identity2,
  select: identity2,
  // resource for scheduler????
  unselect: identity2,
  loading: identity2,
  // internal
  _unmount: identity2,
  _beforeprint: identity2,
  _afterprint: identity2,
  _noDateSelect: identity2,
  _noEventDrop: identity2,
  _noEventResize: identity2,
  _timeScrollRequest: identity2,
  // interaction-plugin-only
  dateClick: identity2,
  eventDragStart: identity2,
  eventDragStop: identity2,
  eventDrop: identity2,
  eventResizeStart: identity2,
  eventResizeStop: identity2,
  eventResize: identity2,
  drop: identity2,
  eventReceive: identity2,
  eventLeave: identity2
};
var CALENDAR_ONLY_OPTION_REFINERS = {
  class: refineClassNameGenerator,
  className: refineClassNameGenerator,
  viewClass: refineClassNameGenerator,
  viewDidMount: identity2,
  viewWillUnmount: identity2,
  views: identity2,
  plugins: identity2,
  initialEvents: identity2,
  events: identity2,
  eventSources: identity2
};
var VIEW_ONLY_OPTION_REFINERS = {
  type: String,
  component: identity2,
  class: refineClassNameGenerator,
  className: refineClassNameGenerator,
  content: identity2,
  didMount: identity2,
  willUnmount: identity2,
  // internal only
  buttonTextKey: String,
  dateProfileGeneratorClass: identity2,
  usesMinMaxTime: Boolean,
  disallowAmbigTitle: Boolean
};
var COMPLEX_OPTION_COMPARATORS = {
  // Unfortunately always need 'maybe' to handle undefined inital value, because of CalendarDataManager
  dateIncrement: isMaybePropsEqualShallow,
  headerToolbar: isMaybePropsEqualShallow,
  footerToolbar: isMaybePropsEqualShallow,
  buttons: isMaybePropsEqualDepth1,
  plugins: isMaybeArraysEqual,
  events: isMaybeArraysEqual,
  eventSources: isMaybeArraysEqual,
  ["resources"]: isMaybeArraysEqual
};
function refineProps(input, refiners) {
  let refined = {};
  let extra = {};
  for (let propName in refiners) {
    if (propName in input) {
      refined[propName] = refiners[propName](input[propName], propName);
    }
  }
  for (let propName in input) {
    if (!(propName in refiners)) {
      extra[propName] = input[propName];
    }
  }
  return { refined, extra };
}
function identity2(raw) {
  return raw;
}
function createFalsableFormatter(input) {
  return input === false ? null : createFormatter(input);
}
function buildEventInstanceRange(start, end, instantStartMs, instantEndMs) {
  const range = { start, end };
  if (instantStartMs != null) {
    range.instantStartMs = instantStartMs;
  }
  if (instantEndMs != null) {
    range.instantEndMs = instantEndMs;
  }
  return range;
}
function resolveEdgeInstantMs(marker, instantMs, dateEnv) {
  return instantMs ?? dateEnv.toDate(marker).valueOf();
}
function buildRangeEdgeOutput(marker, instantMs, dateEnv, omitTime) {
  const canonicalMarker = instantMs != null ? dateEnv.timestampToMarker(instantMs) : marker;
  const timeZoneOffset = instantMs != null ? Math.round((canonicalMarker.valueOf() - instantMs) / 6e4) : dateEnv.offsetForMarker(marker);
  if (!omitTime && instantMs != null) {
    return {
      marker: canonicalMarker,
      date: new Date(instantMs),
      dateStr: buildIsoString(canonicalMarker, timeZoneOffset)
    };
  }
  return {
    marker: canonicalMarker,
    date: dateEnv.toDate(marker),
    dateStr: omitTime ? dateEnv.formatIso(marker, { omitTime }) : buildIsoString(marker, timeZoneOffset)
  };
}
function getRangeInstantStartMs(range, dateEnv) {
  return resolveEdgeInstantMs(range.start, range.instantStartMs, dateEnv);
}
function getRangeInstantEndMs(range, dateEnv) {
  return resolveEdgeInstantMs(range.end, range.instantEndMs, dateEnv);
}
function canonicalRangeEndMarker(range, dateEnv) {
  return range.instantEndMs != null ? dateEnv.timestampToMarker(range.instantEndMs) : range.end;
}
function rangeHasInstants(range) {
  return range.instantStartMs != null || range.instantEndMs != null;
}
function instanceRangesIntersect(range0, range1, dateEnv) {
  if (rangeHasInstants(range0) || rangeHasInstants(range1)) {
    return getRangeInstantStartMs(range0, dateEnv) < getRangeInstantEndMs(range1, dateEnv) && getRangeInstantEndMs(range0, dateEnv) > getRangeInstantStartMs(range1, dateEnv);
  }
  return rangesIntersect(range0, range1);
}
function instanceRangeContainsRange(outerRange, innerRange, dateEnv) {
  if (rangeHasInstants(outerRange) || rangeHasInstants(innerRange)) {
    const outerStartMs = outerRange.start != null ? resolveEdgeInstantMs(outerRange.start, outerRange.instantStartMs, dateEnv) : -Infinity;
    const outerEndMs = outerRange.end != null ? resolveEdgeInstantMs(outerRange.end, outerRange.instantEndMs, dateEnv) : Infinity;
    return outerStartMs <= getRangeInstantStartMs(innerRange, dateEnv) && outerEndMs >= getRangeInstantEndMs(innerRange, dateEnv);
  }
  return rangeContainsRange(outerRange, innerRange);
}
function addDurationToEdge(edge, duration, dateEnv) {
  if (edge.instantMs != null && !duration.years && !duration.months && !duration.days) {
    const durMs = asRoughMs(duration);
    const instantMs = edge.instantMs + durMs;
    const marker = dateEnv.timestampToMarker(instantMs);
    return marker > edge.marker ? { marker, instantMs } : { marker: addMs(edge.marker, durMs), instantMs };
  }
  return { marker: dateEnv.add(edge.marker, duration) };
}
function buildValidInstanceRange(start, end, dateEnv) {
  if (start.instantMs == null && end.instantMs == null) {
    return end.marker > start.marker ? buildEventInstanceRange(start.marker, end.marker) : null;
  }
  const startMs = resolveEdgeInstantMs(start.marker, start.instantMs, dateEnv);
  const endMs = resolveEdgeInstantMs(end.marker, end.instantMs, dateEnv);
  if (endMs <= startMs) {
    return null;
  }
  return buildEventInstanceRange(
    start.marker,
    end.marker > start.marker ? end.marker : addMs(start.marker, endMs - startMs),
    // fold-compressed: start's offset reading
    start.instantMs,
    end.instantMs
  );
}
function createEventInstance(defId, range) {
  return {
    instanceId: guid(),
    defId,
    range
  };
}
function computeAlignedDayRange(timedRange) {
  let dayCnt = Math.floor(diffDays4(timedRange.start, timedRange.end)) || 1;
  let start = startOfDay4(timedRange.start);
  let end = addDays3(start, dayCnt);
  return { start, end };
}
function computeVisibleDayRange(timedRange, nextDayThreshold = createDuration(0)) {
  let startDay = null;
  let endDay = null;
  if (timedRange.end) {
    endDay = startOfDay4(timedRange.end);
    let endTimeMS = timedRange.end.valueOf() - endDay.valueOf();
    if (endTimeMS && endTimeMS >= asRoughMs(nextDayThreshold)) {
      endDay = addDays3(endDay, 1);
    }
  }
  if (timedRange.start) {
    startDay = startOfDay4(timedRange.start);
    if (endDay && endDay <= startDay) {
      endDay = addDays3(startDay, 1);
    }
  }
  return { start: startDay, end: endDay };
}
function diffDates2(date0, date1, dateEnv, largeUnit) {
  if (largeUnit === "year") {
    return createDuration(dateEnv.diffWholeYears(date0, date1), "year");
  }
  if (largeUnit === "month") {
    return createDuration(dateEnv.diffWholeMonths(date0, date1), "month");
  }
  return diffDayAndTime(date0, date1);
}
function parseRecurring(refined, defaultAllDay, dateEnv, recurringTypes) {
  for (let i = 0; i < recurringTypes.length; i += 1) {
    let parsed = recurringTypes[i].parse(refined, dateEnv);
    if (parsed) {
      let { allDay } = refined;
      if (allDay == null) {
        allDay = defaultAllDay;
        if (allDay == null) {
          allDay = parsed.allDayGuess;
          if (allDay == null) {
            allDay = false;
          }
        }
      }
      return {
        allDay,
        duration: parsed.duration,
        typeData: parsed.typeData,
        typeId: i
      };
    }
  }
  return null;
}
function expandRecurring(eventStore, framingRange, context) {
  let { dateEnv, pluginHooks, options } = context;
  let { defs, instances } = eventStore;
  instances = filterHash(instances, (instance) => !defs[instance.defId].recurringDef);
  for (let defId in defs) {
    let def = defs[defId];
    if (def.recurringDef) {
      let { duration } = def.recurringDef;
      if (!duration) {
        duration = def.allDay ? options.defaultAllDayEventDuration : options.defaultTimedEventDuration;
      }
      let starts = expandRecurringRanges(def, duration, framingRange, dateEnv, pluginHooks.recurringTypes);
      for (let start of starts) {
        let instance = createEventInstance(defId, {
          start,
          end: dateEnv.add(start, duration)
        });
        instances[instance.instanceId] = instance;
      }
    }
  }
  return { defs, instances };
}
function expandRecurringRanges(eventDef, duration, framingRange, dateEnv, recurringTypes) {
  let typeDef = recurringTypes[eventDef.recurringDef.typeId];
  let markers = typeDef.expand(eventDef.recurringDef.typeData, {
    start: dateEnv.subtract(framingRange.start, duration),
    // for when event starts before framing range and goes into
    end: framingRange.end
  }, dateEnv);
  if (eventDef.allDay) {
    markers = markers.map(startOfDay4);
  }
  return markers;
}
function parseEvents(rawEvents, eventSource, context, allowOpenRange, defIdMap, instanceIdMap) {
  let eventStore = createEmptyEventStore();
  let eventRefiners = buildEventRefiners(context);
  for (let rawEvent of rawEvents) {
    let tuple = parseEvent(rawEvent, eventSource, context, allowOpenRange, eventRefiners, defIdMap, instanceIdMap);
    if (tuple) {
      eventTupleToStore(tuple, eventStore);
    }
  }
  return eventStore;
}
function eventTupleToStore(tuple, eventStore = createEmptyEventStore()) {
  eventStore.defs[tuple.def.defId] = tuple.def;
  if (tuple.instance) {
    eventStore.instances[tuple.instance.instanceId] = tuple.instance;
  }
  return eventStore;
}
function getRelevantEvents(eventStore, instanceId) {
  let instance = eventStore.instances[instanceId];
  if (instance) {
    let def = eventStore.defs[instance.defId];
    let newStore = filterEventStoreDefs(eventStore, (lookDef) => isEventDefsGrouped(def, lookDef));
    newStore.defs[def.defId] = def;
    newStore.instances[instance.instanceId] = instance;
    return newStore;
  }
  return createEmptyEventStore();
}
function isEventDefsGrouped(def0, def1) {
  return Boolean(def0.groupId && def0.groupId === def1.groupId);
}
function createEmptyEventStore() {
  return { defs: {}, instances: {} };
}
function mergeEventStores(store0, store1) {
  return {
    defs: __spreadValues(__spreadValues({}, store0.defs), store1.defs),
    instances: __spreadValues(__spreadValues({}, store0.instances), store1.instances)
  };
}
function filterEventStoreDefs(eventStore, filterFunc) {
  let defs = filterHash(eventStore.defs, filterFunc);
  let instances = filterHash(eventStore.instances, (instance) => defs[instance.defId]);
  return { defs, instances };
}
function excludeSubEventStore(master, sub) {
  let { defs, instances } = master;
  let filteredDefs = {};
  let filteredInstances = {};
  for (let defId in defs) {
    if (!sub.defs[defId]) {
      filteredDefs[defId] = defs[defId];
    }
  }
  for (let instanceId in instances) {
    if (!sub.instances[instanceId] && // not explicitly excluded
    filteredDefs[instances[instanceId].defId]) {
      filteredInstances[instanceId] = instances[instanceId];
    }
  }
  return {
    defs: filteredDefs,
    instances: filteredInstances
  };
}
function normalizeConstraint(input, context) {
  if (Array.isArray(input)) {
    return parseEvents(input, null, context, true);
  }
  if (typeof input === "object" && input) {
    return parseEvents([input], null, context, true);
  }
  if (input != null) {
    return String(input);
  }
  return null;
}
var EVENT_UI_REFINERS = {
  display: String,
  editable: Boolean,
  startEditable: Boolean,
  durationEditable: Boolean,
  constraint: identity2,
  // Identity<ConstraintInput>, // circular reference. ts dies. event->constraint->event
  overlap: identity2,
  allow: identity2,
  class: refineClassName,
  className: refineClassName,
  color: String,
  contrastColor: String
};
var EMPTY_EVENT_UI = {
  display: null,
  startEditable: null,
  durationEditable: null,
  constraints: [],
  overlap: null,
  allows: [],
  color: "",
  contrastColor: "",
  className: ""
};
function createEventUi(refined, context) {
  let constraint = normalizeConstraint(refined.constraint, context);
  return {
    display: refined.display || null,
    startEditable: refined.startEditable != null ? refined.startEditable : refined.editable,
    durationEditable: refined.durationEditable != null ? refined.durationEditable : refined.editable,
    constraints: constraint != null ? [constraint] : [],
    overlap: refined.overlap != null ? refined.overlap : null,
    allows: refined.allow != null ? [refined.allow] : [],
    color: refined.color || "",
    contrastColor: refined.contrastColor || "",
    className: (refined.class ?? refined.className) || ""
  };
}
function combineEventUis(uis) {
  return uis.reduce(combineTwoEventUis, EMPTY_EVENT_UI);
}
function combineTwoEventUis(item0, item1) {
  return {
    display: item1.display != null ? item1.display : item0.display,
    startEditable: item1.startEditable != null ? item1.startEditable : item0.startEditable,
    durationEditable: item1.durationEditable != null ? item1.durationEditable : item0.durationEditable,
    constraints: item0.constraints.concat(item1.constraints),
    overlap: typeof item1.overlap === "boolean" ? item1.overlap : item0.overlap,
    allows: item0.allows.concat(item1.allows),
    color: item1.color || item0.color,
    contrastColor: item1.contrastColor || item0.contrastColor,
    className: joinClassNames(item0.className, item1.className)
  };
}
var EVENT_NON_DATE_REFINERS = {
  id: String,
  groupId: String,
  title: String,
  url: String,
  interactive: Boolean
};
var EVENT_DATE_REFINERS = {
  start: identity2,
  end: identity2,
  date: identity2,
  allDay: Boolean
};
var EVENT_REFINERS = __spreadProps(__spreadValues(__spreadValues({}, EVENT_NON_DATE_REFINERS), EVENT_DATE_REFINERS), {
  extendedProps: identity2
});
function parseEvent(raw, eventSource, context, allowOpenRange, refiners = buildEventRefiners(context), defIdMap, instanceIdMap) {
  let { refined, extra } = refineEventDef(raw, context, refiners);
  let defaultAllDay = computeIsDefaultAllDay(eventSource, context);
  let recurringRes = parseRecurring(refined, defaultAllDay, context.dateEnv, context.pluginHooks.recurringTypes);
  if (recurringRes) {
    let def = parseEventDef(refined, extra, eventSource ? eventSource.sourceId : "", recurringRes.allDay, Boolean(recurringRes.duration), context, defIdMap);
    def.recurringDef = {
      typeId: recurringRes.typeId,
      typeData: recurringRes.typeData,
      duration: recurringRes.duration
    };
    return { def, instance: null };
  }
  let singleRes = parseSingle(refined, defaultAllDay, context, allowOpenRange);
  if (singleRes) {
    let def = parseEventDef(refined, extra, eventSource ? eventSource.sourceId : "", singleRes.allDay, singleRes.hasEnd, context, defIdMap);
    let instance = createEventInstance(def.defId, singleRes.range);
    if (instanceIdMap && def.publicId && instanceIdMap[def.publicId]) {
      instance.instanceId = instanceIdMap[def.publicId];
    }
    return { def, instance };
  }
  return null;
}
function refineEventDef(raw, context, refiners = buildEventRefiners(context)) {
  return refineProps(raw, refiners);
}
function buildEventRefiners(context) {
  return __spreadValues(__spreadValues(__spreadValues({}, EVENT_UI_REFINERS), EVENT_REFINERS), context.pluginHooks.eventRefiners);
}
function parseEventDef(refined, extra, sourceId, allDay, hasEnd, context, defIdMap) {
  let def = {
    title: refined.title || "",
    groupId: refined.groupId || "",
    publicId: refined.id || "",
    url: refined.url || "",
    recurringDef: null,
    defId: (defIdMap && refined.id ? defIdMap[refined.id] : "") || guid(),
    sourceId,
    allDay,
    hasEnd,
    interactive: refined.interactive,
    ui: createEventUi(refined, context),
    extendedProps: __spreadValues(__spreadValues({}, refined.extendedProps || {}), extra)
  };
  for (let memberAdder of context.pluginHooks.eventDefMemberAdders) {
    Object.assign(def, memberAdder(refined));
  }
  Object.freeze(def.ui.className);
  Object.freeze(def.extendedProps);
  return def;
}
function parseSingle(refined, defaultAllDay, context, allowOpenRange) {
  let { allDay } = refined;
  let startMeta;
  let startMarker = null;
  let hasEnd = false;
  let endMeta;
  let endMarker = null;
  let startInput = refined.start != null ? refined.start : refined.date;
  startMeta = context.dateEnv.createMarkerMeta(startInput);
  if (startMeta) {
    startMarker = startMeta.marker;
  } else if (!allowOpenRange) {
    return null;
  }
  if (refined.end != null) {
    endMeta = context.dateEnv.createMarkerMeta(refined.end);
  }
  if (allDay == null) {
    if (defaultAllDay != null) {
      allDay = defaultAllDay;
    } else {
      allDay = (!startMeta || startMeta.isTimeUnspecified) && (!endMeta || endMeta.isTimeUnspecified);
    }
  }
  if (allDay && startMarker) {
    startMarker = startOfDay4(startMarker);
  }
  let startInstantMs = !allDay && startMeta ? startMeta.instantMs : void 0;
  let range = null;
  if (endMeta) {
    endMarker = allDay ? startOfDay4(endMeta.marker) : endMeta.marker;
    if (!startMarker) {
      range = buildEventInstanceRange(startMarker, endMarker, void 0, allDay ? void 0 : endMeta.instantMs);
    } else if (allDay) {
      if (endMarker > startMarker) {
        range = buildEventInstanceRange(startMarker, endMarker);
      }
    } else {
      range = buildValidInstanceRange({ marker: startMarker, instantMs: startInstantMs }, { marker: endMarker, instantMs: endMeta.instantMs }, context.dateEnv);
    }
  }
  if (range) {
    hasEnd = true;
  } else if (allowOpenRange) {
    range = buildEventInstanceRange(startMarker, null, startInstantMs);
  } else {
    hasEnd = context.options.forceEventDuration || false;
    let endEdge = addDurationToEdge({ marker: startMarker, instantMs: startInstantMs }, allDay ? context.options.defaultAllDayEventDuration : context.options.defaultTimedEventDuration, context.dateEnv);
    range = buildEventInstanceRange(startMarker, endEdge.marker, startInstantMs, endEdge.instantMs);
  }
  return { allDay, hasEnd, range };
}
function computeIsDefaultAllDay(eventSource, context) {
  let res = null;
  if (eventSource) {
    res = eventSource.defaultAllDay;
  }
  if (res == null) {
    res = context.options.defaultAllDay;
  }
  return res;
}
var STANDARD_PROPS = {
  start: identity2,
  end: identity2,
  allDay: Boolean
};
function parseDateSpan(raw, dateEnv, defaultDuration) {
  let span = parseOpenDateSpan(raw, dateEnv);
  if (!span) {
    return null;
  }
  let { range } = span;
  if (!range.start) {
    return null;
  }
  if (!range.end) {
    if (defaultDuration == null) {
      return null;
    }
    const endEdge = addDurationToEdge({ marker: range.start, instantMs: span.instantStartMs }, defaultDuration, dateEnv);
    range.end = endEdge.marker;
    if (endEdge.instantMs != null) {
      span.instantEndMs = endEdge.instantMs;
    }
  }
  return span;
}
function parseOpenDateSpan(raw, dateEnv) {
  let { refined: standardProps, extra } = refineProps(raw, STANDARD_PROPS);
  let startMeta = standardProps.start ? dateEnv.createMarkerMeta(standardProps.start) : null;
  let endMeta = standardProps.end ? dateEnv.createMarkerMeta(standardProps.end) : null;
  let { allDay } = standardProps;
  if (allDay == null) {
    allDay = startMeta && startMeta.isTimeUnspecified && (!endMeta || endMeta.isTimeUnspecified);
  }
  let range = {
    start: startMeta ? startMeta.marker : null,
    end: endMeta ? endMeta.marker : null
  };
  if (!allDay && startMeta && endMeta && (startMeta.instantMs != null || endMeta.instantMs != null)) {
    const validRange = buildValidInstanceRange({ marker: startMeta.marker, instantMs: startMeta.instantMs }, { marker: endMeta.marker, instantMs: endMeta.instantMs }, dateEnv);
    if (!validRange && startMeta.instantMs != null && endMeta.instantMs != null) {
      return null;
    }
    if (validRange) {
      range = { start: validRange.start, end: validRange.end };
    }
  }
  const span = __spreadValues({
    range,
    allDay
  }, extra);
  if (allDay) {
    delete span.instantStartMs;
    delete span.instantEndMs;
  } else {
    if (startMeta?.instantMs != null) {
      span.instantStartMs = startMeta.instantMs;
    }
    if (endMeta?.instantMs != null) {
      span.instantEndMs = endMeta.instantMs;
    }
  }
  return span;
}
function isDateSpansEqual(span0, span1) {
  return rangesEqual(span0.range, span1.range) && span0.allDay === span1.allDay && isSpanPropsEqual(span0, span1);
}
function isSpanPropsEqual(span0, span1) {
  for (let propName in span1) {
    if (propName !== "range" && propName !== "allDay") {
      if (span0[propName] !== span1[propName]) {
        return false;
      }
    }
  }
  for (let propName in span0) {
    if (!(propName in span1)) {
      return false;
    }
  }
  return true;
}
function buildDateSpanApi(span, dateEnv) {
  return __spreadProps(__spreadValues({}, buildRangeApi(span.range, dateEnv, span.allDay, span)), {
    allDay: span.allDay
  });
}
function buildRangeApiWithTimeZone(range, dateEnv, omitTime) {
  return __spreadProps(__spreadValues({}, buildRangeApi(range, dateEnv, omitTime)), {
    timeZone: dateEnv.timeZone
  });
}
function buildRangeApi(range, dateEnv, omitTime, rangeMeta) {
  const instantStartMs = rangeMeta?.instantStartMs ?? range.instantStartMs;
  const instantEndMs = rangeMeta?.instantEndMs ?? range.instantEndMs;
  const start = buildRangeEdgeOutput(range.start, instantStartMs, dateEnv, omitTime);
  const end = buildRangeEdgeOutput(range.end, instantEndMs, dateEnv, omitTime);
  return {
    start: start.date,
    end: end.date,
    startStr: start.dateStr,
    endStr: end.dateStr
  };
}
function getDateSpanInstantStartMs(dateSpan, dateEnv) {
  return resolveEdgeInstantMs(dateSpan.range.start, dateSpan.instantStartMs, dateEnv);
}
function getDateSpanInstantEndMs(dateSpan, dateEnv) {
  return resolveEdgeInstantMs(dateSpan.range.end, dateSpan.instantEndMs, dateEnv);
}
function fabricateEventRange(dateSpan, eventUiBases, context) {
  let res = refineEventDef({ editable: false }, context);
  let def = parseEventDef(
    res.refined,
    res.extra,
    "",
    // sourceId
    dateSpan.allDay,
    true,
    // hasEnd
    context
  );
  return {
    def,
    ui: compileEventUi(def, eventUiBases),
    instance: createEventInstance(def.defId, dateSpan.range),
    range: dateSpan.range,
    isStart: true,
    isEnd: true
  };
}
function triggerDateSelect(selection, pev, context) {
  context.emitter.trigger("select", __spreadProps(__spreadValues({}, buildDateSpanApiWithContext(selection, context)), {
    jsEvent: pev ? pev.origEvent : null,
    // Is this always a mouse event? See #4655
    view: context.viewApi || context.calendarApi.view
  }));
}
function triggerDateUnselect(pev, context) {
  context.emitter.trigger("unselect", {
    jsEvent: pev ? pev.origEvent : null,
    // Is this always a mouse event? See #4655
    view: context.viewApi || context.calendarApi.view
  });
}
function buildDateSpanApiWithContext(dateSpan, context) {
  let props = {};
  for (let transform of context.pluginHooks.dateSpanTransforms) {
    Object.assign(props, transform(dateSpan, context));
  }
  Object.assign(props, buildDateSpanApi(dateSpan, context.dateEnv));
  return props;
}
function getDefaultEventEnd(allDay, marker, context) {
  let { dateEnv, options } = context;
  let end = marker;
  if (allDay) {
    end = startOfDay4(end);
    end = dateEnv.add(end, options.defaultAllDayEventDuration);
  } else {
    end = dateEnv.add(end, options.defaultTimedEventDuration);
  }
  return end;
}
function getDefaultEventEndEdge(allDay, start, context) {
  if (allDay) {
    return { marker: getDefaultEventEnd(true, start.marker, context) };
  }
  return addDurationToEdge(start, context.options.defaultTimedEventDuration, context.dateEnv);
}
function applyMutationToEventStore(eventStore, eventConfigBase, mutation, context) {
  let eventConfigs = compileEventUis(eventStore.defs, eventConfigBase);
  let dest = createEmptyEventStore();
  for (let defId in eventStore.defs) {
    let def = eventStore.defs[defId];
    dest.defs[defId] = applyMutationToEventDef(def, eventConfigs[defId], mutation, context);
  }
  for (let instanceId in eventStore.instances) {
    let instance = eventStore.instances[instanceId];
    let def = dest.defs[instance.defId];
    dest.instances[instanceId] = applyMutationToEventInstance(instance, def, eventConfigs[instance.defId], mutation, context);
  }
  return dest;
}
function applyMutationToEventDef(eventDef, eventConfig, mutation, context) {
  let standardProps = mutation.standardProps || {};
  if (standardProps.hasEnd == null && eventConfig.durationEditable && (mutation.startDelta || mutation.endDelta)) {
    standardProps.hasEnd = true;
  }
  let copy = __spreadProps(__spreadValues(__spreadValues({}, eventDef), standardProps), {
    ui: __spreadValues(__spreadValues({}, eventDef.ui), standardProps.ui)
    // the only prop we want to recursively overlay
  });
  if (mutation.extendedProps) {
    copy.extendedProps = __spreadValues(__spreadValues({}, copy.extendedProps), mutation.extendedProps);
  }
  for (let applier of context.pluginHooks.eventDefMutationAppliers) {
    applier(copy, mutation, context);
  }
  if (!copy.hasEnd && context.options.forceEventDuration) {
    copy.hasEnd = true;
  }
  return copy;
}
function applyMutationToEventInstance(eventInstance, eventDef, eventConfig, mutation, context) {
  let forceAllDay = mutation.standardProps && mutation.standardProps.allDay === true;
  let clearEnd = mutation.standardProps && mutation.standardProps.hasEnd === false;
  let copy = __spreadValues({}, eventInstance);
  if (forceAllDay) {
    copy.range = computeAlignedDayRange(copy.range);
  }
  if (mutation.datesDelta && eventConfig.startEditable) {
    copy.range = buildInstanceRange(addDeltaToRangeEdge(copy.range.start, copy.range.instantStartMs, mutation.datesDelta, mutation.instantDatesDeltaMs, context), addDeltaToRangeEdge(copy.range.end, copy.range.instantEndMs, mutation.datesDelta, mutation.instantDatesDeltaMs, context));
  }
  if (mutation.startDelta && eventConfig.durationEditable) {
    copy.range = buildInstanceRange(addDeltaToRangeEdge(copy.range.start, copy.range.instantStartMs, mutation.startDelta, mutation.instantStartDeltaMs, context), { marker: copy.range.end, instantMs: copy.range.instantEndMs });
  }
  if (mutation.endDelta && eventConfig.durationEditable) {
    copy.range = buildInstanceRange({ marker: copy.range.start, instantMs: copy.range.instantStartMs }, addDeltaToRangeEdge(copy.range.end, copy.range.instantEndMs, mutation.endDelta, mutation.instantEndDeltaMs, context));
  }
  if (clearEnd) {
    const startEdge = { marker: copy.range.start, instantMs: copy.range.instantStartMs };
    copy.range = buildInstanceRange(startEdge, getDefaultEventEndEdge(eventDef.allDay, startEdge, context));
  }
  if (eventDef.allDay) {
    copy.range = {
      start: startOfDay4(copy.range.start),
      end: startOfDay4(copy.range.end)
    };
  }
  if (eventDef.allDay) {
    if (copy.range.end <= copy.range.start) {
      const startEdge = { marker: copy.range.start };
      copy.range = buildInstanceRange(startEdge, getDefaultEventEndEdge(true, startEdge, context));
    }
  } else {
    const startEdge = { marker: copy.range.start, instantMs: copy.range.instantStartMs };
    copy.range = buildValidInstanceRange(startEdge, { marker: copy.range.end, instantMs: copy.range.instantEndMs }, context.dateEnv) ?? buildInstanceRange(startEdge, getDefaultEventEndEdge(false, startEdge, context));
  }
  return copy;
}
function addDeltaToRangeEdge(marker, instantMs, delta, instantDeltaMs, context) {
  if (instantDeltaMs != null) {
    const newInstantMs = resolveEdgeInstantMs(marker, instantMs, context.dateEnv) + instantDeltaMs;
    return {
      marker: context.dateEnv.timestampToMarker(newInstantMs),
      instantMs: newInstantMs
    };
  }
  return {
    marker: context.dateEnv.add(instantMs != null ? context.dateEnv.timestampToMarker(instantMs) : marker, delta)
  };
}
function buildInstanceRange(start, end) {
  return buildEventInstanceRange(start.marker, end.marker, start.instantMs, end.instantMs);
}
var EventSourceImpl = class {
  constructor(context, internalEventSource) {
    this.context = context;
    this.internalEventSource = internalEventSource;
  }
  remove() {
    this.context.dispatch({
      type: "REMOVE_EVENT_SOURCE",
      sourceId: this.internalEventSource.sourceId
    });
  }
  refetch() {
    this.context.dispatch({
      type: "FETCH_EVENT_SOURCES",
      sourceIds: [this.internalEventSource.sourceId],
      isRefetch: true
    });
  }
  get id() {
    return this.internalEventSource.publicId;
  }
  get url() {
    return this.internalEventSource.meta.url;
  }
  get format() {
    return this.internalEventSource.meta.format;
  }
};
var EventImpl = class _EventImpl {
  // instance will be null if expressing a recurring event that has no current instances,
  // OR if trying to validate an incoming external event that has no dates assigned
  constructor(context, def, instance) {
    this._context = context;
    this._def = def;
    this._instance = instance || null;
  }
  /*
  TODO: make event struct more responsible for this
  */
  setProp(name, val) {
    if (name in EVENT_DATE_REFINERS) {
      warn(`Cannot set date-related event property \`${name}\`. Use a method instead.`);
    } else if (name === "id") {
      val = EVENT_NON_DATE_REFINERS[name](val);
      this.mutate({
        standardProps: { publicId: val }
        // hardcoded internal name
      });
    } else if (name in EVENT_NON_DATE_REFINERS) {
      val = EVENT_NON_DATE_REFINERS[name](val);
      this.mutate({
        standardProps: { [name]: val }
      });
    } else if (name in EVENT_UI_REFINERS) {
      let ui = EVENT_UI_REFINERS[name](val);
      if (name === "editable") {
        ui = { startEditable: val, durationEditable: val };
      } else {
        ui = { [name]: val };
      }
      this.mutate({
        standardProps: { ui }
      });
    } else {
      warn(`Cannot set event property \`${name}\`. Use setExtendedProp instead.`);
    }
  }
  setExtendedProp(name, val) {
    this.mutate({
      extendedProps: { [name]: val }
    });
  }
  setStart(startInput, options = {}) {
    let { dateEnv } = this._context;
    let startMeta = dateEnv.createMarkerMeta(startInput);
    if (startMeta && this._instance) {
      let instanceRange = this._instance.range;
      let startDelta = diffDates2(instanceRange.start, startMeta.marker, dateEnv, options.granularity);
      let instantDeltaMs = computeInstantDeltaMs(startMeta, getRangeInstantStartMs(instanceRange, dateEnv), options.granularity);
      if (options.maintainDuration) {
        this.mutate({ datesDelta: startDelta, instantDatesDeltaMs: instantDeltaMs });
      } else {
        this.mutate({ startDelta, instantStartDeltaMs: instantDeltaMs });
      }
    }
  }
  setEnd(endInput, options = {}) {
    let { dateEnv } = this._context;
    let endMeta = null;
    if (endInput != null) {
      endMeta = dateEnv.createMarkerMeta(endInput);
      if (!endMeta) {
        return;
      }
    }
    if (this._instance) {
      if (endMeta) {
        let instanceRange = this._instance.range;
        let endDelta = diffDates2(canonicalRangeEndMarker(instanceRange, dateEnv), endMeta.marker, dateEnv, options.granularity);
        let instantDeltaMs = computeInstantDeltaMs(endMeta, getRangeInstantEndMs(instanceRange, dateEnv), options.granularity);
        this.mutate({ endDelta, instantEndDeltaMs: instantDeltaMs });
      } else {
        this.mutate({ standardProps: { hasEnd: false } });
      }
    }
  }
  setDates(startInput, endInput, options = {}) {
    let { dateEnv } = this._context;
    let standardProps = { allDay: options.allDay };
    let startMeta = dateEnv.createMarkerMeta(startInput);
    let endMeta = null;
    if (!startMeta) {
      return;
    }
    if (endInput != null) {
      endMeta = dateEnv.createMarkerMeta(endInput);
      if (!endMeta) {
        return;
      }
    }
    if (this._instance) {
      let instanceRange = this._instance.range;
      let skipInstants = options.allDay === true;
      let instantStartDeltaMs = skipInstants ? void 0 : computeInstantDeltaMs(startMeta, getRangeInstantStartMs(instanceRange, dateEnv), options.granularity);
      let instantEndDeltaMs = skipInstants || !endMeta ? void 0 : computeInstantDeltaMs(endMeta, getRangeInstantEndMs(instanceRange, dateEnv), options.granularity);
      if (options.allDay === true) {
        instanceRange = computeAlignedDayRange(instanceRange);
      }
      let startDelta = diffDates2(instanceRange.start, startMeta.marker, dateEnv, options.granularity);
      if (endMeta) {
        let endDelta = diffDates2(canonicalRangeEndMarker(instanceRange, dateEnv), endMeta.marker, dateEnv, options.granularity);
        if (durationsEqual(startDelta, endDelta) && instantStartDeltaMs === instantEndDeltaMs) {
          this.mutate({ datesDelta: startDelta, instantDatesDeltaMs: instantStartDeltaMs, standardProps });
        } else {
          this.mutate({ startDelta, endDelta, instantStartDeltaMs, instantEndDeltaMs, standardProps });
        }
      } else {
        standardProps.hasEnd = false;
        this.mutate({ datesDelta: startDelta, instantDatesDeltaMs: instantStartDeltaMs, standardProps });
      }
    }
  }
  moveStart(deltaInput) {
    let delta = createDuration(deltaInput);
    if (delta) {
      this.mutate({ startDelta: delta });
    }
  }
  moveEnd(deltaInput) {
    let delta = createDuration(deltaInput);
    if (delta) {
      this.mutate({ endDelta: delta });
    }
  }
  moveDates(deltaInput) {
    let delta = createDuration(deltaInput);
    if (delta) {
      this.mutate({ datesDelta: delta });
    }
  }
  setAllDay(allDay, options = {}) {
    let standardProps = { allDay };
    let { maintainDuration } = options;
    if (maintainDuration == null) {
      maintainDuration = this._context.options.allDayMaintainDuration;
    }
    if (this._def.allDay !== allDay) {
      standardProps.hasEnd = maintainDuration;
    }
    this.mutate({ standardProps });
  }
  formatRange(formatInput) {
    let { dateEnv } = this._context;
    let instance = this._instance;
    let formatter = createFormatter(formatInput);
    let start = buildRangeEdgeOutput(instance.range.start, instance.range.instantStartMs, dateEnv);
    if (this._def.hasEnd) {
      let end = buildRangeEdgeOutput(instance.range.end, instance.range.instantEndMs, dateEnv);
      return joinDateTimeFormatParts(dateEnv.formatRangeToParts(start.marker, end.marker, formatter, {
        startInstantMs: start.date.valueOf(),
        endInstantMs: end.date.valueOf()
      }));
    }
    return joinDateTimeFormatParts(dateEnv.formatToParts(start.marker, formatter, {
      instantMs: start.date.valueOf()
    }));
  }
  mutate(mutation) {
    let instance = this._instance;
    if (instance) {
      let def = this._def;
      let context = this._context;
      let { eventStore } = context.getCurrentData();
      let relevantEvents = getRelevantEvents(eventStore, instance.instanceId);
      let eventConfigBase = {
        "": {
          display: "",
          startEditable: true,
          durationEditable: true,
          constraints: [],
          overlap: null,
          allows: [],
          color: "",
          contrastColor: "",
          className: ""
        }
      };
      relevantEvents = applyMutationToEventStore(relevantEvents, eventConfigBase, mutation, context);
      let oldEvent = new _EventImpl(context, def, instance);
      this._def = relevantEvents.defs[def.defId];
      this._instance = relevantEvents.instances[instance.instanceId];
      context.dispatch({
        type: "MERGE_EVENTS",
        eventStore: relevantEvents
      });
      context.emitter.trigger("eventChange", {
        oldEvent,
        event: this,
        relatedEvents: buildEventApis(relevantEvents, context, instance),
        revert() {
          context.dispatch({
            type: "RESET_EVENTS",
            eventStore
            // the ORIGINAL store
          });
        }
      });
    }
  }
  remove() {
    let context = this._context;
    let asStore = eventApiToStore(this);
    context.dispatch({
      type: "REMOVE_EVENTS",
      eventStore: asStore
    });
    context.emitter.trigger("eventRemove", {
      event: this,
      relatedEvents: [],
      revert() {
        context.dispatch({
          type: "MERGE_EVENTS",
          eventStore: asStore
        });
      }
    });
  }
  get source() {
    let { sourceId } = this._def;
    if (sourceId) {
      return new EventSourceImpl(this._context, this._context.getCurrentData().eventSources[sourceId]);
    }
    return null;
  }
  get start() {
    let instance = this._instance;
    if (instance) {
      return buildRangeEdgeOutput(instance.range.start, instance.range.instantStartMs, this._context.dateEnv, this._def.allDay).date;
    }
    return null;
  }
  get end() {
    let instance = this._instance;
    if (instance && this._def.hasEnd) {
      return buildRangeEdgeOutput(instance.range.end, instance.range.instantEndMs, this._context.dateEnv, this._def.allDay).date;
    }
    return null;
  }
  get startStr() {
    let instance = this._instance;
    if (instance) {
      return buildRangeEdgeOutput(instance.range.start, instance.range.instantStartMs, this._context.dateEnv, this._def.allDay).dateStr;
    }
    return "";
  }
  get endStr() {
    let instance = this._instance;
    if (instance && this._def.hasEnd) {
      return buildRangeEdgeOutput(instance.range.end, instance.range.instantEndMs, this._context.dateEnv, this._def.allDay).dateStr;
    }
    return "";
  }
  // computable props that all access the def
  // TODO: find a TypeScript-compatible way to do this at scale
  get id() {
    return this._def.publicId;
  }
  get groupId() {
    return this._def.groupId;
  }
  get allDay() {
    return this._def.allDay;
  }
  get title() {
    return this._def.title;
  }
  get url() {
    return this._def.url;
  }
  get display() {
    return this._def.ui.display || "auto";
  }
  // bad. just normalize the type earlier
  get startEditable() {
    return this._def.ui.startEditable;
  }
  get durationEditable() {
    return this._def.ui.durationEditable;
  }
  get constraint() {
    return this._def.ui.constraints[0] || null;
  }
  get overlap() {
    return this._def.ui.overlap;
  }
  get allow() {
    return this._def.ui.allows[0] || null;
  }
  get color() {
    return this._def.ui.color;
  }
  get contrastColor() {
    return this._def.ui.contrastColor;
  }
  // NOTE: user can't modify these because Object.freeze was called in event-def parsing
  get className() {
    return this._def.ui.className;
  }
  get extendedProps() {
    return this._def.extendedProps;
  }
  toPlainObject(settings = {}) {
    let def = this._def;
    let { ui } = def;
    let { startStr, endStr } = this;
    let res = {
      allDay: def.allDay
    };
    if (def.title) {
      res.title = def.title;
    }
    if (startStr) {
      res.start = startStr;
    }
    if (endStr) {
      res.end = endStr;
    }
    if (def.publicId) {
      res.id = def.publicId;
    }
    if (def.groupId) {
      res.groupId = def.groupId;
    }
    if (def.url) {
      res.url = def.url;
    }
    if (ui.display && ui.display !== "auto") {
      res.display = ui.display;
    }
    if (ui.color) {
      res.color = ui.color;
    }
    if (ui.contrastColor) {
      res.contrastColor = ui.contrastColor;
    }
    if (ui.className) {
      res.className = ui.className;
    }
    if (Object.keys(def.extendedProps).length) {
      if (settings.collapseExtendedProps) {
        Object.assign(res, def.extendedProps);
      } else {
        res.extendedProps = def.extendedProps;
      }
    }
    return res;
  }
  toJSON() {
    return this.toPlainObject();
  }
};
function computeInstantDeltaMs(meta, fromInstantMs, granularity) {
  return meta.instantMs != null && !granularity ? meta.instantMs - fromInstantMs : void 0;
}
function eventApiToStore(eventApi) {
  let def = eventApi._def;
  let instance = eventApi._instance;
  return {
    defs: { [def.defId]: def },
    instances: instance ? { [instance.instanceId]: instance } : {}
  };
}
function buildEventApis(eventStore, context, excludeInstance) {
  let { defs, instances } = eventStore;
  let eventApis = [];
  let excludeInstanceId = excludeInstance ? excludeInstance.instanceId : "";
  for (let id in instances) {
    let instance = instances[id];
    let def = defs[instance.defId];
    if (instance.instanceId !== excludeInstanceId) {
      eventApis.push(new EventImpl(context, def, instance));
    }
  }
  return eventApis;
}
function sliceEventStore(eventStore, eventUiBases, framingRange, nextDayThreshold) {
  let inverseBgByGroupId = {};
  let inverseBgByDefId = {};
  let defByGroupId = {};
  let bgRanges = [];
  let fgRanges = [];
  let eventUis = compileEventUis(eventStore.defs, eventUiBases);
  for (let defId in eventStore.defs) {
    let def = eventStore.defs[defId];
    let ui = eventUis[def.defId];
    if (ui.display === "inverse-background") {
      if (def.groupId) {
        inverseBgByGroupId[def.groupId] = [];
        if (!defByGroupId[def.groupId]) {
          defByGroupId[def.groupId] = def;
        }
      } else {
        inverseBgByDefId[defId] = [];
      }
    }
  }
  for (let instanceId in eventStore.instances) {
    let instance = eventStore.instances[instanceId];
    let def = eventStore.defs[instance.defId];
    let ui = eventUis[def.defId];
    let origRange = instance.range;
    let normalRange = !def.allDay && nextDayThreshold ? computeVisibleDayRange(origRange, nextDayThreshold) : origRange;
    let slicedRange = intersectRanges(normalRange, framingRange);
    if (slicedRange) {
      if (ui.display === "inverse-background") {
        if (def.groupId) {
          inverseBgByGroupId[def.groupId].push(slicedRange);
        } else {
          inverseBgByDefId[instance.defId].push(slicedRange);
        }
      } else if (ui.display !== "none") {
        (ui.display === "background" ? bgRanges : fgRanges).push({
          def,
          ui,
          instance,
          range: buildSlicedEventRange(origRange, normalRange, slicedRange),
          isStart: normalRange.start && normalRange.start.valueOf() === slicedRange.start.valueOf(),
          isEnd: normalRange.end && normalRange.end.valueOf() === slicedRange.end.valueOf()
        });
      }
    }
  }
  for (let groupId in inverseBgByGroupId) {
    let ranges = inverseBgByGroupId[groupId];
    let invertedRanges = invertRanges(ranges, framingRange);
    for (let invertedRange of invertedRanges) {
      let def = defByGroupId[groupId];
      let ui = eventUis[def.defId];
      bgRanges.push({
        def,
        ui,
        instance: null,
        range: invertedRange,
        isStart: false,
        isEnd: false
      });
    }
  }
  for (let defId in inverseBgByDefId) {
    let ranges = inverseBgByDefId[defId];
    let invertedRanges = invertRanges(ranges, framingRange);
    for (let invertedRange of invertedRanges) {
      bgRanges.push({
        def: eventStore.defs[defId],
        ui: eventUis[defId],
        instance: null,
        range: invertedRange,
        isStart: false,
        isEnd: false
      });
    }
  }
  return { bg: bgRanges, fg: fgRanges };
}
function buildSlicedEventRange(origRange, normalRange, slicedRange) {
  if (normalRange !== origRange) {
    return slicedRange;
  }
  return buildEventInstanceRange(slicedRange.start, slicedRange.end, slicedRange.start.valueOf() === origRange.start.valueOf() ? origRange.instantStartMs : void 0, slicedRange.end.valueOf() === origRange.end.valueOf() ? origRange.instantEndMs : void 0);
}
function hasBgRendering(def) {
  return def.ui.display === "background" || def.ui.display === "inverse-background";
}
function setElEventRange(el, eventRange) {
  el.fcEventRange = eventRange;
}
function getElEventRange(el) {
  return el.fcEventRange || el.parentNode.fcEventRange || // for the harness
  null;
}
function compileEventUis(eventDefs, eventUiBases) {
  return mapHash(eventDefs, (eventDef) => compileEventUi(eventDef, eventUiBases));
}
function compileEventUi(eventDef, eventUiBases) {
  const uis = [];
  const fallbackBase = eventUiBases[""];
  const defBase = eventUiBases[eventDef.defId];
  if (fallbackBase) {
    uis.push(fallbackBase);
  }
  if (defBase) {
    uis.push(defBase);
  }
  uis.push(eventDef.ui);
  return combineEventUis(uis);
}
function sortEventSegs(segs, eventOrderSpecs) {
  let objs = segs.map(buildSegCompareObj);
  objs.sort((obj0, obj1) => compareByFieldSpecs(obj0, obj1, eventOrderSpecs));
  return objs.map((c) => c._seg);
}
function buildSegCompareObj(seg) {
  let { eventRange } = seg;
  let eventDef = eventRange.def;
  let range = eventRange.instance ? eventRange.instance.range : eventRange.range;
  let start = range.start ? range.start.valueOf() : 0;
  let end = range.end ? range.end.valueOf() : 0;
  return __spreadProps(__spreadValues(__spreadValues({}, eventDef.extendedProps), eventDef), {
    id: eventDef.publicId,
    start,
    end,
    duration: end - start,
    allDay: Number(eventDef.allDay),
    _seg: seg
    // for later retrieval
  });
}
function computeEventRangeDraggable(eventRange, context) {
  let { pluginHooks } = context;
  let transformers = pluginHooks.isDraggableTransformers;
  let { def, ui } = eventRange;
  let val = ui.startEditable;
  for (let transformer of transformers) {
    val = transformer(val, def, ui, context);
  }
  return val;
}
function buildEventRangeTimeText(timeFormat, eventRange, slicedStart, slicedEnd, isStart, isEnd, context, defaultDisplayEventTime = true, defaultDisplayEventEnd = true) {
  const { dateEnv, options } = context;
  const { def } = eventRange;
  const { range } = eventRange.instance;
  const canonicalStart = buildRangeEdgeOutput(range.start, range.instantStartMs, dateEnv);
  const canonicalEnd = buildRangeEdgeOutput(range.end, range.instantEndMs, dateEnv);
  let { displayEventTime, displayEventEnd } = options;
  if (displayEventTime == null) {
    displayEventTime = defaultDisplayEventTime !== false;
  }
  if (displayEventEnd == null) {
    displayEventEnd = defaultDisplayEventEnd !== false;
  }
  const startDate = !isStart && slicedStart && // if seg is the first seg, but start-date cut-off by slotMinTime, (technically isStart=false)
  // we still want to display the original start-time
  startOfDay4(slicedStart).valueOf() !== startOfDay4(canonicalStart.marker).valueOf() ? slicedStart : canonicalStart.marker;
  const endDate = !isEnd && slicedEnd && // See above HACK, but for end-time
  startOfDay4(addMs(slicedEnd, -1)).valueOf() !== startOfDay4(addMs(canonicalEnd.marker, -1)).valueOf() ? slicedEnd : canonicalEnd.marker;
  const startInstantMs = startDate === canonicalStart.marker ? canonicalStart.date.valueOf() : void 0;
  const endInstantMs = endDate === canonicalEnd.marker ? canonicalEnd.date.valueOf() : void 0;
  if (displayEventTime && !def.allDay) {
    if (displayEventEnd && (isStart || isEnd) && def.hasEnd) {
      const rangeParts = dateEnv.formatRangeToParts(startDate, endDate, timeFormat, {
        startInstantMs,
        endInstantMs
      });
      const multiDaySeparator = detectMultiDayTimes(rangeParts);
      if (multiDaySeparator != null) {
        return joinDateTimeFormatParts(dateEnv.formatToParts(startDate, timeFormat, {
          instantMs: startInstantMs
        })) + multiDaySeparator + joinDateTimeFormatParts(dateEnv.formatToParts(endDate, timeFormat, {
          instantMs: endInstantMs
        }));
      }
      return joinDateTimeFormatParts(rangeParts);
    }
    if (isStart) {
      return joinDateTimeFormatParts(dateEnv.formatToParts(startDate, timeFormat, {
        instantMs: startInstantMs
      }));
    }
  }
  return "";
}
var dateUnits = /* @__PURE__ */ new Set(["year", "month", "day"]);
function detectMultiDayTimes(parts) {
  let sharedPart;
  let hasDatePart = false;
  for (const part of parts) {
    if (part.source === "shared") {
      sharedPart = part;
    }
    if (dateUnits.has(part.type)) {
      hasDatePart = true;
    }
  }
  return hasDatePart ? sharedPart.value : void 0;
}
function getEventRangeMeta(eventRange, todayRange, nowDate, nowMs) {
  let segRange = eventRange.range;
  return {
    isPast: segRange.instantEndMs != null && nowMs != null ? segRange.instantEndMs <= nowMs : segRange.end <= (nowDate || todayRange.start),
    isFuture: segRange.instantStartMs != null && nowMs != null ? segRange.instantStartMs >= nowMs : segRange.start >= (nowDate || todayRange.end),
    isToday: todayRange && rangeContainsMarker(todayRange, segRange.start)
  };
}
function buildEventRangeKey(eventRange) {
  return eventRange.instance ? eventRange.instance.instanceId : `${eventRange.def.defId}:${eventRange.range.start.toISOString()}`;
}
function getEventTagAndAttrs(eventRange, context) {
  let { def, instance } = eventRange;
  let { url } = def;
  if (url) {
    return ["a", { href: url }, true];
  }
  let { emitter, options } = context;
  let { eventInteractive } = options;
  if (eventInteractive == null) {
    eventInteractive = def.interactive;
    if (eventInteractive == null) {
      eventInteractive = Boolean(emitter.hasHandlers("eventClick"));
    }
  }
  let attrs;
  if (eventInteractive) {
    attrs = createAriaKeyboardAttrs((ev) => {
      emitter.trigger("eventClick", {
        el: ev.target,
        event: new EventImpl(context, def, instance),
        jsEvent: ev,
        view: context.viewApi
      });
    });
    attrs = __spreadValues({ role: "button" }, attrs);
  }
  return ["div", attrs, eventInteractive];
}

// node_modules/fullcalendar/chunks/9e9ef97a.js
var Emitter = class {
  constructor() {
    this.handlers = {};
    this.thisContext = null;
  }
  setThisContext(thisContext) {
    this.thisContext = thisContext;
  }
  setOptions(options) {
    this.options = options;
  }
  on(type, handler) {
    addToHash(this.handlers, type, handler);
  }
  off(type, handler) {
    removeFromHash(this.handlers, type, handler);
  }
  trigger(type, ...args) {
    let attachedHandlers = this.handlers[type] || [];
    let optionHandler = this.options && this.options[type];
    let handlers = [].concat(optionHandler || [], attachedHandlers);
    for (let handler of handlers) {
      handler.apply(this.thisContext, args);
    }
  }
  hasHandlers(type) {
    return Boolean(this.handlers[type] && this.handlers[type].length || this.options && this.options[type]);
  }
};
function addToHash(hash, type, handler) {
  (hash[type] || (hash[type] = [])).push(handler);
}
function removeFromHash(hash, type, handler) {
  if (handler) {
    if (hash[type]) {
      hash[type] = hash[type].filter((func) => func !== handler);
    }
  } else {
    delete hash[type];
  }
}
function getAppendableRoot(el) {
  const root = el.getRootNode();
  if (root instanceof Document) {
    return root.body || root.documentElement;
  }
  return root;
}
function computeElIsRtl(el) {
  return getComputedStyle(el).direction === "rtl";
}
var PIXEL_PROP_RE = /(top|left|right|bottom|width|height)$/i;
function applyStyle(el, props) {
  for (let propName in props) {
    applyStyleProp(el, propName, props[propName]);
  }
}
function applyStyleProp(el, name, val) {
  if (val == null) {
    el.style[name] = "";
  } else if (typeof val === "number" && PIXEL_PROP_RE.test(name)) {
    el.style[name] = `${val}px`;
  } else {
    el.style[name] = val;
  }
}
function getEventTargetViaRoot(ev) {
  return ev.composedPath?.()[0] ?? ev.target;
}

export {
  addWeeks3 as addWeeks,
  addDays3 as addDays,
  addMs,
  diffWeeks4 as diffWeeks,
  diffDays4 as diffDays,
  diffWholeWeeks,
  diffWholeDays,
  startOfDay4 as startOfDay,
  parseRange,
  intersectRanges,
  rangesIntersect,
  rangeContainsRange,
  rangeContainsMarker,
  constrainMarkerToRange,
  createDuration,
  addDurations,
  subtractDurations,
  multiplyDuration,
  asRoughDays,
  asRoughMs,
  wholeDivideDurations,
  greatestDurationDenominator,
  formatDayString,
  formatIsoTimeString,
  joinDateTimeFormatParts,
  DateEnv,
  classNames,
  createFormatter,
  warn,
  refineClassName,
  listenBySelector,
  listenToHoverBySelector,
  whenTransitionDone,
  createAriaClickAttrs,
  guid,
  disableCursor,
  enableCursor,
  preventSelection,
  allowSelection,
  preventContextMenu,
  allowContextMenu,
  formatWithOrdinals,
  compareNumbers2 as compareNumbers,
  computeViewBorderless,
  filterHash,
  mapHash,
  hashValuesToArray,
  arrayToHash,
  isPropsEqualShallow,
  isPropsEqualWithMap,
  getUnequalProps,
  mergeMaybePropsDepth1,
  flatArray,
  flatMapArray,
  isArraysEqual,
  BASE_OPTION_REFINERS,
  BASE_OPTION_DEFAULTS,
  CALENDAR_LISTENER_REFINERS,
  CALENDAR_ONLY_OPTION_REFINERS,
  VIEW_ONLY_OPTION_REFINERS,
  COMPLEX_OPTION_COMPARATORS,
  refineProps,
  identity2 as identity,
  buildEventInstanceRange,
  buildRangeEdgeOutput,
  getRangeInstantStartMs,
  getRangeInstantEndMs,
  instanceRangesIntersect,
  instanceRangeContainsRange,
  addDurationToEdge,
  buildValidInstanceRange,
  createEventInstance,
  computeVisibleDayRange,
  diffDates2 as diffDates,
  expandRecurring,
  parseEvents,
  eventTupleToStore,
  getRelevantEvents,
  createEmptyEventStore,
  mergeEventStores,
  filterEventStoreDefs,
  excludeSubEventStore,
  EVENT_UI_REFINERS,
  createEventUi,
  combineEventUis,
  parseEvent,
  refineEventDef,
  parseEventDef,
  parseDateSpan,
  isDateSpansEqual,
  buildRangeApiWithTimeZone,
  getDateSpanInstantStartMs,
  getDateSpanInstantEndMs,
  fabricateEventRange,
  triggerDateSelect,
  triggerDateUnselect,
  buildDateSpanApiWithContext,
  getDefaultEventEndEdge,
  applyMutationToEventStore,
  addDeltaToRangeEdge,
  EventSourceImpl,
  EventImpl,
  eventApiToStore,
  buildEventApis,
  sliceEventStore,
  hasBgRendering,
  setElEventRange,
  getElEventRange,
  compileEventUis,
  sortEventSegs,
  computeEventRangeDraggable,
  buildEventRangeTimeText,
  getEventRangeMeta,
  buildEventRangeKey,
  getEventTagAndAttrs,
  Emitter,
  getAppendableRoot,
  computeElIsRtl,
  applyStyle,
  applyStyleProp,
  getEventTargetViaRoot
};
//# sourceMappingURL=chunk-43C3ZVMA.js.map
