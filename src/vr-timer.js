/* global VRTags, VRNode */
/* exported VRTimer */

VRTags["VR-TIMER"] = true;

var VRTimer = document.registerElement(
  'vr-timer',
  {
    prototype: Object.create(
      VRNode.prototype,
      {
        createdCallback: {
          value: function() {
            var sceneEl = document.querySelector('vr-scene');
            this.sceneEl = sceneEl;
            this.sceneEl.addTimer(this);
            this.init();
          }
        },

        // Tags that inherit from VRTimer should define their own update
        // function.
        update: {
          value: function() { /* no op */}
        },
      }
    )
  }
);
