/* eslint-disable no-console, no-debugger */
import { DefaultDOMElement as DOM, Configurator, forEach } from 'substance'
import vfs from 'vfs'
import JATS from './JATS'
import Validator from './common/Validator'
import compileXSD from './xsd/compileXSD'
import JATSPackage from './xml/JATSPackage'
import JATSImporter from './xml/JATSImporter'
import compileRNG from './rng/compileRNG'

window.onload = function() {
  // _compileXSD()
  // validatorDemo()
  // printInfo()
  // importDemo()
  let schema = compileRNG(vfs, 'data/rng', 'JATS-archive-oasis-article1-mathml3.rng')
  debugger
}

function importDemo() {
  let config = new Configurator()
  config.import(JATSPackage)
  let xml = vfs.readFileSync('data/elife-15278.xml')
  let importer = new JATSImporter(config)
  let doc = importer.importDocument(xml)
  console.info(doc)
}

function _compileXSD() { //eslint-disable-line
  // TODO: ATM we can't import/include other xsd files
  // as soon this is working we should use
  // 'data/JATS/JATS-archive-oasis-article1-mathml3.xsd'
  // instead
  let xsd = vfs.readFileSync('data/JATS/JATS-archive-oasis-article1-mathml3-elements.xsd')
  let schema = compileXSD(xsd)
  console.log(schema)
  debugger
}

function printInfo() { //eslint-disable-line
  let xsd = vfs.readFileSync('data/JATS/JATS-archive-oasis-article1-mathml3-elements.xsd')
  let schema = compileXSD(xsd)
  let parents = {}
  let children = {}
  // the first is a pseudo entry EPSILON
  const elements = schema.slice(1)
  const tagNames = schema.map(e=>e.name)
  elements.forEach((e) => {
    children[e.name] = {}
    forEach(e.dfa, (ts) => {
      forEach(ts, t => {
        t.forEach((idx) => {
          const tName = tagNames[idx]
          if (!tName || tName === 'EPSILON') return
          parents[tName] = parents[tName] || {}
          parents[tName][e.name] = true
          children[e.name][tName] = true
        })
      })
    })
  })

  let str = []
  elements.forEach((e)=>{
    const name = e.name
    str.push(`# &lt;${name}&gt; [spec](https://jats.nlm.nih.gov/archiving/tag-library/1.1/element/${name}.html)`)
    str.push('')
    if (e.categories) {
      str.push(`- categories: ${Object.keys(e.categories)}`)
      str.push('')
    }
    if (e.hybridBecause) {
      str.push('  considered as hybrid because: ' + e.hybridBecause)
      str.push('')
    }
    // children
    let c = children[name] || {}
    c = Object.keys(c)
    c.sort()
    if (e.mixed) {
      c.unshift('TEXT')
    }
    if (c.length) {
      str.push('- children:')
      str.push('')
      str.push('  ' + c.join(', '))
      str.push('')
    }
    // parents
    let p = parents[name] || {}
    p = Object.keys(p)
    p.sort()
    if (p.length) {
      str.push('- parents:')
      str.push('')
      str.push('  ' + p.join(', '))
      str.push('')
    }
  })
  console.log(str.join('\n'))
}

function validatorDemo() { //eslint-disable-line
  let xml = vfs.readFileSync('data/elife-15278.xml')
  let dom = DOM.parseXML(xml)
  let articleEl = dom.find('article')
  let validator = new Validator(JATS)
  let valid = validator.isValid(articleEl)
  if (!valid) {
    console.info('Article is invalid. \uD83D\uDE1E')
    validator.errors.forEach(e => {
      console.error(e)
    })
  } else {
    console.info('Article is valid. \uD83D\uDE0D')
  }
}
