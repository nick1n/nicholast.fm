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
			background: 0
		};

		this.background = 'background-' + Math.floor(Math.random() * 3);
	}

	btnText = () => this.state.signedIn ? 'sign out' : 'sign in with last.fm';

	onClick = () => {
		this.setState({
			signedIn: !this.state.signedIn
		});
	}

	render() {
		return (
			<header className={this.background}>
				<Logo />
				<button className="btn btn-outline-success btn-lg" type="button" onClick={this.onClick}>
					<i className="fa fa-user"></i> {this.btnText()}
				</button>
			</header>
		);
	}
}

export default Header;
