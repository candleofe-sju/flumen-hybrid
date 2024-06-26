export class TeX {
    findEndOfMath(delimiter: any, text: any, startIndex: any): any;

    escapeRegex(string: any): any;

    splitAtDelimiters(text: any, delimiters: any): ({
        type: string;
        data: any;
        rawData?: undefined;
        display?: undefined;
    } | {
        type: string;
        data: any;
        rawData: any;
        display: any;
    })[];

    renderMathInText(text: any, optionsCopy?: any | null): DocumentFragment;

    renderElem(elem: any, optionsCopy?: any | null): void;

    renderMathInElement(elem: any, options?: any | null): void;
}

export const tex: TeX;


