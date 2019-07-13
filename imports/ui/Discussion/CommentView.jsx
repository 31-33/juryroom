import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Comments from '/imports/api/Comments';
import Votes from '/imports/api/Votes';
import Discussions from '/imports/api/Discussions';
import {
  Comment, Icon, Divider, Container, Segment, List, Button, Item,
} from 'semantic-ui-react';
import Moment from 'react-moment';
import ReactMarkdown from 'react-markdown';
import Linkify from 'react-linkify';
import isEqual from 'react-fast-compare';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import CommentForm from './CommentForm';
import Vote from './Vote';
import {
  UserPropType, VotePropType,
} from '/imports/types';

class CommentViewTemplate extends Component {
  static defaultProps = {
    vote: false,
  }

  static propTypes = {
    discussion: PropTypes.shape({
      activeVote: PropTypes.string,
      status: PropTypes.string.isRequired,
    }).isRequired,
    discussionId: PropTypes.string.isRequired,
    comment: PropTypes.shape({

    }).isRequired,
    commentId: PropTypes.string.isRequired,
    children: PropTypes.arrayOf(PropTypes.shape({ _id: PropTypes.string.isRequired })).isRequired,
    participants: PropTypes.arrayOf(UserPropType).isRequired,
    vote: PropTypes.oneOfType([VotePropType, PropTypes.bool]),
  }

  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props, nextProps);
  }

  collapse = () => {
    const { discussionId, commentId } = this.props;
    Meteor.call('comments.collapse', discussionId, commentId, !this.isCollapsed());
  }

  isCollapsed() {
    const { comment } = this.props;
    return comment.collapsedBy.includes(Meteor.userId());
  }

  renderChildren() {
    const { children, discussionId, participants } = this.props;
    return children.length > 0 && (
      <Comment.Group threaded>
        {
          children.map(({ _id }) => (
            <CommentView
              key={_id}
              discussionId={discussionId}
              participants={participants}
              commentId={_id}
            />
          ))
        }
      </Comment.Group>
    );
  }

  renderUserReplyingStatus() {
    const { participants, comment } = this.props;
    const userList = (comment.activeReplies || [])
      .filter(reply => reply.userId !== Meteor.userId())
      .map(reply => participants.find(user => user._id === reply.userId).username);

    return userList.length > 0 && (
      <strong>
        {`${userList.join(', ')} is replying`}
      </strong>
    );
  }

  renderContent(starredBy) {
    const {
      participants, comment, discussion, vote,
    } = this.props;
    const author = participants.find(user => user._id === comment.authorId);
    return (
      <Container>
        {
          starredBy.length > 0 && (
            <Button
              disabled={!!discussion.activeVote
                || !starredBy.some(star => star.userId === Meteor.userId())
                || !!vote
                || discussion.status !== 'active'}
              floated="right"
              content="Call Vote"
              color="green"
              onClick={() => Meteor.call('discussions.callVote', discussion._id, comment._id, starredBy.map(star => star.userId))}
              label={{
                basic: true,
                content: (
                  <List>
                    {
                      starredBy.map((star) => {
                        const item = participants.find(user => user._id === star.userId);
                        return (
                          <Item key={item._id} as={Link} to={`/user/${star.userId}`}>
                            <Item.Image avatar size="mini" src={item.avatar || '/avatar_default.png'} />
                            <Item.Content verticalAlign="middle" content={item.username} />
                          </Item>
                        );
                      })
                    }
                  </List>
                ),
              }}
              labelPosition="left"
            />
          )
        }
        <Icon
          link
          name={this.isCollapsed() ? 'chevron down' : 'minus'}
          onClick={this.collapse}
        />
        <Comment.Avatar
          as={Link}
          to={`/user/${author._id}`}
          src={author.avatar ? author.avatar : '/avatar_default.png'}
        />
        <Comment.Author as={Link} to={`/user/${author._id}`} content={author.username} />
        <Comment.Metadata>
          <div>
            <Moment fromNow>{comment.postedTime}</Moment>
            &nbsp;
            {this.renderUserReplyingStatus()}
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
          <Comment.Action onClick={() => Meteor.call('comments.reply', discussion._id, comment._id)} content="Reply" />
          {
            starredBy.some(star => star.userId === Meteor.userId()) ? (
              <Comment.Action onClick={() => Meteor.call('comments.unstar', discussion._id, comment._id)} content="Unstar" />
            ) : (
              <Comment.Action onClick={() => Meteor.call('comments.star', discussion._id, comment._id)} content="Star" />
            )
          }
        </Comment.Actions>
      </Container>
    );
  }

  render() {
    const {
      discussion, comment, vote, participants,
    } = this.props;

    if (!discussion || !comment) {
      return '';
    }

    const starredBy = (comment.userStars || []);
    return (
      <Comment collapsed={this.isCollapsed()} id={comment._id}>
        <Comment.Content>
          {
            (starredBy.length > 0 || vote) ? (
              <Segment color="yellow" inverted={starredBy.length > 0} tertiary attached={vote && 'top'} clearing>
                {this.renderContent(starredBy)}
              </Segment>
            ) : this.renderContent(starredBy)
          }
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
        </Comment.Content>
      </Comment>
    );
  }
}
const CommentView = withTracker(({ discussionId, commentId }) => {
  const discussion = Discussions.findOne(
    { _id: discussionId },
    {
      fields: {
        activeVote: 1,
        status: 1,
      },
    },
  );

  return {
    discussion,
    comment: Comments.findOne(
      { _id: commentId },
    ),
    children: Comments.find(
      {
        discussionId,
        parentId: commentId,
      },
      {
        fields: { _id: 1 },
        sort: { postedTime: 1 },
      },
    ).fetch() || [],
    vote: Votes.findOne({ commentId }),
  };
})(CommentViewTemplate);

export default CommentView;
