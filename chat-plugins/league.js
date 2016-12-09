'use strict';
global.CUDManager = require('../custom_user_data');
global.CTFManger = require('../ctf_manager');
var dateFormat = require('dateformat');
var $ = require('jquery-deferred');
var valid_badges = {
	normal: 1,
	fire: 1,
	water: 1,
	electric: 1,
	grass: 1,
	ice: 1,
	fighting: 1,
	poison: 1,
	ground: 1,
	flying: 1,
	psychic: 1,
	bug: 1,
	rock: 1,
	ghost: 1,
	dragon: 1,
	dark: 1,
	steel: 1,	
	fairy: 1		
}

var valid_types = {
	normal: 1,
	fire: 1,
	water: 1,
	electric: 1,
	grass: 1,
	ice: 1,
	fighting: 1,
	poison: 1,
	ground: 1,
	flying: 1,
	psychic: 1,
	bug: 1,
	rock: 1,
	ghost: 1,
	dragon: 1,
	dark: 1,
	steel: 1,	
	fairy: 1		
}
function checkPermission(user){
	var authorizedRoles = ["~", "&", "@"];
	var permissions = Users.usergroups[toId(user.name)];
	if(!permissions){
		return false;
	}
	var hasPermission = false;
	var ctr = 0;
	while(!hasPermission && ctr < authorizedRoles.length){
		hasPermission = (permissions.indexOf(authorizedRoles[ctr++]) != -1);
	}
	return hasPermission;	
}

exports.commands = {
	registeruser:  function (target, room, user) {
		var _this = this;
		if(!checkPermission(user)){
			this.errorReply("You are not authorized to use this command!");
			return;	
		}
		if(!target || target.split(",").length < 1){
			this.errorReply("Usage: /getuserinfo user");
			return;	
		}
		var tmp = target.split(",");
		for(var i = 0; i < tmp.length; i++){
			tmp[i] = tmp[i].trim();
		}
		
		var targetUser = toId(tmp[0]);
		$.when(CUDManager.registerNewUser(targetUser)).then(function(result){
			if(result){
				_this.sendReply("New user registered: "+targetUser);
				_this.logModCommand(Chat.escapeHTML(user.name) + " registered a new user: " + targetUser);	

			} else{
				_this.sendReply("This user already exists!");
			}
						
		});		
		return;
		
	}, 
	showuser: function (target, room, user) {
		var _this = this;
		if(!target || target.split(",").length < 1){
			this.errorReply("Usage: /getuserinfo user");
			return;	
		}
		var tmp = target.split(",");
		for(var i = 0; i < tmp.length; i++){
			tmp[i] = tmp[i].trim();
		}
		
		var targetUser = toId(tmp[0]);
		$.when(CUDManager.getUserData(targetUser)).then(function(result){
			var buffer = "<div class='ladder'><table>";
			buffer+="<tr><th>User</th><th>Experience Points</th><th>Type</th><th>Rank</th><th>Is a challenger</th><th>Badges</th></tr>";
			for(var i = 0; i < result.length; i++){
				var badges_raw = result[i].badges;
				var badges = JSON.parse(badges_raw);
				buffer+="<tr><td>"+result[i].showdown_user+"</td><td>"+result[i].experience+"</td><td>"+result[i].typeLoyalty+"</td><td>"+result[i].position+"</td><td>"+((result[i].isChallenger) ? "Yes" : "No")+"</td><td>"+Object.keys(badges).join(", ")+"</td></tr>";
			}
			buffer+="</table></div>"
			_this.sendReply('|raw|' + buffer);			
		});		
		return;
		
	}, 
	showuserhistory: function (target, room, user) {
		var _this = this;
		if(!target || target.split(",").length < 1){
			this.errorReply("Usage: /getuserinfo user");
			return;	
		}
		var tmp = target.split(",");
		for(var i = 0; i < tmp.length; i++){
			tmp[i] = tmp[i].trim();
		}
		
		var targetUser = toId(tmp[0]);
		$.when(CUDManager.getUserData(targetUser)).then(function(result){
			var buffer = "<div class='ladder'><table>";
			buffer+="<tr><th>Time</th><th>Foe</th><th>Won</th><th>Turns</th></tr>";
			for(var i = 0; i < result.length; i++){
				var history_raw = result[i].history;
				var hist;
				if(history_raw){
					hist = JSON.parse(history_raw);
				} else{
					hist = [];
				}
				for(var j = 0; j < hist.length; j++){
					var d = new Date(hist[j].time);
					var formatted_date = dateFormat(d, "yyyy-mm-dd h:MM:ss TT");
					buffer+="<tr><td>"+formatted_date+"</td><td>"+hist[j].foe+"</td><td>"+((hist[j].victory) ? "Yes" : "No")+"</td><td>"+hist[j].turns+"</td></tr>";
				}					
			}
			buffer+="</table></div>"
			_this.sendReply('|raw|' + buffer);			
		});		
		return;
		
	}, 
	addexp: function (target, room, user) {
		var _this = this;
		if(!checkPermission(user)){
			this.errorReply("You are not authorized to use this command!");
			return;	
		}
		if(!target || target.split(",").length < 2){
			this.errorReply("Usage: /addexp user, amount (amount can be negative)");
			return;	
		}
		var tmp = target.split(",");
		for(var i = 0; i < tmp.length; i++){
			tmp[i] = tmp[i].trim();
		}
		var amount = parseInt(tmp[1]);
		var targetUser = toId(tmp[0]);
		if(isNaN(amount)){
			this.errorReply("The EXP amount("+tmp[1]+") is not a valid number!");	
			return;
		}
		
		$.when(CUDManager.addExp(targetUser, amount)).then(function(result){
			if(result == -1){
				_this.errorReply(targetUser + " is not registered!");
			}else if(result != null){
				_this.sendReply(amount + " EXP has been added. New EXP: " + result);
				_this.logModCommand(Chat.escapeHTML(user.name) + " added "+amount+" to the EXP of " + targetUser + ".");	
			} else{
				_this.errorReply("An error occurred, please try again. If the problem persists please contact an administrator.");
			}	
		});		
		
		return;
		
	},
	setexp: function (target, room, user) {
		var _this = this;
		if(!checkPermission(user)){
			this.errorReply("You are not authorized to use this command!");
			return;	
		}
		if(!target || target.split(",").length < 2){
			this.errorReply("Usage: /setexp user, amount");
			return;	
		}
		var tmp = target.split(",");
		for(var i = 0; i < tmp.length; i++){
			tmp[i] = tmp[i].trim();
		}
		var amount = parseInt(tmp[1]);
		var targetUser = toId(tmp[0]);
		if(isNaN(amount)){
			this.errorReply("The EXP amount("+tmp[1]+") is not a valid number!");	
			return;
		}
		
		var newEXP = amount;
		if(newEXP < 0){
			newEXP = 0;
		}
		$.when(CUDManager.updateUser(targetUser, "experience", newEXP)).then(function(result){
			if(result){
				_this.sendReply("EXP for user " + targetUser + " has been changed to " + newEXP + ".");
				_this.logModCommand(Chat.escapeHTML(user.name) + " updated the EXP of " + targetUser + " to " + amount + ".");	
			} else{
				_this.errorReply("An error occurred, please try again. If the problem persists please contact an administrator.");
			}			
		});		
		return;		
	},
	makechallenger: function (target, room, user) {
		var _this = this;
		if(!checkPermission(user)){
			this.errorReply("You are not authorized to use this command!");
			return;	
		}
		if(!target || target.split(",").length < 1){
			this.errorReply("Usage: /makechallenger user");
			return;	
		}
		var tmp = target.split(",");
		for(var i = 0; i < tmp.length; i++){
			tmp[i] = tmp[i].trim();
		}
		var targetUser = toId(tmp[0]);
		
		$.when(CUDManager.updateUser(targetUser, "isChallenger", true)).then(function(result){
			if(result){
				_this.sendReply("User " + targetUser + " is now a challenger!");
				_this.logModCommand(Chat.escapeHTML(user.name) + " made user " + targetUser + " a challenger.");	
			} else{
				_this.errorReply("An error occurred, please try again. If the problem persists please contact an administrator.");
			}			
		});			
		return;		
	},
	removechallenger: function (target, room, user) {
		var _this = this;
		if(!checkPermission(user)){
			this.errorReply("You are not authorized to use this command!");
			return;	
		}
		if(!target || target.split(",").length < 1){
			this.errorReply("Usage: /removechallenger user");
			return;	
		}
		var tmp = target.split(",");
		for(var i = 0; i < tmp.length; i++){
			tmp[i] = tmp[i].trim();
		}
		var targetUser = toId(tmp[0]);
		$.when(CUDManager.updateUser(targetUser, "isChallenger", false)).then(function(result){
			if(result){
				_this.sendReply("User " + targetUser + " is no longer a challenger!");
				_this.logModCommand(Chat.escapeHTML(user.name) + " made user " + targetUser + " a challenger.");	
			} else{
				_this.errorReply("An error occurred, please try again. If the problem persists please contact an administrator.");
			}			
		});		
		return;		
	},
	challengers: function (target, room, user) {
		var _this = this;
		$.when(CUDManager.getAllUsers()).then(function(result){
			var buffer = "<div class='ladder'><table>";
			buffer+="<tr><th>User</th><th>Badges</th></tr>";
			var info = [];
			for(var i = 0; i < result.length; i++){
				if(result[i].isChallenger){
					var badges_raw = result[i].badges;
					var badges = JSON.parse(badges_raw);
					var tmp = JSON.parse(JSON.stringify(result[i]));
					tmp.badges = badges;
					info.push(tmp);					
				}
			}
			info = info.sort(function(a, b){return Object.keys(b.badges).length - Object.keys(a.badges).length});	
			for(var i = 0; i < info.length; i++){
				buffer+="<tr><td>"+info[i].showdown_user+"</td><td>"+Object.keys(info[i].badges).join(", ")+"</td></tr>";
			}
			buffer+="</table></div>"
			_this.sendReply('|raw|' + buffer);			
		});
		return;			
	},	
	leaderboard: function (target, room, user) {
		var _this = this;
		$.when(CUDManager.getAllUsers()).then(function(result){
			var buffer = "<div class='ladder'><table>";
			buffer+="<tr><th>User</th><th>Experience Points</th><th>Type</th><th>Rank</th></tr>";
			var sorted_ranks = ["", "trainer", "council", "leader", "elite", "elite captain"];
			var sorted_results = result.sort(function(a,b){
				if(a.position == b.position){
					return b.experience - a.experience;
				} else{
					return (sorted_ranks.indexOf(b.position)) - (sorted_ranks.indexOf(a.position));
				}				
			});
			for(var i = 0; i < sorted_results.length; i++){
				if(!result[i].isChallenger){
					buffer+="<tr><td>"+result[i].showdown_user+"</td><td>"+result[i].experience+"</td><td>"+result[i].typeLoyalty+"</td><td>"+result[i].position+"</td></tr>";
				}
			}
			buffer+="</table></div>"
			_this.sendReply('|raw|' + buffer);			
		});
		return;		
	},	
	deleteuser: function (target, room, user) {
		var _this = this;
		if(!checkPermission(user)){
			this.errorReply("You are not authorized to use this command!");
			return;	
		}
		if(!target || target.split(",").length < 1){
			this.errorReply("Usage: /deleteuser user");
			return;	
		}
		var tmp = target.split(",");
		for(var i = 0; i < tmp.length; i++){
			tmp[i] = tmp[i].trim();
		}
		var targetUser = toId(tmp[0]);
		$.when(CUDManager.deleteUser(targetUser)).then(function(result){
			if(result){
				_this.sendReply("User " + targetUser + " has been removed from the EXP tracking!");
				_this.logModCommand(Chat.escapeHTML(user.name) + " removed user " + targetUser + " from the EXP tracking.");
			} else{
				_this.sendReply("This user doesn't exist!");
			}
						
		});		
		return;		
	},	
	setrank: function (target, room, user) {
		var _this = this;
		if(!checkPermission(user)){
			this.errorReply("You are not authorized to use this command!");
			return;	
		}
		if(!target || target.split(",").length < 2){
			this.errorReply("Usage: /setrank user, rank (Trainer, Council, Leader, Elite)");
			return;	
		}
		var tmp = target.split(",");
		for(var i = 0; i < tmp.length; i++){
			tmp[i] = tmp[i].trim();
		}
		var rank = tmp[1].toLowerCase();
		var targetUser = toId(tmp[0]);			

		if(rank != "leader" && rank != "council" && rank != "trainer" && rank != "elite"  && rank != "elite captain"){
			this.errorReply(tmp[1] + " is not a valid rank! Rank should be Trainer, Council, Leader, Elite or Elite Captain.");	
			return;
		}
		
		
		$.when(CUDManager.updateUser(targetUser, "position", rank)).then(function(result){
			if(result){
				_this.sendReply("Rank for user " + targetUser + " has been set to " + rank );
				_this.logModCommand(Chat.escapeHTML(user.name) + " rank of " + targetUser + " to " + rank + ".");
			} else{
				_this.errorReply("An error occurred, please try again. If the problem persists please contact an administrator.");
			}			
		});	
		
		return;
		
	},
	settype: function (target, room, user) {
		var _this = this;
		
		if(!checkPermission(user)){
			this.errorReply("You are not authorized to use this command!");
			return;	
		}
		if(!target || target.split(",").length < 2){
			this.errorReply("Usage: /settype user, type");
			return;	
		}
		var tmp = target.split(",");
		for(var i = 0; i < tmp.length; i++){
			tmp[i] = tmp[i].trim();
		}
		var type = tmp[1].toLowerCase();
		var targetUser = toId(tmp[0]);			
		
		if(!valid_types[type]){
			this.errorReply(tmp[1] + " is not a valid Type! Rank should be one of ("+Object.keys(valid_types).join(", ")+").");	
			return;			
		}	
		
		$.when(CUDManager.updateUser(targetUser, "typeLoyalty", type)).then(function(result){
			if(result){
				_this.sendReply("Type for user " + targetUser + " has been set to " + type );
				_this.logModCommand(Chat.escapeHTML(user.name) + " type of " + targetUser + " to " + type + ".");
			} else{
				_this.errorReply("An error occurred, please try again. If the problem persists please contact an administrator.");
			}			
		});	
		
		return;
		
	},	
	addbadge: function (target, room, user) {
		var _this = this;
		
		if(!checkPermission(user)){
			this.errorReply("You are not authorized to use this command!");
			return;	
		}
		if(!target || target.split(",").length < 2){
			this.errorReply("Usage: /addbadge user, badge");
			return;	
		}
		var tmp = target.split(",");
		for(var i = 0; i < tmp.length; i++){
			tmp[i] = tmp[i].trim();
		}
		var badge = tmp[1].toLowerCase();
		var targetUser = toId(tmp[0]);			
		
		if(!valid_badges[badge]){
			this.errorReply(tmp[1] + " is not a valid badge! Badge should be one of ("+Object.keys(valid_badges).join(", ")+").");	
			return;			
		}			
		$.when(CUDManager.addBadge(targetUser, badge)).then(function(result){
			if(result == -1){
				_this.errorReply(targetUser + " is not registered!");
			}else if(result){
				_this.sendReply(targetUser + " has received the " + badge + " badge!");
				_this.logModCommand(Chat.escapeHTML(user.name) + " awarded a badge to " + targetUser + ": " + badge + ".");
			} else{
				_this.errorReply("An error occurred, please try again. If the problem persists please contact an administrator.");
			}			
		});	
		
		return;
		
	},
	removebadge: function (target, room, user) {
		var _this = this;
	
		if(!checkPermission(user)){
			this.errorReply("You are not authorized to use this command!");
			return;	
		}
		if(!target || target.split(",").length < 2){
			this.errorReply("Usage: /addbadge user, badge");
			return;	
		}
		var tmp = target.split(",");
		for(var i = 0; i < tmp.length; i++){
			tmp[i] = tmp[i].trim();
		}
		var badge = tmp[1].toLowerCase();
		var targetUser = toId(tmp[0]);
		
		if(!valid_badges[badge]){
			this.errorReply(tmp[1] + " is not a valid badge! Badge should be one of ("+Object.keys(valid_badges).join(", ")+").");	
			return;			
		}	
		
		$.when(CUDManager.removeBadge(targetUser, badge)).then(function(result){
			if(result == -1){
				_this.errorReply(targetUser + " is not registered!");
			} else if(result){
				_this.sendReply("badge " + badge + " was removed from " + targetUser);
				_this.logModCommand(Chat.escapeHTML(user.name) + " removed a badge from " + targetUser + ": " + badge + ".");
			} else{
				_this.errorReply("An error occurred, please try again. If the problem persists please contact an administrator.");
			}			
		});	
		
		return;
		
	},	
	showctfexp: function (target, room, user) {
		var _this = this;
		$.when(CTFManger.getAllCTFTData()).then(function(result){
			var buffer = "<div class='ladder'><table>";			
			buffer+="<tr><th>Tourney</th><th>Type</th><th>Experience</th></tr>";
			for(var i = 0; i < result.length; i++){				
				buffer+="<tr><td>"+result[i].tourney_id+"</td><td>"+result[i].typeLoyalty+"</td><td>"+(result[i].experience || "")+"</td></tr>";				
			}
			buffer+="</table></div>"
			_this.sendReply('|raw|' + buffer);					
		});
		return;		
	},	
	registerctf:  function (target, room, user) {
		var _this = this;
		if(!checkPermission(user)){
			this.errorReply("You are not authorized to use this command!");
			return;	
		}
		if(!target || target.split(",").length < 1){
			this.errorReply("Usage: /registerctf id");
			return;	
		}
		var tmp = target.split(",");
		for(var i = 0; i < tmp.length; i++){
			tmp[i] = tmp[i].trim();
		}
		
		var targetId = toId(tmp[0]);
		$.when(CTFManger.registerCTFT(targetId)).then(function(result){
			if(result){
				_this.sendReply("New ctf tourney registered: "+targetId);
				_this.logModCommand(Chat.escapeHTML(user.name) + " registered a new ctf tourney: " + targetId);	

			} else{
				_this.sendReply("This tourney already exists!");
			}
						
		});		
		return;
		
	}, 		
	setctfexp: function (target, room, user) {
		var _this = this;
		if(!checkPermission(user)){
			this.errorReply("You are not authorized to use this command!");
			return;	
		}
		if(!target || target.split(",").length < 3){
			this.errorReply("Usage: /setctfexp id, type, amount");
			return;	
		}
		var tmp = target.split(",");
		for(var i = 0; i < tmp.length; i++){
			tmp[i] = tmp[i].trim();
		}
		var amount = parseInt(tmp[2]);
		var type = tmp[1].toLowerCase();
		var targetId = toId(tmp[0]);
		if(isNaN(amount)){
			this.errorReply("The EXP amount("+tmp[1]+") is not a valid number!");	
			return;
		}
		if(!valid_types[type]){
			this.errorReply(tmp[1] + " is not a valid Type! Rank should be one of ("+Object.keys(valid_types).join(", ")+").");	
			return;			
		}			
		var newEXP = amount;
		if(newEXP < 0){
			newEXP = 0;
		}
		$.when(CTFManger.updateCTFT(targetId, type, "experience", newEXP)).then(function(result){
			if(result){
				_this.sendReply("EXP for tourney " + targetId + ", type " + type +" has been changed to " + newEXP + ".");
				_this.logModCommand(Chat.escapeHTML(user.name) + " updated the EXP of tourney " + targetId + ", type" + type +" to " + amount + ".");	
			} else{
				_this.errorReply("An error occurred, please try again. If the problem persists please contact an administrator.");
			}			
		});		
		return;		
	},
	addctfexp: function (target, room, user) {
		var _this = this;
		if(!checkPermission(user)){
			this.errorReply("You are not authorized to use this command!");
			return;	
		}
		if(!target || target.split(",").length < 3){
			this.errorReply("Usage: /setctfexp id, type, amount");
			return;	
		}
		var tmp = target.split(",");
		for(var i = 0; i < tmp.length; i++){
			tmp[i] = tmp[i].trim();
		}
		var amount = parseInt(tmp[2]);
		var type = tmp[1].toLowerCase();
		var targetId = toId(tmp[0]);
		if(isNaN(amount)){
			this.errorReply("The EXP amount("+tmp[1]+") is not a valid number!");	
			return;
		}
		if(!valid_types[type]){
			this.errorReply(tmp[1] + " is not a valid Type! Rank should be one of ("+Object.keys(valid_types).join(", ")+").");	
			return;			
		}			
		var newEXP = amount;
		if(newEXP < 0){
			newEXP = 0;
		}
		$.when(CTFManger.addExp(targetId, type, newEXP)).then(function(result){
			if(result){
				_this.sendReply("EXP for tourney " + targetId + ", type " + type +" has been changed to " + result + ".");
				_this.logModCommand(Chat.escapeHTML(user.name) + " updated the EXP of tourney " + targetId + ", type" + type +" to " + result + ".");	
			} else{
				_this.errorReply("An error occurred, please try again. If the problem persists please contact an administrator.");
			}			
		});		
		return;		
	},	
	deletectf: function (target, room, user) {
		var _this = this;
		if(!checkPermission(user)){
			this.errorReply("You are not authorized to use this command!");
			return;	
		}
		if(!target || target.split(",").length < 1){
			this.errorReply("Usage: /deletectf id");
			return;	
		}
		var tmp = target.split(",");
		for(var i = 0; i < tmp.length; i++){
			tmp[i] = tmp[i].trim();
		}
		var targetId = toId(tmp[0]);
		$.when(CTFManger.removeCTFT(targetId)).then(function(result){
			if(result){
				_this.sendReply("ctf tourney " + targetId + " has been removed!");
				_this.logModCommand(Chat.escapeHTML(user.name) + " removed ctf trouney: " + targetId );
			} else{
				_this.sendReply("This tourney doesn't exist!");
			}
						
		});		
		return;		
	},
	initflags: function (target, room, user) {
		var _this = this;
		if(!checkPermission(user)){
			this.errorReply("You are not authorized to use this command!");
			return;	
		}		
		$.when(CTFManger.initFlagPool()).then(function(result){
			if(result){
				_this.sendReply("Flag tracking has been initialized!");
				_this.logModCommand(Chat.escapeHTML(user.name) + " initialized the flag pool" );
			} 						
		});		
		return;		
	},
	clearbets: function (target, room, user) {
		var _this = this;
		if(!checkPermission(user)){
			this.errorReply("You are not authorized to use this command!");
			return;	
		}		
		$.when(CTFManger.clearBets()).then(function(result){
			if(result){
				_this.sendReply("Bets have been cleared!");
				_this.logModCommand(Chat.escapeHTML(user.name) + " cleared the bets!" );
			} 						
		});		
		return;		
	},
	flagowners: function (target, room, user) {
		var _this = this;
		$.when(CTFManger.getFlagData()).then(function(rawResult){
			var buffer = "<div class='ladder'><table>";
			buffer+="<tr><th>Gym</th><th>Flags</th></tr>";
			var accumulator = {};
			for(var i = 0; i < rawResult.length; i++){
				if(!accumulator[rawResult[i].owner]){
					accumulator[rawResult[i].owner] = [];
				}
				accumulator[rawResult[i].owner].push(rawResult[i].source_type);
			}
			var result = [];
			Object.keys(accumulator).forEach(function(key){
				result.push({owner: key, flags: accumulator[key]});
			});
			
			var sorted_results = result.sort(function(a,b){				
				return b.flags.length - a.flags.length;								
			});
			for(var i = 0; i < sorted_results.length; i++){
				if(!result[i].isChallenger){
					buffer+="<tr><td>"+result[i].owner+"</td><td>"+result[i].flags.join(", ")+"</td></tr>";
				}
			}
			buffer+="</table></div>"
			_this.sendReply('|raw|' + buffer);			
		});
		return;		
	},
	flags: function (target, room, user) {
		var _this = this;
		$.when(CTFManger.getFlagData()).then(function(result){
			var buffer = "<div class='ladder'><table>";
			var tmp = target.split(",");
			for(var i = 0; i < tmp.length; i++){
				tmp[i] = tmp[i].trim();
			}
			var tourney;
			if(tmp[0]){
				tourney = tmp[0].toLowerCase();
			}
			
			if(!tourney){
				buffer+="<tr><th>Flag</th><th>Current Owner</th><th>Bet In</th></tr>";
				for(var i = 0; i < result.length; i++){				
					buffer+="<tr><td>"+result[i].source_type+"</td><td>"+result[i].owner+"</td><td>"+(result[i].bet_in || "")+"</td></tr>";				
				}
				buffer+="</table></div>"
				_this.sendReply('|raw|' + buffer);		
			} else{
				buffer+="<tr><th>Flag</th></tr>";
				for(var i = 0; i < result.length; i++){	
					if(result[i].bet_in == tourney){
						buffer+="<tr><td>"+result[i].source_type+"</td></tr>";		
					}							
				}
				buffer+="</table></div>"
				_this.sendReply('|raw|' + buffer);		
			}
				
		});
		return;		
	},	
	assignflag: function (target, room, user) {
		var _this = this;		
		if(!checkPermission(user)){
			this.errorReply("You are not authorized to use this command!");
			return;	
		}
		if(!target || target.split(",").length < 2){
			this.errorReply("Usage: /assignflag winner, flag");
			return;	
		}
		var tmp = target.split(",");
		for(var i = 0; i < tmp.length; i++){
			tmp[i] = tmp[i].trim();
		}
		var flag = tmp[1].toLowerCase();
		var winner = tmp[0].toLowerCase();	

		if(!valid_badges[winner]){
			this.errorReply(tmp[0] + " is not a valid Type! Winner should be one of ("+Object.keys(valid_badges).join(", ")+").");	
			return;			
		}			
		
		if(!valid_badges[flag]){
			this.errorReply(tmp[1] + " is not a valid Type! Flag should be one of ("+Object.keys(valid_badges).join(", ")+").");	
			return;			
		}			
		$.when(CTFManger.assignFlag(flag , winner)).then(function(result){
			if(result){
				_this.sendReply(winner + " has received the " + flag + " Flag!");
				_this.logModCommand(Chat.escapeHTML(user.name) + " awarded a flag to " + winner + ": " + flag + ".");
			} else{
				_this.errorReply("An error occurred, please try again. If the problem persists please contact an administrator.");
			}			
		});	
		
		return;
		
	},	
	betflag: function (target, room, user) {
		var _this = this;		
		if(!checkPermission(user)){
			this.errorReply("You are not authorized to use this command!");
			return;	
		}
		if(!target || target.split(",").length < 2){
			this.errorReply("Usage: /betflag flag, tourney_id");
			return;	
		}
		var tmp = target.split(",");
		for(var i = 0; i < tmp.length; i++){
			tmp[i] = tmp[i].trim();
		}
		var tourney_id = tmp[1].toLowerCase();
		var flag = tmp[0].toLowerCase();		
		
		if(!valid_badges[flag]){
			this.errorReply(tmp[1] + " is not a valid Type! Flag should be one of ("+Object.keys(valid_badges).join(", ")+").");	
			return;			
		}			
		$.when(CTFManger.betFlag(tourney_id, flag)).then(function(result){
			if(result){
				_this.sendReply(flag + " was added to the betting pool for tourney: " + tourney_id);
				_this.logModCommand(Chat.escapeHTML(user.name) + " added the " + flag + " flag to the betting pool for tourney: " + tourney_id);
			} else{
				_this.errorReply("An error occurred, please try again. If the problem persists please contact an administrator.");
			}			
		});	
		
		return;
		
	},	
	leaguehelp: 'leaguehelp',
	leaguehelp: [			
		"/registeruser - Register a new user into the league /registeruser user",
		"/showuser - Get league info for a specific user /showuser user",
		"/showuserhistory - Show the challenger battle record for the user /showuserhistory user",		
		"/addexp - Add EXP to a user /addexp user, amount (amount can be negative)",
		"/setexp - Set EXP to a user /set user, amount",
		"/leaderboard - View the current EXP of all registered league members",
		"/makechallenger - Make a user a challenger /makechallenger user",
		"/removechallenger - Remove the challenger status from a user /removechallenger, user",
		"/challengers - View the current challengers and their badges",
		"/deleteuser - Remove the user from the EXP tracking /deleteuser user",
		"/setrank - Sets the league rank for the user (Trainer, Council, Leader, Elite) /setrank user, rank",
		"/settype - Sets the type association for the user /settype user, type",		
		"/addbadge - Award a badge to a user /addbadge user, badge",
		"/removebadge - Remove a badge from a user /removebadge user, badge",
		"/initflags - Reset all flag owners",
		"/clearbets - Clear all bets",		
		"/flags - View the flag data /flags tourney_id(optional)",
		"/flagowners - Show who owns which flags",
		"/assignflag - Assign a flag to a new owner /assignflag winner, flag",
		"/betflag - Add a flag to the betting pool of a tournament /betflag flag, tourney_id",		
		"/registerctf - Register a new ctf tourney with the given id /registerctf tourney_id",
		"/setctfexp - Set the exp for a given type in a give tourney /setctfexp id, type, amount",
		"/addctfexp - Add exp for a given type in a give tourney /addctfexp id, type, amount",
		"/deletectf - Delete a ctf tourney with the given id /deletectf tourney_id",	
		"/showctfexp - Get an overview of the ctf exp data /showctfexp",			
	],
};