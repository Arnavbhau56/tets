import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { HttpResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { InteractiveGridPattern } from '../../components/interactive-grid/interactive-grid';
import { environment } from '../../../environments/environment';

declare var google: any;

@Component({
  selector: 'app-login',
  imports: [FormsModule, InteractiveGridPattern],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  email: string = '';
  password: string = '';
  private googleInitialized = false;

  constructor(private api: ApiService, private router: Router, private authService: AuthService) {}

  ngOnInit() {
    this.initializeGoogleSignIn();
  }

  private initializeGoogleSignIn() {
    if (this.googleInitialized) return;

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      try {
        console.log('Google Client ID:', environment.GOOGLE_CLIENT_ID);
        google.accounts.id.initialize({
          client_id: environment.GOOGLE_CLIENT_ID,
          callback: this.handleGoogleSignIn.bind(this),
          error_callback: this.handleGoogleSignInError.bind(this),
        });
        this.googleInitialized = true;
        const googleButton = document.getElementById('google-login-button');
        if (googleButton) {
          google.accounts.id.renderButton(
            googleButton,
            {
              theme: 'white',
              size: 'large',
              shape: 'rectangle',
              type: 'standard',
              text: 'signin_with',
              width: 250
            }
          );
        } else {
          console.error('Google login button element (#google-login-button) not found.');
        }
      } catch {
        Swal.fire('Error', 'Failed to initialize Google Sign-In', 'error');
      }
    };

    script.onerror = () => {
      Swal.fire('Error', 'Failed to load Google Sign-In script', 'error');
    };
  }

  onLogin() {
    Swal.fire({
      title: 'Logging in...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      background: '#181f2a',
      color: '#fff',
      customClass: {
        popup: 'swal2-poppins',
        title: 'swal2-poppins',
      }
    });
    this.api.login(this.email, this.password).subscribe({
      next: (res: HttpResponse<any>) => {
        Swal.close();
        if (res.status === 200 && res.body?.success) {
          // Use AuthService to handle login
          this.authService.login(res.body.access_token, res.body.email);
          // Check questionnaire status
          this.api.getDetails().subscribe({
            next: (detailsRes: any) => {
              const responseData = detailsRes.body || detailsRes;
              if (responseData.success && responseData.ideas_data) {
                const pendingQuestionnaire = responseData.ideas_data.find((idea: any) => !idea.questionnaire_filled);
                if (pendingQuestionnaire) {
                  this.router.navigate(['/dashboard'], { state: { showQuestionnaireSwalLogin: true } });
                  return;
                }
              }
              setTimeout(() => this.router.navigate(['/dashboard']), 1200);
            },
            error: () => {
              setTimeout(() => this.router.navigate(['/dashboard']), 1200);
            }
          });
        } else {
          this.showError('Login failed. Please check your credentials.');
        }
      },
      error: (err: any) => {
        Swal.close();
        this.showError('Login failed. Please check your credentials.');
      }
    });
  }

  onGoogleLogin() {
    Swal.fire('Google Login', 'Please use the Google button below to sign in.', 'info');
  }

  private handleGoogleSignIn(response: any) {
    if (!response || !response.credential) {
      Swal.fire('Error', 'Invalid Google Sign-In response', 'error');
      return;
    }

    Swal.fire({
      title: 'Logging in...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      background: '#181f2a',
      color: '#fff',
      customClass: {
        popup: 'swal2-poppins',
        title: 'swal2-poppins',
      }
    });

    this.api.googleLogin(response.credential).subscribe({
      next: (res: HttpResponse<any>) => {
        Swal.close();
        const responseBody = res.body || res;
        if (res.status === 200 && responseBody?.success) {
          // Use AuthService to handle login
          this.authService.login(responseBody.access_token, responseBody.email);
          // Check questionnaire status
          this.api.getDetails().subscribe({
            next: (detailsRes: any) => {
              const responseData = detailsRes.body || detailsRes;
              if (responseData.success && responseData.ideas_data) {
                const pendingQuestionnaire = responseData.ideas_data.find((idea: any) => !idea.questionnaire_filled);
                if (pendingQuestionnaire) {
                  this.router.navigate(['/dashboard'], { state: { showQuestionnaireSwalLogin: true } });
                  return;
                }
              }
              setTimeout(() => this.router.navigate(['/dashboard']), 1200);
            },
            error: () => {
              setTimeout(() => this.router.navigate(['/dashboard']), 1200);
            }
          });
        } else {
          this.showError(responseBody.error || 'Google login failed.');
        }
      },
      error: (err: any) => {
        Swal.close();
        let errorMessage = 'Google login failed.';
        if (err.error && err.error.error) {
          errorMessage = err.error.error;
        } else if (err.error && typeof err.error === 'string') {
          errorMessage = err.error;
        } else if (err.message) {
          errorMessage = err.message;
        }
        this.showError(errorMessage);
      }
    });
  }

  private handleGoogleSignInError(error: any) {
    console.error('Google login failed:', error);
    Swal.fire(
      'Login Failed',
      'Google Login failed. Please try again.',
      'error'
    );
  }

  showError(message: string) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      background: '#181f2a',
      color: '#fff',
      customClass: {
        popup: 'swal2-poppins',
        title: 'swal2-poppins',
      }
    });
  }

  onResetPassword() {
    this.router.navigate(['/reset']);
  }

  onRegister() {
    this.router.navigate(['/register']);
  }
}
