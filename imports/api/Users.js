import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

if (Meteor.isServer) {
  Meteor.publish('users', () => Meteor.users.find(
    { },
    // Publish only selected fields
    {
      fields: {
        username: 1,
        avatar: 1,
        roles: 1,
      },
    },
  ));
}

Meteor.methods({
  'users.updateProfile'(avatar) {
    check(avatar, String);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized');
    }

    Meteor.users.update(
      { _id: this.userId },
      {
        $set: {
          avatar,
        },
      },
    );
  },
});
