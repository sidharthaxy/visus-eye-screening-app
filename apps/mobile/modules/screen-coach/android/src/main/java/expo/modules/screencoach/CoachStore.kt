package expo.modules.screencoach

import android.content.Context
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale

/** Settings and break counts, saved on the phone (SharedPreferences). */
object CoachStore {
  private const val PREFS = "visus_screen_coach"

  private fun prefs(context: Context) = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

  fun dayKey(timeMs: Long): String = SimpleDateFormat("yyyy-MM-dd", Locale.US).format(Date(timeMs))

  /** Midnight (local time) of the day that contains timeMs. */
  fun startOfDay(timeMs: Long): Long {
    val cal = Calendar.getInstance()
    cal.timeInMillis = timeMs
    cal.set(Calendar.HOUR_OF_DAY, 0)
    cal.set(Calendar.MINUTE, 0)
    cal.set(Calendar.SECOND, 0)
    cal.set(Calendar.MILLISECOND, 0)
    return cal.timeInMillis
  }

  fun intervalMin(context: Context): Int = prefs(context).getInt("interval_min", 20)

  fun setIntervalMin(context: Context, minutes: Int) {
    prefs(context).edit().putInt("interval_min", minutes).apply()
  }

  fun enabled(context: Context): Boolean = prefs(context).getBoolean("enabled", false)

  fun setEnabled(context: Context, on: Boolean) {
    prefs(context).edit().putBoolean("enabled", on).apply()
  }

  /** kind: "taken" or "skipped". */
  fun recordBreak(context: Context, kind: String) {
    val key = "${kind}_${dayKey(System.currentTimeMillis())}"
    val p = prefs(context)
    p.edit().putInt(key, p.getInt(key, 0) + 1).apply()
  }

  fun breaks(context: Context, kind: String, day: String): Int = prefs(context).getInt("${kind}_$day", 0)
}
