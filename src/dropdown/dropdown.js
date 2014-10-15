angular
	.module('ngFoundation.dropdown', [])

	.provider('$dropdown', function () {
		var $dropdownProvider = this;

		this.defaults = {
			templateUrl: 'dropdown/dropdown.tpl.html',
			align: 'bottom',
			name: 'dropdown',
			megaClass: 'mega',
			animation: 'am-flip-x'
		};

		this.$get = function ($position, $fd, $tooltip, $document, $window, $q, $timeout, $templateCache, $compile, $rootScope, $animate) {
			$document = angular.element($document);
			$window = angular.element($window);

			function DropdownFactory ($target, options) {
				var $dropdown = {}, $scope;

				options = $dropdown.$options = angular.extend({}, $dropdownProvider.defaults, options);
				$dropdown = $tooltip($target, options);
				$scope = options.$scope;

				$dropdown.$adjustPip = function (position) {
					var $element = $dropdown.$element;

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

				$scope.$on('dropdown.positioning.before', function (event, $tooltip) {
					var $target = $tooltip.$target,
					$element = $tooltip.$element;

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
						var css = angular.extend({
							position: 'absolute'
						}, $position.directions[options.align]($element, $target, options));

						$element.attr('style', '').css(css);

						angular.forEach(['bottom', 'left', 'top', 'right'], function (align) {
							if(align === options.align) {
								$element.addClass('drop-' + align);
							}
						});
					}

					if ($target.outerWidth() < $element.outerWidth() || ($fd.small() && !$fd.medium()) || $element.hasClass(options.megaClass)) {
						$dropdown.$adjustPip(position);
					}

					if(options.align === 'top' || options.align === 'bottom') {
						$element.addClass('open') && $target.addClass('open');
					}

					$element.focus();
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

				element.on('click', dropdown.toggle);
			}
		};
	});