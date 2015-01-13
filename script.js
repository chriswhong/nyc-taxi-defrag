var lineReader = require('line-reader');
var open = require('open');
var fs = require('fs');
var moment = require('moment');

var args = process.argv.slice(2); 
var rowheight = 4;
var row = 0;
var count = 0;
var tripsArray = [];
var currentMedallion;

//setup the canvas
var Canvas = require('canvas'), 
	Image = Canvas.Image,
	canvas = new Canvas(1440,1440),
  ctx = canvas.getContext('2d');

//parse the csv
lineReader.eachLine(args[0], function(line, last) {

	//skip header row
	if(count==0) {
		count++;
	}	else {
  
  	//this is bad.  I know I don't need all the rows, so just draw the final png at 60,000
	  if(count > 60000){
	  	writeFile();
	  	return false;
	  }

	  //split the csv line
	  var values = line.split(',');
	  var medallion = values[0];

	  //figure out whether we are on the same cab/day or a new cab/day.  
	  //If new, send the data from the previous cab/day to processCab/Day
	  if(currentMedallion!=medallion){
	  	currentMedallion = medallion;
	  	if(tripsArray.length>0){
	  		processCabDay(tripsArray);
	  	}
	  	tripsArray=[];
	  }

	  //use moment.js to parse timestamps
	  var pickup = moment(values[1]);
	  var dropoff = moment(values[2]);

	  //convert hours and minutes to just minutes elapsed since midnight
	  pickup = (pickup.hour()*60) + pickup.minute();
	  dropoff = (dropoff.hour()*60) + dropoff.minute();

	  var trip = {
	  	pickup:pickup,
	  	dropoff:dropoff
	  }

	  tripsArray.push(trip);

	  count++;

	}
});

function processCabDay(tripsArray) {
	console.log(tripsArray);
		ctx.fillStyle = "rgba(0, 0, 0, 1)";
		ctx.fillRect( 0, row * rowheight, 1440, rowheight );
	tripsArray.forEach(function(trip) {
		if(trip.pickup>trip.dropoff) {
			trip.dropoff = 1440;
		}
			ctx.fillStyle = "rgba(255, 226, 0, 1)";
			ctx.fillRect( trip.pickup, row * rowheight, trip.dropoff-trip.pickup, rowheight );
		
	})
	console.log(row);
	row++;
}


function writeFile() {
	var imgString = '<img src="' + canvas.toDataURL() + '" />';

	fs.writeFile("image.html", imgString, function(err) {
	    if(err) {
	        console.log(err);
	    } else {
	        console.log("The file was saved!");
	        open('http://localhost/~chriswhong/canvasTest/image.html');
	    }
	}); 
}

