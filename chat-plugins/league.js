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
	quoteoftheday: 'qotd',
	addexp: function (target, room, user) {
		if(!checkPermission(user)){
			this.errorReply("You are not authorized to use this command!");
			return;	
		}
		if(!target){
			this.errorReply("Usage: /addexp user, amount (amount can be negative)");
			return;	
		}
		var tmp = target.split(",");
		for(var i = 0; i < tmp.length; i++){
			tmp[i] = tmp[i].trim();
		}
		var amount = parseInt(tmp[1]);
		if(isNaN(amount)){
			this.errorReply("The EXP amount("+tmp[1]+") is not a valid number!");	
			return;
		}
		
		var currentEXP = CUDManager.getUserData(tmp[0], "EXP");
		if(currentEXP.error){
			this.errorReply("The user does not exist!");	
			return;
		}
		var newEXP = currentEXP + amount;
		if(newEXP < 0){
			newEXP = 0;
		}
		this.sendReply("EXP for user " + tmp[0] + " has been changed from " + currentEXP + " to " + newEXP + ".");
		this.logModCommand(Chat.escapeHTML(user.name) + " updated the EXP of " + tmp[0] + " by " + amount + ".");
		CUDManager.updateUser(tmp[0], "EXP", newEXP);
		CUDManager.syncData();
		return;
		
	},
	setexp: function (target, room, user) {
		if(!checkPermission(user)){
			this.errorReply("You are not authorized to use this command!");
			return;	
		}
		if(!target){
			this.errorReply("Usage: /set user, amount");
			return;	
		}
		var tmp = target.split(",");
		for(var i = 0; i < tmp.length; i++){
			tmp[i] = tmp[i].trim();
		}
		var amount = parseInt(tmp[1]);
		if(isNaN(amount)){
			this.errorReply("The EXP amount("+tmp[1]+") is not a valid number!");	
			return;
		}
		
		var currentEXP = CUDManager.getUserData(tmp[0], "EXP");
		if(currentEXP.error){
			this.errorReply("The user does not exist!");	
			return;
		}
		
		var newEXP = amount;
		if(newEXP < 0){
			newEXP = 0;
		}
		this.sendReply("EXP for user " + tmp[0] + " has been changed to " + newEXP + ".");
		this.logModCommand(Chat.escapeHTML(user.name) + " updated the EXP of " + tmp[0] + " to " + amount + ".");
		CUDManager.updateUser(tmp[0], "EXP", newEXP);
		CUDManager.syncData();
		return;		
	},
	leadboard: function (target, room, user) {
		if(!target){
			this.errorReply("Usage: /set user, amount");
			return;	
		}
		var tmp = target.split(",");
		for(var i = 0; i < tmp.length; i++){
			tmp[i] = tmp[i].trim();
		}
		var amount = parseInt(tmp[1]);
		if(isNaN(amount)){
			this.errorReply("The EXP amount("+tmp[1]+") is not a valid number!");	
			return;
		}
		
		var currentEXP = CUDManager.getUserData(tmp[0], "EXP");
		if(currentEXP.error){
			this.errorReply("The user does not exist!");	
			return;
		}
		
		var newEXP = amount;
		if(newEXP < 0){
			newEXP = 0;
		}
		this.sendReply("EXP for user " + tmp[0] + " has been changed to " + newEXP + ".");
		this.logModCommand(Chat.escapeHTML(user.name) + " updated the EXP of " + tmp[0] + " to " + amount + ".");
		CUDManager.updateUser(tmp[0], "EXP", newEXP);
		CUDManager.syncData();
		return;		
	},	
	leaguehelp: 'leaguehelp',
	leaguehelp: [
		"/addexp - Add EXP to a user /addexp user, amount (amount can be negative)",
		"/setexp - Set EXP to a user /set user, amount",
		"/leadboard - View the current EXP of all registered league members"
		"/qotd [quote] - Set the Inspirational Quote of the Day. Requires: @ # & ~",
	],
};