import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../../cart/services/cart.service';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { Product } from '../../services/product.models';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);

  allProducts: Product[] = [];
  products: Product[] = [];
  total = 0;
  page = 1;
  pageSize = 5;
  loading = false;

  filters = {
    q: '',
    category: '',
    brand: '',
    priceMin: 0,
    priceMax: 0
  };

  get totalPages(): number {
    return Math.ceil(this.total / this.pageSize);
  }

  ngOnInit() {
    this.loadAllProducts();

    this.route.queryParamMap.subscribe(params => {
      this.filters.q = params.get('q') || '';
      this.filters.category = params.get('category') || '';
      this.filters.brand = params.get('brand') || '';
      this.filters.priceMin = Number(params.get('priceMin')) || 0;
      this.filters.priceMax = Number(params.get('priceMax')) || 0;
      this.page = Number(params.get('page')) || 1;
      this.applyFilters();
    });
  }


  loadAllProducts() {
    this.loading = true;
    this.productService.list({ page: 1, limit: 38 }).subscribe({
      next: (res) => {
        this.allProducts = res?.products || [];
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ პროდუქტის ჩატვირთვის შეცდომა:', err);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.allProducts];
    const { q, category, brand, priceMin, priceMax } = this.filters;


    if (q.trim()) {
      const search = q.toLowerCase();
      filtered = filtered.filter((p: any) => {
        const title = typeof p.title === 'string' ? p.title.toLowerCase() : '';
        const brandName =
          typeof p.brand === 'string'
            ? p.brand.toLowerCase()
            : (p.brand as any)?.name
            ? String((p.brand as any).name).toLowerCase()
            : '';
        const categoryName =
          typeof p.category === 'string'
            ? p.category.toLowerCase()
            : (p.category as any)?.name
            ? String((p.category as any).name).toLowerCase()
            : '';
        return (
          title.includes(search) ||
          brandName.includes(search) ||
          categoryName.includes(search)
        );
      });
    }


    if (category) {
      filtered = filtered.filter((p: any) => {
        const cat =
          typeof p.category === 'string'
            ? p.category.toLowerCase()
            : (p.category as any)?.name
            ? String((p.category as any).name).toLowerCase()
            : '';
        return cat === category.toLowerCase();
      });
    }


    if (brand) {
      filtered = filtered.filter((p: any) => {
        const brandName =
          typeof p.brand === 'string'
            ? p.brand.toLowerCase()
            : (p.brand as any)?.name
            ? String((p.brand as any).name).toLowerCase()
            : '';
        return brandName === brand.toLowerCase();
      });
    }


    if (priceMin > 0) {
      filtered = filtered.filter((p: any) => {
        const price =
          typeof p.price === 'object'
            ? (p.price as any).current
            : typeof p.price === 'number'
            ? p.price
            : 0;
        return price >= priceMin;
      });
    }

    if (priceMax > 0) {
      filtered = filtered.filter((p: any) => {
        const price =
          typeof p.price === 'object'
            ? (p.price as any).current
            : typeof p.price === 'number'
            ? p.price
            : 0;
        return price <= priceMax;
      });
    }


    this.total = filtered.length;
    const start = (this.page - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.products = filtered.slice(start, end);
  }


  nextPage() {
    if (this.page < this.totalPages) {
      this.page++;
      this.applyFilters();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.applyFilters();
    }
  }
  addToCart(p: Product) {
    const id = this.productService.safeGetId(p);
    if (!id) {
      alert('❌ პროდუქტის ID ვერ მოიძებნა');
      return;
    }

    this.cartService.addProduct(id, 1).subscribe({
      next: () => alert(`"${p.title}" დაემატა კალათაში ✅`),
      error: (err) => {
        console.error('❌ შეცდომა კალათაში დამატებისას:', err);
        alert('დამატება ვერ მოხერხდა ❌');
      },
    });
  }
}
