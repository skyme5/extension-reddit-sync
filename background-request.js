function fetchPromise(url, data) {
    var postData = typeof data === "object" ? data : {};
    return new Promise(function (resolve, reject) {
        fetch(url, data)
            .then(response => {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    resolve(response.json());
                } else {
                    resolve(response.text());
                }
            })
            .catch((error) => {
                reject(error);
            });
    });
}

chrome.runtime.onMessage.addListener(function (request, sender, response) {
    if (request.action == "request") {
        fetchPromise(request.url, request.data).then((data) => {
            response(data);
        }).catch((err) => {
            response({ success: false, message: err });
        });
    }

    if (request.action == "local_save") {
        chrome.storage.local.set(request.data, function () {
            response({
                success: true
            });
        });
    }

    if (request.action == "local_get") {
        chrome.storage.local.get(request.data, function (data) {
            response({
                success: true,
                data: data
            });
        });
    }

    return true;
});