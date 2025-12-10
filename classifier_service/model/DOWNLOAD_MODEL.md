# Download Model

Model file `pytorch_model.bin` terlalu besar untuk di-commit ke git (255MB).

## Cara download model:

### Option 1: Download dari Hugging Face
```bash
cd classifier_service/model
# Download dari Hugging Face atau sumber lain
```

### Option 2: Copy dari backup
Jika Anda memiliki backup model, copy file berikut:
- `pytorch_model.bin` (255MB)

## File yang diperlukan:
- ✅ `config.json` (sudah ada)
- ✅ `tokenizer.json` (sudah ada)
- ✅ `tokenizer_config.json` (sudah ada)
- ✅ `special_tokens_map.json` (sudah ada)
- ✅ `vocab.txt` (sudah ada)
- ❌ `pytorch_model.bin` (perlu download - 255MB)

Setelah download, letakkan `pytorch_model.bin` di folder ini.

