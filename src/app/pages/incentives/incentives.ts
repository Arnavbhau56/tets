import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ApiService, Incentive } from '../../services/api.service';

@Component({
  selector: 'app-incentives',
  imports: [CommonModule, HttpClientModule],
  templateUrl: './incentives.html',
  styleUrl: './incentives.css'
})
export class Incentives implements OnInit {
  incentives: Incentive[] = [];
  loading = true;
  error = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadIncentives();
  }

  loadIncentives() {
    this.apiService.getIncentives().subscribe({
      next: (data) => {
        // Sort by order field to maintain the correct display order
        this.incentives = data.sort((a, b) => a.order - b.order);
        this.loading = false;
      },
      error: (error) => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  openLink(link: string) {
    if (link) {
      window.open(link, '_blank');
    }
  }
}
