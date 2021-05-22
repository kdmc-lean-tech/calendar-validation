import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment-timezone';

@Pipe({
  name: 'timezone'
})
export class TimezonePipe implements PipeTransform {

  transform(date: string | Date, timeZone: string): string {
    if (date instanceof Date) {
      date = date.toISOString();
    }
    const initialDate = moment(date).tz(timeZone).locale('en');
    const endDate = moment(date).tz(timeZone).locale('en');
    const initialTime = initialDate.format('LT');
    const endTime = endDate.set({ h: endDate.get('h') + 2 }) .format('LT');
    return `
      ${ initialDate.format('L') }
        ${ initialTime } - ${ endTime }`;
  }
}
