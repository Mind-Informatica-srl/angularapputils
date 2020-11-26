import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StampaModalComponent } from './stampa-modal.component';

describe('StampaModalComponent', () => {
  let component: StampaModalComponent;
  let fixture: ComponentFixture<StampaModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StampaModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StampaModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
