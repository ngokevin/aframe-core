/* global HTMLElement */

require('../vr-register-element');

var THREE = require('../../lib/three');
var VRUtils = require('../vr-utils');

/**
 *
 * VRObject represents all elements that are part of the 3D scene.
 * They all have a position, rotation and a scale.
 *
 */
var VRObject = module.exports = document.registerElement(
  'vr-object',
  {
    prototype: Object.create(
      HTMLElement.prototype,
      {

        //  ----------------------------------  //
        //   Native custom elements callbacks   //
        //  ----------------------------------  //

        createdCallback: {
          value: function () {
            // Array of effectors attatched to element
            this.attatchedTo = [];
            this.object3D = new THREE.Object3D();
            this.initAttributes();
          },
          writable: window.debug
        },

        attributeChangedCallback: {
          value: function (change) {
            if (change === 'effectors') {
              this.updateEffectors();
            }

            // Position
            var position = this.getAttribute('position', {x: 0, y: 0, z: 0});

            // Rotation
            var rotation = this.getAttribute('rotation', {x: 0, y: 0, z: 0});
            var rotationX = THREE.Math.degToRad(rotation.x);
            var rotationY = THREE.Math.degToRad(rotation.y);
            var rotationZ = THREE.Math.degToRad(rotation.z);

            // Scale
            var scale = this.getAttribute('scale', {x: 1, y: 1, z: 1});

            // Setting three.js parameters
            this.object3D.position.set(position.x, position.y, position.z);
            this.object3D.rotation.order = 'YXZ';
            this.object3D.rotation.set(rotationX, rotationY, rotationZ);
            this.object3D.scale.set(scale.x, scale.y, scale.z);
          },
          writable: window.debug
        },

        attachedCallback: {
          value: function () {
            this.addToParent();
            this.updateEffectors();
          },
          writable: window.debug
        },

        detachedCallback: {
          value: function () {
            this.parentEl.remove(this);
          },
          writable: window.debug
        },

        updateEffectors: {
          value: function () {
            if (!this.addedToParent) {
              return;
            }

            var effectors = this.getAttribute('effectors');

            if (!effectors || effectors === '') {
              // detatch all effectors
              this.attatchedTo.forEach(function (effector) {
                effector.detach();
              });
              this.attatchedTo = [];
              return;
            }

            effectors = effectors.split(/[ ,]+/)
              .map(function (id) {
                var element = document.getElementById(id);
                if (element === null) {
                  console.warn('[vr-object] ' + id + ' effector not found.');
                }
                return element;
              });

            // attach effectors
            effectors.forEach(function (effector) {
              if (effector && this.attatchedTo.indexOf(effector) === -1) {
                effector.attach(this);
                this.attatchedTo.push(effector);
              }
            }.bind(this));

            // detatch effectors
            this.attatchedTo = this.attatchedTo.filter(function (effector) {
              var keep = effectors.indexOf(effector) !== -1;
              if (!keep) {
                effector.detach();
              }
              return keep;
            });
          }
        },

        addToParent: {
          value: function () {
            // attach to parent object3D
            var parent = this.parentElement.object3D;
            if (parent === undefined) {
              return;
            }
            parent.add(this.object3D);
            this.addedToParent = true;
          },
          writable: window.debug
        },

        remove: {
          value: function (el) {
            this.object3D.remove(el.object3D);
          },
          writable: window.debug
        },

        initAttributes: {
          value: function (el) {
            var position = this.hasAttribute('position');
            var rotation = this.hasAttribute('rotation');
            var scale = this.hasAttribute('scale');
            if (!position) { this.setAttribute('position', '0 0 0'); }
            if (!rotation) { this.setAttribute('rotation', '0 0 0'); }
            if (!scale) { this.setAttribute('scale', '1 1 1'); }
            // We force an attribute update if all the attributes are defined.
            // It syncs the attributes with the object3D.
            if (scale && rotation && scale) {
              VRObject.prototype.attributeChangedCallback.call(this);
            }
          },
          writable: window.debug
        },

        addAnimations: {
          value: function () {
            var self = this;
            var animations = this.getAttribute('animation');
            if (!animations) { return; }
            animations = animations.split(' ');
            animations.forEach(attachObject);
            function attachObject (animationName) {
              var el = document.getElementById(animationName);
              if (!el) { return; }
              el.add(self);
            }
          },
          writable: window.debug
        },

        getAttribute: {
          value: function (attr, defaultValue) {
            var value = HTMLElement.prototype.getAttribute.call(this, attr);
            return VRUtils.parseAttributeString(attr, value, defaultValue);
          },
          writable: window.debug
        },

        setAttribute: {
          value: function (attr, value) {
            value = VRUtils.stringifyAttributeValue(value);
            HTMLElement.prototype.setAttribute.call(this, attr, value);
          },
          writable: window.debug
        }

      })
  }
);
