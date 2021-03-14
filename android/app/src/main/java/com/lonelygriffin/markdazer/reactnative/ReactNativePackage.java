package com.lonelygriffin.markdazer.reactnative;
import android.widget.EditText;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class ReactNativePackage implements ReactPackage {
    private EditText editText;
    private SoftwareKeyboardService softwareKeyboardService;
    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
    @Override
    public List<NativeModule> createNativeModules(
            ReactApplicationContext reactContext) {
        List<NativeModule> modules = new ArrayList<>();
        this.softwareKeyboardService = new SoftwareKeyboardService(reactContext);
        if (this.editText != null) {
            this.softwareKeyboardService.initialize(this.editText);
        }
        modules.add(this.softwareKeyboardService);

        return modules;
    }

    public void initialize(EditText editText) {
        this.editText = editText;
        if (this.softwareKeyboardService != null) {
            this.softwareKeyboardService.initialize(editText);
        }
    }
}
