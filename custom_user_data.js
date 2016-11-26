const fs = require('fs');
var CustomUserDataManager  = function(){
	console.log("Init CustomUserDataManager");
	var dataString = fs.readFileSync('config/custom user data/data.json', 'utf8');
	if(dataString){
		this.data = JSON.parse(dataString);
	} else {
		this.data = {};
	}
	this.EXPYields = {trainer: 10, council: 20, leader: 30};
	var _this = this;
	_this.isWriting = false;
	_this.lastBackupDate = null;
}

CustomUserDataManager.prototype.updateUser = function(userId, key, value){
	if(!this.data[userId]){
		this.registerNewUser(userId);
	}
	this.data[userId][key]=value;	
}

CustomUserDataManager.prototype.getUserData = function(userId, key){
	if(!this.data[userId]){
		return {error: 1};
	}
	return this.data[userId][key];	
}

CustomUserDataManager.prototype.registerNewUser = function(userId){
	this.data[userId] = {};
	this.data[userId].isChallenger = false;
	this.data[userId].typeLoyalty = "";
	this.data[userId].position = "";	
	this.data[userId].EXP = 0;	
	this.data[userId].badges = {};	
}

CustomUserDataManager.prototype.updateEXP = function(targetUser, battledUser, win){
	console.log("syncData updateEXP");
	if(!this.data[targetUser]){
		this.registerNewUser(targetUser);
	}
	if(!this.data[battledUser]){
		this.registerNewUser(battledUser);
	}
	if(this.data[targetUser].isChallenger){
		//no exp
	} else if(this.data[battledUser].isChallenger){
		var position = this.data[targetUser].position;
		if(position){
			if(win){
				this.data[targetUser].EXP+=this.EXPYields[position];
			} else{
				this.data[targetUser].EXP+=this.EXPYields[position]/2;
			}
		}		
	}	
	this.syncData();
}

CustomUserDataManager.prototype.syncData = function(){
	var _this = this;
	if(!_this.isWriting){
		_this.isWriting = true;		
		var d = new Date();
		var n = d.getTime(); 
		if(!_this.lastBackupDate || n - _this.lastBackupDate > (1000*60*60) ){
			_this.lastBackupDate = n;
			console.log("create backup CustomUserDataManager");
			fs.writeFile('config/custom user data/backup/data.json.'+_this.lastBackupDate, JSON.stringify(_this.data), function(){
				console.log("syncData CustomUserDataManager");
				fs.writeFile('config/custom user data/data.json', JSON.stringify(_this.data), function(){
					_this.isWriting = false;
				});
			});
		} else{
			console.log("syncData CustomUserDataManager");
			fs.writeFile('config/custom user data/data.json', JSON.stringify(_this.data), function(){
				_this.isWriting = false;
			});
		}		
	}	
}

module.exports = new CustomUserDataManager();
