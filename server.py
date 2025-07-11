from flask import Flask, render_template, request
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)

# مسارات
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR = os.path.join(BASE_DIR, 'static')

UPLOAD_PATHS = {
    'image': 'images',
    'video': 'videos',
    'text': 'texts',
    'file': 'files'
}

@app.route('/')
def index():
    images = ['/static/images/' + f for f in os.listdir(os.path.join(STATIC_DIR, 'images'))]
    videos = ['/static/videos/' + f for f in os.listdir(os.path.join(STATIC_DIR, 'videos'))]
    texts = []
    for fname in os.listdir(os.path.join(STATIC_DIR, 'texts')):
        with open(os.path.join(STATIC_DIR, 'texts', fname), encoding='utf-8') as f:
            texts.append(f.read())
    files = ['/static/files/' + f for f in os.listdir(os.path.join(STATIC_DIR, 'files'))]
    return render_template('index.html', images=images, videos=videos, texts=texts, files=files)

# 🚀 API لاستقبال المحتوى من بوت Telegram
@app.route('/upload', methods=['POST'])
def upload_from_bot():
    file = request.files.get('file')
    ftype = request.form.get('type')  # image, video, text, file

    if not file or not ftype or ftype not in UPLOAD_PATHS:
        return 'Invalid request', 400

    save_path = os.path.join(STATIC_DIR, UPLOAD_PATHS[ftype])
    os.makedirs(save_path, exist_ok=True)

    filename = secure_filename(file.filename)
    full_path = os.path.join(save_path, filename)
    file.save(full_path)

    return 'Uploaded', 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)