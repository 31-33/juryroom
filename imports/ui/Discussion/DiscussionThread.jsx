import React, { Component, createRef } from 'react';
import { Button, Comment, Container, Rail, Ref, Segment, Sticky } from 'semantic-ui-react';
import { Meteor } from 'meteor/meteor';
import { Comments } from '/imports/api/Comments';
import { Discussions } from '/imports/api/Discussions';
import { withTracker } from 'meteor/react-meteor-data';
import CommentView from './CommentView';
import CommentForm, { openCommentForm } from './CommentForm';
import StarredCommentView from './StarredCommentView';

class DiscussionThread extends Component{
  contextRef = createRef();

  renderComments(){
    return this.props.comments.map(comment =>  {
      return (
        <CommentView
          key={comment._id}
          discussion_id={this.props.discussion_id}
          comment={comment}
        />
      )
    });
  }

  renderUserReplyingStatus(){
    const userList = this.props.replyingUsers
      .filter(reply => reply.user_id !== Meteor.userId() && reply.parent_id === '')
      .map(reply => this.props.participants.find(user => user._id === reply.user_id).username);

    return userList.length > 0 ?
    (
      <Container>
        <strong>{userList.join(', ')} is commenting</strong>
      </Container>
    ): '';
  }

  renderCommentForm(){
    return this.props.replyingUsers.some(reply => reply.user_id === Meteor.userId() && reply.parent_id === '') ?
      (
        <CommentForm discussion_id={this.props.discussion_id} />
      ) :
      (
        <Button primary onClick={() => openCommentForm(this.props.discussion_id, '')}>
            Post
        </Button>
      )
  }

  render(){
    return (
      <Ref innerRef={this.contextRef}>
        <Segment>
          <Comment.Group threaded={true}>
            {this.renderComments()}
            {this.renderUserReplyingStatus()}
          </Comment.Group>
          {this.renderCommentForm()}
          <Rail position='left'>
            <Sticky context={this.contextRef} offset={80}>
              <StarredCommentView discussion_id={this.props.discussion_id} />
            </Sticky>
          </Rail>
          <Rail position='right'>
            <Sticky context={this.contextRef} offset={80}>
              <Segment>Discussion history / navigation bar here</Segment>
            </Sticky>
          </Rail>
        </Segment>
      </Ref>
    );
  }
}

export default withTracker(({match}) => {
  const discussion_id = match.params.discussion_id;
  Meteor.subscribe('comments', discussion_id, '');
  Meteor.subscribe('discussions');
  Meteor.subscribe('discussionParticipants');

  const discussion = Discussions.findOne(
    { _id: discussion_id },
    { fields: { active_replies: 1 } }
  );
  return {
    discussion_id: discussion_id,
    comments: Comments.find(
      {
        discussion_id: discussion_id,
        parent_id: '',
      },
      { sort: { posted_time: 1 } },
    ).fetch(),
    replyingUsers: discussion ? discussion.active_replies : [],
    participants: Meteor.users.find({}).fetch(),
  }
})(DiscussionThread);
