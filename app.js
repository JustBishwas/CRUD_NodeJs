var express = require('express');
var routes =  require('./routes');
var http = require('http');
var path =  require('path');
var urlencoded =  require('url');
var bodyParser = require('body-parser');
var json = require('pug');
var logger = require('logger');
var methodoverride =  require('method-override');

var nano = require('nano')('http://localhost:5984');

var db = nano.use('address'); 
var app = express();

app.set('port', process.env.PORT || 3000);
app.set('views',path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(methodoverride());
app.use(express.static(path.join(__dirname,'public')));

app.get('/routes/index');

app.post('/routes/createdb',function(req, res){
	nano.db.create(req.body.dbname,function(err){
		if (err) {
			console.log("error creating database" +req.body.dbname);
			return;
		}
		console.log("Database" +req.body.dbname +"created successfully");
	});
});

app.post('/new_contacts',function(req, res){
	var name = req.body.name;
	var phone = req.body.phone;

	db.insert({name:name, phone:phone, crazy:true}, phone, function(err, body, header){
		if (err) {
			req.end("error creating contact");
			return;
		}
		req.end("contact created successfully");
	});
});

app.post('/view_contact',function(req, res){
	var alldoc = "Following are the contacts";
	db.get(req.body.phone,{revs_info:true},function(err,body){
		if (err) {
			console.log(body);
		}
		if (body) {
			alldoc += "Name: "+body.name+"<br>Phone Number:" +body.phone;
		}
		else
		{
			alldoc = "No records found";
		}
		res.end(alldoc);
	});
});

app.post('/delete_contacts',function(req, res){
	db.get(req.body.phone,{revs_info:true},function(err, body){
		if (!err) {
			db.destroy(req.body.phone, body._revs, function(err, body){
			if (err) {
				res.end("error deleteing contact");
			}
		});
				res.end("contacts deleted successfully");
			}
	});
});


http.createServer(app).listen(app.get('port'),function(){
	console.log('Express server listenning on port' +app.get('port'));
})

