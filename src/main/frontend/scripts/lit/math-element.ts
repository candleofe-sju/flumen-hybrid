import { tex } from "Frontend/scripts/lib/tex";
import 'katex/dist/katex.css';
import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, property, query } from "lit/decorators.js";

@customElement('math-element')
export class MathElement extends LitElement {
    static styles = css`
        :host {
            display: block;
            height: 100%;
            width: 100%;
            padding: 800px;
        }

        p {
            font-size: var(--lumo-font-size-m);
            width: 100%;
        }

        vaadin-text-area {
            width: 100%;
        }
    `;

    @property()
    text: string = '';

    @query('#container')
    _container!: Element;

    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }

    createRenderRoot() {
        return this;
    }

    updated() {
        tex.renderMathInElement(this._container);
    }

    render(): TemplateResult {
        return html`
            <vaadin-text-area label="Text" @value-changed="${this.textChanged}"></vaadin-text-area>
            <p id="container"></p>
        `;
    }

    private textChanged(event: CustomEvent) {
        this._container.innerHTML = this.text = event.detail.value;
        this.requestUpdate();
    }
}
