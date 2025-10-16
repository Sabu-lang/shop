import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from 'app/core/services/theme.service';
import { debounceTime, distinctUntilChanged, map, Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private auth = inject(AuthService);
  private themeService = inject(ThemeService);

  user: any = null;
  private sub = new Subscription();
  theme: 'light' | 'dark' = 'light';
  menuOpen = false;

  form = this.fb.group({
    q: [''],
    category: [''],
    brand: [''],
    priceMin: [''],
    priceMax: [''],
  });

  ngOnInit() {
    this.user = this.auth.getUser();
    this.theme = this.themeService.currentTheme;

    this.sub.add(this.auth.user$.subscribe((u: any) => (this.user = u)));

    this.sub.add(
      this.route.queryParamMap
        .pipe(
          map((p) => ({
            q: p.get('q') ?? '',
            category: p.get('category') ?? '',
            brand: p.get('brand') ?? '',
            priceMin: p.get('priceMin') ?? '',
            priceMax: p.get('priceMax') ?? '',
          }))
        )
        .subscribe((vals) => this.form.patchValue(vals, { emitEvent: false }))
    );

    this.sub.add(
      this.form.valueChanges
        .pipe(
          debounceTime(400),
          map((v) => JSON.stringify(v)),
          distinctUntilChanged(),
          map((s) => JSON.parse(s))
        )
        .subscribe((vals) => this.navigateWithFilters(vals))
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  onSearch() {
    this.navigateWithFilters(this.form.getRawValue());
    this.menuOpen = false;
  }

  resetFilters() {
    this.form.reset({
      q: '',
      category: '',
      brand: '',
      priceMin: '',
      priceMax: '',
    });
    this.navigateWithFilters({});
    this.menuOpen = false;
  }

  private navigateWithFilters(raw: any) {
    const qp: any = {};
    const cleaned = {
      q: (raw.q || '').trim(),
      category: raw.category || '',
      brand: raw.brand || '',
      priceMin: raw.priceMin || '',
      priceMax: raw.priceMax || '',
    };

    Object.entries(cleaned).forEach(([k, v]) => {
      if (v !== '' && v !== null && v !== undefined) {
        qp[k] = v;
      }
    });

    qp['page'] = 1;

    this.router.navigate(['/catalog'], {
      queryParams: qp,
      queryParamsHandling: 'merge',
    });
  }

  toggleTheme() {
    this.themeService.toggleTheme();
    this.theme = this.themeService.currentTheme;
  }

  goHome() {
    this.router.navigate(['/catalog']);
  }

  goAccount() {
    if (this.user) this.router.navigate(['/account']);
    else {
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
