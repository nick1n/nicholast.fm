import React, { Component } from 'react';
import { connect } from 'react-redux';
import lastfmToken from './actions';
import moment from 'moment';
import DateRangePicker from 'react-bootstrap-daterangepicker';
// import { DateRangePicker } from 'react-dates';
import Datetime from 'react-datetime';

import './App.scss';
import './daterangepicker.scss';
import '../node_modules/react-datetime/css/react-datetime.css';

import Header from './Header';
import Footer from './Footer';
import Alert from './Alert';

// Some constants
const STATS = 0;
const DISCOVER = 1;
const TOOLS = 2;
const ABOUT = 3;

const CUSTOM = 0;
// const DAILY = 1;
// const WEEKLY = 2;
const MONTHLY = 3;
const SEASONAL = 4;
// const YEARLY = 5;
// const ALL = 6;

const Granularities = [{
  label: 'Custom',
  period: 'd',
  format: 'l',
  start: 'day',
  viewMode: 'days',
}, {
  label: 'Daily',
  period: 'd',
  format: 'dddd, MMMM Do YYYY',
  start: 'day',
  viewMode: 'days',
}, {
  label: 'Weekly',
  period: 'w',
  format: '[Sun-Sat], MMMM Do YYYY',
  start: 'week',
  viewMode: 'days',
}, {
  label: 'Monthly',
  period: 'M',
  format: 'MMMM YYYY',
  start: 'month',
  viewMode: 'months',
}, {
  label: 'Seasonal',
  period: 'Q',
  format: 'MMMM YYYY', // TODO
  start: 'quarter',
  viewMode: 'months',
}, {
  label: 'Yearly',
  period: 'y',
  format: 'YYYY',
  start: 'year',
  viewMode: 'years',
}, {
  label: 'All Time',
  period: false,
  format: '[All Time]', // TODO
  start: false,
  viewMode: 'days',
}];


const RANGES = {
   'Today': [moment(), moment()],
   'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
   'Last 7 Days': [moment().subtract(6, 'days'), moment()],
   'Last 30 Days': [moment().subtract(29, 'days'), moment()],
   'This Month': [moment().startOf('month'), moment().endOf('month')],
   'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
};


// const today = moment();

// const minSm = "(min-width: 576px)";
const minMd = "(min-width: 768px)";
const minLg = "(min-width: 992px)";
// const minXl = "(min-width: 1200px)";


function getParameterByName(name) {
  name = name.replace(/[[\]]/g, '\\$&');

  const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
  const results = regex.exec(window.location.href);

  if (!results) return null;
  if (!results[2]) return '';

  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

class App extends Component {

  constructor(props) {
    super(props);

    if (props.user === null) {
      const token = getParameterByName('token');

      if (token) {
        this.props.dispatch(lastfmToken(token));
      }
    }

    this.state = {
      nav: STATS,
      granularity: MONTHLY,
      date: moment().startOf('month'),
      dateHasChanged: false,

      startDate: moment().startOf('month'),
      endDate: moment().endOf('month'),
    };
  }

  // Handle changing the main navigation
  handleNav(nav) {
    return (e) => {
      e.preventDefault();

      this.setState({
        nav,
      });
    };
  }

  // Handle a change in the Stat's Granularity
  handleGranularity(granularity) {
    return (e) => {
      e.preventDefault();

      if (granularity >= 0 && granularity < Granularities.length) {

        this.setState((prevState) => {

          // if the date has changed use the state's date else use today's date
          var startDate = prevState.dateHasChanged ? prevState.startDate.clone() : moment();
          var endDate = prevState.dateHasChanged ? prevState.startDate.clone() : moment();

          var { start } = Granularities[granularity];

          if (start !== false) {
            startDate = startDate.startOf(start);
            endDate = endDate.endOf(start);
          }

          // correct Seasonal date (moment only does beginning of quarters)
          if (granularity === SEASONAL) {
            startDate = startDate.add(-1, 'M');
            endDate = endDate.add(-1, 'M');
          }

          return {
            granularity,
            startDate,
            endDate,
          };

        });

      }
    };
  }

  // Handle a change in the date
  handleDate(offset) {
    return (e) => {
      e.preventDefault();

      this.setState(({ granularity }) => {
        var { period, start } = Granularities[granularity];
        var startDate = this.state.startDate;
        var endDate = this.state.endDate;

        // TODO

        if (period === false) {
          // TODO
        } else {
          startDate = startDate.clone().add(offset, period);

          if (start !== false) {
            startDate = startDate.startOf(start);
            endDate = startDate.clone().endOf(start);
          } else {
            endDate = endDate.clone().add(offset, period);
          }

          return {
            startDate,
            endDate,
            dateHasChanged: true,
          };
        }
      });
    }
  }

  getNumberOfMonths() {
    if (window.matchMedia(minLg).matches) {
      return 3;

    } else if (window.matchMedia(minMd).matches) {
      return 2;
    }

    return 1;
  }

  render() {

    const { nav, granularity, startDate, endDate } = this.state;

    return (
      <div className="App">
        <Header/>
        <div className="container-fluid">

          {/* TODO: move nav to a component, because you know component all the things */}
          <nav className="row nav" role="navigation">
            <a className={'nav-link ' + (nav === STATS)} href="#" onClick={this.handleNav(STATS)}>
              <i className="fa fa-th-list" aria-hidden="true"></i><span className="nav-text">Stats</span>
            </a>
            <a className={'nav-link ' + (nav === DISCOVER)} href="#" onClick={this.handleNav(DISCOVER)}>
              <i className="fa fa-plus" aria-hidden="true"></i><span className="nav-text">Discover</span>
            </a>
            <a className={'nav-link ' + (nav === TOOLS)} href="#" onClick={this.handleNav(TOOLS)}>
              <i className="fa fa-wrench" aria-hidden="true"></i><span className="nav-text">Tools</span>
            </a>
            <a className={'nav-link ' + (nav === ABOUT)} href="#" onClick={this.handleNav(ABOUT)}>
              <i className="fa fa-question" aria-hidden="true"></i><span className="nav-text">About</span>
            </a>
          </nav>


          <h1>Scrobble</h1>

          <form>
            <div className="form-group">
              <label htmlFor="artist">Artist</label>
              <input type="text" className="form-control form-control-lg" id="artist" placeholder="Artist's Name" required="true"/>
            </div>
            <div className="form-group">
              <label htmlFor="track">Track</label>
              <input type="text" className="form-control form-control-lg" id="track" placeholder="Track's Name" required="true"/>
            </div>
            <div className="form-group">
              <label htmlFor="album">Album</label>
              <input type="text" className="form-control form-control-lg" id="album" placeholder="Album's Name" required="true"/>
            </div>
          </form>






          <h1>{Granularities[granularity].label} Stats</h1>

          <div className="btn-group btn-group-lg" role="group">
            <button className={'btn btn-secondary' + (granularity === 0 ? ' disabled' : '')} onClick={this.handleGranularity(granularity-1)}><i className="fa fa-arrow-left" aria-hidden="true"></i></button>
            <div className="btn-group">
              <select className="form-control" value={granularity} onChange={({ target }) => this.setState({ granularity: +target.value })}>
                {Granularities.map(({ label }, index) => <option key={index} value={index}>{label}</option>)}
              </select>
            </div>
            <button className={'btn btn-secondary' + (granularity === Granularities.length - 1 ? ' disabled' : '')} onClick={this.handleGranularity(granularity+1)}><i className="fa fa-arrow-right" aria-hidden="true"></i></button>
          </div>

          <div className="btn-group btn-group-lg" role="group">
            <button className="btn btn-secondary" onClick={this.handleDate(-1)}><i className="fa fa-arrow-left" aria-hidden="true"></i></button>
            <div className="btn-group">
            {
              granularity === CUSTOM
              ?
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                ranges={RANGES}
              >
                <input className="form-control form-control-lg" value={startDate.format(Granularities[granularity].format) + ' to ' + endDate.format(Granularities[granularity].format)}/>
              </DateRangePicker>
              :
              <Datetime
                value={startDate}
                timeFormat={false}
                dateFormat={Granularities[granularity].format}
                onChange={startDate => this.setState({ startDate })}
                viewMode={Granularities[granularity].viewMode}
                inputProps={{ className: 'form-control form-control-lg' }}
                closeOnSelect={true}
              />
            }
            </div>
{/*
            <div className="btn-group">
              <Datetime
                value={endDate}
                timeFormat={false}
                dateFormat={Granularities[granularity].format}
                onChange={endDate => this.setState({ endDate })}
                viewMode={Granularities[granularity].viewMode}
                inputProps={{ className: 'form-control form-control-lg' }}
                closeOnSelect={true}
              />
            </div>
*/}
            <button className="btn btn-secondary" onClick={this.handleDate(1)}><i className="fa fa-arrow-right" aria-hidden="true"></i></button>
          </div>



          <p>
            {Granularities[granularity].format}
          </p>

          <p>
            {startDate.isValid && startDate.format(Granularities[granularity].format)}
          </p>

{/*
          <div>
            <ul className="pagination pagination-lg justify-content-center">
              <li className="page-item">
                <a className="page-link" href="#" onClick={this.handleDate(-1)}><i className="fa fa-arrow-left" aria-hidden="true"></i></a>
              </li>
              <li className="page-item disabled">
                <span className="page-link">{this.state.date.format(Granularities[granularity].format)}</span>
              </li>
              <li className="page-item">
                <a className="page-link" href="#" onClick={this.handleDate(1)}><i className="fa fa-arrow-right" aria-hidden="true"></i></a>
              </li>
            </ul>
          </div>
*/}


          {/*<DateRangePicker
            startDate={this.state.startDate} // momentPropTypes.momentObj or null,
            endDate={this.state.endDate} // momentPropTypes.momentObj or null,
            onDatesChange={({ startDate, endDate }) => this.setState({ startDate, endDate })} // PropTypes.func.isRequired,
            focusedInput={this.state.focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
            onFocusChange={focusedInput => this.setState({ focusedInput })} // PropTypes.func.isRequired,
            showDefaultInputIcon={true}
            numberOfMonths={this.getNumberOfMonths()}
            customArrowIcon={<span>to</span>}
            isOutsideRange={date => false}
          />*/}

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

export default connect((store) => ({
  user: store.user,
}))(App);
