import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Roles } from 'meteor/alanning:roles';

const Groups = new Mongo.Collection('groups');
export default Groups;

if (Meteor.isServer) {
  Meteor.publish('groups', function() {
    return Roles.userIsInRole(this.userId, 'admin')
      ? Groups.find(
        {},
        {
          fields: {
            members: 1,
            scenarioSetId: 1,
            discussions: 1,
            createdAt: 1,
          },
        },
      )
      : Groups.find(
        { members: this.userId },
        {
          fields: {
            members: 1,
            scenarioSetId: 1,
            discussions: 1,
            createdAt: 1,
            // TODO: add fields to track scoring
          },
        },
      );
  });
}
