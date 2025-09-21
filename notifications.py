#!/usr/bin/env python3
"""
Notification module using Shoutrrr for sending notifications
"""

import os
import subprocess
import logging
from typing import Optional

logger = logging.getLogger(__name__)

class NotificationService:
    def __init__(self):
        self.shoutrrr_binary = self._find_shoutrrr_binary()
        self.notification_urls = self._get_notification_urls()
    
    def _find_shoutrrr_binary(self) -> Optional[str]:
        """Find Shoutrrr binary in the system"""
        # Check if shoutrrr is in PATH
        try:
            result = subprocess.run(['which', 'shoutrrr'], 
                                  capture_output=True, text=True, timeout=5)
            if result.returncode == 0:
                return result.stdout.strip()
        except (subprocess.TimeoutExpired, FileNotFoundError):
            pass
        
        # Check local binary
        local_binary = os.path.join(os.path.dirname(__file__), 'bin', 'shoutrrr')
        if os.path.isfile(local_binary) and os.access(local_binary, os.X_OK):
            return local_binary
        
        logger.warning("Shoutrrr binary not found. Notifications will be disabled.")
        return None
    
    def _get_notification_urls(self) -> list:
        """Get notification URLs from environment variables"""
        urls = []
        
        # Support multiple notification URLs
        for i in range(1, 11):  # Support up to 10 notification URLs
            url_key = f'NOTIFICATION_URL_{i}' if i > 1 else 'NOTIFICATION_URL'
            url = os.environ.get(url_key)
            if url:
                urls.append(url)
        
        return urls
    
    def is_enabled(self) -> bool:
        """Check if notifications are enabled"""
        return self.shoutrrr_binary is not None and len(self.notification_urls) > 0
    
    def send_notification(self, title: str, message: str) -> bool:
        """Send notification using Shoutrrr"""
        if not self.is_enabled():
            logger.info(f"Notifications disabled. Would send: {title} - {message}")
            return False
        
        success = True
        for url in self.notification_urls:
            try:
                # Use Shoutrrr to send notification
                cmd = [
                    self.shoutrrr_binary,
                    'send',
                    '--url', url,
                    '--title', title,
                    '--message', message
                ]
                
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
                
                if result.returncode == 0:
                    logger.info(f"Notification sent successfully to {url[:20]}...")
                else:
                    logger.error(f"Failed to send notification to {url[:20]}...: {result.stderr}")
                    success = False
                    
            except subprocess.TimeoutExpired:
                logger.error(f"Notification timeout for {url[:20]}...")
                success = False
            except Exception as e:
                logger.error(f"Error sending notification to {url[:20]}...: {e}")
                success = False
        
        return success
    
    def send_purchase_notification(self, item_title: str, buyer_message: str = "") -> bool:
        """Send notification when someone buys an item"""
        title = "🎁 Item Purchased!"
        
        message = f"Someone wants to buy: {item_title}"
        if buyer_message:
            message += f"\n\nMessage: {buyer_message}"
        
        return self.send_notification(title, message)
    
    def send_test_notification(self) -> bool:
        """Send a test notification"""
        title = "🧪 Test Notification"
        message = "This is a test notification from Baby Wishlist. If you see this, notifications are working correctly!"
        
        return self.send_notification(title, message)

# Global notification service instance
notification_service = NotificationService()
