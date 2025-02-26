class Config: #all the same setting from init.py
    SECRET_KEY = 'SCT12025'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///database.db'
    SESSION_PROTECTION = "basic"
    #REMEMBER_COOKIE_DURATION = 3600  # Keeps the session for 1 hour
    SESSION_COOKIE_SECURE = True  # Ensures cookies work over HTTP
    SESSION_COOKIE_HTTPONLY = True  # Security best practice
    SESSION_COOKIE_SAMESITE = 'None'  # Prevents CSRF issues
    REMEMBER_COOKIE_SAMSITE = 'None'
    REMEMBER_COOKIE_DURATION = 3600  # Keeps session for 1 hour
    REMEMBER_COOKIE_SECURE = 'True'