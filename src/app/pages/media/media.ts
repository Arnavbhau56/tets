import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Media } from '../../services/api.service';

@Component({
  selector: 'app-media',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './media.html',
  styleUrls: ['./media.css']
})
export class MediaComponent implements OnInit {
  mediaItems: Media[] = [];
  loading = true;
  error = false;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadMedia();
  }

  loadMedia() {
    this.apiService.getMedia().subscribe({
      next: (data) => {
        this.mediaItems = data.sort((a, b) => a.order - b.order);
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching media:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }
}
