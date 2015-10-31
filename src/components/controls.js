var registerComponent = require('../core/register-component').registerComponent;
var THREE = require('../../lib/three');

module.exports.Component = registerComponent('controls', {
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

      var position = this.el.getComputedAttribute('position');
      this.resetPosition = new THREE.Vector3().set(position.x, position.y, position.z);
    }
  },

  update: {
    value: function () {
      // get input components we want to compose together/
      var kb = this.el.components['keyboard-input'];
      var hmd = this.el.components['hmd-input'];
      var mouse = this.el.components['mouse-input'];

      var finalQ = new THREE.Quaternion().copy(this.resetQuaternion);

      var finalPosition = this.resetPosition.clone();

      // compose all the inputs together
      if (kb) {
        finalQ.multiply(kb.object3D.quaternion);
        finalPosition.add(kb.object3D.position);
      }
      if (hmd) {
        finalQ.multiply(hmd.object3D.quaternion);
        finalPosition.add(hmd.object3D.position);
      }
      if (mouse) {
        finalQ.multiply(mouse.object3D.quaternion);
      }

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
