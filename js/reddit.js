class Toast {
  constructor(config) {
    this.message = config.message;
    this.timeout = config.timeout !== undefined ? config.timeout : 5000;
    this.id = 'toast-' + Math.random();
    this.el = this.html();
    this.removeTime = 1500;
  }

  update(message) {
    this.el.message.textContent = message;
  }

  display() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.el.toast.classList.add('bottom-up');
        resolve();
      }, 500);
    });
  }

  hide() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.el.toast.classList.remove('bottom-up');
        resolve();
      }, this.timeout);
    });
  }

  remove() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.el.toast.remove();
        resolve();
      }, this.removeTime);
    });
  }

  start() {
    this.display().then(() => {});
  }

  done() {
    this.hide().then(() => {
      this.remove().then(() => {});
    });
  }

  html() {
    var toast = document.createElement('DIV');
    toast.id = this.id;
    toast.classList.add('toast');
    toast.innerHTML = `
      <div class="LoadingDots">
        <div class="dot first"></div>
        <div class="dot second"></div>
        <div class="dot third"></div>
      </div>
    `;

    var close = document.createElement('DIV');
    close.classList.add('close');
    close.textContent = 'x';
    toast.appendChild(close);

    var parent = document.querySelector('#toast-container');
    if (parent == null) {
      parent = document.createElement('DIV');
      parent.id = 'toast-container';
      document.body.appendChild(parent);
    }
    parent.appendChild(toast);

    return {
      toast: toast,
      message: toast,
      close: close
    };
  }
}

function sub_downloader_start() {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: 'download_start',
        type: 'reddit'
      },
      function (response) {
        console.log('download_start', response);
        resolve(response);
      }
    );
  });
}

function sub_downloader_status(data) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: 'download_status',
        type: 'reddit',
        data: data
      },
      function (response) {
        console.log('download_status', response);
        resolve(response);
      }
    );
  });
}

function sub_downloader_finish(data) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: 'download_finish',
        type: 'reddit',
        data: data
      },
      function (response) {
        console.log('download_finish', response);
        resolve(response);
      }
    );
  });
}

function startUnhidePosts() {
  setInterval(() => {
    var all = document.querySelectorAll('.thing');
    all.forEach((thing) => {
      thing.style.display = 'block';
    });
  }, 1000);
}

const _this = 'Reddit Utilities';
window.sky = {
  inlineView: false
};

function getResponse(url) {
  return new Promise(function (resolve, reject) {
    fetch(url)
      .then((response) => response.text())
      .then((response) => {
        var data = JSON.parse(response);
        resolve(data);
      })
      .catch((e) => reject(e));
  });
}

function inlineView(link) {
  if (!window.sky.inlineView) return;

  var content = link.querySelector('.expando.expando-uninitialized');
  if (content !== null) {
    content.innerHTML = content.getAttribute('data-cachedhtml');
    content.style.display = 'block';
    content.classList.remove('expando-uninitialized');
  }
}

function savePost(data, elm) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: 'request',
        url: 'https://localhost/api/v2/reddit',
        data: {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          data: JSON.stringify(data)
        }
      },
      function (response) {
        if (response.success) {
          elm.style.display = 'none';
          resolve(response);
        } else {
          reject(response);
        }
      }
    );
  });
}

function queryPost(fullname) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: 'request',
        url: 'https://localhost/api/v2/reddit/fullname/' + fullname,
        data: {
          method: 'GET'
        }
      },
      function (response) {
        resolve(response);
      }
    );
  });
}

function getPostAttributes(link) {
  var response = {};
  link.getAttributeNames().forEach((attr) => {
    var name = attr.split('data-').pop().replace(/-/g, '_');
    var value = link.getAttribute(attr);
    response[name] = value;
  });
  return response;
}

const urlExpression = /([-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?)/gi;
const urlRegex = new RegExp(urlExpression, 'gi');

function getURLText(data) {
  var list = [data.url];
  data.selftext
    .split(urlRegex)
    .filter((a) => {
      if (a == undefined) {
        return false;
      }
      return a.match(urlRegex);
    })
    .forEach((a) => {
      if (list.indexOf(a) < 0) {
        list.push(a);
      }
    });

  return list;
}

function downloadLink(link, elm) {
  return new Promise((resolve, reject) => {
    var attributes = getPostAttributes(link);

    queryPost(attributes['fullname']).then((server_res) => {
      console.log(server_res.exists);
      if (!server_res.exists) {
        var permalink = attributes.permalink;
        var jsonlink = `https://www.reddit.com${permalink
          .split('/')
          .slice(0, -2)
          .join('/')}.json`;

        getResponse(jsonlink).then(function (linkJSON) {
          var data = {
            json_url: jsonlink,
            post: linkJSON[0],
            comments: linkJSON[1]
          };

          data.title = data.post.data.children[0].data.title;
          data.media_urls = getURLText(data.post.data.children[0].data);
          [
            'author',
            'author_fullname',
            'fullname',
            'nsfw',
            'permalink',
            'subreddit',
            'subreddit_fullname',
            'subreddit_prefixed',
            'subreddit_type',
            'timestamp',
            'url'
          ].forEach((attr) => {
            if (attributes[attr] == undefined) {
              data[attr] = '[deleted]';
            } else {
              data[attr] = attributes[attr];
            }
          });

          savePost(data, elm)
            .then((response) => {
              resolve(response);
            })
            .catch((err) => {
              resolve(err);
            });
        });
      }
    });
  });
}

function getMediaLinks(node) {
  return node.querySelectorAll('.thing.link');
}

function lazyLoad(node) {
  var list = node.querySelectorAll('.thing.link');
  if (node.classList.contains('thing') && node.classList.contains('link')) {
    list = [node];
  }

  list.forEach(function (lazy) {
    window.lazy.observe(lazy);
    var save_btn = lazy.querySelector('.save-button a');
    save_btn.onclick = function (e) {
      downloadLink(lazy, e.target)
        .then(() => {})
        .catch(() => {});
    };
  });
}

function downloadAllPosts() {
  return new Promise((resolve, reject) => {
    var toast = new Toast({ message: 'Saving links' });
    var links = document.querySelectorAll('.thing.link');
    let count = links.length;

    toast.start();
    toast.update('Saving 0 of ' + count + ' links');

    var saved = 0;
    var duplicate = 0;
    links.forEach(function (lazy, index) {
      var save_btn = lazy.querySelector('.save-button a');
      downloadLink(lazy, save_btn)
        .then((response) => {
          if (!response.exists) {
            saved++;
          } else {
            duplicate++;
          }

          if (duplicate > 0) {
            toast.update(`Saving ${saved} of ${count} links`);
          } else {
            toast.update(
              `Saving ${saved} of ${count} links (${duplicate}) duplicate`
            );
          }
        })
        .catch((status, err) => {
          duplicate++;
        });

      if (index === count - 1) resolve({ toast, count });
    });
  });
}

function triggerDownloadAll(next_button, ab) {
  var next_button_exist = next_button != null;
  downloadAllPosts()
    .then((downloader) => {
      sub_downloader_status({ count: downloader.count })
        .then((data) => {
          if (data.is_downloading) {
            if (next_button_exist) {
              next_button.click();
            } else {
              sub_downloader_finish({ count: downloader.count })
                .then((response) => {
                  downloader.toast.update(`Saved ${response.total} links`);
                  downloader.toast.done();
                })
                .catch((err) => {
                  console.error(err);
                });
            }
          } else {
            downloader.toast.update(`Saved ${response.total} links`);
            downloader.toast.done();
          }
        })
        .catch((err) => {
          console.error(err);
        });
    })
    .catch((err) => {
      console.error(err);
    });
}

function createDownloadAllButton() {
  var parent = document.querySelector('.nav-buttons .nextprev');
  if (parent == null) {
    parent = document.querySelector('.content[role=main]');
  }
  var next_button = document.querySelector(
    '.content .nav-buttons .next-button a'
  );

  var download_single_page = document.createElement('SPAN');
  download_single_page.classList.add('all-button');
  download_single_page.innerHTML = '<a class="sky-d">Save All</a>';
  download_single_page.onclick = function () {
    triggerDownloadAll(next_button, 1);
  };
  parent.appendChild(download_single_page);

  var download_sub = document.createElement('SPAN');
  download_sub.classList.add('all-button');
  download_sub.style.float = 'right';
  download_sub.innerHTML = '<a class="sky-d">Download Sub</a>';
  download_sub.onclick = function () {
    sub_downloader_start()
      .then((data) => {
        if (data.status) {
          triggerDownloadAll(next_button, 2);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };
  parent.appendChild(download_sub);

  if (window.location.href.includes('downloadPage'))
    download_single_page.click();

  if (window.location.href.includes('downloadSub')) {
    sub_downloader_status({ count: 0 })
      .then((data) => {
        if (data.is_downloading) {
          download_single_page.click();
        } else {
          download_sub.click();
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }
}
window.sky.createDownloadAllButton = createDownloadAllButton;

if ('IntersectionObserver' in window) {
  window.lazy = new IntersectionObserver(function (entries, observer) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        inlineView(entry.target);
        window.lazy.unobserve(entry.target);
      }
    });
  });
} else {
  console.error(new Error('IntersectionObserver not supported'));
}

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    const addedNodes = mutation.addedNodes || [];
    [].forEach.call(addedNodes, (newNode) => {
      if (newNode.nodeType === Node.ELEMENT_NODE) {
        lazyLoad(newNode);
      }
    });
  });
});
window.sky.observer = observer;

observer.observe(document.body, {
  childList: true,
  subtree: true
});

lazyLoad(document.body);
createDownloadAllButton();
startUnhidePosts();

console.info('LOADED => ' + _this);
