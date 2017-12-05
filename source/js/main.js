// --- global variables

var pages = $('.page');
var criticPopup = $('#critic');
var dropDelay = 100;

// --- GENERAL FUNCTIONS

function makeId() {
	var randLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
	var id = randLetter + Date.now();
	return id; 
}

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

// --- M-V-C

var Model = {
	// all our states
	timeLeft: 100000,
	expired: false,
	images: []
};

function controller(Model, page, input) {

	// expired?
	if (Model.timeLeft > 0) {
		showTime(Model);
	}
	else {
		Model.expired = true;
		showExpired(Model);
		noDrag();
	}
  
	if ( input && input[1].includes("data:image") && input[3] == true && Model.expired == false) { // new element
		// update the Model
		Model.images.push(input);
		// drop file
		dropFile(page, input[1], input[0]);
		// add bonus time
		addtime(10000);
		// critic speak
		critic();
	} else if ( input && !input[1].includes("data:image") && Model.expired == false) { // not an image
		notAnImage();
	} else if (input && input[3] == false && Model.expired == false) { // deleting an element
		removeElement(input[0]);
	} else if (input && Model.expired == true) { // too late
		LateDropFile();
	}
}


// --- CONTROLLER

var x = setInterval(function() {
	Model.timeLeft = Model.timeLeft - 10;
	controller(Model);
}, 10);

function addtime(bonusTime) {
	Model.timeLeft = Model.timeLeft + bonusTime;
}

// dropFile

pages.on("dragover", function(e) {
	e.preventDefault();
  $(this).addClass('dragover');
});
pages.on("dragleave", function(e) {
	e.preventDefault();
  $(this).removeClass('dragover');
});
pages.on("drop", function(e) {
  $(this).removeClass('dragover');
  e.preventDefault();
  console.log(e);
  var files = e.originalEvent.dataTransfer.files
  var y = 0;
  for (var i = files.length - 1; i >= 0; i--) {
	  reader = new FileReader();
	  var pageId = $(this).attr('id');
	  reader.onload = function (event) {
	    console.log(event.target);
	    // id, url, size, pos, rotation?, visible
	    setTimeout(function(){
	    	controller(Model, pageId, [makeId(), event.target.result, [0,0,0,0,0], true] );
	  	}, y * dropDelay);
	  	y += 1;
	  };
	  console.log(files[i]);
	  reader.readAsDataURL(files[i]);
  }
	return false;
});
// prevent drop on body
$('body').on("dragover", function(e) {
	e.preventDefault();
});
$('body').on("dragleave", function(e) {
	e.preventDefault();
});
$('body').on("drop", function(e) {
  e.preventDefault();
  Sound.error();
});

// remove element
$(document).on('click', '.close', function () {
	var pageId = $(this).closest('.page').attr('id');
	var elementId = $(this).parent().attr('id');
	var elementSrc = $(this).siblings().attr('src');
	controller(Model, pageId, [elementId, elementSrc, [0,0,0,0,0], false]);
});

// --- VIEW

function showTime(Model) {
	seconds = Model.timeLeft / 1000;
	document.getElementById("counter").innerHTML = seconds.toFixed(2) + " seconds left!";
}

function showExpired() {
	document.getElementById("counter").innerHTML = "expired!";
	$('body').addClass('expired');
	setTimeout(function(){ 
		window.print(); 
	}, 1000);
	clearInterval(x);
}

function notAnImage() {
	Sound.error();
	alert('The file you dropped is not an image!');
}

function dropFile(pageId, src, id) {
	var pageElement = $("<div>", {"class": "page-element draggable"});
	var pageElementContent = $("<img>", {"src": src});
	var pageElementClose = $("<span>", {"class": "close"}).text('x');
	pageElement.append(pageElementContent, pageElementClose);
	pageElement.attr('id', id);
	$('#' + pageId).append(pageElement);
	// read size, pos, rot and add them to Model
	elementPos = [
		pageElement.position().left,
		pageElement.position().top,
		pageElement.width(),
		pageElement.height(),
		0 // rotation (TODO)
	];
	for(var i = 0 ; i < Model.images.length; i += 1) {
		if (Model.images[i][0] == id) {
			Model.images[i][2] = elementPos;
		}
	}
	Sound.ding();
}

function LateDropFile(src) {
	alert('too late bro');
}

function noDrag() {
	var elems = document.querySelectorAll(".draggable");
  	[].forEach.call(elems, function(el) {
    	el.classList.remove("draggable");
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
		},
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
			endOnly: true,
		},

		inertia: true,
	})
	.on('resizemove', function(event) {
		var target = event.target,
			x = (parseFloat(target.getAttribute('data-x')) || 0),
			y = (parseFloat(target.getAttribute('data-y')) || 0);

		// update the element's style
		target.style.width = event.rect.width + 'px';
		target.style.height = event.rect.height + 'px';

		// translate when resizing from top or left edges
		x += event.deltaRect.left;
		y += event.deltaRect.top;

		target.style.webkitTransform = target.style.transform =
			'translate(' + x + 'px,' + y + 'px)';

		target.setAttribute('data-x', x);
		target.setAttribute('data-y', y);
	});

function dragMoveListener(event) {
	var target = event.target,
		// keep the dragged position in the data-x/data-y attributes
		x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
		y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

	// translate the element
	target.style.webkitTransform =
		target.style.transform =
		'translate(' + x + 'px, ' + y + 'px)';

	// update the posiion attributes
	target.setAttribute('data-x', x);
	target.setAttribute('data-y', y);

	// update z-index
	var maxzIndex = 0,
		i = 0;
	pageElements = $('#' + target.id).parent().children();
	pageElements.each(function () {
		i += 1;
		if ( $(this).css("z-index") >= maxzIndex ) {
			maxzIndex = parseInt($(this).css("z-index"));
		}
		if(i == pageElements.length) {
			if (target.style.zIndex != maxzIndex | target.style.zIndex == 0) {
    		target.style.zIndex = maxzIndex + 1;
    	}
  	}
	});
	// target.style.zIndex = maxzIndex + 1;
}

// this is used later in the resizing and gesture demos
window.dragMoveListener = dragMoveListener;


// // make pdf
// var element = document.getElementById('p1');
// $('#p1').click(function(){
// 	html2pdf(element, {
// 	  margin:       1,
// 	  filename:     'myfile.pdf',
// 	  image:        { type: 'jpeg', quality: 0.98 },
// 	  html2canvas:  { dpi: 72, letterRendering: true, height: 2970, width: 5100 },
// 	  jsPDF:        { unit: 'mm', format: 'A4', orientation: 'portrait' }
// 	});
// });
