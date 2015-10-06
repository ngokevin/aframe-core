var registerComponent = require('../core/register-component');
var THREE = require('../../lib/three');

var defaults = {
  controlType: 'walk',
  locomotion: true,
  acceleration: 0.1,
  easing: 20,
  rotationSpeed: 0.05
};

module.exports.Component = registerComponent('keyboardControls', {
  init: {
    value: function () {
      var scene = this.el.sceneEl;
      scene.addBehavior(this);

      this.prevTime = Date.now();

      // Object which is being controlled.
      this.object3D = this.el.getObject3D();

      // To keep track of the pressed keys.
      this.keys = {};

      // sets defaults
      if (this.data.locomotion === undefined) {
        this.locomotion = defaults.locomotion;
      } else {
        this.locomotion = this.data.locomotion === 'true';
      }
      this.controlType = this.data.type || defaults.controlType;
      this.acceleration = defaults.acceleration;
      this.easing = defaults.easing;
      this.rotationSpeed = defaults.rotationSpeed;
      this.velocity = new THREE.Vector3();

      this.attachKeyboardListeners();
    }
  },

  update: {
    value: function () {
      var velocity = this.velocity;
      var time = window.performance.now();
      var delta = (time - this.prevTime) / 1000;
      this.prevTime = time;

      var position = this.object3D.position;
      var rotation = this.object3D.rotation;
      var quaternion = this.object3D.quaternion;

      // calculate velocity
      velocity.x -= velocity.x * this.easing * delta;
      velocity.z -= velocity.z * this.easing * delta;

      // add acceleration
      if (this.locomotion) {
        if (this.keys[65]) { // Left
          velocity.x -= this.acceleration;
        }
        if (this.keys[87]) { // Up
          velocity.z -= this.acceleration;
        }
        if (this.keys[68]) { // Right
          velocity.x += this.acceleration;
        }
        if (this.keys[83]) { // Down
          velocity.z += this.acceleration;
        }
      }

      // rotation
      if (this.keys[81]) { // Q - rotate left
        rotation.y += this.rotationSpeed;
      }
      if (this.keys[69]) { // E - rotate right
        rotation.y -= this.rotationSpeed;
      }

      // forward, lateral and vertical movements.
      var fwdX = 0;
      var fwdZ = 0;
      var latX = 0;
      var latZ = 0;
      var vertY = 0;

      // apply rotation to forward and lateral vectors.
      var fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(quaternion);
      var lat = new THREE.Vector3(1, 0, 0).applyQuaternion(quaternion);

      switch (this.controlType) {
        case 'walk':
          // we want to rotate around Y, so we reset to 0 value.
          fwd.y = 0;

          // calculate corodinate for forward movement
          var fwdRot = Math.atan2(fwd.x, -fwd.z);
          fwdX = Math.sin(fwdRot);
          fwdZ = -Math.cos(fwdRot);

          // calculate coordinates for lateral movement
          var latRot = Math.atan2(lat.x, -lat.z);
          latX = Math.sin(latRot);
          latZ = -Math.cos(latRot);

          // apply velocity
          fwdX *= -velocity.z;
          fwdZ *= -velocity.z;
          latX *= velocity.x;
          latZ *= velocity.x;
          break;
        case 'fly':
          // apply velocity
          fwd.multiplyScalar(-velocity.z);
          lat.multiplyScalar(velocity.x);

          fwdX = fwd.x;
          latX = lat.x;
          vertY = fwd.y + lat.y;
          fwdZ = fwd.z + lat.z;
          break;
        default:
          console.warn('[vr-controls] Unrecognized control type');
          break;
      }

      position.set(position.x + fwdX + latX,
        position.y + vertY,
        position.z + fwdZ + latZ);
    }
  },

  attachKeyboardListeners: {
    value: function () {
      window.addEventListener('keydown', this.onKeyDown.bind(this), false);
      window.addEventListener('keyup', this.onKeyUp.bind(this), false);
    }
  },

  onKeyDown: {
    value: function (event) {
      this.keys[event.keyCode] = true;
    }
  },

  onKeyUp: {
    value: function (event) {
      this.keys[event.keyCode] = false;
    }
  }
});
