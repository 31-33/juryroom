import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Segment, Header, Container, List } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Groups } from '/imports/api/Groups';
import GroupSummary from './GroupSummary';

class Dashboard extends Component {

    render(){
        return (
            <Segment>
                <Header size='huge'>Dashboard</Header>

                <Header attached='top'>Groups</Header>
                <Segment attached="bottom">
                    <List divided>
                        {this.props.groups.map(group => <GroupSummary key={group._id} group={group} />)}
                    </List>
                </Segment>
            </Segment>
        );
    }
}

export default withTracker((props) => {
    Meteor.subscribe('groups');
    
    const user_id = Meteor.userId();

    return {
        user_id: user_id,
        groups: Groups.find(
            { members: `${user_id}` }
        ).fetch(),
    }
    
})(Dashboard);