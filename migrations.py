# Database Migration Functions
from flask import current_app
from models import db

def ensure_priority_field():
    """Ensure priority field exists with default value of 2 (nice to have)"""
    try:
        # Check if priority column exists
        result = db.session.execute(db.text("PRAGMA table_info(wishlist_item)")).fetchall()
        columns = [row[1] for row in result]
        
        if 'priority' in columns:
            current_app.logger.info("Priority field already exists")
            
            # Migrate old priority values (5 → 2, 8 → 4, 3 → 1) for backward compatibility
            db.session.execute(
                db.text("UPDATE wishlist_item SET priority = 2 WHERE priority = 5 OR priority IS NULL")
            )
            db.session.execute(
                db.text("UPDATE wishlist_item SET priority = 4 WHERE priority = 8")
            )
            db.session.execute(
                db.text("UPDATE wishlist_item SET priority = 1 WHERE priority = 3")
            )
            db.session.commit()
            current_app.logger.info("Migrated priority values to new 1-5 scale")
            return
        
        current_app.logger.info("Priority field missing, adding it...")
        
        # Add the priority column with default value
        db.session.execute(db.text("ALTER TABLE wishlist_item ADD COLUMN priority INTEGER DEFAULT 2"))
        db.session.commit()
        
        current_app.logger.info("Priority field added successfully with default value 2")
        
    except Exception as e:
        current_app.logger.error(f"Failed to ensure priority field: {e}")
        db.session.rollback()

