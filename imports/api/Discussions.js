import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Groups } from '/imports/api/Groups';
import { Votes } from '/imports/api/Votes';
import { comment } from 'postcss';

export const Discussions = new Mongo.Collection('discussions');

if(Meteor.isServer){
  Meteor.publish('discussions', () => {
    return Discussions.find(
      { },
      {
        fields: {
          group_id: 1,
          active_replies: 1,
          user_stars: 1,
          created_at: 1,
          votes: 1,
          active_vote: 1,
        }
      }
    );
  });
}
if(Meteor.isClient){
  Meteor.subscribe('groups');
}

export function isDiscussionParticipant(user_id, discussion_id){
  return user_id && Groups.find({
    members: user_id,
    discussions: discussion_id,
  }).count() > 0 ? true : false;
}

Meteor.methods({
  'discussions.create'(group_id){
    check(group_id, String);

    const discussion_id = Discussions.insert({
      created_at: new Date(),
      group_id: group_id,
      active_replies: [],
      user_stars: [],
      action_star: [],
      action_reply: [],
      action_collapse: [],
    });

    Groups.update(
      { _id: group_id },
      { 
        $addToSet: {
          discussions: discussion_id
        }
      }
    );

    return discussion_id;
  },
  'discussions.star_comment'(discussion_id, comment_id){
    check(discussion_id, String);
    check(comment_id, String);

    if(!isDiscussionParticipant(this.userId, discussion_id)){
      throw new Meteor.Error('not-authorized');
    }

    Meteor.call('discussions.remove_star', discussion_id);

    Discussions.update(
      { _id: discussion_id },
      {
        $addToSet: {
          user_stars: { 
            user_id: this.userId,
            comment_id: comment_id,
          }
        }
      }
    );

    // Write this action to persistant storage
    Discussions.update(
      { _id: discussion_id },
      {
        $addToSet: {
          action_star: {
            user_id: this.userId,
            comment_id: comment_id,
            date_time: new Date(),
          }
        }
      }
    )
  },
  'discussions.remove_star'(discussion_id){
    check(discussion_id, String);

    if(!isDiscussionParticipant(this.userId, discussion_id)){
      throw new Meteor.Error('not-authorized');
    }
    
    Discussions.update(
      { _id: discussion_id },
      { 
        $pull: { 
          user_stars: { 
            user_id: this.userId
          } 
        } 
      }
    )

    // Write to persistant storage
    Discussions.update(
      { _id: discussion_id },
      {
        $addToSet: {
          action_star: {
            user_id: this.userId,
            date_time: new Date(),
          }
        }
      }
    )
  },
  'discussions.reply'(discussion_id, parent_id){
    check(discussion_id, String);
    check(parent_id, String);

    if(!isDiscussionParticipant(this.userId, discussion_id)){
      throw new Meteor.Error('not-authorized');
    }
    
    // Remove any active replies for this user
    Meteor.call('discussions.closeReply', discussion_id, false);

    // Insert current user replying to specified comment
    Discussions.update(
      { _id: discussion_id },
      {
        $addToSet: {
          active_replies: {
            user_id: this.userId,
            parent_id: parent_id
          }
        }
      }
    );

    // Persist this action
    Discussions.update(
      { _id: discussion_id },
      {
        $addToSet: {
          action_reply: {
            user_id: this.userId,
            parent_id: parent_id,
            date_time: new Date(),
          }
        }
      }
    )
  },
  'discussions.closeReply'(discussion_id){
    check(discussion_id, String);

    if(!isDiscussionParticipant(this.userId, discussion_id)){
      throw new Meteor.Error('not-authorized');
    }
    
    Discussions.update(
      { _id: discussion_id },
      {
        $pull: {
          active_replies: {
            user_id: this.userId
          }
        }
      }
    );

    Discussions.update(
      { _id: discussion_id },
      {
        $addToSet: {
          action_reply: {
            user_id: this.userId,
            date_time: new Date(),
          }
        }
      }
    )
  },
  'discussions.callVote'(discussion_id, comment_id, starred_users){
    check(discussion_id, String);
    check(comment_id, String);
    check(starred_users, Array);

    if(!isDiscussionParticipant(this.userId, discussion_id)){
      throw new Meteor.Error('not-authorized');
    }

    // Prevent vote if one is already active
    if(Discussions.findOne({ _id: discussion_id }).active_vote){
      throw new Meteor.Error('vote-already-in-progress');
    }

    // Restrict calling of vote to starred_users
    if(!starred_users.includes(this.userId)){
      throw new Meteor.Error('not-starred');
    }

    // Check that this comment has not already been voted on
    if(Votes.findOne({ comment_id: comment_id })){
      throw new Meteor.Error('already-voted-on');
    }

    const vote_id = Votes.insert({
      discussion_id: discussion_id,
      comment_id: comment_id,
      user_votes: [],
      caller_id: this.userId,
      starred_by: starred_users,
      date_time: new Date(),
    })

    Discussions.update(
      { _id: discussion_id },
      {
        $addToSet: {
          votes: vote_id,
        },
        $set: {
          active_vote: vote_id,
        }
      }
    )
  }
});
