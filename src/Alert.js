import React, { Component } from 'react';

class Alert extends Component {
  render() {
    return (
      <div className="alert alert-success">
        <button type="button" className="close" data-dismiss="alert" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
        <strong>Welcome</strong> to the new nicholast.fm!
      </div>
    );
  }
}

export default Alert;
