package com.ckrdevelopment.QuakePath

import com.ckrdevelopment.QuakePath.ble.MeshGattServer
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class MeshAdvertiserModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  private val gattServer = MeshGattServer(reactContext) { message ->
    sendEvent("MeshMessageReceived", message)
  }

  override fun getName(): String = "MeshAdvertiser"

  @ReactMethod
  fun startServer(promise: Promise) {
    gattServer.start()
    gattServer.startAdvertising() // 🔥 BUNU EKLEMEZSEK ÇALIŞMAZ
    promise.resolve(true)
  }

  @ReactMethod
  fun stopServer(promise: Promise) {
    gattServer.stop()
    promise.resolve(true)
  }

  private fun sendEvent(eventName: String, data: String) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(eventName, data)
  }
}
