/*jshint node:true*/
'use strict';

var merge = require('merge');
var mongoose = require('mongoose');

/**
 * MongoDB key value storage for media files
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
 * @param {Object} options The use options.
 * <ul>
 * <li>   url {String}
 * <ul>
 * <li>     MongoDB database url.
 * <li>     Default to 'mongodb://localhost/mediafiles'.
 * </ul>
 * </ul>
 * @constructor
 */
var mongooseStore = function(options) {
  // Default settings
  var settings = {
    url: 'mongodb://localhost/mediafiles'
  };

  options = merge({}, settings, options);
  mongoose.connect(options.url);

  /** MediaItem holds all the data objects
   *
   *  Each data objects must have this fields:
   *  <ul>
   *    <li>name {string} a name
   *    <li>path {string} a path to original media file
   *    <li>mime {string} a mime type of the media file
   *    <li>tags {string} tags
   *  </ul>
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
   * <ul>
   *   <li>where {String[]}
   *   <li>sortBy {string}
   *   <li>skip {number}
   *   <li>limit {number}
   *   <li>fields {String[]}
   * </ul>
   *
   * @param {requestCallback} callback
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
    var settings = {
      where: null,
      sortBy: null,
      skip: 0,
      limit: 0,
      fields: null
    };
    query = merge({}, settings, query);

    // Get all Items
    results = MediaItem.find();

    // Get user fields
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
   * @param {requestCallback} callback
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
   * @param {requestCallback} callback
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
   * @param {requestCallback} callback
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
   * @param {requestCallback} callback
   *
   * @return mongooseStore
   */
  this.remove = function(key, callback) {
    MediaItem.findByIdAndRemove(key, callback);
  };

  /**
   * remove all data objects
   *
   * @param {requestCallback} callback
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
