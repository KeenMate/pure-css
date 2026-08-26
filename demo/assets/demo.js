/* =============================================================================
   pure-css showcase — demo chrome behaviour (no framework, plain ES module-ish)
   -----------------------------------------------------------------------------
   - Injects the shared top nav and marks the current page.
   - Adds copy-to-clipboard buttons to code blocks.
   - Staggered entrance reveal via IntersectionObserver.
   - Theming playground: any [data-theme-var] control writes CSS custom
     properties onto <html>, re-theming every live .demo-stage at once. Presets
     and the choice persist in localStorage.

   Not part of @keenmate/pure-css — dev-only site chrome.
   ========================================================================== */
(function () {
    "use strict";

    var PAGES = [
        { file: "index.html",       label: "Overview" },
        { file: "theming.html",     label: "Theming" },
        { file: "grid.html",        label: "Grid" },
        { file: "utilities.html",   label: "Utilities" },
        { file: "typography.html",  label: "Typography" },
        { file: "colors.html",      label: "Colors" },
        { file: "scrollbars.html",  label: "Scrollbars" }
    ];

    var STORAGE_KEY = "pure-css-demo-theme";

    function currentFile() {
        var parts = location.pathname.split("/");
        var last = parts[parts.length - 1];
        return last === "" ? "index.html" : last;
    }

    /* ---- nav ------------------------------------------------------------- */
    function buildNav() {
        var nav = document.querySelector("nav[data-demo-nav]");
        if (!nav) return;
        var here = currentFile();
        PAGES.forEach(function (p) {
            var a = document.createElement("a");
            a.href = "/demo/" + p.file;
            a.textContent = p.label;
            if (p.file === here) a.setAttribute("aria-current", "page");
            nav.appendChild(a);
        });
    }

    /* ---- copy buttons ---------------------------------------------------- */
    function buildCopyButtons() {
        document.querySelectorAll(".demo-code").forEach(function (block) {
            var pre = block.querySelector("pre");
            if (!pre) return;
            var btn = document.createElement("button");
            btn.className = "demo-copy";
            btn.type = "button";
            btn.textContent = "Copy";
            btn.addEventListener("click", function () {
                var text = pre.innerText;
                var done = function () {
                    btn.textContent = "Copied";
                    btn.classList.add("is-copied");
                    setTimeout(function () {
                        btn.textContent = "Copy";
                        btn.classList.remove("is-copied");
                    }, 1400);
                };
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(done, done);
                } else {
                    done();
                }
            });
            block.appendChild(btn);
        });
    }

    /* ---- reveal ---------------------------------------------------------- */
    function buildReveal() {
        var els = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
        if (!("IntersectionObserver" in window) || !els.length) {
            els.forEach(function (el) { el.classList.add("is-in"); });
            return;
        }
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                var el = entry.target;
                var delay = parseInt(el.getAttribute("data-reveal-delay") || "0", 10);
                el.style.transitionDelay = delay + "ms";
                el.classList.add("is-in");
                io.unobserve(el);
            });
        }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
        els.forEach(function (el) { io.observe(el); });
    }

    /* ---- theming playground --------------------------------------------- */
    var PRESETS = {
        default: {},
        midnight: {
            "--pc-main-bg": "#0f172a",
            "--pc-page-bg": "#0f172a",
            "--pc-subtle-bg": "#1e293b",
            "--pc-text-color-1": "#e2e8f0",
            "--pc-text-color-2": "#94a3b8",
            "--pc-accent": "#38bdf8",
            "--base-accent-color": "#38bdf8",
            "--base-border-color": "#334155"
        },
        emerald: {
            "--pc-accent": "#10b981",
            "--base-accent-color": "#10b981",
            "--pc-main-bg": "#f6fbf8",
            "--pc-subtle-bg": "#ffffff",
            "--base-border-color": "#cfe8dc"
        },
        grape: {
            "--pc-accent": "#7c3aed",
            "--base-accent-color": "#7c3aed",
            "--pc-main-bg": "#faf7ff",
            "--pc-subtle-bg": "#ffffff",
            "--base-border-color": "#e4d8fb"
        }
    };

    function applyVars(map) {
        var root = document.documentElement;
        Object.keys(map).forEach(function (name) {
            root.style.setProperty(name, map[name]);
        });
    }

    function clearVars() {
        var root = document.documentElement;
        // Remove every --pc-*/--base-* inline override we may have set.
        var known = {};
        Object.keys(PRESETS).forEach(function (k) {
            Object.keys(PRESETS[k]).forEach(function (n) { known[n] = true; });
        });
        document.querySelectorAll("[data-theme-var]").forEach(function (ctrl) {
            ctrl.getAttribute("data-theme-var").split(",").forEach(function (n) {
                known[n.trim()] = true;
            });
        });
        Object.keys(known).forEach(function (n) { root.style.removeProperty(n); });
    }

    function persist(map) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(map)); } catch (e) {}
    }
    function restore() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    }

    function collectFromInlineStyles() {
        // Snapshot the currently-set inline custom properties so we can persist.
        var root = document.documentElement;
        var out = {};
        for (var i = 0; i < root.style.length; i++) {
            var name = root.style[i];
            if (name.indexOf("--pc-") === 0 || name.indexOf("--base-") === 0) {
                out[name] = root.style.getPropertyValue(name).trim();
            }
        }
        return out;
    }

    function syncControlsFromComputed() {
        var cs = getComputedStyle(document.documentElement);
        document.querySelectorAll("[data-theme-var]").forEach(function (ctrl) {
            var first = ctrl.getAttribute("data-theme-var").split(",")[0].trim();
            var val = cs.getPropertyValue(first).trim();
            if (val && /^#|^rgb/.test(val) && ctrl.type === "color") {
                ctrl.value = toHex(val);
            }
        });
    }

    function toHex(color) {
        if (color[0] === "#") return color;
        var m = color.match(/\d+/g);
        if (!m) return "#000000";
        return "#" + m.slice(0, 3).map(function (n) {
            var h = parseInt(n, 10).toString(16);
            return h.length === 1 ? "0" + h : h;
        }).join("");
    }

    function buildPlayground() {
        var controls = document.querySelectorAll("[data-theme-var]");
        var presetBtns = document.querySelectorAll("[data-theme-preset]");
        var resetBtn = document.querySelector("[data-theme-reset]");
        if (!controls.length && !presetBtns.length) return;

        // Restore any saved theme first, then reflect it back onto the controls.
        var saved = restore();
        if (saved) applyVars(saved);
        syncControlsFromComputed();

        controls.forEach(function (ctrl) {
            var vars = ctrl.getAttribute("data-theme-var").split(",").map(function (s) {
                return s.trim();
            });
            var handler = function () {
                var map = {};
                vars.forEach(function (n) { map[n] = ctrl.value; });
                applyVars(map);
                persist(collectFromInlineStyles());
            };
            ctrl.addEventListener("input", handler);
            ctrl.addEventListener("change", handler);
        });

        presetBtns.forEach(function (btn) {
            btn.addEventListener("click", function () {
                var name = btn.getAttribute("data-theme-preset");
                clearVars();
                if (name !== "default") applyVars(PRESETS[name] || {});
                persist(collectFromInlineStyles());
                syncControlsFromComputed();
                presetBtns.forEach(function (b) { b.removeAttribute("aria-pressed"); });
                btn.setAttribute("aria-pressed", "true");
            });
        });

        if (resetBtn) {
            resetBtn.addEventListener("click", function () {
                clearVars();
                persist({});
                syncControlsFromComputed();
                presetBtns.forEach(function (b) { b.removeAttribute("aria-pressed"); });
            });
        }
    }

    function init() {
        buildNav();
        buildCopyButtons();
        buildPlayground();
        buildReveal();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
