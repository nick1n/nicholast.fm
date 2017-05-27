import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

// TODO: Fix focus state


class Signin extends PureComponent {

  constructor(props) {
    super(props);

    console.log(props);
  }

  handleClick = (e) => {
    if (this.state.signedIn) {
      e.preventDefault();

      localStorage.removeItem('lastfm.session.name');
      localStorage.removeItem('lastfm.session.key');

      this.setState({
        signedIn: false,
        user: '',
      });
    }
  }

  getBtnText() {
    return this.props.user.signedIn ? `${this.props.user.name}, sign out?` : 'sign in with last.fm';
  }

  render() {
    return (
      <a
        className="btn btn-outline-success btn-lg"
        href={this.props.user.signedIn ? '#' : 'http://www.last.fm/api/auth?api_key=f750712ed70caea3272e70e48e1f464e&amp;cb=' + window.location.href}
        onClick={this.handleClick}
      >
        <i className="fa fa-user fa-lg"></i> {this.getBtnText()}
      </a>
    );
  }
}

export default connect((store) => ({
  user: store.user,
}))(Signin);
