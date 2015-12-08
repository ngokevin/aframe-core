var registerComponent = require('../core/register-component').registerComponent;
var THREE = require('../../lib/three');
var utils = require('../utils/');

module.exports.Component = registerComponent('cursor', {
  schema: {
    value: {
      timeout: { default: 1500, min: 0 },
      maxDistance: { default: 5, min: 0 },
      fuse: { default: false }
    }
  },

  dependencies: {
    value: [ 'raycaster' ]
  },

  init: {
    value: function () {
      var el = this.el;
      this.raycaster = el.components.raycaster;
      // The cursor defaults to fuse in mobile environments
      this.schema.fuse.default = utils.isMobile();
      this.attachEventListeners();
    }
  },

  attachEventListeners: {
    value: function () {
      var el = this.el;
      var canvas = el.sceneEl.canvas;

      canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
      canvas.addEventListener('mouseup', this.onMouseUp.bind(this));

      el.addEventListener('intersection', this.onIntersection.bind(this));
      el.addEventListener('intersectioncleared', this.onIntersectionCleared.bind(this));
    }
  },

  onMouseDown: {
    value: function (evt) {
      this.emit('mousedown');
      this.mouseDownEl = this.intersectedEl;
    }
  },

  onMouseUp: {
    value: function () {
      this.emit('mouseup');
      if (this.data.fuse) { return; }
      if (!this.intersectedEl) { return; }
      if (this.mouseDownEl === this.intersectedEl) {
        this.emit('click');
      }
    }
  },

  emit: {
    value: function (evt) {
      var intersectedEl = this.intersectedEl;
      this.el.emit(evt);
      if (intersectedEl) { intersectedEl.emit(evt); }
    }
  },

  emitter: {
    value: function (evt) {
      return function () {
        this.emit(evt);
      }.bind(this);
    }
  },

  onIntersection: {
    value: function (evt) {
      var self = this;
      var data = this.data;
      var el = evt.detail.el;
      var distance = evt.detail.data.distance;
      if (distance >= this.data.maxDistance) { return; }
      if (this.intersectedEl === el) {
        this.moveToDepth(distance, evt.detail.data.point);
        return;
      }
      this.intersectedEl = el;
      el.addState('hovered');
      el.emit('mouseenter');
      this.el.addState('hovering');
      this.moveToDepth(distance, evt.detail.data.point, evt.detail.data.face.normal);
      if (data.timeout === 0) { return; }
      if (!data.fuse) { return; }
      this.el.addState('fusing');
      this.fuseTimeout = setTimeout(fuse, data.timeout);
      function fuse () {
        self.el.removeState('fusing');
        self.emit('click');
      }
    }
  },

  moveToDepth: {
    value: function (distance, point) {
      var el = this.el;
      var object3D = el.object3D;
      var vector = new THREE.Vector3();
      var elPosition = el.getComputedAttribute('position');
      if (!this.elPosition) { this.elPosition = elPosition; }
      object3D.parent.updateMatrixWorld();
      vector.setFromMatrixPosition(object3D.matrixWorld);
      distance = point.sub(vector);
      el.setAttribute('position', {
        x: elPosition.x,
        y: elPosition.y,
        z: elPosition.z + distance.z + 0.4
      });
    }
  },

  onIntersectionCleared: {
    value: function (evt) {
      var el = evt.detail.el;
      var elPosition = this.elPosition;
      if (!el || !this.intersectedEl) { return; }
      this.intersectedEl = null;
      el.removeState('hovered');
      el.emit('mouseleave');
      this.el.setAttribute('position', {
        x: elPosition.x,
        y: elPosition.y,
        z: elPosition.z
      });
      this.elPosition = undefined;
      this.el.removeState('hovering');
      this.el.removeState('fusing');
      clearTimeout(this.fuseTimeout);
    }
  }
});
