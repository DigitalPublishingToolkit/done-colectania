// --- DEFAULTS

var disruptionsOn = true
var dropDelay = 100
var disruptionInterval = 5000
var bonusTime = 1000
var textChunksLength = 1500
var fontSize = 15
var scaleFont = 1.5
var scaleImgs = 0.7
var achievementSpan = 3




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
}

function shuffleArray(array) {
  for (var i = array.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var temp = array[i];
    array[i] = array[j];
    array[j] = temp;
  }
}

function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var time = date + ' ' + month + ' ' + year;
  return time;
}




function createElement(element, mousePos, callback) {
  function chunkString(str, length) {
    return str.match(new RegExp('{.1,' + length + '}', 'g'));
  }
	var theMousePos = mousePos
	if (element.data.includes('data:image')) {
		fabric.Image.fromURL(element.data, function(myImg, callback) {
 			var img = myImg.set({ left: 0, top: 0, width: myImg.width, height: myImg.height});
 			if ( img.width > canvases[element.page].width ) {
 				img.scaleToWidth(canvases[element.page].width / 100 * 50 ); // 50% of the canvas
 			}
 			img.left = theMousePos.x
 			img.top = theMousePos.y
 			img.on('added', function() {
 				callback;
 			});
 			canvases[element.page].add(img)
		});
	} else {
		var deBasedText = atob(element.data.substring(23));
    chunks = deBasedText.match(new RegExp('(.|[\r\n]){1,' + textChunksLength + '}', 'g'))
    var currPage = parseInt( element.page.substr(element.page.length - 1) )
    for (var i = 0; i < chunks.length; i++) {
      if (canvases['p' + (currPage + i)]) {
        canvases['p' + (currPage + i)].add(new fabric.Textbox(chunks[i] + '-', {
          fontFamily: 'Arial',
          left: 20,
          top: 20,
          fontSize: fontSize,
          width: 410,
          breakWords: true,
          originX: 'left',
          originY: 'top'
        }))
      }
    }
		callback;
	}
}


// --- initialize canvases
var canvases = {}
function initCanvases() {
	$('canvas').each(function(i) {
		canvas = new fabric.Canvas(this);
	  canvas.setWidth( $(this).closest('.page').width() );
		canvas.setHeight( $(this).closest('.page').height() );
    canvas.backgroundColor = 'white';
    canvas.id = 'p' + (i+1);

		canvases['p' + (i + 1)] = canvas;

    if (window.location.href.indexOf('saved') >= 0) { // if  saved
      canvas.selection = false
    }

	});
	fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center' // origin at the center
  if (window.location.href.indexOf('saved') < 0) { // if not saved
  	var title = new fabric.Textbox('Insert Title', {
  	  top: 120,
  	  fontFamily: 'AGaramondPro, serif',
  	  fill: '#777',
  	  lineHeight: 1.1,
  	  fontSize: 30,
  	  fontWeight: 'bold',
  	  textAlign: 'center',
  	  width: canvases['p1'].width,
  	  selectable: false,
      hasControls: false,
  	  hoverCursor: 'default',
  	  originX: 'left',
  	  originY: 'top',
      id: 'lock',
      cache: false
  	}).on('editing:entered', function(e) {
      if (this.text = 'Insert Title') {
        this.text = ''
        this.hiddenTextarea.value = ''
      }
    }).on('editing:exited', function(e) {
      Publication.title = this.text
      this.selectable = false
      this.hasControls = false
    })
  	canvases['p1'].add(title)
  	var lineLenght = 250
  	canvases['p1'].add(new fabric.Line([0, 0, lineLenght, 0], {
  		left: ( canvases['p1'].width - lineLenght) / 2,
  	  top: 160,
  	  stroke: '#222',
  	  selectable: false,
  	 	originX: 'left',
  	  originY: 'top'
  	}));
  	var authors = new fabric.Textbox('Insert Authors', {
  	  top: 180,
  	  fontFamily: 'AGaramondPro, serif',
  	  fill: '#777',
  	  lineHeight: 1.1,
  	  fontSize: 20,
  	  textAlign: 'center',
  	  width: canvases['p1'].width,
  	  selectable: false,
      hasControls: false,
  	  hoverCursor: 'default',
  	  originX: 'left',
  	  originY: 'top',
      id: 'lock'
  	}).on('editing:entered', function(e) {
      if (this.text = 'Insert Authors') {
        this.text = ''
        this.hiddenTextarea.value = ''
      }
    }).on('editing:exited', function(e) {
      Publication.authors = this.text
      this.selectable = false
      this.hasControls = false
    })
  	canvases['p1'].add(authors)
    var date = new fabric.Text( timeConverter(Publication.date), {
      top: 600,
      left: canvases['p8'].width/2,
      fontFamily: 'AGaramondPro, serif',
      fill: '#777',
      lineHeight: 1.1,
      fontSize: 14,
      textAlign: 'center',
      // width: canvases['p1'].width,
      selectable: false,
      hasControls: false,
      hoverCursor: 'default',
      originX: 'center',
      originY: 'top',
      id: 'lock'
    })
    canvases['p8'].add(date);
    fabric.Image.fromURL('/assets/img/fotocolectania-logo.png', function(img){
      img.hasBorders = false;
      img.hasControls = false;
      img.selectable = false;
      img.scale(0.12);
      img.left = canvases['p8'].width/2;
      img.top = 530;
      img.lockMovementX = true;
      img.lockMovementY = true;
      img.lockRotation = true;
      img.setControlsVisibility = false;
      img.hoverCursor = 'default';
      img.id = 'lock';
      canvases['p8'].insertAt(img);
    })
  }
}
$(document).keydown(function(e) { // del or backspace to delete
  if( e.which == 8 || e.which == 46) {
    for (canvas in canvases) {
      if (canvases[canvas].getActiveObject()) {
        canvases[canvas].remove(canvases[canvas].getActiveObject());
      }
    }
  }
})



// --- M-V-C

var Publication = {
	// all our states
	id: makeId(),
	title: 'Untitled',
	timeLeft: 9000000,
	expired: false,
	authors: 'Anonymous',
  date: Date.now(),
  imagesAmount: 0,
  textAmount: 0,
  timeElapsed: 0, // TODO set this when time expires
  achievementsAmount: 0,
	pages: {
		p1: {},
		p2: {},
		p3: {},
		p4: {},
		p5: {},
		p6: {},
		p7: {},
		p8: {}
	}
};

function controller(Publication, input) {
	if (Publication.timeLeft > 0) { // not expired
		showTime(Publication)
	} else {  // expired
		showExpired()
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

					var publicationUpdate = function(inputPage) { // update canvas
						setTimeout(function() {
							Publication.pages[inputPage] = canvases[inputPage].toJSON() // settimeout otherwise it doesn't get the element
						}, 1)
					}
					dropElement(input.page, input.data, input.mousePos, publicationUpdate(input.page)); // drop element


          Publication.imagesAmount += 1 // achievement every x imgs
          if (Publication.imagesAmount%achievementSpan == 0) {
            achievement(100 * Publication.imagesAmount, Publication.imagesAmount + ' images added!')
          }
          if (Publication.imagesAmount == 3) {
            $('#done').css('display','inline-block')
            criticSays('You can now save your publication!')
          }
          // start disruptions after first image
          if (  Publication.imagesAmount == 1 &&
                getUrlParameter('disruptions') != 'false' &&
                disruptionsOn == true &&
                typeof y === 'undefined') {
            y = setInterval(function() { // launch a random disruption
              disruptions = Object.keys(Disruption)
              Disruption[disruptions[ disruptions.length * Math.random() << 0]]()
              shake(pages)
            }, disruptionInterval)
          }

          addtime(bonusTime)
					criticSays()

					break
			case input.data &&
				input.data.includes('data:text/plain') &&
				input.visible == true: // new text

					var publicationUpdate = function(inputPage) { // update canvas
						setTimeout(function() {
							Publication.pages[inputPage] = canvases[inputPage].toJSON() // settimeout otherwise it doesn't get the element
						}, 1)
					}
					dropElement(input.page, input.data, input.mousePos, publicationUpdate(input.page)); // drop element

          Publication.textAmount += input.data.length
          if (Publication.textAmount >= 500) {
            achievement(500, 'More than 500 characters added')
          }

					addtime(bonusTime * 2)
          criticSays('This is gonna be a goood read')

					break
			case input.data &&
				!input.data.includes('data:image') &&
				!input.data.includes('data:text/plain'): // neither an image nor text
					Error.notAllowed()
					break
			case input.move == true : // moving or scaling an image
					Publication.pages[input.page] = canvases[input.page].toJSON()
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
	initCanvases()
	onModElement()
	if (window.location.href.indexOf('saved') < 0) {
		// if not a saved publication
		if ( getUrlParameter('time') ) { // difficulty
			Publication.timeLeft = timeSet = getUrlParameter('time')
		}
		x = setInterval(function() {
			Publication.timeLeft = Publication.timeLeft - 10;
			controller(Publication);
		}, 10)
		mouseCounter()
	} else { // saved publication
		renderPublication(Publication)
	}
});

function addtime(bonusTime) {
	Publication.timeLeft = Publication.timeLeft + bonusTime;
	animatetimecounter(bonusTime);
}

// modify element listener
function onModElement() {
	for (var pageId in canvases) {
		canvases[ pageId ].on('object:modified', function(evt) {
			var parentCanvasId = evt.target.canvas.lowerCanvasEl.id
			controller(Publication, { move: true, page: parentCanvasId})
		})
	}
}

// get mouse position on canvas
function getMousePos(canvas, e) {
  var pointer = canvas.getPointer(event, e)
  var posX = pointer.x
  var posY = pointer.y
  return {
    x: posX,
    y: posY
  }
}

const pages = $('.page')
// drop element
pages.on('dragover', function(e) {
	e.preventDefault();
});
pages.on('dragleave', function(e) {
	e.preventDefault();
});
pages.on('drop', function(e) {
	e.preventDefault();
	console.log(e);
	var files = e.originalEvent.dataTransfer.files;
	var y = 0;
	for (var i = files.length - 1; i >= 0; i--) {
		reader = new FileReader();
		var pageId = $(this).find('canvas').attr('id');
		mousePos = getMousePos(canvases[pageId], e)
		reader.onload = function(event) {
			console.log(event.target);
			setTimeout(function() {
				controller(Publication, {
					data: event.target.result,
					visible: true,
					page: pageId,
					mousePos: mousePos
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

// remove element (TODO: UPDATE FOR FABRIC)
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

// changing title // TODO Update
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

// TODO: merge these two
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
  if (Publication.expired != true) {
    Publication.timeElapsed = timeSet - Publication.timeLeft
    Publication.expired = true
    lockElements(allElements())
    setTimeout(function(){
      $('.suggestions').hide()
    }, 800)
  	document.getElementById('counter').style.display = 'none';
  	$('body').addClass('expired')
  	expiredTime()
    for (canvas in canvases) {
      canvases[canvas].selection = false
    }
  	setTimeout(function () {
  		$('.wrapper').addClass('saved_view');
  		savedState()
  	}, 500)
  	clearInterval(x)
    if (typeof y !== 'undefined') { // if disruptions
      clearInterval(y)
    }
  }
}

function dropElement(pageId, data, mousePos, callback) {
	console.log(mousePos)
	var element = { data: data, page: pageId }
	var elementPos = createElement(element, mousePos, callback)
	Sound.ding()
}







// errors

var Error = {
	notAllowed: function() {
		Sound.error()
		alertMessage('The file you dropped is not allowed!')
	},
	tooBig: function() {
		Sound.error();
		alertMessage('The file you dropped is too big!');
	},
	tooLate: function() {
		Sound.error();
		alertMessage('Too late amigo');
	}
};



// TODO: CONVERT TO FABRIC
function removeElement(id) {
	$('#' + id).hide();
	console.log(id);
}

// --- SAVED

function renderPublication(Publication) {
  // TODO update title and authors

	for (var canvasId in canvases) {
		var json = JSON.stringify(Publication.pages[canvasId]);
		canvases[canvasId].loadFromJSON( json, function() {
      lockElements(allElements())
			canvases[canvasId].renderAll.bind(canvases[canvasId])
		})
	}

}




// --- BACKEND

// save to db
function savetoDb(publication) {
	for (var page in Publication.pages) {
		Publication.pages[page] = canvases[page].toJSON() // update all pages
	}
	$.ajax({
		url: '/db',
		type: 'post', // performing a POST request
		data: JSON.stringify(Publication),
		contentType: 'application/json',
		dataType: 'json',
		success: function(publication) {
			console.log('publication sent to database.');
		}
	});
	console.log('saved?id=' + Publication.id)
}





// --- INTERFACE FX


// move these functions to interface part of js?
function animateUp(obj) {
  obj.show();
  obj.css('margin-top', '20px');
  obj.animate({
      opacity: 1,
      marginTop: "0px",
    }, 3000, function() {
      // Animation complete.
  });
};

function animateUpOut(obj, time) {
  obj.show();
  obj.css('margin-top', '20px');
  obj.animate({
      opacity: 1,
      marginTop: "0px",
    }, time/2, function() {
      // Animation complete.
  });
  obj.animate({
      opacity: 0,
      marginTop: "20px",
    }, time/2, function() {
      // Animation complete.
  });
};

function shake(obj, time) {
  if (!time) (
    time = 500
  )
  obj.addClass( 'shake shake-constant' )
  setTimeout(function(){
    obj.removeClass( 'shake shake-constant' )
  }, time);
}






// --- DISRUPTIONS


function allElements(type) {
  var objs = []
  for (canvas in canvases) {
    if (type) {
      canvasObjs = canvases[canvas].getObjects(type)
    } else {
      canvasObjs = canvases[canvas].getObjects()
    }
    for (var i = canvasObjs.length - 1; i >= 0; i--) {
      if (canvasObjs[i].id != 'lock') { // use this to lock
        objs.push( canvasObjs[i] )
      }
    }
  }
  return objs
}

// lock elements
function lockElements(objs) {
  for (var i = objs.length - 1; i >= 0; i--) {
    objs[i].selectable = false
    objs[i].hasControls = false
    objs[i].hoverCursor = 'default'
  }
}

function renderAllCanvases() {
  for (canvasId in canvases) {
    canvases[canvasId].renderAll()
  }
}

function filterImgs(objs, filter) {
  for (var i = objs.length - 1; i >= 0; i--) {
    objs[i].filters.push(filter)
    objs[i].applyFilters()
  }
  renderAllCanvases()
}

var Disruption = {
	comic: function() {
    function _comic(objs) {
      for (var i = objs.length - 1; i >= 0; i--) {
        objs[i].fontFamily = '"Comic Sans MS"'
      }
    }
    _comic( allElements('text') )
    _comic( allElements('textbox') )
    renderAllCanvases()
    criticSays('Can\'t you spice the typography a bit?', 'Gutenberg')
	},
	rotateImgsRand: function() {
    function _rotateImgsRand(objs) {
      for (var i = objs.length - 1; i >= 0; i--) {
        objs[i].originX = 'center'
        objs[i].originY = 'center'
        objs[i].animate({ angle: Math.floor(Math.random() * 360) }, {
          duration: 1000,
          onChange: objs[i].canvas.renderAll.bind(objs[i].canvas),
          easing: function(t, b, c, d) { return c*t/d + b }
        })
      }
    }
    _rotateImgsRand(allElements('image'))
    criticSays('I find this layout a bit static...', 'Gutenberg')
	},
	lockRandPage: function() {
    var keys = Object.keys(canvases)
    randCanvas = canvases[keys[ keys.length * Math.random() << 0]]
		randCanvas.selection = false;
		for (objectId in randCanvas.getObjects() ) {
			var object = randCanvas.item(objectId)
			object.selectable = false
			object.hoverCursor = 'default'
		}
		randCanvas.add(new fabric.Line([0, 0, randCanvas.width, randCanvas.height], {
	  	stroke: 'red',
	  	selectable: false,
	  	strokeWidth: 2,
      hoverCursor:'default',
      id: 'lock'
		}))
		randCanvas.renderAll();
		// TODO: prevent drop
    criticSays('Page ' + randCanvas.id + ' is now locked...', 'Gutenberg') // TODO
	},
  shufflePages: function() {
    var toShuffle = []
    var i = 0
    for (canvasId in canvases) {
      if (i > 0) { // prevent shuffling first page
        toShuffle.push( canvases[canvasId].toJSON() )
      }
      i += 1
    }
    shuffleArray(toShuffle)
    var y = 0
    for (canvasId in canvases) {
      if (y > 0) {
        canvases[canvasId].loadFromJSON(toShuffle[y - 1], function() {
          canvases[canvasId].renderAll.bind(canvases[canvasId])
        })
      }
      y += 1
    }
    criticSays('The rythm of this publication is a bit weak. Don\'t you think?', 'Gutenberg')
  },
	ads: function () {
		var keys = Object.keys(canvases)
    randCanvas = canvases[keys[ keys.length * Math.random() << 0]]
		randCanvas.add(new fabric.Rect({
			width: randCanvas.width,
			height: 30,
			fill: '#0D213E',
			lockMovementX: true,
			lockMovementY: true,
			lockRotation: true,
			hasControls: false,
      selectable: false,
			left: randCanvas.width/2,
			top: 15,
      selectable: false,
      id: 'lock'
		}));
		fabric.Image.fromURL('/assets/img/kinko.png', function(img){
				img.hasBorders = false;
				img.hasControls = false;
        img.selectable = false;
				img.scale(0.2);
				img.left = randCanvas.width-100;
				img.top = 50;
				img.lockMovementX = true;
				img.lockMovementY = true;
				img.lockRotation = true;
				img.setControlsVisibility = false;
        img.id = 'lock'
				randCanvas.insertAt(img,3);
				// TODO: it only works with one image for some reason. running the function multiple times it adds more top bars but just moves all the images to the same place
		});

    criticSays('I found a sponsor!', 'Gutenberg')
	},
  halfTime: function () {
    Publication.timeLeft = Publication.timeLeft / 2
    criticSays('This is taking too long...', 'Gutenberg')
  },
  doubleTime: function () {
    Publication.timeLeft = Publication.timeLeft * 2
    criticSays('Take your time...', 'Gutenberg')
  },
  greyscaleImgs: function() {
    filterImgs(allElements('image'), new fabric.Image.filters.Grayscale() )
    criticSays('Shall we make it look classic?', 'Gutenberg')
  },
  invertImgs: function() {
    filterImgs(allElements('image'), new fabric.Image.filters.Invert() )
    criticSays('The visuals need some edgy colors', 'Gutenberg')
  },
  sepiaImgs: function() {
    filterImgs(allElements('image'), new fabric.Image.filters.Sepia() )
    criticSays('Ever heard of Instagram?', 'Gutenberg')
  },
  blackwhiteImgs: function() {
    filterImgs(allElements('image'), new fabric.Image.filters.BlackWhite() )
    criticSays('This should look like a zine!', 'Gutenberg')
  },
  pixelateImgs: function() {
    filterImgs(allElements('image'), new fabric.Image.filters.Pixelate({blocksize: 20}) )
    criticSays('Isn\'t this a videogame after all?', 'Gutenberg')
  },
  noiseImgs: function() {
    filterImgs(allElements('image'), new fabric.Image.filters.Noise({noise: 200}) )
    criticSays('MAKE SOME NOOISE!!', 'Gutenberg')
  },
  fontSizeBigger: function() {
    function _fontSizeBigger(elements) {
      for (var i = 0; i < elements.length; i++) {
        elements[i].set('fontSize', elements[i].fontSize * scaleFont);
      }
    }
    _fontSizeBigger(allElements('textbox'))
    renderAllCanvases()
    criticSays('Can\'t read anything :(', 'Gutenberg')
  },
  fontSizeSmaller: function() {
    function _fontSizeBigger(elements) {
      for (var i = 0; i < elements.length; i++) {
        elements[i].set('fontSize', elements[i].fontSize / scaleFont);
      }
    }
    _fontSizeSmaller(allElements('textbox'))
    renderAllCanvases()
    criticSays('I\'m not blind!', 'Gutenberg')
  },
  biggerImgs: function() {
    function _biggerImgs(elements) {
      for (var i = 0; i < elements.length; i++) {
        elements[i].set({
          scaleY: scaleImgs,
          scaleX: scaleImgs
        });
      }
    }
    _biggerImgs(allElements('image'))
    renderAllCanvases()
    criticSays('BLOW UP!', 'Gutenberg')
  },
  lockAllElements: function() {
    lockElements(allElements())
    criticSays('Things are perfect as they are.', 'Gutenberg')
  },
  skewAllElements: function() {
    function _skewAllElements(elements) {
      for (var i = 0; i < elements.length; i++) {
        elements[i].set({
          scaleY: scaleImgs,
          scaleX: scaleImgs,
          transformMatrix: [1, .50, 0, 1, 0, 0]
        })
      }
    }
    _skewAllElements(allElements('image'))
    renderAllCanvases()
    criticSays('Stretch those images, come on!', 'Gutenberg')
  },
  flipAllElements: function() {
    function _flipAllElements(elements) {
      for (var i = 0; i < elements.length; i++) {
        elements[i].set({
          angle: '-180',
          flipY: true
        })
      }
    }
    _flipAllElements(allElements('image'))
    renderAllCanvases()
    criticSays('Stretch those images, come on!', 'Gutenberg')
  }
};


// --- INTERFACE BUTTONS

$('.button.save').click(function() {
  $('.button.save').hide()
  $('.button.pdf, .button.booklet').css('display','inline-block')
})

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtYWluLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIC0tLSBERUZBVUxUU1xuXG52YXIgZGlzcnVwdGlvbnNPbiA9IHRydWVcbnZhciBkcm9wRGVsYXkgPSAxMDBcbnZhciBkaXNydXB0aW9uSW50ZXJ2YWwgPSA1MDAwXG52YXIgYm9udXNUaW1lID0gMTAwMFxudmFyIHRleHRDaHVua3NMZW5ndGggPSAxNTAwXG52YXIgZm9udFNpemUgPSAxNVxudmFyIHNjYWxlRm9udCA9IDEuNVxudmFyIHNjYWxlSW1ncyA9IDAuN1xudmFyIGFjaGlldmVtZW50U3BhbiA9IDNcblxuXG5cblxuLy8gLS0tIEdFTkVSQUwgRlVOQ1RJT05TXG5cbmZ1bmN0aW9uIG1ha2VJZCgpIHtcblx0dmFyIHJhbmRMZXR0ZXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKDY1ICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMjYpKTtcblx0dmFyIGlkID0gcmFuZExldHRlciArIERhdGUubm93KCk7XG5cdHJldHVybiBpZDtcbn1cblxuZnVuY3Rpb24gYnl0ZUNvdW50KHMpIHtcbiAgICByZXR1cm4gZW5jb2RlVVJJKHMpLnNwbGl0KC8lLi58Li8pLmxlbmd0aCAtIDE7XG59XG5cbnZhciBnZXRVcmxQYXJhbWV0ZXIgPSBmdW5jdGlvbiBnZXRVcmxQYXJhbWV0ZXIoc1BhcmFtKSB7XG4gIHZhciBzUGFnZVVSTCA9IGRlY29kZVVSSUNvbXBvbmVudCh3aW5kb3cubG9jYXRpb24uc2VhcmNoLnN1YnN0cmluZygxKSksXG4gICAgc1VSTFZhcmlhYmxlcyA9IHNQYWdlVVJMLnNwbGl0KCcmJyksXG4gICAgc1BhcmFtZXRlck5hbWUsXG4gICAgaTtcblxuICBmb3IgKGkgPSAwOyBpIDwgc1VSTFZhcmlhYmxlcy5sZW5ndGg7IGkrKykge1xuICAgIHNQYXJhbWV0ZXJOYW1lID0gc1VSTFZhcmlhYmxlc1tpXS5zcGxpdCgnPScpO1xuXG4gICAgaWYgKHNQYXJhbWV0ZXJOYW1lWzBdID09PSBzUGFyYW0pIHtcbiAgICAgICAgcmV0dXJuIHNQYXJhbWV0ZXJOYW1lWzFdID09PSB1bmRlZmluZWQgPyB0cnVlIDogc1BhcmFtZXRlck5hbWVbMV07XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNodWZmbGVBcnJheShhcnJheSkge1xuICBmb3IgKHZhciBpID0gYXJyYXkubGVuZ3RoIC0gMTsgaSA+IDA7IGktLSkge1xuICAgIHZhciBqID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKGkgKyAxKSk7XG4gICAgdmFyIHRlbXAgPSBhcnJheVtpXTtcbiAgICBhcnJheVtpXSA9IGFycmF5W2pdO1xuICAgIGFycmF5W2pdID0gdGVtcDtcbiAgfVxufVxuXG5mdW5jdGlvbiB0aW1lQ29udmVydGVyKFVOSVhfdGltZXN0YW1wKXtcbiAgdmFyIGEgPSBuZXcgRGF0ZShVTklYX3RpbWVzdGFtcCk7XG4gIHZhciBtb250aHMgPSBbJ0phbicsJ0ZlYicsJ01hcicsJ0FwcicsJ01heScsJ0p1bicsJ0p1bCcsJ0F1ZycsJ1NlcCcsJ09jdCcsJ05vdicsJ0RlYyddO1xuICB2YXIgeWVhciA9IGEuZ2V0RnVsbFllYXIoKTtcbiAgdmFyIG1vbnRoID0gbW9udGhzW2EuZ2V0TW9udGgoKV07XG4gIHZhciBkYXRlID0gYS5nZXREYXRlKCk7XG4gIHZhciB0aW1lID0gZGF0ZSArICcgJyArIG1vbnRoICsgJyAnICsgeWVhcjtcbiAgcmV0dXJuIHRpbWU7XG59XG5cblxuXG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQoZWxlbWVudCwgbW91c2VQb3MsIGNhbGxiYWNrKSB7XG4gIGZ1bmN0aW9uIGNodW5rU3RyaW5nKHN0ciwgbGVuZ3RoKSB7XG4gICAgcmV0dXJuIHN0ci5tYXRjaChuZXcgUmVnRXhwKCd7LjEsJyArIGxlbmd0aCArICd9JywgJ2cnKSk7XG4gIH1cblx0dmFyIHRoZU1vdXNlUG9zID0gbW91c2VQb3Ncblx0aWYgKGVsZW1lbnQuZGF0YS5pbmNsdWRlcygnZGF0YTppbWFnZScpKSB7XG5cdFx0ZmFicmljLkltYWdlLmZyb21VUkwoZWxlbWVudC5kYXRhLCBmdW5jdGlvbihteUltZywgY2FsbGJhY2spIHtcbiBcdFx0XHR2YXIgaW1nID0gbXlJbWcuc2V0KHsgbGVmdDogMCwgdG9wOiAwLCB3aWR0aDogbXlJbWcud2lkdGgsIGhlaWdodDogbXlJbWcuaGVpZ2h0fSk7XG4gXHRcdFx0aWYgKCBpbWcud2lkdGggPiBjYW52YXNlc1tlbGVtZW50LnBhZ2VdLndpZHRoICkge1xuIFx0XHRcdFx0aW1nLnNjYWxlVG9XaWR0aChjYW52YXNlc1tlbGVtZW50LnBhZ2VdLndpZHRoIC8gMTAwICogNTAgKTsgLy8gNTAlIG9mIHRoZSBjYW52YXNcbiBcdFx0XHR9XG4gXHRcdFx0aW1nLmxlZnQgPSB0aGVNb3VzZVBvcy54XG4gXHRcdFx0aW1nLnRvcCA9IHRoZU1vdXNlUG9zLnlcbiBcdFx0XHRpbWcub24oJ2FkZGVkJywgZnVuY3Rpb24oKSB7XG4gXHRcdFx0XHRjYWxsYmFjaztcbiBcdFx0XHR9KTtcbiBcdFx0XHRjYW52YXNlc1tlbGVtZW50LnBhZ2VdLmFkZChpbWcpXG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0dmFyIGRlQmFzZWRUZXh0ID0gYXRvYihlbGVtZW50LmRhdGEuc3Vic3RyaW5nKDIzKSk7XG4gICAgY2h1bmtzID0gZGVCYXNlZFRleHQubWF0Y2gobmV3IFJlZ0V4cCgnKC58W1xcclxcbl0pezEsJyArIHRleHRDaHVua3NMZW5ndGggKyAnfScsICdnJykpXG4gICAgdmFyIGN1cnJQYWdlID0gcGFyc2VJbnQoIGVsZW1lbnQucGFnZS5zdWJzdHIoZWxlbWVudC5wYWdlLmxlbmd0aCAtIDEpIClcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNodW5rcy5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGNhbnZhc2VzWydwJyArIChjdXJyUGFnZSArIGkpXSkge1xuICAgICAgICBjYW52YXNlc1sncCcgKyAoY3VyclBhZ2UgKyBpKV0uYWRkKG5ldyBmYWJyaWMuVGV4dGJveChjaHVua3NbaV0gKyAnLScsIHtcbiAgICAgICAgICBmb250RmFtaWx5OiAnQXJpYWwnLFxuICAgICAgICAgIGxlZnQ6IDIwLFxuICAgICAgICAgIHRvcDogMjAsXG4gICAgICAgICAgZm9udFNpemU6IGZvbnRTaXplLFxuICAgICAgICAgIHdpZHRoOiA0MTAsXG4gICAgICAgICAgYnJlYWtXb3JkczogdHJ1ZSxcbiAgICAgICAgICBvcmlnaW5YOiAnbGVmdCcsXG4gICAgICAgICAgb3JpZ2luWTogJ3RvcCdcbiAgICAgICAgfSkpXG4gICAgICB9XG4gICAgfVxuXHRcdGNhbGxiYWNrO1xuXHR9XG59XG5cblxuLy8gLS0tIGluaXRpYWxpemUgY2FudmFzZXNcbnZhciBjYW52YXNlcyA9IHt9XG5mdW5jdGlvbiBpbml0Q2FudmFzZXMoKSB7XG5cdCQoJ2NhbnZhcycpLmVhY2goZnVuY3Rpb24oaSkge1xuXHRcdGNhbnZhcyA9IG5ldyBmYWJyaWMuQ2FudmFzKHRoaXMpO1xuXHQgIGNhbnZhcy5zZXRXaWR0aCggJCh0aGlzKS5jbG9zZXN0KCcucGFnZScpLndpZHRoKCkgKTtcblx0XHRjYW52YXMuc2V0SGVpZ2h0KCAkKHRoaXMpLmNsb3Nlc3QoJy5wYWdlJykuaGVpZ2h0KCkgKTtcbiAgICBjYW52YXMuYmFja2dyb3VuZENvbG9yID0gJ3doaXRlJztcbiAgICBjYW52YXMuaWQgPSAncCcgKyAoaSsxKTtcblxuXHRcdGNhbnZhc2VzWydwJyArIChpICsgMSldID0gY2FudmFzO1xuXG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3NhdmVkJykgPj0gMCkgeyAvLyBpZiAgc2F2ZWRcbiAgICAgIGNhbnZhcy5zZWxlY3Rpb24gPSBmYWxzZVxuICAgIH1cblxuXHR9KTtcblx0ZmFicmljLk9iamVjdC5wcm90b3R5cGUub3JpZ2luWCA9IGZhYnJpYy5PYmplY3QucHJvdG90eXBlLm9yaWdpblkgPSAnY2VudGVyJyAvLyBvcmlnaW4gYXQgdGhlIGNlbnRlclxuICBpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignc2F2ZWQnKSA8IDApIHsgLy8gaWYgbm90IHNhdmVkXG4gIFx0dmFyIHRpdGxlID0gbmV3IGZhYnJpYy5UZXh0Ym94KCdJbnNlcnQgVGl0bGUnLCB7XG4gIFx0ICB0b3A6IDEyMCxcbiAgXHQgIGZvbnRGYW1pbHk6ICdBR2FyYW1vbmRQcm8sIHNlcmlmJyxcbiAgXHQgIGZpbGw6ICcjNzc3JyxcbiAgXHQgIGxpbmVIZWlnaHQ6IDEuMSxcbiAgXHQgIGZvbnRTaXplOiAzMCxcbiAgXHQgIGZvbnRXZWlnaHQ6ICdib2xkJyxcbiAgXHQgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gIFx0ICB3aWR0aDogY2FudmFzZXNbJ3AxJ10ud2lkdGgsXG4gIFx0ICBzZWxlY3RhYmxlOiBmYWxzZSxcbiAgICAgIGhhc0NvbnRyb2xzOiBmYWxzZSxcbiAgXHQgIGhvdmVyQ3Vyc29yOiAnZGVmYXVsdCcsXG4gIFx0ICBvcmlnaW5YOiAnbGVmdCcsXG4gIFx0ICBvcmlnaW5ZOiAndG9wJyxcbiAgICAgIGlkOiAnbG9jaycsXG4gICAgICBjYWNoZTogZmFsc2VcbiAgXHR9KS5vbignZWRpdGluZzplbnRlcmVkJywgZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKHRoaXMudGV4dCA9ICdJbnNlcnQgVGl0bGUnKSB7XG4gICAgICAgIHRoaXMudGV4dCA9ICcnXG4gICAgICAgIHRoaXMuaGlkZGVuVGV4dGFyZWEudmFsdWUgPSAnJ1xuICAgICAgfVxuICAgIH0pLm9uKCdlZGl0aW5nOmV4aXRlZCcsIGZ1bmN0aW9uKGUpIHtcbiAgICAgIFB1YmxpY2F0aW9uLnRpdGxlID0gdGhpcy50ZXh0XG4gICAgICB0aGlzLnNlbGVjdGFibGUgPSBmYWxzZVxuICAgICAgdGhpcy5oYXNDb250cm9scyA9IGZhbHNlXG4gICAgfSlcbiAgXHRjYW52YXNlc1sncDEnXS5hZGQodGl0bGUpXG4gIFx0dmFyIGxpbmVMZW5naHQgPSAyNTBcbiAgXHRjYW52YXNlc1sncDEnXS5hZGQobmV3IGZhYnJpYy5MaW5lKFswLCAwLCBsaW5lTGVuZ2h0LCAwXSwge1xuICBcdFx0bGVmdDogKCBjYW52YXNlc1sncDEnXS53aWR0aCAtIGxpbmVMZW5naHQpIC8gMixcbiAgXHQgIHRvcDogMTYwLFxuICBcdCAgc3Ryb2tlOiAnIzIyMicsXG4gIFx0ICBzZWxlY3RhYmxlOiBmYWxzZSxcbiAgXHQgXHRvcmlnaW5YOiAnbGVmdCcsXG4gIFx0ICBvcmlnaW5ZOiAndG9wJ1xuICBcdH0pKTtcbiAgXHR2YXIgYXV0aG9ycyA9IG5ldyBmYWJyaWMuVGV4dGJveCgnSW5zZXJ0IEF1dGhvcnMnLCB7XG4gIFx0ICB0b3A6IDE4MCxcbiAgXHQgIGZvbnRGYW1pbHk6ICdBR2FyYW1vbmRQcm8sIHNlcmlmJyxcbiAgXHQgIGZpbGw6ICcjNzc3JyxcbiAgXHQgIGxpbmVIZWlnaHQ6IDEuMSxcbiAgXHQgIGZvbnRTaXplOiAyMCxcbiAgXHQgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gIFx0ICB3aWR0aDogY2FudmFzZXNbJ3AxJ10ud2lkdGgsXG4gIFx0ICBzZWxlY3RhYmxlOiBmYWxzZSxcbiAgICAgIGhhc0NvbnRyb2xzOiBmYWxzZSxcbiAgXHQgIGhvdmVyQ3Vyc29yOiAnZGVmYXVsdCcsXG4gIFx0ICBvcmlnaW5YOiAnbGVmdCcsXG4gIFx0ICBvcmlnaW5ZOiAndG9wJyxcbiAgICAgIGlkOiAnbG9jaydcbiAgXHR9KS5vbignZWRpdGluZzplbnRlcmVkJywgZnVuY3Rpb24oZSkge1xuICAgICAgaWYgKHRoaXMudGV4dCA9ICdJbnNlcnQgQXV0aG9ycycpIHtcbiAgICAgICAgdGhpcy50ZXh0ID0gJydcbiAgICAgICAgdGhpcy5oaWRkZW5UZXh0YXJlYS52YWx1ZSA9ICcnXG4gICAgICB9XG4gICAgfSkub24oJ2VkaXRpbmc6ZXhpdGVkJywgZnVuY3Rpb24oZSkge1xuICAgICAgUHVibGljYXRpb24uYXV0aG9ycyA9IHRoaXMudGV4dFxuICAgICAgdGhpcy5zZWxlY3RhYmxlID0gZmFsc2VcbiAgICAgIHRoaXMuaGFzQ29udHJvbHMgPSBmYWxzZVxuICAgIH0pXG4gIFx0Y2FudmFzZXNbJ3AxJ10uYWRkKGF1dGhvcnMpXG4gICAgdmFyIGRhdGUgPSBuZXcgZmFicmljLlRleHQoIHRpbWVDb252ZXJ0ZXIoUHVibGljYXRpb24uZGF0ZSksIHtcbiAgICAgIHRvcDogNjAwLFxuICAgICAgbGVmdDogY2FudmFzZXNbJ3A4J10ud2lkdGgvMixcbiAgICAgIGZvbnRGYW1pbHk6ICdBR2FyYW1vbmRQcm8sIHNlcmlmJyxcbiAgICAgIGZpbGw6ICcjNzc3JyxcbiAgICAgIGxpbmVIZWlnaHQ6IDEuMSxcbiAgICAgIGZvbnRTaXplOiAxNCxcbiAgICAgIHRleHRBbGlnbjogJ2NlbnRlcicsXG4gICAgICAvLyB3aWR0aDogY2FudmFzZXNbJ3AxJ10ud2lkdGgsXG4gICAgICBzZWxlY3RhYmxlOiBmYWxzZSxcbiAgICAgIGhhc0NvbnRyb2xzOiBmYWxzZSxcbiAgICAgIGhvdmVyQ3Vyc29yOiAnZGVmYXVsdCcsXG4gICAgICBvcmlnaW5YOiAnY2VudGVyJyxcbiAgICAgIG9yaWdpblk6ICd0b3AnLFxuICAgICAgaWQ6ICdsb2NrJ1xuICAgIH0pXG4gICAgY2FudmFzZXNbJ3A4J10uYWRkKGRhdGUpO1xuICAgIGZhYnJpYy5JbWFnZS5mcm9tVVJMKCcvYXNzZXRzL2ltZy9mb3RvY29sZWN0YW5pYS1sb2dvLnBuZycsIGZ1bmN0aW9uKGltZyl7XG4gICAgICBpbWcuaGFzQm9yZGVycyA9IGZhbHNlO1xuICAgICAgaW1nLmhhc0NvbnRyb2xzID0gZmFsc2U7XG4gICAgICBpbWcuc2VsZWN0YWJsZSA9IGZhbHNlO1xuICAgICAgaW1nLnNjYWxlKDAuMTIpO1xuICAgICAgaW1nLmxlZnQgPSBjYW52YXNlc1sncDgnXS53aWR0aC8yO1xuICAgICAgaW1nLnRvcCA9IDUzMDtcbiAgICAgIGltZy5sb2NrTW92ZW1lbnRYID0gdHJ1ZTtcbiAgICAgIGltZy5sb2NrTW92ZW1lbnRZID0gdHJ1ZTtcbiAgICAgIGltZy5sb2NrUm90YXRpb24gPSB0cnVlO1xuICAgICAgaW1nLnNldENvbnRyb2xzVmlzaWJpbGl0eSA9IGZhbHNlO1xuICAgICAgaW1nLmhvdmVyQ3Vyc29yID0gJ2RlZmF1bHQnO1xuICAgICAgaW1nLmlkID0gJ2xvY2snO1xuICAgICAgY2FudmFzZXNbJ3A4J10uaW5zZXJ0QXQoaW1nKTtcbiAgICB9KVxuICB9XG59XG4kKGRvY3VtZW50KS5rZXlkb3duKGZ1bmN0aW9uKGUpIHsgLy8gZGVsIG9yIGJhY2tzcGFjZSB0byBkZWxldGVcbiAgaWYoIGUud2hpY2ggPT0gOCB8fCBlLndoaWNoID09IDQ2KSB7XG4gICAgZm9yIChjYW52YXMgaW4gY2FudmFzZXMpIHtcbiAgICAgIGlmIChjYW52YXNlc1tjYW52YXNdLmdldEFjdGl2ZU9iamVjdCgpKSB7XG4gICAgICAgIGNhbnZhc2VzW2NhbnZhc10ucmVtb3ZlKGNhbnZhc2VzW2NhbnZhc10uZ2V0QWN0aXZlT2JqZWN0KCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxufSlcblxuXG5cbi8vIC0tLSBNLVYtQ1xuXG52YXIgUHVibGljYXRpb24gPSB7XG5cdC8vIGFsbCBvdXIgc3RhdGVzXG5cdGlkOiBtYWtlSWQoKSxcblx0dGl0bGU6ICdVbnRpdGxlZCcsXG5cdHRpbWVMZWZ0OiA5MDAwMDAwLFxuXHRleHBpcmVkOiBmYWxzZSxcblx0YXV0aG9yczogJ0Fub255bW91cycsXG4gIGRhdGU6IERhdGUubm93KCksXG4gIGltYWdlc0Ftb3VudDogMCxcbiAgdGV4dEFtb3VudDogMCxcbiAgdGltZUVsYXBzZWQ6IDAsIC8vIFRPRE8gc2V0IHRoaXMgd2hlbiB0aW1lIGV4cGlyZXNcbiAgYWNoaWV2ZW1lbnRzQW1vdW50OiAwLFxuXHRwYWdlczoge1xuXHRcdHAxOiB7fSxcblx0XHRwMjoge30sXG5cdFx0cDM6IHt9LFxuXHRcdHA0OiB7fSxcblx0XHRwNToge30sXG5cdFx0cDY6IHt9LFxuXHRcdHA3OiB7fSxcblx0XHRwODoge31cblx0fVxufTtcblxuZnVuY3Rpb24gY29udHJvbGxlcihQdWJsaWNhdGlvbiwgaW5wdXQpIHtcblx0aWYgKFB1YmxpY2F0aW9uLnRpbWVMZWZ0ID4gMCkgeyAvLyBub3QgZXhwaXJlZFxuXHRcdHNob3dUaW1lKFB1YmxpY2F0aW9uKVxuXHR9IGVsc2UgeyAgLy8gZXhwaXJlZFxuXHRcdHNob3dFeHBpcmVkKClcblx0fVxuXG5cdGlmIChpbnB1dCAmJiBQdWJsaWNhdGlvbi5leHBpcmVkID09IGZhbHNlKSB7XG5cdFx0Y29uc29sZS5sb2coaW5wdXQpXG5cdFx0c3dpdGNoICh0cnVlKSB7XG5cdFx0XHRjYXNlIGlucHV0LnZpc2libGUgPT0gZmFsc2U6IC8vIGRlbGV0aW5nIGFuIGVsZW1lbnRcblx0XHRcdFx0XHRyZW1vdmVFbGVtZW50KGlucHV0LmlkKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0Ynl0ZUNvdW50KGlucHV0LmRhdGEpID4gMTM5ODExNyA6IC8vIGZpbGUgdG9vIGJpZyAoMW1iKVxuXHRcdFx0XHQgXHRFcnJvci50b29CaWcoKVxuXHRcdFx0XHRcdGJyZWFrXG5cdFx0XHRjYXNlIGlucHV0LmRhdGEgJiZcblx0XHRcdFx0aW5wdXQuZGF0YS5pbmNsdWRlcygnZGF0YTppbWFnZScpICYmXG5cdFx0XHRcdGlucHV0LnZpc2libGUgPT0gdHJ1ZTogLy8gbmV3IGltYWdlXG5cblx0XHRcdFx0XHR2YXIgcHVibGljYXRpb25VcGRhdGUgPSBmdW5jdGlvbihpbnB1dFBhZ2UpIHsgLy8gdXBkYXRlIGNhbnZhc1xuXHRcdFx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdFx0UHVibGljYXRpb24ucGFnZXNbaW5wdXRQYWdlXSA9IGNhbnZhc2VzW2lucHV0UGFnZV0udG9KU09OKCkgLy8gc2V0dGltZW91dCBvdGhlcndpc2UgaXQgZG9lc24ndCBnZXQgdGhlIGVsZW1lbnRcblx0XHRcdFx0XHRcdH0sIDEpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGRyb3BFbGVtZW50KGlucHV0LnBhZ2UsIGlucHV0LmRhdGEsIGlucHV0Lm1vdXNlUG9zLCBwdWJsaWNhdGlvblVwZGF0ZShpbnB1dC5wYWdlKSk7IC8vIGRyb3AgZWxlbWVudFxuXG5cbiAgICAgICAgICBQdWJsaWNhdGlvbi5pbWFnZXNBbW91bnQgKz0gMSAvLyBhY2hpZXZlbWVudCBldmVyeSB4IGltZ3NcbiAgICAgICAgICBpZiAoUHVibGljYXRpb24uaW1hZ2VzQW1vdW50JWFjaGlldmVtZW50U3BhbiA9PSAwKSB7XG4gICAgICAgICAgICBhY2hpZXZlbWVudCgxMDAgKiBQdWJsaWNhdGlvbi5pbWFnZXNBbW91bnQsIFB1YmxpY2F0aW9uLmltYWdlc0Ftb3VudCArICcgaW1hZ2VzIGFkZGVkIScpXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChQdWJsaWNhdGlvbi5pbWFnZXNBbW91bnQgPT0gMykge1xuICAgICAgICAgICAgJCgnI2RvbmUnKS5jc3MoJ2Rpc3BsYXknLCdpbmxpbmUtYmxvY2snKVxuICAgICAgICAgICAgY3JpdGljU2F5cygnWW91IGNhbiBub3cgc2F2ZSB5b3VyIHB1YmxpY2F0aW9uIScpXG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHN0YXJ0IGRpc3J1cHRpb25zIGFmdGVyIGZpcnN0IGltYWdlXG4gICAgICAgICAgaWYgKCAgUHVibGljYXRpb24uaW1hZ2VzQW1vdW50ID09IDEgJiZcbiAgICAgICAgICAgICAgICBnZXRVcmxQYXJhbWV0ZXIoJ2Rpc3J1cHRpb25zJykgIT0gJ2ZhbHNlJyAmJlxuICAgICAgICAgICAgICAgIGRpc3J1cHRpb25zT24gPT0gdHJ1ZSAmJlxuICAgICAgICAgICAgICAgIHR5cGVvZiB5ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgeSA9IHNldEludGVydmFsKGZ1bmN0aW9uKCkgeyAvLyBsYXVuY2ggYSByYW5kb20gZGlzcnVwdGlvblxuICAgICAgICAgICAgICBkaXNydXB0aW9ucyA9IE9iamVjdC5rZXlzKERpc3J1cHRpb24pXG4gICAgICAgICAgICAgIERpc3J1cHRpb25bZGlzcnVwdGlvbnNbIGRpc3J1cHRpb25zLmxlbmd0aCAqIE1hdGgucmFuZG9tKCkgPDwgMF1dKClcbiAgICAgICAgICAgICAgc2hha2UocGFnZXMpXG4gICAgICAgICAgICB9LCBkaXNydXB0aW9uSW50ZXJ2YWwpXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgYWRkdGltZShib251c1RpbWUpXG5cdFx0XHRcdFx0Y3JpdGljU2F5cygpXG5cblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5kYXRhICYmXG5cdFx0XHRcdGlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6dGV4dC9wbGFpbicpICYmXG5cdFx0XHRcdGlucHV0LnZpc2libGUgPT0gdHJ1ZTogLy8gbmV3IHRleHRcblxuXHRcdFx0XHRcdHZhciBwdWJsaWNhdGlvblVwZGF0ZSA9IGZ1bmN0aW9uKGlucHV0UGFnZSkgeyAvLyB1cGRhdGUgY2FudmFzXG5cdFx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRQdWJsaWNhdGlvbi5wYWdlc1tpbnB1dFBhZ2VdID0gY2FudmFzZXNbaW5wdXRQYWdlXS50b0pTT04oKSAvLyBzZXR0aW1lb3V0IG90aGVyd2lzZSBpdCBkb2Vzbid0IGdldCB0aGUgZWxlbWVudFxuXHRcdFx0XHRcdFx0fSwgMSlcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZHJvcEVsZW1lbnQoaW5wdXQucGFnZSwgaW5wdXQuZGF0YSwgaW5wdXQubW91c2VQb3MsIHB1YmxpY2F0aW9uVXBkYXRlKGlucHV0LnBhZ2UpKTsgLy8gZHJvcCBlbGVtZW50XG5cbiAgICAgICAgICBQdWJsaWNhdGlvbi50ZXh0QW1vdW50ICs9IGlucHV0LmRhdGEubGVuZ3RoXG4gICAgICAgICAgaWYgKFB1YmxpY2F0aW9uLnRleHRBbW91bnQgPj0gNTAwKSB7XG4gICAgICAgICAgICBhY2hpZXZlbWVudCg1MDAsICdNb3JlIHRoYW4gNTAwIGNoYXJhY3RlcnMgYWRkZWQnKVxuICAgICAgICAgIH1cblxuXHRcdFx0XHRcdGFkZHRpbWUoYm9udXNUaW1lICogMilcbiAgICAgICAgICBjcml0aWNTYXlzKCdUaGlzIGlzIGdvbm5hIGJlIGEgZ29vb2QgcmVhZCcpXG5cblx0XHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSBpbnB1dC5kYXRhICYmXG5cdFx0XHRcdCFpbnB1dC5kYXRhLmluY2x1ZGVzKCdkYXRhOmltYWdlJykgJiZcblx0XHRcdFx0IWlucHV0LmRhdGEuaW5jbHVkZXMoJ2RhdGE6dGV4dC9wbGFpbicpOiAvLyBuZWl0aGVyIGFuIGltYWdlIG5vciB0ZXh0XG5cdFx0XHRcdFx0RXJyb3Iubm90QWxsb3dlZCgpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQubW92ZSA9PSB0cnVlIDogLy8gbW92aW5nIG9yIHNjYWxpbmcgYW4gaW1hZ2Vcblx0XHRcdFx0XHRQdWJsaWNhdGlvbi5wYWdlc1tpbnB1dC5wYWdlXSA9IGNhbnZhc2VzW2lucHV0LnBhZ2VdLnRvSlNPTigpXG5cdFx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgaW5wdXQuaGFzT3duUHJvcGVydHkoJ3RpdGxlJykgOiAvLyBjaGFuZ2luZyB0aXRsZVxuXHRcdFx0XHRcdFB1YmxpY2F0aW9uLnRpdGxlID0gaW5wdXQudGl0bGU7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKGlucHV0ICYmIFB1YmxpY2F0aW9uLmV4cGlyZWQgPT0gdHJ1ZSkge1xuXHRcdC8vIHRvbyBsYXRlXG5cdFx0RXJyb3IudG9vTGF0ZSgpO1xuXHR9XG59XG5cblxuXG5cblxuLy8gLS0tIENPTlRST0xMRVJcblxudmFyIHg7XG4kKGRvY3VtZW50KS5yZWFkeShmdW5jdGlvbigpIHtcblx0aW5pdENhbnZhc2VzKClcblx0b25Nb2RFbGVtZW50KClcblx0aWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3NhdmVkJykgPCAwKSB7XG5cdFx0Ly8gaWYgbm90IGEgc2F2ZWQgcHVibGljYXRpb25cblx0XHRpZiAoIGdldFVybFBhcmFtZXRlcigndGltZScpICkgeyAvLyBkaWZmaWN1bHR5XG5cdFx0XHRQdWJsaWNhdGlvbi50aW1lTGVmdCA9IHRpbWVTZXQgPSBnZXRVcmxQYXJhbWV0ZXIoJ3RpbWUnKVxuXHRcdH1cblx0XHR4ID0gc2V0SW50ZXJ2YWwoZnVuY3Rpb24oKSB7XG5cdFx0XHRQdWJsaWNhdGlvbi50aW1lTGVmdCA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0IC0gMTA7XG5cdFx0XHRjb250cm9sbGVyKFB1YmxpY2F0aW9uKTtcblx0XHR9LCAxMClcblx0XHRtb3VzZUNvdW50ZXIoKVxuXHR9IGVsc2UgeyAvLyBzYXZlZCBwdWJsaWNhdGlvblxuXHRcdHJlbmRlclB1YmxpY2F0aW9uKFB1YmxpY2F0aW9uKVxuXHR9XG59KTtcblxuZnVuY3Rpb24gYWRkdGltZShib251c1RpbWUpIHtcblx0UHVibGljYXRpb24udGltZUxlZnQgPSBQdWJsaWNhdGlvbi50aW1lTGVmdCArIGJvbnVzVGltZTtcblx0YW5pbWF0ZXRpbWVjb3VudGVyKGJvbnVzVGltZSk7XG59XG5cbi8vIG1vZGlmeSBlbGVtZW50IGxpc3RlbmVyXG5mdW5jdGlvbiBvbk1vZEVsZW1lbnQoKSB7XG5cdGZvciAodmFyIHBhZ2VJZCBpbiBjYW52YXNlcykge1xuXHRcdGNhbnZhc2VzWyBwYWdlSWQgXS5vbignb2JqZWN0Om1vZGlmaWVkJywgZnVuY3Rpb24oZXZ0KSB7XG5cdFx0XHR2YXIgcGFyZW50Q2FudmFzSWQgPSBldnQudGFyZ2V0LmNhbnZhcy5sb3dlckNhbnZhc0VsLmlkXG5cdFx0XHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7IG1vdmU6IHRydWUsIHBhZ2U6IHBhcmVudENhbnZhc0lkfSlcblx0XHR9KVxuXHR9XG59XG5cbi8vIGdldCBtb3VzZSBwb3NpdGlvbiBvbiBjYW52YXNcbmZ1bmN0aW9uIGdldE1vdXNlUG9zKGNhbnZhcywgZSkge1xuICB2YXIgcG9pbnRlciA9IGNhbnZhcy5nZXRQb2ludGVyKGV2ZW50LCBlKVxuICB2YXIgcG9zWCA9IHBvaW50ZXIueFxuICB2YXIgcG9zWSA9IHBvaW50ZXIueVxuICByZXR1cm4ge1xuICAgIHg6IHBvc1gsXG4gICAgeTogcG9zWVxuICB9XG59XG5cbmNvbnN0IHBhZ2VzID0gJCgnLnBhZ2UnKVxuLy8gZHJvcCBlbGVtZW50XG5wYWdlcy5vbignZHJhZ292ZXInLCBmdW5jdGlvbihlKSB7XG5cdGUucHJldmVudERlZmF1bHQoKTtcbn0pO1xucGFnZXMub24oJ2RyYWdsZWF2ZScsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xufSk7XG5wYWdlcy5vbignZHJvcCcsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRjb25zb2xlLmxvZyhlKTtcblx0dmFyIGZpbGVzID0gZS5vcmlnaW5hbEV2ZW50LmRhdGFUcmFuc2Zlci5maWxlcztcblx0dmFyIHkgPSAwO1xuXHRmb3IgKHZhciBpID0gZmlsZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcblx0XHRyZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXHRcdHZhciBwYWdlSWQgPSAkKHRoaXMpLmZpbmQoJ2NhbnZhcycpLmF0dHIoJ2lkJyk7XG5cdFx0bW91c2VQb3MgPSBnZXRNb3VzZVBvcyhjYW52YXNlc1twYWdlSWRdLCBlKVxuXHRcdHJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdFx0Y29uc29sZS5sb2coZXZlbnQudGFyZ2V0KTtcblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGNvbnRyb2xsZXIoUHVibGljYXRpb24sIHtcblx0XHRcdFx0XHRkYXRhOiBldmVudC50YXJnZXQucmVzdWx0LFxuXHRcdFx0XHRcdHZpc2libGU6IHRydWUsXG5cdFx0XHRcdFx0cGFnZTogcGFnZUlkLFxuXHRcdFx0XHRcdG1vdXNlUG9zOiBtb3VzZVBvc1xuXHRcdFx0XHR9KTtcblx0XHRcdH0sIHkgKiBkcm9wRGVsYXkpO1xuXHRcdFx0eSArPSAxO1xuXHRcdH07XG5cdFx0Y29uc29sZS5sb2coZmlsZXNbaV0pO1xuXHRcdHJlYWRlci5yZWFkQXNEYXRhVVJMKGZpbGVzW2ldKTtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59KTtcbi8vIHByZXZlbnQgZHJvcCBvbiBib2R5XG4kKCdib2R5Jykub24oJ2RyYWdvdmVyJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG59KTtcbiQoJ2JvZHknKS5vbignZHJhZ2xlYXZlJywgZnVuY3Rpb24oZSkge1xuXHRlLnByZXZlbnREZWZhdWx0KCk7XG59KTtcbiQoJ2JvZHknKS5vbignZHJvcCcsIGZ1bmN0aW9uKGUpIHtcblx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRTb3VuZC5lcnJvcigpO1xufSk7XG5cbi8vIHJlbW92ZSBlbGVtZW50IChUT0RPOiBVUERBVEUgRk9SIEZBQlJJQylcbiQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcuY2xvc2UnLCBmdW5jdGlvbigpIHtcblx0dmFyIHBhZ2VJZCA9ICQodGhpcylcblx0XHQuY2xvc2VzdCgnLnBhZ2UnKVxuXHRcdC5hdHRyKCdpZCcpO1xuXHR2YXIgZWxlbWVudElkID0gJCh0aGlzKVxuXHRcdC5wYXJlbnQoKVxuXHRcdC5hdHRyKCdpZCcpO1xuXHR2YXIgZWxlbWVudERhdGEgPSAkKHRoaXMpXG5cdFx0LnNpYmxpbmdzKClcblx0XHQuYXR0cignc3JjJyk7XG5cdGNvbnRyb2xsZXIoUHVibGljYXRpb24sIHtcblx0XHRpZDogZWxlbWVudElkLFxuXHRcdGRhdGE6IGVsZW1lbnREYXRhLFxuXHRcdHBvczogWzAsIDAsIDAsIDAsIDBdLFxuXHRcdHZpc2libGU6IGZhbHNlLFxuXHRcdHBhZ2U6IHBhZ2VJZFxuXHR9KTtcbn0pO1xuXG4vLyBjaGFuZ2luZyB0aXRsZSAvLyBUT0RPIFVwZGF0ZVxuJCgnI3RpdGxlJykuY2hhbmdlKGZ1bmN0aW9uKCkge1xuXHRjb250cm9sbGVyKFB1YmxpY2F0aW9uLCB7XG5cdFx0dGl0bGU6ICQodGhpcykudmFsKClcblx0fSk7XG59KVxuXG5cblxuXG5cblxuLy8gLS0tIFZJRVdcblxudmFyIFNvdW5kID0ge1xuXHRlcnJvcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCdhc3NldHMvYXVkaW8vaW5jb3JyZWN0Lm1wMycpO1xuXHRcdGF1ZGlvLnBsYXkoKTtcblx0fSxcblx0ZGluZzogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGF1ZGlvID0gbmV3IEF1ZGlvKCdhc3NldHMvYXVkaW8vZGluZy5tcDMnKTtcblx0XHRhdWRpby5wbGF5KCk7XG5cdH1cbn07XG5cbi8vIFRPRE86IG1lcmdlIHRoZXNlIHR3b1xuZnVuY3Rpb24gc2hvd1RpbWUoUHVibGljYXRpb24pIHtcblx0c2Vjb25kcyA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0IC8gMTAwMDtcblx0JCgnI2NvdW50ZXInKS5zaG93KCk7XG5cdGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdjb3VudGVyJykuaW5uZXJIVE1MID1cblx0XHRzZWNvbmRzLnRvRml4ZWQoMikgKyAnIHNlY29uZHMgbGVmdCEnO1xufVxuZnVuY3Rpb24gbW91c2VDb3VudGVyKCkge1xuXHQkKGRvY3VtZW50KS5iaW5kKCdtb3VzZW1vdmUnLCBmdW5jdGlvbihlKSB7XG5cdFx0aWYgKGUucGFnZVggPj0gJChkb2N1bWVudCkud2lkdGgoKSAvIDIpIHtcblx0XHRcdC8vIGlmIG1vdXNlIG9mIHJpZ2h0IHNpZGUgb2YgcGFnZVxuXHRcdFx0JCgnI2NvdW50ZXInKS5hZGRDbGFzcygnbW91c2VfcmlnaHQnKTtcblx0XHRcdCQoJyNjb3VudGVyJykuY3NzKHtcblx0XHRcdFx0bGVmdDogZS5wYWdlWCAtIDIwIC0gJCgnI2NvdW50ZXInKS53aWR0aCgpLFxuXHRcdFx0XHR0b3A6IGUucGFnZVkgKyA1MFxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGlmIG1vdXNlIG9mIGxlZnQgc2lkZSBvZiBwYWdlXG5cdFx0XHQkKCcjY291bnRlcicpLnJlbW92ZUNsYXNzKCdtb3VzZV9yaWdodCcpO1xuXHRcdFx0JCgnI2NvdW50ZXInKS5jc3Moe1xuXHRcdFx0XHRsZWZ0OiBlLnBhZ2VYICsgMjAsXG5cdFx0XHRcdHRvcDogZS5wYWdlWSArIDUwXG5cdFx0XHR9KTtcblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBzaG93RXhwaXJlZCgpIHtcbiAgaWYgKFB1YmxpY2F0aW9uLmV4cGlyZWQgIT0gdHJ1ZSkge1xuICAgIFB1YmxpY2F0aW9uLnRpbWVFbGFwc2VkID0gdGltZVNldCAtIFB1YmxpY2F0aW9uLnRpbWVMZWZ0XG4gICAgUHVibGljYXRpb24uZXhwaXJlZCA9IHRydWVcbiAgICBsb2NrRWxlbWVudHMoYWxsRWxlbWVudHMoKSlcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAkKCcuc3VnZ2VzdGlvbnMnKS5oaWRlKClcbiAgICB9LCA4MDApXG4gIFx0ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvdW50ZXInKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICBcdCQoJ2JvZHknKS5hZGRDbGFzcygnZXhwaXJlZCcpXG4gIFx0ZXhwaXJlZFRpbWUoKVxuICAgIGZvciAoY2FudmFzIGluIGNhbnZhc2VzKSB7XG4gICAgICBjYW52YXNlc1tjYW52YXNdLnNlbGVjdGlvbiA9IGZhbHNlXG4gICAgfVxuICBcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICBcdFx0JCgnLndyYXBwZXInKS5hZGRDbGFzcygnc2F2ZWRfdmlldycpO1xuICBcdFx0c2F2ZWRTdGF0ZSgpXG4gIFx0fSwgNTAwKVxuICBcdGNsZWFySW50ZXJ2YWwoeClcbiAgICBpZiAodHlwZW9mIHkgIT09ICd1bmRlZmluZWQnKSB7IC8vIGlmIGRpc3J1cHRpb25zXG4gICAgICBjbGVhckludGVydmFsKHkpXG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGRyb3BFbGVtZW50KHBhZ2VJZCwgZGF0YSwgbW91c2VQb3MsIGNhbGxiYWNrKSB7XG5cdGNvbnNvbGUubG9nKG1vdXNlUG9zKVxuXHR2YXIgZWxlbWVudCA9IHsgZGF0YTogZGF0YSwgcGFnZTogcGFnZUlkIH1cblx0dmFyIGVsZW1lbnRQb3MgPSBjcmVhdGVFbGVtZW50KGVsZW1lbnQsIG1vdXNlUG9zLCBjYWxsYmFjaylcblx0U291bmQuZGluZygpXG59XG5cblxuXG5cblxuXG5cbi8vIGVycm9yc1xuXG52YXIgRXJyb3IgPSB7XG5cdG5vdEFsbG93ZWQ6IGZ1bmN0aW9uKCkge1xuXHRcdFNvdW5kLmVycm9yKClcblx0XHRhbGVydE1lc3NhZ2UoJ1RoZSBmaWxlIHlvdSBkcm9wcGVkIGlzIG5vdCBhbGxvd2VkIScpXG5cdH0sXG5cdHRvb0JpZzogZnVuY3Rpb24oKSB7XG5cdFx0U291bmQuZXJyb3IoKTtcblx0XHRhbGVydE1lc3NhZ2UoJ1RoZSBmaWxlIHlvdSBkcm9wcGVkIGlzIHRvbyBiaWchJyk7XG5cdH0sXG5cdHRvb0xhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdFNvdW5kLmVycm9yKCk7XG5cdFx0YWxlcnRNZXNzYWdlKCdUb28gbGF0ZSBhbWlnbycpO1xuXHR9XG59O1xuXG5cblxuLy8gVE9ETzogQ09OVkVSVCBUTyBGQUJSSUNcbmZ1bmN0aW9uIHJlbW92ZUVsZW1lbnQoaWQpIHtcblx0JCgnIycgKyBpZCkuaGlkZSgpO1xuXHRjb25zb2xlLmxvZyhpZCk7XG59XG5cbi8vIC0tLSBTQVZFRFxuXG5mdW5jdGlvbiByZW5kZXJQdWJsaWNhdGlvbihQdWJsaWNhdGlvbikge1xuICAvLyBUT0RPIHVwZGF0ZSB0aXRsZSBhbmQgYXV0aG9yc1xuXG5cdGZvciAodmFyIGNhbnZhc0lkIGluIGNhbnZhc2VzKSB7XG5cdFx0dmFyIGpzb24gPSBKU09OLnN0cmluZ2lmeShQdWJsaWNhdGlvbi5wYWdlc1tjYW52YXNJZF0pO1xuXHRcdGNhbnZhc2VzW2NhbnZhc0lkXS5sb2FkRnJvbUpTT04oIGpzb24sIGZ1bmN0aW9uKCkge1xuICAgICAgbG9ja0VsZW1lbnRzKGFsbEVsZW1lbnRzKCkpXG5cdFx0XHRjYW52YXNlc1tjYW52YXNJZF0ucmVuZGVyQWxsLmJpbmQoY2FudmFzZXNbY2FudmFzSWRdKVxuXHRcdH0pXG5cdH1cblxufVxuXG5cblxuXG4vLyAtLS0gQkFDS0VORFxuXG4vLyBzYXZlIHRvIGRiXG5mdW5jdGlvbiBzYXZldG9EYihwdWJsaWNhdGlvbikge1xuXHRmb3IgKHZhciBwYWdlIGluIFB1YmxpY2F0aW9uLnBhZ2VzKSB7XG5cdFx0UHVibGljYXRpb24ucGFnZXNbcGFnZV0gPSBjYW52YXNlc1twYWdlXS50b0pTT04oKSAvLyB1cGRhdGUgYWxsIHBhZ2VzXG5cdH1cblx0JC5hamF4KHtcblx0XHR1cmw6ICcvZGInLFxuXHRcdHR5cGU6ICdwb3N0JywgLy8gcGVyZm9ybWluZyBhIFBPU1QgcmVxdWVzdFxuXHRcdGRhdGE6IEpTT04uc3RyaW5naWZ5KFB1YmxpY2F0aW9uKSxcblx0XHRjb250ZW50VHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nLFxuXHRcdGRhdGFUeXBlOiAnanNvbicsXG5cdFx0c3VjY2VzczogZnVuY3Rpb24ocHVibGljYXRpb24pIHtcblx0XHRcdGNvbnNvbGUubG9nKCdwdWJsaWNhdGlvbiBzZW50IHRvIGRhdGFiYXNlLicpO1xuXHRcdH1cblx0fSk7XG5cdGNvbnNvbGUubG9nKCdzYXZlZD9pZD0nICsgUHVibGljYXRpb24uaWQpXG59XG5cblxuXG5cblxuLy8gLS0tIElOVEVSRkFDRSBGWFxuXG5cbi8vIG1vdmUgdGhlc2UgZnVuY3Rpb25zIHRvIGludGVyZmFjZSBwYXJ0IG9mIGpzP1xuZnVuY3Rpb24gYW5pbWF0ZVVwKG9iaikge1xuICBvYmouc2hvdygpO1xuICBvYmouY3NzKCdtYXJnaW4tdG9wJywgJzIwcHgnKTtcbiAgb2JqLmFuaW1hdGUoe1xuICAgICAgb3BhY2l0eTogMSxcbiAgICAgIG1hcmdpblRvcDogXCIwcHhcIixcbiAgICB9LCAzMDAwLCBmdW5jdGlvbigpIHtcbiAgICAgIC8vIEFuaW1hdGlvbiBjb21wbGV0ZS5cbiAgfSk7XG59O1xuXG5mdW5jdGlvbiBhbmltYXRlVXBPdXQob2JqLCB0aW1lKSB7XG4gIG9iai5zaG93KCk7XG4gIG9iai5jc3MoJ21hcmdpbi10b3AnLCAnMjBweCcpO1xuICBvYmouYW5pbWF0ZSh7XG4gICAgICBvcGFjaXR5OiAxLFxuICAgICAgbWFyZ2luVG9wOiBcIjBweFwiLFxuICAgIH0sIHRpbWUvMiwgZnVuY3Rpb24oKSB7XG4gICAgICAvLyBBbmltYXRpb24gY29tcGxldGUuXG4gIH0pO1xuICBvYmouYW5pbWF0ZSh7XG4gICAgICBvcGFjaXR5OiAwLFxuICAgICAgbWFyZ2luVG9wOiBcIjIwcHhcIixcbiAgICB9LCB0aW1lLzIsIGZ1bmN0aW9uKCkge1xuICAgICAgLy8gQW5pbWF0aW9uIGNvbXBsZXRlLlxuICB9KTtcbn07XG5cbmZ1bmN0aW9uIHNoYWtlKG9iaiwgdGltZSkge1xuICBpZiAoIXRpbWUpIChcbiAgICB0aW1lID0gNTAwXG4gIClcbiAgb2JqLmFkZENsYXNzKCAnc2hha2Ugc2hha2UtY29uc3RhbnQnIClcbiAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgIG9iai5yZW1vdmVDbGFzcyggJ3NoYWtlIHNoYWtlLWNvbnN0YW50JyApXG4gIH0sIHRpbWUpO1xufVxuXG5cblxuXG5cblxuLy8gLS0tIERJU1JVUFRJT05TXG5cblxuZnVuY3Rpb24gYWxsRWxlbWVudHModHlwZSkge1xuICB2YXIgb2JqcyA9IFtdXG4gIGZvciAoY2FudmFzIGluIGNhbnZhc2VzKSB7XG4gICAgaWYgKHR5cGUpIHtcbiAgICAgIGNhbnZhc09ianMgPSBjYW52YXNlc1tjYW52YXNdLmdldE9iamVjdHModHlwZSlcbiAgICB9IGVsc2Uge1xuICAgICAgY2FudmFzT2JqcyA9IGNhbnZhc2VzW2NhbnZhc10uZ2V0T2JqZWN0cygpXG4gICAgfVxuICAgIGZvciAodmFyIGkgPSBjYW52YXNPYmpzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBpZiAoY2FudmFzT2Jqc1tpXS5pZCAhPSAnbG9jaycpIHsgLy8gdXNlIHRoaXMgdG8gbG9ja1xuICAgICAgICBvYmpzLnB1c2goIGNhbnZhc09ianNbaV0gKVxuICAgICAgfVxuICAgIH1cbiAgfVxuICByZXR1cm4gb2Jqc1xufVxuXG4vLyBsb2NrIGVsZW1lbnRzXG5mdW5jdGlvbiBsb2NrRWxlbWVudHMob2Jqcykge1xuICBmb3IgKHZhciBpID0gb2Jqcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgIG9ianNbaV0uc2VsZWN0YWJsZSA9IGZhbHNlXG4gICAgb2Jqc1tpXS5oYXNDb250cm9scyA9IGZhbHNlXG4gICAgb2Jqc1tpXS5ob3ZlckN1cnNvciA9ICdkZWZhdWx0J1xuICB9XG59XG5cbmZ1bmN0aW9uIHJlbmRlckFsbENhbnZhc2VzKCkge1xuICBmb3IgKGNhbnZhc0lkIGluIGNhbnZhc2VzKSB7XG4gICAgY2FudmFzZXNbY2FudmFzSWRdLnJlbmRlckFsbCgpXG4gIH1cbn1cblxuZnVuY3Rpb24gZmlsdGVySW1ncyhvYmpzLCBmaWx0ZXIpIHtcbiAgZm9yICh2YXIgaSA9IG9ianMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBvYmpzW2ldLmZpbHRlcnMucHVzaChmaWx0ZXIpXG4gICAgb2Jqc1tpXS5hcHBseUZpbHRlcnMoKVxuICB9XG4gIHJlbmRlckFsbENhbnZhc2VzKClcbn1cblxudmFyIERpc3J1cHRpb24gPSB7XG5cdGNvbWljOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfY29taWMob2Jqcykge1xuICAgICAgZm9yICh2YXIgaSA9IG9ianMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgb2Jqc1tpXS5mb250RmFtaWx5ID0gJ1wiQ29taWMgU2FucyBNU1wiJ1xuICAgICAgfVxuICAgIH1cbiAgICBfY29taWMoIGFsbEVsZW1lbnRzKCd0ZXh0JykgKVxuICAgIF9jb21pYyggYWxsRWxlbWVudHMoJ3RleHRib3gnKSApXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ0NhblxcJ3QgeW91IHNwaWNlIHRoZSB0eXBvZ3JhcGh5IGEgYml0PycsICdHdXRlbmJlcmcnKVxuXHR9LFxuXHRyb3RhdGVJbWdzUmFuZDogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX3JvdGF0ZUltZ3NSYW5kKG9ianMpIHtcbiAgICAgIGZvciAodmFyIGkgPSBvYmpzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgIG9ianNbaV0ub3JpZ2luWCA9ICdjZW50ZXInXG4gICAgICAgIG9ianNbaV0ub3JpZ2luWSA9ICdjZW50ZXInXG4gICAgICAgIG9ianNbaV0uYW5pbWF0ZSh7IGFuZ2xlOiBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAzNjApIH0sIHtcbiAgICAgICAgICBkdXJhdGlvbjogMTAwMCxcbiAgICAgICAgICBvbkNoYW5nZTogb2Jqc1tpXS5jYW52YXMucmVuZGVyQWxsLmJpbmQob2Jqc1tpXS5jYW52YXMpLFxuICAgICAgICAgIGVhc2luZzogZnVuY3Rpb24odCwgYiwgYywgZCkgeyByZXR1cm4gYyp0L2QgKyBiIH1cbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gICAgX3JvdGF0ZUltZ3NSYW5kKGFsbEVsZW1lbnRzKCdpbWFnZScpKVxuICAgIGNyaXRpY1NheXMoJ0kgZmluZCB0aGlzIGxheW91dCBhIGJpdCBzdGF0aWMuLi4nLCAnR3V0ZW5iZXJnJylcblx0fSxcblx0bG9ja1JhbmRQYWdlOiBmdW5jdGlvbigpIHtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGNhbnZhc2VzKVxuICAgIHJhbmRDYW52YXMgPSBjYW52YXNlc1trZXlzWyBrZXlzLmxlbmd0aCAqIE1hdGgucmFuZG9tKCkgPDwgMF1dXG5cdFx0cmFuZENhbnZhcy5zZWxlY3Rpb24gPSBmYWxzZTtcblx0XHRmb3IgKG9iamVjdElkIGluIHJhbmRDYW52YXMuZ2V0T2JqZWN0cygpICkge1xuXHRcdFx0dmFyIG9iamVjdCA9IHJhbmRDYW52YXMuaXRlbShvYmplY3RJZClcblx0XHRcdG9iamVjdC5zZWxlY3RhYmxlID0gZmFsc2Vcblx0XHRcdG9iamVjdC5ob3ZlckN1cnNvciA9ICdkZWZhdWx0J1xuXHRcdH1cblx0XHRyYW5kQ2FudmFzLmFkZChuZXcgZmFicmljLkxpbmUoWzAsIDAsIHJhbmRDYW52YXMud2lkdGgsIHJhbmRDYW52YXMuaGVpZ2h0XSwge1xuXHQgIFx0c3Ryb2tlOiAncmVkJyxcblx0ICBcdHNlbGVjdGFibGU6IGZhbHNlLFxuXHQgIFx0c3Ryb2tlV2lkdGg6IDIsXG4gICAgICBob3ZlckN1cnNvcjonZGVmYXVsdCcsXG4gICAgICBpZDogJ2xvY2snXG5cdFx0fSkpXG5cdFx0cmFuZENhbnZhcy5yZW5kZXJBbGwoKTtcblx0XHQvLyBUT0RPOiBwcmV2ZW50IGRyb3BcbiAgICBjcml0aWNTYXlzKCdQYWdlICcgKyByYW5kQ2FudmFzLmlkICsgJyBpcyBub3cgbG9ja2VkLi4uJywgJ0d1dGVuYmVyZycpIC8vIFRPRE9cblx0fSxcbiAgc2h1ZmZsZVBhZ2VzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdG9TaHVmZmxlID0gW11cbiAgICB2YXIgaSA9IDBcbiAgICBmb3IgKGNhbnZhc0lkIGluIGNhbnZhc2VzKSB7XG4gICAgICBpZiAoaSA+IDApIHsgLy8gcHJldmVudCBzaHVmZmxpbmcgZmlyc3QgcGFnZVxuICAgICAgICB0b1NodWZmbGUucHVzaCggY2FudmFzZXNbY2FudmFzSWRdLnRvSlNPTigpIClcbiAgICAgIH1cbiAgICAgIGkgKz0gMVxuICAgIH1cbiAgICBzaHVmZmxlQXJyYXkodG9TaHVmZmxlKVxuICAgIHZhciB5ID0gMFxuICAgIGZvciAoY2FudmFzSWQgaW4gY2FudmFzZXMpIHtcbiAgICAgIGlmICh5ID4gMCkge1xuICAgICAgICBjYW52YXNlc1tjYW52YXNJZF0ubG9hZEZyb21KU09OKHRvU2h1ZmZsZVt5IC0gMV0sIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGNhbnZhc2VzW2NhbnZhc0lkXS5yZW5kZXJBbGwuYmluZChjYW52YXNlc1tjYW52YXNJZF0pXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgICB5ICs9IDFcbiAgICB9XG4gICAgY3JpdGljU2F5cygnVGhlIHJ5dGhtIG9mIHRoaXMgcHVibGljYXRpb24gaXMgYSBiaXQgd2Vhay4gRG9uXFwndCB5b3UgdGhpbms/JywgJ0d1dGVuYmVyZycpXG4gIH0sXG5cdGFkczogZnVuY3Rpb24gKCkge1xuXHRcdHZhciBrZXlzID0gT2JqZWN0LmtleXMoY2FudmFzZXMpXG4gICAgcmFuZENhbnZhcyA9IGNhbnZhc2VzW2tleXNbIGtleXMubGVuZ3RoICogTWF0aC5yYW5kb20oKSA8PCAwXV1cblx0XHRyYW5kQ2FudmFzLmFkZChuZXcgZmFicmljLlJlY3Qoe1xuXHRcdFx0d2lkdGg6IHJhbmRDYW52YXMud2lkdGgsXG5cdFx0XHRoZWlnaHQ6IDMwLFxuXHRcdFx0ZmlsbDogJyMwRDIxM0UnLFxuXHRcdFx0bG9ja01vdmVtZW50WDogdHJ1ZSxcblx0XHRcdGxvY2tNb3ZlbWVudFk6IHRydWUsXG5cdFx0XHRsb2NrUm90YXRpb246IHRydWUsXG5cdFx0XHRoYXNDb250cm9sczogZmFsc2UsXG4gICAgICBzZWxlY3RhYmxlOiBmYWxzZSxcblx0XHRcdGxlZnQ6IHJhbmRDYW52YXMud2lkdGgvMixcblx0XHRcdHRvcDogMTUsXG4gICAgICBzZWxlY3RhYmxlOiBmYWxzZSxcbiAgICAgIGlkOiAnbG9jaydcblx0XHR9KSk7XG5cdFx0ZmFicmljLkltYWdlLmZyb21VUkwoJy9hc3NldHMvaW1nL2tpbmtvLnBuZycsIGZ1bmN0aW9uKGltZyl7XG5cdFx0XHRcdGltZy5oYXNCb3JkZXJzID0gZmFsc2U7XG5cdFx0XHRcdGltZy5oYXNDb250cm9scyA9IGZhbHNlO1xuICAgICAgICBpbWcuc2VsZWN0YWJsZSA9IGZhbHNlO1xuXHRcdFx0XHRpbWcuc2NhbGUoMC4yKTtcblx0XHRcdFx0aW1nLmxlZnQgPSByYW5kQ2FudmFzLndpZHRoLTEwMDtcblx0XHRcdFx0aW1nLnRvcCA9IDUwO1xuXHRcdFx0XHRpbWcubG9ja01vdmVtZW50WCA9IHRydWU7XG5cdFx0XHRcdGltZy5sb2NrTW92ZW1lbnRZID0gdHJ1ZTtcblx0XHRcdFx0aW1nLmxvY2tSb3RhdGlvbiA9IHRydWU7XG5cdFx0XHRcdGltZy5zZXRDb250cm9sc1Zpc2liaWxpdHkgPSBmYWxzZTtcbiAgICAgICAgaW1nLmlkID0gJ2xvY2snXG5cdFx0XHRcdHJhbmRDYW52YXMuaW5zZXJ0QXQoaW1nLDMpO1xuXHRcdFx0XHQvLyBUT0RPOiBpdCBvbmx5IHdvcmtzIHdpdGggb25lIGltYWdlIGZvciBzb21lIHJlYXNvbi4gcnVubmluZyB0aGUgZnVuY3Rpb24gbXVsdGlwbGUgdGltZXMgaXQgYWRkcyBtb3JlIHRvcCBiYXJzIGJ1dCBqdXN0IG1vdmVzIGFsbCB0aGUgaW1hZ2VzIHRvIHRoZSBzYW1lIHBsYWNlXG5cdFx0fSk7XG5cbiAgICBjcml0aWNTYXlzKCdJIGZvdW5kIGEgc3BvbnNvciEnLCAnR3V0ZW5iZXJnJylcblx0fSxcbiAgaGFsZlRpbWU6IGZ1bmN0aW9uICgpIHtcbiAgICBQdWJsaWNhdGlvbi50aW1lTGVmdCA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0IC8gMlxuICAgIGNyaXRpY1NheXMoJ1RoaXMgaXMgdGFraW5nIHRvbyBsb25nLi4uJywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIGRvdWJsZVRpbWU6IGZ1bmN0aW9uICgpIHtcbiAgICBQdWJsaWNhdGlvbi50aW1lTGVmdCA9IFB1YmxpY2F0aW9uLnRpbWVMZWZ0ICogMlxuICAgIGNyaXRpY1NheXMoJ1Rha2UgeW91ciB0aW1lLi4uJywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIGdyZXlzY2FsZUltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZpbHRlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJyksIG5ldyBmYWJyaWMuSW1hZ2UuZmlsdGVycy5HcmF5c2NhbGUoKSApXG4gICAgY3JpdGljU2F5cygnU2hhbGwgd2UgbWFrZSBpdCBsb29rIGNsYXNzaWM/JywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIGludmVydEltZ3M6IGZ1bmN0aW9uKCkge1xuICAgIGZpbHRlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJyksIG5ldyBmYWJyaWMuSW1hZ2UuZmlsdGVycy5JbnZlcnQoKSApXG4gICAgY3JpdGljU2F5cygnVGhlIHZpc3VhbHMgbmVlZCBzb21lIGVkZ3kgY29sb3JzJywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIHNlcGlhSW1nczogZnVuY3Rpb24oKSB7XG4gICAgZmlsdGVySW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSwgbmV3IGZhYnJpYy5JbWFnZS5maWx0ZXJzLlNlcGlhKCkgKVxuICAgIGNyaXRpY1NheXMoJ0V2ZXIgaGVhcmQgb2YgSW5zdGFncmFtPycsICdHdXRlbmJlcmcnKVxuICB9LFxuICBibGFja3doaXRlSW1nczogZnVuY3Rpb24oKSB7XG4gICAgZmlsdGVySW1ncyhhbGxFbGVtZW50cygnaW1hZ2UnKSwgbmV3IGZhYnJpYy5JbWFnZS5maWx0ZXJzLkJsYWNrV2hpdGUoKSApXG4gICAgY3JpdGljU2F5cygnVGhpcyBzaG91bGQgbG9vayBsaWtlIGEgemluZSEnLCAnR3V0ZW5iZXJnJylcbiAgfSxcbiAgcGl4ZWxhdGVJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmaWx0ZXJJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpLCBuZXcgZmFicmljLkltYWdlLmZpbHRlcnMuUGl4ZWxhdGUoe2Jsb2Nrc2l6ZTogMjB9KSApXG4gICAgY3JpdGljU2F5cygnSXNuXFwndCB0aGlzIGEgdmlkZW9nYW1lIGFmdGVyIGFsbD8nLCAnR3V0ZW5iZXJnJylcbiAgfSxcbiAgbm9pc2VJbWdzOiBmdW5jdGlvbigpIHtcbiAgICBmaWx0ZXJJbWdzKGFsbEVsZW1lbnRzKCdpbWFnZScpLCBuZXcgZmFicmljLkltYWdlLmZpbHRlcnMuTm9pc2Uoe25vaXNlOiAyMDB9KSApXG4gICAgY3JpdGljU2F5cygnTUFLRSBTT01FIE5PT0lTRSEhJywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIGZvbnRTaXplQmlnZ2VyOiBmdW5jdGlvbigpIHtcbiAgICBmdW5jdGlvbiBfZm9udFNpemVCaWdnZXIoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNbaV0uc2V0KCdmb250U2l6ZScsIGVsZW1lbnRzW2ldLmZvbnRTaXplICogc2NhbGVGb250KTtcbiAgICAgIH1cbiAgICB9XG4gICAgX2ZvbnRTaXplQmlnZ2VyKGFsbEVsZW1lbnRzKCd0ZXh0Ym94JykpXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ0NhblxcJ3QgcmVhZCBhbnl0aGluZyA6KCcsICdHdXRlbmJlcmcnKVxuICB9LFxuICBmb250U2l6ZVNtYWxsZXI6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9mb250U2l6ZUJpZ2dlcihlbGVtZW50cykge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBlbGVtZW50c1tpXS5zZXQoJ2ZvbnRTaXplJywgZWxlbWVudHNbaV0uZm9udFNpemUgLyBzY2FsZUZvbnQpO1xuICAgICAgfVxuICAgIH1cbiAgICBfZm9udFNpemVTbWFsbGVyKGFsbEVsZW1lbnRzKCd0ZXh0Ym94JykpXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ0lcXCdtIG5vdCBibGluZCEnLCAnR3V0ZW5iZXJnJylcbiAgfSxcbiAgYmlnZ2VySW1nczogZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gX2JpZ2dlckltZ3MoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNbaV0uc2V0KHtcbiAgICAgICAgICBzY2FsZVk6IHNjYWxlSW1ncyxcbiAgICAgICAgICBzY2FsZVg6IHNjYWxlSW1nc1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gICAgX2JpZ2dlckltZ3MoYWxsRWxlbWVudHMoJ2ltYWdlJykpXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ0JMT1cgVVAhJywgJ0d1dGVuYmVyZycpXG4gIH0sXG4gIGxvY2tBbGxFbGVtZW50czogZnVuY3Rpb24oKSB7XG4gICAgbG9ja0VsZW1lbnRzKGFsbEVsZW1lbnRzKCkpXG4gICAgY3JpdGljU2F5cygnVGhpbmdzIGFyZSBwZXJmZWN0IGFzIHRoZXkgYXJlLicsICdHdXRlbmJlcmcnKVxuICB9LFxuICBza2V3QWxsRWxlbWVudHM6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9za2V3QWxsRWxlbWVudHMoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNbaV0uc2V0KHtcbiAgICAgICAgICBzY2FsZVk6IHNjYWxlSW1ncyxcbiAgICAgICAgICBzY2FsZVg6IHNjYWxlSW1ncyxcbiAgICAgICAgICB0cmFuc2Zvcm1NYXRyaXg6IFsxLCAuNTAsIDAsIDEsIDAsIDBdXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICAgIF9za2V3QWxsRWxlbWVudHMoYWxsRWxlbWVudHMoJ2ltYWdlJykpXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ1N0cmV0Y2ggdGhvc2UgaW1hZ2VzLCBjb21lIG9uIScsICdHdXRlbmJlcmcnKVxuICB9LFxuICBmbGlwQWxsRWxlbWVudHM6IGZ1bmN0aW9uKCkge1xuICAgIGZ1bmN0aW9uIF9mbGlwQWxsRWxlbWVudHMoZWxlbWVudHMpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZWxlbWVudHNbaV0uc2V0KHtcbiAgICAgICAgICBhbmdsZTogJy0xODAnLFxuICAgICAgICAgIGZsaXBZOiB0cnVlXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICAgIF9mbGlwQWxsRWxlbWVudHMoYWxsRWxlbWVudHMoJ2ltYWdlJykpXG4gICAgcmVuZGVyQWxsQ2FudmFzZXMoKVxuICAgIGNyaXRpY1NheXMoJ1N0cmV0Y2ggdGhvc2UgaW1hZ2VzLCBjb21lIG9uIScsICdHdXRlbmJlcmcnKVxuICB9XG59O1xuXG5cbi8vIC0tLSBJTlRFUkZBQ0UgQlVUVE9OU1xuXG4kKCcuYnV0dG9uLnNhdmUnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgJCgnLmJ1dHRvbi5zYXZlJykuaGlkZSgpXG4gICQoJy5idXR0b24ucGRmLCAuYnV0dG9uLmJvb2tsZXQnKS5jc3MoJ2Rpc3BsYXknLCdpbmxpbmUtYmxvY2snKVxufSlcbiJdLCJmaWxlIjoibWFpbi5qcyJ9
