import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import {
  Container, Segment, Header, List, Image, Dimmer, Loader,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import {
  GroupPropType, ScenarioPropType, DiscussionPropType,
} from '/imports/types';
import Groups from '/imports/api/Groups';
import Scenarios from '/imports/api/Scenarios';
import Discussions from '/imports/api/Discussions';
import HeaderWithInfoMessage from '/imports/ui/Error/HeaderWithInfoMessage';

class Group extends Component {
  static defaultProps = {
    group: false,
  }

  static propTypes = {
    group: PropTypes.oneOfType([GroupPropType, PropTypes.bool]),
    discussions: PropTypes.arrayOf(DiscussionPropType).isRequired,
    scenarios: PropTypes.arrayOf(ScenarioPropType).isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      members: undefined,
    };
  }

  componentDidMount() {
    const { group } = this.props;
    Meteor.call('users.getMembersOfGroup', group._id, (err, members) => {
      if (!err) {
        this.setState({ members });
      }
    });
  }

  render() {
    const {
      group, discussions, scenarios,
    } = this.props;
    const { members } = this.state;

    return group && (
      <Container>
        <Segment attached="top">
          <HeaderWithInfoMessage
            header="View Group"
            infoMessage="This page shows information about the selected group"
          />
        </Segment>
        <Segment attached="bottom">
          <Header attached="top" content="Members" />
          <List
            as={Segment}
            attached="bottom"
            divided
            relaxed="very"
          >
            {members
              ? members.map(user => (
                <List.Item key={user._id} as={Link} to={`/user/${user._id}`}>
                  <Image avatar src={user.avatar} />
                  <List.Content header={user.username} />
                </List.Item>
              ))
              : (
                <Dimmer active inverted>
                  <Loader />
                </Dimmer>
              )}
          </List>
          <Header attached="top" content="Discussions" />
          <List
            as={Segment}
            attached="bottom"
            divided
            relaxed="very"
          >
            {discussions.map((discussion) => {
              const scenario = scenarios.find(sc => sc._id === discussion.scenarioId);
              return (
                <List.Item
                  key={discussion._id}
                  as={Link}
                  to={`/discussion/${discussion._id}`}
                >
                  <List.Content
                    floated="left"
                    header={scenario.title}
                    description={scenario.description}
                  />
                </List.Item>
              );
            })}
          </List>
        </Segment>
      </Container>
    );
  }
}

export default withTracker(({ match }) => {
  const { groupId } = match.params;
  const group = Groups.findOne({ _id: groupId });

  return {
    group,
    discussions: group ? Discussions.find(
      { _id: { $in: group.discussions.map(discussion => discussion.discussionId) } },
    ).fetch() : [],
    scenarios: group ? Scenarios.find(
      { _id: { $in: group.discussions.map(discussion => discussion.scenarioId) } },
    ).fetch() : [],
  };
})(Group);
