import pytest
import pytest_mock
import json
from datetime import datetime
from flask import session
from app import create_app, db
from app.models import User, Role, Courses, Notes, Chatroom, Messages, UserRoles
from werkzeug.security import generate_password_hash, check_password_hash

# Add this at the top of your test_api.py file, after the imports:

# Mock response class for Together API tests
class MockResponse:
    class Choice:
        class Message:
            def __init__(self, content):
                self.content = content
                
        def __init__(self, content):
            self.message = self.Message(content)
            
    def __init__(self, content):
        self.choices = [self.Choice(content)]



@pytest.fixture(scope='module')
def app():
    """Create and configure Flask app for testing."""
    app = create_app()
    
    # Configure the app for testing
    app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': 'sqlite:///:memory:',
        'WTF_CSRF_ENABLED': False,
        'SECRET_KEY': 'test-secret-key'
    })
    
    # Create context and setup
    with app.app_context():
        # Ensure required test courses exist
        required_courses = [
            ('Artificial Intelligence', 'Course for AI'),
            ('Deep Learning', 'Neural networks and DL'),
            ('Software Engineering', 'SE fundamentals')
        ]
        
        for name, desc in required_courses:
            if not Courses.query.filter_by(name=name).first():
                course = Courses(name=name, description=desc)
                db.session.add(course)
        
        # Create test roles if needed
        if not Role.query.filter_by(name='student').first():
            role = Role(name='student')
            db.session.add(role)
            
        db.session.commit()
        yield app

@pytest.fixture(scope='function')
def client(app):
    """Test client for the app."""
    with app.test_client() as client:
        yield client

@pytest.fixture(scope='function')
def auth_client(app, client):
    """Test client with authenticated user session."""
    with app.app_context():
        # Ensure the Artificial Intelligence course exists
        ai_course = Courses.query.filter_by(name='Artificial Intelligence').first()
        if not ai_course:
            ai_course = Courses(name='Artificial Intelligence', description='Course for AI')
            db.session.add(ai_course)
            db.session.commit()
        
        # Find or create test user
        test_user = User.query.filter_by(email='test_api@example.com').first()
        if not test_user:
            # Create a test user
            hashed_password = generate_password_hash('password123')
            test_user = User(
                email='test_api@example.com',
                username='test_api_user',
                password=hashed_password
            )
            db.session.add(test_user)
            
            # Add student role to user
            role = Role.query.filter_by(name='student').first()
            if not role:
                role = Role(name='student')
                db.session.add(role)
                db.session.commit()
            
            test_user.roles.append(role)
            db.session.commit()
        
        # Make sure user is enrolled in the AI course
        if ai_course not in test_user.courses:
            test_user.courses.append(ai_course)
            db.session.commit()
    
    # Login the test user
    response = client.post('/api/v1/login/', 
                         json={
                             'email': 'test_api@example.com',
                             'password': 'password123'
                         })
    
    assert response.status_code == 200, f"Authentication failed: {response.data}"
    return client

# ==== Authentication Test Cases ====

def test_signup_success(client, app):
    """Test successful user registration."""
    # Use a unique email for each test run
    import uuid
    unique_email = f"new_user_{uuid.uuid4().hex[:8]}@example.com"
    
    with app.app_context():
        # Make sure the course exists
        course = Courses.query.filter_by(name='Artificial Intelligence').first()
        assert course is not None, "Test course not found"
        
        response = client.post('/api/v1/signup/', 
                            json={
                                'email': unique_email,
                                'username': f"new_user_{unique_email.split('@')[0]}",
                                'password': 'securepass',
                                'role': 'student',
                                'courses': ['Artificial Intelligence']
                            })
        
        assert response.status_code == 201
        data = json.loads(response.data)
        assert 'User created successfully' in data['message']
        
        # Verify user created in database
        user = User.query.filter_by(email=unique_email).first()
        assert user is not None
        assert user.username.startswith('new_user_')
        assert check_password_hash(user.password, 'securepass')
        assert len(user.courses) >= 1
        assert any(c.name == 'Artificial Intelligence' for c in user.courses)
        assert any(role.name == 'student' for role in user.roles)

def test_signup_missing_fields(client):
    """Test signup with missing fields."""
    response = client.post('/api/v1/signup/', 
                        json={
                            'email': 'incomplete@example.com', 
                            'password': 'password123'
                            # Missing username, role, and courses
                        })
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'Missing' in data['message']

def test_login_success(client, app):
    """Test successful login."""
    # Find a user that exists
    with app.app_context():
        user = User.query.filter_by(email='test@01.iitm').first()
        assert user is not None, "Test user not found"
    
    response = client.post('/api/v1/login/', 
                        json={
                            'email': 'test@01.iitm',
                            'password': 'test'
                        })
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'Logged in successfully' in data['message']
    assert 'test' == data['user']['username']

def test_login_invalid_credentials(client):
    """Test login with invalid credentials."""
    response = client.post('/api/v1/login/', 
                        json={
                            'email': 'test@01.iitm',
                            'password': 'wrongpassword'
                        })
    
    assert response.status_code == 401
    data = json.loads(response.data)
    assert 'Invalid credentials' in data['message']

def test_logout(auth_client, app):
    """Test logout functionality."""
    response = auth_client.post('/api/v1/logout/')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'Logged out successfully' in data['message']
    
    # Check user is logged out by accessing protected route
    response = auth_client.get('/api/v1/user')
    assert response.status_code in [401, 403]  # Either unauthorized or forbidden

# ==== User Profile Test Cases ====
def test_get_user(auth_client):
    """Test getting current user details."""
    response = auth_client.get('/api/v1/user')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['email'] == 'test_api@example.com'
    assert data['username'] == 'test_api_user'

# ==== Course Management Test Cases ====
def test_get_user_courses(auth_client):
    """Test getting user's enrolled courses."""
    response = auth_client.get('/api/v1/courses')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['courses']) >= 1
    assert any(course['name'] == 'Artificial Intelligence' for course in data['courses'])

def test_get_all_courses(client):
    """Test getting all available courses."""
    response = client.get('/api/v1/all-courses')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['courses']) >= 3  # At least the courses we've defined
    course_names = [course['name'] for course in data['courses']]
    assert 'Artificial Intelligence' in course_names
    assert 'Deep Learning' in course_names
    assert 'Software Engineering' in course_names

def test_add_course(auth_client, app):
    """Test adding a course to user's enrollment."""
    # Create a unique course specifically for this test
    with app.app_context():
        user = User.query.filter_by(email='test_api@example.com').first()
        user_course_names = {c.name for c in user.courses}
        
        # Create a unique test course name
        import uuid
        unique_course_name = f"TestCourse-{uuid.uuid4().hex[:8]}"
        
        # Create the test course
        new_test_course = Courses(name=unique_course_name, description='Course for testing add course functionality')
        db.session.add(new_test_course)
        db.session.commit()
        
        course_to_add = unique_course_name
    
    # Now add this course
    response = auth_client.post('/api/v1/courses/add',
                             json={'course_names': [course_to_add]})
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'Courses added successfully' in data['message']
    
    # Verify course was added
    with app.app_context():
        user = User.query.filter_by(email='test_api@example.com').first()
        course_names = [c.name for c in user.courses]
        assert course_to_add in course_names

def test_drop_course(auth_client, app):
    """Test dropping a course."""
    # First make sure user has at least two courses
    with app.app_context():
        user = User.query.filter_by(email='test_api@example.com').first()
        
        # If user doesn't have 2 courses yet, add another one
        if len(user.courses) < 2:
            # Find a course to add
            all_courses = Courses.query.all()
            for course in all_courses:
                if course not in user.courses:
                    user.courses.append(course)
                    db.session.commit()
                    break
        
        # Get courses after ensuring we have at least 2
        user_courses = [c.name for c in user.courses]
        assert len(user_courses) >= 2, "Test requires user to have at least 2 courses"
        
        # Choose one course to drop (not Artificial Intelligence)
        course_to_drop = next(c for c in user_courses if c != 'Artificial Intelligence')
    
    # Now drop the course
    response = auth_client.post('/api/v1/courses/drop',
                             json={'course_names': [course_to_drop]})
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'Courses dropped successfully' in data['message']
    
    # Verify the course was dropped
    with app.app_context():
        user = User.query.filter_by(email='test_api@example.com').first()
        course_names = [c.name for c in user.courses]
        assert course_to_drop not in course_names

# ==== Notes Test Cases ====
def test_create_note(auth_client, app):
    """Test creating a note."""
    # Get course ID for Artificial Intelligence
    with app.app_context():
        course = Courses.query.filter_by(name='Artificial Intelligence').first()
        course_id = course.id
    
    response = auth_client.post('/api/v1/notes',
                             json={
                                 'title': 'Test Note for API',
                                 'content': 'This is a test note created by the test suite',
                                 'courseId': course_id
                             })
    
    assert response.status_code == 201
    data = json.loads(response.data)
    assert 'Note created successfully' in data['message']
    assert data['note']['title'] == 'Test Note for API'
    assert data['note']['content'] == 'This is a test note created by the test suite'

def test_get_user_notes(auth_client, app):
    """Test getting user notes."""
    # First create a note if needed
    with app.app_context():
        user = User.query.filter_by(email='test_api@example.com').first()
        notes = Notes.query.filter_by(userId=user.id).all()
        
        if not notes:
            # Create a test note
            course = Courses.query.filter_by(name='Artificial Intelligence').first()
            new_note = Notes(
                userId=user.id,
                courseId=course.id,
                title='Test Note for Get',
                content='Test Content for retrieval',
                timestamp=datetime.now()
            )
            db.session.add(new_note)
            db.session.commit()
    
    response = auth_client.get('/api/v1/notes')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert len(data['notes']) >= 1
    assert any(note['title'] in ['Test Note for API', 'Test Note for Get'] for note in data['notes'])
    assert any('content' in note for note in data['notes'])

def test_update_note(auth_client, app):
    """Test updating a note."""
    # First create a note or find existing one
    with app.app_context():
        user = User.query.filter_by(email='test_api@example.com').first()
        note = Notes.query.filter_by(userId=user.id).first()
        
        if not note:
            course = Courses.query.filter_by(name='Artificial Intelligence').first()
            note = Notes(
                userId=user.id,
                courseId=course.id,
                title='Original Title',
                content='Original Content',
                timestamp=datetime.now()
            )
            db.session.add(note)
            db.session.commit()
        
        note_id = note.id
    
    response = auth_client.put(f'/api/v1/notes/{note_id}',
                            json={
                                'title': 'Updated API Test Title',
                                'content': 'Updated API test content'
                            })
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'Note updated successfully' in data['message']
    assert data['note']['title'] == 'Updated API Test Title'
    assert data['note']['content'] == 'Updated API test content'

def test_delete_note(auth_client, app):
    """Test deleting a note."""
    # First create a note specifically to delete
    with app.app_context():
        user = User.query.filter_by(email='test_api@example.com').first()
        course = Courses.query.filter_by(name='Artificial Intelligence').first()
        
        note_to_delete = Notes(
            userId=user.id,
            courseId=course.id,
            title='Note To Delete',
            content='This note will be deleted',
            timestamp=datetime.now()
        )
        db.session.add(note_to_delete)
        db.session.commit()
        
        note_id = note_to_delete.id
    
    response = auth_client.delete(f'/api/v1/notes/{note_id}')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'Note deleted successfully' in data['message']
    
    # Verify note is deleted from database
    with app.app_context():
        deleted_note = Notes.query.get(note_id)
        assert deleted_note is None

# ==== Chatroom Test Cases ====
def test_get_user_chatrooms(auth_client):
    """Test getting user's chatrooms."""
    response = auth_client.get('/api/v1/chatrooms')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'chatrooms' in data
    assert len(data['chatrooms']) >= 1
    assert any(chatroom['courseName'] == 'Artificial Intelligence' for chatroom in data['chatrooms'])

def test_send_and_get_messages(auth_client, app):
    """Test sending a message and retrieving it."""
    # Ensure the course exists and user is enrolled
    with app.app_context():
        # Get or create course
        course = Courses.query.filter_by(name='Artificial Intelligence').first()
        if not course:
            course = Courses(name='Artificial Intelligence', description='AI course')
            db.session.add(course)
            db.session.commit()
        
        # Make sure user is enrolled
        user = User.query.filter_by(email='test_api@example.com').first()
        if course not in user.courses:
            user.courses.append(course)
            db.session.commit()
        
        course_id = course.id
    
    # Now send the message
    message_text = "Hello, this is a test message!"
    response = auth_client.post('/api/v1/messages',
                             json={
                                 'courseId': course_id,
                                 'message': message_text
                             })
    
    # Debug response if needed
    if response.status_code != 201:
        print(f"Send message failed with: {response.data}")
    
    assert response.status_code == 201
    # Rest of test...

def test_edit_message(auth_client, app):
    """Test editing a message."""
    # First send a message
    with app.app_context():
        course = Courses.query.filter_by(name='Artificial Intelligence').first()
        course_id = course.id
    
    # Send a message that we'll edit
    response = auth_client.post('/api/v1/messages',
                             json={
                                 'courseId': course_id,
                                 'message': "Original message to edit"
                             })
    
    assert response.status_code == 201
    sent_data = json.loads(response.data)
    message_id = sent_data['messageData']['id']
    
    # Now edit the message
    edited_text = "This message has been edited by the test suite"
    response = auth_client.put(f'/api/v1/messages/{message_id}',
                            json={'message': edited_text})
    
    assert response.status_code == 200
    edit_data = json.loads(response.data)
    assert 'Message updated successfully' in edit_data['message']
    assert edit_data['messageData']['message'] == edited_text

def test_delete_message(auth_client, app):
    """Test deleting a message."""
    # First send a message to delete
    with app.app_context():
        course = Courses.query.filter_by(name='Artificial Intelligence').first()
        course_id = course.id
    
    # Send a message that we'll delete
    response = auth_client.post('/api/v1/messages',
                             json={
                                 'courseId': course_id,
                                 'message': "Message to be deleted by test"
                             })
    
    assert response.status_code == 201
    sent_data = json.loads(response.data)
    message_id = sent_data['messageData']['id']
    
    # Now delete the message
    response = auth_client.delete(f'/api/v1/messages/{message_id}')
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'Message deleted successfully' in data['message']
    assert 'messageId' in data
    
    # Verify the message is gone
    with app.app_context():
        deleted_message = Messages.query.get(message_id)
        assert deleted_message is None

def test_unauthorized_message_operations(app, auth_client, client):
    """Test operations on messages that user doesn't own."""
    # First create a second test user
    with app.app_context():
        # Create a second user
        second_user = User.query.filter_by(email='test_api2@example.com').first()
        if not second_user:
            hashed_password = generate_password_hash('password123')
            second_user = User(
                email='test_api2@example.com',
                username='test_api_user2',
                password=hashed_password
            )
            db.session.add(second_user)
            
            # Add student role
            role = Role.query.filter_by(name='student').first()
            second_user.roles.append(role)
            
            # Add courses
            course = Courses.query.filter_by(name='Artificial Intelligence').first()
            second_user.courses.append(course)
            db.session.commit()
        
        # Create a message from the second user
        course = Courses.query.filter_by(name='Artificial Intelligence').first()
        chatroom = Chatroom.query.filter_by(userId=second_user.id, courseId=course.id).first()
        if not chatroom:
            chatroom = Chatroom(userId=second_user.id, courseId=course.id)
            db.session.add(chatroom)
            db.session.commit()
        
        other_user_message = Messages(
            chatroomId=chatroom.id,
            userId=second_user.id,
            message="Message from another user",
            timestamp=datetime.now()
        )
        db.session.add(other_user_message)
        db.session.commit()
        
        other_message_id = other_user_message.id
    
    # Try to edit the message as first user (should fail)
    response = auth_client.put(f'/api/v1/messages/{other_message_id}',
                            json={'message': "Trying to edit someone else's message"})
    
    assert response.status_code == 403
    data = json.loads(response.data)
    assert 'not authorized' in data['message'].lower()
    
    # Try to delete the message as first user (should fail)
    response = auth_client.delete(f'/api/v1/messages/{other_message_id}')
    
    assert response.status_code == 403
    data = json.loads(response.data)
    assert 'not authorized' in data['message'].lower()

def test_get_course_members(auth_client, app):
    """Test getting members of a course."""
    with app.app_context():
        # Ensure course exists
        course = Courses.query.filter_by(name='Artificial Intelligence').first()
        if not course:
            course = Courses(name='Artificial Intelligence', description='AI course')
            db.session.add(course)
        
        # Ensure test user is enrolled
        user = User.query.filter_by(email='test_api@example.com').first()
        if course not in user.courses:
            user.courses.append(course)
        
        db.session.commit()
        course_id = course.id
    
    response = auth_client.get(f'/api/v1/course-members/{course_id}')
    
    if response.status_code != 200:
        print(f"Get course members failed: {response.data}")
        
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'members' in data
    
    # Debug members list
    print(f"Members in response: {[m['email'] for m in data['members']]}")
    
    # Check if current user is in members list
    user_found = any(member['email'] == 'test_api@example.com' for member in data['members'])
    assert user_found, "Current user not found in course members list"

def test_get_course_members_nonexistent(auth_client):
    """Test getting members of a non-existent course."""
    response = auth_client.get('/api/v1/course-members/999999')
    
    assert response.status_code == 404
    data = json.loads(response.data)
    assert 'not found' in data['message'].lower()

def test_get_course_details_nonexistent(auth_client):
    """Test getting details of a non-existent course."""
    response = auth_client.get('/api/v1/courses/NonExistentCourse')
    
    assert response.status_code == 404
    data = json.loads(response.data)
    assert 'not found' in data['message'].lower()

def test_change_course(auth_client, app):
    """Test changing course enrollment."""
    # Ensure user has at least one course and there's another available course
    with app.app_context():
        user = User.query.filter_by(email='test_api@example.com').first()
        user_course_names = [c.name for c in user.courses]
        assert 'Artificial Intelligence' in user_course_names, "Test user must be enrolled in AI course"
        
        # Find an available course to change to
        all_courses = Courses.query.all()
        for course in all_courses:
            if course.name not in user_course_names:
                target_course = course.name
                break
        else:
            # Create a new course if none available
            new_course = Courses(name='TestChangeCourse', description='For testing course changes')
            db.session.add(new_course)
            db.session.commit()
            target_course = 'TestChangeCourse'
    
    # Now change the course
    response = auth_client.post('/api/v1/courses/change',
                             json={
                                 'old_course_names': ['Artificial Intelligence'],
                                 'new_course_names': [target_course]
                             })
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'Courses changed successfully' in data['message']
    
    # Verify the change in the database
    with app.app_context():
        user = User.query.filter_by(email='test_api@example.com').first()
        course_names = [c.name for c in user.courses]
        assert 'Artificial Intelligence' not in course_names
        assert target_course in course_names

def test_change_course_invalid(auth_client):
    """Test changing to a non-existent course."""
    response = auth_client.post('/api/v1/courses/change',
                             json={
                                 'old_course_names': ['Artificial Intelligence'],
                                 'new_course_names': ['NonExistentCourse']
                             })
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'do not exist' in data['message'].lower() or 'not found' in data['message'].lower()

def test_change_course_mismatched_lists(auth_client):
    """Test changing courses with mismatched list lengths."""
    response = auth_client.post('/api/v1/courses/change',
                             json={
                                 'old_course_names': ['Artificial Intelligence', 'Deep Learning'],
                                 'new_course_names': ['Software Engineering']
                             })
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'must match' in data['message'].lower()

def test_note_operations_missing_data(auth_client, app):  # Add app parameter here
    """Test note operations with missing data."""
    # Test create note with missing data
    response = auth_client.post('/api/v1/notes',
                             json={
                                 'title': 'Incomplete Note'
                                 # Missing content and courseId
                             })
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'Missing' in data['message']
    
    # Create a valid note first
    with app.app_context():
        course = Courses.query.filter_by(name='Artificial Intelligence').first()
        course_id = course.id
    
    # Rest of the function...

def test_note_not_found(auth_client):
    """Test accessing a non-existent note."""
    # Try to get a note that doesn't exist
    response = auth_client.get('/api/v1/notes/999999')
    
    assert response.status_code == 404
    data = json.loads(response.data)
    assert 'not found' in data['message'].lower()
    
    # Try to update a note that doesn't exist
    response = auth_client.put('/api/v1/notes/999999',
                            json={
                                'title': 'Updated Title',
                                'content': 'Updated content'
                            })
    
    assert response.status_code == 404
    data = json.loads(response.data)
    assert 'not found' in data['message'].lower()
    
    # Try to delete a note that doesn't exist
    response = auth_client.delete('/api/v1/notes/999999')
    
    assert response.status_code == 404
    data = json.loads(response.data)
    assert 'not found' in data['message'].lower()

def test_chatroom_operations_invalid(auth_client):
    """Test chatroom operations with invalid data."""
    # Try to get a non-existent chatroom
    response = auth_client.get('/api/v1/chatrooms/999999')
    
    assert response.status_code == 404
    
    # Try to get messages from a non-existent chatroom
    response = auth_client.get('/api/v1/messages/999999')
    
    assert response.status_code == 404
    data = json.loads(response.data)
    assert 'not found' in data['message'].lower()
    
    # Try to send a message without required data
    response = auth_client.post('/api/v1/messages',
                             json={
                                 'message': 'Missing course ID'
                             })
    
    assert response.status_code == 400
    data = json.loads(response.data)
    assert 'Missing' in data['message']
    
    # Try to send a message to a non-existent course
    response = auth_client.post('/api/v1/messages',
                             json={
                                 'courseId': 999999,
                                 'message': 'Message to non-existent course'
                             })
    
    assert response.status_code == 404
    data = json.loads(response.data)
    assert 'not found' in data['message'].lower()