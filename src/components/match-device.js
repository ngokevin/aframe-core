var registerComponent = require('../core/register-component').registerComponent;
var utils = require('../utils/');

var proto = {
  defaults: {
    value: 'any'
  },

  update: {
    value: function () {
      var data = (this.data || '').trim().toLowerCase();
      var el = this.el;

      // One day we could use the browser's `match-media` or more advanced
      // device targetting: https://github.com/kaimallea/isMobile
      var isMobile = utils.isMobile();
      var isDesktop = !isMobile;

      var forAny = data === 'any';
      var forMobile = data === 'mobile';
      var forDesktop = !forMobile;

      if (forAny) { return; }
      if (isMobile && forMobile) { return; }
      if (isDesktop && forDesktop) { return; }

      // We remove the node instead of toggling visibility because it
      // shouldn't be in the scene anyway.
      el.parentNode.remove(el);
    }
  },

  parseAttributesString: {
    value: function (attrs) {
      return attrs;
    }
  },

  stringifyAttributes: {
    value: function (attrs) {
      return attrs.toString();
    }
  }
};

module.exports.Component = registerComponent('match-device', proto);
