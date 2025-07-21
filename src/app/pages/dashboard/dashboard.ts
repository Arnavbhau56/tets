import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { COUNTRIES } from '../../enums/countries';
import { STATUS_OPTIONS, TRACK_OPTIONS, SECTOR_OPTIONS, STATE_OPTIONS, GENDER_OPTIONS } from '../../enums/registration_options';
import { environment } from '../../../environments/environment';
import { ApiService } from '../../services/api.service';
import { ScrollTopDirective } from '../../directives/scroll-top.directive';

interface UserData {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  gender: string;
  country_code: string;
  contact_number: string;
  country: string;
  state: string;
  city: string;
  pin_code: string;
  current_professional_status: string;
  where_did_you_hear: string;
  referral_id: string;
  eureka_id: string;
  is_leader?: boolean;
}

interface IdeaData {
  id: number;
  idea_id: number;
  startup_name: string;
  eureka_id: string;
  sector_1: string;
  sector_2: string | null;
  sector_3: string | null;
  dpiit_registered: boolean;
  dpiit_recognition_number: string | null;
  any_other_organization: boolean;
  name_of_organization: string | null;
  registration_number_of_organization: string | null;
  idea_description: string;
  track: string;
  website_url: string | null;
  questionnaire_filled: boolean;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, ScrollTopDirective],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  showSubmissions: boolean = false;
  showTeamInfo: boolean = true;
  activeSection: string = 'team';

  // User data
  currentUser: UserData | null = null;
  userData: UserData[] = [];
  ideasData: IdeaData[] = [];

  // Modal states
  showMemberModal: boolean = false;
  showIdeaModal: boolean = false;
  showAddSubmissionModal: boolean = false;
  showAddTeamMemberModal: boolean = false;
  isEditingMember: boolean = false;
  isEditingIdea: boolean = false;
  selectedMember: UserData | null = null;
  selectedIdea: IdeaData | null = null;

  // Form data for editing
  editMemberData: Partial<UserData> = {};
  editIdeaData: Partial<IdeaData> = {};
  addSubmissionData: any = {
    startup_name: '',
    sector_1: '',
    sector_2: '',
    sector_3: '',
    dpiit_registered: '',
    dpiit_recognition_number: '',
    any_other_organization: '',
    name_of_organization: '',
    registration_number_of_organization: '',
    idea_description: '',
    track: '',
    website_url: '',
  };

  // Add Team Member Modal Data
  addTeamMemberSubmitted: boolean = false;
  addTeamMemberFormData: any = {
    email: '',
    first_name: ''
  };

  // Form validation
  addSubmissionSubmitted: boolean = false;

  // Dropdown options
  countries = COUNTRIES;
  statusOptions = STATUS_OPTIONS;
  trackOptions = TRACK_OPTIONS;
  sectorOptions = SECTOR_OPTIONS;
  stateOptions = STATE_OPTIONS;
  genderOptions = GENDER_OPTIONS;

  updates: any[] = [];

  constructor(private router: Router, private http: HttpClient, private apiService: ApiService) {
    if (!localStorage.getItem('authToken')) {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit() {
    // Show Swal if navigated from registration
    if ((window.history.state && window.history.state.showSkipSwal) || (history.state && history.state.showSkipSwal)) {
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
      // Optionally, clear the flag so it doesn't show again on reload
      if (window.history.replaceState) {
        const state = { ...window.history.state };
        delete state.showSkipSwal;
        window.history.replaceState(state, '');
      }
    }
    // Show Swal if navigated from login and questionnaire is not filled
    if ((window.history.state && window.history.state.showQuestionnaireSwalLogin) || (history.state && history.state.showQuestionnaireSwalLogin)) {
      // Only show if there is at least one idea and at least one idea has questionnaire_filled === false
      this.apiService.getDetails().subscribe({
        next: (res: any) => {
          const responseData = res.body || res;
          if (responseData.success && responseData.ideas_data && responseData.ideas_data.length > 0) {
            const pendingQuestionnaire = responseData.ideas_data.find((idea: any) => !idea.questionnaire_filled);
            if (pendingQuestionnaire) {
              Swal.fire({
                icon: 'warning',
                title: 'You need to fill the questionnaire',
                background: '#181f2a',
                color: '#fff',
                customClass: {
                  popup: 'swal2-poppins',
                  title: 'swal2-poppins',
                },
                confirmButtonText: 'OK'
              });
            }
          }
          if (window.history.replaceState) {
            const state = { ...window.history.state };
            delete state.showQuestionnaireSwalLogin;
            window.history.replaceState(state, '');
          }
        }
      });
    }

    // Check if we need to refresh data (e.g., coming from questionnaire)
    const shouldRefresh = (window.history.state && window.history.state.refreshData) || 
                         (history.state && history.state.refreshData) ||
                         localStorage.getItem('refreshDashboard') === 'true';
    
    if (shouldRefresh) {
      // Clear the refresh flags
      if (window.history.replaceState) {
        const state = { ...window.history.state };
        delete state.refreshData;
        window.history.replaceState(state, '');
      }
      localStorage.removeItem('refreshDashboard');
      
      // Force refresh the data
      setTimeout(() => {
        this.refreshDashboardData();
      }, 100);
    }

    this.loadDashboardData();
    // Fetch updates
    this.apiService.getUpdates().subscribe({
      next: (res: any) => {
        // If response is wrapped in body, unwrap
        const updates = res.body ? res.body : res;
        // Sort by order if present
        if (Array.isArray(updates)) {
          this.updates = updates.sort((a: { order: number }, b: { order: number }) => a.order - b.order);
        } else if (updates && Array.isArray(updates.updates)) {
          this.updates = updates.updates.sort((a: { order: number }, b: { order: number }) => a.order - b.order);
        } else {
          this.updates = [];
        }
      },
      error: (err) => {
        this.updates = [];
      }
    });
  }

  loadDashboardData() {
    // Fetch real data from API
    this.apiService.getDetails().subscribe({
      next: (res: any) => {
        const responseData = res.body || res;
        if (responseData.success) {
          this.currentUser = responseData.current_user_data;
          this.userData = responseData.user_data;
          this.ideasData = responseData.ideas_data;
          // Show swal if no ideas
          if (!this.ideasData || this.ideasData.length === 0) {
            Swal.fire({
              icon: 'warning',
              title: 'You still need to fill your idea submission.',
              background: '#181f2a',
              color: '#fff',
              customClass: {
                popup: 'swal2-poppins',
                title: 'swal2-poppins',
              },
              confirmButtonText: 'OK'
            });
          }
        } else {
          console.error('Failed to load dashboard data:', responseData.message);
        }
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        // Fallback to empty data
        this.currentUser = null;
        this.userData = [];
        this.ideasData = [];
      }
    });
  }

  // Helper method to refresh dashboard data
  refreshDashboardData(): Promise<void> {
    return new Promise((resolve) => {
      this.apiService.getDetails().subscribe({
        next: (res: any) => {
          const responseData = res.body || res;
          if (responseData.success) {
            this.currentUser = responseData.current_user_data;
            this.userData = responseData.user_data;
            this.ideasData = responseData.ideas_data;
          } else {
            console.error('Failed to load dashboard data:', responseData.message);
          }
          resolve();
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          // Fallback to empty data
          this.currentUser = null;
          this.userData = [];
          this.ideasData = [];
          resolve();
        }
      });
    });
  }

  // Helper method to get stored user email
  getStoredUserEmail(): string | null {
    return localStorage.getItem('userEmail');
  }

  showSubmissionSection() {
    this.showSubmissions = true;
    this.showTeamInfo = false;
    this.activeSection = 'submissions';
  }

  showTeamSection() {
    this.showSubmissions = false;
    this.showTeamInfo = true;
    this.activeSection = 'team';
  }

  scrollToSubmissions() {
    const element = document.getElementById('submissions');
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }

  // Team member functions
  showMemberDetails(member: UserData) {
    this.selectedMember = member;
    this.isEditingMember = false;
    this.showMemberModal = true;
  }

  editMember(member: UserData) {
    this.selectedMember = member;
    this.isEditingMember = true;
    this.editMemberData = { ...member };
    this.showMemberModal = true;
  }

  async deleteMember(member: UserData) {
    // Check if this is the last member
    if (this.userData.length === 1) {
      Swal.fire({
        title: 'Cannot Delete',
        text: 'At least one team member should be there',
        icon: 'warning',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'swal2-popup swal2-poppins swal2-dark-theme',
          title: 'swal2-title',
          confirmButton: 'swal2-confirm'
        }
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Delete Member',
      text: `Are you sure you want to delete ${member.first_name} ${member.last_name}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal2-popup swal2-poppins swal2-dark-theme',
        title: 'swal2-title',
        confirmButton: 'swal2-confirm',
        cancelButton: 'swal2-cancel'
      }
    });

    if (result.isConfirmed) {
      try {
        const response = await this.apiService.deleteTeamMember(member.email).toPromise();

        Swal.fire({
          title: 'Success',
          text: 'Member deleted successfully',
          icon: 'success',
          customClass: {
            popup: 'swal2-popup swal2-poppins swal2-dark-theme',
            title: 'swal2-title',
            confirmButton: 'swal2-confirm'
          }
        });

        // Refresh dashboard data
        this.refreshDashboardData().then(() => {
          this.closeMemberModal();
        });
      } catch (error: any) {
        let errorMessage = 'Failed to delete member';
        
        // Extract error message from API response
        if (error.error && error.error.error) {
          errorMessage = error.error.error;
        } else if (error.error && error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error && typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.message) {
          errorMessage = error.message;
        }

        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
          customClass: {
            popup: 'swal2-popup swal2-poppins swal2-dark-theme',
            title: 'swal2-title',
            confirmButton: 'swal2-confirm'
          }
        });
      }
    }
  }

  async updateMember() {
    if (!this.editMemberData) return;

    try {
      const response = await this.apiService.updateTeamMember(this.editMemberData).toPromise();

      Swal.fire({
        title: 'Success',
        text: 'Member updated successfully',
        icon: 'success',
        customClass: {
          popup: 'swal2-popup swal2-poppins swal2-dark-theme',
          title: 'swal2-title',
          confirmButton: 'swal2-confirm'
        }
      });

      // Refresh dashboard data
      this.refreshDashboardData().then(() => {
        this.closeMemberModal();
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to update member',
        icon: 'error',
        customClass: {
          popup: 'swal2-popup swal2-poppins swal2-dark-theme',
          title: 'swal2-title',
          confirmButton: 'swal2-confirm'
        }
      });
    }
  }

  closeMemberModal() {
    this.showMemberModal = false;
    this.selectedMember = null;
    this.isEditingMember = false;
    this.editMemberData = {};
  }

  // Idea functions
  showIdeaDetails(idea: IdeaData) {
    this.selectedIdea = idea;
    this.isEditingIdea = false;
    this.showIdeaModal = true;
  }

  editIdea(idea: IdeaData) {
    this.selectedIdea = idea;
    this.isEditingIdea = true;
    this.editIdeaData = { ...idea };
    this.showIdeaModal = true;
  }

  async deleteIdea(idea: IdeaData) {
    // Check if this is the last idea
    if (this.ideasData.length === 1) {
      Swal.fire({
        title: 'Cannot Delete',
        text: 'At least one idea should be there',
        icon: 'warning',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'swal2-popup swal2-poppins swal2-dark-theme',
          title: 'swal2-title',
          confirmButton: 'swal2-confirm'
        }
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Delete Idea',
      text: `Are you sure you want to delete "${idea.startup_name}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'swal2-popup swal2-poppins swal2-dark-theme',
        title: 'swal2-title',
        confirmButton: 'swal2-confirm',
        cancelButton: 'swal2-cancel'
      }
    });

    if (result.isConfirmed) {
      try {
        const response = await this.apiService.deleteIdea(idea.startup_name, idea.eureka_id, idea.id).toPromise();

        Swal.fire({
          title: 'Success',
          text: 'Idea deleted successfully',
          icon: 'success',
          customClass: {
            popup: 'swal2-popup swal2-poppins swal2-dark-theme',
            title: 'swal2-title',
            confirmButton: 'swal2-confirm'
          }
        });

        // Refresh dashboard data
        this.refreshDashboardData();
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to delete idea',
          icon: 'error',
          customClass: {
            popup: 'swal2-popup swal2-poppins swal2-dark-theme',
            title: 'swal2-title',
            confirmButton: 'swal2-confirm'
          }
        });
      }
    }
  }

  async updateIdea() {
    if (!this.editIdeaData) return;

    try {
      const response = await this.apiService.updateIdea(this.editIdeaData).toPromise();

      Swal.fire({
        title: 'Success',
        text: 'Idea updated successfully',
        icon: 'success',
        customClass: {
          popup: 'swal2-popup swal2-poppins swal2-dark-theme',
          title: 'swal2-title',
          confirmButton: 'swal2-confirm'
        }
      });

      // Refresh dashboard data
      this.refreshDashboardData().then(() => {
        this.closeIdeaModal();
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to update idea',
        icon: 'error',
        customClass: {
          popup: 'swal2-popup swal2-poppins swal2-dark-theme',
          title: 'swal2-title',
          confirmButton: 'swal2-confirm'
        }
      });
    }
  }

  closeIdeaModal() {
    this.showIdeaModal = false;
    this.selectedIdea = null;
    this.isEditingIdea = false;
    this.editIdeaData = {};
  }

  editQuestionnaire(idea: IdeaData) {
    console.log('Navigating to form with idea:', idea);
    this.router.navigate(['/form'], { state: { ideaName: idea.startup_name, ideaId: idea.idea_id, eurekaId: idea.eureka_id } });
  }

  // Add Submission Modal Methods
  showAddSubmission() {
    this.showAddSubmissionModal = true;
    this.resetAddSubmissionForm();
  }

  closeAddSubmissionModal() {
    this.showAddSubmissionModal = false;
    this.resetAddSubmissionForm();
  }

  resetAddSubmissionForm() {
    this.addSubmissionData = {
      startup_name: '',
      sector_1: '',
      sector_2: '',
      sector_3: '',
      dpiit_registered: '',
      dpiit_recognition_number: '',
      any_other_organization: '',
      name_of_organization: '',
      registration_number_of_organization: '',
      idea_description: '',
      track: '',
      website_url: '',
    };
    this.addSubmissionSubmitted = false;
  }

  validateAddSubmissionForm(): boolean {
    this.addSubmissionSubmitted = true;
    
    const requiredFields = [
      'startup_name', 'sector_1', 'sector_2', 'sector_3',
      'dpiit_registered', 'idea_description', 'track'
    ];

    for (const field of requiredFields) {
      if (!this.addSubmissionData[field]) {
        return false;
      }
    }

    // Conditional validation
    if (this.addSubmissionData.dpiit_registered === 'yes' && !this.addSubmissionData.dpiit_recognition_number) {
      return false;
    }

    if (this.addSubmissionData.dpiit_registered === 'no' && !this.addSubmissionData.any_other_organization) {
      return false;
    }

    if (this.addSubmissionData.any_other_organization === 'yes') {
      if (!this.addSubmissionData.name_of_organization || !this.addSubmissionData.registration_number_of_organization) {
        return false;
      }
    }

    return true;
  }

  async submitAddSubmission() {
    if (!this.validateAddSubmissionForm()) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please fill all required fields',
        icon: 'error',
        customClass: {
          popup: 'swal2-popup swal2-poppins swal2-dark-theme',
          title: 'swal2-title',
          confirmButton: 'swal2-confirm'
        }
      });
      return;
    }

    try {
      const submissionData = {
        ...this.addSubmissionData,
        eureka_id: this.currentUser?.eureka_id,
        questionnaire_filled: false
      };

      const response = await this.apiService.addIdea(submissionData).toPromise();
      const responseData = response?.body || response;

      console.log('Add Idea API Response:', responseData);
      console.log('Response data type:', typeof responseData);
      console.log('Response data keys:', responseData ? Object.keys(responseData) : 'No response data');

      // Refresh dashboard data first to get the updated idea with correct idea_id
      await this.refreshDashboardData();

      // Find the newly created idea by startup name
      let newlyCreatedIdea = this.ideasData.find(idea => 
        idea.startup_name === this.addSubmissionData.startup_name
      );

      console.log('Newly created idea found:', newlyCreatedIdea);
      
      // If not found immediately, wait a bit and refresh again
      if (!newlyCreatedIdea) {
        console.log('Idea not found immediately, waiting and refreshing again...');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
        await this.refreshDashboardData();
        newlyCreatedIdea = this.ideasData.find(idea => 
          idea.startup_name === this.addSubmissionData.startup_name
        );
        console.log('Newly created idea found after retry:', newlyCreatedIdea);
      }
      
      // Use the idea_id from the refreshed data
      const ideaId = newlyCreatedIdea?.idea_id;
      
      console.log('Using ideaId from refreshed data:', ideaId);
      
      if (!ideaId) {
        console.error('Could not find idea_id for newly created idea');
        Swal.fire({
          title: 'Error',
          text: 'Failed to get idea ID. Please try again.',
          icon: 'error',
          customClass: {
            popup: 'swal2-popup swal2-poppins swal2-dark-theme',
            title: 'swal2-title',
            confirmButton: 'swal2-confirm'
          }
        });
        return;
      }

      Swal.fire({
        title: 'Success',
        text: 'Idea submitted successfully!',
        icon: 'success',
        customClass: {
          popup: 'swal2-popup swal2-poppins swal2-dark-theme',
          title: 'swal2-title',
          confirmButton: 'swal2-confirm'
        },
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        // Redirect to questionnaire with the newly created idea
        this.router.navigate(['/form'], {
          state: {
            ideaName: this.addSubmissionData.startup_name,
            ideaId: ideaId
          },
          queryParams: {
            ideaName: this.addSubmissionData.startup_name,
            ideaId: ideaId
          }
        });
      });

      // Refresh dashboard data
      this.refreshDashboardData().then(() => {
        this.closeAddSubmissionModal();
      });
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to submit idea',
        icon: 'error',
        customClass: {
          popup: 'swal2-popup swal2-poppins swal2-dark-theme',
          title: 'swal2-title',
          confirmButton: 'swal2-confirm'
        }
      });
    }
  }

  // Helper methods for conditional fields
  onDpiitChange() {
    if (this.addSubmissionData.dpiit_registered === 'yes') {
      this.addSubmissionData.any_other_organization = '';
      this.addSubmissionData.name_of_organization = '';
      this.addSubmissionData.registration_number_of_organization = '';
    }
  }

  onOtherOrgChange() {
    if (this.addSubmissionData.any_other_organization === 'yes') {
      this.addSubmissionData.dpiit_recognition_number = '';
    }
  }

  // Helper functions
  getMemberName(member: UserData): string {
    return `${member.first_name} ${member.last_name}`;
  }

  getMemberContact(member: UserData): string {
    return `+${member.country_code} ${member.contact_number}`;
  }

  getIdeaStatus(idea: IdeaData): string {
    return idea.questionnaire_filled ? 'Questionnaire Submitted' : 'Questionnaire Pending';
  }

  getTotalMembers(): number {
    return this.userData.length;
  }

  getTotalIdeas(): number {
    return this.ideasData.length;
  }

  getPendingActions(): number {
    return this.ideasData.filter(idea => !idea.questionnaire_filled).length;
  }

  // Add Team Member Modal Methods
  showAddTeamMember() {
    this.showAddTeamMemberModal = true;
    this.resetAddTeamMemberForm();
  }

  closeAddTeamMemberModal() {
    this.showAddTeamMemberModal = false;
    this.resetAddTeamMemberForm();
  }

  resetAddTeamMemberForm() {
    this.addTeamMemberSubmitted = false;
    this.addTeamMemberFormData = {
      email: '',
      first_name: ''
    };
  }

  // Simplified Team Member Validation and Submission
  validateTeamMemberForm(): boolean {
    this.addTeamMemberSubmitted = true;
    
    const requiredFields = [
      'email', 'first_name'
    ];

    for (const field of requiredFields) {
      if (!this.addTeamMemberFormData[field]) {
        return false;
      }
    }

    return true;
  }

  async submitTeamMember() {
    if (!this.validateTeamMemberForm()) {
      Swal.fire({
        title: 'Validation Error',
        text: 'Please fill all required fields',
        icon: 'error',
        customClass: {
          popup: 'swal2-popup swal2-poppins swal2-dark-theme',
          title: 'swal2-title',
          confirmButton: 'swal2-confirm'
        }
      });
      return;
    }

    // Add the current user's name and email to the form data
    const currentUserName = this.currentUser ? 
      `${this.currentUser.first_name} ${this.currentUser.last_name}`.trim() : 
      'Unknown User';
    
    const currentUserEmail = this.currentUser ? 
      this.currentUser.email : 
      localStorage.getItem('userEmail') || 'Unknown Email';
    
    // Prepare final data with added_by and added_by_email
    const submitData = {
      ...this.addTeamMemberFormData,
      added_by: currentUserName,
      added_by_email: currentUserEmail
    };

    Swal.fire({
      title: 'Adding Team Member...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      customClass: {
        popup: 'swal2-popup swal2-poppins swal2-dark-theme',
        title: 'swal2-title'
      }
    });

    try {
      const response = await this.apiService.addTeamMember(submitData).toPromise();

      Swal.fire({
        title: 'Success',
        text: 'Team invite sent to the provided email.',
        icon: 'success',
        customClass: {
          popup: 'swal2-popup swal2-poppins swal2-dark-theme',
          title: 'swal2-title',
          confirmButton: 'swal2-confirm'
        }
      });

      // Refresh dashboard data
      this.refreshDashboardData().then(() => {
        this.closeAddTeamMemberModal();
      });
    } catch (error: any) {
      let errorMessage = 'Failed to add team member';
      let showCustomInfo = false;
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
        if (errorMessage === 'User with this email is already registered') {
          showCustomInfo = true;
        }
      } else if (error.error && error.error.error) {
        errorMessage = error.error.error;
        if (errorMessage === 'User with this email is already registered') {
          showCustomInfo = true;
        }
      } else if (error.error && typeof error.error === 'string') {
        errorMessage = error.error;
        if (errorMessage === 'User with this email is already registered') {
          showCustomInfo = true;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      if (showCustomInfo) {
        Swal.fire({
          icon: 'info',
          title: 'User is already registered',
          text: 'User is already registered, if you want to merge team contact E-Cell Team',
          customClass: {
            popup: 'swal2-popup swal2-poppins swal2-dark-theme',
            title: 'swal2-title',
            confirmButton: 'swal2-confirm'
          }
        });
      } else {
        Swal.fire({
          title: 'Error',
          text: errorMessage,
          icon: 'error',
          customClass: {
            popup: 'swal2-popup swal2-poppins swal2-dark-theme',
            title: 'swal2-title',
            confirmButton: 'swal2-confirm'
          }
        });
      }
    }
  }
}
