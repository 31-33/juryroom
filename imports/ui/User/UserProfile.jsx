import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';

class UserProfile extends Component{


    render(){

        return (
            <h1>User: {this.props.user_id}</h1>
        )
    }
}

export default withTracker(({match}) => {
    const user_id = match.params.user_id;


    return {
        user_id: user_id,

    }
})(UserProfile);