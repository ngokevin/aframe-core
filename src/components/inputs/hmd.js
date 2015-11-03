var registerComponent = require('../../core/register-component').registerComponent;
var THREE = require('../../../lib/three');

module.exports.Component = registerComponent('hmd-input', {
  init: {
    value: function () {
      this.setupControls();
    }
  },

  setupControls: {
    value: function () {
      var scene = this.el.sceneEl;
      this.object3D = new THREE.Object3D();
      this.controls = new THREE.VRControls(this.object3D);
      scene.addBehavior(this);
    }
  },

  resetSensor: {
    value: function () {
      this.controls.resetSensor();
    }
  },

  update: {
    value: function () {
      this.controls.update();
    }
  }
});
