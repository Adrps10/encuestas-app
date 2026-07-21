import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'encuestas-app';

  constructor(private router: Router) {}

  isPublicRoute(): boolean {
    const url = this.router.url;
    return url.includes('/login') || url.includes('/responder');
  }

  logout() {
    localStorage.removeItem('isLoggedIn');
    this.router.navigate(['/login']);
  }

  onLogoError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
    const parent = img.parentElement;
    if (parent) {
      const text = document.createElement('span');
      text.style.cssText = 'font-size: 1.2rem; font-weight: 700; color: white; letter-spacing: 2px;';
      text.textContent = 'INMO';
      parent.appendChild(text);
    }
  }
}