var registerComponent = require('../core/register-component');
var pbrFragmentShader = require('../shaders/pbrFragment.glsl');
var pbrVertexShader = require('../shaders/pbrVertex.glsl');
var THREE = require('../../lib/three');

var defaults = {
  color: 0xffffff,
  light: {
    // TODO: initialize the default light somewhere else.
    color: new THREE.Vector3(1, 1, 1),
    direction: new THREE.Vector3(),
    position: new THREE.Vector3(),
    intensity: 1.0,
    type: 'point'
  },
  metallic: 0.5,
  roughness: 0.5
};

var _id = 1;

/**
 * Material component.
 *
 * Currently, hard-coded to use Physically-Based Rendering (PBR).
 * Our PBR shaders have been adapted from code online to be able to handle
 * non-hard-coded lighting.
 *
 * @params {string} color
 * @params {float} metallic
 * @params {float} roughness
 * @params {string} type - ambient, directional, or point.
 * @namespace material
 */
module.exports.Component = registerComponent('material', {
  init: {
    value: function () {
      this.setupMaterial();
    }
  },

  update: {
    value: function () {
      this._id = this._id || _id++;

      this.lights = this.lights || [defaults.light];
      this.el.object3D.material = this.getMaterial();

      // Register material to the scene to subscribe to light updates.
      this.el.sceneEl.registerMaterial(this._id, this);
    }
  },

  updateLights: {
    value: function (lights) {
      this.lights = lights || [defaults.light];
      this.el.object3D.material = this.getMaterial();
    }
  },

  getMaterial: {
    value: function () {
      // Format baseColor to a vector.
      var color = new THREE.Color(this.data.color || defaults.color);
      color = new THREE.Vector3(color.r, color.g, color.b);

      var shaderMaterial = {
        vertexShader: pbrVertexShader(),
        fragmentShader: pbrFragmentShader({
          lightArraySize: this.lights.length || 1
        }),
        uniforms: {
          baseColor: {
            type: 'v3',
            value: color
          },
          metallic: {
            type: 'f',
            value: this.data.metallic || defaults.metallic
          },
          roughness: {
            type: 'f',
            value: this.data.roughness || defaults.roughness
          },
          uvScale: {
            type: 'v2',
            value: new THREE.Vector2(1.0, 1.0)
          }
        }
      };

      // Add lights to uniform.
      if (this.lights.length) {
        shaderMaterial.uniforms.lightColors = {
          type: '3fv',
          value: _flattenVector3Array(
            this.lights.map(function (light) {
              return light.color;
            })
          )
        };
        shaderMaterial.uniforms.lightDirections = {
          type: '3fv',
          value: _flattenVector3Array(
            this.lights.map(function (light) {
              return light.direction;
            })
          )
        };
        shaderMaterial.uniforms.lightIntensities = {
          // TODO: accept floats (e.g., 1.0).
          type: 'iv1',
          value: this.lights.map(function (light) {
            return light.intensity;
          })
        };
        shaderMaterial.uniforms.lightPositions = {
          type: '3fv',
          value: _flattenVector3Array(
            this.lights.map(function (light) {
              return light.position;
            })
          )
        };
      }

      /*
      console.log(shaderMaterial);
      shaderMaterial.uniforms.lightColors.value = [50, 50, 50];
      shaderMaterial.uniforms.lightDirections.value = [0.4, 0.2, 0.2];
      shaderMaterial.uniforms.lightIntensities.value = [10];
      shaderMaterial.uniforms.lightPositions.value = [0.4, 0.2, 0.2];
      */

      // Add cubemap for reflections to uniform.
      // TODO: allow user to specify their own cubemap.
      for (var i = 0; i < 6; i++) {
        // See ComputeEnvColor() for explanation of cubemap.
        var path = 'images/pbr/maskonaive_m0' + i + '_c0';
        var format = '.png';
        var urls = [
          path + '0' + format, path + '1' + format,
          path + '2' + format, path + '3' + format,
          path + '4' + format, path + '5' + format
        ];
        var cubeMapMip = THREE.ImageUtils.loadTextureCube(urls);
        cubeMapMip.format = THREE.RGBFormat;

        shaderMaterial.uniforms['envMap' + i] = {
          type: 't',
          value: cubeMapMip
        };
      }

      return new THREE.ShaderMaterial(shaderMaterial);
    }
  }
});

/**
 * Flattens an array of three-dimensional vectors into a single array.
 * Used to pass multiple vectors into the shader program using type 3fv.
 *
 * @param {array} vector3s - array of THREE.Vector3, the `s` denotes plural.
 * @returns {array} arr - array of float values.
 */
function _flattenVector3Array(vector3s) {
  var arr = [];
  vector3s.forEach(function (vector3) {
    arr = arr.concat([vector3.x, vector3.y, vector3.z]);
  });
  return arr;
}
