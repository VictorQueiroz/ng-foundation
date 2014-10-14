'use strict';

angular
	.module('ngFoundation.tooltip', ['ngAnimate', 'ngSanitize'])

	.provider('$tooltip', function () {
		var $tooltipProvider = this;

		this.defaults = {
			name: 'tooltip'
		};

		this.$get = function ($animate, $rootScope, $q, $fd, $timeout, $position, $templateCache, $compile, $window) {
			function TooltipFactory ($target, options) {
				var $tooltip = {};
				return $tooltip;
			}

			return TooltipFactory;
		};
	});