import React, { Component } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import {
  Container, Header, Segment, Form,
} from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { TopicPropType } from '/imports/types';
import Topics from '/imports/api/Topics';

class CreateScenario extends Component {
  static defaultProps = {
    topics: false,
  }

  static propTypes = {
    topics: PropTypes.oneOfType([PropTypes.arrayOf(TopicPropType), PropTypes.bool]),
    history: PropTypes.shape({
      push: PropTypes.func.isRequired,
    }).isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      title: '',
      description: '',
      selectedTopic: '',
    };
  }

  handleChange = (e, { name, value }) => this.setState({ [name]: value });

  render() {
    const { topics, history } = this.props;
    const { title, description, selectedTopic } = this.state;

    return (
      <Container>
        <Header
          attached="top"
          content="Create New Scenario"
          size="huge"
          as={Segment}
          clearing
        />
        <Form
          as={Segment}
          attached="bottom"
        >
          <Form.Group>
            <Form.Input label="Title" name="title" onChange={this.handleChange} width={12} />
            <Form.Dropdown
              width={4}
              label="Topic"
              loading={!topics}
              placeholder="Select a topic"
              selection
              options={topics ? topics.map(topic => ({
                key: topic._id,
                text: topic.title,
                value: topic._id,
              })) : []}
              name="selectedTopic"
              onChange={this.handleChange}
            />
          </Form.Group>
          <Form.TextArea label="Description" name="description" onChange={this.handleChange} />
          <Form.Button
            content="Submit"
            onClick={() => title && description && selectedTopic
              && Meteor.call('scenarios.create', selectedTopic, title, description, (err, scenarioId) => history.push(`/scenarios/${scenarioId}`))
            }
          />
        </Form>
      </Container>
    );
  }
}

export default withTracker(() => {
  Meteor.subscribe('topics');

  return {
    topics: Topics.find({}).fetch(),
  };
})(CreateScenario);
