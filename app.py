from flask import Flask, render_template, request, redirect, url_for, jsonify
import json
import os

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload():
    file = request.files.get('file')
    if file and file.filename.endswith('.json'):
        data = json.load(file)

        players = {p["Id"]: p for p in data.get("Players", [])}
        moments = data.get("Moments", [])

        # Inject player names into moments
        for m in moments:
            pid = m.get("ActingPlayer")
            m["PlayerName"] = players.get(pid, {}).get("LeaderName", f"Player {pid}")
            m["CivName"] = players.get(pid, {}).get("CivilizationDescription", "Unknown")

        return jsonify({
            "players": list(players.values()),
            "moments": moments
        })
    return jsonify({"error": "Invalid file"}), 400

if __name__ == '__main__':
    app.run(debug=True)
