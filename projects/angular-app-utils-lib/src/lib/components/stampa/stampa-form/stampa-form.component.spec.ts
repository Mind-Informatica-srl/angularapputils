import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StampaFormComponent } from './stampa-form.component';

describe('StampaFormComponent', () => {
  let component: StampaFormComponent;
  let fixture: ComponentFixture<StampaFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StampaFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StampaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
