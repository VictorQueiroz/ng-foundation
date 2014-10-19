angular
	.module('ngFoundation.alert', [])

	.provider('$alert', function () {
		var $alertProvider = this;

		this.defaults = {
			backdrop: false,
			name: 'alert',
			templateUrl: 'alert/alert.tpl.html',
			animation: 'am-slide-bottom',
			duration: 6,
			type: 'alert',
			enter: true
		};

		this.$get = function ($modal, $timeout) {
			function $AlertFactory (options) {
				var $alert = {}, $scope, $element;
				options = $alert.$options = angular.extend({}, $alertProvider.defaults, options);
				$alert = $modal(options);
				$scope = options.$scope;

				angular.forEach(['content'], function (key) {
					if(angular.isDefined(options[key])) {
						$scope['$' + key] = options[key];
					}
				});

				$alert.$applyPosition = function () {
					$element = $alert.$element;

					var css = {
						opacity: 1,
						visibility: 'visible',
						display: 'block',
						bottom: '0%',
						'z-index': 99999,
						left: '5%',
						width: '90%',
						position: 'fixed',
					};

					var classes = '';

					if(typeof options.type === 'string') {
						classes = options.type;
					} else if(typeof options.type === 'array') {
						classes = classes.join(' ');
					}

					$element
						.css(css)
						.addClass(classes);

					$alert.$bindEvents();

					$alert.$isShown = true;
					$scope.$$phase || ($scope.$root && $scope.$root.$$phase) || $scope.$digest();

					if(options.duration) {
						$timeout(function () {
							$alert.leave();
						}, options.duration * 1000);
					}
				};

				return $alert;
			}

			return $AlertFactory;
		};
	})

	.directive('fdAlert', function ($alert) {
		return {
			restrict: 'A',
			scope: {},
			link: function (scope, element, attrs) {
				var options = {
					$scope: scope,
					enter: false
				};

				angular.forEach(['content', 'type', 'animation', 'duration'], function (key) {
					if(angular.isDefined(attrs[key])) options[key] = attrs[key];
				});

				var alert = $alert(options);

				element.on('click', alert.toggle);
			}
		};
	});