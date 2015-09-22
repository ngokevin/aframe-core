/* global HTMLElement */

require('../vr-register-element');

module.exports = document.registerElement(
  'vr-assets',
  {
    prototype: Object.create(
      HTMLElement.prototype,
      {
        createdCallback: {
          value: function () {
          }
        }
      }
    )
  }
);
