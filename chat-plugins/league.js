'use strict';
global.CUDManager = require('../custom_user_data');
var dateFormat = require('dateformat');
var $ = require('jquery-deferred');
function checkPermission(user){
	var authorizedRoles = ["~", "%", "&", "@"];
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
			for(var i = 0; i < result.length; i++){
				if(result[i].isChallenger){
					var badges_raw = result[i].badges;
					var badges = JSON.parse(badges_raw);
					buffer+="<tr><td>"+result[i].showdown_user+"</td><td>"+Object.keys(badges).join(", ")+"</td></tr>";
				}
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
			for(var i = 0; i < result.length; i++){
				buffer+="<tr><td>"+result[i].showdown_user+"</td><td>"+result[i].experience+"</td><td>"+result[i].typeLoyalty+"</td><td>"+result[i].position+"</td></tr>";
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

		if(rank != "leader" && rank != "council" && rank != "trainer" && rank != "elite"){
			this.errorReply(tmp[1] + " is not a valid rank! Rank should be Trainer, Council, Leader or Elite.");	
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
	],
};