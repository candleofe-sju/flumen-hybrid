import { css, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@vaadin/button';
import * as echarts from 'echarts/core';
import { PolarComponent, TitleComponent, TooltipComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { SVGRenderer } from 'echarts/renderers';

echarts.use([
    TitleComponent,
    PolarComponent,
    TooltipComponent,
    BarChart,
    SVGRenderer
]);

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('tangential-polar-bar-element')
export class TangentialPolarBarElement extends LitElement {
    static styles = css`
        :host {
            max-width: 1280px;
            margin: 0 auto;
            padding: 2rem;
            text-align: center;
        }`;

    @property()
    chartDom!: HTMLElement;

    @property()
    myChart!: echarts.EChartsType;

    protected firstUpdated() {
        const chartDom = <HTMLElement>this.renderRoot.querySelector('#container')!;
        const myChart = echarts.init(chartDom, null, {
            renderer: 'svg',
            width: 800,
            height: 600
        });

        var option;

        option = {
            title: [
                {
                    text: 'Tangential Polar Bar Label Position (middle)'
                }
            ],
            polar: {
                radius: [30, '80%']
            },
            angleAxis: {
                max: 4,
                startAngle: 75
            },
            radiusAxis: {
                type: 'category',
                data: ['a', 'b', 'c', 'd']
            },
            tooltip: {},
            series: {
                type: 'bar',
                data: [2, 1.2, 2.4, 3.6],
                coordinateSystem: 'polar',
                label: {
                    show: true,
                    position: 'middle',
                    formatter: '{b}: {c}'
                }
            }
        };


        option && myChart.setOption(option);
    }

    render() {
        return html`
            <div id="container"></div>
        `;
    }
}
