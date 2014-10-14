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

		this.$get = function ($rootScope, $window, $fd, $q, $timeout) {
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
		};
	})

	.controller('RangeSliderController', function ($scope, $element, $attrs, $rangeSlider) {
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
	})

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