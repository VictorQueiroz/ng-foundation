describe('dropdown', function () {
	var $rootScope, $scope, $compile, element;

	// beforeEach(module('ngFoundation'));

	beforeEach(inject(function ($injector) {
		$rootScope = $injector.get('$rootScope');
		$compile = $injector.get('$compile');
		$scope = $rootScope.$new();

		element = angular.element('<button fd-dropdown></button>');
		$compile(element)($scope);
	}));

	it('should compile the directive', function () {
		console.log(angular.element(document.querySelector('.foundation-mq-small')).css('font-family').replace);
	});
});