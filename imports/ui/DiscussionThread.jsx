import React, { Component, createRef } from 'react';
import { Comment, Container, Rail, Ref, Segment, Sticky } from 'semantic-ui-react';
import CommentView from '/imports/ui/CommentView';
import StarredCommentView from '/imports/ui/StarredCommentView';

class DiscussionThread extends Component{
  contextRef = createRef();

  renderComments(){
    return this.props.comments.map(comment =>  {
      return (
        <CommentView key={comment.id} data={comment} />
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
            </Comment.Group>
            <Rail position='left'>
              <Sticky context={this.contextRef} offset={80}>
                <StarredCommentView />
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

export default DiscussionThread;
