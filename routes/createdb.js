exports.create = function(req, res){
	nano.db.create(req.body.dbname, function(){
		if (err) {
			res.end("Error creating database");
			return;
		}
		res.end("database created successfully");
	});
};