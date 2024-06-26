import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { html, LitElement } from "lit";

export class EditorElement extends LitElement {

    constructor() {
        super();
    }

    createRenderRoot() {
        return super.createRenderRoot();
    }

    firstUpdated() {
        ClassicEditor.create(this.renderRoot.querySelector('#editor'))
            .then((editor) => {
                window.editor = editor;
            })
            .catch((err) => {
                console.error(err.stack);
            });
    }

    render() {
        return html`
            <textarea name="content" id="editor">
              &lt;p&gt;This is some sample content.&lt;/p&gt;
            </textarea>
        `;
    }
}

customElements.define("editor-element", EditorElement);