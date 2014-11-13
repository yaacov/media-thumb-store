var expect = require('chai').expect;
var fs = require('fs');
var mediaThumbStore = require('../index');
var utils = require('./utils');

var mediaDir = __dirname + '/media';
var thumbDir = __dirname + '/thumbnails';
var thumbSize = 'large';

/** Test loading of media files
 */
describe('Load media files', function() {
  // Thumbnail generator for images
  var imageThumbnailer;
  // Media store
  var myMedia ;

  // Load media files from the test media directory
  before(function(done) {
    // Remove the thumbnail cache directory
    if (fs.existsSync(thumbDir)) {
      utils.deleteFolderRecursive(thumbDir);
    }
    // make sure cache directory exists
    fs.mkdirSync(thumbDir);
    fs.mkdirSync(thumbDir + '/' + thumbSize);

    // Create a thumbnail generator for images
    imageThumbnailer = new mediaThumbStore.gmThumbnailer({
      thumbDir: thumbDir
    });

    // Create a thumbnail media store
    myMedia = new mediaThumbStore({
      defaultIcon: 'default.jpeg',
      imageThumbnailer: imageThumbnailer,
      videoThumbnailer: function(path, size, callback) {
        callback(null, 'video.jpeg');
      }
    });

    // Search all media files in media directory
    myMedia.updateFromDir(mediaDir, function() {
      done();
    });
  });

  // Get all media files
  it('should find 5 media files', function() {
    myMedia.find({}, function(err, results) {
      expect(results.length).to.equal(5);
    });
  });

  // Get only files with image mime type
  it('should find 3 image files', function() {
    var query = {
      where: ['mime~=^image']
    };

    myMedia.find(query, function(err, results) {
      expect(results.length).to.equal(3);
    });
  });

  // Get a default thumb path for an video
  it('should get the default thumb for audio', function() {
    var query = {
      where: ['mime~=^audio']
    };

    myMedia.find(query, function(err, results) {
      var key = results[0]._id;

      myMedia.findThumbById(key, thumbSize, function(err, path) {
        expect(path).to.equal('default.jpeg');
      });
    });
  });

  // Get a thumb path for an image
  it('should get the video.jpg thumb for video', function() {
    var query = {
      where: ['mime~=^video']
    };

    myMedia.find(query, function(err, results) {
      var key = results[0]._id;

      myMedia.findThumbById(key, thumbSize, function(err, path) {
        expect(path).to.equal('video.jpeg');
      });
    });
  });

  // Get a thumb path for an image
  it('should create a thumbnail image and save it', function(done) {
    var query = {
      where: ['mime~=^image', 'name==night-cats']
    };

    myMedia.find(query, function(err, results) {
      var key = results[0]._id;

      myMedia.findThumbById(key, thumbSize, function(err, path) {
        expect(fs.existsSync(path)).to.equal(true);
        done();
      });
    });
  });
});
