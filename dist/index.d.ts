import { WrapGridArguments } from './types';
export declare const wrapGrid: (container: HTMLElement, { duration, stagger, easing, onStart, onEnd, containerScroll, }?: WrapGridArguments) => {
    unwrapGrid: () => void;
    forceGridAnimation: () => void;
};
