const { vec2, vec3, vec4 } = glMatrix;

const greyscale1 = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ";
const greyscale2 = "MW@BHENR#KXDFPQASUZbdehx*8Gm&04LOVYkpq5Tagns69oz$CIu23Jcfry%1v7l+it[]{}?j|()=~!-/<>\\\"^_';,:`. ";

const GREYSCALE = greyscale2;

const STEPS = 100;
const MAX_DIST = 100;
const SURF_DIST = .01;

function len(v) {
    return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

function dSphere(s, p) {
    const rs = vec3.sub(vec3.create(), p, [s[0], s[1], s[2]]);
    return len(rs) - s[3];
}

function dist(p) {
    const sphereDist = dSphere(vec4.fromValues(0, 1, 6, 1), p);
    const planeDist = p[1];
    
    const d = Math.min(sphereDist, planeDist);
    
    return d;
}

function march(ro, rd) {
    let dO = 0.;
    
    for (let i = 0; i < STEPS; i++) {
        let p = vec3.create();
        vec3.add(p, ro, vec3.scale(p, rd, dO));

        const dS = dist(p);
        
        dO += dS;
        
        if (dO > MAX_DIST || dS < SURF_DIST) {
            break;
        }
    }
    
    return dO;
}

function getNormal(p) {
    const d = dist(p);
    const e = vec2.fromValues(.01, 0);
    const n = vec3.fromValues(
        d - dist(vec3.sub(vec3.create(), p, [e[0], e[1], e[1]])),
        d - dist(vec3.sub(vec3.create(), p, [e[1], e[0], e[1]])),
        d - dist(vec3.sub(vec3.create(), p, [e[1], e[1], e[0]]))
    );
    
    return vec3.normalize(n, n);
}

function light(p, time) {
    const pos = vec3.fromValues(2. * Math.sin(time / 1000), 4, 6. + 2. * Math.cos(time / 1000));
    const l = vec3.sub(vec3.create(), pos, p);
    const ld = vec3.normalize(vec3.create(), l);
    const n = getNormal(p);
    
    let dif = vec3.dot(n, ld);
    
    let d = vec3.create();

    d = march(vec3.add(d, p,  vec3.scale(d, n,  SURF_DIST * 2.)), l);
    
    if (d < len(l)) {
        dif *= .1;
    }
    
    return [dif, dif, dif];
}

const getColor = (value) => {
    if (value > 1) {
        console.log(value);
    }
    const color = GREYSCALE[Math.floor(GREYSCALE.length * value)];

    return color === undefined ? GREYSCALE[0] : color;
}

export function pixelShader(fragCoord, resolution, time) {
    const uv = vec2.create();

    vec2.scale(
        uv, 
        vec2.sub(
            uv, 
            fragCoord,
            vec2.scale(
                uv, 
                resolution, 
                0.5
            )
        ), 
        1 / -resolution[1]
    );

    const ro = vec3.fromValues(0, 1, 0);

    const rd = vec3.fromValues(uv[0], uv[1], 1);
    vec3.normalize(rd, rd);

    const d = march(ro, rd);
    
    const p = vec3.create();
    vec3.add(p, ro, vec3.scale(p, rd, d));
    
    const col = light(p, time);

    return getColor(col[0]);
}
