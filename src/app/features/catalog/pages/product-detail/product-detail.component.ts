import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../../cart/services/cart.service';
import { Product } from '../../services/product.models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);

  p?: Product;
  loading = false;

  // 👉 გამოსახულებების ნავიგაციისთვის
  currentImageIndex = 0;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loading = true;
      this.productService.getById(id).subscribe({
        next: res => {
          this.p = res;
          this.loading = false;
        },
        error: () => (this.loading = false)
      });
    }
  }

  // 👉 ფასის დამხმარე მეთოდი
  getPriceValue(price: any, type: 'current' | 'beforeDiscount'): number {
    if (!price) return 0;
    if (typeof price === 'number') return price;
    if (typeof price === 'object') {
      return type === 'current' ? price.current ?? 0 : price.beforeDiscount ?? 0;
    }
    return 0;
  }

  // 👉 კალათაში დამატება
  addToCart() {
    if (!this.p) return;

    // ზოგი მოდელში შეიძლება იყოს productId ან _id
    const id = (this.p as any).id || (this.p as any).productId || (this.p as any)._id;
    if (!id) {
      console.error('❌ პროდუქტის ID ვერ მოიძებნა');
      return;
    }

    this.cartService.addProduct(id, 1).subscribe({
      next: () => console.log('✅ პროდუქტი დაემატა კალათაში'),
      error: err => console.error('❌ შეცდომა კალათაში დამატებისას:', err)
    });
  }
}
