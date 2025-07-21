import { Component, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faYoutube,
  faLinkedin,
  faInstagram,
  faFacebook,
  faXTwitter,
} from '@fortawesome/free-brands-svg-icons';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  styleUrls: ['./footer.css'],
  imports: [FontAwesomeModule],
  standalone: true,
})

export class Footer {
  faYoutube = faYoutube;
  faLinkedin = faLinkedin;
  faInstagram = faInstagram;
  faFacebook = faFacebook;
  faXTwitter = faXTwitter;

  email = 'eureka';

  constructor() {}
}