import { Component, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.scss'
})
export class App {
  collapsed = false;
  showSidebar = true;
  mobileMenuOpen = false;

  protected readonly title = signal('vitflow-frontend');

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        const u = this.router.url.toLowerCase();
        this.showSidebar = !(u.startsWith('/signin') || u.startsWith('/register'));
        if (!this.showSidebar) this.mobileMenuOpen = false;
      });
  }
}
