angular.module('app').service('UtilityService', function ClientService($http) {
    var service = {};

    service.escapeSpecialCharacters = function (str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      };

      return service;

});