var registerComponent = require('../core/register-component');
var VRUtils = require('../vr-utils');
var THREE = require('../../lib/three');

var defaults = {
  size: 5,
  radius: 200,
  tube: 10,
  segments: 32
};

module.exports.Component = registerComponent('geometry', {
  update: {
    value: function () {
      this.setupGeometry();
    }
  },

  setupGeometry: {
    value: function () {
      var data = this.data;
      var primitive = data.primitive;
      var geometry;
      var radius;
      var width;
      var height;
      var depth;
      var object3D = this.el.getObject3D('Mesh');
      switch (primitive) {
        case 'grid':
          object3D = this.el.getObject3D('LineSegments');
          geometry = this.setupGridGeometry();
          break;
        case 'box':
          width = data.width || defaults.size;
          height = data.height || defaults.size;
          depth = data.depth || defaults.size;
          geometry = new THREE.BoxGeometry(width, height, depth);
          break;
        case 'sphere':
          radius = data.radius || defaults.size;
          geometry = new THREE.SphereGeometry(radius, defaults.segments, defaults.segments);
          break;
        case 'plane':
          width = data.width || defaults.size;
          height = data.height || defaults.size;
          geometry = new THREE.PlaneGeometry(width, height, 1, 1);
          break;
        case 'torus':
          radius = data.radius || defaults.radius;
          var tube = data.tube || defaults.tube;
          geometry = new THREE.TorusGeometry(radius, tube);
          break;
        default:
          geometry = new THREE.Geometry();
          VRUtils.warn('Primitive type not supported');
          break;
      }
      object3D.geometry = geometry;
    }
  },

  setupGridGeometry: {
    value: function () {
      var size = this.data.size || 14;
      var density = this.data.density || 1;

      // Grid
      var geometry = new THREE.Geometry();

      for (var i = -size; i <= size; i += density) {
        geometry.vertices.push(new THREE.Vector3(-size, -0.04, i));
        geometry.vertices.push(new THREE.Vector3(size, -0.04, i));

        geometry.vertices.push(new THREE.Vector3(i, -0.04, -size));
        geometry.vertices.push(new THREE.Vector3(i, -0.04, size));
      }

      return geometry;
    }
  }
});
