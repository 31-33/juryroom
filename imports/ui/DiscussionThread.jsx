import React, { Component } from 'react';
import { Comment } from 'semantic-ui-react';
import CommentView from '/imports/ui/CommentView';

class DiscussionThread extends Component{

  renderComments(){
    return this.props.comments.map(comment =>  {
      return (
        <CommentView data={comment} />
      )
    });
  }

  render(){
    return (
      <Comment.Group threaded='true'>
        {this.renderComments()}
      </Comment.Group>
    );
  }
}

export default DiscussionThread;
