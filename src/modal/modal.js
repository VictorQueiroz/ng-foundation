angular
	.module('ngFoundation.modal', [])

	.provider('$modal', function () {
		var $modalProvider = this;

		this.defaults = {
			templateUrl: 'modal/modal.tpl.html',
			animation: 'fadeAndPop',
			animationSpeed: 250,
			closeOnBackgroundClick: true,
			closeOnEsc: true,
			dismissModalClass: 'close-reveal-modal',
			bgClass: 'reveal-modal-bg',
			rootElement: 'body',
			css: {
				opened: {
					opacity: 0,
					visibility: 'visible',
					display: 'block'
				},
				closed: {
					opacity: 1,
					visibility: 'hidden',
					display: 'none'
				}
			}
		};

		this.$get = function ($rootScope, $window, $fd, $animate, $q, $timeout, $compile, $document, $templateCache) {
			$window = angular.element($window);
			var body = angular.element($document.body);

			function $ModalFactory (element, options) {
				var $modal = {}, $scope;

				options = $modal.$options = angular.extend({}, $modalProvider.defaults, options);
				$modal.$options.$scope = $modal.$options.$scope && $modal.$options.$scope.$new() || $rootScope.$new();
				$scope = $modal.$options.$scope;
				$modal.$element = null;

				$modal.$getTemplate = function () {
					var deferred = $q.defer();
					$timeout(function () {
						deferred.resolve($templateCache.get(options.templateUrl));
					});
					return deferred.promise;
				};

				$modal.applyPosition = function () {
					var $element = $modal.$element;

					$element.addClass('open');

					$element.css({
						opacity: 1,
						visibility: 'visible',
						display: 'block',
						top: '',
						position: ''
					});

					if($fd.small() && !$fd.medium()) {
						$element.css({
							position: 'fixed'
						});

						body.css({
							overflow: 'hidden'
						});
					} else {
						$element.css({
							position: 'fixed',
							top: '50%'
						});
					}
				};

				$modal.$open = function (event) {
					function onElementLoaded () {
					}

					function onTemplateLoaded (template) {
						$modal.$element = angular.element(template);
						$modal.$element = $compile($modal.$element)($modal.$options.$scope);

						$animate.enter($modal.$element, element, element, onElementLoaded);

						$modal.applyPosition($modal.$element);
					}

					$modal.$getTemplate().then(onTemplateLoaded);
				};

				$modal.open = function (event) {
					$modal.$open(event);
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
				var options = {};

				var modal = $modal(element, options);
				element.on('click', modal.open);
			}
		};
	});