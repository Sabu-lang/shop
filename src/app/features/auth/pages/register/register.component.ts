import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class RegisterComponent {
  form = {
    firstName: '',
    lastName: '',
    age: 18,
    email: '',
    password: '',
    address: '',
    phone: '',
    zipcode: '',
    avatar: '',
    gender: 'MALE' as 'MALE' | 'FEMALE'
  };

  // 🔹 ახალი ველები template-ისთვის
  step: 'form' | 'verify' = 'form';
  verifyCode = '';
  loading = false;
  errorMsg = '';
  successMsg = '';

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.errorMsg = '';
    this.successMsg = '';

    // ავტომატურად დაამატე +995 თუ აკლია
    if (!this.form.phone.startsWith('+995')) {
      this.form.phone = `+995${this.form.phone}`;
    }

    // ავტომატური avatar თუ ცარიელია
    if (!this.form.avatar) {
      this.form.avatar = 'https://i.imgur.com/BohQiHi.jpg';
    }

    this.loading = true;

    this.auth.register(this.form).subscribe({
      next: () => {
        this.loading = false;
        this.successMsg = 'ვერიფიკაციის ბმული გამოგზავნილია ელ.ფოსტაზე.';
        // გადავდივართ ვერიფიკაციის საფეხურზე
        this.step = 'verify';
      },
      error: (err) => {
        this.loading = false;
        console.error('Register error:', err);
        this.errorMsg = 'რეგისტრაცია ვერ შესრულდა — გადაამოწმეთ მონაცემები.';
      }
    });
  }

  // 🔹 ვერიფიკაციის მეთოდი (შეგიძლია მერე API დაუკავშირო)
  verify() {
    if (!this.verifyCode.trim()) {
      this.errorMsg = 'გთხოვთ შეიყვანოთ ვერიფიკაციის კოდი.';
      return;
    }

    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      alert('✅ ვერიფიკაცია წარმატებით დასრულდა!');
      this.router.navigate(['/login']);
    }, 1500);
  }

  // 🔹 დაბრუნება ფორმაზე
  backToForm() {
    this.step = 'form';
  }
}
