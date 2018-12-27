import { WrapGridArguments } from "./types";
export declare const wrapGrid: (container: HTMLElement, { duration, stagger, easing }?: WrapGridArguments) => {
    unwrapGrid: () => void;
    forceGridAnimation: () => void;
};
