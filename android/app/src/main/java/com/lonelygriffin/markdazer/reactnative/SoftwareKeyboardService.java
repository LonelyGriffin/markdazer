package com.lonelygriffin.markdazer.reactnative;

import android.content.Context;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.util.Map;
import java.util.HashMap;
import java.util.Objects;

import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;

public class SoftwareKeyboardService extends ReactContextBaseJavaModule {
    private DeviceEventManagerModule.RCTDeviceEventEmitter emitter;
    private EditText editText;
    private ReactApplicationContext context;
    private InputMethodManager imm;

    SoftwareKeyboardService(ReactApplicationContext context) {
        super(context);
        this.context = context;
        this.imm = (InputMethodManager) this.context.getSystemService(Context.INPUT_METHOD_SERVICE);
    }

    @NonNull
    @Override
    public String getName() {
        return "SoftwareKeyboardService";
    }

    @ReactMethod
    public void dispatch(ReadableMap action) {
        switch (Objects.requireNonNull(action.getString("type"))) {
            case "change": changeAction(action); break;
            case "open": openAction(); break;
        }
    }

    private void changeAction(ReadableMap action) {
        editText.setText(action.getString("text"));
        editText.setSelection(action.getInt("cursor"));
    }

    private void openAction() {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                editText.requestFocus();
                imm.toggleSoftInput(InputMethodManager.SHOW_FORCED, InputMethodManager.HIDE_IMPLICIT_ONLY);
            }
        });
    }

    public void initialize(EditText editText) {
        this.editText = editText;
        this.editText.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {

            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {

            }

            @Override
            public void afterTextChanged(Editable s) {
                initializeEmitterIfNeed();
                WritableMap event = Arguments.createMap();
                event.putString("type", "changed");
                event.putString("text", editText.getText().toString());
                event.putInt("cursor", editText.getSelectionStart());
                sendEvent(event);
            }
        });
    }

    private void initializeEmitterIfNeed() {
        if (this.emitter == null) {
            this.emitter = context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
        }
    }

    private void sendEvent(WritableMap event) {
        this.emitter.emit("EVENT", event);
    }
}
