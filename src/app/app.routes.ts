import { Routes } from '@angular/router';
import { ProductListComponent } from './features/catalog/pages/product-list/product-list.component';
import { ProductDetailComponent } from './features/catalog/pages/product-detail/product-detail.component';
import { CartComponent } from './features/cart/pages/cart/cart.component';
import { LoginComponent } from './features/auth/pages/login/login.component';
import { RegisterComponent } from './features/auth/pages/register/register.component';
import { AccountComponent } from './features/account/pages/account/account.component';
import { PaymentComponent } from './features/payment/payment.component'; // ✅ დაამატე ეს import
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', component: ProductListComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'payment', component: PaymentComponent, canActivate: [authGuard] }, // ✅ გადახდის გვერდი
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'account', component: AccountComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' },
];
