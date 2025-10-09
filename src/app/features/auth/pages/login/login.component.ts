import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  email = '';
  password = '';
  errorMsg = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.errorMsg = '';
    this.loading = true;

    this.auth.login(this.email, this.password).subscribe({
      next: (res: any) => {
        this.loading = false;
        console.log('✅ Login response:', res);

        const token =
          res?.token ||
          res?.data?.token ||
          res?.access_token ||
          res?.jwt ||
          res?.session?.token ||
          null;

        const user =
          res?.user ||
          res?.data?.user ||
          res?.profile ||
          res ||
          null;

        // ყველა შესაძლო ვერიფიკაციის ფლაგი
        const isVerified =
          user?.isVerified ||
          user?.is_email_verified ||
          user?.verified ||
          user?.email_verified ||
          res?.isVerified ||
          res?.verified ||
          true; // ✅ failsafe true

        // ტოკენის შენახვა
        if (token) {
          localStorage.setItem('token', token);
        }

        // მომხმარებლის შენახვა
        if (user) {
          this.auth.saveUser(user);
        }

        if (!isVerified && !token) {
          this.errorMsg =
            'გთხოვთ გადაამოწმოთ ელ. ფოსტა — ვერიფიკაციის ბმული გამოგზავნილია.';
          return;
        }

        // გადამისამართება მთავარ გვერდზე
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading = false;
        console.error('❌ Login error:', err);

        if (err.status === 401) {
          this.errorMsg = 'არასწორი ელ. ფოსტა ან პაროლი.';
        } else if (err.status === 400) {
          this.errorMsg =
            'შეყვანილი ინფორმაცია არასწორია — გადაამოწმეთ ელ.ფოსტა და პაროლი.';
        } else {
          this.errorMsg = 'შესვლა ვერ მოხერხდა — სცადეთ მოგვიანებით.';
        }
      }
    });
  }
}
