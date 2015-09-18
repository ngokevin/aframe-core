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

        attatchedTo: {
          value: {
            element: null
          }
        },

        // returns promise that resolves with element attatched to effector.
        elementAttatched: {
          value: function() {
            return new Promise(function(resolve) {
              var attatched = this.attatchedTo.element;
              if (attatched) {
                resolve(attatched)
              } else {
                this.addEventListener('attatched', function(e) {
                  resolve(this.attatchedTo.element);
                })  
              }
            }.bind(this));
          }
        }

      }
    )
  }
);
