import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-filters-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filters-sidebar.component.html',
  styleUrls: ['./filters-sidebar.component.scss']
})
export class FiltersSidebarComponent {
  // === 🟢 ესენი საჭიროა ერორების ასარიდებლად ===
  @Input() categories: string[] = [];
  @Input() brands: string[] = [];

  // === 🟢 ფილტრის პარამეტრები ===
  q: string = '';
  category: string = '';
  brand: string = '';
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;

  // === 🟢 როცა ფილტრი იცვლება ===
  @Output() changeFilters = new EventEmitter<any>();

  apply() {
    this.changeFilters.emit({
      q: this.q,
      category: this.category,
      brand: this.brand,
      priceMin: this.minPrice,
      priceMax: this.maxPrice,
      ratingMin: this.minRating
    });
  }

  reset() {
    this.q = '';
    this.category = '';
    this.brand = '';
    this.minPrice = undefined;
    this.maxPrice = undefined;
    this.minRating = undefined;
    this.changeFilters.emit({});
  }
}
