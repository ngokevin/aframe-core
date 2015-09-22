var VRMarkup = require('vr-markup');

var THREE = VRMarkup.THREE;
var VRAsset = VRMarkup.VRAsset;

document.registerElement(
  'vr-geometry-sphere',
  {
    prototype: Object.create(
      VRAsset.prototype,
      {
        createdCallback: {
          value: function () {
            this.geometry = this.getGeometry();
          }
        },

        getGeometry: {
          value: function () {
            var radius = parseFloat(this.getAttribute('radius')) || 2;
            return new THREE.SphereGeometry(radius, 20, 20);
          }
        }
      }
    )
  }
);
