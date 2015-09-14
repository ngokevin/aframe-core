require('./vr-register-element');

var VRUtils = require('./vr-utils');
var VRNode = require('./core/vr-node');
var TWEEN = require('tween.js');

module.exports = document.registerElement(
  'vr-animation', {
  prototype: Object.create(
    VRNode.prototype, {
      createdCallback: {
        value: function() {
          this.attribute = this.getAttribute('attribute');
          this.delay = parseFloat(this.getAttribute('delay')) || 0;
          this.duration = parseFloat(this.getAttribute('duration')) || 1000;
          this.easing = this.setupEasing();
          this.to = VRUtils.parseAttributeString(this.attribute, this.getAttribute('to'));
          this.load();
        }
      },

      setupEasing: {
        value: function() {
          // See list of supported easing functions:
          // https://github.com/tweenjs/tween.js/blob/master/docs/user_guide.md#available-easing-functions-tweeneasing
          var easingAttr = this.getAttribute('easing');
          var easingDirection = this.getAttribute('direction');

          if (easingAttr && easingAttr in TWEEN.Easing &&
              easingDirection in TWEEN.Easing[easingAttr]) {
            return TWEEN.Easing[easingAttr][easingDirection];
          } else {
            return TWEEN.Easing.Linear.None;
          }
        },
      },

      add: {
        value: function (obj) {
          var attribute = this.attribute;
          var from = obj.getAttribute(attribute);
          new TWEEN.Tween(from)
            .to(this.to, this.duration)
            .easing(this.easing)
            .delay(this.delay)
            .onUpdate(function () {
              obj.setAttribute(attribute, this);
            })
            .start();
        },
      }
  })
});
