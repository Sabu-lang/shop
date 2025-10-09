import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService, CartItem, CartResponse } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent {
  private cartService = inject(CartService);

  items: CartItem[] = [];
  totalPrice = 0;
  totalQuantity = 0;
  loading = false;

  ngOnInit() {
    this.loadCart();
  }

  /** 🛒 კალათის წამოღება */
  loadCart() {
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: (res: CartResponse) => {
        console.log('🛒 კალათის მონაცემები:', res);
        this.items = res.items || [];
        this.totalPrice = res.totalPrice || 0;
        this.totalQuantity = res.totalQuantity || 0;
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ კალათის წამოღების შეცდომა:', err);
        this.loading = false;
      }
    });
  }

  /** ➕ რაოდენობის გაზრდა */
  increase(item: CartItem) {
    const newQty = item.quantity + 1;
    this.updateQuantity(item, newQty);
  }

  /** ➖ რაოდენობის შემცირება */
  decrease(item: CartItem) {
    if (item.quantity > 1) {
      const newQty = item.quantity - 1;
      this.updateQuantity(item, newQty);
    }
  }

  /** 🔁 რაოდენობის განახლება სერვერზე */
  updateQuantity(item: CartItem, newQty: number) {
    this.cartService.updateProduct(item.id, newQty).subscribe({
      next: (res) => {
        console.log(`✅ განახლდა რაოდენობა: ${newQty}`, res);
        this.loadCart(); // განვაახლოთ UI
      },
      error: (err) => {
        console.error('❌ შეცდომა რაოდენობის განახლებისას:', err);
        alert('⚠️ რაოდენობის განახლება ვერ მოხერხდა.');
      }
    });
  }

  /** ❌ პროდუქტის წაშლა კალათიდან */
  remove(item: CartItem) {
    if (!confirm('გსურთ პროდუქტის წაშლა კალათიდან?')) return;

    this.cartService.removeProduct(item.id).subscribe({
      next: (res) => {
        console.log('🗑️ წაიშალა პროდუქტი:', item);
        this.loadCart();
      },
      error: (err) => {
        console.error('❌ წაშლის შეცდომა:', err);
        alert('❌ ვერ წაიშალა პროდუქტი.');
      }
    });
  }
}
