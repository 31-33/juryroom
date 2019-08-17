import React, { PureComponent } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import {
  Form, Button, Statistic,
} from 'semantic-ui-react';
import { MAX_COMMENT_LENGTH } from '/imports/api/Comments';
import RichTextEditor from 'react-rte';

class CommentForm extends PureComponent {
  static propTypes = {
    discussion: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      commentLengthLimit: PropTypes.number,
    }).isRequired,
    parentId: PropTypes.string.isRequired,
  }

  constructor() {
    super();

    this.state = {
      commentContent: RichTextEditor.createEmptyValue(),
      isAnonymous: false,
    };
  }

  onCommentTextChange = (value) => {
    this.setState({
      commentContent: value,
    });
  }

  submitComment = () => {
    const { commentContent, isAnonymous } = this.state;
    const { discussion, parentId } = this.props;

    Meteor.call(
      'comments.insert',
      discussion._id,
      parentId || '',
      commentContent.toString('markdown'),
      isAnonymous,
    );

    this.setState({
      commentContent: RichTextEditor.createEmptyValue(),
    });
    this.close();
  }

  close = () => {
    const { discussion, parentId } = this.props;
    Meteor.call('comments.closeReply', discussion._id, parentId);
  }

  render() {
    const { discussion } = this.props;
    const { commentContent } = this.state;
    const commentLengthLimit = discussion.commentLengthLimit || MAX_COMMENT_LENGTH;
    const currCommentLength = commentContent.toString('markdown').length;

    const user = Meteor.user();

    return (
      <Form>
        <Form.Field
          label="Message"
          control={RichTextEditor}
          maxLength={commentLengthLimit}
          value={commentContent}
          onChange={this.onCommentTextChange}
          placeholder="Type your comment here..."
          autoFocus
          editorStyle={currCommentLength > commentLengthLimit ? { color: 'red' } : {}}
          toolbarConfig={{
            display: ['INLINE_STYLE_BUTTONS', 'BLOCK_TYPE_BUTTONS', 'BLOCK_TYPE_DROPDOWN', 'HISTORY_BUTTONS'],
            INLINE_STYLE_BUTTONS: [
              { label: 'Bold', style: 'BOLD' },
              { label: 'Italic', style: 'ITALIC' },
              { label: 'Strikethrough', style: 'STRIKETHROUGH' },
              { label: 'Code', style: 'CODE' },
            ],
            BLOCK_TYPE_DROPDOWN: [
              { label: 'Normal', style: 'unstyled' },
              { label: 'Heading Large', style: 'header-one' },
              { label: 'Heading Medium', style: 'header-two' },
              { label: 'Heading Small', style: 'header-three' },
              { label: 'Code Block', style: 'code-block' },
            ],
            BLOCK_TYPE_BUTTONS: [
              { label: 'UL', style: 'unordered-list-item' },
              { label: 'OL', style: 'ordered-list-item' },
              { label: 'Blockquote', style: 'blockquote' },
            ],
          }}
          customControls={[
            <div style={{ float: 'right' }} key="postingAs">
              <Form.Dropdown
                inline
                label="Posting as"
                selection
                defaultValue={user._id}
                options={[
                  {
                    key: user._id,
                    text: user.username,
                    value: user._id,
                    image: { avatar: true, src: user.avatar || '/avatar_default.png' },
                  },
                  {
                    key: 'Anonymous',
                    text: 'Anonymous',
                    value: 'Anonymous',
                    image: { avatar: true, src: '/avatar_default.png' },
                  },
                ]}
                upward={false}
                onChange={(_, { value }) => { this.setState({ isAnonymous: value !== user._id }); }}
              />
            </div>,
          ]}
        />
        <Statistic
          floated="right"
          value={`${currCommentLength}/${commentLengthLimit}`}
          size="small"
          text
          color={currCommentLength > commentLengthLimit ? 'red' : 'black'}
        />
        <Form.Group>
          <Form.Field
            disabled={currCommentLength > commentLengthLimit}
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
