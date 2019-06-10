import React, { Component, createRef } from 'react';
import { Button, Comment, Container, Rail, Ref, Segment, Sticky, Dimmer, Loader } from 'semantic-ui-react';
import { Meteor } from 'meteor/meteor';
import { Comments } from '/imports/api/Comments';
import { Discussions } from '/imports/api/Discussions';
import { Groups } from '/imports/api/Groups';
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
          discussion={this.props.discussion}
          participants={this.props.participants}
          comment={comment}
        />
      )
    });
  }

  renderUserReplyingStatus(){
    const userList = (this.props.discussion.active_replies || [])
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
    return (this.props.discussion.active_replies || []).some(reply => reply.user_id === Meteor.userId() && reply.parent_id === '') ?
      (
        <CommentForm discussion_id={this.props.discussion_id} />
      ) :
      (
        <Button 
          onClick={() => Meteor.call('discussions.reply', this.props.discussion_id, '')}
          content='Post'
          labelPosition='left' 
          icon='edit' 
          primary/>
      )
  }

  render(){
    console.log(this.props);
    return (this.props.discussion && this.props.participants) ?
    (
      <Ref innerRef={this.contextRef}>
        <Segment>
          <Comment.Group threaded={true}>
            {this.renderComments()}
            {this.renderUserReplyingStatus()}
          </Comment.Group>
          {this.renderCommentForm()}
          <Rail position='left'>
            <Sticky context={this.contextRef} offset={80}>
              <StarredCommentView 
                discussion={this.props.discussion}
                participants={this.props.participants}/>
            </Sticky>
          </Rail>
          <Rail position='right'>
            <Sticky context={this.contextRef} offset={80}>
              <Segment>Discussion history / navigation bar here</Segment>
            </Sticky>
          </Rail>
        </Segment>
        </Ref>
    ) :
    (
      <Segment>
        <Dimmer active page inverted>
          <Loader size='large'>Loading</Loader>
        </Dimmer>
      </Segment>
    )
  }
}

export default withTracker(({match}) => {
  const discussion_id = match.params.discussion_id;
  Meteor.subscribe('comments', discussion_id);
  Meteor.subscribe('discussions');
  const usersSub = Meteor.subscribe('users');
  const groupsSub = Meteor.subscribe('groups');

  return {
    discussion: Discussions.findOne(
      { _id: discussion_id },
      { fields: 
        { 
          active_replies: 1,
          user_stars: 1,
          active_vote: 1,
        } 
      }),
    comments: Comments.find(
      {
        discussion_id: discussion_id,
        parent_id: '',
      },
      { sort: { posted_time: 1 } },
    ).fetch(),
    participants: 
      groupsSub.ready() &&
      usersSub.ready() && 
      Meteor.users.find({ _id: { 
        $in: Groups.findOne({ discussions: discussion_id }).members 
      } }).fetch(),
  }
})(DiscussionThread);
