import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { Form, TextArea, Button } from 'semantic-ui-react';
import { MAX_COMMENT_LENGTH } from '/imports/api/Comments';

class CommentForm extends Component {
  static defaultProps = {
    parentId: false,
  }

  static propTypes = {
    discussionId: PropTypes.string.isRequired,
    parentId: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  }

  constructor() {
    super();

    this.state = {
      commentText: '',
    };
  }

  onCommentTextChange = (e, { value }) => {
    this.setState({
      commentText: value,
    });
  }

  submitComment = () => {
    const { commentText } = this.state;
    const { discussionId, parentId } = this.props;
    Meteor.call('comments.insert', discussionId, parentId || '', commentText);

    this.setState({
      commentText: '',
    });
    this.close();
  }

  close = () => {
    const { discussionId, parentId } = this.props;
    Meteor.call('discussions.closeReply', discussionId, parentId);
  }

  render() {
    const { commentText } = this.state;
    return (
      <Form>
        <Form.Field
          label="Message"
          control={TextArea}
          maxLength={MAX_COMMENT_LENGTH}
          value={commentText}
          onChange={this.onCommentTextChange}
          placeholder="Type your comment here..."
        />
        <Form.Group>
          <Form.Field
            control={Button}
            onClick={this.submitComment}
            content="Add Reply"
            labelPosition="left"
            icon="edit"
            primary
          />
          <Form.Field
            control={Button}
            onClick={this.close}
            content="Cancel"
            labelPosition="left"
            icon="cancel"
            negative
          />
        </Form.Group>
      </Form>
    );
  }
}

export default CommentForm;
