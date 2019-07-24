import React, { PureComponent } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import {
  Button, Comment, Header, Segment, Container,
} from 'semantic-ui-react';
import ReactMarkdown from 'react-markdown';
import Linkify from 'react-linkify';
import Comments from '/imports/api/Comments';
import Discussions from '/imports/api/Discussions';
import Votes from '/imports/api/Votes';
import PropTypes from 'prop-types';
import {
  UserPropType, VotePropType,
} from '/imports/types';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';
import { renderUserVotes } from '/imports/ui/Discussion/Vote';
import Dotdotdot from 'react-dotdotdot';

class StarredCommentView extends PureComponent {
  static defaultProps = {
    activeVote: false,
  }

  static propTypes = {
    discussion: PropTypes.oneOfType([
      PropTypes.shape({
        votes: PropTypes.arrayOf(PropTypes.shape({
          voteId: PropTypes.string.isRequired,
          commentId: PropTypes.string.isRequired,
        })).isRequired,
        activeVote: PropTypes.string,
        status: PropTypes.string.isRequired,
      }),
      PropTypes.bool,
    ]).isRequired,
    comments: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.shape({
        authorId: PropTypes.string.isRequired,
        userStars: PropTypes.arrayOf(PropTypes.shape({
          userId: PropTypes.string.isRequired,
        })),
      })),
      PropTypes.bool,
    ]).isRequired,
    participants: PropTypes.arrayOf(UserPropType).isRequired,
    activeVote: PropTypes.oneOfType([VotePropType, PropTypes.bool]),
    scrollToComment: PropTypes.func.isRequired,
  }

  renderComment(comment) {
    const {
      participants, discussion, activeVote, scrollToComment,
    } = this.props;

    const author = participants.find(user => user._id === comment.authorId);
    const isStarred = comment.userStars.some(star => star.userId === Meteor.userId());
    const isActiveVote = activeVote && activeVote.commentId === comment._id;

    return (
      <Comment key={comment._id}>
        <Comment.Content>
          <Comment.Author as={Link} to={`/user/${author._id}`}>
            {author.username}
          </Comment.Author>
          <Comment.Metadata style={{ display: 'inline' }}>
            <Moment fromNow>{comment.postedTime}</Moment>
            <Button
              floated="right"
              color="black"
              size="mini"
              onClick={() => scrollToComment(comment._id)}
              content="Scroll To"
            />
          </Comment.Metadata>
          <Comment.Text>
            <Linkify properties={{ target: '_blank' }}>
              <Dotdotdot clamp={isActiveVote ? 10 : 5}>
                <ReactMarkdown
                  source={comment.text}
                  disallowedTypes={['image', 'imageReference']}
                />
              </Dotdotdot>
            </Linkify>
          </Comment.Text>
          <Comment.Actions>
            {comment.userStars.length > 0 && (
              <Button
                style={{ width: '100%' }}
                attached="top"
                icon="star"
                color="yellow"
                content={isStarred ? 'Starred' : 'Star'}
                basic={!isStarred}
                fluid
                label={{
                  style: ({ width: '100%', horizontalAlign: 'center' }),
                  basic: true,
                  color: 'yellow',
                  pointing: 'left',
                  content: comment.userStars.map(star => participants.find(user => user._id === star.userId).username).join(', '),
                }}
                onClick={() => (isStarred
                  ? Meteor.call('comments.unstar', discussion._id, comment._id)
                  : Meteor.call('comments.star', discussion._id, comment._id))
                }
              />
            )}
            {!isActiveVote && (
              <Button
                disabled={!!discussion.activeVote
                || !comment.userStars.some(star => star.userId === Meteor.userId())
                || discussion.votes.some(vote => vote.commentId === comment._id)
                || discussion.status !== 'active'}
                attached="bottom"
                icon="exclamation"
                color="green"
                content="Call Vote"
                onClick={() => Meteor.call('votes.callVote', discussion._id, comment._id)}
              />
            )}
            {isActiveVote && renderUserVotes(activeVote, participants)}
          </Comment.Actions>
        </Comment.Content>
      </Comment>
    );
  }

  render() {
    const { discussion, comments, activeVote } = this.props;
    if (!discussion) {
      return '';
    }

    const starredComments = comments.sort((commentA, commentB) => {
      if (activeVote && activeVote.commentId === commentA._id) return -1;
      if (activeVote && activeVote.commentId === commentB._id) return 1;
      return commentA.userStars.length - commentB.userStars.length;
    });

    return starredComments.length > 0 && (
      <Container>
        <Header
          attached="top"
          content="Starred Comments"
          size="large"
        />
        <Segment attached="bottom">
          <Comment.Group>
            {comments.sort((commentA, commentB) => {
              if (activeVote && activeVote.commentId === commentA._id) return -1;
              if (activeVote && activeVote.commentId === commentB._id) return 1;
              return commentA.userStars.length - commentB.userStars.length;
            }).map(comment => this.renderComment(comment))}
          </Comment.Group>
        </Segment>
      </Container>
    );
  }
}

export default withTracker(({ discussionId }) => {
  const discussion = Discussions.findOne(
    { _id: discussionId },
    {
      fields: {
        votes: 1,
        activeVote: 1,
        status: 1,
      },
    },
  );
  const activeVote = discussion && Votes.findOne({ _id: discussion.activeVote });
  const activeVoteCommentId = activeVote ? activeVote.commentId : '';

  return {
    discussion: discussion || false,
    comments: (discussion && Comments.find({
      discussionId,
      $or: [
        { userStars: { $exists: true, $ne: [] } },
        { _id: activeVoteCommentId },
      ],
    }).fetch()) || false,
    activeVote,
  };
})(StarredCommentView);
