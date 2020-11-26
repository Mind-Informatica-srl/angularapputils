import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RicercaFieldNumberComponent } from './ricerca-field-number.component';

describe('RicercaFieldNumberComponent', () => {
  let component: RicercaFieldNumberComponent;
  let fixture: ComponentFixture<RicercaFieldNumberComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RicercaFieldNumberComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RicercaFieldNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
