import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RicercaFieldStringComponent } from './ricerca-field-string.component';

describe('RicercaFieldStringComponent', () => {
  let component: RicercaFieldStringComponent;
  let fixture: ComponentFixture<RicercaFieldStringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RicercaFieldStringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RicercaFieldStringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
