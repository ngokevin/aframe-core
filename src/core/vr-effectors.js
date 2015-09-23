/* global Event, HTMLElement */

require('../vr-register-element');

module.exports = document.registerElement(
  'vr-effectors',
  {
    prototype: Object.create(
      HTMLElement.prototype,
      {
        createdCallback: {
          value: function () {
          }
        },

        attach: {
          value: function (element) {
            this.attatchedTo.element = element;
            console.log(this, 'attatched to ', element);
            var evt = new Event('attatched');
            this.dispatchEvent(evt);
          }
        },

        detach: {
          value: function () {
            if (this.attatchedTo.element) {
              console.log(this, 'detatched from ', this.attatchedTo.element);
              var evt = new Event('detatched');
              this.dispatchEvent(evt);
              this.attatchedTo.element = null;
            }
          }
        },

        attatchedTo: {
          value: {
            element: null
          }
        },

        getAsset: {
          value: function (id) {
            var element = document.getElementById(id);
            // todo: need to check if this is instance of asset.
            if (element === null) {
              console.warn('[vr-effector] ' + id + ' asset not found.');
            }
            return element;
          }
        }
      }
    )
  }
);
