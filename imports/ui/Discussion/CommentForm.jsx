import React, { PureComponent } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import { DiscussionPropType } from '/imports/types';
import {
  Form, Button, Statistic,
} from 'semantic-ui-react';
import { MAX_COMMENT_LENGTH } from '/imports/api/Comments';
import RichTextEditor from 'react-rte';

class CommentForm extends PureComponent {
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
      commentContent: RichTextEditor.createEmptyValue(),
    };
  }

  onCommentTextChange = (value) => {
    this.setState({
      commentContent: value,
    });
  }

  submitComment = () => {
    const { commentContent } = this.state;
    const { discussion, parentId } = this.props;
    Meteor.call('comments.insert', discussion._id, parentId || '', commentContent.toString('markdown'));

    this.setState({
      commentContent: RichTextEditor.createEmptyValue(),
    });
    this.close();
  }

  close = () => {
    const { discussion, parentId } = this.props;
    Meteor.call('discussions.closeReply', discussion._id, parentId);
  }

  render() {
    const { discussion } = this.props;
    const { commentContent } = this.state;
    const commentLengthLimit = discussion.commentLengthLimit || MAX_COMMENT_LENGTH;

    return (
      <Form>
        <Form.Field
          label="Message"
          control={RichTextEditor}
          maxLength={commentLengthLimit}
          value={commentContent}
          onChange={this.onCommentTextChange}
          placeholder="Type your comment here..."
        />
        <Statistic content={`${commentContent.toString('markdown').length}/${commentLengthLimit}`} floated="right" />
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
