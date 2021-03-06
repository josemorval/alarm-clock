
var ipc     = require('ipc')
  , Player  = require('./js/player')
  , remote = require('remote');

console.log('App version : ' + remote.require('app').getVersion());

var player = new Player('./my-app/Early Riser.mp3');
player.getID3(displayMP3Title);

player.on('playing',function(item){
  Equalizer.show();
  console.log('im playing... src:' + item);
});

player.on('playend',function(item){
  Equalizer.hide();
  console.log('src:' + item + ' play done');
});

player.on('stopped',function(item){
  Equalizer.hide();
  console.log('src:' + item + ' play stopped');
});

$(function(){
  later.date.localTime();

  $('my-schedule').bind('scheduleChange', function(e) {
    console.log('storage changed');

    var cron = JSON.parse(localStorage.getItem('alarm-schedule'));
    if (cron) {
      setSchedule(cron);
    }
  });

  var cron = JSON.parse(localStorage.getItem('alarm-schedule'));
  if (! cron) cron = $('#my-schedule').attr('schedule');
  if (cron) {
    setSchedule(cron);
  }
});

function setSchedule(cron) {
  var textSched = later.parse.cron(cron, true);
  var next = later.schedule(textSched).next(10, new Date());
  console.log(next);
  var timer = later.setTimeout(playMusic, textSched);

  var animation1 = document.getElementById('fade-animation');
  animation1.target = document.getElementById('inp-next');
  var animation2 = document.getElementById('scale-animation');
  animation2.target = document.getElementById('inp-next');
  animation1.play();
  $('#inp-next').val(next[0]);
  animation2.play();
}

// equalizer
var Equalizer  = {
  init: function(){
    this.bars = new Array();
    this.resize();
    this.addBars();
    this.x = 0;
    this.on = false;
    //setInterval(_.bind(this.render, this), 120);
    setInterval(this.render.bind(this), 120);
    $(window).resize(this.resize);
    $('.bar').css({'width': this.w / 100, 'margin-left': this.w / 50});
  },

  resize: function(){
    //this.h = $(window).height();
    this.h = $('#equalizer').height();
    this.w = $(window).width();
    //$('#equalizer').width(this.w).height(this.h);
    $('.bar').css({'width': this.w / 100, 'margin-left': this.w / 50});
  },

  addBars: function(){
    for (var i = 0; i < 10; i++){
      var b = $('<div class="bar"><div class="fill"></div></div>');
      this.bars.push(b);
      $('#equalizer').append(b);
    }
  },

  render: function(){
    if (this.on) {
      for (var i = 0; i < this.bars.length; i++){
        var b = this.bars[i];
        $(b).height(this.h + 20);
        var height = /*Math.sin(this.x++)*100+180;*/ (this.h-30) / Math.floor((Math.random()*10)+1);
        $(b).find('.fill').css({'height': height, 'top':(this.h-20) - height});
      }
    }
  },

  show: function() {
    this.on = true;
  },

  hide: function() {
    this.on = false;
  }
};

Equalizer.init();

$(window).resize(function(){
  Equalizer.resize();
});

document.getElementById('btn-play').onclick = function() {
  player.play(function (err, player) {
    console.log('playend!');
  });
};

document.getElementById('btn-stop').onclick = function() {
  player.stop();
};

document.getElementById('btn-file').onclick = function() {
  ipc.send('asynchronous-message', 'select-file');
};

document.getElementById('btn-capture').onclick = function() {
  remote.getCurrentWindow().capturePage(function(buf) {
    remote.require('fs').writeFile('/tmp/screenshot.png', buf, function(err) {
      console.log(err);
    });
  });
};

/*
document.getElementById('btn-alarm').onclick = function() {
  toggleDialog();
};
*/

ipc.on('asynchronous-reply', function(arg) {
  //TODO : chek if file exists and it is  mp3 file
  player.song = arg;
  player.getID3(displayMP3Title);
});

function displayMP3Title(ID3) {
  $('#lbl-mp3').text(ID3.title);
}

function toggleDialog() {
  var dialog = document.querySelector('paper-dialog');
  dialog.toggle();
}

function playMusic() {
  player.play();

  //FIXME: kill timer
  var timer = setTimeout(function() {
    var cron = JSON.parse(localStorage.getItem('alarm-schedule'));
    if (cron) {
      setSchedule(cron);
    }
    clearTimeout(timer);
  }, 1000);
}
