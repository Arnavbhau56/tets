import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PastWinner {
  id: number;
  name: string;
  logo: string;
  description: string;
  order: number;
}

export interface Incentive {
  id: number;
  order: number;
  image: string;
  title: string;
  info: string;
  link: string;
}

export interface Sponsor {
  id: number;
  order: number;
  title: string;
  image: string;
  link: string;
}

export interface Associate {
  id: number;
  order: number;
  type: string;
  image: string;
  link: string;
}

export interface OutreachPartner {
  id: number;
  order: number;
  type: string;
  image: string;
  link: string;
}

export interface Track {
  order: number;
  title: string;
  image: string;
  sponsor: string;
  cash: string;
  info: string;
  eligibility: string;
}

export interface Media {
  order: number;
  link: string;
  image: string;
  paper: string;
  info: string;
}

export interface GalleryItem {
  image: string;
  text: string;
}

export interface Rule {
  id: number;
  order: number;
  type: 'general' | 'pan' | 'questionnaire';
  content: string;
}

export interface FAQ {
  id: number;
  order: number;
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://apiserver.ecell.in/emn';

  constructor(private http: HttpClient) { }

  getPastWinners(): Observable<PastWinner[]> {
    return this.http.get<PastWinner[]>(`${this.baseUrl}/past-winners/`);
  }

  getIncentives(): Observable<Incentive[]> {
    return this.http.get<Incentive[]>(`${environment.BASE_URL}/get/incentives/`);
  }

  getSponsors(): Observable<Sponsor[]> {
    return this.http.get<Sponsor[]>(`${environment.BASE_URL}/get/sponsors/`);
  }

  getAssociates(): Observable<Associate[]> {
    return this.http.get<Associate[]>(`${environment.BASE_URL}/get/associates/`);
  }

  getOutreachPartners(): Observable<OutreachPartner[]> {
    return this.http.get<OutreachPartner[]>(`${environment.BASE_URL}/get/outreach/`);
  }

  getTracks(): Observable<Track[]> {
    return this.http.get<Track[]>(`${environment.BASE_URL}/get/tracks/`);
  }

  getMedia(): Observable<Media[]> {
    return this.http.get<Media[]>(`${environment.BASE_URL}/get/media/`);
  }

  getGallery(): Observable<GalleryItem[]> {
    return this.http.get<GalleryItem[]>(`${environment.BASE_URL}/get/gallery/`);
  }

  getRules(): Observable<Rule[]> {
    return this.http.get<Rule[]>(`${environment.BASE_URL}/get/rules/`);
  }

  getFAQs(): Observable<FAQ[]> {
    return this.http.get<FAQ[]>(`${environment.BASE_URL}/get-faq/`);
  }

  getTestimonials(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.BASE_URL}/get/testimonial/`);
  }

  getSponsorTestimonials(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.BASE_URL}/get/marketing_testimonial/`);
  }

  login(email: string, password: string) {
    return this.http.post(`${environment.BASE_URL}/login/`, { email, password }, { observe: 'response' });
  }

  googleLogin(token: string) {
    return this.http.post(`${environment.BASE_URL}/google-login/`, { token }, { observe: 'response' });
  }

  sendOtp(email: string) {
    return this.http.post(`${environment.BASE_URL}/send-reset-otp/`, { email }, { observe: 'response' });
  }

  resetPassword(email: string, otp: string, password: string) {
    return this.http.post(`${environment.BASE_URL}/reset/`, { email, otp, password }, { observe: 'response' });
  }

  // Registration methods
  sendRegOtp(email: string) {
    return this.http.post(`${environment.BASE_URL}/send-reg-otp/`, { email }, { observe: 'response' });
  }

  verifyRegOtp(email: string, otp: string) {
    return this.http.post(`${environment.BASE_URL}/verify-reg-otp/`, { email, otp }, { observe: 'response' });
  }

  register(data: any) {
    return this.http.post(`${environment.BASE_URL}/reg/`, data, { observe: 'response' });
  }

  getPincodeDetails(pincode: string) {
    return this.http.get(`https://api.postalpincode.in/pincode/${pincode}`);
  }

  getReferralOptions() {
    return this.http.get(`${environment.BASE_URL}/name/`);
  }

  getVentureCapitalist() {
    return this.http.get(`${environment.BASE_URL}/venturecapitalist/`);
  }

  getTie() {
    return this.http.get(`${environment.BASE_URL}/tie/`);
  }

  getGovernment() {
    return this.http.get(`${environment.BASE_URL}/government/`);
  }

  getIncubationPartner() {
    return this.http.get(`${environment.BASE_URL}/incubation-partner/`);
  }

  // Team management methods
  updateTeamMember(data: any) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    });
    return this.http.post(`${environment.BASE_URL}/team-update/`, data, { headers, observe: 'response' });
  }

  deleteTeamMember(email: string) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    });
    return this.http.post(`${environment.BASE_URL}/team-delete/`, { email }, { headers, observe: 'response' });
  }

  // Idea management methods
  updateIdea(data: any) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    });
    return this.http.post(`${environment.BASE_URL}/idea-update/`, data, { headers, observe: 'response' });
  }

  deleteIdea(startupName: string, eurekaId: string, ideaId: number) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    });
    return this.http.post(`${environment.BASE_URL}/delete-idea/`, { 
      startup_name: startupName, 
      eureka_id: eurekaId,
      idea_id: ideaId
    }, { headers, observe: 'response' });
  }

  addIdea(data: any) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    });
    return this.http.post(`${environment.BASE_URL}/add-idea/`, data, { headers, observe: 'response' });
  }

  addTeamMember(data: any) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    });
    return this.http.post(`${environment.BASE_URL}/invite-team-member/`, data, { headers, observe: 'response' });
  }

  getDetails() {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    });
    return this.http.get(`${environment.BASE_URL}/get-detail/`, { headers, observe: 'response' });
  }

  getQuestionnaire() {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    });
    return this.http.get(`${environment.BASE_URL}/get-questionnaire/`, { headers });
  }

  saveProgress(data: { question_id: number; answer: string; idea_id: string; eureka_id: string }) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    });
    return this.http.post(`${environment.BASE_URL}/save-progress/`, data, { headers });
  }

  submitQuestionnaire(data: any) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    });
    return this.http.post(`${environment.BASE_URL}/submit-questionnaire/`, data, { headers });
  }

  getAnswer(idea_id: string, eureka_id: string) {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    });
    return this.http.post(`${environment.BASE_URL}/get-answer/`, { idea_id, eureka_id }, { headers });
  }

  // Fetch dashboard updates
  getUpdates() {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`
    });
    return this.http.get(`${environment.BASE_URL}/get-update/`, { headers });
  }
}
