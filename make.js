/* global __dirname */

// const { forEach } = require('substance')
const b = require('substance-bundler')
const vfs = require('substance-bundler/extensions/vfs')
const fs = require('fs')
const path = require('path')

const RNG_SEARCH_DIRS = [
  path.join(__dirname, 'data', 'rng'),
  path.join(__dirname, 'src', 'jats')
]

b.task('clean', () => {
  b.rm('dist')
})

// compiles TextureJATS and does some evaluation
b.task('compile', ['tools'], () => {
  _compile('TextureJATS', 'src/jats/TextureJATS.rng', RNG_SEARCH_DIRS, 'src/jats')
})

// internal tools compiled to be able to use them here
b.task('tools', () => {
  b.js('./src/tools.js', {
    dest: 'tmp/tools.js',
    format: 'cjs',
    external: ['substance']
  })
})

b.task('build', ['clean', 'compile'], () => {
  b.js('./src/api.js', {
    targets: [{
      dest: 'dist/texture-jats.cjs.js',
      format: 'cjs',
    }, {
      dest: 'dist/texture-jats.es.js',
      format: 'es',
    }],
    external: ['substance']
  })
})

// a virtual fs used for demo
b.task('vfs', function() {
  vfs(b, {
    src: ['./data/**/*', './src/rng/*', './samples/*'],
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

b.task('default', ['build'])

/* Internal helpers */

function _compile(name, src, searchDirs, baseDir='generated') {
  const DEST = `${baseDir}/${name}.data.js`
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
      let schemaData = serializeSchema(xmlSchema)
      b.writeSync(DEST, `export default ${JSON.stringify(schemaData)}`)
      // now check the schema for issues
      const issues = checkSchema(xmlSchema)
      const issuesData = [`${issues.length} issues:`, ''].concat(issues).join('\n')
      b.writeSync(ISSUES, issuesData)
    }
  })
}
