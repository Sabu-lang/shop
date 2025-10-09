import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly BASE_URL = 'https://api.everrest.educata.dev';
  private http = inject(HttpClient);

  // ✅ ტოკენის წამოღება და გაწმენდა
  private getToken(): string | null {
    const raw = localStorage.getItem('token');
    if (!raw) return null;

    try {
      // ზოგი შენახულია როგორც { access_token: "..." }
      const parsed = JSON.parse(raw);
      return parsed.access_token ?? null;
    } catch {
      // ზოგ შემთხვევაში პირდაპირ სტრინგია
      return raw;
    }
  }

  // ✅ ჰედერის შექმნა ავტორიზაციით
  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('🟢 Bearer Token დაემატა:', token.slice(0, 25) + '...');
    } else {
      console.warn('⚠️ ტოკენი ვერ მოიძებნა localStorage-ში');
    }

    return new HttpHeaders(headers);
  }

  // ✅ GET
  get<T>(endpoint: string, params?: any): Observable<T> {
    return this.http.get<T>(`${this.BASE_URL}${endpoint}`, {
      params,
      headers: this.getAuthHeaders(),
      withCredentials: true,
    });
  }

  // ✅ POST
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.BASE_URL}${endpoint}`, body, {
      headers: this.getAuthHeaders(),
      withCredentials: true,
    });
  }

  // ✅ PATCH
  patch<T>(endpoint: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.BASE_URL}${endpoint}`, body, {
      headers: this.getAuthHeaders(),
      withCredentials: true,
    });
  }

  // ✅ DELETE
  delete<T>(endpoint: string, body?: any): Observable<T> {
    return this.http.request<T>('DELETE', `${this.BASE_URL}${endpoint}`, {
      body,
      headers: this.getAuthHeaders(),
      withCredentials: true,
    });
  }
}
