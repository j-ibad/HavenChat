DROP TABLE IF EXISTS User;
CREATE TABLE IF NOT EXISTS User (
	id int NOT NULL AUTO_INCREMENT PRIMARY KEY ,
	username varchar(256) NOT NULL UNIQUE,
	password varchar(256) NOT NULL,
	createdDate datetime,
	firstName varchar(256),
	lastName varchar(256),
	email varchar(320) NOT NULL UNIQUE
);