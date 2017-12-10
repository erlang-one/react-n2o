// N2O MQTT Transport Wrapper (React/ES6)

'use strict';

import Paho from 'paho-client'
import bert from './bert'
import proto from './proto'
import n2o from './n2o'

window.debug = window.debug || false;

export default class mq {
    constructor(c) { c && this.init(c) }
    
    init({nodes = 4, host, port, protocols, onMessage}) {
        console.log('MQ INIT ')
        this.nodes = nodes // TODO:
        this.host = host || window.location.hostname
        this.port = port || 8083
        let l = window.location.pathname
        let x = l.substring(l.lastIndexOf("/") + 1)
        let ll = x.lastIndexOf(".")
        this.module = x === "" ? "index" : (ll > 0 ? x.substring(0, ll) : x)
        this.protocols = protocols || [ proto.io ];
        this.onMessage = onMessage || ((m) => console.log('onMessage: ', m))
    }
    
    static decode(s) { return decodeURIComponent(s.replace(/\+/g, " ")); }
    static log(...o)    { window.debug && console.log('[mq] ', ...o) }
    
    start(c) {
        c && this.init(c)
        
        mq.log('protocols: ', this.protocols)
        let match, query = window.location.search.substring(1),
            params = {}
        while ((match = (/([^&=]+)=?([^&]*)/g).exec(query))) {
            params[mq.decode(match[1])] = mq.decode(match[2])
        }
        
        this.channel = new Paho.Client(this.host, this.port, this.client())

        this.channel.onConnectionLost = (o) => { mq.log(`n2o [mqtt] connection lost: ${o.errorMessage}`) }
        this.channel.onMessageArrived = (m) => {
            let pb = m.payloadBytes
            let data = pb.buffer.slice(pb.byteOffset, pb.byteOffset + pb.length)
            try {
                proto.fold(bert.dec(data), this.protocols)
                // console.log('Message result: ', res, this.onMessage)
            }
            catch (e) { console.log(e) }
        }
        this.channel.connect(this.options())
    }
    
    stop() {
        console.log('n2o [mqtt] stop handler not implemented')
    }
    
    options() { return {
        timeout: 2,
        userName: this.module,
        password: this.token(),
        cleanSession: false,
        onSuccess: () => {
            mq.log("n2o [mqtt] connected ")
            this.send(bert.enc(bert.tuple(bert.atom('init'),bert.bin(this.token())))) },
        onFailure: (m) => { mq.log("n2o [mqtt] connection failed: " + m.errorMessage) }
    } }
    
    client() {
        let c = localStorage.getItem('client')
        if (c === null) c = `emqttd_${n2o.uuid4()}`
        localStorage.setItem('client', c)
        return c 
    }
    rnd()         { return Math.floor((Math.random() * this.nodes) + 1) }
    topic(prefix) { return `${prefix}/1/${this.rnd()}/${this.pageModule()}/anon/${this.client()}/${this.token()}` }
    token()       { return localStorage.getItem('token') || '' }
    pageModule()  { return this.module || 'api' }
    
    send(payload, qos = 2) {
        var m = new Paho.Message(payload)
        m.destinationName = this.topic('events')
        m.qos = qos
        this.channel.send(m)
    }
}
