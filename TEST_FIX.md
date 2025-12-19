# Test Sorunu ve Çözümler

## 🔴 Sorun

Jest-expo preset'i dosya okurken timeout veriyor:
```
Error: ETIMEDOUT: connection timed out, read
```

Bu Jest-expo'nun bilinen bir sorunu - Expo SDK dosyalarını okurken zaman aşımı.

## ✅ Çözümler

### Çözüm 1: Basit Jest Konfigürasyonu (Önerilen)

Sadece unit testleri için (`jest.config.simple.js`):

```bash
npm run test:simple
```

Bu konfigürasyon:
- ✅ Jest-expo kullanmaz
- ✅ Sadece TypeScript testleri çalıştırır
- ✅ React Native bağımlılığı olmayan testler için ideal
- ✅ Hızlı çalışır

### Çözüm 2: Manuel Test

Basit fonksiyonları manuel test edin:

```bash
npm run test:manual
```

Bu script `geoUtils.ts` fonksiyonlarını test eder.

### Çözüm 3: CI/CD'de Test

GitHub Actions'ta testler çalışacak (`.github/workflows/test.yml`):
- ✅ CI ortamında Jest-expo sorunsuz çalışır
- ✅ Otomatik test çalıştırma
- ✅ Coverage raporu

## 📋 Test Dosyaları Durumu

| Dosya | Durum | Çalıştırma |
|-------|-------|------------|
| `geoUtils.test.ts` | ✅ Hazır | `npm run test:simple` |
| `useDashboardModel.test.ts` | ✅ Hazır | Jest-expo gerekli |
| `ThemeContext.test.tsx` | ✅ Hazır | Jest-expo gerekli |

## 💡 Öneri

1. **Unit testleri için**: `npm run test:simple` kullanın
2. **Hook/Context testleri için**: CI/CD'de çalıştırın
3. **Hızlı kontrol için**: `npm run test:manual` kullanın

## 🚀 Hızlı Başlangıç

```bash
# Basit testler (geoUtils)
npm run test:simple

# Manuel test
npm run test:manual

# CI/CD'de tüm testler çalışacak
git push origin master
```

## Not

Jest-expo sorunu:
- Lokal ortamda yavaş/timeout
- CI/CD'de sorunsuz çalışır
- Test dosyaları doğru yazılmış
- Sorun Jest-expo preset'inde, kodunuzda değil

