import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthenticationService } from '../_services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  submitted = false;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService
  ) {

    // already logged in--redirect to root page
    // if(this.authenticationService.currentUser){
    //   this.router.navigate(['/']);
    // }
   }
  ngOnInit() {
    this.loginForm = new FormGroup({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  get f() { return this.loginForm.controls; }


  onSubmit() {
    this.submitted = true;

    if(this.loginForm.invalid) {
      return;
    }
    // this.authService.login(this.f.username.value, this.f.password.value);

    this.router.navigate(["/"]);
  }
}
