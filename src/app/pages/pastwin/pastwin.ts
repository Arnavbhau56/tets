import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { ApiService, PastWinner } from '../../services/api.service';

@Component({
  selector: 'app-pastwin',
  imports: [CommonModule, HttpClientModule],
  templateUrl: './pastwin.html',
  styleUrl: './pastwin.css'
})
export class Pastwin implements OnInit {
  pastWinners: PastWinner[] = [];
  loading = true;
  error = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadPastWinners();
  }

  loadPastWinners() {
    this.apiService.getPastWinners().subscribe({
      next: (data) => {
        // Sort by order field to maintain the correct display order
        this.pastWinners = data.sort((a, b) => a.order - b.order);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching past winners:', error);
        this.error = true;
        this.loading = false;
      }
    });
  }
}
