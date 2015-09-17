/**
 * http://www.alexandre-pestana.com/webgl/PBRViewer.html
*/
var fragmentShader = require('./fragment.glsl');
var vertexShader = require('./vertex.glsl');

module.exports = function (THREE) {
	return {
		vertexShader: vertexShader,
		fragmentShader: fragmentShader
	};
};
