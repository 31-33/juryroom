import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Segment, List, Container, Header } from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Comments } from '/imports/api/Comments';

class DiscussionSummary extends Component {

    render(){

        return (
            <List.Item>
                <List.Content>
                    <Header as={Link} to={`/discussion/${this.props.discussion_id}`} content={this.props.scenario} />
                    Comments: {this.props.comment_count}
                </List.Content>
            </List.Item>
        );
    }
}

export default withTracker(({discussion_id}) => {
    Meteor.subscribe('comments', discussion_id);

    return {
        scenario: 'Test topic',
        comment_count: Comments.find({ discussion_id: discussion_id}).count(),
    }

})(DiscussionSummary);