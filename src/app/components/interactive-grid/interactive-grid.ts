import { Component, Input, OnInit, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-interactive-grid',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      class="grid-svg"
      [ngClass]="className"
      [attr.viewBox]="'0 0 ' + svgWidth + ' ' + svgHeight"
      preserveAspectRatio="none"
    >
      <rect
        *ngFor="let square of gridSquares; let i = index"
        [attr.x]="getSquareX(i)"
        [attr.y]="getSquareY(i)"
        [attr.width]="width"
        [attr.height]="height"
        class="grid-square"
        [ngClass]="'grid-square-hover-' + (hoveredSquare === i ? 'active' : 'inactive') + ' ' + squaresClassName"
        (mouseenter)="onMouseEnter(i)"
        (mouseleave)="onMouseLeave()"
        style="cursor: pointer;"
      ></rect>
    </svg>
  `,
  styles: [`
    .grid-svg {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      border: 1px solid rgba(156, 163, 175, 0.3);
      z-index: 0;
      pointer-events: auto;
      mask-image: radial-gradient(ellipse 1200px 800px at center, white, transparent);
      -webkit-mask-image: radial-gradient(ellipse 1200px 800px at center, white, transparent);
    }
    
    .grid-square {
      stroke: rgba(156, 163, 175, 0.55);
      stroke-width: 0.5;
      transition: all 0.2s ease-in-out;
      fill: transparent;
      pointer-events: auto;
    }
    
    .grid-square-hover-active {
      fill: rgba(255, 255, 255, 0.2);
      stroke: rgba(255, 255, 255, 0.74);
      stroke-width: 1;
    }
    
    .grid-square-hover-inactive {
      transition-duration: 0.8s;
    }
  `]
})
export class InteractiveGridPattern implements OnInit, AfterViewInit {
  @Input() width = 80;
  @Input() height = 80;
  @Input() squares: [number, number] = [25, 15]; // [horizontal, vertical]
  @Input() className = '';
  @Input() squaresClassName = '';

  hoveredSquare: number | null = null;
  gridSquares: number[] = [];
  svgWidth: number = 0;
  svgHeight: number = 0;
  
  constructor(private elementRef: ElementRef) {}
  
  ngOnInit() {
    // Responsive: Increase grid width for small screens
    if (window.innerWidth <= 600 && this.squares[0] === 25) {
      this.squares = [35, this.squares[1]];
    }
    this.calculateGridDimensions();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (window.innerWidth <= 600) {
        const containerWidth = this.elementRef.nativeElement.parentElement.offsetWidth;
        const horizontalSquares = Math.ceil(containerWidth / this.width);
        this.squares = [horizontalSquares, this.squares[1]];
        this.svgWidth = containerWidth;
      } else {
        // Reset to default for larger screens
        this.squares = [25, 15];
        this.svgWidth = this.squares[0] * this.width;
      }
      this.calculateGridDimensions();
    }, 0);
  }

  calculateGridDimensions() {
    const [horizontal, vertical] = this.squares;
    this.svgWidth = horizontal * this.width;
    this.svgHeight = vertical * this.height;
    this.gridSquares = Array.from({ length: horizontal * vertical }, (_, i) => i);
  }

  getSquareX(index: number): number {
    return (index % this.squares[0]) * this.width;
  }

  getSquareY(index: number): number {
    return Math.floor(index / this.squares[0]) * this.height;
  }

  onMouseEnter(index: number): void {
    this.hoveredSquare = index;
  }

  onMouseLeave(): void {
    this.hoveredSquare = null;
  }
} 