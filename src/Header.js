import React, { Component } from 'react';

import './Header.scss';

import Logo from './Logo';

class Header extends Component {


	render() {
		return (
			<header>
				<div className="title">
					<Logo />
					<button className="btn btn-outline-primary btn-lg"><i className="fa fa-user"></i> sign in with last.fm</button>
				</div>
			</header>
		);
	}
}

export default Header;
