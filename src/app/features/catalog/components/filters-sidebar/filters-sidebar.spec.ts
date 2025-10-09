import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltersSidebar } from './filters-sidebar';

describe('FiltersSidebar', () => {
  let component: FiltersSidebar;
  let fixture: ComponentFixture<FiltersSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltersSidebar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltersSidebar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
