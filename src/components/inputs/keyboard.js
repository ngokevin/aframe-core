var registerComponent = require('../../core/register-component').registerComponent;

module.exports.Component = registerComponent('keyboard-input', {
  init: {
    value: function () {
      // To keep track of the pressed keys.
      this.keys = {};

      this.attachKeyboardListeners();
    }
  },

  attachKeyboardListeners: {
    value: function () {
      window.addEventListener('keydown', this.onKeyDown.bind(this));
      window.addEventListener('keyup', this.onKeyUp.bind(this));
    }
  },

  onKeyDown: {
    value: function (event) {
      this.keys[event.keyCode] = true;
    }
  },

  onKeyUp: {
    value: function (event) {
      this.keys[event.keyCode] = false;
    }
  }
});
