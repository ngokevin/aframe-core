/* global Event, HTMLElement */

require('../vr-register-element');

module.exports = document.registerElement(
  'vr-assets',
  {
    prototype: Object.create(
      HTMLElement.prototype,
      {
        createdCallback: {
          value: function () {
            var attributeChangedCallback = this.attributeChangedCallback;
            if (attributeChangedCallback) { attributeChangedCallback.apply(this); }
          }
        },

        attributeChangedCallback: {
          value: function (change) {
            
          }
        }
      }
    )
  }
);
