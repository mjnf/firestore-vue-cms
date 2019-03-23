import firebase from 'firebase'
import Cookies from 'js-cookie'
import _ from 'lodash'
import { Promise } from 'q'

const TokenKey = 'Admin-Token'

export default class FirebaseService {
    constructor(config) {
        firebase.initializeApp(config)
        this.db = firebase.firestore()
        const settings = {/* your settings... */ timestampsInSnapshots: true };
        this.db.settings(settings);

        this.collectionsMetadata = null;
    }

    getToken() {
        return Cookies.get(TokenKey) === 'undefined' ? null : Cookies.get(TokenKey)
    }

    removeDocIndex(collection, doc) {
        this.collectionsMetadata[collection].size -= 1;

        var docRef = this.db.collection("metadata").doc(collection).set({
            size: this.collectionsMetadata[collection].size
        });
    }

    addDocIndex(collection, doc) {

        if (!this.collectionsMetadata[collection]) {
            this.collectionsMetadata[collection] = {
                size : 0
            }
        }

        this.collectionsMetadata[collection].size += 1;

        var docRef = this.db.collection("metadata").doc(collection).set({
            size: this.collectionsMetadata[collection].size
        });
    }

    removeDoc(collection, doc) {

        var promise = new Promise((resolve, reject) => {
            var docRef = this.db.collection(collection).doc(doc.id);

            var apiRef = this;
            docRef.delete().then(function (dbDoc) {

                apiRef.removeDocIndex(collection, doc);

                resolve({
                    success: true
                });

            }).catch(function (error) {
                resolve({
                    success: false,
                    error: error
                });
            });
        });

        return promise
    }

    createDoc(collection, doc) {

        var promise = new Promise((resolve, reject) => {

            var cleanObj = { ...doc };
            cleanObj.updated_at = firebase.firestore.FieldValue.serverTimestamp();
            cleanObj.created_at = firebase.firestore.FieldValue.serverTimestamp();
            this.addDocIndex(collection, cleanObj);

            this.db.collection(collection).add(cleanObj).then((response) => {

                response.get().then(snap => {
                    resolve({
                        success: true,
                        doc: snap.data()
                    });
                })

            })
        }).catch(function (error) {
            resolve({
                success: false,
                error: error
            });
        });

        return promise;
    }


    updateDoc(collection, doc) {
        var promise = new Promise((resolve, reject) => {

            var docRef = this.db.collection(collection).doc(doc.id);
            var apiRef = this;

            var cleanObj = { ...doc };
            cleanObj.updated_at = firebase.firestore.FieldValue.serverTimestamp();

            docRef.set(cleanObj, { merge: true })
                .then(function (dbDoc) {
                    docRef.get().then((response) => {
                        resolve({
                            success: true,
                            doc: response.data()
                        })
                    })
                }).catch(function (error) {
                    resolve({
                        success: false,
                        error: error
                    });
                });
        });
        return promise
    }

    apiFirestore(collection, action, whereFilters, limit, startAfter, orderBy) {

        var promise = new Promise((resolve, reject) => {

            var query = this.db.collection(collection);

            try {
                var limit1 = limit || 10;
                query = query.limit(limit1);

                var order = orderBy || "created_at"
                query = query.orderBy(order);

                if (startAfter) {
                    query = query.startAfter(startAfter.created_at);
                }

                whereFilters.forEach(element => {
                    query = query.where(element.a, element.comparation, element.b);
                });

                var result = {};
                result[collection] = [];
                result.byId = [];

                query.get().then((querySnapshot) => {
                    querySnapshot.forEach(function (doc) {
                        var docData = doc.data();
                        console.log(docData);
                        docData.id = doc.id;
                        result[collection].push(docData);
                        result.byId[doc.id] = docData;
                    })
                    result.success = true;

                    if (this.collectionsMetadata[collection] == null) {
                        result.size = 0
                    }
                    else {
                        result.size = this.collectionsMetadata[collection].size || querySnapshot.size;
                    }

                    resolve(result);
                })
            }
            catch (e) {
                resolve({
                    success: false,
                    error: e
                });
            }
        })

        return promise
    }
    
    getInfo() {
        var promise = new Promise((resolve, reject) => {

            if (this.user && this.user.info) {

                resolve(this.user.info);
            }
            else {
                firebase.auth().onAuthStateChanged((user) => {
                    this.user = user;

                    this.db.collection('users').where('email', '==', this.user.email).get().then((querySnapshot) => {
                        if (querySnapshot.size == 1) {
                            this.user.info = querySnapshot.docs[0].data();

                            if (this.collectionsMetadata == null) {
                                this.db.collection('metadata').get().then((querySnapshot) => {
                                    var cmd = this.collectionsMetadata = {};
                                    querySnapshot.forEach(function (doc) {
                                        cmd[doc.id] = doc.data();
                                    });

                                    resolve(this.user.info);
                                })
                            }
                            else {
                                resolve(this.user.info);
                            }


                        }
                        else {
                            reject();
                        }
                    })
                })
            }
        })

        return promise
    }

    me() {
        var promise = new Promise((resolve, reject) => {
            firebase.auth().onAuthStateChanged(e => {
                if (firebase.auth().currentUser) {

                    Cookies.set(TokenKey, firebase.auth().refreshToken);
                    resolve({
                        success: true,
                        data: {
                            user: firebase.auth().currentUser
                        }
                    });
                } else {
                    resolve({
                        success: false
                    })
                }
            })
        })

        return promise
    }

    login(user_id, password) {
        var promise = new Promise((resolve, reject) => {
            firebase
                .auth()
                .signInWithEmailAndPassword(user_id, password)
                .then(
                    response => {
                        this.user = firebase.auth().currentUser
                        Cookies.set(TokenKey, firebase.auth().currentUser.refreshToken)
                        resolve(
                            {
                                success: true,
                                data: {
                                    user: firebase.auth().currentUser
                                }
                            })
                    },
                    error => {
                        reject(error)
                    }
                );
        });

        return promise;
    }

    logout() {
        const deferred = this.$q.defer();
        Cookies.set(TokenKey, null);
        /*this.gameroad.token = null;
        this.gameroad.api('auth', 'logout', {}, function (response) {
            deferred.resolve(response);
        });*/
        return deferred.promise;
    }

    signup(email, password, first_name, last_name, facebook) {
        const deferred = this.$q.defer();
        const payload = {
            user_id: email,
            email: email,
            password: password,
            first_name: first_name,
            last_name: last_name,
            name: first_name + ' ' + last_name,
            facebook: facebook
        };

        this.gameroad.api('auth', 'signup', payload).then(response => {
            if (response.success) {
                this.gameroad.token = response.data.user.uniqueToken;

            }
            deferred.resolve(response);
        });
        return deferred.promise;
    }
}
