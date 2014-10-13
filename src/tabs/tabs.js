angular
	.module('ngFoundation.tabs', [])

	.controller('TabController', function ($scope, $element, $attrs) {
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
	})

	.directive('tabs', function ($document) {
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
	})

	.directive('tab', function () {
		return {
			restrict: 'E',
			require: '?^tabs',
			link: function (scope, element, attrs, tabs) {
				tabs.addTab(attrs.title, element.html());
			}
		};
	});