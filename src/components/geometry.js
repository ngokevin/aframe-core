var registerComponent = require('../core/register-component').registerComponent;
var THREE = require('../../lib/three');
var VRUtils = require('../vr-utils');

/**
 * Geometry component. Combined with material component to make mesh in
 * 3D object.
 *
 * @param {number}  [depth=5]
 * @param {number}  [height=5]
 * @param {boolean} [open-ended=false]
 * @param {number}  [p=2] - coprime of q that helps define torus knot.
 * @param {number}  [primitive=null] - type of shape (e.g., box, sphere).
 * @param {number}  [q=3] - coprime of p that helps define torus knot.
 * @param {number}  [radius=5]
 * @param {number}  [radius-inner=5]
 * @param {number}  [radius-outer=7]
 * @param {number}  [segments=32]
 * @param {number}  [segments-height=18]
 * @param {number}  [segments-phi=8]
 * @param {number}  [segments-radius=36]
 * @param {number}  [segments-theta=8]
 * @param {number}  [segments-tubular=8]
 * @param {number}  [segments-width=36]
 * @param {number}  [theta-length=6.3]
 * @param {number}  [theta-start=0]
 * @param {number}  [tube=2]
 * @param {number}  [width=5]
 */
module.exports.Component = registerComponent('geometry', {
  defaults: {
    value: {
      'depth': 5,
      'height': 5,
      'open-ended': false,
      'p': 2,
      'primitive': null,
      'q': 3,
      'radius': 5,
      'radius-inner': 5,
      'radius-outer': 7,
      'segments': 32,
      'segments-height': 18,
      'segments-phi': 8,
      'segments-radius': 36,
      'segments-theta': 8,
      'segments-tubular': 8,
      'segments-width': 36,
      'theta-length': 6.3,
      'theta-start': 0,
      'tube': 2,
      'width': 5
    }
  },

  update: {
    value: function () {
      this.el.object3D.geometry = this.getGeometry();
    }
  },

  getGeometry: {
    value: function () {
      var data = this.data;
      var primitive = (data.primitive || '').toLowerCase();

      var depth = data.depth;
      var height = data.height;
      var openEnded = data['open-ended'];
      var radius = data.radius;
      var radiusInner = data['radius-inner'];
      var radiusOuter = data['radius-outer'];
      var segments = data.segments;
      var segmentsHeight = data['segments-height'];
      var segmentsPhi = data['segments-phi'];
      var segmentsRadius = data['segments-radius'];
      var segmentsTheta = data['segments-theta'];
      var segmentsTubular = data['segments-tubular'];
      var segmentsWidth = data['segments-width'];
      var thetaLength = data['theta-length'];
      var thetaStart = data['theta-start'];
      var tube = data.tube;
      var width = data.width;

      var radiusBottom = radius;
      if ('radius-bottom' in data) {
        radiusBottom = parseFloat(data['radius-bottom']);
      }

      var radiusTop = radius;
      if ('radius-top' in data) {
        radiusTop = parseFloat(data['radius-top']);
      }

      switch (primitive) {
        case 'box': {
          return new THREE.BoxGeometry(width, height, depth);
        }
        case 'circle': {
          return new THREE.CircleGeometry(
            radius, segments, thetaStart, thetaLength);
        }
        case 'cylinder': {
          return new THREE.CylinderGeometry(
            radiusTop, radiusBottom, height, segmentsRadius,
            segmentsHeight, openEnded, thetaStart,
            thetaLength);
        }
        case 'plane': {
          return new THREE.PlaneBufferGeometry(width, height);
        }
        case 'ring': {
          return new THREE.RingGeometry(
            radiusInner, radiusOuter, segmentsTheta,
            segmentsPhi, thetaStart, thetaLength);
        }
        case 'sphere': {
          return new THREE.SphereGeometry(
            radius, segmentsWidth, segmentsHeight);
        }
        case 'torus': {
          return new THREE.TorusGeometry(
            radius, tube, segments, segments);
        }
        case 'torusknot': {
          return new THREE.TorusKnotGeometry(
            radius, tube, segments, segmentsTubular,
            data.p, data.q);
        }
        default: {
          VRUtils.warn('Primitive type not supported: %s', primitive);
          return new THREE.Geometry();
        }
      }
    }
  }
});
