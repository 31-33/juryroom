import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import {
  Container, Segment, Header, Dropdown, List, Button,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { TopicPropType, ScenarioPropType } from '/imports/types';

import Topics from '/imports/api/Topics';
import Scenarios from '/imports/api/Scenarios';

export function renderScenarioSummary(scenario, topic) {
  // TODO: fetch statistics about this scenario
  // total number of discussions about this, outcomes, in progress, etc
  return (
    <List.Item key={scenario._id} as={Link} to={`/scenarios/${scenario._id}`}>
      {topic && <List.Content floated="right" content={topic.title} />}
      <List.Content as={Header} content={scenario.title} />
      <List.Description content={scenario.description} />
    </List.Item>
  );
}

class BrowseScenario extends Component {
  static defaultProps = {
    scenarios: false,
    topics: false,
  }

  static propTypes = {
    canCreateNew: PropTypes.bool.isRequired,
    scenarios: PropTypes.oneOfType([PropTypes.arrayOf(ScenarioPropType), PropTypes.bool]),
    topics: PropTypes.oneOfType([PropTypes.arrayOf(TopicPropType), PropTypes.bool]),
  }

  constructor(props) {
    super(props);
    this.state = {
      selectedTopics: [],
    };
  }

  renderTopicSelection() {
    const { topics } = this.props;
    return (
      <Segment floated="right" basic>
        Filter Topics
        &nbsp;
        <Dropdown
          loading={!topics}
          multiple
          selection
          options={topics ? topics.map(topic => ({
            key: topic._id,
            text: topic.title,
            value: topic._id,
          })) : []}
          onChange={(event, selection) => this.setState({ selectedTopics: selection.value })}
        />
      </Segment>
    );
  }

  render() {
    const { canCreateNew, scenarios, topics } = this.props;
    const { selectedTopics } = this.state;
    return (
      <Container>
        <Header attached="top" as={Segment} clearing size="huge">
          Browse Scenarios
          {this.renderTopicSelection()}
          {canCreateNew && (
            <Container>
              <Button content="Create New" as={Link} to="/scenarios/create" color="green" />
            </Container>
          )}
        </Header>
        <List
          as={Segment}
          attached="bottom"
          divided
          relaxed="very"
        >
          {scenarios && scenarios.map(
            scenario => (selectedTopics.length === 0 || selectedTopics.includes(scenario.topicId))
            && renderScenarioSummary(
              scenario,
              topics.find(topic => topic._id === scenario.topicId),
            ),
          )}
        </List>
      </Container>
    );
  }
}

export default withTracker(() => {
  Meteor.subscribe('topics');
  Meteor.subscribe('scenarios');

  return {
    topics: Topics.find({}).fetch(),
    scenarios: Scenarios.find({ status: 'active' }).fetch(),
    canCreateNew: Roles.userIsInRole(Meteor.userId(), ['admin', 'create-scenario']),
  };
})(BrowseScenario);
