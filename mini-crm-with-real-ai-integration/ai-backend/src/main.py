from flask import Flask, jsonify
from flask_cors import CORS
from routes.ai import ai_bp
from routes.lead import lead_bp
from routes.reminders import reminders_bp
import os

app = Flask(__name__)
CORS(app) # Enable CORS for all routes and origins

# Register blueprints
app.register_blueprint(ai_bp, url_prefix="/api/ai")
app.register_blueprint(lead_bp, url_prefix="/api") # Assuming lead_bp routes are directly under /api
app.register_blueprint(reminders_bp, url_prefix="/api")

@app.route("/")
def hello_world():
    return "Hello from Mini-CRM Backend!"

if __name__ == "__main__":
    # Check if a specific port is provided as a command-line argument
    import argparse
    parser = argparse.ArgumentParser(description="Run Flask app.")
    parser.add_argument("--port", type=int, default=5001, help="Port to run the Flask app on.")
    args = parser.parse_args()

    app.run(debug=True, host="0.0.0.0", port=args.port)
