package app.maxxplayer.tv

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.KeyEvent
import android.view.View
import android.widget.ProgressBar
import androidx.appcompat.app.AppCompatActivity
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.media3.common.MediaItem
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player
import androidx.media3.datasource.DefaultHttpDataSource
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.exoplayer.hls.HlsMediaSource
import androidx.media3.ui.PlayerView

class NativePlayerActivity : AppCompatActivity() {

    private lateinit var playerView: PlayerView
    private lateinit var progressBar: ProgressBar
    private var player: ExoPlayer? = null
    
    private var videoUrl: String? = null
    private var videoTitle: String? = null
    private var initialPosition: Long = 0L

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_native_player)

        // Hide system bars for immersive fullscreen
        val windowInsetsController = WindowCompat.getInsetsController(window, window.decorView)
        windowInsetsController.systemBarsBehavior = WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        windowInsetsController.hide(WindowInsetsCompat.Type.systemBars())

        playerView = findViewById(R.id.player_view)
        progressBar = findViewById(R.id.progress_bar)

        videoUrl = intent.getStringExtra("url")
        videoTitle = intent.getStringExtra("title")
        initialPosition = intent.getIntExtra("initialPosition", 0).toLong()

        if (videoUrl == null) {
            Log.e("NativePlayerActivity", "No URL provided")
            finishWithError("No URL provided")
            return
        }

        initializePlayer()
    }

    private fun initializePlayer() {
        if (player == null) {
            val httpDataSourceFactory = DefaultHttpDataSource.Factory()
                .setAllowCrossProtocolRedirects(true)
                // Add default user agent or custom headers if needed
                .setDefaultRequestProperties(mapOf("User-Agent" to "ExoPlayer/Media3"))

            val mediaSourceFactory = HlsMediaSource.Factory(httpDataSourceFactory)
            
            player = ExoPlayer.Builder(this)
                .setMediaSourceFactory(mediaSourceFactory)
                .build()

            playerView.player = player
            
            // Set D-pad behavior and focus handling on TV
            playerView.requestFocus()

            val mediaItem = MediaItem.fromUri(videoUrl!!)
            player?.setMediaItem(mediaItem)
            
            if (initialPosition > 0) {
                player?.seekTo(initialPosition * 1000L) // Convert seconds to milliseconds
            }
            
            player?.addListener(object : Player.Listener {
                override fun onPlaybackStateChanged(playbackState: Int) {
                    when (playbackState) {
                        Player.STATE_BUFFERING -> progressBar.visibility = View.VISIBLE
                        Player.STATE_READY -> progressBar.visibility = View.GONE
                        Player.STATE_ENDED -> finishWithSuccess()
                        Player.STATE_IDLE -> {}
                    }
                }

                override fun onPlayerError(error: PlaybackException) {
                    Log.e("NativePlayerActivity", "Player Error: ${error.message}", error)
                    progressBar.visibility = View.GONE
                    finishWithError(error.message ?: "Unknown playback error")
                }
            })

            player?.prepare()
            player?.playWhenReady = true
        }
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        // Handle D-pad OK button to toggle play/pause if controller is hidden
        if (keyCode == KeyEvent.KEYCODE_DPAD_CENTER || keyCode == KeyEvent.KEYCODE_MEDIA_PLAY_PAUSE || keyCode == KeyEvent.KEYCODE_ENTER) {
            if (!playerView.isControllerFullyVisible) {
                playerView.showController()
                return true
            }
        }
        return super.onKeyDown(keyCode, event)
    }

    override fun onResume() {
        super.onResume()
        if (player == null) {
            initializePlayer()
        } else {
            player?.play()
        }
    }

    override fun onPause() {
        super.onPause()
        player?.pause()
    }

    override fun onStop() {
        super.onStop()
        player?.pause()
    }

    override fun onDestroy() {
        super.onDestroy()
        releasePlayer()
    }

    private fun releasePlayer() {
        player?.release()
        player = null
    }

    private fun finishWithSuccess() {
        val resultIntent = Intent()
        resultIntent.putExtra("completed", true)
        setResult(Activity.RESULT_OK, resultIntent)
        finish()
    }

    private fun finishWithError(errorMsg: String) {
        val resultIntent = Intent()
        resultIntent.putExtra("error", errorMsg)
        setResult(Activity.RESULT_CANCELED, resultIntent)
        finish()
    }

    override fun onBackPressed() {
        // Return current position for resuming logic if needed
        val resultIntent = Intent()
        val currentMs = player?.currentPosition ?: 0L
        val durMs = player?.duration ?: 0L
        resultIntent.putExtra("position", currentMs / 1000L) // return seconds
        resultIntent.putExtra("duration", durMs / 1000L)
        resultIntent.putExtra("completed", false)
        setResult(Activity.RESULT_OK, resultIntent)
        super.onBackPressed()
    }
}
