const fs = require('fs');
var $ = require('jquery-deferred');
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'sm4shing',
  database : 'pokegafleague'
});

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});

EXPYields = {"": 10, trainer: 10, council: 20, leader: 30};


function checkUserExists(userId){
	return connection.query('SELECT id FROM userdata WHERE showdown_user = ?', [userId], function (error, results, fields) {
		console.log("returning user existance status");
		return results.length > 0;
	});	
}

function updateUser(userId, key, value){
	return $.when(checkUserExists(userId)).then(function(exists){
		console.log("User status: " + exists);
		if(!exists){
			$.when(registerNewUser(userId)).then(function(){
				return doUpdate();
			});
		} else{
			return doUpdate();
		}		
		function doUpdate(){
			console.log("Do update");
			return connection.query('UPDATE userdata SET '+key+' = ? WHERE showdown_user = ?', [value, userId], function (error, results, fields) {
		  // error will be an Error if one occurred during the query
		  // results will contain the results of the query
		  // fields will contain information about the returned results fields (if any)
		  if(error){
			  console.log(error);
		  } else{
			  console.log(userId+": Value for column "+key+" changed to "+value);
		  }	 
		});	
		}
	});	
}

function getUserData(userId, key){
	var dfd = new $.Deferred();
	connection.query('SELECT * FROM userdata WHERE showdown_user = ?', [userId], function (error, results, fields) {
		if(error){
		  dfd.resolve("General error");
		} else{
		  var result = "";
		  Object.keys(results).forEach(function(key){
			 result+=key+"\n"; 
		  });
		  dfd.resolve(result);
		}	 
	});	
	return dfd.promise();
}

function getUserIds(){
	return Object.keys(data);
}

function registerNewUser(userId){
	var dfd = new $.Deferred();
	connection.query('INSERT INTO userdata (showdown_user, isChallenger, typeLoyalty, position, experience, badges) VALUES (?, ?, ?, ?, ?, ?)', [userId, false, "", "", 0, "{}"], function (error, results, fields) {
	  // error will be an Error if one occurred during the query
	  // results will contain the results of the query
	  // fields will contain information about the returned results fields (if any)
	  if(error){
		  dfd.resolve("This user already exists!");
	  } else{
		  dfd.resolve("New user registered: "+userId);
	  }	 
	  
	});
	return dfd.promise();
}

function deleteUser(userId){
	delete data[userId];
}

function updateEXP(targetUser, battledUser, win, sync){	
	console.log("syncData updateEXP " + targetUser + " - " + battledUser + " - " + win);
	if(!data[targetUser]){
		registerNewUser(targetUser);
	}
	if(!data[battledUser]){
		registerNewUser(battledUser);
	}
	if(data[targetUser].isChallenger){
		//no exp
	} else if(data[battledUser].isChallenger){
		console.log("Not a challenger");
		var position = data[targetUser].position;
		console.log(position);
		if(position){
			console.log(EXPYields[position]);
			console.log("Old Exp: " + data[targetUser].EXP);
			if(win){
				data[targetUser].EXP+=EXPYields[position];				
			} else{
				data[targetUser].EXP+=EXPYields[position]/2;
			}
			console.log("New Exp: " + data[targetUser].EXP);
		}		
	}	
	
}

module.exports = {
	updateUser: updateUser,
	getUserData: getUserData,
	getUserIds: getUserIds,
	registerNewUser: registerNewUser,
	deleteUser: deleteUser,
	updateEXP: updateEXP,
	
}
