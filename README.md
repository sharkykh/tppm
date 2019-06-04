# Trakt.tv Playback Progress Manager
<a href="https://trakt.tv">
  <img
    src="https://github.com/sharkykh/tppm/blob/6760862faedf69b9a209411277b592b28ff30d05/src/trakt.png?raw=true"
    alt="Trakt logo"
    width="100"
    height="100"
    align="right" />
</a>

This is a web application that allows a [Trakt.tv](https://trakt.tv) user manage the playback progress items stored in their account.  
To use the application, visit:
# [sharkykh.github.io/tppm](https://sharkykh.github.io/tppm/)

<br>

**[Reddit Post (for the original Python application)](https://www.reddit.com/r/trakt/comments/95rf3h/playback_progress_manager_python_application/?ref=share&ref_source=link)**

> If you use the scrobbling feature provided by Trakt.tv with your favorite media player (Kodi, for example), and stop in the middle of a movie or episode, it will send the current playback progress (or, how much of the media you watched) to Trakt.tv and store it there.
>
> It can cause some annoyances when syncing the progress back to devices, as currently there's no way (to my knowledge) to remove the playback progress items from Trakt.

## Running as a local server
**Note:** Due to CORS & OAuth Redirect URI limitations, can only be used on port 8080 of `localhost`.  
(Unless making a separate API application and modifying the values in [`src/api.js`](/src/api.js))  

Requirements:
- [NodeJS](https://nodejs.org) version 11 or above
- [yarn](https://yarnpkg.com) version 1.15 or above

```
yarn install
yarn start
```

Server will be available at http://localhost:8080
