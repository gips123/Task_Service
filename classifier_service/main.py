from flask import Flask, request, jsonify
from model_loader import predict

app = Flask(__name__)

@app.route("/predict", methods=["POST"])
def predict_route():
    data = request.json
    text = data.get("description")

    if not text:
        return jsonify({"error": "description required"}), 400

    result = predict(text)
    return jsonify(result)

if __name__ == "__main__":
    port = 5001
    print(f"Classifier Service berjalan pada port {port}")
    print(f"URL: http://localhost:{port}")
    app.run(host="0.0.0.0", port=port)
