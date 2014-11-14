/*jshint node:true*/
'use strict';

var merge = require('merge');
var mongoose = require('mongoose');

/*
 * Memory key value storage for media files
 *
 * Options:
 *    url {String}
 *        MongoDB database url.
 *        Default to 'mongodb://localhost/mediafiles'
 * Implements:
 *    find(options, callback(err, results))
 *    findById(key, callback(err, result))
 *    create(object, callback(err))
 *    update(key, object, callback(err))
 *    remove(key, callback(err))
 *    removeAll(callback(err))
 */

var mongooseStore = function(usrOptions) {
  // Default settings
  var settings = {
    url: 'mongodb://localhost/mediafiles'
  };

  var options = merge({}, settings, usrOptions);
  mongoose.connect(options.url);

  /** MediaItem holds all the data objects
   *
   *  Each data objects must have this fields:
   *    name {string} a name
   *    path {string} a path to original media file
   *    mime {string} a mime type of the media file
   */
  var MediaItem = mongoose.model('MediaItem', {
    name: String,
    path: String,
    tags: String,
    mime: String});

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
   * @return mongooseStore
   */
  this.find = function(query, callback) {
    // Data array to send back
    var results;
    var err = null;
    var field;
    var op;
    var value;
    var whereParser = /(.+)(==|~=|<|>)(.+)/;

    // Default options
    var querySettings = {
      where: null,
      sortBy: null,
      skip: 0,
      limit: 0,
      fields: null
    };
    query = merge({}, querySettings, query);

    // Get all Items
    results = MediaItem.find();

    // Slice data array
    if (query.fields) {
      results.select(query.fields.join(' '));
    }

    // Filter data array using where query strings
    for (var i in query.where) {
      var whereMatch = query.where[i].match(whereParser);
      if (whereMatch) {
        field = whereMatch[1];
        op = whereMatch[2];
        value = whereMatch[3];

        switch (op) {
          case '==':
            results.where(field, value);
            break;
          case '<':
            results.where(field).lt(value);
            break;
          case '>':
            results.where(field).gt(value);
            break;
          case '~=':
            var regex = new RegExp(value, 'i');
            results.where(field, regex);
            break;
          default:
            break;
        }
      }
    }

    // Sort data array
    if (query.sortBy) {
      results.sort(query.sortBy);
    }

    // Slice data array
    if (query.skip) {
      results.skip(query.skip);
    }
    if (query.limit) {
      results.skip(query.limit);
    }

    // Execute query
    results.exec(callback);
  };

  /**
   * Get one data object
   *
   * @param {String} key
   * @param {function(Error, Object} callback
   *
   * @return mongooseStore
   */
  this.findById = function(key, callback) {
    MediaItem.findById(key, callback);
  };

  /**
   * create new data object
   *
   * @param {Object} object
   * @param {function(Error} callback
   *
   * @return mongooseStore
   */
  this.create = function(object, callback) {
    var item = new MediaItem(object);

    item.save(callback);
  };

  /**
   * Update one data object
   *
   * @param {String} key
   * @param {Object} object
   * @param {function(Error} callback
   *
   * @return mongooseStore
   */
  this.update = function(key, object, callback) {
    MediaItem.findByIdAndUpdate(key, object, callback);
  };

  /**
   * remove one data object
   *
   * @param {String} key
   * @param {function(Error} callback
   *
   * @return mongooseStore
   */
  this.remove = function(key, callback) {
    MediaItem.findByIdAndRemove(key, callback);
  };

  /**
   * remove all data objects
   *
   * @param {function(Error} callback
   *
   * @return mongooseStore
   */
  this.removeAll = function(callback) {
    MediaItem.remove({}, callback);
  };
};

/* Export module mongooseStore
 */
module.exports = mongooseStore;
