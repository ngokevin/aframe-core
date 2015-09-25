require('../vr-register-element');

var THREE = require('../../lib/three');
var VRObject = require('./vr-object');

module.exports = document.registerElement(
  'vr-scene',
  {
    prototype: Object.create(
      VRObject.prototype, {
        createdCallback: {
          value: function () {
            this.object3D = new THREE.Scene();
          }
        }
      }
    )
  }
);
