/**
 * Last.fm API Module
 * by: Nicholas Ness
 *
 *	------------------------
 * Many thanks to fxb's Javascript last.fm API Library,
 * which was the main influence for this one.
 *	https://github.com/fxb/javascript-last.fm-api
 *
 * Also,
 * Many thanks to John K. Paul's jQuery Ajax Retry plugin,
 * which is how I handle retrying failed ajax requests.
 *	https://github.com/johnkpaul/jquery-ajax-retry
 */

/*

Examples of usage:

LastFM initialization:
---------------
LastFM({
	api_key: '',

	callbacks: { -- This is completely optional
		done: function( data, textStatus, jqXHR ) { },
		fail: function( jqXHR, textStatus, errorThrown ) { },
		always: function( data|jqXHR, textStatus, jqXHR|errorThrown ) { }
	}
});

The only required option is an api_key
These callbacks are called for every API Request are completely optional

The passed in object is the settings for every jQuery ajax call
A full list of options is available at: http://api.jquery.com/jQuery.ajax/



Making an API Request and having it callback a function:
------------------------------------------
LastFM('user.getRecentTracks', {
	user: username,
	limit: '200',
	page: 1,
	to: toDate,
	from: fromDate
}).done(function ( data ) {
	// do stuff with data
	console.log( data );
});

An API Request returns a jqXHR Object (jQuery's Promise Object)
For more information and help with them go here:
	http://api.jquery.com/jQuery.ajax/#jqXHR

*/

(function( $ ) {

	"use strict";

	var
		// extra parameters needed for api requests
		data = {
			//api_key: '',
			//api_secret: '',
			format: 'json'
		},

		// defaults for jQuery's ajax settings
		defaults = {

			// Last.fm's api v2.0 url
			url: 'http://ws.audioscrobbler.com/2.0/',

			// make all api requests have a javascript callback
			dataType: 'jsonp',

			// default a request's timeout period to 5 seconds
  			timeout: 5000
		},

		// jQuery ajax settings
		settings = {},

		// callbacks that are called for every api request 
		callbacks = {},

		// retry counter
		retries;

	// Init function
	function init( options ) {

		// setup jQuery's ajax settings
		$.extend( settings, defaults, options );

		// setup the api key
		data.api_key = options.api_key || data.api_key;

		// setup any callbacks
		$.extend( callbacks, options.callbacks );
	}

	// API Request function
	function apiRequest( method, params, cache ) {
		var callback,

			// create a deferred promise
			deferred = $.Deferred(),
			promise = deferred.promise();

		// reset retries, just because
		retries = 0;

		// api request parameters
		params.method = method;
		$.extend( params, data );

		// jQuery's ajax settings
		settings.data = params;
		settings.cache = cache;

		// make the api request
		$.ajax( settings )

			// when a request fails call retry and use it's deferred object instead
			.then( null, retry )

			// successful api request, call done
			// if there was actually a request error, fail the promise
			.then( done, deferred.reject );

		// successful api request
		function done( data, status, jqXHR ) {

			// restart retries, because hey, something got through successfully
			retries = 0;

			// if there was a last.fm error fail the promise
			if ( data.error ) {
				deferred.reject( jqXHR, status, data );

			// else fulfill the promise
			} else {
				deferred.resolve( data, status, jqXHR );
			}
		}

		// if there was actually a request error, fail the promise
		function retry( jqXHR, status, data ) {
			var newSettings = {},

				// create its own deferred object and filter the previous ajax request with this one
				output = $.Deferred();

			// if there was a timeout, retry the ajax request
			if ( status == 'timeout' ) {

				// increment the amount of retries that have happened
				++retries;

				// and if there are less then 5 retries, don't fail the promise, just try again
				if ( retries < 5 ) {

					// increase the timeout by 1 second for every retry
					$.extend( newSettings, this );
					if ( status == 'timeout' ) {
						newSettings.timeout += 1000 * retries;
					}

					// retry the ajax call
					$.ajax( newSettings )
						.then( null, retry )
						.then( output.resolve, output.reject );

					// return the deferred deferred
					return output;

				}

			}

			// fail the deferred deferred
			output.reject( jqXHR, status, data );

			// return the deferred deferred
			return output;
		}

		// add any callbacks to the promise
		for ( callback in callbacks ) {
			promise[ callback ]( callbacks[ callback ] );
		}

		// return the promise
		return promise;
	}

	// Main class definition
	window.LastFM = function( options, params, cache ) {

		// the first parameter is a string we know its an api request
		if ( typeof options == 'string' ) {
			return apiRequest( options, params, cache );
		}

		// else its an object and setting up some options
		init( options );
	};

})( window.jQuery );
