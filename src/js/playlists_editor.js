'use strict';

const Qs = require('qs');

const Storage = require('./storage.js');

function initializeForm(userId, playlists) {
  $('#force-update').click(e => {
    e.preventDefault();
    chrome.runtime.sendMessage({action: 'forceUpdate', userId: userId});
  });

  const playlistsDom = $('#playlists');
  for (let i = 0; i < playlists.length; i++) {
    const playlist = playlists[i];
    console.log(playlist);
    playlistsDom
      .append($('<a>', {
        text: playlist.title,
        href: '/html/playlist.html?' + Qs.stringify({id: playlist.localId, userId: userId})}))
      .append($('<br/>'));
  }
}

function onReady() {
  const userId = Qs.parse(location.search.substring(1)).userId;

  $('#add-playlist').attr('href', '/html/playlist.html?' + Qs.stringify({userId: userId}));

  Storage.getPlaylistsForUser(userId, playlists => {
    initializeForm(userId, playlists);
  });
}

function main() {
  $(onReady);
}

main();