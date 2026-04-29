import os

from flask import Flask, jsonify, request, send_from_directory

from services import MeetupService
from search_engine import geocode_suggestions


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.abspath(os.path.join(BASE_DIR, "../front_end/dist"))

app = Flask(__name__)
service = MeetupService()


def json_body():
    # Most endpoints send json, keep this boring check here
    data = request.get_json(silent=True)
    if not data:
        return None
    return data


def base_url():
    # Used when saving share link for a new meetup
    return request.host_url.rstrip("/")


@app.route("/api/create-meetup", methods=["POST"])
def create_meetup():
    data = json_body()
    if data is None:
        return jsonify({"error": "No JSON data received"}), 400

    try:
        meetup = service.createMeetup(data, base_url())
        return jsonify(meetup), 200
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/api/join-meetup", methods=["POST"])
def join_meetup():
    # Join just checks the code then service saves it
    data = json_body()
    if data is None:
        return jsonify({"error": "No JSON data received"}), 400

    try:
        meetup = service.joinMeetup(data)
        return jsonify(meetup), 200
    except LookupError as exc:
        return jsonify({"error": str(exc)}), 404
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/api/plan", methods=["POST"])
def generate_plan():
    # Explicit planning endpoint from SDD
    data = json_body()
    if data is None:
        return jsonify({"error": "No JSON data received"}), 400

    event_code = data.get("eventCode") or data.get("event_code")
    if not event_code:
        return jsonify({"error": "Missing eventCode"}), 400

    try:
        result = service.generatePlan(event_code)
        return jsonify(result), 200
    except LookupError as exc:
        return jsonify({"error": str(exc)}), 404
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/api/result", methods=["GET"])
@app.route("/api/result/<event_code>", methods=["GET"])
def get_result(event_code=None):
    # Use saved result if we already have it
    event_code = event_code or request.args.get("eventCode") or request.args.get("event_code")
    if not event_code:
        return jsonify({"error": "Missing eventCode"}), 400

    try:
        result = service.fetchResults(event_code)
        return jsonify(result), 200
    except LookupError as exc:
        return jsonify({"error": str(exc)}), 404
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/api/meetup/<event_code>", methods=["GET"])
def get_meetup(event_code):
    try:
        meetup = service.fetchMeetup(event_code)
        return jsonify(meetup), 200
    except LookupError as exc:
        return jsonify({"error": str(exc)}), 404
    except Exception as exc:
        return jsonify({"error": str(exc)}), 500


@app.route("/api/geocode", methods=["GET"])
def geocode_search():
    query = request.args.get("q", "")
    return jsonify({"suggestions": geocode_suggestions(query)}), 200


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    # React handles page urls after static files are checked
    requested_path = os.path.join(DIST_DIR, path)

    if path and os.path.exists(requested_path):
        return send_from_directory(DIST_DIR, path)

    return send_from_directory(DIST_DIR, "index.html")


if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5001)
