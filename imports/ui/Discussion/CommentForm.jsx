import React, { Component } from 'react';
import { Form, TextArea, Button } from 'semantic-ui-react';
import { MAX_COMMENT_LENGTH } from '/imports/api/Comments';

class CommentForm extends Component {
  constructor(){
    super();

    this.state = {
      commentText: ""
    };
  }

  onCommentTextChange(e, {value}){
    this.setState({
      commentText: value
    });
  }

  submitComment(){
    Meteor.call('comments.insert', this.props.discussion_id, this.props.parent_id ? this.props.parent_id : '', this.state.commentText);

    this.setState({
      commentText: "",
    })
    this.close();
  }

  close(){
    closeCommentForm(this.props.discussion_id, this.props.parent_id);
  }

  render(){
    return (
      <Form>
        <Form.Field
          label="Message"
          control={TextArea}
          maxLength={MAX_COMMENT_LENGTH}
          value={this.state.commentText}
          onChange={this.onCommentTextChange.bind(this)}
          placeholder="Type your comment here..."
        />
        <Form.Group>
          <Form.Field control={Button} onClick={this.submitComment.bind(this)} content='Add Reply' labelPosition='left' icon='edit' primary />
          <Form.Field control={Button} onClick={this.close.bind(this)} content='Cancel' labelPosition='left' icon='cancel' negative/>
        </Form.Group>
      </Form>
    );
  }
}

export function openCommentForm(discussion_id, parent_id) {
  Meteor.call('discussions.reply', discussion_id, parent_id);
}
export function closeCommentForm(discussion_id) {
  Meteor.call('discussions.closeReply', discussion_id);
}

export default CommentForm;