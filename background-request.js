async function postData(url, data) {
  // Default options are marked with *
  let params = { method: data.method };
  if (['POST', 'PUT', 'PATCH'].includes(data.method.toUpperCase())) {
    params.headers = {
      'Content-Type': 'application/json'
    };
    params.body = data.data;
  }

  const response = await fetch(url, params);
  const contentType = response.headers.get('content-type');

  if (contentType.indexOf('application/json') !== -1) {
    return response.json();
  }

  return response.text();
}

chrome.runtime.onMessage.addListener(function (request, sender, response) {
  if (request.action == 'request') {
    postData(request.url, request.data)
      .then((data) => {
        console.log(data);
        response(data);
      })
      .catch((err) => {
        response({ success: false, message: err });
      });
  }

  if (request.action == 'local_save') {
    chrome.storage.local.set(request.data, function () {
      response({
        success: true
      });
    });
  }

  if (request.action == 'local_get') {
    chrome.storage.local.get(request.data, function (data) {
      response({
        success: true,
        data: data
      });
    });
  }

  return true;
});
