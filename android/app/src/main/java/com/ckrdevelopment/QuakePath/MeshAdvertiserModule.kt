package com.ckrdevelopment.QuakePath

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class MeshAdvertiserModule(
    private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    // Now correctly refers to MeshGattServer in the same package
    private val gattServer = MeshGattServer(reactContext) { message ->
        sendEvent("MeshMessageReceived", message)
    }

    override fun getName(): String = "MeshAdvertiser"

    @ReactMethod
    fun startServer(promise: Promise?) {
        try {
            gattServer.start()
            gattServer.startAdvertising()
            promise?.resolve(true)
            android.util.Log.d("MeshAdvertiser", "GATT server started and advertising")
        } catch (e: Exception) {
            android.util.Log.e("MeshAdvertiser", "Failed to start server", e)
            promise?.reject("START_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun stopServer(promise: Promise?) {
        try {
            gattServer.stop()
            promise?.resolve(true)
        } catch (e: Exception) {
            promise?.reject("STOP_ERROR", e.message, e)
        }
    }

    private fun sendEvent(eventName: String, data: String) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, data)
    }
}