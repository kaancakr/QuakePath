# Git Commit Rehberi

## 📋 Commit Edilecek Dosyalar

### ✅ ÖNEMLİ - Mutlaka Commit Edin

#### Test Dosyaları
```
context/__tests__/
hooks/__tests__/
utils/__tests__/
```
**Neden:** Test dosyaları projenin kalitesi için gerekli

#### Jest Konfigürasyonları
```
jest.config.js
jest.config.simple.js
jest.setup.js
```
**Neden:** Test çalıştırmak için gerekli

#### CI/CD Workflow
```
.github/workflows/test.yml
```
**Neden:** Otomatik test çalıştırmak için gerekli

#### Package Dosyaları
```
package.json
package-lock.json
```
**Neden:** Test dependency'leri eklendi

#### Gitignore
```
.gitignore
```
**Neden:** Jest cache ve gereksiz dosyaları ignore etmek için

### 📝 OPSİYONEL - İsterseniz Commit Edin

#### Test Dokümantasyonları
```
docs/TEST_FINAL_STATUS.md
docs/TEST_FIX.md
docs/TEST_STATUS.md
docs/TEST_TROUBLESHOOTING.md
docs/README_TESTS.md
docs/QUICK_TEST.md
docs/CLEANUP_SUMMARY.md
```
**Not:** Bu dosyalar yardımcı dokümantasyon, commit etmek zorunda değilsiniz

### ❌ COMMIT ETMEYİN

```
.cursor/mcp 2.json  (duplicate dosya)
test-manual.js      (manuel test script, .gitignore'da)
test-simple.sh      (test script, .gitignore'da)
```

## 🚀 Commit Komutları

### Seçenek 1: Sadece Önemli Dosyalar (Önerilen)

```bash
# Test dosyalarını ekle
git add context/__tests__/
git add hooks/__tests__/
git add utils/__tests__/

# Jest konfigürasyonlarını ekle
git add jest.config.js
git add jest.config.simple.js
git add jest.setup.js

# CI/CD workflow'u ekle
git add .github/

# Package dosyalarını ekle
git add package.json
git add package-lock.json

# Gitignore'u ekle
git add .gitignore

# Commit et
git commit -m "test: add test files and jest configuration

- Add unit tests for geoUtils (11 tests)
- Add tests for useDashboardModel hook (8 tests)
- Add tests for ThemeContext (10 tests)
- Add Jest configuration files
- Add CI/CD workflow for automated testing
- Update package.json with test dependencies"

# Push et
git push origin master
```

### Seçenek 2: Tüm Değişiklikler (Dokümantasyon Dahil)

```bash
# Tüm değişiklikleri ekle (test-manual.js ve test-simple.sh hariç)
git add .

# .cursor klasörünü unstage et
git reset HEAD .cursor/

# Commit et
git commit -m "test: add comprehensive test suite and documentation

- Add unit tests (29 test cases)
- Add Jest configuration
- Add CI/CD workflow
- Add test documentation"

# Push et
git push origin master
```

## 🔍 Kontrol

Commit etmeden önce kontrol edin:

```bash
# Staged dosyaları göster
git status

# Değişiklikleri göster
git diff --cached

# Commit edilecek dosyaları listele
git diff --cached --name-only
```

## ⚠️ Dikkat

- `.cursor/mcp 2.json` dosyasını commit etmeyin (duplicate)
- `test-manual.js` ve `test-simple.sh` zaten .gitignore'da
- Dokümantasyon dosyaları opsiyonel

## ✅ Güvenli Commit

En güvenli yol:

```bash
# 1. Durumu kontrol et
git status

# 2. Sadece test dosyalarını ekle
git add context/__tests__/ hooks/__tests__/ utils/__tests__/

# 3. Jest konfigürasyonlarını ekle
git add jest.config.js jest.config.simple.js jest.setup.js

# 4. CI/CD'yi ekle
git add .github/

# 5. Package dosyalarını ekle
git add package.json package-lock.json .gitignore

# 6. Kontrol et
git status

# 7. Commit et
git commit -m "test: add test files and configuration"

# 8. Push et
git push origin master
```

