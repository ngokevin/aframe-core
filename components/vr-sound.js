/* globals define */
(function(define){'use strict';define(function(require,exports,module){

  document.registerElement(
    'vr-sound',
    {
      prototype: Object.create(
        VRObject.prototype, {
          init: {
            value: function() {

              var src = this.getAttribute('src');
              var loop = parseFloat(this.getAttribute('loop')) || 'false';
              var distance = parseFloat(this.getAttribute('distance')) || 0;
              var xPos = parseFloat(this.getAttribute('x')) || 0;
              var yPos = parseFloat(this.getAttribute('y')) || 0;
              var zPos = parseFloat(this.getAttribute('z')) || 0;

              var listener = new THREE.AudioListener();
              this.camera.add( listener );

              var sound = new THREE.Audio( listener );
              sound.load( src );
              sound.position.set( xPos, yPos, zPos );
              sound.setLoop( loop );
              sound.setRefDistance( distance );
              this.scene.add( sound );
            }
          },

          update: {
            value: function() {
              //TODO
            }
          },
        })
    }
  );

  var VRTags = window.VRTags = window.VRTags || {};
  VRTags["VR-SOUND"] = true;

});})(typeof define=='function'&&define.amd?define
:(function(n,w){'use strict';return typeof module=='object'?function(c){
c(require,exports,module);}:function(c){var m={exports:{}};c(function(n){
return w[n];},m.exports,m);w[n]=m.exports;};})('VRSound',this));