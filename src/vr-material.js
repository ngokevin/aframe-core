require('./vr-register-element');

var THREE = require('../lib/three');
var VRNode = require('./core/vr-node');

var DEFAULTS = {
  color: '#CCC',
  metallic: 0.5,
  lightIntensity: 7.001,
  roughness: 1.0
};

module.exports = document.registerElement(
  'vr-material',
  {
    prototype: Object.create(
      VRNode.prototype, {
        createdCallback: {
          value: function () {}
        },

        attachedCallback: {
          value: function () {
            this.shaderType = '';
            this.material = this.getMaterial();
            this.load();
          }
        },

        attributeChangedCallback: {
          value: function (attr, oldVal, newVal) {
            if (!newVal) { return; }

            if (attr === 'color') {
              newVal = new THREE.Color(newVal);
            }

            if (this.shaderType === 'pbr') {
              // Update PBR material.
              if (attr === 'color') {
                attr = 'baseColor';
                newVal = new THREE.Vector3(newVal.r, newVal.g, newVal.b);
              }
              this.material.uniforms[attr].value = newVal;
            } else {
              // Update three.js material.
              var attrWhitelist = ['color', 'shininess', 'specular'];
              if (attrWhitelist.indexOf(attr) !== -1) {
                this.material[attr] = newVal;
              }
            }
          }
        },

        getColor: {
          value: function () {
            return new THREE.Color(this.getAttribute('color', DEFAULTS.color));
          }
        },

        getLightIntensity: {
          value: function () {
            return this.getAttribute('intensity', DEFAULTS.lightIntensity);
          }
        },

        getMetallic: {
          value: function () {
            return this.getAttribute('metallic', DEFAULTS.metallic);
          }
        },

        getRoughness: {
          value: function () {
            return this.getAttribute('roughness', DEFAULTS.roughness);
          }
        },

        getSpecular: {
          value: function () {
            return this.getAttribute('specular', DEFAULTS.color);
          }
        },

        getMaterial: {
          value: function () {
            var shaderType = this.getAttribute('shader');
            if (shaderType) {
              shaderType = shaderType.toLowerCase();
            }
            this.shaderType = shaderType;

            switch (shaderType) {
              case 'basic': {
                return new THREE.MeshBasicMaterial({
                  color: this.getColor()
                });
              }
              case 'phong': {
                return new THREE.MeshPhongMaterial({
                  color: this.getColor(),
                  specular: this.getSpecular()
                });
              }
              case 'lambert': {
                return new THREE.MeshLambertMaterial({
                  color: this.getColor()
                });
              }
              default: {
                // Default to PBR.
                this.shaderType = 'pbr';
                return this.getPBRMaterial({
                  color: this.getColor(),
                  lightIntensity: this.getLightIntensity(),
                  metallic: this.getMetallic(),
                  roughness: this.getRoughness()
                });
              }
            }
          }
        },

        getPBRMaterial: {
          value: function (params) {
            // See comments of the function ComputeEnvColor for the
            // explanations on this hug number of cubemaps.
            // Cube Map mip 0
            var path = 'images/pbr/maskonaive_m00_c0';
            var format = '.png';
            var urls = [
              path + '0' + format, path + '1' + format,
              path + '2' + format, path + '3' + format,
              path + '4' + format, path + '5' + format
            ];
            var cubeMapMip0 = THREE.ImageUtils.loadTextureCube(urls);
            cubeMapMip0.format = THREE.RGBFormat;

            // Cube Map mip 1
            path = 'images/pbr/maskonaive_m01_c0';
            format = '.png';
            urls = [
              path + '0' + format, path + '1' + format,
              path + '2' + format, path + '3' + format,
              path + '4' + format, path + '5' + format
            ];
            var cubeMapMip1 = THREE.ImageUtils.loadTextureCube(urls);
            cubeMapMip1.format = THREE.RGBFormat;

            // Cube Map mip 2
            path = 'images/pbr/maskonaive_m02_c0';
            format = '.png';
            urls = [
              path + '0' + format, path + '1' + format,
              path + '2' + format, path + '3' + format,
              path + '4' + format, path + '5' + format
            ];
            var cubeMapMip2 = THREE.ImageUtils.loadTextureCube(urls);
            cubeMapMip2.format = THREE.RGBFormat;

            // Cube Map mip 3
            path = 'images/pbr/maskonaive_m03_c0';
            format = '.png';
            urls = [
              path + '0' + format, path + '1' + format,
              path + '2' + format, path + '3' + format,
              path + '4' + format, path + '5' + format
            ];
            var cubeMapMip3 = THREE.ImageUtils.loadTextureCube(urls);
            cubeMapMip3.format = THREE.RGBFormat;

            // Cube Map mip 4
            path = 'images/pbr/maskonaive_m04_c0';
            format = '.png';
            urls = [
              path + '0' + format, path + '1' + format,
              path + '2' + format, path + '3' + format,
              path + '4' + format, path + '5' + format
            ];
            var cubeMapMip4 = THREE.ImageUtils.loadTextureCube(urls);
            cubeMapMip4.format = THREE.RGBFormat;

            // Cube Map mip 5
            path = 'images/pbr/maskonaive_m05_c0';
            format = '.png';
            urls = [
              path + '0' + format, path + '1' + format,
              path + '2' + format, path + '3' + format,
              path + '4' + format, path + '5' + format
            ];
            var cubeMapMip5 = THREE.ImageUtils.loadTextureCube(urls);
            cubeMapMip5.format = THREE.RGBFormat;

            var shaderPBR = THREE.ShaderLib.pbr;

            var material = new THREE.ShaderMaterial({
              uniforms: {
                baseColor: {
                  type: 'v3',
                  value: params.color
                },

                envMap0: {
                  type: 't',
                  value: cubeMapMip0
                },

                envMap1: {
                  type: 't',
                  value: cubeMapMip1
                },

                envMap2: {
                  type: 't',
                  value: cubeMapMip2
                },

                envMap3: {
                  type: 't',
                  value: cubeMapMip3
                },

                envMap4: {
                  type: 't',
                  value: cubeMapMip4
                },

                envMap5: {
                  type: 't',
                  value: cubeMapMip5
                },

                roughness: {
                  type: 'f',
                  value: params.roughness
                },

                metallic: {
                  type: 'f',
                  value: params.metallic
                },

                lightIntensity: {
                  type: 'f',
                  value: params.lightIntensity
                },

                uvScale: {
                  type: 'v2',
                  value: new THREE.Vector2(1.0, 1.0)
                }
              },
              vertexShader: shaderPBR.vertexShader,
              fragmentShader: shaderPBR.fragmentShader
            });

            return material;
          }
        }
      }
    )
  }
);
