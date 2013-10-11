/*
 * My Storage adapter for localStorage
 * by: Nicholas Ness
 */

//(function($) {

'use strict';

var storage = localStorage,
	version = 'v',
	//names = 'n',
	//tracks = 't',
	date = 'd',

	blank = '',
	comma = ',',
	pipe = '|',
	colon = ':',
	semicolon = ';',
	newline = '\n',

	TEXT = '#text',
	ATTR = '@attr';

	//currentVersion = 0,
	//compress,



	//function Storage() {

	//}

function extend(parent, child) {
	return $.extend(true, {}, parent, child);
}

// By the way, none of these functions are safe...

// Storage's parent class
var Data = {

	//key: ''

	string: {},
	number: [],

	lookup: function(key) {
		return this[typeof key][key];
	},

	//add: function() {}

	load: function() {
		this._decompress(localStorage[this.key]);
	},

	save: function() {
		storage[this.key] = this._compress();
	}

	//_compress: function() {}

	//_decompress: function() {}

};


var Images = extend(Data, {

	_url: 'http://userserve-ak.last.fm/serve/',

	_compressSizes: {
		34: 1,
		64: 2,
		126: 3,
		174: 4,
		252: 5,
		300: 6
	},

	_compressTypes: {
		'png': 10,
		'jpg': 20,
		'jpeg': 30,
		'gif': 40
	},

	_types: {
		10: 'png',
		20: 'jpg',
		30: 'jpeg',
		40: 'gif'
	},

	lookup: function(key) {
		var obj = this[typeof key][key];

		return this._url + this._sizes[obj.size] + '/' + obj.hash + '.' + this._types[obj.type];
	},

	addImages: function(id, images) {
		var index = images.length - 1,
			text;

		if (!images) {
			return false;
		}

		// TODO: should probably store all the sizes or something...
		for (; index >= 0; --index) {
			text = images[index][TEXT];

			// right now, we don't support any url other then one served from last.fm
			if (text.lastIndexOf(this._url, 0) == 0) {
				return this.addUrl(id, text);
			}
		}

		return false;
	},

	addUrl: function(id, url) {
		var array = url && url.match(/\d+|(jpg|jpeg|png|gif)/gi) || [],
			length = array.length;

		if (!url) {
			return;
		}

		if (length < 3) {
			// TODO: error
			throw "Url isn't correct: " + url;
		}

		return this.add(id, array[length - 3], array[length - 2], array[length - 1]);
	},

	add: function(id, size, hash, type) {
		var name,
			obj;

		if (typeof id == 'number') {
			name = Names.lookup(id);

		} else if (typeof id == 'string') {
			name = id;
			id = Names.lookup(name);

		} else {
			throw "Incorrect parameters";
		}

		if (!this._compressTypes[type]) {
			// TODO: error
			throw "Url's extension type isn't recognized: " + type;
		}

		if (!this._compressSizes[size]) {
			// TODO: error
			throw "Url's size isn't recognized: " + size;
		}

		obj = {
			id: id,
			size: this._compressSizes[size],
			hash: hash,
			type: this._compressTypes[type]
		};

		this.number[id] = obj;

		this.string[name] = obj;

		return id;
	},

	// compresses to '01534'
	_compress: function() {
		var text = '',
			obj,
			index = 0;

		for (; index < this.number.length; ++index) {

			obj = this.number[index];

			// because indices can be undefined
			if (!obj) {
				continue;
			}

			try {
				text += compressNumber(obj.id, 2) + compressNumber(obj.size + obj.type) + compressNumber(obj.hash, 2);
			} catch(e) {
				// TODO: error
				throw "Error compressing Image id = " + obj.id + ", hash = " + obj.hash + ", size = " + obj.size + ", type = " + obj.type + ", Name = " + Names.lookup(obj.id);
			}

		}

		return text;
	},

	_decompress: function(text) {
		var array = text && text.match(/.{5}/g) || [],
			index = 0,
			number,
			mod,
			name,
			obj;

		this.string = {};
		this.number = [];

		for (; index < array.length; ++index) {

			number = decompressNumber(array[index].substr(2, 1));
			mod = number % 10;

			obj = {
				id: decompressNumber(array[index].substr(0, 2)),
				size: mod,
				hash: decompressNumber(array[index].substr(3, 2)),
				type: number - mod
			};

			name = Names.lookup(obj.id);

			this.number[obj.id] = obj;

			this.string[name] = obj;

		}

		return true;
	}

});

var ArtistImages = extend(Images, {

	key: 'a',

	_sizes: {
		1: 34,
		2: 64,
		3: 126,
		4: 174,
		5: 252,
		6: '300x300'
	}

});

var AlbumImages = extend(Images, {

	key: 'b',

	_sizes: {
		1: '34s',
		2: '64s',
		3: 126,
		4: '174s',
		5: 252,
		6: '300x300'
	}

});

// Names child class of Storage
var Names = extend(Data, {

	// Private
	/**
	 * fast lookup by value
	 * example: {"Fall Out Boy": 0, "Infinity On High": 1, "Thriller": 2, "Blah Blah": 3, "Third Song From Same Album": 4}
	 */
	//string: {},

	// Private
	/**
	 * fast lookup by index
	 * example: ["Fall Out Boy", "Infinity On High", "Thriller", "Blah Blah", "Third Song From Same Album"]
	 */
	//number: [],

	// Public
	//lookup: function( key ) {
	//	return this[ typeof key ];
	//},

	key: 'n',

	// Public
	add: function(name) {
		var id = this.number.length;

		// don't add a duplicate
		if (Names.string[name]) {
			return Names.string[name];
		}

		// adds {"Fall Out Boy": 0, ...}
		Names.string[name] = id;

		// adds ["Fall Out Boy", ...]
		Names.number[id] = name;

		return id;
	},

	//save: function() {
	//	storage[ names ] = this.compress();
	//},

	// "Private"
	// compresses to 'Fall Out Boy\nInfinity On High\nThriller\nBlah Blah\nThird Song Same Album'
	// '||' represents '|'
	_compress: function() {
		// just need to join the array with new lines
		return this.number.join(newline);
	},

	// Private
	// decompresses 'Fall Out Boy\nInfinity On High\nThriller\Blah Blah\nThird Song Same Album' to usable data
	_decompress: function(text) {
		var index = 0,

			// just a temporary array, split the input text if there is input text
			array = text && text.split(newline) || [];

		this.string = {};
		this.number = [];

		for (; index < array.length; ++index) {

			// creates {"Fall Out Boy": 0, ...}
			this.string[array[index]] = this.number.length;

			// creates ["Fall Out Boy", ...]
			this.number.push(array[index]);

		}

		return this.number.length == array.length;
	}

});



// Tracks child class of Storage
var Tracks = extend(Data, {

	// Private
	/**
	 * fast lookup by value
	 * example: {"0,1,2": 0, "0,1,3": 1, "0,1,4": 2}
	 */
	//string: {},

	// Private
	/**
	 * fast lookup by index
	 * example: [[0, 1, 2], [0, 1, 3], [0, 1, 4]]
	 */
	//number: [],

	// Public
	//lookup: function( key ) {
	//	return this[ typeof key ];
	//},

	key: 't',

	// Public
	artist: function(key) {
		return this.lookup(key)[0];
	},

	// Public
	addUnique: function(artist, album, track) {
		artist = Names.add(artist);
		album = Names.add(album);
		track = Names.add(track);



		return Tracks.add([artist, album, track]);
	},

	// Public
	// track is an array of three name indices
	// [0,1,2]
	add: function(track) {
		var id = Tracks.number.length,
			text = track.join(comma);

		// don't add a duplicate
		if (Tracks.string[text]) {
			return Tracks.string[text];
		}

		// adds {"0,1,2": 0, ...}
		Tracks.string[text] = id;

		// adds [[0, 1, 2], ...]
		Tracks.number[id] = track;

		// should we always save...?

		return id;
	},

	// Public
	// track is a comma delimited string of three names
	// this function is probably a bad idea to have...
	addString: function(track) {
		var id = Tracks.number.length;

		// don't add a duplicate
		if (Tracks.string[track]) {
			return Tracks.string[track];
		}

		// adds {"0,1,2": 0, ...}
		Tracks.string[track] = id;

		// adds [[0, 1, 2], ...]
		Tracks.number[id] = track.split(comma);

		return id;
	},

	//save: function() {
	//	storage[ tracks ] = this.compress();
	//},

	// "Private"
	// compresses to '000102000103000104'
	_compress: function() {
		var trackIndex,
			nameIndex,

			// just a temporary array
			array = [];

		for (trackIndex = 0; trackIndex < this.number.length; ++trackIndex) {

			for (nameIndex = 0; nameIndex < this.number[trackIndex].length; ++nameIndex) {

				array.push(compressNumber(this.number[trackIndex][nameIndex], 2));

			}

		}

		return array.join(blank);
	},

	// Private
	// decompresses '000102000103000104' to usable data
	_decompress: function(text) {
		var index = 0,
			track = [],

			// just a temporary array, split the input text if there is input text
			array = text && text.match(/.{2}/g) || [];

		this.string = {};
		this.number = [];

		for (; index < array.length; ++index) {

			track[0] = decompressNumber(array[index]);
			track[1] = decompressNumber(array[++index]);
			track[2] = decompressNumber(array[++index]);

			// creates {"0,1,2": 0, ...}
			this.string[track.join(comma)] = this.number.length;

			// creates [[0, 1, 2], ...]
			this.number.push(track);

		}

		return this.number.length == array.length;
	}

});

// User class
var User = (function() {

	function User(username) {
		this.key = username;
		this.stats = {};
		this.loved = [];

		// TODO: load user if they are stored
	}

	// User's public functions
	User.prototype.load = Data.load;
	User.prototype.save = Data.save;

	// Public add
	User.prototype.add = function(options) {
		var year = options.year,
			month = options.month,
			artist = options.artist || '',
			album = options.album || '',
			track = options.track,
			plays = options.plays || 1,

			trackId;

		// if the track wasn't supplied, we can't really do anything, so exit
		if (!track) {
			return false;
		}

		if (year > 2000) {
			year -= 2000;
		}

		if (!this.stats[year]) {
			this.stats[year] = {};
		}

		if (!this.stats[year][month]) {
			this.stats[year][month] = {};
		}

		trackId = Tracks.addUnique(artist, album, track);

		// if the track id exists add the amount of plays to it or if it doesn't exist set it to the amount of plays
		this.stats[year][month][trackId] = this.stats[year][month][trackId] + plays || plays;

		// should I return the unique track id?
		return trackId;
	};

	// "Private"
	// compresses "{12:{10:{123:4,124:3,132:1},11:{122:5,132:6}},13:{0:{123:4,124:3,132:1},1:{122:5,132:6}}}"
	//         to "\nC\nA0ý40þ30Ć1\nB0ü50Ć6\nD\n00ý40þ30Ć1\n10ü50Ć6"
	User.prototype._compress = function() {
		var year,
			month,
			track,

			array = [],
			text,

			stats = this.stats;

		// TODO: Loved tracks
		array.push(this.loved.join(blank));

		for (year in stats) {

			// adds year to the array
			array.push(compressNumber(year));

			for (month in stats[year]) {

				text = compressNumber(month);

				for (track in stats[year][month]) {

					// TODO: might need to sort tracks by plays and add some sort of number to indicate amount of tracks with over 1 compressed number of plays
					text += compressNumber(track, 2) + compressNumber(stats[year][month][track]);

				}

				// adds the month and the month's stats to the array
				array.push(text);
			}
		}

		// returns the compressed stats
		return array.join(newline);
	};

	// Private
	// decompresses 'c\na3f43g33o1\nb3e53o6\nd\n03f43g33o1\n13e53o6' to usable data
	User.prototype._decompress = function(text) {
		// Now turn it back into an object
		var index,
			year,
			month,
			months,
			track,
			tracks,
			plays,
			loved,

			// seperate the years
			array = text && text.split(newline) || [];

		// reset current user's stats
		this.stats = {};

		loved = array[0] && array[0].match(/.{2}/g) || [];

		// decompress the years
		for (index = 1; index < array.length;) {
			year = decompressNumber(array[index]);

			months = {};
			for (++index; index < array.length && array[index].length > 1; ++index) {
				month = decompressNumber(array[index].substr(0, 1));

				// tracks and plays
				text = array[index].substr(1);

				tracks = {};
				while (text.length) {

					track = decompressNumber(text.substr(0, 2));
					plays = decompressNumber(text.substr(2, 1));

					tracks[track] = plays;

					text = text.substr(3);
				}

				months[month] = tracks;
			}

			this.stats[year] = months;
		}
	};

	return User;
})();

function lookup(key) {

}

/////////////////////////////////

/**
 * Compresses an array by joining them
 */
function compressArray(array) {
	//return array.join( delimiter[ typeof array[0] ] );
	return array.join(pipe);
}

function decompressArray(text) {
	//return text.split( delimiter[ typeof array[0] ] );
	return text.split(pipe);
}

/////////////////////////////////

/**
 * Compresses a date by removing unneeded digits and compresses that number
 */
function compressDate(date) {
	return compressNumber(+(date + '').substr(1, 7));
}

/**
 * Decompresses a date by decompressing the number and adding the removed digits back
 */
function decompressDate(text) {
	return +('1' + decompressNumber(text) + '00000');
}

////////////////////////////////

/**
 * Compresses a number into a string using radix
 */
function compressNumber(number, padding) {
	return Radix.fromNumber(number, padding);
}

/**
 * Decompresses a string into a number using radix
 */
function decompressNumber(text) {
	return Radix.toNumber(text);
}


////////////////////////////////////////////////////////////////////////////////////////////////////


/**
 * Returns wether or not the username is in storage
 */
function username(name) {
	return storage.hasOwnProperty(name);
}

/**
 * Returns an array of usernames
 * Usernames are defined by a key in storage longer then 1 character
 */
function usernames() {
	var key,
		users = [];

	for (key in storage) {
		if (storage.hasOwnProperty(key) && key.length > 1) {
			users.push(key);
		}
	}

	return users;
}


// TODO: ... do this differently like the user take care of loading itself
function loadUser(username) {
	var user = new User(username);
	//User.key = username;
	user.load();
}

function loadAll(username) {
	User.key = username;
	User.load();
	Tracks.load();
	Names.load();
}

function saveAll() {
	User.save();
	Tracks.save();
	Names.save();
}




var Store = {

	// list of users
	_users: {},

	//add: function(obj) {

		//obj.artist;
		//obj.album;
		//obj.track;

	//},

	user: function(username) {
		var user = this._users[username];

		// if the user does not exist in the list, create a new one and add it to the list
		if (!user) {
			user = new User(username);
			this._users[username] = user;
		}

		return user;
	}

};


// Radix encode numbers
// by Reb.Cabin
// at http://stackoverflow.com/questions/6213227/fastest-way-to-convert-a-number-to-radix-64-in-javascript#answers
var Radix = {

	_offset: 48,

	_length: 10240,

	// You have the freedom, here, to choose the glyphs you want for
	// representing your base-64 numbers. The ASCII encoding guys usually
	// choose a set of glyphs beginning with ABCD..., but, looking at
	// your update #2, I deduce that you want glyphs beginning with
	// 0123..., which is a fine choice and aligns the first ten numbers
	// in base 64 with the first ten numbers in decimal.

	// This cannot handle negative numbers and only works on the
	//     integer part, discarding the fractional part.
	// Doing better means deciding on whether you're just representing
	// the subset of javascript numbers of twos-complement 32-bit integers
	// or going with base-64 representations for the bit pattern of the
	// underlying IEEE floating-point number, or representing the mantissae
	// and exponents separately, or some other possibility. For now, bail
	fromNumber: function(number, padding) {

		if (isNaN(Number(number)) || number == null || number == Number.POSITIVE_INFINITY) {
			throw "The input is not valid";
		}

		if (number < 0) {
			throw "Can't represent negative numbers now";
		}

		var rixit; // like 'digit', only in some non-decimal radix
		var residual = Math.floor(number);
		var result = blank;

		while (true) {
			rixit = residual % Radix._length;

			result = String.fromCharCode(rixit + Radix._offset) + result;

			residual = Math.floor(residual / Radix._length);

			if (residual == 0) {
				break;
			}
		}

		// pad a string in javascript: http://stackoverflow.com/questions/10073699/pad-a-number-with-leading-zeros-in-javascript
		padding = padding || 1;

		if (padding < result.length) {
			throw "Radix result of " + number + " is longer then padding of " + padding;
		}

		return result.length >= padding ? result : new Array(padding - result.length + 1).join('0') + result;
	},

	toNumber: function(string) {
		var result = 0,
			index = 0;

		string = string.split(blank);

		for (; index < string.length; ++index) {
			result = (result * Radix._length) + string[index].charCodeAt(0) - Radix._offset;
		}

		return result;
	}
};


//})(window.jQuery);
