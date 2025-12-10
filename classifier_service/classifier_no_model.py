from flask import Flask, request, jsonify

app = Flask(__name__)

def keyword_based_classification(text):
    text_lower = text.lower()
    
    if any(kw in text_lower for kw in ['darurat', 'urgent', 'emergency', 'segera', 'critical', 'asap']):
        return 'emergency'
    
    if any(kw in text_lower for kw in ['repair', 'perbaiki', 'rumah', 'home', 'appliances', 'beli kebutuhan', 'shopping', 'belanja', 'kebutuhan mingguan', 'kebutuhan rumah tangga']):
        return 'home'
    
    if any(kw in text_lower for kw in ['keluarga', 'family', 'anak', 'istri', 'suami', 'ortu', 'parents']):
        return 'family'
    
    if any(kw in text_lower for kw in ['teman', 'friend', 'social', 'party', 'gathering', 'hangout', 'meetup']):
        return 'social'
    
    if any(kw in text_lower for kw in ['skripsi', 'thesis', 'kerja', 'work', 'project', 'meeting', 'presentasi', 'laporan', 'deadline', 'task', 'job', 'office', 'client', 'klien', 'tim', 'team', 'rapat', 'email', 'surat', 'pelajari', 'belajar', 'framework', 'coding', 'programming']):
        return 'work'
    
    return 'personal'

def predict(text):
    label_name = keyword_based_classification(text)
    label2id = {
        "emergency": 0,
        "family": 1,
        "home": 2,
        "personal": 3,
        "social": 4,
        "work": 5
    }
    
    return {
        "label_id": label2id[label_name],
        "label_name": label_name,
        "confidence": 0.7
    }

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
    print(f"Classifier Service (No Model) berjalan pada port {port}")
    print(f"URL: http://localhost:{port}")
    app.run(host="0.0.0.0", port=port)

