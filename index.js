let Service, Characteristic;
const request = require('request');
const url = require('url');

module.exports = function (homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory("homebridge-http-light", "Homebridge HTTP Ligt Plugin", HttpLightAccessory);
};

function HttpLightAccessory(log, config) {
  this.log = log;
  this.getUrl = url.parse(config['getUrl']);
  this.postUrl = url.parse(config['postUrl']);
}

HttpLightAccessory.prototype = {
  getServices: function () {
    let informationService = new Service.AccessoryInformation();
    informationService
      .setCharacteristic(Characteristic.Manufacturer, "My switch manufacturer")
      .setCharacteristic(Characteristic.Model, "My switch model")
      .setCharacteristic(Characteristic.SerialNumber, "123-456-789");

    let switchService = new Service.Switch("My switch");
    switchService
      .getCharacteristic(Characteristic.On)
      .on('get', this.getSwitchOnCharacteristic.bind(this))
      .on('set', this.setSwitchOnCharacteristic.bind(this));

    this.informationService = informationService;
    this.switchService = switchService;
    return [informationService, switchService];
  },

  getSwitchOnCharacteristic: function (next) {
    const me = this;
    request({
        url: me.getUrl,
        method: 'GET',
      },
      function (error, response, body) {
        if (error) {
          me.log('STATUS: ' + response.statusCode);
          me.log(error.message);
          return next(error);
        }
        return next(null, body.currentState);
      });
  },

  setSwitchOnCharacteristic: function (on, next) {
    const me = this;
    request({
        url: me.postUrl,
        body: {'targetState': on},
        method: 'POST',
        headers: {'Content-type': 'application/json'}
      },
      function (error, response) {
        if (error) {
          me.log('STATUS: ' + response.statusCode);
          me.log(error.message);
          return next(error);
        }
        return next();
      });
  }
};