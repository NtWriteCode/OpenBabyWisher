# Database Migration Functions
from flask import current_app
from models import db
import random

def auto_migrate_order_field():
    """Automatically add order field and populate it if missing"""
    try:
        # Check if order column exists by querying table info
        result = db.session.execute(db.text("PRAGMA table_info(wishlist_item)")).fetchall()
        columns = [row[1] for row in result]  # Column names are in index 1
        
        if 'order' in columns:
            current_app.logger.info("Order field already exists")
            return
            
        current_app.logger.info("Order field missing, adding it...")
        
        # Add the order column
        db.session.execute(db.text("ALTER TABLE wishlist_item ADD COLUMN 'order' INTEGER DEFAULT 0"))
        
        # Get all items and assign random order
        items = db.session.execute(db.text("SELECT id FROM wishlist_item ORDER BY created_at")).fetchall()
        
        if items:
            import random
            # Create a shuffled list of order values
            order_values = list(range(len(items)))
            random.shuffle(order_values)
            
            # Update each item with a random order
            for i, (item_id,) in enumerate(items):
                db.session.execute(
                    db.text("UPDATE wishlist_item SET 'order' = :order WHERE id = :id"),
                    {"order": order_values[i], "id": item_id}
                )
            
            current_app.logger.info(f"Added order field and randomized order for {len(items)} items")
        else:
            current_app.logger.info("Added order field (no existing items to randomize)")
        
        db.session.commit()
        
    except Exception as e:
        current_app.logger.error(f"Failed to auto-migrate order field: {e}")
        db.session.rollback()


def ensure_order_values():
    """Ensure all items have proper order values (fix any NULL or duplicate orders)"""
    try:
        # Find items with NULL or missing order values
        items_without_order = db.session.execute(
            db.text("SELECT id FROM wishlist_item WHERE 'order' IS NULL ORDER BY created_at")
        ).fetchall()
        
        if items_without_order:
            # Get the highest existing order value
            max_order_result = db.session.execute(
                db.text("SELECT MAX('order') FROM wishlist_item WHERE 'order' IS NOT NULL")
            ).fetchone()
            
            max_order = max_order_result[0] if max_order_result[0] is not None else -1
            
            # Assign incremental order values to items without order
            for i, (item_id,) in enumerate(items_without_order):
                new_order = max_order + 1 + i
                db.session.execute(
                    db.text("UPDATE wishlist_item SET 'order' = :order WHERE id = :id"),
                    {"order": new_order, "id": item_id}
                )
            
            db.session.commit()
            current_app.logger.info(f"Fixed order values for {len(items_without_order)} items")
            
    except Exception as e:
        current_app.logger.error(f"Failed to ensure order values: {e}")
        db.session.rollback()

