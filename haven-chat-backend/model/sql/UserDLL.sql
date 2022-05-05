CREATE TABLE IF NOT EXISTS User (
	id int PRIMARY KEY,
	username varchar(MAX),
	password varchar(MAX),
	createdDate datetime
);