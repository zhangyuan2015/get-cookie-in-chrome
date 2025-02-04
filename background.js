
var postCookies = [];
var popup = "";
var timer = null

function init(options) {
    postCookies = [];
    chrome.cookies.getAll({}, function (cookies) {
        if (!cookies || !cookies.length) {
            chrome.runtime.sendMessage({ type: "send", code: -1, info: { msg: '当前页面没有cookie' } });
            clearTimer()
            return
        }
        for (var i in cookies) {
            cookie = cookies[i];
            if (cookie.domain.indexOf(domain) != -1) {
                postCookies.push(cookie);
            }
        }

        $.ajax({
            type: "POST",
            url: options.url,
            data: JSON.stringify(postCookies),
            contentType: "application/json;charset=utf-8",
            crossDomain: true,
            xhrFields: {
                withCredentials: true
            },
            error: function (xhr, status, error) {
                chrome.runtime.sendMessage({ type: "send", isSuccess: false, info: error });
            },
            success: function (result, status, xhr) {
                chrome.runtime.sendMessage({ type: "send", isSuccess: result.isSuccess, info: result });
            }
        });
    });
}

function clearTimer() {
    timer && clearInterval(timer)
    timer = null
}

function start(options) {
    chrome.tabs.query({ highlighted: true }, function (tabs) {
        if (tabs) {
            domain = options.rootSite
            clearTimer()
            if (options.times === '一次') {
                init(options)
            } else {
                timer = setInterval(function () {
                    init(options)
                }, options.interval * 60 * 1000)
                init(options)
            }
        }
    })
}