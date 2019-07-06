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
  CommentPropType, UserPropType, VotePropType,
} from '/imports/types';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';
import { renderUserVotes } from '/imports/ui/Discussion/Vote';
import Dotdotdot from 'react-dotdotdot';

const scrollToElement = require('scroll-to-element');

class StarredCommentView extends PureComponent {
  static defaultProps = {
    activeVote: false,
  }

  static propTypes = {
    discussion: PropTypes.oneOfType([
      PropTypes.shape({
        userStars: PropTypes.arrayOf(PropTypes.shape({
          userId: PropTypes.string.isRequired,
          commentId: PropTypes.string.isRequired,
        })).isRequired,
        votes: PropTypes.arrayOf(PropTypes.shape({
          voteId: PropTypes.string.isRequired,
          commentId: PropTypes.string.isRequired,
        })).isRequired,
        activeVote: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
      }),
      PropTypes.bool,
    ]).isRequired,
    comments: PropTypes.oneOfType([PropTypes.arrayOf(CommentPropType), PropTypes.bool]).isRequired,
    participants: PropTypes.arrayOf(UserPropType).isRequired,
    activeVote: PropTypes.oneOfType([VotePropType, PropTypes.bool]),
  }

  renderStarredComments(starredComments) {
    const {
      comments, participants, discussion, activeVote,
    } = this.props;

    return starredComments.map((starredComment) => {
      if (!comments.some(comment => comment._id === starredComment.commentId)) {
        return '';
      }

      const commentData = comments.find(
        comment => comment._id === starredComment.commentId,
      );
      const author = participants.find(user => user._id === commentData.authorId);
      const isStarred = starredComment.users.includes(Meteor.userId());
      const isActiveVote = activeVote && activeVote.commentId === starredComment.commentId;

      return (
        <Comment key={starredComment.commentId}>
          <Comment.Content>
            <Comment.Author as={Link} to={`/user/${author._id}`}>
              {author.username}
            </Comment.Author>
            <Comment.Metadata style={{ display: 'inline' }}>
              <Moment fromNow>{commentData.postedTime}</Moment>
              <Button
                floated="right"
                color="black"
                size="mini"
                onClick={() => scrollToElement(
                  `#${starredComment.commentId}`,
                  {
                    align: 'top',
                    offset: -120,
                  },
                )}
                content="Scroll To"
              />
            </Comment.Metadata>
            <Comment.Text>
              <Linkify properties={{ target: '_blank' }}>
                <Dotdotdot clamp={isActiveVote ? 10 : 5}>
                  <ReactMarkdown source={commentData.text} />
                </Dotdotdot>
              </Linkify>
            </Comment.Text>
            <Comment.Actions>
              {starredComment.users.length > 0 && (
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
                    content: starredComment.users.map(userId => participants.find(user => user._id === userId).username).join(', '),
                  }}
                  onClick={() => (isStarred
                    ? Meteor.call('discussions.remove_star', discussion._id)
                    : Meteor.call('discussions.star_comment', discussion._id, commentData._id))
                  }
                />
              )}
              {!isActiveVote && (
                <Button
                  disabled={!!discussion.activeVote
                  || !starredComment.users.some(user => user === Meteor.userId())
                  || discussion.votes.some(vote => vote.commentId === starredComment._id)
                  || discussion.status !== 'active'}
                  attached="bottom"
                  icon="exclamation"
                  color="green"
                  content="Call Vote"
                  onClick={() => Meteor.call('discussions.callVote', discussion._id, commentData._id, starredComment.users)}
                />
              )}
              {isActiveVote && (
                activeVote.userVotes.some(userVote => userVote.userId === Meteor.userId())
                  ? renderUserVotes(activeVote, participants)
                  : (
                    <Button.Group fluid>
                      <Button
                        content="Disagree"
                        negative
                        onClick={() => Meteor.call('votes.vote', activeVote._id, false)}
                      />
                      <Button.Or />
                      <Button
                        content="Agree"
                        positive
                        onClick={() => Meteor.call('votes.vote', activeVote._id, true)}
                      />
                    </Button.Group>
                  )
              )}
            </Comment.Actions>
          </Comment.Content>
        </Comment>
      );
    });
  }

  render() {
    const { discussion, activeVote } = this.props;

    if (!discussion) {
      return '';
    }

    const starredComments = [];

    if (activeVote) {
      starredComments.push({
        commentId: activeVote.commentId,
        users: [],
      });
    }

    discussion.userStars.forEach((star) => {
      const index = starredComments.findIndex(comment => comment.commentId === star.commentId);
      if (index < 0) {
        starredComments.push({
          commentId: star.commentId,
          users: [star.userId],
        });
      } else {
        starredComments[index].users.push(star.userId);
      }
    });

    starredComments.sort((starA, starB) => {
      if (activeVote && activeVote.commentId === starA.commentId) return -1;
      if (activeVote && activeVote.commentId === starB.commentId) return 1;
      return starA.users.length - starB.users.length;
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
            {this.renderStarredComments(starredComments)}
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
        userStars: 1,
        votes: 1,
        activeVote: 1,
        status: 1,
      },
    },
  );

  return {
    discussion,
    comments: discussion && Comments.find({
      discussionId,
      _id: {
        $in: discussion.userStars.map(star => star.commentId)
          .concat(discussion.votes.map(vote => vote.commentId)),
      },
    }).fetch(),
    activeVote: discussion && Votes.findOne({ _id: discussion.activeVote }),
  };
})(StarredCommentView);
