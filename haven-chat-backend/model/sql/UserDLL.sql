CREATE TABLE IF NOT EXISTS User (
	id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
	username varchar(256) NOT NULL UNIQUE,
	password varchar(256) NOT NULL,
	createdDate timestamp DEFAULT CURRENT_TIMESTAMP,
	firstName varchar(256),
	lastName varchar(256),
	email varchar(320) NOT NULL UNIQUE,
	connectedDate timestamp DEFAULT CURRENT_TIMESTAMP,
	disconnectedDate timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Friend (
	userId int,
	friendId int,
	active bit DEFAULT(0),
	block bit DEFAULT(0),
	createdDate datetime
);

CREATE TABLE IF NOT EXISTS ChatSession (
	id bigint NOT NULL AUTO_INCREMENT PRIMARY KEY,
	secret varchar(256) NOT NULL,
	createdDate timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ChatParticipants (
	sid bigint NOT NULL,
	userId int
);

DELETE FROM ChatParticipants;
DELETE FROM ChatSession;
ALTER TABLE ChatSession AUTO_INCREMENT=1;