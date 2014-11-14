/*jshint node:true*/
'use strict';

var merge = require('merge');
var md5 = require('MD5');
var utils = require('./utils');

/**
 * Memory key value storage for media files
 *
 * <ul>
 * <li>Implements:
 * <ul>
 * <li>   find([options], callback(err, results))
 * <li>   findById(key, callback(err, result))
 * <li>   create(filePath, callback(err))
 * <li>   update(key, object, callback(err))
 * <li>   remove(key, callback(err))
 * <li>   removeAll(callback(err))
 * </ul>
 * </ul>
 *
 * @param {Object} usrOptions The use options.
 * <ul>
 * <li>   keyGenerator {function}
 * <ul>
 * <li>     Key generator is a function that generates a unique key for the
 *          object path field {String}.
 * <li>     Default is md5 of the path field.
 * </ul>
 * </ul>
 * @constructor
 */
var memStore = function(usrOptions) {
  // Default settings
  var settings = {
    keyGenerator: md5
  };

  /** dataDict holds all the data objects
   *
   *  Each data objects must have this fields:
   *  <ul>
   *    <li>name {string} a name
   *    <li>path {string} a path to original media file
   *    <li>mime {string} a mime type of the media file
   *    <li>tags {string} tags
   *  </ul>
   */
  var dataDict = {};
  var options = merge({}, settings, usrOptions);

  /**
   * Get a listing of data objects
   *
   * @param {Object} query
   * <ul>
   *   <li>where {String[]}
   *   <li>sortBy {string}
   *   <li>skip {number}
   *   <li>limit {number}
   *   <li>fields {String[]}
   * </ul>
   *
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
   * @param {requestCallback} callback
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
   * @param {requestCallback} callback
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
   * @param {requestCallback} callback
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
   * @param {requestCallback} callback
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
   * @param {requestCallback} callback
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
