import Day from 'dayjs';

import 'dayjs/locale/zh-cn.js';

import DayCustomParseFormatPlugin from 'dayjs/plugin/customParseFormat.js';
import DayRelativeTimePlugin from 'dayjs/plugin/relativeTime.js';
import DayIsBetweenPlugin from 'dayjs/plugin/isBetween.js';
import DayWeekdayPlugin from 'dayjs/plugin/weekday.js';



Day.extend(DayCustomParseFormatPlugin);
Day.extend(DayRelativeTimePlugin);
Day.extend(DayIsBetweenPlugin);
Day.extend(DayWeekdayPlugin);


Day.locale('zh-cn');


Day.prototype.defaultFormat = 'YYYY-MM-DD HH:mm:ss';
Day.prototype.formatRaw = Day.prototype.format;
Day.prototype.format = function(formatStr = this.defaultFormat) { return this.formatRaw(formatStr || this.defaultFormat); };



export default Day;
