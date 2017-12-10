// N2O Protocols (React/ES6)

'use strict';

import utf8 from './utf8'
import ftp from './ftp'

window.debug = window.debug || false;

export default class proto {
    
    static log(...o) { window.debug && console.log(...o) }
    static is(x, num, name) {
        return x === undefined ? false : (x.t === 106 ? false : (x.v.length === num && x.v[0].v === name));
    }
    
    static fold(term, [protocol, ...rest]) {
        if(protocol === undefined) return false
        return protocol.on(term, protocol.do) ? true : this.fold(term, rest)
    }
    
    static get io() { return { type: 'protocol', name: 'io', on: this.onio } }
    static get file() { return { type: 'protocol', name: 'file', on: this.onfile,  } }
    
    static onio(r, cb) {
        if (proto.is(r, 3, 'io')) {   
            // if (r.v[2].v !== undefined && r.v[2].v[1] !== undefined &&
            //     r.v[2].v.length === 2 && (r.v[2].v[0].v === "Token" || r.v[2].v[0].v === "Auth")) {
            //     let tok = String.fromCharCode.apply(null, new Uint8Array(r.v[2].v[1].v))
            //     console.log(`Token: ${tok.substr(0,20)}`)
            //     localStorage.setItem('token', tok)
            // }
            try {
                eval(utf8.dec(r.v[1].v))
                if (typeof cb === 'function') cb(r)
                return true
            }
            catch (e) { console.log(e) }
        }
        return false
    }
    
    static onfile(r, cb) {
        if (proto.is(r, 10, 'ftpack')) {
            (typeof cb === 'function') && cb(r)
            return true
        }
        return false
    }
    
}

// class file {
//
//     get type() { return 'protocol' }
//     get name() { return 'file' }
//
//     constructor() {
//     }
//
//     on() {
//
//     }
// }