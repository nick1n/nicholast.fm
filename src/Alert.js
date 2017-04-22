import React, { Component } from 'react';

import './Alert.scss';

const OPENING = 0;
const UPDATING = 1;
const CLOSING = 2;
const OPENED = 3;
const CLOSED = 4;

const CLASSNAMES = [
  'opening',
  'updating',
  'closing'
];

const ANIMATION_TIME = 1000;

class Alert extends Component {

  constructor(props) {
    super(props);

    this.state = {
      state: CLOSED
    };

    this.timeout = setTimeout(() => {
      this.update()
    }, ANIMATION_TIME);
  }

  wait(state) {
    clearTimeout(this.timeout);

    this.timeout = setTimeout(() => {
      this.setState({
        state
      });
    }, ANIMATION_TIME);
  }

  update() {
    var state = this.state.state;

    // if its opened, update it
    if (state === OPENED) {
      this.setState({
        state: UPDATING
      });

      this.wait(OPENED);

    // else if its closed, open it
    } else if (state === CLOSED) {
      this.setState({
        state: OPENING
      });

      this.wait(OPENED);
    }
  }

  handleClose = (e) => {
    e.preventDefault();

    this.setState({
      state: CLOSING
    });

    this.wait(CLOSED);
  };

  handleUpdate = (e) => {
    e.preventDefault();

    this.update();
  };

  get className() {
    return `alert alert-success ${CLASSNAMES[this.state.state]}`;
  }

  render() {
    // don't render anything if its closed
    if (this.state.state === CLOSED) {
      return null;
    }

    return (
      <div className={this.className}>
        <button type="button" className="close" aria-label="Close" onClick={this.handleClose}>
          <i className="fa fa-times" aria-hidden="true"></i>
        </button>
        <i className="fa fa-spin fa-circle-o-notch" aria-hidden="true"></i>&nbsp;
        <strong>Welcome</strong> to the new nicholast.fm!&nbsp;
        <button className="btn btn-sm btn-default" onClick={this.handleUpdate}>Update</button>
      </div>
    );
  }
}

export default Alert;
