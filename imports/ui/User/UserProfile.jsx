import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Segment, Header, Button, Item } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

class UserProfile extends Component{


    render(){
        if(!this.props.user){
            // TODO: user not found
            return '';
        }
        const { _id, username, avatar } = this.props.user;
        console.log(this.props);
        return (
            <Segment>
                <Item.Group>
                    <Item>
                        <Item.Image size='tiny' avatar src={avatar ? avatar : '/avatar_default.png'} />
                        <Item.Content>
                            {_id === Meteor.userId() ?
                            (
                                <Button 
                                    floated='right'
                                    as={Link} to={`${this.props.location.pathname}/edit`}>
                                    Edit Profile
                                </Button>
                            ) : ''}
                            <Item.Header>
                                {username}
                            </Item.Header>
                            <Item.Meta>&nbsp;</Item.Meta>
                            <Item.Description>
                                <Header sub>Description</Header>
                                &nbsp;
                            </Item.Description>
                        </Item.Content>
                    </Item>
                </Item.Group>
            </Segment>
        )
    }
}

export default withTracker(({match}) => {
    Meteor.subscribe('users');

    return {
        user: Meteor.users.findOne({ _id: match.params.user_id }),
    }
})(UserProfile);