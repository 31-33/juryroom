import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Segment, Header } from 'semantic-ui-react';

class Dashboard extends Component {


    render(){
        
        return (
            <Segment>
                <Header>Dashboard</Header>
                <Link to='/discussion/0'>Click here to view the active discussion</Link>
            </Segment>
        );
    }
}

export default Dashboard;