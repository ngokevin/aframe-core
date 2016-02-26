var THREE = global.THREE = require('three');

// Allow cross-origin images to be loaded.
if (THREE.TextureLoader) {
  THREE.TextureLoader.prototype.crossOrigin = '';
}

// TODO: Eventually include these only if they are needed by a component.

require('../node_modules/three/examples/js/loaders/OBJLoader');  // THREE.OBJLoader
require('../node_modules/three/examples/js/loaders/ColladaLoader');  // THREE.ColladaLoader
require('../lib/vendor/Raycaster');  // THREE.Raycaster
require('../node_modules/webvr-libs/VRControls');  // THREE.VRControls
require('../node_modules/webvr-libs/VREffect');  // THREE.VREffect

module.exports = THREE;
