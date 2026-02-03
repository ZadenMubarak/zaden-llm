from flask import Flask, send_from_directory, jsonify, request
import os

# app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')
app = Flask(__name__)

@app.route('/')
def serve_frontend():
    return send_from_directory('<h1>Frontend build directory path here</h1>')