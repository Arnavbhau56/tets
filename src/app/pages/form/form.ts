import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';

interface QuestionnaireItem {
  id: number;
  title: string;
  question: string;
  sample_answer: string;
}

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './form.html',
  styleUrl: './form.css'
})

export class Form implements OnInit {
  questionnaire: QuestionnaireItem[] = [];
  answers: { [id: string]: string } = {};
  showSampleModal: boolean = false;
  sampleModalContent: SafeHtml = '';
  loading: boolean = true;
  ideaName: string = '';
  ideaId: string | null = null;
  eurekaId: string = '';

  constructor(private api: ApiService, private router: Router, private sanitizer: DomSanitizer, private route: ActivatedRoute, private http: HttpClient) {
    this.ideaName = history.state.ideaName || '';
    this.ideaId = history.state.ideaId ? String(history.state.ideaId) : null;
    
    console.log('Form constructor - ideaId received:', this.ideaId);
    console.log('Form constructor - history.state:', history.state);
    
    // Check query parameters as fallback
    this.route.queryParams.subscribe(params => {
      if (!this.ideaName && params['ideaName']) {
        this.ideaName = params['ideaName'];
      }
      if (!this.ideaId && params['ideaId']) {
        this.ideaId = String(params['ideaId']);
        console.log('Form constructor - ideaId from query params:', this.ideaId);
      }
    });
  }

  ngOnInit() {
    // Fire questionnaire Swal if flag is present in navigation state
    if ((window.history.state && window.history.state.showQuestionnaireSwal) || (history.state && history.state.showQuestionnaireSwal) || (window.history.state && window.history.state.showQuestionnaireSwalLogin) || (history.state && history.state.showQuestionnaireSwalLogin)) {
      Swal.fire({
        icon: 'info',
        title: 'Filling of Questionnaire is compulsory but you can skip this for now.',
        background: '#181f2a',
        color: '#fff',
        customClass: {
          popup: 'swal2-poppins',
          title: 'swal2-poppins',
        },
        confirmButtonText: 'OK'
      });
      // Clear the flag so it doesn't show again on reload
      if (window.history.replaceState) {
        const state = { ...window.history.state };
        delete state.showQuestionnaireSwal;
        delete state.showQuestionnaireSwalLogin;
        window.history.replaceState(state, '');
      }
    }
    // If idea name is not available in state but ideaId is, try to fetch it
    if (!this.ideaName && this.ideaId) {
      this.fetchIdeaName();
    }
    
    // Fetch eureka_id from getDetails
    this.api.getDetails().subscribe({
      next: (res: any) => {
        const responseData = res.body || res;
        if (responseData.success && responseData.current_user_data) {
          this.eurekaId = responseData.current_user_data.eureka_id;
          // After eurekaId is set, fetch answers if ideaId is present
          if (this.ideaId && this.eurekaId) {
            this.api.getAnswer(this.ideaId, this.eurekaId).subscribe({
              next: (ans: any) => {
                const submission = (ans.body || ans).submission;
                for (let i = 1; i <= 9; i++) {
                  if (submission && submission[`answer${i}`] !== undefined) {
                    this.answers[String(i)] = submission[`answer${i}`];
                  }
                }
              },
              error: () => {
                // Silently handle error without showing alert
                console.log('Could not fetch saved answers.');
              }
            });
          }
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Could not fetch user details.',
            background: '#181f2a',
            color: '#fff',
            customClass: {
              popup: 'swal2-popup swal2-poppins swal2-dark-theme',
              title: 'swal2-title',
              confirmButton: 'swal2-confirm'
            }
          });
        }
      },
      error: () => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Could not fetch user details.',
          background: '#181f2a',
          color: '#fff',
          customClass: {
            popup: 'swal2-popup swal2-poppins swal2-dark-theme',
            title: 'swal2-title',
            confirmButton: 'swal2-confirm'
          }
        });
      }
    });
    // Fetch questionnaire
    this.api.getQuestionnaire().subscribe((res: any) => {
      let arr = Array.isArray(res) ? res : (res.body?.questions || res.questions || []);
      this.questionnaire = arr.map((q: any) => ({
        ...q,
        question: q.questions
      })).sort((a: any, b: any) => a.id - b.id);
      this.loading = false;
    }, () => { this.loading = false; });
  }

  fetchIdeaName() {
    // Try to get idea name from the dashboard data
    this.api.getDetails().subscribe({
      next: (res: any) => {
        const responseData = res.body || res;
        if (responseData.success && responseData.ideas_data) {
          const idea = responseData.ideas_data.find((idea: any) => 
            String(idea.idea_id) === this.ideaId || String(idea.id) === this.ideaId
          );
          if (idea) {
            this.ideaName = idea.startup_name;
          }
        }
      },
      error: (err) => {
        console.log('Error fetching idea name:', err);
      }
    });
  }

  openSampleModal(sample: string) {
    this.sampleModalContent = this.sanitizer.bypassSecurityTrustHtml(sample);
    this.showSampleModal = true;
  }

  closeSampleModal() {
    this.showSampleModal = false;
    this.sampleModalContent = this.sanitizer.bypassSecurityTrustHtml('');
  }

  saveProgress(questionId: number) {
    if (!this.ideaId || !this.eurekaId) {
      if (!this.ideaId) {
        console.error('Missing ideaId');
      }
      if (!this.eurekaId) {
        console.error('Missing eurekaId');
      }
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Missing idea or user information.',
        background: '#181f2a',
        color: '#fff',
        customClass: {
          popup: 'swal2-popup swal2-poppins swal2-dark-theme',
          title: 'swal2-title',
          confirmButton: 'swal2-confirm'
        }
      });
      return;
    }
    
    const answer = this.answers[String(questionId)] || '';
    
    // Check if answer is empty or only contains whitespace
    if (!answer.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Empty Answer',
        text: 'Question must be filled before saving.',
        background: '#181f2a',
        color: '#fff',
        customClass: {
          popup: 'swal2-popup swal2-poppins swal2-dark-theme',
          title: 'swal2-title',
          confirmButton: 'swal2-confirm'
        }
      });
      return;
    }
    
    const saveData = {
      question_id: Number(questionId),
      answer,
      idea_id: this.ideaId,
      eureka_id: this.eurekaId
    };
    
    console.log('Saving progress with data:', saveData);
    
    this.api.saveProgress(saveData).subscribe({
      next: () => {
        // Set flag to refresh dashboard data
        localStorage.setItem('refreshDashboard', 'true');
        
        Swal.fire({
          icon: 'success',
          title: 'Progress Saved',
          background: '#181f2a',
          color: '#fff',
          customClass: {
            popup: 'swal2-popup swal2-poppins swal2-dark-theme',
            title: 'swal2-title',
            confirmButton: 'swal2-confirm'
          },
          timer: 1200,
          showConfirmButton: false
        });
      },
      error: () => Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save progress.',
        background: '#181f2a',
        color: '#fff',
        customClass: {
          popup: 'swal2-popup swal2-poppins swal2-dark-theme',
          title: 'swal2-title',
          confirmButton: 'swal2-confirm'
        }
      })
    });
  }

  submitAll() {
    console.log('ideaId:', this.ideaId, 'eurekaId:', this.eurekaId);

    // Validation: Ensure all questions are answered
    const unanswered = this.questionnaire.filter(q => {
      const ans = (this.answers[String(q.id)] || '').trim();
      return !ans;
    });

    if (unanswered.length > 0) {
      Swal.fire({
        icon: 'error',
        title: 'Incomplete',
        text: 'Please answer all questions before submitting.',
        background: '#181f2a',
        color: '#fff',
        customClass: {
          popup: 'swal2-popup swal2-poppins swal2-dark-theme',
          title: 'swal2-title',
          confirmButton: 'swal2-confirm'
        }
      });
      return;
    }

    if (!this.ideaId || !this.eurekaId) {
      if (!this.ideaId) {
        console.error('Missing ideaId');
      }
      if (!this.eurekaId) {
        console.error('Missing eurekaId');
      }
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Missing idea or user information.',
        background: '#181f2a',
        color: '#fff',
        customClass: {
          popup: 'swal2-popup swal2-poppins swal2-dark-theme',
          title: 'swal2-title',
          confirmButton: 'swal2-confirm'
        }
      });
      return;
    }
    const payload: any = {
      idea_id: this.ideaId,
      eureka_id: this.eurekaId
    };
    for (const q of this.questionnaire) {
      payload[`answer_${q.id}`] = this.answers[String(q.id)] || '';
    }
    
    console.log('Submitting questionnaire with payload:', payload);
    
    this.api.submitQuestionnaire(payload).subscribe({
      next: () => {
        // Set flag to refresh dashboard data
        localStorage.setItem('refreshDashboard', 'true');
        // Also send to external endpoint (no auth header)
        this.http.post(
          'https://jhtnruktmtjqrfoiyrep.supabase.co/functions/v1/submit-and-analyze-eureka-form',
          payload,
          { headers: { 'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpodG5ydWt0bXRqcXJmb2l5cmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NTczMzksImV4cCI6MjA1NzMzMzMzOX0._HZzAtVcTH_cdXZoxIeERNYqS6_hFEjcWbgHK3vxQBY'
           } }
        ).subscribe({
          // No-op for success/failure, do not block UI
        });
        Swal.fire({
          icon: 'success',
          title: 'Submitted!',
          text: 'Questionnaire submitted successfully!',
          background: '#181f2a',
          color: '#fff',
          customClass: {
            popup: 'swal2-popup swal2-poppins swal2-dark-theme',
            title: 'swal2-title',
            confirmButton: 'swal2-confirm'
          },
          timer: 2000,
          showConfirmButton: false
        }).then(() => {
          // Redirect to dashboard after successful submission
          this.router.navigate(['/dashboard'], { state: { refreshData: true } });
        });
      },
      error: () => {
        // Also send to external endpoint (no auth header) even on error
        this.http.post(
          'https://jhtnruktmtjqrfoiyrep.supabase.co/functions/v1/submit-and-analyze-eureka-form',
          payload,
          { headers: { 'Content-Type': 'application/json',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpodG5ydWt0bXRqcXJmb2l5cmVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NTczMzksImV4cCI6MjA1NzMzMzMzOX0._HZzAtVcTH_cdXZoxIeERNYqS6_hFEjcWbgHK3vxQBY'
           },
             }
        ).subscribe({
          // No-op for success/failure, do not block UI
        });
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to submit questionnaire.',
          background: '#181f2a',
          color: '#fff',
          customClass: {
            popup: 'swal2-popup swal2-poppins swal2-dark-theme',
            title: 'swal2-title',
            confirmButton: 'swal2-confirm'
          }
        });
      }
    });
  }

  skipForNow() {
    Swal.fire({
      icon: 'warning',
      title: 'Skip Questionnaire',
      text: 'Filling out the questionnaire is mandatory to complete your submission. Failure to do so before the deadline may lead to disqualification of your team.',
      background: '#181f2a',
      color: '#fff',
      customClass: {
        popup: 'swal2-popup swal2-poppins swal2-dark-theme',
        title: 'swal2-title',
        confirmButton: 'swal2-confirm',
        cancelButton: 'swal2-cancel'
      },
      showCancelButton: true,
      confirmButtonText: 'Yes, Skip',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Redirect to dashboard
        this.router.navigate(['/dashboard'], { state: { refreshData: true } });
      }
    });
  }
}
