/**
* The Happy Place: Quote of the Day Plugin
* This is a command that allows a room owner to set an inspirational "quote" of the day.
* Others may braodcast this at any time to remind the room of such.
* Only works in a room with the id "thehappyplace"
* Credits: panpawn, TalkTakesTime, Morfent, and sirDonovan
*/

'use strict';
var CUDManager = require('../custom_user_data');

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
		CUDManager.updateUser(targetUser, "EXP", newEXP);
		CUDManager.syncData();
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
		CUDManager.updateUser(targetUser, "EXP", newEXP);
		CUDManager.syncData();
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
		var currentEXP = CUDManager.getUserData(targetUser, "EXP");
		if(currentEXP.error){
			CUDManager.registerNewUser(targetUser);
		}		

		this.sendReply("User " + targetUser + " is now a challenger!");
		this.logModCommand(Chat.escapeHTML(user.name) + " made user " + targetUser + " a challenger.");
		CUDManager.updateUser(targetUser, "isChallenger", true);
		CUDManager.syncData();
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
		CUDManager.syncData();
		return;		
	},
	challengers: function (target, room, user) {
		var userIds = CUDManager.getUserIds();
		var leaderboardData = [];
		for(var i = 0; i < userIds.length; i++){
			if(CUDManager.getUserData(userIds[i], "isChallenger")){
				leaderboardData.push({id: userIds[i], EXP: CUDManager.getUserData(userIds[i], "EXP")});
			}
		}
		leaderboardData = leaderboardData.sort(function(){return function(a, b){return a["EXP"] > b["EXP"];}});
		var buffer = "<div class='ladder'><table>";
		buffer+="<tr><th>User</th><th>Experience Points</th></tr>";
		for(var i = 0; i < leaderboardData.length; i++){
			buffer+="<tr><td>"+leaderboardData[i].id+"</td><td>"+leaderboardData[i].EXP+"</td></tr>";
		}
		buffer+="</table></div>"
		this.sendReply('|raw|' + buffer);

		return;		
	},	
	leaderboard: function (target, room, user) {
		var userIds = CUDManager.getUserIds();
		var leaderboardData = [];
		for(var i = 0; i < userIds.length; i++){
			leaderboardData.push({id: userIds[i], EXP: CUDManager.getUserData(userIds[i], "EXP"), position: CUDManager.getUserData(userIds[i], "position")});
		}
		leaderboardData = leaderboardData.sort(function(){return function(a, b){return a["EXP"] > b["EXP"];}});
		var buffer = "<div class='ladder'><table>";
		buffer+="<tr><th>User</th><th>Experience Points</th><th>Rank</th></tr>";
		for(var i = 0; i < leaderboardData.length; i++){
			buffer+="<tr><td>"+leaderboardData[i].id+"</td><td>"+leaderboardData[i].EXP+"</td><td>"+leaderboardData[i].position+"</td></tr>";
		}
		buffer+="</table></div>"
		this.sendReply('|raw|' + buffer);

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
		CUDManager.syncData();
			
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
		CUDManager.syncData();
		return;
		
	},
	leaguehelp: 'leaguehelp',
	leaguehelp: [
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