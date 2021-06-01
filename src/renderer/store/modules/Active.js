const isActive = {
  home: true,
  config: false
}

const mutations = {
  ACTIVE_HOME (isActive) {
    isActive.home = true
    isActive.config = false
  },
  ACTIVE_CONFIG (isActive) {
    isActive.home = false
    isActive.config = true
  }
}

const actions = {
  someAsyncTask ({ commit }) {
    commit('ACTIVE_HOME')
    commit('ACTIVE_CONFIG')
  }
}

export default {
  isActive,
  mutations,
  actions
}
