import { type ReactElement } from 'react';
import { type RgbaColor, RgbaColorPicker } from "react-colorful";
import { ReactAdapterElement, type RenderHooks } from "Frontend/generated/flow/ReactAdapter";

// tag::class[]
class RgbaColorPickerElement extends ReactAdapterElement {
    protected override render(hooks: RenderHooks): ReactElement | null {
        const [color, setColor] = hooks.useState<RgbaColor>("color");

        return <RgbaColorPicker
            color={color}
            onChange={setColor}
        />;
    }
}

customElements.define("rgba-color-picker", RgbaColorPickerElement);
// end::class[]
