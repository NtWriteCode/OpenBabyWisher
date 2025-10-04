# 👶 OpenBabyWisher

A simple, self-hostable wishlist application designed for new parents to share gift ideas with family and friends. Built with Flask and designed for easy Docker deployment.

## What is OpenBabyWisher?

OpenBabyWisher is a lightweight web application that helps expecting or new parents create and manage a wishlist for their baby. Family and friends can view the wishlist and anonymously indicate when they plan to purchase an item, helping avoid duplicate gifts while maintaining the surprise element.

## Why was this made?

This project was created to solve a common problem for new parents:
- **Avoid duplicate gifts** - Multiple people buying the same item
- **Share specific needs** - Let people know exactly what you need and want
- **Maintain privacy** - No complex user accounts or social media integration required
- **Keep it simple** - Easy to set up and use for both tech-savvy and non-tech family members
- **Self-hosted control** - Keep your data private and under your control

## Goals

- ✅ **Simple to deploy** - One Docker command to get started
- ✅ **Easy to use** - Intuitive interface for both admins and visitors
- ✅ **Privacy-focused** - No external dependencies or data sharing
- ✅ **Mobile-friendly** - Works great on phones and tablets
- ✅ **Lightweight** - Minimal resource requirements

## Features

### For Parents (Admins)
- **Easy item management** - Add, edit, and delete wishlist items
- **Rich descriptions** - Add detailed descriptions, images, and tags
- **Priority system** - Mark items as high/medium/low priority
- **Purchase notifications** - See when someone indicates they're buying an item
- **Image support** - Upload multiple images per item or use image URLs
- **Mark as complete** - Cross out items when they're no longer needed

### For Family & Friends (Visitors)
- **Browse wishlist** - View all items with descriptions and images
- **Anonymous hints** - Indicate you're buying an item without revealing your identity
- **Pre-written messages** - Quick anonymous messages or write custom notes
- **Mobile responsive** - Easy to use on any device
- **Multi-language** - Support for English and Hungarian

### Technical Features
- **SQLite database** - Simple, file-based database (no setup required)
- **Image optimization** - Automatic image resizing and compression
- **Tag system** - Organize items with custom tags
- **RESTful API** - Clean API for all operations
- **Docker ready** - Easy containerized deployment
- **Personalization** - Set your baby's name for custom titles that rotate randomly

## Quick Start

### Using Docker Compose (Recommended)

1. **Create a directory for your wishlist:**
   ```bash
   mkdir openbabywisher
   cd openbabywisher
   ```

2. **Find your user ID (important for file permissions):**
   ```bash
   id -u  # Note this number (usually 1000 or 1001)
   id -g  # Note this number (usually same as user ID)
   ```

3. **Create a docker-compose.yml file:**
   ```yaml
   services:
     openbabywisher:
       image: ntwritecode/openbabywisher:latest
       container_name: openbabywisher
       # IMPORTANT: Replace with YOUR user ID from step 2
       # This ensures the container can write to ./data and ./uploads
       user: "1001:1001"  # Change to match your 'id -u' and 'id -g' output
       ports:
         - "5000:5000"
       environment:
         - SECRET_KEY=your-very-secret-key-change-this
         - API_TOKEN=your-admin-token-change-this
         - BABY_NAME=Emma
         - DATABASE_URL=sqlite:////app/data/wishlist.db
         - PORT=5000
         - NOTIFICATION_URL=  # Optional: Add Shoutrrr URL for notifications
       volumes:
         - ./data:/app/data:rw
         - ./uploads:/app/uploads:rw
       restart: unless-stopped
   ```

4. **Start the application:**
   ```bash
   docker-compose up -d
   ```

5. **Access your wishlist:**
   - **Public wishlist:** http://localhost:5000
   - **Admin panel:** http://localhost:5000/admin (use your API_TOKEN to log in)

### Using Docker Run

```bash
# Create data directories
mkdir -p data uploads

# Run the container
docker run -d \
  --name openbabywisher \
  -p 5000:5000 \
  -v $(pwd)/data:/app/data \
  -v $(pwd)/uploads:/app/uploads \
  -e SECRET_KEY="your-very-secret-key-change-this" \
  -e API_TOKEN="your-admin-token-change-this" \
  -e BABY_NAME="Emma" \
  ntwritecode/openbabywisher:latest
```

## Configuration

All configuration is done through environment variables:

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SECRET_KEY` | Flask secret key for sessions and security | `your-secret-key-change-this` | **Yes** |
| `API_TOKEN` | Admin authentication token for management | `your-admin-token-change-this` | **Yes** |
| `BABY_NAME` | Your baby's name for personalized titles | `our little one` | No |
| `DATABASE_URL` | Database connection string | `sqlite:///data/wishlist.db` | No |
| `PORT` | Port the application runs on | `5000` | No |

### Important Security Notes

⚠️ **Change the default values!** Always set strong, unique values for `SECRET_KEY` and `API_TOKEN` in production.

### Baby Personalization

Set the `BABY_NAME` environment variable to personalize your wishlist with your baby's name. The app will automatically generate cute variations like:

- **With default "our little one":** "our precious bundle of joy", "our sweet baby", "our little miracle", etc.
- **With custom name "Emma":** "little Emma", "sweet Emma", "our precious Emma", "sunshine Emma", etc.

The title rotates randomly each time the page loads and when switching languages, keeping the experience fresh and delightful!

### Notifications

OpenBabyWisher supports notifications via **Shoutrrr** when someone indicates they want to buy an item. This helps you stay informed about gift purchases in real-time.

#### Setup Notifications

1. **Configure notification URL(s)** (Shoutrrr is automatically installed in Docker):
   ```bash
   # Discord webhook
   export NOTIFICATION_URL="discord://webhook_id/webhook_token"
   
   # Slack webhook  
   export NOTIFICATION_URL="slack://webhook_url"
   
   # Email (SMTP)
   export NOTIFICATION_URL="smtp://user:pass@host:port/?from=sender@example.com&to=recipient@example.com"
   
   # Multiple services (use NOTIFICATION_URL_1, NOTIFICATION_URL_2, etc.)
   export NOTIFICATION_URL_1="discord://webhook_id/webhook_token"
   export NOTIFICATION_URL_2="slack://webhook_url"
   ```

2. **Test notifications** from the admin panel using the "Test" button.

#### Supported Services

Shoutrrr supports 70+ notification services including Discord, Slack, Telegram, email, Teams, and many more. See the [Shoutrrr documentation](https://containrrr.dev/shoutrrr/) for complete URL format examples.

### Database

OpenBabyWisher uses SQLite by default, which is perfect for personal/family use:
- **No setup required** - Just works out of the box
- **Easy backups** - Simply copy the `data/wishlist.db` file
- **Lightweight** - No separate database server needed
- **Reliable** - SQLite is battle-tested and stable

The database file is stored in the `data/` directory, which should be mounted as a volume to persist data between container restarts.

### File Storage

Images are stored in the `uploads/` directory:
- **Automatic optimization** - Images are resized to 800x600 max resolution
- **Multiple formats** - Supports PNG, JPG, JPEG, GIF, and WebP
- **Size limits** - 16MB maximum file size
- **UUID filenames** - Prevents conflicts and improves security

## Security Considerations

OpenBabyWisher is designed for family use and includes basic security measures, but **it's not bulletproof**:

### What's Protected
- ✅ **Admin authentication** - API token required for management functions
- ✅ **File upload validation** - Only image files allowed, with size limits
- ✅ **Input sanitization** - Basic protection against malicious input
- ✅ **Secure file naming** - UUIDs prevent directory traversal

### Security Limitations
- ⚠️ **SQL Injection** - Basic protection in place, but not extensively tested
- ⚠️ **XSS Protection** - Limited protection against cross-site scripting
- ⚠️ **No HTTPS** - You should use a reverse proxy (nginx/Traefik) for SSL in production
- ⚠️ **No rate limiting** - Could be vulnerable to brute force attacks
- ⚠️ **No CSRF protection** - Cross-site request forgery protection not implemented

### Recommendations
- **Use behind a reverse proxy** with SSL/TLS termination
- **Set strong passwords** for SECRET_KEY and API_TOKEN
- **Keep it internal** - Don't expose directly to the internet without additional security
- **Regular backups** - Back up your data directory regularly
- **Monitor access** - Check logs for suspicious activity

## Development

To run locally for development:

```bash
# Clone the repository
git clone https://github.com/NtWriteCode/OpenBabyWisher.git
cd OpenBabyWisher

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export SECRET_KEY="dev-secret-key"
export API_TOKEN="dev-admin-token"

# Run the application
python app.py
```

## License

This project is licensed under the MIT License - see below for details:

```
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Support

If you encounter issues:
1. Check that your environment variables are set correctly
2. Ensure the `data` and `uploads` directories exist and are writable
3. Check the container logs: `docker logs openbabywisher`
4. Verify your API_TOKEN is correct when accessing the admin panel

---

Made with ❤️ for families everywhere! 👶✨