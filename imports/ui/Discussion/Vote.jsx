import React, { Component } from 'react';
import { Segment, Button, List, Image, Item, Container } from 'semantic-ui-react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Groups } from '/imports/api/Groups';

class Vote extends Component{

    render(){
        return (
            <Segment attached='bottom'>
                {
                    this.props.isActive && 
                    !this.props.vote.user_votes.some(vote => vote.user_id === Meteor.userId()) ? 
                (
                    <Button.Group>
                        <Button negative
                            content='Disagree'
                            onClick={() => Meteor.call('votes.vote', this.props.vote._id, false)}
                            attached='left'/>
                        <Button positive
                            content='Agree' 
                            onClick={() => Meteor.call('votes.vote', this.props.vote._id, true)}
                            attached='right'/>
                    </Button.Group>
                ) :
                (
                    <List horizontal>
                        {this.props.participants.map(user => {
                            const vote = this.props.vote.user_votes.find(vote => vote.user_id === user._id);
                            return (
                                <List.Item key={user._id}>
                                    <Segment
                                        size='mini'
                                        textAlign='center'
                                        compact
                                        inverted
                                        secondary
                                        color={
                                            vote === undefined ? 'grey' :
                                            vote.vote === true ? 'green' : 'red'
                                        }>
                                        <Image
                                            disabled={vote === undefined}
                                            bordered
                                            size='mini'
                                            circular
                                            src={user.avatar ? user.avatar : '/avatar_default.png'}
                                            />
                                            {user.username}
                                    </Segment>
                                </List.Item>
                            );
                        })}
                    </List>
                )}
            </Segment>
        );
    }
}

export default Vote;