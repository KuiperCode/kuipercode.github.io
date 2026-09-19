/* ============================================================
   Kuiper Code — gravitational ASCII wave (hero)
   Georgia11 FIGlet art, pre-rendered. A radial wave flows
   through the character grid, bending and lighting the type.
   ============================================================ */

(() => {
    'use strict';

    const stage = document.getElementById('wave-stage');
    const pre = document.getElementById('wave-art');
    const toggle = document.getElementById('wave-toggle');
    if (!stage || !pre) return;

    const ART = {
    wide: [
        "                         ,,                                                             ,,         ",
        "`7MMF' `YMM'             db                                   .g8\"\"\"bgd               `7MM         ",
        "  MM   .M'                                                  .dP'     `M                 MM         ",
        "  MM .d\"   `7MM  `7MM  `7MM `7MMpdMAo.  .gP\"Ya `7Mb,od8     dM'       ` ,pW\"Wq.    ,M\"\"bMM  .gP\"Ya ",
        "  MMMMM.     MM    MM    MM   MM   `Wb ,M'   Yb  MM' \"'     MM         6W'   `Wb ,AP    MM ,M'   Yb",
        "  MM  VMA    MM    MM    MM   MM    M8 8M\"\"\"\"\"\"  MM         MM.        8M     M8 8MI    MM 8M\"\"\"\"\"\"",
        "  MM   `MM.  MM    MM    MM   MM   ,AP YM.    ,  MM         `Mb.     ,'YA.   ,A9 `Mb    MM YM.    ,",
        ".JMML.   MMb.`Mbod\"YML..JMML. MMbmmd'   `Mbmmd'.JMML.         `\"bmmmd'  `Ybmd9'   `Wbmd\"MML.`Mbmmd'",
        "                              MM                                                                   ",
        "                            .JMML.                                                                 "
    ],
    stacked: [
        "                         ,,                            ",
        "`7MMF' `YMM'             db                            ",
        "  MM   .M'                                             ",
        "  MM .d\"   `7MM  `7MM  `7MM `7MMpdMAo.  .gP\"Ya `7Mb,od8",
        "  MMMMM.     MM    MM    MM   MM   `Wb ,M'   Yb  MM' \"'",
        "  MM  VMA    MM    MM    MM   MM    M8 8M\"\"\"\"\"\"  MM    ",
        "  MM   `MM.  MM    MM    MM   MM   ,AP YM.    ,  MM    ",
        ".JMML.   MMb.`Mbod\"YML..JMML. MMbmmd'   `Mbmmd'.JMML.  ",
        "                              MM                       ",
        "                            .JMML.                     ",
        "                                                       ",
        "                                    ,,                 ",
        "          .g8\"\"\"bgd               `7MM                 ",
        "        .dP'     `M                 MM                 ",
        "        dM'       ` ,pW\"Wq.    ,M\"\"bMM  .gP\"Ya         ",
        "        MM         6W'   `Wb ,AP    MM ,M'   Yb        ",
        "        MM.        8M     M8 8MI    MM 8M\"\"\"\"\"\"        ",
        "        `Mb.     ,'YA.   ,A9 `Mb    MM YM.    ,        ",
        "          `\"bmmmd'  `Ybmd9'   `Wbmd\"MML.`Mbmmd'        "
    ]
    };

    const ACCENT = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent').trim() || '#ff9449';
    const BASE = (() => {
        const value = parseInt(ACCENT.replace('#', ''), 16);
        return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
    })();
    const SPEED = 1;
    const CHAR_RATIO = 0.61;      // monospace glyph width / font-size
    const MIN_WIDE_SIZE = 8.5;    // below this, switch to stacked art

    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    let cells = [];
    let layout = '';
    let columns = 0;
    let raf = 0;
    let lastTime = 0;
    let clock = 0;
    let userPaused = reduced.matches;
    let onScreen = true;
    let resizeTimer = 0;

    function available() {
        const style = getComputedStyle(stage);
        return stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    }

    function build(lines) {
        columns = Math.max(...lines.map(line => line.length));
        const rows = lines.length;
        const cx = (columns - 1) / 2;
        const cy = rows + 4;
        const fragment = document.createDocumentFragment();
        cells = [];

        lines.forEach((line, y) => {
            [...line.padEnd(columns)].forEach((character, x) => {
                if (character === ' ') {
                    fragment.appendChild(document.createTextNode(' '));
                    return;
                }
                const span = document.createElement('span');
                span.className = 'glyph';
                span.textContent = character;
                fragment.appendChild(span);
                const dx = x - cx;
                const dy = (y - cy) * 1.9;
                const radius = Math.hypot(dx, dy) || 1;
                cells.push({ el: span, radius, ux: dx / radius, uy: dy / radius });
            });
            if (y < rows - 1) fragment.appendChild(document.createTextNode('\n'));
        });

        pre.replaceChildren(fragment);
    }

    function fit() {
        const width = available();
        const wideSize = width / ART.wide[0].length / CHAR_RATIO;
        const next = wideSize >= MIN_WIDE_SIZE ? 'wide' : 'stacked';
        if (next !== layout) {
            layout = next;
            build(ART[layout]);
        }
        const size = Math.max(5, Math.min(22, width / columns / CHAR_RATIO));
        pre.style.fontSize = `${size}px`;
        paint();
    }

    function paint() {
        for (const cell of cells) {
            const phase = cell.radius * 0.72 - clock * SPEED * 0.0048;
            const crest = Math.pow(0.5 + 0.5 * Math.cos(phase), 5);
            const echo = Math.pow(0.5 + 0.5 * Math.cos(phase * 0.5 + 1.15), 9) * 0.18;
            const shine = Math.min(1, crest * 0.92 + echo);
            const displacement =
                (Math.sin(phase) * 0.72 + Math.sin(phase * 0.5 + 0.8) * 0.2) * (shine * 0.7 + 0.25);
            const dim = 0.3 + shine * 0.7;
            const mix = shine * 0.64;
            const color = BASE.map(channel => Math.round(channel * dim * (1 - mix) + 255 * mix));
            const style = cell.el.style;
            style.color = `rgb(${color.join(',')})`;
            style.fontWeight = String(Math.round(400 + shine * 500));
            style.textShadow = shine > 0.06
                ? `0 0 ${Math.round(2 + shine * 12)}px rgba(${BASE.join(',')},${(0.18 + shine * 0.7).toFixed(2)})`
                : 'none';
            style.left = `${(cell.ux * displacement).toFixed(2)}px`;
            style.top = `${(cell.uy * displacement * 0.52).toFixed(2)}px`;
        }
    }

    function running() {
        return !userPaused && onScreen && !document.hidden;
    }

    function frame(now) {
        raf = 0;
        if (!running()) return;
        if (!lastTime) lastTime = now;
        clock += Math.min(now - lastTime, 50);
        lastTime = now;
        paint();
        raf = requestAnimationFrame(frame);
    }

    function sync() {
        cancelAnimationFrame(raf);
        raf = 0;
        lastTime = 0;
        if (toggle) {
            toggle.textContent = userPaused ? 'Play wave' : 'Pause wave';
            toggle.setAttribute('aria-pressed', String(userPaused));
        }
        if (running()) raf = requestAnimationFrame(frame);
    }

    if (toggle) {
        toggle.addEventListener('click', () => {
            userPaused = !userPaused;
            sync();
        });
    }

    reduced.addEventListener('change', event => {
        userPaused = event.matches;
        sync();
    });

    document.addEventListener('visibilitychange', sync);

    new IntersectionObserver(entries => {
        onScreen = entries[0].isIntersecting;
        sync();
    }).observe(stage);

    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(fit, 100);
    });

    // A static frame mid-wave reads well when motion is reduced.
    if (reduced.matches) clock = 900 / SPEED;
    fit();
    sync();
})();
