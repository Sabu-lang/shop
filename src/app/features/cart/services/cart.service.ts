import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image?: string;
  quantity: number;
  subtotal?: number;
}

export interface CartResponse {
  items: CartItem[];
  totalQuantity: number;
  totalPrice: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private http = inject(HttpClient);
  private readonly API = 'https://api.everrest.educata.dev/shop';

  /** 🛒 კალათის წამოღება */
  getCart(): Observable<CartResponse> {
    return this.http.get<any>(`${this.API}/cart`).pipe(map(this.normalize));
  }

  /** ➕ პროდუქტის დამატება კალათაში */
  addProduct(productId: string, quantity = 1): Observable<CartResponse> {
    const body = { id: productId, quantity }; // ✅ სწორი key
    console.log('📦 იგზავნება მოთხოვნა კალათაში:', body);

    return this.http
      .post<any>(`${this.API}/cart/product`, body)
      .pipe(map(this.normalize));
  }

  /** 🔁 რაოდენობის განახლება */
  updateProduct(productId: string, quantity: number): Observable<CartResponse> {
    const body = { id: productId, quantity };
    return this.http
      .patch<any>(`${this.API}/cart/product`, body)
      .pipe(map(this.normalize));
  }

  /** ❌ პროდუქტის წაშლა კალათიდან */
  removeProduct(productId: string): Observable<CartResponse> {
    const body = { id: productId };
    return this.http
      .request<any>('DELETE', `${this.API}/cart/product`, { body })
      .pipe(map(this.normalize));
  }

  /** 🧩 normalize – მოარგებს API-ს პასუხს Angular-ს ფორმატს */
  private normalize = (res: any): CartResponse => {
    // ზოგჯერ სერვერი აბრუნებს { cart: {...}, items: [...]} სტრუქტურას
    const data = res?.cart ?? res;

    const items = (data?.items ?? []).map((i: any) => ({
      ...i,
      subtotal: i.subtotal ?? (i.price * i.quantity),
    })) as CartItem[];

    const totalPrice =
      data?.totalPrice ?? items.reduce((s, i) => s + (i.subtotal ?? 0), 0);
    const totalQuantity =
      data?.totalQuantity ?? items.reduce((s, i) => s + (i.quantity ?? 0), 0);

    return { items, totalPrice, totalQuantity };
  };
}
