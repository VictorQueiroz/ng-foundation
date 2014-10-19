'use strict';

angular
	.module('ngFoundation', [
		'ngFoundation.foundation',
		'ngFoundation.helpers',
		'ngFoundation.dropdown',
		'ngFoundation.tooltip',
		'ngFoundation.tabs',
		'ngFoundation.topbar',
		'ngFoundation.alert',
		'ngFoundation.modal',
		'ngFoundation.typeahead',
		'ngFoundation.rangeSlider',
		'ngFoundation.templates'
	]);

angular.module('ngFoundation.templates', []);
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

		this.$get = ["$modal", "$timeout", function ($modal, $timeout) {
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
		}];
	})

	.directive('fdAlert', ["$alert", function ($alert) {
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
	}]);
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

		this.$get = ["$position", "$fd", "$tooltip", function ($position, $fd, $tooltip) {
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
							cssBefore = 'left: ' + pipOffsetBase + 'px;',
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

				element.on('click', dropdown.toggle);
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

		// add header helpers
		var head, i = this.headerHelpers.length;

		head = document.getElementsByTagName('head')[0];
		head = angular.element(head);

		while(i--) {
			if(head.has('.' + this.headerHelpers[i]).length === 0) {
				head.append('<meta class="' + this.headerHelpers[i] + '">');
			}
		}

		this.namespace = 'my-namespace';

		this.stylesheet = angular.element('<style></style>').appendTo('head')[0].sheet;

	  this.removeQuotes = function (string) {
	    if (typeof string === 'string' || string instanceof String) {
	      string = string.replace(/^['\\/"]+|(;\s?})+|['\\/"]+$/g, '');
	    }

	    return string;
	  };

		this.mediaQueries = {
			small: angular.element(document.querySelector('.foundation-mq-small')).css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
			medium: angular.element(document.querySelector('.foundation-mq-medium')).css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
			large: angular.element(document.querySelector('.foundation-mq-large')).css('font-family').replace(/^[\/\\'"]+|(;\s?})+|[\/\\'"]+$/g, ''),
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
	.module('ngFoundation.helpers', [
		'ngFoundation.helpers.position',
		'ngFoundation.helpers.parseOptions'
	]);
'use strict';

angular
	.module('ngFoundation.helpers.parseOptions', [])

	.provider('$parseOptions', function () {
  												//000011111111110000000000022222222220000000000000000000003333333333000000000000004444444444444440000000005555555555555550000000666666666666666000000000000000777777777700000000000000000008888888888
  	var NG_OPTIONS_REGEXP = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/,
  	$parseOptionsProvider = this;

  	this.defaults = {
  		NG_OPTIONS_REGEXP: NG_OPTIONS_REGEXP
  	};

  	this.$get = ["$parse", "$q", function ($parse, $q) {
  		function $ParseOptionsFactory () {
  			var $parseOptions = {};
  			return $parseOptions;
  		}

  		return $ParseOptionsFactory;
  	}];
	});
angular
	.module('ngFoundation.helpers.position', [])

	.factory('$position', ["$fd", function ($fd) {
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
	}]);
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

		this.$get = ["$rootScope", "$window", "$fd", "$sce", "$animate", "$q", "$timeout", "$compile", "$document", "$templateCache", function ($rootScope, $window, $fd, $sce, $animate, $q, $timeout, $compile, $document, $templateCache) {
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
		}];
	})

	.directive('fdModal', ["$modal", function ($modal) {
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
	}]);
'use strict';

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
			templateUrl: 'range-slider/range-slider.tpl.html',
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
'use strict';

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
'use strict';

angular
	.module('ngFoundation.tooltip', ['ngAnimate', 'ngSanitize'])

	.provider('$tooltip', function () {
		var $tooltipProvider = this;

		this.defaults = {
			name: 'tooltip',
			animation: 'am-fade',
			align: 'right'
		};

		this.$get = ["$animate", "$rootScope", "$q", "$fd", "$document", "$timeout", "$position", "$templateCache", "$compile", "$window", function ($animate, $rootScope, $q, $fd, $document, $timeout, $position, $templateCache, $compile, $window) {
			$window = angular.element($window);
			$document = angular.element($document);

			var requestAnimationFrame = window.requestAnimationFrame || setTimeout;

			function TooltipFactory ($target, options) {
				var $tooltip = {}, $scope, $element;

				$tooltip.$target = $target;
				options = $tooltip.$options = angular.extend({}, $tooltipProvider.defaults, options);
				$tooltip.$options.$scope = $scope = $tooltip.$options.$scope || $rootScope.$new();
				$tooltip.$isShown = false;

				$tooltip.getTemplate = function (template) {
					return $q.when($templateCache.get(options.templateUrl));
				};

				$tooltip.$applyPosition = function () {
					var css,
					leftOffset = Math.max(($target.width() - $element.width()) / 2, 8);

					if ($fd.small() && !$fd.medium()) {
						css = $position.directions.bottom($element, $target);

						css[$fd.rtl ? 'right' : 'left'] = leftOffset;
					} else {
						css = $position.directions[options.align]($element, $target);
					}

					$element.attr('style', '').css(css);

					$scope.$emit(options.name + '.positioning.after', $tooltip);
				};

				$tooltip.$onElementLeave = function () {};

				$tooltip.$onElementEnter = function () {};

				$tooltip.$onDocumentClick = function (event) {
					if(event.target !== $tooltip.$target[0]) {
						$tooltip.leave();
					}
				};

				$tooltip.$onResize = function () {
					$tooltip.applyPosition();
				};

				$tooltip.$compileElement = function () {
					return $compile($element)($scope);
				};

				$tooltip.$onTemplateLoaded = function (template) {
					$tooltip.$element = $element = angular.element(template);
					$tooltip.$compileElement();

					$element.addClass(options.animation);

					var promise = $animate.enter($element, $target, $target, $tooltip.$onElementEnter);
					if(promise && promise.then) promise.then($tooltip.$onElementEnter);

					requestAnimationFrame(function () {
						$tooltip.applyPosition();
					});

					$tooltip.$isShown = true;
					$scope.$$phase || ($scope.$root && $scope.$root.$$phase) || $scope.$digest();

					$document.bind('click focus blur', $tooltip.$onDocumentClick);
					$window.on('resize', $tooltip.$onResize);

					$scope.$emit(options.name + '.enter.after', $tooltip);
				};

				$tooltip.$enter = function () {
					$tooltip.getTemplate().then($tooltip.$onTemplateLoaded);
				};

				$tooltip.$leave = function () {
					var promise = $animate.leave($element, $tooltip.$onElementLeave);
					if(promise && promise.then) promise.then($tooltip.$onElementLeave);

					$tooltip.$isShown = false;
					$scope.$$phase || ($scope.$root && $scope.$root.$$phase) || $scope.$digest();

					$document.unbind('click focus blur', $tooltip.$onDocumentClick);
					$window.off('resize', $tooltip.$onResize);

					$scope.$emit(options.name + '.leave.after', $tooltip);
				};

				$tooltip.applyPosition = function () {
					if($scope.$emit(options.name + '.positioning.before', $tooltip).defaultPrevented) {
						return;
					}

					$tooltip.$applyPosition();
				};

				$tooltip.enter = function () {
					if($tooltip.$isShown) return;

					if($scope.$emit(options.name + '.enter.before', $tooltip).defaultPrevented) {
						return;
					}

					$timeout(function () {
						$tooltip.$enter();
					});
				};

				$tooltip.leave = function () {
					if(!$tooltip.$isShown) return;

					if($scope.$emit(options.name + '.leave.before', $tooltip).defaultPrevented) {
						return;
					}

					$timeout(function () {
						$tooltip.$leave();
					});
				};

				$tooltip.toggle = function () {
					$tooltip.$isShown ? $tooltip.leave() : $tooltip.enter();
				};

				return $tooltip;
			}

			return TooltipFactory;
		}];
	})

	.directive('fdTooltip', ["$tooltip", function ($tooltip) {
		return {
			restrict: 'A',
			link: function (scope, element, attrs) {
				var options = {
					$scope: scope
				};

				angular.forEach(['content', 'align', 'templateUrl'], function (key) {
					if(angular.isDefined(attrs[key])) options[key] = attrs[key];
				});

				var tooltip = $tooltip(element, options);

				element.on('click', tooltip.toggle);
			}
		};
	}]);
'use strict';

angular
	.module('ngFoundation.topbar', ['ngAnimate'])

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
		};
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
			$animate.addClass('moved', $element);
		};

		this.$setNotMoved = function () {
			ctrl.moved = false;

			setTimeout(function () {
				$animate.removeClass('moved', $element);
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
'use strict';

angular
	.module('ngFoundation.typeahead', [])

	.provider('$typeahead', function () {
		var $typeaheadProvider = this;

		this.defaults = {
			templateUrl: 'typeahead/typeahead.tpl.html',
			align: 'bottom'
		};

		this.$get = ["$tooltip", function ($tooltip) {
			function $TypeaheadFactory ($target, ngModel, options) {
				var $typeahead = {};

				options = $typeahead.$options = angular.extend({}, $typeaheadProvider.defaults, options);
				$typeahead = $tooltip($target, options);

				return $typeahead;
			}

			return $TypeaheadFactory;
		}];
	})

	.directive('fdTypeahead', ["$parseOptions", "$typeahead", function ($parseOptions, $typeahead) {
		return {
			restrict: 'A',
			require: '?ngModel',
			link: function postLink (scope, element, attrs, ngModel) {
				var options = {
					$scope: scope
				};

				var typeahead = $typeahead(element, ngModel, options);
			}
		}
	}]);