import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Component, HostListener, OnInit, OnDestroy, ElementRef, ViewChildren, QueryList, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})

export class Header implements OnInit, OnDestroy, AfterViewInit {
  isLoggedIn = false;
  showMobileMenu = false;
  showProfileDropdown = false;
  scrolled = false;
  currentRoute = '';
  private routerSub!: Subscription;
  private authSub!: Subscription;
  private mouseX = 0;
  private hoveredItem: HTMLElement | null = null;

  @ViewChildren('navItem') navItems!: QueryList<ElementRef>;

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.checkLogin();
    this.authSub = this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });
    
    this.routerSub = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkLogin();
        this.currentRoute = event.url;
      }
    });
    window.addEventListener('storage', () => this.checkLogin());
  }

  ngAfterViewInit() {
    // No longer needed since we're using RouterLinkActive
  }

  ngOnDestroy() {
    if (this.routerSub) this.routerSub.unsubscribe();
    if (this.authSub) this.authSub.unsubscribe();
  }

  checkLogin() {
    this.isLoggedIn = this.authService.isLoggedIn;
  }

  logout() {
    this.authService.logout();
    this.showProfileDropdown = false;
    this.showMobileMenu = false;
  }

  toggleMobileMenu() {
    this.showMobileMenu = !this.showMobileMenu;
  }

  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
    this.showProfileDropdown = false;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.scrolled = window.scrollY > 0;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-dropdown')) {
      this.showProfileDropdown = false;
    }
  }

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.showProfileDropdown = false;
    }
  }

  // Floating Dock Mouse Tracking
  onMouseMove(event: MouseEvent) {
    this.mouseX = event.pageX;
    this.updateHoverEffects();
  }

  onMouseLeave() {
    this.mouseX = Infinity;
    this.resetHoverEffects();
  }

  onItemHover(element: EventTarget | null, title: string) {
    const el = element as HTMLElement;
    if (!el) return;
    this.hoveredItem = el;
    el.setAttribute('data-title', title);
    if (!el.classList.contains('active')) {
      el.classList.add('hovered');
    }
    this.updateHoverEffects();
  }

  onItemLeave(element: EventTarget | null) {
    const el = element as HTMLElement;
    if (!el) return;
    this.hoveredItem = null;
    el.classList.remove('hovered');
    this.resetHoverEffects();
  }

  private updateHoverEffects() {
    if (!this.navItems) return;

    this.navItems.forEach((itemRef, index) => {
      const element = itemRef.nativeElement;
      const rect = element.getBoundingClientRect();
      const centerX = rect.x + rect.width / 2;
      const distance = this.mouseX - centerX;
      
      // Calculate scale based on distance
      const scale = this.calculateScale(distance);
      const translateY = this.calculateTranslateY(distance);
      
      // Apply transforms
      element.style.transform = `scale(${scale}) translateY(${translateY}px)`;
      
      // Only apply background opacity if the item is not active
      if (!element.classList.contains('active')) {
        const opacity = this.calculateOpacity(distance);
        element.style.background = `rgba(255, 255, 255, ${opacity})`;
      }
    });
  }

  private resetHoverEffects() {
    if (!this.navItems) return;

    this.navItems.forEach((itemRef) => {
      const element = itemRef.nativeElement;
      element.style.transform = 'scale(1) translateY(0px)';
      
      // Only reset background if the item is not active
      if (!element.classList.contains('active')) {
        element.style.background = 'rgba(255, 255, 255, 0.05)';
      }
    });
  }

  private calculateScale(distance: number): number {
    const maxDistance = 150;
    const maxScale = 1.2;
    const minScale = 0.9;
    
    if (Math.abs(distance) > maxDistance) {
      return minScale;
    }
    
    const normalizedDistance = Math.abs(distance) / maxDistance;
    const scale = maxScale - (normalizedDistance * (maxScale - minScale));
    return Math.max(minScale, Math.min(maxScale, scale));
  }

  private calculateTranslateY(distance: number): number {
    const maxDistance = 150;
    const maxTranslate = -8;
    
    if (Math.abs(distance) > maxDistance) {
      return 0;
    }
    
    const normalizedDistance = Math.abs(distance) / maxDistance;
    return maxTranslate * (1 - normalizedDistance);
  }

  private calculateOpacity(distance: number): number {
    const maxDistance = 150;
    const maxOpacity = 0.15;
    const minOpacity = 0.05;
    
    if (Math.abs(distance) > maxDistance) {
      return minOpacity;
    }
    
    const normalizedDistance = Math.abs(distance) / maxDistance;
    const opacity = maxOpacity - (normalizedDistance * (maxOpacity - minOpacity));
    return Math.max(minOpacity, Math.min(maxOpacity, opacity));
  }
}
