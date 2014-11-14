# media-thumb-store

[![Build Status](https://secure.travis-ci.org/yaacov/media-thumb-store.png?branch=master)](http://travis-ci.org/yaacov/media-thumb-store)
[![NPM Version](https://img.shields.io/npm/v/gm.svg?style=flat)](https://www.npmjs.org/package/media-thumb-store)

Media files key-value store with on the fly thumbnail generation.
Support pluggable thumbnail generators for different media types.
Support pluggable storage back-ends for storing file-path and file-meta-data.
Include a built in thumbnail generator based on GraphicMagic.
Automatically search for media files in media directory.

#### Included plug-ins:

    mem-backend: a storage back-end for storing data in a memory dictionary.
    mongoose-backend: a storage back-end for storing data in MongoDB.
    
    gm-thumbnailer: a thumbnailer plug-in for creating image thumbnails.
        This plug-in require GraphicMagic to be installed and on the system path.
    ffmpeg-thumbnailer: a thumbnailer plug-in for creating video thumbnails.
        This plug-in require ffmpeg to be installed and on the system path.

## Install

use npm:

    npm install media-thumb-store

#### Generating thumbnails with gm-thumbnailer and ffmpeg plugins

This gm plugin require GraphicMagic to be installed, download and install [GraphicsMagick](http://www.graphicsmagick.org/) or use your package manager.

    sudo apt-get install graphicsmagick

This ffmpeg plugin require ffmpeg to be installed, download and install [ffmpeg](https://www.ffmpeg.org/) or use your package manager.

    sudo apt-get install ffmpeg

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
 */
var imageThumbnailer = new mediaThumbStore.gmThumbnailer({
  thumbDir: __dirname
});

/**
 * Create a new media storage
 */
var myMedia = new mediaThumbStore({
  defaultIcon: __dirname + '/normal/default.jpg',
  imageThumbnailer: imageThumbnailer
});

// Scan all media files in './img' folder and add them to storage
myMedia.updateFromDir(__dirname + '/img', function() {
  // Print first 100 files found, order by name
  myMedia.find({skip: 0, limit: 100, sortBy: 'name'}, function(err, results) {
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
## Options

#### mediaThumbStore 

###### Options

    mimeList {Array.<String>}
        An array of supported mime types.
        Defaults: ['image/jpeg',
            'image/png',
            'video/webm',
            'video/mp4',
            'audio/mpeg']
            
    imageThumbnailer {function(mediaPath, size, callback(Error, thumbPath)}
        A function that get a path to a media file and callback with
        a path to a generated/cached thumbnail image
        Used for files with image mime type.
        Media and Thumbnail paths are absolute.
        Defaults: null, use default icon image
        
    audioThumbnailer {function(mediaPath, size, callback(Error, thumbPath)}
        A function that get a path to a media file and callback with
        a path to a generated/cached thumbnail image
        Used for files with audio mime type.
        Defaults: null, use default icon image
        
    videoThumbnailer {function(mediaPath, size, callback(Error, thumbPath)}
        A function that get a path to a media file and callback with
        a path to a generated/cached thumbnail image
        Used for files with video mime type.
        Defaults: null, use default icon image
        
    store
        A back-end store module for data storage.
        The store module should implement:
            find(options, callback(err, results))
            findById(key, callback(err, result))
            create(object, callback(err))
        Defaults: null, ( fall back to memStore )
        
    defaultIcon {String}
        Path a default image file, used when thumbnailer fails

###### Implements:
    find([options], callback(err, results))
        Get media items from the data storage.
        Options are passed to the storae backend, 
        Backend should implement:
            skip {Number}
            limit {Number}
            sortBy {String}
            where {String[]} ( * See format of where string )
        
    findById(key, callback(err, result))
        Get one media item from the data storage.
    
    findThumbById(key, size, callback(err, result))
        Get a path to cached/generated thumbnail image of a media item.
    
    create(filePath, callback(err))
        Append a media item to the data storage.
    
    updateFromDir(root, callback(err))
        Recurcivly append/update all media items in a root folder.

###### Format of where string: '{field}{operator}{value}'

    implemented Operators:
        ~= Regular exprsion
        == Equal to
        <  Less then
        >  greater then
    
    For example:
        'name~=yosi' filter results where name
        match the regular exprsion /yosi/
        
        'name==yosi' filter results where name
        is exactly 'yosi'

#### gmThumbnailer 

###### Options

    keyGenerator {function({String})}
        Key generator is a function that generates a unique key for the
        object path field {String}.
        Default is md5 of the objects path field.
        
    thumbDir {String}
        Path to the thumbnail directory
        
    thumbSizes {Object}
        The default sizes of the generated thumbnails
        Defaults to {normal: 128, large: 256}
        
    thumbQuality {Number}
        The generated thumbnail quality (1 bad .. 100 best)
        Defaults to 50

#### ffmpegThumbnailer 

###### Options

    keyGenerator {function({String})}
        Key generator is a function that generates a unique key for the
        object path field {String}.
        Default is md5 of the objects path field.
        
    thumbDir {String}
        Path to the thumbnail directory
        
    thumbSizes {Object}
        The default sizes of the generated thumbnails
         Defaults to {normal: 128, large: 256}
        
    thumbQuality {Number}
        The generated thumbnail quality (1 bad .. 100 best)
        Defaults to 50

#### memStore 

###### Options

    keyGenerator {function({String})}
        Key generator is a function that generates a unique key for the
        object path field {String}.
        Default is md5 of the objects path field.

###### Implements

    find(options, callback(err, results))
    findById(key, callback(err, result))
    create(object, callback(err))
    update(key, object, callback(err))
    remove(key, callback(err))
    removeAll(callback(err))

#### mongooseStore 

###### Options

    url {String}
        MongoDB database url.
        Default to 'mongodb://localhost/mediafiles'

###### Implements

    find(options, callback(err, results))
    findById(key, callback(err, result))
    create(object, callback(err))
    update(key, object, callback(err))
    remove(key, callback(err))
    removeAll(callback(err))

## User plugins

#### Thumbnailers plugins

The thumbnailer is a function that gets a path to a media file, and
A callback function(err, thumbnailPath).
If successful it will call the callback function with a path to
Generated thumbnail. On fail it will set the thumbnailPath
To null.

Example:

```js
/** 
 * An example thumbnailer function that always return the same thumb
 * Not very useful...
 *
 * @par
      am {String} path The path to a media file
 * @param {String} size The size of the thumbnail ('normal', 'large')
 * @param {function({Error} err, {String} path)} callback The 
 *    callback function that will receive the thumb image file path
 */
var thumbnailer = function(path, size, callback) {
  // do nothing with image in path
  // ...
  // set err to null, and send back a static image path
  callback(err, 'my-thumb.jpg');
};
```

( An example thumbnail module is in lib/thumbnailers/ )

#### Backend storage plug-ins

A plug-in store module for data storage

    The store module should implement:
        find(options, callback(err, results))
        findById(key, callback(err, result))
        create(object, callback(err))

    The find function options:
        limt {Nuber} max number of results
        
        skip {Number} start at result
        
        sortBy {String} field name to sort by:
            'name' will sort result by the 'name' field
            '-name' will sort by 'name' backwords
            
        where {String[]} a list of where strings
            
( An example store module is in lib/backends/ )

