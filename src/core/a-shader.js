var registerElement = require('../a-register-element').registerElement;

var THREE = require('../../lib/three');
var ANode = require('./a-node');
var utils = require('../utils');

module.exports = registerElement(
  'a-shader',
  {
    prototype: Object.create(
      ANode.prototype,
      {
        attachedCallback: {
          value: function () {
            var vertexShaderId = this.getAttribute('vertexshader');
            var fragmentShaderId = this.getAttribute('fragmentshader');
            var vertexShaderEl = document.getElementById(vertexShaderId);
            var fragmentShaderEl = document.getElementById(fragmentShaderId);
            if (!vertexShaderEl) {
              utils.warn('Not valid vertex shader for shader "%$"', this.id);
              return;
            }
            if (!fragmentShaderEl) {
              utils.warn('Not valid fragment shader for shader "%$"', this.id);
              return;
            }
            this.material = new THREE.ShaderMaterial({
              uniforms: this.getUniforms(),
              vertexShader: vertexShaderEl.textContent,
              fragmentShader: fragmentShaderEl.textContent
            });
            this.load();
          },
          writable: window.debug
        },

        attachEventListeners: {
          value: function () {
            // var uniformEls = this.querySelectorAll('a-uniform');
            // Convert from NodeList -> Array
            // uniformsEls = Array.prototype.slice.call(uniformsEls);
            // var observer = new MutationObserver(this.updateUniforms.bind(this));
          },
          writable: window.debug
        },

        getUniforms: {
          value: function () {
            var self = this;
            var uniformEls = this.querySelectorAll('a-uniform');
            var uniforms = {};
            // Convert from NodeList -> Array
            uniformEls = Array.prototype.slice.call(uniformEls);
            uniformEls.forEach(addUniform);
            function addUniform (uniformEl) {
              var id = uniformEl.id;
              var value = uniformEl.getAttribute('value');
              var type = uniformEl.getAttribute('type');
              uniforms[id] = {
                type: type,
                value: self.parseUniformValue(value, type)
              };
            }
            return uniforms;
          },
          writable: window.debug
        },

        parseUniformValue: {
          value: function (value, type) {
            var arr;
            switch (type) {
              case 'f': {
                return parseFloat(value);
              }
              case 'v2': {
                arr = value.split(' ').map(parseFloat);
                return new THREE.Vector2(arr[0], arr[1]);
              }
              default: {
                utils.warn('Unknown uniform type "%s"', type);
              }
            }
          },
          writable: window.debug
        }
      })
  }
);
