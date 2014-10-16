describe('$dropdown', function () {
	var $rootScope, $scope, $compile, $timeout, element;

	beforeEach(module('ngFoundation.dropdown'));
	beforeEach(module('ngFoundation.templates'));
	beforeEach(module('ngFoundation.helpers.position'));
	beforeEach(module('ngFoundation.foundation'));
	beforeEach(module('ngFoundation.tooltip'));

	beforeEach(inject(function ($injector) {
		$rootScope = $injector.get('$rootScope');
		$compile = $injector.get('$compile');
		$scope = $rootScope.$new();
		$timeout = $injector.get('$timeout');

		$scope.items = [{
			content: '<a href="">Item</a>'
		}, {
			content: '<a href="">Item</a>'
		}, {
			content: '<a href="">Item</a>'
		}, {
			content: '<a href="">Item</a>'
		}, {
			content: '<a href="">Item</a>'
		}, {
			content: '<a href="">Item</a>'
		}, {
			content: '<a href="">Item</a>'
		}];

		elementOne = angular.element('<button id="dropdown-two" data-align="right" data-items="items" fd-dropdown></button>');
		elementTwo = angular.element('<button id="dropdown-one" data-align="left" data-items="items" fd-dropdown></button>');
		sandbox = angular.element('<div id="sandbox"></div>');
		sandbox.append(elementOne);
		sandbox.append(elementTwo);

		$compile(sandbox)($scope);
		$scope.$digest();
	}));

	it('should not open the dropdown', function () {
		expect(sandbox.find('.f-dropdown').length).toBe(0);
	});

	it('should compile the directive', function () {
		elementOne.triggerHandler('click');
		$timeout.flush();

		expect(elementOne.scope().items.length).toEqual(7);
	});

	it('should open the dropdown', function () {
		elementOne.triggerHandler('click');
		$timeout.flush();

		expect(sandbox.find('.f-dropdown').length).toBe(1);
	});

	it('should have ng-scope class', function () {
		expect(elementOne.hasClass('ng-scope')).toEqual(true);
		expect(elementTwo.hasClass('ng-scope')).toEqual(true);
	});

	it('should open only one dropdown at a time', function () {
		expect(sandbox.find('.f-dropdown').length).toBe(0);

		elementTwo.triggerHandler('click');
		elementOne.triggerHandler('click');
		$timeout.flush();

		expect(sandbox.find('.f-dropdown').length).toBe(1);
	});
});