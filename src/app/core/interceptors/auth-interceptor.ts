import { HttpInterceptorFn } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  // 🟢 ამოვიღოთ ტოკენი localStorage-დან
  const userRaw = localStorage.getItem('user');
  const token = userRaw ? JSON.parse(userRaw)?.access_token : null;

  // Debug log
  console.log('🔍 Interceptor → Token:', token ? 'FOUND ✅' : 'MISSING ❌', token);

  // 🟢 თუ ტოკენი არსებობს, ვამატებთ headers-ში
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      },
      withCredentials: true // 👈 აუცილებელია Everrest API-სთვის
    });
    return next(cloned);
  }

  // ❌ თუ ტოკენი ვერ მოიძებნა
  return next(req);
};
