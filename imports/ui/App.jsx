import React, { Component } from 'react';
import AccountsUIWrapper from '/imports/ui/AccountsUIWrapper';
import '/imports/startup/accounts-config';
import DiscussionThread from '/imports/ui/DiscussionThread';
import { Icon, Container, Divider, Dropdown, Grid, Header, Image, List, Menu, Segment } from 'semantic-ui-react';


class App extends Component {

  constructor(props){
    super(props);
  }

  comments = [
        {
          username: 'bob',
          time: '(timestamp)',
          text: 'hello world!',
          voted: false
        },
        {
          username: 'ann',
          time: '(timestamp)',
          text: 'hello world!',
          voted: false,
          children: [
            {
              username: 'bob',
              time: '(timestamp)',
              text: 'sub-comment1',
              voted: false
            },
            {
              username: 'ann',
              time: '(timestamp)',
              text: 'sub-comment2',
              voted: false
            },
            {
              username: 'foo',
              time: '(timestamp)',
              text: 'sub-comment3',
              voted: false
            },
            {
              username: 'bob',
              time: '(timestamp)',
              text: 'sub-comment4',
              voted: false
            },
          ]
        },
        {
          username: 'foo',
          time: '(timestamp)',
          text: 'bar',
          voted: false
        },
        {
          username: 'bob',
          time: '(timestamp)',
          text: 'test',
          voted: false
        },
      ];

  render() {
    return (
      <div className="container">
        <Menu fixed="top" inverted>
          <Container>
            <Menu.Item as="a" header>
              <Icon size="big" name="balance scale"/>
              JuryRoom
            </Menu.Item>
            <Menu.Item as="a">Browse</Menu.Item>
            <Menu.Item as="a" position="right">
              <AccountsUIWrapper />
            </Menu.Item>
          </Container>
        </Menu>
        <Container>
          <DiscussionThread comments={this.comments} />
        </Container>
      </div>
    );
  }
}


export default App;
