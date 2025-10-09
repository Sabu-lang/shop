import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../../cart/services/cart.service';
import { Product } from '../../services/product.models';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);

  products: Product[] = [];
  total = 0;
  page = 1;
  pageSize = 5;
  loading = false;
  filters: any = {};

  private readonly LIMIT_ALL = 1000;

  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.filters = {};
      if (params.get('q')) this.filters.q = params.get('q')!;
      if (params.get('category')) this.filters.category = params.get('category')!;
      if (params.get('brand')) this.filters.brand = params.get('brand')!;
      if (params.get('priceMin')) this.filters.priceMin = Number(params.get('priceMin'));
      if (params.get('priceMax')) this.filters.priceMax = Number(params.get('priceMax'));
      if (params.get('ratingMin')) this.filters.ratingMin = Number(params.get('ratingMin'));

      this.page = 1;
      this.load();
    });
  }

  load() {
    this.loading = true;
    const wantClientSearch = !!(this.filters.q && String(this.filters.q).trim());
    const page = wantClientSearch ? 1 : this.page;
    const limit = wantClientSearch ? this.LIMIT_ALL : this.pageSize;

    this.productService.list({ ...this.filters, page, limit }).subscribe({
      next: res => {
        const all = res.products || [];
        this.products = all;
        this.total = res.total ?? all.length;
        this.loading = false;
      },
      error: err => {
        console.error('❌ პროდუქტის ჩატვირთვის შეცდომა:', err);
        this.loading = false;
      }
    });
  }

  nextPage() {
    if (this.page * this.pageSize < this.total) {
      this.page++;
      this.load();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.load();
    }
  }

  /** ✅ კალათაში დამატება (SweetAlert-ით) */
  addToCart(p: Product) {
    const id = this.productService.safeGetId(p);
    if (!id) {
      Swal.fire('შეცდომა ⚠️', 'პროდუქტის ID ვერ მოიძებნა!', 'error');
      return;
    }

    this.cartService.addProduct(id, 1).subscribe({
      next: res => {
        console.log('✅ დაემატა კალათაში:', res);
        Swal.fire({
          icon: 'success',
          title: 'დაემატა კალათაში 🛒',
          text: `${p.title} წარმატებით დაემატა თქვენს კალათაში.`,
          confirmButtonColor: '#3085d6',
        });
      },
      error: err => {
        console.error('❌ შეცდომა კალათაში დამატებისას:', err);

        if (err.status === 409) {
          Swal.fire({
            icon: 'info',
            title: 'ℹ️ პროდუქტი უკვე დამატებულია',
            text: 'ეს პროდუქტი უკვე არის თქვენს კალათაში 💡',
            confirmButtonColor: '#3085d6',
          });
        } else if (err.status === 401) {
          Swal.fire({
            icon: 'warning',
            title: 'ავტორიზაციაა საჭირო 🔒',
            text: 'კალათაში დამატება მხოლოდ ავტორიზებულ მომხმარებლებს შეუძლიათ.',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'დამატება ვერ მოხერხდა ❌',
            text: 'გთხოვთ სცადოთ მოგვიანებით.',
          });
        }
      }
    });
  }
}
