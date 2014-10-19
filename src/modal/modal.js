'use strict';

angular
	.module('ngFoundation.modal', ['ngAnimate', 'ngSanitize'])

	.provider('$modal', function () {
		var $modalProvider = this;

		this.defaults = {
			name: 'modal',
			templateUrl: 'modal/modal.tpl.html',
			animation: 'am-flip-x',
			closeOnBackgroundClick: true,
			closeOnEsc: true,
			backdrop: true,
			backdropAnimation: 'am-fade',
			bgClass: 'reveal-modal-bg',
			rootElement: 'body',
			container: false,
			enter: true
		};

		this.$get = function ($rootScope, $window, $fd, $sce, $animate, $q, $timeout, $compile, $document, $templateCache) {
			$window = angular.element($window);
			$document = angular.element($document);

			function findElement (query, element) {
				return angular.element((element || document).querySelectorAll(query));
			}

			function $ModalFactory (options) {
				var $modal = {}, $scope, $element, $bg, parent, after;

				options = $modal.$options = angular.extend({}, $modalProvider.defaults, options);
				$modal.$options.$scope = $modal.$options.$scope && $modal.$options.$scope.$new() || $rootScope.$new();
				$scope = $modal.$options.$scope;
				$modal.$isShown = false;
				$modal.$element = null;

				angular.forEach(['content'], function (key) {
					if(options[key]) $scope[key] = $sce.trustAsHtml(options[key]);
				});

				if(!options.container) {
					options.container = 'body';
				}

				$modal.$onKeydown = function (event) {
					var keyCode = event.keyCode;

					if(keyCode === 27) { // ESC
						$modal.leave();
					}
				};

				$modal.$onResize = function (event) {
					$modal.applyPosition();
				};

				$modal.$onBackgroundClick = function (event) {
					if(event.target === $modal.$bg[0]) {
						$modal.leave();
					}
				};

				$modal.$onElementEnter = function () {};

				$modal.$onBackgroundEnter = function () {};

				$modal.$onBackgroundLeave = function () {};

				$modal.$onElementLeave = function () {};

				$modal.$compileElement = function () {
					return $compile($modal.$element)($scope);
				};

				$modal.$onTemplateLoaded = function (template) {
					$modal.$element = $element = angular.element(template);
					$modal.$compileElement();

					if(options.backdrop) {
						$modal.$bg = $bg = angular.element('<div class="' + $modal.$options.bgClass + '"></div>');
						
						angular.element(document.body).css('overflow', 'hidden');

						$modal.$bg.css('display', 'block').css('overflow', 'scroll');

						$animate.enter($modal.$bg, parent, after, $modal.$onBackgroundEnter);
						parent = $modal.$bg;
					}

					$modal.$element.css({
						opacity: 1,
						visibility: 'visible',
						display: 'block',
					});

					if($fd.large()) {
						if(options.animation) {
							if(options.backdrop) {
								$modal.$bg.addClass(options.backdropAnimation);
							}

							$modal.$element.addClass(options.animation);
						}
					}
					var promise = $animate.enter($modal.$element, parent, after, $modal.$onElementEnter);
					if(promise && promise.then) promise.then($modal.$onElementEnter);

					$modal.applyPosition();

					$window.on('resize', $modal.$onResize);

					$scope.$emit(options.name + '.enter.after', $modal);
				};

				$modal.$getTemplate = function () {
					var deferred = $q.defer();
					$timeout(function () {
						deferred.resolve($templateCache.get(options.templateUrl));
					});
					return deferred.promise;
				};

				$modal.$onDocumentClick = function (event) {};

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

					$scope.$emit(options.name + '.positioning.after', $modal);
				};

				$modal.$unbindEvents = function () {
					if($scope.$emit(options.name + '.unbind.before', $modal).defaultPrevented) {
						return;
					}

					if(options.closeOnEsc) {
						$document.off('keydown', $modal.$onKeydown);
					}

					if(options.backdrop) {
						$modal.$bg.off('click', $modal.$onBackgroundClick);
					}

					$document.unbind('focus click', $modal.$onDocumentClick);

					$scope.$emit(options.name + '.unbind.after', $modal);
				};

				$modal.$bindEvents = function () {
					if($scope.$emit(options.name + '.bind.before', $modal).defaultPrevented) {
						return;
					}

					if(options.closeOnEsc) {
						$document.on('keydown', $modal.$onKeydown);
					}

					if(options.backdrop && options.closeOnBackgroundClick) {
						$modal.$bg.on('click', $modal.$onBackgroundClick);
					}

					$window.on('resize', $modal.$onResize);

					$document.bind('focus click', $modal.$onDocumentClick);

					$scope.$emit(options.name + '.bind.after', $modal);
				};

				$modal.$leave = function () {
					var promise = $animate.leave($modal.$element, $modal.$onElementLeave);
					if(promise && promise.then) promise.then($modal.$onElementLeave);

					if(options.backdrop) {
						var promise = $animate.leave($modal.$bg, $modal.$onBackgroundLeave);
						if(promise && promise.then) promise.then($modal.$onBackgroundLeave);
					}

					angular.element(document.body).css('overflow', 'scroll');

					$modal.$isShown = false;
					$scope.$$phase || ($scope.$root && $scope.$root.$$phase) || $scope.$digest();

					$modal.$unbindEvents();

					$scope.$emit(options.name + '.leave.after', $modal);
				};

				$modal.leave = function () {
					if(!$modal.$isShown) return;

					if($scope.$emit(options.name + '.leave.before', $modal).defaultPrevented) {
						return;
					}

					$timeout(function () {
						$modal.$leave();
					});
				};

				$modal.$enter = function () {
					if($modal.$isShown) return;

					if($scope.$emit(options.name + '.enter.before', $modal).defaultPrevented) {
						return;
					}

					if(angular.isElement(options.container)) {
						parent = options.container;
					} else {
						parent = options.container ? findElement(options.container) : null;
					}

					after = null;

					$modal.$getTemplate().then($modal.$onTemplateLoaded);
				};

				$modal.enter = function () {
					if($scope.$emit(options.name + '.enter.before', $modal).defaultPrevented) {
						return;
					}

					$modal.$enter();
				};

				$modal.applyPosition = function () {
					if($scope.$emit(options.name + '.positioning.after', $modal).defaultPrevented) {
						return;
					}

					$modal.$applyPosition();
				};
				
				$modal.toggle = function () {
					$modal.$isShown ? $modal.leave() : $modal.enter();
				};

				$scope.$show = function () {
					$modal.enter();
				};

				$scope.$hide = function () {
					$modal.leave();
				};

				if(options.enter) {
					$modal.enter();
				}

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
					$scope: scope,
					enter: false
				};

				angular.forEach(['content'], function (key) {
					if(angular.isDefined(attrs[key])) options[key] = attrs[key];
				});

				var modal = $modal(options);
				element.on('click', modal.toggle);
			}
		};
	});