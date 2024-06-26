import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@vaadin/button';

import { SVG } from '@svgdotjs/svg.js';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('svg-element')
export class SvgElement extends LitElement {
    static styles = css`
        :host {
            max-width: 1280px;
            margin: 0 auto;
            padding: 2rem;
            text-align: center;
        }

        ::slotted(h1) {
            font-size: 3.2em;
            line-height: 1.1;
        }

        a {
            font-weight: 500;
            color: #646cff;
            text-decoration: inherit;
        }

        a:hover {
            color: #535bf2;
        }

        button:hover {
            border-color: #646cff;
        }

        button:focus,
        button:focus-visible {
            outline: 4px auto -webkit-focus-ring-color;
        }

        @media (prefers-color-scheme: light) {
            a:hover {
                color: #747bff;
            }

            button {
                background-color: #f9f9f9;
            }
        }
    `;

    /**
     * Copy for the read the docs hint.
     */
    @property()
    docsHint = 'Click on the Vite and Lit logos to learn more'
    /**
     * The number of times the button has been clicked.
     */
    @property({type: Number})
    count = 0

    protected firstUpdated() {
        let element = <HTMLElement>this.renderRoot.querySelector('#container');
        let draw = SVG().addTo(element).viewbox('0 0 90 90');

        let line = draw.line('10 10 90 90').attr({'stroke-dasharray': '2 1'});

        let marker = draw.marker(10, 10, (marker) => {
            marker.path("M 0 0 L 10 5 L 0 10 z");
            marker.orient('auto-start-reverse');
            marker.width(5);
            marker.height(5);
        });

        line.marker('end', marker).stroke('#000');
    }

    render() {
        return html`
            <div id="container"></div>
        `
    }
}
