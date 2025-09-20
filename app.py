#!/usr/bin/env python3
"""
Baby Wishlist - A simple, self-hostable wishlist application
Perfect for sharing baby gift ideas with family and friends
"""

import os
import json
import logging
import sys
import random
from datetime import datetime
from flask import Flask, render_template, request, jsonify, send_from_directory, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.utils import secure_filename
from PIL import Image
import uuid

# Configure logging first
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

app = Flask(__name__)
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

db = SQLAlchemy(app)
CORS(app)

# Database will be initialized in the main block

# Database Models
class WishlistItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    priority = db.Column(db.Integer, default=0)
    disabled = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    images = db.relationship('ItemImage', backref='item', lazy=True, cascade='all, delete-orphan')
    tags = db.relationship('ItemTag', backref='item', lazy=True, cascade='all, delete-orphan')
    hints = db.relationship('PurchaseHint', backref='item', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'priority': self.priority,
            'disabled': self.disabled,
            'created_at': self.created_at.isoformat(),
            'images': [img.to_dict() for img in self.images],
            'tags': [tag.name for tag in self.tags],
            'hints': [hint.to_dict() for hint in self.hints if not hint.dismissed]
        }

class ItemImage(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('wishlist_item.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=True)  # For uploaded files
    url = db.Column(db.String(500), nullable=True)       # For URL-based images
    original_filename = db.Column(db.String(255), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'url': self.url if self.url else f'/uploads/{self.filename}'
        }

class ItemTag(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('wishlist_item.id'), nullable=False)
    name = db.Column(db.String(50), nullable=False)

class PurchaseHint(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    item_id = db.Column(db.Integer, db.ForeignKey('wishlist_item.id'), nullable=False)
    message = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    dismissed = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'message': self.message,
            'created_at': self.created_at.isoformat(),
            'dismissed': self.dismissed
        }

# Helper functions
def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def resize_image(image_path, max_size=(800, 600)):
    """Resize image to reduce file size while maintaining aspect ratio"""
    try:
        with Image.open(image_path) as img:
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            img.save(image_path, optimize=True, quality=85)
    except Exception as e:
        print(f"Error resizing image: {e}")

def get_existing_tags():
    """Get all unique tags from the database"""
    tags = db.session.query(ItemTag.name).distinct().all()
    return [tag[0] for tag in tags]

def get_baby_title_variations():
    """Get all possible title variations for the baby"""
    baby_name = app.config['BABY_NAME']
    
    # If baby name is the default, use generic variations
    if baby_name.lower() == 'our little one':
        return {
            'en': [
                "our little one",
                "our precious bundle of joy",
                "our sweet baby",
                "our little miracle",
                "our tiny treasure",
                "our little angel",
                "our baby love",
                "our little sunshine",
                "our sweet pea",
                "our little star",
                "our bundle of happiness",
                "our little blessing"
            ],
            'hu': [
                "a kicsinknek",
                "az édes kisbabánknak",
                "a kis csodánknak",
                "a drága kincsünknek",
                "a kis angyalunknak",
                "a napsugarunknak",
                "az édes babánknak",
                "a kis csillagunknak",
                "a boldogságunk forrásának",
                "a kis áldásunknak",
                "az édes kis csemetének",
                "a szívünk örömének"
            ]
        }
    else:
        # Use the custom baby name with variations
        return {
            'en': [
                baby_name,
                f"little {baby_name}",
                f"sweet {baby_name}",
                f"precious {baby_name}",
                f"baby {baby_name}",
                f"our little {baby_name}",
                f"our sweet {baby_name}",
                f"our precious {baby_name}",
                f"little angel {baby_name}",
                f"sunshine {baby_name}",
                f"our miracle {baby_name}",
                f"sweet baby {baby_name}"
            ],
            'hu': [
                baby_name,
                f"kis {baby_name}",
                f"édes {baby_name}",
                f"drága {baby_name}",
                f"{baby_name} baba",
                f"a kis {baby_name}",
                f"az édes {baby_name}",
                f"a drága {baby_name}",
                f"kis angyal {baby_name}",
                f"napsugár {baby_name}",
                f"a mi csodánk {baby_name}",
                f"édes baba {baby_name}"
            ]
        }

def get_random_baby_title(language='en'):
    """Get a random title variation for the baby"""
    variations = get_baby_title_variations()
    return random.choice(variations.get(language, variations['en']))

# Routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/admin')
def admin():
    return render_template('admin.html')

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# API Routes
@app.route('/api/items', methods=['GET'])
def get_items():
    items = WishlistItem.query.order_by(WishlistItem.priority.desc(), WishlistItem.created_at.desc()).all()
    return jsonify([item.to_dict() for item in items])

@app.route('/api/auth/test', methods=['GET'])
def test_auth():
    """Test endpoint specifically for validating admin token"""
    token = request.headers.get('Authorization')
    app.logger.info(f"Auth test - received token: {token[:10]}..." if token else "Auth test - no token received")
    app.logger.info(f"Auth test - expected token: {app.config['API_TOKEN'][:10]}...")
    
    if token != app.config['API_TOKEN']:
        app.logger.warning("Auth test failed - token mismatch")
        return jsonify({'error': 'Unauthorized'}), 401
    
    app.logger.info("Auth test successful")
    return jsonify({'status': 'authenticated', 'message': 'Token is valid'})

@app.route('/api/items', methods=['POST'])
def create_item():
    # Check API token for admin operations
    token = request.headers.get('Authorization') or request.form.get('token')
    if token != app.config['API_TOKEN']:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json() if request.is_json else request.form
    
    item = WishlistItem(
        title=data.get('title', ''),
        description=data.get('description', ''),
        priority=int(data.get('priority', 0))
    )
    
    db.session.add(item)
    db.session.flush()  # Get the ID
    
    # Handle tags
    tags = data.get('tags', [])
    if isinstance(tags, str):
        tags = [tag.strip() for tag in tags.split(',') if tag.strip()]
    
    for tag_name in tags:
        tag = ItemTag(item_id=item.id, name=tag_name)
        db.session.add(tag)
    
    db.session.commit()
    return jsonify(item.to_dict()), 201

@app.route('/api/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    token = request.headers.get('Authorization') or request.form.get('token')
    if token != app.config['API_TOKEN']:
        return jsonify({'error': 'Unauthorized'}), 401
    
    item = WishlistItem.query.get_or_404(item_id)
    data = request.get_json() if request.is_json else request.form
    
    item.title = data.get('title', item.title)
    item.description = data.get('description', item.description)
    item.priority = int(data.get('priority', item.priority))
    item.disabled = bool(data.get('disabled', item.disabled))
    
    # Update tags
    if 'tags' in data:
        # Remove existing tags
        ItemTag.query.filter_by(item_id=item.id).delete()
        
        # Add new tags
        tags = data.get('tags', [])
        if isinstance(tags, str):
            tags = [tag.strip() for tag in tags.split(',') if tag.strip()]
        
        for tag_name in tags:
            tag = ItemTag(item_id=item.id, name=tag_name)
            db.session.add(tag)
    
    db.session.commit()
    return jsonify(item.to_dict())

@app.route('/api/items/<int:item_id>', methods=['DELETE'])
def delete_item(item_id):
    token = request.headers.get('Authorization') or request.form.get('token')
    if token != app.config['API_TOKEN']:
        return jsonify({'error': 'Unauthorized'}), 401
    
    item = WishlistItem.query.get_or_404(item_id)
    
    # Delete associated images from filesystem
    for image in item.images:
        try:
            os.remove(os.path.join(app.config['UPLOAD_FOLDER'], image.filename))
        except OSError:
            pass  # File might not exist
    
    db.session.delete(item)
    db.session.commit()
    return '', 204

@app.route('/api/items/<int:item_id>/images', methods=['POST'])
def upload_image(item_id):
    token = request.headers.get('Authorization') or request.form.get('token')
    if token != app.config['API_TOKEN']:
        return jsonify({'error': 'Unauthorized'}), 401
    
    item = WishlistItem.query.get_or_404(item_id)
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file'}), 400
    
    # Generate unique filename
    filename = str(uuid.uuid4()) + '.' + file.filename.rsplit('.', 1)[1].lower()
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    
    file.save(filepath)
    resize_image(filepath)
    
    image = ItemImage(
        item_id=item.id,
        filename=filename,
        original_filename=file.filename
    )
    
    db.session.add(image)
    db.session.commit()
    
    return jsonify(image.to_dict()), 201

@app.route('/api/items/<int:item_id>/images/url', methods=['POST'])
def add_image_from_url(item_id):
    token = request.headers.get('Authorization') or request.form.get('token')
    if token != app.config['API_TOKEN']:
        return jsonify({'error': 'Unauthorized'}), 401
    
    item = WishlistItem.query.get_or_404(item_id)
    data = request.get_json()
    
    if not data or 'url' not in data:
        return jsonify({'error': 'URL is required'}), 400
    
    image_url = data['url']
    
    # Basic URL validation
    if not image_url.startswith(('http://', 'https://')):
        return jsonify({'error': 'Invalid URL'}), 400
    
    # Create image record
    image = ItemImage(
        item_id=item_id,
        original_filename=f"url_image_{len(item.images) + 1}.jpg"
    )
    image.url = image_url  # Set URL after creation
    
    db.session.add(image)
    db.session.commit()
    
    return jsonify(image.to_dict()), 201

@app.route('/api/items/<int:item_id>/images/<int:image_id>', methods=['DELETE'])
def delete_image(item_id, image_id):
    token = request.headers.get('Authorization') or request.form.get('token')
    if token != app.config['API_TOKEN']:
        return jsonify({'error': 'Unauthorized'}), 401
    
    image = ItemImage.query.filter_by(id=image_id, item_id=item_id).first_or_404()
    
    # Delete file from filesystem
    try:
        os.remove(os.path.join(app.config['UPLOAD_FOLDER'], image.filename))
    except OSError:
        pass  # File might not exist
    
    db.session.delete(image)
    db.session.commit()
    return '', 204

@app.route('/api/items/<int:item_id>/hint', methods=['POST'])
def add_hint(item_id):
    item = WishlistItem.query.get_or_404(item_id)
    data = request.get_json()
    
    message = data.get('message', '').strip()
    if not message:
        return jsonify({'error': 'Message is required'}), 400
    
    hint = PurchaseHint(item_id=item.id, message=message)
    db.session.add(hint)
    db.session.commit()
    
    return jsonify(hint.to_dict()), 201

@app.route('/api/hints/<int:hint_id>', methods=['DELETE'])
def dismiss_hint(hint_id):
    token = request.headers.get('Authorization') or request.form.get('token')
    if token != app.config['API_TOKEN']:
        return jsonify({'error': 'Unauthorized'}), 401
    
    hint = PurchaseHint.query.get_or_404(hint_id)
    hint.dismissed = True
    db.session.commit()
    
    return '', 204

@app.route('/api/tags', methods=['GET'])
def get_tags():
    return jsonify(get_existing_tags())

@app.route('/api/predefined-messages', methods=['GET'])
def get_predefined_messages():
    messages = {
        'en': [
            "I've got this covered! 🎁",
            "Already purchased this item",
            "This one's taken care of",
            "Bought it already!",
            "Consider this done ✓"
        ],
        'hu': [
            "Ezt már megvettem! 🎁",
            "Ez már megvan",
            "Erről már gondoskodtam",
            "Már megrendeltem!",
            "Ez már elintézve ✓"
        ]
    }
    return jsonify(messages)

@app.route('/api/baby-title', methods=['GET'])
def get_baby_title():
    """Get a random baby title for the current language"""
    language = request.args.get('lang', 'en')
    title = get_random_baby_title(language)
    return jsonify({'title': title})

@app.route('/api/baby-title-variations', methods=['GET'])
def get_baby_title_variations_api():
    """Get all baby title variations for both languages"""
    return jsonify(get_baby_title_variations())

if __name__ == '__main__':
    print("🎯 Baby Wishlist - Starting up...", flush=True)
    app.logger.info("Baby Wishlist application starting")
    
    with app.app_context():
        try:
            db.create_all()
            app.logger.info("Database tables created successfully")
            print("✅ Database initialized", flush=True)
        except Exception as e:
            app.logger.error(f"Database initialization failed: {e}")
            print(f"❌ Database error: {e}", flush=True)
            sys.exit(1)
    
    # Use Waitress for production
    from waitress import serve
    port = int(os.environ.get('PORT', 5000))
    
    print(f"🚀 Starting Baby Wishlist server on port {port}", flush=True)
    print(f"📱 Public view: http://localhost:{port}/", flush=True)
    print(f"⚙️  Admin panel: http://localhost:{port}/admin", flush=True)
    print("🔑 Remember to set your API_TOKEN environment variable!", flush=True)
    
    app.logger.info(f"Starting Waitress server on port {port}")
    
    try:
        serve(app, host='0.0.0.0', port=port, threads=4)
    except Exception as e:
        app.logger.error(f"Server startup failed: {e}")
        print(f"❌ Server error: {e}", flush=True)
        sys.exit(1)
