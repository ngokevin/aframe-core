var registerComponent = require('../core/register-component').registerComponent;
var THREE = require('../../lib/three');

module.exports.Component = registerComponent('controls', {
  defaults: {
    value: {
      type: 'walk',
      locomotion: true,
      acceleration: 0.1,
      easing: 20,
      rotationSpeed: 0.05
    }
  },

  init: {
    value: function () {
      this.setupControls();
    }
  },

  setupControls: {
    value: function () {
      var scene = this.el.sceneEl;
      scene.addBehavior(this);

      var rotation = this.el.getComputedAttribute('rotation');
      var resetEuler = new THREE.Euler(THREE.Math.degToRad(rotation.x), THREE.Math.degToRad(rotation.y), THREE.Math.degToRad(rotation.z));
      this.resetQuaternion = new THREE.Quaternion().setFromEuler(resetEuler);

      this.worldRotation = new THREE.Quaternion();
    }
  },

  getKeyRotation: {
    value: function (keys) {
      var unitY = new THREE.Vector3(0, 1, 0);

      var deltaY = 0;
      if (keys[81]) { // Q - rotate left
        deltaY += this.data.rotationSpeed;
      }
      if (keys[69]) { // E - rotate right
        deltaY -= this.data.rotationSpeed;
      }

      return this.worldRotation.multiply(new THREE.Quaternion().setFromAxisAngle(unitY, deltaY));
    }
  },

  getKeyTranslation: {
    value: function (keys, q) {
      var time = window.performance.now();
      var delta = (time - this.prevTime) / 1000;
      this.prevTime = time;

      // calculate velocity
      var velocity = new THREE.Vector3();

      velocity.x -= velocity.x * this.data.easing * delta;
      velocity.z -= velocity.z * this.data.easing * delta;

      // add acceleration
      if (this.data.locomotion === true) {
        var acceleration = this.data.acceleration;
        if (keys[65]) { // Left
          velocity.x -= acceleration;
        }
        if (keys[87]) { // Up
          velocity.z -= acceleration;
        }
        if (keys[68]) { // Right
          velocity.x += acceleration;
        }
        if (keys[83]) { // Down
          velocity.z += acceleration;
        }
      }

      // forward, lateral and vertical movements.
      var fwdX = 0;
      var fwdZ = 0;
      var latX = 0;
      var latZ = 0;
      var vertY = 0;

      // apply rotation to forward and lateral vectors.
      var fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(q);
      var lat = new THREE.Vector3(1, 0, 0).applyQuaternion(q);

      switch (this.data.type) {
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

      return new THREE.Vector3(fwdX + latX,
        vertY,
        fwdZ + latZ);
    }
  },

  update: {
    value: function () {
      // Get input components we want to compose together/
      var keyboard = this.el.components['keyboard-input'];
      var hmd = this.el.components['hmd-input'];
      var mouse = this.el.components['mouse-input'];

      // Get keyboard keys
      var keys = {};
      if (keyboard) {
        keys = keyboard.keys;
      }

      // Reset viewport
      if (keys[90]) { // Z
        hmd.resetSensor();
      }

      // Quarternion which we will compose on
      var finalQ = new THREE.Quaternion().copy(this.resetQuaternion);

      // Position we will compose on
      var position = this.el.getComputedAttribute('position');
      var finalPosition = new THREE.Vector3().set(position.x, position.y, position.z);

      // Compose inputs
      finalQ.multiply(this.getKeyRotation(keys));

      if (mouse) {
        finalQ.multiply(mouse.object3D.quaternion);
      }

      if (hmd) {
        finalQ.multiply(hmd.object3D.quaternion);
        finalPosition.add(hmd.object3D.position);
      }

      finalPosition.add(this.getKeyTranslation(keys, finalQ));

      // We can apply these transforms onto the objects themeselves.
      // this.el.object3D.quaternion.copy(finalQ);
      // this.el.object3D.position.copy(finalPosition);

      // apply final rotation and position.
      var finalEuler = new THREE.Euler().setFromQuaternion(finalQ);
      this.el.setAttribute('rotation', {
        x: THREE.Math.radToDeg(finalEuler.x),
        y: THREE.Math.radToDeg(finalEuler.y),
        z: THREE.Math.radToDeg(finalEuler.z)
      });

      this.el.setAttribute('position', {
        x: finalPosition.x,
        y: finalPosition.y,
        z: finalPosition.z
      });
    }
  }
});
