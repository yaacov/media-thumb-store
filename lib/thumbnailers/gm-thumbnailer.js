/*jshint node:true*/
'use strict';

var path = require('path');
var fs = require('fs');
var merge = require('merge');
var md5 = require('MD5');
var gm = require('gm');

/**
 * Thumbnail function generator for image files
 * <ul>
 * <li>Require the GraphicMagic program to be installed
 * </ul>
 *
 * @return {function({string})}
 *   A thumbnail generating function that gets a path to a media file
 *   and calls back with a path to a thumbnail image, or null on fail.
 *
 * @param {Object} usrOptions The use options.
 * <ul>
 * <li>   keyGenerator {function({String})}
 * <ul>
 * <li>     Key generator is a function that generates a unique key for the
 *      object path field {String}.
 * <li>     Default is md5 of the objects path field.
 * </ul>
 * <li>   thumbDir {String}
 * <ul>
 * <li>     Path to the thumbnail directory
 * </ul>
 * <li>   thumbSizes {Object}
 * <ul>
 * <li>     The default sizes of the generated thumbnails
 * <li>     Defaults to {normal: 128, large: 256}
 * </ul>
 * <li>   thumbQuality {Number}
 * <ul>
 * <li>     The generated thumbnail quality (1 bad .. 100 best)
 * <li>    Defaults to 50
 * </ul>
 * </ul>
 *
 * @constructor
 */
var gmThumbnailer = function(usrOptions) {
  // Default settings
  var settings = {
    keyGenerator: md5,
    thumbDir: './public/thumbnails',
    thumbSizes: {
      normal: 128,
      large: 256
    },
    thumbQuality: 75
  };
  var options = merge({}, settings, usrOptions);

  /**
   * A thumbnail generating function that gets a path to a media file
   * and calls back with a path to a thumbnail image, or null on fail.
   *
   * @param {String} mediaPath The path to the media file
   * @param {String} size The size of the thumbnail ('normal', 'large')
   * @param {requestCallback} callback
   */
  var create = function(mediaPath, size, callback) {
    var err = null;
    var thumbPath;
    var key;

    /*
     * Check for valid size string
     */
    if (['normal', 'large'].indexOf(size) === -1) {
      callback(new Error('Unknown size'), null);
      return;
    }

    /*
     * Generate a path for this media thumbnail
     */
    key = options.keyGenerator(mediaPath);
    thumbPath = path.join(options.thumbDir, size, key + '.jpeg');

    /*
     *check if thumbnail exist
     */
    if (fs.existsSync(thumbPath)) {
      // If thumbnail exist, just use it
      callback(err, thumbPath);
    } else {
      // Create a new thumbnail
      var thumb = gm(mediaPath)
        .resize(null, options.thumbSizes[size], '>')
        .noProfile()
        .quality(options.thumbQuality)
        .write(thumbPath, function(err) {
          callback(err, thumbPath);
        });
    }
  };

  return create;
};

/* Export module gmThumbnailer
 */
module.exports = gmThumbnailer;
