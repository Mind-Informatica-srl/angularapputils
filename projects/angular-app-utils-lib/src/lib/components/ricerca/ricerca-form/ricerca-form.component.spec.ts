import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RicercaFormComponent } from './ricerca-form.component';

describe('RicercaFormComponent', () => {
  let component: RicercaFormComponent;
  let fixture: ComponentFixture<RicercaFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RicercaFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RicercaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
