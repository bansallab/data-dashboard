import { html } from "npm:htl";
import * as Inputs from "npm:@observablehq/inputs";

// from: https://observablehq.com/@mbostock/scrubber
export default function Scrubber(
    values,
    {
        format = (value) => value,
        initial = 0,
        direction = 1,
        delay = null,
        autoplay = true,
        loop = true,
        loopDelay = null,
        alternate = false,
    } = {}
) {
    // values = Array.from(values);
    const form = html`<form class="scrubber-form">
        <button
            name="play_pause"
            type="button"
            class="play-pause-button"
        ></button>
        <label>
            <span class="scrubber-label">${values[0]}</span>
            <input
                name="i"
                type="range"
                min="0"
                max=${values.length - 1}
                value=${initial}
                step="1"
            />
            <span class="scrubber-label">${values[values.length - 1]}</span>
            <output name="o"></output>
        </label>
    </form>`;

    // from Bootstrap
    const playButton = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="18" fill="currentColor" class="play-pause-icon" viewBox="0 0 16 16">
        <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
    </svg>`;
    const pauseButton = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="18" fill="currentColor" class="play-pause-icon" viewBox="0 0 16 16">
        <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/>
    </svg>`;

    let frame = null;
    let timer = null;
    let interval = null;

    function start() {
        form.play_pause.innerHTML = pauseButton;
        if (delay === null) frame = requestAnimationFrame(tick);
        else interval = setInterval(tick, delay);
    }

    function stop() {
        form.play_pause.innerHTML = playButton;
        if (frame !== null) cancelAnimationFrame(frame), (frame = null);
        if (timer !== null) clearTimeout(timer), (timer = null);
        if (interval !== null) clearInterval(interval), (interval = null);
    }

    function running() {
        return frame !== null || timer !== null || interval !== null;
    }

    function tick() {
        if (
            form.i.valueAsNumber ===
            (direction > 0 ? values.length - 1 : direction < 0 ? 0 : NaN)
        ) {
            if (!loop) {
                return stop();
            }
            if (alternate) {
                direction = -direction;
            }
            if (loopDelay !== null) {
                if (frame !== null) {
                    cancelAnimationFrame(frame), (frame = null);
                }
                if (interval !== null) {
                    clearInterval(interval), (interval = null);
                }
                timer = setTimeout(() => (step(), start()), loopDelay);

                return;
            }
        }
        if (delay === null) {
            frame = requestAnimationFrame(tick);
        }
        step();
    }

    function step() {
        form.i.valueAsNumber =
            (form.i.valueAsNumber + direction + values.length) % values.length;
        form.i.dispatchEvent(new CustomEvent("input", { bubbles: true }));
    }

    form.i.oninput = (event) => {
        if (event && event.isTrusted && running()) {
            stop();
        }
        form.value = values[form.i.valueAsNumber];
        // form.o.value = format(form.value, form.i.valueAsNumber, values);
    };
    form.play_pause.onclick = () => {
        if (running()) {
            return stop();
        }
        direction =
            alternate && form.i.valueAsNumber === values.length - 1 ? -1 : 1;
        form.i.valueAsNumber =
            (form.i.valueAsNumber + direction) % values.length;
        form.i.dispatchEvent(new CustomEvent("input", { bubbles: true }));
        start();
    };
    form.i.oninput();

    if (autoplay) {
        start();
    } else {
        stop();
    }

    Inputs.disposal(form).then(stop);

    return form;
}
