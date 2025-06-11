import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmsPresentationComponent } from './sms-presentation.component';

describe('SmsPresentationComponent', () => {
  let component: SmsPresentationComponent;
  let fixture: ComponentFixture<SmsPresentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmsPresentationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmsPresentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
