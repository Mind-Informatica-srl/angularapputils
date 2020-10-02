import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RicercaFieldRadioComponent } from './ricerca-field-radio.component';

describe('RicercaFieldRadioComponent', () => {
  let component: RicercaFieldRadioComponent;
  let fixture: ComponentFixture<RicercaFieldRadioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RicercaFieldRadioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RicercaFieldRadioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
