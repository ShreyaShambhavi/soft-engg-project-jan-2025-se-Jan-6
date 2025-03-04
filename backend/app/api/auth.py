from flask import Blueprint, jsonify, request, current_app, session, make_response
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from app.models import User, Role, UserRoles, Courses, db, Notes, Messages, Chatroom
from datetime import datetime
import logging
from flask_cors import cross_origin
import uuid

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

# ------- CHATROOM API ENDPOINTS --------

@auth.route('/v1/chatrooms', methods=['GET'])
@login_required
@cross_origin(origins="http://localhost:5173", supports_credentials=True)
def get_user_chatrooms():
    """Get all chatrooms for the current user"""
    # Find all courses the user is enrolled in
    user_courses = current_user.courses
    
    chatrooms = []
    for course in user_courses:
        # Find or create chatroom for this course
        chat = Chatroom.query.filter_by(userId=current_user.id, courseId=course.id).first()
        if not chat:
            chat = Chatroom(userId=current_user.id, courseId=course.id)
            db.session.add(chat)
            db.session.commit()
        
        # Get the last message for preview
        last_message = Messages.query.filter_by(chatroomId=chat.id).order_by(Messages.timestamp.desc()).first()
        
        chatrooms.append({
            'id': chat.id,
            'courseId': course.id,
            'courseName': course.name,
            'lastMessage': last_message.message if last_message else None,
            'lastMessageTime': last_message.timestamp.isoformat() if last_message else None
        })
    
    return jsonify({'chatrooms': chatrooms})

@auth.route('/v1/chatrooms/<int:course_id>', methods=['GET'])
@login_required
@cross_origin(origins="http://localhost:5173", supports_credentials=True)
def get_course_chatroom(course_id):
    """Get or create a chatroom for a specific course"""
    # Check if course exists and user is enrolled
    course = Courses.query.get(course_id)
    if not course or course not in current_user.courses:
        return jsonify({'message': 'Course not found or not enrolled'}), 404
    
    # Find or create chatroom
    chatroom = Chatroom.query.filter_by(userId=current_user.id, courseId=course_id).first()
    if not chatroom:
        chatroom = Chatroom(userId=current_user.id, courseId=course_id)
        db.session.add(chatroom)
        db.session.commit()
    
    # Get all participants in this course's chatrooms
    participants = User.query.join(Chatroom).filter(Chatroom.courseId == course_id).all()
    participant_count = len(participants)
    
    # Get basic participant info
    participants_info = [{
        'id': user.id,
        'username': user.username,
        'roles': [role.name for role in user.roles]
    } for user in participants[:10]]  # Limit to first 10 for preview
    
    return jsonify({
        'chatroom': chatroom.to_dict(),
        'course': course.to_dict(),
        'participantCount': participant_count,
        'participants': participants_info
    })

@auth.route('/v1/messages/<int:chatroom_id>', methods=['GET'])
@login_required
@cross_origin(origins="http://localhost:5173", supports_credentials=True)
def get_chatroom_messages(chatroom_id):
    """Get all messages for a specific chatroom"""
    # Verify chatroom exists and belongs to current user
    chatroom = Chatroom.query.get(chatroom_id)
    if not chatroom:
        return jsonify({'message': 'Chatroom not found'}), 404
    
    # Get course chatroom (could be group chat for a course)
    course_id = chatroom.courseId
    
    # Get all messages for this course (across all users)
    course_chatrooms = Chatroom.query.filter_by(courseId=course_id).all()
    chatroom_ids = [chat.id for chat in course_chatrooms]
    
    messages = Messages.query.filter(Messages.chatroomId.in_(chatroom_ids)).order_by(Messages.timestamp).all()
    
    # Include user details with each message
    messages_with_user = []
    for message in messages:
        user = User.query.get(message.userId)
        messages_with_user.append({
            'id': message.id,
            'message': message.message,
            'timestamp': message.timestamp.isoformat(),
            'edited': getattr(message, 'edited', False),  # Handle if edited column doesn't exist yet
            'user': {
                'id': user.id,
                'username': user.username,
                'isCurrentUser': user.id == current_user.id
            }
        })
    
    return jsonify({'messages': messages_with_user})

@auth.route('/v1/messages', methods=['POST'])
@login_required
@cross_origin(origins="http://localhost:5173", supports_credentials=True)
def send_message():
    """Send a new message"""
    data = request.get_json()
    if not data or 'courseId' not in data or 'message' not in data:
        return jsonify({'message': 'Missing course ID or message content'}), 400
    
    course_id = data['courseId']
    message_content = data['message']
    
    # Verify course exists and user is enrolled
    course = Courses.query.get(course_id)
    if not course or course not in current_user.courses:
        return jsonify({'message': 'Course not found or not enrolled'}), 404
    
    # Find or create chatroom
    chatroom = Chatroom.query.filter_by(userId=current_user.id, courseId=course_id).first()
    if not chatroom:
        chatroom = Chatroom(userId=current_user.id, courseId=course_id)
        db.session.add(chatroom)
        db.session.commit()
    
    # Create and save message
    new_message = Messages(
        chatroomId=chatroom.id,
        userId=current_user.id,
        message=message_content,
        timestamp=datetime.now()
    )
    
    # Set edited field if it exists in the model
    if hasattr(new_message, 'edited'):
        new_message.edited = False
        
    db.session.add(new_message)
    db.session.commit()
    
    return jsonify({
        'message': 'Message sent successfully',
        'messageData': {
            'id': new_message.id,
            'message': new_message.message,
            'timestamp': new_message.timestamp.isoformat(),
            'edited': getattr(new_message, 'edited', False),
            'user': {
                'id': current_user.id,
                'username': current_user.username,
                'isCurrentUser': True
            }
        }
    }), 201

@auth.route('/v1/course-members/<int:course_id>', methods=['GET'])
@login_required
@cross_origin(origins="http://localhost:5173", supports_credentials=True)
def get_course_members(course_id):
    """Get all members of a course"""
    # Verify course exists
    course = Courses.query.get(course_id)
    if not course:
        return jsonify({'message': 'Course not found'}), 404
    
    # Get all users enrolled in this course
    members = course.students
    
    members_info = []
    for member in members:
        members_info.append({
            'id': member.id,
            'username': member.username,
            'email': member.email,
            'roles': [role.name for role in member.roles],
            'isCurrentUser': member.id == current_user.id
        })
    
    return jsonify({'members': members_info})

@auth.route('/v1/messages/<int:message_id>', methods=['PUT'])
@login_required
@cross_origin(origins="http://localhost:5173", supports_credentials=True)
def edit_message(message_id):
    """Edit a message"""
    # Verify message exists and belongs to current user
    message = Messages.query.get(message_id)
    if not message:
        return jsonify({'message': 'Message not found'}), 404
    
    # Only the owner can edit their message
    if message.userId != current_user.id:
        return jsonify({'message': 'You are not authorized to edit this message'}), 403
    
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'message': 'Missing message content'}), 400
    
    # Update message content
    message.message = data['message']
    
    # If the Messages model has an 'edited' field
    if hasattr(message, 'edited'):
        message.edited = True
        
    db.session.commit()
    
    return jsonify({
        'message': 'Message updated successfully',
        'messageData': {
            'id': message.id,
            'message': message.message,
            'timestamp': message.timestamp.isoformat(),
            'edited': getattr(message, 'edited', True),  # Default to True even if column doesn't exist yet
            'user': {
                'id': current_user.id,
                'username': current_user.username,
                'isCurrentUser': True
            }
        }
    })

@auth.route('/v1/messages/<int:message_id>', methods=['DELETE'])
@login_required
@cross_origin(origins="http://localhost:5173", supports_credentials=True)
def delete_message(message_id):
    """Delete a message"""
    # Verify message exists and belongs to current user
    message = Messages.query.get(message_id)
    if not message:
        return jsonify({'message': 'Message not found'}), 404
    
    # Only the owner can delete their message
    if message.userId != current_user.id:
        return jsonify({'message': 'You are not authorized to delete this message'}), 403
    
    # Delete the message
    db.session.delete(message)
    db.session.commit()
    
    return jsonify({
        'message': 'Message deleted successfully',
        'messageId': message_id
    })



