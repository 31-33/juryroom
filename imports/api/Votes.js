import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import Groups from './Groups';

const Votes = new Mongo.Collection('votes');
export default Votes;

if (Meteor.isServer) {
  Meteor.publish('votes', function(discussionId) {
    check(discussionId, String);

    // Check user is in group (or admin)
    if (!Groups.findOne({
      discussions: { $elemMatch: { discussionId } },
      members: this.userId,
    }) && !Roles.userIsInRole(this.userId, 'admin')) {
      throw new Meteor.Error('not-authorized');
    }

    return Votes.find(
      { discussionId },
      {
        fields: {
          discussionId: 1,
          commentId: 1,
          userVotes: 1,
          calledAt: 1,
        },
      },
    );
  });
}
