import { CommonModule } from '@angular/common';
import { Component, Input, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-tm',
  imports: [CommonModule],
  templateUrl: './tm.html',
  styleUrl: './tm.css'
})

export class Tm implements AfterViewInit {
  @Input() timelineItems: Array<{
    date: string;
    text: string;
    title: string;
    marginClass?: string;
  }> = [];

  @ViewChild('timelineComponent') timelineComponent!: ElementRef;
  progressHeight = 0;

  ngAfterViewInit() {
    setTimeout(() => this.updateProgress(), 0);
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.updateProgress();
  }

  updateProgress() {
    if (!this.timelineComponent) return;
    const timelineEl = this.timelineComponent.nativeElement;
    const timelineRect = timelineEl.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const timelineTop = timelineRect.top;
    const timelineHeight = timelineRect.height;
    // Calculate how much of the timeline is visible
    const offset = 0.21; // adjust this value as needed
    const speed = 1.8; // or try 1.3, 2, etc.
    let scrollProgress = (viewportHeight - timelineTop) / (timelineHeight + viewportHeight) - offset;
    scrollProgress = Math.max(0, Math.min(1, scrollProgress * speed));
    this.progressHeight = Math.min(timelineHeight, timelineHeight * scrollProgress);
  }
}
