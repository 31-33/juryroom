import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Groups } from '/imports/api/Groups';

export const Discussions = new Mongo.Collection('discussions');

if(Meteor.isServer){
  Meteor.publish('discussions', (discussion_id) => {
    return Discussions.find(
      { _id: discussion_id },
      {
        fields: {
          active_replies: 1,
          user_stars: 1,
        }
      }
    );
  });
}

Meteor.methods({
  'discussions.create'(group_id){
    check(group_id, String);

    const discussion_id = Discussions.insert({
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
        $push: {
          discussions: discussion_id
        }
      }
    );

    return discussion_id;
  },
  'discussions.star_comment'(discussion_id, comment_id){
    check(discussion_id, String);
    check(comment_id, String);

    // TODO: ensure current user is participating in discussion
    if(!this.userId){
      throw new Meteor.Error('not-authorized');
    }

    Meteor.call('discussions.remove_star', discussion_id);

    Discussions.update(
      { _id: discussion_id },
      {
        $push: {
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
        $push: {
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

    if(!this.userId){
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
        $push: {
          action_star: {
            user_id: this.userId,
            comment_id: '',
            date_time: new Date(),
          }
        }
      }
    )
  },
  'discussions.reply'(discussion_id, parent_id){
    check(discussion_id, String);
    check(parent_id, String);

    // TODO: ensure current user is participating in discussion
    if(!this.userId){
      throw new Meteor.Error('not-authorized');
    }
    
    // Remove any active replies for this user
    Meteor.call('discussions.closeReply', discussion_id, false);

    // Insert current user replying to specified comment
    Discussions.update(
      { _id: discussion_id },
      {
        $push: {
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
        $push: {
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

    // TODO: ensure current user is participating in discussion
    if(!this.userId){
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
        $push: {
          action_reply: {
            user_id: this.userId,
            date_time: new Date(),
          }
        }
      }
    )
  }
});
