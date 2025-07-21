import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ApiService, GalleryItem } from '../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-galtest',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './galtest.html',
  styleUrl: './galtest.css'
})

export class Galtest implements OnInit, AfterViewInit, OnDestroy {
  gallery: GalleryItem[] = [];
  @ViewChild('slider', { static: false }) sliderRef!: ElementRef<HTMLDivElement>;
  animationFrameId: any;
  scrollLeft = 0;
  speed = 2; // px per frame

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.api.getGallery().subscribe((data) => {
      this.gallery = data.concat(data); // duplicate for seamless loop
    });
  }

  ngAfterViewInit() {
    this.startMarquee();
  }

  startMarquee() {
    const animate = () => {
      if (this.sliderRef && this.sliderRef.nativeElement) {
        this.scrollLeft += this.speed;
        const slider = this.sliderRef.nativeElement;
        if (this.scrollLeft >= slider.scrollWidth / 2) {
          this.scrollLeft = 0;
        }
        slider.scrollLeft = this.scrollLeft;
      }
      this.animationFrameId = requestAnimationFrame(animate);
    };
    this.animationFrameId = requestAnimationFrame(animate);
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  getCenterIndex(): number {
    if (!this.sliderRef || !this.sliderRef.nativeElement) return 0;
    const slider = this.sliderRef.nativeElement;
    const sliderRect = slider.getBoundingClientRect();
    let minDiff = Infinity;
    let centerIdx = 0;
    const images = slider.querySelectorAll('.gallery-image');
    images.forEach((img, idx) => {
      const rect = (img as HTMLElement).getBoundingClientRect();
      const diff = Math.abs(rect.left + rect.width / 2 - (sliderRect.left + sliderRect.width / 2));
      if (diff < minDiff) {
        minDiff = diff;
        centerIdx = idx % (this.gallery.length / 2);
      }
    });
    return centerIdx;
  }

  get currentText(): string {
    const idx = this.getCenterIndex();
    return this.gallery[idx]?.text || '';
  }
}
