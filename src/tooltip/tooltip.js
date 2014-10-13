angular
	.module('ngFoundation.tooltip', ['ngAnimate', 'ngSanitize'])

	.provider('$tooltip', function () {
		var $tooltipProvider = this;

		this.defaults = {
			name: 'tooltip',
			delay: {
				show: 0
			}
		};

		this.$get = function ($animate, $rootScope, $q, $timeout, $templateCache, $compile, $window) {
			function TooltipFactory ($parent, options) {
				var $tooltip = {}, $element, $scope, timeout;

				options = $tooltip.$options = angular.extend({}, $tooltipProvider.defaults, options);
				$tooltip.$scope = $scope = $tooltip.$options.$scope && $tooltip.$options.$scope.$new() || $rootScope.$new();
				$tooltip.$parent = $parent;
				$tooltip.$element = $element = null;
				$tooltip.$isShown = false;

				$tooltip.applyPosition = function () {};
				$tooltip.$applyPosition = function () {
					$tooltip.getElement().then(function ($element) {
						$tooltip.getParent().then(function ($parent) {
							$tooltip.applyPosition($element, $parent, $tooltip.$options);
						});
					});
				}

				$tooltip.onResize = function () {
					if($tooltip.$isShown) {
						$tooltip.$applyPosition();
					}
				};

				$tooltip.destroy = function ($element, $parent) {
					$parent.off('click', $tooltip.$toggle);

					if($element) {
						$element.leave();
						$element.remove();
						$element = null;
					}

					clearTimeout(timeout);

					$tooltip.$scope.$destroy();
				};

				$tooltip.$destroy = function () {
					$tooltip.destroy($element, $parent);
				};

				$tooltip.getElement = function () {
					var deferred = $q.defer();
					$timeout(function () {
						deferred.resolve($tooltip.$element);
					}, options.delay.show);
					return deferred.promise;
				};

				$tooltip.getParent = function () {
					var deferred = $q.defer();
					$timeout(function () {
						deferred.resolve($tooltip.$parent);
					}, options.delay.show);
					return deferred.promise;
				};

				$tooltip.$onElementLoaded = function () {
					$tooltip.$scope.$emit(options.name + ':show:after', $tooltip);
				};

				$tooltip.$enter = function (event) {
					clearTimeout(timeout);

					function onTemplateLoaded (template) {
						$element = angular.element(template);
						$element = $tooltip.$element = $compile($element)($scope);
						$animate.enter($element, $parent, $parent, $tooltip.$onElementLoaded);
						$tooltip.$isShown = true;
						$scope.$$phase || ($scope.$root && $scope.$root.$$phase) || scope.$digest();

						$tooltip.$applyPosition();
					}

					function enter () {
						$scope.$emit(options.name + ':show:before', $tooltip);

						$tooltip.getTemplate().then(onTemplateLoaded);
					}

					timeout = setTimeout(function () {
						enter();
					}, options.delay.show);
				};

				$tooltip.leave = function ($tooltip) {};
				$tooltip.$leave = function (event) {
					$tooltip.$element.remove();
					$tooltip.$isShown = false;

					$scope.$emit(options.name + ':leave:after', $tooltip);

					$tooltip.leave($tooltip);
				};

				$tooltip.$toggle = function (event) {
					!$tooltip.$isShown ? $tooltip.$enter(event) : $tooltip.$leave(event);
				};

				$tooltip.getTemplate = function () {
					return $q.when($templateCache.get(options.templateUrl));
				};

				// scope
				$scope.$enter = function () {
					$scope.$$postDigest(function () {
						$tooltip.enter();
					});
				};

				$scope.$leave = function () {
					$scope.$emit(options.name + ':leave:before', $tooltip);

					$scope.$$postDigest(function () {
						$tooltip.leave();
					});
				};

				$tooltip.$parent.on('click', $tooltip.$toggle);
				angular.element($window).on('resize', $tooltip.onResize);

				return $tooltip;
			}

			return TooltipFactory;
		};
	});