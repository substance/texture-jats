import { forEach } from 'substance'
import DFABuilder from './DFABuilder'
import serialize from './serializeDFA'


/*
 Creates a JSON which can be used to create a scanner for the XSD.

 @example

 output:
 ```
 [{ name: "abbrev", attributes: {...}, transitions: {0: {...}}},...]
 ```
*/
export default function compileXSD(xsdStr) {
  const {xsd, dfas} = DFABuilder.compile(xsdStr)
  const serialized = serialize(xsd, dfas)
  const elements = {}
  const compiled = [{name: 'EPSILON'}]
  serialized.tagNames.forEach((name) => {
    const spec = xsd.elements[name]
    if (!spec) return
    const attributes = spec.attributes
    const dfa = serialized.elements[name]
    const entry = {
      name,
      attributes,
      dfa
    }
    if (spec.content && spec.content.mixed) {
      entry.mixed = true
    }
    elements[name] = entry
    compiled.push(entry)
  })

  /*
   TODO: try to associate every element with one of these categories:
   - structured: only has element children
   - text-node: contains annotated text
   - inline: is used as an 'in-flow' tag (an annotation)
   - hybrid: is used as block-level (child of structured), as well as inline
  */
  const { parents, children } = _getParentsAndChildren(compiled)
  _categorizeElements(elements, parents, children)

  return compiled
}

function _categorizeElements(elements, parents, children) {
  // first is EPSILON
  const tagNames = Object.keys(elements)
  /*
    Trying to accomplish this in a multi-pass approach, where we refine the
    category iteratively
  */
  // Phase 1: identify elements that do not contain text
  // These can only be 'structured' or potentially 'hybrid'
  // structured: is not mixed, BUT also has only structured parents
  for (let i = 0; i < tagNames.length; i++) {
    const e = elements[tagNames[i]]
    if (e.mixed) {
      e.categories = { text: true }
    } else {
      e.categories = { structured: true }
    }
  }
  // Phase 2: identify anno/inline nodes, i.e. all parents should be 'text'
  for (let i = 0; i < tagNames.length; i++) {
    const name = tagNames[i]
    const e = elements[name]
    const p = parents[name]
    let pStructured = false
    let pText = false
    let textPs = []
    let structuredPs = []
    for (let i = 0; i < p.length; i++) {
      const pName = p[i]
      const pElement = elements[pName]
      if (pElement.categories['text']) {
        pText=true
        textPs.push(pName)
      }
      if (pElement.categories['structured']) {
        pStructured=true
        structuredPs.push(pName)
      }
    }
    if (pStructured && pText) {
      e.categories['hybrid'] = true
      e.hybridBecause = [
        '\n    - used inline by ', String(textPs),
        ',\n    - but as structured element by ', String(structuredPs)
      ].join('')
    } else if (pText) {
      e.categories['anno'] = true
    }
  }
}

function _getParentsAndChildren(_elements) {
  let parents = {}
  let children = {}
  // the first is a pseudo entry EPSILON
  const elements = _elements.slice(1)
  const tagNames = _elements.map(e=>e.name)
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
  elements.forEach((e) => {
    const name = e.name
    children[name] = children[name] ? Object.keys(children[name]) : []
    parents[name] = parents[name] ? Object.keys(parents[name]) : []
  })
  return { parents, children }
}