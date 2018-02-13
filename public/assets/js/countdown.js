function countdownWrapper() {
	function loadSound() {
		console.log('load sound!');
		createjs.Sound.registerSound('assets/audio/beep.mp3', 'beep');
		createjs.Sound.registerSound('assets/audio/ding.mp3', 'ding');

		// printer soundjs
		createjs.Sound.registerSound(
			'assets/audio/printer/matrix-short.wav',
			'printer-short'
		);
		createjs.Sound.registerSound(
			'assets/audio/printer/matrix-long.wav',
			'printer-long'
		);
		createjs.Sound.registerSound(
			'assets/audio/printer/load_paper.wav',
			'load_paper'
		);
	}

	loadSound();

	// when page is ready do this
	$(document).ready(function() {


		animateUp($('#counter'));


		function countdown(startTime) {
			animateUpOut($('#countdownWrapper'), 2000);

			switch (startTime) {
				case 4:
					$('#countdown').html('<span>Prepare your <span class="perish">Assets!</span></span>');
					break;
				case 3:
					$('#countdown').html('<span>Type your <span class="perish">Type!</span></span>');
					break;
				case 2:
					$('#countdown').html('<span>Create your <span class="perish">Layout!</span></span>');
					break;
				case 1:
					$('#countdown').html('<span>Publish or <span class="perish">Perish!</span></span>');
					break;
				default:
			}

			startTime = startTime - 1;
			if (startTime >= 1) {
				setTimeout(function () {
					console.log(startTime);
					countdown(startTime);
				}, 2000);
			} else {
				return
			}
		}

		var startTime = 4;
		countdown(startTime);


	});
}

countdownWrapper();




// countdown timer
// function countdown(startTime) {
// 	if (startTime >= 1) {
// 		createjs.Sound.play('printer-short');
// 		setTimeout(function() {
// 			$('#countdown').html(startTime); // set current time in #countdown
// 			countdown(startTime); // repeat function
// 		}, 1000);
// 	} else {
// 		$('#countdown').html('start game!'); // set to start game message
// 		setTimeout(function() {
// 			// wait a bit
// 			$('#countdown').fadeOut(1000); // fade out the #countdown
// 			// TODO: start time!
// 		}, 200);
// 		createjs.Sound.play('ding');
// 	}
// }

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb3VudGRvd24uanMiXSwic291cmNlc0NvbnRlbnQiOlsiZnVuY3Rpb24gY291bnRkb3duV3JhcHBlcigpIHtcblx0ZnVuY3Rpb24gbG9hZFNvdW5kKCkge1xuXHRcdGNvbnNvbGUubG9nKCdsb2FkIHNvdW5kIScpO1xuXHRcdGNyZWF0ZWpzLlNvdW5kLnJlZ2lzdGVyU291bmQoJ2Fzc2V0cy9hdWRpby9iZWVwLm1wMycsICdiZWVwJyk7XG5cdFx0Y3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZCgnYXNzZXRzL2F1ZGlvL2RpbmcubXAzJywgJ2RpbmcnKTtcblxuXHRcdC8vIHByaW50ZXIgc291bmRqc1xuXHRcdGNyZWF0ZWpzLlNvdW5kLnJlZ2lzdGVyU291bmQoXG5cdFx0XHQnYXNzZXRzL2F1ZGlvL3ByaW50ZXIvbWF0cml4LXNob3J0LndhdicsXG5cdFx0XHQncHJpbnRlci1zaG9ydCdcblx0XHQpO1xuXHRcdGNyZWF0ZWpzLlNvdW5kLnJlZ2lzdGVyU291bmQoXG5cdFx0XHQnYXNzZXRzL2F1ZGlvL3ByaW50ZXIvbWF0cml4LWxvbmcud2F2Jyxcblx0XHRcdCdwcmludGVyLWxvbmcnXG5cdFx0KTtcblx0XHRjcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKFxuXHRcdFx0J2Fzc2V0cy9hdWRpby9wcmludGVyL2xvYWRfcGFwZXIud2F2Jyxcblx0XHRcdCdsb2FkX3BhcGVyJ1xuXHRcdCk7XG5cdH1cblxuXHRsb2FkU291bmQoKTtcblxuXHQvLyB3aGVuIHBhZ2UgaXMgcmVhZHkgZG8gdGhpc1xuXHQkKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblxuXG5cdFx0YW5pbWF0ZVVwKCQoJyNjb3VudGVyJykpO1xuXG5cblx0XHRmdW5jdGlvbiBjb3VudGRvd24oc3RhcnRUaW1lKSB7XG5cdFx0XHRhbmltYXRlVXBPdXQoJCgnI2NvdW50ZG93bldyYXBwZXInKSwgMjAwMCk7XG5cblx0XHRcdHN3aXRjaCAoc3RhcnRUaW1lKSB7XG5cdFx0XHRcdGNhc2UgNDpcblx0XHRcdFx0XHQkKCcjY291bnRkb3duJykuaHRtbCgnPHNwYW4+UHJlcGFyZSB5b3VyIDxzcGFuIGNsYXNzPVwicGVyaXNoXCI+QXNzZXRzITwvc3Bhbj48L3NwYW4+Jyk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgMzpcblx0XHRcdFx0XHQkKCcjY291bnRkb3duJykuaHRtbCgnPHNwYW4+VHlwZSB5b3VyIDxzcGFuIGNsYXNzPVwicGVyaXNoXCI+VHlwZSE8L3NwYW4+PC9zcGFuPicpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIDI6XG5cdFx0XHRcdFx0JCgnI2NvdW50ZG93bicpLmh0bWwoJzxzcGFuPkNyZWF0ZSB5b3VyIDxzcGFuIGNsYXNzPVwicGVyaXNoXCI+TGF5b3V0ITwvc3Bhbj48L3NwYW4+Jyk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgMTpcblx0XHRcdFx0XHQkKCcjY291bnRkb3duJykuaHRtbCgnPHNwYW4+UHVibGlzaCBvciA8c3BhbiBjbGFzcz1cInBlcmlzaFwiPlBlcmlzaCE8L3NwYW4+PC9zcGFuPicpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0fVxuXG5cdFx0XHRzdGFydFRpbWUgPSBzdGFydFRpbWUgLSAxO1xuXHRcdFx0aWYgKHN0YXJ0VGltZSA+PSAxKSB7XG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKHN0YXJ0VGltZSk7XG5cdFx0XHRcdFx0Y291bnRkb3duKHN0YXJ0VGltZSk7XG5cdFx0XHRcdH0sIDIwMDApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuXG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dmFyIHN0YXJ0VGltZSA9IDQ7XG5cdFx0Y291bnRkb3duKHN0YXJ0VGltZSk7XG5cblxuXHR9KTtcbn1cblxuY291bnRkb3duV3JhcHBlcigpO1xuXG5cblxuXG4vLyBjb3VudGRvd24gdGltZXJcbi8vIGZ1bmN0aW9uIGNvdW50ZG93bihzdGFydFRpbWUpIHtcbi8vIFx0aWYgKHN0YXJ0VGltZSA+PSAxKSB7XG4vLyBcdFx0Y3JlYXRlanMuU291bmQucGxheSgncHJpbnRlci1zaG9ydCcpO1xuLy8gXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4vLyBcdFx0XHQkKCcjY291bnRkb3duJykuaHRtbChzdGFydFRpbWUpOyAvLyBzZXQgY3VycmVudCB0aW1lIGluICNjb3VudGRvd25cbi8vIFx0XHRcdGNvdW50ZG93bihzdGFydFRpbWUpOyAvLyByZXBlYXQgZnVuY3Rpb25cbi8vIFx0XHR9LCAxMDAwKTtcbi8vIFx0fSBlbHNlIHtcbi8vIFx0XHQkKCcjY291bnRkb3duJykuaHRtbCgnc3RhcnQgZ2FtZSEnKTsgLy8gc2V0IHRvIHN0YXJ0IGdhbWUgbWVzc2FnZVxuLy8gXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4vLyBcdFx0XHQvLyB3YWl0IGEgYml0XG4vLyBcdFx0XHQkKCcjY291bnRkb3duJykuZmFkZU91dCgxMDAwKTsgLy8gZmFkZSBvdXQgdGhlICNjb3VudGRvd25cbi8vIFx0XHRcdC8vIFRPRE86IHN0YXJ0IHRpbWUhXG4vLyBcdFx0fSwgMjAwKTtcbi8vIFx0XHRjcmVhdGVqcy5Tb3VuZC5wbGF5KCdkaW5nJyk7XG4vLyBcdH1cbi8vIH1cbiJdLCJmaWxlIjoiY291bnRkb3duLmpzIn0=
