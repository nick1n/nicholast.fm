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
	number = [
		'Fall Out Boy',
		'Infinity` On High',
		'Thriller╙',
		'Blah| Blah',
		'Third Song || Same Album'
	],
	namesCompressed = 'Fall Out Boy\nInfinity` On High\nThriller╙\nBlah| Blah\nThird Song || Same Album',

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

	userStatsCompressed = '\nC\nA0ý40þ30Ć1\nB0ü50Ć6\nD\n00ý40þ30Ć1\n10ü50Ć6',

	imageUrls = [
		'http://userserve-ak.last.fm/serve/34/28357009.jpg',
		'http://userserve-ak.last.fm/serve/64/28357009.jpg',
		'http://userserve-ak.last.fm/serve/126/28357009.jpg',
		'http://userserve-ak.last.fm/serve/252/28357009.jpg',

		'http://userserve-ak.last.fm/serve/34s/47123433.png',
		'http://userserve-ak.last.fm/serve/64s/47123433.png',
		'http://userserve-ak.last.fm/serve/126/47123433.png',
		'http://userserve-ak.last.fm/serve/300x300/47123433.png'
	];


// Test Storage module
module('Storage');

test('Radix', function() {

	equal(Radix.fromNumber(0, 6), '000000', 'Padding Passed');
	equal(Radix.fromNumber(1, 6), '000001', 'Padding Passed');
	equal(Radix.fromNumber(1), '1', 'No Padding Passed');

});

test('Names', function() {

	Names._decompress(namesCompressed);

	deepEqual(Names.number, number, 'Decompress Passed');

	equal(Names._compress(), namesCompressed, 'Compress Passed');

});

test('User', function() {

	User._decompress(userStatsCompressed);

	deepEqual(User.stats, userStats, 'Decompress Passed');

	equal(User._compress(), userStatsCompressed, 'Compress Passed');

});

test('User', function() {

	User.stats = userStats;

	equal(User._compress(), userStatsCompressed, 'Compress Passed');

	User._decompress(userStatsCompressed);

	deepEqual(User.stats, userStats, 'Decompress Passed');

});

test('Images', function() {

	Names._decompress(namesCompressed);

	for (var i = 0; i < imageUrls.length; ++i) {
		Artist.addUrl(Names.number[i], imageUrls[i]);
	}

	// TODO: an actual test
	ok(true, 'dummy');

});
