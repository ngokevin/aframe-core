/* global assert, process, setup, sinon, suite, test */
var VRObject = require('core/vr-object');
var THREE = require('vr-markup').THREE;
var helpers = require('../helpers.js');

var entityFactory = helpers.entityFactory;
var mixinFactory = helpers.mixinFactory;

suite('vr-object', function () {
  'use strict';

  setup(function (done) {
    var el = this.el = entityFactory();
    el.addEventListener('loaded', function () {
      done();
    });
  });

  test('adds itself to parent when attached', function (done) {
    var el = document.createElement('vr-object');
    var parentEl = this.el;

    el.object3D = new THREE.Mesh();
    parentEl.appendChild(el);
    el.addEventListener('loaded', function () {
      assert.equal(parentEl.object3D.children[0].uuid, el.object3D.uuid);
      done();
    });
  });

  suite('attachedCallback', function () {
    test('initializes 3D object', function () {
      assert.isDefined(this.el.object3D);
    });

    test('calls load method', function (done) {
      this.sinon.spy(VRObject.prototype, 'load');

      var scene = document.createElement('vr-scene');
      var el = document.createElement('vr-object');
      scene.appendChild(el);
      document.body.appendChild(scene);

      el.addEventListener('loaded', function () {
        sinon.assert.called(VRObject.prototype.load);
        done();
      });
    });
  });

  /**
   * Tests full component set + get flow on one of the most basic components.
   */
  suite('attributeChangedCallback', function () {
    test('can remove component', function (done) {
      var el = this.el;
      el.setAttribute('geometry', 'primitive: box');

      process.nextTick(function () {
        assert.ok('geometry' in el.components);
        el.removeAttribute('geometry');
        setTimeout(function () {
          assert.notOk('geometry' in el.components);
          done();
        });
      });
    });

    test('does not remove default component', function (done) {
      var el = this.el;
      process.nextTick(function () {
        assert.ok('position' in el.components);
        el.removeAttribute('position');
        setTimeout(function () {
          assert.ok('position' in el.components);
          done();
        });
      });
    });

    test('does not remove mixed-in component', function (done) {
      var el = this.el;
      var mixinId = 'geometry';
      mixinFactory(mixinId, {geometry: 'primitive: box'});
      el.setAttribute('mixin', mixinId);
      el.setAttribute('geometry', 'primitive: sphere');
      process.nextTick(function () {
        assert.ok('geometry' in el.components);
        el.removeAttribute('geometry');
        setTimeout(function () {
          // Geometry still exists since it is mixed in.
          assert.ok('geometry' in el.components);
          done();
        });
      });
    });

    test('can update component data', function () {
      var el = this.el;
      var position;

      el.setAttribute('position', '10 20 30');
      position = el.getAttribute('position');
      assert.deepEqual(position, {x: 10, y: 20, z: 30});

      el.setAttribute('position', {x: 30, y: 20, z: 10});
      position = el.getAttribute('position');
      assert.deepEqual(position, {x: 30, y: 20, z: 10});
    });
  });

  suite('detachedCallback', function () {
    test('removes itself from object parent', function (done) {
      var parentEl = this.el;
      var el = document.createElement('vr-object');

      parentEl.appendChild(el);

      el.addEventListener('loaded', function () {
        parentEl.removeChild(el);
        process.nextTick(function () {
          assert.equal(parentEl.object3D.children.length, 0);
          done();
        });
      });
    });

    test('removes itself from scene parent', function (done) {
      var el = this.el;
      var parentEl = el.parentNode;

      parentEl.appendChild(el);
      parentEl.removeChild(el);
      process.nextTick(function () {
        assert.equal(parentEl.object3D.children.length, 0);
        done();
      });
    });
  });

  suite('getAttribute', function () {
    test('returns null if component not set ', function () {
      assert.shallowDeepEqual(this.el.getAttribute('material'), null);
    });

    test('returns empty object if component is at defaults', function () {
      var el = this.el;
      el.setAttribute('material', '');
      process.nextTick(function () {
        assert.shallowDeepEqual(el.getAttribute('material'), {});
      });
    });

    test('returns parsed component data', function (done) {
      var componentData;
      var el = this.el;
      el.setAttribute('geometry', 'primitive: box; width: 5');
      process.nextTick(function () {
        componentData = el.getAttribute('geometry');
        assert.equal(componentData.width, 5);
        assert.notOk('height' in componentData);
        done();
      });
    });
  });

  suite('getComputedAttribute', function () {
    test('returns fully parsed component data', function (done) {
      var componentData;
      var el = this.el;
      el.setAttribute('geometry', 'primitive: box; width: 5');
      process.nextTick(function () {
        componentData = el.getComputedAttribute('geometry');
        assert.equal(componentData.primitive, 'box');
        assert.equal(componentData.width, 5);
        assert.ok('height' in componentData);
        done();
      });
    });
  });

  suite('setAttribute', function () {
    test('can set a component with an object', function (done) {
      var el = this.el;
      var material;
      var value = { color: '#F0F', metalness: 0.75 };
      el.setAttribute('material', value);
      process.nextTick(function () {
        material = el.getAttribute('material');
        assert.equal(material.color, '#F0F');
        assert.equal(material.metalness, 0.75);
        done();
      });
    });

    test('can update a component with an object', function (done) {
      var el = this.el;
      var material;
      var value = { color: '#000', metalness: 0.75 };
      el.setAttribute('material', 'color: #F0F; roughness: 0.25');
      process.nextTick(function () {
        el.setAttribute('material', value);
        process.nextTick(function () {
          material = el.getAttribute('material');
          assert.equal(material.color, '#000');
          assert.equal(material.roughness, 0.25);
          assert.equal(material.metalness, 0.75);
          done();
        });
      });
    });

    test('can set a single component via a single attribute', function () {
      var el = this.el;
      el.setAttribute('material', 'color', '#F0F');
      assert.equal(el.getAttribute('material').color, '#F0F');
    });

    test('can update a single component attribute', function () {
      var el = this.el;
      var material;
      el.setAttribute('material', 'color: #F0F; roughness: 0.25');
      assert.equal(el.getAttribute('material').roughness, 0.25);
      el.setAttribute('material', 'roughness', 0.75);
      process.nextTick(function () {
        material = el.getAttribute('material');
        assert.equal(material.color, '#F0F');
        assert.equal(material.roughness, 0.75);
      });
    });

    test('sets component attributes with an object for position', function () {
      var el = this.el;
      var positionObj = { x: 10, y: 20, z: 30 };
      el.setAttribute('position', positionObj);
      assert.ok(el.outerHTML.indexOf('position="10 20 30"') !== -1);
    });
  });
});
