import { Component, OnInit, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  user: any = null;
  theme: 'light' | 'dark' = 'light';

  oldPassword = '';
  newPassword = '';
  message = '';
  error = '';

  constructor(
    private router: Router,
    private renderer: Renderer2,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
      this.user.name =
        this.user.name || this.user.firstName || this.user.username || 'მომხმარებელი';
      this.user.email =
        this.user.email || this.user.emailAddress || '—';
      this.user.phone =
        this.user.phone || this.user.mobile || this.user.phoneNumber || '—';
    } else {
      alert('გთხოვთ გაიაროთ ავტორიზაცია.');
      this.router.navigate(['/login']);
    }

    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    this.theme = savedTheme || 'light';
    this.applyTheme();
  }

  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', this.theme);
    this.applyTheme();
  }

  private applyTheme() {
    if (this.theme === 'dark') {
      this.renderer.addClass(document.body, 'dark-theme');
    } else {
      this.renderer.removeClass(document.body, 'dark-theme');
    }
  }

  logout() {
    localStorage.removeItem('user');
    alert('თქვენ გახვედით ანგარიშიდან.');
    this.router.navigate(['/login']);
  }

  goHome() {
    this.router.navigate(['/catalog']);
  }

  // 🔐 პაროლის შეცვლა
  changePassword() {
    this.message = '';
    this.error = '';

    const token = localStorage.getItem('token');
    if (!token) {
      this.error = 'გთხოვთ, ჯერ შეხვიდეთ სისტემაში.';
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
          this.oldPassword = '';
          this.newPassword = '';
        },
        error: (err) => {
          this.error = err?.error?.message || 'შეცდომა პაროლის შეცვლისას.';
        },
      });
  }
}
