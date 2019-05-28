import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Segment, Header, Button, Form, TextArea } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router-dom';
import AvatarEditor from 'react-avatar-editor';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';

class EditProfile extends Component {

    constructor(props){
        super(props);

        this.state = {
            image: '/avatar_default.png',
        }
    }
    render(){
        const { username } = this.props.user || {};
        return this.props.user_id === Meteor.userId() ?
        (
            <Segment>
                <Header attached='top'>{username ? username : ''}
                    <Header.Subheader>(Edit Profile)</Header.Subheader>
                </Header>
                <Segment attached='bottom'>
                    <Form>
                        <Segment.Group horizontal>
                            <Form.Group grouped as={Segment} floated='left'>
                                <Form.Group>
                                    <Form.Input label='First Name' />
                                    <Form.Input label='Last Name' />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Input label='Gender' />
                                    <Form.Field label='Date of Birth' control={DayPickerInput} format='DD/MM/YYYY' placeholder='DD/MM/YYYY' />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Input label='Ethnicity' />
                                    <Form.Input label='Religion' />
                                </Form.Group>
                            </Form.Group>
                            <Form.Group grouped as={Segment} floated='right'>
                                <Form.Field 
                                    label='Avatar' 
                                    control={AvatarEditor}
                                    image={this.state.image}
                                    />
                                <input type='file' onChange={(e) => this.setState({ image: e.target.files[0] })} />
                            </Form.Group>
                            
                        </Segment.Group>


                        <Form.TextArea label='About' />
                        <Form.Button>Save</Form.Button>
                    </Form>
                </Segment>
            </Segment>
        ) : <Redirect to={`/user/${this.props.user_id}`} />;
    }
}

export default withTracker(({match}) => {
    Meteor.subscribe('users');

    const user_id = match.params.user_id;
    return {
        user_id: user_id,
        user: Meteor.users.findOne({ _id: user_id })
    }

})(EditProfile);