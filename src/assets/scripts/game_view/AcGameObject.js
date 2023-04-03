const AC_GAME_OBJECTS = [];

export class AcGameObject {
    constructor() {
        AC_GAME_OBJECTS.push(this);
        this.timedelta = 0;
        this.has_called_start = false;
        this.uuid = this.create_uuid();
    }

    create_uuid() {
        let res = "";
        for (let i = 0; i < 20; i++) {
            let x = parseInt(Math.floor(Math.random() * 10));
            res += x;
        }
        return res;
    }

    start() {

    }

    update() {

    }

    late_update() {

    }

    late_late_update() {

    }

    health_bar_update() {

    }

    on_destroy() {

    }

    destroy() {
        this.on_destroy();

        for (let i in AC_GAME_OBJECTS) {
            const obj = AC_GAME_OBJECTS[i];
            if (obj === this) {
                AC_GAME_OBJECTS.splice(i, 1);
                break;
            }
        }
    }
}

let last_timestamp;
const step = timestamp => {
    for (let obj of AC_GAME_OBJECTS) {
        if (!obj.has_called_start) {
            obj.start();
            obj.has_called_start = true;
        } else {
            obj.timedelta = timestamp - last_timestamp;
            obj.update();
        }
    }

    for (let obj of AC_GAME_OBJECTS) {
        obj.late_update();
    }

    for (let obj of AC_GAME_OBJECTS) {
        obj.late_late_update();
    }

    for (let obj of AC_GAME_OBJECTS) {
        obj.health_bar_update();
    }

    last_timestamp = timestamp;
    requestAnimationFrame(step);
};

requestAnimationFrame(step);