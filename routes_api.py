# Miscellaneous API Routes
from flask import jsonify, request, current_app
from helpers import get_existing_tags, get_hero_messages, get_random_hero_message, get_personalized_texts, get_baby_initial
from notifications import notification_service

def test_auth():
    """Test endpoint specifically for validating admin token"""
    token = request.headers.get('Authorization')
    current_app.logger.info(f"Auth test - received token: {token[:10]}..." if token else "Auth test - no token received")
    current_app.logger.info(f"Auth test - expected token: {current_app.config['API_TOKEN'][:10]}...")
    
    if token != current_app.config['API_TOKEN']:
        current_app.logger.warning("Auth test failed - token mismatch")
        return jsonify({'error': 'Unauthorized'}), 401
    
    current_app.logger.info("Auth test successful")
    return jsonify({'status': 'authenticated', 'message': 'Token is valid'})


def get_tags():
    return jsonify(get_existing_tags())


def get_predefined_messages():
    messages = {
        'en': [
            "I'll buy exactly the linked item 🎯",
            "I found something even better! ✨",
            "I'll buy this soon 📅",
            "Just bought it! Hope you'll love it 💝",
            "Custom message ✍️"
        ],
        'hu': [
            "Pontosan a linkelt terméket veszem meg 🎯",
            "Találtam valami még jobbat! ✨",
            "Hamarosan megveszem 📅",
            "Épp most vettem meg! Remélem tetszeni fog 💝",
            "Egyéni üzenet ✍️"
        ]
    }
    return jsonify(messages)


def get_hero_message():
    """Get a random hero message for the current language"""
    language = request.args.get('lang', 'en')
    message = get_random_hero_message(language)
    return jsonify({'message': message})


def get_hero_messages_api():
    """Get all hero messages for both languages"""
    return jsonify(get_hero_messages())


def get_personalized_texts_api():
    """Get personalized texts for the current language"""
    language = request.args.get('lang', 'en')
    return jsonify(get_personalized_texts(language))


def get_baby_initial_api():
    """Get baby's initial for favicon"""
    return jsonify({'initial': get_baby_initial()})


def test_notification():
    """Test notification endpoint for admin"""
    token = request.headers.get('Authorization') or request.form.get('token')
    if token != current_app.config['API_TOKEN']:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        success = notification_service.send_test_notification()
        if success:
            return jsonify({'message': 'Test notification sent successfully!'}), 200
        else:
            if not notification_service.is_enabled():
                return jsonify({'message': 'Notifications not configured. Set NOTIFICATION_URL environment variable and restart the application.'}), 400
            else:
                return jsonify({'message': 'Failed to send test notification. Check server logs for details.'}), 500
    except Exception as e:
        current_app.logger.error(f"Error sending test notification: {e}")
        return jsonify({'message': f'Error sending test notification: {str(e)}'}), 500

