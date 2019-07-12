import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import { Accounts } from 'meteor/accounts-base';

if (Meteor.isServer) {
  Meteor.publish('users', () => Meteor.users.find(
    { },
    // Publish only selected fields
    {
      fields: {
        username: 1,
        emails: 1,
        avatar: 1,
        roles: 1,
        profileInfo: 1,
      },
    },
  ));
}

Meteor.methods({
  'users.updateProfile'(avatar, profileInfo) {
    check(avatar, String);
    check(profileInfo, Match.Where((info) => {
      if (typeof info !== 'object' && info !== undefined) {
        return false;
      }
      return Object.entries(info).every(
        kvp => kvp.length === 2
        && typeof kvp[0] === 'string'
        && typeof kvp[1] === 'object'
        && typeof kvp[1].public === 'boolean',
      );
    }));

    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Meteor.users.update(
      { _id: this.userId },
      {
        $set: {
          avatar,
          profileInfo,
        },
      },
    );
  },
  'users.enrolNewUser'(emailAddress) {
    check(emailAddress, String);

    if (!Roles.userIsInRole(this.userId, ['admin', 'create-group'])) {
      throw new Meteor.Error('not-authorized');
    }

    const userId = Accounts.createUser({ email: emailAddress });
    Accounts.sendEnrollmentEmail(userId);
    return userId;
  },
  'users.doesUsernameExist'(username) {
    check(username, String);

    return !!Meteor.users.findOne({ username });
  },
  'users.getFromResetToken'(token) {
    check(token, String);

    const user = Meteor.users.findOne({ 'services.password.reset.token': token });

    if (!user) {
      throw new Meteor.Error(403, 'Token expired');
    }

    const { when, reason } = user.services.password.reset;
    const now = Date.now();
    // eslint-disable-next-line no-underscore-dangle
    const tokenLifetime = (reason === 'enroll') ? Accounts._getPasswordEnrollTokenLifetimeMs() : Accounts._getPasswordResetTokenLifetimeMs();

    if ((now - when) > tokenLifetime) {
      throw new Meteor.Error(403, 'Token expired');
    }

    return {
      _id: user._id,
      emails: user.emails,
    };
  },
  'users.setUsernameOnEnroll'(token, username) {
    check(token, String);
    check(username, String);

    const user = Meteor.users.findOne({ 'services.password.reset.token': token });

    if (!user) {
      throw new Meteor.Error(403, 'Token expired');
    }

    const { when, reason } = user.services.password.reset;
    if (reason !== 'enroll') {
      throw new Meteor.Error('not-authorized');
    }

    const now = Date.now();
    // eslint-disable-next-line no-underscore-dangle
    const tokenLifetime = (reason === 'enroll') ? Accounts._getPasswordEnrollTokenLifetimeMs() : Accounts._getPasswordResetTokenLifetimeMs();

    if ((now - when) > tokenLifetime) {
      throw new Meteor.Error(403, 'Token expired');
    }

    Accounts.setUsername(user._id, username);
  },
});
