import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement('simple-greeting')
export class SimpleGreeting extends LitElement {
    @property({type: String, reflect: true})
    name: String = 'Everybody';

    createRenderRoot() {
        return this;
    }

    render() {
        return html`<H1>Hello ${this.name}</H1>`;
    }
}
