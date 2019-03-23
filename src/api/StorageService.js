/* jshint esversion: 6 */

/**
 * The below annotation will be processes by ngAnnotate, which will annotate the constructor after compiling for minification.
 */
import { Global } from '../utils/Global';
import { XORCipher } from '../utils/XORCipher';
import { MemoryStorage } from '../utils/MemoryStorage';

export default class StorageService {

    /*@ngInject;*/
    constructor($q, $window) {
        this.$q = $q;
		this.$window = $window;
		//console.log(localStorage);
        this._storage = localStorage;
        this._secure = false; //TODO: Implements
        this._name = Global.name;

        this.check();
    }

    check() {
    	try {
		    let x = this._name + Date.now();
		    this._storage.setItem(x, x);
		    let y = this._storage.getItem(x);
		    this._storage.removeItem(x);
		    if (y !== x) {throw new Error();}
		} catch (e) {
			this._storage = new MemoryStorage();
		}
    }

    set(key, value, json) {
		if (json) {
			value = JSON.stringify(value);
		}

		if (this._secure) {
			value = XORCipher.encode(value);
		}

		this._storage.setItem(key, value);
    }

    get(key, defaultValue, json) {
    	var value = this._storage.getItem(key);
    	if (!value) return defaultValue;

    	if (json) {
    		if (this._secure) {
				return XORCipher.encode(JSON.parse(value));
			}
    		return JSON.parse(value);
    	}

    	return value;
    }

    remove(key) {
      	this._storage.removeItem(key);
    }

    clear() {
      	this._storage.clear();
    }
}