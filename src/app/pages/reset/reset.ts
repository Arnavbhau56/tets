import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { InteractiveGridPattern } from '../../components/interactive-grid/interactive-grid';

@Component({
  selector: 'app-reset',
  imports: [FormsModule, CommonModule, InteractiveGridPattern],
  templateUrl: './reset.html',
  styleUrl: './reset.css'
})

export class Reset {
  email: string = '';
  otp: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  otpSent: boolean = false;
  timer: number = 0;
  timerInterval: any = null;
  showResend: boolean = false;

  constructor(private api: ApiService, private router: Router) {}

  sendOtp() {
    if (!this.email) {
      this.showError('Please enter your email.');
      return;
    }
    Swal.fire({
      title: 'Sending OTP...',
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
    this.api.sendOtp(this.email).subscribe({
      next: (res: any) => {
        Swal.close();
        // Extract the response body since we're using observe: 'response'
        const responseBody = res.body || res;
        
        // Handle both boolean and string success values
        if (responseBody.success === true || responseBody.success === 'true') {
          Swal.fire({
            icon: 'success',
            title: 'OTP Sent',
            text: responseBody.message || 'Check your email for the OTP.',
            background: '#181f2a',
            color: '#fff',
            customClass: {
              popup: 'swal2-poppins',
              title: 'swal2-poppins',
            },
            timer: 1500,
            showConfirmButton: false
          });
          this.otpSent = true;
          this.startTimer();
        } else {
          this.showError(responseBody.error || 'Failed to send OTP.');
        }
      },
      error: (err: any) => {
        Swal.close();
        let errorMessage = 'Failed to send OTP.';
        
        // Handle different error response formats
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

  startTimer() {
    this.timer = 30;
    this.showResend = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.timerInterval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        clearInterval(this.timerInterval);
        this.showResend = true;
      }
    }, 1000);
  }

  resendOtp() {
    this.sendOtp();
    this.startTimer();
  }

  resetPassword() {
    if (!this.otp || !this.newPassword || !this.confirmPassword) {
      this.showError('Please fill all fields.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.showError('Passwords do not match.');
      return;
    }
    Swal.fire({
      title: 'Resetting Password...',
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
    this.api.resetPassword(this.email, this.otp, this.newPassword).subscribe({
      next: (res: any) => {
        Swal.close();
        // Extract the response body since we're using observe: 'response'
        const responseBody = res.body || res;
        
        if (responseBody.success === true || responseBody.success === 'true') {
          Swal.fire({
            icon: 'success',
            title: 'Password Reset',
            text: responseBody.message || 'Your password has been reset successfully.',
            background: '#181f2a',
            color: '#fff',
            customClass: {
              popup: 'swal2-poppins',
              title: 'swal2-poppins',
            },
            timer: 1500,
            showConfirmButton: false
          });
          setTimeout(() => this.router.navigate(['/login']), 1500);
        } else {
          this.showError(responseBody.error || 'Failed to reset password.');
        }
      },
      error: (err: any) => {
        Swal.close();
        let errorMessage = 'Failed to reset password.';
        
        // Handle different error response formats
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
}
