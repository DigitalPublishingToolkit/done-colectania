const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const fs = require('fs')
const fabric = require('fabric').fabric
const stream = require('stream')
const path = require('path')
const async = require('async')
const PDFDocument = require('pdfkit')
const SVGtoPDF = require('svg-to-pdfkit')

const express = require('express')
const app = express()
const port = 3000



// --- DB STUFF

mongoose.connect('mongodb://admin:donecolectania2018@ds135820.mlab.com:35820/done-colectania', { useMongoClient: true })
const db = mongoose.connection;

// how to avoid declaring the publication schema here?
var publicationSchema = mongoose.Schema({
  id: String,
  title: String,
  date: Number,
  expired: Boolean,
  pages: Object
})

var Publication = mongoose.model('Publication', publicationSchema)





// --- SERVER STUFF

app.set('view engine', 'pug')
app.use(express.json({limit: '50mb'}))
app.use(express.urlencoded({ extended: true, limit: '50mb'}));
// static
app.use(express.static('public'))

// intro
app.get('/', function (req, res) {

  // find all publications
  Publication.find(function (err, publications) {
    if (err) return console.error(err);

    res.render(__dirname + '/../source/views/intro', {
      publications: publications
    })

    console.log('serving intro')
  })
})

// splash
app.get('/splash', function (req, res) {
  res.render(__dirname + '/../source/views/splash')
  console.log('serving splash')
})


// difficulty
app.get('/difficulty', function (req, res) {
  res.render(__dirname + '/../source/views/difficulty')
  console.log('serving difficulty')
})

// game
app.get('/game', function (req, res) {
  res.render(__dirname + '/../source/views/game')
  console.log('serving game')
})

// archive
app.get('/archive', function (req, res) {

  // find all publications
  Publication.find(function (err, _publications) {
    if (err) return console.error(err);

    res.render(__dirname + '/../source/views/archive', {
      publications: _publications
    })

    console.log('serving archive')
  })

})

// save to db
app.post('/db', function(req, res) {
    var publication = new Publication( req.body )
    publication.save(function (err, publication) {
      if (err) return console.error(err);
      console.log('saved to db')
    });

    console.log('saving to db');
});

// show saved
app.get('/saved', function (req, res) {
  var publication_id = req.param('id'); // e.g. http://localhost:3000/saved?id=R1516627472029

  // find publication
  var publication_model
  Publication.findOne({ 'id': publication_id }, function (err, publication) {
    if (err) return console.error(err);

    publication_model = publication
    publication_model = JSON.stringify(publication_model)

    // script to insert the saved model into saved
    var publication_script = '<script>var Publication = ' +  publication_model + ';</script>'

    res.render(__dirname + '/../source/views/saved', { publication_script: publication_script })
  })
  console.log('serving saved publication')
})


// serve pdf
app.get('/pdf', function (req, res) {
  var publication_id = req.param('id'); // e.g. http://localhost:3000/pdf?id=I1519673917344
  var booklet = req.param('booklet'); // e.g. http://localhost:3000/pdf?id=I15196739173440&booklet=true

  const canvasWidth = 450
  const canvasHeight = 636
  const pageWidth = canvasWidth/1.34
  const pageHeight = canvasHeight/1.34

  // find publication
  var publication_model
  Publication.findOne({ 'id': publication_id }, function (err, publication) {
    if (err) return console.error(err);

    var canvases = []

    const tasks = [
      function makeCanvases(callback) {
        for (var i = 1; i < 9; i++) {
          var canvas = new fabric.StaticCanvas('c') // random name
          canvas.setWidth(canvasWidth)
          canvas.setHeight(canvasHeight)
          var pages = publication.pages
          if ( pages.hasOwnProperty('p' + i) ) { // if not empty
            canvas.loadFromJSON(pages['p' + i]);
          }
          canvases.push(canvas)
        }

        callback(null)
      },
      function makePdf(callback) {

        if (booklet != 'true') {

          doc = new PDFDocument({size:[pageWidth, pageHeight]})

          var i = 0
          canvases.forEach(function(canvas) {
            SVGtoPDF(doc, canvas.toSVG(), 0, 0) // TODO: preserve fonts
            if (i != canvases.length - 1) {
              doc.addPage()
            }
            i++
          })

          res.writeHead(200, {
            'Content-Type': 'application/pdf',
            'Access-Control-Allow-Origin': '*',
            'Content-Disposition': 'filename=' + publication_id + '.pdf'
          });

          doc.pipe(res).on('finish', function() {
            console.log('single page pdf was successfully created')
          })

          doc.end()

        } else {

          doc = new PDFDocument({size:[pageWidth*2, pageHeight]})

          // all the -1 to have a normal page number
          SVGtoPDF(doc, canvases[8-1].toSVG(), 0, 0);
          SVGtoPDF(doc, canvases[1-1].toSVG(), pageWidth, 0);
          doc.addPage()
          SVGtoPDF(doc, canvases[2-1].toSVG(), 0, 0);
          SVGtoPDF(doc, canvases[7-1].toSVG(), pageWidth, 0);
          doc.addPage()
          SVGtoPDF(doc, canvases[6-1].toSVG(), 0, 0);
          SVGtoPDF(doc, canvases[3-1].toSVG(), pageWidth, 0);
          doc.addPage()
          SVGtoPDF(doc, canvases[4-1].toSVG(), 0, 0);
          SVGtoPDF(doc, canvases[5-1].toSVG(), pageWidth, 0);

          doc.pipe(res).on('finish', function() {
            console.log('booklet pdf was successfully created')
          })

          doc.end()

        }
      }
    ]

    async.series(tasks, (err) => {
        if (err) {
            return next(err);
        }
    })

  })

  console.log('serving pdf')

})

// show all publications in console
app.get('/overview', function (req, res) {
  Publication.find(function (err, publications) {
    if (err) return console.error(err);
    console.log(publications);
  })
})

// ------------------------------------------
// set the port of our application
// process.env.PORT lets the port be set by Heroku
var portset = process.env.PORT || port;

app.listen(portset, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

	console.log('server is listening on http://localhost:' + portset);
});
