// Column-major Float32Array matrices for WebGL (no external dependencies).

/**
 * Multiplies two 4×4 matrices (column-major).
 * @param {Float32Array} a
 * @param {Float32Array} b
 * @returns {Float32Array}
 */
export function mat4Multiply(a, b) {
    const out = new Float32Array(16);
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            let sum = 0;
            for (let k = 0; k < 4; k++) sum += a[k * 4 + row] * b[col * 4 + k];
            out[col * 4 + row] = sum;
        }
    }
    return out;
}

/**
 * @param {number} fovRad  Vertical field of view in radians
 * @param {number} aspect  Width / height
 * @param {number} near
 * @param {number} far
 * @returns {Float32Array}
 */
export function mat4Perspective(fovRad, aspect, near, far) {
    const f = 1.0 / Math.tan(fovRad / 2);
    const nf = 1 / (near - far);
    return new Float32Array([
        f / aspect, 0,  0,                    0,
        0,          f,  0,                    0,
        0,          0,  (far + near) * nf,   -1,
        0,          0,  2 * far * near * nf,  0,
    ]);
}

/**
 * @param {number[]} eye
 * @param {number[]} center
 * @param {number[]} up
 * @returns {Float32Array}
 */
export function mat4LookAt(eye, center, up) {
    const normalize = (v) => { const l = Math.hypot(...v); return v.map((x) => x / l); };
    const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

    const f = normalize([center[0] - eye[0], center[1] - eye[1], center[2] - eye[2]]);
    const s = normalize(cross(f, up));
    const u = cross(s, f);

    return new Float32Array([
         s[0],  u[0], -f[0], 0,
         s[1],  u[1], -f[1], 0,
         s[2],  u[2], -f[2], 0,
        -dot(s, eye), -dot(u, eye), dot(f, eye), 1,
    ]);
}

/**
 * Rotation around the Y axis.
 * @param {number} a Angle in radians
 * @returns {Float32Array}
 */
export function mat4RotateY(a) {
    const c = Math.cos(a), s = Math.sin(a);
    return new Float32Array([
         c, 0, -s, 0,
         0, 1,  0, 0,
         s, 0,  c, 0,
         0, 0,  0, 1,
    ]);
}

/**
 * Rotation around the X axis.
 * @param {number} a Angle in radians
 * @returns {Float32Array}
 */
export function mat4RotateX(a) {
    const c = Math.cos(a), s = Math.sin(a);
    return new Float32Array([
        1,  0, 0, 0,
        0,  c, s, 0,
        0, -s, c, 0,
        0,  0, 0, 1,
    ]);
}

/**
 * Builds a model-view-projection matrix for the head viewer.
 * @param {number} yaw   Horizontal rotation in radians
 * @param {number} pitch Vertical rotation in radians
 * @returns {Float32Array}
 */
export function buildMVP(yaw, pitch) {
    const fov  = 45 * Math.PI / 180;
    const proj = mat4Perspective(fov, 1.0, 0.1, 100.0);
    const view = mat4LookAt([0, 0.3, 2.5], [0, 0, 0], [0, 1, 0]);
    const model = mat4Multiply(mat4RotateX(pitch), mat4RotateY(yaw));
    return mat4Multiply(proj, mat4Multiply(view, model));
}
