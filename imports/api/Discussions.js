import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';
import _ from 'lodash';
import ScenarioSets from '/imports/api/ScenarioSets';
import Groups from '/imports/api/Groups';
import Votes from '/imports/api/Votes';

const Discussions = new Mongo.Collection('discussions');
export default Discussions;

if (Meteor.isServer) {
  Meteor.publish('discussions', () => Discussions.find(
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
      },
    },
  ));
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
  'groups.create'(members, scenarioSetId) {
    check(members, Array);
    check(scenarioSetId, String);

    if (!Roles.userIsInRole(this.userId, ['admin', 'create-group'])) {
      throw new Meteor.Error('not-authorized');
    }

    const groupId = Groups.insert({
      members,
      scenarioSetId,
      discussions: [],
      createdAt: new Date(),
      createdBy: this.userId,
    });

    if (Meteor.isServer) {
      startNext(groupId);
    }
  },
  'discussions.star_comment'(discussionId, commentId) {
    check(discussionId, String);
    check(commentId, String);

    if (!isDiscussionParticipant(this.userId, discussionId)) {
      throw new Meteor.Error('not-authorized');
    }

    Meteor.call('discussions.remove_star', discussionId);

    Discussions.update(
      { _id: discussionId },
      {
        $addToSet: {
          userStars: {
            userId: this.userId,
            commentId,
          },
        },
      },
    );

    // Write this action to persistant storage
    Discussions.update(
      { _id: discussionId },
      {
        $addToSet: {
          actionStar: {
            userId: this.userId,
            commentId,
            dateTime: new Date(),
          },
        },
      },
    );
  },
  'discussions.remove_star'(discussionId) {
    check(discussionId, String);

    if (!isDiscussionParticipant(this.userId, discussionId)) {
      throw new Meteor.Error('not-authorized');
    }

    Discussions.update(
      { _id: discussionId },
      {
        $pull: {
          userStars: {
            userId: this.userId,
          },
        },
      },
    );

    // Write to persistant storage
    Discussions.update(
      { _id: discussionId },
      {
        $addToSet: {
          actionStar: {
            userId: this.userId,
            dateTime: new Date(),
          },
        },
      },
    );
  },
  'discussions.reply'(discussionId, parentId) {
    check(discussionId, String);
    check(parentId, String);

    if (!isDiscussionParticipant(this.userId, discussionId)) {
      throw new Meteor.Error('not-authorized');
    }

    // Remove any active replies for this user
    Meteor.call('discussions.closeReply', discussionId);

    // Insert current user replying to specified comment
    Discussions.update(
      { _id: discussionId },
      {
        $addToSet: {
          activeReplies: {
            userId: this.userId,
            parentId,
          },
        },
      },
    );

    // Persist this action
    Discussions.update(
      { _id: discussionId },
      {
        $addToSet: {
          actionReply: {
            userId: this.userId,
            parentId,
            dateTime: new Date(),
          },
        },
      },
    );
  },
  'discussions.closeReply'(discussionId) {
    check(discussionId, String);

    if (!isDiscussionParticipant(this.userId, discussionId)) {
      throw new Meteor.Error('not-authorized');
    }

    Discussions.update(
      { _id: discussionId },
      {
        $pull: {
          activeReplies: {
            userId: this.userId,
          },
        },
      },
    );

    Discussions.update(
      { _id: discussionId },
      {
        $addToSet: {
          actionReply: {
            userId: this.userId,
            dateTime: new Date(),
          },
        },
      },
    );
  },
  'discussions.callVote'(discussionId, commentId, starredUsers) {
    check(discussionId, String);
    check(commentId, String);
    check(starredUsers, Array);

    if (!isDiscussionParticipant(this.userId, discussionId)) {
      throw new Meteor.Error('not-authorized');
    }

    // Prevent vote if one is already active
    if (Discussions.findOne({ _id: discussionId }).active_vote) {
      throw new Meteor.Error('vote-already-in-progress');
    }

    // Restrict calling of vote to starred_users
    if (!starredUsers.includes(this.userId)) {
      throw new Meteor.Error('not-starred');
    }

    // Check that this comment has not already been voted on
    if (Votes.findOne({ commentId })) {
      throw new Meteor.Error('already-voted-on');
    }

    const voteId = Votes.insert({
      commentId,
      discussionId,
      userVotes: [],
      callerId: this.userId,
      starredBy: starredUsers,
      calledAt: new Date(),
    });

    Discussions.update(
      { _id: discussionId },
      {
        $addToSet: {
          votes: voteId,
        },
        $set: {
          activeVote: voteId,
        },
      },
    );
  },
  'votes.vote'(voteId, userVote) {
    check(voteId, String);
    check(userVote, Boolean);

    const currVote = Votes.findOne({ _id: voteId });

    // Ensure vote exists
    if (!currVote) {
      throw new Meteor.Error('vote-not-found');
    }

    // Check user has not already voted
    if (currVote.userVotes.some(vote => vote.userId === this.userId)) {
      throw new Meteor.Error('already-voted');
    }

    // Check vote is active
    const discussion = Discussions.findOne(
      { _id: currVote.discussionId },
      { fields: { activeVote: 1, groupId: 1 } },
    );
    if (discussion.activeVote !== voteId) {
      throw new Meteor.Error('vote-not-active');
    }

    // Check user is part of group
    const group = Groups.findOne({ _id: discussion.groupId });
    if (!group || !group.members.includes(this.userId)) {
      throw new Meteor.Error('not-authorized');
    }

    Votes.update(
      { _id: voteId },
      {
        $addToSet: {
          userVotes: {
            userId: this.userId,
            vote: userVote,
          },
        },
      },
    );

    // Check if everyone has voted
    if (group.members.every(user => user === this.userId
      || currVote.userVotes.some(vote => vote.userId === user))) {
      Discussions.update(
        { _id: currVote.discussionId },
        {
          $unset: {
            activeVote: '',
          },
        },
      );
      if (userVote && currVote.userVotes.every(vote => vote.vote)) {
        Discussions.update(
          { _id: currVote.discussionId },
          {
            $set: { status: 'finished' },
          },
        );
        startNext(group._id);
      }
    }
  },
});
