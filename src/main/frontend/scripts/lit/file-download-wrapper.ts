import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement('file-download-wrapper')
export class FileDownloadWrapper extends LitElement {
    static get is() {
        return "file-download-wrapper";
    }

    static get properties() {
        return {
            // Declare your properties here.
        };
    }

    render() {
        return html`
            <a id="download-link"></a>
        `;
    }

    createRenderRoot() {
        // Do not use a shadow root
        return this;
    }
}