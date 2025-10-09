import { Injectable, inject } from '@angular/core';
import { ApiService } from 'app/core/services/api.service';
import { Observable } from 'rxjs';
import { Product } from './product.models';

export interface ProductListResponse {
  total: number;
  products: Product[];
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private api = inject(ApiService);

  list(opts: {
    page?: number;
    limit?: number;
    q?: string;
    category?: string;
    brand?: string;
    priceMin?: number;
    priceMax?: number;
    ratingMin?: number;
  } = {}): Observable<ProductListResponse> {
    const {
      page = 1,
      limit = 10,
      q,
      category,
      brand,
      priceMin,
      priceMax,
      ratingMin
    } = opts;

    const params: any = {
      page_index: page,
      page_size: limit,
      q,
      category,
      brand,
      priceMin,
      priceMax,
      ratingMin,
    };

    return this.api.get<ProductListResponse>('/shop/products/all', params);
  }

  getById(id: string): Observable<Product> {
    return this.api.get<Product>(`/shop/products/id/${id}`);
  }

  /** ✅ აქედან იწყება მთავარი: ID უსაფრთხოდ ამოიღოს მხოლოდ _id */
  safeGetId(p: Product): string {
    if ((p as any)?._id) return (p as any)._id;
    if ((p as any)?.id) return String((p as any).id);
    console.warn('⚠️ პროდუქტის _id ვერ მოიძებნა:', p);
    return '';
  }
}
