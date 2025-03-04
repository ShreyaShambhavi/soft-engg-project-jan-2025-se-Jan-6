from flask import Blueprint, jsonify, request, current_app, session, make_response
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from app.models import User, Role, UserRoles, Courses, db, Notes
from datetime import datetime
import logging
from flask_cors import cross_origin

auth = Blueprint('auth', __name__, url_prefix='/api')
logger = logging.getLogger(__name__) # Initialize a logger

@auth.route('/v1/signup/', methods=['POST'])
@cross_origin(origins="http://localhost:5173", supports_credentials=True)
def signup():
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data or 'username' not in data or 'role' not in data or 'courses' not in data:
        return jsonify({'message': 'Missing email, username, password, role, or courses'}), 400

    if data['role'] != 'student':
        return jsonify({'message': 'You are not allowed to signup. Please contact support.'}), 403

    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 400

    hashed_password = generate_password_hash(data['password'], method='pbkdf2:sha256')
    new_user = User(email=data['email'], username=data['username'], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    role = Role.query.filter_by(name=data['role']).first()
    if not role:
        return jsonify({'message': 'Role does not exist'}), 400

    user_role = UserRoles(userId=new_user.id, roleId=role.id)
    db.session.add(user_role)
    db.session.commit()

    # Assign the selected courses to the user
    for course_name in data['courses']:
        course = Courses.query.filter_by(name=course_name).first()
        if course:
            new_user.courses.append(course)
        else:
            return jsonify({'message': f'Course {course_name} does not exist'}), 400

    db.session.commit()

    login_user(new_user, remember=True)
    return jsonify({'message': 'User created successfully', 'user': new_user.to_dict()}), 201

@auth.route('/v1/login/', methods=['POST'])
@cross_origin(origins="http://localhost:5173", supports_credentials=True)
def login():
    logger.debug("Login route called")
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'message': 'Missing email or password'}), 400

    user = User.query.filter_by(email=data['email']).first()
    if user and check_password_hash(user.password, data['password']):
        logger.debug(f"User {user.email} authenticated successfully")
        login_user(user, remember=True)  # Ensures session persists

        response = make_response(jsonify({'message': 'Logged in successfully', 'user': user.to_dict()}), 200)
        response.headers['Cache-Control'] = 'no-store'  # Prevent caching issues
        return response

    return jsonify({'message': 'Invalid credentials'}), 401

@auth.route('/v1/logout/', methods=['POST'])
@login_required
def logout():
    if not current_user.is_authenticated:  # Prevent double logout
        return jsonify({"error": "User already logged out"}), 400  # Return 400 Bad Request
    
    logger.debug(f"Logout route called - Current user: {current_user}")
    
    if not current_user.is_authenticated:
        logger.debug("Logout failed - User is not authenticated")
        return jsonify({'error': 'User not authenticated'}), 401  # Debugging step

    logout_user()
    session.clear()
    
    logger.debug("User successfully logged out")
    response = jsonify({"message": "Logged out successfully"})
    response.set_cookie('remember_token', '', expires=0)  # Expire remember_token
    return response
    
@auth.route('/v1/user', methods=['GET'])
@login_required
def get_user():
    return jsonify(current_user.to_dict())  # Ensure that `to_dict()` method exists on your User model

@auth.route('/v1/courses', methods=['GET'])
@login_required
def get_courses():
    courses = [course.to_dict() for course in current_user.courses]
    return jsonify({'courses': courses})

@auth.route('/v1/all-courses', methods=['GET'])
def get_all_courses():
    courses = [course.to_dict() for course in Courses.query.all()]
    return jsonify({'courses': courses})

@auth.route('/v1/courses/add', methods=['POST'])
@login_required
def add_courses():
    data = request.get_json()
    if not data or 'course_names' not in data:
        return jsonify({'message': 'Missing course names'}), 400

    added_courses = []
    for course_name in data['course_names']:
        course = Courses.query.filter_by(name=course_name).first()
        if not course:
            return jsonify({'message': f'Course {course_name} does not exist'}), 400

        if course in current_user.courses:
            return jsonify({'message': f'Course {course_name} already added'}), 400

        current_user.courses.append(course)
        added_courses.append(course)

    db.session.commit()
    return jsonify({'message': 'Courses added successfully', 'courses': [course.to_dict() for course in current_user.courses]}), 200

@auth.route('/v1/courses/drop', methods=['POST'])
@login_required
def drop_courses():
    data = request.get_json()
    if not data or 'course_names' not in data:
        return jsonify({'message': 'Missing course names'}), 400

    dropped_courses = []
    for course_name in data['course_names']:
        course = Courses.query.filter_by(name=course_name).first()
        if not course:
            return jsonify({'message': f'Course {course_name} does not exist'}), 400

        if course not in current_user.courses:
            return jsonify({'message': f'Course {course_name} not found in user courses'}), 400

        if len(current_user.courses) <= 1:
            return jsonify({'message': 'Cannot drop the last remaining course'}), 400

        current_user.courses.remove(course)
        dropped_courses.append(course)

    db.session.commit()
    return jsonify({'message': 'Courses dropped successfully', 'courses': [course.to_dict() for course in current_user.courses]}), 200

@auth.route('/v1/courses/change', methods=['POST'])
@login_required
def change_courses():
    data = request.get_json()
    if not data or 'old_course_names' not in data or 'new_course_names' not in data:
        return jsonify({'message': 'Missing old course names or new course names'}), 400

    if len(data['old_course_names']) != len(data['new_course_names']):
        return jsonify({'message': 'The number of old courses and new courses must match'}), 400

    changed_courses = []
    for old_course_name, new_course_name in zip(data['old_course_names'], data['new_course_names']):
        old_course = Courses.query.filter_by(name=old_course_name).first()
        new_course = Courses.query.filter_by(name=new_course_name).first()

        if not old_course or not new_course:
            return jsonify({'message': 'One or both courses do not exist'}), 400

        if old_course not in current_user.courses:
            return jsonify({'message': f'Old course {old_course_name} not found in user courses'}), 400

        current_user.courses.remove(old_course)
        current_user.courses.append(new_course)
        changed_courses.append((old_course, new_course))

    db.session.commit()
    return jsonify({'message': 'Courses changed successfully', 'courses': [course.to_dict() for course in current_user.courses]}), 200

@auth.route('/v1/courses/<course_name>', methods=['GET'])
@login_required
def get_course_details(course_name):
    course = Courses.query.filter_by(name=course_name).first()
    if not course:
        return jsonify({'message': 'Course not found'}), 404

    return jsonify({'course': course.to_dict()}), 200

@auth.route('/v1/available-courses', methods=['GET'])
@login_required
def get_available_courses():
    user_courses = {course.name for course in current_user.courses}
    all_courses = {course.name for course in Courses.query.all()}
    available_courses = all_courses - user_courses
    available_courses_list = [Courses.query.filter_by(name=course).first().to_dict() for course in available_courses]
    return jsonify({'courses': available_courses_list})


#Notes routes below and needs some fixing

@auth.route('/v1/notes', methods=['POST'])
@login_required
def create_note():
    data = request.get_json()
    if not data or 'title' not in data or 'content' not in data or 'courseId' not in data:
        return jsonify({'message': 'Missing title, content, or courseId'}), 400

    course = Courses.query.get(data['courseId'])
    if not course:
        return jsonify({'message': 'Course not found'}), 404

    new_note = Notes(
        userId=current_user.id, 
        courseId=data['courseId'], 
        title=data['title'], 
        content=data['content']
    )
    
    db.session.add(new_note)
    db.session.commit()

    return jsonify({'message': 'Note created successfully', 'note': new_note.to_dict()}), 201

@auth.route('/v1/notes', methods=['GET'])
@login_required
def get_user_notes():
    # Optional query parameters for filtering
    course_id = request.args.get('courseId', type=int)
    
    query = Notes.query.filter_by(userId=current_user.id)
    
    if course_id:
        query = query.filter_by(courseId=course_id)
    
    notes = query.order_by(Notes.timestamp.desc()).all()
    return jsonify({'notes': [note.to_dict() for note in notes]}), 200

@auth.route('/v1/notes/<int:note_id>', methods=['GET'])
@login_required
def get_note_details(note_id):
    note = Notes.query.filter_by(id=note_id, userId=current_user.id).first()
    if not note:
        return jsonify({'message': 'Note not found'}), 404
    
    return jsonify({'note': note.to_dict()}), 200

@auth.route('/v1/notes/<int:note_id>', methods=['PUT'])
@login_required
def update_note(note_id):
    note = Notes.query.filter_by(id=note_id, userId=current_user.id).first()
    if not note:
        return jsonify({'message': 'Note not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({'message': 'No update data provided'}), 400

    # Update fields that are provided
    if 'title' in data:
        note.title = data['title']
    if 'content' in data:
        note.content = data['content']
    if 'courseId' in data:
        course = Courses.query.get(data['courseId'])
        if not course:
            return jsonify({'message': 'Course not found'}), 404
        note.courseId = data['courseId']

    db.session.commit()
    return jsonify({'message': 'Note updated successfully', 'note': note.to_dict()}), 200

@auth.route('/v1/notes/<int:note_id>', methods=['DELETE'])
@login_required
def delete_note(note_id):
    note = Notes.query.filter_by(id=note_id, userId=current_user.id).first()
    if not note:
        return jsonify({'message': 'Note not found'}), 404

    db.session.delete(note)
    db.session.commit()
    return jsonify({'message': 'Note deleted successfully'}), 200