import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ElementRef } from '@angular/core';
// @ts-ignore
import { gsap, ScrollTrigger } from 'gsap/all';
gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-structure',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './structure.html',
  styleUrl: './structure.css'
})
export class Structure implements OnInit, AfterViewInit {
  cards = [
    {
      title: 'REGISTRATION PERIOD',
      date: '4th JULY - 10th AUGUST',
      description: `Eureka! opens its applications for all entrepreneurs on 4th July. 
      Register by filling your details and logging in to the Eureka! dashboard. 
      Add your co-founders and fill your startup idea details.`,
      img: 'assets/images/reg.png',
      color: '#001A3C',
      textColor: '#fff',
      index: 1
    },
    {
      title: 'ZONALS ROUND',
      date: '5TH SEPTEMBER - 4TH OCTOBER',
      description: `Get assigned dedicated mentors for exclusive one-on-one sessions. 
      Our expert mentors will guide you in developing your business model using proven startup methods.`,
      img: 'assets/images/zonal.png',
      color: '#003375',
      textColor: '#fff',
      index: 2
    },
    {
      title: 'IGNITE ROUND',
      date: '14TH OCTOBER - 20th NOVEMBER',
      description: `Finalists selected from zonals receive exclusive one-on-one mentoring, workshops, and webinars tailored to their startup. Focused on customer validation and growth, this support prepares them thoroughly for the final pitch.`,
      img: 'assets/images/semi.png',
      color: '#328BFF',
      textColor: '#000',
      index: 3
    },
    {
      title: 'GRAND FINALE',
      date: 'E-SUMMIT',
      description: `Final submissions will be collected, followed by advanced workshops to refine pitches. Finalists will then compete at the Finals and Demo Day alongside top startups.`,
      img: 'assets/images/final.png',
      color: '#fff',
      textColor: '#000',
      index: 4
    }
  ];

  constructor(private el: ElementRef) {}

  ngOnInit() {}

  ngAfterViewInit() {
    const cards = this.el.nativeElement.querySelectorAll('.card');
  
    cards.forEach((card: HTMLElement, i: number) => {
      const offset = i * 0.05 * card.offsetHeight;
  
      gsap.fromTo(card,
        { scale: 0.92 },
        {
          scale: 1,
          y: offset,
          ease: 'none',
          scrollTrigger: {
            trigger: card,
            start: `top 100%`,
            end: `top 30%`,
            scrub: true,
          }
        }
      );
    });
  }
  


}
