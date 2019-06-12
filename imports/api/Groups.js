import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

const Groups = new Mongo.Collection('groups');
export default Groups;

if (Meteor.isServer) {
  Meteor.publish('groups', () => Groups.find(
    { },
    {
      fields: {
        members: 1,
        discussions: 1,
        calledAt: 1,
        // TODO: add fields to track scoring
      },
    },
  ));
}
Meteor.methods({
  'groups.create'(members) {
    check(members, Array);

    return Groups.insert({
      members,
      discussions: [],
      calledAt: new Date(),
    });
  },
});


if (Meteor.isServer) {
  // Create testing group containing all registered users
  if (Groups.find().count() === 0) {
    const allUserIds = Meteor.users.find().fetch().map(user => user._id);
    Meteor.call('groups.create', allUserIds, (groupErr, groupId) => {
      if (groupId) {
        console.log(`Created group: ${groupId} containing all registered users`);
        Meteor.call('discussions.create', groupId, (discussionErr, discussionId) => {
          console.log(`Added discussion: ${discussionId} to group ${groupId}`);
        });
      }
    });
  }
}
