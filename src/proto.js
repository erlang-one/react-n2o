// N2O Protocols (React/ES6)

'use strict';

import utf8 from './utf8'

window.debug = window.debug || false;

export default class proto {
    
    static log(...o) { window.debug && console.log(...o) }
    static is(x, num, name) {
        return x === undefined ? false : (x.t === 106 ? false : (x.v.length === num && x.v[0].v === name));
    }
    
    static fold(term, [protocol, ...rest]) {
        if(protocol === undefined) { proto.log('unknown message received', term); return false }
        return protocol.on(term, protocol.do) ? true : this.fold(term, rest)
    }
    
    static get io() { return { type: 'protocol', name: 'io', on: this.onio } }
    static get file() { return { type: 'protocol', name: 'file', on: this.onfile } }
    
    static onio(r, cb) {
        if (proto.is(r, 3, 'io')) {
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