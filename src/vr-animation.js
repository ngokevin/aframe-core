/* globals define, TWEEN */
(function(define){'use strict';define(function(require,exports,module){

  var proto = Object.create(
    VRNode.prototype, {
      createdCallback: {
        value: function() {
          this.delay = +this.getAttribute('delay') || 0;
          this.duration = +this.getAttribute('duration') || 1000;
          this.loop = this.hasAttribute('loop');
          this.prop = this.getAttribute('prop');
          this.to = this.parseAttributeString(this.getAttribute('to'));
          this.init();
        }
      },

      // TODO: duplicated from vr-object, maybe move from vr-object to
      // vr-node or VR.utils?
      parseAttributeString: {
        value: function(str) {
          var attrs = str.split(' ');
          if (attrs.length !== 3) {
            throw new Error('attr string should be len 3, ex:  (0 1 2)');
          }
          return {
            x: +attrs[0],
            y: +attrs[1],
            z: +attrs[2],
          };
        },
      },
    }
  );

  var VRTags = window.VRTags = window.VRTags || {};
  VRTags["VR-ANIMATION"] = true;
  module.exports = document.registerElement('vr-animation', { prototype: proto });

});})(typeof define==='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module==='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRAnimation',this));
