/* global performance, MessageChannel */
var VRMarkup = require('vr-markup');

var THREE = VRMarkup.THREE;
var VREffector = VRMarkup.VREffector;

var VRRender = document.registerElement(
  'vr-render',
  {
    prototype: Object.create(
      VREffector.prototype, {
        createdCallback: {
          value: function () {
            this.setupCanvas();
            this.setupRenderer();

            this.addEventListener('attatched', this.onElementCreated.bind(this));

            this.addEventListener('detatched', this.shutdown.bind(this));
          }
        },

        onElementCreated: {
          value: function () {
            var attatchedElement = this.attatchedTo.element;

            // todo: this dependencies should be managed by effector prototype ie: importEffector(['camera'])
            // get camera effector
            var camera = attatchedElement.attatchedTo.filter(function (effector) {
              return effector.tagName === 'VR-CAMERA';
            })[0];

            if (!camera) {
              console.error('[vr-render] cannot render without vr-camera effector.');
              return;
            }
            this.camera = camera.object3D;

            // walk up the tree till we get a scene context
            // todo: part of vr-object?
            function findParentScene (element) {
              if (element.object3D.type !== 'Scene') {
                return findParentScene(element.parentElement);
              } else {
                return element.object3D;
              }
            }

            var scene = this.scene = findParentScene(attatchedElement);

            if (!scene) {
              console.error('[vr-render] cannot render without being child of scene.');
              return false;
            }

            window.addEventListener('resize', this.resizeCanvas.bind(this), false);
            this.resizeCanvas();
            // kick off rendering
            this.render(performance.now());
            this.renderLoopStarted = true;
          }
        },

        detachedCallback: {
          value: function () {
            this.shutdown();
          }
        },

        shutdown: {
          value: function () {
            window.cancelAnimationFrame(this.animationFrameID);
          }
        },

        attachMessageListeners: {
          value: function () {
            var self = this;
            window.addEventListener('message', function (e) {
              if (e.data && e.data.type === 'fullscreen') {
                switch (e.data.data) {
                  // set renderer with fullscreen VR enter and exit.
                  case 'enter':
                    self.setStereoRenderer();
                    break;
                  case 'exit':
                    self.setMonoRenderer();
                    break;
                }
              }
            });
          }
        },

        attachFullscreenListeners: {
          value: function () {
            // handle fullscreen changes
            document.addEventListener('mozfullscreenchange', this.fullscreenChange.bind(this));
            document.addEventListener('webkitfullscreenchange', this.fullscreenChange.bind(this));
          }
        },

        fullscreenChange: {
          value: function (e) {
            // switch back to the mono renderer if we have dropped out of fullscreen VR mode.
            var fsElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
            if (!fsElement) {
              this.renderer = this.monoRenderer;
            }
          }
        },

        createEnterVrButton: {
          value: function () {
            var vrButton = document.createElement('button');
            vrButton.textContent = 'Enter VR';
            vrButton.className = 'vr-button';
            document.body.appendChild(vrButton);
            vrButton.addEventListener('click', this.enterVR.bind(this));
          }
        },

        // returns a promise that resolves to true if loader is in VR mode.
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

        setupLoader: {
          value: function () {
            var self = this;
            // inside loader, check for vr mode before kicking off render loop.
            if (window.top !== window.self) {
              self.attachMessageListeners();
              self.vrLoaderMode().then(function (isVr) {
                if (isVr) {
                  self.setStereoRenderer();
                } else {
                  self.setMonoRenderer();
                }
                window.top.postMessage({type: 'ready'}, '*');
              });
            } else {
              self.createEnterVrButton();
            }
          }
        },

        setStereoRenderer: {
          value: function () {
            this.renderer = this.stereoRenderer;
            this.resizeCanvas();
          }
        },

        setMonoRenderer: {
          value: function () {
            this.renderer = this.monoRenderer;
            this.resizeCanvas();
          }
        },

        setupCanvas: {
          value: function () {
            var canvas = this.canvas = document.createElement('canvas');
            this.appendChild(canvas);
          }
        },

        enterVR: {
          value: function () {
            this.renderer = this.stereoRenderer;
            this.stereoRenderer.setFullScreen(true);
          }
        },

        setupRenderer: {
          value: function () {
            var canvas = this.canvas;
            var renderer = this.renderer = this.monoRenderer =
              (VRRender && VRRender.renderer) || // To prevent creating multiple rendering contexts
              new THREE.WebGLRenderer({canvas: canvas, antialias: true, alpha: true});
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.sortObjects = false;
            VRRender.renderer = renderer;

            this.stereoRenderer = new THREE.VREffect(renderer);
          }
        },

        resizeCanvas: {
          value: function () {
            var canvas = this.canvas;
            var camera = this.camera;
            // Make it visually fill the positioned parent
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            // Set the internal size to match
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            // Updates camera
            camera.aspect = canvas.offsetWidth / canvas.offsetHeight;
            camera.updateProjectionMatrix();
            // Notify the renderer of the size change
            this.renderer.setSize(canvas.width, canvas.height);
          }
        },

        add: {
          value: function (el) {
            if (!el.object3D) { return; }
            this.object3D.add(el.object3D);
          }
        },

        addBehavior: {
          value: function (behavior) {
            this.behaviors.push(behavior);
          }
        },

        remove: {
          value: function (el) {
            if (!el.object3D) { return; }
            this.object3D.remove(el.object3D);
          }
        },

        render: {
          value: function (t) {
            this.renderer.render(this.scene, this.camera);
            this.animationFrameID = window.requestAnimationFrame(this.render.bind(this));
          }
        }
      }
    )
  }
);
