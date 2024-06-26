import { KatexOptions } from "katex";

export interface Delimiter {
    left: string,
    right: string,
    display: boolean
}

export interface Option extends KatexOptions {
    delimiters?: Delimiter[],
    ignoredClasses?: string[],
    ignoredTags?: string[]
}

export interface DataType {
    type: string,
    data: string,
    rawData?: string,
    display?: boolean
}