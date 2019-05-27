import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Segment, List, Container } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Discussions } from '/imports/api/Discussions';
import DiscussionSummary from './DiscussionSummary';

class GroupSummary extends Component {

    render(){
        return (
            <List.Item>
                <List.Content>
                    <Segment.Group horizontal>
                        <Container fluid>
                            <List selection divided>
                                <List.Header>Discussions</List.Header>
                                {
                                    this.props.discussions.map(discussion => (
                                        <DiscussionSummary 
                                            key={discussion._id} 
                                            discussion_id={discussion._id} 
                                            participants={this.props.participants} 
                                            />
                                        ))
                                }
                            </List>
                        </Container>
                        <Segment compact>
                            <List selection>
                                <List.Header>Members</List.Header>
                                {
                                    this.props.group.members.map(member_id => {
                                        const user = this.props.participants.find(user => user._id === member_id);
                                        return user ? (
                                            <List.Item key={user._id} as={Link} to={`/user/${user._id}`}>{user.username}</List.Item>
                                        ) : '';
                                    })
                                }
                            </List>
                        </Segment>
                    </Segment.Group>
                </List.Content>
            </List.Item>
        )
    }
}
export default withTracker(({group}) => {
    Meteor.subscribe('discussions');
    Meteor.subscribe('discussionParticipants');

    return {
        participants: Meteor.users.find({ _id: { $in: group.members } }).fetch(),
        discussions: Discussions.find({ _id: { $in: group.discussions } }).fetch(),
    }

})(GroupSummary);