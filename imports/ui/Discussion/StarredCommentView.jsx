import React, { PureComponent } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import {
  Button, Comment, Header, Label, Segment, Container,
} from 'semantic-ui-react';
import Comments from '/imports/api/Comments';
import Votes from '/imports/api/Votes';
import PropTypes from 'prop-types';
import {
  DiscussionPropType, CommentPropType, UserPropType, VotePropType,
} from '/imports/types';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';
import { renderUserVotes } from '/imports/ui/Discussion/Vote';

const scrollToElement = require('scroll-to-element');

class StarredCommentView extends PureComponent {
  static defaultProps = {
    activeVote: false,
  }

  static propTypes = {
    discussion: DiscussionPropType.isRequired,
    comments: PropTypes.oneOfType([PropTypes.arrayOf(CommentPropType), PropTypes.bool]).isRequired,
    participants: PropTypes.arrayOf(UserPropType).isRequired,
    activeVote: PropTypes.oneOfType([VotePropType, PropTypes.bool]),
  }

  renderStarredComments(starredComments) {
    const { comments, participants, discussion } = this.props;

    if (!starredComments.every(star => comments.some(comment => comment._id === star.commentId))) {
      return '';
    }

    return (
      <Container>
        <Header
          attached="top"
          content="Starred Comments"
          size="large"
        />
        <Segment attached="bottom">
          <Comment.Group>
            {
              starredComments
                .sort((c1, c2) => c2.users.length - c1.users.length)
                .map((starredComment) => {
                  const commentData = comments.find(
                    comment => comment._id === starredComment.commentId,
                  );
                  const author = participants.find(user => user._id === commentData.authorId);
                  const isStarred = starredComment.users.includes(Meteor.userId());
                  return (
                    <Comment key={starredComment.commentId}>
                      <Comment.Content>
                        <Comment.Author as={Link} to={`/user/${author._id}`}>
                          {author.username}
                        </Comment.Author>
                        <Comment.Metadata>
                          <Moment fromNow>{commentData.postedTime}</Moment>
                          <Label
                            basic
                            as="a"
                            onClick={() => scrollToElement(
                              `#${starredComment.commentId}`,
                              {
                                align: 'top',
                                offset: -120,
                              },
                            )}
                            content="Show"
                          />
                        </Comment.Metadata>
                        <Comment.Text>
                          {commentData.text}
                        </Comment.Text>
                        <Comment.Actions>
                          <Button
                            attached="top"
                            icon="star"
                            color="yellow"
                            content={isStarred ? 'Starred' : 'Star'}
                            basic={!isStarred}
                            label={{
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
                        </Comment.Actions>
                      </Comment.Content>
                    </Comment>
                  );
                })
            }
          </Comment.Group>
        </Segment>
      </Container>
    );
  }

  renderActiveVote(vote, commentData) {
    const { participants } = this.props;
    const author = participants.find(user => user._id === commentData.authorId);

    return (
      <Container>
        <Header
          attached="top"
          content="Active Vote"
          size="large"
        />
        <Segment attached="bottom" as={Comment.Group}>
          <Comment key={commentData._id}>
            <Comment.Content>
              <Comment.Author as={Link} to={`/user/${author._id}`} content={author.username} />
              <Comment.Metadata>
                <Moment fromNow>{commentData.postedTime}</Moment>
                <Label
                  basic
                  as="a"
                  onClick={() => scrollToElement(
                    `#${commentData._id}`,
                    {
                      align: 'top',
                      offset: -120,
                    },
                  )}
                  content="Show"
                />
              </Comment.Metadata>
              <Comment.Text content={commentData.text} />
              <Comment.Actions>
                {vote.userVotes.some(userVote => userVote.userId === Meteor.userId())
                  ? renderUserVotes(vote, participants)
                  : (
                    <Button.Group fluid>
                      <Button
                        content="Disagree"
                        negative
                        onClick={() => Meteor.call('votes.vote', vote._id, false)}
                      />
                      <Button.Or />
                      <Button
                        content="Agree"
                        positive
                        onClick={() => Meteor.call('votes.vote', vote._id, true)}
                      />
                    </Button.Group>
                  )
                }
              </Comment.Actions>
            </Comment.Content>
          </Comment>
        </Segment>
      </Container>
    );
  }

  render() {
    const { comments, discussion, activeVote } = this.props;
    const starredComments = [];
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

    return (
      <Container>
        {activeVote && this.renderActiveVote(
          activeVote,
          comments.find(comment => comment._id === activeVote.commentId),
        )}
        {starredComments.length > 0 && this.renderStarredComments(starredComments)}
      </Container>
    );
  }
}

export default withTracker(({ discussion }) => ({
  comments: Comments.find({
    discussionId: discussion._id,
    _id: {
      $in: discussion.userStars.map(star => star.commentId)
        .concat(discussion.votes.map(vote => vote.commentId)),
    },
  }).fetch(),
  activeVote: Votes.findOne({ _id: discussion.activeVote }),
}))(StarredCommentView);
