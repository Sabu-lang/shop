import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../services/product.models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() addToCart = new EventEmitter<{ product: Product; quantity: number }>();

  currentImageIndex = 0;
  quantity = 1; // default რაოდენობა

  nextImage() {
    if (!this.product.images || this.product.images.length <= 1) return;
    this.currentImageIndex = (this.currentImageIndex + 1) % this.product.images.length;
  }

  prevImage() {
    if (!this.product.images || this.product.images.length <= 1) return;
    this.currentImageIndex =
      (this.currentImageIndex - 1 + this.product.images.length) % this.product.images.length;
  }

  inc() {
    if (this.product.stock && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  dec() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  onAddToCart() {
    if (this.product.stock && this.product.stock > 0) {
      this.addToCart.emit({ product: this.product, quantity: this.quantity });
    }
  }

  /** ✅ ფასი მუშაობს როგორც number ისე object */
  getPriceValue(price: any, key: string): number | undefined {
    if (price == null) return undefined;
    if (typeof price === 'number') {
      return key === 'current' ? price : undefined;
    }
    return price[key];
  }

  get isOutOfStock(): boolean {
    return !this.product.stock || this.product.stock <= 0;
  }
}
