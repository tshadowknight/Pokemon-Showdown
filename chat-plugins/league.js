'use strict';
global.CUDManager = require('../custom_user_data');
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
			_this.sendReply(result);			
		});		
		return;
		
	}, 
	getleagueuserinfo: function (target, room, user) {
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
		$.when(CUDManager.getUserData()).then(function(result){
			var buffer = "<div class='ladder'><table>";
			buffer+="<tr><th>User</th><th>Experience Points</th><th>Type</th><th>Rank</th><th>Is a challenger</th></tr>";
			for(var i = 0; i < result.length; i++){
				buffer+="<tr><td>"+result[i].showdown_user+"</td><td>"+result[i].experience+"</td><td>"+result[i].typeLoyalty+"</td><td>"+result[i].position+"</td><td>"+result[i].isChallenger+"</td></tr>";
			}
			buffer+="</table></div>"
			_this.sendReply('|raw|' + buffer);			
		});		
		return;
		
	}, 
	addexp: function (target, room, user) {
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
		
		var currentEXP = CUDManager.getUserData(targetUser, "EXP");
		if(currentEXP.error){
			this.errorReply("The user does not exist!");	
			return;
		}
		var newEXP = currentEXP + amount;
		if(newEXP < 0){
			newEXP = 0;
		}
		this.sendReply("EXP for user " + targetUser + " has been changed from " + currentEXP + " to " + newEXP + ".");
		this.logModCommand(Chat.escapeHTML(user.name) + " updated the EXP of " + targetUser + " by " + amount + ".");
		CUDManager.updateUser(targetUser, "experience", newEXP);
		return;
		
	},
	setexp: function (target, room, user) {
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
		
		var currentEXP = CUDManager.getUserData(targetUser, "EXP");
		if(currentEXP.error){
			this.errorReply("The user does not exist!");	
			return;
		}
		
		var newEXP = amount;
		if(newEXP < 0){
			newEXP = 0;
		}
		this.sendReply("EXP for user " + targetUser + " has been changed to " + newEXP + ".");
		this.logModCommand(Chat.escapeHTML(user.name) + " updated the EXP of " + targetUser + " to " + amount + ".");
		CUDManager.updateUser(targetUser, "experience", newEXP);
		return;		
	},
	makechallenger: function (target, room, user) {
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
	
		this.sendReply("User " + targetUser + " is now a challenger!");
		this.logModCommand(Chat.escapeHTML(user.name) + " made user " + targetUser + " a challenger.");
		CUDManager.updateUser(targetUser, "isChallenger", true);		
		return;		
	},
	removechallenger: function (target, room, user) {
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
		var currentEXP = CUDManager.getUserData(targetUser, "EXP");
		if(currentEXP.error){
			CUDManager.registerNewUser(targetUser);
		}		

		this.sendReply("User " + targetUser + " is no longer a challenger.");
		this.logModCommand(Chat.escapeHTML(user.name) + " removed the challenger status from " + targetUser);
		CUDManager.updateUser(targetUser, "isChallenger", false);
		
		return;		
	},
	challengers: function (target, room, user) {
		var _this = this;
		$.when(CUDManager.getAllUsers()).then(function(result){
			var buffer = "<div class='ladder'><table>";
			buffer+="<tr><th>User</th><th>Experience Points</th><th>Type</th><th>Rank</th></tr>";
			for(var i = 0; i < result.length; i++){
				if(result[i].isChallenger){
					buffer+="<tr><td>"+result[i].showdown_user+"</td><td>"+result[i].experience+"</td><td>"+result[i].typeLoyalty+"</td><td>"+result[i].position+"</td></tr>";
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
	
		this.sendReply("User " + targetUser + " has been removed from the EXP tracking!");
		this.logModCommand(Chat.escapeHTML(user.name) + " removed user " + targetUser + " from the EXP tracking.");
		CUDManager.deleteUser(targetUser);
		
			
		return;		
	},	
	setrank: function (target, room, user) {
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
			
		var currentEXP = CUDManager.getUserData(targetUser, "EXP");
		if(currentEXP.error){
			this.errorReply("The user does not exist!");	
			return;
		}

		if(rank != "leader" && rank != "council" && rank != "trainer" && rank != "elite"){
			this.errorReply(tmp[1] + " is not a valid rank! Rank should be Trainer, Council, Leader or Elite.");	
			return;
		}
		this.sendReply("Rank for user " + targetUser + " has been set to " + rank );
		this.logModCommand(Chat.escapeHTML(user.name) + " rank of " + targetUser + " to " + rank + ".");
		CUDManager.updateUser(targetUser, "position", rank);
		
		return;
		
	},
	leaguehelp: 'leaguehelp',
	leaguehelp: [	
		"/getleagueuserinfo - Get league info for a specific user /getuserinfo user",
		"/addexp - Add EXP to a user /addexp user, amount (amount can be negative)",
		"/setexp - Set EXP to a user /set user, amount",
		"/leaderboard - View the current EXP of all registered league members",
		"/makechallenger - Make a user a challenger /makechallenger user",
		"/removechallenger - Remove the challenger status from a user /removechallenger user",
		"/challengers - View the current challengers and their EXP",
		"/deleteuser - Remove the user from the EXP tracking /deleteuser user",
		"/setrank - Sets the league rank for the user (Trainer, Council, Leader, Elite) /setrank user rank",
	],
};