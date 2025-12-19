#!/bin/bash

# Güvenli commit script - Sadece önemli dosyaları commit eder

echo "🔍 Git durumu kontrol ediliyor..."
echo ""

# Önce durumu göster
echo "📋 Mevcut durum:"
git status --short
echo ""

# Kullanıcıya sor
read -p "Devam etmek istiyor musunuz? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ İptal edildi"
    exit 1
fi

echo ""
echo "📦 Önemli dosyalar ekleniyor..."

# Test dosyalarını ekle
echo "  ✅ Test dosyaları..."
git add context/__tests__/
git add hooks/__tests__/
git add utils/__tests__/

# Jest konfigürasyonlarını ekle
echo "  ✅ Jest konfigürasyonları..."
git add jest.config.js
git add jest.config.simple.js
git add jest.setup.js

# CI/CD workflow'u ekle
echo "  ✅ CI/CD workflow..."
git add .github/

# Package dosyalarını ekle
echo "  ✅ Package dosyaları..."
git add package.json
git add package-lock.json

# Gitignore'u ekle
echo "  ✅ .gitignore..."
git add .gitignore

echo ""
echo "📋 Staged dosyalar:"
git status --short

echo ""
read -p "Commit mesajı girin (boş bırakırsanız varsayılan kullanılır): " commit_msg

if [ -z "$commit_msg" ]; then
    commit_msg="test: add test files and jest configuration

- Add unit tests for geoUtils (11 tests)
- Add tests for useDashboardModel hook (8 tests)
- Add tests for ThemeContext (10 tests)
- Add Jest configuration files
- Add CI/CD workflow for automated testing
- Update package.json with test dependencies"
fi

echo ""
echo "💾 Commit ediliyor..."
git commit -m "$commit_msg"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Commit başarılı!"
    echo ""
    read -p "Push etmek istiyor musunuz? (y/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🚀 Push ediliyor..."
        git push origin master
        echo "✅ Push başarılı!"
    else
        echo "ℹ️  Push edilmedi. İstediğiniz zaman 'git push origin master' ile push edebilirsiniz."
    fi
else
    echo "❌ Commit başarısız!"
    exit 1
fi

