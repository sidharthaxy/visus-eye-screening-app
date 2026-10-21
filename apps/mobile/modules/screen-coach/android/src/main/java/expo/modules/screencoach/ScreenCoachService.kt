package expo.modules.screencoach

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager

/**
 * Counts continuous screen-on time while it runs (foreground service with a small notification).
 * After `interval` minutes without a break it shows the break overlay (screen 22).
 */
class ScreenCoachService : Service() {
  companion object {
    private const val CHANNEL = "visus_screen_coach"
    private const val NOTIFICATION_ID = 4120
    private const val TICK_MS = 15_000L
    const val EXTRA_SHOW_NOW = "show_now"

    @Volatile var running = false
    /** When the current stretch of screen time started (wall clock), 0 when the screen is off. */
    @Volatile var stretchStart = 0L

    fun secondsToBreak(context: Context): Int {
      if (!running || stretchStart == 0L) return CoachStore.intervalMin(context) * 60
      val elapsed = (System.currentTimeMillis() - stretchStart) / 1000
      return (CoachStore.intervalMin(context) * 60 - elapsed).toInt().coerceAtLeast(0)
    }
  }

  private val handler = Handler(Looper.getMainLooper())
  private lateinit var overlay: BreakOverlay

  private val screenReceiver = object : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
      when (intent.action) {
        Intent.ACTION_SCREEN_ON -> stretchStart = System.currentTimeMillis()
        Intent.ACTION_SCREEN_OFF -> stretchStart = 0L
      }
    }
  }

  private val tick = object : Runnable {
    override fun run() {
      check()
      handler.postDelayed(this, TICK_MS)
    }
  }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onCreate() {
    super.onCreate()
    overlay = BreakOverlay(this) { taken ->
      CoachStore.recordBreak(this, if (taken) "taken" else "skipped")
      if (running) {
        stretchStart = System.currentTimeMillis()
        updateNotification()
      }
    }
    createChannel()
    val notification = buildNotification()
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
      startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE)
    } else {
      startForeground(NOTIFICATION_ID, notification)
    }
    val filter = IntentFilter().apply {
      addAction(Intent.ACTION_SCREEN_ON)
      addAction(Intent.ACTION_SCREEN_OFF)
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      registerReceiver(screenReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
    } else {
      registerReceiver(screenReceiver, filter)
    }
    val power = getSystemService(Context.POWER_SERVICE) as PowerManager
    stretchStart = if (power.isInteractive) System.currentTimeMillis() else 0L
    running = true
    handler.postDelayed(tick, TICK_MS)
  }

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    if (intent?.getBooleanExtra(EXTRA_SHOW_NOW, false) == true) showBreak()
    updateNotification()
    return START_STICKY
  }

  override fun onDestroy() {
    running = false
    stretchStart = 0L
    handler.removeCallbacksAndMessages(null)
    try {
      unregisterReceiver(screenReceiver)
    } catch (_: Exception) {
    }
    overlay.close(false)
    super.onDestroy()
  }

  private fun check() {
    if (stretchStart != 0L && secondsToBreak(this) <= 0 && !overlay.isShowing) showBreak()
    updateNotification()
  }

  private fun showBreak() {
    // Without "Display over other apps", a notification is the reminder instead.
    if (!overlay.show()) {
      notificationManager().notify(NOTIFICATION_ID + 1, simpleNotification("Time for an eye break", "Look 20 feet away for 20 seconds."))
      stretchStart = System.currentTimeMillis()
    }
  }

  private fun notificationManager() = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

  private fun createChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel = NotificationChannel(CHANNEL, "Screen Coach", NotificationManager.IMPORTANCE_LOW)
      channel.description = "Counts screen time to remind you to rest your eyes"
      notificationManager().createNotificationChannel(channel)
    }
  }

  private fun openApp(): PendingIntent? {
    val launch = packageManager.getLaunchIntentForPackage(packageName) ?: return null
    return PendingIntent.getActivity(this, 0, launch, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
  }

  private fun simpleNotification(title: String, body: String, ongoing: Boolean = false): Notification {
    val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      Notification.Builder(this, CHANNEL)
    } else {
      @Suppress("DEPRECATION")
      Notification.Builder(this)
    }
    return builder
      .setSmallIcon(android.R.drawable.ic_menu_view)
      .setContentTitle(title)
      .setContentText(body)
      .setContentIntent(openApp())
      .setOnlyAlertOnce(true)
      .setOngoing(ongoing)
      .build()
  }

  private fun buildNotification(): Notification {
    val minutes = (secondsToBreak(this) + 59) / 60
    val body = if (stretchStart == 0L) "Counting screen time" else "Next eye break in $minutes min"
    return simpleNotification("Screen Coach is on", body, ongoing = true)
  }

  private fun updateNotification() {
    notificationManager().notify(NOTIFICATION_ID, buildNotification())
  }
}
