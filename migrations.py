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


def migrate_url_images_to_local():
    """Download all URL-based images and store them locally"""
    from models import db, ItemImage
    from flask import current_app
    from helpers import download_image_from_url
    
    print("🔄 Checking for URL-based images to download...", flush=True)
    
    # Find all images that have a URL but no local filename
    url_images = ItemImage.query.filter(
        ItemImage.filename.is_(None),
        ItemImage.url.isnot(None)
    ).all()
    
    if not url_images:
        print("✅ No URL-based images found. All images are already local.", flush=True)
        return
    
    print(f"📥 Found {len(url_images)} URL-based images. Attempting to download...", flush=True)
    
    success_count = 0
    fail_count = 0
    
    for image in url_images:
        image_url = image.url
        print(f"   Downloading: {image_url[:80]}...", flush=True)
        
        # Use the shared download helper
        success, filename, original_filename, error = download_image_from_url(
            image_url,
            current_app.config['UPLOAD_FOLDER']
        )
        
        if success and filename:
            # Update the database record
            image.filename = filename
            # Keep the URL as reference, but filename takes precedence
            db.session.commit()
            
            success_count += 1
            print(f"   ✅ Downloaded and saved as: {filename}", flush=True)
        else:
            fail_count += 1
            print(f"   ⚠️  Failed to download (keeping as URL): {error[:100] if error else 'Unknown error'}", flush=True)
    
    print(f"✅ URL image migration complete: {success_count} downloaded, {fail_count} kept as URLs.", flush=True)

