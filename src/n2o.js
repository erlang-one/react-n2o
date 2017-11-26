// N2O CORE (React/ES6)

'use strict';

import bullet from './bullet'
import proto from './proto'
import bert from './bert'

window.debug = window.debug || false;

export default class n2o {
    constructor({session, host, port, protocols}) {
        this.active = false
        this.session = session || "site-sid"
        this.schema = window.location.protocol === 'https:' ? "wss://" : "ws://"
        this.querystring = window.location.pathname + window.location.search
        this.host = host || window.location.hostname
        this.port = port ? `:${port}` : ''
        this.protocols = protocols || [ proto.io ];
    }
    
    static log(...o)   { window.debug && console.log(...o) }
    static qi(name) { return document.getElementById(name); }
    static qs(name) { return document.querySelector(name); }
    static qn(name) { return document.createElement(name); }
    static co(name) {
        let match = document.cookie.match(new RegExp(name + '=([^;]+)'));
        return match ? match[1] : undefined;
    }
    
    start() {
        let url = `${this.schema}${this.host}${this.port}/ws${this.querystring}`
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
    }
}