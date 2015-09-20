/* global assert, sinon, setup, suite, teardown, test */
suite('vr-light', function () {
  'use strict';

  window.debug = true;  // To allow sinon to spy on properties.

  require('vr-light');
  var THREE = require('vr-markup').THREE;
  var VRScene = require('core/vr-scene');

  setup(function () {
    this.sinon = sinon.sandbox.create();
    this.sinon.stub(VRScene.prototype, 'setupRenderer', function () {
      this.object3D = new THREE.Scene();
    });

    this.scene = document.createElement('vr-scene');
    document.body.appendChild(this.scene);
    this.el = document.createElement('vr-light');
  });

  teardown(function () {
    document.body.removeChild(this.scene);

    this.sinon.restore();
  });

  suite('attachedCallback', function () {
    setup(function () {
      this.scene.appendChild(this.el);
    });

    test('initializes a 3D object of instance Light', function (done) {
      this.el.addEventListener('loaded', function () {
        assert.isDefined(this.object3D);
        assert.ok(this.object3D instanceof THREE.Light);
        done();
      });
    });

    test('calls load method', function (done) {
      this.el.addEventListener('loaded', function () {
        done();
      });
    });
  });

  suite('attributeChangedCallback', function () {
    test('modifies on the same object3D object', function (done) {
      this.scene.appendChild(this.el);

      this.el.addEventListener('loaded', function () {
        var self = this;

        var uuid = self.object3D.uuid;
        self.setAttribute('color', '#AABBCC');

        setTimeout(function () {
          assert.equal(self.object3D.uuid, uuid);
          done();
        });
      });
    });

    test('can change color', function (done) {
      this.scene.appendChild(this.el);

      this.el.addEventListener('loaded', function () {
        var self = this;

        assert.deepEqual(this.object3D.color, new THREE.Color('#CCC'));
        self.setAttribute('color', '#AABBCC');

        setTimeout(function () {
          assert.deepEqual(self.object3D.color, new THREE.Color('#AABBCC'));
          done();
        });
      });
    });

    test('can change groundcolor', function (done) {
      this.el.setAttribute('type', 'hemisphere');
      this.scene.appendChild(this.el);

      this.el.addEventListener('loaded', function () {
        var self = this;

        assert.deepEqual(this.object3D.color, new THREE.Color('#CCC'));
        self.setAttribute('groundColor', '#DDD');

        setTimeout(function () {
          assert.deepEqual(self.object3D.groundColor, new THREE.Color('#DDD'));
          done();
        });
      });
    });

    test('can change intensity', function (done) {
      this.el.setAttribute('type', 'directional');
      this.scene.appendChild(this.el);

      this.el.addEventListener('loaded', function () {
        var self = this;

        assert.equal(this.object3D.intensity, 1.0);
        self.setAttribute('intensity', 2.0);

        setTimeout(function () {
          assert.equal(self.object3D.intensity, 2.0);
          done();
        });
      });
    });

    test('can change type', function (done) {
      this.el.setAttribute('type', 'directional');
      this.scene.appendChild(this.el);

      this.el.addEventListener('loaded', function () {
        var self = this;

        assert.equal(self.object3D.type, 'DirectionalLight');
        self.setAttribute('type', 'ambient');

        setTimeout(function () {
          assert.equal(self.object3D.type, 'AmbientLight');
          done();
        });
      });
    });
  });

  suite('getLight', function () {
    var assertLights = [
      ['ambient', THREE.AmbientLight],
      ['directional', THREE.DirectionalLight],
      ['hemisphere', THREE.HemisphereLight],
      ['point', THREE.PointLight],
      ['spot', THREE.SpotLight],
      ['kamehameha', THREE.AmbientLight]
    ];

    for (var i = 0; i < assertLights.length; i++) {
      // Generate a test for each type of light.
      var lightType = assertLights[i][0];
      var LightClass = assertLights[i][1];

      test('can set up ' + lightType + ' light', function (done) {
        this.el.setAttribute('type', lightType);
        this.scene.appendChild(this.el);

        this.el.addEventListener('loaded', function () {
          assert.equal(this.getLight(this).constructor, LightClass);
          done();
        });
      });
    }

    test('can set up light with angle', function () {
      this.el.setAttribute('type', 'spot');

      var light = this.el.getLight(this.el);
      assert.equal(light.angle, Math.PI / 3);

      this.el.setAttribute('angle', Math.PI / 2);
      light = this.el.getLight(this.el);
      assert.equal(light.angle, Math.PI / 2);
    });

    test('can set up light with color', function () {
      this.el.setAttribute('type', 'hemisphere');

      var light = this.el.getLight(this.el);
      assert.deepEqual(light.color, new THREE.Color('#CCC'));

      this.el.setAttribute('color', '#FF0000');
      light = this.el.getLight(this.el);
      assert.deepEqual(light.color, new THREE.Color('#FF0000'));
    });

    test('can set up light with decay', function () {
      this.el.setAttribute('type', 'point');

      var light = this.el.getLight(this.el);
      assert.equal(light.decay, 1);

      this.el.setAttribute('decay', 2);
      light = this.el.getLight(this.el);
      assert.equal(light.decay, 2);
    });

    test('can set up light with distance', function () {
      this.el.setAttribute('type', 'point');

      var light = this.el.getLight(this.el);
      assert.equal(light.distance, 0.0);

      this.el.setAttribute('distance', 1.0);
      light = this.el.getLight(this.el);
      assert.equal(light.distance, 1.0);
    });

    test('can set up light with exponent', function () {
      this.el.setAttribute('type', 'spot');

      var light = this.el.getLight(this.el);
      assert.equal(light.exponent, 10.0);

      this.el.setAttribute('exponent', 15.0);
      light = this.el.getLight(this.el);
      assert.deepEqual(light.exponent, 15.0);
    });

    test('can set up light with groundcolor', function () {
      this.el.setAttribute('type', 'hemisphere');

      var light = this.el.getLight(this.el);
      assert.deepEqual(light.groundColor, new THREE.Color('#CCC'));

      this.el.setAttribute('groundcolor', '#FF0000');
      light = this.el.getLight(this.el);
      assert.deepEqual(light.groundColor, new THREE.Color('#FF0000'));
    });

    test('can set up light with intensity', function () {
      this.el.setAttribute('type', 'directional');

      var light = this.el.getLight(this.el);
      assert.equal(light.intensity, 1);

      this.el.setAttribute('intensity', 5);
      light = this.el.getLight(this.el);
      assert.equal(light.intensity, 5);
    });
  });
});
