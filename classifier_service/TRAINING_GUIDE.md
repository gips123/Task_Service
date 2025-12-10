# Training Guide - Classifier Model

## Model Info
- **Base Model**: distilbert-base-uncased
- **Dataset**: vagrawal787/todo_task_list_types
- **Categories**: emergency, family, home, personal, social, work
- **Accuracy**: 95%

## Option 1: Download Pre-trained Model

### Dari Hugging Face:
```bash
# Install huggingface-cli
pip install huggingface-hub

# Download model (jika tersedia)
huggingface-cli download <model-name> --local-dir classifier_service/model
```

### Atau gunakan model yang sudah ada:
Jika Anda punya backup `pytorch_model.bin`, copy ke `classifier_service/model/`

## Option 2: Training Ulang

### Requirements:
```bash
pip install transformers torch datasets accelerate
```

### Training Script:
```python
from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification, 
    Trainer, 
    TrainingArguments
)
from datasets import load_dataset

# 1. Load dataset
dataset = load_dataset("vagrawal787/todo_task_list_types")

# 2. Load tokenizer dan model
tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
model = AutoModelForSequenceClassification.from_pretrained(
    "distilbert-base-uncased", 
    num_labels=6,
    id2label={
        0: "emergency",
        1: "family",
        2: "home",
        3: "personal",
        4: "social",
        5: "work"
    },
    label2id={
        "emergency": 0,
        "family": 1,
        "home": 2,
        "personal": 3,
        "social": 4,
        "work": 5
    }
)

# 3. Tokenize dataset
def tokenize_function(examples):
    return tokenizer(examples["text"], padding="max_length", truncation=True)

tokenized_datasets = dataset.map(tokenize_function, batched=True)

# 4. Training arguments
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=4,
    per_device_train_batch_size=4,
    per_device_eval_batch_size=4,
    learning_rate=2e-05,
    evaluation_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
)

# 5. Train
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets["train"],
    eval_dataset=tokenized_datasets["test"],
)

trainer.train()

# 6. Save model
model.save_pretrained("./classifier_service/model")
tokenizer.save_pretrained("./classifier_service/model")
```

## Option 3: Gunakan Keyword-Based Saja (Tanpa Model)

Jika tidak perlu ML model, gunakan `classifier_no_model.py`:

```bash
cd classifier_service
python classifier_no_model.py
```

Ini akan menggunakan keyword matching saja (tidak perlu `pytorch_model.bin`).

### Accuracy:
- ML Model: ~95%
- Keyword-based: ~70-80%

## Rekomendasi

1. **Untuk production**: Download atau training ulang model
2. **Untuk development/testing**: Gunakan `classifier_no_model.py`
3. **Untuk git**: Jangan commit `pytorch_model.bin` (terlalu besar)

## Dataset

Dataset `vagrawal787/todo_task_list_types` tersedia di Hugging Face:
https://huggingface.co/datasets/vagrawal787/todo_task_list_types

Berisi ribuan contoh task dengan label kategori.

