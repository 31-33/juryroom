import React, { PureComponent } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import {
  Sidebar, Container, Segment, Header, Button, Visibility,
} from 'semantic-ui-react';
import Swipe from 'react-easy-swipe';
import Moment from 'react-moment';

import Discussions from '/imports/api/Discussions';
import Scenarios from '/imports/api/Scenarios';

import StarredCommentView from './StarredCommentView';
import DiscussionOverview from './DiscussionOverview';
import DiscussionThread from './DiscussionThread';
import CommentForm from './CommentForm';
import NotFoundPage from '/imports/ui/Error/NotFoundPage';
import LoadingPage from '/imports/ui/Error/LoadingPage';

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
    .filter(reply => new Date() - reply.activeTime < 5 * 60 * 1000)
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


{/* ########################################################################
Contains the 'Post' button for for posting a comment.
Calls 'comments.reply' Meteor Method when clicked */}
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
    location: PropTypes.shape({
      hash: PropTypes.string,
    }).isRequired,
    discussionId: PropTypes.string.isRequired,
    discussion: PropTypes.oneOfType([
      PropTypes.shape({
        scenarioId: PropTypes.string.isRequired,
        status: PropTypes.string.isRequired,
        deadline: PropTypes.objectOf(Date),
      }),
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
      participants: undefined,
      error: false,
    };
  }

  componentDidMount() {
    const { discussionId } = this.props;
    Meteor.call('users.getMembersOfDiscussion', discussionId, (error, participants) => {
      if (error) {
        this.setState({ error });
      } else {
        this.setState({ participants });
      }
    });
  }

  scrollToComment = commentId => scrollToElement(`#${CSS.escape(commentId)}`, { align: 'top', offset: -120 });

  render() {
    const {
      location, discussionId, scenario, discussion,
    } = this.props;
    const {
      showStarredPanel, showOverviewPanel, error, participants,
    } = this.state;

    if (error) {
      return <NotFoundPage />;
    }

    if (!participants) {
      return <LoadingPage />;
    }

    return (
      <Visibility onUpdate={(e, { calculations }) => this.navbarRef.scrollByPercentage(
        calculations.pixelsPassed / (calculations.height - window.innerHeight),
      )}
      >
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
            ref={(e) => { this.navbarRef = e; }}
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
          <Segment attached="top" clearing>
            <Header
              size="huge"
              floated="left"
              content={scenario && scenario.title}
              subheader={scenario && scenario.description}
            />
            {discussion.deadline && discussion.status === 'active' && (
              <Header floated="right" size="small">
                Discussion ends
                {' '}
                <Moment fromNow>{discussion.deadline}</Moment>
              </Header>
            )}
            {discussion.status !== 'active' && (
              <Header
                floated="right"
                content={discussion.status === 'finished' ? 'Finished' : 'Hung Jury'}
                size="small"
              />
            )}
          </Segment>
          <Segment attached="bottom">
            <DiscussionThread
              discussionId={discussionId}
              participants={participants}
              scrollToComment={this.scrollToComment}
              hash={location.hash.replace('#', '')}
            />
            <ListReplyingUsers
              discussionId={discussionId}
              participants={participants}
            />
            
            {/* ########################################################################
            Post button */}
            <RenderPostForm
              discussionId={discussionId}
            />
          </Segment>
        </Sidebar.Pusher>
      </Visibility>
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
        deadline: 1,
      },
    },
  );

  return {
    discussionId,
    discussion: discussion || false,
    scenario: discussion
      && Scenarios.findOne({ _id: discussion.scenarioId }),
  };
})(DiscussionPage);
