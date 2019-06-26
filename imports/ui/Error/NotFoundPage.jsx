import React, { PureComponent } from 'react';
import { Message } from 'semantic-ui-react';

class NotFoundPage extends PureComponent {
  render() {
    return (
      <Message
        size="massive"
        icon="balance scale"
        header="404"
        content="Page Not Found"
        error
      />
    );
  }
}

export default NotFoundPage;
