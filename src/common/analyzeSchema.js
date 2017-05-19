import { forEach } from 'substance'
import DFA from './DFA'

const { START, END, TEXT } = DFA

export default
function analyze(xmlSchema) {
  xmlSchema.getTagNames().forEach((name)=> {
    const elementSchema = xmlSchema.getElementSchema(name)
    _analyzeElementSchema(elementSchema, xmlSchema)
  })
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
  forEach(first, (tokens, state) => {
    let _children = tokens.reduce((m, token) => {
      m[token] = true
      return m
    }, {})
    let stack = [state]
    while(stack.length > 0) {
      let from = stack.pop()
      if (state === END) continue
      visited[from] = true
      let T = dfa.transitions[from]
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
      elementSchema.isText = true
      const tokens = Object.keys(_children)
      for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i]
        const childSchema = xmlSchema.getElementSchema(token)
        if (!childSchema) continue
        childSchema.usedInlineBy[elementSchema.name] = true
      }
    }
  })
}
