var registerComponent = require('../../core/component').registerComponent;
var getUrlParameter = require('../../utils/').getUrlParameter;
var THREE = require('../../../lib/three');

module.exports.Component = registerComponent('vr-mode', {
  init: function () {
    var enterVR = this.enterVR;
    var scene = this.el;

    this.stereoRenderer = new THREE.VREffect(scene.renderer);

    // Keyboard shortcut.
    window.addEventListener('keyup', function (event) {
      if (event.keyCode === 70) {  // f.
        enterVR();
      }
    }, false);

    // Check for ?vr parameter.
    if (getUrlParameter('mode') === 'vr') {
      enterVR();
    }
  },

  enterVR: function () {
    var scene = this.el;
    scene.addState('vrmode');

    scene.emit('vrmode-enter', {
      target: scene
    });

    this.setStereoRenderer();
    scene.setFullscreen();
  },

  exitVR: function () {
    var scene = this.el;
    scene.removeState('vrmode');

    scene.emit('vrmode-exit', {
      target: scene
    });

    scene.setMonoRenderer();
  },

  /**
   * Sets renderer to stereo (two eyes) and resizes canvas.
   */
  setStereoRenderer: function () {
    var scene = this.el;
    scene.renderer = this.stereoRenderer;
    // TODO: canvas component.
    scene.resizeCanvas();
  }
});
