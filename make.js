/*
  IMPORTANT: Don't use ES6 here, as some people are still on Node 4.
*/

/* global __dirname */

var b = require('substance-bundler')
var vfs = require('substance-bundler/extensions/vfs')
var fs = require('fs')
var path = require('path')

b.task('vfs', function() {
  vfs(b, {
    src: './data/**/*',
    dest: 'tmp/vfs.js',
    format: 'es', moduleName: 'VFS'
  })
})

b.task('jats', function() {
  const XSD_PATH = 'data/xsd/JATS-archive-oasis-article1-mathml3-elements.xsd'
  b.js('./src/xsd/compileXSD.js', {
    dest: 'tmp/compileXSD.js',
    format: 'cjs',
    external: ['substance']
  })
  b.custom('Compiling JATS xsd...', {
    src: XSD_PATH,
    dest: 'src/JATS.js',
    execute() {
      const compileXSD = require('./tmp/compileXSD')
      const xsdString = fs.readFileSync(XSD_PATH, 'utf8')
      const xsdData = compileXSD(xsdString)
      // TODO: eventually we should minify this, but for now pretty-print
      const code = `export default ${JSON.stringify(xsdData, 0, 2)}`
      b.writeSync('src/JATS.js', code)
    }
  })
})

b.task('printInfo', ['vfs'], () => {
  b.js('./src/printInfo.js', {
    dest: 'tmp/printInfo.js',
    format: 'cjs',
    alias: {
      'vfs': path.join(__dirname, 'tmp/vfs.js')
    },
    external: ['substance']
  })
})

b.task('definition', ['printInfo'], function() {
  b.custom('Generating info...', {
    src: 'tmp/printInfo.js',
    dest: 'proposal/JATS.md',
    execute() {
      const printInfo = require('./tmp/printInfo')
      b.writeSync('proposal/JATS.md', printInfo({
        xsdPath: 'data/xsd/JATS-archive-oasis-article1-mathml3-elements.xsd',
        structure: true
      }))
    }
  })
})

b.task('classification', ['printInfo'], function() {
  b.custom('Generating info...', {
    src: 'tmp/printInfo.js',
    dest: 'proposal/CLASSIFICATION.md',
    execute() {
      const printInfo = require('./tmp/printInfo')
      b.writeSync('proposal/CLASSIFICATION.md', printInfo({
        xsdPath: 'data/xsd/JATS-archive-oasis-article1-mathml3-elements.xsd',
        classification: true
      }))
    }
  })
})

b.task('stats', ['vfs', 'jats'], () => {
  b.js('./src/stats.js', {
    dest: 'tmp/stats.js',
    format: 'cjs',
    alias: {
      'vfs': path.join(__dirname, 'tmp/vfs.js')
    },
    external: ['substance']
  })
})

b.task('demo', ['vfs'], () => {
  b.js('./src/demo.js', {
    dest: 'tmp/demo.js',
    format: 'umd', moduleName: 'xsd',
    alias: {
      'vfs': path.join(__dirname, 'tmp/vfs.js')
    },
    external: {
      substance: 'window.substance'
    }
  })
})

/* HTTP server */
b.setServerPort(5556)
b.serve({ static: true, route: '/', folder: '.' })
