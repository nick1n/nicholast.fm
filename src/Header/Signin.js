import React, { PureComponent } from 'react';

class Signin extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      signedIn: false,
    };
  }

  handleClick = (e) => {
    e.preventDefault();

    this.setState({
      signedIn: !this.state.signedIn,
    });
  }

  getBtnText() {
    return this.state.signedIn ? 'sign out' : 'sign in with last.fm';
  }

  render() {
    return (
      <a href="#" className="btn btn-outline-success btn-lg" onClick={this.handleClick}>
        <i className="fa fa-user fa-lg"></i> {this.getBtnText()}
      </a>
    );
  }
}

export default Signin;
