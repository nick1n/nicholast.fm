import './Logo.scss';

import React, { Component } from 'react';

class Logo extends Component {

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <h1>
        <span className="n">n</span>
        <span className="i">i</span>
        <span className="c">c</span>
        <span className="h">h</span>
        <span className="o">o</span>
        <span className="l">l</span>
        <span className="a">a</span>
        <span className="s">s</span>
        <span className="t">t</span>
        <span className="d">.</span>
        <span className="f">f</span>
        <span>m</span>
      </h1>
    );
  }
}

export default Logo;
