import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { withTracker } from 'meteor/react-meteor-data';
import ScenarioSets from '/imports/api/ScenarioSets';
import PropTypes from 'prop-types';
import { ScenarioSetPropType } from '/imports/types';
import {
  Container, Segment, List, Button,
} from 'semantic-ui-react';
import HeaderWithInfoMessage from '/imports/ui/Error/HeaderWithInfoMessage';

export function renderScenarioSetSummary(set) {
  return (
    <List.Item key={set._id} as={Link} to={`/sets/${set._id}`}>
      <List.Content
        header={set.title}
        content={set.description}
        description={`${set.scenarios.length} scenarios`}
      />
    </List.Item>
  );
}

class BrowseScenarioSets extends Component {
  static defaultProps = {
    scenarioSets: false,
  }

  static propTypes = {
    scenarioSets: PropTypes.oneOfType([PropTypes.arrayOf(ScenarioSetPropType), PropTypes.bool]),
  }

  render() {
    const { scenarioSets } = this.props;

    return (
      <Container>
        <Segment attached="top">
          <HeaderWithInfoMessage
            header="Browse Scenario Sets"
            infoMessage="This page contains the list of Scenario Sets."
          />
          {Roles.userIsInRole(Meteor.userId(), ['admin', 'create-scenario-set']) && (
            <Button content="Create New" as={Link} to="/sets/create" color="green" />
          )}
        </Segment>
        <List
          as={Segment}
          attached="bottom"
          divided
          relaxed="very"
        >
          {scenarioSets && scenarioSets.map(scenarioSet => renderScenarioSetSummary(scenarioSet))}
        </List>
      </Container>
    );
  }
}

export default withTracker(() => ({
  scenarioSets: ScenarioSets.find({ status: 'active' }).fetch(),
}))(BrowseScenarioSets);
