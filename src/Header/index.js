import React from 'react';

// import background0 from './images/major-lazer-min.jpg';
// import background1 from './images/muse-crop-min.jpg';
// import background2 from './images/rihanna-min.jpg';

import './index.scss';

import Logo from './Logo';
import Signin from './Signin';

const BACKGROUND = 'background-' + Math.floor(Math.random() * 3);

function Header() {
  return (
    <header className={BACKGROUND}>
      <Logo />
      <Signin />
    </header>
  );
}

export default Header;
