import React, { Component } from 'react';

// import background0 from './images/major-lazer-min.jpg';
// import background1 from './images/muse-crop-min.jpg';
// import background2 from './images/rihanna-min.jpg';

import './Header.scss';

import Logo from './Logo';

class Header extends Component {

  constructor(props) {
    super(props);

    this.state = {
      signedIn: false,
      background: 0,
    };

    this.background = 'background-' + Math.floor(Math.random() * 3);
  }

  getBtnText = () => this.state.signedIn ? 'sign out' : 'sign in with last.fm';

  onClick = () => {
    this.setState({
      signedIn: !this.state.signedIn,
    });
  }

  render() {
    return (
      <header className={this.background}>
        <Logo />
        <a className="btn btn-outline-success btn-lg" onClick={this.onClick}>
          <i className="fa fa-user fa-lg"></i> {this.getBtnText()}
        </a>
      </header>
    );
  }
}

export default Header;
