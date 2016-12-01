CREATE TABLE userdata (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	showdown_user VARCHAR(255) UNIQUE,
	isChallenger BOOLEAN,
	typeLoyalty VARCHAR(255),
	position VARCHAR(255),
	experience INT UNSIGNED,
	badges TEXT
)


