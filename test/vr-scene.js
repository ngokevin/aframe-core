/* global assert, setup, sinon, suite, teardown, test */
suite('vr-scene', function () {
  'use strict';

  window.debug = true;
  require('core/vr-assets');
  var VRScene = require('core/vr-scene');
  var Utils = require('./utils');

  setup(function () {
    this.sinon = sinon.sandbox.create();
    Utils.spyPrototype(VRScene.prototype, this.sinon);
    this.el = document.createElement('vr-scene');
  });

  teardown(function () {
    var el = this.el;
    this.sinon.restore();
    if (el.parentNode) {
      el.parentNode.removeChild(el);
      return;
    }
    if (el) { el.shutdown(); }
  });

  suite('createdCallback', function () {
    test('is called on element creation', function () {
      sinon.assert.called(VRScene.prototype.createdCallback);
    });

    test('initialization methods are called on element creation', function () {
      sinon.assert.called(VRScene.prototype.attachEventListeners);
      sinon.assert.called(VRScene.prototype.attachFullscreenListeners);
      sinon.assert.called(VRScene.prototype.setupScene);
    });
  });

  suite('detachedCallback', function () {
    setup(function () {
      var body = this.body = document.body;
      body.appendChild(this.el);
    });

    test('is called when the element is removed from the DOM', function (done) {
      this.body.removeChild(this.el);
      process.nextTick(function () {
        sinon.assert.called(VRScene.prototype.detachedCallback);
        done();
      });
    });

    test('shutdown is called when the element is removed from the DOM', function (done) {
      this.body.removeChild(this.el);
      process.nextTick(function () {
        sinon.assert.called(VRScene.prototype.shutdown);
        done();
      });
    });
  });

  suite('shutdown', function () {
    setup(function () {
      sinon.spy(window, 'cancelAnimationFrame');
      var body = this.body = document.body;
      body.appendChild(this.el);
    });

    test('cancelAnimationFrame is called when the element is removed from the DOM', function (done) {
      var animationFrameID = this.el.animationFrameID;
      this.body.removeChild(this.el);
      process.nextTick(function () {
        sinon.assert.calledWith(window.cancelAnimationFrame, animationFrameID);
        done();
      });
    });
  });

  suite('attachEventListeners', function () {
    setup(function () {
      var body = this.body = document.body;
      body.appendChild(this.el);
    });

    teardown(function () {
      this.body.removeChild(this.el);
    });

    test('scene listens for the assets to load if they have not loaded', function () {
      var assets = document.createElement('vr-assets');
      this.sinon.spy(assets, 'addEventListener');
      assets.hasLoaded = false;
      document.body.appendChild(assets);
      this.el.attachEventListeners();
      sinon.assert.called(assets.addEventListener);
    });

    test('scene does not listen for the assets if they have loaded', function () {
      var assets = document.createElement('vr-assets');
      assets.hasLoaded = true;
      this.sinon.spy(assets, 'addEventListener');
      document.body.appendChild(assets);
      this.el.attachEventListeners();
      sinon.assert.notCalled(assets.addEventListener);
    });

    test('scene listens for all the not loaded children elements', function () {
      var VRObject = require('core/vr-object');
      this.sinon.stub(VRObject.prototype, 'addEventListener');
      var i;
      var n = 10;
      var obj;
      for (i = 0; i < n; ++i) {
        obj = document.createElement('vr-object');
        obj.hasLoaded = false;
        this.el.appendChild(obj);
      }
      this.el.attachEventListeners();
      sinon.assert.callCount(VRObject.prototype.addEventListener, n);
    });

    test('scene does not listen for the children elements that have already loaded', function () {
      var VRObject = require('core/vr-object');
      this.sinon.stub(VRObject.prototype, 'addEventListener');
      var i;
      var n = 10;
      var obj;
      for (i = 0; i < n; ++i) {
        obj = document.createElement('vr-object');
        this.el.appendChild(obj);
      }
      this.el.attachEventListeners();
      sinon.assert.notCalled(VRObject.prototype.addEventListener);
    });
  });

  suite('isVRNode', function () {
    test('returns true for a vr-**** element', function () {
      var obj = document.createElement('vr-object');
      assert.isTrue(this.el.isVRNode(obj));
    });

    test('returns false for a non vr-**** element', function () {
      var div = document.createElement('div');
      assert.isFalse(this.el.isVRNode(div));
    });
  });

  suite('attachFullscreenListeners', function () {
    setup(function () {
      this.sinon.stub(document, 'addEventListener');
    });

    test('the scene listens for mozfullscreenchange events on the document', function () {
      this.el.attachFullscreenListeners();
      sinon.assert.calledWith(document.addEventListener, 'mozfullscreenchange');
    });

    test('the scene listens for webkitfullscreenchange events on the document', function () {
      this.el.attachFullscreenListeners();
      sinon.assert.calledWith(document.addEventListener, 'webkitfullscreenchange');
    });
  });

  suite('fullscreenChange', function () {
    test('scene falls back to mono renderer if we are not in fullscreen', function () {
      var el = this.el;
      document.fullscreenElement = false;
      el.fullscreenChange();
      assert.isTrue(el.renderer === el.monoRenderer);
    });

    test('scene stays in stereo if we are in fullscreen', function () {
      var el = this.el;
      document.fullscreenElement = true;
      el.renderer = el.stereoRenderer;
      el.fullscreenChange();
      assert.isTrue(el.renderer === el.stereoRenderer);
    });
  });

  suite('elementLoaded', function () {
    setup(function () {
      var el = this.el;
      el.load = sinon.stub();
      el.render = sinon.stub();
      el.setupLoader = sinon.stub();
      el.resizeCanvas = sinon.stub();
    });

    test('scene does not trigger render if there are pending elements', function () {
      var el = this.el;
      el.pendingElements = 2;
      el.elementLoaded();
      sinon.assert.notCalled(el.setupLoader);
      sinon.assert.notCalled(el.resizeCanvas);
      sinon.assert.notCalled(el.render);
      sinon.assert.notCalled(el.load);
    });

    test('scene does not trigger render if there are not pending elements but the renderer has already started', function () {
      var el = this.el;
      el.pendingElements = 1;
      el.renderLoopStarted = true;
      el.elementLoaded();
      sinon.assert.notCalled(el.setupLoader);
      sinon.assert.notCalled(el.resizeCanvas);
      sinon.assert.notCalled(el.render);
      sinon.assert.notCalled(el.load);
    });

    test('scene triggers rendering if there are no pending elements and no render loop', function () {
      var el = this.el;
      el.pendingElements = 1;
      el.renderLoopStarted = false;
      el.elementLoaded();
      sinon.assert.called(el.setupLoader);
      sinon.assert.called(el.resizeCanvas);
      sinon.assert.called(el.render);
      sinon.assert.called(el.load);
    });
  });

  suite('createEnterVrButton', function () {
    test('scene falls back to mono renderer if we are not in fullscreen', function () {
      var el = this.el;
      var button;
      el.createEnterVrButton();
      button = document.querySelector('.vr-button');
      assert.isTrue(button !== null);
    });
  });

  suite('enableStereo', function () {
    setup(function () {
      this.el.resizeCanvas = sinon.stub();
    });

    test('stereo mode is enabled', function () {
      var el = this.el;
      el.enableStereo(true);
      assert.isTrue(el.renderer === el.stereoRenderer);
    });

    test('stereo mode is disabled', function () {
      var el = this.el;
      el.enableStereo(false);
      assert.isTrue(el.renderer === el.monoRenderer);
    });

    test('the canvas is resized if the render mode changes', function () {
      var el = this.el;
      el.renderer = el.monoRenderer;
      el.enableStereo(true);
      sinon.assert.called(el.resizeCanvas);
    });
  });

  suite('setupScene', function () {
    test('scene falls back to mono renderer if we are not in fullscreen', function () {
      this.el.setupScene();
      sinon.assert.called(VRScene.prototype.setupCanvas);
      sinon.assert.called(VRScene.prototype.setupRenderer);
      sinon.assert.called(VRScene.prototype.setupCamera);
    });
  });

  suite('setupCanvas', function () {
    test('a canvas is created appended to the DOM and event listeners are attached', function () {
      var el = this.el;
      this.sinon.spy(window, 'addEventListener');
      el.canvas = undefined;
      el.setupCanvas();
      assert.isTrue(el.canvas !== undefined);
      assert.isTrue(el.canvas.parentNode === document.body);
      sinon.assert.calledWith(window.addEventListener, 'resize');
    });
  });

  suite('setupCamera', function () {
    test('a canvas is created appended to the DOM and event listeners are attached', function () {
      var el = this.el;
      this.sinon.spy(window, 'addEventListener');
      el.canvas = undefined;
      el.setupCanvas();
      assert.isTrue(el.canvas !== undefined);
      assert.isTrue(el.canvas.parentNode === document.body);
      sinon.assert.calledWith(window.addEventListener, 'resize');
    });
  });

  suite('enterVR', function () {
    test('stereo mode is enabled and we go to fullscreen', function () {
      var el = this.el;
      el.renderer = {
        setFullScreen: sinon.stub()
      };
      el.enableStereo = sinon.stub();
      el.enterVR();
      sinon.assert.calledWith(el.enableStereo, true);
      sinon.assert.calledWith(el.renderer.setFullScreen, true);
    });
  });

  suite('setupRenderer', function () {
    test('a renderer and a scene are created and appended to VRScene', function () {
      var el = this.el;
      el.setupRenderer();
      assert.isTrue(el.renderer !== undefined);
      assert.isTrue(VRScene.renderer === el.renderer);
      assert.isTrue(el.object3D !== undefined);
      assert.isTrue(VRScene.scene === el.object3D);
    });
  });

  suite('resizeCanvas', function () {
    test('a camera and canvas are reconfigured to acommodate new size', function () {
      var el = this.el;
      var renderer = el.renderer = {
        setSize: sinon.stub()
      };
      var canvas = el.canvas = {
        style: {},
        offsetWidth: 800,
        offsetHeight: 600
      };
      var camera = el.camera = {
        updateProjectionMatrix: sinon.stub()
      };
      el.resizeCanvas();
      assert.isTrue(canvas.style.width === '100%');
      assert.isTrue(canvas.style.height === '100%');
      assert.isTrue(canvas.width === 800);
      assert.isTrue(canvas.height === 600);
      assert.isTrue(camera.aspect === canvas.offsetWidth / canvas.offsetHeight);
      sinon.assert.calledWith(renderer.setSize, canvas.width, canvas.height);
      sinon.assert.called(camera.updateProjectionMatrix);
    });
  });

  suite('add', function () {
    test('add is called on the object3D if there is one passed as argument', function () {
      var el = this.el;
      var elObj = el.object3D = {
        add: sinon.stub()
      };
      var elArg = {
        object3D: true
      };
      el.add(elArg);
      sinon.assert.called(elObj.add);
    });

    test('add is not called on the object3D if there is none passed as argument', function () {
      var el = this.el;
      var elObj = el.object3D = {
        add: sinon.stub()
      };
      var elArg = {
        object3D: false
      };
      el.add(elArg);
      sinon.assert.notCalled(elObj.add);
    });
  });

  suite('addBehavior', function () {
    test('a behavior is pushed to the array', function () {
      var el = this.el;
      var behaviors = el.behaviors = {
        push: sinon.stub()
      };
      el.addBehavior();
      sinon.assert.called(behaviors.push);
    });
  });

  suite('remove', function () {
    test('remove is called on the object3D if there is one passed as argument', function () {
      var el = this.el;
      var elObj = el.object3D = {
        remove: sinon.stub()
      };
      var elArg = {
        object3D: true
      };
      el.remove(elArg);
      sinon.assert.called(elObj.remove);
    });

    test('remove is not called on the object3D if there is none passed as argument', function () {
      var el = this.el;
      var elObj = el.object3D = {
        remove: sinon.stub()
      };
      var elArg = {
        object3D: false
      };
      el.remove(elArg);
      sinon.assert.notCalled(elObj.remove);
    });
  });

  suite('render', function () {
    test('add is called on the object3D if there is one passed as argument', function () {
      var el = this.el;
      var renderer = el.renderer = { render: sinon.stub() };
      var raf = window.requestAnimationFrame = this.sinon.stub();
      var t = 10;
      var behavior = { update: sinon.stub() };
      el.behaviors = [behavior, behavior, behavior];
      el.render(t);
      sinon.assert.calledThrice(behavior.update);
      sinon.assert.called(renderer.render);
      sinon.assert.called(raf);
    });
  });
});
