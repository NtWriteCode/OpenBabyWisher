#!/usr/bin/env python3
"""
Baby Wishlist - A simple, self-hostable wishlist application
Perfect for sharing baby gift ideas with family and friends
"""

import os
import logging
import sys
from flask import Flask
from flask_cors import CORS
from notifications import notification_service

# Configure logging first
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

app = Flask(__name__, static_folder="static", static_url_path="/static")
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'your-secret-key-change-this')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///data/wishlist.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Set Flask's logger level
app.logger.setLevel(logging.INFO)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
app.config['API_TOKEN'] = os.environ.get('API_TOKEN', 'your-admin-token-change-this')
app.config['BABY_NAME'] = os.environ.get('BABY_NAME', 'our little one')

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize database
from models import db
db.init_app(app)
CORS(app)

# Import migrations
from migrations import ensure_priority_field

# Import and register routes
from routes_views import index, admin, uploaded_file
from routes_items import get_items, create_item, update_item, delete_item, reorder_items
from routes_images import upload_image, add_image_from_url, delete_image
from routes_hints import add_hint, dismiss_hint
from routes_api import test_auth, get_tags, get_predefined_messages, get_hero_message, get_personalized_texts_api, get_baby_initial_api

# Register view routes
app.add_url_rule('/', 'index', index)
app.add_url_rule('/admin', 'admin', admin)
app.add_url_rule('/uploads/<filename>', 'uploaded_file', uploaded_file)

# Register item routes
app.add_url_rule('/api/items', 'get_items', get_items, methods=['GET'])
app.add_url_rule('/api/items', 'create_item', create_item, methods=['POST'])
app.add_url_rule('/api/items/<int:item_id>', 'update_item', update_item, methods=['PUT'])
app.add_url_rule('/api/items/<int:item_id>', 'delete_item', delete_item, methods=['DELETE'])
app.add_url_rule('/api/items/reorder', 'reorder_items', reorder_items, methods=['POST'])

# Register image routes
app.add_url_rule('/api/items/<int:item_id>/images', 'upload_image', upload_image, methods=['POST'])
app.add_url_rule('/api/items/<int:item_id>/images/url', 'add_image_from_url', add_image_from_url, methods=['POST'])
app.add_url_rule('/api/items/<int:item_id>/images/<int:image_id>', 'delete_image', delete_image, methods=['DELETE'])

# Register hint routes
app.add_url_rule('/api/items/<int:item_id>/hint', 'add_hint', add_hint, methods=['POST'])
app.add_url_rule('/api/hints/<int:hint_id>', 'dismiss_hint', dismiss_hint, methods=['DELETE'])

# Register API routes
app.add_url_rule('/api/auth/test', 'test_auth', test_auth, methods=['GET'])
app.add_url_rule('/api/tags', 'get_tags', get_tags, methods=['GET'])
app.add_url_rule('/api/predefined-messages', 'get_predefined_messages', get_predefined_messages, methods=['GET'])
app.add_url_rule('/api/hero-message', 'get_hero_message', get_hero_message, methods=['GET'])
app.add_url_rule('/api/personalized-texts', 'get_personalized_texts_api', get_personalized_texts_api, methods=['GET'])
app.add_url_rule('/api/baby-initial', 'get_baby_initial_api', get_baby_initial_api, methods=['GET'])

if __name__ == '__main__':
    print("🎯 Baby Wishlist - Starting up...", flush=True)
    app.logger.info("Baby Wishlist application starting")
    
    with app.app_context():
        try:
            db.create_all()
            app.logger.info("Database tables created successfully")
            print("✅ Database initialized", flush=True)
            
            # Ensure priority field exists (for backward compatibility)
            ensure_priority_field()
            
            # Migrate URL-based images to local storage
            from migrations import migrate_url_images_to_local, cleanup_orphaned_files
            migrate_url_images_to_local()
            
            # Clean up orphaned image files
            cleanup_orphaned_files()
            
            print("✅ Database migrations completed", flush=True)
            
        except Exception as e:
            app.logger.error(f"Database initialization failed: {e}")
            print(f"❌ Database error: {e}", flush=True)
            sys.exit(1)
    
    # Use Waitress for production
    from waitress import serve
    port = int(os.environ.get('PORT', 5000))
    
    # Send test notification on startup
    try:
        from notifications import notification_service
        notification_service.send_notification(
            "🎉 Baby Wishlist Started",
            "The Baby Wishlist application has started successfully!"
        )
        print("📧 Test notification sent", flush=True)
    except Exception as e:
        print(f"⚠️  Could not send test notification: {e}", flush=True)
    
    print(f"🚀 Starting Baby Wishlist server on port {port}", flush=True)
    print(f"📱 Public view: http://localhost:{port}/", flush=True)
    print(f"⚙️  Admin panel: http://localhost:{port}/admin", flush=True)
    print("🔑 Remember to set your API_TOKEN environment variable!", flush=True)
    
    app.logger.info(f"Starting Waitress server on port {port}")
    
    try:
        serve(app, host='0.0.0.0', port=port, threads=8, connection_limit=1000)
    except Exception as e:
        app.logger.error(f"Server startup failed: {e}")
        print(f"❌ Server error: {e}", flush=True)
        sys.exit(1)
