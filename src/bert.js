// BERT Encoder (React/ES6)

// try { module.exports = { dec: dec, enc: enc }; } catch (e) { }

'use strict';

import utf8 from './utf8'

let bert = {
    
    // BERT Encoder
    
    uc: (u1, u2) => { if (u1.byteLength === 0) return u2; if (u2.byteLength === 0) return u1;
        let a = new Uint8Array(u1.byteLength + u2.byteLength);
        a.set(u1, 0); a.set(u2, u1.byteLength); return a },
    ar: (o) => o.v instanceof ArrayBuffer ? new Uint8Array(o.v) : o.v instanceof Uint8Array ? o.v :
        Array.isArray(o.v) ? new Uint8Array(o.v) : new Uint8Array(utf8.enc(o.v).v),
    fl: (a) => a.reduce(function (f, t) {
        return bert.uc(f, t instanceof Uint8Array ? t : Array.isArray(t) ? bert.fl(t) : new Uint8Array([t]))
        }, new Uint8Array()),
    atom: (o) => ({ t: 100, v: utf8.enc(o).v }),
    bin: (o) => ({ t: 109, v: o instanceof ArrayBuffer ? new Uint8Array(o)
        : o instanceof Uint8Array ? o : utf8.enc(o).v }),
    tuple: (...a) => ({ t: 104, v: a }),
    list:  (...a) => ({ t: 108, v: a }),
    number:   (o) => ({ t: 98,  v: o }),
    enc:      (o) => bert.fl([131, bert.ein(o)]),
    ein:      (o) => {
        if (Array.isArray(o)) { return bert.en_108({ t: 108, v: o }) }
        else { let x; switch (o.t) {
            case 97:  x = bert.en_97;  break; case 98:  x = bert.en_98;  break;
            case 100: x = bert.en_100; break; case 104: x = bert.en_104; break;
            case 106: x = bert.en_106; break; case 107: x = bert.en_107; break;
            case 108: x = bert.en_108; break; case 109: x = bert.en_109; break;
            default:  x = bert.en_undefined
        }
        return x(o) }
    },
    en_undefined: (o) => [106],
    en_98:    (o) => [98, o.v >>> 24, (o.v >>> 16) & 255, (o.v >>> 8) & 255, o.v & 255],
    en_97:    (o) => [97, o.v],
    en_106:   (o) => [106],
    en_100:   (o) => [100, o.v.length >>> 8, o.v.length & 255, bert.ar(o)],
    en_107:   (o) => [107, o.v.length >>> 8, o.v.length & 255, bert.ar(o)],
    en_104:   (o) => [104, o.v.length, o.v.map(bert.ein)],
    en_109:   (o) => { let l = o.v instanceof ArrayBuffer ? o.v.byteLength : o.v.length
        return [109, l >>> 24, (l >>> 16) & 255, (l >>> 8) & 255, l & 255, bert.ar(o)] },
    en_108:   (o) => { let l = o.v.length, r = o.v.map(bert.ein) // r = [];
        return l === 0 ? [106] : [108, l >>> 24, (l >>> 16) & 255, (l >>> 8) & 255, l & 255, r, 106] },
    
    /// BERT Decoder
    
    nop: (b) => [],
    big: (b, s) => { let a = s.ix, sk = b === 1 ? s.sx.getUint8(s.ix++) : s.sx.getInt32((s.ix += 4, a))
        let ret = 0, sig = s.sx.getUint8(s.ix++), count = sk
        while (count-- > 0) { ret = 256 * ret + s.sx.getUint8(s.ix + count) }
        s.ix += sk
        return ret * (sig === 0 ? 1 : -1)
    },
    int: (b, s) => { let a = s.ix; return b === 1 ? s.sx.getUint8(s.ix++) : s.sx.getInt32((s.ix += 4, a)) },
    dec: (data, s) => {
        s = s || {sx: new DataView(data instanceof ArrayBuffer ? data : data.buffer), ix: 0}
        if (s.sx.getUint8(s.ix++) !== 131) throw new Error("BERT?")
        return bert.din(s)
    },
    str: (b, s) => {
        let sz = (b === 2 ? s.sx.getUint16(s.ix) : s.sx.getInt32(s.ix))
        s.ix += b
        let r = s.sx.buffer.slice(s.ix, s.ix += sz)
        return b === 2 ? utf8.dec(r) : r
    },
    run: (b, s) => {
        let sz = (b === 1 ? s.sx.getUint8(s.ix) : s.sx.getUint32(s.ix)), r = []
        s.ix += b
        for (var i = 0; i < sz; i++) r.push(bert.din(s))
        if (b === 4) s.ix++
        return r
    },
    din: (s) => {
        let c = s.sx.getUint8(s.ix++), x;
        switch (c) {
            case 97:  x = [bert.int, 1]; break;
            case 98:  x = [bert.int, 4]; break; case 100: x = [bert.str, 2]; break;
            case 110: x = [bert.big, 1]; break; case 111: x = [bert.big, 4]; break;
            case 104: x = [bert.run, 1]; break; case 107: x = [bert.str, 2]; break;
            case 108: x = [bert.run, 4]; break; case 109: x = [bert.str, 4]; break;
            default:  x = [bert.nop, 0]
        }
        return { t: c, v: x[0](x[1],s) }
    }
}

export default bert
