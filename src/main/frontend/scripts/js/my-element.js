import { css, html, LitElement } from "lit";

export class MyElement extends LitElement {
    static styles = css`
        #container {
            width: 100%;
            height: 100%;
            max-height: 99%;
            border: 1px solid darkgray;
        }
    `;

    render() {
        return html`
            <div id="container"></div>
        `;
    }
}

customElements.define('my-element', MyElement);