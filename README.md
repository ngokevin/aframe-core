# aframe-core [![Build Status](https://magnum.travis-ci.com/MozVR/aframe-core.svg?token=65kfkjdCsqTSnqx7qtHg&branch=dev)](https://magnum.travis-ci.com/MozVR/aframe-core)

The goal of this project is to design a set of HTML tags to describe 3D scenes in the browser.

We use three.js to render the new tags but the aim is to provide a way to declare 3D scenes independent from the rendering engine.


## Usage

__NOTE:__ For folks creating scenes and third-party elements, we recommend getting started by instead using the [__`aframe`__ library](https://github.com/MozVR/aframe), a set of core resuable elements.

Proceed below if you would like to use the minimal set of primitive elements available here in __`aframe-core`__.

### Downloads

To get started, simply include these files in your project:

* [`aframe-core.min.js`](dist/aframe-core.min.js)
* [`aframe-core.min.css`](dist/aframe-core.min.css)

Or for local development you can use the unminified bundles (with source maps for the JS):

* [`aframe-core.js`](dist/aframe-core.js)
* [`aframe-core.css`](dist/aframe-core.css)

__Also, be sure to check out these awesome examples:__

* [__`aframe-core`__ examples](http://mozvr.github.io/aframe-core/examples/) ([source](https://github.com/MozVR/aframe-core/tree/master/examples/))
* [__`aframe`__ examples](http://mozvr.github.io/aframe/examples/) ([source](https://github.com/MozVR/aframe/tree/master/examples/))

### npm

First install from npm:

    npm install @mozvr/aframe-core

And in your Browserify/Webpack modules, simply require the module:

    require('@mozvr/aframe-core')

## Local installation

    git clone https://github.com/MozVR/aframe-core.git
    cd aframe-core

## Local development

    npm install
    npm start
    open http://localhost:9001/examples/

If you'd like to hack on this project and don't have access to the npm repos, contact @cvan and he'll give you the info you'll need to log in:

    npm login

## Running tests

    npm test

## Pulling the lastest remote changes

    git checkout dev
    git pull --rebase
    npm install
    npm start
    open http://localhost:9001/examples/

## Releasing and publishing a new version to npm

Assuming you want to publish a version of `dev` to the private package for testing:

    npm run release

And to push the tags to GitHub:

   git push --tags

## Updating `dist` files

    npm run dist
    git commit -am 'Bump dist'

## Publishing to GitHub Pages

To publish to __https://mozvr.github.io/aframe-core/__:

    npm run ghpages

To publish to __https://cvan.github.io/aframe-core/__:

    npm run ghpages cvan


## License

This program is free software and is distributed under an [MIT License](LICENSE).
