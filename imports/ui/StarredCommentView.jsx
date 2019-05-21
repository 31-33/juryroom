import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Button, Comment, Header, Icon, Segment } from 'semantic-ui-react';
import { Discussions } from '/imports/api/Discussions';
import { Comments } from '/imports/api/Comments';
import Moment from 'react-moment';

class StarredCommentView extends Component {

  renderStarredComments(starred){
    return starred
      .sort((c1, c2) => c2.users.length - c1.users.length)
      .map(starred_comment => {
        const comment_data = this.props.comments.find(comment => comment._id == starred_comment.comment_id);
        const author = this.props.participants.find(user => user._id === comment_data.author_id);
        const starred = starred_comment.users.includes(Meteor.userId());
        return (
          <Comment key={starred_comment.comment_id}>
            <Comment.Content>
              <Comment.Author as="a">
                {author.username}
              </Comment.Author>
              <Comment.Metadata>
                  <Moment fromNow>{comment_data.posted_time}</Moment>
              </Comment.Metadata>
              <Comment.Text>
                {comment_data.text}
              </Comment.Text>
              <Comment.Actions>
                <Button
                  attached="top"
                  icon="star"
                  color="yellow"
                  content={starred ? "Starred" : "Star"}
                  basic={!starred}
                  label={{
                    basic: true,
                    color: "yellow",
                    pointing: "left",
                    content: starred_comment.users.map(user_id => this.props.participants.find(user => user._id === user_id).username).join(', ')
                  }}
                  onClick={() => starred ? 
                    unstarComment(this.props.discussion_id) : 
                    starComment(this.props.discussion_id, comment_data._id)}
                  />
                <Button
                  attached="bottom"
                  icon="exclamation"
                  color="green"
                  content="Call Vote"
                  onClick={() => callVote(this.props.discussion_id, comment_data._id)}
                  />
              </Comment.Actions>
            </Comment.Content>
          </Comment>
        );
      });
  }

  render(){
    if(this.props.userStars.length > 0){
      const comments = [];
      this.props.userStars.forEach(star => {
        const index = comments.findIndex(comment => comment.comment_id === star.comment_id);
        if(index < 0){
          comments.push({
            comment_id: star.comment_id,
            users: [star.user_id],
          });
        }
        else{
          comments[index].users.push(star.user_id);
        }
      });
      return (
        <Segment>
          <Header>Starred Comments</Header>
          <Comment.Group>
            {this.renderStarredComments(comments)}
          </Comment.Group>
        </Segment>
      )
    }
    else return '';
  }
}

export default withTracker(({discussion_id}) => {
  Meteor.subscribe('comments', discussion_id);
  Meteor.subscribe('discussions', discussion_id);

  const discussion = Discussions.findOne(
    { _id: discussion_id },
    { _id: 1, active_replies: 0, user_stars: 1 }
  );
  return {
    participants: Meteor.users.find({}).fetch(),
    userStars: discussion ? discussion.user_stars : [], 
    comments: Comments.find({
      discussion_id: discussion_id,
    }).fetch(),
  }
})(StarredCommentView);

export function starComment(discussion_id, comment_id){
  Meteor.call('discussions.star_comment', discussion_id, comment_id);
}

export function unstarComment(discussion_id){
  Meteor.call('discussions.remove_star', discussion_id);
}

export function callVote(discussion_id, comment_id){
  console.log(`${Meteor.userId()} called a vote on comment ${comment_id}`);
}
