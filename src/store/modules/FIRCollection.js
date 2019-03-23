import Vue from 'vue'

const state = () => {
    return {
        collection: "",
        docs: [],
        byId: {},
        size: 0,
        listLoading: false
    }
}

const getters = {
    list: function (state, getters) {
        return state.docs;
    },
    byId: function (state, getters) {
        return state.byId;
    },
    size: function (state, getters) {
        return state.size;
    },
    listLoading: function (state, getters) {
        return state.listLoading;
    }
}

const actions = {
    RemoveDoc({ commit, state }, doc) {
        commit("LIST_LOADING", true);
        Vue.api.removeDoc(state.collection, doc).then(response => {
            if (response.success) {
                var newDocs = [].concat(state.docs);
                _.remove(newDocs, function (docAux) {
                    return docAux.id === doc.id;
                });

                commit("SET_DOCS", newDocs);
                commit("SET_DOCS_BY_ID", { id: doc.id, value: undefined });
                commit("SET_SIZE", state.size - 1);
            }
            commit("LIST_LOADING", false);
        });
    },
    CreateDoc({ commit, state }, doc) {
        commit("LIST_LOADING", true);
        Vue.api.createDoc(state.collection, doc).then(response => {
            if (response.success) {
                commit("SET_DOCS", [response.doc].concat(state.docs));
                commit("SET_DOCS_BY_ID", { id: response.doc.id, value: response.doc });
                commit("SET_SIZE", state.size + 1);
            }
            commit("LIST_LOADING", false);
        });
    },
    UpdateDoc({ commit, state }, doc) {
        commit("LIST_LOADING", true);
        Vue.api.updateDoc(state.collection, doc).then(response => {
            if (response.success) {
                commit("UPDATE_DOC", response.doc);
            }
            commit("LIST_LOADING", false);
        });
    },
    Init({ commit, state }, config) {
        commit("SET_COLLECTION", config.collection);
    },
    LoadNext({ commit, state }, config) {
        try {
            commit("LIST_LOADING", true);
            Vue.api.apiFirestore(state.collection, "get", [], config.listQuery.limit, _.last(state.docs)).then(response => {
                if (response.success) {
                    commit("SET_DOCS", _.uniqBy(state.docs.concat(response[state.collection]), 'created_at'));
                    commit("SET_DOCS_BY_ID", _.merge(state.byId, response.byId));
                    commit("SET_SIZE", response.size);
                    commit("LIST_LOADING", false);
                }
            });
        }
        catch (e) {
            console.log(e);
        }
    }
}

const mutations = {
    LIST_LOADING(state, value) {
        state.listLoading = value;
    },
    SET_SIZE(state, value) {
        state.size = value;
    },
    SET_DOCS_BY_ID(state, value) {
        state.byId = value;
    },
    SET_DOCS_BY_ID(state, data) {
        state.byId[data.id] = data.value;
    },
    SET_COLLECTION(state, value) {
        state.collection = value;
    },
    SET_DOCS(state, value) {
        state.docs = value;
    },
    UPDATE_DOC(state, value) {
        state.byId[value.id] = value;

        try {
            var index = _.findIndex(state.docs, { id: value.id });
            state.docs.splice(index, 1, value);
        }
        catch (e) {
            console.log(e);
        }
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}