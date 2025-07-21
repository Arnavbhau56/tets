import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-video',
  imports: [CommonModule, RouterModule],
  templateUrl: './video.html',
  styleUrl: './video.css'
})
export class Video implements OnInit, AfterViewInit {
  @ViewChild('videoElement', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;
  
  showVideo = signal(false);
  videoEnded = signal(false);

  ngOnInit() {
    console.log('Video component ngOnInit called');
    // Check if video has already been played in this session
    const videoPlayed = sessionStorage.getItem('openingVideoPlayed');
    console.log('Session storage video played:', videoPlayed);
    
    if (videoPlayed === 'true') {
      // Video already played, skip to main content
      console.log('Video already played, skipping to main content');
      this.videoEnded.set(true);
      this.showVideo.set(false);
    } else {
      // Show video for first time visitors
      console.log('First time visitor, showing video');
      this.showVideo.set(true);
    }
  }

  ngAfterViewInit() {
    console.log('Video component ngAfterViewInit called');
    console.log('showVideo signal:', this.showVideo());
    console.log('videoElement exists:', !!this.videoElement);
    console.log('videoElement nativeElement exists:', !!this.videoElement?.nativeElement);
    
    // Only setup video if it should be shown and video element exists
    if (this.showVideo() && this.videoElement?.nativeElement) {
      console.log('Setting up video...');
      this.setupVideo();
    } else {
      console.log('Skipping video setup - conditions not met');
    }
  }

  private setupVideo() {
    console.log('setupVideo method called');
    
    if (!this.videoElement?.nativeElement) {
      console.error('Video element not found');
      this.onVideoEnd();
      return;
    }

    const video = this.videoElement.nativeElement;
    console.log('Video element found:', video);
    
    // Set video source - try different paths
    const videoSrc = 'assets/Videos/opening.mp4'; // Try assets path first
    console.log('Setting video source to:', videoSrc);
    video.src = videoSrc;
    
    // Configure autoplay attributes for Chrome compatibility
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;
    video.controls = false;
    
    console.log('Video attributes set - muted:', video.muted, 'autoplay:', video.autoplay, 'playsInline:', video.playsInline);
    
    // Handle video events
    video.addEventListener('loadeddata', () => {
      console.log('Video loaded and ready to play');
    });
    
    video.addEventListener('ended', () => {
      console.log('Video ended');
      this.onVideoEnd();
    });
    
    video.addEventListener('error', (e) => {
      console.error('Video error:', e);
      console.error('Video error details:', video.error);
      console.error('Video error code:', video.error?.code);
      console.error('Video error message:', video.error?.message);
      
      // Try alternative path if first one fails
      if (video.src.includes('assets/')) {
        console.log('Trying alternative path: /Videos/opening.mp4');
        video.src = '/Videos/opening.mp4';
      } else {
        // If video fails to load, proceed to main content
        this.onVideoEnd();
      }
    });
    
    video.addEventListener('loadstart', () => {
      console.log('Video load started');
    });
    
    video.addEventListener('canplay', () => {
      console.log('Video can play');
    });
    
    // Start playing
    console.log('Attempting to play video...');
    video.play().then(() => {
      console.log('Video play promise resolved successfully');
    }).catch(error => {
      console.error('Autoplay failed:', error);
      // If autoplay fails, proceed to main content
      this.onVideoEnd();
    });
  }

  private onVideoEnd() {
    console.log('onVideoEnd called');
    // Mark video as played in session storage
    sessionStorage.setItem('openingVideoPlayed', 'true');
    
    // Hide video and show main content
    this.videoEnded.set(true);
    this.showVideo.set(false);
    this.cdr.detectChanges();
    console.log('Video hidden, main content should be visible');
  }

  constructor(private cdr: ChangeDetectorRef) {
    console.log('Video component constructor called');
  }
}
