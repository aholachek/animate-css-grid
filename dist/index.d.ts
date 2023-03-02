import { Easing } from "@popmotion/easing";
interface PopmotionEasing {
    linear: Easing;
    easeIn: Easing;
    easeOut: Easing;
    easeInOut: Easing;
    circIn: Easing;
    circOut: Easing;
    circInOut: Easing;
    backIn: Easing;
    backOut: Easing;
    backInOut: Easing;
    anticipate: Easing;
}
interface WrapGridArguments {
    duration?: number;
    stagger?: number;
    easing?: keyof PopmotionEasing;
    onStart?: (animatedChildren: HTMLElement[]) => void;
    onEnd?: (animatedChildren: HTMLElement[]) => void;
}
export const wrapGrid: (container: HTMLElement, { duration, stagger, easing, onStart, onEnd, }?: WrapGridArguments) => {
    unwrapGrid: () => void;
    forceGridAnimation: () => void;
};

//# sourceMappingURL=index.d.ts.map
