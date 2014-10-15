'use strict';

angular
	.module('ngFoundation.tooltip', ['ngAnimate', 'ngSanitize'])

	.provider('$tooltip', function () {
		var $tooltipProvider = this;

		this.defaults = {
			name: 'tooltip',
			animation: 'am-fade',
			align: 'right'
		};

		this.$get = function ($animate, $rootScope, $q, $fd, $document, $timeout, $position, $templateCache, $compile, $window) {
			$window = angular.element($window);
			$document = angular.element($document);

			function TooltipFactory ($target, options) {
				var $tooltip = {}, $scope, $element;

				$tooltip.$target = $target;
				options = $tooltip.$options = angular.extend({}, $tooltipProvider.defaults, options);
				$tooltip.$options.$scope = $scope = $tooltip.$options.$scope || $rootScope.$new();
				$tooltip.$isShown = false;

				$tooltip.getTemplate = function (template) {
					return $q.when($templateCache.get(options.templateUrl));
				};

				$tooltip.$applyPosition = function () {
					var css,
					leftOffset = Math.max(($target.width() - $element.width()) / 2, 8);

					if ($fd.small() && !$fd.medium()) {
						css = $position.directions.bottom($element, $target);

						css[$fd.rtl ? 'right' : 'left'] = leftOffset;
					} else {
						css = $position.directions[options.align]($element, $target);
					}

					$element.attr('style', '').css(css);

					$scope.$emit(options.name + '.positioning.after', $tooltip);
				};

				$tooltip.$onElementLeave = function () {};

				$tooltip.$onElementEnter = function () {};

				$tooltip.$onBodyClick = function (event) {
					if(event.target !== $tooltip.$target[0]) {
						$tooltip.leave();
					}
				};

				$tooltip.$onResize = function () {
					$tooltip.applyPosition();
				};

				$tooltip.$buildElement = function () {
					return $compile($element)($scope);
				};

				$tooltip.$onTemplateLoaded = function (template) {
					$tooltip.$element = $element = angular.element(template);
					$tooltip.$buildElement();

					$element.addClass(options.animation);

					var promise = $animate.enter($element, $target, $target, $tooltip.$onElementEnter);
					if(promise && promise.then) promise.then($tooltip.$onElementEnter);

					requestAnimationFrame(function () {
						$tooltip.applyPosition();
					});

					$tooltip.$isShown = true;
					$scope.$$phase || ($scope.$root && $scope.$root.$$phase) || $scope.$digest();

					$document.bind('click focus blur', $tooltip.$onBodyClick);
					$window.on('resize', $tooltip.$onResize);

					$scope.$emit(options.name + '.enter.after', $tooltip);
				};

				$tooltip.$enter = function () {
					$tooltip.getTemplate().then($tooltip.$onTemplateLoaded);
				};

				$tooltip.$leave = function () {
					var promise = $animate.leave($element, $tooltip.$onElementLeave);
					if(promise && promise.then) promise.then($tooltip.$onElementLeave);

					$tooltip.$isShown = false;
					$scope.$$phase || ($scope.$root && $scope.$root.$$phase) || $scope.$digest();

					$document.unbind('click focus blur', $tooltip.$onBodyClick);
					$window.off('resize', $tooltip.$onResize);

					$scope.$emit(options.name + '.leave.after', $tooltip);
				};

				$tooltip.applyPosition = function () {
					if($scope.$emit(options.name + '.positioning.before', $tooltip).defaultPrevented) {
						return;
					}

					$tooltip.$applyPosition();
				};

				$tooltip.enter = function () {
					if($tooltip.$isShown) return;

					if($scope.$emit(options.name + '.enter.before', $tooltip).defaultPrevented) {
						return;
					}

					$timeout(function () {
						$tooltip.$enter();
					});
				};

				$tooltip.leave = function () {
					if(!$tooltip.$isShown) return;

					if($scope.$emit(options.name + '.leave.before', $tooltip).defaultPrevented) {
						return;
					}

					$timeout(function () {
						$tooltip.$leave();
					});
				};

				$tooltip.toggle = function () {
					$tooltip.$isShown ? $tooltip.leave() : $tooltip.enter();
				};

				return $tooltip;
			}

			return TooltipFactory;
		};
	})

	.directive('fdTooltip', function ($tooltip) {
		return {
			restrict: 'A',
			link: function (scope, element, attrs) {
				var options = {
					$scope: scope
				};

				angular.forEach(['content', 'align', 'templateUrl'], function (key) {
					if(angular.isDefined(attrs[key])) options[key] = attrs[key];
				});

				var tooltip = $tooltip(element, options);

				element.on('click', tooltip.toggle);
			}
		};
	});