import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Discussions = new Mongo.Collection('discussions');

if(Meteor.isServer){
  //TODO: ensure user is participating in discussion_id
  Meteor.publish('discussions', (discussion_id) => {
    return Discussions.find({
      _id: discussion_id,
    });
  });

  // Create discussion 0 for testing purposes
  if(Discussions.find().count() === 0){
    Discussions.insert({
      _id: '0',
      active_replies: [],
      user_stars: [],
    });
  }
}

Meteor.methods({
  'discussions.create'(users){
    check(users, Array);

    const discussion = Discussions.insert({
      user_data: users,
    });
    // TODO: return discussion id
    console.log(discussion._id);
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
  },
  'discussions.reply'(discussion_id, parent_id){
    check(discussion_id, String);
    check(parent_id, String);

    // TODO: ensure current user is participating in discussion
    if(!this.userId){
      throw new Meteor.Error('not-authorized');
    }
    
    // Remove any active replies for this user
    Meteor.call('discussions.closeReply', discussion_id);

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
  }
});
