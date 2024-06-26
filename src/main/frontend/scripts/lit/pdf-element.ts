import PDFDocument from "pdfkit";
import blobStream from "blob-stream";
import { LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement('pdf-element')
export class PdfElement extends LitElement {

    private doc;
    private stream;

    constructor() {
        super();

        // create a document the same way as above
        this.doc = new PDFDocument;

        // pipe the document to a blob
        this.stream = this.doc.pipe(blobStream());

        // add your content to the document here, as usual
        // get a blob when you're done
        this.doc.end();
        this.stream.on('finish', () => {
            // get a blob you can do whatever you like with
            const blob = this.stream.toBlob('application/pdf');
            // or get a blob URL for display in the browser
            const url = this.stream.toBlobURL('application/pdf');
        });
    }
}