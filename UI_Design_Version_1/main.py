from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"ok": True})

@app.route("/api/plan", methods=["POST"])
def plan():
    data = request.get_json(force=True) or {}
    print("received")
    return jsonify({"ok": True, "received": data})

if __name__ == "__main__":
    print("Starting Flask on http://127.0.0.1:5000 ...")
    app.run(host="127.0.0.1", port=5000, debug=True)
