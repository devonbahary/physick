import { Body } from '@physics/Body';
import { applyStyle, toPx } from '@renderer/utilities';

export class Sprite {
    private lastX: number = 0;
    private lastY: number = 0;

    constructor(public body: Body, public element: HTMLElement) {}

    update(): void {
        if (this.body.x !== this.lastX || this.body.y !== this.lastY) {
            applyStyle(this.element, {
                top: toPx(this.body.y),
                left: toPx(this.body.x),
            });

            this.lastX = this.body.x;
            this.lastY = this.body.y;
        }
    }
}
