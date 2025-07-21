import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, OnDestroy } from '@angular/core';

interface Testimonial {
  id: number;
  testimonial: string;
  logo: string;
  name: string;
  quote?: string;
  src?: string;
}

@Component({
  selector: 'app-animated-testimonials',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './animated-testimonials.html',
  styleUrl: './animated-testimonials.css'
})
export class AnimatedTestimonials implements OnInit, OnDestroy {
  @Input() testimonials: Testimonial[] = [];
  @Input() autoplay: boolean = false;

  active = 0;
  private autoplayInterval: any;
  isTransitioning = false;

  ngOnInit() {
    if (this.autoplay) {
      this.startAutoplay();
    }
  }

  ngOnDestroy() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
  }

  handleNext() {
    if (this.isTransitioning) return;
    if (!this.testimonials || this.testimonials.length === 0) return;
    this.isTransitioning = true;
    this.active = (this.active + 1) % this.testimonials.length;
    setTimeout(() => {
      this.isTransitioning = false;
    }, 600);
  }

  handlePrev() {
    if (this.isTransitioning) return;
    if (!this.testimonials || this.testimonials.length === 0) return;
    this.isTransitioning = true;
    this.active = (this.active - 1 + this.testimonials.length) % this.testimonials.length;
    setTimeout(() => {
      this.isTransitioning = false;
    }, 600);
  }

  isActive(index: number): boolean {
    return index === this.active;
  }

  private startAutoplay() {
    this.autoplayInterval = setInterval(() => {
      this.handleNext();
    }, 5000);
  }

  randomRotateY(): number {
    return Math.floor(Math.random() * 21) - 10;
  }

  getImageStyle(index: number): any {
    const isActive = this.isActive(index);
    const offset = index - this.active;
    
    if (isActive) {
      return {
        zIndex: 40,
        opacity: 1,
        transform: 'scale(1) rotate(0deg) translate(0, 0)'
      };
    } else {
      // Fan out left/right based on position relative to active
      const angle = offset * 3; // degrees
      const x = offset * 5;     // px
      const y = Math.abs(offset) * 4; // px, for a little vertical offset
      return {
        zIndex: 40 - Math.abs(offset),
        opacity: 0.7,
        transform: `scale(0.95) rotate(${angle}deg) translate(${x}px, ${y}px)`
      };
    }
  }
} 