var Service, Characteristic;
var request = require('request');


module.exports = function (homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory('homebridge-http-light', 'HttpLight', HttpLightAccessory);
};


function HttpLightAccessory(log, config) {
  this.log = log;

  this.name = config['name'];
  this.pin = config['pin'];
  this.url = config['url'];
  this.debug = config['debug'] || false;
}

HttpLightAccessory.prototype = {
  setLightState: function (lightState, callback) {
    const requestData = {
      form: {
        action: 'TURN_' + (lightState ? 'ON' : 'OFF'),
        pin: this.pin
      }
    };
    const _this = this;

    this.debugLog('Setting Light State to ' + (lightState ? 'ON' : 'OFF'));

    request.post(this.url, requestData, function (error, httpResponse, body) {
      if (error) {
        _this.debugLog('HTTP setLightState() failed: ' + error.message);
        callback(error);
      } else {
        _this.debugLog('setLightState() REQUEST finished with success');
        callback();
      }
    });
  },

  getLightState: function (callback) {
    const _this = this;

    this.debugLog('Getting Light State');

    request.get(this.url + '?pin=' + this.pin, {}, function (error, httpResponse, body) {
      if (error) {
        _this.debugLog('HTTP getLightState() failed: ' + error.message);
        callback(error);
      } else {
        _this.debugLog('getLightState() REQUEST finished with success');

        const binaryState = parseInt(body.replace(/\D/g, ''));

        callback(null, binaryState === 1);
      }
    });
  },

  debugLog: function (message) {
    if (this.debug) {
      this.log(message);
    }
  },

  getServices: function () {
    this.informationService = new Service.AccessoryInformation();
    this.informationService
      .setCharacteristic(Characteristic.Manufacturer, 'HTTP Light Oskar Kupski')
      .setCharacteristic(Characteristic.Model, 'HTTP Light Model')
      .setCharacteristic(Characteristic.SerialNumber, 'HTTP Light Serial Number');

    this.lightbulbService = new Service.Lightbulb(this.name);
    this.lightbulbService
      .getCharacteristic(Characteristic.On)
      .on('get', this.getLightState.bind(this))
      .on('set', this.setLightState.bind(this));

    return [this.informationService, this.lightbulbService];
  }
};