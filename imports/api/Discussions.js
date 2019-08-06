import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check, Match } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import _ from 'lodash';
import ScenarioSets from '/imports/api/ScenarioSets';
import Groups from '/imports/api/Groups';

const Discussions = new Mongo.Collection('discussions');
export default Discussions;

if (Meteor.isServer) {
  Meteor.publish('discussions', function() {
    return Discussions.find(
      { },
      {
        fields: {
          createdAt: 1,
          groupId: 1,
          scenarioId: 1,
          activeReplies: 1,
          userStars: 1,
          votes: 1,
          activeVote: 1,
          status: 1,
          commentLengthLimit: 1,
          deadline: 1,
        },
      },
    );
  });
}
if (Meteor.isClient) {
  Meteor.subscribe('groups');
  Meteor.subscribe('scenarioSets');
}

export function isDiscussionParticipant(userId, discussionId) {
  return !!(userId && Groups.find({
    members: userId,
    discussions: { $elemMatch: { discussionId } },
  }).count() > 0);
}

export function startNext(groupId) {
  if (!Meteor.isServer) {
    return;
  }
  check(groupId, String);

  const group = Groups.findOne({ _id: groupId });
  const scenarioSet = ScenarioSets.findOne({ _id: group.scenarioSetId });
  const remainingScenarios = scenarioSet.scenarios.filter(
    scenario => !group.discussions.some(discussion => discussion.scenarioId === scenario),
  );

  let deadline;
  if (group.maxDiscussionDuration) {
    deadline = new Date();
    deadline.setMinutes(0);
    deadline.setSeconds(group.maxDiscussionDuration);
  }

  if (remainingScenarios.length === 0) {
    // TODO: handle last discussion in set completed...
  } else {
    const newScenarioId = scenarioSet.ordered
      ? remainingScenarios[0] : _.sample(remainingScenarios);
    const newDiscussionId = Discussions.insert({
      createdAt: new Date(),
      scenarioId: newScenarioId,
      groupId,
      activeReplies: [],
      userStars: [],
      actionStar: [],
      actionReply: [],
      actionCollapse: [],
      votes: [],
      status: 'active',
      commentLengthLimit: group.commentLengthLimit,
      deadline,
    });

    Groups.update(
      { _id: groupId },
      {
        $addToSet: {
          discussions: {
            scenarioId: newScenarioId,
            discussionId: newDiscussionId,
          },
        },
      },
    );
  }
}

Meteor.methods({
  'groups.create'(members, scenarioSetId, options) {
    check(members, Array);
    check(scenarioSetId, String);
    check(options, Match.Where((config) => {
      if (typeof config !== 'object') return false;

      if (config.commentLengthLimit !== undefined
        && typeof config.commentLengthLimit !== 'number') {
        return false;
      }
      if (config.maxDiscussionDuration !== undefined
        && typeof config.maxDiscussionDuration !== 'number') {
        return false;
      }

      return true;
    }));

    if (!Roles.userIsInRole(this.userId, ['admin', 'create-group'])) {
      throw new Meteor.Error('not-authorized');
    }

    const groupId = Groups.insert({
      members,
      scenarioSetId,
      discussions: [],
      createdAt: new Date(),
      createdBy: this.userId,
      commentLengthLimit: options.commentLengthLimit,
      maxDiscussionDuration: options.maxDiscussionDuration,
    });

    if (Meteor.isServer) {
      startNext(groupId);
    }

    return groupId;
  },
});
