import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Button, Comment, Header, Label, Segment } from 'semantic-ui-react';
import { Discussions } from '/imports/api/Discussions';
import { Comments } from '/imports/api/Comments';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';
var scrollToElement = require('scroll-to-element');

class StarredCommentView extends Component {

  renderStarredComments(starredComments){
    return starredComments
      .sort((c1, c2) => c2.users.length - c1.users.length)
      .map(starred_comment => {
        const comment_data = this.props.comments.find(comment => comment._id == starred_comment.comment_id) || {};
        const author = this.props.participants.find(user => user._id === comment_data.author_id) || {};
        const isStarred = starred_comment.users.includes(Meteor.userId());
        return (
          <Comment key={starred_comment.comment_id}>
            <Comment.Content>
              <Comment.Author as={Link} to={`/user/${author._id}`}>
                {author.username}
              </Comment.Author>
              <Comment.Metadata>
                  <Moment fromNow>{comment_data.posted_time}</Moment>
                  <Label basic as="a" onClick={() => 
                    scrollToElement(`#${starred_comment.comment_id}`,
                    {
                      align: "top",
                      offset: -120,
                    })}>Show</Label>
              </Comment.Metadata>
              <Comment.Text>
                {comment_data.text}
              </Comment.Text>
              <Comment.Actions>
                <Button
                  attached="top"
                  icon="star"
                  color="yellow"
                  content={isStarred ? "Starred" : "Star"}
                  basic={!isStarred}
                  label={{
                    basic: true,
                    color: "yellow",
                    pointing: "left",
                    content: starred_comment.users.map(user_id => this.props.participants.find(user => user._id === user_id).username).join(', ')
                  }}
                  onClick={() => isStarred ? 
                    Meteor.call('discussions.remove_star', this.props.discussion._id) : 
                    Meteor.call('discussions.star_comment', this.props.discussion._id, comment_data._id)
                  }
                  />
                <Button
                  disabled={!!this.props.active_vote || !starred_comment.users.some(user => user === Meteor.userId())}
                  attached="bottom"
                  icon="exclamation"
                  color="green"
                  content="Call Vote"
                  onClick={() => Meteor.call('discussions.callVote', this.props.discussion._id, comment_data._id, starred_comment.users)}
                  />
              </Comment.Actions>
            </Comment.Content>
          </Comment>
        );
      });
  }

  render(){
    const comments = [];
    this.props.discussion.user_stars.forEach(star => {
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
}

export default withTracker(({discussion}) => {
  Meteor.subscribe('comments', discussion._id);
  return {
    comments: Comments.find({
      discussion_id: discussion._id,
      _id: { $in: discussion.user_stars.map(star => star.comment_id) }
    }).fetch(),
  }
})(StarredCommentView);
