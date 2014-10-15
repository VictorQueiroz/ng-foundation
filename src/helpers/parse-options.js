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

  	this.$get = function ($parse, $q) {
  		function $ParseOptionsFactory () {
  			var $parseOptions = {};
  			return $parseOptions;
  		}

  		return $ParseOptionsFactory;
  	};
	});