import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  user: any = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      this.user = JSON.parse(savedUser);
    } else {
      alert('გთხოვთ გაიაროთ ავტორიზაცია.');
      this.router.navigate(['/login']);
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
}
