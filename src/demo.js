/* eslint-disable no-console, no-debugger, no-unused-vars */
import { DefaultDOMElement as DOM, Configurator } from 'substance'
import vfs from 'vfs'
import { TextureJATS, TextureJATSPackage, jats2texture, validate } from './api'

const RNG_SEARCH_DIRS = [
  'data/rng', 'src/jats'
]

window.onload = function() {
  // _compileSchema()
  importDemo()
}

function importDemo() {
  let config = new Configurator()
  config.import(TextureJATSPackage)
  let xml = vfs.readFileSync('data/elife-15278.xml')
  let dom = DOM.parseXML(xml)
  jats2texture(dom)
  let importer = config.createImporter('texture-jats')
  let doc = importer.importDocument(dom)
  console.info(doc)
}

function _compileSchema() {
  // let schema = compileRNG(vfs, 'data/rng', 'JATS-archive-oasis-article1-mathml3.rng')
  // let serialized = serializeSchema(schema)
  // let deserialized = deserializeSchema(serialized)
  // let info = analyzeSchema(deserialized)

  // const CLASSIFICATION = 'src/rng/TextureJATS.classification.json'
  // const classification = JSON.parse(vfs.readFileSync(CLASSIFICATION))
  // const xmlSchema = compileRNG(vfs, RNG_SEARCH_DIRS, 'TextureJATS.rng', classification)
  // const issues = checkSchema(xmlSchema)

  const xmlSchema = TextureJATS
  const xmlStr = vfs.readFileSync('data/elife-15278.xml')
  // const xmlStr = vfs.readFileSync('samples/1471-2164-14-S1-S11.nxml')
  // const xmlStr = vfs.readFileSync('samples/1471-2180-11-174.nxml')
  // const xmlStr = vfs.readFileSync('samples/1471-2180-14-100.nxml')
  const dom = DOM.parseXML(xmlStr)

  // JATS 1.1 compatibilty transformation
  jats2texture(dom)

  // validation
  const errors = validate(xmlSchema, dom)
  if (errors.elements) {
    errors.elements.forEach((el) => {
      console.error(el)
    })
  }
}

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
