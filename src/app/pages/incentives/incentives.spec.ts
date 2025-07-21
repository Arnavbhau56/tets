import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Incentives } from './incentives';

describe('Incentives', () => {
  let component: Incentives;
  let fixture: ComponentFixture<Incentives>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Incentives]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Incentives);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
