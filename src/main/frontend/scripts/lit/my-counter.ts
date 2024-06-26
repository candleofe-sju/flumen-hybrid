import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement('my-counter')
export class MyCounter extends LitElement {
    static properties = {
        count: {type: Number}
    };

    static styles = css`
        :host {
            justify-self: center;
        }

        span {
            width: 4rem;
            display: inline-block;
            text-align: center;
        }

        button {
            width: 32px;
            height: 32px;
            border: none;
            border-radius: 2px;
            background-color: seagreen;
            color: white;
        }
    `;

    @property()
    count: number;

    constructor() {
        super();
        this.count = 0;
    }

    inc() {
        this.count++;
    }

    dec() {
        this.count--;
    }

    render() {
        return html`
            <button @click="${this.dec}">-</button>
            <span>${this.count}</span>
            <button @click="${this.inc}">+</button>
        `;
    }
}
