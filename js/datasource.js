/*
 * Fuel UX Data components - static data source
 * https://github.com/ExactTarget/fuelux-data
 *
 * Copyright (c) 2012 ExactTarget
 * Licensed under the MIT license.
 */

var StaticDataSource = function (options) {
	this._formatter = options.formatter;
	this._columns = options.columns;
	this._delay = options.delay || 0;
	this._data = options.data;
};

StaticDataSource.prototype = {

	columns: function () {
		return this._columns;
	},

	data: function (options, callback) {
		var self = this;

		setTimeout(function () {
			// SORTING
			if (options.sortProperty) {
				self._data = _.sortBy(self._data, function(item) {
					if (item.searchable && item.searchable[options.sortProperty]) return item.searchable[options.sortProperty];
					return item[options.sortProperty];
				});
				if (options.sortDirection === 'desc') self._data.reverse();
			}

			// SEARCHING
			var data = _.filter(self._data, function (item) {
				if (options.search) {
					for (var i in item.searchable) {
						if (~item.searchable[i].toString().indexOf(options.search)) return true;
					}
					return false;
				}
				return true;
			});

			// PAGING
			var count = data.length;
			var startIndex = options.pageIndex * options.pageSize;
			var endIndex = startIndex + options.pageSize;
			var end = (endIndex > count) ? count : endIndex;
			var pages = Math.ceil(count / options.pageSize);
			var page = options.pageIndex + 1;
			var start = startIndex + 1;

			data = data.slice(startIndex, endIndex);

			if (self._formatter) self._formatter(data);

			callback({ data: data, start: start, end: end, count: count, pages: pages, page: page });

		}, this._delay)
	}
};
