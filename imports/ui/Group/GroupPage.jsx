import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

class Group extends Component {


    render(){

        return (
            <h1>Group</h1>
        );
    }
}

export default withTracker(({match}) => {
    const group_id = match.params.group_id;
    Meteor.subscribe('groups');

    return {
        group_id: group_id,
        members: [],
        discussions: []
    }
})(Group);