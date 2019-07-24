import React, { PureComponent } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import {
  VotePropType,
} from '/imports/types';
import {
  Segment, Comment, Icon, Divider, Button, Item,
} from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';
import ReactMarkdown from 'react-markdown';
import Linkify from 'react-linkify';

import Comments from '/imports/api/Comments';
import Votes from '/imports/api/Votes';

import Vote from './Vote';
import CommentForm from './CommentForm';

class CommentViewTemplate extends PureComponent {
  static defaultProps = {
    vote: false,
  }

  static propTypes = {
    discussion: PropTypes.shape({
      activeVote: PropTypes.string,
      commentLengthLimit: PropTypes.number,
      status: PropTypes.string.isRequired,
    }).isRequired,
    comment: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      parentId: PropTypes.string.isRequired,
      authorId: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      postedTime: PropTypes.objectOf(Date).isRequired,
      activeReplies: PropTypes.arrayOf(PropTypes.shape({
        userId: PropTypes.string.isRequired,
        activeTime: PropTypes.objectOf(Date).isRequired,
      })),
      collapsedBy: PropTypes.arrayOf(PropTypes.string.isRequired),
      userStars: PropTypes.arrayOf(PropTypes.shape({
        userId: PropTypes.string.isRequired,
        dateTime: PropTypes.objectOf(Date).isRequired,
      })),
    }).isRequired,
    commentId: PropTypes.string.isRequired,
    children: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string.isRequired,
    })).isRequired,
    participants: PropTypes.arrayOf(PropTypes.shape({
      username: PropTypes.string.isRequired,
      avatar: PropTypes.string,
    })).isRequired,
    vote: PropTypes.oneOfType([VotePropType, PropTypes.bool]),
  }

  collapse = () => {
    const { discussion, commentId } = this.props;
    Meteor.call('comments.collapse', discussion._id, commentId, !this.isCollapsed());
  }

  isCollapsed() {
    const { comment } = this.props;
    return comment.collapsedBy.includes(Meteor.userId());
  }

  listReplyingUsers() {
    const { participants, comment } = this.props;
    const replyingUsers = (comment.activeReplies || [])
      .filter(reply => reply.userId !== Meteor.userId())
      .map(reply => participants.find(user => user._id === reply.userId).username);

    return replyingUsers.length > 0 && (
      <strong>
        {`${replyingUsers.join(', ')} is replying`}
      </strong>
    );
  }

  renderVoteButton(starredBy, userStarred) {
    const {
      participants, vote, discussion, comment,
    } = this.props;

    return (
      <Button
        disabled={!!discussion.activeVote
          || !userStarred
          || !!vote
          || discussion.status !== 'active'}
        floated="right"
        content="Call Vote"
        color="green"
        onClick={() => Meteor.call('votes.callVote', discussion._id, comment._id)}
        label={{
          basic: true,
          content: (
            <Item.Group>
              {
                starredBy.map((star) => {
                  const item = participants.find(user => user._id === star.userId);
                  return (
                    <Item
                      key={item._id}
                      as={Link}
                      to={`/user/${star.userId}`}
                    >
                      <Item.Image
                        inline
                        avatar
                        size="mini"
                        src={item.avatar || '/avatar_default.png'}
                      />
                      <Item.Content
                        verticalAlign="middle"
                        content={item.username}
                      />
                    </Item>
                  );
                })
              }
            </Item.Group>
          ),
        }}
        labelPosition="left"
      />
    );
  }

  renderChildren() {
    const { children, participants, discussion } = this.props;
    return children.length > 0 && (
      <Comment.Group threaded>
        {
          children.map(({ _id }) => (
            <CommentView
              key={_id}
              discussion={discussion}
              participants={participants}
              commentId={_id}
            />
          ))
        }
      </Comment.Group>
    );
  }

  render() {
    const {
      discussion, comment, vote, participants,
    } = this.props;

    if (!comment) {
      return '';
    }

    const author = participants.find(user => user._id === comment.authorId);

    const starredBy = (comment.userStars || []);
    const userStarred = starredBy.some(star => star.userId === Meteor.userId());
    const styleAsSegment = !!vote || starredBy.length > 0;

    return (
      <Comment collapsed={this.isCollapsed()} id={comment._id}>
        <Comment.Content
          as={styleAsSegment ? Segment : undefined}
          className={styleAsSegment ? undefined : 'unstarred'}
          color={styleAsSegment ? 'yellow' : undefined}
          inverted={styleAsSegment ? (starredBy.length > 0) : undefined}
          attached={vote ? 'top' : undefined}
          tertiary={styleAsSegment ? true : undefined}
          clearing={styleAsSegment ? true : undefined}
        >
          {starredBy.length > 0 && this.renderVoteButton(starredBy, userStarred)}
          <Icon
            link
            name={this.isCollapsed() ? 'chevron down' : 'minus'}
            onClick={this.collapse}
          />
          <Comment.Avatar
            as={Link}
            to={`/user/${author._id}`}
            src={author.avatar || '/avatar_default.png'}
          />
          <Comment.Author
            as={Link}
            to={`/user/${author._id}`}
            content={author.username}
          />
          <Comment.Metadata>
            <div>
              <Moment fromNow>{comment.postedTime}</Moment>
              &nbsp;
              {this.listReplyingUsers()}
            </div>
          </Comment.Metadata>
          <Comment.Text>
            <Linkify properties={{ target: '_blank' }}>
              <ReactMarkdown
                source={comment.text}
                disallowedTypes={['image', 'imageReference']}
              />
            </Linkify>
          </Comment.Text>
          <Comment.Actions>
            <Comment.Action
              content="Reply"
              onClick={() => Meteor.call(
                'comments.reply',
                discussion._id,
                comment._id,
              )}
            />
            <Comment.Action
              content={userStarred ? 'Unstar' : 'Star'}
              onClick={() => Meteor.call(
                userStarred ? 'comments.unstar' : 'comments.star',
                discussion._id,
                comment._id,
              )}
            />
          </Comment.Actions>
        </Comment.Content>
        {vote && (
          <Vote
            vote={vote}
            participants={participants}
            isActive={vote._id === discussion.activeVote}
          />
        )}
        {comment.activeReplies && comment.activeReplies.some(
          reply => reply.userId === Meteor.userId(),
        ) && (
          <CommentForm
            discussion={discussion}
            parentId={comment._id}
          />
        )}
        {this.renderChildren()}
        {this.isCollapsed() && (<Divider clearing hidden />)}
      </Comment>
    );
  }
}
const CommentView = withTracker(({ discussion, commentId }) => ({
  comment: Comments.findOne(
    { _id: commentId },
  ),
  children: Comments.find(
    {
      discussionId: discussion._id,
      parentId: commentId,
    },
    {
      fields: { _id: 1 },
      sort: { postedTime: 1 },
    },
  ).fetch() || [],
  vote: Votes.findOne({ commentId }),
}))(CommentViewTemplate);

export default CommentView;
