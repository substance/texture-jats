import { forEach } from 'substance'
import DFA from './DFA'

const { START, END } = DFA

export default
function deserialize(data) {
  let elementSchemas = {}
  let tagNames = data.shift()
  let attributeNames = data.shift()
  let tokenMapping = tagNames.reduce((m,k,idx)=>{m[idx]=k;return m}, {})
  let attributeMapping = attributeNames.reduce((m,k,idx)=>{m[idx]=k;return m}, {})
  data.forEach((record) => {
    const name = record[0]
    const attrData = record[1]
    const dfaData = record[2]
    const attributes = _deserializeAttributes(attrData, attributeMapping)
    const dfa = _deserializeDFA(dfaData, tokenMapping)
    elementSchemas[name] = { name, attributes, dfa }
  })
  return elementSchemas
}

function _deserializeAttributes(attrData, attributeMapping) {
  // TODO: we should support constraints on values and enumerations
  return attrData.reduce((m,k)=>{m[attributeMapping[k]]=true;return m}, {})
}

function _deserializeDFA(dfaData, tokenMapping) {
  let dfa = {}
  forEach(dfaData, (_T, from) => {
    if (from === 'S') from = START
    let T = dfa[from]
    if (!T) dfa[from] = T = {}
    forEach(_T, (tokens, to) => {
      if (to === 'S') to = START
      else if (to === 'E') to = END
      tokens.forEach((t) => {
        T[tokenMapping[t]] = to
      })
    })
  })
  return new DFA(dfa)
}
