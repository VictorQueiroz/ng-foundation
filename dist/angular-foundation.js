angular
	.module('ngFoundation', [
		'ngFoundation.foundation',
		'ngFoundation.dropdown',
		'ngFoundation.tooltip',
		'ngFoundation.tabs',
		'ngFoundation.topbar',
		'ngFoundation.modal',
		'ngFoundation.rangeSlider',
		'ngFoundation.templates'
	]);

angular.module('ngFoundation.templates', []);
angular
	.module('ngFoundation.dropdown', [])

	.factory('$position', ["$fd", function ($fd) {
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
	}])

	.provider('$dropdown', function () {
		var $dropdownProvider = this;

		this.defaults = {
			templateUrl: 'dropdown/dropdown.tpl.html',
			align: 'bottom',
			name: 'dropdown',
			megaClass: 'mega'
		};

		this.$get = ["$tooltip", "$position", "$document", "$rootScope", function ($tooltip, $position, $document, $rootScope) {
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
		}];
	})

	.directive('fdDropdown', ["$dropdown", function ($dropdown) {
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
	}]);
'use strict';

angular
	.module('ngFoundation.foundation', [])

	.provider('$fd', function () {
		var $fdProvider = this;

		this.headerHelpers = [
			'foundation-mq-small',
			'foundation-mq-medium',
			'foundation-mq-large',
			'foundation-mq-xlarge',
			'foundation-mq-xxlarge',
			'foundation-data-attribute-namespace'
		];

		this.namespace = 'my-namespace';

		this.stylesheet = angular.element('<style></style>').appendTo('head')[0].sheet;

	  this.removeQuotes = function (string) {
	    if (typeof string === 'string' || string instanceof String) {
	      string = string.replace(/^['\\/"]+|(;\s?})+|['\\/"]+$/g, '');
	    }

	    return string;
	  };

		this.mediaQueries = {
			small : angular.element(document.querySelector('.foundation-mq-small')).css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
			medium : angular.element(document.querySelector('.foundation-mq-medium')).css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
			large : angular.element(document.querySelector('.foundation-mq-large')).css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
			xlarge: angular.element(document.querySelector('.foundation-mq-xlarge')).css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
			xxlarge: angular.element(document.querySelector('.foundation-mq-xxlarge')).css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, '')
		};

    this.addCustomRule = function (rule, media) {
      if (media === undefined && $fdProvider.stylesheet) {
        $fdProvider.stylesheet.insertRule(rule, $fdProvider.stylesheet.cssRules.length);
      } else {
        var query = $fdProvider.mediaQueries[media];

        if (query !== undefined) {
          $fdProvider.stylesheet.insertRule('@media ' + $fdProvider.mediaQueries[media] + '{ ' + rule + ' }');
        }
      }
    };

		this.registerMedia = function (media, mediaClass) {
			var head;

			head = document.getElementsByTagName('head')[0];
			head = angular.element(head);

      if($fdProvider.mediaQueries[media] === undefined) {
        head.append('<meta class="' + mediaClass + '"/>');
        $fdProvider.mediaQueries[media] = $fdProvider.removeQuotes(angular.element('.' + mediaClass).css('font-family'));
      }
		};

		// add header helpers
		var head, i = this.headerHelpers.length;

		head = document.getElementsByTagName('head')[0];
		head = angular.element(head);

		while(i--) {
			if(head.has('.' + this.headerHelpers[i]).length === 0) {
				head.append('<meta class="' + this.headerHelpers[i] + '">');
			}
		}

		this.$get = ["$window", function ($window) {
			function $FdFactory () {
				var $fd = {};

				$window.matchMedia = $window.matchMedia || (function matchMedia (doc) {
					var bool,
							docElem = doc.documentElement,
							refNode = docElem.firstElementChild || docElem.firstChild,
							// fakeBody required for <FF4 when executed in <head>
							fakeBody = doc.createElement("body"),
							div = doc.createElement("div");

					div.id = "mq-test-1";
					div.style.cssText = "position:absolute;top:-100em";
					fakeBody.style.background = "none";
					fakeBody.appendChild(div);

					return function (q) {
						div.innerHTML = "&shy;<style media=\"" + q + "\"> #mq-test-1 { width: 42px; }</style>";

						docElem.insertBefore( fakeBody, refNode );
						bool = div.offsetWidth === 42;
						docElem.removeChild( fakeBody );

						return {
							matches: bool,
							media: q
						};
					};
				}(document));

				$fd.small = function () {
					return matchMedia($fdProvider.mediaQueries.small).matches;
				};

		    $fd.medium = function () {
		      return matchMedia($fdProvider.mediaQueries.medium).matches;
		    };

		    $fd.large = function () {
		      return matchMedia($fdProvider.mediaQueries.large).matches;
		    };

		    Object.keys($fdProvider.mediaQueries).forEach(function (key) {
		    	if(key === 'small' || key === 'medium' || key === 'large' || $fd[key] !== undefined) return;

		    	$fd[key] = function () {
		    		return !matchMedia($fdProvider.mediaQueries[key]).matches;
		    	};
		    });

				$fd.attrName = function (init) {
					var arr = [];
					if(!init) arr.push('data');
					if($fdProvider.namespace.length > 0) arr.push($fdProvider.namespace);
				};

				$fd.addNamespace = function (str) {
			    var parts = str.split('-'),
			        i = parts.length,
			        arr = [];

			    while (i--) {
			      if (i !== 0) {
			        arr.push(parts[i]);
			      } else {
			        if ($fdProvider.namespace.length > 0) {
			          arr.push($fdProvider.namespace, parts[i]);
			        } else {
			          arr.push(parts[i]);
			        }
			      }
			    }

			    return arr.reverse().join('-');
				};

				$fd.stylesheet = $fdProvider.stylesheet;

				$fd.rtl = /rtl/i.test(angular.element(document.querySelector('html')).attr('dir'));

				return $fd;
			}

			return new $FdFactory;
		}];
	})
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

		this.$get = ["$rootScope", "$window", "$fd", "$sce", "$animate", "$q", "$timeout", "$compile", "$document", "$templateCache", function ($rootScope, $window, $fd, $sce, $animate, $q, $timeout, $compile, $document, $templateCache) {
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
		}];
	})

	.directive('fdModal', ["$modal", function ($modal) {
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
	}]);
angular
	.module('ngFoundation.rangeSlider', [])

	.provider('$rangeSlider', function () {
		var $rangeSliderProvider = this;

		this.defaults = {
			start: 0,
			end: 100,
			step: 1,
			initial: null,
			vertical: false,
			onChange: function () {}
		};

		this.$get = ["$rootScope", "$window", "$fd", "$q", "$timeout", function ($rootScope, $window, $fd, $q, $timeout) {
			function $RangeSliderFactory ($element, options) {
				var $rangeSlider = {};

				options = $rangeSlider.$options = angular.extend({}, $rangeSliderProvider.defaults, options);
				$rangeSlider.$options.$scope = $rangeSlider.$options.$scope || $rootScope.$new();
				$rangeSlider.$element = $element;
				$rangeSlider.$handle = null;
				$rangeSlider.$segment = null;

				$rangeSlider.$setHandle = function ($handle) {
					$rangeSlider.$handle = $handle;
				};

				$rangeSlider.onTouchstart = function (event) {};

				$rangeSlider.onTouchmove = function (event) {
					var scrollOffset = 0;

					if(!event.pageY) {
						scrollOffset = $window.scrollY;
					}

					$rangeSlider.applyPosition((event.pageY
					|| event.originalEvent.clientY
					|| event.originalEvent.touches[0].clientY ||
					event.currentPoint.y) + scrollOffset, $rangeSlider.$handle);
				};

				$rangeSlider.$setSegment = function (element) {
					$rangeSlider.$segment = element;
				};

				$rangeSlider.onTouchend = function (event) {};

				$rangeSlider.$setUi = function (value, position) {
					var barO = position.barO,
					barL = position.barL,
					handleO = position.handleO,
					handleL = position.handleL;

					var segment = $rangeSlider.$segment,
					normalizedPercentage = $rangeSlider.$normalizedPercentage(value, options.start, options.end),
					handleOffset = normalizedPercentage * (barL - handleL) - 1,
					progressBarLength = normalizedPercentage * 100;

					if($fd.rtl && !options.vertical) {
						handleOffset = -handleOffset;
					}

					handleOffset = options.vertical ? -handleOffset + barL - handleL + 1 : handleOffset;
					$rangeSlider.$setTranslate($rangeSlider.$handle, handleOffset);

					if(options.vertical) {
						segment.css('height', progressBarLength + '%');
					} else {
						segment.css('width', progressBarLength + '%');
					}
				};

				$rangeSlider.$normalizedPercentage = function (value, start, end) {
					return Math.min(1, (value - start) / (end - start));
				};

		    $rangeSlider.$normalizedValue = function(val, start, end, step) {
		      var range = end - start,
		          point = val*range,
		          mod = (point-(point%step)) / step,
		          rem = point % step,
		          round = ( rem >= step*0.5 ? step : 0);
		      return (mod*step + round) + start;
		    };

		    $rangeSlider.$setTranslate = function (el, offset) {
		      if (options.vertical) {
		        angular.element(el).css('-webkit-transform', 'translateY('+offset+'px)')
		          .css('-moz-transform', 'translateY('+offset+'px)')
		          .css('-ms-transform', 'translateY('+offset+'px)')
		          .css('-o-transform', 'translateY('+offset+'px)')
		          .css('transform', 'translateY('+offset+'px)');
		      } else {
		        angular.element(el).css('-webkit-transform', 'translateX('+offset+'px)')
		          .css('-moz-transform', 'translateX('+offset+'px)')
		          .css('-ms-transform', 'translateX('+offset+'px)')
		          .css('-o-transform', 'translateX('+offset+'px)')
		          .css('transform', 'translateX('+offset+'px)');
		      }
		    };

		    $rangeSlider.applyPosition = function (cursorX, handle) {
		    	$rangeSlider.$applyPosition(cursorX, handle);
		    };

		    $rangeSlider.$limitTo = function (val, min, max) {
		    	return Math.min(Math.max(val, min), max);
		    };

				$rangeSlider.$applyPosition = function (cursorX, handle) {
					var barOffset = $element.offset(),
					handleOffset = handle.offset(),
					barO, barL, handleO, handleL;

					if(options.vertical) {
						barO = barOffset.top;
						barL = $element.outerHeight();
						handleO = handleOffset.top;
						handleL = handle.outerHeight();
					} else {
						barO = barOffset.left;
						barL = $element.outerWidth();
						handleO = handleOffset.left;
						handleL = handle.outerWidth();
					}

					if($fd.rtl && !options.vertical) {
						pct = $rangeSlider.$limitTo(((barO + barL - cursorX) / barL), 0, 1);
					} else {
						pct = $rangeSlider.$limitTo(((cursorX - barO) / barL), 0, 1);
					}

					pct = options.vertical ? 1 - pct : pct;

					var norm = $rangeSlider.$normalizedValue(pct, options.start, options.end, options.step);

					var position = {
						barO: barO,
						barL: barL,
						handleO: handleO,
						handleL: handleL
					};

					$rangeSlider.$setUi(norm, position);
				};

				return $rangeSlider;
			}

			return $RangeSliderFactory;
		}];
	})

	.controller('RangeSliderController', ["$scope", "$element", "$attrs", "$rangeSlider", function ($scope, $element, $attrs, $rangeSlider) {
		var rangeSlider = this.$rangeSlider = $rangeSlider($element, {});

		this.onTouchstart = function (event) {
			rangeSlider.onTouchstart(event);
		};

		this.onTouchmove = function (event) {
			rangeSlider.onTouchmove(event);
		};

		this.onTouchend = function (event) {
			rangeSlider.onTouchend(event);
		};
	}])

	.directive('rangeSlider', function () {
		return {
			templateUrl: 'rangeSlider/rangeSlider.tpl.html',
			require: '?ngModel',
			controller: 'RangeSliderController',
			link: function (scope, element, attrs, ngModel) {
			}
		};
	})

	.directive('rangeSliderActiveSegment', function () {
		return {
			restrict: 'C',
			require: '?^rangeSlider',
			link: function preLink (scope, element, attrs, rangeSlider) {
				if(!rangeSlider) return;

				rangeSlider.$rangeSlider.$setSegment(element);
			}
		};
	})

	.directive('rangeSliderHandle', function () {
		return {
			restrict: 'C',
			require: '?^rangeSlider',
			link: function preLink (scope, element, attrs, rangeSlider) {
				if(!rangeSlider) return;

				rangeSlider.$rangeSlider.$setHandle(element);

				element.bind('mousedown pointerdown touchmove', rangeSlider.onTouchmove);
				element.bind('mousemove pointermove touchstart', rangeSlider.onTouchstart);
				element.bind('mouseup pointerup touchend', rangeSlider.onTouchend);
			}
		};
	});
angular
	.module('ngFoundation.tabs', [])

	.controller('TabController', ["$scope", "$element", "$attrs", function ($scope, $element, $attrs) {
		var tabs = [];

		function generateTabId () {
			return Math.floor((Math.random() * 9999) + 1);
		}

		this.addTab = function (title, content) {
			var tab = {
				id: generateTabId(),
				title: title,
				content: content,
				active: false
			};

			tabs.push(tab);
		};

		this.setTab = function (id) {
			tabs.forEach(function (tab) {
				if(tab.id === id) {
					tab.active = true;
				} else {
					tab.active = false;
				}
			});
		};

		this.getTabs = function () {
			return tabs;
		};
	}])

	.directive('tabs', ["$document", function ($document) {
		return {
			restrict: 'E',
			controller: 'TabController',
			controllerAs: 'tabCtrl',
			templateUrl: 'tabs/tabs.tpl.html',
			transclude: true,
			link: function (scope, element, attrs) {
				scope.$watch(attrs.vertical, function (vertical) {
					element.children($document[0].querySelector('dl.tabs'))[vertical ? 'addClass' : 'removeClass']('vertical');
				});
			}
		};
	}])

	.directive('tab', function () {
		return {
			restrict: 'E',
			require: '?^tabs',
			link: function (scope, element, attrs, tabs) {
				tabs.addTab(attrs.title, element.html());
			}
		};
	});
angular
	.module('ngFoundation.tooltip', ['ngAnimate', 'ngSanitize'])

	.provider('$tooltip', function () {
		var $tooltipProvider = this;

		this.defaults = {
			name: 'tooltip',
			delay: {
				show: 0
			}
		};

		this.$get = ["$animate", "$rootScope", "$q", "$timeout", "$templateCache", "$compile", "$window", function ($animate, $rootScope, $q, $timeout, $templateCache, $compile, $window) {
			function TooltipFactory ($parent, options) {
				var $tooltip = {}, $element, $scope, timeout;

				options = $tooltip.$options = angular.extend({}, $tooltipProvider.defaults, options);
				$tooltip.$scope = $scope = $tooltip.$options.$scope && $tooltip.$options.$scope.$new() || $rootScope.$new();
				$tooltip.$parent = $parent;
				$tooltip.$element = $element = null;
				$tooltip.$isShown = false;

				$tooltip.applyPosition = function () {};
				$tooltip.$applyPosition = function () {
					$tooltip.getElement().then(function ($element) {
						$tooltip.getParent().then(function ($parent) {
							$tooltip.applyPosition($element, $parent, $tooltip.$options);
						});
					});
				}

				$tooltip.onResize = function () {
					if($tooltip.$isShown) {
						$tooltip.$applyPosition();
					}
				};

				$tooltip.destroy = function ($element, $parent) {
					$parent.off('click', $tooltip.$toggle);

					if($element) {
						$element.leave();
						$element.remove();
						$element = null;
					}

					clearTimeout(timeout);

					$tooltip.$scope.$destroy();
				};

				$tooltip.$destroy = function () {
					$tooltip.destroy($element, $parent);
				};

				$tooltip.getElement = function () {
					var deferred = $q.defer();
					$timeout(function () {
						deferred.resolve($tooltip.$element);
					}, options.delay.show);
					return deferred.promise;
				};

				$tooltip.getParent = function () {
					var deferred = $q.defer();
					$timeout(function () {
						deferred.resolve($tooltip.$parent);
					}, options.delay.show);
					return deferred.promise;
				};

				$tooltip.$onElementLoaded = function () {
					$tooltip.$scope.$emit(options.name + ':show:after', $tooltip);
				};

				$tooltip.$enter = function (event) {
					clearTimeout(timeout);

					function onTemplateLoaded (template) {
						$element = angular.element(template);
						$element = $tooltip.$element = $compile($element)($scope);
						$animate.enter($element, $parent, $parent, $tooltip.$onElementLoaded);
						$tooltip.$isShown = true;
						$scope.$$phase || ($scope.$root && $scope.$root.$$phase) || scope.$digest();

						$tooltip.$applyPosition();
					}

					function enter () {
						$scope.$emit(options.name + ':show:before', $tooltip);

						$tooltip.getTemplate().then(onTemplateLoaded);
					}

					timeout = setTimeout(function () {
						enter();
					}, options.delay.show);
				};

				$tooltip.leave = function ($tooltip) {};
				$tooltip.$leave = function (event) {
					$tooltip.$element.remove();
					$tooltip.$isShown = false;

					$scope.$emit(options.name + ':leave:after', $tooltip);

					$tooltip.leave($tooltip);
				};

				$tooltip.$toggle = function (event) {
					!$tooltip.$isShown ? $tooltip.$enter(event) : $tooltip.$leave(event);
				};

				$tooltip.getTemplate = function () {
					return $q.when($templateCache.get(options.templateUrl));
				};

				// scope
				$scope.$enter = function () {
					$scope.$$postDigest(function () {
						$tooltip.enter();
					});
				};

				$scope.$leave = function () {
					$scope.$emit(options.name + ':leave:before', $tooltip);

					$scope.$$postDigest(function () {
						$tooltip.leave();
					});
				};

				$tooltip.$parent.on('click', $tooltip.$toggle);
				angular.element($window).on('resize', $tooltip.onResize);

				return $tooltip;
			}

			return TooltipFactory;
		}];
	});
angular
	.module('ngFoundation.topbar', [])

	.config(["$fdProvider", function ($fdProvider) {
		$fdProvider.registerMedia('topbar', 'foundation-mq-topbar');
	}])

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

		this.$get = ["$animate", "$rootScope", "$fd", "$q", "$timeout", "$window", function ($animate, $rootScope, $fd, $q, $timeout, $window) {
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
		}];
	})

	.controller('TopbarController', ["$scope", "$element", "$attrs", "$fd", "$topbar", function ($scope, $element, $attrs, $fd, $topbar) {
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
	}])

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

	.controller('SectionController', ["$scope", "$element", "$attrs", function ($scope, $element, $attrs) {
		var ctrl = this;

		this.$element = $element;
		this.$topBar = null;

		this.$setTopBar = function (topBar) {
			ctrl.$topBar = topBar;
		};
	}])

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
		}
	})

	.controller('HasDropdownController', ["$window", "$scope", "$q", "$timeout", "$element", "$attrs", "$fd", "$animate", function ($window, $scope, $q, $timeout, $element, $attrs, $fd, $animate) {
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
	}])

	.directive('hasDropdown', ["$compile", function ($compile) {
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
	}])

	.controller('DropdownController', ["$scope", "$element", "$attrs", "$q", "$timeout", function ($scope, $element, $attrs, $q, $timeout) {
		var ctrl = this, $hasDropdown;

		this.$element = $element;
		this.$hasDropdown = null;
		this.$setHasDropdown = function (hasDropdown) {
			ctrl.$hasDropdown = hasDropdown;
		};
	}])

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
		}
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