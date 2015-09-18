var VRMarkup = require('vr-markup');

var THREE = VRMarkup.THREE;
var VREffector = VRMarkup.VREffector;

document.registerElement(
  'vr-mesh',
  {
    prototype: Object.create(
      VREffector.prototype,
      {
        createdCallback: {
          value: function () {

            // wait for element to attatch to effector            
            this.addEventListener('attatched', function() {
              var attatchedElement = this.attatchedTo.element;
              console.log(attatchedElement, ' attatched to mesh ', this);
              
              var material = this.getMaterial();
              var geometry = this.getGeometry();

              var mesh = this.object3D = new THREE.Mesh(geometry, material);
              
              attatchedElement.object3D.add(mesh);
            }.bind(this));
          }
        },

        getGeometry: {
          value: function () {
            var width = parseFloat(this.getAttribute('width')) || 5;
            var height = parseFloat(this.getAttribute('height')) || 5;
            var depth = parseFloat(this.getAttribute('depth')) || 5;
            return new THREE.BoxGeometry(width, height, depth);
          }
        },

        getMaterial: {
          value: function () {
            var color = this.getAttribute('color');
            var materialId = this.getAttribute('material');
            var materialEl;
            var material;

            if (materialId) {
              materialEl = materialId ? document.querySelector('#' + materialId) : {};
              material = materialEl.material;
              if (color) {
                material.color = new THREE.Color(color);
              }
            } else if (color) {
              material = new THREE.MeshPhongMaterial({color: color});
            } else {
              material = new THREE.MeshNormalMaterial();
            }

            return material;
          }
        }

        
      }
    )
  }
);
