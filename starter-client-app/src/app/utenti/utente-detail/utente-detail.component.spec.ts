import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UtenteDetailComponent } from './utente-detail.component';

describe('UtenteDetailComponent', () => {
  let component: UtenteDetailComponent;
  let fixture: ComponentFixture<UtenteDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UtenteDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UtenteDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
