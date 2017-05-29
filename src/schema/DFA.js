const START = 'START'
const END = 'END'
const EPSILON = 'EPSILON'
const TEXT = 'TEXT'

export default
class DFA {

  constructor(transitions) {
    if (!transitions || Object.keys(transitions).length === 0) {
      transitions = { START: { EPSILON: END } }
    }
    this.transitions = transitions
  }

  consume(state, id) {
    const T = this.transitions
    let nextState = T[state][id]
    if (nextState !== undefined) {
      return nextState
    }
    while(T[state][EPSILON] !== undefined) {
      state = T[state][EPSILON]
      if (state === END) {
        return -1
      }
      nextState = T[state][id]
      if (nextState !== undefined) {
        return nextState
      }
    }
    return -1
  }

  isFinished(state) {
    const T = this.transitions
    if (state === 'END') return true
    // if the state is invalid
    if (!T[state]) return false
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
