import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusModuleComponent } from './status-module.component';

describe('StatusModuleComponent', () => {
  let component: StatusModuleComponent;
  let fixture: ComponentFixture<StatusModuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatusModuleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
