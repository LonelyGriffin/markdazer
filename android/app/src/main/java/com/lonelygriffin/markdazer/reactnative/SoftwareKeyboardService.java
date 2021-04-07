package com.lonelygriffin.markdazer.reactnative;

import android.content.Context;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.lonelygriffin.markdazer.Debouncer;

import org.jetbrains.annotations.Contract;
import org.jetbrains.annotations.NotNull;

import java.util.Objects;

import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;

public class SoftwareKeyboardService extends ReactContextBaseJavaModule {
    private DeviceEventManagerModule.RCTDeviceEventEmitter emitter;
    private EditText editText;
    private ReactApplicationContext context;
    private InputMethodManager imm;

    // dot because its separate sentences and in this way affect keyboard autocompletion right
    private final String BACKSPACE_ON_TEXT_BEGIN_FLAG = ".";

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
    public void dispatch(@NotNull ReadableMap action) {
        switch (Objects.requireNonNull(action.getString("type"))) {
            case "change": changeAction(action); break;
            case "open": openAction(); break;
        }
    }

    private void changeAction(@NotNull ReadableMap action) {
        needPassAfterChange = true;
        editText.setText(withBackspaceOnTextBeginFlag(action.getString("text")));
        editText.setSelection(action.getInt("cursor") + BACKSPACE_ON_TEXT_BEGIN_FLAG.length());
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
    boolean needPass = true;
    boolean needPassAfterChange = false;
    public void initialize(EditText editText) {
        this.editText = editText;
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                editText.setText(BACKSPACE_ON_TEXT_BEGIN_FLAG);
                editText.setSelection(BACKSPACE_ON_TEXT_BEGIN_FLAG.length());
            }
        });



        this.editText.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
            }

            @Override
            public void afterTextChanged(Editable s) {
                if(needPassAfterChange || needPass && s.toString().equals(BACKSPACE_ON_TEXT_BEGIN_FLAG)) {
                    needPass = false;
                    needPassAfterChange = false;
                    return;
                }
                needPass = false;
                String text = editText.getText().toString();
                if (text.contains("\n")) {
                    Debouncer.debounce("breakLineProcessing", breakLineProcessing, 100);
                    return;
                }

                if (editText.getSelectionStart() < BACKSPACE_ON_TEXT_BEGIN_FLAG.length()) {
                    needPass = true;
                    WritableMap event = Arguments.createMap();
                    event.putString("type", "backspaceOnTextBegin");
                    editText.setText(withBackspaceOnTextBeginFlag(text.substring(editText.getSelectionStart())));
                    editText.setSelection(BACKSPACE_ON_TEXT_BEGIN_FLAG.length());
                    sendEvent(event);
                    return;
                }
                int cursor = editText.getSelectionStart() - BACKSPACE_ON_TEXT_BEGIN_FLAG.length();
                WritableMap event = Arguments.createMap();
                event.putString("type", "changed");
                event.putString("text", withoutBackspaceOnTextBeginFlag(text));
                event.putInt("cursor", cursor);
                sendEvent(event);
            }
        });
    }

    private final Runnable breakLineProcessing = new Runnable() {
        @Override
        public void run() {
            String text = withoutBackspaceOnTextBeginFlag(editText.getText().toString())
                    .replaceAll("\n+", "\n");
            WritableMap event = Arguments.createMap();

            String[] beforeAndAfter = text.split("\n");
            String before = beforeAndAfter.length > 0 ? beforeAndAfter[0] : "";
            String after = beforeAndAfter.length > 1 ? beforeAndAfter[1] : "";
            needPass = true;
            editText.setText(withBackspaceOnTextBeginFlag(after));
            editText.setSelection(BACKSPACE_ON_TEXT_BEGIN_FLAG.length());
            event.putString("type", "lineBreak");
            event.putString("beforeText", before);
            event.putString("text", after);
            event.putInt("cursor", 0);
            sendEvent(event);
        }
    };

    private String withoutBackspaceOnTextBeginFlag(@NotNull String text) {
        return text.length() >= BACKSPACE_ON_TEXT_BEGIN_FLAG.length()
                ? text.substring(BACKSPACE_ON_TEXT_BEGIN_FLAG.length())
                : text;
    }

    @Contract(pure = true)
    private @NotNull String withBackspaceOnTextBeginFlag(String text) {
        return BACKSPACE_ON_TEXT_BEGIN_FLAG + text;
    }

    private void sendEvent(WritableMap event) {
        if (emitter == null) {
            try {
                emitter = context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class);
            } catch (IllegalStateException ignored) {return;}
        }

        emitter.emit("EVENT", event);
    }
}
