# homebridge-light-http

### Installation

1. Install homebridge, running `npm install -g homebrige`
2. Install homebridge-light-http, running `npm install -g homebridge-light-http`
3. Update your `config.json` file in `~/.homebridge/config.json`


### Configuration

You can specify following fields:

1. name - it will be displayed in Home App on your iOS device
2. pin - integer that will be used to set and get state
3. url - url for requests
4. debug - used for logging output to console


#### Sample
<pre>
    "accessories": [
        {
          "accessory": "HttpLight",
          "name": "Garage Light",
          "pin": 18,
          "url": "http://localhost",
          "debug": false
        }
      ]
</pre>

### API

Your API need to handle following 2 endpoints:

1. `/` with GET method for getting current state. Pin will be passed in URL as `pin`. The API must return `1` when the light is on, and `0` when it's off.  
2. `/` with POST method for setting state. In body there will be passed 2 variables: `pin` and `action`. The action will be either `TURN_ON` or `TURN_OFF`

You can find API example <a href="https://github.com/eldilor/smart-home-hub">here</a> 