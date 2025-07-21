import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Pastwin } from './pastwin';

describe('Pastwin', () => {
  let component: Pastwin;
  let fixture: ComponentFixture<Pastwin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Pastwin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Pastwin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
