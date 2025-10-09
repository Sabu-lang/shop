import { Routes } from '@angular/router';
import { ProductListComponent } from './features/catalog/pages/product-list/product-list.component';
import { ProductDetailComponent } from './features/catalog/pages/product-detail/product-detail.component';
import { CartComponent } from './features/cart/pages/cart/cart.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { authGuard } from './core/guards/auth-guard';
import { AccountComponent } from './features/account/pages/account/account.component'; 

export const routes: Routes = [ // 👈 აქ შეაცვლე appRoutes -> routes
  { path: '', component: ProductListComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'account', component: AccountComponent, canActivate: [authGuard] }, 
  { path: '**', redirectTo: '' },
];
