var Cannon = require('cannon');
var VRNode = require('./core/vr-node');

var tagWhitelist = ['VR-CUBE', 'VR-GRID'];

// For using CannonDebugRenderer
window.CANNON = Cannon;

module.exports = document.registerElement('vr-physics', {
  prototype: Object.create(VRNode.prototype, {
    createdCallback: {
      value: function() {
        this.world = new Cannon.World();
        this.world.gravity.set(0, -9.82, 0);

        this.debug = new THREE.CannonDebugRenderer(this.sceneEl.object3D, this.world);

        this.sceneEl.addEventListener('loaded',
          this.recursiveDescend.bind(this, this.sceneEl));
        this.sceneEl.addBehavior(this);
        this.load();
      },
    },

    tagShouldHavePhysics: {
      value: function(el) {
        return tagWhitelist.indexOf(el.tagName) > -1;
      },
    },

    determineShape: {
      value: function(el) {
        if (el.tagName === 'VR-GRID') {
          return new Cannon.Plane();
        } else {
          var geometry = el.object3D.geometry;
          geometry.computeBoundingBox();
          var bounds = geometry.boundingBox.max;
          return new Cannon.Box(new Cannon.Vec3(bounds.x, bounds.y, bounds.z));
        }
      },
    },

    // The physics engine stores a rotation information in a quaternion object
    // that unfortunately can't decompose Euler rotations from any order other
    // than YZX, see:
    // https://github.com/schteppe/cannon.js/blob/master/src/math/Quaternion.js#L301-L324
    // We must convert it to a THREE.Quaternion, then to THREE.Euler, then
    // convert each component from radians to degrees, then join those members
    // into a string for setAttribute.
    quatToRotationAttribute: {
      value: function(quat) {
        // The order needs to be preserved with vr-object!!!
        var v = new THREE.Euler(0, 0, 0, 'YXZ');
        var q = new THREE.Quaternion(quat.x, quat.y, quat.z, quat.w);
        v.setFromQuaternion(q, 'YXZ', true);
        return '' + THREE.Math.radToDeg(v.x) + ' ' + THREE.Math.radToDeg(v.y) +
          ' ' + THREE.Math.radToDeg(v.z);
      },
    },

    constructPhysicsBody: {
      value: function(el) {
        var pos = el.getAttribute('position');
        var mass = el.hasAttribute('mass') ?
          parseFloat(el.getAttribute('mass')) : 1;
        var shape = this.determineShape(el);
        var body = new Cannon.Body({
          mass: mass,
          position: pos,
          shape: shape,
          quaternion: el.object3D.quaternion,
        });
        if (el.tagName === 'VR-GRID') {
          var q = el.object3D.quaternion;
          body.quaternion.setFromAxisAngle(new Cannon.Vec3(1,0,0),-Math.PI/2);
        }
        body.el = el;
        this.world.addBody(body);
      },
    },

    // Depth first traversal of a DOM node
    recursiveDescend: {
      value: function(el, fn) {
        if(this.tagShouldHavePhysics(el)) {
          this.constructPhysicsBody(el);
        }
        for (var i = 0, len = el.children.length; i < len; ++i) {
          this.recursiveDescend(el.children[i], fn);
        }
      },
    },

    updateBody: {
      value: function(body) {
        body.el.setAttribute('position', body.position);
        if (body.el.tagName !== 'VR-GRID') {
          body.el.setAttribute('rotation',
            this.quatToRotationAttribute(body.quaternion));
        }
      },
    },

    update: {
      value: function(t) {
        this.world.step(1/60);
        this.debug.update();
        this.world.bodies.forEach(this.updateBody.bind(this));
      },
    },
  }),
});
