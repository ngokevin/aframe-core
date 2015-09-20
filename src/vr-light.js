require('./vr-register-element');

var THREE = require('../lib/three');
var VRObject = require('./core/vr-object');

var DEFAULTS = {
  angle: Math.PI / 3,
  color: '#CCC',
  decay: 1,
  distance: 0.0,
  exponent: 10.0,
  intensity: 1.0
};

/**
 * VR light component.
 *
 * @prop {String} type Type of light (i.e., ambient, directional, hemisphere,
 * point, or spot). Defaults to ambient.
 *
 * @namespace vr-light
 * @see {@link http://threejs.org/docs/#Reference/Lights/|three.js Lights}
 */
module.exports = document.registerElement(
  'vr-light',
  {
    prototype: Object.create(
      VRObject.prototype, {
        /**
         * vr-light overrides createdCallback to a no-op in order to defer
         * initialization to attachedCallback.
         *
         * @namespace vr-light
         */
        createdCallback: {
          value: function () { }
        },

        /**
         * vr-light initializes on attachedCallback as opposed to
         * createdCallback because the number and type of lights are difficult
         * to adjust at runtime. This allows us to create lights with
         * document.createElement and set attributes on them without
         * initializing too early.
         *
         * @namespace vr-light
         */
        attachedCallback: {
          value: function () {
            this.object3D = this.getLight();
            this.load();
            this.addToParent();
          }
        },

        /**
         * vr-light's attributeChanged callback will set the new values on the
         * existing three.js light object. Note that when changing the type of
         * light at runtime with WebGLRenderer, the scene will need to trigger
         * an update to materials in order for the change to be reflected.
         *
         * @namespace vr-light
         * @see {@link
         *   https://github.com/mrdoob/three.js/wiki/Updates#materials |
         *   three.js updates}
         */
        attributeChangedCallback: {
          value: function (attr, oldVal, newVal) {
            if (!attr) { return; }

            if (attr === 'type') {
              // Convert to three.js's light type name if type changed.
              newVal = {
                ambient: 'AmbientLight',
                directional: 'DirectionalLight',
                hemisphere: 'HemisphereLight',
                point: 'PointLight',
                spot: 'SpotLight'
              }[newVal];
            }
            if (['color', 'groundcolor'].indexOf(attr) !== -1) {
              // Format color.
              newVal = new THREE.Color(newVal);
            }
            if (attr === 'groundcolor') {
              // Convert HTML lowercase attribute to camelCase for three.js.
              attr = 'groundColor';
            }

            this.object3D[attr] = newVal;
          }
        },

        /**
         * Gets the maximum extent of the spotlight, in radians, from its
         * direction. Used by spot lights.
         *
         * @default PI / 3
         * @returns {Number}
         * @namespace vr-light
         */
        getAngle: {
          value: function () {
            return this.getAttribute('angle', DEFAULTS.angle);
          }
        },

        /**
         * Gets the color of the light component. Used by all types of light.
         * Note that color will be used as the skyColor for hemisphere lights.
         *
         * @default #CCC
         * @returns {Object} three.js Color
         * @namespace vr-light
         */
        getColor: {
          value: function () {
            return new THREE.Color(this.getAttribute('color', DEFAULTS.color));
          }
        },

        /**
         * Gets the amount the light dims along the distance of the light
         * component. Used by point lights and spot lights.
         *
         * @default 1
         * @returns {Number}
         * @namespace vr-light
         */
        getDecay: {
          value: function () {
            return this.getAttribute('decay', DEFAULTS.decay);
          }
        },

        /**
         * Gets the maximum distance from the origin where the light component
         * will shine whose intensity is attenuated linearly based on distance
         * from origin. Used by point lights and spot lights.
         *
         * @default 0.0
         * @returns {Number}
         * @namespace vr-light
         */
        getDistance: {
          value: function () {
            return this.getAttribute('distance', DEFAULTS.distance);
          }
        },

        /**
         * Gets the rapidity of the falloff of the light component from its
         * target direction. Used by spot lights.
         *
         * @default 10.0
         * @returns {Number}
         * @namespace vr-light
         */
        getExponent: {
          value: function () {
            return this.getAttribute('exponent', DEFAULTS.exponent);
          }
        },

        /**
         * Gets the ground color. Used by hemisphere lights.
         *
         * @default #CCC
         * @returns {Object} three.js Color
         * @namespace vr-light
         */
        getGroundcolor: {
          value: function () {
            return new THREE.Color(this.getAttribute('groundcolor',
                                                     DEFAULTS.color));
          }
        },

        /**
         * Gets the light's strength or intensity. Used by directional,
         * hemisphere, point, and spot lights.
         *
         * @default 1.0
         * @returns {Number}
         * @namespace vr-light
         */
        getIntensity: {
          value: function () {
            return this.getAttribute('intensity', DEFAULTS.intensity);
          }
        },

        /**
         * Creates a three.js light object given the current attributes of the
         * component.
         *
         * @namespace vr-light
         */
        getLight: {
          value: function () {
            var type = this.getAttribute('type');
            if (type) {
              type = type.toLowerCase();
            }
            switch (type) {
              case 'ambient': {
                return new THREE.AmbientLight(this.getColor());
              }
              case 'directional': {
                return new THREE.DirectionalLight(
                  this.getColor(), this.getIntensity());
              }
              case 'hemisphere': {
                return new THREE.HemisphereLight(
                  this.getColor(), this.getGroundcolor(), this.getIntensity());
              }
              case 'point': {
                return new THREE.PointLight(
                  this.getColor(), this.getIntensity(), this.getDistance(),
                  this.getDecay());
              }
              case 'spot': {
                return new THREE.SpotLight(
                  this.getColor(), this.getIntensity(), this.getDistance(),
                  this.getAngle(), this.getExponent(), this.getDecay());
              }
              default: {
                return new THREE.AmbientLight(this.getColor());
              }
            }
          }
        }
      }
    )
  }
);
