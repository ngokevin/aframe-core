require('./vr-register-element');
require('../style/vr-markup.css');

var VRObject = require('./core/vr-object');
var VRNode = require('./core/vr-node');

var THREE = require('three');
// TODO: Eventually include these only if they are needed by a component.
THREE.Cursor = require('../lib/cursor3D')(THREE);
THREE.Raycaster = require('../lib/vendor/Raycaster')(THREE);
THREE.ShaderLib.pbr = require('./shaders/pbr')(THREE);
THREE.VRControls = require('../lib/vendor/VRControls');
THREE.VREffect = require('../lib/vendor/VREffect');

var VRUtils = require('./vr-utils');

require('./core/vr-camera');
require('./core/vr-scene');
require('./core/vr-assets');

require('./vr-animation');
require('./vr-behavior');
require('./vr-controls');
require('./vr-cursor');
require('./vr-fog');
require('./vr-geometry');
require('./vr-material');
require('./vr-mesh');

module.exports = {
  THREE: THREE,
  VRObject: VRObject,
  VRNode: VRNode,
  utils: VRUtils
};
