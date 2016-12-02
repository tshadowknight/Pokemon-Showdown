const fs = require('fs');
var $ = require('jquery-deferred');
var mysql      = require('mysql');
var db_config ={
  host     : 'localhost',
  user     : 'root',
  password : 'sm4shing',
  database : 'pokegafleague'
};

function handleDisconnect() {
  connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();

EXPYields = {"": 10, trainer: 10, council: 20, leader: 30};


function checkUserExists(userId){
	return connection.query('SELECT id FROM userdata WHERE showdown_user = ?', [userId], function (error, results, fields) {
		console.log("returning user existance status");
		return results.length > 0;
	});	
}

function updateUser(userId, key, value){
	var dfd = new $.Deferred();
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
			  dfd.resolve(false);
			  console.log(error);
		  } else{
			  dfd.resolve(true);
			  console.log(userId+": Value for column "+key+" changed to "+value);
		  }	 
		});	
		}
	});	
	return dfd.promise();
}

function getUserData(userId){
	var dfd = new $.Deferred();
	connection.query('SELECT * FROM userdata WHERE showdown_user = ?', [userId], function (error, results, fields) {
		if(error){
			dfd.resolve(error);
		} else if(!results || results.length == 0){
			dfd.resolve(-1);
		} else{
			dfd.resolve(results);
		}	 
	});	
	return dfd.promise();
}

function getAllUsers(){
	var dfd = new $.Deferred();
	connection.query('SELECT * FROM userdata', [], function (error, results, fields) {
		if(error){
		  dfd.resolve("General error");
		} else{
		  dfd.resolve(results);
		}	 
	});	
	return dfd.promise();
}

function registerNewUser(userId){
	var dfd = new $.Deferred();
	connection.query('INSERT INTO userdata (showdown_user, isChallenger, typeLoyalty, position, experience, badges) VALUES (?, ?, ?, ?, ?, ?)', [userId, false, "", "", 0, "{}"], function (error, results, fields) {
	  // error will be an Error if one occurred during the query
	  // results will contain the results of the query
	  // fields will contain information about the returned results fields (if any)
	  if(error){
		  dfd.resolve(false);
	  } else{
		  dfd.resolve(true);
	  }	 
	  
	});
	return dfd.promise();
}

function deleteUser(userId){
	var dfd = new $.Deferred();
	connection.query('DELETE FROM userdata WHERE showdown_user = ?', [userId], function (error, results, fields) {
	  // error will be an Error if one occurred during the query
	  // results will contain the results of the query
	  // fields will contain information about the returned results fields (if any)
	  if(error){
		  dfd.resolve(false);
	  } else{
		  dfd.resolve(true);
	  }	 	  
	});
	return dfd.promise();
}

function addExp(targetUser, amount){
	var dfd = new $.Deferred();
	$.when(getUserData(targetUser)).then(function(targetRows){
		if(targetRows == -1){
			dfd.resolve(-1);
			return;
		}
		var oldEXP = targetRows[0].experience;
		var newEXP = oldEXP + amount;
		if(newEXP < 0){
			newEXP = 0;
		}
		$.when(updateUser(targetUser, "experience", newEXP)).then(function(result){
			if(result){
				dfd.resolve(newEXP);
			} else{
				dfd.resolve(null);
			}	
		});		
	});	
	return dfd.promise();
}

function updateEXP(targetUser, battledUser, win, turns){	
	console.log("syncData updateEXP " + targetUser + " - " + battledUser + " - " + win);
	$.when(getUserData(targetUser)).then(function(targetRows){		
		var target = targetRows[0];		
		$.when(getUserData(battledUser)).then(function(battledRows){
			var battled = battledRows[0];
			addHistoryRecord(targetUser, battledUser, win, turns);
			if(target.isChallenger){		
			} else if(battled.isChallenger){				
				var position = target.position;
				console.log(position);
				if(position){
					console.log(EXPYields[position]);
					console.log("Old Exp: " + target.experience);
					var newexp;
					if(win){
						newexp = target.experience+EXPYields[position];						
					} else{
						newexp = target.experience+EXPYields[position]/2;	
					}
					updateUser(target.showdown_user, "experience", newexp);	
					
					console.log("New Exp: " + target.experience);
				}		
			}
		})
	});
}

function addBadge(targetUser, badge){
	var dfd = new $.Deferred();
	$.when(getUserData(targetUser)).then(function(targetRows){
		if(targetRows == -1){
			dfd.resolve(-1);
			return;
		}
		var badges_raw = targetRows[0].badges;
		var badges = JSON.parse(badges_raw);
		badges[badge]=1;
		badges_raw = JSON.stringify(badges);
		$.when(updateUser(targetUser, "badges", badges_raw)).then(function(result){			
			dfd.resolve(result);			
		});		
	});	
	return dfd.promise();
}

function addHistoryRecord(targetUser, battledUser, result, turnCount){
	var dfd = new $.Deferred();
	$.when(getUserData(targetUser)).then(function(targetRows){
		if(targetRows == -1){
			dfd.resolve(-1);
			return;
		}
		var history_raw = targetRows[0].history;
		var hist;
		if(history_raw){
			hist = JSON.parse(history_raw);
		} else{
			hist = [];
		}
		var d = new Date();	
		var json_d = d.toJSON();	
		hist.push({time: json_d, foe: battledUser, victory: result, turns: turnCount});
		history_raw = JSON.stringify(hist);
		$.when(updateUser(targetUser, "history", history_raw)).then(function(result){			
			dfd.resolve(result);		
			console.log("New history record for " + targetUser + ": " + json_d + ", " + ", " + battledUser + ", "  +result + ", " + turnCount);
		});		
	});	
	return dfd.promise();
}

function removeBadge(targetUser, badge){
	var dfd = new $.Deferred();
	$.when(getUserData(targetUser)).then(function(targetRows){
		if(targetRows == -1){
			dfd.resolve(-1);
			return;
		}
		var badges_raw = targetRows[0].badges;
		var badges = JSON.parse(badges_raw);
		delete badges[badge];
		badges_raw = JSON.stringify(badges);
		$.when(updateUser(targetUser, "badges", badges_raw)).then(function(result){			
			dfd.resolve(result);			
		});		
	});	
	return dfd.promise();
}

module.exports = {
	updateUser: updateUser,
	getUserData: getUserData,
	getAllUsers: getAllUsers,
	registerNewUser: registerNewUser,
	deleteUser: deleteUser,
	updateEXP: updateEXP,
	addExp: addExp,
	addBadge: addBadge,
	removeBadge: removeBadge
}
