const fs = require('fs');
console.log("Init custom user data container");
var data;
var dataString = fs.readFileSync('config/custom user data/data.json', 'utf8');
if(dataString){
	data = JSON.parse(dataString);
} else {
	data = {};
}
EXPYields = {"": 10, trainer: 10, council: 20, leader: 30};

isWriting = false;
lastBackupDate = null;

module.exports = {
	data: data,
	EXPYields: EXPYields,
	isWriting: isWriting,
	lastBackupDate: lastBackupDate	
}