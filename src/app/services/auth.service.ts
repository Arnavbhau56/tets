import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private router: Router) {
    this.checkAuthStatus();
  }

  checkAuthStatus(): boolean {
    const token = localStorage.getItem('authToken');
    const userEmail = localStorage.getItem('userEmail');
    
    // Check if both token and userEmail exist and token is not empty
    const isLoggedIn = !!(token && userEmail && token.trim() !== '');
    this.isLoggedInSubject.next(isLoggedIn);
    return isLoggedIn;
  }

  get isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/']);
  }

  login(token: string, email: string): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userEmail', email);
    this.isLoggedInSubject.next(true);
  }
} 