import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Button, Comment, Header, Icon, Segment } from 'semantic-ui-react';
import { Discussions } from '/imports/api/Discussions';
import { Comments } from '/imports/api/Comments';
import Moment from 'react-moment';

class StarredCommentView extends Component {

  renderStarredComments(starred){
    const currUserID = Meteor.userId();
    return starred.sort((c1, c2) => c2.users.length - c1.users.length)
      .map(data => {
        const comment = this.props.comments.find(comment => comment._id === data.comment_id);
        const userStarred = data.users.some(user => user===currUserID);
        return (
          <Comment key={data.comment_id}>
            <Comment.Content>
              <Comment.Author as="a">
                {comment.author.name}
              </Comment.Author>
              <Comment.Metadata>
                <Moment fromNow>{comment.posted_time}</Moment>
              </Comment.Metadata>
              <Comment.Text>
                {comment.text}
              </Comment.Text>
              <Comment.Actions>
                <Button
                  attached="top"
                  icon="star"
                  color="yellow"
                  content={userStarred ? "Starred" : "Star"}
                  basic={!userStarred}
                  label={{
                    basic: true,
                    color: "yellow",
                    pointing: "left",
                    content: data.users.map(user => user.name).join(', '),
                  }}
                  onClick={() => starComment(this.props.discussion_id, data.comment_id)}
                />
                <Button
                  attached="bottom"
                  icon="exclamation"
                  color="green"
                  content="Call Vote"
                  onClick={() => callVote(this.props.discussion_id, data.comment_id)}
                />
              </Comment.Actions>
            </Comment.Content>
          </Comment>
        );
      });
  }

  render(){
    if(this.props.discussion_state && this.props.discussion_state.user_data){
      const starred_comments = [];
      
      this.props.discussion_state.user_data.forEach(user => {
        if(user.starred){
          const index = starred_comments.findIndex(comment => comment.comment_id === user.starred);
          if(index < 0){
            starred_comments.push({
              comment_id: user.starred,
              users: [{id: user.id, name: user.name}],
            })
          }
          else{
            starred_comments[index].users.push({id: user.id, name: user.name});
          }
        }
      })
      return starred_comments.length > 0 ?
      (
        <Segment>
          <Header>Starred Comments</Header>
          <Comment.Group>
            {this.renderStarredComments(starred_comments)}
          </Comment.Group>
        </Segment>
      ) : '';
    }
    return '';
  }
}

export default withTracker(({discussion_id}) => {
  Meteor.subscribe('comments', discussion_id);
  Meteor.subscribe('discussions', discussion_id);

  return {
    discussion_state: Discussions.findOne(
      { _id: discussion_id },
      { user_data: 1 }
    ),
    comments: Comments.find({
      discussion_id: discussion_id,
    }).fetch(),
  }
})(StarredCommentView);

export function starComment(discussion_id, comment_id){
  Meteor.call('discussions.star_comment', discussion_id, comment_id);
}

export function callVote(discussion_id, comment_id){
  console.log(`${Meteor.userId()} called a vote on comment ${comment_id}`);
}
