import { forEach } from 'substance'
import DFA from './DFA'

const { START, END, TEXT, EPSILON } = DFA

/*
  Element types:

  - text: all 'paths' must allow text
  - element: no 'paths' allow text
  - hybrid: mixed
  - annotation: text element used only in text elements
  - inline: element used only in text elements
  - anchor: inline element/annotation without content

*/
export default
function analyze(xmlSchema) {
  const tagNames = xmlSchema.getTagNames()
  // preparations
  const elementSchemas = tagNames.map((name) => {
    const elementSchema = xmlSchema.getElementSchema(name)
    Object.assign(elementSchema, {
      type: 'element',
      children: {},
      parents: {}
    })
    return elementSchema
  })
  let result = {}
  for (let i = 0; i < elementSchemas.length; i++) {
    const elementSchema = elementSchemas[i]
    _analyzeElementSchema(elementSchema, xmlSchema)
    let r = {
      name: elementSchema.name,
      type: elementSchema.type,
      children: Object.keys(elementSchema.children),
      parents: Object.keys(elementSchema.parents),
    }
    if (elementSchema.usedInlineBy) {
      r['usedInlineBy'] = elementSchema.usedInlineBy
    }
    result[r.name] = r
  }
  return result
}

function _analyzeElementSchema(elementSchema, xmlSchema) {
  const dfa = elementSchema.dfa
  if (!dfa.transitions) return
  const name = elementSchema.name
  // group start edges by follow state
  let first = {}
  forEach(dfa.transitions[START], (to, token) => {
    if (!first[to]) first[to] = []
    first[to].push(token)
  })
  let visited = {START: true, END: true}
  let hasText = false
  let hasElements = false
  forEach(first, (tokens, state) => {
    let _children = tokens.reduce((m, token) => {
      if (token !== EPSILON) {
        m[token] = true
      }
      return m
    }, {})
    let stack = [state]
    while(stack.length > 0) {
      let from = stack.pop()
      if (state === END) continue
      visited[from] = true
      let T = dfa.transitions[from]
      if (!T) throw new Error(`Internal Error: no transition from state ${from}`)
      let tokens = Object.keys(T)
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]
        const to = T[token]
        if (!visited[to]) stack.push(to)
        const childSchema = xmlSchema.getElementSchema(token)
        if (!childSchema) continue
        childSchema.parents[name] = true
        elementSchema.children[token] = true
        _children[token] = true
      }
    }
    // if there is TEXT allowed on this path
    // mark all recorded tags as inline
    if (_children[TEXT]) {
      hasText = true
      const tokens = Object.keys(_children)
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]
        const childSchema = xmlSchema.getElementSchema(token)
        if (!childSchema) continue
        if (!childSchema.usedInlineBy) childSchema.usedInlineBy = {}
        childSchema.usedInlineBy[elementSchema.name] = true
      }
    } else if (Object.keys(_children).length > 0) {
      hasElements = true
    }
  })
  if (hasElements && hasText) {
    elementSchema.type = 'hybrid'
  } else if (hasElements) {
    elementSchema.type = 'element'
  } else if (hasText) {
    elementSchema.type = 'text'
  }
}
