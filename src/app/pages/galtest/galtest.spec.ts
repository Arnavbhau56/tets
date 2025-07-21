import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Galtest } from './galtest';

describe('Galtest', () => {
  let component: Galtest;
  let fixture: ComponentFixture<Galtest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Galtest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Galtest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
