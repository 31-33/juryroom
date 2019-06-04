import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Groups = new Mongo.Collection('groups');

if(Meteor.isServer){
  Meteor.publish('groups', () => {
    return Groups.find(
      { },
      {
        fields: {
          members: 1,
          discussions: 1,
          created_at: 1,
          //TODO: add fields to track scoring
        }
      }
    );
  });
}
Meteor.methods({
  'groups.create'(members){
    check(members, Array);

    return Groups.insert({
      members: members,
      discussions: [],
      created_at: new Date(),
    })
  }
});


if(Meteor.isServer){
  // Create testing group containing all registered users
  if(Groups.find().count() === 0){
    const allUserIds = Meteor.users.find().fetch().map(user => user._id);
    Meteor.call('groups.create', allUserIds, (err, group_id) => {
      if(group_id){
        console.log(`Created group: ${group_id} containing all registered users`)
        Meteor.call('discussions.create', group_id, (err, discussion_id) => {
          console.log(`Added discussion: ${discussion_id} to group ${group_id}`);
        });
      }
    });
  }
}


