/*jshint node:true*/
'use strict';

var mediaThumbStore = require('../index');
var myMedia;

// Create a thumbnail generator for images
var imageThumbnailer = new mediaThumbStore.gmThumbnailer({
  thumbDir: __dirname
});

// Create a thumbnail generator for images
var videoThumbnailer = new mediaThumbStore.ffmpegThumbnailer({
  thumbDir: __dirname
});

// Check the thumbnailer function
function test() {
  console.log('\nMake a thumbnail for one image');
  console.log('-------------------------------');
  var imagePath = __dirname + '/img/happy-cat.jpg';
  var thumbSize = 'normal';

  videoThumbnailer(imagePath, thumbSize, function(err, path) {
    if (err) {
      console.log('  Thumbnail not created');
    } else {
      console.log('  Thumbnail created at:' + path);
    }

    test2();
  });
}

// Create a thumbnail media store
function test2() {
  myMedia = new mediaThumbStore({
    defaultIcon: __dirname + '/normal/default.jpg',
    imageThumbnailer: imageThumbnailer,
    videoThumbnailer: videoThumbnailer
  });

  // Build initial database of media files
  myMedia.updateFromDir(__dirname + '/img', function() {
    console.log('\nScan folder\n-----------\n' + __dirname + '/img');

    // Print out all files found
    myMedia.find({}, function(err, results) {
      console.log('\nDump image database');
      console.log('-------------------');
      console.log(results);

      test3();
    });
  });
}

// Create thumbnail
function test3() {
  console.log('\nCreate thumbnail for an image');
  myMedia.find({where: ['mime~=image']}, function(err, results) {
    var id = results[0]._id;

    myMedia.findThumbById(id, 'normal', function(err, path) {
      console.log('  Created thumbnail (Image): ' + path);

      test4();
    });
  });
}

// Create thumbnail
function test4() {
  console.log('\nCreate thumbnail for a video');
  myMedia.find({where: ['mime~=video']}, function(err, results) {
    var id = results[0]._id;

    myMedia.findThumbById(id, 'normal', function(err, path) {
      console.log('  Created thumbnail (Video): ' + path);
    });
  });
}

test();
