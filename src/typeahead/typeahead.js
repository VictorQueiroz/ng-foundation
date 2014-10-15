'use strict';

angular
	.module('ngFoundation.typeahead', [])

	.provider('$typeahead', function () {
		var $typeaheadProvider = this;

		this.defaults = {
			templateUrl: 'typeahead/typeahead.tpl.html',
			align: 'bottom'
		};

		this.$get = function ($tooltip) {
			function $TypeaheadFactory ($target, ngModel, options) {
				var $typeahead = {};

				options = $typeahead.$options = angular.extend({}, $typeaheadProvider.defaults, options);
				$typeahead = $tooltip($target, options);

				return $typeahead;
			}

			return $TypeaheadFactory;
		};
	})

	.directive('fdTypeahead', function ($parseOptions, $typeahead) {
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
	});