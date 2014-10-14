describe('dropdown', function () {
	var $rootScope, $scope, $compile, element;

	beforeEach(module('ngFoundation.tooltip'));
	beforeEach(module('ngFoundation.foundation'));
	beforeEach(module('ngFoundation.dropdown'));

	beforeEach(inject(function ($injector) {
		$rootScope = $injector.get('$rootScope');
		$compile = $injector.get('$compile');
		$scope = $rootScope.$new();

		element = angular.element('<button fd-dropdown></button>');
		$compile(element)($scope);
	}));

	it('should compile the directive', function () {
		console.log(element);
	});
});