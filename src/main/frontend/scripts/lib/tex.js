import katex from 'katex';
import 'katex/dist/katex.css';

export class TeX {
    /* eslint no-constant-condition:0 */
    findEndOfMath(delimiter, text, startIndex) {
        // Adapted from
        // https://github.com/Khan/perseus/blob/master/src/perseus-markdown.jsx
        let index = startIndex;
        let braceLevel = 0;
        const delimLength = delimiter.length;

        while (index < text.length) {
            const character = text[index];

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

    escapeRegex(string) {
        return string.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
    };

    splitAtDelimiters(text, delimiters) {
        const data = [];
        let index = 0;
        const regexLeft = new RegExp("(" + delimiters.map(x => this.escapeRegex(x.left)).join("|") + ")");
        const amsRegex = /^\\begin{/;

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


            const i = delimiters.findIndex(delim => text.startsWith(delim.left));
            const delimiter = delimiters[i];
            const left = delimiter.left;
            const right = delimiter.right;
            index = this.findEndOfMath(right, text, left.length);

            if (index === -1) {
                break;
            }

            const rawData = text.slice(0, index + right.length);

            const math = amsRegex.test(rawData) ? rawData : text.slice(left.length, index);
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
    renderMathInText(text, optionsCopy) {
        const data = this.splitAtDelimiters(text, optionsCopy.delimiters);
        if (data.length === 1 && data[0].type === 'text') {
            // There is no formula in the text.
            // Let's return null which means there is no need to replace
            // the current text node with a new one.
            return null;
        }

        const fragment = document.createDocumentFragment();

        for (let i = 0; i < data.length; i++) {
            if (data[i].type === "text") {
                fragment.appendChild(document.createTextNode(data[i].data));
            } else {
                const span = document.createElement("span");
                let math = data[i].data;
                // Override any display mode defined in the settings with that
                // defined by the text itself
                optionsCopy.displayMode = data[i].display;
                try {
                    katex.render(math, span, optionsCopy);
                } catch (e) {
                    if (!(e instanceof katex.ParseError)) {
                        throw e;
                    }

                    fragment.appendChild(document.createTextNode(data[i].rawData));
                    continue;
                }

                fragment.appendChild(span);
            }
        }

        return fragment;
    };

    renderElem(elem, optionsCopy) {
        for (let i = 0; i < elem.childNodes.length; i++) {
            const childNode = elem.childNodes[i];
            if (childNode.nodeType === 3) {
                // Text node
                // Concatenate all sibling text nodes.
                // Webkit browsers split very large text nodes into smaller ones,
                // so the delimiters may be split across different nodes.
                let textContentConcat = childNode.textContent;
                let sibling = childNode.nextSibling;
                let nSiblings = 0;
                while (sibling && (sibling.nodeType === Node.TEXT_NODE)) {
                    if (sibling.textContent != null) textContentConcat += sibling.textContent;
                    sibling = sibling.nextSibling;
                    nSiblings++;
                }

                const frag = this.renderMathInText(textContentConcat, optionsCopy);
                if (frag) {
                    // Remove extra text nodes
                    for (let j = 0; j < nSiblings; j++) {
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
                const ignoredTags = optionsCopy.ignoredTags;
                const shouldRender = ignoredTags.indexOf(childNode.nodeName.toLowerCase()) === -1;

                if (shouldRender) {
                    this.renderElem(childNode, optionsCopy);
                }
            }
            // Otherwise, it's something else, and ignore it.
        }
    }

    renderMathInElement(elem, options) {
        if (!elem) {
            throw new Error("No element provided to render");
        }

        // Object.assign(optionsCopy, option)
        const optionsCopy = Object.assign({}, options);

        // default options
        optionsCopy.delimiters = optionsCopy.delimiters || [
            { left: "$$", right: "$$", display: true },
            { left: "$", right: "$", display: false },
            { left: "\\(", right: "\\)", display: false },
            // LaTeX uses $…$, but it ruins the display of normal `$` in text:
            // {left: "$", right: "$", display: false},
            // $ must come after $$

            // Render AMS environments even if outside $$…$$ delimiters.
            { left: "\\begin{equation}", right: "\\end{equation}", display: true },
            { left: "\\begin{align}", right: "\\end{align}", display: true },
            { left: "\\begin{alignat}", right: "\\end{alignat}", display: true },
            { left: "\\begin{gather}", right: "\\end{gather}", display: true },
            { left: "\\begin{CD}", right: "\\end{CD}", display: true },

            { left: "\\[", right: "\\]", display: true },
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
}

export const tex = new TeX();
