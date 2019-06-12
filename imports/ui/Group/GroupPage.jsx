import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

class Group extends Component {
  render() {
    return (
      <h1>Group</h1>
    );
  }
}

export default withTracker(({ match }) => {
  const { groupId } = match.params;
  Meteor.subscribe('groups');

  return {
    groupId,
    members: [],
    discussions: [],
  };
})(Group);
