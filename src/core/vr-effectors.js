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
          value: function(element) {
            this.attatchedTo.element = element;
            var evt = new Event('attatched');
            this.dispatchEvent(evt);
          }
        },

        detach: {
          value: function() {
            if (this.attatchedTo.element) {
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
        }
      }
    )
  }
);
