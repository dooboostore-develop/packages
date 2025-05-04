export namespace DateUtils {

  export const create = (data: string): Date => new Date(data);

  export const dayZeroTime = (data?: Date | string | number) => {
    const date = data ? new Date(data) : new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }

  export const fullMilliSecond = (): number => new Date().getTime();

  export const fullSecond = (): number => new Date().getTime() / 1000;

  export const milliSecond = (): number => new Date().getMilliseconds();

  export const format = (date: Date, format = 'yyyy-MM-dd HH:mm:ss'): string => {
    const pad = (num) => String(num).padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return format
      .replace('yyyy', String(year))
      .replace('MM', month)
      .replace('dd', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  };

  export const isSameDate = (date1: Date, date2: Date) =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  export const compare = (date1: Date, date2: Date) =>
    date1.getTime() < date2.getTime() ? -1 : date1.getTime() > date2.getTime() ? 1 : 0;

  export const weekCountOfYear = (date: Date) => {
    // Copy date so it's not modified
    const currentDate = new Date(date.getTime());
    // Set to nearest Thursday: current date + 4 - current day number (from 0 to 6)
    // Make Sunday's day number 7
    currentDate.setDate(currentDate.getDate() + 4 - (currentDate.getDay() || 7));
    // January 1st of the year
    const yearStart = new Date(currentDate.getFullYear(), 0, 1);
    // Calculate full weeks to nearest Thursday
    const weekNo = Math.ceil(((currentDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
    return weekNo;
  };
  export const age = (dateOfBirth: Date, until: Date = new Date()) => {
    let age = until.getFullYear() - dateOfBirth.getFullYear();
    const m = until.getMonth() - dateOfBirth.getMonth();

    if (m < 0 || (m === 0 && until.getDate() < dateOfBirth.getDate())) {
      age--;
    }

    return Math.max(age, 0);
  }

  export const countingAge = (dateOfBirth: Date, until: Date = new Date()) => {
    return Math.max(until.getFullYear() - dateOfBirth.getFullYear(), 0) + 1;
  }

  export const add = (date: Date, {years = 0, months = 0, days = 0, minutes = 0, seconds = 0}: { years?: number; months?: number; days?: number; minutes?: number; seconds?: number }): Date => {
    const result = new Date(date);
    if (years) result.setFullYear(result.getFullYear() + years);
    if (months) result.setMonth(result.getMonth() + months);
    if (days) result.setDate(result.getDate() + days);
    if (minutes) result.setMinutes(result.getMinutes() + minutes);
    if (seconds) result.setSeconds(result.getSeconds() + seconds);
    return result;
  };


  export const relativeTime = (date: Date | string | number,
                               config?: {
                                 locales: ConstructorParameters<typeof Intl.RelativeTimeFormat>[0]
                                 options: ConstructorParameters<typeof Intl.RelativeTimeFormat>[1]
                               }) => {

    const rtf = new Intl.RelativeTimeFormat(config?.locales, config?.options);
    let targetDate: Date;
    if (!(date instanceof Date)) {
      targetDate = new Date(date);
    } else {
      targetDate = date;
    }

    const now = new Date();
    const diffMs = targetDate.getTime() - now.getTime(); // 입력된 시간 - 현재 시간

    // 분, 시간, 일 단위로 절대값 차이 계산
    const absDiffMinutes = Math.floor(Math.abs(diffMs) / (1000 * 60));
    const absDiffHours = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60));
    const absDiffDays = Math.floor(Math.abs(diffMs) / (1000 * 60 * 60 * 24));
    if (diffMs === 0) {
      return rtf.format(0, 'seconds'); // "지금" 또는 "0초 후/전" (로케일에 따라 다름)
    }
    if (diffMs < 0) { // 과거 (입력된 시간이 현재보다 이전)
      if (absDiffMinutes < 1) { // 1분 미만 과거
        return rtf.format(-Math.floor(Math.abs(diffMs) / 1000), 'seconds'); // "몇 초 전"
      } else if (absDiffMinutes < 60) { // 60분 미만 과거
        return rtf.format(-absDiffMinutes, 'minutes'); // "몇 분 전"
      } else if (absDiffHours < 24) { // 24시간 미만 과거
        return rtf.format(-absDiffHours, 'hours'); // "몇 시간 전"
      } else { // 그 이상 과거
        return rtf.format(-absDiffDays, 'days'); // "몇 일 전"
      }
    } else { // 미래 (입력된 시간이 현재보다 이후)
      if (absDiffMinutes < 1) { // 1분 미만 미래
        return rtf.format(Math.floor(diffMs / 1000), 'seconds'); // "몇 초 후"
      } else if (absDiffMinutes < 60) { // 60분 미만 미래
        return rtf.format(absDiffMinutes, 'minutes'); // "몇 분 후"
      } else if (absDiffHours < 24) { // 24시간 미만 미래
        return rtf.format(absDiffHours, 'hours'); // "몇 시간 후"
      } else { // 그 이상 미래
        return rtf.format(absDiffDays, 'days'); // "몇 일 후"
      }
    }
  }

  export const getDefaultLocale = (): string => Intl.DateTimeFormat().resolvedOptions().locale;
}