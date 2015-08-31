# VR MARKUP

The goal of this project is to design a set of HTML tags to describe 3D scenes in the browser.

We use three.js to render the new tags but the aim is to provide a way to declare 3D scenes independent from the rendering engine.


## Usage

If you would like to embed this library in your project, include these files:

* [`vr-markup-min.js`](dist/vr-markup-min.js)
* [`vr-markup.css`](dist/vr-markup.css)
* [`vr-markup.js`](dist/vr-markup.js)

__Also, be sure to check out the awesome [examples](examples/).__


## Development

To hack on this library, you'll just need Node.

### Installation

Install the Node dependencies:

    npm i

### Usage

To recompile assets when files changes, you can run the gulp file watcher:

    npm start
