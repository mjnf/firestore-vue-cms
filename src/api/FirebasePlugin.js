import FirebaseService from './FirebaseService'

// This is your plugin object. It can be exported to be used anywhere.
const FirebasePlugin = {
  // The install method is all that needs to exist on the plugin object.
  // It takes the global Vue object as well as user-defined options.
  install(Vue, options) {
    // We call Vue.mixin() here to inject functionality into all components.

    const config = {
        apiKey: 'AIzaSyAv0GRd_8-eOmcGxuTDo5QXzE6our-gRL0',
        authDomain: 'escuela-arandu.firebaseapp.com',
        databaseURL: 'https://escuela-arandu.firebaseio.com',
        projectId: 'escuela-arandu',
        storageBucket: 'escuela-arandu.appspot.com',
        messagingSenderId: '191954891117'
    }

    Vue.api = new FirebaseService(config)
  }
}

export default FirebasePlugin
