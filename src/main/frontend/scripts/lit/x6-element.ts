import { Graph } from "@antv/x6";
import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement('x6-element')
export class X6Element extends LitElement {
    static get styles() {
        return css`
            .x6-graph-wrap {
                width: 100%;
                height: 100%;
                padding: 32px 0;
                overflow: auto;
                background-color: #fff;

                > h1 {
                    display: block;
                    width: 800px;
                    margin: 0 auto 32px;
                }
            }

            .x6-graph-tools {
                width: 800px;
                margin: 0 auto 32px;
            }

            .x6-graph {
                width: 100%;
                height: 100%;
                margin: 0 auto;
                box-shadow: 0 0 10px 1px #e9e9e9;
            }

            .x6-node-selected {
                rect {
                    stroke: #1890ff;
                }
            }

            .home {
                width: 800px;
                height: 100%;
                margin: 0 auto;
            }
        `;
    }

    constructor() {
        super();
    }

    connectedCallback() {
        super.connectedCallback();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }

    protected createRenderRoot(): HTMLElement | DocumentFragment {
        return super.createRenderRoot();
    }

    protected firstUpdated() {
        const graph = new Graph({
            container: <HTMLElement>this.renderRoot.querySelector('#container'),
            grid: true,
        });

        const source = graph.addNode({
            x: 300,
            y: 40,
            width: 80,
            height: 40,
            label: 'Hello',
        });

        const target = graph.addNode({
            x: 420,
            y: 180,
            width: 80,
            height: 40,
            label: 'World',
        });

        graph.addEdge({
            source,
            target,
        });
    }

    protected render(): unknown {
        return html`
            <div id="container" style="stroke: black;"></div>
        `;
    }
}
