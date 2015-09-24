var coordinateParser = require('./coordinate-parser');
var registerComponent = require('../core/register-component').registerComponent;
var THREE = require('../../lib/three');
var utils = require('../vr-utils');

var proto = {
  update: {
    value: function () {
      // Update three.js object.
      this.el.object3D.rotation.set(THREE.Math.degToRad(this.data.x),
                                    THREE.Math.degToRad(this.data.y),
                                    THREE.Math.degToRad(this.data.z));
      this.el.object3D.rotation.order = 'YXZ';
    }
  }
};

utils.mixin(proto, coordinateParser);
module.exports.Component = registerComponent('rotation', proto);
