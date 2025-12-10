# Membersihkan Repository (496MB → ~10MB)

## Masalah
Repository terlalu besar (496MB) karena:
- `pytorch_model.bin` (255MB) sudah ter-commit ke git history
- `.git` folder membesar (240MB)

## Solusi

### Option 1: Gunakan BFG Repo-Cleaner (Recommended)

```bash
# 1. Install BFG
brew install bfg  # macOS
# atau download dari: https://rtyley.github.io/bfg-repo-cleaner/

# 2. Backup dulu
cp -r uas_service uas_service_backup

# 3. Commit semua perubahan
cd uas_service
git add .
git commit -m "Remove large files from tracking"

# 4. Hapus file besar dari history
bfg --delete-files pytorch_model.bin
bfg --delete-files training_args.bin

# 5. Cleanup git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# 6. Check ukuran
du -sh .git
```

### Option 2: Fresh Start (Paling Mudah)

```bash
# 1. Backup model file
cp classifier_service/model/pytorch_model.bin ~/pytorch_model_backup.bin

# 2. Hapus .git
cd uas_service
rm -rf .git

# 3. Init git baru
git init
git add .
git commit -m "Initial commit (clean)"

# 4. Copy model kembali (tapi jangan commit)
cp ~/pytorch_model_backup.bin classifier_service/model/pytorch_model.bin
```

### Option 3: Git LFS (Large File Storage)

```bash
# 1. Install Git LFS
brew install git-lfs  # macOS
git lfs install

# 2. Track file besar dengan LFS
git lfs track "*.bin"
git add .gitattributes

# 3. Commit
git add classifier_service/model/pytorch_model.bin
git commit -m "Use Git LFS for model files"
```

## Hasil

Setelah cleanup:
- Repository size: ~10MB (tanpa model file)
- Model file tetap ada di local, tapi tidak di-push ke git
- File lain tetap normal

## Rekomendasi

**Gunakan Option 2 (Fresh Start)** jika:
- Belum push ke remote
- Tidak ada history yang penting

**Gunakan Option 1 (BFG)** jika:
- Sudah push ke remote
- Perlu preserve history

**Gunakan Option 3 (Git LFS)** jika:
- Perlu track model file di git
- Punya Git LFS di remote (GitHub, GitLab)

