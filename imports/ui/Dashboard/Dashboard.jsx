import React, { Component } from 'react';
import { Segment, Header, List } from 'semantic-ui-react';
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
      <Segment>
        <Header size="huge">Dashboard</Header>

        <Header attached="top">Groups</Header>
        <Segment attached="bottom">
          <List divided>
            {groups.map(group => <GroupSummary key={group._id} group={group} />)}
          </List>
        </Segment>
      </Segment>
    );
  }
}

export default withTracker(() => {
  Meteor.subscribe('groups');

  return {
    groups: Groups.find(
      { members: `${Meteor.userId()}` },
    ).fetch(),
  };
})(Dashboard);
