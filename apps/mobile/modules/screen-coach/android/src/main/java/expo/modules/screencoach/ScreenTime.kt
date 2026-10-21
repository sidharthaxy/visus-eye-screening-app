package expo.modules.screencoach

import android.app.AppOpsManager
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.os.Build
import android.os.Process

/** Screen-on time per day from Android's usage events. Needs "Usage access" for Visus. */
object ScreenTime {
  private const val DAY_MS = 24L * 60 * 60 * 1000

  fun hasAccess(context: Context): Boolean {
    val ops = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
    val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
      ops.unsafeCheckOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), context.packageName)
    } else {
      @Suppress("DEPRECATION")
      ops.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), context.packageName)
    }
    return mode == AppOpsManager.MODE_ALLOWED
  }

  /** Minutes of screen-on time for each of the last `days` days, oldest first (today last). */
  fun minutesPerDay(context: Context, days: Int): List<Pair<String, Int>> {
    val now = System.currentTimeMillis()
    val firstDay = CoachStore.startOfDay(now) - (days - 1) * DAY_MS
    val ms = LongArray(days)
    if (hasAccess(context)) {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) fromScreenEvents(context, firstDay, now, ms)
      else fromAppUsage(context, firstDay, now, ms)
    }
    return (0 until days).map { i -> Pair(CoachStore.dayKey(firstDay + i * DAY_MS + DAY_MS / 2), (ms[i] / 60000L).toInt()) }
  }

  /** Adds [from, to) to the day buckets it overlaps. */
  private fun add(ms: LongArray, firstDay: Long, from: Long, to: Long) {
    var start = maxOf(from, firstDay)
    while (start < to) {
      val index = ((start - firstDay) / DAY_MS).toInt()
      if (index >= ms.size) break
      val dayEnd = firstDay + (index + 1) * DAY_MS
      val end = minOf(to, dayEnd)
      ms[index] += end - start
      start = end
    }
  }

  private fun fromScreenEvents(context: Context, firstDay: Long, now: Long, ms: LongArray) {
    val usm = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    // Start a day early to know whether the screen was already on at the start of the window.
    val events = usm.queryEvents(firstDay - DAY_MS, now)
    val event = UsageEvents.Event()
    var onSince: Long? = null
    while (events.hasNextEvent()) {
      events.getNextEvent(event)
      when (event.eventType) {
        UsageEvents.Event.SCREEN_INTERACTIVE -> if (onSince == null) onSince = event.timeStamp
        UsageEvents.Event.SCREEN_NON_INTERACTIVE -> {
          // Only intervals with a known start count; missing history never becomes screen time.
          onSince?.let { add(ms, firstDay, it, event.timeStamp) }
          onSince = null
        }
      }
    }
    // The screen is on right now (the user is looking at Visus).
    onSince?.let { add(ms, firstDay, it, now) }
  }

  /** Older Android: time apps were in the foreground. */
  private fun fromAppUsage(context: Context, firstDay: Long, now: Long, ms: LongArray) {
    val usm = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    for (i in ms.indices) {
      val start = firstDay + i * DAY_MS
      val end = minOf(start + DAY_MS, now)
      if (end <= start) continue
      val stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_BEST, start, end)
      ms[i] = stats.sumOf { it.totalTimeInForeground }.coerceAtMost(DAY_MS)
    }
  }
}
