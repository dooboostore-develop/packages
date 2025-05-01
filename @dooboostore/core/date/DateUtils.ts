export namespace DateUtils {

  export const create = (data: string): Date => new Date(data);

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

  export const add = (date: Date, { years = 0, months = 0, days = 0, minutes = 0, seconds = 0 }: { years?: number; months?: number; days?: number; minutes?: number; seconds?: number }): Date => {
    const result = new Date(date);
    if (years) result.setFullYear(result.getFullYear() + years);
    if (months) result.setMonth(result.getMonth() + months);
    if (days) result.setDate(result.getDate() + days);
    if (minutes) result.setMinutes(result.getMinutes() + minutes);
    if (seconds) result.setSeconds(result.getSeconds() + seconds);
    return result;
  };
}