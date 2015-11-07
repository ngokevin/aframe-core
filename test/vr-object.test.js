/* global assert, expect, process, setup, sinon, suite, teardown, test */
suite('vr-object', function () {
  'use strict';

  var VRObject = require('core/vr-object');

  suite.only('attachedCallback', function () {
    setup(function () {
      this.sinon.spy(VRObject.prototype, 'attachedCallback');
      this.sinon.spy(VRObject.prototype, 'load');
      this.el = document.createElement('vr-object');
      document.body.appendChild(this.el);
    });

    teardown(function () {
      this.el.parentNode.removeChild(this.el);
    });

    test('initializes 3D object', function (done) {
      var self = this;
      self.el.addEventListener('loaded', function () {
        assert.isDefined(self.el.object3D);
        done();
      });
    });

    test('calls load method', function (done) {
      this.el.addEventListener('loaded', function () {
        sinon.assert.called(VRObject.prototype.load);
        done();
      });
    });
  });

  suite('addToParent', function () {
    setup(function () {
      this.sinon.spy(VRObject.prototype, 'attachedCallback');
      this.sinon.spy(VRObject.prototype, 'load');
      this.el = document.createElement('vr-object');
      this.sinon.stub(this.el, 'addToParent');
    });

    test('called if loaded', function (done) {
      var el = this.el;
      document.body.appendChild(el);
      el.addEventListener('loaded', function () {
        sinon.assert.called(el.addToParent);
        done();
      });
    });
  });

  suite('attributeChangedCallback', function () {
    setup(function () {
      this.sinon.spy(VRObject.prototype, 'attributeChangedCallback');
      this.el = document.createElement('vr-object');
      document.body.appendChild(this.el);
    });

    teardown(function () {
      this.el.parentNode.removeChild(this.el);
    });

    test('called on attribute change', function (done) {
      var el = this.el;
      var position = {x: 0, y: 10, z: 0};
      el.setAttribute('position', position);
      process.nextTick(function () {
        sinon.assert.calledWith(
          VRObject.prototype.attributeChangedCallback,
          'position', null, position);
        done();
      });
    });

    test('can change position with string', function () {
      var el = this.el;
      var position;
      el.setAttribute('position', '10 20 30');
      position = el.getAttribute('position');
      assert.shallowDeepEqual(position, {x: 10, y: 20, z: 30});
    });

    test('can change position with object', function () {
      var el = this.el;
      var position;
      el.setAttribute('position', {x: 10, y: 20, z: 30});
      position = el.getAttribute('position');
      assert.shallowDeepEqual(position, {x: 10, y: 20, z: 30});
    });

    test('can change rotation with string', function () {
      var el = this.el;
      var rotation;
      el.setAttribute('rotation', '30 45 60');
      rotation = el.getAttribute('rotation');
      assert.shallowDeepEqual(rotation, {x: 30, y: 45, z: 60});
    });

    test('can change rotation with object', function () {
      var el = this.el;
      var rotation;
      el.setAttribute('rotation', {x: 30, y: 45, z: 60});
      rotation = el.getAttribute('rotation');
      assert.shallowDeepEqual(rotation, {x: 30, y: 45, z: 60});
    });

    test('can change scale with string', function () {
      var el = this.el;
      var scale;
      el.setAttribute('scale', '2.0 4.0 8.0');
      scale = el.getAttribute('scale');
      assert.shallowDeepEqual(scale, {x: 2.0, y: 4.0, z: 8.0});
    });

    test('can change scale with object', function () {
      var el = this.el;
      var scale;
      el.setAttribute('scale', {x: 2.0, y: 4.0, z: 8.0});
      scale = el.getAttribute('scale');
      assert.shallowDeepEqual(scale, {x: 2.0, y: 4.0, z: 8.0});
    });

    test('maintains rotation order', function (done) {
      var el = this.el;
      el.addEventListener('loaded', function () {
        el.setAttribute('scale', '2.0 4.0 8.0');
        assert.equal(el.object3D.rotation.order, 'YXZ');
        done();
      });
    });
  });

  suite('detachedCallback', function () {
    setup(function () {
      this.sinon.spy(VRObject.prototype, 'detachedCallback');
      this.parent = document.createElement('div');
      document.body.appendChild(this.parent);
      this.el = document.createElement('vr-object');
      this.sinon.stub(this.el, 'addToParent');
      this.parent.appendChild(this.el);
      this.el.parentEl = {remove: function () {}};
      this.parentMock = this.sinon.mock(this.el.parentEl);
    });

    test('called after removing element from parent', function (done) {
      var el = this.el;
      this.parent.removeChild(el);
      process.nextTick(function () {
        sinon.assert.called(VRObject.prototype.detachedCallback);
        done();
      });
    });

    test('removes object3D from parent', function (done) {
      var el = this.el;
      var parentMock = this.parentMock.expects('remove').once();
      this.parent.removeChild(el);
      process.nextTick(function () {
        parentMock.verify();
        sinon.assert.called(VRObject.prototype.detachedCallback);
        done();
      });
    });
  });

  suite('add', function () {
    setup(function () {
      this.parentEl = document.createElement('vr-object');
      document.body.appendChild(this.parentEl);
      this.childEl = document.createElement('vr-object');
    });

    teardown(function () {
      this.parentEl.parentNode.removeChild(this.parentEl);
    });

    test('calls object3D.add when child is added', function (done) {
      var self = this;
      self.childEl.object3D = {};
      self.parentEl.addEventListener('loaded', function () {
        // Mock parentEl.object3D after it has loaded.
        var object3DMock = self.sinon.mock(self.parentEl.object3D);
        object3DMock.expects('add').once();

        self.parentEl.add(self.childEl);

        object3DMock.verify();
        done();
      });
    });

    test('does not call object3D.add on undefined object3D', function (done) {
      var self = this;
      self.childEl.object3D = null;

      self.parentEl.addEventListener('loaded', function () {
        // Mock parentEl.object3D after it has loaded.
        var object3DMock = self.sinon.mock(self.parentEl.object3D);
        object3DMock.expects('add').never();

        // Try adding child when child is not yet loaded.
        try {
          self.parent.add(this.childEl);
        } catch (e) {
          object3DMock.verify();
          done();
        }
      });
    });
  });

  suite('addToParent', function () {
    setup(function () {
      var parent = this.parent = document.createElement('vr-object');
      var child = this.child = document.createElement('vr-object');
      sinon.stub(parent, 'add');
      parent.appendChild(child);
    });

    teardown(function () {
      this.parent = null;
      this.child = null;
    });

    test('add is called if the child has a parent and has not been added already', function () {
      this.child.attachedToParent = false;
      this.child.addToParent();
      sinon.assert.called(this.parent.add);
    });

    test('the child element is flagged as attached after being added to parent', function () {
      this.child.attachedToParent = false;
      this.child.addToParent();
      assert.isTrue(this.child.attachedToParent);
    });

    test('the child element is not added to parent if it is already attached', function () {
      this.child.attachedToParent = true;
      this.child.addToParent();
      sinon.assert.notCalled(this.parent.add);
    });
  });

  suite('load', function () {
    setup(function () {
      this.sinon.spy(VRObject.prototype, 'load');
    });

    test('not called on element creation', function (done) {
      document.createElement('vr-object');
      process.nextTick(function () {
        sinon.assert.notCalled(VRObject.prototype.load);
        done();
      });
    });

    test('runs on element attached', function (done) {
      document.body.appendChild(document.createElement('vr-object'));
      process.nextTick(function () {
        sinon.assert.called(VRObject.prototype.load);
        done();
      });
    });

    test('returns early if object3D already loaded', function (done) {
      var self = this;
      var el = document.createElement('vr-object');
      document.body.appendChild(el);

      el.addEventListener('loaded', function () {
        self.sinon.spy(VRObject.prototype, 'addToParent');
        self.sinon.spy(VRObject.prototype, 'initAttributes');
        self.sinon.spy(VRObject.prototype, 'attributeChangedCallback');

        sinon.assert.notCalled(VRObject.prototype.addToParent);
        sinon.assert.notCalled(VRObject.prototype.initAttributes);
        sinon.assert.notCalled(VRObject.prototype.attributeChangedCallback);
        done();
      });
    });
  });

  suite('setAttribute', function () {
    setup(function () {
      this.el = document.createElement('vr-object');
      document.body.appendChild(this.el);
    });

    teardown(function () {
      this.el.parentNode.removeChild(this.el);
    });

    test('sets position when passing object', function () {
      var positionObj = {
        x: 10,
        y: 20,
        z: 30
      };
      this.el.setAttribute('position', positionObj);
      var position = this.el.getAttribute('position');
      assert.deepEqual(position, positionObj);
    });

    test('sets position when passing string', function () {
      var positionObj = {
        x: 10,
        y: 20,
        z: 30
      };
      var positionStr = '10 20 30';
      this.el.setAttribute('position', positionStr);
      var position = this.el.getAttribute('position');
      assert.deepEqual(position, positionObj);
    });

    test('defaults position to 0 0 0', function () {
      this.el.setAttribute('position', '');
      var position = this.el.getAttribute('position');
      assert.deepEqual(position, {x: 0, y: 0, z: 0});
    });
  });

  suite('remove', function () {
    setup(function () {
      this.parentEl = document.createElement('vr-object');
      this.childEl = document.createElement('vr-object');

      this.parentEl.appendChild(this.childEl);
      document.body.appendChild(this.parentEl);
    });

    teardown(function () {
      this.parentEl.parentNode.removeChild(this.parentEl);
    });

    test('called on object3D when removing child', function () {
      var self = this;
      var object3DMock = self.sinon.mock(self.parentEl.object3D);

      self.parentEl.addEventListener('loaded', function () {
        object3DMock.expects('remove').once();
        self.parentEl.remove(self.childEl);
        object3DMock.verify();
      });
    });
  });

  suite('initAttributes', function () {
    setup(function () {
      this.el = document.createElement('vr-object');
      document.body.appendChild(this.el);
    });

    teardown(function () {
      this.el.parentNode.removeChild(this.el);
    });

    test('sets defaults for pos/rot/scale if not defined', function () {
      var el = this.el;
      var defaultPosition = {x: 0, y: 0, z: 0};
      var defaultRotation = {x: 0, y: 0, z: 0};
      var defaultScale = {x: 1, y: 1, z: 1};
      el.setAttribute('position', '');
      el.setAttribute('rotation', '');
      el.setAttribute('scale', '');
      el.initAttributes();
      var position = this.el.getAttribute('position');
      var rotation = this.el.getAttribute('rotation');
      var scale = this.el.getAttribute('scale');
      assert.deepEqual(position, defaultPosition);
      assert.deepEqual(rotation, defaultRotation);
      assert.deepEqual(scale, defaultScale);
    });

    test('does not set defaults for pos/rot/scale if defined', function () {
      var el = this.el;
      var customPosition = {x: -10, y: -20, z: -30};
      var customRotation = {x: -45, y: 0, z: 45};
      var customScale = {x: 2.5, y: 3.5, z: 4.5};
      el.setAttribute('position', customPosition);
      el.setAttribute('rotation', customRotation);
      el.setAttribute('scale', customScale);
      el.initAttributes();
      var position = this.el.getAttribute('position');
      var rotation = this.el.getAttribute('rotation');
      var scale = this.el.getAttribute('scale');
      assert.deepEqual(position, customPosition);
      assert.deepEqual(rotation, customRotation);
      assert.deepEqual(scale, customScale);
    });
  });

  suite('getAttribute', function () {
    setup(function () {
      this.el = document.createElement('vr-object');
      document.body.appendChild(this.el);
    });

    teardown(function () {
      this.el.parentNode.removeChild(this.el);
    });

    test('returns null for undefined attribute', function () {
      var el = this.el;
      assert.notInclude(el.outerHTML, 'loop=');
      assert.isNull(el.getAttribute('loop'));
    });

    test('returns value for undef bool attr with default', function () {
      var el = this.el;
      el.removeAttribute('autoplay');
      assert.notInclude(el.outerHTML, 'autoplay=');
      assert.isTrue(el.getAttribute('autoplay', true));
    });

    test('returns value for undef numerical attr with default', function () {
      var el = this.el;
      assert.notInclude(el.outerHTML, 'height=');
      assert.equal(el.getAttribute('height', 2.0), 2.0);
    });

    test('returns value for an undef object attr with default', function () {
      var el = this.el;
      assert.notInclude(el.outerHTML, 'voodoo=');
      var val = {x: 5, y: 10, z: 15};
      assert.equal(el.getAttribute('voodoo', val), val);
    });

    test('returns correct default for position', function (done) {
      var el = this.el;
      el.addEventListener('loaded', function () {
        assert.include(el.outerHTML, 'position="0 0 0"');
        assert.deepEqual(el.getAttribute('position'), {x: 0, y: 0, z: 0});
        done();
      });
    });

    test('returns correct default for "rotation', function () {
      assert.deepEqual(this.el.getAttribute('rotation'), {x: 0, y: 0, z: 0});
    });

    test('returns correct default for scale', function () {
      assert.deepEqual(this.el.getAttribute('scale'), {x: 1, y: 1, z: 1});
    });

    test('returns correct value for defined position', function () {
      var el = this.el;
      var positionObj = {x: 23, y: 24, z: 25};
      el.setAttribute('position', positionObj);
      assert.include(el.outerHTML, 'position="23 24 25"');
      var position = el.getAttribute('position');
      assert.deepEqual(position, positionObj);
    });

    test('returns correct value for defined rotation', function () {
      var el = this.el;
      var rotationObj = {x: 3, y: 2, z: 1};
      el.setAttribute('rotation', rotationObj);
      assert.include(el.outerHTML, 'rotation="3 2 1"');
      var rotation = el.getAttribute('rotation');
      assert.deepEqual(rotation, rotationObj);
    });

    test('returns correct value for defined to', function () {
      var el = this.el;
      el.setAttribute('to', '5');
      assert.deepEqual(el.getAttribute('to'), {x: 5, y: 0, z: 0});
    });

    test('returns value for bool attr with a default', function () {
      var el = this.el;
      var val = true;
      el.setAttribute('loop', val);
      assert.include(el.outerHTML, 'loop="true"');
      assert.isTrue(el.getAttribute('loop', false));
    });

    test('returns value for a numerical attr with default', function () {
      var el = this.el;
      var val = 5.9;
      el.setAttribute('height', val);
      assert.include(el.outerHTML, 'height="5.9"');
      assert.equal(el.getAttribute('height', 2.0), val);
    });

    test('returns correct value for an object attr with default', function () {
      var el = this.el;
      el.setAttribute('voodoo', '5 10 15');
      assert.include(el.outerHTML, 'voodoo="5 10 15"');
      var val = {x: 5, y: 10, z: 15};
      assert.deepEqual(el.getAttribute('voodoo', val), val);
    });
  });
});
