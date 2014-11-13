/*jshint node:true*/
'use strict';

/*
 * Memory key value storage for media files with
 * Thumb generating and caching.
 */

/* Export main module mediaThumbStore
 */
module.exports = require('./lib/media-thumb-store');

/* Export module plug-ins
 */

// storage backends
module.exports.memStore = require('./lib/backends/mem-backend');

// Thumbnail generators
module.exports.gmThumbnailer =
  require('./lib/thumbnailers/gm-thumbnailer');
