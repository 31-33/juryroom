import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  register(user){
    user.password = user.passwords.password;
    delete user.passwords;

    return this.http.post('/users/register', user);
  }
}
