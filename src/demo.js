/* eslint-disable no-console, no-debugger */
import { DefaultDOMElement as DOM, Configurator, forEach } from 'substance'
import vfs from 'vfs'
// import Validator from './schema/Validator'
// import compileXSD from './schema/compileXSD'
// import JATSPackage from './xml/JATSPackage'
// import JATSImporter from './xml/JATSImporter'
import compileRNG from './schema/compileRNG'
import serializeSchema from './schema/serializeSchema'
import deserializeSchema from './schema/deserializeSchema'
import analyzeSchema from './schema/analyzeSchema'
import checkSchema from './schema/checkSchema'

const RNG_SEARCH_DIRS = [
  'data/rng', 'src/rng'
]

window.onload = function() {
  // _compileXSD()
  // validatorDemo()
  // importDemo()
  // let schema = compileRNG(vfs, 'data/rng', 'JATS-archive-oasis-article1-mathml3.rng')
  // let serialized = serializeSchema(schema)
  // let deserialized = deserializeSchema(serialized)
  // let info = analyzeSchema(deserialized)

  const CLASSIFICATION = 'src/rng/restrictedJATS.classification.json'
  const classification = JSON.parse(vfs.readFileSync(CLASSIFICATION))
  const xmlSchema = compileRNG(vfs, RNG_SEARCH_DIRS, 'restrictedJATS.rng', classification)
  const issues = checkSchema(xmlSchema)

  debugger
}

// function importDemo() {
//   let config = new Configurator()
//   config.import(JATSPackage)
//   let xml = vfs.readFileSync('data/elife-15278.xml')
//   let importer = new JATSImporter(config)
//   let doc = importer.importDocument(xml)
//   console.info(doc)
// }

// function _compileXSD() { //eslint-disable-line
//   // TODO: ATM we can't import/include other xsd files
//   // as soon this is working we should use
//   // 'data/JATS/JATS-archive-oasis-article1-mathml3.xsd'
//   // instead
//   let xsd = vfs.readFileSync('data/JATS/JATS-archive-oasis-article1-mathml3-elements.xsd')
//   let schema = compileXSD(xsd)
//   console.log(schema)
//   debugger
// }

// function validatorDemo() { //eslint-disable-line
//   let xml = vfs.readFileSync('data/elife-15278.xml')
//   let dom = DOM.parseXML(xml)
//   let articleEl = dom.find('article')
//   let validator = new Validator(JATS)
//   let valid = validator.isValid(articleEl)
//   if (!valid) {
//     console.info('Article is invalid. \uD83D\uDE1E')
//     validator.errors.forEach(e => {
//       console.error(e)
//     })
//   } else {
//     console.info('Article is valid. \uD83D\uDE0D')
//   }
// }
