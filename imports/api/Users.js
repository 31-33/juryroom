import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import { Accounts } from 'meteor/accounts-base';
import Groups from '/imports/api/Groups';

const chance = require('chance').Chance();

if (Meteor.isServer) {
  Meteor.publish('allUsers', function() {
    if (!Roles.userIsInRole(this.userId, ['admin', 'create-group'])) {
      throw new Meteor.Error('not-authorized');
    }

    return Meteor.users.find(
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
    );
  });

  Meteor.publish(null, function() {
    return Meteor.users.find(
      { _id: this.userId },
      {
        fields: {
          avatar: 1,
        },
      },
    );
  });

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

      let username = '';
      do {
        username = chance.animal({ type: 'ocean' });
        // Generate new names until one that does not exist is found
      } while (Meteor.users.findOne({ username }));

      const userId = Accounts.createUser({ email: emailAddress, username });
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
        username: user.username,
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

      // Store whether user kept their assigned (anonymous) username
      const isAnonymous = user.username === username;
      Meteor.users.update(
        { _id: user._id },
        { $set: { isAnonymous } },
      );

      if (!isAnonymous) {
        Accounts.setUsername(user._id, username);
      }
    },
    'users.getMembersOfGroup'(groupId) {
      check(groupId, String);

      const group = Groups.findOne({ _id: groupId });

      // if (!group.members.includes(this.userId) && !Roles.userIsInRole(this.userId, 'admin')) {
      //   throw new Meteor.Error('not-authorized');
      // }

      return Meteor.users.find(
        { _id: { $in: group.members } },
        {
          fields: {
            username: 1,
            avatar: 1,
          },
        },
      ).fetch();
    },
    'users.getMembersOfDiscussion'(discussionId) {
      check(discussionId, String);

      const group = Groups.findOne(
        { discussions: { $elemMatch: { discussionId } } },
        {
          fields: {
            members: 1,
          },
        },
      );

      return Meteor.users.find(
        { _id: { $in: group.members } },
        {
          fields: {
            username: 1,
            avatar: 1,
          },
        },
      ).fetch();
    },
    'users.getProfile'(userId) {
      check(userId, String);

      const user = Meteor.users.findOne(
        { _id: userId },
        {
          fields: {
            username: 1,
            avatar: 1,
            roles: 1,
            profileInfo: 1,
          },
        },
      );

      let profileInfo = {};
      if (user.profileInfo) {
        if (this.userId === userId) {
          profileInfo = user.profileInfo;
        } else {
          profileInfo = Object.entries(user.profileInfo)
            .filter(entry => entry[1].public === true)
            .reduce((prev, curr) => { prev[curr[0]] = curr[1]; return prev; }, {});
        }
      }
      return {
        ...user,
        profileInfo,
      };
    },
  });
}
