import datetime
import uuid
from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin

db = SQLAlchemy()

# Association table for many-to-many relationship between User and Courses
user_courses = db.Table('user_courses',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id', ondelete='CASCADE'), primary_key=True),
    db.Column('course_id', db.Integer, db.ForeignKey('courses.id', ondelete='CASCADE'), primary_key=True)
)

class User(db.Model, UserMixin):
    id            = db.Column(db.Integer(), primary_key = True)
    email         = db.Column(db.String(), nullable = False, unique = True)
    username      = db.Column(db.String(), nullable = False, unique = True)
    password      = db.Column(db.String(), nullable = False)
    active        = db.Column(db.Boolean(), default = True)
    fs_uniquifier = db.Column(db.String(), nullable = False, unique = True, default=lambda: str(uuid.uuid4())) # Added Default
    roles         = db.relationship('Role', secondary = 'user_roles', back_populates = 'users')
    courses       = db.relationship('Courses', secondary=user_courses, back_populates='students')  # Added relationship to Courses
    # Added relationship to Scores and Chatroom for easy access
    scores      = db.relationship('Scores', backref='user', lazy=True)
    chatrooms = db.relationship('Chatroom', backref='user', lazy=True)
    messages  = db.relationship('Messages', backref='user', lazy=True) # Added messages for convenience

    def __repr__(self): # Useful for debugging
        return f'<User {self.username}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'active': self.active,
            'fs_uniquifier': self.fs_uniquifier,
            'roles': [role.name for role in self.roles],  # Send only role names
            'courses': [course.name for course in self.courses]  # Send only course names
        }


class Role(db.Model, RoleMixin):
    id   = db.Column(db.Integer(), primary_key = True)
    name = db.Column(db.String(), nullable = False, unique = True)
    users = db.relationship('User', secondary = 'user_roles', back_populates='roles')

    def __repr__(self): # Useful for debugging
        return f'<Role {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name
        }


class UserRoles(db.Model):
    id     = db.Column(db.Integer(), primary_key = True)
    userId = db.Column(db.Integer(), db.ForeignKey('user.id', ondelete='CASCADE')) # Added ondelete
    roleId = db.Column(db.Integer(), db.ForeignKey('role.id', ondelete='CASCADE')) # Added ondelete
    user   = db.relationship('User', viewonly=True) #Added relationships and back_populates
    role   = db.relationship('Role', viewonly=True) #Added relationships and back_populates

    __table_args__ = (db.UniqueConstraint('userId', 'roleId', name='unique_user_role'),) #Prevents duplicate role assignments

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.userId,
            'roleId': self.roleId
        }


class Courses(db.Model):
    id          = db.Column(db.Integer(), primary_key = True)
    name        = db.Column(db.String(), nullable = False, unique = True)
    description = db.Column(db.String(), nullable = False)
    students    = db.relationship('User', secondary=user_courses, back_populates='courses')  # Added relationship to Users
    chatrooms = db.relationship('Chatroom', backref='course', lazy=True)

    def __repr__(self): # Useful for debugging
        return f'<Course {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description
        }


class Weeks(db.Model):
    id   = db.Column(db.Integer(), primary_key = True)
    name = db.Column(db.String(), nullable = False)

    def __repr__(self): # Useful for debugging
        return f'<Week {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name
        }


class Lectures(db.Model):
    id          = db.Column(db.Integer(), primary_key = True)
    name        = db.Column(db.String(), nullable = False)
    content_url = db.Column(db.String(), nullable = False)

    def __repr__(self): # Useful for debugging
        return f'<Lecture {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'content_url': self.content_url
        }


class Assignments(db.Model):
    id    = db.Column(db.Integer(), primary_key = True)
    name  = db.Column(db.String(), nullable = False)
    marks = db.Column(db.Integer(), nullable = False)
    scores = db.relationship('Scores', backref='assignment', lazy=True)

    def __repr__(self): # Useful for debugging
        return f'<Assignment {self.name}>'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'marks': self.marks
        }


class Questions(db.Model):
    id       = db.Column(db.Integer(), primary_key = True)
    question = db.Column(db.String(), nullable = False)
    option1  = db.Column(db.String(), nullable = False)
    option2  = db.Column(db.String(), nullable = False)
    option3  = db.Column(db.String(), nullable = False)
    option4  = db.Column(db.String(), nullable = False)
    answer   = db.Column(db.String(), nullable = False)
    marks    = db.Column(db.Integer(), nullable = False)
    scores = db.relationship('Scores', backref='question', lazy=True)

    def __repr__(self): # Useful for debugging
        return f'<Question {self.question}>'

    def to_dict(self):
        return {
            'id': self.id,
            'question': self.question,
            'option1': self.option1,
            'option2': self.option2,
            'option3': self.option3,
            'option4': self.option4,
            'answer': self.answer,
            'marks': self.marks
        }


class Scores(db.Model):
    id           = db.Column(db.Integer(), primary_key = True)
    userId       = db.Column(db.Integer(), db.ForeignKey('user.id', ondelete='CASCADE')) #Added ondelete
    assignmentId = db.Column(db.Integer(), db.ForeignKey('assignments.id', ondelete='CASCADE')) #Added ondelete
    questionId   = db.Column(db.Integer(), db.ForeignKey('questions.id', ondelete='CASCADE')) #Added ondelete
    score        = db.Column(db.Integer(), nullable = False)

    __table_args__ = (db.UniqueConstraint('userId', 'assignmentId', 'questionId', name='unique_score'),) #Prevents duplicate scores

    def __repr__(self): # Useful for debugging
        return f'<Score user_id={self.userId}, assignment_id={self.assignmentId}, question_id={self.questionId}, score={self.score}>'

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.userId,
            'assignmentId': self.assignmentId,
            'questionId': self.questionId,
            'score': self.score
        }


class Chatroom(db.Model):
    id        = db.Column(db.Integer(), primary_key = True)
    courseId  = db.Column(db.Integer(), db.ForeignKey('courses.id', ondelete='CASCADE')) #Added ondelete
    userId    = db.Column(db.Integer(), db.ForeignKey('user.id', ondelete='CASCADE')) #Added ondelete
    messages = db.relationship('Messages', backref='chatroom', lazy=True)

    def __repr__(self): # Useful for debugging
        return f'<Chatroom course_id={self.courseId}, user_id={self.userId}>'

    def to_dict(self):
        return {
            'id': self.id,
            'courseId': self.courseId,
            'userId': self.userId
        }


class Messages(db.Model):
    id         = db.Column(db.Integer(), primary_key = True)
    chatroomId = db.Column(db.Integer(), db.ForeignKey('chatroom.id', ondelete='CASCADE')) #Added ondelete
    userId     = db.Column(db.Integer(), db.ForeignKey('user.id', ondelete='CASCADE')) #Added ondelete
    message    = db.Column(db.String(), nullable = False)
    timestamp  = db.Column(db.DateTime(), nullable = False, default = datetime.datetime.now)

    def __repr__(self): # Useful for debugging
        return f'<Message user_id={self.userId}, chatroom_id={self.chatroomId}, timestamp={self.timestamp}>'

    def to_dict(self):
        return {
            'id': self.id,
            'chatroomId': self.chatroomId,
            'userId': self.userId,
            'message': self.message,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None  # Convert datetime to ISO format
        }

class Notes(db.Model):
    id = db.Column(db.Integer(), primary_key = True)
    userId = db.Column(db.Integer(), db.ForeignKey('user.id', ondelete='CASCADE'))
    courseId = db.Column(db.Integer(), db.ForeignKey('courses.id', ondelete='CASCADE'))
    title = db.Column(db.String(255), nullable = False)
    content = db.Column(db.Text(), nullable = False)
    timestamp = db.Column(db.DateTime(), nullable = False, default = datetime.datetime.now)
    user = db.relationship('User', backref=db.backref('notes', lazy=True))
    course = db.relationship('Courses', backref=db.backref('notes', lazy=True))

    def __repr__(self): 
        return f'<Note user_id={self.userId}, course_id={self.courseId}, title={self.title}, timestamp={self.timestamp}>'

    def to_dict(self):
        return {
            'id': self.id,
            'userId': self.userId,
            'courseId': self.courseId,
            'title': self.title,
            'content': self.content,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None
        }