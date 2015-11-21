/* global assert, process, setup, suite, test */
var entityFactory = require('../helpers.js').entityFactory;

suite.only('pivot', function () {
  'use strict';

  var DEFAULT_VERTICES = [
    {x: 0.5, y: 0.5, z: 0.5}, {x: 0.5, y: 0.5, z: -0.5}, {x: 0.5, y: -0.5, z: 0.5},
    {x: 0.5, y: -0.5, z: -0.5}, {x: -0.5, y: 0.5, z: -0.5}, {x: -0.5, y: 0.5, z: 0.5},
    {x: -0.5, y: -0.5, z: -0.5}, {x: -0.5, y: -0.5, z: 0.5}
  ];

  setup(function (done) {
    var el = this.el = entityFactory();
    el.setAttribute('geometry', 'primitive: box; depth: 1; height: 1; width: 1');
    el.setAttribute('pivot', '');
    el.addEventListener('loaded', function () {
      done();
    });
  });

  suite('update', function () {
    test('defaults pivot to center', function () {
      assert.shallowDeepEqual(this.el.object3D.geometry.vertices, DEFAULT_VERTICES);
    });

    test('can set pivot', function (done) {
      var el = this.el;
      el.setAttribute('pivot', '-2 4 2');
      setTimeout(function () {
        assert.shallowDeepEqual(el.object3D.geometry.vertices, [
          {x: -1.5, y: 4.5, z: 2.5}, {x: -1.5, y: 4.5, z: 1.5}, {x: -1.5, y: 3.5, z: 2.5},
          {x: -1.5, y: 3.5, z: 1.5}, {x: -2.5, y: 4.5, z: 1.5}, {x: -2.5, y: 4.5, z: 2.5},
          {x: -2.5, y: 3.5, z: 1.5}, {x: -2.5, y: 3.5, z: 2.5}]);
        done();
      });
    });

    test('can update pivot', function (done) {
      var el = this.el;
      el.setAttribute('pivot', '-2 4 2');
      setTimeout(function () {
        el.setAttribute('pivot', '0 0 0');
        setTimeout(function () {
          assert.shallowDeepEqual(el.object3D.geometry.vertices, DEFAULT_VERTICES);
          done();
        });
      });
    });
  });

  suite('remove', function () {
    test('resets pivot', function (done) {
      var el = this.el;
      el.setAttribute('pivot', '-2 4 2');
      setTimeout(function () {
        el.removeAttribute('pivot');
        setTimeout(function () {
          assert.shallowDeepEqual(el.object3D.geometry.vertices, DEFAULT_VERTICES);
          done();
        });
      });
    });
  });
});
