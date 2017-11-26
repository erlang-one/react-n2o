// N2O UTF-8 Support (React/ES6)

'use strict';

if( typeof TextDecoder === 'undefined' || typeof TextEncoder === 'undefined' ) {
    // import { TextDecoder, TextEncoder } from 'text-encoding'
    var TextDecoder = require('text-encoding').TextDecoder;
    var TextEncoder = require('text-encoding').TextEncoder;
}

let utf8 = {
    dec: (b) => (typeof b === 'string' || b instanceof String) ? b : (new TextDecoder()).decode(
        (b instanceof Uint8Array || b instanceof ArrayBuffer) ? b : new Uint8Array(utf8.enc(b).v).buffer ),
    enc: (str) => ({ t: 107, v: (new TextEncoder("utf-8")).encode(str) })
}

export default utf8