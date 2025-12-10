from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import warnings
import os
warnings.filterwarnings("ignore")

current_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(current_dir, "model")
model_path = os.path.normpath(os.path.abspath(model_path))

if not os.path.exists(model_path):
    raise FileNotFoundError(f"Model directory not found: {model_path}")

try:
    tokenizer = AutoTokenizer.from_pretrained(model_path, local_files_only=True)
    model = AutoModelForSequenceClassification.from_pretrained(
        model_path, dtype=torch.float16, local_files_only=True
    )
except Exception as e:
    tokenizer = AutoTokenizer.from_pretrained(model_path)
    model = AutoModelForSequenceClassification.from_pretrained(
        model_path, dtype=torch.float16
    )
model.eval()

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

id2label = model.config.id2label

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
    
    return None

def predict(text):
    inputs = tokenizer(text, return_tensors="pt", truncation=True, padding=True, max_length=128)
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = model(**inputs)
        logits = outputs.logits
        probs = torch.softmax(logits, dim=1)[0]
        pred_id = torch.argmax(probs).item()
        confidence = probs[pred_id].item()

    label_name = id2label.get(pred_id, f"Label_{pred_id}")

    if confidence < 0.65 or (label_name == 'personal' and confidence < 0.7):
        keyword_label = keyword_based_classification(text)
        if keyword_label:
            label2id = {v: k for k, v in id2label.items()}
            if keyword_label in label2id:
                pred_id = label2id[keyword_label]
                label_name = keyword_label
                confidence = 0.7
    
    return {
        "label_id": pred_id,
        "label_name": label_name,
        "confidence": confidence
    }
