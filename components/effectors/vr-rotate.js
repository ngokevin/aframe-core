var VRMarkup = require('vr-markup');

var THREE = VRMarkup.THREE;
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

            this.elementAttatched().then(function(vrObject) {
              // attatch this camera object in effector to vr-object element.
              console.log(vrObject, ' attatched to rotation ', this);

              this.object3D = vrObject.object3D;

              this.update()
            }.bind(this));
          }
        },

        update: {
          value: function() {
            this.object3D.rotation[this.axis] += 0.01;
            window.requestAnimationFrame(this.update.bind(this));
          }
        }
        
      }
    )
  }
);
