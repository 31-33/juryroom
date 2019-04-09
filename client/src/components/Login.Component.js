import { withAuth } from 'react-authmanager';
import ReactSignupLoginComponent from 'react-signup-login-component';
import React from 'react';

class LoginComponent extends React.Component {

  constructor(props){
    super(props);
    this.loginCallback = (credentials) => this.props.login(credentials);
    this.signupCallback = (details) => console.log(`Signup attempted with details: ${details}`);
    this.recoverCallback = (data) => {
      //TODO: implement password recovery functionality
    }

  }

  render() {
    return(
      <ReactSignupLoginComponent
                  title="JuryRoom"
                  handleSignup={this.signupCallback}
                  handleLogin={this.loginCallback}
                  handleRecoverPassword={this.recoverCallback}
                  goToSignupCustomLabel="Register"
                  submitSignupCustomLabel="Register"
                  submitLoginCustomLabel="Login"
                  styles={{
                    mainTitle: { color: '#0077be' }
                  }}
              />
    );
  }

}

export default withAuth(LoginComponent);
