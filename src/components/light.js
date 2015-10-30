var registerComponent = require('../core/register-component').registerComponent;
var THREE = require('../../lib/three');

/**
 * Light component.
 *
 * @namespace light
 * @param {number} [angle=PI / 3] - Maximum extent of light from its direction,
          in radians. For spot lights.
 * @param {bool} [cast=false] - Whether light will cast shadows.
          Only applies to directional, point, and spot lights.
 * @param {string} [color=#FFF] - Light color. For every light.
 * @param {number} [decay=1] - Amount the light dims along the distance of the
          light. For point and spot lights.
 * @param {number} [exponent=10.0] - Rapidity of falloff of light from its
          target direction. For spot lights.
 * @param {string} [groundColor=#FFF] - Ground light color.
          For hemisphere lights.
 * @param {number} [intensity=1.0] - Light strength.
          For every light except ambient.
 * @param {number} [shadowBias=0] - How much to add or subtract from the
          normalized depth when deciding whether a surface is in shadow.
 * @param {number} [shadowCameraFar=5000] - Orthographic shadow camera frustum
          parameter.
 * @param {number} [shadowCameraNear=50] - Orthographic shadow camera frustum
          parameter.
 * @param {number} [shadowDarkness=0.5] - Darkness of shadow cast, from 0 to 1.
 * @param {number} [shadowMapHeight=512] - Shadow map texture height in pixels.
 * @param {number} [shadowMapWidth=512] - Shadow map texture height in pixels.
 * @param {string} [type=directional] - Light type (i.e., ambient, directional,
          hemisphere, point, spot).
 */
module.exports.Component = registerComponent('light', {
  defaults: {
    value: {
      angle: Math.PI / 3,
      castShadow: false,
      color: '#FFF',
      groundColor: '#FFF',
      decay: 1,
      distance: 0.0,
      exponent: 10.0,
      intensity: 1.0,
      shadowBias: 0,
      shadowCameraFar: 5000,
      shadowCameraFov: 50,
      shadowCameraNear: 50,
      shadowDarkness: 0.5,
      shadowMapHeight: 512,
      shadowMapWidth: 512,
      type: 'directional'
    }
  },

  init: {
    value: function () {
      var el = this.el;
      this.light = this.getLight();
      el.object3D.add(this.light);
      el.sceneEl.registerLight(el);
    }
  },

  update: {
    value: function () {
      var el = this.el;
      el.object3D.remove(this.light);
      this.light = this.getLight();
      el.object3D.add(this.light);
    }
  },

  /**
   * Creates a new three.js light object given the current attributes of the
   * component.
   *
   * @namespace light
   */
  getLight: {
    value: function () {
      var data = this.data;
      var color = new THREE.Color(data.color).getHex();
      var intensity = data.intensity;
      var type = data.type;

      if (type) {
        type = type.toLowerCase();
      }
      switch (type) {
        case 'ambient': {
          return new THREE.AmbientLight(color);
        }
        case 'directional': {
          return this.setShadow(new THREE.DirectionalLight(color, intensity));
        }
        case 'hemisphere': {
          return new THREE.HemisphereLight(color, data.groundColor,
                                           intensity);
        }
        case 'point': {
          return this.setShadow(
            new THREE.PointLight(color, intensity, data.distance, data.decay));
        }
        case 'spot': {
          return this.setShadow(
            new THREE.SpotLight(color, intensity, data.distance, data.angle,
                                data.exponent, data.decay));
        }
        default: {
          return new THREE.AmbientLight(color);
        }
      }
    }
  },

  /**
   * Copy over shadow-related data from the component onto the light.
   *
   * @param {object} light
   */
  setShadow: {
    value: function (light) {
      var data = this.data;
      if (!this.data.castShadow) { return light; }
      [
        'castShadow',
        'shadowCameraNear',
        'shadowCameraFar',
        'shadowCameraFov',
        'shadowDarkness',
        'shadowMapHeight',
        'shadowMapWidth'
      ].forEach(function (shadowAttr) {
        light[shadowAttr] = data[shadowAttr];
      });
      return light;
    }
  }
});
