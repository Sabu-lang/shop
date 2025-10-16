import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, forkJoin, map, switchMap, catchError, throwError, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private readonly API = 'https://api.everrest.educata.dev/shop';

  private getAuthHeaders(): HttpHeaders | undefined {
    const rawUser = localStorage.getItem('user');
    const token =
      rawUser && rawUser.startsWith('{')
        ? JSON.parse(rawUser)?.access_token
        : localStorage.getItem('token')?.replace(/['"]+/g, '');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  }

  // 🛒 კალათის წამოღება
  getCart(): Observable<CartResponse> {
    const headers = this.getAuthHeaders();

    return this.http.get<any>(`${this.API}/cart`, { headers }).pipe(
      switchMap((cart) => {
        if (!cart?.products?.length) return of(this.normalize(cart));

        const requests = cart.products.map((p: any) => {
          const pid = p.productId ?? p.id ?? '';
          if (!pid) return of(p);

          return this.http.get<any>(`${this.API}/products/id/${pid}`).pipe(
            map((product) => ({ ...p, product })),
            catchError(() => of(p))
          );
        });

        return forkJoin(requests).pipe(
          map((full) => this.normalize({ ...cart, products: full }))
        );
      }),
      catchError((err) => {
        if (err?.error?.errorKeys?.includes('errors.user_has_no_cart')) {
          console.warn('🧺 კალათა ჯერ არ არსებობს — ვქმნით ახალს...');
          return this.createCart().pipe(
            switchMap(() => this.http.get<any>(`${this.API}/cart`, { headers })),
            map((data) => this.normalize(data))
          );
        }
        console.error('❌ კალათის წამოღების შეცდომა:', err);
        return throwError(() => err);
      })
    );
  }

  // ➕ პროდუქტის დამატება კალათაში
  addProduct(productId: string, quantity = 1): Observable<CartResponse> {
    const headers = this.getAuthHeaders();
    const body = { id: productId, quantity };

    return this.http.post<any>(`${this.API}/cart/product`, body, { headers }).pipe(
      switchMap(() => this.getCart()),
      catchError((err) => {
        if (String(err?.error?.error ?? '').includes('already created'))
          return this.updateProduct(productId, quantity);
        if (err?.error?.errorKeys?.includes('errors.user_has_no_cart'))
          return this.createCart().pipe(
            switchMap(() =>
              this.http.post<any>(`${this.API}/cart/product`, body, { headers })
            ),
            switchMap(() => this.getCart())
          );
        console.error('❌ დამატების შეცდომა:', err);
        return throwError(() => err);
      })
    );
  }

  // 🔄 პროდუქტის განახლება (რაოდენობის შეცვლა)
  updateProduct(productId: string, quantity: number): Observable<CartResponse> {
    const headers = this.getAuthHeaders();
    const body = { id: productId, quantity };
    return this.http
      .patch<any>(`${this.API}/cart/product`, body, { headers })
      .pipe(switchMap(() => this.getCart()));
  }

  // ❌ პროდუქტის წაშლა
  removeProduct(productId: string): Observable<CartResponse> {
    const headers = this.getAuthHeaders();
    const body = { id: productId };
    return this.http
      .request<any>('DELETE', `${this.API}/cart/product`, { body, headers })
      .pipe(switchMap(() => this.getCart()));
  }

  // 🧺 ახალი კალათის შექმნა
  createCart(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.API}/cart/create`, {}, { headers });
  }

  // 🧹 კალათის გასუფთავება (API + localStorage fallback)
  clearCart(): void {
    const headers = this.getAuthHeaders();
    // თუ ტოკენი არსებობს, ვცდილობთ API-ს მეშვეობით წავშალოთ
    if (headers) {
      this.http
        .delete(`${this.API}/cart`, { headers })
        .pipe(
          catchError((err) => {
            console.warn('⚠️ API კალათის გასუფთავება ვერ მოხერხდა, local fallback...');
            localStorage.removeItem('cart');
            return of(null);
          })
        )
        .subscribe(() => {
          console.log('✅ კალათა გასუფთავდა სერვერზე');
        });
    } else {
      // fallback — თუ ტოკენი არაა
      localStorage.removeItem('cart');
      console.log('🧹 კალათა გასუფთავდა localStorage-დან');
    }
  }

  // 📦 normalize პასუხის ფორმატირება
  private normalize(data: any): CartResponse {
    if (!data) {
      return {
        products: [],
        items: [],
        total: { price: { current: 0 }, quantity: 0 },
      };
    }

    const items: CartItem[] = (data.products ?? []).map((row: any) => {
      const product = row.product ?? {};

      const title =
        product.title ?? product.name ?? product.data?.title ?? 'უცნობი პროდუქტი';

      const price =
        product.price?.current ?? row.pricePerQuantity ?? product.price ?? 0;

      const image =
        product.thumbnail ??
        product.image ??
        (Array.isArray(product.images) && product.images.length
          ? product.images[0]
          : 'https://placehold.co/200x200?text=No+Image');

      return {
        id: product._id ?? row.productId ?? row.id,
        title,
        price,
        image,
        quantity: row.quantity ?? 1,
        subtotal: price * (row.quantity ?? 1),
      };
    });

    const totalPrice =
      Number(data?.total?.price?.current) ||
      items.reduce((s, i) => s + (i.subtotal ?? 0), 0);

    const totalQuantity =
      Number(data?.total?.quantity) ||
      items.reduce((s, i) => s + (i.quantity ?? 0), 0);

    return {
      products: items,
      items,
      total: { price: { current: totalPrice }, quantity: totalQuantity },
    };
  }
}

// ========================
// 📦 ინტერფეისები
// ========================

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image?: string;
  quantity: number;
  subtotal?: number;
}

export interface CartResponse {
  products: CartItem[];
  items: CartItem[];
  total: {
    price: { current: number; beforeDiscount?: number };
    quantity: number;
  };
}
