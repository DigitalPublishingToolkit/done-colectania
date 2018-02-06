function animatetimecounter(bonusTime) {
	console.log(bonusTime);
	$('#animatetimecounter').prepend(
		"<span id='bonusTime'>" + bonusTime + '</span>'
	);
	// $('#animatetimecounter').show().fadeOut(1000);

	// add
	$('#animatetimecounter').addClass('fadeinout');
	$('#counter').addClass('wiggle');
	console.log('add');
	setTimeout(function() {
		// remove
		console.log('remove');
		$('#animatetimecounter').removeClass('fadeinout');
		$('#counter').removeClass('wiggle');
	}, 1000);
}

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
		$('#countdown').html('Get ready!').show();
		// countdown timer
		function countdown(startTime) {
			if (startTime >= 1) {
				createjs.Sound.play('printer-short');
				setTimeout(function() {
					startTime = startTime - 1;
					$('#countdown').html(startTime); // set current time in #countdown
					countdown(startTime); // repeat function
				}, 1000);
			} else {
				$('#countdown').html('start game!'); // set to start game message
				setTimeout(function() {
					// wait a bit
					$('#countdown').fadeOut(1000); // fade out the #countdown
					// TODO: start time!
				}, 200);
				createjs.Sound.play('ding');
			}
		}

		var startTime = 4;
		countdown(startTime);
		$('#countdown').html(startTime);
	});
}

countdownWrapper();

// --- GLOBAL

var pages = $('.page');
var criticPopup = $('#critic');
var dropDelay = 100;
var pdfReady = false;

// --- GENERAL FUNCTIONS

function makeId() {
	var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
	var id = randLetter + Date.now();
	return id;
}

function byteCount(s) {
    return encodeURI(s).split(/%..|./).length - 1;
}

var getUrlParameter = function getUrlParameter(sParam) {
  var sPageURL = decodeURIComponent(window.location.search.substring(1)),
    sURLVariables = sPageURL.split('&'),
    sParameterName,
    i;

  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split('=');

    if (sParameterName[0] === sParam) {
        return sParameterName[1] === undefined ? true : sParameterName[1];
    }
  }
};

function createElement(element) {
	if (element.data.includes('data:image')) {
		var pageElementContent = $('<img>', { src: element.data });
	} else {
		var deBasedText = atob(element.data.substring(23));
		var htmlBrText = deBasedText.replace(/\n/g, '<br/>');
		console.log(htmlBrText);
		var pageElementContent = $('<p>').append(htmlBrText); // remove "data:text/plain;base64"
	}
	var pageElement = $('<div>', { class: 'page-element draggable' });
	var pageElementClose = $('<span>', { class: 'close' }).text('x');
	pageElement.append(pageElementContent, pageElementClose);
	pageElement.attr('id', element.id);
	$('#' + element.page).append(pageElement);

	if (element.pos) {
		// reconstructing saved element
		setTimeout(function() {
			modElementPosition(pageElement, element.pos);
		}, 700);
	} else {
		// dropping new file
		return getElementPosition(pageElement);
	}
}

function createElementCanvas(element) {
	if (element.data.indexOf('data:image') >= 0) {

		var canvas = document.createElement('canvas');
		canvas.style.marginLeft = element.pos[0] + 'px';
		canvas.style.marginTop = element.pos[1] + 'px';
		canvas.width = element.pos[2] * 3; // to have crisp images
		canvas.height = element.pos[3] * 3; // to have crisp images
		canvas.style.width = element.pos[2] + 'px';
		canvas.style.height = element.pos[3] + 'px';
		canvas.style.zIndex = element.pos[4];

		var ctx = canvas.getContext('2d');
		$('#' + element.page).append(canvas);

		var image = new Image();
		image.onload = function() {
			ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
		};
		image.src = element.data;

	} else {

		var deBasedText = atob(element.data.substring(23));
		var htmlBrText = deBasedText.replace(/\n/g, '<br/>');
		console.log(htmlBrText);
		var pageElementContent = $('<p>').append(htmlBrText); // remove "data:text/plain;base64"

		var pageElement = $('<div>', { class: 'page-element draggable' });
		var pageElementClose = $('<span>', { class: 'close' }).text('x');
		pageElement.append(pageElementContent, pageElementClose);
		pageElement.attr('id', element.id);
		$('#' + element.page).append(pageElement);

		setTimeout(function() {
			modElementPosition(pageElement, element.pos);
		}, 700);
	}
}

function getElementPosition(element) {
	return (elementPos = [
		parseFloat(element.css('marginLeft')),
		parseFloat(element.css('marginTop')),
		element.width(),
		element.height(),
		parseInt(element.css('z-index')) // TODO rotation maybe
	]);
}

function modElementPosition(pageElement, newPos) {
	pageElement.css({ 'margin-left': newPos[0] + 'px' });
	pageElement.css({ 'margin-top': newPos[1] + 'px' });
	pageElement.width(newPos[2]);
	pageElement.height(newPos[3]);
	pageElement.css({ 'z-index': newPos[4] });
}

// --- M-V-C

var Publication = {
	// all our states
	id: makeId(),
	title: 'TEST PUB',
	timeLeft: 9000000,
	expired: false,
	elements: [],
	authors: []
};

function controller(Publication, input) {
	// expired?
	if (Publication.timeLeft > 0) {
		// expired
		showTime(Publication);
	} else {
		// not expired
		Publication.expired = true;
		showExpired(Publication);
		noDrag();
		showSaveModal();
	}

	if (input && Publication.expired == false) {
		console.log(input)
		switch (true) {
			case input.visible == false: // deleting an element
					removeElement(input.id)
					break
			case input.data &&
				byteCount(input.data) > 1398117 : // file too big (1mb)
				 	Error.tooBig()
					break
			case input.data &&
				input.data.includes('data:image') &&
				input.visible == true: // new image
					// update the Publication
					Publication.elements.push(input);
					// drop file
					dropElement(input.page, input.data, input.id);
					// add bonus time
					addtime(1000)
					// critic speak
					// critic();
					break
			case input.data &&
				input.data.includes('data:text/plain') &&
				input.visible == true: // new text
					// update the Publication
					Publication.elements.push(input);
					// drop file
					dropElement(input.page, input.data, input.id)
					addtime(1000)
					break
			case input.data &&
				!input.data.includes('data:image') &&
				!input.data.includes('data:text/plain'): // neither an image nor text
					Error.notAllowed()
					break
			case input.move == true : // moving or scaling an image
					var movingElement;
					for (var i = 0; i < Publication.elements.length; i += 1) {
						// find element by id
						if (Publication.elements[i].id == input.id) {
							movingElement = Publication.elements[i]; // read pos and add it to Publication
						}
					}
					movingElement.pos = input.pos;
					break
			case input.hasOwnProperty('title') : // changing title
					Publication.title = input.title;
		}
	} else if (input && Publication.expired == true) {
		// too late
		Error.tooLate();
	}
}

// --- CONTROLLER

var x;
$(document).ready(function() {
	if (window.location.href.indexOf('saved') < 0) {
		// if not a saved publication
		if ( getUrlParameter('time') ) { // difficulty
			Publication.timeLeft = getUrlParameter('time');
		}
		x = setInterval(function() {
			Publication.timeLeft = Publication.timeLeft - 10;
			controller(Publication);
		}, 10);

		mouseCounter();
	} else {
		renderPublication(Publication);
		noDrag();
		pdfDownload();
		$('body').addClass('saved');
	}
});

function addtime(bonusTime) {
	Publication.timeLeft = Publication.timeLeft + bonusTime;
	animatetimecounter(bonusTime);
}

// dropFile

pages.on('dragover', function(e) {
	e.preventDefault();
	$(this).addClass('dragover');
});
pages.on('dragleave', function(e) {
	e.preventDefault();
	$(this).removeClass('dragover');
});
pages.on('drop', function(e) {
	$(this).removeClass('dragover');
	e.preventDefault();
	console.log(e);
	var files = e.originalEvent.dataTransfer.files;
	var y = 0;
	for (var i = files.length - 1; i >= 0; i--) {
		reader = new FileReader();
		var pageId = $(this).attr('id');
		reader.onload = function(event) {
			console.log(event.target);
			// id, data, [pos x, pos y, width, height, z-index, (rotation?)], visible, page
			setTimeout(function() {
				controller(Publication, {
					id: makeId(),
					data: event.target.result,
					pos: [0, 0, 0, 0, 0],
					visible: true,
					page: pageId
				});
			}, y * dropDelay);
			y += 1;
		};
		console.log(files[i]);
		reader.readAsDataURL(files[i]);
	}
	return false;
});
// prevent drop on body
$('body').on('dragover', function(e) {
	e.preventDefault();
});
$('body').on('dragleave', function(e) {
	e.preventDefault();
});
$('body').on('drop', function(e) {
	e.preventDefault();
	Sound.error();
});

// remove element
$(document).on('click', '.close', function() {
	var pageId = $(this)
		.closest('.page')
		.attr('id');
	var elementId = $(this)
		.parent()
		.attr('id');
	var elementData = $(this)
		.siblings()
		.attr('src');
	controller(Publication, {
		id: elementId,
		data: elementData,
		pos: [0, 0, 0, 0, 0],
		visible: false,
		page: pageId
	});
});

// changing title
$('#title').change(function() {
	controller(Publication, {
		title: $(this).val()
	});
})

// --- VIEW

var Sound = {
	error: function() {
		var audio = new Audio('assets/audio/incorrect.mp3');
		audio.play();
	},
	ding: function() {
		var audio = new Audio('assets/audio/ding.mp3');
		audio.play();
	}
};

// merge these two
function showTime(Publication) {
	seconds = Publication.timeLeft / 1000;
	$('#counter').show();
	document.getElementById('counter').innerHTML =
		seconds.toFixed(2) + ' seconds left!';
}
function mouseCounter() {
	$(document).bind('mousemove', function(e) {
		if (e.pageX >= $(document).width() / 2) {
			// if mouse of right side of page
			$('#counter').addClass('mouse_right');
			$('#counter').css({
				left: e.pageX - 20 - $('#counter').width(),
				top: e.pageY + 50
			});
		} else {
			// if mouse of left side of page
			$('#counter').removeClass('mouse_right');
			$('#counter').css({
				left: e.pageX + 20,
				top: e.pageY + 50
			});
		}
	});
}

function showExpired() {
	document.getElementById('counter').innerHTML = 'expired!';
	$('body').addClass('expired');
	//setTimeout(function(){
	//  window.print();
	//}, 1000);
	clearInterval(x);
}


function dropElement(pageId, data, id) {
	var element = { id: id, data: data, page: pageId };
	var elementPos = createElement(element);
	setTimeout(function() {
		// timeout to get the actual height :(
		elementPos[3] = $('#' + id).height();
		for (var i = 0; i < Publication.elements.length; i += 1) {
			// find element by id
			if (Publication.elements[i].id == id) {
				Publication.elements[i].pos = elementPos; // read pos and add it to Publication
			}
		}
		Sound.ding();
	}, 1);
}

// errors

var Error = {
	notAllowed: function() {
		Sound.error()
		alert('The file you dropped is not allowed!')
	},
	tooBig: function() {
		Sound.error();
		alert('The file you dropped is too big!'); 
	},
	tooLate: function() {
		Sound.error();
			alert('too late bro'); 
	}
};


function noDrag() {
	var elems = document.querySelectorAll('.draggable');
	[].forEach.call(elems, function(el) {
		el.classList.remove('draggable');
	});
}

function critic() {
	criticPopup.innerHTML = 'Make this image bigger pls!';
}

function removeElement(id) {
	$('#' + id).hide();
	console.log(id);
}

interact('.draggable')
	.draggable({
		onmove: window.dragMoveListener,
		restrict: {
			restriction: 'parent',
			elementRect: {
				top: 0,
				left: 0,
				bottom: 1,
				right: 1
			}
		}
	})
	.resizable({
		// resize from all edges and corners
		edges: {
			left: true,
			right: true,
			bottom: true,
			top: true
		},

		// keep the edges inside the parent
		restrictEdges: {
			outer: 'parent',
			endOnly: true
		},

		inertia: true
	})
	.on('resizemove', function(event) {
		var target = event.target,
			x = parseFloat(target.getAttribute('data-x')) || 0,
			y = parseFloat(target.getAttribute('data-y')) || 0;

		// update the element's style
		target.style.width = event.rect.width + 'px';
		target.style.height = event.rect.height + 'px';

		// translate when resizing from top or left edges
		x += event.deltaRect.left;
		y += event.deltaRect.top;

		target.style.marginLeft = x + 'px';
		target.style.marginTop = y + 'px';

		target.setAttribute('data-x', x);
		target.setAttribute('data-y', y);

		var pageElementPos = getElementPosition($('#' + target.id));
		controller(Publication, { id: target.id, pos: pageElementPos, move: true }); // sending element id and position
	});

function dragMoveListener(event) {
	var target = event.target,
		// keep the dragged position in the data-x/data-y attributes
		x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
		y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

	// translate the element
	target.style.marginLeft = x + 'px';
	target.style.marginTop = y + 'px';

	// update the posiion attributes
	target.setAttribute('data-x', x);
	target.setAttribute('data-y', y);

	// update z-index
	var maxzIndex = 0,
		i = 0;
	pageElements = $('#' + target.id)
		.parent()
		.children();
	pageElements.each(function() {
		i += 1;
		if ($(this).css('z-index') >= maxzIndex) {
			maxzIndex = parseInt($(this).css('z-index'));
		}
		if (i == pageElements.length) {
			if ((target.style.zIndex != maxzIndex) | (target.style.zIndex == 0)) {
				target.style.zIndex = maxzIndex + 1;
			}
		}
	});
	// target.style.zIndex = maxzIndex + 1;

	var pageElementPos = getElementPosition($('#' + target.id));
	controller(Publication, { id: target.id, pos: pageElementPos, move: true }); // sending element id and position
}

// this is used later in the resizing and gesture demos
window.dragMoveListener = dragMoveListener;

// show save modal

function showSaveModal() {
	$('#save-modal').show();
	$('#save').click(function() {
		savetoDb(Publication);
		makePdf(Publication.id);
		genPdf(Publication.id);
		checkPdf(Publication.id);
	});
}

function genPdf(id) {
	$('#save-modal').show();
	$('#save-modal').html('');
	var y = setInterval(function() {
		if (pdfReady == true) {
			$('#save-modal').html(
				'Download your pdf <a href="assets/pdf/' +
					id +
					'/' +
					id +
					'.pdf?download=true" target="_blank">here</a>'
			);
			clearInterval(y);
		} else {
			$('#save-modal').text('Your PDF is being generated');
		}
	}, 100);
}

// --- SAVED

function renderPublication(Publication) {
	$('#title').val(Publication.title).attr("disabled","disabled");
	var i;
	for (i = 0; i < Publication.elements.length; ++i) {
		if (window.location.href.indexOf('print=true') > 0) { // print pub
			createElementCanvas(Publication.elements[i]);
		} else {
			createElement(Publication.elements[i]); // saved pub
		}
	}
}

function pdfDownload() {
	$('#pdf-download').show();
	$('#pdf-download').click(function() {
		makePdf(Publication.id);
		genPdf(Publication.id);
		checkPdf(Publication.id);
	});
}

// --- BACKEND

// send call to server to make pdf
function makePdf(id) {
	$.get('/pdf?id=' + id, function(data) {
		console.log('Sent call to make PDF.');
	});
}

// check if pdf exists and redirect to file
function checkPdf(id) {
	var y = setInterval(function() {
		$.ajax({
			type: 'HEAD',
			url: 'assets/pdf/' + id + '/' + id + '.pdf',
			success: function(msg) {
				clearInterval(y);
				pdfReady = true;
			},
			error: function(jqXHR, textStatus, error) {
				console.log(jqXHR);
				console.log(error);
			}
		});
	}, 100);
}

function savetoDb(publication) {
	$.ajax({
		url: '/db',
		type: 'post', // performing a POST request
		data: publication,
		dataType: 'json',
		success: function(publication) {
			console.log('publication sent to database.');
		}
	});
}
// #counter follows the mouse
function updateMouseCounter(e) {
  if (e.clientX >= 200) { // ($(document).width()/2)
    // if mouse of right side of client
    $('.counter').addClass('mouse_right');
    $('.counter').css({
      left:  e.clientX - 20 - $('.counter').width(),
      top:   e.clientY - 50
    });
  } else {
    // if mouse of left side of client
    $('.counter').removeClass('mouse_right');
    $('.counter').css({
      left:  e.clientX + 20,
      top:   e.clientY - 50
    });
  }
}

$(document).bind('mousemove', function(e){
  updateMouseCounter(e);
});

$(document).bind("dragover", function(e){
    updateMouseCounter(e);
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFuaW1hdGVfdGltZWNvdW50ZXIuanMiLCJjb3VudGRvd24uanMiLCJtYWluLmpzIiwidGltZV9mb2xsb3dfbW91c2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNrQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyJmdW5jdGlvbiBhbmltYXRldGltZWNvdW50ZXIoYm9udXNUaW1lKSB7XG5cdGNvbnNvbGUubG9nKGJvbnVzVGltZSk7XG5cdCQoJyNhbmltYXRldGltZWNvdW50ZXInKS5wcmVwZW5kKFxuXHRcdFwiPHNwYW4gaWQ9J2JvbnVzVGltZSc+XCIgKyBib251c1RpbWUgKyAnPC9zcGFuPidcblx0KTtcblx0Ly8gJCgnI2FuaW1hdGV0aW1lY291bnRlcicpLnNob3coKS5mYWRlT3V0KDEwMDApO1xuXG5cdC8vIGFkZFxuXHQkKCcjYW5pbWF0ZXRpbWVjb3VudGVyJykuYWRkQ2xhc3MoJ2ZhZGVpbm91dCcpO1xuXHQkKCcjY291bnRlcicpLmFkZENsYXNzKCd3aWdnbGUnKTtcblx0Y29uc29sZS5sb2coJ2FkZCcpO1xuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdC8vIHJlbW92ZVxuXHRcdGNvbnNvbGUubG9nKCdyZW1vdmUnKTtcblx0XHQkKCcjYW5pbWF0ZXRpbWVjb3VudGVyJykucmVtb3ZlQ2xhc3MoJ2ZhZGVpbm91dCcpO1xuXHRcdCQoJyNjb3VudGVyJykucmVtb3ZlQ2xhc3MoJ3dpZ2dsZScpO1xuXHR9LCAxMDAwKTtcbn1cbiIsImZ1bmN0aW9uIGNvdW50ZG93bldyYXBwZXIoKSB7XG5cdGZ1bmN0aW9uIGxvYWRTb3VuZCgpIHtcblx0XHRjb25zb2xlLmxvZygnbG9hZCBzb3VuZCEnKTtcblx0XHRjcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKCdhc3NldHMvYXVkaW8vYmVlcC5tcDMnLCAnYmVlcCcpO1xuXHRcdGNyZWF0ZWpzLlNvdW5kLnJlZ2lzdGVyU291bmQoJ2Fzc2V0cy9hdWRpby9kaW5nLm1wMycsICdkaW5nJyk7XG5cblx0XHQvLyBwcmludGVyIHNvdW5kanNcblx0XHRjcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKFxuXHRcdFx0J2Fzc2V0cy9hdWRpby9wcmludGVyL21hdHJpeC1zaG9ydC53YXYnLFxuXHRcdFx0J3ByaW50ZXItc2hvcnQnXG5cdFx0KTtcblx0XHRjcmVhdGVqcy5Tb3VuZC5yZWdpc3RlclNvdW5kKFxuXHRcdFx0J2Fzc2V0cy9hdWRpby9wcmludGVyL21hdHJpeC1sb25nLndhdicsXG5cdFx0XHQncHJpbnRlci1sb25nJ1xuXHRcdCk7XG5cdFx0Y3JlYXRlanMuU291bmQucmVnaXN0ZXJTb3VuZChcblx0XHRcdCdhc3NldHMvYXVkaW8vcHJpbnRlci9sb2FkX3BhcGVyLndhdicsXG5cdFx0XHQnbG9hZF9wYXBlcidcblx0XHQpO1xuXHR9XG5cblx0bG9hZFNvdW5kKCk7XG5cblx0Ly8gd2hlbiBwYWdlIGlzIHJlYWR5IGRvIHRoaXNcblx0JChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cdFx0JCgnI2NvdW50ZG93bicpLmh0bWwoJ0dldCByZWFkeSEnKS5zaG93KCk7XG5cdFx0Ly8gY291bnRkb3duIHRpbWVyXG5cdFx0ZnVuY3Rpb24gY291bnRkb3duKHN0YXJ0VGltZSkge1xuXHRcdFx0aWYgKHN0YXJ0VGltZSA+PSAxKSB7XG5cdFx0XHRcdGNyZWF0ZWpzLlNvdW5kLnBsYXkoJ3ByaW50ZXItc2hvcnQnKTtcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRzdGFydFRpbWUgPSBzdGFydFRpbWUgLSAxO1xuXHRcdFx0XHRcdCQoJyNjb3VudGRvd24nKS5odG1sKHN0YXJ0VGltZSk7IC8vIHNldCBjdXJyZW50IHRpbWUgaW4gI2NvdW50ZG93blxuXHRcdFx0XHRcdGNvdW50ZG93bihzdGFydFRpbWUpOyAvLyByZXBlYXQgZnVuY3Rpb25cblx0XHRcdFx0fSwgMTAwMCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQkKCcjY291bnRkb3duJykuaHRtbCgnc3RhcnQgZ2FtZSEnKTsgLy8gc2V0IHRvIHN0YXJ0IGdhbWUgbWVzc2FnZVxuXHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdC8vIHdhaXQgYSBiaXRcblx0XHRcdFx0XHQkKCcjY291bnRkb3duJykuZmFkZU91dCgxMDAwKTsgLy8gZmFkZSBvdXQgdGhlICNjb3VudGRvd25cblx0XHRcdFx0XHQvLyBUT0RPOiBzdGFydCB0aW1lIVxuXHRcdFx0XHR9LCAyMDApO1xuXHRcdFx0XHRjcmVhdGVqcy5Tb3VuZC5wbGF5KCdkaW5nJyk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dmFyIHN0YXJ0VGltZSA9IDQ7XG5cdFx0Y291bnRkb3duKHN0YXJ0VGltZSk7XG5cdFx0JCgnI2NvdW50ZG93bicpLmh0bWwoc3RhcnRUaW1lKTtcblx0fSk7XG59XG5cbmNvdW50ZG93bldyYXBwZXIoKTtcbiIsIi8vIC0tLSBHTE9CQUxcblxudmFyIHBhZ2VzID0gJCgnLnBhZ2UnKTtcbnZhciBjcml0aWNQb3B1cCA9ICQoJyNjcml0aWMnKTtcbnZhciBkcm9wRGVsYXkgPSAxMDA7XG52YXIgcGRmUmVhZHkgPSBmYWxzZTtcblxuLy8gLS0tIEdFTkVSQUwgRlVOQ1RJT05TXG5cbmZ1bmN0aW9uIG1ha2VJZCgpIHtcblx0dmFyIHJhbmRMZXR0ZXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDY1ICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjYpKTtcblx0dmFyIGlkID0gcmFuZExldHRlciArIERhdGUubm93KCk7XG5cdHJldHVybiBpZDtcbn1cblxuZnVuY3Rpb24gYnl0ZUNvdW50KHMpIHtcbiAgICByZXR1cm4gZW5jb2RlVVJJKHMpLnNwbGl0KC8lLi58Li8pLmxlbmd0aCAtIDE7XG59XG5cbnZhciBnZXRVcmxQYXJhbWV0ZXIgPSBmdW5jdGlvbiBnZXRVcmxQYXJhbWV0ZXIoc1BhcmFtKSB7XG4gIHZhciBzUGFnZVVSTCA9IGRlY29kZVVSSUNvbXBvbmVudCh3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cmluZygxKSksXG4gICAgc1VSTFZhcmlhYmxlcyA9IHNQYWdlVVJMLnNwbGl0KCcmJyksXG4gICAgc1BhcmFtZXRlck5hbWUsXG4gICAgaTtcblxuICBmb3IgKGkgPSAwOyBpIDwgc1VSTFZhcmlhYmxlcy5sZW5ndGg7IGkrKykge1xuICAgIHNQYXJhbWV0ZXJOYW1lID0gc1VSTFZhcmlhYmxlc1tpXS5zcGxpdCgnPScpO1xuXG4gICAgaWYgKHNQYXJhbWV0ZXJOYW1lWzBdID09PSBzUGFyYW0pIHtcbiAgICAgICAgcmV0dXJuIHNQYXJhbWV0ZXJOYW1lWzFdID09PSB1bmRlZmluZWQgPyB0cnVlIDogc1BhcmFtZXRlck5hbWVbMV07XG4gICAgfVxuICB9XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVFbGVtZW50KGVsZW1lbnQpIHtcblx0aWYgKGVsZW1lbnQuZGF0YS5pbmNsdWRlcygnZGF0YTppbWFnZScpKSB7XG5cdFx0dmFyIHBhZ2VFbGVtZW50Q29udGVudCA9ICQoJzxpbWc+JywgeyBzcmM6IGVsZW1lbnQuZGF0YSB9KTtcblx0fSBlbHNlIHtcblx0XHR2YXIgZGVCYXNlZFRleHQgPSBhdG9iKGVsZW1lbnQuZGF0YS5zdWJzdHJpbmcoMjMpKTtcblx0XHR2YXIgaHRtbEJyVGV4dCA9IGRlQmFzZWRUZXh0LnJlcGxhY2UoL1xcbi9nLCAnPGJyLz4nKTtcblx0XHRjb25zb2xlLmxvZyhodG1sQnJUZXh0KTtcblx0XHR2YXIgcGFnZUVsZW1lbnRDb250ZW50ID0gJCgnPHA+JykuYXBwZW5kKGh0bWxCclRleHQpOyAvLyByZW1vdmUgXCJkYXRhOnRleHQvcGxhaW47YmFzZTY0XCJcblx0fVxuXHR2YXIgcGFnZUVsZW1lbnQgPSAkKCc8ZGl2PicsIHsgY2xhc3M6ICdwYWdlLWVsZW1lbnQgZHJhZ2dhYmxlJyB9KTtcblx0dmFyIHBhZ2VFbGVtZW50Q2xvc2UgPSAkKCc8c3Bhbj4nLCB7IGNsYXNzOiAnY2xvc2UnIH0pLnRleHQoJ3gnKTtcblx0cGFnZUVsZW1lbnQuYXBwZW5kKHBhZ2VFbGVtZW50Q29udGVudCwgcGFnZUVsZW1lbnRDbG9zZSk7XG5cdHBhZ2VFbGVtZW50LmF0dHIoJ2lkJywgZWxlbWVudC5pZCk7XG5cdCQoJyMnICsgZWxlbWVudC5wYWdlKS5hcHBlbmQocGFnZUVsZW1lbnQpO1xuXG5cdGlmIChlbGVtZW50LnBvcykge1xuXHRcdC8vIHJlY29uc3RydWN0aW5nIHNhdmVkIGVsZW1lbnRcblx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0bW9kRWxlbWVudFBvc2l0aW9uKHBhZ2VFbGVtZW50LCBlbGVtZW50LnBvcyk7XG5cdFx0fSwgNzAwKTtcblx0fSBlbHNlIHtcblx0XHQvLyBkcm9wcGluZyBuZXcgZmlsZVxuXHRcdHJldHVybiBnZXRFbGVtZW50UG9zaXRpb24ocGFnZUVsZW1lbnQpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnRDYW52YXMoZWxlbWVudCkge1xuXHRpZiAoZWxlbWVudC5kYXRhLmluZGV4T2YoJ2RhdGE6aW1hZ2UnKSA+PSAwKSB7XG5cblx0XHR2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG5cdFx0Y2FudmFzLnN0eWxlLm1hcmdpbkxlZnQgPSBlbGVtZW50LnBvc1swXSArICdweCc7XG5cdFx0Y2FudmFzLnN0eWxlLm1hcmdpblRvcCA9IGVsZW1lbnQucG9zWzFdICsgJ3B4Jztcblx0XHRjYW52YXMud2lkdGggPSBlbGVtZW50LnBvc1syXSAqIDM7IC8vIHRvIGhhdmUgY3Jpc3AgaW1hZ2VzXG5cdFx0Y2FudmFzLmhlaWdodCA9IGVsZW1lbnQucG9zWzNdICogMzsgLy8gdG8gaGF2ZSBjcmlzcCBpbWFnZXNcblx0XHRjYW52YXMuc3R5bGUud2lkdGggPSBlbGVtZW50LnBvc1syXSArICdweCc7XG5cdFx0Y2FudmFzLnN0eWxlLmhlaWdodCA9IGVsZW1lbnQucG9zWzNdICsgJ3B4Jztcblx0XHRjYW52YXMuc3R5bGUuekluZGV4ID0gZWxlbWVudC5wb3NbNF07XG5cblx0XHR2YXIgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cdFx0JCgnIycgKyBlbGVtZW50LnBhZ2UpLmFwcGVuZChjYW52YXMpO1xuXG5cdFx0dmFyIGltYWdlID0gbmV3IEltYWdlKCk7XG5cdFx0aW1hZ2Uub25sb2FkID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRjdHguZHJhd0ltYWdlKGltYWdlLCAwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXHRcdH07XG5cdFx0aW1hZ2Uuc3JjID0gZWxlbWVudC5kYXRhO1xuXG5cdH0gZWxzZSB7XG5cblx0XHR2YXIgZGVCYXNlZFRleHQgPSBhdG9iKGVsZW1lbnQuZGF0YS5zdWJzdHJpbmcoMjMpKTtcblx0XHR2YXIgaHRtbEJyVGV4dCA9IGRlQmFzZWRUZXh0LnJlcGxhY2UoL1xcbi9nLCAnPGJyLz4nKTtcblx0XHRjb25zb2xlLmxvZyhodG1sQnJUZXh0KTtcblx0XHR2YXIgcGFnZUVsZW1lbnRDb250ZW50ID0gJCgnPHA+JykuYXBwZW5kKGh0bWxCclRleHQpOyAvLyByZW1vdmUgXCJkYXRhOnRleHQvcGxhaW47YmFzZTY0XCJcblxuXHRcdHZhciBwYWdlRWxlbWVudCA9ICQoJzxkaXY+JywgeyBjbGFzczogJ3BhZ2UtZWxlbWVudCBkcmFnZ2FibGUnIH0pO1xuXHRcdHZhciBwYWdlRWxlbWVudENsb3NlID0gJCgnPHNwYW4+JywgeyBjbGFzczogJ2Nsb3NlJyB9KS50ZXh0KCd4Jyk7XG5cdFx0cGFnZUVsZW1lbnQuYXBwZW5kKHBhZ2VFbGVtZW50Q29udGVudCwgcGFnZUVsZW1lbnRDbG9zZSk7XG5cdFx0cGFnZUVsZW1lbnQuYXR0cignaWQnLCBlbGVtZW50LmlkKTtcblx0XHQkKCcjJyArIGVsZW1lbnQucGFnZSkuYXBwZW5kKHBhZ2VFbGVtZW50KTtcblxuXHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRtb2RFbGVtZW50UG9zaXRpb24ocGFnZUVsZW1lbnQsIGVsZW1lbnQucG9zKTtcblx0XHR9LCA3MDApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGdldEVsZW1lbnRQb3NpdGlvbihlbGVtZW50KSB7XG5cdHJldHVybiAoZWxlbWVudFBvcyA9IFtcblx0XHRwYXJzZUZsb2F0KGVsZW1lbnQuY3NzKCdtYXJnaW5MZWZ0JykpLFxuXHRcdHBhcnNlRmxvYXQoZWxlbWVudC5jc3MoJ21hcmdpblRvcCcpKSxcblx0XHRlbGVtZW50LndpZHRoKCksXG5cdFx0ZWxlbWVudC5oZWlnaHQoKSxcblx0XHRwYXJzZUludChlbGVtZW50LmNzcygnei1pbmRleCcpKSAvLyBUT0RPIHJvdGF0aW9uIG1heWJlXG5cdF0pO1xufVxuXG5mdW5jdGlvbiBtb2RFbGVtZW50UG9zaXRpb24ocGFnZUVsZW1lbnQsIG5ld1Bvcykge1xuXHRwYWdlRWxlbWVudC5jc3MoeyAnbWFyZ2luLWxlZnQnOiBuZXdQb3NbMF0gKyAncHgnIH0pO1xuXHRwYWdlRWxlbWVudC5jc3MoeyAnbWFyZ2luLXRvcCc6IG5ld1Bvc1sxXSArICdweCcgfSk7XG5cdHBhZ2VFbGVtZW50LndpZHRoKG5ld1Bvc1syXSk7XG5cdHBhZ2VFbGVtZW50LmhlaWdodChuZXdQb3NbM10pO1xuXHRwYWdlRWxlbWVudC5jc3MoeyAnei1pbmRleCc6IG5ld1Bvc1s0XSB9KTtcbn1cblxuLy8gLS0tIE0tVi1DXG5cbnZhciBQdWJsaWNhdGlvbiA9IHtcblx0Ly8gYWxsIG91ciBzdGF0ZXNcblx0aWQ6IG1ha2VJZCgpLFxuXHR0aXRsZTogJ1RFU1QgUFVCJyxcblx0dGltZUxlZnQ6IDkwMDAwMDAsXG5cdGV4cGlyZWQ6IGZhbHNlLFxuXHRlbGVtZW50czogW10sXG5cdGF1dGhvcnM6IFtdXG59O1xuXG5mdW5jdGlvbiBjb250cm9sbGVyKFB1YmxpY2F0aW9uLCBpbnB1dCkge1xuXHQvLyBleHBpcmVkP1xuXHRpZiAoUHVibGljYXRpb24udGltZUxlZnQgPiAwKSB7XG5cdFx0Ly8gZXhwaXJlZFxuXHRcdHNob3dUaW1lKFB1YmxpY2F0aW9uKTtcblx0fSBlbHNlIHtcblx0XHQvLyBub3QgZXhwaXJlZFxuXHRcdFB1YmxpY2F0aW9uLmV4cGlyZWQgPSB0cnVlO1xuXHRcdHNob3dFeHBpcmVkKFB1YmxpY2F0aW9uKTtcblx0XHRub0RyYWcoKTtcblx0XHRzaG93U2F2ZU1vZGFsKCk7XG5cdH1cblxuXHRpZiAoaW5wdXQgJiYgUHVibGljYXRpb24uZXhwaXJlZCA9PSBmYWxzZSkge1xuXHRcdGNvbnNvbGUubG9nKGlucHV0KVxuXHRcdHN3aXRjaCAodHJ1ZSkge1xuXHRcdFx0Y2FzZSBpbnB1dC52aXNpYmxlID09IGZhbHNlOiAvLyBkZWxldGluZyBhbiBlbGVtZW50XG5cdFx0XHRcdFx0cmVtb3ZlRWxlbWVudChpbnB1dC5pZClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5kYXRhICYmXG5cdFx0XHRcdGJ5dGVDb3VudChpbnB1dC5kYXRhKSA+IDEzOTgxMTcgOiAvLyBmaWxlIHRvbyBiaWcgKDFtYilcblx0XHRcdFx0IFx0RXJyb3IudG9vQmlnKClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5kYXRhICYmXG5cdFx0XHRcdGlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6aW1hZ2UnKSAmJlxuXHRcdFx0XHRpbnB1dC52aXNpYmxlID09IHRydWU6IC8vIG5ldyBpbWFnZVxuXHRcdFx0XHRcdC8vIHVwZGF0ZSB0aGUgUHVibGljYXRpb25cblx0XHRcdFx0XHRQdWJsaWNhdGlvbi5lbGVtZW50cy5wdXNoKGlucHV0KTtcblx0XHRcdFx0XHQvLyBkcm9wIGZpbGVcblx0XHRcdFx0XHRkcm9wRWxlbWVudChpbnB1dC5wYWdlLCBpbnB1dC5kYXRhLCBpbnB1dC5pZCk7XG5cdFx0XHRcdFx0Ly8gYWRkIGJvbnVzIHRpbWVcblx0XHRcdFx0XHRhZGR0aW1lKDEwMDApXG5cdFx0XHRcdFx0Ly8gY3JpdGljIHNwZWFrXG5cdFx0XHRcdFx0Ly8gY3JpdGljKCk7XG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuZGF0YSAmJlxuXHRcdFx0XHRpbnB1dC5kYXRhLmluY2x1ZGVzKCdkYXRhOnRleHQvcGxhaW4nKSAmJlxuXHRcdFx0XHRpbnB1dC52aXNpYmxlID09IHRydWU6IC8vIG5ldyB0ZXh0XG5cdFx0XHRcdFx0Ly8gdXBkYXRlIHRoZSBQdWJsaWNhdGlvblxuXHRcdFx0XHRcdFB1YmxpY2F0aW9uLmVsZW1lbnRzLnB1c2goaW5wdXQpO1xuXHRcdFx0XHRcdC8vIGRyb3AgZmlsZVxuXHRcdFx0XHRcdGRyb3BFbGVtZW50KGlucHV0LnBhZ2UsIGlucHV0LmRhdGEsIGlucHV0LmlkKVxuXHRcdFx0XHRcdGFkZHRpbWUoMTAwMClcblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5kYXRhICYmXG5cdFx0XHRcdCFpbnB1dC5kYXRhLmluY2x1ZGVzKCdkYXRhOmltYWdlJykgJiZcblx0XHRcdFx0IWlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6dGV4dC9wbGFpbicpOiAvLyBuZWl0aGVyIGFuIGltYWdlIG5vciB0ZXh0XG5cdFx0XHRcdFx0RXJyb3Iubm90QWxsb3dlZCgpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQubW92ZSA9PSB0cnVlIDogLy8gbW92aW5nIG9yIHNjYWxpbmcgYW4gaW1hZ2Vcblx0XHRcdFx0XHR2YXIgbW92aW5nRWxlbWVudDtcblx0XHRcdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IFB1YmxpY2F0aW9uLmVsZW1lbnRzLmxlbmd0aDsgaSArPSAxKSB7XG5cdFx0XHRcdFx0XHQvLyBmaW5kIGVsZW1lbnQgYnkgaWRcblx0XHRcdFx0XHRcdGlmIChQdWJsaWNhdGlvbi5lbGVtZW50c1tpXS5pZCA9PSBpbnB1dC5pZCkge1xuXHRcdFx0XHRcdFx0XHRtb3ZpbmdFbGVtZW50ID0gUHVibGljYXRpb24uZWxlbWVudHNbaV07IC8vIHJlYWQgcG9zIGFuZCBhZGQgaXQgdG8gUHVibGljYXRpb25cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0bW92aW5nRWxlbWVudC5wb3MgPSBpbnB1dC5wb3M7XG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuaGFzT3duUHJvcGVydHkoJ3RpdGxlJykgOiAvLyBjaGFuZ2luZyB0aXRsZVxuXHRcdFx0XHRcdFB1YmxpY2F0aW9uLnRpdGxlID0gaW5wdXQudGl0bGU7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKGlucHV0ICYmIFB1YmxpY2F0aW9uLmV4cGlyZWQgPT0gdHJ1ZSkge1xuXHRcdC8vIHRvbyBsYXRlXG5cdFx0RXJyb3IudG9vTGF0ZSgpO1xuXHR9XG59XG5cbi8vIC0tLSBDT05UUk9MTEVSXG5cbnZhciB4O1xuJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24oKSB7XG5cdGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCdzYXZlZCcpIDwgMCkge1xuXHRcdC8vIGlmIG5vdCBhIHNhdmVkIHB1YmxpY2F0aW9uXG5cdFx0aWYgKCBnZXRVcmxQYXJhbWV0ZXIoJ3RpbWUnKSApIHsgLy8gZGlmZmljdWx0eVxuXHRcdFx0UHVibGljYXRpb24udGltZUxlZnQgPSBnZXRVcmxQYXJhbWV0ZXIoJ3RpbWUnKTtcblx0XHR9XG5cdFx0eCA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdFx0UHVibGljYXRpb24udGltZUxlZnQgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCAtIDEwO1xuXHRcdFx0Y29udHJvbGxlcihQdWJsaWNhdGlvbik7XG5cdFx0fSwgMTApO1xuXG5cdFx0bW91c2VDb3VudGVyKCk7XG5cdH0gZWxzZSB7XG5cdFx0cmVuZGVyUHVibGljYXRpb24oUHVibGljYXRpb24pO1xuXHRcdG5vRHJhZygpO1xuXHRcdHBkZkRvd25sb2FkKCk7XG5cdFx0JCgnYm9keScpLmFkZENsYXNzKCdzYXZlZCcpO1xuXHR9XG59KTtcblxuZnVuY3Rpb24gYWRkdGltZShib251c1RpbWUpIHtcblx0UHVibGljYXRpb24udGltZUxlZnQgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCArIGJvbnVzVGltZTtcblx0YW5pbWF0ZXRpbWVjb3VudGVyKGJvbnVzVGltZSk7XG59XG5cbi8vIGRyb3BGaWxlXG5cbnBhZ2VzLm9uKCdkcmFnb3ZlcicsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHQkKHRoaXMpLmFkZENsYXNzKCdkcmFnb3ZlcicpO1xufSk7XG5wYWdlcy5vbignZHJhZ2xlYXZlJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdCQodGhpcykucmVtb3ZlQ2xhc3MoJ2RyYWdvdmVyJyk7XG59KTtcbnBhZ2VzLm9uKCdkcm9wJywgZnVuY3Rpb24oZSkge1xuXHQkKHRoaXMpLnJlbW92ZUNsYXNzKCdkcmFnb3ZlcicpO1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdGNvbnNvbGUubG9nKGUpO1xuXHR2YXIgZmlsZXMgPSBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmZpbGVzO1xuXHR2YXIgeSA9IDA7XG5cdGZvciAodmFyIGkgPSBmaWxlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuXHRcdHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG5cdFx0dmFyIHBhZ2VJZCA9ICQodGhpcykuYXR0cignaWQnKTtcblx0XHRyZWFkZXIub25sb2FkID0gZnVuY3Rpb24oZXZlbnQpIHtcblx0XHRcdGNvbnNvbGUubG9nKGV2ZW50LnRhcmdldCk7XG5cdFx0XHQvLyBpZCwgZGF0YSwgW3BvcyB4LCBwb3MgeSwgd2lkdGgsIGhlaWdodCwgei1pbmRleCwgKHJvdGF0aW9uPyldLCB2aXNpYmxlLCBwYWdlXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7XG5cdFx0XHRcdFx0aWQ6IG1ha2VJZCgpLFxuXHRcdFx0XHRcdGRhdGE6IGV2ZW50LnRhcmdldC5yZXN1bHQsXG5cdFx0XHRcdFx0cG9zOiBbMCwgMCwgMCwgMCwgMF0sXG5cdFx0XHRcdFx0dmlzaWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRwYWdlOiBwYWdlSWRcblx0XHRcdFx0fSk7XG5cdFx0XHR9LCB5ICogZHJvcERlbGF5KTtcblx0XHRcdHkgKz0gMTtcblx0XHR9O1xuXHRcdGNvbnNvbGUubG9nKGZpbGVzW2ldKTtcblx0XHRyZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlc1tpXSk7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufSk7XG4vLyBwcmV2ZW50IGRyb3Agb24gYm9keVxuJCgnYm9keScpLm9uKCdkcmFnb3ZlcicsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG4kKCdib2R5Jykub24oJ2RyYWdsZWF2ZScsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG4kKCdib2R5Jykub24oJ2Ryb3AnLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcblx0U291bmQuZXJyb3IoKTtcbn0pO1xuXG4vLyByZW1vdmUgZWxlbWVudFxuJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy5jbG9zZScsIGZ1bmN0aW9uKCkge1xuXHR2YXIgcGFnZUlkID0gJCh0aGlzKVxuXHRcdC5jbG9zZXN0KCcucGFnZScpXG5cdFx0LmF0dHIoJ2lkJyk7XG5cdHZhciBlbGVtZW50SWQgPSAkKHRoaXMpXG5cdFx0LnBhcmVudCgpXG5cdFx0LmF0dHIoJ2lkJyk7XG5cdHZhciBlbGVtZW50RGF0YSA9ICQodGhpcylcblx0XHQuc2libGluZ3MoKVxuXHRcdC5hdHRyKCdzcmMnKTtcblx0Y29udHJvbGxlcihQdWJsaWNhdGlvbiwge1xuXHRcdGlkOiBlbGVtZW50SWQsXG5cdFx0ZGF0YTogZWxlbWVudERhdGEsXG5cdFx0cG9zOiBbMCwgMCwgMCwgMCwgMF0sXG5cdFx0dmlzaWJsZTogZmFsc2UsXG5cdFx0cGFnZTogcGFnZUlkXG5cdH0pO1xufSk7XG5cbi8vIGNoYW5naW5nIHRpdGxlXG4kKCcjdGl0bGUnKS5jaGFuZ2UoZnVuY3Rpb24oKSB7XG5cdGNvbnRyb2xsZXIoUHVibGljYXRpb24sIHtcblx0XHR0aXRsZTogJCh0aGlzKS52YWwoKVxuXHR9KTtcbn0pXG5cbi8vIC0tLSBWSUVXXG5cbnZhciBTb3VuZCA9IHtcblx0ZXJyb3I6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBhdWRpbyA9IG5ldyBBdWRpbygnYXNzZXRzL2F1ZGlvL2luY29ycmVjdC5tcDMnKTtcblx0XHRhdWRpby5wbGF5KCk7XG5cdH0sXG5cdGRpbmc6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBhdWRpbyA9IG5ldyBBdWRpbygnYXNzZXRzL2F1ZGlvL2RpbmcubXAzJyk7XG5cdFx0YXVkaW8ucGxheSgpO1xuXHR9XG59O1xuXG4vLyBtZXJnZSB0aGVzZSB0d29cbmZ1bmN0aW9uIHNob3dUaW1lKFB1YmxpY2F0aW9uKSB7XG5cdHNlY29uZHMgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCAvIDEwMDA7XG5cdCQoJyNjb3VudGVyJykuc2hvdygpO1xuXHRkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY291bnRlcicpLmlubmVySFRNTCA9XG5cdFx0c2Vjb25kcy50b0ZpeGVkKDIpICsgJyBzZWNvbmRzIGxlZnQhJztcbn1cbmZ1bmN0aW9uIG1vdXNlQ291bnRlcigpIHtcblx0JChkb2N1bWVudCkuYmluZCgnbW91c2Vtb3ZlJywgZnVuY3Rpb24oZSkge1xuXHRcdGlmIChlLnBhZ2VYID49ICQoZG9jdW1lbnQpLndpZHRoKCkgLyAyKSB7XG5cdFx0XHQvLyBpZiBtb3VzZSBvZiByaWdodCBzaWRlIG9mIHBhZ2Vcblx0XHRcdCQoJyNjb3VudGVyJykuYWRkQ2xhc3MoJ21vdXNlX3JpZ2h0Jyk7XG5cdFx0XHQkKCcjY291bnRlcicpLmNzcyh7XG5cdFx0XHRcdGxlZnQ6IGUucGFnZVggLSAyMCAtICQoJyNjb3VudGVyJykud2lkdGgoKSxcblx0XHRcdFx0dG9wOiBlLnBhZ2VZICsgNTBcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBpZiBtb3VzZSBvZiBsZWZ0IHNpZGUgb2YgcGFnZVxuXHRcdFx0JCgnI2NvdW50ZXInKS5yZW1vdmVDbGFzcygnbW91c2VfcmlnaHQnKTtcblx0XHRcdCQoJyNjb3VudGVyJykuY3NzKHtcblx0XHRcdFx0bGVmdDogZS5wYWdlWCArIDIwLFxuXHRcdFx0XHR0b3A6IGUucGFnZVkgKyA1MFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gc2hvd0V4cGlyZWQoKSB7XG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudGVyJykuaW5uZXJIVE1MID0gJ2V4cGlyZWQhJztcblx0JCgnYm9keScpLmFkZENsYXNzKCdleHBpcmVkJyk7XG5cdC8vc2V0VGltZW91dChmdW5jdGlvbigpe1xuXHQvLyAgd2luZG93LnByaW50KCk7XG5cdC8vfSwgMTAwMCk7XG5cdGNsZWFySW50ZXJ2YWwoeCk7XG59XG5cblxuZnVuY3Rpb24gZHJvcEVsZW1lbnQocGFnZUlkLCBkYXRhLCBpZCkge1xuXHR2YXIgZWxlbWVudCA9IHsgaWQ6IGlkLCBkYXRhOiBkYXRhLCBwYWdlOiBwYWdlSWQgfTtcblx0dmFyIGVsZW1lbnRQb3MgPSBjcmVhdGVFbGVtZW50KGVsZW1lbnQpO1xuXHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdC8vIHRpbWVvdXQgdG8gZ2V0IHRoZSBhY3R1YWwgaGVpZ2h0IDooXG5cdFx0ZWxlbWVudFBvc1szXSA9ICQoJyMnICsgaWQpLmhlaWdodCgpO1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgUHVibGljYXRpb24uZWxlbWVudHMubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdC8vIGZpbmQgZWxlbWVudCBieSBpZFxuXHRcdFx0aWYgKFB1YmxpY2F0aW9uLmVsZW1lbnRzW2ldLmlkID09IGlkKSB7XG5cdFx0XHRcdFB1YmxpY2F0aW9uLmVsZW1lbnRzW2ldLnBvcyA9IGVsZW1lbnRQb3M7IC8vIHJlYWQgcG9zIGFuZCBhZGQgaXQgdG8gUHVibGljYXRpb25cblx0XHRcdH1cblx0XHR9XG5cdFx0U291bmQuZGluZygpO1xuXHR9LCAxKTtcbn1cblxuLy8gZXJyb3JzXG5cbnZhciBFcnJvciA9IHtcblx0bm90QWxsb3dlZDogZnVuY3Rpb24oKSB7XG5cdFx0U291bmQuZXJyb3IoKVxuXHRcdGFsZXJ0KCdUaGUgZmlsZSB5b3UgZHJvcHBlZCBpcyBub3QgYWxsb3dlZCEnKVxuXHR9LFxuXHR0b29CaWc6IGZ1bmN0aW9uKCkge1xuXHRcdFNvdW5kLmVycm9yKCk7XG5cdFx0YWxlcnQoJ1RoZSBmaWxlIHlvdSBkcm9wcGVkIGlzIHRvbyBiaWchJyk7IFxuXHR9LFxuXHR0b29MYXRlOiBmdW5jdGlvbigpIHtcblx0XHRTb3VuZC5lcnJvcigpO1xuXHRcdFx0YWxlcnQoJ3RvbyBsYXRlIGJybycpOyBcblx0fVxufTtcblxuXG5mdW5jdGlvbiBub0RyYWcoKSB7XG5cdHZhciBlbGVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5kcmFnZ2FibGUnKTtcblx0W10uZm9yRWFjaC5jYWxsKGVsZW1zLCBmdW5jdGlvbihlbCkge1xuXHRcdGVsLmNsYXNzTGlzdC5yZW1vdmUoJ2RyYWdnYWJsZScpO1xuXHR9KTtcbn1cblxuZnVuY3Rpb24gY3JpdGljKCkge1xuXHRjcml0aWNQb3B1cC5pbm5lckhUTUwgPSAnTWFrZSB0aGlzIGltYWdlIGJpZ2dlciBwbHMhJztcbn1cblxuZnVuY3Rpb24gcmVtb3ZlRWxlbWVudChpZCkge1xuXHQkKCcjJyArIGlkKS5oaWRlKCk7XG5cdGNvbnNvbGUubG9nKGlkKTtcbn1cblxuaW50ZXJhY3QoJy5kcmFnZ2FibGUnKVxuXHQuZHJhZ2dhYmxlKHtcblx0XHRvbm1vdmU6IHdpbmRvdy5kcmFnTW92ZUxpc3RlbmVyLFxuXHRcdHJlc3RyaWN0OiB7XG5cdFx0XHRyZXN0cmljdGlvbjogJ3BhcmVudCcsXG5cdFx0XHRlbGVtZW50UmVjdDoge1xuXHRcdFx0XHR0b3A6IDAsXG5cdFx0XHRcdGxlZnQ6IDAsXG5cdFx0XHRcdGJvdHRvbTogMSxcblx0XHRcdFx0cmlnaHQ6IDFcblx0XHRcdH1cblx0XHR9XG5cdH0pXG5cdC5yZXNpemFibGUoe1xuXHRcdC8vIHJlc2l6ZSBmcm9tIGFsbCBlZGdlcyBhbmQgY29ybmVyc1xuXHRcdGVkZ2VzOiB7XG5cdFx0XHRsZWZ0OiB0cnVlLFxuXHRcdFx0cmlnaHQ6IHRydWUsXG5cdFx0XHRib3R0b206IHRydWUsXG5cdFx0XHR0b3A6IHRydWVcblx0XHR9LFxuXG5cdFx0Ly8ga2VlcCB0aGUgZWRnZXMgaW5zaWRlIHRoZSBwYXJlbnRcblx0XHRyZXN0cmljdEVkZ2VzOiB7XG5cdFx0XHRvdXRlcjogJ3BhcmVudCcsXG5cdFx0XHRlbmRPbmx5OiB0cnVlXG5cdFx0fSxcblxuXHRcdGluZXJ0aWE6IHRydWVcblx0fSlcblx0Lm9uKCdyZXNpemVtb3ZlJywgZnVuY3Rpb24oZXZlbnQpIHtcblx0XHR2YXIgdGFyZ2V0ID0gZXZlbnQudGFyZ2V0LFxuXHRcdFx0eCA9IHBhcnNlRmxvYXQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS14JykpIHx8IDAsXG5cdFx0XHR5ID0gcGFyc2VGbG9hdCh0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXknKSkgfHwgMDtcblxuXHRcdC8vIHVwZGF0ZSB0aGUgZWxlbWVudCdzIHN0eWxlXG5cdFx0dGFyZ2V0LnN0eWxlLndpZHRoID0gZXZlbnQucmVjdC53aWR0aCArICdweCc7XG5cdFx0dGFyZ2V0LnN0eWxlLmhlaWdodCA9IGV2ZW50LnJlY3QuaGVpZ2h0ICsgJ3B4JztcblxuXHRcdC8vIHRyYW5zbGF0ZSB3aGVuIHJlc2l6aW5nIGZyb20gdG9wIG9yIGxlZnQgZWRnZXNcblx0XHR4ICs9IGV2ZW50LmRlbHRhUmVjdC5sZWZ0O1xuXHRcdHkgKz0gZXZlbnQuZGVsdGFSZWN0LnRvcDtcblxuXHRcdHRhcmdldC5zdHlsZS5tYXJnaW5MZWZ0ID0geCArICdweCc7XG5cdFx0dGFyZ2V0LnN0eWxlLm1hcmdpblRvcCA9IHkgKyAncHgnO1xuXG5cdFx0dGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS14JywgeCk7XG5cdFx0dGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS15JywgeSk7XG5cblx0XHR2YXIgcGFnZUVsZW1lbnRQb3MgPSBnZXRFbGVtZW50UG9zaXRpb24oJCgnIycgKyB0YXJnZXQuaWQpKTtcblx0XHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7IGlkOiB0YXJnZXQuaWQsIHBvczogcGFnZUVsZW1lbnRQb3MsIG1vdmU6IHRydWUgfSk7IC8vIHNlbmRpbmcgZWxlbWVudCBpZCBhbmQgcG9zaXRpb25cblx0fSk7XG5cbmZ1bmN0aW9uIGRyYWdNb3ZlTGlzdGVuZXIoZXZlbnQpIHtcblx0dmFyIHRhcmdldCA9IGV2ZW50LnRhcmdldCxcblx0XHQvLyBrZWVwIHRoZSBkcmFnZ2VkIHBvc2l0aW9uIGluIHRoZSBkYXRhLXgvZGF0YS15IGF0dHJpYnV0ZXNcblx0XHR4ID0gKHBhcnNlRmxvYXQodGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS14JykpIHx8IDApICsgZXZlbnQuZHgsXG5cdFx0eSA9IChwYXJzZUZsb2F0KHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEteScpKSB8fCAwKSArIGV2ZW50LmR5O1xuXG5cdC8vIHRyYW5zbGF0ZSB0aGUgZWxlbWVudFxuXHR0YXJnZXQuc3R5bGUubWFyZ2luTGVmdCA9IHggKyAncHgnO1xuXHR0YXJnZXQuc3R5bGUubWFyZ2luVG9wID0geSArICdweCc7XG5cblx0Ly8gdXBkYXRlIHRoZSBwb3NpaW9uIGF0dHJpYnV0ZXNcblx0dGFyZ2V0LnNldEF0dHJpYnV0ZSgnZGF0YS14JywgeCk7XG5cdHRhcmdldC5zZXRBdHRyaWJ1dGUoJ2RhdGEteScsIHkpO1xuXG5cdC8vIHVwZGF0ZSB6LWluZGV4XG5cdHZhciBtYXh6SW5kZXggPSAwLFxuXHRcdGkgPSAwO1xuXHRwYWdlRWxlbWVudHMgPSAkKCcjJyArIHRhcmdldC5pZClcblx0XHQucGFyZW50KClcblx0XHQuY2hpbGRyZW4oKTtcblx0cGFnZUVsZW1lbnRzLmVhY2goZnVuY3Rpb24oKSB7XG5cdFx0aSArPSAxO1xuXHRcdGlmICgkKHRoaXMpLmNzcygnei1pbmRleCcpID49IG1heHpJbmRleCkge1xuXHRcdFx0bWF4ekluZGV4ID0gcGFyc2VJbnQoJCh0aGlzKS5jc3MoJ3otaW5kZXgnKSk7XG5cdFx0fVxuXHRcdGlmIChpID09IHBhZ2VFbGVtZW50cy5sZW5ndGgpIHtcblx0XHRcdGlmICgodGFyZ2V0LnN0eWxlLnpJbmRleCAhPSBtYXh6SW5kZXgpIHwgKHRhcmdldC5zdHlsZS56SW5kZXggPT0gMCkpIHtcblx0XHRcdFx0dGFyZ2V0LnN0eWxlLnpJbmRleCA9IG1heHpJbmRleCArIDE7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblx0Ly8gdGFyZ2V0LnN0eWxlLnpJbmRleCA9IG1heHpJbmRleCArIDE7XG5cblx0dmFyIHBhZ2VFbGVtZW50UG9zID0gZ2V0RWxlbWVudFBvc2l0aW9uKCQoJyMnICsgdGFyZ2V0LmlkKSk7XG5cdGNvbnRyb2xsZXIoUHVibGljYXRpb24sIHsgaWQ6IHRhcmdldC5pZCwgcG9zOiBwYWdlRWxlbWVudFBvcywgbW92ZTogdHJ1ZSB9KTsgLy8gc2VuZGluZyBlbGVtZW50IGlkIGFuZCBwb3NpdGlvblxufVxuXG4vLyB0aGlzIGlzIHVzZWQgbGF0ZXIgaW4gdGhlIHJlc2l6aW5nIGFuZCBnZXN0dXJlIGRlbW9zXG53aW5kb3cuZHJhZ01vdmVMaXN0ZW5lciA9IGRyYWdNb3ZlTGlzdGVuZXI7XG5cbi8vIHNob3cgc2F2ZSBtb2RhbFxuXG5mdW5jdGlvbiBzaG93U2F2ZU1vZGFsKCkge1xuXHQkKCcjc2F2ZS1tb2RhbCcpLnNob3coKTtcblx0JCgnI3NhdmUnKS5jbGljayhmdW5jdGlvbigpIHtcblx0XHRzYXZldG9EYihQdWJsaWNhdGlvbik7XG5cdFx0bWFrZVBkZihQdWJsaWNhdGlvbi5pZCk7XG5cdFx0Z2VuUGRmKFB1YmxpY2F0aW9uLmlkKTtcblx0XHRjaGVja1BkZihQdWJsaWNhdGlvbi5pZCk7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBnZW5QZGYoaWQpIHtcblx0JCgnI3NhdmUtbW9kYWwnKS5zaG93KCk7XG5cdCQoJyNzYXZlLW1vZGFsJykuaHRtbCgnJyk7XG5cdHZhciB5ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG5cdFx0aWYgKHBkZlJlYWR5ID09IHRydWUpIHtcblx0XHRcdCQoJyNzYXZlLW1vZGFsJykuaHRtbChcblx0XHRcdFx0J0Rvd25sb2FkIHlvdXIgcGRmIDxhIGhyZWY9XCJhc3NldHMvcGRmLycgK1xuXHRcdFx0XHRcdGlkICtcblx0XHRcdFx0XHQnLycgK1xuXHRcdFx0XHRcdGlkICtcblx0XHRcdFx0XHQnLnBkZj9kb3dubG9hZD10cnVlXCIgdGFyZ2V0PVwiX2JsYW5rXCI+aGVyZTwvYT4nXG5cdFx0XHQpO1xuXHRcdFx0Y2xlYXJJbnRlcnZhbCh5KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JCgnI3NhdmUtbW9kYWwnKS50ZXh0KCdZb3VyIFBERiBpcyBiZWluZyBnZW5lcmF0ZWQnKTtcblx0XHR9XG5cdH0sIDEwMCk7XG59XG5cbi8vIC0tLSBTQVZFRFxuXG5mdW5jdGlvbiByZW5kZXJQdWJsaWNhdGlvbihQdWJsaWNhdGlvbikge1xuXHQkKCcjdGl0bGUnKS52YWwoUHVibGljYXRpb24udGl0bGUpLmF0dHIoXCJkaXNhYmxlZFwiLFwiZGlzYWJsZWRcIik7XG5cdHZhciBpO1xuXHRmb3IgKGkgPSAwOyBpIDwgUHVibGljYXRpb24uZWxlbWVudHMubGVuZ3RoOyArK2kpIHtcblx0XHRpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZigncHJpbnQ9dHJ1ZScpID4gMCkgeyAvLyBwcmludCBwdWJcblx0XHRcdGNyZWF0ZUVsZW1lbnRDYW52YXMoUHVibGljYXRpb24uZWxlbWVudHNbaV0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjcmVhdGVFbGVtZW50KFB1YmxpY2F0aW9uLmVsZW1lbnRzW2ldKTsgLy8gc2F2ZWQgcHViXG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIHBkZkRvd25sb2FkKCkge1xuXHQkKCcjcGRmLWRvd25sb2FkJykuc2hvdygpO1xuXHQkKCcjcGRmLWRvd25sb2FkJykuY2xpY2soZnVuY3Rpb24oKSB7XG5cdFx0bWFrZVBkZihQdWJsaWNhdGlvbi5pZCk7XG5cdFx0Z2VuUGRmKFB1YmxpY2F0aW9uLmlkKTtcblx0XHRjaGVja1BkZihQdWJsaWNhdGlvbi5pZCk7XG5cdH0pO1xufVxuXG4vLyAtLS0gQkFDS0VORFxuXG4vLyBzZW5kIGNhbGwgdG8gc2VydmVyIHRvIG1ha2UgcGRmXG5mdW5jdGlvbiBtYWtlUGRmKGlkKSB7XG5cdCQuZ2V0KCcvcGRmP2lkPScgKyBpZCwgZnVuY3Rpb24oZGF0YSkge1xuXHRcdGNvbnNvbGUubG9nKCdTZW50IGNhbGwgdG8gbWFrZSBQREYuJyk7XG5cdH0pO1xufVxuXG4vLyBjaGVjayBpZiBwZGYgZXhpc3RzIGFuZCByZWRpcmVjdCB0byBmaWxlXG5mdW5jdGlvbiBjaGVja1BkZihpZCkge1xuXHR2YXIgeSA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkge1xuXHRcdCQuYWpheCh7XG5cdFx0XHR0eXBlOiAnSEVBRCcsXG5cdFx0XHR1cmw6ICdhc3NldHMvcGRmLycgKyBpZCArICcvJyArIGlkICsgJy5wZGYnLFxuXHRcdFx0c3VjY2VzczogZnVuY3Rpb24obXNnKSB7XG5cdFx0XHRcdGNsZWFySW50ZXJ2YWwoeSk7XG5cdFx0XHRcdHBkZlJlYWR5ID0gdHJ1ZTtcblx0XHRcdH0sXG5cdFx0XHRlcnJvcjogZnVuY3Rpb24oanFYSFIsIHRleHRTdGF0dXMsIGVycm9yKSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGpxWEhSKTtcblx0XHRcdFx0Y29uc29sZS5sb2coZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LCAxMDApO1xufVxuXG5mdW5jdGlvbiBzYXZldG9EYihwdWJsaWNhdGlvbikge1xuXHQkLmFqYXgoe1xuXHRcdHVybDogJy9kYicsXG5cdFx0dHlwZTogJ3Bvc3QnLCAvLyBwZXJmb3JtaW5nIGEgUE9TVCByZXF1ZXN0XG5cdFx0ZGF0YTogcHVibGljYXRpb24sXG5cdFx0ZGF0YVR5cGU6ICdqc29uJyxcblx0XHRzdWNjZXNzOiBmdW5jdGlvbihwdWJsaWNhdGlvbikge1xuXHRcdFx0Y29uc29sZS5sb2coJ3B1YmxpY2F0aW9uIHNlbnQgdG8gZGF0YWJhc2UuJyk7XG5cdFx0fVxuXHR9KTtcbn0iLCIvLyAjY291bnRlciBmb2xsb3dzIHRoZSBtb3VzZVxuZnVuY3Rpb24gdXBkYXRlTW91c2VDb3VudGVyKGUpIHtcbiAgaWYgKGUuY2xpZW50WCA+PSAyMDApIHsgLy8gKCQoZG9jdW1lbnQpLndpZHRoKCkvMilcbiAgICAvLyBpZiBtb3VzZSBvZiByaWdodCBzaWRlIG9mIGNsaWVudFxuICAgICQoJy5jb3VudGVyJykuYWRkQ2xhc3MoJ21vdXNlX3JpZ2h0Jyk7XG4gICAgJCgnLmNvdW50ZXInKS5jc3Moe1xuICAgICAgbGVmdDogIGUuY2xpZW50WCAtIDIwIC0gJCgnLmNvdW50ZXInKS53aWR0aCgpLFxuICAgICAgdG9wOiAgIGUuY2xpZW50WSAtIDUwXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgLy8gaWYgbW91c2Ugb2YgbGVmdCBzaWRlIG9mIGNsaWVudFxuICAgICQoJy5jb3VudGVyJykucmVtb3ZlQ2xhc3MoJ21vdXNlX3JpZ2h0Jyk7XG4gICAgJCgnLmNvdW50ZXInKS5jc3Moe1xuICAgICAgbGVmdDogIGUuY2xpZW50WCArIDIwLFxuICAgICAgdG9wOiAgIGUuY2xpZW50WSAtIDUwXG4gICAgfSk7XG4gIH1cbn1cblxuJChkb2N1bWVudCkuYmluZCgnbW91c2Vtb3ZlJywgZnVuY3Rpb24oZSl7XG4gIHVwZGF0ZU1vdXNlQ291bnRlcihlKTtcbn0pO1xuXG4kKGRvY3VtZW50KS5iaW5kKFwiZHJhZ292ZXJcIiwgZnVuY3Rpb24oZSl7XG4gICAgdXBkYXRlTW91c2VDb3VudGVyKGUpO1xufSk7XG4iXX0=
