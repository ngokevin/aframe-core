/* global MessageChannel, Promise */
var re = require('./a-register-element');
var THREE = require('../../lib/three');
var TWEEN = require('tween.js');
var utils = require('../utils/');
var AEntity = require('./a-entity');
var ANode = require('./a-node');
var Wakelock = require('../../lib/vendor/wakelock/wakelock');

var dummyDolly = new THREE.Object3D();
var controls = new THREE.VRControls(dummyDolly);

var DEFAULT_CAMERA_ATTR = 'data-aframe-default-camera';
var DEFAULT_LIGHT_ATTR = 'data-aframe-default-light';
var registerElement = re.registerElement;
var isMobile = utils.isMobile();

/**
 * Scene element, holds all entities.
 *
 * @member {number} animationFrameID
 * @member {array} behaviors - Component instances that have registered themselves to be
           updated on every tick.
 * @member {object} canvas
 * @member {bool} insideIframe
 * @member {bool} isScene - Differentiates this as a scene entity as opposed
           to other `AEntity`s.
 * @member {bool} isMobile - Whether browser is mobile (via UA detection).
 * @member {object} object3D - The root three.js Scene object.
 * @member {object} monoRenderer
 * @member {object} renderer
 * @member {bool} renderStarted
 * @member {object} stereoRenderer * @member {object} wakelock
 */
var AScene = module.exports = registerElement('a-scene', {
  prototype: Object.create(AEntity.prototype, {
    defaultComponents: {
      value: {
        'vr-mode': '',
        'vr-mode-ui': ''
      }
    },

    createdCallback: {
      value: function () {
        this.defaultLightsEnabled = true;
        this.insideIframe = window.top !== window.self;
        this.isScene = true;
        this.object3D = new THREE.Scene();
        this.init();
      }
    },

    init: {
      value: function () {
        this.isMobile = isMobile;
        this.behaviors = [];
        this.materials = {};
        this.paused = true;
        this.hasLoaded = false;
        this.originalHTML = this.innerHTML;
        this.setupCanvas();
        this.setupRenderer();
        this.resizeCanvas();
        this.setupDefaultLights();
        this.setupDefaultCamera();
      },
      writable: true
    },

    attachedCallback: {
      value: function () {
        if (this.isMobile) {
          injectMetaTags();
          this.wakelock = new Wakelock();
        }
        this.attachEventListeners();
        this.play();
      },
      writable: window.debug
    },

    attachEventListeners: {
      value: function () {
        var resizeCanvas = this.resizeCanvas.bind(this);
        this.setupKeyboardShortcuts();
        this.attachFullscreenListeners();
        // For Chrome (https://github.com/aframevr/aframe-core/issues/321).
        window.addEventListener('load', resizeCanvas);
      }
    },

    /**
     * Shuts down scene on detach.
     */
    detachedCallback: {
      value: function () {
        window.cancelAnimationFrame(this.animationFrameID);
        this.animationFrameID = null;
      }
    },

    /**
     * @param {object} behavior - Generally a component. Must implement a .update() method to
     *        be called on every tick.
     */
    addBehavior: {
      value: function (behavior) {
        this.behaviors.push(behavior);
      }
    },

    /**
     * Switch back to mono renderer if no longer in fullscreen VR.
     * Lock to landscape orientation on mobile when fullscreen.
     */
    attachFullscreenListeners: {
      value: function () {
        function fullscreenChange (e) {
          var fsElement = document.fullscreenElement ||
                          document.mozFullScreenElement ||
                          document.webkitFullscreenElement;
          if (window.screen.orientation) {
            // Lock to landscape orientation on mobile.
            if (fsElement && this.isMobile) {
              window.screen.orientation.lock('landscape');
            } else {
              window.screen.orientation.unlock();
            }
          }
          if (!fsElement) {
            this.setMonoRenderer();
          }
          if (this.wakelock) { this.wakelock.release(); }
        }
        document.addEventListener('mozfullscreenchange',
                                  fullscreenChange.bind(this));
        document.addEventListener('webkitfullscreenchange',
                                  fullscreenChange.bind(this));
      }
    },

    /**
     * Handles VR and fullscreen behavior for when we are inside an iframe.
     */
    attachMessageListeners: {
      value: function () {
        var self = this;
        window.addEventListener('message', function (e) {
          if (e.data) {
            switch (e.data.type) {
              case 'fullscreen': {
                switch (e.data.data) {
                  // Set renderer with fullscreen VR enter and exit.
                  case 'enter':
                    self.setStereoRenderer();
                    break;
                  case 'exit':
                    self.setMonoRenderer();
                    break;
                }
              }
            }
          }
        });
      }
    },

    getCanvasSize: {
      value: function () {
        var canvas = this.canvas;
        if (this.isMobile) {
          return {
            height: window.innerHeight,
            width: window.innerWidth
          };
        }
        canvas.style.width = '100%';
        canvas.style.height = '100%';
        return {
          height: canvas.offsetHeight,
          width: canvas.offsetWidth
        };
      }
    },

    /**
     * Sets a camera to be used by the renderer
     * It alse removes the default one if any and disables any other camera
     * in the scene
     *
     * @param {object} el - object holding an entity with a camera component or THREE camera.
     */
    setActiveCamera: {
      value: function (newCamera) {
        var defaultCameraWrapper = document.querySelector('[' + DEFAULT_CAMERA_ATTR + ']');
        var defaultCameraEl = defaultCameraWrapper && defaultCameraWrapper.querySelector('[camera]');
        if (newCamera instanceof AEntity) {
          newCamera.setAttribute('camera', 'active', true);
          if (newCamera !== defaultCameraEl) { this.removeDefaultCamera(); }
          return;
        }
        this.camera = newCamera;
        this.updateCameras();
      }
    },

    /**
     * Enables active camera and disables the rest
     * @type object - activeCamera - The camera used by the renderer
     */
    updateCameras: {
      value: function () {
        var activeCamera = this.camera;
        var activeCameraEl = activeCamera && activeCamera.el;
        var cameraEl;
        var sceneCameras = this.querySelectorAll('[camera]');
        var i;
        if (!activeCamera) {
          activeCameraEl = sceneCameras[sceneCameras.length - 1];
          activeCameraEl.setAttribute('camera', 'active', true);
          return;
        }

        for (i = 0; i < sceneCameras.length; ++i) {
          cameraEl = sceneCameras[i];

          if (activeCameraEl === cameraEl) {
            if (!this.paused) { activeCameraEl.play(); }
            continue;
          }
          cameraEl.setAttribute('camera', 'active', false);
          cameraEl.pause();
        }
      }
    },

    removeDefaultCamera: {
      value: function () {
        var cameraEl = this.camera && this.camera.el;
        if (!cameraEl) { return; }
        // Removes default camera if any
        var defaultCamera = document.querySelector('[' + DEFAULT_CAMERA_ATTR + ']');
        var defaultCameraEl = defaultCamera && defaultCamera.querySelector('[camera]');
        // Remove default camera if any
        if (defaultCameraEl && defaultCameraEl !== cameraEl) {
          this.removeChild(defaultCamera);
        }
      }
    },

    /**
     * Notify scene that light has been added and to remove the default.
     *
     * @param {object} el - element holding the light component.
     */
    registerLight: {
      value: function (el) {
        var defaultLights;
        if (this.defaultLightsEnabled && !el.hasAttribute(DEFAULT_LIGHT_ATTR)) {
          // User added a light, remove default lights through DOM.
          defaultLights = document.querySelectorAll('[' + DEFAULT_LIGHT_ATTR + ']');
          for (var i = 0; i < defaultLights.length; i++) {
            this.removeChild(defaultLights[i]);
          }
          this.defaultLightsEnabled = false;
        }
      }
    },

    /**
     * Keep track of material in case an update trigger is needed (e.g., fog).
     *
     * @param {object} material
     */
    registerMaterial: {
      value: function (material) {
        this.materials[material.uuid] = material;
      }
    },

    /**
     * @param {object} behavior - Generally a component. Has registered itself to behaviors.
     */
    removeBehavior: {
      value: function (behavior) {
        var behaviors = this.behaviors;
        var index = behaviors.indexOf(behavior);
        if (index === -1) { return; }
        behaviors.splice(index, 1);
      }
    },

    resizeCanvas: {
      value: function () {
        var camera = this.camera;
        // It's possible that the camera is not injected yet.
        if (!camera) { return; }
        var size = this.getCanvasSize();
        // Updates camera
        camera.aspect = size.width / size.height;
        camera.updateProjectionMatrix();
        // Notify the renderer of the size change
        this.renderer.setSize(size.width, size.height, true);
      },
      writable: window.debug
    },

    /**
     * Manually handles fullscreen for non-VR mobile where the renderer' VR
     * display is not polyfilled. Also sets wakelock for mobile in the process.
     *
     * Desktop just works so use the renderer.setFullScreen in that case.
     */
    setFullscreen: {
      value: function () {
        var canvas = this.canvas;

        if (!this.isMobile) {
          this.stereoRenderer.setFullScreen(true);
          return;
        }

        if (this.wakelock) { this.wakelock.request(); }

        if (canvas.requestFullscreen) {
          canvas.requestFullscreen();
        } else if (canvas.mozRequestFullScreen) {
          canvas.mozRequestFullScreen();
        } else if (canvas.webkitRequestFullscreen) {
          canvas.webkitRequestFullscreen();
        }
      }
    },

    /**
     * Sets renderer to mono (one eye) and resizes canvas.
     */
    setMonoRenderer: {
      value: function () {
        this.renderer = this.monoRenderer;
        this.resizeCanvas();
      }
    },

    setupCanvas: {
      value: function () {
        var canvasSelector = this.getAttribute('canvas');
        var canvas;

        if (canvasSelector) {
          canvas = this.canvas = document.querySelector(canvasSelector);
        } else {
          canvas = this.canvas = document.createElement('canvas');
          this.appendChild(canvas);
        }
        canvas.classList.add('a-canvas');
        // Prevents overscroll on mobile devices.
        canvas.addEventListener('touchmove', function (evt) {
          evt.preventDefault();
        });

        window.addEventListener('resize', this.resizeCanvas.bind(this), false);
        return canvas;
      }
    },

    /**
     * Creates a default camera if user has not added one during the initial.
     * scene traversal.
     *
     * Default camera height is at human level (~1.8m) and back such that
     * entities at the origin (0, 0, 0) are well-centered.
     */
    setupDefaultCamera: {
      value: function () {
        var cameraWrapperEl;
        var defaultCamera;
        var sceneCameras = this.querySelectorAll('[camera]');
        if (sceneCameras.length !== 0) { return; }

        // DOM calls to create camera.
        cameraWrapperEl = document.createElement('a-entity');
        cameraWrapperEl.setAttribute('position', {x: 0, y: 1.8, z: 4});
        cameraWrapperEl.setAttribute(DEFAULT_CAMERA_ATTR, '');
        defaultCamera = document.createElement('a-entity');
        defaultCamera.setAttribute('camera', {'active': true});
        defaultCamera.setAttribute('wasd-controls');
        defaultCamera.setAttribute('look-controls');
        cameraWrapperEl.appendChild(defaultCamera);
        this.appendChild(cameraWrapperEl);
      }
    },

    /**
     * Prescibe default lights to the scene.
     * Does so by injecting markup such that this state is not invisible.
     * These lights are removed if the user adds any lights.
     */
    setupDefaultLights: {
      value: function () {
        var ambientLight = document.createElement('a-entity');
        ambientLight.setAttribute('light',
                                  {color: '#fff', type: 'ambient'});
        ambientLight.setAttribute(DEFAULT_LIGHT_ATTR, '');
        this.appendChild(ambientLight);

        var directionalLight = document.createElement('a-entity');
        directionalLight.setAttribute('light', { color: '#fff', intensity: 0.2 });
        directionalLight.setAttribute('position', { x: -1, y: 2, z: 1 });
        directionalLight.setAttribute(DEFAULT_LIGHT_ATTR, '');
        this.appendChild(directionalLight);
      }
    },

    /**
     * Set up keyboard shortcuts to:
     *   - Enter VR when `f` is pressed.
     *   - Reset sensor when `z` is pressed.
     */
    setupKeyboardShortcuts: {
      value: function () {
        window.addEventListener('keyup', function (event) {
          if (event.keyCode === 90) {  // z.
            controls.resetSensor();
          }
        }, false);
      }
    },

    /**
     * Checks for VR mode before kicking off render loop.
     */
    setupLoader: {
      value: function () {
        var self = this;

        if (self.insideIframe) {
          self.attachMessageListeners();
          self.vrLoaderMode().then(function (isVr) {
            if (isVr) {
              self.setStereoRenderer();
            } else {
              self.setMonoRenderer();
            }
            window.top.postMessage({type: 'ready'}, '*');
          });
        }
      }
    },

    setupRenderer: {
      value: function () {
        var canvas = this.canvas;
        // Set at startup. To enable/disable antialias
        // at runttime we would have to recreate the whole context
        var antialias = this.getAttribute('antialias') === 'true';
        var renderer = this.renderer = this.monoRenderer =
          new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: antialias,
            alpha: true
          });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.sortObjects = false;
        AScene.renderer = renderer;
        this.stereoRenderer = new THREE.VREffect(renderer);
      },
      writable: window.debug
    },

    /**
     * Handler attached to elements to help scene know when to kick off.
     * Scene waits for all entities to load.
     */
    play: {
      value: function () {
        if (this.renderStarted) {
          AEntity.prototype.play.call(this);
          return;
        }

        this.addEventListener('loaded', function () {
          var self = this;
          if (this.renderStarted) { return; }

          this.setupLoader();
          AEntity.prototype.play.call(self);
          self.resizeCanvas();
          // Kick off render loop.
          self.render();
          self.renderStarted = true;
          self.emit('renderstart');
        });

        AEntity.prototype.load.call(this);
      }
    },

    /**
     * Stops tracking material.
     *
     * @param {object} material
     */
    unregisterMaterial: {
      value: function (material) {
        delete this.materials[material.uuid];
      }
    },

    /**
     * Trigger update to all registered materials.
     */
    updateMaterials: {
      value: function (material) {
        var materials = this.materials;
        Object.keys(materials).forEach(function (uuid) {
          materials[uuid].needsUpdate = true;
        });
      },
      writable: window.debug
    },

    /**
     * @returns {object} Promise that resolves a bool whether loader is in VR
     *          mode.
     */
    vrLoaderMode: {
      value: function () {
        return new Promise(function (resolve) {
          var channel = new MessageChannel();
          window.top.postMessage({type: 'checkVr'}, '*', [channel.port2]);
          channel.port1.onmessage = function (message) {
            resolve(!!message.data.data.isVr);
          };
        });
      }
    },

    /**
     * The render loop.
     *
     * Updates animations.
     * Updates behaviors.
     * Renders with request animation frame.
     */
    render: {
      value: function (t) {
        var camera = this.camera;
        TWEEN.update(t);
        this.behaviors.forEach(function (behavior) {
          behavior.update();
        });
        this.renderer.render(this.object3D, camera);
        this.animationFrameID = window.requestAnimationFrame(
          this.render.bind(this));
      },
      writable: window.debug
    },

    /**
     * Reloads the scene to the original DOM content
     * @type {bool} - paused - It reloads the scene with all the
     * dynamic behavior paused: dynamic components and animations
     */
    reload: {
      value: function (paused) {
        var self = this;
        if (paused) { this.pause(); }
        this.innerHTML = this.originalHTML;
        this.init();
        ANode.prototype.load.call(this, play);
        function play () {
          if (self.paused) { return; }
          AEntity.prototype.play.call(self);
        }
      }
    }

  })
});

/**
 * Injects the necessary metatags in the document for mobile support to:
 * 1. Prevent the user to zoom in the document
 * 2. Ensure that window.innerWidth and window.innerHeight have the correct
 *    values and the canvas is properly scaled
 * 3. To allow fullscreen mode when pinning a web app on the home screen on
 *    iOS.
 * Adapted from: https://www.reddit.com/r/web_design/comments/3la04p/
 *
 * @type {Object}
 */
function injectMetaTags () {
  var headEl;
  var meta = document.querySelector('meta[name="viewport"]');
  if (meta) { return; }  // Already exists.

  headEl = document.getElementsByTagName('head')[0];
  meta = document.createElement('meta');
  meta.name = 'viewport';
  meta.content =
    'width=device-width,initial-scale=1,shrink-to-fit=no,user-scalable=no';
  headEl.appendChild(meta);

  // iOS-specific meta tags for fullscreen when pinning to homescreen.
  meta = document.createElement('meta');
  meta.name = 'apple-mobile-web-app-capable';
  meta.content = 'yes';
  headEl.appendChild(meta);

  meta = document.createElement('meta');
  meta.name = 'apple-mobile-web-app-status-bar-style';
  meta.content = 'black';
  headEl.appendChild(meta);
}
