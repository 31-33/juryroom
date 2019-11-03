import React, { PureComponent } from 'react';
import { Message } from 'semantic-ui-react';
import PropTypes from 'prop-types';

class NotAuthorizedPage extends PureComponent {
  static defaultProps = {
    message: '',
  }

  static propTypes = {
    message: PropTypes.string,
  }

  render() {
    const { message } = this.props;
    return (
      <Message
        size="massive"
        icon="balance scale"
        header="403 Not Authorised"
        content={message}
        error
      />
    );
  }
}

export default NotAuthorizedPage;
