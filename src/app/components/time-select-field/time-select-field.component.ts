import { Input } from '@angular/core';
import {
  Component,
  forwardRef,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  FormControl,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  Validators
} from '@angular/forms';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { Subscription } from 'rxjs';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import * as _moment from 'moment-timezone';
import * as _rollupMoment from 'moment-timezone';
const moment = _rollupMoment || _moment;

const TIME_SELECT_FORMAT = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'MM-DD-YYYY',
    monthYearLabel: 'YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY',
  },
};

@Component({
  selector: 'app-time-select-field',
  templateUrl: './time-select-field.component.html',
  styleUrls: ['./time-select-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimeSelectFieldComponent),
      multi: true
    },
    {provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS ]},
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_FORMATS, useValue: TIME_SELECT_FORMAT },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TimeSelectFieldComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() edit = false;
  @Input() isDisabled = false;
  @Input() timeZone: string;
  public hours: string[];
  public minutes: string[];
  public scheduleSystem: string[] = [];
  public form: FormGroup;
  private subscriptions = new Subscription();
  public dateDisplay: Date;
  public dateDisplayTwo: Date;
  onChange = (_?: any) => { };
  onTouched = (_?: any) => { };

  constructor(
    private formBuilder: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
  }

  ngOnInit(): void {
    this.hours = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    this.minutes = ['00', '15', '30', '45'];
    this.scheduleSystem = ['AM', 'PM'];
    this.createForm();
    this.listenChangesInControls();
  }

  private dateFormat(hours: number, minutes: number): { h: string, m: string, schedule: string } {
    let m = '';
    const schedule = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    if (minutes === 0) {
      m = '00';
    } else if (minutes <= 15) {
      m = '15';
    } else if (minutes <= 44) {
      m = '30';
    } else if (minutes >= 45) {
      m = '45';
    }
    return {
      h: String(hours),
      m,
      schedule
    };
  }

  private createForm() {
    this.form = this.formBuilder.group({
      hours: new FormControl(null, Validators.required),
      minutes: new FormControl(null, Validators.required),
      schedule: new FormControl(null, Validators.required),
      date: new FormControl(null, Validators.required)
    });
  }

  public get date() { return this.form.get('date'); }
  public get h() { return this.form.get('hours'); }
  public get m() { return this.form.get('minutes'); }
  public get schedule() { return this.form.get('schedule'); }

  private listenChangesInControls() {
    this.subscriptions.add(
      this.form.valueChanges.subscribe(
        (value: { hours: string, minutes: string, schedule: string }) => {
          this.setControlsInDate(
            value.hours,
            value.minutes,
            value.schedule
          );
      }),
    );
  }

  writeValue(value): void {
    if (value) {
      this.setWriteValue(value);
    } else if (value === null || value === '') {
      this.form.patchValue({
        hours: null,
        minutes: null,
        schedule: null,
        date: null
      });
    }
  }

  private setWriteValue(date: any | string) {
    this.setDateInForm(date);
    this.cdr.detectChanges();
  }

  private setDateInForm(value: Date) {
    const momentValue = moment(value);
    const h = momentValue.get('hour');
    const m = momentValue.get('minutes');
    const dateFormat = this.dateFormat(h, m);
    this.setDateDisplay(momentValue.toDate());
    this.form.patchValue({
      date: momentValue,
      hours: dateFormat.h,
      minutes: dateFormat.m,
      schedule: dateFormat.schedule
    });
  }

  private setDateDisplay(date: Date) {
    this.dateDisplay = date;
    this.dateDisplayTwo = new Date(this.dateDisplay);
    this.dateDisplayTwo.setHours(this.dateDisplayTwo.getHours() + 2);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.cdr.detectChanges();
  }

  private setControlsInDate(
    hours: string, minutes: string, schedule: string
  ) {
      if (this.date.value) {
        const h = Number(hours);
        const m = Number(minutes);
        const formatDate: moment.Moment = this.date.value.set(
          { hour: this.toFixHoursWithSchedule(h, schedule),
            minutes: m
          }
        );
        if (this.form.status === 'VALID') {
          this.onChange(formatDate.toDate());
        }
      }
      this.cdr.detectChanges();
  }

  private toFixHoursWithSchedule(hours: number, schedule): number {
    if (schedule === 'PM') {
      if (hours === 12) {
        hours = 12;
      } else {
        hours += 12;
      }
    } else if (schedule === 'AM') {
      if (hours === 12) {
        hours = 0;
      }
    }
    return hours;
  }

  public dateOnInput($event: MatDatepickerInputEvent<any>) {
    moment.tz.setDefault(this.timeZone);
    const now = new Date();
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const momentDate = $event.value;
    const dateString = momentDate.toISOString().split('T')[0];
    const date = moment(dateString);
    date.set({ hour, minutes });
    this.date.setValue(date);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
