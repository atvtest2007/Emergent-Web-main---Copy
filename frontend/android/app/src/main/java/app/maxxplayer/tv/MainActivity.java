package app.maxxplayer.tv;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        registerPlugin(NativeVideoPlayerPlugin.class);
    }
    
    @Override
    public void onStart() {
        super.onStart();
        WebView webView = this.bridge.getWebView();
        if (webView != null) {
            WebSettings settings = webView.getSettings();
            String ua = settings.getUserAgentString();
            if (!ua.contains("MaxxPlayerFlavor")) {
                settings.setUserAgentString(ua + " MaxxPlayerFlavor/" + BuildConfig.FLAVOR);
            }
        }
    }
}
