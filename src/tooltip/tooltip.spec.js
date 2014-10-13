'use strict';

describe('tooltip', function () {
	var $tooltip, $templateCache, tooltip;

	beforeEach(module('ngFoundation.tooltip'));

	beforeEach(inject(function ($injector) {
		$tooltip = $injector.get('$tooltip');
		tooltip = $tooltip();
	}));

	it('should create a new scope', function () {
		expect(tooltip.$scope).toBeDefined();
	});
});