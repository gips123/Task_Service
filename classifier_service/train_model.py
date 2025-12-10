from transformers import (
    AutoTokenizer, 
    AutoModelForSequenceClassification, 
    Trainer, 
    TrainingArguments,
    DataCollatorWithPadding
)
from datasets import load_dataset
import torch

print("=" * 60)
print("Training Classifier Model")
print("=" * 60)

print("\n1. Loading dataset from Hugging Face...")
dataset = load_dataset("vagrawal787/todo_task_list_types")
print(f"   Dataset loaded: {len(dataset['train'])} training samples")

print("\n2. Loading base model (distilbert-base-uncased)...")
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
print("   Model loaded successfully")

print("\n3. Tokenizing dataset...")
def tokenize_function(examples):
    return tokenizer(examples["text"], padding="max_length", truncation=True, max_length=128)

tokenized_datasets = dataset.map(tokenize_function, batched=True)
print("   Tokenization complete")

print("\n4. Setting up training arguments...")
training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=4,
    per_device_train_batch_size=4,
    per_device_eval_batch_size=4,
    learning_rate=2e-05,
    evaluation_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    logging_dir="./logs",
    logging_steps=10,
    seed=42,
)

data_collator = DataCollatorWithPadding(tokenizer=tokenizer)

print("\n5. Starting training...")
print("   This may take 1-2 hours depending on your hardware")
print("   " + "-" * 50)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets["train"],
    eval_dataset=tokenized_datasets["test"],
    data_collator=data_collator,
)

trainer.train()

print("\n6. Evaluating model...")
eval_results = trainer.evaluate()
print(f"   Evaluation results: {eval_results}")

print("\n7. Saving model to ./model/...")
model.save_pretrained("./model")
tokenizer.save_pretrained("./model")

print("\n" + "=" * 60)
print("Training Complete!")
print("=" * 60)
print(f"Model saved to: ./model/")
print(f"Evaluation accuracy: {eval_results.get('eval_accuracy', 'N/A')}")
print("\nYou can now run the classifier service:")
print("  python main.py")
print("=" * 60)

