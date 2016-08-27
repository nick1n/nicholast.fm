import React, { Component } from 'react';

import './Header.scss';

class Header extends Component {


	render() {
		return (
			<header>
				<div className="title">
					<h1>nicholast.fm</h1>
					<button className="btn btn-outline-primary btn-lg btn-block"><i className="fa fa-user"></i> sign in</button>
				</div>
			</header>
		);
	}
}

export default Header;
