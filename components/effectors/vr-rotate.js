var VRMarkup = require('vr-markup');
var VREffector = VRMarkup.VREffector;

document.registerElement(
  'vr-rotate',
  {
    prototype: Object.create(
      VREffector.prototype,
      {
        createdCallback: {
          value: function () {
            this.object3D = null;

            this.axis = this.getAttribute('axis');

            this.addEventListener('attatched', function () {
              this.object3D = this.attatchedTo.element.object3D;
              this.update();
            });

            this.addEventListener('detatched', function () {
              this.shutdown();
            });
          }
        },

        // todo: optionally allow registering of update functions to another component.
        update: {
          value: function () {
            this.object3D.rotation[this.axis] += 0.01;
            this.animationFrameID = window.requestAnimationFrame(this.update.bind(this));
          }
        },

        shutdown: {
          value: function () {
            if (this.animationFrameID) {
              window.cancelAnimationFrame(this.animationFrameID);
            }
          }
        }
      }
    )
  }
);
