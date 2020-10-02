import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RicercaFieldSelectComponent } from './ricerca-field-select.component';

describe('RicercaFieldSelectComponent', () => {
  let component: RicercaFieldSelectComponent;
  let fixture: ComponentFixture<RicercaFieldSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RicercaFieldSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RicercaFieldSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
