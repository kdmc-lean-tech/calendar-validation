import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment-timezone';
import { Observable, Subscription } from 'rxjs';
import { OpportunitiesRTService } from 'src/app/services/opportunities-rt.service';
import { CalendarValidationsService } from './services/calendar-validations.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'timezone-validate-date';
  public form: FormGroup;
  public subscriptions = new Subscription();
  public opportunities: { byRole: any[] };
  public message: string;

  constructor(
    private calendarValidationsService: CalendarValidationsService,
    private fb: FormBuilder,
    private opportunitiesRTService: OpportunitiesRTService
  ) {
  }

  ngOnInit() {
    this.createForm();
    this.subscriptions.add(
      this.date.valueChanges.subscribe(date => {
        this.opportunitiesRTService.opportunitiesEmit(date);
      })
    );
    this.subscriptions.add(
      this.opportunitiesRTService.opportunities
        .subscribe(response => {
          if (response) {
            this.opportunities = response;
            const result = this.calendarValidationsService
              .validateDateInOpportunities(
                this.date.value,
                this.timeZone.value,
                this.opportunities?.byRole,
              );
            this.message = result.available === true ? null :
              `You do not have availability for the selected date ${ result.dateSelected.format('LT L') },
                since it crosses with another procedure ${ result.startDate.format('LT L') } -
                  ${ result.endDate.format('LT L') }.`;
          }
        })
    );
  }

  public createForm() {
    this.form = this.fb.group({
      date: new FormControl(null, [ Validators.required ]),
      timeZone: new FormControl('America/Los_Angeles', [ Validators.required ])
    });
  }

  public get date() {
    return this.form.get('date') as FormControl;
  }

  public get timeZone() {
    return this.form.get('timeZone') as FormControl;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
