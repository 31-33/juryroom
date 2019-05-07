import React, { Component, createRef } from 'react';
import { Button, Comment, Container, Rail, Ref, Segment, Sticky } from 'semantic-ui-react';
import { Meteor } from 'meteor/meteor';
import { Comments } from '/imports/api/Comments';
import { withTracker } from 'meteor/react-meteor-data';
import CommentView from '/imports/ui/CommentView';
import CommentForm from '/imports/ui/CommentForm';
import StarredCommentView from '/imports/ui/StarredCommentView';

class DiscussionThread extends Component{
  contextRef = createRef();

  constructor(){
    super();

    this.state = {
      replying: false,
    }
  }

  onCommentStarred = (commentid) => {
    console.log(`user clicked star on comment ${commentid}`)
  }

  onCommentVoteCalled = (commentid) => {
    console.log(`user clicked vote on comment ${commentid}`)
  }

  showCommentForm(){
    this.setState({
      replying: true,
    })
  }

  closeCommentForm = () => {
    this.setState({
      replying: false,
    })
  }

  renderComments(){
    return this.props.comments.map(comment =>  {
      return (
        <CommentView
          key={comment._id}
          discussion_id={this.props.discussion_id}
          comment_id={comment._id}
          data={comment}
          starCallback={this.onCommentStarred}
        />
      )
    });
  }

  render(){
    return (
      <div>
        <Ref innerRef={this.contextRef}>
          <Segment>
            <Comment.Group threaded={true}>
              {this.renderComments()}
              {this.state.replying ?
                (<CommentForm
                  discussion_id={this.props.discussion_id}
                  onClose={this.closeCommentForm}
                />)
                : (<Button primary onClick={this.showCommentForm.bind(this)}>Post</Button>)
              }
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
  Meteor.subscribe("comments", discussion_id);

  return {
    comments: Comments.find(
      {
        discussion_id: discussion_id,
        parent_id: '',
      }
    ).fetch(),
  }
})(DiscussionThread);
