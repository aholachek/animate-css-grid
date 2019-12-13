import { Easing } from '@popmotion/easing';
export interface Coords {
    translateX: number;
    translateY: number;
    scaleX: number;
    scaleY: number;
    [key: string]: number;
}
export interface BoundingClientRect {
    top: number;
    left: number;
    width: number;
    height: number;
}
export interface ChildBoundingClientRect {
    top?: number;
    left?: number;
}
export interface ItemPosition {
    rect: BoundingClientRect;
    gridBoundingClientRect: BoundingClientRect;
    stopTween?: () => void;
}
export interface CachedPositionData {
    [key: string]: ItemPosition;
}
export interface PopmotionEasing {
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
export interface WrapGridArguments {
    duration?: number;
    stagger?: number;
    easing?: keyof PopmotionEasing;
    onStart?: (animatedChildren: HTMLElement[]) => void;
    onEnd?: (animatedChildren: HTMLElement[]) => void;
}
