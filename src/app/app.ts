import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Header } from './common/header/header';
import { Footer } from './common/footer/footer';
import { ApiService } from './services/api.service';
import { ScrollService } from './services/scroll.service';
import Swal from 'sweetalert2';
import { SidebarComponent } from './pages/sidebar/sidebar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule, Header, Footer, SidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected title = 'Eureka';

  constructor(
    private apiService: ApiService,
    private scrollService: ScrollService
  ) {}

  ngOnInit() {
    this.checkQuestionnaireStatus();
  }

  checkQuestionnaireStatus() {
    // Only check if user is logged in
    if (localStorage.getItem('authToken')) {
      this.apiService.getDetails().subscribe({
        next: (res: any) => {
          const responseData = res.body || res;
          if (responseData.success && responseData.ideas_data) {
            // Check if any idea has questionnaire_filled: false
            const pendingQuestionnaire = responseData.ideas_data.find((idea: any) => !idea.questionnaire_filled);
            if (pendingQuestionnaire) {
              Swal.fire({
                title: 'Questionnaire Required',
                text: 'You need to fill the questionnaire',
                icon: 'warning',
                confirmButtonText: 'OK',
                customClass: {
                  popup: 'swal2-popup swal2-poppins swal2-dark-theme',
                  title: 'swal2-title',
                  confirmButton: 'swal2-confirm'
                }
              });
            }
          }
        },
        error: (error) => {
          console.error('Error checking questionnaire status:', error);
        }
      });
    }
  }
}
