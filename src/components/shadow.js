var registerComponent = require('../core/register-component').registerComponent;

/**
 * Shadow component.
 *
 * @namespace shadow
 * @param {bool} [cast=false] - whether object will cast shadows.
 * @param {bool} [receive=false] - whether object will receive shadows.
 */
module.exports.Component = registerComponent('shadow', {
  defaults: {
    value: {
      cast: false,
      receive: false
    }
  },

  init: {
    value: function () {
      this.update();
    }
  },

  update: {
    value: function () {
      var el = this.el;
      el.object3D.castShadow = this.data.cast;
      el.object3D.receiveShadow = this.data.receive;
    }
  }
});
