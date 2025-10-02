# Image Handling Routes
from flask import jsonify, request, current_app
from models import db, WishlistItem, ItemImage
from werkzeug.utils import secure_filename
from helpers import allowed_file, resize_image
import os
import uuid

def upload_image(item_id):
    token = request.headers.get('Authorization') or request.form.get('token')
    if token != current_app.config['API_TOKEN']:
        return jsonify({'error': 'Unauthorized'}), 401
    
    item = db.get_or_404(WishlistItem, item_id)
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '' or not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file'}), 400
    
    # Generate unique filename
    filename = str(uuid.uuid4()) + '.' + file.filename.rsplit('.', 1)[1].lower()
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    
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


def add_image_from_url(item_id):
    token = request.headers.get('Authorization') or request.form.get('token')
    if token != current_app.config['API_TOKEN']:
        return jsonify({'error': 'Unauthorized'}), 401
    
    item = db.get_or_404(WishlistItem, item_id)
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


def delete_image(item_id, image_id):
    token = request.headers.get('Authorization') or request.form.get('token')
    if token != current_app.config['API_TOKEN']:
        return jsonify({'error': 'Unauthorized'}), 401
    
    image = db.session.query(ItemImage).filter_by(id=image_id, item_id=item_id).first_or_404()
    
    # Delete file from filesystem
    try:
        os.remove(os.path.join(current_app.config['UPLOAD_FOLDER'], image.filename))
    except OSError:
        pass  # File might not exist
    
    db.session.delete(image)
    db.session.commit()
    return '', 204

