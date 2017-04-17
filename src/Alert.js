import React, { Component } from 'react';

import './Alert.scss';

class Alert extends Component {

  constructor(props) {
    super(props);

    this.state = {
      open: false
    };

    setTimeout(() => {
      this.setState({
        open: true
      });
    }, 100);
  }

  close = () => {
    this.setState({
      open: false
    });
  };

  render() {
    return (
      <div className={'alert alert-success ' + this.state.open}>
        <button type="button" className="close" aria-label="Close" onClick={this.close}>
          <i className="fa fa-times" aria-hidden="true"></i>
        </button>
        <i className="fa fa-spin fa-circle-o-notch" aria-hidden="true"></i>
        <strong>Welcome</strong> to the new nicholast.fm!
      </div>
    );
  }
}

export default Alert;
