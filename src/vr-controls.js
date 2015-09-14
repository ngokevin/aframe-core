var THREE = require('../lib/three');

var VRNode = require('./core/vr-node');

module.exports = document.registerElement(
  'vr-controls',
  {
    prototype: Object.create(
      VRNode.prototype,
      {
        createdCallback: {
          value: function () {
            this.prevTime = Date.now();
            // The canvas where the scene is painted
            this.canvasEl = document.querySelector('vr-scene').canvas;
            this.cameraEl = document.querySelector('vr-camera');
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
            this.setAttribute('mouse-look', true);

            this.cameraEl.addEventListener('loaded', this.onElementsLoaded.bind(this));
          }
        },

        onElementsLoaded: {
          value: function() {
            this.attachMouseKeyboardListeners();
            this.attachVrControls();
            this.load();
          }
        },

        attributeChangedCallback: {
          value: function () {
            var locomotion = this.getAttribute('locomotion');
            var mouseLook = this.getAttribute('mouse-look');
            var hmdOrientation = this.getAttribute('use-hmd-orientation');
            var hmdPosition = this.getAttribute('use-hmd-position');
            var moveType = this.getAttribute('type');
            this.moveType = moveType === "fly" ? "fly" : "walk";
            this.locomotion = locomotion === 'true';
            this.mouseLook = mouseLook === 'true';
            this.hmdOrientation = hmdOrientation === "true"? true : false;
            this.hmdPosition = hmdPosition === "true"? true : false;
          }
        },

        update: {
          value: function () {
            var velocity = this.velocity;
            var easing = this.easing;
            var acceleration = this.acceleration;
            var cameraEl = this.cameraEl;
            var pitchObject = this.pitchObject;
            var yawObject = this.yawObject;
            var time = window.performance.now();
            var delta = (time - this.prevTime) / 1000;
            var keys = this.keys;
            this.prevTime = time;

            velocity.x -= velocity.x * easing * delta;
            velocity.z -= velocity.z * easing * delta;

            var position = cameraEl.getAttribute('position');
            var x = position.x || 0;
            var y = position.y || 0;
            var z = position.z || 0;

            var rotation = cameraEl.getAttribute('rotation');
            var rotZ = rotation.z || 0;

            if (this.locomotion) {
              if (keys[81]) { //rotate left
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
            var fwdX = fwdZ = latX = latZ = vertY = 0;
            var rotation;

            // hmd state
            var hmdState = this.vrControls.state;

            if (hmdState && hmdState.orientation !== null) {
              rotation = this.vrControls.rotation;
            } else {
              rotation = this.cameraEl.object3D.quaternion;
            }

            // apply rotation to forward and lateral vectors.
            var fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(rotation);
            var lat = new THREE.Vector3(1, 0, 0).applyQuaternion(rotation);

            if (this.moveType === "walk") {
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
            }

            if (this.moveType === 'fly') {
              // apply velocity
              fwd.multiplyScalar(-velocity.z);
              lat.multiplyScalar(velocity.x);

              fwdX = fwd.x;
              latX = lat.x;
              vertY = fwd.y + lat.y;
              fwdZ = fwd.z + lat.z;
            }

            position = {
              x: x + fwdX + latX,
              y: y + vertY,
              z: z + fwdZ + latZ
            };

            cameraEl.setAttribute('rotation', {
              x: THREE.Math.radToDeg(pitchObject.rotation.x),
              y: THREE.Math.radToDeg(yawObject.rotation.y),
              z: rotZ
            });

            cameraEl.setAttribute('position', position);

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
          value: function() {
            this.vrControls = new THREE.VRControls(this.cameraEl.object3D);
          }
        },

        onMouseMove: {
          value: function (event) {
            var pitchObject = this.pitchObject;
            var yawObject = this.yawObject;
            var mouseDown = this.mouseDown;
            var PI_2 = Math.PI / 2;

            if (!mouseDown || !this.mouseLook) { return; }

            var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
            var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

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
