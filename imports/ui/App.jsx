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
          <DiscussionThread discussion_id='0' />
        </Container>
      </div>
    );
  }
}


export default App;
