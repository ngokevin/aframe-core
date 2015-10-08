var registerComponent = require('../../core/register-component');
var THREE = require('../../../lib/three');

module.exports.Component = registerComponent('mouse-controls', {
  init: {
    value: function () {
      // Object which is being controlled.
      this.object3D = this.el.object3D;
      this.setupControls();
    }
  },

  setupControls: {
    value: function () {
      var scene = this.el.sceneEl;
      scene.addBehavior(this);

      // element which we are capturing mouse events on
      this.canvasEl = document.querySelector('vr-scene').canvas;

      // traks if mouse button is down.
      this.mouseDown = false;

      this.attachMouseListeners();
    }
  },

  update: {
    value: function () {
      var q = this.object3D.quaternion;

      // Unit vectors
      var headX = new THREE.Vector3(-1, 0, 0).applyQuaternion(q);
      headX.normalize();

      // Rotate around the world Y coordinate, so we don't apply the quaternion.
      var headY = new THREE.Vector3(0, -1, 0);
      headY.normalize();

      var bodyDeltaY = 0;
      var headDeltaX = 0;

      if (this.mouseDown) {
        bodyDeltaY += this.mouseDeltaX * 0.001;
        headDeltaX += this.mouseDeltaY * 0.001;
      }

      q.multiplyQuaternions(new THREE.Quaternion().setFromAxisAngle(headY, bodyDeltaY), q);
      q.multiplyQuaternions(new THREE.Quaternion().setFromAxisAngle(headX, headDeltaX), q);
    }
  },

  attachMouseListeners: {
    value: function () {
      this.canvasEl.addEventListener('mousedown', this.onMouseDown.bind(this), true);
      this.canvasEl.addEventListener('mouseup', this.onMouseUp.bind(this), true);
      this.canvasEl.addEventListener('mousemove', this.onMouseMove.bind(this), true);
    }
  },

  onMouseDown: {
    value: function () {
      this.mouseDown = true;
    }
  },

  onMouseUp: {
    value: function () {
      this.mouseDown = false;
    }
  },

  onMouseMove: {
    value: function (event) {
      this.mouseDeltaX = event.movementX || event.mozMovementX || 0;
      this.mouseDeltaY = event.movementY || event.mozMovementY || 0;
    }
  }
});
