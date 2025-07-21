import { Directive, OnInit } from '@angular/core';

@Directive({
  selector: '[appScrollTop]',
  standalone: true
})
export class ScrollTopDirective implements OnInit {

  ngOnInit(): void {
    // Scroll to top when component initializes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }
} 