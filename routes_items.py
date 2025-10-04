# Item CRUD Routes
from flask import jsonify, request, current_app
from models import db, WishlistItem, ItemTag
import os

def get_items():
    items = db.session.query(WishlistItem).order_by(WishlistItem.order.asc(), WishlistItem.priority.desc(), WishlistItem.created_at.desc()).all()
    return jsonify([item.to_dict() for item in items])


def create_item():
    # Check API token for admin operations
    token = request.headers.get('Authorization') or request.form.get('token')
    if token != current_app.config['API_TOKEN']:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json() if request.is_json else request.form
    
    # Get the highest current order and add 1 for new items
    max_order = db.session.query(db.func.max(WishlistItem.order)).scalar() or 0
    
    item = WishlistItem(
        title=data.get('title', ''),
        description=data.get('description', ''),
        priority=int(data.get('priority', 0)),
        order=int(data.get('order', max_order + 1))
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


def update_item(item_id):
    token = request.headers.get('Authorization') or request.form.get('token')
    if token != current_app.config['API_TOKEN']:
        return jsonify({'error': 'Unauthorized'}), 401
    
    item = db.get_or_404(WishlistItem, item_id)
    data = request.get_json() if request.is_json else request.form
    
    item.title = data.get('title', item.title)
    item.description = data.get('description', item.description)
    item.priority = int(data.get('priority', item.priority))
    item.disabled = bool(data.get('disabled', item.disabled))
    if 'order' in data:
        item.order = int(data.get('order', item.order))
    
    # Update tags
    if 'tags' in data:
        # Remove existing tags
        db.session.query(ItemTag).filter_by(item_id=item.id).delete()
        
        # Add new tags
        tags = data.get('tags', [])
        if isinstance(tags, str):
            tags = [tag.strip() for tag in tags.split(',') if tag.strip()]
        
        for tag_name in tags:
            tag = ItemTag(item_id=item.id, name=tag_name)
            db.session.add(tag)
    
    db.session.commit()
    return jsonify(item.to_dict())


def delete_item(item_id):
    token = request.headers.get('Authorization') or request.form.get('token')
    if token != current_app.config['API_TOKEN']:
        return jsonify({'error': 'Unauthorized'}), 401
    
    item = db.get_or_404(WishlistItem, item_id)
    
    # Delete associated images from filesystem (only local files, not URLs)
    for image in item.images:
        if image.filename:  # Only delete if it's a local file
            try:
                filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], image.filename)
                os.remove(filepath)
                current_app.logger.info(f"Deleted image file: {image.filename}")
            except OSError as e:
                current_app.logger.warning(f"Could not delete image file {image.filename}: {e}")
                pass  # File might not exist or already deleted
    
    db.session.delete(item)
    db.session.commit()
    return '', 204


def reorder_items():
    token = request.headers.get('Authorization') or request.form.get('token')
    if token != current_app.config['API_TOKEN']:
        return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.get_json()
    if not data or 'item_orders' not in data:
        return jsonify({'error': 'item_orders is required'}), 400
    
    item_orders = data['item_orders']  # Expected format: [{'id': 1, 'order': 0}, {'id': 2, 'order': 1}, ...]
    
    try:
        for item_order in item_orders:
            item_id = item_order.get('id')
            order = item_order.get('order')
            
            if item_id is None or order is None:
                return jsonify({'error': 'Each item must have id and order'}), 400
            
            item = db.session.get(WishlistItem, item_id)
            if item:
                item.order = order
        
        db.session.commit()
        return jsonify({'success': True}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

