import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { Roles } from 'meteor/alanning:roles';
import { withTracker } from 'meteor/react-meteor-data';
import ScenarioSets from '/imports/api/ScenarioSets';
import PropTypes from 'prop-types';
import { ScenarioSetPropType } from '/imports/types';
import {
  Container, Header, Segment, List, Button,
} from 'semantic-ui-react';

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
    canCreateNew: PropTypes.bool.isRequired,
  }

  render() {
    const { scenarioSets, canCreateNew } = this.props;

    return (
      <Container>
        <Header
          as={Segment}
          size="huge"
          attached="top"
        >
          Browse Scenario Sets
          {canCreateNew && (
            <Container>
              <Button content="Create New" as={Link} to="/sets/create" color="green" />
            </Container>
          )}
        </Header>
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

export default withTracker(() => {
  Meteor.subscribe('scenarioSets');

  return {
    scenarioSets: ScenarioSets.find({ status: 'active' }).fetch(),
    canCreateNew: Roles.userIsInRole(Meteor.userId(), ['admin', 'create-scenario-set']),
  };
})(BrowseScenarioSets);
