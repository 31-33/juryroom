import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { ScenarioSetPropType } from '/imports/types';
import ScenarioSets from '/imports/api/ScenarioSets';
import {
  Container, Segment, Form, Modal, Radio,
} from 'semantic-ui-react';
import { Roles } from 'meteor/alanning:roles';
import NotAuthorizedPage from '/imports/ui/Error/NotAuthorizedPage';
import { MAX_COMMENT_LENGTH } from '/imports/api/Comments';
import HeaderWithInfoMessage from '/imports/ui/Error/HeaderWithInfoMessage';
import SendUserInvite from '/imports/ui/User/SendUserInvite';

class CreateGroup extends Component {
  static propTypes = {
    scenarioSets: PropTypes.arrayOf(ScenarioSetPropType).isRequired,
    users: PropTypes.arrayOf(PropTypes.shape({
      _id: PropTypes.string.isRequired,
      username: PropTypes.string,
      avatar: PropTypes.string,
      emails: PropTypes.arrayOf(PropTypes.shape({
        address: PropTypes.string.isRequired,
        verified: PropTypes.bool.isRequired,
      })),
    })).isRequired,
    history: PropTypes.shape({ push: PropTypes.func.isRequired }).isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      selectedSet: '',
      members: [],
      commentLengthLimit: MAX_COMMENT_LENGTH,
      showCreateUserModal: false,
      enforceMaxDuration: false,
      maxDiscussionDuration: 7,
    };
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value });

  render() {
    const { scenarioSets, users, history } = this.props;
    const {
      members, selectedSet, showCreateUserModal,
      commentLengthLimit,
      maxDiscussionDuration, enforceMaxDuration,
    } = this.state;

    if (!Meteor.user() === null && !Roles.userIsInRole(Meteor.userId(), ['admin', 'create-group'])) {
      return <NotAuthorizedPage />;
    }

    return (
      <Container>
        <Segment attached="top">
          <HeaderWithInfoMessage
            header="Create New Group"
            infoMessage="From this page, new groups can be created."
          />
        </Segment>
        <Form
          as={Segment}
          attached="bottom"
        >
          <Form.Dropdown
            label="Scenario Set"
            loading={scenarioSets.length === 0}
            selection
            search
            options={scenarioSets.map(scenarioSet => ({
              key: scenarioSet._id,
              text: scenarioSet.title,
              description: scenarioSet.description,
              value: scenarioSet._id,
            }))}
            name="selectedSet"
            onChange={this.handleChange}
          />
          <Form.Field control={Form.Group} label="Users">
            <Form.Dropdown
              width={14}
              loading={users.length === 0}
              selection
              multiple
              search
              options={users.map(user => ({
                key: user._id,
                text: user.username || user.emails[0].address,
                image: user.avatar,
                value: user._id,
              }))}
              name="members"
              value={members}
              onChange={this.handleChange}
            />
            <Modal
              open={showCreateUserModal}
              onClose={() => this.setState({ showCreateUserModal: false })}
              onOpen={() => this.setState({ showCreateUserModal: true })}
              closeIcon
              trigger={(
                <Form.Button
                  icon="add"
                  primary
                  content="Invite"
                  fluid
                  width={2}
                />
              )}
            >
              <SendUserInvite
                onSubmit={(userId) => {
                  members.push(userId);
                  this.setState({ members, showCreateUserModal: false });
                }}
              />
            </Modal>
          </Form.Field>
          <Form.Group>
            <Form.Input
              label="Max Comment Length"
              type="number"
              value={commentLengthLimit}
              onInput={({ target }) => this.setState({
                commentLengthLimit: parseInt(target.value, 10) || commentLengthLimit,
              })}
            />
            <Form.Field
              control={Form.Group}
              label="Enforce Max Discussion Duration (days)"
            >
              <Form.Field
                control={Radio}
                toggle
                onChange={(_, toggle) => this.setState({ enforceMaxDuration: toggle.checked })}
              />
              {enforceMaxDuration && (
                <Form.Input
                  type="number"
                  value={maxDiscussionDuration}
                  onInput={({ target }) => this.setState({
                    maxDiscussionDuration: parseInt(target.value, 10),
                  })}
                />
              )}
            </Form.Field>
          </Form.Group>
          <Form.Button
            content="Submit"
            onClick={() => selectedSet && members.length > 1
              && Meteor.call(
                'groups.create',
                members,
                selectedSet,
                {
                  commentLengthLimit,
                  maxDiscussionDuration: enforceMaxDuration
                    ? 60 * 60 * 24 * maxDiscussionDuration
                    : undefined,
                },
                (event, groupId) => history.push(`/groups/${groupId}`),
              )}
          />
        </Form>
      </Container>
    );
  }
}

export default withTracker(() => {
  Meteor.subscribe('allUsers');
  return {
    users: Meteor.users.find({}).fetch(),
    scenarioSets: ScenarioSets.find({}).fetch() || [],
  };
})(CreateGroup);
