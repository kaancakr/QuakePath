package com.ckrdevelopment.QuakePath.ble

import android.bluetooth.*
import android.bluetooth.le.*
import android.content.Context
import android.os.ParcelUuid
import java.util.UUID

class MeshGattServer(
  private val context: Context,
  private val onMessage: (String) -> Unit
) {

  companion object {
    val MESH_SERVICE_UUID: UUID =
      UUID.fromString("0000aaaa-0000-1000-8000-00805f9b34fb")

    val MESH_CHAR_WRITE_UUID: UUID =
      UUID.fromString("0000aaab-0000-1000-8000-00805f9b34fb")
  }

  private val bluetoothManager =
    context.getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager

  private val adapter: BluetoothAdapter = bluetoothManager.adapter
  private var gattServer: BluetoothGattServer? = null
  private var advertiser: BluetoothLeAdvertiser? = null

  /* ---------------- GATT CALLBACK ---------------- */

  private val gattCallback = object : BluetoothGattServerCallback() {

    override fun onCharacteristicWriteRequest(
      device: BluetoothDevice,
      requestId: Int,
      characteristic: BluetoothGattCharacteristic,
      preparedWrite: Boolean,
      responseNeeded: Boolean,
      offset: Int,
      value: ByteArray
    ) {
      if (characteristic.uuid == MESH_CHAR_WRITE_UUID) {
        val message = String(value)
        onMessage(message)
      }

      if (responseNeeded) {
        gattServer?.sendResponse(
          device,
          requestId,
          BluetoothGatt.GATT_SUCCESS,
          0,
          null
        )
      }
    }
  }

  /* ---------------- ADVERTISE CALLBACK ---------------- */

  private val advertiseCallback = object : AdvertiseCallback() {
    override fun onStartSuccess(settingsInEffect: AdvertiseSettings) {
      super.onStartSuccess(settingsInEffect)
    }

    override fun onStartFailure(errorCode: Int) {
      super.onStartFailure(errorCode)
    }
  }

  /* ---------------- PUBLIC API ---------------- */

  fun start() {
    gattServer = bluetoothManager.openGattServer(context, gattCallback)

    val service = BluetoothGattService(
      MESH_SERVICE_UUID,
      BluetoothGattService.SERVICE_TYPE_PRIMARY
    )

    val writeChar = BluetoothGattCharacteristic(
      MESH_CHAR_WRITE_UUID,
      BluetoothGattCharacteristic.PROPERTY_WRITE,
      BluetoothGattCharacteristic.PERMISSION_WRITE
    )

    service.addCharacteristic(writeChar)
    gattServer?.addService(service)
  }

  fun startAdvertising() {
    advertiser = adapter.bluetoothLeAdvertiser ?: return

    val settings = AdvertiseSettings.Builder()
      .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_LOW_LATENCY)
      .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
      .setConnectable(true)
      .build()

    val data = AdvertiseData.Builder()
      .addServiceUuid(ParcelUuid(MESH_SERVICE_UUID))
      .setIncludeDeviceName(true)
      .build()

    advertiser?.startAdvertising(settings, data, advertiseCallback)
  }

  fun stop() {
    advertiser?.stopAdvertising(advertiseCallback)
    gattServer?.close()
  }
}
