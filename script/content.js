/*
 * Google Url Shortener
 * Content.js
 * @Author: Sandy
 * @Date: 2011-01-13
 * @Email: wojiaoabin@gmail.com
**/

;(function(win) {
	
	var d = win.document,
		reSpinUrl = '/images/spin.gif';
		spinUrl = chrome.extension.getURL(reSpinUrl),
		imgStr = '<img style="position:absolute;left:15px;top:5px;" src="' + spinUrl + '" />';

	var Tooltip = new function() {

		var tip = d.createElement('div'),
			cssText = 'text-align:center;position:fixed;font-weight:normal;font-family:"Microsoft Yahei","Arial","Tahoma","Verdana";left:5px;top:5px;display:none;width:220px;color:#fff;height:25px;border:none;line-height:27px;font-size:12px;background:#fff;',
			timer = null,
			latency = 3500,
			bgColor = {
				'process': '#114BBF',
				'error': '#EC3200',
				'timeout': '#EC3200',
				'success': '#019040'
			}

		function _text(msg) {
			tip.innerHTML = msg;
		}

		function _delay() {
			clearTimeout(timer);
			timer = setTimeout(function() {
				_hide();
			}, latency);
		}

		function _changeBg(color) {
			tip.style.backgroundColor = color;
		}

		function _show() {
			tip.style.display = 'block';
		}

		function _hide() {
			tip.style.display = 'none';
		}

		function _init() {
			d.body.appendChild(tip);
			tip.setAttribute('style', cssText);
		}

		this.error = function error() {
			_text('Error raised!');
			_delay();
			_changeBg(bgColor[arguments.callee.name]);
		}

		this.success = function success() {
			_text('Copied to clipboard');
			_delay();
			_changeBg(bgColor[arguments.callee.name]);
		}

		this.timeout = function timeout() {
			_text('Request time out');
			_delay();
			_changeBg(bgColor[arguments.callee.name]);
		}

		this.process = function process() {
			_show();
			_text(imgStr + 'Processing your request...');
			_changeBg(bgColor[arguments.callee.name]);
		}

		_init();

	}


	function onRequest(request, sender, callback) {

		var msg = request.message,
			longUrl = win.location.href;
		
		switch(msg) {
			case 'shorten': callback(longUrl); Tooltip.process();
				break;
			case 'success': success(request.url);
				break;
			case 'error': error();
				break;
			case 'timeout': timeout();
				break;
			default:break;
		}
	}

	function success() {
		Tooltip.success();
	}

	function error() {
		Tooltip.error();
	}

	function timeout() {
		Tooltip.timeout();
	}

	function $(elem) {
		return typeof elem == 'string' ? d.getElementById(elem) : elem;
	}

	chrome.extension.onRequest.addListener(onRequest);


}).apply(null, [this]);

