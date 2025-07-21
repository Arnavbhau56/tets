import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Track } from '../../services/api.service';

@Component({
  selector: 'app-tracks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tracks.html',
  styleUrl: './tracks.css'
})

export class TracksComponent implements OnInit {
  tracks: Track[] = [];
  loading = true;
  error: string | null = null;
  isPopupVisible = false;
  selectedTrack: Track | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getTracks().subscribe({
      next: (data) => {
        this.tracks = data.sort((a, b) => a.order - b.order);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load tracks. Please try again later.';
        this.loading = false;
        console.error('Error loading tracks:', err);
      },
    });
  }

  showPopup(track: Track): void {
    this.selectedTrack = track;
    this.isPopupVisible = true;
  }

  hidePopup(): void {
    this.isPopupVisible = false;
    this.selectedTrack = null;
  }

  goToRegister(): void {
    window.open('https://ecell.in/eureka/register', '_blank');
  }

}
