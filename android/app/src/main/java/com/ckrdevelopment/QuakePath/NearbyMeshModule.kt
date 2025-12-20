package com.ckrdevelopment.QuakePath

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.nearby.Nearby
import com.google.android.gms.nearby.connection.*
import java.nio.charset.StandardCharsets
import java.util.*
import android.os.Handler
import android.os.Looper
import android.Manifest
import androidx.core.app.ActivityCompat
import android.content.pm.PackageManager

class NearbyMeshModule(
  private val reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  private val serviceId = "com.ckrdevelopment.quakepath.mesh"
  private val nodeId = UUID.randomUUID().toString()
  private val connectionsClient = Nearby.getConnectionsClient(reactContext)

  override fun getName() = "NearbyMesh"

private fun ensurePermissions(): Boolean {
  val activity = currentActivity ?: return false

  val needed = arrayOf(
    Manifest.permission.BLUETOOTH_SCAN,
    Manifest.permission.BLUETOOTH_ADVERTISE,
    Manifest.permission.BLUETOOTH_CONNECT,
    Manifest.permission.ACCESS_FINE_LOCATION
  )

  val missing = needed.any {
    ActivityCompat.checkSelfPermission(activity, it) != PackageManager.PERMISSION_GRANTED
  }

  if (missing) {
    ActivityCompat.requestPermissions(activity, needed, 1001)
    return false
  }

  return true
}


  /* =========================
     START MESH
  ========================== */
@ReactMethod
fun startMesh(promise: Promise) {
  if (!ensurePermissions()) {
    promise.reject("NO_PERMISSION", "Bluetooth permissions not granted")
    return
  }

  startAdvertising()

  Handler(Looper.getMainLooper()).postDelayed({
    startDiscovery()
  }, 1500)

  promise.resolve(nodeId)
}


  /* =========================
     SEND (unicast)
  ========================== */
  @ReactMethod
  fun send(peerId: String, message: String) {
    connectionsClient.sendPayload(
      peerId,
      Payload.fromBytes(message.toByteArray(StandardCharsets.UTF_8))
    )
  }

  /* =========================
     BROADCAST (JS routing)
  ========================== */
  @ReactMethod
  fun broadcast(message: String) {
    // JS mesh router decides forwarding
    sendEvent("MeshOutbound", message)
  }

  /* =========================
     ADVERTISING
  ========================== */
  private fun startAdvertising() {
    val options = AdvertisingOptions.Builder()
      .setStrategy(Strategy.P2P_CLUSTER)
      .build()

    connectionsClient.startAdvertising(
      nodeId,
      serviceId,
      connectionLifecycleCallback,
      options
    )
  }

  /* =========================
     DISCOVERY
  ========================== */
  private fun startDiscovery() {
    val options = DiscoveryOptions.Builder()
      .setStrategy(Strategy.P2P_POINT_TO_POINT)
      .build()

    connectionsClient.startDiscovery(
      serviceId,
      endpointDiscoveryCallback,
      options
    )
  }

  /* =========================
     CALLBACKS
  ========================== */
  private val endpointDiscoveryCallback = object : EndpointDiscoveryCallback() {
    override fun onEndpointFound(id: String, info: DiscoveredEndpointInfo) {
      connectionsClient.requestConnection(
        nodeId,
        id,
        connectionLifecycleCallback
      )
    }

    override fun onEndpointLost(id: String) {}
  }

  private val connectionLifecycleCallback = object : ConnectionLifecycleCallback() {
    override fun onConnectionInitiated(id: String, info: ConnectionInfo) {
      connectionsClient.acceptConnection(id, payloadCallback)
    }

    override fun onConnectionResult(id: String, result: ConnectionResolution) {
      if (result.status.isSuccess) {
        sendEvent("PeerConnected", id)
      }
    }

    override fun onDisconnected(id: String) {
      sendEvent("PeerDisconnected", id)
    }
  }

  private val payloadCallback = object : PayloadCallback() {
    override fun onPayloadReceived(id: String, payload: Payload) {
      if (payload.type == Payload.Type.BYTES) {
        val msg = String(payload.asBytes()!!, StandardCharsets.UTF_8)
        sendEvent("MeshInbound", msg)
      }
    }

    override fun onPayloadTransferUpdate(
      id: String,
      update: PayloadTransferUpdate
    ) {}
  }

  private fun sendEvent(name: String, data: String) {
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(name, data)
  }
}
