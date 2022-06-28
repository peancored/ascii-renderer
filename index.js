import { pixelShader } from './shader.js';

const resolution = {
    width: 208,
    height: 117
};

const canvas = document.querySelector('.canvas');

const time = Date.now();

function draw() {
    let image = '';

    const res = [resolution.width, -resolution.height];

    for (let y = 0; y < resolution.height; y++) {
        for (let x = 0; x < resolution.width; x++) {
            image += pixelShader([ x, -y ] , res, Date.now() - time);
        }
        
        image += '\n';
    }

    canvas.textContent = image;

    requestAnimationFrame(draw);
}

draw();
