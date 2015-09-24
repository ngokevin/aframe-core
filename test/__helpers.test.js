/* global sinon, setup, teardown */

window.debug = true;

var THREE = require('vr-markup').THREE;
var VRScene = require('core/vr-scene');

setup(function () {
  this.sinon = sinon.sandbox.create();

  this.sinon.stub(VRScene.prototype, 'setupRenderer', function () {
    this.object3D = new THREE.Scene();
  });
});

teardown(function () {
  this.sinon.restore();
});
