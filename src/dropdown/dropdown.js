angular
	.module('ngFoundation.dropdown', [])

	.factory('$position', function ($fd) {
		var $position = {};

		$position.base = function (element, parent) {
			var o_p = element.offsetParent(),
					o = o_p.offset(),
					position = parent.offset();

			position.top -= o.top;
			position.left -= o.left;

			return position;
		};

		$position.adjustPip = function (element, parent, configs, position) {
			var sheet = $fd.stylesheet,
			pipOffsetBase = 8,
			ruleIdx = $position.ruleIdx;

			if(element.hasClass(configs.megaClass)) {
				pipOffsetBase = position.left + (parent.outerWidth() / 2) - 8;
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

		$position.directions = {
			bottom: function (element, parent, configs) {
				var position = $position.base(element, parent);

				if (parent.outerWidth() < element.outerWidth() || ($fd.small() && !$fd.medium()) || element.hasClass(configs.mega_menu)) {
					$position.adjustPip(element, parent, configs, position);
				}

				if ($fd.rtl) {
					return {
						left: position.left - this.outerWidth() + parent.outerWidth(),
						top: position.top + parent.outerHeight()
					};
				}

				return {
					left: position.left,
					top: position.top + parent.outerHeight()
				};
			},
			top: function (element, parent, configs) {
				var position = $position.base(element, parent);

				element.addClass('drop-top');

				if (parent.outerWidth() < element.outerWidth() || ($fd.small() && !$fd.medium()) || element.hasClass(configs.megaClass)) {
					$position.adjustPip(element, parent, configs, position);
				}

				if ($fd.rtl) {
					return {
						left: position.left - element.outerWidth() + parent.outerWidth(),
						top: position.top - element.outerHeight()
					};
				}

				return {
					left: position.left,
					top: position.top - element.outerHeight()
				};
			},
			left: function (element, parent, configs) {
				var position = $position.base(element, parent);

				element.addClass('drop-left');

				return {
					left: position.left - element.outerWidth(),
					top: position.top
				};
			},
			right: function (element, parent, configs) {
				var position = $position.base(element, parent);

				element.addClass('drop-right');

				return {
					left: position.left + parent.outerWidth(),
					top: position.top
				};
			}
		};

		$position.style = function (element, parent, configs) {
			var css = angular.extend({
				position: 'absolute'
			}, $position.directions[configs.align](element, parent, configs));

			element.attr('style', '').css(css);
		};

		$position.clearIdx = function () {
			var sheet = $fd.sheet;

			if($position.ruleIdx) {
				sheet.deleteRule($position.ruleIdx);
				sheet.deleteRule($position.ruleIdx);
				delete $position.ruleIdx;
			}
		};

		/**
		 * Apply the DOM element position based on parent position.
		 */
		$position.applyPosition = function (element, parent, configs) {
			var leftOffset = Math.max((parent.width() - element.width()) / 2, 8);

			$position.clearIdx();

			if(configs.align === 'left' || configs.align === 'right') {
				element.removeClass('open') && parent.removeClass('open');
			}

			if ($fd.small() && !$fd.medium()) {
				var position = $position.directions.bottom(element, parent, configs);

				element
					.attr('style', '')
					.removeClass('drop-left drop-right drop-top').css({
						position : 'absolute',
						width: '95%',
						'max-width': 'none',
						top: position.top
					});

				element.css($fd.rtl ? 'right' : 'left', leftOffset);

				if(configs.align === 'left' || configs.align === 'right') {
					element.addClass('open') && parent.addClass('open');
				}
			} else {
				$position.style(element, parent, configs);
			}

			if(configs.align === 'top' || configs.align === 'bottom') {
				element.addClass('open') && parent.addClass('open');
			}

			element.focus();

			return element;
		};

		return $position;
	})

	.provider('$dropdown', function () {
		var $dropdownProvider = this;

		this.defaults = {
			templateUrl: 'dropdown/dropdown.tpl.html',
			align: 'bottom',
			name: 'dropdown',
			megaClass: 'mega'
		};

		this.$get = function ($tooltip, $position, $document, $rootScope) {
			$document = angular.element($document);

			function DropdownFactory ($parent, options) {
				var $dropdown = {}, $scope, $parent, $element;

				$dropdown.$options = angular.extend({}, $dropdownProvider.defaults, options);
				$dropdown = $tooltip($parent, $dropdown.$options);
				$element = $dropdown.$element;
				$parent = $dropdown.$parent;

				function onBodyClick (event) {
					if(event.target === $dropdown.$parent[0]) return;
					return event.target !== $dropdown.$parent[0] && $dropdown.$leave();
				}

				angular.forEach(['content', 'items'], function (key) {
					if(angular.isDefined(options[key])) $dropdown.$scope[key] = options[key];
				});

				$dropdown.applyPosition = $position.applyPosition;

				$dropdown.leave = function ($dropdown) {
					$dropdown.$parent.removeClass('open');
					$dropdown.$element.removeClass('open');
				};

				$dropdown.$scope.$on('dropdown:show:after', function (event) {
					$document.bind('click focus blur', onBodyClick);
				});

				$dropdown.$scope.$on('dropdown:leave:after', function (event) {
					$document.unbind('click focus blur', onBodyClick);
				});

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
			}
		};
	});