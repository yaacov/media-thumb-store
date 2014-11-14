/*jshint node:true*/
'use strict';

var merge = require('merge');
var md5 = require('MD5');
var mime = require('mime');
var path = require('path');
var walk = require('walkdir');
var memStore = require('./backends/mem-backend');

/*
 * Memory key value storage for media files with
 * Thumb generating and caching.
 *
 * Options:
 *    mimeList {Array.<String>}
 *      An array of supported mime types.
 *      Defaults: ['image/jpeg',
 *        'image/png',
 *        'video/webm',
 *        'video/mp4',
 *        'audio/mpeg']
 *    imageThumbnailer {function(mediaPath, size, callback(Error, thumbPath)}
 *      A function that get a path to a media file and callback with
 *      a path to a generated/cached thumbnail image
 *      Used for files with image mime type.
 *      Media and Thumbnail paths are absolute.
 *      Defaults: null, use default icon image
 *    audioThumbnailer {function(mediaPath, size, callback(Error, thumbPath)}
 *      A function that get a path to a media file and callback with
 *      a path to a generated/cached thumbnail image
 *      Used for files with audio mime type.
 *      Defaults: null, use default icon image
 *    videoThumbnailer {function(mediaPath, size, callback(Error, thumbPath)}
 *      A function that get a path to a media file and callback with
 *      a path to a generated/cached thumbnail image
 *      Used for files with video mime type.
 *      Defaults: null, use default icon image
 *    store
 *      A back-end store module for data storage.
 *      The store module should implement:
 *        find(options, callback(err, results))
 *        findById(key, callback(err, result))
 *        create(object, callback(err))
 *      Defaults: null, ( fall back to memStore )
 *    defaultIcon {String}
 *      Path a default image file, used when thumbnailer fails
 *
 * Implements:
 *    find([options], callback(err, results))
 *    findById(key, callback(err, result))
 *    findThumbById(key, size, callback(err, result))
 *    create(filePath, callback(err))
 *    updateFromDir(root, callback(err))
 */

var mediaThumbStore = function(usrOptions) {
  // Default settings
  var _this = this;
  var settings = {
    mimeList: ['image/jpeg',
      'image/png',
      'video/webm',
      'video/mp4',
      'audio/mpeg'],
    imageThumbnailer: null,
    audioThumbnailer: null,
    videoThumbnailer: null,
    store: null,
    defaultIcon: './public/images/unknown-thumb.jpeg'
  };
  var options = merge({}, settings, usrOptions);

  /** dataStore holds all the media objects
   *
   *  Each data objects must have this fields:
   *    name {string} a name
   *    path {string} a path to original media file
   *    mime {string} a mime type of the media file
   *
   * if option store is null, fall back to memStore
   */
  var dataStore = (options.store) ? options.store : new memStore();

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
   * @return mediaThumbStore
   */
  this.find = function(query, callback) {
    var defaults = {
      fields: ['name', 'mime', 'tags']
    };

    // make sure the fields option is set
    query = merge({}, defaults, query);

    // Use the dataStore find function
    dataStore.find(query, callback);
  };

  /**
   * Get one data object
   *
   * @param {String} key
   * @param {function(Error, Object} callback
   *
   * @return mediaThumbStore
   */
  this.findById = function(key, callback) {
    // Use the dataStore find function
    dataStore.findById(key, callback);
  };

  /**
   * Get a path to a thumbnail of an image object
   *
   * @param {String} key
   * @param {String} size The thumb size ('normal', 'large')
   * @param {function(Error, thumbPath} callback
   *
   * @return mediaThumbStore
   */
  this.findThumbById = function(key, size, callback) {
    // Use the dataStore find function
    dataStore.findById(key, function(err, obj) {
      // Set the right  thumnailer function
      var thumbnailer = null;

      if (!err && obj) {
        // Get object media mime type
        var mimeType = obj.mime.slice(0, 3);

        // Use the media type thumbnailer
        switch (mimeType) {
          case 'ima':
            thumbnailer = options.imageThumbnailer;
            break;
          case 'vid':
            thumbnailer = options.videoThumbnailer;
            break;
          case 'aud':
            thumbnailer = options.audioThumbnailer;
            break;
          default:
            break;
        }
      }

      // Call the thumbnailer function
      if (thumbnailer) {
        thumbnailer(obj.path, size, callback);
      } else {
        callback(new Error('No thumbnailer'), options.defaultIcon);
      }
    });
  };

  /**
   * create new data object
   *
   * @param {String} mediaPath
   * @param {function(Error} callback
   *
   * @return mediaThumbStore
   */
  this.create = function(mediaPath, callback) {
    // Get media mime
    var _mime = mime.lookup(mediaPath);

    // Check media mime list
    if (options.mimeList.indexOf(_mime) !== -1) {
      var _id = md5(mediaPath);
      var ext = path.extname(mediaPath);
      var name = path.basename(mediaPath, ext);

      var obj = {
        path: mediaPath,
        name: name,
        mime: _mime
      };

      // Add to dataStore
      dataStore.create(obj, callback);
    } else {
      callback(new Error('Mime not supported'));
    }
  };

  /**
   * Fill up the dataStore with all media files in root
   *
   * @param {String} root
   * @param {function(Error} callback
   *
   * @return mediaThumbStore
   */
  this.updateFromDir = function(root, callback) {
    var err = null;

    // Walk symlinks in media directory
    var walkOptions = {
      //follow_symlinks: true
    };

    // Try to insert files found to dataStore
    var emitter = walk(root, walkOptions, function(mediaPath, stat) {
      // delete the root part of the path
      _this.create(mediaPath, function() {});
    });

    emitter.on('end', function() {
      callback(err);
    });
  };
};

/* Export module mediaThumbStore
 */
module.exports = mediaThumbStore;
