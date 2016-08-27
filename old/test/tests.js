// Basic tests that do nothing lol
test('basic test', function() {
	expect(1);
	ok(true, 'this had better work.');
});

test("deepEqual test", function() {
	var obj = {
		foo: "bar"
	};

	deepEqual(obj, {
		foo: "bar"
	}, "Two objects can be the same in value");
});


// some testing variables
var string = {
		'Blah| Blah': 3,
		'Fall Out Boy': 0,
		'Infinity` On High': 1,
		'Third Song || Same Album': 4,
		'Thriller╙': 2
	},
	testNames = [
		'Fall Out Boy',
		'Infinity` On High',
		'Thriller╙',
		'Blah| Blah',
		'Third Song || Same Album',
		'Hello',
		'World',
		'Test Band',
		'Muse'
	],
	namesCompressed = 'Fall Out Boy\nInfinity` On High\nThriller╙\nBlah| Blah\nThird Song || Same Album\nHello\nWorld\nTest Band\nMuse',

	userStats = {
		12: {
			10: {
				123: 4,
				124: 3,
				132: 1
			},
			11: {
				122: 5,
				132: 6
			}
		},
		13: {
			0: {
				123: 4,
				124: 3,
				132: 1
			},
			1: {
				122: 5,
				132: 6
			}
		}
	},

	userStatsCompressed = '\n<\n:0«40¬30´1\n;0ª50´6\n=\n00«40¬30´1\n10ª50´6',

	artistImages = [
		'http://userserve-ak.last.fm/serve/34/28357009.jpg',
		'http://userserve-ak.last.fm/serve/64/47123433.jpg',
		'http://userserve-ak.last.fm/serve/126/47123433.jpg',
		'http://userserve-ak.last.fm/serve/252/28357009.jpg',
		'http://userserve-ak.last.fm/serve/34/28357009.png',
		'http://userserve-ak.last.fm/serve/64/28357009.png',
		'http://userserve-ak.last.fm/serve/126/47123433.png',
		'http://userserve-ak.last.fm/serve/252/47123433.png'
	],
	artistImagesCompressed = '00Eଁু01Fሩ␙02Gሩ␙03Iଁু04;ଁু05<ଁু06=ሩ␙07?ሩ␙',

	albumImages = [
		'http://userserve-ak.last.fm/serve/34s/47123433.png',
		'http://userserve-ak.last.fm/serve/64s/47123433.png',
		'http://userserve-ak.last.fm/serve/126/47123433.png',
		'http://userserve-ak.last.fm/serve/300x300/47123433.png'
	];


// Test Storage module
module('Storage');

test('Radix', function() {

	equal(Radix.fromNumber(0, 6), '000000', 'Padding');
	equal(Radix.fromNumber(1, 6), '000001', 'Padding');
	equal(Radix.fromNumber(1), '1', 'No Padding');

	throws(
		function () {
			Radix.fromNumber(null)
		},
		'Failed on invalid value'
	);

	throws(
		function () {
			Radix.fromNumber(-9)
		},
		'Failed on negative value'
	);

	throws(
		function () {
			Radix.fromNumber(987234987324, 2)
		},
		'Number too large for padding'
	);

});

test('Names', function() {

	Names._decompress(namesCompressed);

	deepEqual(Names.number, testNames, 'Decompress');

	equal(Names._compress(), namesCompressed, 'Compress');

});

test('User', function() {

	var user = new User();

	equal(user._compress(), "", 'Empty Compress');

	user._decompress("");

	user._decompress(userStatsCompressed);

	deepEqual(user.stats, userStats, 'Decompress');

	equal(user._compress(), userStatsCompressed, 'Compress');

});

test('User', function() {

	var user = new User();

	user.stats = userStats;

	equal(user._compress(), userStatsCompressed, 'Compress');

	user._decompress(userStatsCompressed);

	deepEqual(user.stats, userStats, 'Decompress');

});

test('Artist Images', function() {

	Names._decompress(namesCompressed);

	for (var i = 0; i < artistImages.length; ++i) {
		ArtistImages.addUrl(testNames[i], artistImages[i]);
	}

	equal(ArtistImages._compress(), artistImagesCompressed, 'Compress');

	ArtistImages._decompress(artistImagesCompressed);

	for (var i = 0; i < artistImages.length; ++i) {
		equal(ArtistImages.lookup(testNames[i]), artistImages[i], 'Lookup for ' + artistImages[i]);
	}

});

test('Album Images', function() {

	Names._decompress(namesCompressed);

	for (var i = 0; i < albumImages.length; ++i) {
		AlbumImages.addUrl(testNames[i], albumImages[i]);
	}

	//equal(AlbumImages._compress(), artistImagesCompressed, 'Compress');

	AlbumImages._decompress(AlbumImages._compress());

	for (var i = 0; i < albumImages.length; ++i) {
		equal(AlbumImages.lookup(testNames[i]), albumImages[i], 'Lookup for ' + albumImages[i]);
	}

});
