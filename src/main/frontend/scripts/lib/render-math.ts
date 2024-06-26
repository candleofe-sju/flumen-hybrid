import { property } from "lit/decorators.js";
import katex from "katex";
import 'katex/dist/katex.css';
import { DataType, Delimiter, Option } from "Frontend/scripts/lib/interfaces";

export class Katex {

    @property()
    text: string = '';

    @property()
    latex: string = '';

    option: Option = {
        delimiters: [
            {left: "$$", right: "$$", display: true},
            {left: "$", right: "$", display: false},
            {left: "\\(", right: "\\)", display: false},
            // LaTeX uses $…$, but it ruins the display of normal `$` in text:
            // {left: "$", right: "$", display: false},
            // $ must come after $$
            // Render AMS environments even if outside $$…$$ delimiters.
            {left: "\\begin{equation}", right: "\\end{equation}", display: true},
            {left: "\\begin{align}", right: "\\end{align}", display: true},
            {left: "\\begin{alignat}", right: "\\end{alignat}", display: true},
            {left: "\\begin{gather}", right: "\\end{gather}", display: true},
            {left: "\\begin{CD}", right: "\\end{CD}", display: true},
            {left: "\\[", right: "\\]", display: true}],
        ignoredClasses: [],
        ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code", "option"],
        // Enable sharing of global macros defined via `\gdef` between different
        // math elements within a single call to `renderMathInElement`.
        macros: {}
    };

    public renderMathInElement(elem: Element, options: Option): void {
        if (!elem) {
            throw new Error("No element provided to render");
        }

        // Object.assign(optionsCopy, option)
        const optionsCopy: Option = Object.assign({}, options);

        // default options
        optionsCopy.delimiters = optionsCopy.delimiters || [
            {left: "$$", right: "$$", display: true},
            {left: "$", right: "$", display: true},
            {left: "\\(", right: "\\)", display: false},
            // LaTeX uses $…$, but it ruins the display of normal `$` in text:
            // {left: "$", right: "$", display: false},
            // $ must come after $$

            // Render AMS environments even if outside $$…$$ delimiters.
            {left: "\\begin{equation}", right: "\\end{equation}", display: true},
            {left: "\\begin{align}", right: "\\end{align}", display: true},
            {left: "\\begin{alignat}", right: "\\end{alignat}", display: true},
            {left: "\\begin{gather}", right: "\\end{gather}", display: true},
            {left: "\\begin{CD}", right: "\\end{CD}", display: true},

            {left: "\\[", right: "\\]", display: true},
        ];

        optionsCopy.ignoredTags = optionsCopy.ignoredTags || [
            "script", "noscript", "style", "textarea", "pre", "code", "option",
        ];
        optionsCopy.ignoredClasses = optionsCopy.ignoredClasses || [];

        // Enable sharing of global macros defined via `\gdef` between different
        // math elements within a single call to `renderMathInElement`.
        optionsCopy.macros = optionsCopy.macros || {};

        this.renderElem(elem, optionsCopy);
    }

    /* eslint no-constant-condition:0 */
    private findEndOfMath(delimiter: string, text: string, startIndex: any) {
        // Adapted from
        // https://github.com/Khan/perseus/blob/master/src/perseus-markdown.jsx
        let index = startIndex;
        let braceLevel: number = 0;
        const delimLength: number = delimiter.length;

        while (index < text.length) {
            const character: string = text[index];

            if (braceLevel <= 0 && text.slice(index, index + delimLength) === delimiter) {
                return index;
            } else if (character === "\\") {
                index++;
            } else if (character === "{") {
                braceLevel++;
            } else if (character === "}") {
                braceLevel--;
            }

            index++;
        }

        return -1;
    };

    private escapeRegex(string: string): string {
        return string.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    };

    private splitAtDelimiters(text: string, delimiters: Delimiter[]): DataType[] {
        const data: DataType[] = [];
        let index: number = 0;
        const regexLeft: RegExp = new RegExp("(" + delimiters.map(x => this.escapeRegex(x.left)).join("|") + ")");
        const amsRegex: RegExp = /^\\begin{/;

        while (true) {
            index = text.search(regexLeft);

            if (index === -1) {
                break;
            }

            if (index > 0) {
                data.push({
                    type: "text",
                    data: text.slice(0, index)
                });
                text = text.slice(index); // now text starts with delimiter
            } // ... so this always succeeds:


            const i: number = delimiters.findIndex(delim => text.startsWith(delim.left));
            const delimiter: Delimiter = delimiters[i];
            const left: string = delimiter.left;
            const right: string = delimiter.right;
            index = this.findEndOfMath(right, text, left.length);

            if (index === -1) {
                break;
            }

            const rawData: string = text.slice(0, index + right.length);

            const math: string = amsRegex.test(rawData) ? rawData : text.slice(left.length, index);
            data.push({
                type: "math",
                data: math,
                rawData: rawData,
                display: delimiter.display
            });
            text = text.slice(index + right.length);
        }

        if (text !== "") {
            data.push({
                type: "text",
                data: text
            });
        }

        return data;
    };

    /* Note: optionsCopy is mutated by this method. If it is ever exposed in the
     * API, we should copy it before mutating.
     */
    private renderMathInText(text: string, optionsCopy: Option): DocumentFragment | null {
        const data: DataType[] = this.splitAtDelimiters(text, optionsCopy.delimiters as Delimiter[]);
        if (data.length === 1 && data[0].type === 'text') {
            // There is no formula in the text.
            // Let's return null which means there is no need to replace
            // the current text node with a new one.
            return null;
        }

        const fragment: DocumentFragment = document.createDocumentFragment();

        for (let i: number = 0; i < data.length; i++) {
            if (data[i].type === "text") {
                fragment.appendChild(document.createTextNode(data[i].data));
            } else {
                const span: HTMLSpanElement = document.createElement("span");
                let math: string = data[i].data;
                // Override any display mode defined in the settings with that
                // defined by the text itself
                optionsCopy.displayMode = data[i].display;
                try {
                    katex.render(math, span, optionsCopy);
                } catch (e) {
                    if (!(e instanceof katex.ParseError)) {
                        throw e;
                    }

                    fragment.appendChild(document.createTextNode(data[i].rawData as string));
                    continue;
                }
                fragment.appendChild(span);
            }
        }

        return fragment;
    };

    private renderElem(elem: Element, optionsCopy: Option): void {
        for (let i: number = 0; i < elem.childNodes.length; i++) {
            const childNode: ChildNode = elem.childNodes[i];
            if (childNode.nodeType === 3) {
                // Text node
                // Concatenate all sibling text nodes.
                // Webkit browsers split very large text nodes into smaller ones,
                // so the delimiters may be split across different nodes.
                let textContentConcat: string | null = childNode.textContent;
                let sibling: ChildNode | null = childNode.nextSibling;
                let nSiblings: number = 0;
                while (sibling && (sibling.nodeType === Node.TEXT_NODE)) {
                    if (sibling.textContent != null) textContentConcat += sibling.textContent;
                    sibling = sibling.nextSibling;
                    nSiblings++;
                }
                const frag: DocumentFragment | null = this.renderMathInText(textContentConcat as string, optionsCopy);
                if (frag) {
                    // Remove extra text nodes
                    for (let j: number = 0; j < nSiblings; j++) {
                        if (childNode.nextSibling != null) childNode.nextSibling.remove();
                    }
                    i += frag.childNodes.length - 1;
                    elem.replaceChild(frag, childNode);
                } else {
                    // If the concatenated text does not contain math
                    // the siblings will not either
                    i += nSiblings;
                }
            } else if (childNode.nodeType === 1) {
                // Element node
                const ignoredTags: string[] = optionsCopy.ignoredTags as string[];
                const shouldRender: boolean = ignoredTags.indexOf(childNode.nodeName.toLowerCase()) === -1;

                if (shouldRender) {
                    this.renderElem(childNode as Element, optionsCopy);
                }
            }
            // Otherwise, it's something else, and ignore it.
        }
    }
}
