/*jshint node:true*/
'use strict';

/*
 * Utility functions for sorting and filtering
 * Arrrays of objects.
 */
var utils = {
  /**
    * Generate a sorting function
    *
    * @param {String} sortBy The field to sort by
    *   If prefixed by '-' do reverse sort
    *
    * @return {function} That sorts by the fild
    */
  generateSortFunc: function(sortBy) {
    var sortDir;

    if (sortBy[0] !== '-') {
      sortDir = 1;
    } else {
      sortDir = -1;
      sortBy = sortBy.slice(1);
    }

    return function(a, b) {
      var _dir = sortDir;
      var _a = a[sortBy];
      var _b = b[sortBy];
      var compare = (_a > _b) ? _dir : (_a < _b) ? -_dir : 0;

      return compare;
    };
  },

  /**
    * Generate a filter function
    *
    *   The generator takes a query string
    *   and create a filter function.
    *   Example:
    *     the query string 'name~=^yosi' will generate
    *     a filter function that will
    *     filter objects where name match /^yosi/
    *
    * @param {String} where The string query
    *   Syntex of query:
    *     <field-name><operator><value>
    *   Operators:
    *     == Equal
    *     ~= Match RegExp
    *     > Greater then
    *     < Less then
    *
    * @return {function} That sorts by the fild
    */
  generateFilterFunc: function(where) {
    var filterFun;
    var field;
    var op;
    var value;
    var whereParser = /(.+)(==|~=|<|>)(.+)/;
    var whereMatch;

    whereMatch = where.match(whereParser);

    if (whereMatch) {
      field = whereMatch[1];
      op = whereMatch[2];
      value = whereMatch[3];
    }

    switch (op) {
      case '==':
        filterFun = function(a) {return a[field] == value;};
        break;
      case '<':
        filterFun = function(a) {return a[field] < value;};
        break;
      case '>':
        filterFun = function(a) {return a[field] > value;};
        break;
      case '~=':
        filterFun = function(a) {
          var regex = new RegExp(value, 'i');
          var ans = regex.test(a[field]);

          return ans;
        };
        break;
      default:
        filterFun = function(a) {return true;};
        break;
    }

    return filterFun;
  }
};

/* Export module utils
 */
module.exports = utils;
