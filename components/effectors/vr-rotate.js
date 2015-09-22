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
            // wait for element to attatch to effector

            this.axis = this.getAttribute('axis');

            this.addEventListener('attatched', function () {
              console.log(this.attatchedTo.element, ' attatched to rotation ', this);

              this.object3D = this.attatchedTo.element.object3D;

              this.update();
            });

            this.addEventListener('detatched', function () {
              this.shutdown();
            });
          }
        },

        update: {
          value: function () {
            this.object3D.rotation[this.axis] += 0.01;
            this.animationFrameID = window.requestAnimationFrame(this.update.bind(this));
          }
        },

        shutdown: {
          value: function () {
            if (this.animationFrameID) {
              console.log('shutting down');
              window.cancelAnimationFrame(this.animationFrameID);
            }
          }
        }
      }
    )
  }
);
