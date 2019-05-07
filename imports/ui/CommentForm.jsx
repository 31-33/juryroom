import React, { Component } from 'react';
import { Form, TextArea, Button } from 'semantic-ui-react';

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
    console.log(`Submit comment called with text ${this.state.commentText} (parent_id: ${this.props.parentid})`);

    this.setState({
      commentText: "",
    })
    this.props.onClose();
  }

  render(){
    return (
      <Form>
        <Form.Field
          label="Message"
          control={TextArea}
          value={this.state.commentText}
          onChange={this.onCommentTextChange.bind(this)}
          placeholder="Type your comment here..."
        />
        <Form.Group>
          <Form.Field control={Button} onClick={this.submitComment.bind(this)}>Post</Form.Field>
          <Form.Field control={Button} onClick={() => this.props.onClose()}>Cancel</Form.Field>
        </Form.Group>
      </Form>
    );
  }
}

export default CommentForm;
