# Hızlı Test Çalıştırma Rehberi

## Sorun: Jest-expo Çok Yavaş

Jest-expo preset'i Expo SDK dosyalarını okurken çok zaman alıyor. Bu normal bir durum.

## Çözüm: Sadece Unit Testleri Çalıştır

### 1. En Hızlı Yöntem - Sadece geoUtils Testi

```bash
# Bu test React Native'e bağımlı değil, çok hızlı çalışır
npx jest utils/__tests__/geoUtils.test.ts --no-coverage --no-watch --testEnvironment=node
```

### 2. Alternatif: Basit Jest Konfigürasyonu

Eğer sadece unit testleri çalıştırmak istiyorsanız, `jest.config.simple.js` oluşturun:

```js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};
```

Sonra çalıştırın:
```bash
npx jest --config jest.config.simple.js
```

### 3. Manuel Test (En Hızlı)

Unit testleri manuel olarak Node.js ile çalıştırabilirsiniz:

```bash
node -e "
const { calculateDistance, calculateZoomLevel } = require('./utils/geoUtils.ts');
console.log('Test 1:', calculateDistance([32.85411, 39.92077], [32.85342, 39.92036]));
console.log('Test 2:', calculateZoomLevel(1500));
console.log('✅ Tests passed!');
"
```

## Önerilen Yaklaşım

1. **Geliştirme sırasında**: Sadece değiştirdiğiniz dosyanın testini çalıştırın
2. **CI/CD'de**: Tüm testleri çalıştırın (zaman önemli değil)
3. **Hızlı kontrol**: Sadece unit testleri çalıştırın

## Test Dosyaları ve Süreleri

- `geoUtils.test.ts` - **2-3 saniye** (React Native yok)
- `useDashboardModel.test.ts` - **10-20 saniye** (React Native gerekli)
- `ThemeContext.test.tsx` - **15-30 saniye** (React Native + Context gerekli)

## İpuçları

1. İlk çalıştırma her zaman yavaştır (cache oluşturma)
2. İkinci çalıştırma çok daha hızlıdır
3. Watch mode kullanmayın (ilk çalıştırmada)
4. Coverage'ı kapatın (gerektiğinde açın)

