import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LighthouseAuditComponent } from './lighthouse-audit.component';

describe('LighthouseAuditComponent', () => {
  let component: LighthouseAuditComponent;
  let fixture: ComponentFixture<LighthouseAuditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LighthouseAuditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LighthouseAuditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
