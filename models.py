# Database Models
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class WishlistItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    priority = db.Column(db.Integer, default=2)
    disabled = db.Column(db.Boolean, default=False)
    order = db.Column(db.Integer, default=0)  # Manual ordering field
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
            'order': self.order,
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

