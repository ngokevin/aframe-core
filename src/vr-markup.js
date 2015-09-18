require('./vr-register-element');

var VRObject = require('./core/vr-object');
var VRNode = require('./core/vr-node');

// Exports THREE to the window object so we can
// use three.js without alteration
var THREE = window.THREE = require('../lib/three');
var VRUtils = require('./vr-utils');
var VREffector = require('./core/vr-effectors');

require('./core/vr-scene');
require('./core/vr-assets');
require('./core/vr-object');

require('./vr-animation');
require('./vr-behavior');
require('./vr-controls');
require('./vr-cursor');
require('./vr-fog');
require('./vr-geometry');
require('./vr-material');

module.exports = {
  THREE: THREE,
  VRObject: VRObject,
  VRNode: VRNode,
  VREffector: VREffector,
  utils: VRUtils
};
