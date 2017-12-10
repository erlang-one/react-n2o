# react-n2o
N2O library for React (WS + MQTT)

## Overview

[React](https://github.com/facebook/react) library for build fast and scalable frontend for [N2O server (MQTT version)](https://github.com/synrc/mqtt)

## Features

* MQTT 3.1.1 (Signaling messages)
* `[not implemented yet]` Websocket transport for files (25MB/s)

## Dependency

* [Paho MQTT client (patched, develop version)](https://github.com/erlang-one/paho.mqtt.javascript/tree/develop)

## Add to you React project

```sh
npm i --save git+https://github.com/erlang-one/react-n2o#master
```

## Usage

```javascript
import { mq, bert, proto, utf8 } from 'react-n2o'

const mqtt = new mq()
mqtt.start({ host: 'localhost', protocols: [ proto.io ]})
let mes = bert.enc(bert.tuple(bert.atom('SynData'),bert.number(234)))
mqtt.send(mes)
```

## API

### mq

* `new mq(Options | undefined)` – create instance
* `mq.init(Options | undefined)` – initialize parameters (optional)
* `mq.start(Options | undefined)` – connect to server (auto init if the Options passed)
* `[not implemented yet]` `mq.stop()` – disconnect
*  `mq.send(Payload, qos = 2)` – send binary data with QoS

#### Options
```javascript
Options = {
    nodes = 4,  // N2O nodes must be equal or less of n2o_ring:nodes()
    host,       // hostname (string)
    port,       // MQTT port (number)
    protocols,  // N2O protocol list of Protocol
    onMessage   // Callback function
}
```

#### Payload

Payload argument: ` ArrayBuffer | Uint8Array`

#### QoS

QoS argument: `0 | 1 | 2`

#### Protocol

Protocol example

```javascript
let myProto = {
    type: 'protocol',
    name: 'my protocol',
    on: (r) => {
        if(r !== 'my format') return false
        console.log('my protocol message: ', r)
        return true // accept message and stop core foreach for this message
    }
}

export default myProto
```

## Testing

```
brew install npm
npm i -g babel-cli
cd ./react-n2o
npm test
```

## Contributing

1. Clone repository to local
```sh
git clone 
```

2. Link repository of package to npm

In the local module directory:

```sh
cd ./react-n2o
npm link
```

In the directory of the project to use the module:

```
cd ./you-project-dir
npm link react-n2o
```

3. Modify, test and create Pull Request

## Credits

* Andrey Martemyanov
* Maxim Sokhatsky