import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Tm } from '../tm/tm';
import { ApiService, Rule } from '../../services/api.service';

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.html',
  styleUrl: './timeline.css',
  imports: [CommonModule, Tm],
})

export class Timeline implements OnInit {
  activeTab: string = 'registration';
  activeRulesTab: 'general' | 'pan' | 'questionnaire' = 'general';

  // Properties for accordion functionality
  expandedPanels: { [key: string]: boolean } = {};

  // Rules properties
  rules: Rule[] = [];
  loading = false;
  error = '';

  // Judging Criteria panels (replicating FAQ structure)
  judgingCriteria = [
    {
      title: 'Venture Description',
      items: [
        { label: '1. Problem:', desc: "Summarize the problem your venture solves and how it's different." },
        { label: '2. Stage:', desc: "State your venture's current stage (concept, prototype, early customers)" }
      ]
    },
    {
      title: 'Market Analysis',
      items: [
        { label: "1. Market Potential:", desc: "Briefly outline the market you're entering and its growth potential." },
        { label: "2. Challenges & Opportunities:", desc: "Mention key barriers and growth opportunities in the market." }
      ]
    },
    {
      title: 'Unique value proposition',
      items: [
        { label: "1. Differentiation:", desc: "Explain what sets your idea apart from existing solutions." }
      ]
    },
    {
      title: 'Competitive landscape',
      items: [
        { label: "1. Key Competitors:", desc: "Identify the main competitors in your field." },
        { label: "2. Strategy:", desc: "Describe your plan to overcome the competition" }
      ]
    },
    {
      title: 'Revenue model description',
      items: [
        { label: "1. Revenue:", desc: "Outline how you'll make money." },
        { label: "2. Projections:", desc: "Highlight key costs and share short-term revenue and growth opportunities." }
      ]
    }
  ];

  constructor(private http: HttpClient, private apiService: ApiService, private sanitizer: DomSanitizer) {}

  // Methods for accordion functionality
  toggleAccordion(panelId: string) {
    this.expandedPanels[panelId] = !this.expandedPanels[panelId];
  }

  isPanelExpanded(panelId: string): boolean {
    return this.expandedPanels[panelId] || false;
  }

  ngOnInit(): void {
    // Component initialization
    this.loadGeneralRules();
  }

  registrationTimeline = [
    { date: '4th July - 10th August', title: 'Registration Period', text: 'Eureka! opens its applications for all entrepreneurs on 4th July. Register by filling your details and logging in to the Eureka! dashboard. Add your co-founders and fill your startup idea details.' },
    { date: '15th August', title: 'Questionnaire Deadline', text: 'Our questionnaire tests the fundamental aspects of your startup idea, including customer segments, target markets, value propositions, and market analysis.' },
    { date: '5th September', title: 'Zonalist Declaration', text: 'Top startups are selected for the zonals round. This embarks your journey into Eureka! wherein you would be provided with a multiple opportunities to network, access to mentoring and workshops.' },
  ];
  zonalsTimeline = [
    { date: '6th September - 25th September', title: '1st Round Mentoring', text: 'Get assigned dedicated mentors for exclusive one-on-one sessions. Our expert mentors will guide you in developing your business model using proven startup methods.' },
    { date: '25th September', title: 'Preliminary Submission', text: 'This submission will require details about your startup idea with insights into your business plan. It will be considered alongside the offline pitching evaluation.' },
    { date: '28th September | 4th October', title: 'Zonals', text: 'Zonals will be held in different zones across the country. You will be required to pitch offline in front of the top VCs and investors across the country. It will give you an opportunity to network with some of the top stakeholders of this ecosystem.' }
  ];
  businessModelTimeline = [
    { date: '10th October', title: 'Finalist Declaration', text: "Finalists selected from zonals receive exclusive one-on-one mentoring, workshops, and webinars tailored to their startup. Focused on customer validation and growth, this support prepares them thoroughly for the final pitch." },
    { date: '11th October - 10th November', title: 'Customer Validation', text: 'Receive one-on-one mentoring personalised exclusively for finalists. Some of the top mentors are exclusively picked to provide mentoring to these startups and help them in their idea/customer validation process' },
    { date: '20th November', title: 'Online Mock Pitching', text: 'Before you present yourself in the grand finale of Eureka!, online mock pitching will help you refine your pitches to make your pitch more exciting and impactful.' }
  ];
  finaleTimeline = [
    { date: '1st December', title: 'Finals Submission', text: 'Finalists, selected based on their performance in the Zonals, will now receive mentorship and a range of incentives to accelerate their startup growth.' },
    { date: 'E-Summit', title: 'Workshops and growth sessions', text: 'Offer expert-led guidance on key startup areas like product development, fundraising, and marketing. They help participants learn, network, and improve their business ideas' },
    { date: 'E-Summit', title: 'Grand Finale', text: 'Hold your nerves to present the final pitch of the competition. It is the grand finale where the top startups of Eureka! compete for the winning prize' },
    { date: 'E-Summit', title: 'Demo Day', text: 'Demo Day sets the stage for startups to pitch their vision to investors and industry leaders. Step into the spotlight, engage with influential stakeholders, and unleash the power of your startup at Demo Day.' }
  ];

  get currentTimeline() {
    switch (this.activeTab) {
      case 'registration': return this.registrationTimeline;
      case 'zonals': return this.zonalsTimeline;
      case 'businessModel': return this.businessModelTimeline;
      case 'finale': return this.finaleTimeline;
      default: return [];
    }
  }

  get timelineItemsForTm() {
    return this.currentTimeline.map((item) => ({
      date: item.date,
      title: item.title,
      text: item.text,
      marginClass: 'margin-bottom-medium'
    }));
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  // Rules methods
  loadGeneralRules() {
    this.activeRulesTab = 'general';
    this.loadRules();
  }

  loadPanRules() {
    this.activeRulesTab = 'pan';
    this.loadRules();
  }

  loadQuestionnaireRules() {
    this.activeRulesTab = 'questionnaire';
    this.loadRules();
  }

  private loadRules() {
    this.loading = true;
    this.error = '';
    
    this.apiService.getRules().subscribe({
      next: (data) => {
        this.rules = data
          .filter(rule => rule.type === this.activeRulesTab)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load rules';
        this.loading = false;
        console.error('Error loading rules:', err);
      }
    });
  }

  getRulesByType(type: 'general' | 'pan' | 'questionnaire'): Rule[] {
    return this.rules.filter(rule => rule.type === type);
  }

  // Method to safely render HTML content
  getSafeHtml(content: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }
}
