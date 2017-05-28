/*
  IMPORTANT: Don't use ES6 here, as some people are still on Node 4.
*/

/* global __dirname */

const { forEach } = require('substance')
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

b.task('restricted-jats:compile', ['tools'], () => {
  _compile('restrictedJATS', 'src/rng/restrictedJATS.rng', RNG_SEARCH_DIRS, 'src/rng', 'pretty')
})

function _compile(name, src, searchDirs, baseDir='generated', pretty=false) {
  const DEST = `${baseDir}/${name}.schema.json`
  const CLASSIFICATION = `${baseDir}/${name}.classification.json`
  const ISSUES = `${baseDir}/${name}.issues.txt`
  const entry = path.basename(src)
  b.custom(`Compiling schema '${name}'...`, {
    src: src,
    dest: DEST,
    execute() {
      const { compileRNG, serializeSchema, checkSchema } = require('./tmp/tools')
      let manualClassification
      if (fs.existsSync(CLASSIFICATION)) {
        manualClassification = JSON.parse(fs.readFileSync(CLASSIFICATION))
      }
      const xmlSchema = compileRNG(fs, searchDirs, entry, manualClassification)
      let serializedSchema
      if (pretty) {
        serializedSchema = JSON.stringify(serializeSchema(xmlSchema), 0, 2)
      } else {
        serializedSchema = JSON.stringify(serializeSchema(xmlSchema))
      }
      b.writeSync(DEST, serializedSchema)

      // now check the schema for issues
      const issues = checkSchema(xmlSchema)
      const issuesData = [`${issues.length} issues:`, ''].concat(issues).join('\n')
      b.writeSync(ISSUES, issuesData)
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
