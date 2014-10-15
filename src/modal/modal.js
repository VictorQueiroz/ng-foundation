'use strict';

angular
	.module('ngFoundation.modal', ['ngAnimate', 'ngSanitize'])

	.provider('$modal', function () {
		var $modalProvider = this;

		this.defaults = {
			templateUrl: 'modal/modal.tpl.html',
			animation: 'am-flip-x',
			closeOnBackgroundClick: true,
			closeOnEsc: true,
			backdrop: true,
			backdropAnimation: 'am-fade',
			bgClass: 'reveal-modal-bg',
			rootElement: 'body'
		};

		this.$get = function ($rootScope, $window, $fd, $sce, $animate, $q, $timeout, $compile, $document, $templateCache) {
			$window = angular.element($window);
			var body = angular.element($document.body);
			$document = angular.element($document);

			function $ModalFactory ($target, options) {
				var $modal = {}, $scope, $element, $bg;

				options = $modal.$options = angular.extend({}, $modalProvider.defaults, options);
				$modal.$options.$scope = $modal.$options.$scope && $modal.$options.$scope.$new() || $rootScope.$new();
				$scope = $modal.$options.$scope;
				$modal.$isShown = false;
				$modal.$element = null;

				angular.forEach(['content'], function (key) {
					if(options[key]) $scope[key] = $sce.trustAsHtml(options[key]);
				});

				$modal.$onKeydown = function (event) {
					var keyCode = event.keyCode;

					if(keyCode === 27) { // ESC
						$modal.leave();
					}
				};

				$modal.$onResize = function (event) {
					$modal.applyPosition();
				};

				$modal.$onBackgroundClick = function () {
					$modal.leave();
				};

				$modal.$onElementEnter = function () {
					$modal.applyPosition();
				};

				$modal.$onBackgroundEnter = function () {};

				$modal.$onBackgroundLeave = function () {};

				$modal.$onElementLeave = function () {};

				$modal.$onTemplateLoaded = function (template) {
					$modal.$element = $element = angular.element(template);
					$compile($modal.$element)($scope);

					if(options.backdrop) {
						$modal.$bg = $bg = angular.element('<div class="' + $modal.$options.bgClass + '"></div>');
						$modal.$bg.css('display', 'block');
						$animate.enter($modal.$bg, $target, $target, $modal.$onBackgroundEnter);
					}

					$modal.$element.css({
						opacity: 1,
						visibility: 'visible',
						display: 'block'
					});

					if($fd.large()) {
						if(options.animation) {
							if(options.backdrop) {
								$modal.$bg.addClass(options.backdropAnimation);
							}

							$modal.$element.addClass(options.animation);
						}
					}

					var promise = $animate.enter($modal.$element, $target, $target, $modal.$onElementEnter);
					if(promise && promise.then) promise.then($modal.$onElementEnter);

					$window.on('resize', $modal.$onResize);

					$scope.$emit('modal.enter.after', $modal);
				};

				$modal.$getTemplate = function () {
					var deferred = $q.defer();
					$timeout(function () {
						deferred.resolve($templateCache.get(options.templateUrl));
					});
					return deferred.promise;
				};

				$modal.$applyPosition = function () {
					$element
						.addClass('open')
						.css({
							opacity: 1,
							visibility: 'visible',
							display: 'block'
						});
					
					$modal.$bindEvents();

					$modal.$isShown = true;
					$scope.$$phase || ($scope.$root && $scope.$root.$$phase) || $scope.$digest();

					$scope.$emit('modal.positioning.after', $modal);
				};

				$modal.$unbindEvents = function () {
					if($scope.$emit('modal.unbind.before', $modal).defaultPrevented) {
						return;
					}

					if(options.closeOnEsc) {
						$document.off('keydown', $modal.$onKeydown);
					}

					if(options.backdrop) {
						$modal.$bg.off('click', $modal.$onBackgroundClick);
					}

					$scope.$emit('modal.unbind.after', $modal);
				};

				$modal.$bindEvents = function () {
					if($scope.$emit('modal.bind.before', $modal).defaultPrevented) {
						return;
					}

					if(options.closeOnEsc) {
						$document.on('keydown', $modal.$onKeydown);
					}

					if(options.backdrop && options.closeOnBackgroundClick) {
						$modal.$bg.on('click', $modal.$onBackgroundClick);
					}

					$window.off('resize', $modal.$onResize);

					$scope.$emit('modal.bind.after', $modal);
				};

				$modal.$leave = function () {
					if(!$modal.$isShown) return;

					if($scope.$emit('modal.leave.before', $modal).defaultPrevented) {
						return;
					}

					var promise = $animate.leave($modal.$element, $modal.$onElementLeave);
					if(promise && promise.then) promise.then($modal.$onElementLeave);

					if(options.backdrop) {
						var promise = $animate.leave($modal.$bg, $modal.$onBackgroundLeave);
						if(promise && promise.then) promise.then($modal.$onBackgroundLeave);
					}

					$modal.$isShown = false;
					$scope.$$phase || ($scope.$root && $scope.$root.$$phase) || $scope.$digest();

					$modal.$unbindEvents();
				};

				$modal.leave = function () {
					$modal.$leave();
				};

				$modal.$enter = function () {
					if($modal.$isShown) return;

					if($scope.$emit('modal.enter.before', $modal).defaultPrevented) {
						return;
					}

					$modal.$getTemplate().then($modal.$onTemplateLoaded);
				};

				$modal.enter = function () {
					if($scope.$emit('modal.enter.before', $modal).defaultPrevented) {
						return;
					}

					$modal.$enter();
				};

				$modal.applyPosition = function () {
					if($scope.$emit('modal.positioning.after', $modal).defaultPrevented) {
						return;
					}

					$modal.$applyPosition();
				};

				$scope.$show = function () {
					$modal.enter();
				};

				$scope.$hide = function () {
					$modal.leave();
				};

				return $modal;
			}

			return $ModalFactory;
		};
	})

	.directive('fdModal', function ($modal) {
		return {
			restrict: 'A',
			link: function (scope, element, attrs) {
				var options = {
					$scope: scope
				};

				angular.forEach(['content'], function (key) {
					if(angular.isDefined(attrs[key])) options[key] = attrs[key];
				});

				var modal = $modal(element, options);
				element.on('click', modal.enter);
			}
		};
	});