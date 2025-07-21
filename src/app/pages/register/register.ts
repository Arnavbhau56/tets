import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { InteractiveGridPattern } from '../../components/interactive-grid/interactive-grid';
import { GENDER_OPTIONS, STATUS_OPTIONS, TRACK_OPTIONS, SECTOR_OPTIONS, STATE_OPTIONS } from '../../enums/registration_options';
import { COUNTRIES } from '../../enums/countries';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Observable, startWith, map } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule, InteractiveGridPattern, ReactiveFormsModule, MatAutocompleteModule, MatFormFieldModule, MatInputModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {
  currentPage: number = 1;
  otpSent: boolean = false;
  timer: number = 0;
  timerInterval: any = null;
  showResend: boolean = false;
  otpDigits: string[] = ['', '', '', '', '', ''];
  confirmPassword: string = '';
  page1Submitted: boolean = false;
  page2Submitted: boolean = false;
  page3Submitted: boolean = false;
  originalEmail: string = ''; // Track the email used for OTP
  isPrefilling: boolean = false; // Flag to prevent unwanted resets during pre-filling
  postalCodeAutoFilled: boolean = false; // Flag to track if state/city were auto-filled from postal code
  caNecIds = { caId: '', necId: '' };

  // Form data object
  formData: any = {
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    gender: '',
    country_code: '',
    contact_number: '',
    country: '',
    state: '',
    city: '',
    pin_code: '',
    current_professional_status: '',
    where_did_you_hear: '',
    where_did_you_hear_other: '',
    referral_id: '',
    referral_other: '',
    startup_name: '',
    sector_1: '',
    sector_2: '',
    sector_3: '',
    dpiit_registered: '',
    dpiit_recognition_number: '',
    any_other_organization: '',
    name_of_organization: '',
    registration_number_of_organization: '',
    idea_description: '',
    track: '',
    website_url: '',
  };

  // Options from enums
  genderOptions = GENDER_OPTIONS;
  statusOptions = STATUS_OPTIONS;
  trackOptions = TRACK_OPTIONS;
  sectorOptions = SECTOR_OPTIONS;
  stateOptions = STATE_OPTIONS;
  countries = COUNTRIES;

  // Referral options
  referralOptions: any[] = [];
  showReferralDropdown: boolean = false;
  showReferralInput: boolean = false;

  // For custom filterable dropdown
  filteredCountriesList: any[] = this.countries;
  showCountryDropdown: boolean = false;

  constructor(private api: ApiService, private router: Router, private authService: AuthService) {}

  ngOnInit() {
    // Sync with formData
    this.formData.country_code = this.formData.country_code;
  }

  filterCountryCodes(value: string) {
    const filterValue = value ? value.toLowerCase() : '';
    this.filteredCountriesList = this.countries.filter(country =>
      country.countryCallingCode.toLowerCase().includes(filterValue) ||
      (country.countryNameEn && country.countryNameEn.toLowerCase().includes(filterValue)) ||
      (country.flag && country.flag.toLowerCase().includes(filterValue))
    );
    this.showCountryDropdown = true;
  }

  selectCountryCode(country: any) {
    this.formData.country_code = country.countryCallingCode;
    this.showCountryDropdown = false;
    this.onCountryCodeChange();
  }

  hideCountryDropdown() {
    setTimeout(() => {
      this.showCountryDropdown = false;
      // Validate that the selected value is from the list
      const valid = this.countries.some(c => c.countryCallingCode === this.formData.country_code);
      if (!valid) {
        this.formData.country_code = '';
      }
    }, 200);
  }

  // OTP Methods
  sendOtp() {
    
    if (!this.formData.email) {
      this.showError('Please enter your email.');
      return;
    }
    
    // Track the email used for OTP
    this.originalEmail = this.formData.email;
    
    Swal.fire({
      title: 'Sending OTP...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      background: '#181f2a',
      color: '#fff',
      customClass: {
        popup: 'swal2-poppins',
        title: 'swal2-poppins',
      }
    });

    this.api.sendRegOtp(this.formData.email).subscribe({
      next: (res: any) => {
        Swal.close();
        const responseData = res.body || res;
        if (responseData.success === true) {
          Swal.fire({
            icon: 'success',
            title: 'OTP Sent',
            text: responseData.message || 'Check your email for the OTP.',
            background: '#181f2a',
            color: '#fff',
            customClass: {
              popup: 'swal2-poppins',
              title: 'swal2-poppins',
            },
            timer: 1500,
            showConfirmButton: false
          });
          this.otpSent = true;
          this.startTimer();
        } else {
          this.showError(responseData.error || 'Failed to send OTP.');
        }
      },
      error: (err: any) => {

        Swal.close();
        let errorMessage = 'Failed to send OTP.';
        
        // Try to extract the specific error message from the response
        if (err.error && err.error.message) {
          errorMessage = err.error.message;
        } else if (err.error && err.error.error) {
          errorMessage = err.error.error;
        } else if (err.error && typeof err.error === 'string') {
          errorMessage = err.error;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        this.showError(errorMessage);
      }
    });
  }

  startTimer() {
    this.timer = 30;
    this.showResend = false;
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    this.timerInterval = setInterval(() => {
      this.timer--;
      if (this.timer <= 0) {
        clearInterval(this.timerInterval);
        this.showResend = true;
      }
    }, 1000);
  }

  resendOtp() {
    this.sendOtp();
    this.startTimer();
  }

  // OTP Input Handling
  onOtpInput(index: number, event: any) {
    let value = event.target.value;
    // Only allow one digit
    if (value.length > 1) {
      value = value.slice(-1);
      event.target.value = value;
    }
    this.otpDigits[index] = value.replace(/[^0-9]/g, '');
    // Auto-advance if a digit is entered and not the last box
    if (value && index < 5) {
      const nextInput = event.target.parentElement.children[index + 1];
      if (nextInput) {
        nextInput.focus();
      }
    }
    // For the last box, always enforce only one digit and set the value to the last digit entered
    if (index === 5) {
      if (value.length > 1) {
        const lastDigit = value[value.length - 1].replace(/[^0-9]/g, '');
        this.otpDigits[index] = lastDigit;
        event.target.value = lastDigit;
      } else {
        this.otpDigits[index] = value.replace(/[^0-9]/g, '');
        event.target.value = value.replace(/[^0-9]/g, '');
      }
    }
  }

  onOtpKeydown(index: number, event: any) {
    if (event.key === 'Backspace') {
      if (this.otpDigits[index]) {
        this.otpDigits[index] = '';
        event.target.value = '';
      } else if (index > 0) {
        const prevInput = event.target.parentElement.children[index - 1];
        if (prevInput) {
          prevInput.focus();
          this.otpDigits[index - 1] = '';
          prevInput.value = '';
        }
      }
    }
  }

  // Optionally, handle paste event for OTP
  onOtpPaste(event: ClipboardEvent) {
    const paste = event.clipboardData?.getData('text') || '';
    if (/^\d{6}$/.test(paste)) {
      for (let i = 0; i < 6; i++) {
        this.otpDigits[i] = paste[i];
        const input = (event.target as HTMLInputElement).parentElement?.children[i];
        if (input) (input as HTMLInputElement).value = paste[i];
      }
      event.preventDefault();
      // Focus last input
      const lastInput = (event.target as HTMLInputElement).parentElement?.children[5];
      if (lastInput) (lastInput as HTMLInputElement).focus();
    }
  }

  isOtpComplete(): boolean {
    return this.otpDigits.every(digit => digit !== '');
  }

  getOtpString(): string {
    return this.otpDigits.join('');
  }

  // Navigation Methods
  nextPage() {
    if (this.currentPage === 1) {
      this.validatePage1();
    } else if (this.currentPage === 2) {
      this.validatePage2();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Validation Methods
  validatePage1() {
    this.page1Submitted = true;

    if (!this.formData.email || !this.isOtpComplete() || !this.formData.password || !this.confirmPassword) {
      this.showError('Please fill all required fields.');
      return;
    }

    if (this.formData.password !== this.confirmPassword) {
      this.showError('Passwords do not match.');
      return;
    }

    // Verify OTP
    this.verifyOtp();
  }

  validatePage2() {
    this.page2Submitted = true;

    const requiredFields = [
      'first_name', 'last_name', 'gender', 'country_code', 'contact_number', 
      'country', 'current_professional_status'
    ];

    for (const field of requiredFields) {
      if (!this.formData[field]) {
        this.showError('Please fill all required fields.');
        return;
      }
    }

    // Ensure country_code is from the dropdown
    const validCountry = this.countries.some(c => c.countryCallingCode === this.formData.country_code);
    if (!validCountry) {
      this.showError('Please select a valid country code from the dropdown.');
      return;
    }

    // Validate contact_number is a number
    if (isNaN(Number(this.formData.contact_number))) {
      this.showError('Contact number must be a number.');
      return;
    }

    // India-specific validation - check for "India" or "ind"
    if (this.formData.country.toLowerCase() === 'india' || this.formData.country === 'ind') {
      if (!this.formData.pin_code || !this.formData.state || !this.formData.city) {
        this.showError('Please fill all required fields for India.');
        return;
      }
    }

    // Check for GCC countries
    const gccCountries = ['kuw', 'quatar', 'bah', 'oman', 'saudi', 'uae'];
    const countryLower = this.formData.country.toLowerCase();
    if (gccCountries.includes(countryLower) || 
        countryLower.includes('kuwait') || 
        countryLower.includes('qatar') || 
        countryLower.includes('bahrain') || 
        countryLower.includes('oman') || 
        countryLower.includes('saudi') || 
        countryLower.includes('uae') ||
        countryLower.includes('united arab emirates')) {
      Swal.fire({
        icon: 'info',
        title: 'GCC Region',
        text: 'You are more suited for Eureka! GCC',
        background: '#181f2a',
        color: '#fff',
        customClass: {
          popup: 'swal2-poppins',
          title: 'swal2-poppins',
        },
        confirmButtonText: 'OK'
      }).then(() => {
        window.location.href = 'https://www.ecell.in/eurekagcc';
      });
      return;
    }

    // Custom validation for Referral/CA-NEC
    if (this.formData.where_did_you_hear === 'CA-NEC') {
      if (!this.caNecIds.caId || !this.caNecIds.necId) {
        this.showError('Please enter both CA ID and NEC ID.');
        return;
      }
    } else if (this.showReferralDropdown && (!this.formData.referral_id || (this.formData.referral_id === 'Other' && !this.formData.referral_other))) {
      this.showError('Please fill the Referral ID field.');
      return;
    }

    // Validate postal code is exactly 6 digits (if present)
    if (this.formData.pin_code && this.formData.pin_code.length !== 6) {
      this.showError('Postal code must be exactly 6 digits.');
      return;
    }
    // Validate contact number is at most 16 digits
    if (this.formData.contact_number && this.formData.contact_number.length > 16) {
      this.showError('Contact number cannot exceed 16 digits.');
      return;
    }

    this.currentPage = 3;
  }

  // API Methods
  verifyOtp() {
    
    Swal.fire({
      title: 'Verifying OTP...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
      background: '#181f2a',
      color: '#fff',
      customClass: {
        popup: 'swal2-poppins',
        title: 'swal2-poppins',
      }
    });

    this.api.verifyRegOtp(this.formData.email, this.getOtpString()).subscribe({
      next: (res: any) => {
        Swal.close();
        const responseData = res.body || res;
        
        if (responseData.success === true) {
          // Pre-fill form data if user_data is provided
          if (responseData.user_data) {
            this.prefillUserData(responseData.user_data);
          } else {
          }
          this.currentPage = 2;
        } else {
          // Show the specific error message from the API
          const errorMessage = responseData.message || responseData.error || 'Invalid OTP.';
          this.showError(errorMessage);
        }
      },
      error: (err: any) => {
        Swal.close();
        let errorMessage = 'Failed to verify OTP.';
        
        // Try to extract the specific error message from the response
        if (err.error && err.error.message) {
          errorMessage = err.error.message;
        } else if (err.error && err.error.error) {
          errorMessage = err.error.error;
        } else if (err.error && typeof err.error === 'string') {
          errorMessage = err.error;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        this.showError(errorMessage);
      }
    });
  }

  registerUser() {
    this.page2Submitted = true;
    // Validate page 2 fields (reuse validatePage2 logic, but don't advance page)
    const requiredFields = [
      'first_name', 'last_name', 'gender', 'country_code', 'contact_number', 
      'country', 'current_professional_status'
    ];
    for (const field of requiredFields) {
      if (!this.formData[field]) {
        this.showError('Please fill all required fields.');
        return;
      }
    }
    const validCountry = this.countries.some(c => c.countryCallingCode === this.formData.country_code);
    if (!validCountry) {
      this.showError('Please select a valid country code from the dropdown.');
      return;
    }
    if (isNaN(Number(this.formData.contact_number))) {
      this.showError('Contact number must be a number.');
      return;
    }
    if (this.formData.country.toLowerCase() === 'india' || this.formData.country === 'ind') {
      if (!this.formData.pin_code || !this.formData.state || !this.formData.city) {
        this.showError('Please fill all required fields for India.');
        return;
      }
    }
    const gccCountries = ['kuw', 'quatar', 'bah', 'oman', 'saudi', 'uae'];
    const countryLower = this.formData.country.toLowerCase();
    if (gccCountries.includes(countryLower) || 
        countryLower.includes('kuwait') || 
        countryLower.includes('qatar') || 
        countryLower.includes('bahrain') || 
        countryLower.includes('oman') || 
        countryLower.includes('saudi') || 
        countryLower.includes('uae') ||
        countryLower.includes('united arab emirates')) {
      Swal.fire({
        icon: 'info',
        title: 'GCC Region',
        text: 'You are more suited for Eureka! GCC',
        background: '#181f2a',
        color: '#fff',
        customClass: {
          popup: 'swal2-poppins',
          title: 'swal2-poppins',
        },
        confirmButtonText: 'OK'
      }).then(() => {
        window.location.href = 'https://www.ecell.in/eurekagcc';
      });
      return;
    }
    if (this.formData.where_did_you_hear === 'CA-NEC') {
      if (!this.caNecIds.caId || !this.caNecIds.necId) {
        this.showError('Please enter both CA ID and NEC ID.');
        return;
      }
    } else if (this.showReferralDropdown && (!this.formData.referral_id || (this.formData.referral_id === 'Other' && !this.formData.referral_other))) {
      this.showError('Please fill the Referral ID field.');
      return;
    }
    if (this.formData.pin_code && this.formData.pin_code.length !== 6) {
      this.showError('Postal code must be exactly 6 digits.');
      return;
    }
    if (this.formData.contact_number && this.formData.contact_number.length > 16) {
      this.showError('Contact number cannot exceed 16 digits.');
      return;
    }
    // Prepare registration data (exclude third page fields)
    const regData = { ...this.formData };
    delete regData.startup_name;
    delete regData.sector_1;
    delete regData.sector_2;
    delete regData.sector_3;
    delete regData.dpiit_registered;
    delete regData.dpiit_recognition_number;
    delete regData.any_other_organization;
    delete regData.name_of_organization;
    delete regData.registration_number_of_organization;
    delete regData.idea_description;
    delete regData.track;
    delete regData.website_url;
    // Handle where_did_you_hear
    if (regData.where_did_you_hear === 'Others') {
      regData.where_did_you_hear = regData.where_did_you_hear_other;
    }
    delete regData.where_did_you_hear_other;
    // Handle referral_other
    if (regData.referral_id === 'Other') {
      regData.referral_id = regData.referral_other;
    }
    delete regData.referral_other;
    Swal.fire({
      title: 'Registering...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); },
      background: '#181f2a', color: '#fff',
      customClass: { popup: 'swal2-poppins', title: 'swal2-poppins' }
    });
    this.api.register(regData).subscribe({
      next: (res: any) => {
        Swal.close();
        const responseData = res.body || res;
        if (responseData.success === true) {
          // Auto-login after registration
          this.api.login(this.formData.email, this.formData.password).subscribe({
            next: (loginRes: any) => {
              if (loginRes.status === 200 && loginRes.body?.success) {
                this.authService.login(loginRes.body.access_token, loginRes.body.email);
              }
              // Move to page 3, scroll to top, show swal
              this.currentPage = 3;
              setTimeout(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, 100);
              Swal.fire({
                icon: 'success',
                title: 'Registration Successful',
                text: 'Your registration is successful, you can skip this for now',
                background: '#181f2a', color: '#fff',
                customClass: { popup: 'swal2-poppins', title: 'swal2-poppins' },
                confirmButtonText: 'OK'
              });
            },
            error: () => {
              // Still move to page 3 even if auto-login fails
              this.currentPage = 3;
              setTimeout(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, 100);
              Swal.fire({
                icon: 'success',
                title: 'Registration Successful',
                text: 'Your registration is successful, you can skip this for now',
                background: '#181f2a', color: '#fff',
                customClass: { popup: 'swal2-poppins', title: 'swal2-poppins' },
                confirmButtonText: 'OK'
              });
            }
          });
        } else {
          this.showError(responseData.error || 'Registration failed.');
        }
      },
      error: (err: any) => {
        Swal.close();
        let errorMessage = 'Registration failed.';
        if (err.error && err.error.error) errorMessage = err.error.error;
        else if (err.error && typeof err.error === 'string') errorMessage = err.error;
        else if (err.message) errorMessage = err.message;
        this.showError(errorMessage);
      }
    });
  }

  submitIdea() {
    this.page3Submitted = true;
    // Validate third page fields
    const requiredFields = ['startup_name', 'sector_1', 'sector_2', 'sector_3', 'idea_description', 'track'];
    for (const field of requiredFields) {
      if (!this.formData[field]) {
        this.showError('Please fill all required fields.');
        return;
      }
    }
    // Ensure sectors are unique (except 'Others')
    const s1 = this.formData.sector_1;
    const s2 = this.formData.sector_2;
    const s3 = this.formData.sector_3;
    if (
      (s1 && s2 && s1 === s2 && s1 !== 'Others') ||
      (s1 && s3 && s1 === s3 && s1 !== 'Others') ||
      (s2 && s3 && s2 === s3 && s2 !== 'Others')
    ) {
      this.showError('Please select different sectors for each field (except Others).');
      return;
    }
    if (this.formData.dpiit_registered === 'yes' && !this.formData.dpiit_recognition_number) {
      this.showError('Please enter DPIIT Recognition Number.');
      return;
    }
    if (this.formData.dpiit_registered === 'no' && this.formData.any_other_organization === 'yes') {
      if (!this.formData.name_of_organization || !this.formData.registration_number_of_organization) {
        this.showError('Please fill organization details.');
        return;
      }
    }
    if (this.formData.website_url) {
      const urlPattern = /^https?:\/\/.+/i;
      if (!urlPattern.test(this.formData.website_url)) {
        this.showError('Please enter a valid Website URL.');
        return;
      }
    }
    // Prepare idea data (only third page fields)
    const ideaData: any = {
      startup_name: this.formData.startup_name,
      sector_1: this.formData.sector_1,
      sector_2: this.formData.sector_2,
      sector_3: this.formData.sector_3,
      dpiit_registered: this.formData.dpiit_registered,
      dpiit_recognition_number: this.formData.dpiit_recognition_number,
      any_other_organization: this.formData.any_other_organization,
      name_of_organization: this.formData.name_of_organization,
      registration_number_of_organization: this.formData.registration_number_of_organization,
      idea_description: this.formData.idea_description,
      track: this.formData.track,
      website_url: this.formData.website_url,
      questionnaire_filled: false
    };
    Swal.fire({
      title: 'Submitting Idea...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); },
      background: '#181f2a', color: '#fff',
      customClass: { popup: 'swal2-poppins', title: 'swal2-poppins' }
    });
    this.api.addIdea(ideaData).subscribe({
      next: (res: any) => {
        Swal.close();
        const responseData = res.body || res;
        if (responseData.success === true) {
          Swal.fire({
            icon: 'success',
            title: 'Idea Added',
            text: 'Your idea has been added successfully! Please fill the questionnaire.',
            background: '#181f2a', color: '#fff',
            customClass: { popup: 'swal2-poppins', title: 'swal2-poppins' },
            confirmButtonText: 'OK'
          }).then(() => {
            // Redirect to questionnaire form
                    this.router.navigate(['/form'], {
                      state: {
                        ideaName: this.formData.startup_name,
                ideaId: responseData.idea_id,
                        showQuestionnaireSwal: true
                      },
                      queryParams: {
                        ideaName: this.formData.startup_name,
                ideaId: responseData.idea_id
                      }
                    });
                });
              } else {
          this.showError(responseData.error || 'Failed to add idea.');
        }
      },
      error: (err: any) => {
        Swal.close();
        let errorMessage = 'Failed to add idea.';
        if (err.error && err.error.error) errorMessage = err.error.error;
        else if (err.error && typeof err.error === 'string') errorMessage = err.error;
        else if (err.message) errorMessage = err.message;
        this.showError(errorMessage);
      }
    });
  }

  skipIdea() {
    this.router.navigate(['/dashboard']);
  }

  // Event Handlers
  onCountryCodeChange() {
    const selectedCountry = this.countries.find(c => c.countryCallingCode === this.formData.country_code);
    if (selectedCountry) {
      // Only auto-populate country if it's empty or if user hasn't manually entered something
      // This allows users to override the auto-populated value
      if (!this.formData.country || this.formData.country.trim() === '') {
        this.formData.country = selectedCountry.countryNameEn;
      }
      
      // Trigger country change handler if not pre-filling
      if (!this.isPrefilling) {
        this.onCountryChange();
      }
    }
  }

  // Method to handle manual country code selection
  onManualCountryCodeChange() {
    // This method is called when user manually changes country code
    this.onCountryCodeChange();
  }

  onCountryChange() {
    // Reset India-specific fields if country changes
    if (this.formData.country !== 'ind') {
      this.formData.state = '';
      this.formData.city = '';
      this.formData.pin_code = '';
      this.postalCodeAutoFilled = false;
    }
  }

  onPostalCodeChange() {
    if (this.formData.pin_code && this.formData.pin_code.length === 6) {
      this.api.getPincodeDetails(this.formData.pin_code).subscribe({
        next: (res: any) => {
          if (res && res.length > 0 && res[0].PostOffice) {
            const postOffice = res[0].PostOffice[0];
            this.formData.state = postOffice.State;
            this.formData.city = postOffice.District;
            this.postalCodeAutoFilled = true;
          }
        },
        error: (err: any) => {
          console.log('Error fetching pincode details:', err);
          this.postalCodeAutoFilled = false;
        }
      });
    } else {
      // Reset the flag if postal code is cleared or incomplete
      this.postalCodeAutoFilled = false;
    }
  }

  onPostalCodeInput() {
    // Clear auto-filled state and city if postal code is being modified
    if (this.postalCodeAutoFilled && this.formData.pin_code.length < 6) {
      this.postalCodeAutoFilled = false;
      this.formData.state = '';
      this.formData.city = '';
    }
  }

  onStateChange() {
    // If state was auto-filled from postal code, prevent manual changes
    if (this.postalCodeAutoFilled) {
      // Revert to the auto-filled value
      this.onPostalCodeChange();
    }
  }

  onCityChange() {
    // If city was auto-filled from postal code, prevent manual changes
    if (this.postalCodeAutoFilled) {
      // Revert to the auto-filled value
      this.onPostalCodeChange();
    }
  }

  onHearAboutChange() {
    const referralDropdownOptions = ['Venture Capitalist', 'TiE', 'Government Partners', 'Incubation Partner'];
    this.showReferralDropdown = referralDropdownOptions.includes(this.formData.where_did_you_hear);
    this.showReferralInput = !this.showReferralDropdown && this.formData.where_did_you_hear !== 'Others';

    if (this.showReferralDropdown) {
      this.loadReferralOptions();
    }
  }

  loadReferralOptions() {
    let apiCall;
    
    switch (this.formData.where_did_you_hear) {
      case 'Venture Capitalist':
        apiCall = this.api.getVentureCapitalist();
        break;
      case 'TiE':
        apiCall = this.api.getTie();
        break;
      case 'Government Partners':
        apiCall = this.api.getGovernment();
        break;
      case 'Incubation Partner':
        apiCall = this.api.getIncubationPartner();
        break;
      default:
        apiCall = this.api.getReferralOptions();
    }

    apiCall.subscribe({
      next: (res: any) => {
        this.referralOptions = res || [];
      },
      error: (err: any) => {
        console.log('Error loading referral options:', err);
        this.referralOptions = [];
      }
    });
  }

  onDpiitChange() {
    // Clear DPIIT recognition number if No is selected
    if (this.formData.dpiit_registered === 'no') {
      this.formData.dpiit_recognition_number = '';
      // Reset other organization fields when DPIIT is No
      this.formData.any_other_organization = '';
      this.formData.name_of_organization = '';
      this.formData.registration_number_of_organization = '';
    }
    // Clear other organization fields if Yes is selected for DPIIT
    if (this.formData.dpiit_registered === 'yes') {
      this.formData.any_other_organization = '';
      this.formData.name_of_organization = '';
      this.formData.registration_number_of_organization = '';
    }
    console.log('Form data after DPIIT change:', this.formData);
  }

  onOtherOrgChange() {
    console.log('Other organization changed to:', this.formData.any_other_organization);
    // Clear organization fields if No is selected
    if (this.formData.any_other_organization === 'no') {
      this.formData.name_of_organization = '';
      this.formData.registration_number_of_organization = '';
    }
    console.log('Form data after other org change:', this.formData);
  }

  onReferralChange() {
    if (this.formData.referral_id !== 'Other') {
      this.formData.referral_other = '';
    }
  }

  // Utility Methods
  showError(message: string) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: message,
      background: '#181f2a',
      color: '#fff',
      customClass: {
        popup: 'swal2-poppins',
        title: 'swal2-poppins',
      }
    });
  }

  // URL validation helper methods
  isValidLinkedInUrl(url: string): boolean {
    const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/.+/i;
    return linkedinPattern.test(url);
  }

  isValidWebsiteUrl(url: string): boolean {
    const urlPattern = /^https?:\/\/.+/i;
    return urlPattern.test(url);
  }

  prefillUserData(userData: any) {
    
    // Set pre-filling flag to prevent unwanted resets
    this.isPrefilling = true;
    
    // Preserve the email that user entered - don't overwrite it
    const currentEmail = this.formData.email;
    
    // Map API response fields to form fields
    if (userData.firstName) {
      this.formData.first_name = userData.firstName;
    }
    if (userData.lastName) {
      this.formData.last_name = userData.lastName;
    }
    if (userData.contact) {
      this.formData.contact_number = userData.contact;
    }
    if (userData.country) {
      this.formData.country = userData.country;
    }
    if (userData.city) {
      this.formData.city = userData.city;
    }
    if (userData.state) {
      this.formData.state = userData.state;
    }
    // this.formData.educational_background = userData.college;
    
    // Ensure email is preserved
    this.formData.email = currentEmail;
    
    // Reset postal code auto-filled flag since this is manual pre-filling
    this.postalCodeAutoFilled = false;
    
    // Reset pre-filling flag after a short delay to allow form to stabilize
    setTimeout(() => {
      this.isPrefilling = false;
      console.log('Set isPrefilling to false');
    }, 100);
  }

  // Handle email changes
  onEmailChange() {
    
    if (this.originalEmail && 
        this.formData.email !== this.originalEmail && 
        this.formData.email !== '' &&
        !this.isPrefilling) {
      this.otpSent = false;
      this.showResend = false;
      this.timer = 0;
      this.otpDigits = ['', '', '', '', '', ''];
      this.originalEmail = '';
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
      }
    } else {
      
    }
  }

  // Helper to check if a sector option should be disabled
  isSectorDisabled(optionValue: string, currentSector: string): boolean {
    if (optionValue === 'Others') return false;
    return (
      (currentSector !== 'sector_1' && this.formData.sector_1 === optionValue) ||
      (currentSector !== 'sector_2' && this.formData.sector_2 === optionValue) ||
      (currentSector !== 'sector_3' && this.formData.sector_3 === optionValue)
    );
  }
}
