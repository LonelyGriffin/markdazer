package com.lonelygriffin.markdazer;

import android.os.Bundle;
import android.os.PersistableBundle;
import android.util.Log;
import android.widget.AbsoluteLayout;
import android.widget.EditText;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.RelativeLayout;

import androidx.annotation.Nullable;

import com.facebook.react.ReactActivity;
import com.lonelygriffin.markdazer.reactnative.SoftwareKeyboardService;

public class MainActivity extends ReactActivity {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "markdazer";
  }

  @Override
  protected void onStart() {
    super.onStart();

    MainApplication app = (MainApplication)this.getApplication();

    EditText editText = new EditText(this);
    editText.setText("");
    editText.setMaxLines(2);

    FrameLayout.LayoutParams frameLayout = new FrameLayout.LayoutParams(1000, 100);
    frameLayout.setMargins(0, 500, 0, 0);
//    frameLayout.setMargins(10000, 10000, 0, 0);

    editText.setLayoutParams(frameLayout);

    FrameLayout rootLayout = (FrameLayout)findViewById(android.R.id.content);
    rootLayout.addView(editText);

    app.initializeReactNativePackage(editText);
  }
}
