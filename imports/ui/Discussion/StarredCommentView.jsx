import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import {
  Button, Comment, Header, Label, Segment,
} from 'semantic-ui-react';
import Comments from '/imports/api/Comments';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';

const scrollToElement = require('scroll-to-element');

class StarredCommentView extends Component {
  static propTypes = {
    discussion: PropTypes.shape({

    }).isRequired,
    comments: PropTypes.arrayOf(PropTypes.shape({

    })).isRequired,
    participants: PropTypes.arrayOf(PropTypes.shape({

    })).isRequired,
  }

  renderStarredComments(starredComments) {
    const { comments, participants, discussion } = this.props;
    return starredComments
      .sort((c1, c2) => c2.users.length - c1.users.length)
      .map((starredComment) => {
        const commentData = comments.find(comment => comment._id === starredComment.commentId);
        const author = participants.find(user => user._id === commentData.authorId);
        const isStarred = starredComment.users.includes(Meteor.userId());
        return (
          <Comment key={starredComment.commentId}>
            <Comment.Content>
              <Comment.Author as={Link} to={`/user/${author._id}`}>
                {author.username}
              </Comment.Author>
              <Comment.Metadata>
                <Moment fromNow>{commentData.posted_time}</Moment>
                <Label
                  basic
                  as="a"
                  onClick={() => scrollToElement(
                    `#${starredComment.comment_id}`,
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
                    || !starredComment.users.some(user => user === Meteor.userId())}
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
      });
  }

  render() {
    const { discussion } = this.props;
    const comments = [];
    discussion.userStars.forEach((star) => {
      const index = comments.findIndex(comment => comment.commentId === star.commentId);
      if (index < 0) {
        comments.push({
          commentId: star.commentId,
          users: [star.userId],
        });
      } else {
        comments[index].users.push(star.userId);
      }
    });
    return (
      <Segment>
        <Header>Starred Comments</Header>
        <Comment.Group>
          {this.renderStarredComments(comments)}
        </Comment.Group>
      </Segment>
    );
  }
}

export default withTracker(({ discussion }) => {
  Meteor.subscribe('comments', discussion._id);

  return {
    comments: Comments.find({
      discussionId: discussion._id,
      _id: { $in: discussion.userStars.map(star => star.commentId) },
    }).fetch(),
  };
})(StarredCommentView);
