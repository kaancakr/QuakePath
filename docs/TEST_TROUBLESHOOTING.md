# Test Performans Sorunları ve Çözümleri

## Sorun: Testler Çok Yavaş Çalışıyor

### Olası Sebepler:

1. **Jest-expo Preset**: Expo SDK dosyalarını okurken zaman alıyor
2. **Transform İşlemleri**: Her dosya için transform yapılıyor
3. **Mock'lar**: Setup dosyasında çok fazla mock yükleniyor
4. **Cache Sorunu**: Jest cache'i bozulmuş olabilir

### Çözümler:

#### 1. Cache Temizleme
```bash
rm -rf .jest-cache
npm test
```

#### 2. Sadece Belirli Testleri Çalıştır
```bash
# Sadece geoUtils testlerini çalıştır
npm test -- utils/__tests__/geoUtils.test.ts

# Sadece hook testlerini çalıştır
npm test -- hooks/__tests__/
```

#### 3. Watch Mode Kullanma (İlk Çalıştırmada)
```bash
# İlk çalıştırmada watch mode kullanmayın
npm test -- --no-watch
```

#### 4. Coverage'ı Kapat
```bash
# Coverage raporu oluşturma (daha hızlı)
npm test -- --no-coverage
```

#### 5. Worker Sayısını Azalt
`jest.config.js` dosyasında:
```js
maxWorkers: 1, // Tek worker kullan (daha yavaş ama daha stabil)
```

#### 6. Jest-expo Yerine Basit Konfigürasyon (İleri Seviye)

Eğer jest-expo çok sorun çıkarıyorsa, basit bir konfigürasyon kullanabilirsiniz:

```js
module.exports = {
  preset: 'react-native',
  // ... diğer ayarlar
};
```

**NOT**: Bu durumda Expo modüllerini manuel mock'lamanız gerekebilir.

### Hızlı Test Komutları

```bash
# En hızlı - sadece bir test dosyası, coverage yok
npm test -- utils/__tests__/geoUtils.test.ts --no-coverage --no-watch

# Orta hız - tüm testler, coverage yok
npm test -- --no-coverage --no-watch

# Yavaş - coverage ile
npm run test:coverage
```

### Performans İpuçları

1. **İlk çalıştırma her zaman yavaştır** - Jest cache oluşturuyor
2. **İkinci çalıştırma daha hızlıdır** - Cache kullanılıyor
3. **Watch mode ilk başta yavaş olabilir** - Dosya izleme kuruluyor
4. **Coverage raporu oluşturma zaman alır** - Sadece gerektiğinde kullanın

### Beklenen Süreler

- **İlk çalıştırma**: 30-60 saniye (cache oluşturma)
- **Sonraki çalıştırmalar**: 5-15 saniye (cache kullanımı)
- **Watch mode**: İlk başta 30 saniye, sonra anlık

### Sorun Devam Ederse

1. Node modüllerini yeniden yükleyin:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Jest'i yeniden yükleyin:
   ```bash
   npm install --save-dev jest jest-expo
   ```

3. Expo SDK versiyonunu kontrol edin:
   ```bash
   npx expo --version
   ```

