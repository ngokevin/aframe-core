require('./a-register-element');

var AObject = require('./core/a-object');
var ANode = require('./core/a-node');

// Exports THREE to the window object so we can
// use three.js without alteration
var THREE = window.THREE = require('../lib/three');
var utils = require('./a-utils');

require('./core/a-animation');
require('./core/a-assets');
require('./core/a-mixin');
require('./core/a-scene');

module.exports = {
  THREE: THREE,
  AObject: AObject,
  ANode: ANode,
  utils: utils
};
