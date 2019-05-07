import React, { Component, createRef } from 'react';
import AccountsUIWrapper from '/imports/ui/AccountsUIWrapper';
import '/imports/startup/accounts-config';
import DiscussionThread from '/imports/ui/DiscussionThread';
import { Container, Divider, Dropdown, Grid, Header, Icon, Image, List, Menu, Segment, Sticky, Ref } from 'semantic-ui-react';


class App extends Component {
  contextRef = createRef();

  constructor(props){
    super(props);
  }

  comments = [
        {
          id: 0,
          username: 'bob',
          time: '(timestamp)',
          text: 'hello world!',
          voted: false
        },
        {
          id: 1,
          time: '(timestamp)',
          username: 'ann',
          text: 'hello world!',
          voted: false,
          children: [
            {
              id: 4,
              username: 'bob',
              time: '(timestamp)',
              text: 'sub-comment1',
              voted: false
            },
            {
              id: 5,
              username: 'ann',
              time: '(timestamp)',
              text: 'sub-comment2',
              voted: false
            },
            {
              id: 6,
              username: 'foo',
              time: '(timestamp)',
              text: 'sub-comment3',
              voted: false
            },
            {
              id: 7,
              username: 'bob',
              time: '(timestamp)',
              text: 'sub-comment4',
              voted: false,
              children: [
                {
                  id: 10,
                  username: 'bob',
                  time: '(timestamp)',
                  text: 'hello world!',
                  voted: false
                },
                {
                  id: 11,
                  time: '(timestamp)',
                  username: 'ann',
                  text: 'hello world!',
                  voted: false,
                  children: [
                    {
                      id: 14,
                      username: 'bob',
                      time: '(timestamp)',
                      text: 'sub-comment1',
                      voted: false
                    },
                    {
                      id: 15,
                      username: 'ann',
                      time: '(timestamp)',
                      text: 'sub-comment2',
                      voted: false
                    },
                    {
                      id: 16,
                      username: 'foo',
                      time: '(timestamp)',
                      text: 'sub-comment3',
                      voted: false
                    },
                    {
                      id: 17,
                      username: 'bob',
                      time: '(timestamp)',
                      text: 'sub-comment4',
                      voted: false
                    },
                  ]
                },
                {
                  id: 12,
                  username: 'foo',
                  time: '(timestamp)',
                  text: 'bar',
                  voted: false
                },
                {
                  id: 13,
                  username: 'bob',
                  time: '(timestamp)',
                  text: 'test',
                  voted: false
                }
              ]
            },
          ]
        },
        {
          id: 12,
          username: 'foo',
          time: '(timestamp)',
          text: 'bar',
          voted: false
        },
        {
          id: 13,
          username: 'bob',
          time: '(timestamp)',
          text: 'test',
          voted: false
        },
      ];

  render() {
    return (
      <div ref={this.contextRef}>
        <Sticky context={this.contextRef}>
          <Menu attached="top" inverted>
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
        </Sticky>
        <Container>
          <DiscussionThread comments={this.comments} />
        </Container>
      </div>
    );
  }
}


export default App;
