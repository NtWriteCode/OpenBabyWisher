# Hint/Notification Routes
from flask import jsonify, request, current_app
from models import db, WishlistItem, PurchaseHint
from notifications import notification_service

def add_hint(item_id):
    item = db.get_or_404(WishlistItem, item_id)
    data = request.get_json()
    
    message = data.get('message', '').strip()
    if not message:
        return jsonify({'error': 'Message is required'}), 400
    
    # Enforce 200 character limit
    if len(message) > 200:
        return jsonify({'error': 'Message too long (max 200 characters)'}), 400
    
    # No sanitization needed - frontend uses textContent which is safe
    # SQLi protection: Using SQLAlchemy ORM (parameterized queries) - already safe
    hint = PurchaseHint(item_id=item.id, message=message)
    db.session.add(hint)
    db.session.commit()
    
    # Send notification to admin
    try:
        notification_service.send_purchase_notification(item.title, message)
    except Exception as e:
        current_app.logger.error(f"Failed to send purchase notification: {e}")
        # Don't fail the request if notification fails
    
    return jsonify(hint.to_dict()), 201


def dismiss_hint(hint_id):
    token = request.headers.get('Authorization') or request.form.get('token')
    if token != current_app.config['API_TOKEN']:
        return jsonify({'error': 'Unauthorized'}), 401
    
    hint = db.get_or_404(PurchaseHint, hint_id)
    hint.dismissed = True
    db.session.commit()
    
    return '', 204

