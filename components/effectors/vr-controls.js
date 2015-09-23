var VRMarkup = require('vr-markup');

var THREE = VRMarkup.THREE;
var VREffector = VRMarkup.VREffector;

document.registerElement(
  'vr-controls',
  {
    prototype: Object.create(
      VREffector.prototype,
      {
        createdCallback: {
          value: function () {
            this.keys = {};
            this.mouseDown = false;

            this.acceleration = 6;
            this.easing = 20;
            this.prevTime = Date.now();
            this.velocity = new THREE.Vector3();
            this.pitchObject = new THREE.Object3D();
            this.yawObject = new THREE.Object3D();
            this.yawObject.position.y = 10;
            this.yawObject.add(this.pitchObject);

            this.locomotion = true;
            this.mouseLook = true;
            this.controlType = 'walk';

            // wait for element to attatch to effector
            this.addEventListener('attatched', function () {
              this.attatchedElement = this.attatchedTo.element;

              this.attachMouseKeyboardListeners();
              this.attachVrControls();

              this.update();
            }.bind(this));

            this.addEventListener('detatched', function () {
              this.shutdown();
            });
          }
        },

        attributeChangedCallback: {
          value: function () {
            this.locomotion = this.getAttribute('locomotion', true);
            this.mouseLook = this.getAttribute('mouselook', true);
            this.controlType = this.getAttribute('type', 'walk');
          }
        },

        update: {
          value: function () {
            var velocity = this.velocity;
            var easing = this.easing;
            var acceleration = this.acceleration;
            var attatchedElement = this.attatchedElement;
            var pitchObject = this.pitchObject;
            var yawObject = this.yawObject;
            var time = window.performance.now();
            var delta = (time - this.prevTime) / 1000;
            var keys = this.keys;
            this.prevTime = time;

            velocity.x -= velocity.x * easing * delta;
            velocity.z -= velocity.z * easing * delta;

            var position = attatchedElement.getAttribute('position');
            var x = position.x || 0;
            var y = position.y || 0;
            var z = position.z || 0;

            var rotation = attatchedElement.getAttribute('rotation');
            var rotZ = rotation.z || 0;

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
              rotation = attatchedElement.object3D.quaternion;
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
                console.warn('[vr-control] invalid control type specifified.');
                break;
            }

            position = {
              x: x + fwdX + latX,
              y: y + vertY,
              z: z + fwdZ + latZ
            };

            rotation = {
              x: THREE.Math.radToDeg(pitchObject.rotation.x),
              y: THREE.Math.radToDeg(yawObject.rotation.y),
              z: rotZ
            };

            attatchedElement.setAttribute('rotation', rotation);
            attatchedElement.setAttribute('position', position);

            this.vrControls.update();

            this.animationFrameID = window.requestAnimationFrame(this.update.bind(this));
          }
        },

        shutdown: {
          value: function () {
            if (this.animationFrameID) {
              window.cancelAnimationFrame(this.animationFrameID);
            }
          }
        },

        attachMouseKeyboardListeners: {
          value: function () {
            // Keyboard events
            window.addEventListener('keydown', this.onKeyDown.bind(this), false);
            window.addEventListener('keyup', this.onKeyUp.bind(this), false);

            // Mouse Events
            document.body.addEventListener('mousedown', this.onMouseDown.bind(this), true);
            document.body.addEventListener('mouseup', this.onMouseUp.bind(this), true);
            document.body.addEventListener('mousemove', this.onMouseMove.bind(this), true);
          }
        },

        attachVrControls: {
          value: function () {
            this.vrControls = new THREE.VRControls(this.attatchedElement.object3D);
          }
        },

        onMouseMove: {
          value: function (event) {
            var pitchObject = this.pitchObject;
            var yawObject = this.yawObject;
            var mouseDown = this.mouseDown;
            var PI_2 = Math.PI / 2;

            if (!mouseDown || !this.mouseLook) { return; }

            var movementX = event.movementX || event.mozMovementX || 0;
            var movementY = event.movementY || event.mozMovementY || 0;

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
      }
    )
  }
);
