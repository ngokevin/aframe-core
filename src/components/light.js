var registerComponent = require('../core/register-component');
var VRUtils = require('../vr-utils');
var THREE = require('../../lib/three');

var defaults = {
  color: 0xffffff,
  direction: {x: 0, y: 0, z: 0},
  intensity: 1.0,
  position: {x: 0, y: 0, z: 0}
};

var _id = 1;

/**
 * Light component.
 * Passes up light attributes to the vr-object.
 * Along with pos/rot/scale, vr-object will pass the light to vr-scene.
 * vr-scene will keep track of all the lights, and handle updating materials.
 *
 * To support PBR, currently not using three.js lights. PBR materials are not
 * yet officially implemented by three.js.
 *
 * @param {string} color - light color.
 * @param {string} direction - light vector (e.g., `10 5 -10`).
 * @param {number} intensity - light strength.
 */
module.exports.Component = registerComponent('light', {
  update: {
    value: function () {
      if (!this.data) { return; }

      // Give the light an ID so the scene can keep track of this light and
      // make changes in-place.
      this._id = this._id || _id++;

      var color = new THREE.Color(this.data.color || defaults.color);

      // Tell light component's entity to tell scene to update the light.
      this.el.registerLight({
        _id: this._id,
        color: new THREE.Vector3(color.r, color.g, color.b),
        direction: VRUtils.parseAttributeString(
          'direction', this.data.direction, defaults.direction),
        position: VRUtils.parseAttributeString(
          'position', this.data.position, defaults.position),
        intensity: this.data.intensity || defaults.intensity
      });
    }
  }
});
