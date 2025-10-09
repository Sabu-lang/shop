import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  password: string;
  address: string;
  phone: string;
  zipcode: string;
  avatar: string;
  gender: 'MALE' | 'FEMALE';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);

  private userSubject = new BehaviorSubject<any>(this.getUser());
  user$ = this.userSubject.asObservable();

  /** 🔹 შესვლა (login) */
  login(email: string, password: string): Observable<any> {
    return new Observable((observer) => {
      this.api.post('/auth/sign_in', { email, password }).subscribe({
        next: (res: any) => {
          console.log('🟢 Login response:', res);

          // ✅ შენახვა სწორ ფორმატში (Access Token პირდაპირ ტექსტად)
          if (res?.access_token) {
            localStorage.setItem('token', res.access_token);
          }

          // ✅ მომხმარებლის შენახვა access_token-ით
          if (res?.user) {
            const fullUser = { ...res.user, access_token: res.access_token };
            localStorage.setItem('user', JSON.stringify(fullUser));
            this.userSubject.next(fullUser);
          }

          observer.next(res);
          observer.complete();
        },
        error: (err) => {
          console.error('❌ Login error:', err);
          observer.error(err);
        },
      });
    });
  }

  /** 🔹 რეგისტრაცია */
  register(data: RegisterPayload): Observable<any> {
    if (!data.phone.startsWith('+995')) {
      data.phone = `+995${data.phone.replace('+', '').trim()}`;
    }

    if (!data.avatar || data.avatar.trim() === '') {
      data.avatar = 'https://i.imgur.com/BohQiHi.jpg';
    }

    return this.api.post('/auth/sign_up', data);
  }

  /** 🔹 გამოსვლა */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  /** 🔹 შესულია თუ არა */
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  /** 🔹 მომხმარებლის შენახვა */
  saveUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  /** 🔹 მომხმარებლის წამოღება */
  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
