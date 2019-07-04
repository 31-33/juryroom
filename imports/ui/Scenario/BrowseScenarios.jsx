import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import {
  Container, Segment, Header, List, Button, Form, Grid,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { TopicPropType, ScenarioPropType } from '/imports/types';

import Topics from '/imports/api/Topics';
import Scenarios from '/imports/api/Scenarios';
import HeaderWithInfoMessage from '/imports/ui/Error/HeaderWithInfoMessage';

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

  render() {
    const { canCreateNew, scenarios, topics } = this.props;
    const { selectedTopics } = this.state;
    return (
      <Container>
        <Segment attached="top" clearing>
          <HeaderWithInfoMessage
            header="Browse Scenarios"
            infoMessage="This page contains the list of scenarios."
          />
          <Grid>
            <Grid.Column floated="left" width={4} verticalAlign="bottom">
              {canCreateNew && (
                <Button
                  content="Create New"
                  as={Link}
                  to="/scenarios/create"
                  color="green"
                  floated="left"
                />
              )}
            </Grid.Column>
            <Grid.Column floated="right" width={4} stretched>
              <Form.Dropdown
                label="Filter Topics"
                fluid
                loading={!topics}
                multiple
                selection
                options={topics ? topics.map(topic => ({
                  key: topic._id,
                  text: topic.title,
                  value: topic._id,
                })) : []}
                onChange={(event, selection) => this.setState({
                  selectedTopics: selection.value,
                })}
              />
            </Grid.Column>
          </Grid>
        </Segment>
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

export default withTracker(() => ({
  topics: Topics.find({}).fetch(),
  scenarios: Scenarios.find({ status: 'active' }).fetch(),
  canCreateNew: Roles.userIsInRole(Meteor.userId(), ['admin', 'create-scenario']),
}))(BrowseScenario);
