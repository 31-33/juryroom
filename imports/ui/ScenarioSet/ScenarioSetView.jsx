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

class ScenarioSetView extends Component {
  static defaultProps = {
    scenarioSet: false,
  }

  static propTypes = {
    scenarioSet: PropTypes.oneOfType([ScenarioSetPropType, PropTypes.bool]),
    scenarios: PropTypes.arrayOf(ScenarioPropType).isRequired,
    topics: PropTypes.arrayOf(TopicPropType).isRequired,
    groups: PropTypes.arrayOf(GroupPropType).isRequired,
  }

  render() {
    const {
      scenarioSet, scenarios, topics, groups,
    } = this.props;
    return scenarioSet && (
      <Container>
        <Header
          as={Segment}
          size="huge"
          attached="top"
          content={scenarioSet.title}
          subheader={scenarioSet.description}
        />
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
  Meteor.subscribe('scenarioSets');
  Meteor.subscribe('scenarios');
  Meteor.subscribe('topics');
  Meteor.subscribe('groups');

  const scenarioSet = ScenarioSets.findOne({ _id: scenarioSetId });

  return {
    scenarioSet,
    scenarios: Scenarios.find(
      { _id: { $in: scenarioSet ? scenarioSet.scenarios : [] } },
    ).fetch() || [],
    topics: Topics.find({}).fetch() || [],
    groups: Groups.find({ scenarioSetId }).fetch() || [],
  };
})(ScenarioSetView);
