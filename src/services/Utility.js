angular.module('app').service('UtilityService', function ClientService($http,$mdToast) {
    var service = {};

    service.escapeSpecialCharacters = function (str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      };

      service.showSimpleToast = function(msg,hideDelay) {
      
        let hd = 7000;
        if(hideDelay){
          hd=hideDelay;
        }
  
        
  
        // Set the position based on the device type
  const position = 'top right';
  
   $mdToast.show(
  
            $mdToast.simple()
              .textContent(msg)
              .hideDelay(hd)
              .position(position)
              .toastClass('custom-toast') // Use the custom CSS class here
  
          ).then(function() {
            $log.log('Toast dismissed.');
          }).catch(function() {
            $log.log('Toast failed or was forced to close early by another toast.');
          });
          
        };

      return service;

});