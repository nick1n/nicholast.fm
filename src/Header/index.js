import React, { Component } from 'react';

// import background0 from './images/major-lazer-min.jpg';
// import background1 from './images/muse-crop-min.jpg';
// import background2 from './images/rihanna-min.jpg';

import './index.scss';

import Logo from './Logo';
import Signin from './Signin';

class Header extends Component {

  constructor(props) {
    super(props);

    this.background = 'background-' + Math.floor(Math.random() * 3);
  }

  render() {
    return (
      <header className={this.background}>
        <Logo />
        <Signin />
      </header>
    );
  }
}

export default Header;
