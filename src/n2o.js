// N2O CORE (React/ES6)

'use strict';

import bullet from './bullet'
import proto from './proto'
import bert from './bert'
import ftp from './ftp'

window.debug = window.debug || false;

export default class n2o {
    constructor(o) { o && this.init(o) }
    
    init({ session, host, port, protocols, ssl = true, qs, emitter }) {
        this.active = false
        this.session = session || "site-sid"
        this.querystring = qs || `/ws${window.location.pathname}${window.location.search}`
        this.host = host || window.location.hostname
        this.port = port ? `:${port}` : ''
        this.emitter = emitter || (a => a)
        this.protocols = proto.init(this, protocols || [ new proto.ftp() ])
    }
    
    static log(...o)   { window.debug && console.log(...o) }
    static qi(name) { return document.getElementById(name); }
    static qs(name) { return document.querySelector(name); }
    static qn(name) { return document.createElement(name); }
    static co(name) {
        let match = document.cookie.match(new RegExp(name + '=([^;]+)'));
        return match ? match[1] : undefined;
    }
    
    static token() { return localStorage.getItem('token') || '' }
    static ensure_token(prefix) {
        let c = localStorage.getItem('token')
        if (c === null) c = `${prefix}${n2o.uuid()}`
        localStorage.setItem('token', c)
        return c 
    }
    
    start(o) {
        o && this.init(o)
        
        let url = `${this.ssl ? "wss://" : "ws://"}${this.host}${this.port}${this.querystring}`
        let onmessage = (evt) => {
            n2o.log(evt)
            let data = evt.data
            if (Blob.prototype.isPrototypeOf(data) && (data.length > 0 || data.size > 0)) {
                var r = new FileReader();
                r.addEventListener('loadend', (x) => {
                    console.log(x)
                    try { proto.fold(bert.dec(r.result), this.protocols) }
                    catch (e) { console.log(e) }
                })
                r.readAsArrayBuffer(data);
            }
        }
        let onopen = () => { if (!this.active) { n2o.log('n2o [ws] connect'); this.active = true } }
        let onclose = () => { this.active = false; n2o.log('n2o [ws] disconnect') }
        
        this.channel = new bullet({url, onmessage, onopen, onclose});
        this.channel.connect()
        console.log('n2o [ws] connected')
    }
    
    stop() {
        console.log('n2o [ws] stop handler not implemented')
    }
    
    status() { return { active: this.active } }
    send(m) { this.channel.send(m) }
    
    // static uuid() {
    //     let s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
    //     return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`
    // }
    
    static uuid() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16) })
    }
    
}