import pytest
import json
import sys
from unittest import mock

# Define the mock response structure
class MockResponse:
    class Choice:
        class Message:
            def __init__(self, content):
                self.content = content
                
        def __init__(self, content):
            self.message = self.Message(content)
            
    def __init__(self, content):
        self.choices = [self.Choice(content)]

# Apply mocking BEFORE importing run.py
# This is crucial - we need to patch before any imports happen
together_mock = mock.patch('together.Together', autospec=True)
mock_together_class = together_mock.start()

# Now set up the mock client
mock_client = mock.MagicMock()
mock_together_class.return_value = mock_client

# Configure completions.create to return our mock response
mock_completions = mock.MagicMock()
mock_client.chat.completions.create = mock_completions
mock_completions.return_value = MockResponse("This is a test response")

# Now it's safe to import run.py
sys.path.append('/home/himanshu/soft-engg-project-jan-2025-se-Jan-6/backend')
from run import app as chatbot_app

@pytest.fixture
def client():
    """Test client for the chatbot app."""
    chatbot_app.config['TESTING'] = True
    with chatbot_app.test_client() as client:
        yield client

def test_chatbot_basic(client):
    """Test basic chatbot functionality."""
    # Test the API
    response = client.post('/v1/chat',
                        json={
                            'message': 'What is machine learning?',
                            'session_id': 'test-session-1'
                        })
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is True
    assert "This is a test response" in data['response']

def test_chatbot_error_handling(client):
    """Test error handling in chatbot API."""
    # Configure mock to raise an exception for this test
    mock_completions.side_effect = Exception("API rate limit exceeded")
    
    response = client.post('/v1/chat',
                        json={
                            'message': 'This should trigger an error',
                            'session_id': 'test-error-session'
                        })
    
    # Reset side effect for other tests
    mock_completions.side_effect = None
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['success'] is False  # This should be False when there's an error
    
    # Instead of checking for "error", check for the exact message or a substring
    assert "rate limit" in data['message'].lower() or "API rate limit exceeded" == data['message']

def test_chatbot_course_contexts(client):
    """Test that different contexts are properly handled."""
    # Use a list to capture API calls
    captured_messages = []
    
    # Set up a side effect that captures the messages
    def capture_messages_side_effect(**kwargs):
        captured_messages.append(kwargs.get('messages', []))
        return MockResponse("Response with context")
    
    # Apply the side effect
    mock_completions.side_effect = capture_messages_side_effect
    
    # Test with different course contexts
    paths = ['data-science', 'artificial-intelligence']
    
    for path in paths:
        response = client.post('/v1/chat',
                           json={
                               'message': 'Test message',
                               'session_id': f'test-session-{path}',
                               'path_param': path
                           })
        
        assert response.status_code == 200
    
    # Verify we captured the expected number of calls
    assert len(captured_messages) == len(paths)
    
    # Check if system messages are different for different paths
    system_messages = [
        next((msg['content'] for msg in msgs if msg.get('role') == 'system'), "")
        for msgs in captured_messages
    ]
    
    # The system messages should be different for different paths
    if len(system_messages) >= 2:
        assert system_messages[0] != system_messages[1], "System messages should differ by path"