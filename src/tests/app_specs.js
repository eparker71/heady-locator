'use strict';

describe('LocationController', function() {
  
 	var $httpBackend;

	beforeEach(module('locationApp'));

    beforeEach(inject(function(_$httpBackend_, $controller) {
        $httpBackend = _$httpBackend_;
        $httpBackend.when('GET', 'api.php').respond([{id: 1, name: 'Bob'}, {id:2, name: 'Jane'}]);
 
        
        $controller('LocationController', {'$http': httpBackend});
    }));


	afterEach(function() {
   		$httpBackend.verifyNoOutstandingExpectation();
     	$httpBackend.verifyNoOutstandingRequest();
   	});


    it('should fetch list of users', function(){
        $httpBackend.flush();
        expect(scope.users.length).toBe(2);
        expect(scope.users[0].name).toBe('Bob');
    });
});