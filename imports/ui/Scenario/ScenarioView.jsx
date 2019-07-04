import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import Scenarios from '/imports/api/Scenarios';
import { ScenarioPropType } from '/imports/types';
import {
  Segment, Container,
} from 'semantic-ui-react';
import NotFoundPage from '/imports/ui/Error/NotFoundPage';
import HeaderWithInfoMessage from '/imports/ui/Error/HeaderWithInfoMessage';

class ScenarioView extends Component {
  static defaultProps = {
    scenario: false,
  }

  static propTypes = {
    scenario: PropTypes.oneOfType([ScenarioPropType, PropTypes.bool]),
  }

  render() {
    const { scenario } = this.props;

    if (!scenario) {
      return <NotFoundPage />;
    }

    return (
      <Container>
        <Segment attached="top">
          <HeaderWithInfoMessage
            header={scenario.title}
            subheader={scenario.description}
            infoMessage="This page shows information about the selected scenario."
          />
        </Segment>
      </Container>
    );
  }
}

export default withTracker(({ match }) => {
  const { scenarioId } = match.params;

  return {
    scenario: Scenarios.findOne({ _id: scenarioId }),
  };
})(ScenarioView);
