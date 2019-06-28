import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Container, Button, Message, Header, Icon,
} from 'semantic-ui-react';

class HeaderWithInfoMessage extends Component {
  static defaultProps = {
    subheader: false,
    infoMessage: false,
  }

  static propTypes = {
    header: PropTypes.string.isRequired,
    subheader: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    infoMessage: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  }

  constructor(props) {
    super(props);
    this.state = {
      hideHelp: true,
    };
  }

  render() {
    const { hideHelp } = this.state;
    const { header, subheader, infoMessage } = this.props;

    return (
      <Header size="huge">
        <Header.Content as={Container} fluid>
          {infoMessage && (
            <Button
              floated="right"
              circular
              color="blue"
              size="massive"
              icon="help circle"
              onClick={() => this.setState({ hideHelp: !hideHelp })}
            />
          )}
          {header}
        </Header.Content>
        {subheader && <Header.Subheader content={subheader} />}
        {infoMessage && (
          <Message
            size="mini"
            info
            hidden={hideHelp}
            onDismiss={() => this.setState({ hideHelp: true })}
            floated="left"
          >
            <Message.Content>
              <Icon name="help circle" size="big" />
              {infoMessage}
            </Message.Content>
          </Message>
        )}
      </Header>
    );
  }
}

export default HeaderWithInfoMessage;
