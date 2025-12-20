# Test Kılavuzu

## Test Dosyaları

Projede şu test dosyaları mevcut:

1. **`utils/__tests__/geoUtils.test.ts`** - Coğrafi hesaplama fonksiyonları için unit testler
2. **`hooks/__tests__/useDashboardModel.test.ts`** - Dashboard view model hook testleri
3. **`context/__tests__/ThemeContext.test.tsx`** - Theme context testleri

## Test Çalıştırma

```bash
# Tüm testleri çalıştır
npm test

# Watch mode (değişiklikleri izle)
npm run test:watch

# Coverage raporu ile
npm run test:coverage

# Belirli bir test dosyasını çalıştır
npm test -- utils/__tests__/geoUtils.test.ts
```

## Test Yapısı

### Unit Testler
- `geoUtils.test.ts`: Mesafe hesaplama ve zoom level hesaplama fonksiyonları

### Hook Testleri
- `useDashboardModel.test.ts`: Dashboard view model hook'unun state yönetimi ve arama fonksiyonları

### Context Testleri
- `ThemeContext.test.tsx`: Theme context'in dark/light mode yönetimi

## Mock'lar

Tüm mock'lar `jest.setup.js` dosyasında tanımlanmıştır:
- React Native modülleri
- Expo modülleri
- AsyncStorage
- BLE Manager
- Socket.IO

## Notlar

- Jest-expo preset kullanılıyor
- Test environment otomatik olarak ayarlanıyor
- Coverage raporu `coverage/` klasöründe oluşturulur

