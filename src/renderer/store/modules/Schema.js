const state = {
  schemas: {}
}

// 동기적 상태 변경
const mutations = {
  addSchema (state, payload) {
    var schema = {
      tables: [],
      exceptions: []
    }
    state.schemas[payload] = schema
  },
  clearSchema (state) {
    state.schemas.length = 0
  },
  addException (state, payload) {
    state.schemas[payload.schema].exceptions.push(payload.table)
  },
  removeException (state, payload) {
    var filtering = state.schemas[payload.schema].exceptions.filter(element => element !== payload.table)
    state.schemas[payload.schema].exceptions = filtering
  },
  addTable (state, payload) { // payload [{ schema: '', table: '' }, ...]
    payload.forEach(obj => {
      state.schemas[payload[0].schema].tables.push(obj.table)
    })
  }
}

// 비동기적 상태 변경 가능
const actions = {
  asyncAddSchema ({ commit }, payload) {
    commit('addSchema', payload)
  },
  asyncClearSchema ({ commit }) {
    commit('clearSchema')
  },
  asyncAddException ({ commit }, payload) {
    commit('addException', payload)
  },
  asyncRemoveException ({ commit }, payload) {
    commit('removeException', payload)
  },
  asyncAddTable ({ commit }, payload) {
    commit('addTable', payload)
  }
}

const getters = {
  getSchema (state) {
    return state.schemas
  }
}

export default {
  state,
  mutations,
  actions,
  getters
}
