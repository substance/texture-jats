import { forEach } from 'substance'
import { parseXSD, ELEMENT, CHOICE, SEQUENCE, GROUP, REFERENCE } from './parseXSD'
import DFABuilder from '../common/DFABuilder'
import serialize from './serializeDFA'

const START = DFABuilder.START
const END = DFABuilder.END

/*
 Creates a JSON which can be used to create a scanner for the XSD.

 @example

 output:
 ```
 [{ name: "abbrev", attributes: {...}, transitions: {0: {...}}},...]
 ```
*/
export default function compileXSD(xsdStr, options={}) {
  const debug = Boolean(options.debug)
  const {xsd, dfas} = _compile(xsdStr)
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
    Categories:
      - text: element that contains annotated text
      - element: has structured content (no text)
      - annotation: inline element, that does not own the content
      - anchor: inline elements without content
      - inline element: an element that is anchored on a text element
      - hybrid: an element that is either text or an element (exclusive)

  */
  const { parents, children } = _getParentsAndChildren(compiled)
  _categorizeElements(elements, parents, children, debug)

  return compiled
}

/*
  Patterns:

  - Sequence:
    ```
      Expression: A B

      Graph:  0 -(A)-> 1 -(B)-> END
    ```
  - Simple Choice (without nested structure):
    ```
      Expression: (A | B)

      Graph:  0 -(A,B)-> END
    ```
  - Modifier `?` (ε: empty string)
    ```
      Expression: (A)?

      Graph:  0 -(A, ε)-> END
    ```

  - Modifier `*` (repetition using a reflexive edge)
    ```
      Expression: (A)* (reflexiv edge)
             /-(A)-\
             |     |
              \   /
               v /
      Graph:    0  --(ε)-->  END
    ```
  - Modifier `+` (like `*` plus extra transition at the beginning)
    ```
      Expression: (A)+ (sequence and reflexive edge)
                       /-(A)-\
                       |     |
                        \   /
                         v /
      Graph:  0 --(A)-->  1  --(ε)-> END
    ```
*/

function _compile(xsdStr) {
  const xsd = parseXSD(xsdStr)
  const dfas = {}
  forEach(xsd.elements, (element) => {
    // the DFA will be stored in element._dfa
    let dfa = _processElement(xsd, element)
    dfas[element.name] = dfa
  })
  return {xsd, dfas}
}

function _processElement(context, element) {
  // some elements do only have attributes
  if (element._dfa) return element._dfa
  const content = element.content
  let dfa
  if (!content) {
    // TODO: do we want an empty DFA?
    dfa = new DFABuilder()
  } else {
    switch (content.type) {
      // for instance <body> just references the 'body-model' group
      case REFERENCE: {
        dfa = _transformReference(context, content)
        break
      }
      case CHOICE: {
        dfa = _transformChoice(context, content)
        break
      }
      case SEQUENCE: {
        dfa = _transformSequence(context, content)
        break
      }
      default:
        console.warn('Element content type not yet supported', content)
        debugger
    }
  }
  element._dfa = dfa
  return dfa
}

// a reference is pointing to a group or to an element
function _transformReference(context, ref) {
  let cardinality = ref.cardinality
  let dfa
  if (ref.targetType === ELEMENT) {
    dfa = _transformElement(context, ref.targetName, cardinality)
  } else {
    console.assert(ref.targetType === GROUP, 'ref should point to a group')
    let name = ref.targetName
    let group = context.groups[name]
    if (!group) throw new Error('Unknown group: '+name)
    // TODO: we need to apply cardinality transformations here
    if (group._dfa) {
      return _addCardinality(group._dfa, cardinality)
    }
    let content = group.content
    switch(content.type) {
      case SEQUENCE: {
        dfa = _transformSequence(context, content)
        break
      }
      case CHOICE: {
        dfa = _transformChoice(context, content)
        break
      }
      default:
        console.warn('Group content not supported yet', content)
        debugger
    }
    group._dfa = dfa
    dfa = _addCardinality(dfa, cardinality)
  }
  return dfa
}

// a sequence adds a state after each child
function _transformSequence(context, seq) {
  let children = seq.children
  let dfa = new DFABuilder()
  let L = children.length
  for (let i = 0; i < L; i++) {
    let child = children[i]
    switch(child.type) {
      case ELEMENT: {
        dfa.append(_transformElement(context, child.name, child.cardinality))
        break
      }
      case REFERENCE: {
        dfa.append(_transformReference(context, child))
        break
      }
      case CHOICE: {
        dfa.append(_transformChoice(context, child))
        break
      }
      case SEQUENCE: {
        dfa.append(_transformSequence(context, child))
        break
      }
      default:
        debugger
    }
  }
  dfa = _addCardinality(dfa, seq.cardinality)
  return dfa
}

function _transformChoice(context, choice) {
  let children = choice.children
  let dfa = new DFABuilder()
  let L = children.length
  for (let i = 0; i < L; i++) {
    let child = children[i]
    switch(child.type) {
      case ELEMENT: {
        dfa.merge(_transformElement(context, child.name, child.cardinality))
        break
      }
      case REFERENCE: {
        dfa.merge(_transformReference(context, child))
        break
      }
      case CHOICE: {
        dfa.merge(_transformChoice(context, child))
        break
      }
      case SEQUENCE: {
        dfa.merge(_transformSequence(context, child))
        break
      }
      default:
        debugger
    }
  }
  dfa = _addCardinality(dfa, choice.cardinality)
  return dfa
}

function _transformElement(context, name, cardinality) {
  let dfa = new DFABuilder()
  dfa.addTransition(START, END, name)
  return _addCardinality(dfa, cardinality)
}

function _addCardinality(dfa, cardinality) {
  switch(cardinality) {
    case 1:
      return dfa
    case '?':
      return dfa.optional()
    case '*':
      return dfa.kleene()
    case '+':
      return dfa.plus()
    default:
      throw new Error('Invalid state.')
  }
}

function _categorizeElements(elements, parents, children, debug=false) {
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
      if (debug) {
        e.hybridBecause = [
          '\n    - used inline by ', String(textPs),
          ',\n    - but as structured element by ', String(structuredPs)
        ].join('')
      }
    } else if (pText) {
      e.categories['annotation'] = true
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