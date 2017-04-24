import React, { PureComponent } from 'react';

import './Alert.scss';

const OPENING = 0;
const UPDATING = 1;
const CLOSING = 2;
const OPENED = 3;
const CLOSED = 4;

const CLASSNAMES = [
  'opening',
  'updating',
  'closing',
];

const ANIMATION_TIME = 1000;

class Alert extends PureComponent {

  constructor(props) {
    super(props);

    this.state = {
      text: null,
      state: CLOSED,
    };

    this.timeout = setTimeout(() => {
      this.update(<span><strong>Welcome!</strong> to the new nicholast.fm!</span>);
    }, ANIMATION_TIME);
  }

  waitToBe(state) {
    clearTimeout(this.timeout);

    this.timeout = setTimeout(() => {
      this.setState({
        state,
      });
    }, ANIMATION_TIME);
  }

  update(text) {
    var state = this.state.state;

    // if its opened, update it
    if (state === OPENED) {
      this.setState({
        text,
        state: UPDATING,
      });

      this.waitToBe(OPENED);

    // else if its closed, open it
    } else if (state === CLOSED) {
      this.setState({
        text,
        state: OPENING,
      });

      this.waitToBe(OPENED);
    }
  }

  handleClose = (e) => {
    e.preventDefault();

    this.setState({
      state: CLOSING,
    });

    this.waitToBe(CLOSED);
  };

  handleUpdate = (e) => {
    e.preventDefault();

    this.update(<span>this has been updated :)</span>);
  };

  getClassName() {
    return `alert alert-success ${CLASSNAMES[this.state.state]}`;
  }

  render() {
    // don't render anything if its closed
    if (this.state.state === CLOSED) {
      return null;
    }

    return (
      <div className={this.getClassName()}>
        <button type="button" className="close" aria-label="Close" onClick={this.handleClose}>
          <i className="fa fa-times" aria-hidden="true"></i>
        </button>
        <i className="fa fa-spin fa-circle-o-notch" aria-hidden="true"></i>
        {' '}
        {this.state.text}
        {' '}
        <button className="btn btn-sm btn-default" onClick={this.handleUpdate}>Update</button>
      </div>
    );
  }
}

export default Alert;
