import React, { Component } from 'react';
import {
  Segment, Header, List, Container, Button, Message, Icon, Divider,
} from 'semantic-ui-react';
import { withTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import Groups from '/imports/api/Groups';
import GroupSummary from './GroupSummary';
import { GroupPropType } from '/imports/types';

class Dashboard extends Component {
  static propTypes = {
    groups: PropTypes.arrayOf(GroupPropType).isRequired,
  }

  constructor(props) {
    super(props);

    this.state = {
      showInfo: true,
    };
  }

  render() {
    const { groups } = this.props;
    const { showInfo } = this.state;

    return (
      <Container>
        <Segment attached="top" clearing>
          <Header size="huge">
            <Header.Content as={Container} fluid>
              <Button
                floated="right"
                circular
                color="blue"
                size="massive"
                icon="help circle"
                onClick={() => this.setState({ showInfo: !showInfo })}
              />
              Dashboard
            </Header.Content>
          </Header>
          <Message
            size="large"
            info
            floating
            hidden={!showInfo}
            onDismiss={() => this.setState({ showInfo: false })}
          >
            <Message.Header>
              <Icon name="help circle" size="big" />
              {' '}
              About JuryRoom
            </Message.Header>
            <Divider horizontal hidden />
            <Message.Content>
              JuryRoom is a digital environment designed to host discussions with a focus on reaching a consensus.
            </Message.Content>
            <Message.Content>
              You will participate in a sequence of discussions, and must reach a consensus as a group before proceeding to the next discussion topic.
            </Message.Content>
            <Message.List>
              <Message.Item>
                Participate in discussions by posting comments.
              </Message.Item>
              <Message.Item>
                Star comments that you think best answer the discussion topic. You may have one comment starred at a time per discussion.
              </Message.Item>
              <Message.Item>
                You may call for a vote on a comment you have starred. There can only be one vote active at a time.
              </Message.Item>
              <Message.Item>
                On an active vote, indicate whether you agree or disagree. If everyone agrees, the discussion is closed.
              </Message.Item>
              <Message.Item>
                If the group is unable to reach a consensus, a 'hung jury' will be declared.
              </Message.Item>
            </Message.List>
            <Divider horizontal hidden />
            <Message.Content>
              You will gain points for contributing to discussions, and lose points if the group fails to reach a consensus within the allotted time.
            </Message.Content>
          </Message>
        </Segment>
        {groups.length > 0 && (
          <Segment attached="bottom">
            <Header content="Groups" />
            <List relaxed size="huge">
              {groups.map(group => <GroupSummary key={group._id} group={group} />)}
            </List>
          </Segment>
        )}
      </Container>
    );
  }
}

export default withTracker(() => ({
  groups: Groups.find(
    { members: Meteor.userId() },
  ).fetch(),
}))(Dashboard);
