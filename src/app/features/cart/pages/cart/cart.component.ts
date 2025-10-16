import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss'],
})
export class CartComponent {
  private cartService = inject(CartService);
  private router = inject(Router);

  items: CartItem[] = [];
  totalPrice = 0;
  totalQuantity = 0;
  loading = false;

  ngOnInit() {
    this.loadCart();
  }

  loadCart() {
    this.loading = true;
    this.cartService.getCart().subscribe({
      next: (res: any) => {
        console.log('🧾 სრული კალათა:', res);

        const items = res.products?.length ? res.products : res.items ?? [];

        this.items = items.map((i: any) => {
          const product = i.product ?? i;

          const price = product.price?.current ?? product.price ?? 0;
          const quantity = i.quantity ?? 1;
          const subtotal = i.subtotal ?? price * quantity;

          return {
            id: product._id ?? i._id ?? i.id ?? '',
            title: product.title ?? 'პროდუქტი',
            price,
            quantity,
            subtotal,
            image:
              product.thumbnail ??
              product.image ??
              (Array.isArray(product.images)
                ? product.images.find((img: string) => !!img)
                : 'https://placehold.co/200x200?text=No+Image'),
          };
        });

        this.totalQuantity =
          res.total?.quantity ??
          this.items.reduce((a, b) => a + (b.quantity ?? 0), 0);

        this.totalPrice =
          res.total?.price?.current ??
          this.items.reduce((a, b) => a + (b.subtotal ?? 0), 0);

        this.loading = false;
      },
      error: (err) => {
        console.error('❌ კალათის წამოღების შეცდომა:', err);
        this.loading = false;
        this.items = [];
        this.totalPrice = 0;
        this.totalQuantity = 0;
      },
    });
  }

  increase(item: CartItem) {
    const newQty = item.quantity + 1;
    this.cartService.updateProduct(item.id, newQty).subscribe({
      next: () => this.loadCart(),
      error: (err) => console.error('❌ რაოდენობის შეცდომა:', err),
    });
  }

  decrease(item: CartItem) {
    if (item.quantity <= 1) {
      this.remove(item);
      return;
    }
    const newQty = item.quantity - 1;
    this.cartService.updateProduct(item.id, newQty).subscribe({
      next: () => this.loadCart(),
      error: (err) => console.error('❌ შემცირების შეცდომა:', err),
    });
  }

  remove(item: CartItem) {
    if (!confirm(`წავშალო "${item.title}" კალათიდან?`)) return;
    this.cartService.removeProduct(item.id).subscribe({
      next: () => {
        alert(`"${item.title}" წაიშალა კალათიდან 🗑️`);
        this.loadCart();
      },
      error: (err) => console.error('❌ წაშლის შეცდომა:', err),
    });
  }

  // ✅ გადახდის გვერდზე გადასვლა
  goToPayment() {
    if (!this.items.length) {
      alert('გადახდისთვის კალათა ცარიელია 🛒');
      return;
    }

    console.log('➡ გადახდის გვერდზე გადამისამართება...');
    this.router.navigate(['/payment']);
  }
}
