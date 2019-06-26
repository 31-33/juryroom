import React, { PureComponent } from 'react';
import { Message } from 'semantic-ui-react';

class NotAuthorizedPage extends PureComponent {
  render() {
    return (
      <Message
        size="massive"
        icon="balance scale"
        header="403"
        content="Not Authorised"
        error
      />
    );
  }
}

export default NotAuthorizedPage;
