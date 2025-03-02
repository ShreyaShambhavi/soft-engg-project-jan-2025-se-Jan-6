from flask import Flask, jsonify, current_app
from flask_login import LoginManager
from flask_sqlalchemy import SQLAlchemy
from config import Config
from werkzeug.security import generate_password_hash
from flask_cors import CORS
import uuid
import logging
import sys
from .models import db
login_manager = LoginManager()

def create_app():
    app = Flask(__name__)
    app.debug = True
    app.config.from_object(Config)

    # Configure logging
    logging.basicConfig(stream=sys.stdout, level=logging.DEBUG)
    app.logger.setLevel(logging.DEBUG)
    app.logger.info("Starting the app")

    db.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'auth.login'  # Corrected login view

    @login_manager.user_loader
    def load_user(user_id):
        from .models import User
        user = User.query.filter_by(fs_uniquifier=user_id).first()  # Use fs_uniquifier
        
        if user:
            current_app.logger.debug(f"User {user.username} loaded successfully")
        else:
            current_app.logger.debug(f"No user found with fs_uniquifier: {user_id}")
        
        return user

    @login_manager.unauthorized_handler
    def unauthorized_callback():
        return jsonify({"error": "Unauthorized access"}), 401

    # Import and register blueprints
    from app.api.auth import auth
    app.register_blueprint(auth, url_prefix='/api')

    # Call create_database after initializing the app and extensions
    create_database(app)
    CORS(app, supports_credentials=True, origins="http://localhost:5173")

    return app

def create_database(app):  # Pass the app instance to this function
    from .models import User, Role, Courses

    with app.app_context():
        db.create_all()  # Create the tables

        # Helper function to find or create roles
        def find_or_create_role(name):
            role = Role.query.filter_by(name=name).first()
            if not role:
                role = Role(name=name)
                db.session.add(role)
                db.session.commit()  # Commit inside the role creation
            return role

        # Create Primary User Roles
        student_role = find_or_create_role('student')
        professor_role = find_or_create_role('professor')
        instructor_role = find_or_create_role('instructor')
        ta_role = find_or_create_role('ta')

        # Create Secondary User Roles
        admin_role = find_or_create_role('admin')
        dm_role = find_or_create_role('dm')

        # Helper function to find or create users
        def create_user_if_not_exists(email, username, password, roles):
            user = User.query.filter_by(email=email).first()
            if not user:
                hashed_password = generate_password_hash(password)
                user = User(
                    email=email,
                    username=username,
                    password=hashed_password,
                    fs_uniquifier=str(uuid.uuid4())  # Generate a unique fs_uniquifier
                )
                for role_name in roles:
                    role = Role.query.filter_by(name=role_name).first()
                    if role:
                        user.roles.append(role)
                    else:
                        print(f"Warning: Role '{role_name}' not found for user '{username}'")

                db.session.add(user)
                db.session.commit()  # Missing db.session.commit()
                print(f"User '{username}' added successfully!")
            else:
                print(f"User '{username}' already exists!")

        # Create Dummy Primary Users Account
        create_user_if_not_exists(
            email="21f2000255@iitm.ac.in",
            username="21f2000255",
            password="21f2000255",
            roles=['student']
        )

        create_user_if_not_exists(
            email="aaruni@professor.iitm",
            username="aaruni",
            password="aaruni",
            roles=['professor']
        )

        create_user_if_not_exists(
            email="aaruni@instructor.iitm",
            username="instructorAaruni",
            password="instructorAaruni",
            roles=['instructor']
        )

        create_user_if_not_exists(
            email="aaruni@ta.iitm",
            username="taAaruni",
            password="taAaruni",
            roles=['ta']
        )

        create_user_if_not_exists(
            email="aaruni@admin.iitm",
            username="adminAaruni",
            password="adminAaruni",
            roles=['admin']
        )

        create_user_if_not_exists(
            email="aaruni@dm.iitm",
            username="dmAaruni",
            password="dmAaruni",
            roles=['dm']
        )

        create_user_if_not_exists(
            email="test@01.iitm",
            username="test",
            password="test",
            roles=['student']
        )

        create_user_if_not_exists(
            email="21f2000283@ds.study.iitm.ac.in",
            username="21f2000283",
            password="21f2000283",
            roles=['student']
        )

        # Helper function to find or create courses
        def find_or_create_course(name, description):
            course = Courses.query.filter_by(name=name).first()
            if not course:
                course = Courses(name=name, description=description)
                db.session.add(course)
                db.session.commit()  # Commit inside the course creation
            return course

        # Create Courses
        find_or_create_course('Artificial Intelligence', 'Introduction to AI concepts and techniques.')
        find_or_create_course('Deep Learning', 'Advanced course on deep learning techniques and applications.')
        find_or_create_course('Software Engineering', 'Principles and practices of software engineering.')
        find_or_create_course('Software Testing', 'Techniques and tools for software testing.')