import React, { Component } from 'react';
import moment from 'moment';

import './App.scss';

import Header from './Header';
import Footer from './Footer';
import Alert from './Alert';

const STATS = 0;
const DISCOVER = 1;
const TOOLS = 2;
const ABOUT = 3;

const Granularities = [
  'Daily',
  'Weekly',
  'Monthly',
  'Seasonal',
  'Yearly'
];

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      nav: STATS,
      granularity: 2
    };
  }

  handleNav(nav) {
    return (e) => {
      e.preventDefault();
      this.setState({
        nav
      });
    };
  }

  handleGranularity(offset) {
    return (e) => {
      e.preventDefault();

      var granularity = this.state.granularity + offset;

      if (granularity >= 0 && granularity < Granularities.length) {
        this.setState({
          granularity
        })
      }
    };
  }

  render() {
    return (
      <div className="App">
        <Header/>
        <div className="container-fluid">

          <nav className="row nav" role="navigation">
            <a className={'nav-link ' + (this.state.nav === STATS)} href="#" onClick={this.handleNav(STATS)}>
              <i className="fa fa-th-list" aria-hidden="true"></i><span className="nav-text">Stats</span>
            </a>
            <a className={'nav-link ' + (this.state.nav === DISCOVER)} href="#" onClick={this.handleNav(DISCOVER)}>
              <i className="fa fa-plus" aria-hidden="true"></i><span className="nav-text">Discover</span>
            </a>
            <a className={'nav-link ' + (this.state.nav === TOOLS)} href="#" onClick={this.handleNav(TOOLS)}>
              <i className="fa fa-wrench" aria-hidden="true"></i><span className="nav-text">Tools</span>
            </a>
            <a className={'nav-link ' + (this.state.nav === ABOUT)} href="#" onClick={this.handleNav(ABOUT)}>
              <i className="fa fa-question" aria-hidden="true"></i><span className="nav-text">About</span>
            </a>
          </nav>

          <h1>{Granularities[this.state.granularity]} Stats</h1>

          <div>
            <ul className="pagination pagination-lg justify-content-center">
              <li className={'page-item' + (this.state.granularity === 0 ? ' disabled' : '')}>
                <a className="page-link" href="#" onClick={this.handleGranularity(-1)}><i className="fa fa-arrow-left" aria-hidden="true"></i></a>
              </li>
              <li className="page-item disabled">
                <span className="page-link">{Granularities[this.state.granularity]}</span>
              </li>
              <li className={'page-item' + (this.state.granularity === Granularities.length - 1 ? ' disabled' : '')}>
                <a className="page-link" href="#" onClick={this.handleGranularity(1)}><i className="fa fa-arrow-right" aria-hidden="true"></i></a>
              </li>
            </ul>
          </div>

          <p>
            {moment().format('YYYY')}
          </p>

          <div className="row">
            <div className="col-sm-6 col-lg-4">
              <h2>Tracks</h2>
              <ol>
                <li>
                  <div className="item">
                    <a href="https://www.last.fm/music/CHVRCHES"><img src="https://lastfm-img2.akamaized.net/i/u/avatar170s/c2e67a2f81d6472dc7fb1892d24d41b4.jpg" alt="CHVRCHES"/></a>
                    <p><a href="https://www.last.fm/music/Two+Door+Cinema+Club/_/I+Can+Talk"><strong>I Can Talk</strong></a></p>
                    <p><a href="https://www.last.fm/music/Two+Door+Cinema+Club">Two Door Cinema Club</a></p>
                    <p><a href="http://www.last.fm/user/nick1n/library/music/Two+Door+Cinema+Club">5 scrobbles</a></p>
                  </div>
                </li>
                <li>
                  <div className="item">
                    <img src="https://lastfm-img2.akamaized.net/i/u/avatar170s/c2e67a2f81d6472dc7fb1892d24d41b4.jpg" alt="CHVRCHES"/>
                    <p><strong>I Can Talk</strong></p>
                    <p>Two Door Cinema Club</p>
                    <p>5 scrobbles</p>
                  </div>
                </li>
                <li>
                  <div className="item">
                    <img src="https://lastfm-img2.akamaized.net/i/u/avatar170s/c2e67a2f81d6472dc7fb1892d24d41b4.jpg" alt="CHVRCHES"/>
                    <p><strong>I Can Talk</strong></p>
                    <p>Two Door Cinema Club</p>
                    <p>5 scrobbles</p>
                  </div>
                </li>
              </ol>
            </div>
            <div className="col-sm-6 col-lg-4">
              <h2>Albums</h2>
              <ol>
                <li>
                  <div className="item">
                    <img src="https://lastfm-img2.akamaized.net/i/u/174s/aa9e02325be944cab8e4392f1948f5e0.png" alt="Tourist History Two Door Cinema Club"/>
                    <p><strong>I Can Talk</strong></p>
                    <p>Two Door Cinema Club</p>
                    <p>5 scrobbles</p>
                  </div>
                </li>
                <li>
                  <div className="item">
                    <img src="https://lastfm-img2.akamaized.net/i/u/174s/aa9e02325be944cab8e4392f1948f5e0.png" alt="Tourist History Two Door Cinema Club"/>
                    <p><strong>I Can Talk</strong></p>
                    <p>Two Door Cinema Club</p>
                    <p>5 scrobbles</p>
                  </div>
                </li>
                <li>
                  <div className="item">
                    <img src="https://lastfm-img2.akamaized.net/i/u/174s/aa9e02325be944cab8e4392f1948f5e0.png" alt="Tourist History Two Door Cinema Club"/>
                    <p><strong>I Can Talk</strong></p>
                    <p>Two Door Cinema Club</p>
                    <p>5 scrobbles</p>
                  </div>
                </li>
              </ol>
            </div>
            <div className="col-sm-6 col-lg-4 offset-sm-3 offset-lg-0">
              <h2>Artists</h2>
              <ol>
                <li>
                  <div className="item">
                    <img src="https://lastfm-img2.akamaized.net/i/u/avatar170s/c2e67a2f81d6472dc7fb1892d24d41b4.jpg" alt="CHVRCHES"/>
                    <p><strong>Two Door Cinema Club Two Door Cinema Club</strong></p>
                    <p>5 scrobbles</p>
                  </div>
                </li>
                <li>
                  <div className="item">
                    <img src="https://lastfm-img2.akamaized.net/i/u/avatar170s/c2e67a2f81d6472dc7fb1892d24d41b4.jpg" alt="CHVRCHES"/>
                    <p><strong>Two Door Cinema Club Two Door Cinema Club</strong></p>
                    <p>5 scrobbles</p>
                  </div>
                </li>
                <li>
                  <div className="item">
                    <img src="https://lastfm-img2.akamaized.net/i/u/avatar170s/c2e67a2f81d6472dc7fb1892d24d41b4.jpg" alt="CHVRCHES"/>
                    <p><strong>Two Door Cinema Club Two Door Cinema Club</strong></p>
                    <p>5 scrobbles</p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
        <Footer/>
        <Alert/>
      </div>
    );
  }
}

export default App;
