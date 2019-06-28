import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import {
  Container, Segment, Header, List,
} from 'semantic-ui-react';
import {
  ScenarioSetPropType, ScenarioPropType, TopicPropType, GroupPropType,
} from '/imports/types';
import ScenarioSets from '/imports/api/ScenarioSets';
import Scenarios from '/imports/api/Scenarios';
import Topics from '/imports/api/Topics';
import Groups from '/imports/api/Groups';
import { renderScenarioSummary } from '/imports/ui/Scenario/BrowseScenarios';
import LoadingPage from '/imports/ui/Error/LoadingPage';
import NotFoundPage from '/imports/ui/Error/NotFoundPage';
import HeaderWithInfoMessage from '/imports/ui/Error/HeaderWithInfoMessage';

class ScenarioSetView extends Component {
  static defaultProps = {
    scenarioSet: false,
  }

  static propTypes = {
    scenarioSet: PropTypes.oneOfType([ScenarioSetPropType, PropTypes.bool]),
    scenarios: PropTypes.arrayOf(ScenarioPropType).isRequired,
    topics: PropTypes.arrayOf(TopicPropType).isRequired,
    groups: PropTypes.arrayOf(GroupPropType).isRequired,
    loaded: PropTypes.bool.isRequired,
  }

  render() {
    const {
      scenarioSet, scenarios, topics, groups, loaded,
    } = this.props;

    if (!loaded) {
      return <LoadingPage />;
    }

    if (!scenarioSet) {
      return <NotFoundPage />;
    }

    return (
      <Container>
        <Segment attached="top">
          <HeaderWithInfoMessage
            header={scenarioSet.title}
            subheader={scenarioSet.description}
            infoMessage="This page shows details about the selected scenario set, such as the scenarios contained within the set."
          />
        </Segment>
        <Segment attached="bottom">
          <Header
            attached="top"
            content="Scenarios"
          />
          <List
            as={Segment}
            attached="bottom"
            divided
            relaxed="very"
          >
            {scenarios.map(scenario => renderScenarioSummary(
              scenario,
              topics.find(topic => topic._id === scenario.topicId),
            ))}
          </List>

          <Header
            attached="top"
            content="Associated Groups"
          />
          <List
            as={Segment}
            attached="bottom"
            divided
            relaxed="very"
          >
            {groups.map(group => (
              <List.Item
                key={group._id}
                as={Link}
                to={`/groups/${group._id}`}
              >
                <List.Description
                  content={`Members: ${group.members.length}`}
                />
              </List.Item>
            ))}
          </List>
        </Segment>
      </Container>
    );
  }
}

export default withTracker(({ match }) => {
  const { scenarioSetId } = match.params;
  const scenarioSetsSub = Meteor.subscribe('scenarioSets');
  Meteor.subscribe('scenarios');
  Meteor.subscribe('topics');
  Meteor.subscribe('groups');

  const scenarioSet = ScenarioSets.findOne({ _id: scenarioSetId });

  return {
    loaded: scenarioSetsSub.ready(),
    scenarioSet,
    scenarios: Scenarios.find(
      { _id: { $in: scenarioSet ? scenarioSet.scenarios : [] } },
    ).fetch() || [],
    topics: Topics.find({}).fetch() || [],
    groups: Groups.find({ scenarioSetId }).fetch() || [],
  };
})(ScenarioSetView);
