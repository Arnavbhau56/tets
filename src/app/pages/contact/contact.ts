import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faYoutube,
  faLinkedin,
  faInstagram,
  faFacebook,
  faXTwitter,
  faWhatsapp
} from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { ApiService, FAQ } from '../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  imports: [FontAwesomeModule, CommonModule],
  templateUrl: './contact.html',
  styleUrl: './contact.css'
})

export class Contact implements OnInit {
    faYoutube = faYoutube;
    faLinkedin = faLinkedin;
    faInstagram = faInstagram;
    faFacebook = faFacebook;
    faXTwitter = faXTwitter;
    faEnvelope = faEnvelope;
    faWhatsapp = faWhatsapp;
  
    email = 'eureka';
    faqs: FAQ[] = [];
    loading = false;
    error = '';
  
    // Properties for accordion functionality
    expandedPanels: { [key: string]: boolean } = {};

    constructor(private apiService: ApiService) {}

    ngOnInit() {
      this.loadFAQs();
    }

    // Methods for accordion functionality
    toggleAccordion(panelId: string) {
      this.expandedPanels[panelId] = !this.expandedPanels[panelId];
    }

    isPanelExpanded(panelId: string): boolean {
      return this.expandedPanels[panelId] || false;
    }

    loadFAQs() {
      this.loading = true;
      this.error = '';
      
      this.apiService.getFAQs().subscribe({
        next: (data) => {
          this.faqs = data.sort((a, b) => a.order - b.order);
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to load FAQs';
          this.loading = false;
          console.error('Error loading FAQs:', err);
        }
      });
    }
}
