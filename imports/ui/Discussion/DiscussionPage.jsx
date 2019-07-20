import React, { PureComponent } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import {
  Sidebar, Container, Segment, Header, Button,
} from 'semantic-ui-react';
import Swipe from 'react-easy-swipe';

import Discussions from '/imports/api/Discussions';
import Groups from '/imports/api/Groups';
import Scenarios from '/imports/api/Scenarios';

import StarredCommentView from './StarredCommentView';
import DiscussionOverview from './DiscussionOverview';
import DiscussionThread from './DiscussionThread';
import CommentForm from './CommentForm';
import NotFoundPage from '/imports/ui/Error/NotFoundPage';

const scrollToElement = require('scroll-to-element');

const ListReplyingUsers = withTracker(({ discussionId }) => ({
  discussion: Discussions.findOne(
    { _id: discussionId },
    {
      fields: { activeReplies: 1 },
    },
  ),
}))(({ discussion, participants }) => {
  if (!discussion || !discussion.activeReplies) return '';
  const activePosters = discussion.activeReplies
    .filter(reply => reply.userId !== Meteor.userId())
    .map((reply) => {
      const participant = participants.find(user => user._id === reply.userId);
      return participant ? participant.username : '';
    });

  return activePosters.length > 0 && (
    <Container
      as="strong"
      content={`${activePosters.join(', ')} is posting`}
    />
  );
});

const RenderPostForm = withTracker(({ discussionId }) => ({
  discussion: Discussions.findOne(
    { _id: discussionId },
    {
      fields: {
        activeReplies: 1,
        commentLengthLimit: 1,
      },
    },
  ),
}))(({ discussion }) => (
  (discussion && discussion.activeReplies.some(reply => reply.userId === Meteor.userId()))
    ? (
      <CommentForm
        discussion={discussion}
        parentId=""
      />
    ) : (
      <Button
        onClick={() => Meteor.call('comments.reply', discussion._id, '')}
        content="Post"
        labelPosition="left"
        icon="edit"
        primary
      />
    )));

class DiscussionPage extends PureComponent {
  static defaultProps = {
    scenario: {
      title: 'title',
      description: 'description',
    },
  };

  static propTypes = {
    discussionId: PropTypes.string.isRequired,
    participants: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.shape({
        username: PropTypes.string.isRequired,
        avatar: PropTypes.string,
      })),
      PropTypes.bool,
    ]).isRequired,
    scenario: PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    }),
  };

  constructor(props) {
    super(props);

    this.state = {
      showStarredPanel: window.innerWidth > 1200,
      showOverviewPanel: window.innerWidth > 1200,
    };
  }

  scrollToComment = commentId => scrollToElement(`#${CSS.escape(commentId)}`, { align: 'top', offset: -120 });

  render() {
    const { showStarredPanel, showOverviewPanel } = this.state;
    const {
      discussionId, participants, scenario,
    } = this.props;

    if (!participants) {
      return <NotFoundPage />;
    }

    return (
      <div>
        <Sidebar
          animation="overlay"
          direction="right"
          visible={showOverviewPanel}
          as={Swipe}
          tolerance={100}
          onSwipeRight={() => this.setState({ showOverviewPanel: false })}
          allowMouseEvents
        >
          <DiscussionOverview
            discussionId={discussionId}
            scrollToComment={this.scrollToComment}
          />
        </Sidebar>
        <Sidebar
          animation="overlay"
          direction="left"
          visible={showStarredPanel}
          as={Swipe}
          tolerance={100}
          onSwipeLeft={() => this.setState({ showStarredPanel: false })}
          allowMouseEvents
        >
          <StarredCommentView
            discussionId={discussionId}
            participants={participants}
            scrollToComment={this.scrollToComment}
          />
        </Sidebar>
        <Sidebar.Pusher
          as={Swipe}
          tolerance={250}
          onSwipeLeft={() => this.setState({ showOverviewPanel: true })}
          onSwipeRight={() => this.setState({ showStarredPanel: true })}
          allowMouseEvents
        >
          <Segment attached="top">
            <Header
              size="huge"
              content={scenario && scenario.title}
              subheader={scenario && scenario.description}
            />
          </Segment>
          <Segment attached="bottom">
            <DiscussionThread
              discussionId={discussionId}
              participants={participants}
            />
            <ListReplyingUsers
              discussionId={discussionId}
              participants={participants}
            />
            <RenderPostForm
              discussionId={discussionId}
            />
          </Segment>
        </Sidebar.Pusher>
      </div>
    );
  }
}

export default withTracker(({ match }) => {
  const { discussionId } = match.params;
  Meteor.subscribe('comments', discussionId);
  Meteor.subscribe('votes', discussionId);

  const discussion = Discussions.findOne(
    { _id: discussionId },
    {
      fields: {
        scenarioId: 1,
        groupId: 1,
        status: 1,
      },
    },
  );

  const group = Groups.findOne(
    { discussions: { $elemMatch: { discussionId } } },
    {
      fields: {
        members: 1,
        discussions: 1,
      },
    },
  );

  return {
    discussionId,
    isDiscussionActive: !discussion || discussion.status !== 'finished',
    scenario: discussion
      && Scenarios.findOne({ _id: discussion.scenarioId }),
    participants: (group && Meteor.users.find({
      _id: {
        $in: group.members,
      },
    }).fetch()) || false,
  };
})(DiscussionPage);
