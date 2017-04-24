import React, { Component } from 'react';

import './Footer.scss';

class Footer extends Component {

  shouldComponentUpdate() {
    return false;
  }

  render() {
    return (
      <footer className="container-fluid">
        {/* ResponsiveAd */}
        <div className="ad-overflow">
          <ins className="adsbygoogle responsivead" data-ad-client="ca-pub-5694205610454375" data-ad-slot="6618888490"></ins>
        </div>
        <div className="row">
          <div className="col-md-7">
            <div>nicholast.fm v1.0.0</div>
            <div>by <a href="http://www.last.fm/user/nick1n" target="_blank" className="link">Nick</a> &amp; <a href="http://twitter.namklabs.com" target="_blank" className="link">Nick</a></div>
            <div>copyright &copy; 2017</div>
          </div>
          <div className="col-md-5">
            <p>many thanks to last.fm, bootstrap, codrops, facebook, icomoon, @mdo, nickf, jQuery, Fuel UX's Datagrid, grunt.js, Google, and <span className="web-font">Ubuntu</span></p>
          </div>
        </div>
      </footer>
    );
  }
}

export default Footer;
