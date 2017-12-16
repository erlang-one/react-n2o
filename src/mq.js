// N2O MQTT Transport Wrapper (React/ES6)

'use strict';

import Paho from 'paho-client'
import bert from './bert'
import proto from './proto'
import n2o from './n2o'

window.debug = window.debug || false;

export default class mq {
    constructor(o) { o && this.init(o) }
    
    init({ nodes = 4, host, port, protocols, onMessage, emitter }) {
        console.log('MQ INIT ', emitter)
        this.nodes = nodes // TODO:
        this.host = host || window.location.hostname
        this.port = port || 8083
        this.emitter = emitter || (a => a)
        this.prefix = 'emqttd_'
        let l = window.location.pathname
        let x = l.substring(l.lastIndexOf("/") + 1)
        let ll = x.lastIndexOf(".")
        this.module = x === "" ? "index" : (ll > 0 ? x.substring(0, ll) : x)
        this.protocols = proto.init(this, protocols || [ new proto.io() ])
        window.mq_proto = this
        this.onMessage = onMessage || ((m) => console.log('onMessage: ', m))
    }
    
    static decode(s) { return decodeURIComponent(s.replace(/\+/g, " ")); }
    static log(...o)    { window.debug && console.log('[mq] ', ...o) }
    
    start(o) {
        o && this.init(o)
        
        mq.log('protocols: ', this.protocols)
        let match, query = window.location.search.substring(1),
            params = {}
        while ((match = (/([^&=]+)=?([^&]*)/g).exec(query))) {
            params[mq.decode(match[1])] = mq.decode(match[2])
        }
        
        this.channel = new Paho.Client(this.host, this.port, this.ensure_token())

        this.channel.onConnectionLost = (o) => { mq.log(`n2o [mqtt] connection lost: ${o.errorMessage}`) }
        this.channel.onMessageArrived = (m) => {
            let pb = m.payloadBytes
            let data = pb.buffer.slice(pb.byteOffset, pb.byteOffset + pb.length)
            try {
                let action = proto.fold(bert.dec(data), this.protocols)
                console.log('MQ ACTION: ', action)
                if(action instanceof Object) this.emitter(action)
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
    ensure_token() { return n2o.ensure_token(this.prefix) }
    rnd()          { return Math.floor((Math.random() * this.nodes) + 1) }
    topic(prefix)  { return `${prefix}/1/${this.rnd()}/${this.pageModule()}/anon/${this.ensure_token()}/${this.token()}` }
    token()        { return n2o.token() }
    pageModule()   { return this.module || 'api' }
    
    send(payload, qos = 2) {
        var m = new Paho.Message(payload)
        m.destinationName = this.topic('events')
        m.qos = qos
        this.channel.send(m)
    }
}
