// N2O Protocols (React/ES6)

'use strict';

import utf8 from './utf8'
import ftp from './ftp'

window.debug = window.debug || false;

export default class proto {
    
    static init(context, protocols) {
        protocols.forEach((p) => {
            protocols[p.name] = p
            p.set_channel && p.set_channel(context)
            // Object.entries(p.bindings || {}).forEach(b => context[b[0]] = b[1])
        })
        return protocols
    }
    
    static get io() { return io }
    static get ftp() { return ftp }
    
    static log(...o) { window.debug && console.log(...o) }
    static is(x, num, name) {
        return x === undefined ? false : (x.t === 106 ? false : (x.v.length === num && x.v[0].v === name));
    }
    
    static fold(term, [protocol, ...rest]) {
        if(protocol === undefined) return false
        let action = protocol.on(term)
        return action ? action : this.fold(term, rest)
    }
    
}

class io {
    
    /// Interface
    
    get type() { return 'protocol' }
    get name() { return 'io' }
    // get bindings() { return {} }
    set_channel(c) { this.channel = c }
    
    constructor(o = {}) {
        this.channel = undefined
        this.callback = o.callback || (f => f())
    }
    
    on(r) {
        if (proto.is(r, 3, 'io')) {   
            // if (r.v[2].v !== undefined && r.v[2].v[1] !== undefined &&
            //     r.v[2].v.length === 2 && (r.v[2].v[0].v === "Token" || r.v[2].v[0].v === "Auth")) {
            //     let tok = String.fromCharCode.apply(null, new Uint8Array(r.v[2].v[1].v))
            //     console.log(`Token: ${tok.substr(0,20)}`)
            //     localStorage.setItem('token', tok)
            // }
            try {
                callback(() => eval(utf8.dec(r.v[1].v)))
                return true
            }
            catch (e) { console.log(e) }
        }
        return false
    }
}
