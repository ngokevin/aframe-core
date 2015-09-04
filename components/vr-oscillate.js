/* globals define */
(function(define){'use strict';define(function(require,exports,module){

  const k = 2 * Math.PI * 0.001;
  // Period in seconds
  function makeOscillate(amplitude, period, verticalOffset) {
    const kFreq = k / period;
    return function () {
      return amplitude * Math.cos(kFreq * performance.now()) + verticalOffset;
    };
  };

  document.registerElement(
    'vr-oscillate',
    {
      prototype: Object.create(
        VRObject.prototype, {
          init: {
            value: function() {
              this.object3D = new THREE.Object3D;
              this.rAF = requestAnimationFrame(this.animate.bind(this));
              this.amplitude = +this.getAttribute('amplitude') || 10;
              this.period = +this.getAttribute('period') || 2;
              this.direction = this.getAttribute('direction');
              this.oscillateFn = makeOscillate(this.amplitude, this.period,
                this.getParentNodePosition());
              this.load();
            }
          },

          getParentNodePosition: {
            value: function() {
              return this.parentNode.object3D.position[this.direction];
            }
          },

          setParentNodePosition: {
            value: function(nextPos) {
              this.parentNode.object3D.position[this.direction] = nextPos;
            }
          },

          animate: {
            value: function() {
              this.setParentNodePosition(this.oscillateFn());
              this.rAF = requestAnimationFrame(this.animate.bind(this));
            }
          },

          detachedCallback: {
            value: function() {
              if (this.rAF) {
                cancelAnimationFrame(this.rAF);
                this.rAF = null;
              }
            }
          },

        })
    }
  );

  var VRTags = window.VRTags = window.VRTags || {};
  VRTags["VR-OSCILLATE"] = true;

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VROscillate',this));
