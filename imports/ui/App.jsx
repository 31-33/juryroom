import React, { Component } from 'react';
import AccountsUIWrapper from '/imports/ui/AccountsUIWrapper';
import '/imports/startup/accounts-config';

class App extends Component {

  render() {
    return (
      <div>
        <h1>Welcome to Meteor!</h1>
        <AccountsUIWrapper />
      </div>
    );
  }
}


export default App;
