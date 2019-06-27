import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { DiscussionPropType } from '/imports/types';
import {
  Form, TextArea, Button, Statistic,
} from 'semantic-ui-react';
import { MAX_COMMENT_LENGTH } from '/imports/api/Comments';

class CommentForm extends Component {
  static defaultProps = {
    parentId: false,
  }

  static propTypes = {
    discussion: DiscussionPropType.isRequired,
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
    const { discussion, parentId } = this.props;
    Meteor.call('comments.insert', discussion._id, parentId || '', commentText);

    this.setState({
      commentText: '',
    });
    this.close();
  }

  close = () => {
    const { discussion, parentId } = this.props;
    Meteor.call('discussions.closeReply', discussion._id, parentId);
  }

  render() {
    const { discussion } = this.props;
    const { commentText } = this.state;
    const commentLengthLimit = discussion.commentLengthLimit || MAX_COMMENT_LENGTH;

    return (
      <Form>
        <Form.Field
          label="Message"
          control={TextArea}
          maxLength={commentLengthLimit}
          value={commentText}
          onChange={this.onCommentTextChange}
          placeholder="Type your comment here..."
        />
        <Statistic content={`${commentText.length}/${commentLengthLimit}`} floated="right" />
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
