import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

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
  avatar?: string;
  gender: 'MALE' | 'FEMALE';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly API = 'https://api.everrest.educata.dev/auth'; 

  private userSubject = new BehaviorSubject<any>(this.getUser());
  user$ = this.userSubject.asObservable();

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.API}/sign_in`, { email, password }).pipe(
      tap((res: any) => {
        if (res?.access_token) {
          localStorage.setItem('user', JSON.stringify(res));
          localStorage.setItem('token', res.access_token);
          this.userSubject.next(res);
          console.log('✅ Login წარმატებით დასრულდა:', res);
        }
      }),
      catchError(err => {
        console.error('❌ Login შეცდომა:', err);
        return throwError(() => err);
      })
    );
  }

  register(data: RegisterPayload): Observable<any> {

    if (!data.phone.startsWith('+995')) {
      data.phone = `+995${data.phone.replace('+', '').trim()}`;
    }
    if (!data.avatar || data.avatar.trim() === '') {
      data.avatar = 'https://i.imgur.com/BohQiHi.jpg';
    }

    return this.http.post(`${this.API}/sign_up`, data).pipe( 
      tap(res => console.log('✅ რეგისტრაცია წარმატებულია:', res)),
      catchError(err => {
        console.error('❌ რეგისტრაციის შეცდომა:', err);
        return throwError(() => err);
      })
    );
  }

  refreshToken(): Observable<string> {
    const token = localStorage.getItem('token');
    if (!token) return throwError(() => 'No token found');

    return this.http.post(`${this.API}/refresh`, { token }).pipe(
      map((res: any) => {
        if (res?.access_token) {
          localStorage.setItem('user', JSON.stringify(res));
          localStorage.setItem('token', res.access_token);
          this.userSubject.next(res);
          console.log('🔄 ტოკენი განახლდა:', res.access_token);
          return res.access_token;
        }
        throw new Error('Invalid refresh response');
      }),
      catchError(err => {
        console.error('❌ Refresh token შეცდომა:', err);
        return throwError(() => err);
      })
    );
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.userSubject.next(null);
    console.log('👋 გამოსვლა შესრულდა.');
  }


  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }


  saveUser(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }

  getUser(): any {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}
