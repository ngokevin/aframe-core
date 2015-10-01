var registerComponent = require('../core/register-component', this);

module.exports.Component = registerComponent('changeMaterial', {
  update: {value: function () {
      if (!this.binded) {
        var listenTo = this.data.on || 'click';
        this.el.addEventListener(listenTo, function () {
          this.el.setAttribute('material', 'color: ' + Math.random() * 0xffffff);
        }.bind(this));
        this.binded = true;
      }
    }
  }
});
