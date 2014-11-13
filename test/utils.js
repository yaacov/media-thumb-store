/*jshint node:true*/
'use strict';

var fs = require('fs');

/*
 * Utility functions for the test module
 */
var utils = {
  /**
   * Delete a folder recursively
   *
   * @param {String} path the path to remove
   */
  deleteFolderRecursive: function(path) {
    if (fs.existsSync(path)) {
      fs.readdirSync(path).forEach(function(file, index) {
        var curPath = path + '/' + file;
        if (fs.lstatSync(curPath).isDirectory()) { // recurse
          utils.deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  }
};

/* Export module utils
 */
module.exports = utils;
