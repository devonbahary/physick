import { Body } from '@physics/Body';

export class Sprite {
    constructor(public body: Body, public element: HTMLElement) {
        this.addListeners();
    }

    private addListeners(): void {
        this.element.addEventListener('click', () => {
            console.log(this.body);
        });
    }
}
