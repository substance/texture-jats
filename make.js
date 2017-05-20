/*
  IMPORTANT: Don't use ES6 here, as some people are still on Node 4.
*/

/* global __dirname */

const { map } = require('substance')
const b = require('substance-bundler')
const vfs = require('substance-bundler/extensions/vfs')
const fs = require('fs')
const path = require('path')

const RNG_SEARCH_DIRS = [
  path.join(__dirname, 'data', 'rng'),
  path.join(__dirname, 'src', 'rng')
]

b.task('vfs', function() {
  vfs(b, {
    src: ['./data/**/*', './src/rng/*'],
    dest: 'tmp/vfs.js',
    format: 'es', moduleName: 'VFS'
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

b.task('tools', () => {
  b.js('./src/tools.js', {
    dest: 'tmp/tools.js',
    format: 'cjs',
    external: ['substance']
  })
})

b.task('jats:compile', ['tools'], () => {
  _compile('JATS', 'data/rng/JATS-archive-oasis-article1-mathml3.rng', RNG_SEARCH_DIRS)
})

b.task('jats:classify', ['jats:compile'], () => {
  _classify('JATS')
})

b.task('restricted-jats:compile', ['tools'], () => {
  _compile('restrictedJATS', 'src/rng/restrictedJATS.rng', RNG_SEARCH_DIRS)
})

b.task('restricted-jats:classify', ['restricted-jats:compile'], () => {
  _classify('restrictedJATS')
})


function _compile(name, src, searchDirs) {
  const DEST = `generated/${name}.schema.json`
  const entry = path.basename(src)
  b.custom(`Compiling ${name}...`, {
    src: src,
    dest: DEST,
    execute() {
      const { compileRNG, serializeSchema } = require('./tmp/tools')
      const xmlSchema = compileRNG(fs, searchDirs, entry)
      const serializedSchema = JSON.stringify(serializeSchema(xmlSchema))
      b.writeSync(DEST, serializedSchema)
    }
  })
}

function _classify(name) {
  const SRC = `generated/${name}.schema.json`
  const DEST = `generated/${name}.classification.json`
  b.custom(`Classifying ${name}...`, {
    src: SRC,
    dest: DEST,
    execute() {
      const { deserializeSchema, analyzeSchema } = require('./tmp/tools')
      const schemaData = JSON.parse(fs.readFileSync(SRC))
      const xmlSchema = deserializeSchema(schemaData)
      const info = analyzeSchema(xmlSchema)
      const classification = map(info, (r) => {
        return {
          name: r.name,
          type: r.type
        }
      })
      b.writeSync(DEST, JSON.stringify(classification,0,2))
    }
  })
}

// b.task('printInfo', ['vfs'], () => {
//   b.js('./src/printInfo.js', {
//     dest: 'tmp/printInfo.js',
//     format: 'cjs',
//     alias: {
//       'vfs': path.join(__dirname, 'tmp/vfs.js')
//     },
//     external: ['substance']
//   })
// })

// b.task('definition', ['printInfo'], function() {
//   b.custom('Generating info...', {
//     src: 'tmp/printInfo.js',
//     dest: 'proposal/JATS.md',
//     execute() {
//       const printInfo = require('./tmp/printInfo')
//       b.writeSync('proposal/JATS.md', printInfo({
//         xsdPath: 'data/xsd/JATS-archive-oasis-article1-mathml3-elements.xsd',
//         structure: true
//       }))
//     }
//   })
// })

// b.task('classification', ['printInfo'], function() {
//   b.custom('Generating info...', {
//     src: 'tmp/printInfo.js',
//     dest: 'proposal/CLASSIFICATION.md',
//     execute() {
//       const printInfo = require('./tmp/printInfo')
//       b.writeSync('proposal/CLASSIFICATION.md', printInfo({
//         xsdPath: 'data/xsd/JATS-archive-oasis-article1-mathml3-elements.xsd',
//         classification: true
//       }))
//     }
//   })
// })

// b.task('stats', ['vfs', 'jats'], () => {
//   b.js('./src/stats.js', {
//     dest: 'tmp/stats.js',
//     format: 'cjs',
//     alias: {
//       'vfs': path.join(__dirname, 'tmp/vfs.js')
//     },
//     external: ['substance']
//   })
// })

/* HTTP server */
b.setServerPort(5556)
b.serve({ static: true, route: '/', folder: '.' })
