'use strict';

var navigation = {
  max: 127,
  callbacks: [],
  next: function() {
    navigation.state = navigation.state === navigation.max? 0 : ++navigation.state;
    navigation.dumpState();
  },
  prev: function() {
    navigation.state = navigation.state === 0? navigation.max : --navigation.state;
    navigation.dumpState();
  },
  dumpState: function() {
    location.hash = '/' + navigation.state;
  },
  loadState: function() {
    var h = parseInt(location.hash.split('/')[1], 10);
    if (!isFinite(h) || h < 0 || h > navigation.max) {
      navigation.state = 0;
      navigation.dumpState();
    } else {
      navigation.state = h;
    }
    navigation.notify();
  },
  addEventListener: function(f) {
    navigation.callbacks.push(f);
  },
  notify: function() {
    navigation.callbacks.forEach(function(callback) {
      callback(navigation.state);
    }, navigation);
  },
  onkeydown: function(e) {
    switch(e.keyCode) {
      case 37: navigation.prev(); break;
      case 39: case 32: navigation.next(); break;
    }
  }
};

var show = {
  inside: function(selector) {
    show.container = document.querySelector(selector);
    var v = document.createElement('video');
    show.player = v.canPlayType && v.canPlayType('video/webm')? webmPlayer : gifPlayer;
    v = null;
    show.player.init(show.container);
  },
  again: function(state) {
    show.player.change(state);
  }
}

var gifPlayer = {
  init: function(container) {
    gifPlayer.container = container;
  },
  change: function(state) {
    gifPlayer.container.innerHTML = '<img src="gif/' + state + '.gif">';
  }
};

var webmPlayer = {
  render: function() {
    webmPlayer.context.drawImage(webmPlayer.video, 0, 0);
    webmPlayer.play? requestAnimationFrame(webmPlayer.render):0;
  },
  init: function(container) {
    webmPlayer.video = document.createElement('video');
    var canvas = document.createElement('canvas');
    webmPlayer.context = canvas.getContext('2d');
    container.appendChild(canvas);
    webmPlayer.video.onloadeddata = function() {
      console.log('here')
      this.play();
      canvas.width = this.videoWidth;
      canvas.height = this.videoHeight;
      webmPlayer.play = true;
      requestAnimationFrame(webmPlayer.render);
    };
    webmPlayer.video.onended = function() {
      webmPlayer.play = false;
      this.load();
    };
  },
  change: function(state) {
    webmPlayer.play = false;
    webmPlayer.video.src = 'webm/' + state + '.webm';
  }
};


show.inside('#picture');
window.addEventListener('hashchange', navigation.loadState);
document.querySelector('#next').addEventListener('mousedown', navigation.next);
document.querySelector('#prev').addEventListener('mousedown', navigation.prev);
document.addEventListener('keydown', navigation.onkeydown);
navigation.addEventListener(show.again);
navigation.loadState();
