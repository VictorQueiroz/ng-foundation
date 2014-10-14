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

			function $ModalFactory (element, options) {
				var $modal = {}, $scope;

				options = $modal.$options = angular.extend({}, $modalProvider.defaults, options);
				$modal.$options.$scope = $modal.$options.$scope && $modal.$options.$scope.$new() || $rootScope.$new();
				$scope = $modal.$options.$scope;
				$modal.$isShown = false;
				$modal.$element = null;

				angular.forEach(['content'], function (key) {
					if(options[key]) $scope[key] = $sce.trustAsHtml(options[key]);
				});

				function onKeydown (event) {
					var keyCode = event.keyCode;

					if(keyCode === 27) { // ESC
						$modal.leave();
					}
				}

				function onBackgroundClick () {
					$modal.leave();
				}

				function onElementEnter () {
					$modal.applyPosition();
				}

				function onBackgroundEnter () {}

				function onBackgroundLeave () {}

				function onElementLeave () {}

				$modal.$getTemplate = function () {
					var deferred = $q.defer();
					$timeout(function () {
						deferred.resolve($templateCache.get(options.templateUrl));
					});
					return deferred.promise;
				};

				$modal.applyPosition = function () {
					var $element = $modal.$element;

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
				};

				$modal.$unbindEvents = function () {
					if($scope.$emit('modal.unbind.before', $modal).defaultPrevented) {
						return;
					}

					if(options.closeOnEsc) {
						$document.off('keydown', onKeydown);
					}

					if(options.backdrop) {
						$modal.$bg.off('click', onBackgroundClick);
					}

					$scope.$emit('modal.unbind.after', $modal);
				};

				$modal.$bindEvents = function () {
					if($scope.$emit('modal.bind.before', $modal).defaultPrevented) {
						return;
					}

					if(options.closeOnEsc) {
						$document.on('keydown', onKeydown);
					}

					if(options.backdrop && options.closeOnBackgroundClick) {
						$modal.$bg.on('click', onBackgroundClick);
					}

					$scope.$emit('modal.bind.after', $modal);
				};

				$modal.$leave = function () {
					if(!$modal.$isShown) return;

					if($scope.$emit('modal.leave.before', $modal).defaultPrevented) {
						return;
					}

					var promise = $animate.leave($modal.$element, onElementLeave);
					if(promise && promise.then) promise.then(onElementLeave);

					if(options.backdrop) {
						var promise = $animate.leave($modal.$bg, onBackgroundLeave);
						if(promise && promise.then) promise.then(onBackgroundLeave);
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

					function onTemplateLoaded (template) {
						$modal.$element = angular.element(template);
						$modal.$element = $compile($modal.$element)($modal.$options.$scope);

						if(options.backdrop) {
							$modal.$bg = angular.element('<div class="' + $modal.$options.bgClass + '"></div>');
							$modal.$bg.css('display', 'block');
							$animate.enter($modal.$bg, element, element, onBackgroundEnter);
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

						var promise = $animate.enter($modal.$element, element, element, onElementEnter);
						if(promise && promise.then) promise.then(onElementEnter);

						$scope.$emit('modal.enter.after', $modal);
					}

					$modal.$getTemplate().then(onTemplateLoaded);
				};

				$modal.open = function () {
					$modal.$enter();
				};

				$scope.$show = function () {
					$modal.open();
				};

				$scope.$hide = function () {
					$modal.leave();
				};

				$window.on('resize', $modal.applyPosition);

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
				element.on('click', modal.open);
			}
		};
	});