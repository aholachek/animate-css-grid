import { WrapGridArguments } from './types';
export declare const wrapGrid: (container: HTMLElement, { duration, stagger, easing, onStart, onEnd, }?: WrapGridArguments) => {
    unwrapGrid: () => void;
    forceGridAnimation: () => void;
};
