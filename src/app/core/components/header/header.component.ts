import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // ✅ IMPORT FIXED

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  q: string = '';
  user: any = null;

  constructor(private router: Router, private auth: AuthService) {}

  ngOnInit() {
    this.user = this.auth.getUser();

    this.auth.user$.subscribe((u: any) => {
      this.user = u;
      console.log('🔄 Header განახლდა:', u);
    });
  }

  onSearch() {
    const query = this.q.trim();
    if (query.length > 0) {
      this.router.navigate(['/catalog'], { queryParams: { q: query } });
    } else {
      this.router.navigate(['/catalog']);
    }
  }

  resetFilters() {
    this.q = '';
    this.router.navigate(['/catalog'], { queryParams: {} });
  }

  goHome() {
    this.router.navigate(['/catalog']);
  }

  goAccount() {
    if (this.user) {
      this.router.navigate(['/account']);
    } else {
      alert('გთხოვთ გაიაროთ ავტორიზაცია.');
      this.router.navigate(['/login']);
    }
  }

  goCart() {
    if (!this.user) {
      alert('კალათაში შესასვლელად გთხოვთ გაიაროთ ავტორიზაცია.');
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/cart']);
  }

  goLogin() {
    this.router.navigate(['/login']);
  }

  goRegister() {
    this.router.navigate(['/register']);
  }

  logout() {
    this.auth.logout();
    this.user = null;
    alert('თქვენ გახვედით ანგარიშიდან.');
    this.router.navigate(['/login']);
  }
}
