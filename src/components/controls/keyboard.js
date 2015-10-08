var registerComponent = require('../../core/register-component').registerComponent;
var THREE = require('../../../lib/three');

var defaults = {
  type: 'walk',
  locomotion: true,
  acceleration: 0.1,
  easing: 20,
  rotationSpeed: 0.05
};

module.exports.Component = registerComponent('keyboard-controls', {
  init: {
    value: function () {
      var scene = this.el.sceneEl;
      scene.addBehavior(this);

      this.prevTime = Date.now();

      // Object which is being controlled.
      this.object3D = this.el.object3D;

      // To keep track of the pressed keys.
      this.keys = {};

      // Keeps track of velocity
      this.velocity = new THREE.Vector3();

      // sets defaults
      if (this.data.locomotion === undefined) {
        this.locomotion = defaults.locomotion;
      } else {
        this.locomotion = this.data.locomotion === 'true';
      }

      Object.keys(defaults).forEach(function (key) {
        if (this.data[key]) {
          this[key] = this.data[key] || defaults[key];
        } else {
          this[key] = defaults[key];
        }
      }, this);

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
      var q = this.object3D.quaternion;

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
      var body_y = new THREE.Vector3(0, 1, 0);
      body_y.normalize();

      var bodyYdelta = 0;
      if (this.keys[81]) { // Q - rotate left
        bodyYdelta += 0.05;
      }
      if (this.keys[69]) { // E - rotate right
        bodyYdelta -= 0.05;
      }

      q.multiplyQuaternions(new THREE.Quaternion().setFromAxisAngle(body_y, bodyYdelta), q);

      // forward, lateral and vertical movements.
      var fwdX = 0;
      var fwdZ = 0;
      var latX = 0;
      var latZ = 0;
      var vertY = 0;

      // apply rotation to forward and lateral vectors.
      var fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(q);
      var lat = new THREE.Vector3(1, 0, 0).applyQuaternion(q);

      switch (this.type) {
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
          console.warn('Keyboard controls - Unrecognized control type');
          break;
      }

      position.set(position.x + fwdX + latX,
        position.y + vertY,
        position.z + fwdZ + latZ);
    }
  },

  attachKeyboardListeners: {
    value: function () {
      window.addEventListener('keydown', this.onKeyDown.bind(this));
      window.addEventListener('keyup', this.onKeyUp.bind(this));
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
