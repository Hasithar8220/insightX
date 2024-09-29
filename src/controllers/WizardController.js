angular.module('app')
    .controller('WizardController', function($scope,$http,UtilityService) {
        // Initialize the wizard state and poll data
        $scope.step = 1;
        $scope.poll = {
            question: '',
            options: ''
        };

        // Navigate to the next step
        $scope.nextStep = function() {
            if ($scope.step < 3) {
                $scope.step++;
            }
        };

        // Navigate to the previous step
        $scope.prevStep = function() {
            if ($scope.step > 1) {
                $scope.step--;
            }
        };

        // Submit the poll (for demo purposes)
        $scope.submitPoll = function() {
            alert("Poll submitted successfully!");
        };


        $scope.useAssistant = async function () {

          try {
      
            $scope.aiStarted = 1;
            $scope.noaidata = 0;
            $scope.rec_sample_size = null;
      
            let d = {};
            d.name = UtilityService.escapeSpecialCharacters($scope.event.name);
            d.description = UtilityService.escapeSpecialCharacters($scope.event.description);
           // d.category = ClientService.escapeSpecialCharacters($scope.event.category);
           // d.targetaudience = $scope.$parent.selectedLabels;
           
            let r = await $http.post("/api/polls/aiassistant", JSON.stringify(d));
      
           
            if (!r.data) {
              $scope.noaidata = 1;
              return;
            }
          
           

            let re = JSON.parse(r.data);
            $scope.poll.question = re.question;
            $scope.poll.options = re.Options;

            console.log(r, $scope.poll);
      
            if ($scope.step < 3) {
              $scope.step++;
          }
      
      
          } catch (err) {
          
            $scope.aierror = 'We were not able to generate a survey this time. Please try again!';
            console.log(err);
      
          }
      
          finally { $scope.$apply(); }
      
        }


    });