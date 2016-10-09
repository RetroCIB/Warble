var express = require('express');
var path = require('path');
const webpack = require('webpack');

var http = require('http');

const socketIO = require('socket.io');


var app = express();
var server = http.createServer(app);

const io = socketIO(server);


const webpackHotMiddleware = require('webpack-hot-middleware');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackConfig = require('../webpack.config.js');
const compiler = webpack(webpackConfig);

app.use(express.static(path.resolve('public')));
app.use(webpackDevMiddleware(compiler, {
	noInfo: true, publicPath: webpackConfig.output.publicPath
}));

app.use(webpackHotMiddleware(compiler));


app.get('*', function(req, res){
	res.sendFile(path.resolve('public/index.html'));
});

var rooms = [];

var Room = function(){
	this.id = Math.floor((Math.random() * 10000) + 1);;
	this.space = [];

}

Room.prototype = {
	constructor: Room,
	isFull: function(){
		if(this.space.length == 2) return true
		else return false;
	},
	addUser: function(id){
		this.space.push(id);
	},
	getRoom:function(){
		return this.space;
	}
}





io.on('connection', function(socket) {
    
    socket.on('pID', function(data){
    	var occupied = false;
    	console.log(data[0]);
    	rooms.every(function(room,index){
    		console.log(index);
    		if(!room.isFull()){
    			console.log("room not full " +index);
    			occupied = true;
    			room.addUser(data);
    			data.push(room.id);
    			data.push(socket.id);
    			
    			console.log(data.current);
    			socket.emit('joinRoom', room.space);
    			console.log(JSON.stringify(rooms));
    			
    			return false;
    		}
    		else {return true;}
    		
    		
    	});
    	
	    	if (occupied == false) {
	    		occupied = true;
				var newRoom = new Room();
				data.push(newRoom.id);
    			data.push(socket.id);
				newRoom.addUser(data);
				rooms.push(newRoom);
				socket.emit('joinRoom',newRoom.space);
				console.log(JSON.stringify(rooms));
		
		}
    	
    });

    socket.on('disconnect', function(){
    	console.log("disconnected");
    	var indexToDel = '';
    	rooms.every(function(room, index) {

    		room.space.every(function(user, index_user){
    			if (user[2] == socket.id) {
    				indexToDel = index_user;
    				console.log(indexToDel);
    				room.space.splice(indexToDel, 1);
    				
    				return false;
    			}
    			return true;
    			
    		});
    		
    		
    		return true;


    	});
    	

    	console.log(JSON.stringify(rooms));
    });
   
});




var PORT = process.env.PORT || 3000;

server.listen(PORT, function(){
	console.log("listening on port " + PORT);
});
