var downloader = {};

chrome.runtime.onMessage.addListener(function (request, sender, response) {
    if (request.type == "reddit" && request.action == "download_start") {
        console.log(request.type, request.action, request.data);
        console.log(`SUBREDDIT_DOWNLOAD_START for ${sender.tab.title}`);
        var id = sender.tab.id;
        downloader[id] = { finished: false, started: true, sender: sender, count: 0 };
        response({ status: true, message: "Download created" });
    }

    if (request.type == "reddit" && request.action == "download_status") {
        console.log(request.type, request.action, request.data);
        var id = sender.tab.id;
        if (downloader[id] !== undefined) {
            downloader[id].count += request.data.count;
            response({ status: true, is_downloading: !downloader[id].finished, total: downloader[id].count });
        } else {
            response({ status: true, is_downloading: false });
        }
    }

    if (request.type == "reddit" && request.action == "download_finish") {
        console.log(request.type, request.action, request.data);
        var id = sender.tab.id;
        downloader[id].count += request.data.count;
        downloader[id].finished = true;
        response({ status: true, total: downloader[id].count });

        console.log(`SUBREDDIT_DOWNLOAD_FINISHED for ${sender.tab.title}, downloaded total ${downloader[id].count} posts`);
    }

    return true;
});
