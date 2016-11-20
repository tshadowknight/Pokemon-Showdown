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
}

CustomUserDataManager.prototype.updateUser = function(userId, key, value){
	if(!this.data[userId]){
		this.registerNewUser(userId);
	}
	this.data[userId][key]=value;	
}

CustomUserDataManager.prototype.registerNewUser = function(userId){
	this.data[userId] = {};
	this.data[userId].isChallenger = false;
	this.data[userId].typeLoyalty = "";
	this.data[userId].position = "";	
	this.data[userId].EXP = 0;	
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
	console.log("syncData CustomUserDataManager");
	fs.writeFileSync('config/custom user data/data.json', JSON.stringify(this.data));
}

module.exports = new CustomUserDataManager();
