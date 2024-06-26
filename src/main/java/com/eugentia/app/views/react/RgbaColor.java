package com.eugentia.app.views.react;

public record RgbaColor(int r, int g, int b, double a) {

    @Override
    public String toString() {
        return "{ r: %s, g: %s, b: %s, a: %s }".formatted(r, g, b, a);
    }

}
