import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Review } from '../../../features/catalog/services/product.models';

@Component({
  selector: 'app-rating-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rating-modal.component.html',
  styleUrls: ['./rating-modal.component.scss']
})
export class RatingModalComponent {
  @Input() productId!: string;

  fullName: string = '';
  rating: number = 0;
  comment: string = '';

  // Submit event
  submit() {
    if (!this.rating || !this.fullName.trim()) {
      alert('გთხოვ შეავსო ყველა ველი 🌟');
      return;
    }

    const review: Review = {
      productId: this.productId,
      rating: this.rating,
      comment: this.comment,
      user: this.fullName,
      createdAt: new Date().toISOString()
    };

    console.log('⭐ გაგზავნილი შეფასება:', review);
    alert('მადლობა შეფასებისთვის 🌟');

    // ფორმის გასუფთავება
    this.fullName = '';
    this.rating = 0;
    this.comment = '';
  }
}
