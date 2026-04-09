from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return jsonify({
        "status": "online",
        "system": "EzDeploy Optimized Flask Instance",
        "message": "Welcome to your new cloud application!"
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
