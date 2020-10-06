import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RicercaMenuComponent } from './ricerca-menu.component';

describe('RicercaMenuComponent', () => {
  let component: RicercaMenuComponent;
  let fixture: ComponentFixture<RicercaMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RicercaMenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RicercaMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
