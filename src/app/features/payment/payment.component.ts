import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService } from '../cart/services/cart.service'; // ✅ კალათის გასასუფთავებლად

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent {
  fb = new FormBuilder();
  loading = false;
  success = false;
  error = false;

  constructor(private router: Router, private cartService: CartService) {}

  paymentForm = this.fb.group({
    cardNumber: [''],
    name: [''],
    expiry: [''],
    cvv: ['']
  });

  // 💳 გადახდა
  onPay() {
    if (this.paymentForm.invalid) return;

    this.loading = true;
    this.success = false;
    this.error = false;

    // სიმულირებული გადახდის პროცესის იმიტაცია
    setTimeout(() => {
      this.loading = false;
      this.success = true;

      // ✅ კალათის გასუფთავება გადახდის შემდეგ
      this.cartService.clearCart?.(); // თუ გაქვს clearCart() მეთოდი CartService-ში

      // თუ არ გაქვს clearCart() — შეგიძლია უბრალოდ localStorage-დან წაშალო
      localStorage.removeItem('cart');

      // ✅ გადამისამართება 4 წამში მთავარ გვერდზე
      setTimeout(() => {
        this.router.navigate(['/catalog']);
      }, 4000);
    }, 2000);
  }
}
