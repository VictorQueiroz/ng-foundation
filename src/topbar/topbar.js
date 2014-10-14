'use strict';

angular
	.module('ngFoundation.topbar', [])

	.config(function ($fdProvider) {
		$fdProvider.registerMedia('topbar', 'foundation-mq-topbar');
	})

	.provider('$topbar', function () {
		var $topbarProvider = this;

		this.defaults = {
			expandedClass: 'expanded',
			// Classes which will be added to the
			// dropdowns if the option isHover is
			// equal to true
			notClickClass: 'not-click',
			stickyOn: 'all',
			stickyClass: 'sticky',
			isHover: true,
			expanded: false
		};

		this.$get = function ($animate, $rootScope, $fd, $q, $timeout, $window) {
			$window = angular.element($window);

			function $TopbarFactory ($element, options) {
				var $topbar = {}, $scope, $container;

				options = $topbar.$options = angular.extend({}, $topbarProvider.defaults, options);
				
				$container = $topbar.$container = $element.parent();
				$topbar.$element = $element;
				$topbar.index = 0;

				$window.on('resize', function (event) {
					$topbar.resize();
				});

				$topbar.isSticky = function () {
					var sticky = $container.hasClass($topbarProvider.stickyClass),
					stickyOn = $topbarProvider.stickyOn;

					if(sticky && stickyOn === 'all') {
						return true;
					} else if (sticky && $fd.small() && stickyOn === 'small') {
						return $fd.small() && !$fd.large();
					} else if (sticky && $fd.medium() && stickyOn === 'medium') {
						return $fd.small() && !$fd.large();
					} else if (sticky && $fd.large() && stickyOn === 'large') {
						return $fd.small() && $fd.large();
					}

					return false;
				};

				if($container.hasClass('fixed') || $topbar.isSticky($topbar, $topbar.$container)) {
					$topbar.height = $topbar.$container.outerHeight();
				} else {
					$topbar.height = $topbar.$element.outerHeight();
				}

				$scope = $topbar.$options.$scope = $topbar.$options.$scope || $rootScope.$new();
				$scope.expanded = options.expanded;

				$topbar.toggle = function () {
					var section = $topbar.$section.$element;

					if($fd.topbar()) {
						if(!$fd.rtl) {
							section.css({ left: '0%' });
							angular.element('>.name', section).css({ left: '100%' });
						} else {
							section.css({ right: '0%' });
							angular.element('>.name', section).css({ right: '100%' });
						}

						$topbar.index = 0;
						$topbar.$element.css('height', '');
					}

					$scope.$apply(function () {
						$scope.expanded = !$scope.expanded;
					});
				};

				$topbar.resize = function () {
					var stickyContainer = $element.parent('.' + $topbarProvider.stickyClass);
					var stickyOffset;

					if(!$fd.topbar()) {
						var shouldToggle = $element.hasClass('expanded');

						$element
							.css('height', '')
							.removeClass('expanded');

						if(shouldToggle) {
							$topbar.toggle();
						}
					}

					if($topbar.isSticky()) {
						if(stickyContainer.hasClass('fixed')) {
							stickyContainer.removeClass('fixed');
							stickyOffset = stickyContainer.offset().top;

							if(angular.element(document.body).hasClass('f-topbar-fixed')) {
								stickyOffset -= $topbar.height;
							}

							$topbar.stickyOffset = stickyOffset;
							stickyContainer.addClass('fixed');
						} else {
							stickyOffset = stickyContainer.offset().top;
							$topbar.stickyOffset = stickyOffset;
						}
					}
				};

				$topbar.$setSection = function (section) {
					$topbar.$section = section;
				};

				$topbar.getSection = function () {
					var deferred = $q.defer();
					$timeout(function () {
						deferred.resolve($topbar.$section);
					});
					return deferred.promise;
				};

				$scope.$watch('expanded', function (expanded) {
					$animate[expanded ? 'addClass' : 'removeClass']($element, options.expandedClass);
				});

				return $topbar;
			}

			return $TopbarFactory;
		};
	})

	.controller('TopbarController', function ($scope, $element, $attrs, $fd, $topbar) {
		var ctrl = this;

		this.$topbar = null;
		this.$options = {
			$scope: $scope
		};

		this.$topbar = $topbar($element, this.$options);

		this.$setSection = function (section) {
			ctrl.$section = section;
			ctrl.$topbar.$setSection(section);
		};
	})

	.directive('topBar', function () {
		return {
			restrict: 'C',
			controller: 'TopbarController',
			scope: {},
			link: function postLink (scope, element, attrs) {
			}
		};
	})

	.directive('toggleTopbar', function () {
		return {
			restrict: 'C',
			require: '?^topBar',
			link: function (scope, element, attrs, topBar) {
				element.on('click', function () {
					topBar.$topbar.toggle();
				});
			}
		};
	})

	.controller('SectionController', function ($scope, $element, $attrs) {
		var ctrl = this;

		this.$element = $element;
		this.$topBar = null;

		this.$setTopBar = function (topBar) {
			ctrl.$topBar = topBar;
		};
	})

	.directive('section', function () {
		return {
			restrict: 'E',
			require: ['?^topBar', 'section'],
			controller: 'SectionController',
			link: function (scope, element, attrs, ctrls) {
				var topBar = ctrls[0],
				section = ctrls[1];

				section.$setTopBar(topBar);
				topBar.$setSection(section);
			}
		};
	})

	.controller('HasDropdownController', function ($window, $scope, $q, $timeout, $element, $attrs, $fd, $animate) {
		$window = angular.element($window);
		var ctrl = this, $topbar, $section, $dropdown;

		this.moved = false;
		this.$element = $element;
		this.$topBar = null;
		this.$dropdown = null;

		this.$setTopBar = function (topBar) {
			ctrl.$topBar = topBar;
			$topbar = ctrl.$topBar.$topbar;
		};

		this.$setDropdown = function (dropdown) {
			ctrl.$dropdown = dropdown;
		};

		this.$getDropdown = function () {
			var deferred = $q.defer();
			$timeout(function () {
				deferred.resolve(ctrl.$dropdown);
			});
			return deferred.promise;
		};

		this.$show = function ($section) {
			var section = $section.$element,
			element = ctrl.$element;

			if(!$fd.topbar()) return;

			$topbar.index = $topbar.index + 1;

			ctrl.$setMoved();

			if(!$fd.rtl) {
				section.css({ left: -(100 * $topbar.index) + '%' });
				section.find('>.name').css({ left: 100 * $topbar.index + '%' });
			} else {
				section.css({ right: -(100 * $topbar.index) + '%' });
				section.find('>.name').css({ right: 100 * $topbar.index + '%' });
			}

			$topbar.$element.css('height', ctrl.$dropdown.$element.outerHeight(true) + $topbar.height);
		};

		this.show = function () {
			$topbar.getSection().then(ctrl.$show);
		};

		this.$back = function ($section) {
			var section = $section.$element,
			topbar = $topbar.$element;

			$topbar.index = $topbar.index - 1;

			if(!$fd.rtl) {
				section.css({ left: -(100 * $topbar.index) + '%' });
				section.find('>.name').css({ left: 100 * $topbar.index + '%' });
			} else {
				section.css({ right: -(100 * $topbar.index) + '%' });
				section.find('>.name').css({ right: 100 * $topbar.index + '%' });
			}

			if($topbar.index === 0) {
				topbar.css('height', '');
			} else {
				topbar.css('height', $element.parent().outerHeight(true) + $topbar.height);
			}

			ctrl.$setNotMoved();
		};

		this.back = function () {
			$topbar.getSection().then(ctrl.$back);
		};

		this.$setMoved = function () {
			ctrl.moved = true;
			$element.addClass('moved');
		};

		this.$setNotMoved = function () {
			ctrl.moved = false;
			setTimeout(function () {
				$element.removeClass('moved');
			}, 300);
		};

		function onResize (event) {
			if(!$fd.topbar()) {
				ctrl.$setNotMoved();
			} else if (ctrl.moved && $fd.topbar()) {
				ctrl.$setMoved();
			}
		}

		$window.on('resize', onResize);

		$scope.$watch(function () {
			return ctrl.$topBar.$topbar.$options.$scope.expanded;
		}, function (newVal, oldVal) {
			if(oldVal === newVal) return;

			ctrl.$setNotMoved();
		});
	})

	.directive('hasDropdown', function ($compile) {
		return {
			restrict: 'C',
			require: ['?^topBar', 'hasDropdown'],
			controller: 'HasDropdownController',
			scope: {},
			compile: function (tElement, tAttrs, transclude) {
				var topBar, hasDropdown, back;

				back = '<li class="title back js-generated"><h5><a href="">Back</a></h5></li>';
				back = angular.element(back);

				return {
					pre: function postLink (scope, element, attrs, ctrls) {
						topBar = ctrls[0];
						hasDropdown = ctrls[1];

						// dropdown back button
						hasDropdown.$getDropdown().then(function ($dropdown) {
							$dropdown.$element.prepend(back);
							$compile(back)(scope);
						});
					},
					post: function postLink (scope, element, attrs, ctrls) {
						if(!topBar) return;

						var options = topBar.$topbar.$options;
						hasDropdown.$setTopBar(topBar);

						var isHover = options.isHover,
						notClickClass = options.notClickClass;

						if(isHover) {
							element.addClass(notClickClass);
						} else if (element.hasClass(notClickClass)) {
							element.removeClass(notClickClass);
						}

						function onClick (event) {
							event.preventDefault();

							if(hasDropdown.moved) return;

							hasDropdown.show();
						}

						element.on('click', onClick);
					}
				};
			}
		};
	})

	.controller('DropdownController', function ($scope, $element, $attrs, $q, $timeout) {
		var ctrl = this, $hasDropdown;

		this.$element = $element;
		this.$hasDropdown = null;
		this.$setHasDropdown = function (hasDropdown) {
			ctrl.$hasDropdown = hasDropdown;
		};
	})

	.directive('back', function () {
		return {
			restrict: 'C',
			require: ['?^topBar', '?^hasDropdown'],
			link: function (scope, element, attrs, ctrls) {
				var topBar = ctrls[0],
				hasDropdown = ctrls[1],
				timeout;

				if(!topBar) return;

				function onClick () {
					if(!hasDropdown.moved) return;

					clearTimeout(timeout);

					timeout = setTimeout(function () {
						hasDropdown.back();
					}, 300);
				}

				element.on('click', onClick);
			}
		};
	})

	.directive('dropdown', function () {
		return {
			restrict: 'C',
			controller: 'DropdownController',
			require: ['?^hasDropdown', 'dropdown', '?^topBar'],
			link: function postLink (scope, element, attrs, ctrls) {
				var hasDropdown = ctrls[0],
				dropdown = ctrls[1],
				topBar = ctrls[2];

				if(!topBar) return;

				dropdown.$setHasDropdown(hasDropdown);
				hasDropdown.$setDropdown(dropdown);
			}
		};
	});