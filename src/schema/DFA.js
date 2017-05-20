const START = 'START'
const END = 'END'
const EPSILON = 'EPSILON'
const TEXT = 'TEXT'

export default
class DFA {

  constructor(transitions) {
    this.transitions = transitions
  }

  consume(state, id) {
    const T = this.transitions
    let nextState = T[state][id]
    if (nextState !== undefined) {
      return nextState
    }
    const EPSILON = this.EPSILON
    while(T[state][EPSILON] !== undefined) {
      state = T[state][EPSILON]
      nextState = T[state][id]
      if (nextState !== undefined) {
        return nextState
      }
    }
    return -1
  }

  isFinished(state) {
    const T = this.transitions
    const EPSILON = this.EPSILON
    if (state === 'END') return true
    while(T[state][EPSILON] !== undefined) {
      state = T[state][EPSILON]
      if (state === 'END') return true
    }
    return false
  }
}

DFA.START = START
DFA.END = END
DFA.EPSILON = EPSILON
DFA.TEXT = TEXT
