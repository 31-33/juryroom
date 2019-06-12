import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';

if (Meteor.isClient) {
  Accounts.ui.config({
    passwordSignupFields: 'USERNAME_AND_EMAIL',
  });
}

if (Meteor.isServer) {
  Accounts.config({
    ambiguousErrorMessages: true,
    sendVerificationEmail: true,
  });

  Accounts.emailTemplates.siteName = 'JuryRoom';
  Accounts.emailTemplates.from = 'JuryRoom Admin <no-reply@juryroom.com>';

  Accounts.emailTemplates.verifyEmail = {
    subject(user) {
      return `Welcome to JuryRoom, ${user.username}`;
    },
    text(user, url) {
      return `Hi ${user.username},
      Thank you for registering to participate in JuryRoom.
  
      To activate your account, simply click the link below
      ${url}`;
    },
  };

  Accounts.emailTemplates.resetPassword = {
    from() {
      return 'JuryRoom Password Reset <no-reply@juryroom.com>';
    },
    subject() {
      return 'JuryRoom Password Reset';
    },
    text(user, url) {
      return `Hi ${user.username},

      To reset your password, simply click the link below.
      ${url}`;
    },
  };
}
