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
  // Thumbnail generator for video
  var videoThumbnailer;
  // Storage backend
  var myStore = new mediaThumbStore.mongooseStore();
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

    // Create a thumbnail generator for images
    videoThumbnailer = new mediaThumbStore.ffmpegThumbnailer({
      thumbDir: __dirname
    });

    // Create a thumbnail media store
    myMedia = new mediaThumbStore({
      defaultIcon: 'default.jpeg',
      store: myStore,
      imageThumbnailer: imageThumbnailer,
      videoThumbnailer: videoThumbnailer
    });

    // Search and append all media files in media folder
    myStore.removeAll(function(err) {
      myMedia.updateFromDir(mediaDir, function() {
        done();
      });
    });
  });

  // Get all media files
  it('should find 4 media files', function(done) {
    myMedia.find({}, function(err, results) {
      expect(results.length).to.equal(4);
      done();
    });
  });

  // Get only files with image mime type
  it('should find 2 image files', function(done) {
    var query = {
      where: ['mime~=^image']
    };

    myMedia.find(query, function(err, results) {
      expect(results.length).to.equal(2);
      done();
    });
  });

  // Get a default thumb path for an video
  it('audio-file: should get the default thumb for audio', function(done) {
    var query = {
      where: ['mime~=^audio']
    };

    myMedia.find(query, function(err, results) {
      var key = results[0]._id;

      myMedia.findThumbById(key, thumbSize, function(err, path) {
        expect(path).to.equal('default.jpeg');
        done();
      });
    });
  });
});
