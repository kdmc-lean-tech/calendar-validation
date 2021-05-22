import { Injectable } from '@angular/core';
import * as moment from 'moment-timezone';
import { CalendarValidationResult } from '../models/calendar-validations.model';

@Injectable({
  providedIn: 'root'
})
export class CalendarValidationsService {
  constructor() {
  }

  public setUTCTimezone(date: string | Date, timeZone: string) {
    return moment.utc(date).tz(timeZone);
  }

  private formatAllOpportunities(opportunities: any[], timeZone: string):
    { startDate: moment.Moment, endDate: moment.Moment }[] {
    return opportunities.map(opp => {
      const startDate = moment.utc(opp.date).tz(timeZone);
      const endDate = moment.utc(opp.date).tz(timeZone);
      endDate.set('h', startDate.get('h') + 2);
      return {
        startDate,
        endDate
      }
    });
  }

  public validateDateInOpportunities(date: string, timeZone: string, opportunities: any[])
    : CalendarValidationResult {
      const startDateFormat = this.setUTCTimezone(date, timeZone);
      const endDateFormat = this.setUTCTimezone(date, timeZone);
      endDateFormat.set('h', startDateFormat.get('h') + 2);
    
      let result: CalendarValidationResult = this.setCalendarValidationResult(
        true, startDateFormat, null, null);

      const opportunitiesFormat = this.formatAllOpportunities(opportunities, timeZone);
    
      opportunitiesFormat.forEach(opp => {
        // Validar exactamente entre la fecha usuario inicial y el rango de fechas
        if (opp.startDate.isSame(startDateFormat)) {
          result = this.setCalendarValidationResult(false, startDateFormat, opp.startDate, opp.endDate);
        }

        // Validar que la fecha usuario inicial esté entre el rango de fechas
        if (startDateFormat.isBetween(opp.startDate, opp.endDate)) {
          result = this.setCalendarValidationResult(false, startDateFormat, opp.startDate, opp.endDate);
        }

        // Validar que la fecha usuario final esté entre el rango de fechas
        if (endDateFormat.isBetween(opp.startDate, opp.endDate)) {
          result = this.setCalendarValidationResult(false, startDateFormat, opp.startDate, opp.endDate);
        }

        // Validar que la fecha usuario final no sea la fecha inicial del rango de fechas
        if (endDateFormat.isSame(opp.startDate)) {
          result = this.setCalendarValidationResult(false, startDateFormat, opp.startDate, opp.endDate);
        }
      });
      return result;
  }

  private setCalendarValidationResult(
    available: boolean, dateSelected: moment.Moment, startDate: moment.Moment, endDate: moment.Moment) {
      return {
        available,
        dateSelected,
        endDate,
        startDate
      };
  }
}
