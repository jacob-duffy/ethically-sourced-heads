import { buildMVP } from "./lib/math.js";
import {
    createProgram,
    uploadTexture,
    buildHeadGeometry,
    buildHatGeometry,
    drawBuffers,
    freeBuffers,
} from "./lib/gl-utils.js";

// Hover rotation speed: 30°/sec clockwise
const HOVER_ROTATION_SPEED = 30 * (Math.PI / 180);

// Initial angles for preview mode — slight offset so the head looks 3D at a glance
const PREVIEW_INITIAL_YAW   =  0.4;
const PREVIEW_INITIAL_PITCH =  0.15;

/**
 * Reusable WebGL Minecraft head preview component.
 *
 * Usage:
 *   const viewer = new HeadPreviewComponent(canvasEl, textureUrl, { mode: 'preview' });
 *   // later:
 *   viewer.destroy();
 *
 * Modes:
 *   'preview'  — Fixed initial angle. On mouse hover, head rotates clockwise.
 *   'expanded' — Full 360° interactive rotation via mouse/touch drag.
 *
 * Falls back to a static <img> tag if WebGL is unavailable or the texture fails to load.
 */
export class HeadPreviewComponent {
    /**
     * @param {HTMLCanvasElement} canvas
     * @param {string} textureUrl
     * @param {{ mode?: 'preview'|'expanded' }} [options]
     */
    constructor(canvas, textureUrl, options = {}) {
        this.canvas     = canvas;
        this.textureUrl = textureUrl;
        this.mode       = options.mode ?? "preview";

        /** @private */ this._gl           = null;
        /** @private */ this._program      = null;
        /** @private */ this._texture      = null;
        /** @private */ this._headBuffers  = null;
        /** @private */ this._hatBuffers   = null;
        /** @private */ this._animId       = null;
        /** @private */ this._lastTime     = null;
        /** @private */ this._rotating     = false;
        /** @private */ this._drag         = null;
        /** @private */ this._fallbackImg  = null;

        this._yaw   = this.mode === "preview" ? PREVIEW_INITIAL_YAW   : 0;
        this._pitch = this.mode === "preview" ? PREVIEW_INITIAL_PITCH : 0;

        // Bind listener references so they can be removed later
        this._onMouseEnter  = ()  => this.startHoverRotation();
        this._onMouseLeave  = ()  => this.stopHoverRotation();
        this._onMouseDown   = (e) => this._handleMouseDown(e);
        this._onMouseMove   = (e) => this._handleMouseMove(e);
        this._onMouseUp     = ()  => this._handleMouseUp();
        this._onTouchStart  = (e) => this._handleTouchStart(e);
        this._onTouchMove   = (e) => this._handleTouchMove(e);
        this._onTouchEnd    = ()  => this._handleMouseUp();

        this._init();
    }

    // ─── Initialisation ───────────────────────────────────────────────────────

    /** @private */
    _init() {
        const gl =
            this.canvas.getContext("webgl") ||
            this.canvas.getContext("experimental-webgl");

        if (!gl) {
            this._fallback();
            return;
        }
        this._gl = gl;

        try {
            this._program = createProgram(gl);
        } catch {
            this._fallback();
            return;
        }

        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const texW = img.naturalWidth  || 64;
            const texH = img.naturalHeight || 64;
            this._texture     = uploadTexture(gl, img);
            this._headBuffers = buildHeadGeometry(gl, texW, texH);
            this._hatBuffers  = buildHatGeometry(gl, texW, texH);
            this._startLoop();
            this._attachEvents();
        };
        img.onerror = () => this._fallback();
        img.src = this.textureUrl;
    }

    /** @private */
    _fallback() {
        const img = document.createElement("img");
        img.src = this.textureUrl;
        img.crossOrigin = "anonymous";
        img.style.cssText = `width:${this.canvas.width}px;height:${this.canvas.height}px;image-rendering:pixelated;`;
        this.canvas.style.display = "none";
        this.canvas.parentNode?.insertBefore(img, this.canvas.nextSibling);
        this._fallbackImg = img;
    }

    // ─── Render loop ──────────────────────────────────────────────────────────

    /** @private */
    _startLoop() {
        if (this._animId !== null) return;
        const loop = (timestamp) => {
            const dt = this._lastTime !== null ? (timestamp - this._lastTime) / 1000 : 0;
            this._lastTime = timestamp;

            if (this._rotating && this.mode === "preview") {
                this._yaw += HOVER_ROTATION_SPEED * dt;
            }

            this._draw();
            this._animId = requestAnimationFrame(loop);
        };
        this._animId = requestAnimationFrame(loop);
    }

    /** @private */
    _draw() {
        const gl = this._gl;
        if (!gl || !this._texture || !this._program) return;

        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        gl.clearColor(0, 0, 0, 0); // transparent background
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);

        const mvp = buildMVP(this._yaw, this._pitch);

        // Inner head layer
        drawBuffers(gl, this._program, this._headBuffers, this._texture, mvp);

        // Outer hat layer (alpha-blended, drawn on top)
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        drawBuffers(gl, this._program, this._hatBuffers, this._texture, mvp);
        gl.disable(gl.BLEND);
    }

    // ─── Event wiring ─────────────────────────────────────────────────────────

    /** @private */
    _attachEvents() {
        if (this.mode === "preview") {
            this.canvas.addEventListener("mouseenter", this._onMouseEnter);
            this.canvas.addEventListener("mouseleave", this._onMouseLeave);
        } else {
            this.enableInteractiveRotation();
        }
    }

    // ─── Public API — Preview mode ────────────────────────────────────────────

    /** Begin clockwise auto-rotation (called automatically on mouseenter in preview mode). */
    startHoverRotation() {
        this._rotating = true;
    }

    /** Stop auto-rotation (called automatically on mouseleave in preview mode). */
    stopHoverRotation() {
        this._rotating = false;
    }

    // ─── Public API — Expanded mode ───────────────────────────────────────────

    /** Attach mouse and touch drag listeners for full 360° interactive rotation. */
    enableInteractiveRotation() {
        this.canvas.addEventListener("mousedown",  this._onMouseDown);
        window.addEventListener    ("mousemove",   this._onMouseMove);
        window.addEventListener    ("mouseup",     this._onMouseUp);
        this.canvas.addEventListener("touchstart", this._onTouchStart, { passive: true });
        window.addEventListener    ("touchmove",   this._onTouchMove,  { passive: true });
        window.addEventListener    ("touchend",    this._onTouchEnd);
    }

    // ─── Drag handlers ────────────────────────────────────────────────────────

    /** @private */
    _handleMouseDown(e) {
        this._drag = { x: e.clientX, y: e.clientY };
    }

    /** @private */
    _handleMouseMove(e) {
        if (!this._drag) return;
        this._applyDelta(e.clientX - this._drag.x, e.clientY - this._drag.y);
        this._drag = { x: e.clientX, y: e.clientY };
    }

    /** @private */
    _handleMouseUp() {
        this._drag = null;
    }

    /** @private */
    _handleTouchStart(e) {
        if (e.touches.length === 1) {
            this._drag = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
    }

    /** @private */
    _handleTouchMove(e) {
        if (!this._drag || e.touches.length !== 1) return;
        this._applyDelta(
            e.touches[0].clientX - this._drag.x,
            e.touches[0].clientY - this._drag.y,
        );
        this._drag = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }

    /** @private */
    _applyDelta(dx, dy) {
        this._yaw   += dx * 0.01;
        this._pitch += dy * 0.01;
        const half = Math.PI / 2;
        this._pitch = Math.max(-half, Math.min(half, this._pitch));
    }

    // ─── Cleanup ──────────────────────────────────────────────────────────────

    /** Release all GPU resources, cancel the animation loop, and remove event listeners. */
    destroy() {
        if (this._animId !== null) {
            cancelAnimationFrame(this._animId);
            this._animId = null;
        }

        this.canvas.removeEventListener("mouseenter", this._onMouseEnter);
        this.canvas.removeEventListener("mouseleave", this._onMouseLeave);
        this.canvas.removeEventListener("mousedown",  this._onMouseDown);
        window.removeEventListener     ("mousemove",  this._onMouseMove);
        window.removeEventListener     ("mouseup",    this._onMouseUp);
        this.canvas.removeEventListener("touchstart", this._onTouchStart);
        window.removeEventListener     ("touchmove",  this._onTouchMove);
        window.removeEventListener     ("touchend",   this._onTouchEnd);

        const gl = this._gl;
        if (gl) {
            if (this._texture)     gl.deleteTexture(this._texture);
            if (this._program)     gl.deleteProgram(this._program);
            if (this._headBuffers) freeBuffers(gl, this._headBuffers);
            if (this._hatBuffers)  freeBuffers(gl, this._hatBuffers);
        }

        this._fallbackImg?.remove();
    }
}
