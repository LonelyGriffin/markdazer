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
    private final SoftwareKeyboardTextWatcher textWatcher;

    // dot because its separate sentences and in this way affect keyboard autocompletion right
    private final String BACKSPACE_ON_TEXT_BEGIN_FLAG = ".";

    SoftwareKeyboardService(ReactApplicationContext context) {
        super(context);
        this.context = context;
        this.imm = (InputMethodManager) this.context.getSystemService(Context.INPUT_METHOD_SERVICE);
        this.textWatcher = new SoftwareKeyboardTextWatcher(handleEditTextChange);
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
        setEditTextState(withBackspaceOnTextBeginFlag(action.getString("text")),action.getInt("cursor") + BACKSPACE_ON_TEXT_BEGIN_FLAG.length());
    }

    private void openAction() {
        runOnUiThread(() -> {
            editText.requestFocus();
            imm.toggleSoftInput(InputMethodManager.SHOW_FORCED, InputMethodManager.HIDE_IMPLICIT_ONLY);
        });
    }
    public void initialize(EditText editText) {
        this.editText = editText;
        this.editText.addTextChangedListener(textWatcher);
        runOnUiThread(() -> setEditTextState(BACKSPACE_ON_TEXT_BEGIN_FLAG, BACKSPACE_ON_TEXT_BEGIN_FLAG.length()));
    }

    private final Runnable handleEditTextChange = new Runnable() {
        @Override
        public void run() {
            int cursorState = editText.getSelectionStart();
            String textState = editText.getText().toString();

            if (editText.getText().toString().contains("\n")) {
                breakLineProcessing.run();
                return;
            }

            if (cursorState < BACKSPACE_ON_TEXT_BEGIN_FLAG.length()) {
                WritableMap event = Arguments.createMap();
                event.putString("type", "backspaceOnTextBegin");
                setEditTextState(withBackspaceOnTextBeginFlag(textState.substring(cursorState)), BACKSPACE_ON_TEXT_BEGIN_FLAG.length());
                sendEvent(event);
                return;
            }
            int cursor = cursorState - BACKSPACE_ON_TEXT_BEGIN_FLAG.length();
            WritableMap event = Arguments.createMap();
            event.putString("type", "changed");
            event.putString("text", withoutBackspaceOnTextBeginFlag(editText.getText().toString()));
            event.putInt("cursor", cursor);
            setEditTextState(editText.getText().toString(), editText.getSelectionStart());
            sendEvent(event);

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
            setEditTextState(withBackspaceOnTextBeginFlag(after), BACKSPACE_ON_TEXT_BEGIN_FLAG.length());
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

    private void setEditTextState(String text, int cursor) {
        editText.removeTextChangedListener(textWatcher);
        editText.setText(text);
        editText.setSelection(cursor);
        editText.addTextChangedListener(textWatcher);
    }
}
