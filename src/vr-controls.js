var THREE = require('../lib/three');

var VRObject = require('./core/vr-object');
// To avoid recalculation at every mouse movement tick
var PI_2 = Math.PI / 2;

module.exports = document.registerElement(
  'vr-controls',
  {
    prototype: Object.create(
      VRObject.prototype,
      {
        createdCallback: {
          value: function () {
            this.object3D = new THREE.Object3D();
            this.prevTime = Date.now();
            // The canvas where the scene is painted
            this.canvasEl = document.querySelector('vr-scene').canvas;

            // To keep track of the pressed keys
            this.keys = {};
            this.mouseDown = false;

            this.acceleration = 6;
            this.easing = 20;
            this.velocity = new THREE.Vector3();
            this.pitchObject = new THREE.Object3D();
            this.yawObject = new THREE.Object3D();
            this.yawObject.position.y = 10;
            this.yawObject.add(this.pitchObject);

            this.setAttribute('locomotion', true);
            this.setAttribute('mouselook', true);

            this.attachMouseKeyboardListeners();
            this.attachVrControls();
            this.load();
          }
        },

        attributeChangedCallback: {
          value: function () {
            this.locomotion = this.getAttribute('locomotion', false);
            this.mouseLook = this.getAttribute('mouselook', false);
            this.controlType = this.getAttribute('type', 'walk');
          }
        },

        update: {
          value: function () {
            var velocity = this.velocity;
            var easing = this.easing;
            var acceleration = this.acceleration;
            var pitchObject = this.pitchObject;
            var yawObject = this.yawObject;
            var time = window.performance.now();
            var delta = (time - this.prevTime) / 1000;
            var keys = this.keys;
            this.prevTime = time;

            velocity.x -= velocity.x * easing * delta;
            velocity.z -= velocity.z * easing * delta;

            var position = this.getAttribute('position', {x: 0, y: 0, z: 0});
            var rotation = this.getAttribute('rotation', {x: 0, y: 0, z: 0});
            var rotZ = rotation.z;

            if (this.locomotion) {
              if (keys[81]) { // rotate left
                yawObject.rotation.y += 0.05;
              }
              if (keys[69]) { // rotate right
                yawObject.rotation.y -= 0.05;
              }
              if (keys[65]) { // Left
                velocity.x -= acceleration * delta;
              }
              if (keys[87]) { // Up
                velocity.z -= acceleration * delta;
              }
              if (keys[68]) { // Right
                velocity.x += acceleration * delta;
              }
              if (keys[83]) { // Down
                velocity.z += acceleration * delta;
              }
            }

            if (keys[90]) { // Z
              this.vrControls.resetSensor();
            }

            // forward, lateral and vertical movements.
            var fwdX = 0;
            var fwdZ = 0;
            var latX = 0;
            var latZ = 0;
            var vertY = 0;

            // hmd state
            var hmdState = this.vrControls.state;

            if (hmdState && hmdState.orientation !== null) {
              rotation = this.vrControls.rotation;
              this.hmdOrientation = true;
            } else {
              rotation = this.object3D.quaternion;
            }

            // apply rotation to forward and lateral vectors.
            var fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(rotation);
            var lat = new THREE.Vector3(1, 0, 0).applyQuaternion(rotation);

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
                console.warn('[vr-controls] Valid movement type is "fly" or "walk"');
                break;
            }

            position = {
              x: position.x + fwdX + latX,
              y: position.y + vertY,
              z: position.z + fwdZ + latZ
            };

            this.setAttribute('rotation', {
              x: THREE.Math.radToDeg(pitchObject.rotation.x),
              y: THREE.Math.radToDeg(yawObject.rotation.y),
              z: rotZ
            });

            this.setAttribute('position', position);

            this.vrControls.update();
          }
        },

        attachMouseKeyboardListeners: {
          value: function () {
            var canvasEl = this.canvasEl;

            // Keyboard events
            window.addEventListener('keydown', this.onKeyDown.bind(this), false);
            window.addEventListener('keyup', this.onKeyUp.bind(this), false);

            // Mouse Events
            canvasEl.addEventListener('mousedown', this.onMouseDown.bind(this), true);
            canvasEl.addEventListener('mouseup', this.onMouseUp.bind(this), true);
            canvasEl.addEventListener('mousemove', this.onMouseMove.bind(this), true);
          }
        },

        attachVrControls: {
          value: function () {
            this.vrControls = new THREE.VRControls(this.object3D);
          }
        },

        onMouseMove: {
          value: function (event) {
            var pitchObject = this.pitchObject;
            var yawObject = this.yawObject;
            var mouseDown = this.mouseDown;

            if (!mouseDown || !this.mouseLook) { return; }

            var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

            // we want to lock-out any pitch when VR orientation is present.
            if (this.hmdOrientation) {
              movementY = 0;
            }

            yawObject.rotation.y -= movementX * 0.002;
            pitchObject.rotation.x -= movementY * 0.002;
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
      })
  }
);
