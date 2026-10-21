package expo.modules.screencoach

import android.content.Context
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.provider.Settings
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView

/**
 * Screen 22: the break reminder shown on top of any app (needs "Display over other apps").
 * Look 20 feet away for 20 seconds, then Done; or Skip this break.
 */
class BreakOverlay(private val context: Context, private val onClose: (taken: Boolean) -> Unit) {
  private val wm = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
  private val handler = Handler(Looper.getMainLooper())
  private var root: View? = null

  val isShowing: Boolean get() = root != null

  private fun dp(v: Float) = TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v, context.resources.displayMetrics)

  private fun rounded(color: Int, radiusDp: Float) = GradientDrawable().apply {
    setColor(color)
    cornerRadius = dp(radiusDp)
  }

  private fun text(value: String, sizeSp: Float, color: Int, bold: Boolean = false) = TextView(context).apply {
    text = value
    setTextSize(TypedValue.COMPLEX_UNIT_SP, sizeSp)
    setTextColor(color)
    gravity = Gravity.CENTER
    if (bold) typeface = Typeface.DEFAULT_BOLD
  }

  /** Returns false when the overlay permission is missing. */
  fun show(seconds: Int = 20): Boolean {
    if (root != null) return true
    if (!Settings.canDrawOverlays(context)) return false

    val ink = Color.parseColor("#111111")
    val muted = Color.parseColor("#5F5F5B")
    val pill = text("●  Eye break", 14f, Color.parseColor("#194F81"), bold = true).apply {
      background = rounded(Color.parseColor("#B3FFFFFF"), 16f)
      setPadding(dp(14f).toInt(), dp(6f).toInt(), dp(14f).toInt(), dp(6f).toInt())
    }
    val number = text(seconds.toString(), 64f, ink, bold = true)
    val unit = text("seconds", 14f, muted, bold = true)
    val circle = LinearLayout(context).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER
      background = GradientDrawable().apply {
        shape = GradientDrawable.OVAL
        setColor(Color.parseColor("#BFFFFFFF"))
      }
      addView(number)
      addView(unit)
    }
    val title = text("Look 20 feet away", 28f, ink, bold = true)
    val sub = text(
      "Find something far off, like a window or the end of the room, and relax your eyes for $seconds seconds.",
      17f,
      Color.parseColor("#3A3A37"),
    )
    val done = text("Done", 17f, Color.WHITE, bold = true).apply {
      background = rounded(ink, 16f)
      alpha = 0.4f
      isEnabled = false
    }
    val skip = text("Skip this break", 15f, muted, bold = true)

    val content = LinearLayout(context).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER_HORIZONTAL
      setPadding(dp(24f).toInt(), dp(70f).toInt(), dp(24f).toInt(), dp(34f).toInt())
      addView(pill, LinearLayout.LayoutParams(LinearLayout.LayoutParams.WRAP_CONTENT, LinearLayout.LayoutParams.WRAP_CONTENT))
      addView(View(context), LinearLayout.LayoutParams(0, 0, 1f))
      addView(circle, LinearLayout.LayoutParams(dp(200f).toInt(), dp(200f).toInt()))
      addView(title, LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply { topMargin = dp(40f).toInt() })
      addView(sub, LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT).apply { topMargin = dp(10f).toInt() })
      addView(View(context), LinearLayout.LayoutParams(0, 0, 1f))
      addView(done, LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(56f).toInt()))
      addView(skip, LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(44f).toInt()).apply { topMargin = dp(4f).toInt() })
    }
    val frame = FrameLayout(context).apply {
      setBackgroundColor(Color.parseColor("#E0F1FF"))
      addView(content, FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT))
    }

    var left = seconds
    val tick = object : Runnable {
      override fun run() {
        left -= 1
        if (left > 0) {
          number.text = left.toString()
          handler.postDelayed(this, 1000)
        } else {
          number.text = "✓"
          unit.text = "Rested"
          title.text = "Nice, eyes rested"
          sub.text = "Back to it. Next break in ${CoachStore.intervalMin(context)} minutes."
          done.alpha = 1f
          done.isEnabled = true
        }
      }
    }
    handler.postDelayed(tick, 1000)
    done.setOnClickListener { close(true) }
    skip.setOnClickListener { close(false) }

    val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
    } else {
      @Suppress("DEPRECATION")
      WindowManager.LayoutParams.TYPE_PHONE
    }
    val params = WindowManager.LayoutParams(
      WindowManager.LayoutParams.MATCH_PARENT,
      WindowManager.LayoutParams.MATCH_PARENT,
      type,
      WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
      PixelFormat.TRANSLUCENT,
    )
    wm.addView(frame, params)
    root = frame
    return true
  }

  fun close(taken: Boolean) {
    val view = root ?: return
    handler.removeCallbacksAndMessages(null)
    try {
      wm.removeView(view)
    } catch (_: Exception) {
    }
    root = null
    onClose(taken)
  }
}
