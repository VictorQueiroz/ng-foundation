angular
	.module('ngFoundation.dropdown', [])

	.factory('$position', function ($fd) {
		var $position = window.position = {};

		/**
		 * Test the element nodeName.
		 */
		var nodeName = $position.nodeName = function(element, name) {
      return element.nodeName && element.nodeName.toLowerCase() === name.toLowerCase();
    };

		$position.getWindow = function (element) {
			return element.nodeType === 9 && element.defaultView;
		};

		$position.css = function(element, prop, extra) {
      var value;
      if (element.currentStyle) { //IE
        value = element.currentStyle[prop];
      } else if (window.getComputedStyle) {
        value = window.getComputedStyle(element)[prop];
      } else {
        value = element.style[prop];
      }
      return extra === true ? parseFloat(value) || 0 : value;
    };

		$position.offset = function (element) {
			var offset = { top: 0, left: 0 };
			var ownerDocument = element && element.ownerDocument;

			if(!ownerDocument) return;

			var documentElement = ownerDocument.documentElement;

			if(element.getBoundingClientRect) {
				offset = angular.extend(offset, element.getBoundingClientRect());
			}

			var w = $position.getWindow(ownerDocument);

			return {
				top: offset.top + w.pageYOffset - documentElement.clientTop,
				left: offset.left + w.pageXOffset - documentElement.clientLeft
			};
		};

		$position.height = function(element, outer) {
      var value = element.offsetHeight;
      if(outer) {
        value += $position.css(element, 'marginTop', true) + $position.css(element, 'marginBottom', true);
      } else {
        value -= $position.css(element, 'paddingTop', true) + $position.css(element, 'paddingBottom', true) + $position.css(element, 'borderTopWidth', true) + $position.css(element, 'borderBottomWidth', true);
      }
      return value;
    };

		$position.width = function(element, outer) {
      var value = element.offsetWidth;
      if(outer) {
        value += $position.css(element, 'marginLeft', true) + $position.css(element, 'marginRight', true);
      } else {
        value -= $position.css(element, 'paddingLeft', true) + $position.css(element, 'paddingRight', true) + $position.css(element, 'borderLeftWidth', true) + $position.css(element, 'borderRightWidth', true);
      }
      return value;
    };

		var offsetParent = $position.offsetParent = function (element) {
			var ownerDocument = element.ownerDocument;
			var offsetParent = element.offsetParent || ownerDocument;
			if(nodeName(offsetParent, '#document')) return ownerDocument.documentElement;
			while(offsetParent && !nodeName(offsetParent, 'html') && $position.css(offsetParent, 'position') === 'static') {
				offsetParent = offsetParent.offsetParent;
			}
			return offsetParent || ownerDocument.documentElement;
		};

		$position.position = function(element) {
      var offsetParentRect = {top: 0, left: 0},
          offsetParentElement,
          offset;

      // Fixed elements are offset from window (parentOffset = {top:0, left: 0}, because it is it's only offset parent
      if ($position.css(element, 'position') === 'fixed') {

        // We assume that getBoundingClientRect is available when computed position is fixed
        offset = element.getBoundingClientRect();

      } else {

        // Get *real* offsetParentElement
        offsetParentElement = offsetParent(element);
        offset = $position.offset(element);

        // Get correct offsets
        offset = $position.offset(element);
        if (!nodeName(offsetParentElement, 'html')) {
          offsetParentRect = $position.offset(offsetParentElement);
        }

        // Add offsetParent borders
        offsetParentRect.top += $position.css(offsetParentElement, 'borderTopWidth', true);
        offsetParentRect.left += $position.css(offsetParentElement, 'borderLeftWidth', true);
      }

      // Subtract parent offsets and element margins
      return {
        width: element.offsetWidth,
        height: element.offsetHeight,
        top: offset.top - offsetParentRect.top - $position.css(element, 'marginTop', true),
        left: offset.left - offsetParentRect.left - $position.css(element, 'marginLeft', true)
      };
    };

		$position.base = function (element, target) {
			var o_p = $position.offsetParent(element[0]),
					o = $position.offset(o_p),
					position = $position.offset(target[0]);

			position.top -= o.top;
			position.left -= o.left;

			return position;
		};

		$position.directions = {
			bottom: function (element, target) {
				var position = $position.base(element, target);

				if ($fd.rtl) {
					return {
						left: position.left - element.outerWidth() + target.outerWidth(),
						top: position.top + target.outerHeight()
					};
				}

				return {
					left: position.left,
					top: position.top + target.outerHeight()
				};
			},
			top: function (element, target) {
				var position = $position.base(element, target);

				if ($fd.rtl) {
					return {
						left: position.left - element.outerWidth() + target.outerWidth(),
						top: position.top - element.outerHeight()
					};
				}

				return {
					left: position.left,
					top: position.top - element.outerHeight()
				};
			},
			left: function (element, target) {
				var position = $position.base(element, target);

				return {
					left: position.left - element.outerWidth(),
					top: position.top
				};
			},
			right: function (element, target) {
				var position = $position.base(element, target);

				return {
					left: position.left + target.outerWidth(),
					top: position.top
				};
			}
		};

		$position.clearIdx = function () {
			var sheet = $fd.sheet;

			if($position.ruleIdx) {
				sheet.deleteRule($position.ruleIdx);
				sheet.deleteRule($position.ruleIdx);
				delete $position.ruleIdx;
			}
		};

		return $position;
	})

	.provider('$dropdown', function () {
		var $dropdownProvider = this;

		this.defaults = {
			templateUrl: 'dropdown/dropdown.tpl.html',
			align: 'bottom',
			name: 'dropdown',
			megaClass: 'mega',
			animation: 'am-flip-x'
		};

		this.$get = function ($position, $fd, $document, $window, $q, $timeout, $templateCache, $compile, $rootScope, $animate) {
			$document = angular.element($document);
			$window = angular.element($window);

			function DropdownFactory ($target, options) {
				var $dropdown = {}, $scope, $target, $element;

				options = $dropdown.$options = angular.extend({}, $dropdownProvider.defaults, options);
				$dropdown.$options.$scope = $scope = options.$scope || $rootScope.$new();
				$dropdown.$target = $target;
				$dropdown.$element = $element = null;
				$dropdown.$isShown = false;

				angular.forEach(['content', 'items'], function (key) {
					if(angular.isDefined(options[key])) $dropdown.$scope[key] = options[key];
				});

				function onBodyClick (event) {
					if(event.target !== $dropdown.$target[0]) {
						$dropdown.leave();
					}
				}

				function onElementLeave () {
				}

				function onElementEnter () {
				}

				function onResize (event) {
					$dropdown.applyPosition();
				}

				$dropdown.$adjustPip = function (position) {
					var sheet = $fd.stylesheet,
					pipOffsetBase = 8,
					ruleIdx = $position.ruleIdx;

					if($element.hasClass(options.megaClass)) {
						pipOffsetBase = position.left + ($target.outerWidth() / 2) - 8;
					} else if ($fd.small() && !$fd.medium()) {
						pipOffsetBase += position.left - 8;
					}

					ruleIdx = sheet.cssRules.length;

					var selBefore = '.f-dropdown.open:before',
							selAfter = '.f-dropdown.open:after',
							cssBefore = 'left: ' + pipOffsetBase + 'px;';
							cssAfter = 'left: ' + (pipOffsetBase - 1) + 'px;';

					if(sheet.insertRule) {
						sheet.insertRule([selBefore, '{', cssBefore ,'}'].join(' '), ruleIdx);
						sheet.insertRule([selAfter, '{', cssAfter ,'}'].join(' '), ruleIdx + 1);
					} else {
						sheet.addRule(selBefore, cssBefore, ruleIdx);
						sheet.addRule(selAfter, cssAfter, ruleIdx + 1);
					}
				};

				$dropdown.applyPosition = function () {
					if($scope.$emit('dropdown.position.before', $dropdown).defaultPrevented) {
						return;
					}

					$dropdown.$applyPosition();
				};

				$dropdown.$applyPosition = function () {
					var leftOffset = Math.max(($target.width() - $element.width()) / 2, 8);
					var position = $position.base($element, $target);

					$position.clearIdx();

					if(options.align === 'left' || options.align === 'right') {
						$element.removeClass('open') && $target.removeClass('open');
					}

					// if it is a mobile
					if ($fd.small() && !$fd.medium()) {
						position = $position.directions.bottom($element, $target, options);

						$element
							.attr('style', '')
							.removeClass('drop-left drop-right drop-top').css({
								position : 'absolute',
								width: '95%',
								'max-width': 'none',
								top: position.top
							});

						$element.css($fd.rtl ? 'right' : 'left', leftOffset);

						if(options.align === 'left' || options.align === 'right') {
							$element.addClass('open') && $target.addClass('open');
						}
					} else {
						// if it is not
						setTimeout(function () {
							var css = angular.extend({
								position: 'absolute'
							}, $position.directions[options.align]($element, $target, options));

							$element.attr('style', '').css(css);

							angular.forEach(['bottom', 'left', 'top', 'right'], function (align) {
								if(align === options.align) {
									$element.addClass('drop-' + align);
								}
							});
						}, 100);
					}

					if ($target.outerWidth() < $element.outerWidth() || ($fd.small() && !$fd.medium()) || $element.hasClass(options.megaClass)) {
						$dropdown.$adjustPip(position);
					}

					if(options.align === 'top' || options.align === 'bottom') {
						$element.addClass('open') && $target.addClass('open');
					}

					$element.focus();

					$scope.$emit('dropdown.position.after', $dropdown);
				};

				$dropdown.$getTemplate = function () {
					return $q.when($templateCache.get(options.templateUrl));
				};

				$dropdown.$buildElement = function () {
					return $compile($element)($scope);
				};

				$dropdown.$enter = function () {
					var promise;

					function onTemplateLoaded (template) {
						$dropdown.$element = angular.element(template);
						$element = $dropdown.$element;

						$dropdown.$buildElement();

						$element.addClass(options.animation);

						promise = $animate.enter($element, $target, $target, onElementEnter);
						if(promise && promise.then) promise.then(onElementEnter);

						$dropdown.applyPosition();

						$dropdown.$isShown = true;
						$scope.$$phase || ($scope.$root && $scope.$root.$$phase) || $scope.$digest();

						$document.bind('click focus blur', onBodyClick);
						$window.on('resize', onResize);

						$scope.$emit('dropdown.enter.after', $dropdown);
					}

					$dropdown.$getTemplate().then(onTemplateLoaded);
				};

				$dropdown.$leave = function () {
					var promise = $animate.leave($element, onElementLeave);
					if(promise && promise.then) promise.then(onElementLeave);

					$dropdown.$target.removeClass('open') && $dropdown.$element.removeClass('open');

					$dropdown.$isShown = false;
					$scope.$$phase || ($scope.$root && $scope.$root.$$phase) || $scope.$digest();

					$document.unbind('click focus blur', onBodyClick);
					$window.off('resize', onResize);

					$scope.$emit('dropdown.leave.after', $dropdown);
				};

				$dropdown.enter = function () {
					if($dropdown.$isShown) return;

					if($scope.$emit('dropdown.enter.before', $dropdown).defaultPrevented) {
						return;
					}

					$timeout(function () {
						$dropdown.$enter();
					});
				};

				$dropdown.leave = function () {
					if(!$dropdown.$isShown) return;

					if($scope.$emit('dropdown.leave.before', $dropdown).defaultPrevented) {
						return;
					}

					$timeout(function () {
						$dropdown.$leave();
					});
				};

				$dropdown.toggle = function () {
					$dropdown.$isShown ? $dropdown.leave() : $dropdown.enter();
				};

				return $dropdown;
			}

			return DropdownFactory;
		};
	})

	.directive('fdDropdown', function ($dropdown) {
		return {
			restrict: 'A',
			scope: true,
			link: function postLink (scope, element, attrs) {
				var options = {
					$scope: scope
				};

				angular.forEach(['content', 'align'], function (key) {
					if(angular.isDefined(attrs[key])) options[key] = attrs[key];
				});

				var dropdown = $dropdown(element, options);

				element.on('click', dropdown.toggle);
			}
		};
	});