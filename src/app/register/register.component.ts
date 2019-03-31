import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../_services/user.service';
import { AuthenticationService } from '../_services/authentication.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  submitted = false;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private userService: UserService
  ) {

    // user already logged in--redirect to root page
    // if(this.authenticationService.currentUserValue){
    //   this.router.navigate(['/']);
    // }
  }

  ngOnInit() {
    this.registerForm = new FormGroup({
      username: new FormControl('', [Validators.required, Validators.maxLength(20), Validators.minLength(4)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      passwords: new FormGroup({
        password: new FormControl('', [Validators.required, Validators.maxLength(256), Validators.minLength(8)]),
        password_confirm: new FormControl('')
      }, this.checkPasswords),
      fullname: new FormControl('', Validators.maxLength(20)),
      date_of_birth: new FormControl('', Validators.required),
      gender: new FormControl('', Validators.maxLength(20)),
      ethnicity: new FormControl('', Validators.maxLength(20)),
      religion: new FormControl('', Validators.maxLength(20)),
      tc_agree: new FormControl('', Validators.requiredTrue)
    });
  }
  checkPasswords(group: FormGroup) {
    return group.get('password').value === group.get('password_confirm').value ? null : {notSame: true};
  }
  get f() { return this.registerForm.controls; }

  onSubmit(){
    this.submitted = true;
    if(this.registerForm.invalid){
      return;
    }

    this.userService.register(this.registerForm.value)
      .pipe(first())
      .subscribe(
        data => {
          // Registration successful
          this.router.navigate(['/login']);
        },
        error => {
          // Registration failed...
        }
      )

    this.router.navigate(["/"]);
  }
}
