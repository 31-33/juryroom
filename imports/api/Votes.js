import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { Email } from 'meteor/email';
import { check, Match } from 'meteor/check';
import { Roles } from 'meteor/alanning:roles';

import Scenarios from './Scenarios';
import Groups from './Groups';
import Comments from './Comments';
import Discussions, { startNext } from './Discussions';

import VoteNotification from '/imports/ui/EmailTemplates/VoteNotification.jsx';

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
          finished: 1,
        },
      },
    );
  });
}

Meteor.methods({
  'votes.callVote'(discussionId, commentId) {
    check(discussionId, String);
    check(commentId, String);

    const group = Groups.findOne({
      members: this.userId,
      discussions: { $elemMatch: { discussionId } },
    });

    if (!this.userId || !group) {
      throw new Meteor.Error('not-authorized');
    }

    const discussion = Discussions.findOne({ _id: discussionId });
    // Prevent vote if one is already active
    if (discussion.activeVote) {
      throw new Meteor.Error('vote-already-in-progress');
    }

    const comment = Comments.findOne({ _id: commentId });
    // Restrict calling of vote to starred_users
    if (!comment.userStars.some(star => star.userId === this.userId)) {
      throw new Meteor.Error('not-starred');
    }

    // Check that this comment has not already been voted on
    if (Votes.findOne({ commentId })) {
      throw new Meteor.Error('already-voted-on');
    }

    // Create object containing keys for each user in the group
    // Corresponding value (True, False, null) represents that users vote
    const userVotes = group.members.reduce((obj, userId) => {
      // eslint-disable-next-line no-param-reassign
      obj[userId] = null;
      return obj;
    }, {});

    const voteId = Votes.insert({
      commentId,
      discussionId,
      userVotes,
      callerId: this.userId,
      starredBy: comment.userStars.map(star => star.userId),
      calledAt: new Date(),
      finished: false,
    });

    Discussions.update(
      { _id: discussionId },
      {
        $addToSet: {
          votes: {
            voteId,
            commentId,
          },
        },
        $set: {
          activeVote: voteId,
        },
      },
    );

    if (Meteor.isServer) {
      this.unblock();
      const participants = Meteor.users.find(
        { _id: { $in: group.members } },
      ).fetch();
      const caller = participants.find(user => user._id === this.userId);
      const author = participants.find(user => user._id === comment.authorId);
      const scenario = Scenarios.findOne({ _id: discussion.scenarioId });

      Email.send({
        from: 'JuryRoom <no-reply@juryroom.com>',
        bcc: group.members
          .filter(userId => userId !== this.userId) // Send to all users except the caller of vote
          .map(userId => participants.find(user => user._id === userId).emails[0]),
        subject: 'Vote called on JuryRoom',
        html: ReactDOMServer.renderToStaticMarkup(React.createElement(VoteNotification, {
          discussionId, caller, comment, scenario, author,
        })),
      });
    }
  },
  'votes.vote'(voteId, userVote) {
    check(voteId, String);
    check(userVote, Match.OneOf(Boolean, null));

    const currVote = Votes.findOne({ _id: voteId });

    // Ensure vote exists
    if (!currVote) {
      throw new Meteor.Error('vote-not-found');
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

    const setVote = {};
    setVote[`userVotes.${this.userId}`] = userVote;

    Votes.update(
      { _id: voteId },
      {
        $set: setVote,
        $addToSet: {
          voteArchive: {
            userId: this.userId,
            vote: userVote,
            voteTime: new Date(),
          },
        },
      },
    );

    // Check if everyone has voted

    // TODO: move this to on-update method on Votes collection
    // Potential of check-then-act race condition when server is scaled out
    if (Object.entries(currVote.userVotes).every(
      vote => (vote[0] === this.userId && userVote !== null) || vote[1] !== null,
    )) {
      Discussions.update(
        { _id: currVote.discussionId },
        {
          $unset: {
            activeVote: '',
          },
        },
      );
      Votes.update(
        { _id: voteId },
        {
          $set: { finished: true },
        },
      );
      if (Object.entries(currVote.userVotes).every(
        vote => (vote[0] === this.userId && userVote === true) || vote[1] === true,
      )) {
        Discussions.update(
          { _id: currVote.discussionId },
          {
            $set: {
              status: 'finished',
              activeReplies: [],
            },
          },
        );
        startNext(group._id);
      }
    }
  },
});
