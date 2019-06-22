import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import Scenarios from '/imports/api/Scenarios';
import { ScenarioPropType } from '/imports/types';
import {
  Segment, Dimmer, Loader, Header,
} from 'semantic-ui-react';

class ScenarioView extends Component {
  static defaultProps = {
    scenario: false,
  }

  static propTypes = {
    scenario: PropTypes.oneOfType([ScenarioPropType, PropTypes.bool]),
  }

  render() {
    const { scenario } = this.props;
    return scenario
      ? (
        <Segment>
          <Header
            content={scenario.title}
            subheader={scenario.description}
          />
        </Segment>
      ) : (
        <Segment>
          <Dimmer active page inverted>
            <Loader size="large">Loading</Loader>
          </Dimmer>
        </Segment>
      );
  }
}

export default withTracker(({ match }) => {
  const { scenarioId } = match.params;
  Meteor.subscribe('scenarios');

  return {
    scenario: Scenarios.findOne({ _id: scenarioId }),
  };
})(ScenarioView);
