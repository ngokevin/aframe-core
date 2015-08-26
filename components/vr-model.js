/* globals define */
(function(define){'use strict';define(function(require,exports,module){

  document.registerElement(
    'vr-model',
    {
      prototype: Object.create(
        VRObject.prototype, {

          init: {
            value: function() {

              var self = this;
              var src = this.getAttribute('src');
              console.log(src);

              self.scene.add( new THREE.AmbientLight( 0xcccccc ) );

              var loader = new THREE.ColladaLoader();
              // loader.options.convertUpAxis = true;
              loader.load( src, function ( collada ) {

                var dae = collada.scene;

                // dae.scale.x = dae.scale.y = dae.scale.z = 0.002;
                // dae.updateMatrix();

                self.object3D = dae;
                self.load();
              });
            }
          },

          update: {
            value: function() {
              
            }
          }
        })
    }
  );

  var VRTags = window.VRTags = window.VRTags || {};
  VRTags["VR-MODEL"] = true;

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRModel',this));