// WebGL helper utilities for the head viewer.

// ─── Shaders ─────────────────────────────────────────────────────────────────

const VS_SOURCE = `
    attribute vec3 a_position;
    attribute vec2 a_uv;
    uniform mat4 u_mvp;
    varying vec2 v_uv;
    void main() {
        v_uv = a_uv;
        gl_Position = u_mvp * vec4(a_position, 1.0);
    }
`;

const FS_SOURCE = `
    precision mediump float;
    varying vec2 v_uv;
    uniform sampler2D u_texture;
    void main() {
        vec4 color = texture2D(u_texture, v_uv);
        if (color.a < 0.1) discard;
        gl_FragColor = color;
    }
`;

/**
 * Compiles and links the head viewer shader program.
 * @param {WebGLRenderingContext} gl
 * @returns {WebGLProgram}
 * @throws {Error} on compile or link failure
 */
export function createProgram(gl) {
    function compileShader(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const log = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(`Shader compile error: ${log}`);
        }
        return shader;
    }

    const vs = compileShader(gl.VERTEX_SHADER, VS_SOURCE);
    const fs = compileShader(gl.FRAGMENT_SHADER, FS_SOURCE);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const log = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        throw new Error(`Program link error: ${log}`);
    }
    return program;
}

// ─── Texture ─────────────────────────────────────────────────────────────────

/**
 * Uploads an HTMLImageElement as a nearest-filter WebGL texture.
 * @param {WebGLRenderingContext} gl
 * @param {HTMLImageElement} image
 * @returns {WebGLTexture}
 */
export function uploadTexture(gl, image) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
    return tex;
}

// ─── Geometry ────────────────────────────────────────────────────────────────

/**
 * Returns UV coordinates for one quad face (2 triangles), inset by half a texel
 * to avoid sampling bleed at atlas region boundaries.
 * @param {number} px1 Left pixel (inclusive)
 * @param {number} py1 Top pixel (inclusive)
 * @param {number} px2 Right pixel (exclusive)
 * @param {number} py2 Bottom pixel (exclusive)
 * @param {number} texW Texture width in pixels
 * @param {number} texH Texture height in pixels
 * @returns {number[][]} 6 [u,v] pairs
 */
function faceUVQuad(px1, py1, px2, py2, texW, texH) {
    const u1 = (px1 + 0.5) / texW, u2 = (px2 - 0.5) / texW;
    const v1 = (py1 + 0.5) / texH, v2 = (py2 - 0.5) / texH;
    return [[u1, v2], [u2, v2], [u2, v1], [u1, v2], [u2, v1], [u1, v1]];
}

/**
 * @typedef {{ position: WebGLBuffer, uv: WebGLBuffer, count: number }} HeadBuffers
 */

function buildGeometry(gl, texW, texH, faceRegions, halfExtent) {
    const e = halfExtent;
    const faceVertices = [
        // Front  (z = +e)
        [[-e,-e, e],[ e,-e, e],[ e, e, e], [-e,-e, e],[ e, e, e],[-e, e, e]],
        // Back   (z = -e)
        [[ e,-e,-e],[-e,-e,-e],[-e, e,-e], [ e,-e,-e],[-e, e,-e],[ e, e,-e]],
        // Top    (y = +e)
        [[-e, e, e],[ e, e, e],[ e, e,-e], [-e, e, e],[ e, e,-e],[-e, e,-e]],
        // Bottom (y = -e)
        [[-e,-e,-e],[ e,-e,-e],[ e,-e, e], [-e,-e,-e],[ e,-e, e],[-e,-e, e]],
        // Left   (x = -e)
        [[-e,-e,-e],[-e,-e, e],[-e, e, e], [-e,-e,-e],[-e, e, e],[-e, e,-e]],
        // Right  (x = +e)
        [[ e,-e, e],[ e,-e,-e],[ e, e,-e], [ e,-e, e],[ e, e,-e],[ e, e, e]],
    ];

    const positions = [];
    const uvCoords  = [];

    for (let i = 0; i < 6; i++) {
        const [px1, py1, px2, py2] = faceRegions[i];
        for (const v of faceVertices[i])             positions.push(...v);
        for (const uv of faceUVQuad(px1, py1, px2, py2, texW, texH)) uvCoords.push(...uv);
    }

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const uvBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvCoords), gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return { position: posBuffer, uv: uvBuffer, count: positions.length / 3 };
}

/**
 * Builds GPU buffers for the head (inner layer, ±0.5 unit cube).
 * UV regions follow the classic 64×64 Steve/Alex head layout.
 *   Face   region (px): Front(8,8,16,16) Back(24,8,32,16) Top(8,0,16,8)
 *                       Bottom(16,0,24,8) Left(0,8,8,16) Right(16,8,24,16)
 * @param {WebGLRenderingContext} gl
 * @param {number} texW
 * @param {number} texH
 * @returns {HeadBuffers}
 */
export function buildHeadGeometry(gl, texW, texH) {
    return buildGeometry(gl, texW, texH, [
        [ 8,  8, 16, 16], // Front
        [24,  8, 32, 16], // Back
        [ 8,  0, 16,  8], // Top
        [16,  0, 24,  8], // Bottom
        [ 0,  8,  8, 16], // Left
        [16,  8, 24, 16], // Right
    ], 0.5);
}

/**
 * Builds GPU buffers for the hat overlay (outer layer, ±0.5625 unit cube, 1.125× scale).
 * UV regions: Front(40,8,48,16) Back(56,8,64,16) Top(40,0,48,8)
 *             Bottom(48,0,56,8) Left(32,8,40,16) Right(48,8,56,16)
 * @param {WebGLRenderingContext} gl
 * @param {number} texW
 * @param {number} texH
 * @returns {HeadBuffers}
 */
export function buildHatGeometry(gl, texW, texH) {
    return buildGeometry(gl, texW, texH, [
        [40,  8, 48, 16], // Front
        [56,  8, 64, 16], // Back
        [40,  0, 48,  8], // Top
        [48,  0, 56,  8], // Bottom
        [32,  8, 40, 16], // Left
        [48,  8, 56, 16], // Right
    ], 0.5625);
}

// ─── Draw ─────────────────────────────────────────────────────────────────────

/**
 * Issues a draw call for a set of head/hat buffers with the given MVP matrix.
 * @param {WebGLRenderingContext} gl
 * @param {WebGLProgram} program
 * @param {HeadBuffers} buffers
 * @param {WebGLTexture} texture
 * @param {Float32Array} mvp
 */
export function drawBuffers(gl, program, buffers, texture, mvp) {
    gl.useProgram(program);

    const aPos = gl.getAttribLocation(program, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

    const aUV = gl.getAttribLocation(program, 'a_uv');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.uv);
    gl.enableVertexAttribArray(aUV);
    gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'u_mvp'), false, mvp);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(gl.getUniformLocation(program, 'u_texture'), 0);

    gl.drawArrays(gl.TRIANGLES, 0, buffers.count);

    gl.disableVertexAttribArray(aPos);
    gl.disableVertexAttribArray(aUV);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.useProgram(null);
}

/**
 * Deletes GPU buffers associated with a HeadBuffers object.
 * @param {WebGLRenderingContext} gl
 * @param {HeadBuffers} buffers
 */
export function freeBuffers(gl, buffers) {
    if (buffers.position) gl.deleteBuffer(buffers.position);
    if (buffers.uv)       gl.deleteBuffer(buffers.uv);
}
