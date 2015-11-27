var coordinates = require('../utils/coordinates');
var registerComponent = require('../core/register-component').registerComponent;
var THREE = require('../../lib/three');

module.exports.Component = registerComponent('spawner', {
  init: {
    value: function () {
      // preemptive binding
      this.spawn = this.spawn.bind(this);
    }
  },

  update: {
    value: function () {
      var el = this.el;
      var data = this.data;
      this.translation = coordinates.parse(data.position);
      if (this.on === this.data.on) { return; }
      el.removeEventListener(this.on, this.spawn);
      el.addEventListener(this.data.on, this.spawn);
      this.on = this.data.on;
    }
  },

  spawn: {
    value: function () {
      var el = this.el;
      var matrixWorld = el.object3D.matrixWorld;
      var position = new THREE.Vector3();
      position.setFromMatrixPosition(matrixWorld);
      var entity = document.createElement('a-entity');
      entity.setAttribute('position', position);
      entity.setAttribute('mixin', this.data.mixin);
      el.sceneEl.appendChild(entity);
    },
    writable: true
  }
});
