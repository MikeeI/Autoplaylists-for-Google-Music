'use strict';

const Qs = require('qs');

const Storage = require('./storage.js');
const License = require('./license.js');

// TODO push lengthy ops into the background script

function initializeForm(userId, playlists) {
  $('#force-update').click(e => {
    e.preventDefault();
    chrome.runtime.sendMessage({action: 'forceUpdate', userId});
  });

  $('#check-license').click(e => {
    e.preventDefault();
    License.hasFullVersion(true, hasFullVersion => {
      let msg = 'Sorry, either the Chrome licensing api is unavailable' +
       " or it reported that you haven't purchased the full version.";
      if (hasFullVersion) {
        msg = "Thanks for purchasing the full version! You've been upgraded." +
          ' Please consider rating the extension if you like it.';
      }

      alert(msg);

      if (hasFullVersion) {
        location.reload(true);
      }
    });
  });

  License.hasFullVersion(false, hasFullVersion => {
    const $playlists = $('#playlists');

    if (!hasFullVersion) {
      $('#version-header').text('Version: free');
      $('#add-playlist')
      .addClass('locked')
      .addClass('disabled')
      .wrap('<div class="hint--right" data-hint="The free version allows only one playlist. Upgrade to add more."/>');
    } else {
      $('#version-header').text('Version: full');
      $('#upgrade-wrapper').hide();
    }

    for (let i = 0; i < playlists.length; i++) {
      const playlist = playlists[i];
      const isLocked = (i > 0 && !hasFullVersion);
      const qs = {
        userId,
        id: playlist.localId,
        locked: isLocked,
      };
      const href = `/html/playlist.html?${Qs.stringify(qs)}`;
      let $link = $('<a>', {href, text: playlist.title});

      if (isLocked) {
        $link
        .addClass('locked')
        .wrap('<div class="hint--right" data-hint="The free version allows only one playlist.' +
              ' This playlist is not being synced."/>');
        $link = $link.parent();
      }

      console.log(playlist);
      $playlists.append($('<li>').append($link));
    }
  });

  License.getDevStatus(devStatus => {
    if (devStatus.isDev) {
      let verb = 'enable';
      if (devStatus.isFullForced) {
        verb = 'disable';
      }

      $('#dev-tools').append(
        $(`<button id="force-full-license" class="menu-button">${verb} full license</button>`)
        .click(e => {
          e.preventDefault();
          License.setFullForced(!devStatus.isFullForced, () => {
            document.location.reload(true);
          });
        })
        /* eslint-disable max-len */
        // REMOVE_ON_FULL ->
        .wrap(
          '<div class="hint--right" data-hint="This button will be available until the extension is available for purchase.' +
          ' Feel free to enable the full version, and please report any bugs you notice around free -> full transitions."/>')
        .parent()
        // <-
        /* eslint-enable max-len */
      );
    }
  });
}

function onReady() {
  const userId = Qs.parse(location.search.substring(1)).userId;

  $('#add-playlist').attr('href', `/html/playlist.html?${Qs.stringify({userId})}`);
  $('#import-export').attr('href', `/html/port.html?${Qs.stringify({userId})}`);

  Storage.getPlaylistsForUser(userId, playlists => {
    initializeForm(userId, playlists);
  });
}

function main() {
  $(onReady);
}

main();