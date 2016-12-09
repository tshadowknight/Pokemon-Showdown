const fs = require('fs');
var $ = require('jquery-deferred');
var pool = require('./mysql_setup').pool;
var typeChart = require('./data/typechart.js').BattleTypeChart;

function initFlagPool(){
	var dfd = new $.Deferred();
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			dfd.resolve(err);
			callback(true); 
			return; 
		}
		connection.query('DELETE FROM flagpool', [], function (error, results, fields) {
			var values = [];
			Object.keys(typeChart).forEach(function(type){
				values.push(["\"" + type.toLowerCase() + "\"","\"" + type.toLowerCase() + "\""]);
			});
			var values_string = "(" + values.join(") ,(") + ")";
			connection.query('INSERT INTO flagpool (source_type, owner) VALUES ' + values_string, [], function (error, results, fields) {
				connection.release();
			 if(error){
				  console.log(error);
				  dfd.resolve(false);
			  } else{
				  dfd.resolve(true);
			  }			  
			});
		});
	});	
	return dfd.promise();
}

function clearBets(){
	var dfd = new $.Deferred();
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			dfd.resolve(err);
			callback(true); 
			return; 
		}		
		connection.query('UPDATE flagpool SET bet_in = ?', [""], function (error, results, fields) {
			connection.release();
		  if(error){
			  dfd.resolve(false);
		  } else{
			  dfd.resolve(true);
		  }			  
		});
	
	});	
	return dfd.promise();
}

function assignFlag(type, newOwner){
	var dfd = new $.Deferred();
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			dfd.resolve(err);
			callback(true); 
			return; 
		}		
		connection.query('UPDATE flagpool SET owner = ? WHERE source_type = ? ', [newOwner, type], function (error, results, fields) {
			connection.release();
			if(error){
				dfd.resolve(false);
				console.log(error);
			} else{
				dfd.resolve(true);		
			}	 
		});			
	});	
	return dfd.promise();	
}

function betFlag(tourneyId, type){
	var dfd = new $.Deferred();
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			dfd.resolve(err);
			callback(true); 
			return; 
		}		
		connection.query('UPDATE flagpool SET bet_in = ? WHERE source_type = ? ', [tourneyId, type], function (error, results, fields) {
			connection.release();
		  if(error){
			  dfd.resolve(false);
			  console.log(error);
		  } else{
			  dfd.resolve(true);		
		  }	 
		});		
	});	
	return dfd.promise();	
}

function getFlagData(){
	var dfd = new $.Deferred();
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			dfd.resolve(err);
			callback(true); 
			return; 
		}
		connection.query('SELECT * FROM flagpool', [], function (error, results, fields) {
			connection.release();
			if(error){
				dfd.resolve(error);
			} else if(!results || results.length == 0){
				dfd.resolve(-1);
			} else{
				dfd.resolve(results);
			}	 
		});	
	});
	return dfd.promise();
}

function checkCTFTExists(tourneyId){
	var dfd = new $.Deferred();
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			dfd.resolve(err);
			callback(true); 
			return; 
		}
		connection.query('SELECT id FROM ctfdata WHERE tourney_id = ?', [tourneyId], function (error, results, fields) {
			connection.release();
			dfd.resolve(results.length > 0);
		});	
	});	
	return dfd.promise();
}

function getAllCTFTData(){
	var dfd = new $.Deferred();
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			dfd.resolve(err);
			callback(true); 
			return; 
		}
		connection.query('SELECT * FROM ctfdata', [], function (error, results, fields) {
			connection.release();
			if(error){
				dfd.resolve(error);
			} else if(!results || results.length == 0){
				dfd.resolve(-1);
			} else{
				dfd.resolve(results);
			}	 
		});	
	});
	return dfd.promise();
}

function getCTFTData(tourneyId, type){
	var dfd = new $.Deferred();
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			dfd.resolve(err);
			callback(true); 
			return; 
		}
		connection.query('SELECT * FROM ctfdata WHERE tourney_id = ? AND typeLoyalty = ?', [tourneyId, type], function (error, results, fields) {
			connection.release();
			if(error){
				dfd.resolve(error);
			} else if(!results || results.length == 0){
				dfd.resolve(-1);
			} else{
				dfd.resolve(results);
			}	 
		});	
	});
	return dfd.promise();
}

function registerCTFT(tourneyId) {
	var dfd = new $.Deferred();
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			dfd.resolve(err);
			callback(true); 
			return; 
		}
		$.when(checkCTFTExists(tourneyId)).then(function(exists){
			if(exists){
				dfd.resolve(false);
				return;
			} else{
				var values = [];
				Object.keys(typeChart).forEach(function(type){
					values.push(["\"" + tourneyId + "\"","\"" + type.toLowerCase() + "\""]);
				});
				var values_string = "(" + values.join(") ,(") + ")";
				connection.query('INSERT INTO ctfdata (tourney_id, typeLoyalty) VALUES ' + values_string, [], function (error, results, fields) {
					connection.release();
				  // error will be an Error if one occurred during the query
				  // results will contain the results of the query
				  // fields will contain information about the returned results fields (if any)
				  if(error){
					  dfd.resolve(false);
				  } else{
					  dfd.resolve(true);
				  }	 
				  
				});
			}
		});
	});
	return dfd.promise();
}

function removeCTFT(tourneyId) {
	var dfd = new $.Deferred();
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			dfd.resolve(err);
			callback(true); 
			return; 
		}
		$.when(checkCTFTExists(tourneyId)).then(function(exists){
			if(exists){
				dfd.resolve(false);
				return;
			} else{
				connection.query('DELETE FROM ctfdata WHERE tourney_id = ?', [tourneyId], function (error, results, fields) {
					connection.release();
				  // error will be an Error if one occurred during the query
				  // results will contain the results of the query
				  // fields will contain information about the returned results fields (if any)
				  if(error){
					  dfd.resolve(false);
				  } else{
					  dfd.resolve(true);
				  }	 
				  
				});
			}
		});
	});
	return dfd.promise();
}

function updateCTFT(tourneyId, type, key, value){
	var dfd = new $.Deferred();
	pool.getConnection(function(err, connection) {
		if(err) { 
			console.log(err); 
			dfd.resolve(err);
			callback(true); 
			return; 
		}
		$.when(checkCTFTExists(tourneyId)).then(function(exists){
			if(!exists){
				 dfd.resolve(-1);
			} else{
				return doUpdate();
			}		
			function doUpdate(){		
				return connection.query('UPDATE ctfdata SET '+key+' = ? WHERE tourney_id = ? AND typeLoyalty = ?', [value, tourneyId, type], function (error, results, fields) {
					connection.release();
			  if(error){
				  dfd.resolve(false);
				  console.log(error);
			  } else{
				  dfd.resolve(true);		
			  }	 
			});	
			}
		});	
	});	
	return dfd.promise();
}

function addExp(tourneyId, type, amount){
	var dfd = new $.Deferred();
	$.when(getCTFTData(tourneyId, type)).then(function(targetRows){
		if(targetRows == -1){
			dfd.resolve(-1);
			return;
		}
		var oldEXP = targetRows[0].experience;
		var newEXP = oldEXP + amount;
		if(newEXP < 0){
			newEXP = 0;
		}
		$.when(updateCTFT(tourneyId, type, "experience", newEXP)).then(function(result){
			if(result){
				dfd.resolve(newEXP);
			} else{
				dfd.resolve(null);
			}	
		});		
	});	
	return dfd.promise();	
}

module.exports = {
	updateCTFT: updateCTFT,
	getCTFTData: getCTFTData,
	getAllCTFTData: getAllCTFTData,
	registerCTFT: registerCTFT,
	addExp: addExp,
	removeCTFT: removeCTFT,
	initFlagPool: initFlagPool,
	clearBets: clearBets,
	assignFlag: assignFlag,
	betFlag: betFlag,
	getFlagData: getFlagData
}

