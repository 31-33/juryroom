import React, { PureComponent } from 'react';
import {
  Dimmer, Loader,
} from 'semantic-ui-react';

class LoadingPage extends PureComponent {
  render() {
    return (
      <Dimmer active inverted style={{ zIndex: '-1' }}>
        <Loader size="large">Loading</Loader>
      </Dimmer>
    );
  }
}

export default LoadingPage;
