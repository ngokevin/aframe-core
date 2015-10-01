/* globals MouseEvent */
var registerComponent = require('../core/register-component', this);
var THREE = require('../../lib/three');

module.exports.Component = registerComponent('emitClick', {
  update: {value: function () {
      // get renderer canvas so that we can listen for mouse events.
      var canvas = document.querySelector('vr-scene').canvas;

      // find camera
      this.camera = document.querySelector('*[camera]').object3D;

      this.raycaster = new THREE.Raycaster();

      // Mouse Events
      if (!this.binded) {
        canvas.addEventListener('click', this.onClick.bind(this), true);
        this.binded = true;
      }
    }
  },
  onClick: {value: function (e) {
    var x = (e.clientX / window.innerWidth) * 2 - 1;
    var y = -(e.clientY / window.innerHeight) * 2 + 1;
    var mouse = new THREE.Vector2(x, y);
    this.raycaster.setFromCamera(mouse, this.camera);

    // check to see if picking ray intersects with this mesh
    var intersects = this.raycaster.intersectObjects([this.el.object3D]);
    if (intersects.length > 0) {
      // dispatch click event on element
      var evt = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      this.el.dispatchEvent(evt);
    }
  }}
});
