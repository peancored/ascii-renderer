const { vec2, vec3, vec4 } = glMatrix;

const greyscale1 = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ";
const greyscale2 = "@MBHENR#KWXDFPQASUZbdehx*8Gm&04LOVYkpq5Tagns69owz$CIu23Jcfry%1v7l+it[]{}?j|()=~!-/<>\\\"^_';,:`. ";

const GREYSCALE = greyscale2;

const STEPS = 100;
const MAX_DIST = 100;
const SURF_DIST = .01;

function dSphere(s, p) {
    return vec3.len(vec3.sub(vec3.create(), p, [s[0], s[1], s[2]])) - s[3];
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
        const p = vec3.add(vec3.create(), ro, vec3.scale(vec3.create(), rd, dO));
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
    
    return vec3.normalize(vec3.create(), n);
}

function light(p, time) {
    const pos = vec3.fromValues(2. * Math.sin(time / 1000), 4, 6. + 2. * Math.cos(time / 1000));
    const l = vec3.normalize(vec3.create(), vec3.sub(vec3.create(), pos, p));
    const n = getNormal(p);
    
    let dif = vec3.dot(n, l);
    
    const d = march(vec3.add(vec3.create(), p,  vec3.scale(vec3.create(), n,  SURF_DIST * 2.)), l);
    
    if (d < vec3.length(vec3.sub(vec3.create(), pos, p))) {
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
    const uv = vec2.div(
        vec2.create(), 
        vec2.sub(
            vec2.create(), 
            fragCoord,
            vec2.scale(
                vec2.create(), 
                resolution, 
                0.5
            )
        ), 
        [ resolution[0], -resolution[1] ]
    );

    const ro = vec3.fromValues(0, 1, 0);
    const rd = vec3.normalize(vec3.create(), vec3.fromValues(uv[0], uv[1], 1));

    const d = march(ro, rd);
    
    const p = vec3.add(vec3.create(), ro, vec3.scale(vec3.create(), rd, d));
    
    const col = light(p, time);

    return getColor(col[0]);
}
