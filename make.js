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
  const XSD_PATH = 'data/JATS/JATS-archive-oasis-article1-mathml3-elements.xsd'
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
      const code = `export default ${JSON.stringify(xsdData)}`
      b.writeSync('src/JATS.js', code)
    }
  })
})

b.task('proposal', ['vfs'], function() {
  b.js('./src/printInfo.js', {
    dest: 'tmp/printInfo.js',
    format: 'cjs',
    alias: {
      'vfs': path.join(__dirname, 'tmp/vfs.js')
    },
    external: ['substance']
  })
  b.custom('Generating info...', {
    src: 'tmp/printInfo.js',
    dest: 'proposal/JATS.md',
    execute() {
      const printInfo = require('./tmp/printInfo')
      b.writeSync('proposal/JATS.md', printInfo())
    }
  })
})

b.task('xsd', () => {
  b.js('./src/xsd/demo.js', {
    dest: 'dist/demo.js',
    format: 'umd', moduleName: 'xsd',
    external: {
      substance: 'window.substance',
      vfs: 'window.VFS'
    }
  })
})

b.task('default', ['vfs', 'jats', 'proposal', 'xsd'])

/* HTTP server */
b.setServerPort(5556)
b.serve({ static: true, route: '/', folder: 'dist' })
