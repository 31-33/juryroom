import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Segment, Header, Button, Form, TextArea } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import { Redirect } from 'react-router-dom';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
import ReactAvatarEditor from 'react-avatar-editor';

class EditProfile extends Component {

    constructor(props){
        super(props);

        const { avatar } = props.user || {};
        this.state = {
            scale: 1,
            image: avatar ? avatar : '/avatar_default.png',
        }
    }

    componentDidUpdate(prevProps){
        if(!prevProps.user && this.props.user && this.props.user.avatar){
            this.setState({
                image: this.props.user.avatar,
            });
        }
    }


    getImage(){
        return this.editor.getImageScaledToCanvas().toDataURL();
    }

    saveProfile(){
        Meteor.call('users.updateProfile', this.getImage(), (err, res) => {
            this.props.history.push(`/user/${this.props.user_id}`);
        });
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
                                <ReactAvatarEditor
                                    ref={(editor) => this.editor = editor}
                                    width={100}
                                    height={100}
                                    image={this.state.image}
                                    scale={parseFloat(this.state.scale)}
                                />
                                <div>
                                    <input type='range' min='0.25' max='4' step='0.05' defaultValue='1' onChange={(e) => this.setState({ scale: parseFloat(e.target.value)})} />
                                    <input type='file' onChange={(e) => this.setState({ image: e.target.files[0] })} />
                                </div>
                            </Form.Group>                          
                        </Segment.Group>

                        <Form.TextArea label='About' />
                        <Form.Button onClick={this.saveProfile.bind(this)}>Save</Form.Button>
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