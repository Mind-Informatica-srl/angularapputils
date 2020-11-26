import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AngularAppUtilsLibComponent } from './angular-app-utils-lib.component';

describe('AngularAppUtilsLibComponent', () => {
  let component: AngularAppUtilsLibComponent;
  let fixture: ComponentFixture<AngularAppUtilsLibComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AngularAppUtilsLibComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AngularAppUtilsLibComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
