# View Routes
from flask import render_template, send_from_directory, current_app

def index():
    return render_template('index.html')


def admin():
    return render_template('admin.html')


def uploaded_file(filename):
    return send_from_directory(current_app.config['UPLOAD_FOLDER'], filename)

