# media-thumb-store v0.0.1 

[![Build Status](https://secure.travis-ci.org/yaacov/media-thumb-store.png?branch=master)](http://travis-ci.org/yaacov/media-thumb-store)
[![NPM Version](https://img.shields.io/npm/v/gm.svg?style=flat)](https://www.npmjs.org/package/media-thumb-store)

Media files key-value store with on the fly thumbnail generation.
Support pluggable thumbnail generators for different media types.
Support pluggable storage back-ends for storing file-path and file-meta-data.
Include a built in thumbnail generator based on GraphicMagic.
Automatically search for media files in media directory.

#### Included plug-ins:

    mem-backend: a storage back-end for storing data in a memory dictionary.
    gm-thumbnailer: a thumbnailer plug-in for creating image thumbnails.
        This plug-in require GraphicMagic to be installed and on the system path.

## Install

use npm:

    npm install media-thumb-store

#### Generating thumbnails with gm-thumbnailer plug-in

This plug-in require GraphicMagic to be installed, download and install [GraphicsMagick](http://www.graphicsmagick.org/) or use your package manager.

On Debian

    sudo apt-get install graphicsmagick

## Basic Usage

```js
var mediaThumbStore = require('media-thumb-store');

/**
 * Create a new thumbnail generator for images
 * Use the included GraphicMagic thumbnailer.
 *
 * Thumbnail images will be cached in './' folder under
 * Two sub-folders 'normal' and 'large'
 * This two sub-folders must exist before first thumbnail is cached.
 *
 *   thumb-folder|normal|thumb1.jpg
 *               |      |...
 *               |
 *               |large|thumb1.jpg
 *                     | ...
 *
 * Options:
 *   thumbDir {String} the root directory for the thumbnails cache
 */
var imageThumbnailer = new mediaThumbStore.gmThumbnailer({
  thumbDir: __dirname
});

/**
 * Create a new media storage
 *
 * Options:
 *   defaultIcon {String} the path to the default thumbnail image
 *      Used if thumbnailer function fails.
 *   imageThumbnailer {function} the thumbnailer function to be
 *      Used for media with 'image' mime type.
 */
var myMedia = new mediaThumbStore({
  defaultIcon: __dirname + '/normal/default.jpg',
  imageThumbnailer: imageThumbnailer
});

// Scan all media files in './img' folder and add them to storage
myMedia.updateFromDir(__dirname + '/img', function() {
  // Print out all files found
  myMedia.find({}, function(err, results) {
    console.log(results);
  });
  
  // Create thumbnail for the first file named 'happy-cat'
  myMedia.find({where: ['name==happy-cat']}, function(err, results) {
    var id = results[0]._id;

    myMedia.findThumbById(id, 'normal', function(err, path) {
      console.log('Created thumbnail: ' + path);
    });
  });
});
    
```

## Thumbnail plug-ins

A plug-in thumbnail image generator

    The thumbnailer is a function that gets a path to a media file, and
    A callback function(err, thumbnailPath).
    If successful it will call the callback function with a path to
    Generated thumbnail. On fail it will set the thumbnailPath
    To null.
    
    Example:
```js
/** 
 * An example thumbnailer function that always return the same thumb
 * Not very usefull...
 *
 * @param {String} path The path to a media file
 * @param {String} size The size of the thumbnail ('normal', 'large')
 * @param {function({Error} err, {String} path)} callback The 
 *    callback function that will recive the thumb image file path
 */
var thumbnailer = function(path, size, callback) {
  // do nothing with image in path
  // ...
  // set err to null, and send back a static image path
  callback(err, 'my-thumb.jpg');
};
```

( An example thumbnail module is in lib/thumbnailers/ )

## Back-end storage plug-ins

A plug-in store module for data storage

    The store module should implement:
        find(options, callback(err, results))
        findById(key, callback(err, result))
        create(object, callback(err))

( An example store module is in lib/backends/ )

