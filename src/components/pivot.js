var coordinateParser = require('../utils/coordinate-parser');
var registerComponent = require('../core/register-component').registerComponent;
var THREE = require('../../lib/three');
var utils = require('../utils');

var helperMatrix = new THREE.Matrix4();

/**
 * Pivot component by translating vertices.
 *
 * pivot="-1 0 0"
 *
 * @param New pivot point as a position relative to the entity.
 */
var proto = {
  defaults: {
    value: {
      x: 0,
      y: 0,
      z: 0
    }
  },

  /**
   * We store the current pivot in case we need to negate it on updates.
   */
  init: {
    value: function () {
      this.pivot = this.defaults;
    }
  },

  /**
   * Updates the pivot point by negating the current pivot and then applying the new pivot.
   */
  update: {
    value: function () {
      var data = this.data;
      var pivot = this.pivot;
      this.transform(data.x - pivot.x, data.y - pivot.y, data.z - pivot.z);
      this.pivot = this.data;
    }
  },

  /**
   * Negate vertex translation on remove (callback).
   */
  remove: {
    value: function () {
      var pivot = this.pivot;
      this.transform(-1 * pivot.x, -1 * pivot.y, -1 * pivot.z);
    }
  },

  /**
   * Applies the transform to the geometry, then triggers an update to its vertices.
   * Note that transformations are relative to the current transformation.
   */
  transform: {
    value: function (x, y, z) {
      var object3D = this.el.object3D;
      var translation = helperMatrix.makeTranslation(x, y, z);
      object3D.geometry.applyMatrix(translation);
      object3D.geometry.verticesNeedsUpdate = true;
    }
  }
};

utils.extend(proto, coordinateParser);
module.exports.Component = registerComponent('pivot', proto);
