import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Sponsor, Associate, OutreachPartner } from '../../services/api.service';
import { AnimatedTestimonials } from '../../components/animated-testimonials/animated-testimonials';

@Component({
  selector: 'app-sponsor',
  imports: [CommonModule, AnimatedTestimonials],
  templateUrl: './sponsor.html',
  styleUrl: './sponsor.css'
})

export class SponsorComponent implements OnInit {
  activeTab: 'sponsors' | 'associates' | 'outreach' = 'sponsors';
  
  sponsors: Sponsor[] = [];
  associates: Associate[] = [];
  outreachPartners: OutreachPartner[] = [];
  
  loading = false;
  error = '';

  sponsorTestimonials: any[] = [];
  formattedSponsorTestimonials: any[] = [];

  firstRowSponsors: Sponsor[] = [];
  secondRowSponsors: Sponsor[] = [];
  thirdRowSponsors: Sponsor[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadSponsors();
  }

  loadSponsors() {
    this.activeTab = 'sponsors';
    this.loading = true;
    this.error = '';
    
    this.apiService.getSponsors().subscribe({
      next: (data) => {
        this.sponsors = this.arrangeSponsors(data);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load sponsors';
        this.loading = false;
        console.error('Error loading sponsors:', err);
      }
    });
    // Fetch sponsor testimonials
    this.apiService.getSponsorTestimonials().subscribe({
      next: (data) => {
        this.sponsorTestimonials = data;
        this.formatSponsorTestimonials();
      },
      error: (err) => {
        console.error('Error loading sponsor testimonials:', err);
      }
    });
  }

  private arrangeSponsors(sponsors: Sponsor[]): Sponsor[] {
    // Sort sponsors by order first
    const sortedSponsors = sponsors.sort((a, b) => a.order - b.order);
    
    // Find sponsors with order 1 and 2
    const order1Sponsor = sortedSponsors.find(s => s.order === 1);
    const order2Sponsor = sortedSponsors.find(s => s.order === 2);
    
    // Get all other sponsors (excluding order 1 and 2)
    const otherSponsors = sortedSponsors.filter(s => s.order !== 1 && s.order !== 2);
    
    // Create first row: only order 1 sponsor
    const firstRow: Sponsor[] = [];
    if (order1Sponsor) {
      firstRow.push(order1Sponsor);
    }
    
    // Create second row: only order 2 sponsor
    const secondRow: Sponsor[] = [];
    if (order2Sponsor) {
      secondRow.push(order2Sponsor);
    }
    
    // Create third row: all other sponsors
    const thirdRow: Sponsor[] = [...otherSponsors];
    
    // Store the arranged sponsors
    this.firstRowSponsors = firstRow;
    this.secondRowSponsors = secondRow;
    this.thirdRowSponsors = thirdRow;
    
    // Combine all rows
    return [...firstRow, ...secondRow, ...thirdRow];
  }

  getFirstRowSponsors(): Sponsor[] {
    return this.firstRowSponsors || [];
  }

  getSecondRowSponsors(): Sponsor[] {
    return this.secondRowSponsors || [];
  }

  getThirdRowSponsors(): Sponsor[] {
    return this.thirdRowSponsors || [];
  }

  loadAssociates() {
    this.activeTab = 'associates';
    this.loading = true;
    this.error = '';
    
    this.apiService.getAssociates().subscribe({
      next: (data) => {
        this.associates = data.sort((a, b) => a.order - b.order);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load associates';
        this.loading = false;
        console.error('Error loading associates:', err);
      }
    });
  }

  loadOutreachPartners() {
    this.activeTab = 'outreach';
    this.loading = true;
    this.error = '';
    
    this.apiService.getOutreachPartners().subscribe({
      next: (data) => {
        this.outreachPartners = data.sort((a, b) => a.order - b.order);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load outreach partners';
        this.loading = false;
        console.error('Error loading outreach partners:', err);
      }
    });
  }

  getAssociatesByType(type: string): Associate[] {
    return this.associates.filter(associate => associate.type === type);
  }

  getOutreachPartnersByType(type: string): OutreachPartner[] {
    return this.outreachPartners.filter(partner => partner.type === type);
  }

  getTypeDisplayName(type: string): string {
    const typeMap: { [key: string]: string } = {
      // Associates
      // 'acceleration': 'Acceleration Partner',
      'venture': 'Venture Partner', 
      // 'investment': 'Investment Partner',
      'incubation': 'Incubation Partner',
      
      // Outreach Partners
      'ecosystem': 'Ecosystem Partner',
      'government': 'Government Partner',
      'media': 'Media Partner',
      // 'brand': 'Brand Representative'
    };
    
    return typeMap[type] || type;
  }

  openLink(link: string) {
    if (link) {
      window.open(link, '_blank');
    }
  }

  onMouseEnter(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
  }

  onMouseMove(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    if (target && target.classList.contains('card')) {
      const rect = target.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) / 4;
      const y = (event.clientY - rect.top - rect.height / 2) / 4;
      target.style.transform = `rotateY(${x}deg) rotateX(${y}deg) translateY(-8px)`;
    }
  }

  onMouseLeave(event: MouseEvent) {
    const target = event.currentTarget as HTMLElement;
    if (target && target.classList.contains('card')) {
      target.style.transform = 'rotateY(0deg) rotateX(0deg) translateY(0px)';
    }
  }

  private formatSponsorTestimonials() {
    this.formattedSponsorTestimonials = this.sponsorTestimonials.map(testimonial => ({
      id: testimonial.id,
      testimonial: testimonial.testimonial,
      logo: testimonial.logo,
      name: testimonial.author || testimonial.name || 'Anonymous',
      quote: testimonial.testimonial,
      src: testimonial.logo
    }));
  }
}
