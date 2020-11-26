import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RicercaFieldDateComponent } from './ricerca-field-date.component';

describe('RicercaFieldDateComponent', () => {
  let component: RicercaFieldDateComponent;
  let fixture: ComponentFixture<RicercaFieldDateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RicercaFieldDateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RicercaFieldDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
