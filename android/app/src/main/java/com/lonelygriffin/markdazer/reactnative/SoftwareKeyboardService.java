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
    private final ReactApplicationContext context;
    private final InputMethodManager imm;
    private int cursorState = 0;
    private String textState = "";
    private final int DEBOUNCE = 16;

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
        setState(withBackspaceOnTextBeginFlag(action.getString("text")),action.getInt("cursor") + BACKSPACE_ON_TEXT_BEGIN_FLAG.length());
    }

    private void openAction() {
        runOnUiThread(() -> {
            editText.requestFocus();
            imm.toggleSoftInput(InputMethodManager.SHOW_FORCED, InputMethodManager.HIDE_IMPLICIT_ONLY);
        });
    }
    public void initialize(EditText editText) {
        this.editText = editText;
        runOnUiThread(() -> setState(BACKSPACE_ON_TEXT_BEGIN_FLAG, BACKSPACE_ON_TEXT_BEGIN_FLAG.length()));



        this.editText.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
            }

            @Override
            public void afterTextChanged(Editable s) {
                Debouncer.debounce("APP", handleEditTextChange, DEBOUNCE);
            }
        });
    }

    private final Runnable handleEditTextChange = new Runnable() {
        @Override
        public void run() {
            if (editText.getText().toString().contains("\n")) {
                Debouncer.debounce("breakLineProcessing", breakLineProcessing, 100);
                return;
            }

            if (cursorState < BACKSPACE_ON_TEXT_BEGIN_FLAG.length()) {
                WritableMap event = Arguments.createMap();
                event.putString("type", "backspaceOnTextBegin");
                setState(withBackspaceOnTextBeginFlag(textState.substring(cursorState)), BACKSPACE_ON_TEXT_BEGIN_FLAG.length());
                sendEvent(event);
                return;
            }
            int cursor = cursorState - BACKSPACE_ON_TEXT_BEGIN_FLAG.length();
            WritableMap event = Arguments.createMap();
            event.putString("type", "changed");
            event.putString("text", withoutBackspaceOnTextBeginFlag(editText.getText().toString()));
            event.putInt("cursor", cursor);
            setState(editText.getText().toString(), editText.getSelectionStart());
            Debouncer.debounce("TEst",() -> {
                sendEvent(event);
            } , DEBOUNCE * 2);

        }
    };

    private final Runnable breakLineProcessing = new Runnable() {
        @Override
        public void run() {
            String text = withoutBackspaceOnTextBeginFlag(editText.getText().toString())
                    .replaceAll("\n+", "\n");
            WritableMap event = Arguments.createMap();

            String[] beforeAndAfter = text.split("\n");
            String before = beforeAndAfter.length > 0 ? beforeAndAfter[0] : "";
            String after = beforeAndAfter.length > 1 ? beforeAndAfter[1] : "";
            setState(withBackspaceOnTextBeginFlag(after), BACKSPACE_ON_TEXT_BEGIN_FLAG.length());
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

    private void setState(@NotNull String text, int cursor) {
        String prevText = textState;
        int prevCursor = cursorState;

        textState = text;
        cursorState = cursor;
        if (!text.equals(prevText)) {
            editText.setText(text);
        }
        if( cursor != prevCursor) {
            editText.setSelection(cursor);
        }
    }
}
