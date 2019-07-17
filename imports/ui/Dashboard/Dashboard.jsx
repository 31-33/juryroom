import React, { Component } from 'react';
import {
  Segment, Header, List, Container,
} from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import Groups from '/imports/api/Groups';
import GroupSummary from './GroupSummary';
import { GroupPropType } from '/imports/types';

class Dashboard extends Component {
  static propTypes = {
    groups: PropTypes.arrayOf(GroupPropType).isRequired,
  }

  render() {
    const { groups } = this.props;
    return (
      <Container>
        <Segment attached="top">
          <Header size="huge" content="Dashboard" />
        </Segment>
        <Segment attached="bottom">
          <Header content="Groups" />
          <List relaxed size="huge">
            {groups.map(group => <GroupSummary key={group._id} group={group} />)}
          </List>
        </Segment>
      </Container>
    );
  }
}

export default withTracker(() => ({
  groups: Groups.find(
    { members: Meteor.userId() },
  ).fetch(),
}))(Dashboard);
