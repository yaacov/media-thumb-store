/*jshint node:true*/
'use strict';

var mediaThumbStore = require('../index');

// Create a thumbnail generator for images
var imageThumbnailer = new mediaThumbStore.gmThumbnailer({
  thumbDir: __dirname
});

// Create a thumbnail generator for images
var videoThumbnailer = new mediaThumbStore.ffmpegThumbnailer({
  thumbDir: __dirname
});

// Create a thumbnail media store
var myMedia = new mediaThumbStore({
  defaultIcon: __dirname + '/normal/default.jpg',
  imageThumbnailer: imageThumbnailer,
  videoThumbnailer: videoThumbnailer
});

// Build initial database of media files
myMedia.updateFromDir(__dirname + '/img', function() {
  console.log('\nScan folder\n-----------\n' + __dirname + '/img');

  // Print out all files found
  console.log('\nDump image database');
  console.log('-------------------');
  myMedia.find({}, function(err, results) {
    console.log(results);
  });

  // Create thumbnail
  console.log('\nCreate thumbnail for an video');
  console.log('-----------------------------');
  myMedia.find({where: ['mime~=video']}, function(err, results) {
    var id = results[0]._id;

    myMedia.findThumbById(id, 'normal', function(err, path) {
      console.log('Created thumbnail: ' + path);
    });
  });

  // Create thumbnail
  console.log('\nCreate thumbnail for an image');
  console.log('-----------------------------');
  myMedia.find({where: ['mime~=image']}, function(err, results) {
    var id = results[0]._id;

    myMedia.findThumbById(id, 'normal', function(err, path) {
      console.log('Created thumbnail: ' + path);
    });
  });
});
