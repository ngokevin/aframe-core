var webpack = require('webpack');

var IS_PRODUCTION = process.env.NODE_ENV === 'production';
var IS_DEV = !IS_PRODUCTION;

/* ENTRY POINTS */
var ENTRY_POINTS = [
  './src/vr-markup'
];
if (IS_DEV) {
  // Hot-reload locally.
  ENTRY_POINTS = [
    'webpack-dev-server/client',
    'webpack/hot/only-dev-server'
  ].concat(ENTRY_POINTS);
}

/* LOADERS */
var LOADERS = [
  {
    loader: 'style-loader!css-loader!autoprefixer-loader',
    test: /\.css/
  },
  {
    loader: 'shader-loader',
    test: /\.glsl/
  }
];

/* PLUGINS */
var PLUGINS = [
  // Point references to THREE to our installation of three.js.
  new webpack.ProvidePlugin({
    'THREE': 'three'
  })
];
if (IS_PRODUCTION) {
  // Produce a minified bundle.
  PLUGINS.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = {
  devtool: IS_DEV ? '#inline-source-map' : '',
  entry: ENTRY_POINTS,
  output: {
    filename: IS_PRODUCTION ? 'vr-markup.min.js' : 'vr-markup.js',
    library: 'VRMarkup',
    libraryTarget: 'umd',
    // Bundle will be output at ./build.
    path: './build',
    // Bundle will be served as vr-markup.js at '/' on the dev server.
    publicPath: '/'
  },
  plugins: PLUGINS,
  module: {
    loaders: LOADERS
  },
  resolve: {
    alias: {
      // Remove when three bumps npm. Maintain our fork in the meantime.
      'three': 'three-dev'
    },
    extensions: ['', '.glsl', '.js', '.css'],
    modulesDirectories: [
      'style',
      'src',
      'src/shaders',
      'node_modules'
    ]
  }
};
