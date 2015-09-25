var VRMarkup = require('vr-markup');

var THREE = VRMarkup.THREE;
var VRAsset = VRMarkup.VRAsset;

document.registerElement(
  'vr-geometry-cube',
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
            var width = parseFloat(this.getAttribute('width')) || 5;
            var height = parseFloat(this.getAttribute('height')) || 5;
            var depth = parseFloat(this.getAttribute('depth')) || 5;
            return new THREE.BoxGeometry(width, height, depth);
          }
        }
      }
    )
  }
);
