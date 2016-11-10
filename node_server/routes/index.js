var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/upload', function (req, res) {
	var buff = new Buffer(req.files.file.data, 'base64');
	
	var filePath = path.join(__dirname, "..", "public", "files", req.files.file.name);
	var fd =  fs.openSync(filePath, 'w');
	
	fs.write(fd, buff, 0, buff.length, 0, function (error, wrritten) {
		if (error) {
			throw err;
		} else {
			res.send("success");
		}
	});
});

module.exports = router;
