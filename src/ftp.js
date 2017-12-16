// N2O File Transfer Protocol (React/ES6)

'use strict';

import bert from './bert'
import n2o from './n2o'
import proto from './proto'
import utf8 from './utf8'

class item {
    constructor({ file, meta, filename, autostart, sid, id, offset }) {
        this.id = id || n2o.uuid()
        this.status = 'init'
        this.autostart = autostart || false
        this.name = filename || `random-name-${n2o.uuid()}`
        this.sid = sid || n2o.token(),
        this.meta = meta || bert.bin(n2o.ensure_token())
        this.offset = offset || 0
        this.block = 1
        this.total = file.size
        this.file = file
    }
}

export default class ftp {
    
    /// Interface
    
    get type() { return 'protocol' }
    get name() { return 'ftp' }
    // get bindings() { return { 'send_file': this.send_file } }
    set_channel(c) { this.channel = c }
    
    on(r) { return this.onmessage(r) }
    
    constructor(o = {}) {
        this.channel = undefined
        this.active = false
        this.relay = o.relay
        this.queue = []
    }
    
    send_file(o) {
        console.log('FTP DEBUG', this, o)
        let e = new item(o)
        this.queue.push(e)
        this.send(e, '')
        return e.id
    }
    
    /// Internal
    
    start(id) {
        if (this.active) { id && (this.item(id).autostart = true); return false }
        let item = id ? this.item(id) : this.next()
        if (item) { this.active = true; this.send_slice(item) }
    }

    stop(id) {
        let item = this.item(id)
        let index = this.queue.indexOf(item)
        this.queue.splice(index, 1)
        this.active = false
        this.start()
    }

    send(item, data) {
        this.channel.send(bert.enc(bert.tuple(
            bert.atom('ftp'),
            bert.bin(item.id),
            bert.bin(item.sid),
            bert.bin(item.name),
            item.meta,
            bert.number(item.total),
            bert.number(item.offset),
            bert.number(item.block || data.byteLength),
            bert.bin(data),
            bert.bin(item.status || 'send')
        )))
    }

    send_slice(item) {
        let reader = new FileReader()
        reader.onloadend = e => {
            let res = e.target, data = e.target.result
            if (res.readyState === FileReader.DONE && data.byteLength > 0) {
                console.log(item)
                this.send(item, data)
            }
        }
        reader.readAsArrayBuffer(item.file.slice(item.offset, item.offset + item.block))
    }

    item(id) { return this.queue.find(e => (e && e.id === id)) }
    next()   { return this.queue.find(e => (e && e.autostart)) }

    onmessage(r) {
        console.log('FTP ONMESSAGE: ',r)
        if (proto.is(r, 10, 'ftpack')) {

            let offset = r.v[6].v,
                block  = r.v[7].v,
                status = utf8.dec(r.v[9].v),
                item

            switch (status) {
                case 'init':
                    if(block === 1) return false
                    item = this.item(utf8.dec(r.v[1].v)) || '0'
                    item.offset = offset
                    item.block = block
                    item.name = utf8.dec(r.v[3].v)
                    item.status = undefined
                    if (item.autostart) this.start(item.id)
                    break
                case 'send':
                    // TODO: add callback for user
                    // let x = qi('ftp_status')
                    // if (x) x.innerHTML = offset
                    item = this.item(utf8.dec(r.v[1].v))
                    console.log('FTP NEXT: ', offset, block)
                    item.offset = offset
                    item.block = block
                    if (block > 0 && this.active) {
                        this.send_slice(item)
                    } else {
                        this.stop(item.id)
                    }
                    break
                case 'relay':
                    if (typeof this.relay === 'function') this.relay(r)
                    break
            }
            return true
        }
        return false
    }
}