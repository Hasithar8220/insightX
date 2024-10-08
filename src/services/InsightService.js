angular.module('app').service('InsightService', function ClientService($http,$mdToast) {
    var service = {};

    service.savemetadata = async function (poll) {
      let r = await $http.post("/api/polls/savemetadata", JSON.stringify(poll));
      console.log(r);
      return r;

  }

  service.getmetadata = async function (poll) {
    let r = await $http.post("/api/polls/getmetadata", JSON.stringify(poll));
    console.log(r);
    return r;

}

service.vote = async function (poll) {
  let r = await $http.post("/api/polls/vote", JSON.stringify(poll));
  console.log(r);
  return r;

}

      return service;

});