/**
 * @description 浏览器检测
 * @return {Object}
 * @example Blowser.IE
 */
var Blowser = (function(){
	var ua = navigator.userAgent;
	var isOpera = Object.prototype.toString.call(window.opera) == "[object Opera]";
	
	return {
		IE: !!window.attachEvent && !isOpera,
		Opera: isOpera,
		WebKit: ua.indexOf("AppleWebKit/") > -1,
		Gecko: ua.indexOf("Gecko") > -1 && ua.indexOf("KHTML") === -1,
		MobileSafari: /Apple.*Mobile/.test(ua)
	};
})();
