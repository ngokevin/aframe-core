var registerComponent = require('../core/register-component');
var THREE = require('../../lib/three');

// To avoid recalculation at every mouse movement tick
var PI_2 = Math.PI / 2;

module.exports.Component = registerComponent('mouseControls', {
  init: {
    value: function () {
      // Object which is being controlled.
      this.object3D = this.el.getObject3D();
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
      this.yawObject.add(this.pitchObject);

      this.attachMouseListeners();
    }
  },

  update: {
    value: function () {
      var pitchObject = this.pitchObject;
      var yawObject = this.yawObject;
      var quaternion = this.object3D.quaternion;

      quaternion.multiplyQuaternions(yawObject.quaternion, pitchObject.quaternion);
    }
  },

  attachMouseListeners: {
    value: function () {
      var canvasEl = this.canvasEl;

      // Mouse Events
      canvasEl.addEventListener('mousedown', this.onMouseDown.bind(this), true);
      canvasEl.addEventListener('mouseup', this.onMouseUp.bind(this), true);
      canvasEl.addEventListener('mousemove', this.onMouseMove.bind(this), true);
    }
  },

  onMouseMove: {
    value: function (event) {
      var pitchObject = this.pitchObject;
      var yawObject = this.yawObject;
      var mouseDown = this.mouseDown;

      if (!mouseDown) { return; }

      var movementX = event.movementX || event.mozMovementX || 0;
      var movementY = event.movementY || event.mozMovementY || 0;

      yawObject.rotation.y -= movementX * 0.002;
      pitchObject.rotation.x -= movementY * 0.002;

      // lock pitch to maximum of 90deg.
      pitchObject.rotation.x = Math.max(-PI_2, Math.min(PI_2, pitchObject.rotation.x));
    }
  },

  onMouseDown: {
    value: function (event) {
      this.mouseDown = true;
      this.lastMouseX = event.clientX;
      this.lastMouseY = event.clientY;
    }
  },

  onMouseUp: {
    value: function () {
      this.mouseDown = false;
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
