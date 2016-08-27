import React, { Component } from 'react';

import './Footer.scss';

class Footer extends Component {


	render() {
		return (
			<footer>
				<div className="clearfix">
					<div className="col-xs-12">
						{/* ResponsiveAd */}
						<div className="ad-overflow">
							<ins className="adsbygoogle responsivead" data-ad-client="ca-pub-5694205610454375" data-ad-slot="6618888490"></ins>
						</div>
					</div>
				</div>
				<div id="footer"></div>
				<div className="clearfix">
					<div className="col-md-7">
						<p>nicholast.fm v1.0.0</p>
						<p>by <a href="http://www.last.fm/user/nick1n" target="_blank" className="link">Nick</a> &amp; <a href="http://twitter.namklabs.com" target="_blank" className="link">Nick</a></p>
						<p>copyright &copy; 2016</p>
					</div>
					<div className="col-md-5">
						<p>many thanks to last.fm, bootstrap, icomoon, @mdo, nickf, flagcounter, jQuery, Fuel UX's Datagrid, grunt.js, Google, and <span className="web-font">Ubuntu</span></p>
					</div>
				</div>
			</footer>
		);
	}
}

export default Footer;
