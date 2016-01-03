"use strict";

$(document).ready(function() {
  var theAudio = new audioControl();
  var theTest = new sperlingTest(theAudio);
  
  $("#startTest").on("touch click", function() {
  	var soundDelaySeconds, LetterDisplayTimeMs, PauseTimeSeconds;
  	theTest.hideOverlay();
  	soundDelaySeconds = $('input[name="soundDelay"]').val();
  	LetterDisplayTimeMs = $('input[name="letterDisplayTime"]').val();
  	PauseTimeSeconds = $('input[name="pauseTime"]').val();
  	theTest.run(soundDelaySeconds,LetterDisplayTimeMs,PauseTimeSeconds);
  });
  
  $("#demoSound").on("touch click", function() {
  	var testingAudio = new audioTest(theAudio);
    testingAudio.run();
  });
});

/*  Class sperlingTest  */
function sperlingTest(audioControl) {
  var audioDelayTime = 1;
  var lettersDisplayTime = 20;
  var pauseTime = 5;
  var audioDirection = 0;
  var countdownTotal = 0;
  var running = false;
  var letterArray = [];
  var audio = audioControl;
  var audioFrequency = 0;
  var currentCountDown = 0;
  var countdownTotal = 0;
  var countdownTimer;
  
  
  /*  Public Functions  */
  this.run = function (soundDelaySeconds,LetterDisplayTimeMs,PauseTimeSeconds) {
    if(!running) {
      running = true;
      audioDelayTime = soundDelaySeconds*1000;
      lettersDisplayTime = LetterDisplayTimeMs;
      pauseTime = PauseTimeSeconds*1000;
      _clearLetters();
      _calcLetters();
      _calcAudio();
      _setCountdown(pauseTime);
      
      // Overlay->Show Letters
      setTimeout(function() {
      	_displayLetters();
      	
      	// Show Letters->Hide Letters
      	setTimeout(function() {
      		_clearLetters();
      		_setCountdown(audioDelayTime); 
      		
      		// Hide Letters->Audio Cue
      		setTimeout(function() {
      			_triggerAudio();
      			_setCountdown(pauseTime);
      			
      			// Audio Cue->Overlay
	      		setTimeout(function() {
	      			_showOverlay();
	      			running = false;
	      		},pauseTime);
	      		
      		},audioDelayTime);
      		
      	},lettersDisplayTime);
      	
      },pauseTime);
    } else {
    	// Already running
    	console.log("Test already running");
    }
  };
  
  this.hideOverlay = function () {
  	$(".overlay").addClass("hide");
  };
  
  
  /*  Private functions  */
 function _showOverlay () {
  	$(".overlay").removeClass("hide");
  };
  
  function _displayLetters() {
	for(var i=0;i<9;i++) {
    	$(".display-area li h1").eq(i).text(letterArray[i]);
    }
  };

  function _calcLetters() {
  	var chars = "ABCDEFGHIJLMNOPQRSTUVWXYZ";
    for(var i=0;i<9;i++) {
			letterArray[i] = chars[Math.floor(Math.random() * chars.length)];
    }
  };
  
  function _calcAudio() {
  	audioDirection = Math.ceil(Math.random() * 3) - 2; // -1 to 1
  };
  
  function _triggerAudio() {
    audio.startAudio(audioDirection);
  };
  
  function _setCountdown(ms) {
    countdownTotal = ms;
    currentCountDown = 0;
    countdownTimer = setInterval(_showCountdown,50);
  };
  
  function _showCountdown() {
    if(currentCountDown < (countdownTotal / 50)) {
      var percentage = 0.0;
      percentage = 100 - ((currentCountDown * 50 / countdownTotal) * 100);
      $("#countdown").css("width",percentage+"%");
      currentCountDown++;
    } else {
      clearInterval(countdownTimer);
      currentCountDown = 0;
      countdownTotal = 0;
      $("#countdown").css("width","100%");
    }
  };
  
  function _clearLetters () {
  	$(".display-area li h1").each( function() {
    	$(this).empty();
    });
  };
};

function audioControl() {
  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  var audioFrequency = 0;

  this.startAudio = function(direction) {
    var oscillator = audioCtx.createOscillator();
    var gainNode = audioCtx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.type = 'triangle';

    // Up
    if(direction == 1) {
      audioFrequency = 100;
      oscillator.frequency.value = audioFrequency; // value in hertz
      oscillator.start();
      
      var audioLoop = setInterval(function() {
      	clearInterval(this);
        if(audioFrequency < 1000) {
          audioFrequency += 100;
          oscillator.frequency.value = audioFrequency;
        } else {
          oscillator.stop();
          clearInterval(audioLoop);
        }
      },50);
    // Down
    } else if(direction == -1) {
      audioFrequency = 1000;
      oscillator.frequency.value = audioFrequency; // value in hertz
      oscillator.start();
      
      var audioLoop = setInterval(function() {
        if(audioFrequency > 0) {
          audioFrequency -= 100;
          oscillator.frequency.value = audioFrequency;
        } else {
          oscillator.stop();
          clearInterval(audioLoop);
        }
      },50);
    // Neutral
    } else {
      audioFrequency = 400;
      oscillator.frequency.value = audioFrequency; // value in hertz
      oscillator.start();
      setTimeout(function() {
          oscillator.stop();
      },600);
    }
  };
	
};

function audioTest(audioControl) {
  var audio = audioControl;
  $(".display-area > li").toggleClass("show");

  this.run = function() {
    _hideOverlay();
    setTimeout(_runTop,500);
  };

  function _runTop() {
    _toggleBanner("top");
    audio.startAudio(1);
    setTimeout(function() {
        _toggleBanner("top");
        _runMiddle();
    },1000);
  };

  function _runMiddle() {
    _toggleBanner("middle");
    audio.startAudio(0);
    setTimeout(function() {
        _toggleBanner("middle");
        _runBottom();
    },1000);
  };

  function _runBottom() {
    _toggleBanner("bottom");
    audio.startAudio(-1);
    setTimeout(function() {
        _toggleBanner("bottom");
        _showOverlay();
        $(".display-area > li").toggleClass("show");
    },1000);
  };

  function _toggleBanner(bannerPosition) {
    if(bannerPosition == "top") {
      $(".display-area > li").each(function( i ) {
        if(i == 0 || i == 1 || i == 2) {
          $(this).toggleClass("active");
        }
      });
    } else if(bannerPosition == "middle") {
      $(".display-area > li").each(function( i ) {
        if(i == 3 || i == 4 || i == 5) {
          $(this).toggleClass("active");
        }
      });
    } else {
      $(".display-area > li").each(function( i ) {
        if(i == 6 || i == 7 || i == 8) {
          $(this).toggleClass("active");
        }
      });
    }
  };

  function _hideOverlay() {
    $(".overlay").addClass("hide");
  };
  
 function _showOverlay() {
    $(".overlay").removeClass("hide");
  };
}
