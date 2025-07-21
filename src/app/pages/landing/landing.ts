import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, ViewChildren, QueryList, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Structure } from '../structure/structure';
import { AnimationItem } from 'lottie-web';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import { Galtest } from '../galtest/galtest';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ScrollTopDirective } from '../../directives/scroll-top.directive';
import { AnimatedTestimonials } from '../../components/animated-testimonials/animated-testimonials';
import { Subscription } from 'rxjs';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
declare const VANTA: any;

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, Structure, LottieComponent, Galtest, ScrollTopDirective, AnimatedTestimonials],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})

export class Landing implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('stats', { static: true }) statsEl!: ElementRef;
  @ViewChildren('lottie') lottiePlayers!: QueryList<LottieComponent>;
  private observer!: IntersectionObserver;
  private animationStarted = false;
  private authSub!: Subscription;
  animations: AnimationItem[] = [];
  players: LottieComponent[] = [];
  testimonials: any[] = [];
  formattedTestimonials: any[] = [];
  isLoggedIn: boolean = false;

  // Card data
  dataRoadmap = [
    {
      id: 0,
      animationUrl: "assets/animations/Networkl.json",
      title: "Networking",
      desc: "Network with leading investors and startups, creating valuable connections to drive success",
    },
    {
      id: 1,
      animationUrl: "assets/animations/flow2.json",
      title: "Prizes",
      desc: "Compete for cash prizes worth 26 Lakhs+, offering essential funding to support your entrepreneurial journey",
    },
    {
      id: 2,
      animationUrl: "assets/animations/flow3.json",
      title: "Mentoring",
      desc: "Receive valuable insights through personalized mentorship from industry experts and experienced mentors",
    },
    {
      id: 3,
      animationUrl: "assets/animations/flow6.json",
      title: "Workshops",
      desc: "Participate in transformative workshops led by renowned startup founders, enhancing your knowledge and skills",
    },
    {
      id: 4,
      animationUrl: "assets/animations/Rocket.json",
      title: "Fundraising",
      desc: "Unlock opportunities to secure funding from top VCs and angels, propelling your startup to new heights",
    },
    {
      id: 5,
      animationUrl: "assets/animations/flow4.json",
      title: "Benefits",
      desc: "Enjoy exclusive perks and offers from renowned companies, maximizing your startup's potential",
    },
  ];

  constructor(private api: ApiService, private router: Router, private authService: AuthService) { }

  ngOnInit() {
    this.checkAuthStatus();
    this.authSub = this.authService.isLoggedIn$.subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
    });
    
    VANTA.WAVES({
      el: "#vanta-background",
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: 0x27,
      shininess: 22.00,
      waveHeight: 17.00,
      waveSpeed: 1.20,
      zoom: 1.03
    });

    this.api.getTestimonials().subscribe(
      (response: any) => {
        if (Array.isArray(response)) {
          this.testimonials = response;
        } else if (response && response.testi) {
          this.testimonials = response.testi;
        }
        this.formatTestimonials();
      },
      (error) => {
        console.error('Failed to fetch testimonials', error);
      }
    );
  }

  private formatTestimonials() {
    this.formattedTestimonials = this.testimonials.map(testimonial => ({
      id: testimonial.id,
      testimonial: testimonial.testimonial,
      logo: testimonial.logo,
      name: testimonial.name,
      quote: testimonial.testimonial,
      src: testimonial.logo
    }));
  }

  ngAfterViewInit(): void {
    gsap.registerPlugin(ScrollTrigger);
    
    // Wait for DOM to be fully loaded
    setTimeout(() => {
      this.setupScrollAnimation();
    }, 100);
    
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animationStarted) {
          this.animationStarted = true;
          this.animateStats();
          this.observer.unobserve(this.statsEl.nativeElement);
        }
      });
    }, options);

    this.observer.observe(this.statsEl.nativeElement);
  }

  private setupScrollAnimation(): void {
    const whatElement = document.querySelector('.what') as HTMLElement;
    const contentElement = document.querySelector('.content') as HTMLElement;
    
    // Responsive ScrollTrigger start and end positions
    let startValue = 'top bottom';
    let endValue = 'top 10%';
    if (window.innerWidth <= 600) {
      endValue = 'top 10%';
    } else if (window.innerWidth <= 1200) {
      endValue = 'top 10%';
    }
    
    if (whatElement) {
      gsap.to(whatElement, {
        scrollTrigger: {
          trigger: whatElement,
          start: startValue,
          end: endValue,
          scrub: true,
          markers: false,
          onUpdate: (self: any) => {

            if (self.progress > 0 && self.progress < 1) {
              whatElement.style.boxShadow = '0 0 50px 3px rgba(29, 85, 255, 0.5)';
            } else {
              whatElement.style.boxShadow = 'none';
            }
          },
          onLeave: () => {
            whatElement.style.boxShadow = 'none';
          },
          onEnterBack: () => {
            whatElement.style.boxShadow = '0 0 50px 3px rgba(29, 85, 255, 0.5)';
          },
          onLeaveBack: () => {
            whatElement.style.boxShadow = 'none';
          }
        },
        width: '100vw',
        borderRadius: '0px',
        ease: 'none',
      });
      
    } else {
      console.error('Animation elements not found!');
    }
  }

  ngOnDestroy(): void {
    // Cleanup ScrollTrigger animations
    ScrollTrigger.getAll().forEach((trigger: any) => trigger.kill());
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  animateStats(): void {
    const lines = this.statsEl.nativeElement.querySelectorAll('.line');
    lines.forEach((line: HTMLElement) => line.classList.add('in-view'));

    const counters = this.statsEl.nativeElement.querySelectorAll('.stat-number');
    counters.forEach((counter: HTMLElement) => {
      const target = +counter.getAttribute('data-target')!;
      const isDecimal = counter.hasAttribute('data-decimal');
      let start: number | null = null;
      const duration = 2000;

      const step = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const rawValue = (progress / duration) * target;

        if (progress >= duration) {
          counter.innerText = isDecimal ? target.toFixed(1) : target.toLocaleString();
          return;
        }

        if (isDecimal) {
          counter.innerText = rawValue.toFixed(1);
        } else {
          counter.innerText = Math.floor(rawValue).toLocaleString();
        }

        window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    });
  }

  animationCreated(animation: AnimationItem, id: number, player: LottieComponent) {
    this.animations[id] = animation;
    this.players[id] = player;
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    for (let i = 0; i < this.animations.length; i++) {
      if (this.animations[i] && this.players[i]) {
        const { top, height } = this.players[i].container.nativeElement.getBoundingClientRect();
        const MAX_TOP = window.innerHeight - (2 * height) / 5;
        const MIN_TOP = Math.max(window.innerHeight / 2 - (3 * height) / 5, 0);

        if (top < MAX_TOP && top >= MIN_TOP) {
          const progress = 1 - Math.pow((top - MIN_TOP) / (MAX_TOP - MIN_TOP), 2);
          this.animations[i].goToAndStop(
            Math.floor(progress * this.animations[i].totalFrames),
            true
          );
        } else if (top < MIN_TOP) {
          this.animations[i].goToAndStop(this.animations[i].totalFrames, true);
        }
      }
    }
  }

  login() {
    this.router.navigate(['/login']);
  }

  reg() {
    this.router.navigate(['/register']);
  }

  private checkAuthStatus() {
    this.isLoggedIn = this.authService.isLoggedIn;
  }

  refreshAuthStatus() {
    this.checkAuthStatus();
  }

  logout() {
    this.authService.logout();
  }

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }
}

