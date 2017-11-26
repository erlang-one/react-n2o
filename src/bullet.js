// N2O Raw Websocket Transport (React/ES6)

'use strict';

export default class bullet{
    constructor({ url, onopen, onmessage, onclose, onerror, is_heartbeat = true}) {
        this.url = url
        // this.is_heartbeat = is_heartbeat
        this.onopen    = onopen    || (() => false)
        this.onmessage = onmessage || (() => false)
        this.onclose   = onclose   || (() => false)
    }
    
    send(data) { this.channel && this.channel.send(data) }
    
    close() { this.channel && this.channel.close() }
    
    init_handlers(ws) {
        ws.onopen = this.onopen
        ws.onmessage = this.onmessage
        ws.onerror = this.onerror
        ws.onclose = function(evt) {
            console.log(`WS onclose, clean: ${evt.wasClean}, code: ${evt.code}, reason: ${evt.reason}, url: ${this.url}`) 
            this.onclose(evt)
            this.channel = false
        }
    }
    
    connect() {
        this.channel = window.WebSocket ? new window.WebSocket(this.url) : false;
        this.init_handlers(this.channel)
    }
}