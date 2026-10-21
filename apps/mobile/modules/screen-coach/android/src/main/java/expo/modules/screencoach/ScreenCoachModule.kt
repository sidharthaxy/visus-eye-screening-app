package expo.modules.screencoach

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/** Screen Coach (screens 7, 21, 22, 23): screen time, break reminders and their permissions. */
class ScreenCoachModule : Module() {
  private val context: Context
    get() = requireNotNull(appContext.reactContext) { "React context is not available" }

  private fun openSettings(intent: Intent) {
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    context.startActivity(intent)
  }

  private fun service() = Intent(context, ScreenCoachService::class.java)

  private fun startService(intent: Intent) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) context.startForegroundService(intent) else context.startService(intent)
  }

  override fun definition() = ModuleDefinition {
    Name("ScreenCoach")

    // Usage access: screen time per day.
    Function("hasUsageAccess") { ScreenTime.hasAccess(context) }
    Function("openUsageAccessSettings") { openSettings(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)) }

    // Display over other apps: the break overlay.
    Function("canDrawOverlays") { Settings.canDrawOverlays(context) }
    Function("openOverlaySettings") {
      openSettings(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:${context.packageName}")))
    }

    /** [{ date: "2026-10-22", minutes }] for the last `days` days, today last. Zeros without usage access. */
    AsyncFunction("getScreenTime") { days: Int ->
      ScreenTime.minutesPerDay(context, days.coerceIn(1, 31)).map { (date, minutes) -> mapOf("date" to date, "minutes" to minutes) }
    }

    /** [{ date, taken, skipped }] for the last `days` days, today last. */
    AsyncFunction("getBreaks") { days: Int ->
      ScreenTime.minutesPerDay(context, days.coerceIn(1, 31)).map { (date, _) ->
        mapOf("date" to date, "taken" to CoachStore.breaks(context, "taken", date), "skipped" to CoachStore.breaks(context, "skipped", date))
      }
    }

    /** Starts (or updates) break reminders every `intervalMin` minutes of continuous screen time. */
    Function("start") { intervalMin: Int ->
      CoachStore.setIntervalMin(context, intervalMin.coerceIn(1, 120))
      CoachStore.setEnabled(context, true)
      startService(service())
    }

    Function("stop") {
      CoachStore.setEnabled(context, false)
      context.stopService(service())
    }

    Function("getStatus") {
      mapOf(
        "enabled" to CoachStore.enabled(context),
        "running" to ScreenCoachService.running,
        "intervalMin" to CoachStore.intervalMin(context),
        "secondsToBreak" to ScreenCoachService.secondsToBreak(context),
      )
    }

    /** Shows the break overlay now (for trying it out). Starts the service if needed. */
    Function("showBreakNow") {
      startService(service().putExtra(ScreenCoachService.EXTRA_SHOW_NOW, true))
    }
  }
}
