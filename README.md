![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![SASS](https://img.shields.io/badge/SASS-hotpink.svg?style=for-the-badge&logo=SASS&logoColor=white)
![Google Chrome](https://img.shields.io/badge/Chromium-4285F4?style=for-the-badge&logo=GoogleChrome&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)
![Reddit](https://img.shields.io/badge/Reddit-%23FF4500.svg?style=for-the-badge&logo=Reddit&logoColor=white)
![MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge&logoColor=white)

# Reddit Sync

A simple extesion to dump reddit posts to database (for old ui).

This will add following functionality on old reddit ui,

- add `EventListener` to `save` button on each post to send `thing` json to preconfigured api endpoint (`https://localhost/api/v2/reddit`)
- add `Save All` button to each Page to send all post `thing` to database (available at the bottom-left side of the page)
- add `Download Sub` button to save all `1000` posts from subreddit (available at the bottom-right of the page)

## Installation

- Clone this repository or download it as zip and extract to directory
- From any chromium based browser (Chrome/Edge/Brave/Opera etc) load extension from directory (requires developer mode for this to work)