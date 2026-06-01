package app.maxxplayer.tv

import android.app.Activity
import android.content.Intent
import androidx.activity.result.ActivityResult
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.ActivityCallback
import com.getcapacitor.annotation.CapacitorPlugin

@CapacitorPlugin(name = "NativeVideoPlayer")
class NativeVideoPlayerPlugin : Plugin() {

    @PluginMethod
    fun play(call: PluginCall) {
        val url = call.getString("url")
        val title = call.getString("title") ?: "Video"
        val initialPosition = call.getInt("initialPosition") ?: 0
        
        if (url == null) {
            call.reject("Must provide a video url")
            return
        }

        val intent = Intent(context, NativePlayerActivity::class.java).apply {
            putExtra("url", url)
            putExtra("title", title)
            putExtra("initialPosition", initialPosition)
        }

        startActivityForResult(call, intent, "playbackResult")
    }

    @ActivityCallback
    private fun playbackResult(call: PluginCall?, result: ActivityResult) {
        if (call == null) return

        val data = result.data
        if (result.resultCode == Activity.RESULT_OK) {
            val position = data?.getLongExtra("position", 0L) ?: 0L
            val duration = data?.getLongExtra("duration", 0L) ?: 0L
            val completed = data?.getBooleanExtra("completed", false) ?: false

            val res = JSObject().apply {
                put("position", position)
                put("duration", duration)
                put("completed", completed)
            }
            call.resolve(res)
        } else {
            val error = data?.getStringExtra("error") ?: "Playback was canceled or failed"
            call.reject(error)
        }
    }
}
