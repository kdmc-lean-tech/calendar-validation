import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeSelectFieldComponent } from './time-select-field.component';

describe('TimeSelectFieldComponent', () => {
  let component: TimeSelectFieldComponent;
  let fixture: ComponentFixture<TimeSelectFieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimeSelectFieldComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeSelectFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
