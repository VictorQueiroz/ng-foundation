angular
	.module('ngFoundation.helpers.position', [])

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
	});