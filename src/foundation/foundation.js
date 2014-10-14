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

		// add header helpers
		var head, i = this.headerHelpers.length;

		head = document.getElementsByTagName('head')[0];
		head = angular.element(head);

		while(i--) {
			if(head.has('.' + this.headerHelpers[i]).length === 0) {
				head.append('<meta class="' + this.headerHelpers[i] + '">');
			}
		}

		this.$get = function ($window) {
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
		};
	})