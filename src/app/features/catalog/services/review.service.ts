import { Injectable, inject } from '@angular/core';
import { ApiService } from 'app/core/services/api.service';
import { Observable } from 'rxjs';
import { Review } from './product.models';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private api = inject(ApiService);

  getReviews(productId: string): Observable<Review[]> {
    return this.api.get<Review[]>(`/shop/products/${productId}/reviews`);
  }

  addReview(productId: string, review: Review): Observable<Review> {
    return this.api.post<Review>(`/shop/products/${productId}/reviews`, review);
  }

  deleteReview(productId: string, reviewId: string): Observable<void> {
    return this.api.delete<void>(`/shop/products/${productId}/reviews/${reviewId}`);
  }
}
