module.exports = {
  spyPrototype: function (proto, sandbox) {
    Object.keys(proto).forEach(function (key) {
      sandbox.spy(proto, key);
    });
  }
};
