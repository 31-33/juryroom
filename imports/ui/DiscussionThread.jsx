import React, { Component, createRef } from 'react';
import { Button, Comment, Container, Rail, Ref, Segment, Sticky } from 'semantic-ui-react';
import { Meteor } from 'meteor/meteor';
import { Comments } from '/imports/api/Comments';
import { Discussions } from '/imports/api/Discussions';
import { withTracker } from 'meteor/react-meteor-data';
import CommentView from '/imports/ui/CommentView';
import CommentForm, { openCommentForm } from '/imports/ui/CommentForm';
import StarredCommentView from '/imports/ui/StarredCommentView';

class DiscussionThread extends Component{
  contextRef = createRef();

  constructor(){
    super();
  }

  renderComments(){
    return this.props.comments.map(comment =>  {
      return (
        <CommentView
          key={comment._id}
          discussion_id={this.props.discussion_id}
          comment_id={comment._id}
          data={comment}
        />
      )
    });
  }

  renderUserReplyingStatus(){
    if(this.props.discussion_state && this.props.discussion_state.user_data){
      const replying_users = [];
      this.props.discussion_state.user_data.forEach(user => {
        if(user.replying === this.props.discussion_id && user.id !== Meteor.userId()){
          replying_users.push(user.name);
        }
      })
      return replying_users.length > 0 ?
        (
          <Container>
            <strong>{replying_users.join(', ')} is commenting</strong>
          </Container>
        ): '';
    }
    return '';
  }

  renderCommentForm(){
    return (
      this.props.discussion_state && 
      this.props.discussion_state.user_data &&
      this.props.discussion_state.user_data.some(
        user => user.id === Meteor.userId() && user.replying === this.props.discussion_id
      )) ? (<CommentForm discussion_id={this.props.discussion_id} />) :
      (<Button primary onClick={() => openCommentForm(this.props.discussion_id, this.props.discussion_id)}>Post</Button>);
  }

  render(){
    return (
      <div>
        <Ref innerRef={this.contextRef}>
          <Segment>
            <Comment.Group threaded={true}>
              {this.renderComments()}
              {this.renderUserReplyingStatus()}
              {this.renderCommentForm()}
            </Comment.Group>
            <Rail position='left'>
              <Sticky context={this.contextRef} offset={80}>
                <StarredCommentView
                  starred={[]}
                  starCallback={this.onCommentStarred}
                  voteCallback={this.onCommentVoteCalled}
                />
              </Sticky>
            </Rail>
            <Rail position='right'>
              <Sticky context={this.contextRef} offset={80}>
                <Segment>Discussion history / navigation bar here</Segment>
              </Sticky>
            </Rail>
          </Segment>
        </Ref>
      </div>
    );
  }
}

export default withTracker(({discussion_id}) => {
  Meteor.subscribe("comments", discussion_id, '');
  Meteor.subscribe('discussions', discussion_id);

  return {
    comments: Comments.find(
      {
        discussion_id: discussion_id,
        parent_id: '',
      }
    ).fetch(),
    discussion_state: Discussions.findOne(
      { _id: discussion_id },
      { user_data: 1 }
    ),
  }
})(DiscussionThread);
