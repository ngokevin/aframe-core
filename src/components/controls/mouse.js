var registerComponent = require('../../core/register-component').registerComponent;
var THREE = require('../../../lib/three');
var PI_2 = Math.PI / 2;

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

      this.pitchObject = new THREE.Object3D();
      this.yawObject = new THREE.Object3D();
      this.yawObject.position.y = 10;
      this.yawObject.add(this.pitchObject);

      this.attachMouseListeners();
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
      var q = this.object3D.quaternion;

      var pitchObject = this.pitchObject;
      var yawObject = this.yawObject;
      var mouseDown = this.mouseDown;

      if (!mouseDown) { return; }

      var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
      var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

      yawObject.rotation.y -= movementX * 0.001;
      pitchObject.rotation.x -= movementY * 0.001;
      pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));

      q.multiplyQuaternions(yawObject.quaternion, pitchObject.quaternion);
    }
  }
});
