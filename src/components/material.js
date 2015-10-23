var registerComponent = require('../core/register-component').registerComponent;
var pbrFragmentShader = require('../shaders/pbrFragment.glsl');
var pbrVertexShader = require('../shaders/pbrVertex.glsl');
var THREE = require('../../lib/three');

var MATERIAL_TYPE__PBR = 'ShaderMaterial';
var MATERIAL_TYPE__TEXTURE = 'MeshBasicMaterial';

var id = 1;

/**
 * Material component.
 *
 * Currently, hardcoded to use Physically-Based Rendering (PBR).
 * Our PBR shaders have been adapted from code online to be able to handle
 * non-hard-coded lighting.
 *
 * @params {string} color
 * @params {number} metallic
 * @params {number} roughness
 * @namespace material
 */
module.exports.Component = registerComponent('material', {
  defaults: {
    value: {
      color: 'red',
      metallic: 0.0,
      roughness: 0.5
    }
  },

  init: {
    value: function () {
      this.id = this.id || id++;
      this.ambientLights = [];
      this.directedLights = [];

      // Initialize material.
      this.el.object3D.material = this.getMaterial();

      // Register material to the scene to subscribe to light updates.
      this.el.sceneEl.registerMaterial(this.id, this);
    }
  },

  /**
   * Material updated.
   * TODO: be able to find out what attribute is being changed.
   */
  update: {
    value: function () {
      var self = this;
      var material = self.el.object3D.material;

      // Material type changed. Recreate material. Should we support this?
      if (material.type === MATERIAL_TYPE__TEXTURE && !self.data.src ||
          material.type === MATERIAL_TYPE__PBR && self.data.src) {
        self.el.object3D.material = self.getMaterial();
      }

      // Update PBR uniform if material is PBR.
      if (material.type === MATERIAL_TYPE__PBR) {
        var newUniform = self.getPBRUniforms();
        Object.keys(newUniform).forEach(function (key) {
          if (material.uniforms[key] !== newUniform[key]) {
            material.uniforms[key] = newUniform[key];
            material.needsUpdate = true;
          }
        });
      }
    }
  },

  /**
   * Store updated lights (ambient vs. directed lights separately).
   * Not used for texture materials.
   * If the number of lights changed, recreate material.
   * Else just update the material.
   *
   * @params (array) lights - array of light objects.
   */
  updateLights: {
    value: function (lights) {
      // Update stored lights.
      var oldNumDirectedLights = this.directedLights.length;
      var ambientLights = this.ambientLights = [];
      var directedLights = this.directedLights = [];
      lights.forEach(function (light) {
        if (light.type === 'ambient') { return ambientLights.push(light); }
        directedLights.push(light);
      });

      if (oldNumDirectedLights === directedLights.length) {
        // Attributes of lights changed, update uniforms.
        this.update();
      } else {
        // Number of lights changed, recompile shader.
        this.el.object3D.material = this.getMaterial();
      }
    }
  },

  /*
   * Determines which type of material to create.
   *
   * @returns material {object} depending on whether there is a texture.
   */
  getMaterial: {
    value: function () {
      var currentMaterial = this.el.object3D.material;
      var url = this.data.url;
      var isPBR = currentMaterial && currentMaterial.type === MATERIAL_TYPE__PBR;
      if (url) { return this.getTextureMaterial(); }
      if (isPBR) { return currentMaterial; }
      return this.getPBRMaterial();
    }
  },

  /**
   * Creates a new material object for handling textures.
   *
   * @returns {object} material - three.js MeshBasicMaterial.
   */
  getTextureMaterial: {
    value: function () {
      var texture = THREE.ImageUtils.loadTexture(this.data.url);
      var material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide
      });
      material.map = texture;
      return material;
    }
  },

  /**
   * Creates a new PBR material object.
   *
   * @returns {object} material - three.js ShaderMaterial.
   */
  getPBRMaterial: {
    value: function () {
      return new THREE.ShaderMaterial({
        vertexShader: pbrVertexShader(),
        fragmentShader: pbrFragmentShader({
          // Keep this param > 1 since GLSL won't allow arrays w/ length=0.
          lightArraySize: this.directedLights.length || 1
        }),
        uniforms: this.getPBRUniforms()
      });
    }
  },

  /**
   * Builds uniforms object given component attributes to pass into shaders.
   *
   * @returns {object} uniforms - shader uniforms.
   */
  getPBRUniforms: {
    value: function () {
      var ambientLights;
      var materialColor = colorToVector3(this.data.color);

      var uniforms = {
        baseColor: {
          type: 'v3',
          value: materialColor
        },
        metallic: {
          type: 'f',
          value: this.data.metallic
        },
        roughness: {
          type: 'f',
          value: this.data.roughness
        },
        uvScale: {
          type: 'v2',
          value: new THREE.Vector2(1.0, 1.0)
        }
      };

      // Add ambient lights to uniform. We can compute its contributions here.
      ambientLights = this.ambientLights.map(function (ambientLight) {
        return ambientLight.color;
      });
      uniforms.ambientLight = {
        type: 'v3',
        value: calculateAmbientLight(ambientLights, materialColor)
      };

      // Add directed lights to uniform.
      if (this.directedLights.length) {
        uniforms.lightColors = {
          type: '3fv',
          value: flattenVector3Array(
            this.directedLights.map(function (light) {
              return light.color;
            })
          )
        };
        uniforms.lightDirections = {
          type: '3fv',
          value: flattenVector3Array(
            this.directedLights.map(function (light) {
              return light.direction;
            })
          )
        };
        uniforms.lightIntensities = {
          type: 'iv1',
          value: this.directedLights.map(function (light) {
            // TODO: accept floats (e.g., 1.0), but JS keeps changing 1.0 -> 1.
            return Math.round(light.intensity);
          })
        };
        uniforms.lightPositions = {
          type: '3fv',
          value: flattenVector3Array(
            this.directedLights.map(function (light) {
              return light.position;
            })
          )
        };
      }

      // Add cubemap for reflections to uniform.
      // TODO: allow user to specify their own cubemap.
      for (var i = 0; i < 6; i++) {
        // See computeEnvColor() for explanation of cubemap.
        var path = '/examples/_images/pbr/maskonaive_m0' + i + '_c0';
        var format = '.png';
        var urls = [
          path + '0' + format, path + '1' + format,
          path + '2' + format, path + '3' + format,
          path + '4' + format, path + '5' + format
        ];
        var cubeMapMip = THREE.ImageUtils.loadTextureCube(urls);
        cubeMapMip.format = THREE.RGBFormat;

        uniforms['envMap' + i] = {
          type: 't',
          value: cubeMapMip
        };
      }

      return uniforms;
    }
  }
});

/**
 * Calculates (diffuse) ambient light given the material diffuse color.
 *
 * @param {array} ambientLights - ambient lights, as array of Vector3s.
 * @param {object} materialColor - material base color, as Vector3.
 * @returns {object} total ambient light, as Vector3.
 */
function calculateAmbientLight (ambientLights, materialColor) {
  var totalAmbientLight = new THREE.Vector3(0.0);
  ambientLights.forEach(function (ambientLight) {
    totalAmbientLight.add(ambientLight.clone().multiply(materialColor));
  });
  return totalAmbientLight;
}

/**
 * Converts color to a Vector3.
 *
 * @param {string} colorStr - color, most formats supported.
 * @returns {object} vector3 representation of color (r, g, b).
 */
function colorToVector3 (colorStr) {
  var color = new THREE.Color(colorStr);
  return new THREE.Vector3(color.r, color.g, color.b);
}

/**
 * Flattens an array of three-dimensional vectors into a single array.
 * Used to pass multiple vectors into the shader program using type 3fv.
 *
 * @param {array} vector3s - array of THREE.Vector3, the `s` denotes plural.
 * @returns {array} float values.
 */
function flattenVector3Array (vector3s) {
  var arr = [];
  vector3s.forEach(function (vector3) {
    arr = arr.concat([vector3.x, vector3.y, vector3.z]);
  });
  return arr;
}
