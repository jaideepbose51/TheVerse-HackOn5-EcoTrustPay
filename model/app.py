from flask import Flask, request, jsonify, render_template
from tensorflow.keras.applications.vgg16 import VGG16, preprocess_input
from tensorflow.keras.preprocessing import image
import numpy as np
from numpy.linalg import norm
from scipy.spatial.distance import cosine
import os

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Load VGG16 model once
model = VGG16(weights='imagenet', include_top=False, pooling='max')

# Feature extraction
def extract_features(img_path):
    img = image.load_img(img_path, target_size=(224, 224))
    x = image.img_to_array(img)
    x = np.expand_dims(x, axis=0)
    x = preprocess_input(x)
    features = model.predict(x)
    return features[0] / norm(features[0])

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/compare', methods=['POST'])
def compare():
    if 'image1' not in request.files or 'image2' not in request.files:
        return jsonify({'error': 'Both images are required'}), 400

    img1 = request.files['image1']
    img2 = request.files['image2']

    path1 = os.path.join(UPLOAD_FOLDER, img1.filename)
    path2 = os.path.join(UPLOAD_FOLDER, img2.filename)

    img1.save(path1)
    img2.save(path2)

    try:
        feat1 = extract_features(path1)
        feat2 = extract_features(path2)
        similarity = 1 - cosine(feat1, feat2)
        similarity_percent = round(similarity * 100, 2)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        os.remove(path1)
        os.remove(path2)

    return jsonify({'similarity': similarity_percent})

if __name__ == '__main__':
    app.run(debug=True)
