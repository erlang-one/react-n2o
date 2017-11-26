// Tests

'use strict';

import bert   from './src/bert'
// import bullet from './src/bullet'
// import mq     from './src/mq'
// import n2o    from './src/n2o'
// import proto  from './src/proto'
// import utf8   from './src/utf8'


console.log('Bert test started')

import fs from 'fs';

let print = (x) => `[${Array.apply([], x ).join(',')}]`
var pass = true;
var counter = 0;

fs.readFileSync('bert-data.erl').toString().split('\n').forEach(function (data) {
    if (data == "") return

    let decoded = bert.dec(new Uint8Array(JSON.parse(data)).buffer)
    let encoded = print(bert.enc(decoded))
    
    pass = pass && (data==encoded);
    counter++
    if (pass) console.log(`OK: ${counter}`)
    else {
        console.log(`ERROR: ${data}\ndecoded:`)
        console.log(decoded)
        console.log(`encoded: ${encoded}`)
        return }
});

pass && console.log('Bert test OK!')