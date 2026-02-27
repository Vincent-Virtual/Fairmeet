from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"ok": True})

# @app.route("/api/plan", methods=["POST"])
# def plan():
#     data = request.get_json(force=True) or {}
#     print("received")
#     return jsonify({"ok": True, "received": data})

@app.route("/api/plan", methods=["POST"])
def plan():
    data = request.get_json(force=True) or {}
    ##preferred format
    # {
    #     "meetupName": "...",
    #     "activityType": "...",
    #     "budget": 100,
    #     "users": [
    #         {"lat": 42.36, "lng": -71.06},
    #         {"lat": 42.35, "lng": -71.10}
    #     ]
    # }

    # if not users:
    #     return jsonify({"error": "No users provided"}), 400

    # avg_lat = sum(u["lat"] for u in users) / len(users)
    # avg_lng = sum(u["lng"] for u in users) / len(users)

    # return jsonify({
    #     "option": {"lat": avg_lat, "lng": avg_lng},
    # })

    meetupName = data.get("meetupName")
    preferredArea = data.get("preferredArea")

    print(meetupName, preferredArea)
    return jsonify({"ok": True, "received": data})

    

if __name__ == "__main__":
    print("Starting Flask on http://127.0.0.1:5000 ...")
    app.run(host="127.0.0.1", port=5000, debug=True)
