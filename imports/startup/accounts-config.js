import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';

Accounts.ui.config({
  passwordSignupFields: 'USERNAME_AND_EMAIL'
})

if(Meteor.isServer){
  Accounts.emailTemplates.siteName = 'JuryRoom';
  Accounts.emailTemplates.from = 'JuryRoom Admin <no-reply@juryroom.com>';
  
  Accounts.emailTemplates.enrollAccount = {
    subject(user){
      return `Welcome to JuryRoom, ${user.profile.name}`;
    },
    text(user, url){
      `Hi ${user.profile.name},
      Thank you for registering to participate in JuryRoom.
  
      To activate your account, simply click the link below
      ${url}`
    }
  }
  
  Accounts.emailTemplates.resetPassword = {
    from(){
      return `JuryRoom Password Reset <no-reply@juryroom.com>`;
    },
    subject(user){
      return `JuryRoom Password Reset`;
    },
    text(user, url){
      `Hi ${user.profile.name},

      To reset your password, simply click the link below.
      ${url}`
    }
  }
}
