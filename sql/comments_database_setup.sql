create database comments_test;
use comments_test;

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'abctest';

CREATE TABLE comments (
    commentId int PRIMARY KEY AUTO_INCREMENT,
    archive varchar(255),
    filepath varchar(255),

    parentCommentId int,
    threadId int,
    statement text,
    commentType ENUM('QUESTION', 'REMARK', 'OTHER'),
    questionStatus ENUM('UNANSWERED', 'ANSWERED', 'ACCEPTED', 'OTHER'),
    courseId varchar(255),
    courseTerm varchar(255),
    isEdited tinyint,
    isPrivate tinyint,
    isDeleted tinyint,

    hiddenStatus enum('UNHIDDEN', 'SPAM', 'INCORRECT', 'IRRELEVANT', 'ABUSE','OTHER'),
    hiddenJustification varchar(255),

    selectedText text,
    selectedElement text,

    isAnonymous tinyint,
    userId varchar(255),
    userName varchar(255),
    userEmail varchar(255),

    postedTimestamp timestamp DEFAULT CURRENT_TIMESTAMP,
    updatedTimestamp timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE updateHistory (
   updateId int PRIMARY KEY AUTO_INCREMENT,
    ownerId varchar(255),
    updaterId varchar(255),
    commentId int NOT NULL,
    previousStatement text,
    previousHiddenStatus enum('UNHIDDEN', 'SPAM', 'INCORRECT', 'IRRELEVANT', 'ABUSE','OTHER'),
    previousHiddenJustification varchar(255),
    previousQuestionStatus ENUM('UNANSWERED', 'ANSWERED', 'ACCEPTED', 'OTHER'),
    
    updatedTimestamp timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE points (
    points int,
    reason varchar(255),
    
    userId varchar(255),
	commentId int unique,
    granterId varchar(255),
    
	grantTimestamp timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    updateId INT PRIMARY KEY AUTO_INCREMENT,
    userId VARCHAR(255),
    header VARCHAR(255),
    content VARCHAR(255),
    header_de VARCHAR(255),
    content_de VARCHAR(255),
    link VARCHAR(255),
    notificationType VARCHAR(255),
    postedTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE userInfo (
    userId VARCHAR(50) PRIMARY KEY,
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    email VARCHAR(255),
    notificationSeenTs VARCHAR(255)
);

CREATE TABLE StudyBuddyUsers (
    userId VARCHAR(255) NOT NULL,
    courseId VARCHAR(255) NOT NULL,

    active BOOLEAN NOT NULL,
    email VARCHAR(255) NOT NULL,
    
    userName VARCHAR(255),
    intro VARCHAR(255),
    studyProgram VARCHAR(255),
    semester INT,
    meetType VARCHAR(255),
    languages VARCHAR(255),
    dayPreference VARCHAR(255),
    
    PRIMARY KEY (userId, courseId)
);

CREATE TABLE StudyBuddyConnections (
    senderId VARCHAR(255) NOT NULL,
    receiverId VARCHAR(255) NOT NULL,
    courseId VARCHAR(255) NOT NULL,
    timeOfIssue TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (senderId, receiverId, courseId)
);

ALTER TABLE StudyBuddyConnections ADD CONSTRAINT StudyBuddyConnections_fk0 FOREIGN KEY (senderId) REFERENCES StudyBuddyUsers(userId);
ALTER TABLE StudyBuddyConnections ADD CONSTRAINT StudyBuddyConnections_fk1 FOREIGN KEY (receiverId) REFERENCES StudyBuddyUsers(userId);

/* Query to get 2-way connections */
SELECT DISTINCT t1.senderId, t1.receiverId FROM StudyBuddyConnections t1 JOIN StudyBuddyConnections t2 ON t1.senderId = t2.receiverId AND t1.receiverId = t2.senderId WHERE t1.senderId < t1.receiverId;

/* Query to get 1-way connection requests */
SELECT t1.senderId, t1.receiverId FROM StudyBuddyConnections t1 LEFT JOIN StudyBuddyConnections t2 ON t1.senderId = t2.receiverId AND t1.receiverId = t2.senderId WHERE t2.senderId IS NULL AND t2.receiverId IS NULL AND t1.senderId < t1.receiverId;