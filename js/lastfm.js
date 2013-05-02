/**
 * Last.fm API module
 * by: Nicholas Ness
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
}).then(function ( data ) {
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
			url: 'http://ws.audioscrobbler.com/2.0/',
			dataType: 'jsonp'
		},

		// jQuery ajax settings
		settings = {},

		// callbacks that are called for every api request 
		callbacks;

	// Init function
	function init( options ) {

		// setup jQuery's ajax settings
		$.extend( settings, defaults, options );

		// setup the api key
		data.api_key = options.api_key || data.api_key;

		// setup any callbacks
		callbacks = options.callbacks || callbacks;
	}

	// API Request function
	function apiRequest( method, params, cache ) {
		var jqxhr,
			callback,

			// create a deferred promise
			deferred = $.Deferred(),
			promise = deferred.promise();

		// api request parameters
		params.method = method;
		$.extend( params, data );

		// jQuery's ajax settings
		settings.data = params;
		settings.cache = cache;

		// make the api request
		jqxhr = $.ajax( settings )

			// successful api request
			.done(function( data, status, jqXHR ) {

				// if there was a last.fm error fail the promise
				if ( data.error ) {
					deferred.reject( data, status, jqXHR );

				// else fulfill the promise
				} else {
					deferred.resolve( data, status, jqXHR );
				}
			})

			// if there was actually a request error, fail the promise
			.fail(function( jqXHR, status, data ) {
				deferred.reject( data, status, jqXHR );
			});

		// add any callbacks to the promise
		for ( callback in callbacks ) {
			promise[ callback ]( callbacks[ callback ] );
		}

		// return the promise
		return promise;
	}

	// Main class definition
	window.LastFM = function( options, params, cache ) {
		return ({ object: init, string: apiRequest })[ typeof options ]( options, params, cache );
	};

})( window.jQuery );
