/*jshint node:true*/
'use strict';

var merge = require('merge');
var md5 = require('MD5');
var utils = require('./utils');

/*
 * Memory key value storage for media files
 *
 * Options:
 *    keyGenerator {function}
 *      Key generator is a function that generates a unique key for the
 *      object path field {String}.
 *      Default is md5.of the path field.
 *
 * Implements:
 *    find(options, callback(err, results))
 *    findById(key, callback(err, result))
 *    create(object, callback(err))
 *    update(key, object, callback(err))
 *    remove(key, callback(err))
 *    removeAll(callback(err))
 */

var memStore = function(usrOptions) {
  // Default settings
  var settings = {
    keyGenerator: md5
  };

  /** dataDict holds all the data objects
   *
   *  Each data objects must have this fields:
   *    name {string} a name
   *    path {string} a path to original media file
   *    mime {string} a mime type of the media file
   */
  var dataDict = {};
  var options = merge({}, settings, usrOptions);

  /**
   * Get a listing of data objects
   *
   * @param {Object} query
   *   where {Array.<String>}
   *   sortBy {string}
   *   skip {number}
   *   limit {number}
   *   fields {Array.<String>}
   * @param {function(Error, Array.<Object>)} callback
   *
   * @return memStore
   */
  this.find = function(query, callback) {
    // Data array to send back
    var results = [];
    var err = null;

    // Default options
    var querySettings = {
      where: null,
      sortBy: null,
      skip: 0,
      limit: 0,
      fields: null
    };
    query = merge({}, querySettings, query);

    // Convert data dictionary to array
    // Add _id and copy requested fields.
    for (var key in dataDict) {
      // Add the object _id
      var obj = {_id: key};

      // Copy fields to output object
      if (!query.fields) {
        // if no option fields copy all
        obj = dataDict[key];
      } else {
        // copy only requested fields
        for (var f in query.fields) {
          var field = query.fields[f];

          obj[field] = dataDict[key][field];
        }
      }

      results.push(obj);
    }

    // Filter data array using where query strings
    for (var i in query.where) {
      results = results.filter(
        utils.generateFilterFunc(query.where[i])
      );
    }

    // Sort data array
    if (query.sortBy) {
      results.sort(utils.generateSortFunc(query.sortBy));
    }

    // Slice data array
    if (query.skip) {
      results = results.slice(query.skip);
    }
    if (query.limit) {
      results = results.slice(0, query.limit);
    }

    callback(err, results);
  };

  /**
   * Get one data object
   *
   * @param {String} key
   * @param {function(Error, Object} callback
   *
   * @return memStore
   */
  this.findById = function(key, callback) {
    var result = null;
    var err = null;

    if (key in dataDict) {
      result = dataDict[key];
      result._id = key;
    }

    callback(err, result);
  };

  /**
   * create new data object
   *
   * @param {Object} object
   * @param {function(Error} callback
   *
   * @return memStore
   */
  this.create = function(object, callback) {
    var err = null;
    var key;

    key = options.keyGenerator(object.path);
    dataDict[key] = object;

    callback(err);
  };

  /**
   * Update one data object
   *
   * @param {String} key
   * @param {Object} object
   * @param {function(Error} callback
   *
   * @return memStore
   */
  this.update = function(key, object, callback) {
    var err = null;

    if (key in dataDict) {
      dataDict[key] = object;
    }

    callback(err);
  };

  /**
   * remove one data object
   *
   * @param {String} key
   * @param {function(Error} callback
   *
   * @return memStore
   */
  this.remove = function(key, callback) {
    var err = null;

    if (key in dataDict) {
      delete dataDict[key];
    }

    callback(err);
  };

  /**
   * remove all data objects
   *
   * @param {function(Error} callback
   *
   * @return mongooseStore
   */
  this.removeAll = function(callback) {
    dataDict = {};
  };
};

/* Export module memStore
 */
module.exports = memStore;
