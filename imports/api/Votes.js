import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';
import { Groups } from '/imports/api/Groups';

import { isDiscussionParticipant } from './Discussions';

export const Votes = new Mongo.Collection('votes');

if(Meteor.isServer){
    Meteor.publish('votes', () => {
        return Votes.find(
            { },
            {
                fields: {
                    discussion_id: 1,
                    comment_id: 1,
                    user_votes: 1,
                    caller_id: 0,
                    starred_by: 0,
                    date_time: 1,
                }
            }
        )
    })
}

if(Meteor.isClient){
    Meteor.subscribe('groups');
}

Meteor.methods({
    'votes.vote'(vote_id, user_vote){
        check(vote_id, String);
        check(vote, Boolean);

        const curr_vote = Votes.findOne({ _id: vote_id });

        // Ensure vote exists
        if(!curr_vote){
            throw new Meteor.Error('vote-not-found');
        }

        // Check user has not already voted
        if(curr_vote.user_votes.some(vote => vote.user_id === this.userId)){
            throw new Meteor.Error('already-voted');
        }

        // Check vote is active
        const discussion = Discussions.findOne({ _id: vote.discussion_id });
        if(discussion.active_vote !== vote_id){
            throw new Meteor.Error('vote-not-active');
        }

        // Check user is part of group
        const group = Groups.findOne({ discussions: discussion._id });
        if(!group || !group.members.includes(this.userId)){
            throw new Meteor.Error('not-authorized');
        }

        Votes.update(
            { _id: vote_id },
            {
                $addToSet: {
                    user_votes: {
                        user_id: this.userId,
                        vote: user_vote,
                    }
                }
            }
        )

        // Check if everyone has voted
        if(group.members.every(user => {
            vote.user_votes.some(vote => vote.user_id === user._id) ||
            user._id === this.userId
        })){
            if(user_vote && vote.uservotes.every(vote => vote)){
                // TODO: end discussion on vote success
            }
            Discussions.update(
                { _id: vote.discussion_id },
                {
                    $unset: {
                        active_vote: '',
                    }
                }
            )
        }
    }
})