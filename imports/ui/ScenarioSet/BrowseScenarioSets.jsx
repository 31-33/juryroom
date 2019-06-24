import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import ScenarioSets from '/imports/api/ScenarioSets';
import PropTypes from 'prop-types';
import { ScenarioSetPropType } from '/imports/types';
import {
  Container, Header, Segment, List,
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
  }

  render() {
    const { scenarioSets } = this.props;

    return (
      <Container>
        <Header
          as={Segment}
          size="huge"
          attached="top"
          content="Browse Scenario Sets"
        />
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
  };
})(BrowseScenarioSets);
