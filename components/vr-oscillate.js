/* globals VRTags, VRBehavior */
/* exported VROscillate */

VRTags["VR-OSCILLATE"] = true;

var VROscillate = document.registerElement('vr-oscillate', {
  prototype: Object.create(VRBehavior.prototype, {
    init: {
      value: function() {
        this.amplitude = parseFloat(this.getAttribute('amplitude')) || 10;
        this.period = parseFloat(this.getAttribute('period')) || 2;
        this.direction = this.getAttribute('direction');
        this.oscillateFn = this.makeOscillate(this.amplitude, this.period,
          this.getParentNodePosition());
        this.load();
      },
    },

    getParentNodePosition: {
      value: function() {
        return this.parentNode.getAttribute('position')[this.direction];
      },
    },

    setParentNodePosition: {
      value: function(nextPos) {
        // TODO: messy, maybe use this.parentNode.setAttribute?
        this.parentNode.object3D.position[this.direction] = nextPos;
      },
    },

    makeOscillate: {
      value: function(amplitude, period, verticalOffset) {
        const k = 2 * Math.PI * 0.001;
        const kFreq = k / period;
        return function (t) {
          return amplitude * Math.cos(kFreq * t) + verticalOffset;
        };
      },
    },

    update: {
      value: function(t) {
        this.setParentNodePosition(this.oscillateFn(t));
      },
    },

    detachedCallback: {
      value: function() {
        if (this.rAF) {
          cancelAnimationFrame(this.rAF);
          this.rAF = null;
        }
      },
    },
  }),
});
