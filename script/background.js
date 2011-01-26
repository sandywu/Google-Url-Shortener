/*
 * Google Url Shortener
 * Background.js
 * @Author: Sandy
 * @Date: 2011-01-13
 * @Email: wojiaoabin@gmail.com
**/

var xhr = new XMLHttpRequest(), 
	RESTURI = 'https://www.googleapis.com/urlshortener/v1',
	KEY = 'AIzaSyBX4LLI6r_U301NYpTkUEbZCO_zvdNM-dM',
	METHOD = 'POST',
	requestUrl = RESTURI + '/url',
	threshold = 8000, cntTabId,
	timer = null,
	oauth = ChromeExOAuth.initBackgroundPage({
	  'request_url': 'https://www.google.com/accounts/OAuthGetRequestToken',
	  'authorize_url': 'https://www.google.com/accounts/OAuthAuthorizeToken',
	  'access_url': 'https://www.google.com/accounts/OAuthGetAccessToken',
	  'consumer_key': 'anonymous',
	  'consumer_secret': 'anonymous',
	  'scope': 'https://www.googleapis.com/auth/urlshortener',
	  'app_name': 'Google URL Shortener'
	});


function onRequest(request, sender, callback) {
	asyncRequest();
}

function asyncRequest(longUrl) {

	clearTimeout(timer);
	queryStr = {'key': KEY};

	params = JSON.stringify({'longUrl': longUrl});

	xhr.open(METHOD, requestUrl + '?' + serialize(queryStr), true);
	xhr.onreadystatechange = function() {
	  if(xhr.readyState == 4) {
		responseHandle(xhr);
	  }
	}
	xhr.setRequestHeader('Content-Type', 'application/json');
	xhr.setRequestHeader('Authorization', oauth.getAuthorizationHeader(requestUrl, METHOD, queryStr));
	xhr.send(params);
	xhr.finished = false;

	timer = setTimeout(timeout, threshold);
	
}

function responseHandle(xhr) {

	var response = JSON.parse(xhr.responseText),
		status = xhr.status;
	
	if (status == 200 && 'id' in response) {
		success(response.id);
	}
	
	if ('error' in response) {
		error();
	}
}

function error(msg) {
	xhr.finished = true;
	chrome.tabs.sendRequest(cntTabId, {'message': 'error'});
}

function success(url) {
	xhr.finished = true;
	chrome.tabs.sendRequest(cntTabId, {'message': 'success', 'url': url});
	copyToClipBoard(url);
}

function timeout() {
	if (xhr.finished == false) {
		chrome.tabs.sendRequest(cntTabId, {'message': 'timeout'});
	}
}

function serialize(parameters) {

	var params = [];

	for(var p in parameters) {
		params.push(encodeURIComponent(p) + '=' + encodeURIComponent(parameters[p]));
	}

	return params.join('&');
}

function copyToClipBoard(url) {

	var input = document.getElementById('url');
	
	input.value = url;					
	input.select();

	document.execCommand('Copy');
}

function initialize() {

	chrome.browserAction.onClicked.addListener(function(tab) {
		  cntTabId = tab.id
		  chrome.tabs.sendRequest(cntTabId, {'message': 'shorten'}, function(longUrl) {
				oauth.authorize(function() {
					asyncRequest(longUrl);
				});		
		  });
	});	

	chrome.extension.onRequest.addListener(onRequest);
}

initialize();
