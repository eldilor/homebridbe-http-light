var Service, Characteristic;
var request = require('request');


module.exports = function (homebridge) {
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;
  homebridge.registerAccessory('homebridge-http-light', 'HttpLight', HttpLightAccessory);
};


function HttpLightAccessory(log, config) {
  this.log = log;

  this.light = config['light'];
  this.lightStatus = config['lightStatus'];
  this.name = config['name'] || 'Światło';
  this.debug = config['debug'] || false;
}

HttpLightAccessory.prototype = {
  doHttpRequest: function (url, method, data, callback) {
    request({
      url: url,
      formData: data,
      method: method
    }, callback);
  },

  setLightState: function (lightState, callback) {
    this.debugLog('Setting Light State to ' + (lightState ? 'ON' : 'OFF'));

    let requestData = {
      action: 'TURN_' + (lightState ? 'ON' : 'OFF')
    };

    this.doHttpRequest(this.light.url, this.light.method, requestData, function (error, response, responseBody) {
      if (error) {
        this.log('HTTP setLightState() failed: %s', error.message);
        callback(error);
      } else {
        this.debugLog('setLightState REQUEST finished with success');
        callback();
      }
    }.bind(this));

  },

  getLightState: function (callback) {
    this.debugLog('Getting Light State');

    this.doHttpRequest(this.lightStatus.url, this.lightStatus.method, {}, function (error, response, responseBody) {
      if (error) {
        this.log('HTTP getLightState() failed: %s', error.message);
        callback(error);
      } else {
        this.debugLog('getLightState REQUEST finished with success');

        const binaryState = parseInt(responseBody.replace(/\D/g, ''));

        callback(null, binaryState > 0);
      }
    }.bind(this));
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
      .setCharacteristic(Characteristic.Model, 'HTTP Light model')
      .setCharacteristic(Characteristic.SerialNumber, 'HTTP Light Serial Number');

    this.lightbulbService = new Service.Lightbulb(this.name);
    this.lightbulbService
      .getCharacteristic(Characteristic.On)
      .on('get', this.getLightState.bind(this))
      .on('set', this.setLightState.bind(this));

    return [this.informationService, this.lightbulbService];
  }
};