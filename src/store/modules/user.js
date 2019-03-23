import { logout } from '@/api/login'
import Vue from 'vue'
import { Promise } from 'q'

const user = {
    state: {
        token: '',
        name: '',
        avatar: '',
        roles: []
    },

    mutations: {
        SET_TOKEN: (state, token) => {
            state.token = token
        },
        SET_NAME: (state, name) => {
            state.name = name
        },
        SET_AVATAR: (state, avatar) => {
            state.avatar = avatar
        },
        SET_ROLES: (state, roles) => {
            state.roles = roles
        }
    },

    actions: {

        Login({ commit }, userInfo) {
            const username = userInfo.username.trim()
            return new Promise((resolve, reject) => {
                Vue.api.login(username, userInfo.password).then(response => {
                    // const data = response.data
                    // commit('SET_TOKEN', data.token)
                    if (response.success) {
                        resolve()
                    } else {
                        reject()
                    }
                }).catch(error => {
                    reject(error)
                })
            })
        },
        GetInfo({ commit, state }) {
            return new Promise((resolve, reject) => {
                Vue.api.getInfo().then(response => 
                {
                    const data = response
                    if (data.roles && data.roles.length > 0) {
                        commit('SET_ROLES', data.roles)
                    } else {
                        reject('getInfo: roles must be a non-null array !')
                    }
                    commit('SET_NAME', data.name)
                    commit('SET_AVATAR', data.avatar)
                    resolve(response)
                }).catch(error => {
                    reject(error)
                })
            })
        },

        LogOut({ commit, state }) {
            return new Promise((resolve, reject) => {
                logout(state.token).then(() => {
                    commit('SET_TOKEN', '')
                    commit('SET_ROLES', [])
                    resolve()
                }).catch(error => {
                    reject(error)
                })
            })
        },

        FedLogOut({ commit }) {
            return new Promise(resolve => {
                commit('SET_TOKEN', '')
                resolve()
            })
        }
    }
}

export default user
