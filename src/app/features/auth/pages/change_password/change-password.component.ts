import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-change-password',
  standalone: true,
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
  imports: [CommonModule, FormsModule],
})
export class ChangePasswordComponent {
  oldPassword = '';
  newPassword = '';
  message = '';
  error = '';
  loading = false;

  constructor(private http: HttpClient) {}

  changePassword() {
    this.message = '';
    this.error = '';
    this.loading = true;

    const token = localStorage.getItem('token');
    if (!token) {
      this.error = 'გთხოვთ, ჯერ შეხვიდეთ სისტემაში.';
      this.loading = false;
      return;
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    });

    const body = {
      oldPassword: this.oldPassword,
      newPassword: this.newPassword,
    };

    this.http
      .patch('https://api.everrest.educata.dev/auth/change_password', body, { headers })
      .subscribe({
        next: () => {
          this.message = 'პაროლი წარმატებით შეიცვალა ✅';
          this.loading = false;
        },
        error: (err) => {
          this.error = err?.error?.message || 'შეცდომა პაროლის შეცვლისას.';
          this.loading = false;
        },
      });
  }
}
