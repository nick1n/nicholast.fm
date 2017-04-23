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
    };

    this.background = 'background-' + Math.floor(Math.random() * 3);
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
      <header className={this.background}>
        <Logo />
        <a href="#" className="btn btn-outline-success btn-lg" onClick={this.handleClick}>
          <i className="fa fa-user fa-lg"></i> {this.getBtnText()}
        </a>
      </header>
    );
  }
}

export default Header;
