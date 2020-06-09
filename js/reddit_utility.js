setInterval(() => {
  var parent = document.querySelectorAll('.usertext-edit.md-container .md')
  /* <a class="edit-btn btn-list-unordered" title="bullet list" href="#" tabindex="1" data-macro-index="7">&amp;bull;Bullets</a> */
  var button = document.createElement('A')
  button.className = 'edit-btn btn-vredditdownloader'
  button.title = 'VredditDownloader'
  button.href = '#'
  button.tabindex = '1'
  button.textContent = 'VReddit'

  parent.forEach(e => {
    if (e.querySelectorAll('.btn-vredditdownloader').length > 0) { return }

    e.prepend(button)

    button.onclick = function (e) {
      e.preventDefault()
      var input = document.querySelector(
        '.usertext-edit.md-container .md textarea'
      )
      input.value = 'u/VredditDownloader'
    }
  })
}, 1000)
