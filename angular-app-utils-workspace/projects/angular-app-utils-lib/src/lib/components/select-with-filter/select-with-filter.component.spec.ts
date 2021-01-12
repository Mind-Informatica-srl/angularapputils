import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectWithFilterComponent } from './select-with-filter.component';

describe('SelectWithFilterComponent', () => {
  let component: SelectWithFilterComponent;
  let fixture: ComponentFixture<SelectWithFilterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectWithFilterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectWithFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
