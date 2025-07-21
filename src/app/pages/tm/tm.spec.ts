import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tm } from './tm';

describe('Tm', () => {
  let component: Tm;
  let fixture: ComponentFixture<Tm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tm);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
