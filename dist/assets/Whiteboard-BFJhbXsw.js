import { j as jsxRuntimeExports, m as motion, aQ as WandSparkles, L as LoaderCircle, aR as Cloud, ac as CloudUpload, aS as FileDown, aT as Download, C as CircleCheck, g as Sparkles, P as PenTool, as as Mic, ah as Hand, aF as MousePointer2, aq as Eraser, aU as Hexagon, aI as Square, aJ as Circle$2, aH as Type, aV as SlidersHorizontal, aD as ZoomOut, aE as ZoomIn, aW as Focus, aX as Minimize, al as Maximize, i as Layers, A as AnimatePresence, R as Plus, ad as Eye, ae as EyeOff, T as Trash2, r as Check, X, aY as FileAudio, F as FileText, aZ as ImagePlus } from './vendor-ui-B7yEkTas.js';
import { a as requireReact, g as getDefaultExportFromCjs, R as React, h as useParams, r as reactExports, d as reactDomExports } from './vendor-core-egDwzlzP.js';
import { aA as requireScheduler, aB as schedulerExports, aC as m, aD as x } from './vendor-3d-BeyKjty-.js';
import { a as useAuth, g as useToast, u as useLanguage, b as useProject, f as db, c as cn, s as storage } from './index-CYJ5UA-3.js';
import { c as callGeminiAPI } from './geminiClient-B27RHJ_Z.js';
import { q as query, k as where, j as collection, m as onSnapshot, B as ref, C as uploadBytes, D as getDownloadURL, z as addDoc, l as getDocs, s as setDoc, e as doc, n as deleteDoc } from './vendor-firebase-CKkb2kaw.js';
import { U as UniversalPDFStudio, D as Document, P as Page, V as View, T as Text$2, I as Image$2, S as StyleSheet } from './UniversalPDFStudio-_gQo83Zn.js';
import './vendor-charts-DTz6AAsj.js';
import './browser-Q9GXpAvt.js';

const PI_OVER_180 = Math.PI / 180;
function detectBrowser() {
  return typeof window !== "undefined" && ({}.toString.call(window) === "[object Window]" || {}.toString.call(window) === "[object global]");
}
const glob = typeof window !== "undefined" ? window : typeof window !== "undefined" ? window : typeof WorkerGlobalScope !== "undefined" ? self : {};
const Konva$2 = {
  _global: glob,
  version: "10.3.0",
  isBrowser: detectBrowser(),
  isUnminified: /param/.test(function(param) {
  }.toString()),
  dblClickWindow: 400,
  getAngle(angle) {
    return Konva$2.angleDeg ? angle * PI_OVER_180 : angle;
  },
  enableTrace: false,
  pointerEventsEnabled: true,
  autoDrawEnabled: true,
  hitOnDragEnabled: false,
  capturePointerEventsEnabled: false,
  _mouseListenClick: false,
  _touchListenClick: false,
  _pointerListenClick: false,
  _mouseInDblClickWindow: false,
  _touchInDblClickWindow: false,
  _pointerInDblClickWindow: false,
  _mouseDblClickPointerId: null,
  _touchDblClickPointerId: null,
  _pointerDblClickPointerId: null,
  _renderBackend: "web",
  legacyTextRendering: false,
  pixelRatio: typeof window !== "undefined" && window.devicePixelRatio || 1,
  dragDistance: 3,
  angleDeg: true,
  showWarnings: true,
  dragButtons: [0, 1],
  isDragging() {
    return Konva$2["DD"].isDragging;
  },
  isTransforming() {
    var _a, _b;
    return (_b = (_a = Konva$2["Transformer"]) === null || _a === void 0 ? void 0 : _a.isTransforming()) !== null && _b !== void 0 ? _b : false;
  },
  isDragReady() {
    return !!Konva$2["DD"].node;
  },
  releaseCanvasOnDestroy: true,
  document: glob.document,
  _injectGlobal(Konva2) {
    if (typeof glob.Konva !== "undefined") {
      console.error("Several Konva instances detected. It is not recommended to use multiple Konva instances in the same environment.");
    }
    glob.Konva = Konva2;
  }
};
const _registerNode = (NodeClass) => {
  Konva$2[NodeClass.prototype.getClassName()] = NodeClass;
};
Konva$2._injectGlobal(Konva$2);

const NODE_ERROR = `Konva.js unsupported environment.

Looks like you are trying to use Konva.js in Node.js environment. because "document" object is undefined.

To use Konva.js in Node.js environment, you need to use the "canvas-backend" or "skia-backend" module.

bash: npm install canvas
js: import "konva/canvas-backend";

or

bash: npm install skia-canvas
js: import "konva/skia-backend";
`;
const ensureBrowser = () => {
    if (typeof document === 'undefined') {
        throw new Error(NODE_ERROR);
    }
};
class Transform {
    constructor(m = [1, 0, 0, 1, 0, 0]) {
        this.dirty = false;
        this.m = (m && m.slice()) || [1, 0, 0, 1, 0, 0];
    }
    reset() {
        this.m[0] = 1;
        this.m[1] = 0;
        this.m[2] = 0;
        this.m[3] = 1;
        this.m[4] = 0;
        this.m[5] = 0;
    }
    copy() {
        return new Transform(this.m);
    }
    copyInto(tr) {
        tr.m[0] = this.m[0];
        tr.m[1] = this.m[1];
        tr.m[2] = this.m[2];
        tr.m[3] = this.m[3];
        tr.m[4] = this.m[4];
        tr.m[5] = this.m[5];
    }
    point(point) {
        const m = this.m;
        return {
            x: m[0] * point.x + m[2] * point.y + m[4],
            y: m[1] * point.x + m[3] * point.y + m[5],
        };
    }
    translate(x, y) {
        this.m[4] += this.m[0] * x + this.m[2] * y;
        this.m[5] += this.m[1] * x + this.m[3] * y;
        return this;
    }
    scale(sx, sy) {
        this.m[0] *= sx;
        this.m[1] *= sx;
        this.m[2] *= sy;
        this.m[3] *= sy;
        return this;
    }
    rotate(rad) {
        const c = Math.cos(rad);
        const s = Math.sin(rad);
        const m11 = this.m[0] * c + this.m[2] * s;
        const m12 = this.m[1] * c + this.m[3] * s;
        const m21 = this.m[0] * -s + this.m[2] * c;
        const m22 = this.m[1] * -s + this.m[3] * c;
        this.m[0] = m11;
        this.m[1] = m12;
        this.m[2] = m21;
        this.m[3] = m22;
        return this;
    }
    getTranslation() {
        return {
            x: this.m[4],
            y: this.m[5],
        };
    }
    skew(sx, sy) {
        const m11 = this.m[0] + this.m[2] * sy;
        const m12 = this.m[1] + this.m[3] * sy;
        const m21 = this.m[2] + this.m[0] * sx;
        const m22 = this.m[3] + this.m[1] * sx;
        this.m[0] = m11;
        this.m[1] = m12;
        this.m[2] = m21;
        this.m[3] = m22;
        return this;
    }
    multiply(matrix) {
        const m11 = this.m[0] * matrix.m[0] + this.m[2] * matrix.m[1];
        const m12 = this.m[1] * matrix.m[0] + this.m[3] * matrix.m[1];
        const m21 = this.m[0] * matrix.m[2] + this.m[2] * matrix.m[3];
        const m22 = this.m[1] * matrix.m[2] + this.m[3] * matrix.m[3];
        const dx = this.m[0] * matrix.m[4] + this.m[2] * matrix.m[5] + this.m[4];
        const dy = this.m[1] * matrix.m[4] + this.m[3] * matrix.m[5] + this.m[5];
        this.m[0] = m11;
        this.m[1] = m12;
        this.m[2] = m21;
        this.m[3] = m22;
        this.m[4] = dx;
        this.m[5] = dy;
        return this;
    }
    invert() {
        const d = 1 / (this.m[0] * this.m[3] - this.m[1] * this.m[2]);
        const m0 = this.m[3] * d;
        const m1 = -this.m[1] * d;
        const m2 = -this.m[2] * d;
        const m3 = this.m[0] * d;
        const m4 = d * (this.m[2] * this.m[5] - this.m[3] * this.m[4]);
        const m5 = d * (this.m[1] * this.m[4] - this.m[0] * this.m[5]);
        this.m[0] = m0;
        this.m[1] = m1;
        this.m[2] = m2;
        this.m[3] = m3;
        this.m[4] = m4;
        this.m[5] = m5;
        return this;
    }
    getMatrix() {
        return this.m;
    }
    decompose() {
        const a = this.m[0];
        const b = this.m[1];
        const c = this.m[2];
        const d = this.m[3];
        const e = this.m[4];
        const f = this.m[5];
        const delta = a * d - b * c;
        const result = {
            x: e,
            y: f,
            rotation: 0,
            scaleX: 0,
            scaleY: 0,
            skewX: 0,
            skewY: 0,
        };
        if (a != 0 || b != 0) {
            const r = Math.sqrt(a * a + b * b);
            result.rotation = b > 0 ? Math.acos(a / r) : -Math.acos(a / r);
            result.scaleX = r;
            result.scaleY = delta / r;
            result.skewX = (a * c + b * d) / delta;
            result.skewY = 0;
        }
        else if (c != 0 || d != 0) {
            const s = Math.sqrt(c * c + d * d);
            result.rotation =
                Math.PI / 2 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s));
            result.scaleX = delta / s;
            result.scaleY = s;
            result.skewX = 0;
            result.skewY = (a * c + b * d) / delta;
        }
        else ;
        result.rotation = Util._getRotation(result.rotation);
        return result;
    }
}
const OBJECT_ARRAY = '[object Array]', OBJECT_NUMBER = '[object Number]', OBJECT_STRING = '[object String]', OBJECT_BOOLEAN = '[object Boolean]', PI_OVER_DEG180 = Math.PI / 180, DEG180_OVER_PI = 180 / Math.PI, HASH = '#', EMPTY_STRING$1 = '', ZERO = '0', KONVA_WARNING = 'Konva warning: ', KONVA_ERROR = 'Konva error: ', RGB_PAREN = 'rgb(', COLORS = {
    aliceblue: [240, 248, 255],
    antiquewhite: [250, 235, 215],
    aqua: [0, 255, 255],
    aquamarine: [127, 255, 212],
    azure: [240, 255, 255],
    beige: [245, 245, 220],
    bisque: [255, 228, 196],
    black: [0, 0, 0],
    blanchedalmond: [255, 235, 205],
    blue: [0, 0, 255],
    blueviolet: [138, 43, 226],
    brown: [165, 42, 42],
    burlywood: [222, 184, 135],
    cadetblue: [95, 158, 160],
    chartreuse: [127, 255, 0],
    chocolate: [210, 105, 30],
    coral: [255, 127, 80],
    cornflowerblue: [100, 149, 237],
    cornsilk: [255, 248, 220],
    crimson: [220, 20, 60],
    cyan: [0, 255, 255],
    darkblue: [0, 0, 139],
    darkcyan: [0, 139, 139],
    darkgoldenrod: [184, 132, 11],
    darkgray: [169, 169, 169],
    darkgreen: [0, 100, 0],
    darkgrey: [169, 169, 169],
    darkkhaki: [189, 183, 107],
    darkmagenta: [139, 0, 139],
    darkolivegreen: [85, 107, 47],
    darkorange: [255, 140, 0],
    darkorchid: [153, 50, 204],
    darkred: [139, 0, 0],
    darksalmon: [233, 150, 122],
    darkseagreen: [143, 188, 143],
    darkslateblue: [72, 61, 139],
    darkslategray: [47, 79, 79],
    darkslategrey: [47, 79, 79],
    darkturquoise: [0, 206, 209],
    darkviolet: [148, 0, 211],
    deeppink: [255, 20, 147],
    deepskyblue: [0, 191, 255],
    dimgray: [105, 105, 105],
    dimgrey: [105, 105, 105],
    dodgerblue: [30, 144, 255],
    firebrick: [178, 34, 34],
    floralwhite: [255, 255, 240],
    forestgreen: [34, 139, 34],
    fuchsia: [255, 0, 255],
    gainsboro: [220, 220, 220],
    ghostwhite: [248, 248, 255],
    gold: [255, 215, 0],
    goldenrod: [218, 165, 32],
    gray: [128, 128, 128],
    green: [0, 128, 0],
    greenyellow: [173, 255, 47],
    grey: [128, 128, 128],
    honeydew: [240, 255, 240],
    hotpink: [255, 105, 180],
    indianred: [205, 92, 92],
    indigo: [75, 0, 130],
    ivory: [255, 255, 240],
    khaki: [240, 230, 140],
    lavender: [230, 230, 250],
    lavenderblush: [255, 240, 245],
    lawngreen: [124, 252, 0],
    lemonchiffon: [255, 250, 205],
    lightblue: [173, 216, 230],
    lightcoral: [240, 128, 128],
    lightcyan: [224, 255, 255],
    lightgoldenrodyellow: [250, 250, 210],
    lightgray: [211, 211, 211],
    lightgreen: [144, 238, 144],
    lightgrey: [211, 211, 211],
    lightpink: [255, 182, 193],
    lightsalmon: [255, 160, 122],
    lightseagreen: [32, 178, 170],
    lightskyblue: [135, 206, 250],
    lightslategray: [119, 136, 153],
    lightslategrey: [119, 136, 153],
    lightsteelblue: [176, 196, 222],
    lightyellow: [255, 255, 224],
    lime: [0, 255, 0],
    limegreen: [50, 205, 50],
    linen: [250, 240, 230],
    magenta: [255, 0, 255],
    maroon: [128, 0, 0],
    mediumaquamarine: [102, 205, 170],
    mediumblue: [0, 0, 205],
    mediumorchid: [186, 85, 211],
    mediumpurple: [147, 112, 219],
    mediumseagreen: [60, 179, 113],
    mediumslateblue: [123, 104, 238],
    mediumspringgreen: [0, 250, 154],
    mediumturquoise: [72, 209, 204],
    mediumvioletred: [199, 21, 133],
    midnightblue: [25, 25, 112],
    mintcream: [245, 255, 250],
    mistyrose: [255, 228, 225],
    moccasin: [255, 228, 181],
    navajowhite: [255, 222, 173],
    navy: [0, 0, 128],
    oldlace: [253, 245, 230],
    olive: [128, 128, 0],
    olivedrab: [107, 142, 35],
    orange: [255, 165, 0],
    orangered: [255, 69, 0],
    orchid: [218, 112, 214],
    palegoldenrod: [238, 232, 170],
    palegreen: [152, 251, 152],
    paleturquoise: [175, 238, 238],
    palevioletred: [219, 112, 147],
    papayawhip: [255, 239, 213],
    peachpuff: [255, 218, 185],
    peru: [205, 133, 63],
    pink: [255, 192, 203],
    plum: [221, 160, 203],
    powderblue: [176, 224, 230],
    purple: [128, 0, 128],
    rebeccapurple: [102, 51, 153],
    red: [255, 0, 0],
    rosybrown: [188, 143, 143],
    royalblue: [65, 105, 225],
    saddlebrown: [139, 69, 19],
    salmon: [250, 128, 114],
    sandybrown: [244, 164, 96],
    seagreen: [46, 139, 87],
    seashell: [255, 245, 238],
    sienna: [160, 82, 45],
    silver: [192, 192, 192],
    skyblue: [135, 206, 235],
    slateblue: [106, 90, 205],
    slategray: [119, 128, 144],
    slategrey: [119, 128, 144],
    snow: [255, 255, 250],
    springgreen: [0, 255, 127],
    steelblue: [70, 130, 180],
    tan: [210, 180, 140],
    teal: [0, 128, 128],
    thistle: [216, 191, 216],
    transparent: [255, 255, 255, 0],
    tomato: [255, 99, 71],
    turquoise: [64, 224, 208],
    violet: [238, 130, 238],
    wheat: [245, 222, 179],
    white: [255, 255, 255],
    whitesmoke: [245, 245, 245],
    yellow: [255, 255, 0],
    yellowgreen: [154, 205, 5],
}, RGB_REGEX = /rgb\((\d{1,3}),(\d{1,3}),(\d{1,3})\)/;
let animQueue = [];
let _isCanvasFarblingActive = null;
const req = (typeof requestAnimationFrame !== 'undefined' && requestAnimationFrame) ||
    function (f) {
        setTimeout(f, 16);
    };
const Util = {
    _isElement(obj) {
        return !!(obj && obj.nodeType == 1);
    },
    _isFunction(obj) {
        return !!(obj && obj.constructor && obj.call && obj.apply);
    },
    _isPlainObject(obj) {
        return !!obj && obj.constructor === Object;
    },
    _isArray(obj) {
        return Object.prototype.toString.call(obj) === OBJECT_ARRAY;
    },
    _isNumber(obj) {
        return (Object.prototype.toString.call(obj) === OBJECT_NUMBER &&
            !isNaN(obj) &&
            isFinite(obj));
    },
    _isString(obj) {
        return Object.prototype.toString.call(obj) === OBJECT_STRING;
    },
    _isBoolean(obj) {
        return Object.prototype.toString.call(obj) === OBJECT_BOOLEAN;
    },
    isObject(val) {
        return val instanceof Object;
    },
    isValidSelector(selector) {
        if (typeof selector !== 'string') {
            return false;
        }
        const firstChar = selector[0];
        return (firstChar === '#' ||
            firstChar === '.' ||
            firstChar === firstChar.toUpperCase());
    },
    _sign(number) {
        if (number === 0) {
            return 1;
        }
        if (number > 0) {
            return 1;
        }
        else {
            return -1;
        }
    },
    requestAnimFrame(callback) {
        animQueue.push(callback);
        if (animQueue.length === 1) {
            req(function () {
                const queue = animQueue;
                animQueue = [];
                queue.forEach(function (cb) {
                    cb();
                });
            });
        }
    },
    createCanvasElement() {
        ensureBrowser();
        const canvas = document.createElement('canvas');
        try {
            canvas.style = canvas.style || {};
        }
        catch (e) { }
        return canvas;
    },
    createImageElement() {
        ensureBrowser();
        return document.createElement('img');
    },
    _isInDocument(el) {
        while ((el = el.parentNode)) {
            if (el == document) {
                return true;
            }
        }
        return false;
    },
    _urlToImage(url, callback) {
        const imageObj = Util.createImageElement();
        imageObj.onload = function () {
            callback(imageObj);
        };
        imageObj.src = url;
    },
    _rgbToHex(r, g, b) {
        return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
    _hexToRgb(hex) {
        hex = hex.replace(HASH, EMPTY_STRING$1);
        const bigint = parseInt(hex, 16);
        return {
            r: (bigint >> 16) & 255,
            g: (bigint >> 8) & 255,
            b: bigint & 255,
        };
    },
    getRandomColor() {
        let randColor = ((Math.random() * 0xffffff) << 0).toString(16);
        while (randColor.length < 6) {
            randColor = ZERO + randColor;
        }
        return HASH + randColor;
    },
    isCanvasFarblingActive() {
        if (_isCanvasFarblingActive !== null) {
            return _isCanvasFarblingActive;
        }
        if (typeof document === 'undefined') {
            _isCanvasFarblingActive = false;
            return false;
        }
        const c = this.createCanvasElement();
        c.width = 10;
        c.height = 10;
        const ctx = c.getContext('2d', {
            willReadFrequently: true,
        });
        ctx.clearRect(0, 0, 10, 10);
        ctx.fillStyle = '#282828';
        ctx.fillRect(0, 0, 10, 10);
        const d = ctx.getImageData(0, 0, 10, 10).data;
        let isFarbling = false;
        for (let i = 0; i < 100; i++) {
            if (d[i * 4] !== 40 ||
                d[i * 4 + 1] !== 40 ||
                d[i * 4 + 2] !== 40 ||
                d[i * 4 + 3] !== 255) {
                isFarbling = true;
                break;
            }
        }
        _isCanvasFarblingActive = isFarbling;
        this.releaseCanvas(c);
        return _isCanvasFarblingActive;
    },
    getHitColor() {
        const color = this.getRandomColor();
        return this.isCanvasFarblingActive()
            ? this.getSnappedHexColor(color)
            : color;
    },
    getHitColorKey(r, g, b) {
        if (this.isCanvasFarblingActive()) {
            r = Math.round(r / 5) * 5;
            g = Math.round(g / 5) * 5;
            b = Math.round(b / 5) * 5;
        }
        return HASH + this._rgbToHex(r, g, b);
    },
    getSnappedHexColor(hex) {
        const rgb = this._hexToRgb(hex);
        return (HASH +
            this._rgbToHex(Math.round(rgb.r / 5) * 5, Math.round(rgb.g / 5) * 5, Math.round(rgb.b / 5) * 5));
    },
    getRGB(color) {
        let rgb;
        if (color in COLORS) {
            rgb = COLORS[color];
            return {
                r: rgb[0],
                g: rgb[1],
                b: rgb[2],
            };
        }
        else if (color[0] === HASH) {
            return this._hexToRgb(color.substring(1));
        }
        else if (color.substr(0, 4) === RGB_PAREN) {
            rgb = RGB_REGEX.exec(color.replace(/ /g, ''));
            return {
                r: parseInt(rgb[1], 10),
                g: parseInt(rgb[2], 10),
                b: parseInt(rgb[3], 10),
            };
        }
        else {
            return {
                r: 0,
                g: 0,
                b: 0,
            };
        }
    },
    colorToRGBA(str) {
        str = str || 'black';
        return (Util._namedColorToRBA(str) ||
            Util._hex3ColorToRGBA(str) ||
            Util._hex4ColorToRGBA(str) ||
            Util._hex6ColorToRGBA(str) ||
            Util._hex8ColorToRGBA(str) ||
            Util._rgbColorToRGBA(str) ||
            Util._rgbaColorToRGBA(str) ||
            Util._hslColorToRGBA(str));
    },
    _namedColorToRBA(str) {
        const c = COLORS[str.toLowerCase()];
        if (!c) {
            return null;
        }
        return {
            r: c[0],
            g: c[1],
            b: c[2],
            a: 1,
        };
    },
    _rgbColorToRGBA(str) {
        if (str.indexOf('rgb(') === 0) {
            str = str.match(/rgb\(([^)]+)\)/)[1];
            const parts = str.split(/ *, */).map(Number);
            return {
                r: parts[0],
                g: parts[1],
                b: parts[2],
                a: 1,
            };
        }
    },
    _rgbaColorToRGBA(str) {
        if (str.indexOf('rgba(') === 0) {
            str = str.match(/rgba\(([^)]+)\)/)[1];
            const parts = str.split(/ *, */).map((n, index) => {
                if (n.slice(-1) === '%') {
                    return index === 3 ? parseInt(n) / 100 : (parseInt(n) / 100) * 255;
                }
                return Number(n);
            });
            return {
                r: parts[0],
                g: parts[1],
                b: parts[2],
                a: parts[3],
            };
        }
    },
    _hex8ColorToRGBA(str) {
        if (str[0] === '#' && str.length === 9) {
            return {
                r: parseInt(str.slice(1, 3), 16),
                g: parseInt(str.slice(3, 5), 16),
                b: parseInt(str.slice(5, 7), 16),
                a: parseInt(str.slice(7, 9), 16) / 0xff,
            };
        }
    },
    _hex6ColorToRGBA(str) {
        if (str[0] === '#' && str.length === 7) {
            return {
                r: parseInt(str.slice(1, 3), 16),
                g: parseInt(str.slice(3, 5), 16),
                b: parseInt(str.slice(5, 7), 16),
                a: 1,
            };
        }
    },
    _hex4ColorToRGBA(str) {
        if (str[0] === '#' && str.length === 5) {
            return {
                r: parseInt(str[1] + str[1], 16),
                g: parseInt(str[2] + str[2], 16),
                b: parseInt(str[3] + str[3], 16),
                a: parseInt(str[4] + str[4], 16) / 0xff,
            };
        }
    },
    _hex3ColorToRGBA(str) {
        if (str[0] === '#' && str.length === 4) {
            return {
                r: parseInt(str[1] + str[1], 16),
                g: parseInt(str[2] + str[2], 16),
                b: parseInt(str[3] + str[3], 16),
                a: 1,
            };
        }
    },
    _hslColorToRGBA(str) {
        if (/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.test(str)) {
            const [_, ...hsl] = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(str);
            const h = Number(hsl[0]) / 360;
            const s = Number(hsl[1]) / 100;
            const l = Number(hsl[2]) / 100;
            let t2;
            let t3;
            let val;
            if (s === 0) {
                val = l * 255;
                return {
                    r: Math.round(val),
                    g: Math.round(val),
                    b: Math.round(val),
                    a: 1,
                };
            }
            if (l < 0.5) {
                t2 = l * (1 + s);
            }
            else {
                t2 = l + s - l * s;
            }
            const t1 = 2 * l - t2;
            const rgb = [0, 0, 0];
            for (let i = 0; i < 3; i++) {
                t3 = h + (1 / 3) * -(i - 1);
                if (t3 < 0) {
                    t3++;
                }
                if (t3 > 1) {
                    t3--;
                }
                if (6 * t3 < 1) {
                    val = t1 + (t2 - t1) * 6 * t3;
                }
                else if (2 * t3 < 1) {
                    val = t2;
                }
                else if (3 * t3 < 2) {
                    val = t1 + (t2 - t1) * (2 / 3 - t3) * 6;
                }
                else {
                    val = t1;
                }
                rgb[i] = val * 255;
            }
            return {
                r: Math.round(rgb[0]),
                g: Math.round(rgb[1]),
                b: Math.round(rgb[2]),
                a: 1,
            };
        }
    },
    haveIntersection(r1, r2) {
        return !(r2.x > r1.x + r1.width ||
            r2.x + r2.width < r1.x ||
            r2.y > r1.y + r1.height ||
            r2.y + r2.height < r1.y);
    },
    cloneObject(obj) {
        const retObj = {};
        for (const key in obj) {
            if (this._isPlainObject(obj[key])) {
                retObj[key] = this.cloneObject(obj[key]);
            }
            else if (this._isArray(obj[key])) {
                retObj[key] = this.cloneArray(obj[key]);
            }
            else {
                retObj[key] = obj[key];
            }
        }
        return retObj;
    },
    cloneArray(arr) {
        return arr.slice(0);
    },
    degToRad(deg) {
        return deg * PI_OVER_DEG180;
    },
    radToDeg(rad) {
        return rad * DEG180_OVER_PI;
    },
    _degToRad(deg) {
        Util.warn('Util._degToRad is removed. Please use public Util.degToRad instead.');
        return Util.degToRad(deg);
    },
    _radToDeg(rad) {
        Util.warn('Util._radToDeg is removed. Please use public Util.radToDeg instead.');
        return Util.radToDeg(rad);
    },
    _getRotation(radians) {
        return Konva$2.angleDeg ? Util.radToDeg(radians) : radians;
    },
    _capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    throw(str) {
        throw new Error(KONVA_ERROR + str);
    },
    error(str) {
        console.error(KONVA_ERROR + str);
    },
    warn(str) {
        if (!Konva$2.showWarnings) {
            return;
        }
        console.warn(KONVA_WARNING + str);
    },
    each(obj, func) {
        for (const key in obj) {
            func(key, obj[key]);
        }
    },
    _inRange(val, left, right) {
        return left <= val && val < right;
    },
    _getProjectionToSegment(x1, y1, x2, y2, x3, y3) {
        let x, y, dist;
        const pd2 = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
        if (pd2 == 0) {
            x = x1;
            y = y1;
            dist = (x3 - x2) * (x3 - x2) + (y3 - y2) * (y3 - y2);
        }
        else {
            const u = ((x3 - x1) * (x2 - x1) + (y3 - y1) * (y2 - y1)) / pd2;
            if (u < 0) {
                x = x1;
                y = y1;
                dist = (x1 - x3) * (x1 - x3) + (y1 - y3) * (y1 - y3);
            }
            else if (u > 1.0) {
                x = x2;
                y = y2;
                dist = (x2 - x3) * (x2 - x3) + (y2 - y3) * (y2 - y3);
            }
            else {
                x = x1 + u * (x2 - x1);
                y = y1 + u * (y2 - y1);
                dist = (x - x3) * (x - x3) + (y - y3) * (y - y3);
            }
        }
        return [x, y, dist];
    },
    _getProjectionToLine(pt, line, isClosed) {
        const pc = Util.cloneObject(pt);
        let dist = Number.MAX_VALUE;
        line.forEach(function (p1, i) {
            if (!isClosed && i === line.length - 1) {
                return;
            }
            const p2 = line[(i + 1) % line.length];
            const proj = Util._getProjectionToSegment(p1.x, p1.y, p2.x, p2.y, pt.x, pt.y);
            const px = proj[0], py = proj[1], pdist = proj[2];
            if (pdist < dist) {
                pc.x = px;
                pc.y = py;
                dist = pdist;
            }
        });
        return pc;
    },
    _prepareArrayForTween(startArray, endArray, isClosed) {
        const start = [], end = [];
        if (startArray.length > endArray.length) {
            const temp = endArray;
            endArray = startArray;
            startArray = temp;
        }
        for (let n = 0; n < startArray.length; n += 2) {
            start.push({
                x: startArray[n],
                y: startArray[n + 1],
            });
        }
        for (let n = 0; n < endArray.length; n += 2) {
            end.push({
                x: endArray[n],
                y: endArray[n + 1],
            });
        }
        const newStart = [];
        end.forEach(function (point) {
            const pr = Util._getProjectionToLine(point, start, isClosed);
            newStart.push(pr.x);
            newStart.push(pr.y);
        });
        return newStart;
    },
    _prepareToStringify(obj) {
        let desc;
        obj.visitedByCircularReferenceRemoval = true;
        for (const key in obj) {
            if (!(obj.hasOwnProperty(key) && obj[key] && typeof obj[key] == 'object')) {
                continue;
            }
            desc = Object.getOwnPropertyDescriptor(obj, key);
            if (obj[key].visitedByCircularReferenceRemoval ||
                Util._isElement(obj[key])) {
                if (desc.configurable) {
                    delete obj[key];
                }
                else {
                    return null;
                }
            }
            else if (Util._prepareToStringify(obj[key]) === null) {
                if (desc.configurable) {
                    delete obj[key];
                }
                else {
                    return null;
                }
            }
        }
        delete obj.visitedByCircularReferenceRemoval;
        return obj;
    },
    _assign(target, source) {
        for (const key in source) {
            target[key] = source[key];
        }
        return target;
    },
    _getFirstPointerId(evt) {
        if (!evt.touches) {
            return evt.pointerId || 999;
        }
        else {
            return evt.changedTouches[0].identifier;
        }
    },
    releaseCanvas(...canvases) {
        if (!Konva$2.releaseCanvasOnDestroy)
            return;
        canvases.forEach((c) => {
            c.width = 0;
            c.height = 0;
        });
    },
    drawRoundedRectPath(context, width, height, cornerRadius) {
        let xOrigin = width < 0 ? width : 0;
        let yOrigin = height < 0 ? height : 0;
        width = Math.abs(width);
        height = Math.abs(height);
        let topLeft = 0;
        let topRight = 0;
        let bottomLeft = 0;
        let bottomRight = 0;
        if (typeof cornerRadius === 'number') {
            topLeft =
                topRight =
                    bottomLeft =
                        bottomRight =
                            Math.min(cornerRadius, width / 2, height / 2);
        }
        else {
            topLeft = Math.min(cornerRadius[0] || 0, width / 2, height / 2);
            topRight = Math.min(cornerRadius[1] || 0, width / 2, height / 2);
            bottomRight = Math.min(cornerRadius[2] || 0, width / 2, height / 2);
            bottomLeft = Math.min(cornerRadius[3] || 0, width / 2, height / 2);
        }
        context.moveTo(xOrigin + topLeft, yOrigin);
        context.lineTo(xOrigin + width - topRight, yOrigin);
        context.arc(xOrigin + width - topRight, yOrigin + topRight, topRight, (Math.PI * 3) / 2, 0, false);
        context.lineTo(xOrigin + width, yOrigin + height - bottomRight);
        context.arc(xOrigin + width - bottomRight, yOrigin + height - bottomRight, bottomRight, 0, Math.PI / 2, false);
        context.lineTo(xOrigin + bottomLeft, yOrigin + height);
        context.arc(xOrigin + bottomLeft, yOrigin + height - bottomLeft, bottomLeft, Math.PI / 2, Math.PI, false);
        context.lineTo(xOrigin, yOrigin + topLeft);
        context.arc(xOrigin + topLeft, yOrigin + topLeft, topLeft, Math.PI, (Math.PI * 3) / 2, false);
    },
    drawRoundedPolygonPath(context, points, sides, radius, cornerRadius) {
        radius = Math.abs(radius);
        for (let i = 0; i < sides; i++) {
            const prev = points[(i - 1 + sides) % sides];
            const curr = points[i];
            const next = points[(i + 1) % sides];
            const vec1 = { x: curr.x - prev.x, y: curr.y - prev.y };
            const vec2 = { x: next.x - curr.x, y: next.y - curr.y };
            const len1 = Math.hypot(vec1.x, vec1.y);
            const len2 = Math.hypot(vec2.x, vec2.y);
            let currCornerRadius;
            if (typeof cornerRadius === 'number') {
                currCornerRadius = cornerRadius;
            }
            else {
                currCornerRadius = i < cornerRadius.length ? cornerRadius[i] : 0;
            }
            const maxCornerRadius = radius * Math.cos(Math.PI / sides);
            currCornerRadius =
                maxCornerRadius * Math.min(1, (currCornerRadius / radius) * 2);
            const normalVec1 = { x: vec1.x / len1, y: vec1.y / len1 };
            const normalVec2 = { x: vec2.x / len2, y: vec2.y / len2 };
            const p1 = {
                x: curr.x - normalVec1.x * currCornerRadius,
                y: curr.y - normalVec1.y * currCornerRadius,
            };
            const p2 = {
                x: curr.x + normalVec2.x * currCornerRadius,
                y: curr.y + normalVec2.y * currCornerRadius,
            };
            if (i === 0) {
                context.moveTo(p1.x, p1.y);
            }
            else {
                context.lineTo(p1.x, p1.y);
            }
            context.arcTo(curr.x, curr.y, p2.x, p2.y, currCornerRadius);
        }
    },
};

function simplifyArray(arr) {
  const retArr = [], len = arr.length, util = Util;
  for (let n = 0; n < len; n++) {
    let val = arr[n];
    if (util._isNumber(val)) {
      val = Math.round(val * 1e3) / 1e3;
    } else if (!util._isString(val)) {
      val = val + "";
    }
    retArr.push(val);
  }
  return retArr;
}
const COMMA = ",", OPEN_PAREN = "(", CLOSE_PAREN = ")", OPEN_PAREN_BRACKET = "([", CLOSE_BRACKET_PAREN = "])", SEMICOLON = ";", DOUBLE_PAREN = "()", EQUALS = "=", CONTEXT_METHODS = [
  "arc",
  "arcTo",
  "beginPath",
  "bezierCurveTo",
  "clearRect",
  "clip",
  "closePath",
  "createLinearGradient",
  "createPattern",
  "createRadialGradient",
  "drawImage",
  "ellipse",
  "fill",
  "fillText",
  "getImageData",
  "createImageData",
  "lineTo",
  "moveTo",
  "putImageData",
  "quadraticCurveTo",
  "rect",
  "roundRect",
  "restore",
  "rotate",
  "save",
  "scale",
  "setLineDash",
  "setTransform",
  "stroke",
  "strokeText",
  "transform",
  "translate"
];
const CONTEXT_PROPERTIES = [
  "fillStyle",
  "strokeStyle",
  "shadowColor",
  "shadowBlur",
  "shadowOffsetX",
  "shadowOffsetY",
  "letterSpacing",
  "lineCap",
  "lineDashOffset",
  "lineJoin",
  "lineWidth",
  "miterLimit",
  "direction",
  "font",
  "textAlign",
  "textBaseline",
  "globalAlpha",
  "globalCompositeOperation",
  "imageSmoothingEnabled",
  "filter"
];
const traceArrMax = 100;
let _cssFiltersSupported = null;
function isCSSFiltersSupported() {
  if (_cssFiltersSupported !== null) {
    return _cssFiltersSupported;
  }
  try {
    const canvas = Util.createCanvasElement();
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      _cssFiltersSupported = false;
      return false;
    }
    return !!ctx && "filter" in ctx;
  } catch (e) {
    _cssFiltersSupported = false;
    return false;
  }
}
class Context {
  constructor(canvas) {
    this.canvas = canvas;
    if (Konva$2.enableTrace) {
      this.traceArr = [];
      this._enableTrace();
    }
  }
  fillShape(shape) {
    if (shape.fillEnabled()) {
      this._fill(shape);
    }
  }
  _fill(shape) {
  }
  strokeShape(shape) {
    if (shape.hasStroke()) {
      this._stroke(shape);
    }
  }
  _stroke(shape) {
  }
  fillStrokeShape(shape) {
    if (shape.attrs.fillAfterStrokeEnabled) {
      this.strokeShape(shape);
      this.fillShape(shape);
    } else {
      this.fillShape(shape);
      this.strokeShape(shape);
    }
  }
  getTrace(relaxed, rounded) {
    let traceArr = this.traceArr, len = traceArr.length, str = "", n, trace, method, args;
    for (n = 0; n < len; n++) {
      trace = traceArr[n];
      method = trace.method;
      if (method) {
        args = trace.args;
        str += method;
        if (relaxed) {
          str += DOUBLE_PAREN;
        } else {
          if (Util._isArray(args[0])) {
            str += OPEN_PAREN_BRACKET + args.join(COMMA) + CLOSE_BRACKET_PAREN;
          } else {
            if (rounded) {
              args = args.map((a) => typeof a === "number" ? Math.floor(a) : a);
            }
            str += OPEN_PAREN + args.join(COMMA) + CLOSE_PAREN;
          }
        }
      } else {
        str += trace.property;
        if (!relaxed) {
          str += EQUALS + trace.val;
        }
      }
      str += SEMICOLON;
    }
    return str;
  }
  clearTrace() {
    this.traceArr = [];
  }
  _trace(str) {
    let traceArr = this.traceArr, len;
    traceArr.push(str);
    len = traceArr.length;
    if (len >= traceArrMax) {
      traceArr.shift();
    }
  }
  reset() {
    const pixelRatio = this.getCanvas().getPixelRatio();
    this.setTransform(1 * pixelRatio, 0, 0, 1 * pixelRatio, 0, 0);
  }
  getCanvas() {
    return this.canvas;
  }
  clear(bounds) {
    const canvas = this.getCanvas();
    if (bounds) {
      this.clearRect(bounds.x || 0, bounds.y || 0, bounds.width || 0, bounds.height || 0);
    } else {
      this.clearRect(0, 0, canvas.getWidth() / canvas.pixelRatio, canvas.getHeight() / canvas.pixelRatio);
    }
  }
  _applyLineCap(shape) {
    const lineCap = shape.attrs.lineCap;
    if (lineCap) {
      this.setAttr("lineCap", lineCap);
    }
  }
  _applyOpacity(shape) {
    const absOpacity = shape.getAbsoluteOpacity();
    if (absOpacity !== 1) {
      this.setAttr("globalAlpha", absOpacity);
    }
  }
  _applyLineJoin(shape) {
    const lineJoin = shape.attrs.lineJoin;
    if (lineJoin) {
      this.setAttr("lineJoin", lineJoin);
    }
  }
  _applyMiterLimit(shape) {
    const miterLimit = shape.attrs.miterLimit;
    if (miterLimit != null) {
      this.setAttr("miterLimit", miterLimit);
    }
  }
  setAttr(attr, val) {
    this._context[attr] = val;
  }
  arc(x, y, radius, startAngle, endAngle, counterClockwise) {
    this._context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
  }
  arcTo(x1, y1, x2, y2, radius) {
    this._context.arcTo(x1, y1, x2, y2, radius);
  }
  beginPath() {
    this._context.beginPath();
  }
  bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
    this._context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y);
  }
  clearRect(x, y, width, height) {
    this._context.clearRect(x, y, width, height);
  }
  clip(...args) {
    this._context.clip.apply(this._context, args);
  }
  closePath() {
    this._context.closePath();
  }
  createImageData(width, height) {
    const a = arguments;
    if (a.length === 2) {
      return this._context.createImageData(width, height);
    } else if (a.length === 1) {
      return this._context.createImageData(width);
    }
  }
  createLinearGradient(x0, y0, x1, y1) {
    return this._context.createLinearGradient(x0, y0, x1, y1);
  }
  createPattern(image, repetition) {
    return this._context.createPattern(image, repetition);
  }
  createRadialGradient(x0, y0, r0, x1, y1, r1) {
    return this._context.createRadialGradient(x0, y0, r0, x1, y1, r1);
  }
  drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight) {
    const a = arguments, _context = this._context;
    if (a.length === 3) {
      _context.drawImage(image, sx, sy);
    } else if (a.length === 5) {
      _context.drawImage(image, sx, sy, sWidth, sHeight);
    } else if (a.length === 9) {
      _context.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
    }
  }
  ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise) {
    this._context.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise);
  }
  isPointInPath(x, y, path, fillRule) {
    if (path) {
      return this._context.isPointInPath(path, x, y, fillRule);
    }
    return this._context.isPointInPath(x, y, fillRule);
  }
  fill(...args) {
    this._context.fill.apply(this._context, args);
  }
  fillRect(x, y, width, height) {
    this._context.fillRect(x, y, width, height);
  }
  strokeRect(x, y, width, height) {
    this._context.strokeRect(x, y, width, height);
  }
  fillText(text, x, y, maxWidth) {
    if (maxWidth) {
      this._context.fillText(text, x, y, maxWidth);
    } else {
      this._context.fillText(text, x, y);
    }
  }
  measureText(text) {
    return this._context.measureText(text);
  }
  getImageData(sx, sy, sw, sh) {
    return this._context.getImageData(sx, sy, sw, sh);
  }
  lineTo(x, y) {
    this._context.lineTo(x, y);
  }
  moveTo(x, y) {
    this._context.moveTo(x, y);
  }
  rect(x, y, width, height) {
    this._context.rect(x, y, width, height);
  }
  roundRect(x, y, width, height, radii) {
    this._context.roundRect(x, y, width, height, radii);
  }
  putImageData(imageData, dx, dy) {
    this._context.putImageData(imageData, dx, dy);
  }
  quadraticCurveTo(cpx, cpy, x, y) {
    this._context.quadraticCurveTo(cpx, cpy, x, y);
  }
  restore() {
    this._context.restore();
  }
  rotate(angle) {
    this._context.rotate(angle);
  }
  save() {
    this._context.save();
  }
  scale(x, y) {
    this._context.scale(x, y);
  }
  setLineDash(segments) {
    if (this._context.setLineDash) {
      this._context.setLineDash(segments);
    } else if ("mozDash" in this._context) {
      this._context["mozDash"] = segments;
    } else if ("webkitLineDash" in this._context) {
      this._context["webkitLineDash"] = segments;
    }
  }
  getLineDash() {
    return this._context.getLineDash();
  }
  setTransform(a, b, c, d, e, f) {
    this._context.setTransform(a, b, c, d, e, f);
  }
  stroke(path2d) {
    if (path2d) {
      this._context.stroke(path2d);
    } else {
      this._context.stroke();
    }
  }
  strokeText(text, x, y, maxWidth) {
    this._context.strokeText(text, x, y, maxWidth);
  }
  transform(a, b, c, d, e, f) {
    this._context.transform(a, b, c, d, e, f);
  }
  translate(x, y) {
    this._context.translate(x, y);
  }
  _enableTrace() {
    let that = this, len = CONTEXT_METHODS.length, origSetter = this.setAttr, n, args;
    const func = function(methodName) {
      let origMethod = that[methodName], ret;
      that[methodName] = function() {
        args = simplifyArray(Array.prototype.slice.call(arguments, 0));
        ret = origMethod.apply(that, arguments);
        that._trace({
          method: methodName,
          args
        });
        return ret;
      };
    };
    for (n = 0; n < len; n++) {
      func(CONTEXT_METHODS[n]);
    }
    that.setAttr = function() {
      origSetter.apply(that, arguments);
      const prop = arguments[0];
      let val = arguments[1];
      if (prop === "shadowOffsetX" || prop === "shadowOffsetY" || prop === "shadowBlur") {
        val = val / this.canvas.getPixelRatio();
      }
      that._trace({
        property: prop,
        val
      });
    };
  }
  _applyGlobalCompositeOperation(node) {
    const op = node.attrs.globalCompositeOperation;
    const def = !op || op === "source-over";
    if (!def) {
      this.setAttr("globalCompositeOperation", op);
    }
  }
}
CONTEXT_PROPERTIES.forEach(function(prop) {
  Object.defineProperty(Context.prototype, prop, {
    get() {
      return this._context[prop];
    },
    set(val) {
      this._context[prop] = val;
    }
  });
});
class SceneContext extends Context {
  constructor(canvas, { willReadFrequently = false } = {}) {
    super(canvas);
    this._context = canvas._canvas.getContext("2d", {
      willReadFrequently
    });
  }
  _fillColor(shape) {
    const fill = shape.fill();
    this.setAttr("fillStyle", fill);
    shape._fillFunc(this);
  }
  _fillPattern(shape) {
    this.setAttr("fillStyle", shape._getFillPattern());
    shape._fillFunc(this);
  }
  _fillLinearGradient(shape) {
    const grd = shape._getLinearGradient();
    if (grd) {
      this.setAttr("fillStyle", grd);
      shape._fillFunc(this);
    }
  }
  _fillRadialGradient(shape) {
    const grd = shape._getRadialGradient();
    if (grd) {
      this.setAttr("fillStyle", grd);
      shape._fillFunc(this);
    }
  }
  _fill(shape) {
    const hasColor = shape.fill(), fillPriority = shape.getFillPriority();
    if (hasColor && fillPriority === "color") {
      this._fillColor(shape);
      return;
    }
    const hasPattern = shape.getFillPatternImage();
    if (hasPattern && fillPriority === "pattern") {
      this._fillPattern(shape);
      return;
    }
    const hasLinearGradient = shape.getFillLinearGradientColorStops();
    if (hasLinearGradient && fillPriority === "linear-gradient") {
      this._fillLinearGradient(shape);
      return;
    }
    const hasRadialGradient = shape.getFillRadialGradientColorStops();
    if (hasRadialGradient && fillPriority === "radial-gradient") {
      this._fillRadialGradient(shape);
      return;
    }
    if (hasColor) {
      this._fillColor(shape);
    } else if (hasPattern) {
      this._fillPattern(shape);
    } else if (hasLinearGradient) {
      this._fillLinearGradient(shape);
    } else if (hasRadialGradient) {
      this._fillRadialGradient(shape);
    }
  }
  _strokeLinearGradient(shape) {
    const start = shape.getStrokeLinearGradientStartPoint(), end = shape.getStrokeLinearGradientEndPoint(), colorStops = shape.getStrokeLinearGradientColorStops(), grd = this.createLinearGradient(start.x, start.y, end.x, end.y);
    if (colorStops) {
      for (let n = 0; n < colorStops.length; n += 2) {
        grd.addColorStop(colorStops[n], colorStops[n + 1]);
      }
      this.setAttr("strokeStyle", grd);
    }
  }
  _stroke(shape) {
    const dash = shape.dash(), strokeScaleEnabled = shape.getStrokeScaleEnabled();
    if (shape.hasStroke()) {
      if (!strokeScaleEnabled) {
        this.save();
        const pixelRatio = this.getCanvas().getPixelRatio();
        this.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      }
      this._applyLineCap(shape);
      if (dash && shape.dashEnabled()) {
        this.setLineDash(dash);
        this.setAttr("lineDashOffset", shape.dashOffset());
      }
      this.setAttr("lineWidth", shape.strokeWidth());
      if (!shape.getShadowForStrokeEnabled()) {
        this.setAttr("shadowColor", "rgba(0,0,0,0)");
      }
      const hasLinearGradient = shape.getStrokeLinearGradientColorStops();
      if (hasLinearGradient) {
        this._strokeLinearGradient(shape);
      } else {
        this.setAttr("strokeStyle", shape.stroke());
      }
      shape._strokeFunc(this);
      if (!strokeScaleEnabled) {
        this.restore();
      }
    }
  }
  _applyShadow(shape) {
    var _a, _b, _c;
    const color = (_a = shape.getShadowRGBA()) !== null && _a !== void 0 ? _a : "black", blur = (_b = shape.getShadowBlur()) !== null && _b !== void 0 ? _b : 5, offset = (_c = shape.getShadowOffset()) !== null && _c !== void 0 ? _c : {
      x: 0,
      y: 0
    }, scale = shape.getAbsoluteScale(), ratio = this.canvas.getPixelRatio(), scaleX = scale.x * ratio, scaleY = scale.y * ratio;
    this.setAttr("shadowColor", color);
    this.setAttr("shadowBlur", blur * Math.min(Math.abs(scaleX), Math.abs(scaleY)));
    this.setAttr("shadowOffsetX", offset.x * scaleX);
    this.setAttr("shadowOffsetY", offset.y * scaleY);
  }
}
class HitContext extends Context {
  constructor(canvas) {
    super(canvas);
    this._context = canvas._canvas.getContext("2d", {
      willReadFrequently: true
    });
  }
  _fill(shape) {
    this.save();
    this.setAttr("fillStyle", shape.colorKey);
    shape._fillFuncHit(this);
    this.restore();
  }
  strokeShape(shape) {
    if (shape.hasHitStroke()) {
      this._stroke(shape);
    }
  }
  _stroke(shape) {
    if (shape.hasHitStroke()) {
      const strokeScaleEnabled = shape.getStrokeScaleEnabled();
      if (!strokeScaleEnabled) {
        this.save();
        const pixelRatio = this.getCanvas().getPixelRatio();
        this.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      }
      this._applyLineCap(shape);
      const hitStrokeWidth = shape.hitStrokeWidth();
      const strokeWidth = hitStrokeWidth === "auto" ? shape.strokeWidth() : hitStrokeWidth;
      this.setAttr("lineWidth", strokeWidth);
      this.setAttr("strokeStyle", shape.colorKey);
      shape._strokeFuncHit(this);
      if (!strokeScaleEnabled) {
        this.restore();
      }
    }
  }
}

let _pixelRatio;
function getDevicePixelRatio() {
  if (_pixelRatio) {
    return _pixelRatio;
  }
  const canvas = Util.createCanvasElement();
  const context = canvas.getContext("2d");
  _pixelRatio = (function() {
    const devicePixelRatio = Konva$2._global.devicePixelRatio || 1, backingStoreRatio = context.webkitBackingStorePixelRatio || context.mozBackingStorePixelRatio || context.msBackingStorePixelRatio || context.oBackingStorePixelRatio || context.backingStorePixelRatio || 1;
    return devicePixelRatio / backingStoreRatio;
  })();
  Util.releaseCanvas(canvas);
  return _pixelRatio;
}
class Canvas {
  constructor(config) {
    this.pixelRatio = 1;
    this.width = 0;
    this.height = 0;
    this.isCache = false;
    const conf = config || {};
    const pixelRatio = conf.pixelRatio || Konva$2.pixelRatio || getDevicePixelRatio();
    this.pixelRatio = pixelRatio;
    this._canvas = Util.createCanvasElement();
    this._canvas.style.padding = "0";
    this._canvas.style.margin = "0";
    this._canvas.style.border = "0";
    this._canvas.style.background = "transparent";
    this._canvas.style.position = "absolute";
    this._canvas.style.top = "0";
    this._canvas.style.left = "0";
  }
  getContext() {
    return this.context;
  }
  getPixelRatio() {
    return this.pixelRatio;
  }
  setPixelRatio(pixelRatio) {
    const previousRatio = this.pixelRatio;
    this.pixelRatio = pixelRatio;
    this.setSize(this.getWidth() / previousRatio, this.getHeight() / previousRatio);
  }
  setWidth(width) {
    this.width = this._canvas.width = width * this.pixelRatio;
    this._canvas.style.width = width + "px";
    const pixelRatio = this.pixelRatio, _context = this.getContext()._context;
    _context.scale(pixelRatio, pixelRatio);
  }
  setHeight(height) {
    this.height = this._canvas.height = height * this.pixelRatio;
    this._canvas.style.height = height + "px";
    const pixelRatio = this.pixelRatio, _context = this.getContext()._context;
    _context.scale(pixelRatio, pixelRatio);
  }
  getWidth() {
    return this.width;
  }
  getHeight() {
    return this.height;
  }
  setSize(width, height) {
    this.setWidth(width || 0);
    this.setHeight(height || 0);
  }
  toDataURL(mimeType, quality) {
    try {
      return this._canvas.toDataURL(mimeType, quality);
    } catch (e) {
      try {
        return this._canvas.toDataURL();
      } catch (err) {
        Util.error("Unable to get data URL. " + err.message + " For more info read https://konvajs.org/docs/posts/Tainted_Canvas.html.");
        return "";
      }
    }
  }
}
class SceneCanvas extends Canvas {
  constructor(config = { width: 0, height: 0, willReadFrequently: false }) {
    super(config);
    this.context = new SceneContext(this, {
      willReadFrequently: config.willReadFrequently
    });
    this.setSize(config.width, config.height);
  }
}
class HitCanvas extends Canvas {
  constructor(config = { width: 0, height: 0 }) {
    super(config);
    this.hitCanvas = true;
    this.context = new HitContext(this);
    this.setSize(config.width, config.height);
  }
}

const DD = {
    get isDragging() {
        let flag = false;
        DD._dragElements.forEach((elem) => {
            if (elem.dragStatus === 'dragging') {
                flag = true;
            }
        });
        return flag;
    },
    justDragged: false,
    get node() {
        let node;
        DD._dragElements.forEach((elem) => {
            node = elem.node;
        });
        return node;
    },
    _dragElements: new Map(),
    _drag(evt) {
        const nodesToFireEvents = [];
        DD._dragElements.forEach((elem, key) => {
            const { node } = elem;
            const stage = node.getStage();
            stage.setPointersPositions(evt);
            if (elem.pointerId === undefined) {
                elem.pointerId = Util._getFirstPointerId(evt);
            }
            const pos = stage._changedPointerPositions.find((pos) => pos.id === elem.pointerId);
            if (!pos) {
                return;
            }
            if (elem.dragStatus !== 'dragging') {
                const dragDistance = node.dragDistance();
                const distance = Math.max(Math.abs(pos.x - elem.startPointerPos.x), Math.abs(pos.y - elem.startPointerPos.y));
                if (distance < dragDistance) {
                    return;
                }
                node.startDrag({ evt });
                if (!node.isDragging()) {
                    return;
                }
            }
            node._setDragPosition(evt, elem);
            nodesToFireEvents.push(node);
        });
        nodesToFireEvents.forEach((node) => {
            if (!node.getStage()) {
                return;
            }
            node.fire('dragmove', {
                type: 'dragmove',
                target: node,
                evt: evt,
            }, true);
        });
    },
    _endDragBefore(evt) {
        const drawNodes = [];
        DD._dragElements.forEach((elem) => {
            const { node } = elem;
            const stage = node.getStage();
            if (evt) {
                stage.setPointersPositions(evt);
            }
            const pos = stage._changedPointerPositions.find((pos) => pos.id === elem.pointerId);
            if (!pos) {
                return;
            }
            if (elem.dragStatus === 'dragging' || elem.dragStatus === 'stopped') {
                DD.justDragged = true;
                Konva$2._mouseListenClick = false;
                Konva$2._touchListenClick = false;
                Konva$2._pointerListenClick = false;
                elem.dragStatus = 'stopped';
            }
            const drawNode = elem.node.getLayer() ||
                (elem.node instanceof Konva$2['Stage'] && elem.node);
            if (drawNode && drawNodes.indexOf(drawNode) === -1) {
                drawNodes.push(drawNode);
            }
        });
        drawNodes.forEach((drawNode) => {
            drawNode.draw();
        });
    },
    _endDragAfter(evt) {
        DD._dragElements.forEach((elem, key) => {
            if (elem.dragStatus === 'stopped') {
                elem.node.fire('dragend', {
                    type: 'dragend',
                    target: elem.node,
                    evt: evt,
                }, true);
            }
            if (elem.dragStatus !== 'dragging') {
                DD._dragElements.delete(key);
            }
        });
    },
};
if (Konva$2.isBrowser) {
    window.addEventListener('mouseup', DD._endDragBefore, true);
    window.addEventListener('touchend', DD._endDragBefore, true);
    window.addEventListener('touchcancel', DD._endDragBefore, true);
    window.addEventListener('mousemove', DD._drag);
    window.addEventListener('touchmove', DD._drag);
    window.addEventListener('mouseup', DD._endDragAfter, false);
    window.addEventListener('touchend', DD._endDragAfter, false);
    window.addEventListener('touchcancel', DD._endDragAfter, false);
}

function _formatValue(val) {
    if (Util._isString(val)) {
        return '"' + val + '"';
    }
    if (Object.prototype.toString.call(val) === '[object Number]') {
        return val;
    }
    if (Util._isBoolean(val)) {
        return val;
    }
    return Object.prototype.toString.call(val);
}
function RGBComponent(val) {
    if (val > 255) {
        return 255;
    }
    else if (val < 0) {
        return 0;
    }
    return Math.round(val);
}
function getNumberValidator() {
    if (Konva$2.isUnminified) {
        return function (val, attr) {
            if (!Util._isNumber(val)) {
                Util.warn(_formatValue(val) +
                    ' is a not valid value for "' +
                    attr +
                    '" attribute. The value should be a number.');
            }
            return val;
        };
    }
}
function getNumberOrArrayOfNumbersValidator(noOfElements) {
    if (Konva$2.isUnminified) {
        return function (val, attr) {
            let isNumber = Util._isNumber(val);
            let isValidArray = Util._isArray(val) && val.length == noOfElements;
            if (!isNumber && !isValidArray) {
                Util.warn(_formatValue(val) +
                    ' is a not valid value for "' +
                    attr +
                    '" attribute. The value should be a number or Array<number>(' +
                    noOfElements +
                    ')');
            }
            return val;
        };
    }
}
function getNumberOrAutoValidator() {
    if (Konva$2.isUnminified) {
        return function (val, attr) {
            const isNumber = Util._isNumber(val);
            const isAuto = val === 'auto';
            if (!(isNumber || isAuto)) {
                Util.warn(_formatValue(val) +
                    ' is a not valid value for "' +
                    attr +
                    '" attribute. The value should be a number or "auto".');
            }
            return val;
        };
    }
}
function getStringValidator() {
    if (Konva$2.isUnminified) {
        return function (val, attr) {
            if (!Util._isString(val)) {
                Util.warn(_formatValue(val) +
                    ' is a not valid value for "' +
                    attr +
                    '" attribute. The value should be a string.');
            }
            return val;
        };
    }
}
function getStringOrGradientValidator() {
    if (Konva$2.isUnminified) {
        return function (val, attr) {
            const isString = Util._isString(val);
            const isGradient = Object.prototype.toString.call(val) === '[object CanvasGradient]' ||
                (val && val['addColorStop']);
            if (!(isString || isGradient)) {
                Util.warn(_formatValue(val) +
                    ' is a not valid value for "' +
                    attr +
                    '" attribute. The value should be a string or a native gradient.');
            }
            return val;
        };
    }
}
function getNumberArrayValidator() {
    if (Konva$2.isUnminified) {
        return function (val, attr) {
            const TypedArray = Int8Array ? Object.getPrototypeOf(Int8Array) : null;
            if (TypedArray && val instanceof TypedArray) {
                return val;
            }
            if (!Util._isArray(val)) {
                Util.warn(_formatValue(val) +
                    ' is a not valid value for "' +
                    attr +
                    '" attribute. The value should be a array of numbers.');
            }
            else {
                val.forEach(function (item) {
                    if (!Util._isNumber(item)) {
                        Util.warn('"' +
                            attr +
                            '" attribute has non numeric element ' +
                            item +
                            '. Make sure that all elements are numbers.');
                    }
                });
            }
            return val;
        };
    }
}
function getBooleanValidator() {
    if (Konva$2.isUnminified) {
        return function (val, attr) {
            const isBool = val === true || val === false;
            if (!isBool) {
                Util.warn(_formatValue(val) +
                    ' is a not valid value for "' +
                    attr +
                    '" attribute. The value should be a boolean.');
            }
            return val;
        };
    }
}
function getComponentValidator(components) {
    if (Konva$2.isUnminified) {
        return function (val, attr) {
            if (val === undefined || val === null) {
                return val;
            }
            if (!Util.isObject(val)) {
                Util.warn(_formatValue(val) +
                    ' is a not valid value for "' +
                    attr +
                    '" attribute. The value should be an object with properties ' +
                    components);
            }
            return val;
        };
    }
}

const GET = 'get';
const SET$1 = 'set';
const Factory = {
    addGetterSetter(constructor, attr, def, validator, after) {
        Factory.addGetter(constructor, attr, def);
        Factory.addSetter(constructor, attr, validator, after);
        Factory.addOverloadedGetterSetter(constructor, attr);
    },
    addGetter(constructor, attr, def) {
        const method = GET + Util._capitalize(attr);
        constructor.prototype[method] =
            constructor.prototype[method] ||
                function () {
                    const val = this.attrs[attr];
                    return val === undefined ? def : val;
                };
    },
    addSetter(constructor, attr, validator, after) {
        const method = SET$1 + Util._capitalize(attr);
        if (!constructor.prototype[method]) {
            Factory.overWriteSetter(constructor, attr, validator, after);
        }
    },
    overWriteSetter(constructor, attr, validator, after) {
        const method = SET$1 + Util._capitalize(attr);
        constructor.prototype[method] = function (val) {
            if (validator && val !== undefined && val !== null) {
                val = validator.call(this, val, attr);
            }
            this._setAttr(attr, val);
            if (after) {
                after.call(this);
            }
            return this;
        };
    },
    addComponentsGetterSetter(constructor, attr, components, validator, after) {
        const len = components.length, capitalize = Util._capitalize, getter = GET + capitalize(attr), setter = SET$1 + capitalize(attr);
        constructor.prototype[getter] = function () {
            const ret = {};
            for (let n = 0; n < len; n++) {
                const component = components[n];
                ret[component] = this.getAttr(attr + capitalize(component));
            }
            return ret;
        };
        const basicValidator = getComponentValidator(components);
        constructor.prototype[setter] = function (val) {
            const oldVal = this.attrs[attr];
            if (validator) {
                val = validator.call(this, val, attr);
            }
            if (basicValidator) {
                basicValidator.call(this, val, attr);
            }
            for (const key in val) {
                if (!val.hasOwnProperty(key)) {
                    continue;
                }
                this._setAttr(attr + capitalize(key), val[key]);
            }
            if (!val) {
                components.forEach((component) => {
                    this._setAttr(attr + capitalize(component), undefined);
                });
            }
            this._fireChangeEvent(attr, oldVal, val);
            if (after) {
                after.call(this);
            }
            return this;
        };
        Factory.addOverloadedGetterSetter(constructor, attr);
    },
    addOverloadedGetterSetter(constructor, attr) {
        const capitalizedAttr = Util._capitalize(attr), setter = SET$1 + capitalizedAttr, getter = GET + capitalizedAttr;
        constructor.prototype[attr] = function () {
            if (arguments.length) {
                this[setter](arguments[0]);
                return this;
            }
            return this[getter]();
        };
    },
    addDeprecatedGetterSetter(constructor, attr, def, validator) {
        Util.error('Adding deprecated ' + attr);
        const method = GET + Util._capitalize(attr);
        const message = attr +
            ' property is deprecated and will be removed soon. Look at Konva change log for more information.';
        constructor.prototype[method] = function () {
            Util.error(message);
            const val = this.attrs[attr];
            return val === undefined ? def : val;
        };
        Factory.addSetter(constructor, attr, validator, function () {
            Util.error(message);
        });
        Factory.addOverloadedGetterSetter(constructor, attr);
    },
    backCompat(constructor, methods) {
        Util.each(methods, function (oldMethodName, newMethodName) {
            const method = constructor.prototype[newMethodName];
            const oldGetter = GET + Util._capitalize(oldMethodName);
            const oldSetter = SET$1 + Util._capitalize(oldMethodName);
            function deprecated() {
                method.apply(this, arguments);
                Util.error('"' +
                    oldMethodName +
                    '" method is deprecated and will be removed soon. Use ""' +
                    newMethodName +
                    '" instead.');
            }
            constructor.prototype[oldMethodName] = deprecated;
            constructor.prototype[oldGetter] = deprecated;
            constructor.prototype[oldSetter] = deprecated;
        });
    },
    afterSetFilter() {
        this._filterUpToDate = false;
    },
};

function parseCSSFilters(cssFilter) {
  const filterRegex = /(\w+)\(([^)]+)\)/g;
  let match;
  while ((match = filterRegex.exec(cssFilter)) !== null) {
    const [, filterName, filterValue] = match;
    switch (filterName) {
      case "blur": {
        const blurRadius = parseFloat(filterValue.replace("px", ""));
        return function(imageData) {
          this.blurRadius(blurRadius * 0.5);
          const KonvaFilters = Konva$2.Filters;
          if (KonvaFilters && KonvaFilters.Blur) {
            KonvaFilters.Blur.call(this, imageData);
          }
        };
      }
      case "brightness": {
        const brightness = filterValue.includes("%") ? parseFloat(filterValue) / 100 : parseFloat(filterValue);
        return function(imageData) {
          this.brightness(brightness);
          const KonvaFilters = Konva$2.Filters;
          if (KonvaFilters && KonvaFilters.Brightness) {
            KonvaFilters.Brightness.call(this, imageData);
          }
        };
      }
      case "contrast": {
        const contrast = parseFloat(filterValue);
        return function(imageData) {
          const konvaContrast = 100 * (Math.sqrt(contrast) - 1);
          this.contrast(konvaContrast);
          const KonvaFilters = Konva$2.Filters;
          if (KonvaFilters && KonvaFilters.Contrast) {
            KonvaFilters.Contrast.call(this, imageData);
          }
        };
      }
      case "grayscale": {
        return function(imageData) {
          const KonvaFilters = Konva$2.Filters;
          if (KonvaFilters && KonvaFilters.Grayscale) {
            KonvaFilters.Grayscale.call(this, imageData);
          }
        };
      }
      case "sepia": {
        return function(imageData) {
          const KonvaFilters = Konva$2.Filters;
          if (KonvaFilters && KonvaFilters.Sepia) {
            KonvaFilters.Sepia.call(this, imageData);
          }
        };
      }
      case "invert": {
        return function(imageData) {
          const KonvaFilters = Konva$2.Filters;
          if (KonvaFilters && KonvaFilters.Invert) {
            KonvaFilters.Invert.call(this, imageData);
          }
        };
      }
      default:
        Util.warn(`CSS filter "${filterName}" is not supported in fallback mode. Consider using function filters for better compatibility.`);
        break;
    }
  }
  return () => {
  };
}
const ABSOLUTE_OPACITY = "absoluteOpacity", ALL_LISTENERS = "allEventListeners", ABSOLUTE_TRANSFORM = "absoluteTransform", ABSOLUTE_SCALE = "absoluteScale", CANVAS = "canvas", CHANGE = "Change", CHILDREN = "children", KONVA = "konva", LISTENING = "listening", MOUSEENTER$1 = "mouseenter", MOUSELEAVE$1 = "mouseleave", POINTERENTER$1 = "pointerenter", POINTERLEAVE$1 = "pointerleave", TOUCHENTER = "touchenter", TOUCHLEAVE = "touchleave", SET = "set", SHAPE = "Shape", SPACE$1 = " ", STAGE$1 = "stage", TRANSFORM = "transform", UPPER_STAGE = "Stage", VISIBLE = "visible", TRANSFORM_CHANGE_STR$1 = [
  "xChange.konva",
  "yChange.konva",
  "scaleXChange.konva",
  "scaleYChange.konva",
  "skewXChange.konva",
  "skewYChange.konva",
  "rotationChange.konva",
  "offsetXChange.konva",
  "offsetYChange.konva",
  "transformsEnabledChange.konva"
].join(SPACE$1);
let idCounter$1 = 1;
class Node {
  constructor(config) {
    this._id = idCounter$1++;
    this.eventListeners = {};
    this.attrs = {};
    this.index = 0;
    this._allEventListeners = null;
    this.parent = null;
    this._cache = /* @__PURE__ */ new Map();
    this._attachedDepsListeners = /* @__PURE__ */ new Map();
    this._lastPos = null;
    this._batchingTransformChange = false;
    this._needClearTransformCache = false;
    this._filterUpToDate = false;
    this._isUnderCache = false;
    this._dragEventId = null;
    this._shouldFireChangeEvents = false;
    this.setAttrs(config);
    this._shouldFireChangeEvents = true;
  }
  hasChildren() {
    return false;
  }
  _clearCache(attr) {
    if ((attr === TRANSFORM || attr === ABSOLUTE_TRANSFORM) && this._cache.get(attr)) {
      this._cache.get(attr).dirty = true;
    } else if (attr) {
      this._cache.delete(attr);
    } else {
      this._cache.clear();
    }
  }
  _getCache(attr, privateGetter) {
    let cache = this._cache.get(attr);
    const isTransform = attr === TRANSFORM || attr === ABSOLUTE_TRANSFORM;
    const invalid = cache === void 0 || isTransform && cache.dirty === true;
    if (invalid) {
      cache = privateGetter.call(this);
      this._cache.set(attr, cache);
    }
    return cache;
  }
  _calculate(name, deps, getter) {
    if (!this._attachedDepsListeners.get(name)) {
      const depsString = deps.map((dep) => dep + "Change.konva").join(SPACE$1);
      this.on(depsString, () => {
        this._clearCache(name);
      });
      this._attachedDepsListeners.set(name, true);
    }
    return this._getCache(name, getter);
  }
  _getCanvasCache() {
    return this._cache.get(CANVAS);
  }
  _clearSelfAndDescendantCache(attr) {
    this._clearCache(attr);
    if (attr === ABSOLUTE_TRANSFORM) {
      this.fire("absoluteTransformChange");
    }
  }
  clearCache() {
    if (this._cache.has(CANVAS)) {
      const { scene, filter, hit } = this._cache.get(CANVAS);
      Util.releaseCanvas(scene._canvas, filter._canvas, hit._canvas);
      this._cache.delete(CANVAS);
    }
    this._clearSelfAndDescendantCache();
    this._requestDraw();
    return this;
  }
  cache(config) {
    const conf = config || {};
    let rect = {};
    if (conf.x === void 0 || conf.y === void 0 || conf.width === void 0 || conf.height === void 0) {
      rect = this.getClientRect({
        skipTransform: true,
        relativeTo: this.getParent() || void 0
      });
    }
    let width = Math.ceil(conf.width || rect.width), height = Math.ceil(conf.height || rect.height), pixelRatio = conf.pixelRatio, x = conf.x === void 0 ? Math.floor(rect.x) : conf.x, y = conf.y === void 0 ? Math.floor(rect.y) : conf.y, offset = conf.offset || 0, drawBorder = conf.drawBorder || false, hitCanvasPixelRatio = conf.hitCanvasPixelRatio || 1;
    if (!width || !height) {
      Util.error("Can not cache the node. Width or height of the node equals 0. Caching is skipped.");
      return;
    }
    const extraPaddingX = Math.abs(Math.round(rect.x) - x) > 0.5 ? 1 : 0;
    const extraPaddingY = Math.abs(Math.round(rect.y) - y) > 0.5 ? 1 : 0;
    width += offset * 2 + extraPaddingX;
    height += offset * 2 + extraPaddingY;
    x -= offset;
    y -= offset;
    const cachedSceneCanvas = new SceneCanvas({
      pixelRatio,
      width,
      height
    }), cachedFilterCanvas = new SceneCanvas({
      pixelRatio,
      width: 0,
      height: 0,
      willReadFrequently: true
    }), cachedHitCanvas = new HitCanvas({
      pixelRatio: hitCanvasPixelRatio,
      width,
      height
    }), sceneContext = cachedSceneCanvas.getContext(), hitContext = cachedHitCanvas.getContext();
    const bufferCanvas = new SceneCanvas({
      width: cachedSceneCanvas.width / cachedSceneCanvas.pixelRatio + Math.abs(x),
      height: cachedSceneCanvas.height / cachedSceneCanvas.pixelRatio + Math.abs(y),
      pixelRatio: cachedSceneCanvas.pixelRatio
    }), bufferContext = bufferCanvas.getContext();
    cachedHitCanvas.isCache = true;
    cachedSceneCanvas.isCache = true;
    this._cache.delete(CANVAS);
    this._filterUpToDate = false;
    if (conf.imageSmoothingEnabled === false) {
      cachedSceneCanvas.getContext()._context.imageSmoothingEnabled = false;
      cachedFilterCanvas.getContext()._context.imageSmoothingEnabled = false;
    }
    sceneContext.save();
    hitContext.save();
    bufferContext.save();
    sceneContext.translate(-x, -y);
    hitContext.translate(-x, -y);
    bufferContext.translate(-x, -y);
    bufferCanvas.x = x;
    bufferCanvas.y = y;
    this._isUnderCache = true;
    this._clearSelfAndDescendantCache(ABSOLUTE_OPACITY);
    this._clearSelfAndDescendantCache(ABSOLUTE_SCALE);
    this.drawScene(cachedSceneCanvas, this, bufferCanvas);
    this.drawHit(cachedHitCanvas, this);
    this._isUnderCache = false;
    sceneContext.restore();
    hitContext.restore();
    if (drawBorder) {
      sceneContext.save();
      sceneContext.beginPath();
      sceneContext.rect(0, 0, width, height);
      sceneContext.closePath();
      sceneContext.setAttr("strokeStyle", "red");
      sceneContext.setAttr("lineWidth", 5);
      sceneContext.stroke();
      sceneContext.restore();
    }
    Util.releaseCanvas(bufferCanvas._canvas);
    this._cache.set(CANVAS, {
      scene: cachedSceneCanvas,
      filter: cachedFilterCanvas,
      hit: cachedHitCanvas,
      x,
      y
    });
    this._requestDraw();
    return this;
  }
  isCached() {
    return this._cache.has(CANVAS);
  }
  getClientRect(config) {
    throw new Error('abstract "getClientRect" method call');
  }
  _transformedRect(rect, top) {
    const points = [
      { x: rect.x, y: rect.y },
      { x: rect.x + rect.width, y: rect.y },
      { x: rect.x + rect.width, y: rect.y + rect.height },
      { x: rect.x, y: rect.y + rect.height }
    ];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const trans = this.getAbsoluteTransform(top);
    points.forEach(function(point) {
      const transformed = trans.point(point);
      if (minX === void 0) {
        minX = maxX = transformed.x;
        minY = maxY = transformed.y;
      }
      minX = Math.min(minX, transformed.x);
      minY = Math.min(minY, transformed.y);
      maxX = Math.max(maxX, transformed.x);
      maxY = Math.max(maxY, transformed.y);
    });
    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }
  _drawCachedSceneCanvas(context) {
    context.save();
    context._applyOpacity(this);
    context._applyGlobalCompositeOperation(this);
    const canvasCache = this._getCanvasCache();
    context.translate(canvasCache.x, canvasCache.y);
    const cacheCanvas = this._getCachedSceneCanvas();
    const ratio = cacheCanvas.pixelRatio;
    context.drawImage(cacheCanvas._canvas, 0, 0, cacheCanvas.width / ratio, cacheCanvas.height / ratio);
    context.restore();
  }
  _drawCachedHitCanvas(context) {
    const canvasCache = this._getCanvasCache(), hitCanvas = canvasCache.hit;
    context.save();
    context.translate(canvasCache.x, canvasCache.y);
    context.drawImage(hitCanvas._canvas, 0, 0, hitCanvas.width / hitCanvas.pixelRatio, hitCanvas.height / hitCanvas.pixelRatio);
    context.restore();
  }
  _getCachedSceneCanvas() {
    let filters = this.filters(), cachedCanvas = this._getCanvasCache(), sceneCanvas = cachedCanvas.scene, filterCanvas = cachedCanvas.filter, filterContext = filterCanvas.getContext(), len, imageData, n, filter;
    if (!filters || filters.length === 0) {
      return sceneCanvas;
    }
    if (this._filterUpToDate) {
      return filterCanvas;
    }
    let useNativeOnly = true;
    for (let i = 0; i < filters.length; i++) {
      typeof filters[i] === "string" && !isCSSFiltersSupported();
      if (typeof filters[i] !== "string" || !isCSSFiltersSupported()) {
        useNativeOnly = false;
        break;
      }
    }
    const ratio = sceneCanvas.pixelRatio;
    filterCanvas.setSize(sceneCanvas.width / sceneCanvas.pixelRatio, sceneCanvas.height / sceneCanvas.pixelRatio);
    if (useNativeOnly) {
      const finalFilter = filters.join(" ");
      filterContext.save();
      filterContext.setAttr("filter", finalFilter);
      filterContext.drawImage(sceneCanvas._canvas, 0, 0, sceneCanvas.getWidth() / ratio, sceneCanvas.getHeight() / ratio);
      filterContext.restore();
      this._filterUpToDate = true;
      return filterCanvas;
    }
    try {
      len = filters.length;
      filterContext.clear();
      filterContext.drawImage(sceneCanvas._canvas, 0, 0, sceneCanvas.getWidth() / ratio, sceneCanvas.getHeight() / ratio);
      imageData = filterContext.getImageData(0, 0, filterCanvas.getWidth(), filterCanvas.getHeight());
      for (n = 0; n < len; n++) {
        filter = filters[n];
        if (typeof filter === "string") {
          filter = parseCSSFilters(filter);
        }
        filter.call(this, imageData);
        filterContext.putImageData(imageData, 0, 0);
      }
    } catch (e) {
      Util.error("Unable to apply filter. " + e.message + " This post my help you https://konvajs.org/docs/posts/Tainted_Canvas.html.");
    }
    this._filterUpToDate = true;
    return filterCanvas;
  }
  on(...args) {
    const evtStr = args[0];
    const selectorOrHandler = args[1];
    args[2];
    if (this._cache) {
      this._cache.delete(ALL_LISTENERS);
    }
    if (args.length === 3) {
      return this._delegate.apply(this, args);
    }
    const events = evtStr.split(SPACE$1);
    for (let n = 0; n < events.length; n++) {
      const event = events[n];
      const parts = event.split(".");
      const baseEvent = parts[0];
      const name = parts[1] || "";
      if (!this.eventListeners[baseEvent]) {
        this.eventListeners[baseEvent] = [];
      }
      this.eventListeners[baseEvent].push({ name, handler: selectorOrHandler });
    }
    return this;
  }
  off(evtStr, callback) {
    let events = (evtStr || "").split(SPACE$1), len = events.length, n, t, event, parts, baseEvent, name;
    this._cache && this._cache.delete(ALL_LISTENERS);
    if (!evtStr) {
      for (t in this.eventListeners) {
        this._off(t);
      }
    }
    for (n = 0; n < len; n++) {
      event = events[n];
      parts = event.split(".");
      baseEvent = parts[0];
      name = parts[1];
      if (baseEvent) {
        if (this.eventListeners[baseEvent]) {
          this._off(baseEvent, name, callback);
        }
      } else {
        for (t in this.eventListeners) {
          this._off(t, name, callback);
        }
      }
    }
    return this;
  }
  dispatchEvent(evt) {
    const e = {
      target: this,
      type: evt.type,
      evt
    };
    this.fire(evt.type, e);
    return this;
  }
  addEventListener(type, handler) {
    this.on(type, function(evt) {
      handler.call(this, evt.evt);
    });
    return this;
  }
  removeEventListener(type) {
    this.off(type);
    return this;
  }
  _delegate(event, selector, handler) {
    const stopNode = this;
    this.on(event, function(evt) {
      const targets = evt.target.findAncestors(selector, true, stopNode);
      for (let i = 0; i < targets.length; i++) {
        evt = Util.cloneObject(evt);
        evt.currentTarget = targets[i];
        handler.call(targets[i], evt);
      }
    });
    return this;
  }
  remove() {
    if (this.isDragging()) {
      this.stopDrag();
    }
    DD._dragElements.delete(this._id);
    DD._dragElements.forEach((elem, key) => {
      if (this.isAncestorOf(elem.node)) {
        DD._dragElements.delete(key);
      }
    });
    this._remove();
    return this;
  }
  _clearCaches() {
    this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
    this._clearSelfAndDescendantCache(ABSOLUTE_OPACITY);
    this._clearSelfAndDescendantCache(ABSOLUTE_SCALE);
    this._clearSelfAndDescendantCache(STAGE$1);
    this._clearSelfAndDescendantCache(VISIBLE);
    this._clearSelfAndDescendantCache(LISTENING);
  }
  _remove() {
    this._clearCaches();
    const parent = this.getParent();
    if (parent && parent.children) {
      parent.children.splice(this.index, 1);
      parent._setChildrenIndices();
      this.parent = null;
    }
  }
  destroy() {
    this.remove();
    this.clearCache();
    return this;
  }
  getAttr(attr) {
    const method = "get" + Util._capitalize(attr);
    if (Util._isFunction(this[method])) {
      return this[method]();
    }
    return this.attrs[attr];
  }
  getAncestors() {
    let parent = this.getParent(), ancestors = [];
    while (parent) {
      ancestors.push(parent);
      parent = parent.getParent();
    }
    return ancestors;
  }
  getAttrs() {
    return this.attrs || {};
  }
  setAttrs(config) {
    this._batchTransformChanges(() => {
      let key, method;
      if (!config) {
        return this;
      }
      for (key in config) {
        if (key === CHILDREN) {
          continue;
        }
        method = SET + Util._capitalize(key);
        if (Util._isFunction(this[method])) {
          this[method](config[key]);
        } else {
          this._setAttr(key, config[key]);
        }
      }
    });
    return this;
  }
  isListening() {
    return this._getCache(LISTENING, this._isListening);
  }
  _isListening(relativeTo) {
    const listening = this.listening();
    if (!listening) {
      return false;
    }
    const parent = this.getParent();
    if (parent && parent !== relativeTo && this !== relativeTo) {
      return parent._isListening(relativeTo);
    } else {
      return true;
    }
  }
  isVisible() {
    return this._getCache(VISIBLE, this._isVisible);
  }
  _isVisible(relativeTo) {
    const visible = this.visible();
    if (!visible) {
      return false;
    }
    const parent = this.getParent();
    if (parent && parent !== relativeTo && this !== relativeTo) {
      return parent._isVisible(relativeTo);
    } else {
      return true;
    }
  }
  shouldDrawHit(top, skipDragCheck = false) {
    if (top) {
      return this._isVisible(top) && this._isListening(top);
    }
    const layer = this.getLayer();
    let layerUnderDrag = false;
    DD._dragElements.forEach((elem) => {
      if (elem.dragStatus !== "dragging") {
        return;
      } else if (elem.node.nodeType === "Stage") {
        layerUnderDrag = true;
      } else if (elem.node.getLayer() === layer) {
        layerUnderDrag = true;
      }
    });
    const dragSkip = !skipDragCheck && !Konva$2.hitOnDragEnabled && (layerUnderDrag || Konva$2.isTransforming());
    return this.isListening() && this.isVisible() && !dragSkip;
  }
  show() {
    this.visible(true);
    return this;
  }
  hide() {
    this.visible(false);
    return this;
  }
  getZIndex() {
    return this.index || 0;
  }
  getAbsoluteZIndex() {
    let depth = this.getDepth(), that = this, index = 0, nodes, len, n, child;
    function addChildren(children) {
      nodes = [];
      len = children.length;
      for (n = 0; n < len; n++) {
        child = children[n];
        index++;
        if (child.nodeType !== SHAPE) {
          nodes = nodes.concat(child.getChildren().slice());
        }
        if (child._id === that._id) {
          n = len;
        }
      }
      if (nodes.length > 0 && nodes[0].getDepth() <= depth) {
        addChildren(nodes);
      }
    }
    const stage = this.getStage();
    if (that.nodeType !== UPPER_STAGE && stage) {
      addChildren(stage.getChildren());
    }
    return index;
  }
  getDepth() {
    let depth = 0, parent = this.parent;
    while (parent) {
      depth++;
      parent = parent.parent;
    }
    return depth;
  }
  _batchTransformChanges(func) {
    this._batchingTransformChange = true;
    func();
    this._batchingTransformChange = false;
    if (this._needClearTransformCache) {
      this._clearCache(TRANSFORM);
      this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
    }
    this._needClearTransformCache = false;
  }
  setPosition(pos) {
    this._batchTransformChanges(() => {
      this.x(pos.x);
      this.y(pos.y);
    });
    return this;
  }
  getPosition() {
    return {
      x: this.x(),
      y: this.y()
    };
  }
  getRelativePointerPosition() {
    const stage = this.getStage();
    if (!stage) {
      return null;
    }
    const pos = stage.getPointerPosition();
    if (!pos) {
      return null;
    }
    const transform = this.getAbsoluteTransform().copy();
    transform.invert();
    return transform.point(pos);
  }
  getAbsolutePosition(top) {
    let haveCachedParent = false;
    let parent = this.parent;
    while (parent) {
      if (parent.isCached()) {
        haveCachedParent = true;
        break;
      }
      parent = parent.parent;
    }
    if (haveCachedParent && !top) {
      top = true;
    }
    const absoluteMatrix = this.getAbsoluteTransform(top).getMatrix(), absoluteTransform = new Transform(), offset = this.offset();
    absoluteTransform.m = absoluteMatrix.slice();
    absoluteTransform.translate(offset.x, offset.y);
    return absoluteTransform.getTranslation();
  }
  setAbsolutePosition(pos) {
    const { x, y, ...origTrans } = this._clearTransform();
    this.attrs.x = x;
    this.attrs.y = y;
    this._clearCache(TRANSFORM);
    const it = this._getAbsoluteTransform().copy();
    it.invert();
    it.translate(pos.x, pos.y);
    pos = {
      x: this.attrs.x + it.getTranslation().x,
      y: this.attrs.y + it.getTranslation().y
    };
    this._setTransform(origTrans);
    this.setPosition({ x: pos.x, y: pos.y });
    this._clearCache(TRANSFORM);
    this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
    return this;
  }
  _setTransform(trans) {
    let key;
    for (key in trans) {
      this.attrs[key] = trans[key];
    }
  }
  _clearTransform() {
    const trans = {
      x: this.x(),
      y: this.y(),
      rotation: this.rotation(),
      scaleX: this.scaleX(),
      scaleY: this.scaleY(),
      offsetX: this.offsetX(),
      offsetY: this.offsetY(),
      skewX: this.skewX(),
      skewY: this.skewY()
    };
    this.attrs.x = 0;
    this.attrs.y = 0;
    this.attrs.rotation = 0;
    this.attrs.scaleX = 1;
    this.attrs.scaleY = 1;
    this.attrs.offsetX = 0;
    this.attrs.offsetY = 0;
    this.attrs.skewX = 0;
    this.attrs.skewY = 0;
    return trans;
  }
  move(change) {
    let changeX = change.x, changeY = change.y, x = this.x(), y = this.y();
    if (changeX !== void 0) {
      x += changeX;
    }
    if (changeY !== void 0) {
      y += changeY;
    }
    this.setPosition({ x, y });
    return this;
  }
  _eachAncestorReverse(func, top) {
    let family = [], parent = this.getParent(), len, n;
    if (top && top._id === this._id) {
      return;
    }
    family.unshift(this);
    while (parent && (!top || parent._id !== top._id)) {
      family.unshift(parent);
      parent = parent.parent;
    }
    len = family.length;
    for (n = 0; n < len; n++) {
      func(family[n]);
    }
  }
  rotate(theta) {
    this.rotation(this.rotation() + theta);
    return this;
  }
  moveToTop() {
    if (!this.parent) {
      Util.warn("Node has no parent. moveToTop function is ignored.");
      return false;
    }
    const index = this.index, len = this.parent.getChildren().length;
    if (index < len - 1) {
      this.parent.children.splice(index, 1);
      this.parent.children.push(this);
      this.parent._setChildrenIndices();
      return true;
    }
    return false;
  }
  moveUp() {
    if (!this.parent) {
      Util.warn("Node has no parent. moveUp function is ignored.");
      return false;
    }
    const index = this.index, len = this.parent.getChildren().length;
    if (index < len - 1) {
      this.parent.children.splice(index, 1);
      this.parent.children.splice(index + 1, 0, this);
      this.parent._setChildrenIndices();
      return true;
    }
    return false;
  }
  moveDown() {
    if (!this.parent) {
      Util.warn("Node has no parent. moveDown function is ignored.");
      return false;
    }
    const index = this.index;
    if (index > 0) {
      this.parent.children.splice(index, 1);
      this.parent.children.splice(index - 1, 0, this);
      this.parent._setChildrenIndices();
      return true;
    }
    return false;
  }
  moveToBottom() {
    if (!this.parent) {
      Util.warn("Node has no parent. moveToBottom function is ignored.");
      return false;
    }
    const index = this.index;
    if (index > 0) {
      this.parent.children.splice(index, 1);
      this.parent.children.unshift(this);
      this.parent._setChildrenIndices();
      return true;
    }
    return false;
  }
  setZIndex(zIndex) {
    if (!this.parent) {
      Util.warn("Node has no parent. zIndex parameter is ignored.");
      return this;
    }
    if (zIndex < 0 || zIndex >= this.parent.children.length) {
      Util.warn("Unexpected value " + zIndex + " for zIndex property. zIndex is just index of a node in children of its parent. Expected value is from 0 to " + (this.parent.children.length - 1) + ".");
    }
    const index = this.index;
    this.parent.children.splice(index, 1);
    this.parent.children.splice(zIndex, 0, this);
    this.parent._setChildrenIndices();
    return this;
  }
  getAbsoluteOpacity() {
    return this._getCache(ABSOLUTE_OPACITY, this._getAbsoluteOpacity);
  }
  _getAbsoluteOpacity() {
    let absOpacity = this.opacity();
    const parent = this.getParent();
    if (parent && !parent._isUnderCache) {
      absOpacity *= parent.getAbsoluteOpacity();
    }
    return absOpacity;
  }
  moveTo(newContainer) {
    if (this.getParent() !== newContainer) {
      this._remove();
      newContainer.add(this);
    }
    return this;
  }
  toObject() {
    let attrs = this.getAttrs(), key, val, getter, defaultValue, nonPlainObject;
    const obj = {
      attrs: {},
      className: this.getClassName()
    };
    for (key in attrs) {
      val = attrs[key];
      nonPlainObject = Util.isObject(val) && !Util._isPlainObject(val) && !Util._isArray(val);
      if (nonPlainObject) {
        continue;
      }
      getter = typeof this[key] === "function" && this[key];
      delete attrs[key];
      defaultValue = getter ? getter.call(this) : null;
      attrs[key] = val;
      if (defaultValue !== val) {
        obj.attrs[key] = val;
      }
    }
    return Util._prepareToStringify(obj);
  }
  toJSON() {
    return JSON.stringify(this.toObject());
  }
  getParent() {
    return this.parent;
  }
  findAncestors(selector, includeSelf, stopNode) {
    const res = [];
    if (includeSelf && this._isMatch(selector)) {
      res.push(this);
    }
    let ancestor = this.parent;
    while (ancestor) {
      if (ancestor === stopNode) {
        return res;
      }
      if (ancestor._isMatch(selector)) {
        res.push(ancestor);
      }
      ancestor = ancestor.parent;
    }
    return res;
  }
  isAncestorOf(node) {
    return false;
  }
  findAncestor(selector, includeSelf, stopNode) {
    return this.findAncestors(selector, includeSelf, stopNode)[0];
  }
  _isMatch(selector) {
    if (!selector) {
      return false;
    }
    if (typeof selector === "function") {
      return selector(this);
    }
    let selectorArr = selector.replace(/ /g, "").split(","), len = selectorArr.length, n, sel;
    for (n = 0; n < len; n++) {
      sel = selectorArr[n];
      if (!Util.isValidSelector(sel)) {
        Util.warn('Selector "' + sel + '" is invalid. Allowed selectors examples are "#foo", ".bar" or "Group".');
        Util.warn('If you have a custom shape with such className, please change it to start with upper letter like "Triangle".');
        Util.warn("Konva is awesome, right?");
      }
      if (sel.charAt(0) === "#") {
        if (this.id() === sel.slice(1)) {
          return true;
        }
      } else if (sel.charAt(0) === ".") {
        if (this.hasName(sel.slice(1))) {
          return true;
        }
      } else if (this.className === sel || this.nodeType === sel) {
        return true;
      }
    }
    return false;
  }
  getLayer() {
    const parent = this.getParent();
    return parent ? parent.getLayer() : null;
  }
  getStage() {
    return this._getCache(STAGE$1, this._getStage);
  }
  _getStage() {
    const parent = this.getParent();
    if (parent) {
      return parent.getStage();
    } else {
      return null;
    }
  }
  fire(eventType, evt = {}, bubble) {
    evt.target = evt.target || this;
    if (bubble) {
      this._fireAndBubble(eventType, evt);
    } else {
      this._fire(eventType, evt);
    }
    return this;
  }
  getAbsoluteTransform(top) {
    if (top) {
      return this._getAbsoluteTransform(top);
    } else {
      return this._getCache(ABSOLUTE_TRANSFORM, this._getAbsoluteTransform);
    }
  }
  _getAbsoluteTransform(top) {
    let at;
    if (top) {
      at = new Transform();
      this._eachAncestorReverse(function(node) {
        const transformsEnabled = node.transformsEnabled();
        if (transformsEnabled === "all") {
          at.multiply(node.getTransform());
        } else if (transformsEnabled === "position") {
          at.translate(node.x() - node.offsetX(), node.y() - node.offsetY());
        }
      }, top);
      return at;
    } else {
      at = this._cache.get(ABSOLUTE_TRANSFORM) || new Transform();
      if (this.parent) {
        this.parent.getAbsoluteTransform().copyInto(at);
      } else {
        at.reset();
      }
      const transformsEnabled = this.transformsEnabled();
      if (transformsEnabled === "all") {
        at.multiply(this.getTransform());
      } else if (transformsEnabled === "position") {
        const x = this.attrs.x || 0;
        const y = this.attrs.y || 0;
        const offsetX = this.attrs.offsetX || 0;
        const offsetY = this.attrs.offsetY || 0;
        at.translate(x - offsetX, y - offsetY);
      }
      at.dirty = false;
      return at;
    }
  }
  getAbsoluteScale(top) {
    let parent = this;
    while (parent) {
      if (parent._isUnderCache) {
        top = parent;
      }
      parent = parent.getParent();
    }
    const transform = this.getAbsoluteTransform(top);
    const attrs = transform.decompose();
    return {
      x: attrs.scaleX,
      y: attrs.scaleY
    };
  }
  getAbsoluteRotation() {
    return this.getAbsoluteTransform().decompose().rotation;
  }
  getTransform() {
    return this._getCache(TRANSFORM, this._getTransform);
  }
  _getTransform() {
    var _a, _b;
    const m = this._cache.get(TRANSFORM) || new Transform();
    m.reset();
    const x = this.x(), y = this.y(), rotation = Konva$2.getAngle(this.rotation()), scaleX = (_a = this.attrs.scaleX) !== null && _a !== void 0 ? _a : 1, scaleY = (_b = this.attrs.scaleY) !== null && _b !== void 0 ? _b : 1, skewX = this.attrs.skewX || 0, skewY = this.attrs.skewY || 0, offsetX = this.attrs.offsetX || 0, offsetY = this.attrs.offsetY || 0;
    if (x !== 0 || y !== 0) {
      m.translate(x, y);
    }
    if (rotation !== 0) {
      m.rotate(rotation);
    }
    if (skewX !== 0 || skewY !== 0) {
      m.skew(skewX, skewY);
    }
    if (scaleX !== 1 || scaleY !== 1) {
      m.scale(scaleX, scaleY);
    }
    if (offsetX !== 0 || offsetY !== 0) {
      m.translate(-1 * offsetX, -1 * offsetY);
    }
    m.dirty = false;
    return m;
  }
  clone(obj) {
    let attrs = Util.cloneObject(this.attrs), key, allListeners, len, n, listener;
    for (key in obj) {
      attrs[key] = obj[key];
    }
    const node = new this.constructor(attrs);
    for (key in this.eventListeners) {
      allListeners = this.eventListeners[key];
      len = allListeners.length;
      for (n = 0; n < len; n++) {
        listener = allListeners[n];
        if (listener.name.indexOf(KONVA) < 0) {
          if (!node.eventListeners[key]) {
            node.eventListeners[key] = [];
          }
          node.eventListeners[key].push(listener);
        }
      }
    }
    return node;
  }
  _toKonvaCanvas(config) {
    config = config || {};
    const box = this.getClientRect();
    const stage = this.getStage(), x = config.x !== void 0 ? config.x : Math.floor(box.x), y = config.y !== void 0 ? config.y : Math.floor(box.y), pixelRatio = config.pixelRatio || 1, canvas = new SceneCanvas({
      width: config.width || Math.ceil(box.width) || (stage ? stage.width() : 0),
      height: config.height || Math.ceil(box.height) || (stage ? stage.height() : 0),
      pixelRatio
    }), context = canvas.getContext();
    const bufferCanvas = new SceneCanvas({
      width: canvas.width / canvas.pixelRatio + Math.abs(x),
      height: canvas.height / canvas.pixelRatio + Math.abs(y),
      pixelRatio: canvas.pixelRatio
    });
    if (config.imageSmoothingEnabled === false) {
      context._context.imageSmoothingEnabled = false;
    }
    context.save();
    if (x || y) {
      context.translate(-1 * x, -1 * y);
    }
    this.drawScene(canvas, void 0, bufferCanvas);
    context.restore();
    return canvas;
  }
  toCanvas(config) {
    return this._toKonvaCanvas(config)._canvas;
  }
  toDataURL(config) {
    config = config || {};
    const mimeType = config.mimeType || null, quality = config.quality || null;
    const url = this._toKonvaCanvas(config).toDataURL(mimeType, quality);
    if (config.callback) {
      config.callback(url);
    }
    return url;
  }
  toImage(config) {
    return new Promise((resolve, reject) => {
      try {
        const callback = config === null || config === void 0 ? void 0 : config.callback;
        if (callback)
          delete config.callback;
        Util._urlToImage(this.toDataURL(config), function(img) {
          resolve(img);
          callback === null || callback === void 0 ? void 0 : callback(img);
        });
      } catch (err) {
        reject(err);
      }
    });
  }
  toBlob(config) {
    return new Promise((resolve, reject) => {
      try {
        const callback = config === null || config === void 0 ? void 0 : config.callback;
        if (callback)
          delete config.callback;
        this.toCanvas(config).toBlob((blob) => {
          resolve(blob);
          callback === null || callback === void 0 ? void 0 : callback(blob);
        }, config === null || config === void 0 ? void 0 : config.mimeType, config === null || config === void 0 ? void 0 : config.quality);
      } catch (err) {
        reject(err);
      }
    });
  }
  setSize(size) {
    this.width(size.width);
    this.height(size.height);
    return this;
  }
  getSize() {
    return {
      width: this.width(),
      height: this.height()
    };
  }
  getClassName() {
    return this.className || this.nodeType;
  }
  getType() {
    return this.nodeType;
  }
  getDragDistance() {
    if (this.attrs.dragDistance !== void 0) {
      return this.attrs.dragDistance;
    } else if (this.parent) {
      return this.parent.getDragDistance();
    } else {
      return Konva$2.dragDistance;
    }
  }
  _off(type, name, callback) {
    let evtListeners = this.eventListeners[type], i, evtName, handler;
    for (i = 0; i < evtListeners.length; i++) {
      evtName = evtListeners[i].name;
      handler = evtListeners[i].handler;
      if ((evtName !== "konva" || name === "konva") && (!name || evtName === name) && (!callback || callback === handler)) {
        evtListeners.splice(i, 1);
        if (evtListeners.length === 0) {
          delete this.eventListeners[type];
          break;
        }
        i--;
      }
    }
  }
  _fireChangeEvent(attr, oldVal, newVal) {
    this._fire(attr + CHANGE, {
      oldVal,
      newVal
    });
  }
  addName(name) {
    if (!this.hasName(name)) {
      const oldName = this.name();
      const newName = oldName ? oldName + " " + name : name;
      this.name(newName);
    }
    return this;
  }
  hasName(name) {
    if (!name) {
      return false;
    }
    const fullName = this.name();
    if (!fullName) {
      return false;
    }
    const names = (fullName || "").split(/\s/g);
    return names.indexOf(name) !== -1;
  }
  removeName(name) {
    const names = (this.name() || "").split(/\s/g);
    const index = names.indexOf(name);
    if (index !== -1) {
      names.splice(index, 1);
      this.name(names.join(" "));
    }
    return this;
  }
  setAttr(attr, val) {
    const func = this[SET + Util._capitalize(attr)];
    if (Util._isFunction(func)) {
      func.call(this, val);
    } else {
      this._setAttr(attr, val);
    }
    return this;
  }
  _requestDraw() {
    if (Konva$2.autoDrawEnabled) {
      const drawNode = this.getLayer() || this.getStage();
      drawNode === null || drawNode === void 0 ? void 0 : drawNode.batchDraw();
    }
  }
  _setAttr(key, val) {
    const oldVal = this.attrs[key];
    if (oldVal === val && !Util.isObject(val)) {
      return;
    }
    if (val === void 0 || val === null) {
      delete this.attrs[key];
    } else {
      this.attrs[key] = val;
    }
    if (this._shouldFireChangeEvents) {
      this._fireChangeEvent(key, oldVal, val);
    }
    this._requestDraw();
  }
  _setComponentAttr(key, component, val) {
    let oldVal;
    if (val !== void 0) {
      oldVal = this.attrs[key];
      if (!oldVal) {
        this.attrs[key] = this.getAttr(key);
      }
      this.attrs[key][component] = val;
      this._fireChangeEvent(key, oldVal, val);
    }
  }
  _fireAndBubble(eventType, evt, compareShape) {
    if (evt && this.nodeType === SHAPE) {
      evt.target = this;
    }
    const nonBubbling = [
      MOUSEENTER$1,
      MOUSELEAVE$1,
      POINTERENTER$1,
      POINTERLEAVE$1,
      TOUCHENTER,
      TOUCHLEAVE
    ];
    const shouldStop = nonBubbling.indexOf(eventType) !== -1 && (compareShape && (this === compareShape || this.isAncestorOf && this.isAncestorOf(compareShape)) || this.nodeType === "Stage" && !compareShape);
    if (!shouldStop) {
      this._fire(eventType, evt);
      const stopBubble = nonBubbling.indexOf(eventType) !== -1 && compareShape && compareShape.isAncestorOf && compareShape.isAncestorOf(this) && !compareShape.isAncestorOf(this.parent);
      if ((evt && !evt.cancelBubble || !evt) && this.parent && this.parent.isListening() && !stopBubble) {
        if (compareShape && compareShape.parent) {
          this._fireAndBubble.call(this.parent, eventType, evt, compareShape);
        } else {
          this._fireAndBubble.call(this.parent, eventType, evt);
        }
      }
    }
  }
  _getProtoListeners(eventType) {
    var _a, _b;
    const { nodeType } = this;
    const allListeners = Node.protoListenerMap.get(nodeType) || {};
    let events = allListeners === null || allListeners === void 0 ? void 0 : allListeners[eventType];
    if (events === void 0) {
      events = [];
      let obj = Object.getPrototypeOf(this);
      while (obj) {
        const hierarchyEvents = (_b = (_a = obj.eventListeners) === null || _a === void 0 ? void 0 : _a[eventType]) !== null && _b !== void 0 ? _b : [];
        events.push(...hierarchyEvents);
        obj = Object.getPrototypeOf(obj);
      }
      allListeners[eventType] = events;
      Node.protoListenerMap.set(nodeType, allListeners);
    }
    return events;
  }
  _fire(eventType, evt) {
    evt = evt || {};
    evt.currentTarget = this;
    evt.type = eventType;
    const topListeners = this._getProtoListeners(eventType);
    if (topListeners) {
      const list = topListeners.slice();
      for (let i = 0; i < list.length; i++) {
        list[i].handler.call(this, evt);
      }
    }
    const selfListeners = this.eventListeners[eventType];
    if (selfListeners) {
      const list = selfListeners.slice();
      const origLen = list.length;
      for (let i = 0; i < list.length; i++) {
        list[i].handler.call(this, evt);
      }
      const liveListeners = this.eventListeners[eventType];
      if (liveListeners) {
        for (let i = origLen; i < liveListeners.length; i++) {
          liveListeners[i].handler.call(this, evt);
        }
      }
    }
  }
  draw() {
    this.drawScene();
    this.drawHit();
    return this;
  }
  _createDragElement(evt) {
    const pointerId = evt ? evt.pointerId : void 0;
    const stage = this.getStage();
    const ap = this.getAbsolutePosition();
    if (!stage) {
      return;
    }
    const pos = stage._getPointerById(pointerId) || stage._changedPointerPositions[0] || ap;
    DD._dragElements.set(this._id, {
      node: this,
      startPointerPos: pos,
      offset: {
        x: pos.x - ap.x,
        y: pos.y - ap.y
      },
      dragStatus: "ready",
      pointerId,
      startEvent: evt
    });
  }
  startDrag(evt, bubbleEvent = true) {
    if (!DD._dragElements.has(this._id)) {
      this._createDragElement(evt);
    }
    const elem = DD._dragElements.get(this._id);
    elem.dragStatus = "dragging";
    this.fire("dragstart", {
      type: "dragstart",
      target: this,
      evt: elem.startEvent && elem.startEvent.evt || evt && evt.evt
    }, bubbleEvent);
  }
  _setDragPosition(evt, elem) {
    const pos = this.getStage()._getPointerById(elem.pointerId);
    if (!pos) {
      return;
    }
    let newNodePos = {
      x: pos.x - elem.offset.x,
      y: pos.y - elem.offset.y
    };
    const dbf = this.dragBoundFunc();
    if (dbf !== void 0) {
      const bounded = dbf.call(this, newNodePos, evt);
      if (!bounded) {
        Util.warn("dragBoundFunc did not return any value. That is unexpected behavior. You must return new absolute position from dragBoundFunc.");
      } else {
        newNodePos = bounded;
      }
    }
    if (!this._lastPos || this._lastPos.x !== newNodePos.x || this._lastPos.y !== newNodePos.y) {
      this.setAbsolutePosition(newNodePos);
      this._requestDraw();
    }
    this._lastPos = newNodePos;
  }
  stopDrag(evt) {
    const elem = DD._dragElements.get(this._id);
    if (elem) {
      elem.dragStatus = "stopped";
    }
    DD._endDragBefore(evt);
    DD._endDragAfter(evt);
  }
  setDraggable(draggable) {
    this._setAttr("draggable", draggable);
    this._dragChange();
  }
  isDragging() {
    const elem = DD._dragElements.get(this._id);
    return elem ? elem.dragStatus === "dragging" : false;
  }
  _listenDrag() {
    this._dragCleanup();
    this.on("mousedown.konva touchstart.konva", function(evt) {
      const shouldCheckButton = evt.evt["button"] !== void 0;
      const canDrag = !shouldCheckButton || Konva$2.dragButtons.indexOf(evt.evt["button"]) >= 0;
      if (!canDrag) {
        return;
      }
      if (this.isDragging()) {
        return;
      }
      let hasDraggingChild = false;
      DD._dragElements.forEach((elem) => {
        if (this.isAncestorOf(elem.node)) {
          hasDraggingChild = true;
        }
      });
      if (!hasDraggingChild) {
        this._createDragElement(evt);
      }
    });
  }
  _dragChange() {
    if (this.attrs.draggable) {
      this._listenDrag();
    } else {
      this._dragCleanup();
      const stage = this.getStage();
      if (!stage) {
        return;
      }
      const dragElement = DD._dragElements.get(this._id);
      const isDragging = dragElement && dragElement.dragStatus === "dragging";
      const isReady = dragElement && dragElement.dragStatus === "ready";
      if (isDragging) {
        this.stopDrag();
      } else if (isReady) {
        DD._dragElements.delete(this._id);
      }
    }
  }
  _dragCleanup() {
    this.off("mousedown.konva");
    this.off("touchstart.konva");
  }
  isClientRectOnScreen(margin = { x: 0, y: 0 }) {
    const stage = this.getStage();
    if (!stage) {
      return false;
    }
    const screenRect = {
      x: -margin.x,
      y: -margin.y,
      width: stage.width() + 2 * margin.x,
      height: stage.height() + 2 * margin.y
    };
    return Util.haveIntersection(screenRect, this.getClientRect());
  }
  static create(data, container) {
    if (Util._isString(data)) {
      data = JSON.parse(data);
    }
    return this._createNode(data, container);
  }
  static _createNode(obj, container) {
    let className = Node.prototype.getClassName.call(obj), children = obj.children, no, len, n;
    if (container) {
      obj.attrs.container = container;
    }
    if (!Konva$2[className]) {
      Util.warn('Can not find a node with class name "' + className + '". Fallback to "Shape".');
      className = "Shape";
    }
    const Class = Konva$2[className];
    no = new Class(obj.attrs);
    if (children) {
      len = children.length;
      for (n = 0; n < len; n++) {
        no.add(Node._createNode(children[n]));
      }
    }
    return no;
  }
}
Node.protoListenerMap = /* @__PURE__ */ new Map();
Node.prototype.nodeType = "Node";
Node.prototype._attrsAffectingSize = [];
Node.prototype.eventListeners = {};
Node.prototype.on(TRANSFORM_CHANGE_STR$1, function() {
  if (this._batchingTransformChange) {
    this._needClearTransformCache = true;
    return;
  }
  this._clearCache(TRANSFORM);
  this._clearSelfAndDescendantCache(ABSOLUTE_TRANSFORM);
});
Node.prototype.on("visibleChange.konva", function() {
  this._clearSelfAndDescendantCache(VISIBLE);
});
Node.prototype.on("listeningChange.konva", function() {
  this._clearSelfAndDescendantCache(LISTENING);
});
Node.prototype.on("opacityChange.konva", function() {
  this._clearSelfAndDescendantCache(ABSOLUTE_OPACITY);
});
const addGetterSetter = Factory.addGetterSetter;
addGetterSetter(Node, "zIndex");
addGetterSetter(Node, "absolutePosition");
addGetterSetter(Node, "position");
addGetterSetter(Node, "x", 0, getNumberValidator());
addGetterSetter(Node, "y", 0, getNumberValidator());
addGetterSetter(Node, "globalCompositeOperation", "source-over", getStringValidator());
addGetterSetter(Node, "opacity", 1, getNumberValidator());
addGetterSetter(Node, "name", "", getStringValidator());
addGetterSetter(Node, "id", "", getStringValidator());
addGetterSetter(Node, "rotation", 0, getNumberValidator());
Factory.addComponentsGetterSetter(Node, "scale", ["x", "y"]);
addGetterSetter(Node, "scaleX", 1, getNumberValidator());
addGetterSetter(Node, "scaleY", 1, getNumberValidator());
Factory.addComponentsGetterSetter(Node, "skew", ["x", "y"]);
addGetterSetter(Node, "skewX", 0, getNumberValidator());
addGetterSetter(Node, "skewY", 0, getNumberValidator());
Factory.addComponentsGetterSetter(Node, "offset", ["x", "y"]);
addGetterSetter(Node, "offsetX", 0, getNumberValidator());
addGetterSetter(Node, "offsetY", 0, getNumberValidator());
addGetterSetter(Node, "dragDistance", void 0, getNumberValidator());
addGetterSetter(Node, "width", 0, getNumberValidator());
addGetterSetter(Node, "height", 0, getNumberValidator());
addGetterSetter(Node, "listening", true, getBooleanValidator());
addGetterSetter(Node, "preventDefault", true, getBooleanValidator());
addGetterSetter(Node, "filters", void 0, function(val) {
  this._filterUpToDate = false;
  return val;
});
addGetterSetter(Node, "visible", true, getBooleanValidator());
addGetterSetter(Node, "transformsEnabled", "all", getStringValidator());
addGetterSetter(Node, "size");
addGetterSetter(Node, "dragBoundFunc");
addGetterSetter(Node, "draggable", false, getBooleanValidator());
Factory.backCompat(Node, {
  rotateDeg: "rotate",
  setRotationDeg: "setRotation",
  getRotationDeg: "getRotation"
});

class Container extends Node {
  constructor() {
    super(...arguments);
    this.children = [];
  }
  getChildren(filterFunc) {
    const children = this.children || [];
    if (filterFunc) {
      return children.filter(filterFunc);
    }
    return children;
  }
  hasChildren() {
    return this.getChildren().length > 0;
  }
  removeChildren() {
    this.getChildren().forEach((child) => {
      child.parent = null;
      child.index = 0;
      child.remove();
    });
    this.children = [];
    this._requestDraw();
    return this;
  }
  destroyChildren() {
    this.getChildren().forEach((child) => {
      child.parent = null;
      child.index = 0;
      child.destroy();
    });
    this.children = [];
    this._requestDraw();
    return this;
  }
  add(...children) {
    if (children.length === 0) {
      return this;
    }
    if (children.length > 1) {
      for (let i = 0; i < children.length; i++) {
        this.add(children[i]);
      }
      return this;
    }
    const child = children[0];
    if (child.getParent()) {
      child.moveTo(this);
      return this;
    }
    this._validateAdd(child);
    child.index = this.getChildren().length;
    child.parent = this;
    child._clearCaches();
    this.getChildren().push(child);
    this._fire("add", {
      child
    });
    this._requestDraw();
    return this;
  }
  destroy() {
    if (this.hasChildren()) {
      this.destroyChildren();
    }
    super.destroy();
    return this;
  }
  find(selector) {
    return this._generalFind(selector, false);
  }
  findOne(selector) {
    const result = this._generalFind(selector, true);
    return result.length > 0 ? result[0] : void 0;
  }
  _generalFind(selector, findOne) {
    const retArr = [];
    this._descendants((node) => {
      const valid = node._isMatch(selector);
      if (valid) {
        retArr.push(node);
      }
      if (valid && findOne) {
        return true;
      }
      return false;
    });
    return retArr;
  }
  _descendants(fn) {
    let shouldStop = false;
    const children = this.getChildren();
    for (const child of children) {
      shouldStop = fn(child);
      if (shouldStop) {
        return true;
      }
      if (!child.hasChildren()) {
        continue;
      }
      shouldStop = child._descendants(fn);
      if (shouldStop) {
        return true;
      }
    }
    return false;
  }
  toObject() {
    const obj = Node.prototype.toObject.call(this);
    obj.children = [];
    this.getChildren().forEach((child) => {
      obj.children.push(child.toObject());
    });
    return obj;
  }
  isAncestorOf(node) {
    let parent = node.getParent();
    while (parent) {
      if (parent._id === this._id) {
        return true;
      }
      parent = parent.getParent();
    }
    return false;
  }
  clone(obj) {
    const node = Node.prototype.clone.call(this, obj);
    this.getChildren().forEach(function(no) {
      node.add(no.clone());
    });
    return node;
  }
  getAllIntersections(pos) {
    const arr = [];
    this.find("Shape").forEach((shape) => {
      if (shape.isVisible() && shape.intersects(pos)) {
        arr.push(shape);
      }
    });
    return arr;
  }
  _clearSelfAndDescendantCache(attr) {
    var _a;
    super._clearSelfAndDescendantCache(attr);
    if (this.isCached()) {
      return;
    }
    (_a = this.children) === null || _a === void 0 ? void 0 : _a.forEach(function(node) {
      node._clearSelfAndDescendantCache(attr);
    });
  }
  _setChildrenIndices() {
    var _a;
    (_a = this.children) === null || _a === void 0 ? void 0 : _a.forEach(function(child, n) {
      child.index = n;
    });
    this._requestDraw();
  }
  drawScene(can, top, bufferCanvas) {
    const layer = this.getLayer(), canvas = can || layer && layer.getCanvas(), context = canvas && canvas.getContext(), cachedCanvas = this._getCanvasCache(), cachedSceneCanvas = cachedCanvas && cachedCanvas.scene;
    const caching = canvas && canvas.isCache;
    if (!this.isVisible() && !caching) {
      return this;
    }
    if (cachedSceneCanvas) {
      context.save();
      const m = this.getAbsoluteTransform(top).getMatrix();
      context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
      this._drawCachedSceneCanvas(context);
      context.restore();
    } else {
      this._drawChildren("drawScene", canvas, top, bufferCanvas);
    }
    return this;
  }
  drawHit(can, top) {
    if (!this.shouldDrawHit(top)) {
      return this;
    }
    const layer = this.getLayer(), canvas = can || layer && layer.hitCanvas, context = canvas && canvas.getContext(), cachedCanvas = this._getCanvasCache(), cachedHitCanvas = cachedCanvas && cachedCanvas.hit;
    if (cachedHitCanvas) {
      context.save();
      const m = this.getAbsoluteTransform(top).getMatrix();
      context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
      this._drawCachedHitCanvas(context);
      context.restore();
    } else {
      this._drawChildren("drawHit", canvas, top);
    }
    return this;
  }
  _drawChildren(drawMethod, canvas, top, bufferCanvas) {
    var _a;
    const context = canvas && canvas.getContext(), clipWidth = this.clipWidth(), clipHeight = this.clipHeight(), clipFunc = this.clipFunc(), hasClip = typeof clipWidth === "number" && typeof clipHeight === "number" || clipFunc;
    const selfCache = top === this;
    if (hasClip) {
      context.save();
      const transform = this.getAbsoluteTransform(top);
      let m = transform.getMatrix();
      context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
      context.beginPath();
      let clipArgs;
      if (clipFunc) {
        clipArgs = clipFunc.call(this, context, this);
      } else {
        const clipX = this.clipX();
        const clipY = this.clipY();
        context.rect(clipX || 0, clipY || 0, clipWidth, clipHeight);
      }
      context.clip.apply(context, clipArgs);
      m = transform.copy().invert().getMatrix();
      context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
    }
    const hasComposition = !selfCache && this.globalCompositeOperation() !== "source-over" && drawMethod === "drawScene";
    if (hasComposition) {
      context.save();
      context._applyGlobalCompositeOperation(this);
    }
    (_a = this.children) === null || _a === void 0 ? void 0 : _a.forEach(function(child) {
      child[drawMethod](canvas, top, bufferCanvas);
    });
    if (hasComposition) {
      context.restore();
    }
    if (hasClip) {
      context.restore();
    }
  }
  getClientRect(config = {}) {
    var _a;
    const skipTransform = config.skipTransform;
    const relativeTo = config.relativeTo;
    let minX, minY, maxX, maxY;
    let selfRect = {
      x: Infinity,
      y: Infinity,
      width: 0,
      height: 0
    };
    const that = this;
    (_a = this.children) === null || _a === void 0 ? void 0 : _a.forEach(function(child) {
      if (!child.visible()) {
        return;
      }
      const rect = child.getClientRect({
        relativeTo: that,
        skipShadow: config.skipShadow,
        skipStroke: config.skipStroke
      });
      if (rect.width === 0 && rect.height === 0) {
        return;
      }
      if (minX === void 0) {
        minX = rect.x;
        minY = rect.y;
        maxX = rect.x + rect.width;
        maxY = rect.y + rect.height;
      } else {
        minX = Math.min(minX, rect.x);
        minY = Math.min(minY, rect.y);
        maxX = Math.max(maxX, rect.x + rect.width);
        maxY = Math.max(maxY, rect.y + rect.height);
      }
    });
    const shapes = this.find("Shape");
    let hasVisible = false;
    for (let i = 0; i < shapes.length; i++) {
      const shape = shapes[i];
      if (shape._isVisible(this)) {
        hasVisible = true;
        break;
      }
    }
    if (hasVisible && minX !== void 0) {
      selfRect = {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY
      };
    } else {
      selfRect = {
        x: 0,
        y: 0,
        width: 0,
        height: 0
      };
    }
    if (!skipTransform) {
      return this._transformedRect(selfRect, relativeTo);
    }
    return selfRect;
  }
}
Factory.addComponentsGetterSetter(Container, "clip", [
  "x",
  "y",
  "width",
  "height"
]);
Factory.addGetterSetter(Container, "clipX", void 0, getNumberValidator());
Factory.addGetterSetter(Container, "clipY", void 0, getNumberValidator());
Factory.addGetterSetter(Container, "clipWidth", void 0, getNumberValidator());
Factory.addGetterSetter(Container, "clipHeight", void 0, getNumberValidator());
Factory.addGetterSetter(Container, "clipFunc");

const Captures = /* @__PURE__ */ new Map();
const SUPPORT_POINTER_EVENTS = Konva$2._global["PointerEvent"] !== void 0;
function getCapturedShape(pointerId) {
  return Captures.get(pointerId);
}
function createEvent(evt) {
  return {
    evt,
    pointerId: evt.pointerId
  };
}
function hasPointerCapture(pointerId, shape) {
  return Captures.get(pointerId) === shape;
}
function setPointerCapture(pointerId, shape) {
  releaseCapture(pointerId);
  const stage = shape.getStage();
  if (!stage)
    return;
  Captures.set(pointerId, shape);
  if (SUPPORT_POINTER_EVENTS) {
    shape._fire("gotpointercapture", createEvent(new PointerEvent("gotpointercapture")));
  }
}
function releaseCapture(pointerId, target) {
  const shape = Captures.get(pointerId);
  if (!shape)
    return;
  const stage = shape.getStage();
  if (stage && stage.content) ;
  Captures.delete(pointerId);
  if (SUPPORT_POINTER_EVENTS) {
    shape._fire("lostpointercapture", createEvent(new PointerEvent("lostpointercapture")));
  }
}

const STAGE = 'Stage', STRING = 'string', PX = 'px', MOUSEOUT = 'mouseout', MOUSELEAVE = 'mouseleave', MOUSEOVER = 'mouseover', MOUSEENTER = 'mouseenter', MOUSEMOVE = 'mousemove', MOUSEDOWN = 'mousedown', MOUSEUP = 'mouseup', POINTERMOVE = 'pointermove', POINTERDOWN = 'pointerdown', POINTERUP = 'pointerup', POINTERCANCEL = 'pointercancel', LOSTPOINTERCAPTURE = 'lostpointercapture', POINTEROUT = 'pointerout', POINTERLEAVE = 'pointerleave', POINTEROVER = 'pointerover', POINTERENTER = 'pointerenter', CONTEXTMENU = 'contextmenu', TOUCHSTART = 'touchstart', TOUCHEND = 'touchend', TOUCHMOVE = 'touchmove', TOUCHCANCEL = 'touchcancel', WHEEL = 'wheel', MAX_LAYERS_NUMBER = 5, EVENTS = [
    [MOUSEENTER, '_pointerenter'],
    [MOUSEDOWN, '_pointerdown'],
    [MOUSEMOVE, '_pointermove'],
    [MOUSEUP, '_pointerup'],
    [MOUSELEAVE, '_pointerleave'],
    [TOUCHSTART, '_pointerdown'],
    [TOUCHMOVE, '_pointermove'],
    [TOUCHEND, '_pointerup'],
    [TOUCHCANCEL, '_pointercancel'],
    [MOUSEOVER, '_pointerover'],
    [WHEEL, '_wheel'],
    [CONTEXTMENU, '_contextmenu'],
    [POINTERDOWN, '_pointerdown'],
    [POINTERMOVE, '_pointermove'],
    [POINTERUP, '_pointerup'],
    [POINTERCANCEL, '_pointercancel'],
    [POINTERLEAVE, '_pointerleave'],
    [LOSTPOINTERCAPTURE, '_lostpointercapture'],
];
const EVENTS_MAP = {
    mouse: {
        [POINTEROUT]: MOUSEOUT,
        [POINTERLEAVE]: MOUSELEAVE,
        [POINTEROVER]: MOUSEOVER,
        [POINTERENTER]: MOUSEENTER,
        [POINTERMOVE]: MOUSEMOVE,
        [POINTERDOWN]: MOUSEDOWN,
        [POINTERUP]: MOUSEUP,
        [POINTERCANCEL]: 'mousecancel',
        pointerclick: 'click',
        pointerdblclick: 'dblclick',
    },
    touch: {
        [POINTEROUT]: 'touchout',
        [POINTERLEAVE]: 'touchleave',
        [POINTEROVER]: 'touchover',
        [POINTERENTER]: 'touchenter',
        [POINTERMOVE]: TOUCHMOVE,
        [POINTERDOWN]: TOUCHSTART,
        [POINTERUP]: TOUCHEND,
        [POINTERCANCEL]: TOUCHCANCEL,
        pointerclick: 'tap',
        pointerdblclick: 'dbltap',
    },
    pointer: {
        [POINTEROUT]: POINTEROUT,
        [POINTERLEAVE]: POINTERLEAVE,
        [POINTEROVER]: POINTEROVER,
        [POINTERENTER]: POINTERENTER,
        [POINTERMOVE]: POINTERMOVE,
        [POINTERDOWN]: POINTERDOWN,
        [POINTERUP]: POINTERUP,
        [POINTERCANCEL]: POINTERCANCEL,
        pointerclick: 'pointerclick',
        pointerdblclick: 'pointerdblclick',
    },
};
const getEventType = (type) => {
    if (type.indexOf('pointer') >= 0) {
        return 'pointer';
    }
    if (type.indexOf('touch') >= 0) {
        return 'touch';
    }
    return 'mouse';
};
const getEventsMap = (eventType) => {
    const type = getEventType(eventType);
    if (type === 'pointer') {
        return Konva$2.pointerEventsEnabled && EVENTS_MAP.pointer;
    }
    if (type === 'touch') {
        return EVENTS_MAP.touch;
    }
    if (type === 'mouse') {
        return EVENTS_MAP.mouse;
    }
};
function checkNoClip(attrs = {}) {
    if (attrs.clipFunc || attrs.clipWidth || attrs.clipHeight) {
        Util.warn('Stage does not support clipping. Please use clip for Layers or Groups.');
    }
    return attrs;
}
const NO_POINTERS_MESSAGE = `Pointer position is missing and not registered by the stage. Looks like it is outside of the stage container. You can set it manually from event: stage.setPointersPositions(event);`;
const stages = [];
let Stage$1 = class Stage extends Container {
    constructor(config) {
        super(checkNoClip(config));
        this._pointerPositions = [];
        this._changedPointerPositions = [];
        this._buildDOM();
        this._bindContentEvents();
        stages.push(this);
        this.on('widthChange.konva heightChange.konva', this._resizeDOM);
        this.on('visibleChange.konva', this._checkVisibility);
        this.on('clipWidthChange.konva clipHeightChange.konva clipFuncChange.konva', () => {
            checkNoClip(this.attrs);
        });
        this._checkVisibility();
    }
    _validateAdd(child) {
        const isLayer = child.getType() === 'Layer';
        const isFastLayer = child.getType() === 'FastLayer';
        const valid = isLayer || isFastLayer;
        if (!valid) {
            Util.throw('You may only add layers to the stage.');
        }
    }
    _checkVisibility() {
        if (!this.content) {
            return;
        }
        const style = this.visible() ? '' : 'none';
        this.content.style.display = style;
    }
    setContainer(container) {
        if (typeof container === STRING) {
            let id;
            if (container.charAt(0) === '.') {
                const className = container.slice(1);
                container = document.getElementsByClassName(className)[0];
            }
            else {
                if (container.charAt(0) !== '#') {
                    id = container;
                }
                else {
                    id = container.slice(1);
                }
                container = document.getElementById(id);
            }
            if (!container) {
                throw 'Can not find container in document with id ' + id;
            }
        }
        this._setAttr('container', container);
        if (this.content) {
            if (this.content.parentElement) {
                this.content.parentElement.removeChild(this.content);
            }
            container.appendChild(this.content);
        }
        return this;
    }
    shouldDrawHit() {
        return true;
    }
    clear() {
        const layers = this.children, len = layers.length;
        for (let n = 0; n < len; n++) {
            layers[n].clear();
        }
        return this;
    }
    clone(obj) {
        if (!obj) {
            obj = {};
        }
        obj.container =
            typeof document !== 'undefined' && document.createElement('div');
        return Container.prototype.clone.call(this, obj);
    }
    destroy() {
        super.destroy();
        const content = this.content;
        if (content && Util._isInDocument(content)) {
            this.container().removeChild(content);
        }
        const index = stages.indexOf(this);
        if (index > -1) {
            stages.splice(index, 1);
        }
        Util.releaseCanvas(this.bufferCanvas._canvas, this.bufferHitCanvas._canvas);
        return this;
    }
    getPointerPosition() {
        const pos = this._pointerPositions[0] || this._changedPointerPositions[0];
        if (!pos) {
            Util.warn(NO_POINTERS_MESSAGE);
            return null;
        }
        return {
            x: pos.x,
            y: pos.y,
        };
    }
    _getPointerById(id) {
        return this._pointerPositions.find((p) => p.id === id);
    }
    getPointersPositions() {
        return this._pointerPositions;
    }
    getStage() {
        return this;
    }
    getContent() {
        return this.content;
    }
    _toKonvaCanvas(config) {
        config = { ...config };
        config.x = config.x || 0;
        config.y = config.y || 0;
        config.width = config.width || this.width();
        config.height = config.height || this.height();
        const canvas = new SceneCanvas({
            width: config.width,
            height: config.height,
            pixelRatio: config.pixelRatio || 1,
        });
        const _context = canvas.getContext()._context;
        const layers = this.children;
        if (config.x || config.y) {
            _context.translate(-1 * config.x, -1 * config.y);
        }
        layers.forEach(function (layer) {
            if (!layer.isVisible()) {
                return;
            }
            const layerCanvas = layer._toKonvaCanvas(config);
            _context.drawImage(layerCanvas._canvas, config.x, config.y, layerCanvas.getWidth() / layerCanvas.getPixelRatio(), layerCanvas.getHeight() / layerCanvas.getPixelRatio());
        });
        return canvas;
    }
    getIntersection(pos) {
        if (!pos) {
            return null;
        }
        const layers = this.children, len = layers.length, end = len - 1;
        for (let n = end; n >= 0; n--) {
            const shape = layers[n].getIntersection(pos);
            if (shape) {
                return shape;
            }
        }
        return null;
    }
    _resizeDOM() {
        const width = this.width();
        const height = this.height();
        if (this.content) {
            this.content.style.width = width + PX;
            this.content.style.height = height + PX;
        }
        this.bufferCanvas.setSize(width, height);
        this.bufferHitCanvas.setSize(width, height);
        this.children.forEach((layer) => {
            layer.setSize({ width, height });
            layer.draw();
        });
    }
    add(layer, ...rest) {
        if (arguments.length > 1) {
            for (let i = 0; i < arguments.length; i++) {
                this.add(arguments[i]);
            }
            return this;
        }
        super.add(layer);
        const length = this.children.length;
        if (length > MAX_LAYERS_NUMBER) {
            Util.warn('The stage has ' +
                length +
                ' layers. Recommended maximum number of layers is 3-5. Adding more layers into the stage may drop the performance. Rethink your tree structure, you can use Konva.Group.');
        }
        layer.setSize({ width: this.width(), height: this.height() });
        layer.draw();
        if (Konva$2.isBrowser) {
            this.content.appendChild(layer.canvas._canvas);
        }
        return this;
    }
    getParent() {
        return null;
    }
    getLayer() {
        return null;
    }
    hasPointerCapture(pointerId) {
        return hasPointerCapture(pointerId, this);
    }
    setPointerCapture(pointerId) {
        setPointerCapture(pointerId, this);
    }
    releaseCapture(pointerId) {
        releaseCapture(pointerId);
    }
    getLayers() {
        return this.children;
    }
    _bindContentEvents() {
        if (!Konva$2.isBrowser) {
            return;
        }
        EVENTS.forEach(([event, methodName]) => {
            this.content.addEventListener(event, (evt) => {
                this[methodName](evt);
            }, { passive: false });
        });
    }
    _pointerenter(evt) {
        this.setPointersPositions(evt);
        const events = getEventsMap(evt.type);
        if (events) {
            this._fire(events.pointerenter, {
                evt: evt,
                target: this,
                currentTarget: this,
            });
        }
    }
    _pointerover(evt) {
        this.setPointersPositions(evt);
        const events = getEventsMap(evt.type);
        if (events) {
            this._fire(events.pointerover, {
                evt: evt,
                target: this,
                currentTarget: this,
            });
        }
    }
    _getTargetShape(evenType) {
        let shape = this[evenType + 'targetShape'];
        if (shape && !shape.getStage()) {
            shape = null;
        }
        return shape;
    }
    _pointerleave(evt) {
        const events = getEventsMap(evt.type);
        const eventType = getEventType(evt.type);
        if (!events) {
            return;
        }
        this.setPointersPositions(evt);
        const targetShape = this._getTargetShape(eventType);
        const eventsEnabled = !(Konva$2.isDragging() || Konva$2.isTransforming()) || Konva$2.hitOnDragEnabled;
        if (targetShape && eventsEnabled) {
            targetShape._fireAndBubble(events.pointerout, { evt: evt });
            targetShape._fireAndBubble(events.pointerleave, { evt: evt });
            this._fire(events.pointerleave, {
                evt: evt,
                target: this,
                currentTarget: this,
            });
            this[eventType + 'targetShape'] = null;
        }
        else if (eventsEnabled) {
            this._fire(events.pointerleave, {
                evt: evt,
                target: this,
                currentTarget: this,
            });
            this._fire(events.pointerout, {
                evt: evt,
                target: this,
                currentTarget: this,
            });
        }
        this.pointerPos = null;
        this._pointerPositions = [];
    }
    _pointerdown(evt) {
        const events = getEventsMap(evt.type);
        const eventType = getEventType(evt.type);
        if (!events) {
            return;
        }
        this.setPointersPositions(evt);
        let triggeredOnShape = false;
        this._changedPointerPositions.forEach((pos) => {
            const shape = this.getIntersection(pos);
            DD.justDragged = false;
            Konva$2['_' + eventType + 'ListenClick'] = true;
            if (!shape || !shape.isListening()) {
                this[eventType + 'ClickStartShape'] = undefined;
                return;
            }
            if (Konva$2.capturePointerEventsEnabled) {
                shape.setPointerCapture(pos.id);
            }
            this[eventType + 'ClickStartShape'] = shape;
            shape._fireAndBubble(events.pointerdown, {
                evt: evt,
                pointerId: pos.id,
            });
            triggeredOnShape = true;
            const isTouch = evt.type.indexOf('touch') >= 0;
            if (shape.preventDefault() && evt.cancelable && isTouch) {
                evt.preventDefault();
            }
        });
        if (!triggeredOnShape) {
            this._fire(events.pointerdown, {
                evt: evt,
                target: this,
                currentTarget: this,
                pointerId: this._pointerPositions[0].id,
            });
        }
    }
    _pointermove(evt) {
        const events = getEventsMap(evt.type);
        const eventType = getEventType(evt.type);
        if (!events) {
            return;
        }
        const isTouchPointer = evt.type.indexOf('touch') >= 0 ||
            evt.pointerType === 'touch';
        if (Konva$2.isDragging() &&
            DD.node.preventDefault() &&
            evt.cancelable &&
            isTouchPointer) {
            evt.preventDefault();
        }
        this.setPointersPositions(evt);
        const eventsEnabled = !(Konva$2.isDragging() || Konva$2.isTransforming()) || Konva$2.hitOnDragEnabled;
        if (!eventsEnabled) {
            return;
        }
        const processedShapesIds = {};
        let triggeredOnShape = false;
        const targetShape = this._getTargetShape(eventType);
        this._changedPointerPositions.forEach((pos) => {
            const shape = (getCapturedShape(pos.id) ||
                this.getIntersection(pos));
            const pointerId = pos.id;
            const event = { evt: evt, pointerId };
            const differentTarget = targetShape !== shape;
            if (differentTarget && targetShape) {
                targetShape._fireAndBubble(events.pointerout, { ...event }, shape);
                targetShape._fireAndBubble(events.pointerleave, { ...event }, shape);
            }
            if (shape) {
                if (processedShapesIds[shape._id]) {
                    return;
                }
                processedShapesIds[shape._id] = true;
            }
            if (shape && shape.isListening()) {
                triggeredOnShape = true;
                if (differentTarget) {
                    shape._fireAndBubble(events.pointerover, { ...event }, targetShape);
                    shape._fireAndBubble(events.pointerenter, { ...event }, targetShape);
                    this[eventType + 'targetShape'] = shape;
                }
                shape._fireAndBubble(events.pointermove, { ...event });
            }
            else {
                if (targetShape) {
                    this._fire(events.pointerover, {
                        evt: evt,
                        target: this,
                        currentTarget: this,
                        pointerId,
                    });
                    this[eventType + 'targetShape'] = null;
                }
            }
        });
        if (!triggeredOnShape) {
            this._fire(events.pointermove, {
                evt: evt,
                target: this,
                currentTarget: this,
                pointerId: this._changedPointerPositions[0].id,
            });
        }
    }
    _pointerup(evt) {
        const events = getEventsMap(evt.type);
        const eventType = getEventType(evt.type);
        if (!events) {
            return;
        }
        this.setPointersPositions(evt);
        const clickStartShape = this[eventType + 'ClickStartShape'];
        const clickEndShape = this[eventType + 'ClickEndShape'];
        const processedShapesIds = {};
        let skipPointerUpTrigger = false;
        this._changedPointerPositions.forEach((pos) => {
            const shape = (getCapturedShape(pos.id) ||
                this.getIntersection(pos));
            if (shape) {
                shape.releaseCapture(pos.id);
                if (processedShapesIds[shape._id]) {
                    return;
                }
                processedShapesIds[shape._id] = true;
            }
            const pointerId = pos.id;
            const event = { evt: evt, pointerId };
            let fireDblClick = false;
            if (Konva$2['_' + eventType + 'InDblClickWindow']) {
                fireDblClick = true;
                clearTimeout(this[eventType + 'DblTimeout']);
            }
            else if (!DD.justDragged) {
                Konva$2['_' + eventType + 'InDblClickWindow'] = true;
                clearTimeout(this[eventType + 'DblTimeout']);
            }
            this[eventType + 'DblTimeout'] = setTimeout(function () {
                Konva$2['_' + eventType + 'InDblClickWindow'] = false;
            }, Konva$2.dblClickWindow);
            if (shape && shape.isListening()) {
                skipPointerUpTrigger = true;
                this[eventType + 'ClickEndShape'] = shape;
                shape._fireAndBubble(events.pointerup, { ...event });
                if (Konva$2['_' + eventType + 'ListenClick'] &&
                    clickStartShape &&
                    clickStartShape === shape) {
                    shape._fireAndBubble(events.pointerclick, { ...event });
                    if (fireDblClick && clickEndShape && clickEndShape === shape) {
                        shape._fireAndBubble(events.pointerdblclick, { ...event });
                    }
                }
            }
            else {
                this[eventType + 'ClickEndShape'] = null;
                if (!skipPointerUpTrigger) {
                    this._fire(events.pointerup, {
                        evt: evt,
                        target: this,
                        currentTarget: this,
                        pointerId: this._changedPointerPositions[0].id,
                    });
                    skipPointerUpTrigger = true;
                }
                if (Konva$2['_' + eventType + 'ListenClick']) {
                    this._fire(events.pointerclick, {
                        evt: evt,
                        target: this,
                        currentTarget: this,
                        pointerId,
                    });
                }
                if (fireDblClick) {
                    this._fire(events.pointerdblclick, {
                        evt: evt,
                        target: this,
                        currentTarget: this,
                        pointerId,
                    });
                }
            }
        });
        if (!skipPointerUpTrigger) {
            this._fire(events.pointerup, {
                evt: evt,
                target: this,
                currentTarget: this,
                pointerId: this._changedPointerPositions[0].id,
            });
        }
        Konva$2['_' + eventType + 'ListenClick'] = false;
        if (evt.cancelable && eventType !== 'touch' && eventType !== 'pointer') {
            evt.preventDefault();
        }
    }
    _contextmenu(evt) {
        this.setPointersPositions(evt);
        const shape = this.getIntersection(this.getPointerPosition());
        if (shape && shape.isListening()) {
            shape._fireAndBubble(CONTEXTMENU, { evt: evt });
        }
        else {
            this._fire(CONTEXTMENU, {
                evt: evt,
                target: this,
                currentTarget: this,
            });
        }
    }
    _wheel(evt) {
        this.setPointersPositions(evt);
        const shape = this.getIntersection(this.getPointerPosition());
        if (shape && shape.isListening()) {
            shape._fireAndBubble(WHEEL, { evt: evt });
        }
        else {
            this._fire(WHEEL, {
                evt: evt,
                target: this,
                currentTarget: this,
            });
        }
    }
    _pointercancel(evt) {
        this.setPointersPositions(evt);
        const shape = getCapturedShape(evt.pointerId) ||
            this.getIntersection(this.getPointerPosition());
        if (shape) {
            shape._fireAndBubble(POINTERUP, createEvent(evt));
        }
        releaseCapture(evt.pointerId);
    }
    _lostpointercapture(evt) {
        releaseCapture(evt.pointerId);
    }
    setPointersPositions(evt) {
        const contentPosition = this._getContentPosition();
        let x = null, y = null;
        evt = evt ? evt : window.event;
        if (evt.touches !== undefined) {
            this._pointerPositions = [];
            this._changedPointerPositions = [];
            Array.prototype.forEach.call(evt.touches, (touch) => {
                this._pointerPositions.push({
                    id: touch.identifier,
                    x: (touch.clientX - contentPosition.left) / contentPosition.scaleX,
                    y: (touch.clientY - contentPosition.top) / contentPosition.scaleY,
                });
            });
            Array.prototype.forEach.call(evt.changedTouches || evt.touches, (touch) => {
                this._changedPointerPositions.push({
                    id: touch.identifier,
                    x: (touch.clientX - contentPosition.left) / contentPosition.scaleX,
                    y: (touch.clientY - contentPosition.top) / contentPosition.scaleY,
                });
            });
        }
        else {
            x = (evt.clientX - contentPosition.left) / contentPosition.scaleX;
            y = (evt.clientY - contentPosition.top) / contentPosition.scaleY;
            this.pointerPos = {
                x: x,
                y: y,
            };
            this._pointerPositions = [{ x, y, id: Util._getFirstPointerId(evt) }];
            this._changedPointerPositions = [
                { x, y, id: Util._getFirstPointerId(evt) },
            ];
        }
    }
    _setPointerPosition(evt) {
        Util.warn('Method _setPointerPosition is deprecated. Use "stage.setPointersPositions(event)" instead.');
        this.setPointersPositions(evt);
    }
    _getContentPosition() {
        if (!this.content || !this.content.getBoundingClientRect) {
            return {
                top: 0,
                left: 0,
                scaleX: 1,
                scaleY: 1,
            };
        }
        const rect = this.content.getBoundingClientRect();
        return {
            top: rect.top,
            left: rect.left,
            scaleX: rect.width / this.content.clientWidth || 1,
            scaleY: rect.height / this.content.clientHeight || 1,
        };
    }
    _buildDOM() {
        this.bufferCanvas = new SceneCanvas({
            width: this.width(),
            height: this.height(),
        });
        this.bufferHitCanvas = new HitCanvas({
            pixelRatio: 1,
            width: this.width(),
            height: this.height(),
        });
        if (!Konva$2.isBrowser) {
            return;
        }
        const container = this.container();
        if (!container) {
            throw 'Stage has no container. A container is required.';
        }
        container.innerHTML = '';
        this.content = document.createElement('div');
        this.content.style.position = 'relative';
        this.content.style.userSelect = 'none';
        this.content.className = 'konvajs-content';
        this.content.setAttribute('role', 'presentation');
        container.appendChild(this.content);
        this._resizeDOM();
    }
    cache() {
        Util.warn('Cache function is not allowed for stage. You may use cache only for layers, groups and shapes.');
        return this;
    }
    clearCache() {
        return this;
    }
    batchDraw() {
        this.getChildren().forEach(function (layer) {
            layer.batchDraw();
        });
        return this;
    }
};
Stage$1.prototype.nodeType = STAGE;
_registerNode(Stage$1);
Factory.addGetterSetter(Stage$1, 'container');
if (Konva$2.isBrowser) {
    document.addEventListener('visibilitychange', () => {
        stages.forEach((stage) => {
            stage.batchDraw();
        });
    });
}

const HAS_SHADOW = 'hasShadow';
const SHADOW_RGBA = 'shadowRGBA';
const patternImage = 'patternImage';
const linearGradient = 'linearGradient';
const radialGradient = 'radialGradient';
let dummyContext$1;
function getDummyContext$1() {
    if (dummyContext$1) {
        return dummyContext$1;
    }
    dummyContext$1 = Util.createCanvasElement().getContext('2d');
    return dummyContext$1;
}
const shapes = {};
function _fillFunc$2(context) {
    const fillRule = this.attrs.fillRule;
    if (fillRule) {
        context.fill(fillRule);
    }
    else {
        context.fill();
    }
}
function _strokeFunc$2(context) {
    context.stroke();
}
function _fillFuncHit(context) {
    const fillRule = this.attrs.fillRule;
    if (fillRule) {
        context.fill(fillRule);
    }
    else {
        context.fill();
    }
}
function _strokeFuncHit(context) {
    context.stroke();
}
function _clearHasShadowCache() {
    this._clearCache(HAS_SHADOW);
}
function _clearGetShadowRGBACache() {
    this._clearCache(SHADOW_RGBA);
}
function _clearFillPatternCache() {
    this._clearCache(patternImage);
}
function _clearLinearGradientCache() {
    this._clearCache(linearGradient);
}
function _clearRadialGradientCache() {
    this._clearCache(radialGradient);
}
class Shape extends Node {
    constructor(config) {
        super(config);
        let key;
        let attempts = 0;
        while (true) {
            key = Util.getHitColor();
            if (key && !(key in shapes)) {
                break;
            }
            attempts++;
            if (attempts >= 10000) {
                Util.warn('Failed to find a unique color key for a shape. Konva may work incorrectly. Most likely your browser is using canvas farbling. Consider disabling it.');
                key = Util.getRandomColor();
                break;
            }
        }
        this.colorKey = key;
        shapes[key] = this;
    }
    getContext() {
        Util.warn('shape.getContext() method is deprecated. Please do not use it.');
        return this.getLayer().getContext();
    }
    getCanvas() {
        Util.warn('shape.getCanvas() method is deprecated. Please do not use it.');
        return this.getLayer().getCanvas();
    }
    getSceneFunc() {
        return this.attrs.sceneFunc || this['_sceneFunc'];
    }
    getHitFunc() {
        return this.attrs.hitFunc || this['_hitFunc'];
    }
    hasShadow() {
        return this._getCache(HAS_SHADOW, this._hasShadow);
    }
    _hasShadow() {
        return (this.shadowEnabled() &&
            this.shadowOpacity() !== 0 &&
            !!(this.shadowColor() ||
                this.shadowBlur() ||
                this.shadowOffsetX() ||
                this.shadowOffsetY()));
    }
    _getFillPattern() {
        return this._getCache(patternImage, this.__getFillPattern);
    }
    __getFillPattern() {
        if (this.fillPatternImage()) {
            const ctx = getDummyContext$1();
            const pattern = ctx.createPattern(this.fillPatternImage(), this.fillPatternRepeat() || 'repeat');
            if (pattern && pattern.setTransform) {
                const tr = new Transform();
                tr.translate(this.fillPatternX(), this.fillPatternY());
                tr.rotate(Konva$2.getAngle(this.fillPatternRotation()));
                tr.scale(this.fillPatternScaleX(), this.fillPatternScaleY());
                tr.translate(-1 * this.fillPatternOffsetX(), -1 * this.fillPatternOffsetY());
                const m = tr.getMatrix();
                const matrix = typeof DOMMatrix === 'undefined'
                    ? {
                        a: m[0],
                        b: m[1],
                        c: m[2],
                        d: m[3],
                        e: m[4],
                        f: m[5],
                    }
                    : new DOMMatrix(m);
                pattern.setTransform(matrix);
            }
            return pattern;
        }
    }
    _getLinearGradient() {
        return this._getCache(linearGradient, this.__getLinearGradient);
    }
    __getLinearGradient() {
        const colorStops = this.fillLinearGradientColorStops();
        if (colorStops) {
            const ctx = getDummyContext$1();
            const start = this.fillLinearGradientStartPoint();
            const end = this.fillLinearGradientEndPoint();
            const grd = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
            for (let n = 0; n < colorStops.length; n += 2) {
                grd.addColorStop(colorStops[n], colorStops[n + 1]);
            }
            return grd;
        }
    }
    _getRadialGradient() {
        return this._getCache(radialGradient, this.__getRadialGradient);
    }
    __getRadialGradient() {
        const colorStops = this.fillRadialGradientColorStops();
        if (colorStops) {
            const ctx = getDummyContext$1();
            const start = this.fillRadialGradientStartPoint();
            const end = this.fillRadialGradientEndPoint();
            const grd = ctx.createRadialGradient(start.x, start.y, this.fillRadialGradientStartRadius(), end.x, end.y, this.fillRadialGradientEndRadius());
            for (let n = 0; n < colorStops.length; n += 2) {
                grd.addColorStop(colorStops[n], colorStops[n + 1]);
            }
            return grd;
        }
    }
    getShadowRGBA() {
        return this._getCache(SHADOW_RGBA, this._getShadowRGBA);
    }
    _getShadowRGBA() {
        if (!this.hasShadow()) {
            return;
        }
        const rgba = Util.colorToRGBA(this.shadowColor());
        if (rgba) {
            return ('rgba(' +
                rgba.r +
                ',' +
                rgba.g +
                ',' +
                rgba.b +
                ',' +
                rgba.a * (this.shadowOpacity() || 1) +
                ')');
        }
    }
    hasFill() {
        return this._calculate('hasFill', [
            'fillEnabled',
            'fill',
            'fillPatternImage',
            'fillLinearGradientColorStops',
            'fillRadialGradientColorStops',
        ], () => {
            return (this.fillEnabled() &&
                !!(this.fill() ||
                    this.fillPatternImage() ||
                    this.fillLinearGradientColorStops() ||
                    this.fillRadialGradientColorStops()));
        });
    }
    hasStroke() {
        return this._calculate('hasStroke', [
            'strokeEnabled',
            'strokeWidth',
            'stroke',
            'strokeLinearGradientColorStops',
        ], () => {
            return (this.strokeEnabled() &&
                this.strokeWidth() &&
                !!(this.stroke() || this.strokeLinearGradientColorStops()));
        });
    }
    hasHitStroke() {
        const width = this.hitStrokeWidth();
        if (width === 'auto') {
            return this.hasStroke();
        }
        return this.strokeEnabled() && !!width;
    }
    intersects(point) {
        const stage = this.getStage();
        if (!stage) {
            return false;
        }
        const bufferHitCanvas = stage.bufferHitCanvas;
        bufferHitCanvas.getContext().clear();
        this.drawHit(bufferHitCanvas, undefined, true);
        const p = bufferHitCanvas.context.getImageData(Math.round(point.x), Math.round(point.y), 1, 1).data;
        return p[3] > 0;
    }
    destroy() {
        Node.prototype.destroy.call(this);
        delete shapes[this.colorKey];
        delete this.colorKey;
        return this;
    }
    _useBufferCanvas(forceFill) {
        var _a;
        const perfectDrawEnabled = (_a = this.attrs.perfectDrawEnabled) !== null && _a !== void 0 ? _a : true;
        if (!perfectDrawEnabled) {
            return false;
        }
        const hasFill = forceFill || this.hasFill();
        const hasStroke = this.hasStroke();
        const isTransparent = this.getAbsoluteOpacity() !== 1;
        if (hasFill && hasStroke && isTransparent) {
            return true;
        }
        const hasShadow = this.hasShadow();
        const strokeForShadow = this.shadowForStrokeEnabled();
        if (hasFill && hasStroke && hasShadow && strokeForShadow) {
            return true;
        }
        return false;
    }
    setStrokeHitEnabled(val) {
        Util.warn('strokeHitEnabled property is deprecated. Please use hitStrokeWidth instead.');
        if (val) {
            this.hitStrokeWidth('auto');
        }
        else {
            this.hitStrokeWidth(0);
        }
    }
    getStrokeHitEnabled() {
        if (this.hitStrokeWidth() === 0) {
            return false;
        }
        else {
            return true;
        }
    }
    getSelfRect() {
        const size = this.size();
        return {
            x: this._centroid ? -size.width / 2 : 0,
            y: this._centroid ? -size.height / 2 : 0,
            width: size.width,
            height: size.height,
        };
    }
    getClientRect(config = {}) {
        let hasCachedParent = false;
        let parent = this.getParent();
        while (parent) {
            if (parent.isCached()) {
                hasCachedParent = true;
                break;
            }
            parent = parent.getParent();
        }
        const skipTransform = config.skipTransform;
        const relativeTo = config.relativeTo || (hasCachedParent && this.getStage()) || undefined;
        const fillRect = this.getSelfRect();
        const applyStroke = !config.skipStroke && this.hasStroke();
        const strokeWidth = (applyStroke && this.strokeWidth()) || 0;
        const fillAndStrokeWidth = fillRect.width + strokeWidth;
        const fillAndStrokeHeight = fillRect.height + strokeWidth;
        const applyShadow = !config.skipShadow && this.hasShadow();
        const shadowOffsetX = applyShadow ? this.shadowOffsetX() : 0;
        const shadowOffsetY = applyShadow ? this.shadowOffsetY() : 0;
        const preWidth = fillAndStrokeWidth + Math.abs(shadowOffsetX);
        const preHeight = fillAndStrokeHeight + Math.abs(shadowOffsetY);
        const blurRadius = (applyShadow && this.shadowBlur()) || 0;
        const width = preWidth + blurRadius * 2;
        const height = preHeight + blurRadius * 2;
        const rect = {
            width: width,
            height: height,
            x: -(strokeWidth / 2 + blurRadius) +
                Math.min(shadowOffsetX, 0) +
                fillRect.x,
            y: -(strokeWidth / 2 + blurRadius) +
                Math.min(shadowOffsetY, 0) +
                fillRect.y,
        };
        if (!skipTransform) {
            return this._transformedRect(rect, relativeTo);
        }
        return rect;
    }
    drawScene(can, top, bufferCanvas) {
        const layer = this.getLayer();
        const canvas = can || layer.getCanvas(), context = canvas.getContext(), cachedCanvas = this._getCanvasCache(), drawFunc = this.getSceneFunc(), hasShadow = this.hasShadow();
        let stage;
        const cachingSelf = top === this;
        if (!this.isVisible() && !cachingSelf) {
            return this;
        }
        if (cachedCanvas) {
            context.save();
            const m = this.getAbsoluteTransform(top).getMatrix();
            context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
            this._drawCachedSceneCanvas(context);
            context.restore();
            return this;
        }
        if (!drawFunc) {
            return this;
        }
        context.save();
        if (this._useBufferCanvas() && true) {
            stage = this.getStage();
            const bc = bufferCanvas || stage.bufferCanvas;
            const bufferContext = bc.getContext();
            if (bufferCanvas) {
                bufferContext.save();
                bufferContext.setTransform(1, 0, 0, 1, 0, 0);
                bufferContext.clearRect(0, 0, bc.width, bc.height);
                bufferContext.restore();
            }
            else {
                bufferContext.clear();
            }
            bufferContext.save();
            bufferContext._applyLineJoin(this);
            bufferContext._applyMiterLimit(this);
            const o = this.getAbsoluteTransform(top).getMatrix();
            bufferContext.transform(o[0], o[1], o[2], o[3], o[4], o[5]);
            drawFunc.call(this, bufferContext, this);
            bufferContext.restore();
            const ratio = bc.pixelRatio;
            if (hasShadow) {
                context._applyShadow(this);
            }
            if (!cachingSelf) {
                context._applyOpacity(this);
                context._applyGlobalCompositeOperation(this);
            }
            context.drawImage(bc._canvas, bc.x || 0, bc.y || 0, bc.width / ratio, bc.height / ratio);
        }
        else {
            context._applyLineJoin(this);
            context._applyMiterLimit(this);
            if (!cachingSelf) {
                const o = this.getAbsoluteTransform(top).getMatrix();
                context.transform(o[0], o[1], o[2], o[3], o[4], o[5]);
                context._applyOpacity(this);
                context._applyGlobalCompositeOperation(this);
            }
            if (hasShadow) {
                context._applyShadow(this);
            }
            drawFunc.call(this, context, this);
        }
        context.restore();
        return this;
    }
    drawHit(can, top, skipDragCheck = false) {
        if (!this.shouldDrawHit(top, skipDragCheck)) {
            return this;
        }
        const layer = this.getLayer(), canvas = can || layer.hitCanvas, context = canvas && canvas.getContext(), drawFunc = this.hitFunc() || this.sceneFunc(), cachedCanvas = this._getCanvasCache(), cachedHitCanvas = cachedCanvas && cachedCanvas.hit;
        if (!this.colorKey) {
            Util.warn('Looks like your canvas has a destroyed shape in it. Do not reuse shape after you destroyed it. If you want to reuse shape you should call remove() instead of destroy()');
        }
        if (cachedHitCanvas) {
            context.save();
            const m = this.getAbsoluteTransform(top).getMatrix();
            context.transform(m[0], m[1], m[2], m[3], m[4], m[5]);
            this._drawCachedHitCanvas(context);
            context.restore();
            return this;
        }
        if (!drawFunc) {
            return this;
        }
        context.save();
        context._applyLineJoin(this);
        context._applyMiterLimit(this);
        const selfCache = this === top;
        if (!selfCache) {
            const o = this.getAbsoluteTransform(top).getMatrix();
            context.transform(o[0], o[1], o[2], o[3], o[4], o[5]);
        }
        drawFunc.call(this, context, this);
        context.restore();
        return this;
    }
    drawHitFromCache(alphaThreshold = 0) {
        const cachedCanvas = this._getCanvasCache(), sceneCanvas = this._getCachedSceneCanvas(), hitCanvas = cachedCanvas.hit, hitContext = hitCanvas.getContext(), hitWidth = hitCanvas.getWidth(), hitHeight = hitCanvas.getHeight();
        hitContext.clear();
        hitContext.drawImage(sceneCanvas._canvas, 0, 0, hitWidth, hitHeight);
        try {
            const hitImageData = hitContext.getImageData(0, 0, hitWidth, hitHeight);
            const hitData = hitImageData.data;
            const len = hitData.length;
            const rgbColorKey = Util._hexToRgb(this.colorKey);
            for (let i = 0; i < len; i += 4) {
                const alpha = hitData[i + 3];
                if (alpha > alphaThreshold) {
                    hitData[i] = rgbColorKey.r;
                    hitData[i + 1] = rgbColorKey.g;
                    hitData[i + 2] = rgbColorKey.b;
                    hitData[i + 3] = 255;
                }
                else {
                    hitData[i + 3] = 0;
                }
            }
            hitContext.putImageData(hitImageData, 0, 0);
        }
        catch (e) {
            Util.error('Unable to draw hit graph from cached scene canvas. ' + e.message);
        }
        return this;
    }
    hasPointerCapture(pointerId) {
        return hasPointerCapture(pointerId, this);
    }
    setPointerCapture(pointerId) {
        setPointerCapture(pointerId, this);
    }
    releaseCapture(pointerId) {
        releaseCapture(pointerId);
    }
}
Shape.prototype._fillFunc = _fillFunc$2;
Shape.prototype._strokeFunc = _strokeFunc$2;
Shape.prototype._fillFuncHit = _fillFuncHit;
Shape.prototype._strokeFuncHit = _strokeFuncHit;
Shape.prototype._centroid = false;
Shape.prototype.nodeType = 'Shape';
_registerNode(Shape);
Shape.prototype.eventListeners = {};
Shape.prototype.on('shadowColorChange.konva shadowBlurChange.konva shadowOffsetChange.konva shadowOpacityChange.konva shadowEnabledChange.konva', _clearHasShadowCache);
Shape.prototype.on('shadowColorChange.konva shadowOpacityChange.konva shadowEnabledChange.konva', _clearGetShadowRGBACache);
Shape.prototype.on('fillPriorityChange.konva fillPatternImageChange.konva fillPatternRepeatChange.konva fillPatternScaleXChange.konva fillPatternScaleYChange.konva fillPatternOffsetXChange.konva fillPatternOffsetYChange.konva fillPatternXChange.konva fillPatternYChange.konva fillPatternRotationChange.konva', _clearFillPatternCache);
Shape.prototype.on('fillPriorityChange.konva fillLinearGradientColorStopsChange.konva fillLinearGradientStartPointXChange.konva fillLinearGradientStartPointYChange.konva fillLinearGradientEndPointXChange.konva fillLinearGradientEndPointYChange.konva', _clearLinearGradientCache);
Shape.prototype.on('fillPriorityChange.konva fillRadialGradientColorStopsChange.konva fillRadialGradientStartPointXChange.konva fillRadialGradientStartPointYChange.konva fillRadialGradientEndPointXChange.konva fillRadialGradientEndPointYChange.konva fillRadialGradientStartRadiusChange.konva fillRadialGradientEndRadiusChange.konva', _clearRadialGradientCache);
Factory.addGetterSetter(Shape, 'stroke', undefined, getStringOrGradientValidator());
Factory.addGetterSetter(Shape, 'strokeWidth', 2, getNumberValidator());
Factory.addGetterSetter(Shape, 'fillAfterStrokeEnabled', false);
Factory.addGetterSetter(Shape, 'hitStrokeWidth', 'auto', getNumberOrAutoValidator());
Factory.addGetterSetter(Shape, 'strokeHitEnabled', true, getBooleanValidator());
Factory.addGetterSetter(Shape, 'perfectDrawEnabled', true, getBooleanValidator());
Factory.addGetterSetter(Shape, 'shadowForStrokeEnabled', true, getBooleanValidator());
Factory.addGetterSetter(Shape, 'lineJoin');
Factory.addGetterSetter(Shape, 'lineCap');
Factory.addGetterSetter(Shape, 'miterLimit');
Factory.addGetterSetter(Shape, 'sceneFunc');
Factory.addGetterSetter(Shape, 'hitFunc');
Factory.addGetterSetter(Shape, 'dash');
Factory.addGetterSetter(Shape, 'dashOffset', 0, getNumberValidator());
Factory.addGetterSetter(Shape, 'shadowColor', undefined, getStringValidator());
Factory.addGetterSetter(Shape, 'shadowBlur', 0, getNumberValidator());
Factory.addGetterSetter(Shape, 'shadowOpacity', 1, getNumberValidator());
Factory.addComponentsGetterSetter(Shape, 'shadowOffset', ['x', 'y']);
Factory.addGetterSetter(Shape, 'shadowOffsetX', 0, getNumberValidator());
Factory.addGetterSetter(Shape, 'shadowOffsetY', 0, getNumberValidator());
Factory.addGetterSetter(Shape, 'fillPatternImage');
Factory.addGetterSetter(Shape, 'fill', undefined, getStringOrGradientValidator());
Factory.addGetterSetter(Shape, 'fillPatternX', 0, getNumberValidator());
Factory.addGetterSetter(Shape, 'fillPatternY', 0, getNumberValidator());
Factory.addGetterSetter(Shape, 'fillLinearGradientColorStops');
Factory.addGetterSetter(Shape, 'strokeLinearGradientColorStops');
Factory.addGetterSetter(Shape, 'fillRadialGradientStartRadius', 0);
Factory.addGetterSetter(Shape, 'fillRadialGradientEndRadius', 0);
Factory.addGetterSetter(Shape, 'fillRadialGradientColorStops');
Factory.addGetterSetter(Shape, 'fillPatternRepeat', 'repeat');
Factory.addGetterSetter(Shape, 'fillEnabled', true);
Factory.addGetterSetter(Shape, 'strokeEnabled', true);
Factory.addGetterSetter(Shape, 'shadowEnabled', true);
Factory.addGetterSetter(Shape, 'dashEnabled', true);
Factory.addGetterSetter(Shape, 'strokeScaleEnabled', true);
Factory.addGetterSetter(Shape, 'fillPriority', 'color');
Factory.addComponentsGetterSetter(Shape, 'fillPatternOffset', ['x', 'y']);
Factory.addGetterSetter(Shape, 'fillPatternOffsetX', 0, getNumberValidator());
Factory.addGetterSetter(Shape, 'fillPatternOffsetY', 0, getNumberValidator());
Factory.addComponentsGetterSetter(Shape, 'fillPatternScale', ['x', 'y']);
Factory.addGetterSetter(Shape, 'fillPatternScaleX', 1, getNumberValidator());
Factory.addGetterSetter(Shape, 'fillPatternScaleY', 1, getNumberValidator());
Factory.addComponentsGetterSetter(Shape, 'fillLinearGradientStartPoint', [
    'x',
    'y',
]);
Factory.addComponentsGetterSetter(Shape, 'strokeLinearGradientStartPoint', [
    'x',
    'y',
]);
Factory.addGetterSetter(Shape, 'fillLinearGradientStartPointX', 0);
Factory.addGetterSetter(Shape, 'strokeLinearGradientStartPointX', 0);
Factory.addGetterSetter(Shape, 'fillLinearGradientStartPointY', 0);
Factory.addGetterSetter(Shape, 'strokeLinearGradientStartPointY', 0);
Factory.addComponentsGetterSetter(Shape, 'fillLinearGradientEndPoint', [
    'x',
    'y',
]);
Factory.addComponentsGetterSetter(Shape, 'strokeLinearGradientEndPoint', [
    'x',
    'y',
]);
Factory.addGetterSetter(Shape, 'fillLinearGradientEndPointX', 0);
Factory.addGetterSetter(Shape, 'strokeLinearGradientEndPointX', 0);
Factory.addGetterSetter(Shape, 'fillLinearGradientEndPointY', 0);
Factory.addGetterSetter(Shape, 'strokeLinearGradientEndPointY', 0);
Factory.addComponentsGetterSetter(Shape, 'fillRadialGradientStartPoint', [
    'x',
    'y',
]);
Factory.addGetterSetter(Shape, 'fillRadialGradientStartPointX', 0);
Factory.addGetterSetter(Shape, 'fillRadialGradientStartPointY', 0);
Factory.addComponentsGetterSetter(Shape, 'fillRadialGradientEndPoint', [
    'x',
    'y',
]);
Factory.addGetterSetter(Shape, 'fillRadialGradientEndPointX', 0);
Factory.addGetterSetter(Shape, 'fillRadialGradientEndPointY', 0);
Factory.addGetterSetter(Shape, 'fillPatternRotation', 0);
Factory.addGetterSetter(Shape, 'fillRule', undefined, getStringValidator());
Factory.backCompat(Shape, {
    dashArray: 'dash',
    getDashArray: 'getDash',
    setDashArray: 'getDash',
    drawFunc: 'sceneFunc',
    getDrawFunc: 'getSceneFunc',
    setDrawFunc: 'setSceneFunc',
    drawHitFunc: 'hitFunc',
    getDrawHitFunc: 'getHitFunc',
    setDrawHitFunc: 'setHitFunc',
});

const BEFORE_DRAW = 'beforeDraw', DRAW = 'draw', INTERSECTION_OFFSETS = [
    { x: 0, y: 0 },
    { x: -1, y: -1 },
    { x: 1, y: -1 },
    { x: 1, y: 1 },
    { x: -1, y: 1 },
], INTERSECTION_OFFSETS_LEN = INTERSECTION_OFFSETS.length;
let Layer$1 = class Layer extends Container {
    constructor(config) {
        super(config);
        this.canvas = new SceneCanvas();
        this.hitCanvas = new HitCanvas({
            pixelRatio: 1,
        });
        this._waitingForDraw = false;
        this.on('visibleChange.konva', this._checkVisibility);
        this._checkVisibility();
        this.on('imageSmoothingEnabledChange.konva', this._setSmoothEnabled);
        this._setSmoothEnabled();
    }
    createPNGStream() {
        const c = this.canvas._canvas;
        return c.createPNGStream();
    }
    getCanvas() {
        return this.canvas;
    }
    getNativeCanvasElement() {
        return this.canvas._canvas;
    }
    getHitCanvas() {
        return this.hitCanvas;
    }
    getContext() {
        return this.getCanvas().getContext();
    }
    clear(bounds) {
        this.getContext().clear(bounds);
        this.getHitCanvas().getContext().clear(bounds);
        return this;
    }
    setZIndex(index) {
        super.setZIndex(index);
        const stage = this.getStage();
        if (stage && stage.content) {
            stage.content.removeChild(this.getNativeCanvasElement());
            if (index < stage.children.length - 1) {
                stage.content.insertBefore(this.getNativeCanvasElement(), stage.children[index + 1].getCanvas()._canvas);
            }
            else {
                stage.content.appendChild(this.getNativeCanvasElement());
            }
        }
        return this;
    }
    moveToTop() {
        Node.prototype.moveToTop.call(this);
        const stage = this.getStage();
        if (stage && stage.content) {
            stage.content.removeChild(this.getNativeCanvasElement());
            stage.content.appendChild(this.getNativeCanvasElement());
        }
        return true;
    }
    moveUp() {
        const moved = Node.prototype.moveUp.call(this);
        if (!moved) {
            return false;
        }
        const stage = this.getStage();
        if (!stage || !stage.content) {
            return false;
        }
        stage.content.removeChild(this.getNativeCanvasElement());
        if (this.index < stage.children.length - 1) {
            stage.content.insertBefore(this.getNativeCanvasElement(), stage.children[this.index + 1].getCanvas()._canvas);
        }
        else {
            stage.content.appendChild(this.getNativeCanvasElement());
        }
        return true;
    }
    moveDown() {
        if (Node.prototype.moveDown.call(this)) {
            const stage = this.getStage();
            if (stage) {
                const children = stage.children;
                if (stage.content) {
                    stage.content.removeChild(this.getNativeCanvasElement());
                    stage.content.insertBefore(this.getNativeCanvasElement(), children[this.index + 1].getCanvas()._canvas);
                }
            }
            return true;
        }
        return false;
    }
    moveToBottom() {
        if (Node.prototype.moveToBottom.call(this)) {
            const stage = this.getStage();
            if (stage) {
                const children = stage.children;
                if (stage.content) {
                    stage.content.removeChild(this.getNativeCanvasElement());
                    stage.content.insertBefore(this.getNativeCanvasElement(), children[1].getCanvas()._canvas);
                }
            }
            return true;
        }
        return false;
    }
    getLayer() {
        return this;
    }
    remove() {
        const _canvas = this.getNativeCanvasElement();
        Node.prototype.remove.call(this);
        if (_canvas && _canvas.parentNode && Util._isInDocument(_canvas)) {
            _canvas.parentNode.removeChild(_canvas);
        }
        return this;
    }
    getStage() {
        return this.parent;
    }
    setSize({ width, height }) {
        this.canvas.setSize(width, height);
        this.hitCanvas.setSize(width, height);
        this._setSmoothEnabled();
        return this;
    }
    _validateAdd(child) {
        const type = child.getType();
        if (type !== 'Group' && type !== 'Shape') {
            Util.throw('You may only add groups and shapes to a layer.');
        }
    }
    _toKonvaCanvas(config) {
        config = { ...config };
        config.width = config.width || this.getWidth();
        config.height = config.height || this.getHeight();
        config.x = config.x !== undefined ? config.x : this.x();
        config.y = config.y !== undefined ? config.y : this.y();
        return Node.prototype._toKonvaCanvas.call(this, config);
    }
    _checkVisibility() {
        const visible = this.visible();
        if (visible) {
            this.canvas._canvas.style.display = 'block';
        }
        else {
            this.canvas._canvas.style.display = 'none';
        }
    }
    _setSmoothEnabled() {
        this.getContext()._context.imageSmoothingEnabled =
            this.imageSmoothingEnabled();
    }
    getWidth() {
        if (this.parent) {
            return this.parent.width();
        }
    }
    setWidth() {
        Util.warn('Can not change width of layer. Use "stage.width(value)" function instead.');
    }
    getHeight() {
        if (this.parent) {
            return this.parent.height();
        }
    }
    setHeight() {
        Util.warn('Can not change height of layer. Use "stage.height(value)" function instead.');
    }
    batchDraw() {
        if (!this._waitingForDraw) {
            this._waitingForDraw = true;
            Util.requestAnimFrame(() => {
                this.draw();
                this._waitingForDraw = false;
            });
        }
        return this;
    }
    getIntersection(pos) {
        if (!this.isListening() || !this.isVisible()) {
            return null;
        }
        let spiralSearchDistance = 1;
        let continueSearch = false;
        while (true) {
            for (let i = 0; i < INTERSECTION_OFFSETS_LEN; i++) {
                const intersectionOffset = INTERSECTION_OFFSETS[i];
                const obj = this._getIntersection({
                    x: pos.x + intersectionOffset.x * spiralSearchDistance,
                    y: pos.y + intersectionOffset.y * spiralSearchDistance,
                });
                const shape = obj.shape;
                if (shape) {
                    return shape;
                }
                continueSearch = !!obj.antialiased;
                if (!obj.antialiased) {
                    break;
                }
            }
            if (continueSearch) {
                spiralSearchDistance += 1;
            }
            else {
                return null;
            }
        }
    }
    _getIntersection(pos) {
        const ratio = this.hitCanvas.pixelRatio;
        const p = this.hitCanvas.context.getImageData(Math.round(pos.x * ratio), Math.round(pos.y * ratio), 1, 1).data;
        const p3 = p[3];
        if (p3 === 255) {
            const colorKey = Util.getHitColorKey(p[0], p[1], p[2]);
            const shape = shapes[colorKey];
            if (shape) {
                return {
                    shape: shape,
                };
            }
            return {
                antialiased: true,
            };
        }
        else if (p3 > 0) {
            return {
                antialiased: true,
            };
        }
        return {};
    }
    drawScene(can, top, bufferCanvas) {
        const layer = this.getLayer(), canvas = can || (layer && layer.getCanvas());
        this._fire(BEFORE_DRAW, {
            node: this,
        });
        if (this.clearBeforeDraw()) {
            canvas.getContext().clear();
        }
        Container.prototype.drawScene.call(this, canvas, top, bufferCanvas);
        this._fire(DRAW, {
            node: this,
        });
        return this;
    }
    drawHit(can, top) {
        const layer = this.getLayer(), canvas = can || (layer && layer.hitCanvas);
        if (layer && layer.clearBeforeDraw()) {
            layer.getHitCanvas().getContext().clear();
        }
        Container.prototype.drawHit.call(this, canvas, top);
        return this;
    }
    enableHitGraph() {
        this.hitGraphEnabled(true);
        return this;
    }
    disableHitGraph() {
        this.hitGraphEnabled(false);
        return this;
    }
    setHitGraphEnabled(val) {
        Util.warn('hitGraphEnabled method is deprecated. Please use layer.listening() instead.');
        this.listening(val);
    }
    getHitGraphEnabled(val) {
        Util.warn('hitGraphEnabled method is deprecated. Please use layer.listening() instead.');
        return this.listening();
    }
    toggleHitCanvas() {
        if (!this.parent || !this.parent['content']) {
            return;
        }
        const parent = this.parent;
        const added = !!this.hitCanvas._canvas.parentNode;
        if (added) {
            parent.content.removeChild(this.hitCanvas._canvas);
        }
        else {
            parent.content.appendChild(this.hitCanvas._canvas);
        }
    }
    destroy() {
        Util.releaseCanvas(this.getNativeCanvasElement(), this.getHitCanvas()._canvas);
        return super.destroy();
    }
};
Layer$1.prototype.nodeType = 'Layer';
_registerNode(Layer$1);
Factory.addGetterSetter(Layer$1, 'imageSmoothingEnabled', true);
Factory.addGetterSetter(Layer$1, 'clearBeforeDraw', true);
Factory.addGetterSetter(Layer$1, 'hitGraphEnabled', true, getBooleanValidator());

class FastLayer extends Layer$1 {
    constructor(attrs) {
        super(attrs);
        this.listening(false);
        Util.warn('Konva.Fast layer is deprecated. Please use "new Konva.Layer({ listening: false })" instead.');
    }
}
FastLayer.prototype.nodeType = 'FastLayer';
_registerNode(FastLayer);

let Group$1 = class Group extends Container {
    _validateAdd(child) {
        const type = child.getType();
        if (type !== 'Group' && type !== 'Shape') {
            Util.throw('You may only add groups and shapes to groups.');
        }
    }
};
Group$1.prototype.nodeType = 'Group';
_registerNode(Group$1);

const now = (function () {
    if (glob.performance && glob.performance.now) {
        return function () {
            return glob.performance.now();
        };
    }
    return function () {
        return new Date().getTime();
    };
})();
class Animation {
    constructor(func, layers) {
        this.id = Animation.animIdCounter++;
        this.frame = {
            time: 0,
            timeDiff: 0,
            lastTime: now(),
            frameRate: 0,
        };
        this.func = func;
        this.setLayers(layers);
    }
    setLayers(layers) {
        let lays = [];
        if (layers) {
            lays = Array.isArray(layers) ? layers : [layers];
        }
        this.layers = lays;
        return this;
    }
    getLayers() {
        return this.layers;
    }
    addLayer(layer) {
        const layers = this.layers;
        const len = layers.length;
        for (let n = 0; n < len; n++) {
            if (layers[n]._id === layer._id) {
                return false;
            }
        }
        this.layers.push(layer);
        return true;
    }
    isRunning() {
        const a = Animation;
        const animations = a.animations;
        const len = animations.length;
        for (let n = 0; n < len; n++) {
            if (animations[n].id === this.id) {
                return true;
            }
        }
        return false;
    }
    start() {
        this.stop();
        this.frame.timeDiff = 0;
        this.frame.lastTime = now();
        Animation._addAnimation(this);
        return this;
    }
    stop() {
        Animation._removeAnimation(this);
        return this;
    }
    _updateFrameObject(time) {
        this.frame.timeDiff = time - this.frame.lastTime;
        this.frame.lastTime = time;
        this.frame.time += this.frame.timeDiff;
        this.frame.frameRate = 1000 / this.frame.timeDiff;
    }
    static _addAnimation(anim) {
        this.animations.push(anim);
        this._handleAnimation();
    }
    static _removeAnimation(anim) {
        const id = anim.id;
        const animations = this.animations;
        const len = animations.length;
        for (let n = 0; n < len; n++) {
            if (animations[n].id === id) {
                this.animations.splice(n, 1);
                break;
            }
        }
    }
    static _runFrames() {
        const layerHash = {};
        const animations = this.animations;
        for (let n = 0; n < animations.length; n++) {
            const anim = animations[n];
            const layers = anim.layers;
            const func = anim.func;
            anim._updateFrameObject(now());
            const layersLen = layers.length;
            let needRedraw;
            if (func) {
                needRedraw = func.call(anim, anim.frame) !== false;
            }
            else {
                needRedraw = true;
            }
            if (!needRedraw) {
                continue;
            }
            for (let i = 0; i < layersLen; i++) {
                const layer = layers[i];
                if (layer._id !== undefined) {
                    layerHash[layer._id] = layer;
                }
            }
        }
        for (const key in layerHash) {
            if (!layerHash.hasOwnProperty(key)) {
                continue;
            }
            layerHash[key].batchDraw();
        }
    }
    static _animationLoop() {
        const Anim = Animation;
        if (Anim.animations.length) {
            Anim._runFrames();
            Util.requestAnimFrame(Anim._animationLoop);
        }
        else {
            Anim.animRunning = false;
        }
    }
    static _handleAnimation() {
        if (!this.animRunning) {
            this.animRunning = true;
            Util.requestAnimFrame(this._animationLoop);
        }
    }
}
Animation.animations = [];
Animation.animIdCounter = 0;
Animation.animRunning = false;

const blacklist = {
    node: 1,
    duration: 1,
    easing: 1,
    onFinish: 1,
    yoyo: 1,
}, PAUSED = 1, PLAYING = 2, REVERSING = 3, colorAttrs = ['fill', 'stroke', 'shadowColor'];
let idCounter = 0;
class TweenEngine {
    constructor(prop, propFunc, func, begin, finish, duration, yoyo) {
        this.prop = prop;
        this.propFunc = propFunc;
        this.begin = begin;
        this._pos = begin;
        this.duration = duration;
        this._change = 0;
        this.prevPos = 0;
        this.yoyo = yoyo;
        this._time = 0;
        this._position = 0;
        this._startTime = 0;
        this._finish = 0;
        this.func = func;
        this._change = finish - this.begin;
        this.pause();
    }
    fire(str) {
        const handler = this[str];
        if (handler) {
            handler();
        }
    }
    setTime(t) {
        if (t > this.duration) {
            if (this.yoyo) {
                this._time = this.duration;
                this.reverse();
            }
            else {
                this.finish();
            }
        }
        else if (t < 0) {
            if (this.yoyo) {
                this._time = 0;
                this.play();
            }
            else {
                this.reset();
            }
        }
        else {
            this._time = t;
            this.update();
        }
    }
    getTime() {
        return this._time;
    }
    setPosition(p) {
        this.prevPos = this._pos;
        this.propFunc(p);
        this._pos = p;
    }
    getPosition(t) {
        if (t === undefined) {
            t = this._time;
        }
        return this.func(t, this.begin, this._change, this.duration);
    }
    play() {
        this.state = PLAYING;
        this._startTime = this.getTimer() - this._time;
        this.onEnterFrame();
        this.fire('onPlay');
    }
    reverse() {
        this.state = REVERSING;
        this._time = this.duration - this._time;
        this._startTime = this.getTimer() - this._time;
        this.onEnterFrame();
        this.fire('onReverse');
    }
    seek(t) {
        this.pause();
        this._time = t;
        this.update();
        this.fire('onSeek');
    }
    reset() {
        this.pause();
        this._time = 0;
        this.update();
        this.fire('onReset');
    }
    finish() {
        this.pause();
        this._time = this.duration;
        this.update();
        this.fire('onFinish');
    }
    update() {
        this.setPosition(this.getPosition(this._time));
        this.fire('onUpdate');
    }
    onEnterFrame() {
        const t = this.getTimer() - this._startTime;
        if (this.state === PLAYING) {
            this.setTime(t);
        }
        else if (this.state === REVERSING) {
            this.setTime(this.duration - t);
        }
    }
    pause() {
        this.state = PAUSED;
        this.fire('onPause');
    }
    getTimer() {
        return new Date().getTime();
    }
}
class Tween {
    constructor(config) {
        const that = this, node = config.node, nodeId = node._id, easing = config.easing || Easings.Linear, yoyo = !!config.yoyo;
        let duration, key;
        if (typeof config.duration === 'undefined') {
            duration = 0.3;
        }
        else if (config.duration === 0) {
            duration = 0.001;
        }
        else {
            duration = config.duration;
        }
        this.node = node;
        this._id = idCounter++;
        const layers = node.getLayer() ||
            (node instanceof Konva$2['Stage'] ? node.getLayers() : null);
        if (!layers) {
            Util.error('Tween constructor have `node` that is not in a layer. Please add node into layer first.');
        }
        this.anim = new Animation(function () {
            that.tween.onEnterFrame();
        }, layers);
        this.tween = new TweenEngine(key, function (i) {
            that._tweenFunc(i);
        }, easing, 0, 1, duration * 1000, yoyo);
        this._addListeners();
        if (!Tween.attrs[nodeId]) {
            Tween.attrs[nodeId] = {};
        }
        if (!Tween.attrs[nodeId][this._id]) {
            Tween.attrs[nodeId][this._id] = {};
        }
        if (!Tween.tweens[nodeId]) {
            Tween.tweens[nodeId] = {};
        }
        for (key in config) {
            if (blacklist[key] === undefined) {
                this._addAttr(key, config[key]);
            }
        }
        this.reset();
        this.onFinish = config.onFinish;
        this.onReset = config.onReset;
        this.onUpdate = config.onUpdate;
    }
    _addAttr(key, end) {
        const node = this.node, nodeId = node._id;
        let diff, len, trueEnd, trueStart, endRGBA;
        const tweenId = Tween.tweens[nodeId][key];
        if (tweenId) {
            delete Tween.attrs[nodeId][tweenId][key];
        }
        let start = node.getAttr(key);
        if (Util._isArray(end)) {
            diff = [];
            len = Math.max(end.length, start.length);
            if (key === 'points' && end.length !== start.length) {
                if (end.length > start.length) {
                    trueStart = start;
                    start = Util._prepareArrayForTween(start, end, node.closed());
                }
                else {
                    trueEnd = end;
                    end = Util._prepareArrayForTween(end, start, node.closed());
                }
            }
            if (key.indexOf('fill') === 0) {
                for (let n = 0; n < len; n++) {
                    if (n % 2 === 0) {
                        diff.push(end[n] - start[n]);
                    }
                    else {
                        const startRGBA = Util.colorToRGBA(start[n]);
                        endRGBA = Util.colorToRGBA(end[n]);
                        start[n] = startRGBA;
                        diff.push({
                            r: endRGBA.r - startRGBA.r,
                            g: endRGBA.g - startRGBA.g,
                            b: endRGBA.b - startRGBA.b,
                            a: endRGBA.a - startRGBA.a,
                        });
                    }
                }
            }
            else {
                for (let n = 0; n < len; n++) {
                    diff.push(end[n] - start[n]);
                }
            }
        }
        else if (colorAttrs.indexOf(key) !== -1) {
            start = Util.colorToRGBA(start);
            endRGBA = Util.colorToRGBA(end);
            diff = {
                r: endRGBA.r - start.r,
                g: endRGBA.g - start.g,
                b: endRGBA.b - start.b,
                a: endRGBA.a - start.a,
            };
        }
        else {
            diff = end - start;
        }
        Tween.attrs[nodeId][this._id][key] = {
            start: start,
            diff: diff,
            end: end,
            trueEnd: trueEnd,
            trueStart: trueStart,
        };
        Tween.tweens[nodeId][key] = this._id;
    }
    _tweenFunc(i) {
        const node = this.node, attrs = Tween.attrs[node._id][this._id];
        let key, attr, start, diff, newVal, n, len, end;
        for (key in attrs) {
            attr = attrs[key];
            start = attr.start;
            diff = attr.diff;
            end = attr.end;
            if (Util._isArray(start)) {
                newVal = [];
                len = Math.max(start.length, end.length);
                if (key.indexOf('fill') === 0) {
                    for (n = 0; n < len; n++) {
                        if (n % 2 === 0) {
                            newVal.push((start[n] || 0) + diff[n] * i);
                        }
                        else {
                            newVal.push('rgba(' +
                                Math.round(start[n].r + diff[n].r * i) +
                                ',' +
                                Math.round(start[n].g + diff[n].g * i) +
                                ',' +
                                Math.round(start[n].b + diff[n].b * i) +
                                ',' +
                                (start[n].a + diff[n].a * i) +
                                ')');
                        }
                    }
                }
                else {
                    for (n = 0; n < len; n++) {
                        newVal.push((start[n] || 0) + diff[n] * i);
                    }
                }
            }
            else if (colorAttrs.indexOf(key) !== -1) {
                newVal =
                    'rgba(' +
                        Math.round(start.r + diff.r * i) +
                        ',' +
                        Math.round(start.g + diff.g * i) +
                        ',' +
                        Math.round(start.b + diff.b * i) +
                        ',' +
                        (start.a + diff.a * i) +
                        ')';
            }
            else {
                newVal = start + diff * i;
            }
            node.setAttr(key, newVal);
        }
    }
    _addListeners() {
        this.tween.onPlay = () => {
            this.anim.start();
        };
        this.tween.onReverse = () => {
            this.anim.start();
        };
        this.tween.onPause = () => {
            this.anim.stop();
        };
        this.tween.onFinish = () => {
            const node = this.node;
            const attrs = Tween.attrs[node._id][this._id];
            if (attrs.points && attrs.points.trueEnd) {
                node.setAttr('points', attrs.points.trueEnd);
            }
            if (this.onFinish) {
                this.onFinish.call(this);
            }
        };
        this.tween.onReset = () => {
            const node = this.node;
            const attrs = Tween.attrs[node._id][this._id];
            if (attrs.points && attrs.points.trueStart) {
                node.points(attrs.points.trueStart);
            }
            if (this.onReset) {
                this.onReset();
            }
        };
        this.tween.onUpdate = () => {
            if (this.onUpdate) {
                this.onUpdate.call(this);
            }
        };
    }
    play() {
        this.tween.play();
        return this;
    }
    reverse() {
        this.tween.reverse();
        return this;
    }
    reset() {
        this.tween.reset();
        return this;
    }
    seek(t) {
        this.tween.seek(t * 1000);
        return this;
    }
    pause() {
        this.tween.pause();
        return this;
    }
    finish() {
        this.tween.finish();
        return this;
    }
    destroy() {
        const nodeId = this.node._id, thisId = this._id, attrs = Tween.tweens[nodeId];
        this.pause();
        if (this.anim) {
            this.anim.stop();
        }
        for (const key in attrs) {
            delete Tween.tweens[nodeId][key];
        }
        delete Tween.attrs[nodeId][thisId];
        if (Tween.tweens[nodeId]) {
            if (Object.keys(Tween.tweens[nodeId]).length === 0) {
                delete Tween.tweens[nodeId];
            }
            if (Object.keys(Tween.attrs[nodeId]).length === 0) {
                delete Tween.attrs[nodeId];
            }
        }
    }
}
Tween.attrs = {};
Tween.tweens = {};
Node.prototype.to = function (params) {
    const onFinish = params.onFinish;
    params.node = this;
    params.onFinish = function () {
        this.destroy();
        if (onFinish) {
            onFinish();
        }
    };
    const tween = new Tween(params);
    tween.play();
};
const Easings = {
    BackEaseIn(t, b, c, d) {
        const s = 1.70158;
        return c * (t /= d) * t * ((s + 1) * t - s) + b;
    },
    BackEaseOut(t, b, c, d) {
        const s = 1.70158;
        return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
    },
    BackEaseInOut(t, b, c, d) {
        let s = 1.70158;
        if ((t /= d / 2) < 1) {
            return (c / 2) * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
        }
        return (c / 2) * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
    },
    ElasticEaseIn(t, b, c, d, a, p) {
        let s = 0;
        if (t === 0) {
            return b;
        }
        if ((t /= d) === 1) {
            return b + c;
        }
        if (!p) {
            p = d * 0.3;
        }
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        }
        else {
            s = (p / (2 * Math.PI)) * Math.asin(c / a);
        }
        return (-(a *
            Math.pow(2, 10 * (t -= 1)) *
            Math.sin(((t * d - s) * (2 * Math.PI)) / p)) + b);
    },
    ElasticEaseOut(t, b, c, d, a, p) {
        let s = 0;
        if (t === 0) {
            return b;
        }
        if ((t /= d) === 1) {
            return b + c;
        }
        if (!p) {
            p = d * 0.3;
        }
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        }
        else {
            s = (p / (2 * Math.PI)) * Math.asin(c / a);
        }
        return (a * Math.pow(2, -10 * t) * Math.sin(((t * d - s) * (2 * Math.PI)) / p) +
            c +
            b);
    },
    ElasticEaseInOut(t, b, c, d, a, p) {
        let s = 0;
        if (t === 0) {
            return b;
        }
        if ((t /= d / 2) === 2) {
            return b + c;
        }
        if (!p) {
            p = d * (0.3 * 1.5);
        }
        if (!a || a < Math.abs(c)) {
            a = c;
            s = p / 4;
        }
        else {
            s = (p / (2 * Math.PI)) * Math.asin(c / a);
        }
        if (t < 1) {
            return (-0.5 *
                (a *
                    Math.pow(2, 10 * (t -= 1)) *
                    Math.sin(((t * d - s) * (2 * Math.PI)) / p)) +
                b);
        }
        return (a *
            Math.pow(2, -10 * (t -= 1)) *
            Math.sin(((t * d - s) * (2 * Math.PI)) / p) *
            0.5 +
            c +
            b);
    },
    BounceEaseOut(t, b, c, d) {
        if ((t /= d) < 1 / 2.75) {
            return c * (7.5625 * t * t) + b;
        }
        else if (t < 2 / 2.75) {
            return c * (7.5625 * (t -= 1.5 / 2.75) * t + 0.75) + b;
        }
        else if (t < 2.5 / 2.75) {
            return c * (7.5625 * (t -= 2.25 / 2.75) * t + 0.9375) + b;
        }
        else {
            return c * (7.5625 * (t -= 2.625 / 2.75) * t + 0.984375) + b;
        }
    },
    BounceEaseIn(t, b, c, d) {
        return c - Easings.BounceEaseOut(d - t, 0, c, d) + b;
    },
    BounceEaseInOut(t, b, c, d) {
        if (t < d / 2) {
            return Easings.BounceEaseIn(t * 2, 0, c, d) * 0.5 + b;
        }
        else {
            return Easings.BounceEaseOut(t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
        }
    },
    EaseIn(t, b, c, d) {
        return c * (t /= d) * t + b;
    },
    EaseOut(t, b, c, d) {
        return -c * (t /= d) * (t - 2) + b;
    },
    EaseInOut(t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return (c / 2) * t * t + b;
        }
        return (-c / 2) * (--t * (t - 2) - 1) + b;
    },
    StrongEaseIn(t, b, c, d) {
        return c * (t /= d) * t * t * t * t + b;
    },
    StrongEaseOut(t, b, c, d) {
        return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
    },
    StrongEaseInOut(t, b, c, d) {
        if ((t /= d / 2) < 1) {
            return (c / 2) * t * t * t * t * t + b;
        }
        return (c / 2) * ((t -= 2) * t * t * t * t + 2) + b;
    },
    Linear(t, b, c, d) {
        return (c * t) / d + b;
    },
};

const Konva$1 = Util._assign(Konva$2, {
    Util,
    Transform,
    Node,
    Container,
    Stage: Stage$1,
    stages,
    Layer: Layer$1,
    FastLayer,
    Group: Group$1,
    DD,
    Shape,
    shapes,
    Animation,
    Tween,
    Easings,
    Context,
    Canvas,
});

class Arc extends Shape {
    _sceneFunc(context) {
        const angle = Konva$2.getAngle(this.angle()), clockwise = this.clockwise();
        context.beginPath();
        context.arc(0, 0, this.outerRadius(), 0, angle, clockwise);
        context.arc(0, 0, this.innerRadius(), angle, 0, !clockwise);
        context.closePath();
        context.fillStrokeShape(this);
    }
    getWidth() {
        return this.outerRadius() * 2;
    }
    getHeight() {
        return this.outerRadius() * 2;
    }
    setWidth(width) {
        this.outerRadius(width / 2);
    }
    setHeight(height) {
        this.outerRadius(height / 2);
    }
    getSelfRect() {
        const innerRadius = this.innerRadius();
        const outerRadius = this.outerRadius();
        const clockwise = this.clockwise();
        const angle = Konva$2.getAngle(clockwise ? 360 - this.angle() : this.angle());
        const boundLeftRatio = Math.cos(Math.min(angle, Math.PI));
        const boundRightRatio = 1;
        const boundTopRatio = Math.sin(Math.min(Math.max(Math.PI, angle), (3 * Math.PI) / 2));
        const boundBottomRatio = Math.sin(Math.min(angle, Math.PI / 2));
        const boundLeft = boundLeftRatio * (boundLeftRatio > 0 ? innerRadius : outerRadius);
        const boundRight = boundRightRatio * (outerRadius );
        const boundTop = boundTopRatio * (boundTopRatio > 0 ? innerRadius : outerRadius);
        const boundBottom = boundBottomRatio * (boundBottomRatio > 0 ? outerRadius : innerRadius);
        return {
            x: boundLeft,
            y: clockwise ? -1 * boundBottom : boundTop,
            width: boundRight - boundLeft,
            height: boundBottom - boundTop,
        };
    }
}
Arc.prototype._centroid = true;
Arc.prototype.className = 'Arc';
Arc.prototype._attrsAffectingSize = [
    'innerRadius',
    'outerRadius',
    'angle',
    'clockwise',
];
_registerNode(Arc);
Factory.addGetterSetter(Arc, 'innerRadius', 0, getNumberValidator());
Factory.addGetterSetter(Arc, 'outerRadius', 0, getNumberValidator());
Factory.addGetterSetter(Arc, 'angle', 0, getNumberValidator());
Factory.addGetterSetter(Arc, 'clockwise', false, getBooleanValidator());

function getControlPoints(x0, y0, x1, y1, x2, y2, t) {
    const d01 = Math.sqrt(Math.pow(x1 - x0, 2) + Math.pow(y1 - y0, 2)), d12 = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)), fa = (t * d01) / (d01 + d12), fb = (t * d12) / (d01 + d12), p1x = x1 - fa * (x2 - x0), p1y = y1 - fa * (y2 - y0), p2x = x1 + fb * (x2 - x0), p2y = y1 + fb * (y2 - y0);
    return [p1x, p1y, p2x, p2y];
}
function expandPoints(p, tension) {
    const len = p.length, allPoints = [];
    for (let n = 2; n < len - 2; n += 2) {
        const cp = getControlPoints(p[n - 2], p[n - 1], p[n], p[n + 1], p[n + 2], p[n + 3], tension);
        if (isNaN(cp[0])) {
            continue;
        }
        allPoints.push(cp[0]);
        allPoints.push(cp[1]);
        allPoints.push(p[n]);
        allPoints.push(p[n + 1]);
        allPoints.push(cp[2]);
        allPoints.push(cp[3]);
    }
    return allPoints;
}
function getBezierExtremaPoints(points) {
    const axisPoints = [
        [points[0], points[2], points[4], points[6]],
        [points[1], points[3], points[5], points[7]],
    ];
    const extremaTs = [];
    for (const axis of axisPoints) {
        const a = -3 * axis[0] + 9 * axis[1] - 9 * axis[2] + 3 * axis[3];
        if (a !== 0) {
            const b = 6 * axis[0] - 12 * axis[1] + 6 * axis[2];
            const c = -3 * axis[0] + 3 * axis[1];
            const discriminant = b * b - 4 * a * c;
            if (discriminant >= 0) {
                const d = Math.sqrt(discriminant);
                extremaTs.push((-b + d) / (2 * a));
                extremaTs.push((-b - d) / (2 * a));
            }
        }
    }
    return extremaTs
        .filter((t) => t > 0 && t < 1)
        .flatMap((t) => axisPoints.map((axis) => {
        const mt = 1 - t;
        return (mt * mt * mt * axis[0] +
            3 * mt * mt * t * axis[1] +
            3 * mt * t * t * axis[2] +
            t * t * t * axis[3]);
    }));
}
let Line$1 = class Line extends Shape {
    constructor(config) {
        super(config);
        this.on('pointsChange.konva tensionChange.konva closedChange.konva bezierChange.konva', function () {
            this._clearCache('tensionPoints');
        });
    }
    _sceneFunc(context) {
        const points = this.points(), length = points.length, tension = this.tension(), closed = this.closed(), bezier = this.bezier();
        if (!length) {
            return;
        }
        let n = 0;
        context.beginPath();
        context.moveTo(points[0], points[1]);
        if (tension !== 0 && length > 4) {
            const tp = this.getTensionPoints();
            const len = tp.length;
            n = closed ? 0 : 4;
            if (!closed) {
                context.quadraticCurveTo(tp[0], tp[1], tp[2], tp[3]);
            }
            while (n < len - 2) {
                context.bezierCurveTo(tp[n++], tp[n++], tp[n++], tp[n++], tp[n++], tp[n++]);
            }
            if (!closed) {
                context.quadraticCurveTo(tp[len - 2], tp[len - 1], points[length - 2], points[length - 1]);
            }
        }
        else if (bezier) {
            n = 2;
            while (n < length) {
                context.bezierCurveTo(points[n++], points[n++], points[n++], points[n++], points[n++], points[n++]);
            }
        }
        else {
            for (n = 2; n < length; n += 2) {
                context.lineTo(points[n], points[n + 1]);
            }
        }
        if (closed) {
            context.closePath();
            context.fillStrokeShape(this);
        }
        else {
            context.strokeShape(this);
        }
    }
    getTensionPoints() {
        return this._getCache('tensionPoints', this._getTensionPoints);
    }
    _getTensionPoints() {
        if (this.closed()) {
            return this._getTensionPointsClosed();
        }
        else {
            return expandPoints(this.points(), this.tension());
        }
    }
    _getTensionPointsClosed() {
        const p = this.points(), len = p.length, tension = this.tension(), firstControlPoints = getControlPoints(p[len - 2], p[len - 1], p[0], p[1], p[2], p[3], tension), lastControlPoints = getControlPoints(p[len - 4], p[len - 3], p[len - 2], p[len - 1], p[0], p[1], tension), middle = expandPoints(p, tension), tp = [firstControlPoints[2], firstControlPoints[3]]
            .concat(middle)
            .concat([
            lastControlPoints[0],
            lastControlPoints[1],
            p[len - 2],
            p[len - 1],
            lastControlPoints[2],
            lastControlPoints[3],
            firstControlPoints[0],
            firstControlPoints[1],
            p[0],
            p[1],
        ]);
        return tp;
    }
    getWidth() {
        return this.getSelfRect().width;
    }
    getHeight() {
        return this.getSelfRect().height;
    }
    getSelfRect() {
        let points = this.points();
        if (points.length < 4) {
            return {
                x: points[0] || 0,
                y: points[1] || 0,
                width: 0,
                height: 0,
            };
        }
        if (this.tension() !== 0) {
            points = [
                points[0],
                points[1],
                ...this._getTensionPoints(),
                points[points.length - 2],
                points[points.length - 1],
            ];
        }
        else if (this.bezier()) {
            points = [
                points[0],
                points[1],
                ...getBezierExtremaPoints(this.points()),
                points[points.length - 2],
                points[points.length - 1],
            ];
        }
        else {
            points = this.points();
        }
        let minX = points[0];
        let maxX = points[0];
        let minY = points[1];
        let maxY = points[1];
        let x, y;
        for (let i = 0; i < points.length / 2; i++) {
            x = points[i * 2];
            y = points[i * 2 + 1];
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        }
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
        };
    }
};
Line$1.prototype.className = 'Line';
Line$1.prototype._attrsAffectingSize = ['points', 'bezier', 'tension'];
_registerNode(Line$1);
Factory.addGetterSetter(Line$1, 'closed', false);
Factory.addGetterSetter(Line$1, 'bezier', false);
Factory.addGetterSetter(Line$1, 'tension', 0, getNumberValidator());
Factory.addGetterSetter(Line$1, 'points', [], getNumberArrayValidator());

const tValues = [
    [],
    [],
    [
        -0.5773502691896257,
        0.5773502691896257645091487805019574556476,
    ],
    [
        0, -0.7745966692414834,
        0.7745966692414833770358530799564799221665,
    ],
    [
        -0.33998104358485626,
        0.3399810435848562648026657591032446872005,
        -0.8611363115940526,
        0.8611363115940525752239464888928095050957,
    ],
    [
        0, -0.5384693101056831,
        0.5384693101056830910363144207002088049672,
        -0.906179845938664,
        0.9061798459386639927976268782993929651256,
    ],
    [
        0.6612093864662645136613995950199053470064,
        -0.6612093864662645,
        -0.2386191860831969,
        0.2386191860831969086305017216807119354186,
        -0.932469514203152,
        0.9324695142031520278123015544939946091347,
    ],
    [
        0, 0.4058451513773971669066064120769614633473,
        -0.4058451513773972,
        -0.7415311855993945,
        0.7415311855993944398638647732807884070741,
        -0.9491079123427585,
        0.9491079123427585245261896840478512624007,
    ],
    [
        -0.1834346424956498,
        0.1834346424956498049394761423601839806667,
        -0.525532409916329,
        0.5255324099163289858177390491892463490419,
        -0.7966664774136267,
        0.7966664774136267395915539364758304368371,
        -0.9602898564975363,
        0.9602898564975362316835608685694729904282,
    ],
    [
        0, -0.8360311073266358,
        0.8360311073266357942994297880697348765441,
        -0.9681602395076261,
        0.9681602395076260898355762029036728700494,
        -0.3242534234038089,
        0.3242534234038089290385380146433366085719,
        -0.6133714327005904,
        0.6133714327005903973087020393414741847857,
    ],
    [
        -0.14887433898163122,
        0.1488743389816312108848260011297199846175,
        -0.4333953941292472,
        0.4333953941292471907992659431657841622,
        -0.6794095682990244,
        0.6794095682990244062343273651148735757692,
        -0.8650633666889845,
        0.8650633666889845107320966884234930485275,
        -0.9739065285171717,
        0.9739065285171717200779640120844520534282,
    ],
    [
        0, -0.26954315595234496,
        0.2695431559523449723315319854008615246796,
        -0.5190961292068118,
        0.5190961292068118159257256694586095544802,
        -0.7301520055740494,
        0.7301520055740493240934162520311534580496,
        -0.8870625997680953,
        0.8870625997680952990751577693039272666316,
        -0.978228658146057,
        0.9782286581460569928039380011228573907714,
    ],
    [
        -0.1252334085114689,
        0.1252334085114689154724413694638531299833,
        -0.3678314989981802,
        0.3678314989981801937526915366437175612563,
        -0.5873179542866175,
        0.587317954286617447296702418940534280369,
        -0.7699026741943047,
        0.7699026741943046870368938332128180759849,
        -0.9041172563704749,
        0.9041172563704748566784658661190961925375,
        -0.9815606342467192,
        0.9815606342467192506905490901492808229601,
    ],
    [
        0, -0.2304583159551348,
        0.2304583159551347940655281210979888352115,
        -0.44849275103644687,
        0.4484927510364468528779128521276398678019,
        -0.6423493394403402,
        0.6423493394403402206439846069955156500716,
        -0.8015780907333099,
        0.8015780907333099127942064895828598903056,
        -0.9175983992229779,
        0.9175983992229779652065478365007195123904,
        -0.9841830547185881,
        0.9841830547185881494728294488071096110649,
    ],
    [
        -0.10805494870734367,
        0.1080549487073436620662446502198347476119,
        -0.31911236892788974,
        0.3191123689278897604356718241684754668342,
        -0.5152486363581541,
        0.5152486363581540919652907185511886623088,
        -0.6872929048116855,
        0.6872929048116854701480198030193341375384,
        -0.827201315069765,
        0.8272013150697649931897947426503949610397,
        -0.9284348836635735,
        0.928434883663573517336391139377874264477,
        -0.9862838086968123,
        0.986283808696812338841597266704052801676,
    ],
    [
        0, -0.20119409399743451,
        0.2011940939974345223006283033945962078128,
        -0.3941513470775634,
        0.3941513470775633698972073709810454683627,
        -0.5709721726085388,
        0.5709721726085388475372267372539106412383,
        -0.7244177313601701,
        0.7244177313601700474161860546139380096308,
        -0.8482065834104272,
        0.8482065834104272162006483207742168513662,
        -0.937273392400706,
        0.9372733924007059043077589477102094712439,
        -0.9879925180204854,
        0.9879925180204854284895657185866125811469,
    ],
    [
        -0.09501250983763744,
        0.0950125098376374401853193354249580631303,
        -0.2816035507792589,
        0.281603550779258913230460501460496106486,
        -0.45801677765722737,
        0.45801677765722738634241944298357757354,
        -0.6178762444026438,
        0.6178762444026437484466717640487910189918,
        -0.755404408355003,
        0.7554044083550030338951011948474422683538,
        -0.8656312023878318,
        0.8656312023878317438804678977123931323873,
        -0.9445750230732326,
        0.9445750230732325760779884155346083450911,
        -0.9894009349916499,
        0.9894009349916499325961541734503326274262,
    ],
    [
        0, -0.17848418149584785,
        0.1784841814958478558506774936540655574754,
        -0.3512317634538763,
        0.3512317634538763152971855170953460050405,
        -0.5126905370864769,
        0.5126905370864769678862465686295518745829,
        -0.6576711592166907,
        0.6576711592166907658503022166430023351478,
        -0.7815140038968014,
        0.7815140038968014069252300555204760502239,
        -0.8802391537269859,
        0.8802391537269859021229556944881556926234,
        -0.9506755217687678,
        0.9506755217687677612227169578958030214433,
        -0.9905754753144174,
        0.9905754753144173356754340199406652765077,
    ],
    [
        -0.0847750130417353,
        0.0847750130417353012422618529357838117333,
        -0.2518862256915055,
        0.2518862256915055095889728548779112301628,
        -0.41175116146284263,
        0.4117511614628426460359317938330516370789,
        -0.5597708310739475,
        0.5597708310739475346078715485253291369276,
        -0.6916870430603532,
        0.6916870430603532078748910812888483894522,
        -0.8037049589725231,
        0.8037049589725231156824174550145907971032,
        -0.8926024664975557,
        0.8926024664975557392060605911271455154078,
        -0.9558239495713977,
        0.9558239495713977551811958929297763099728,
        -0.9915651684209309,
        0.9915651684209309467300160047061507702525,
    ],
    [
        0, -0.16035864564022537,
        0.1603586456402253758680961157407435495048,
        -0.31656409996362983,
        0.3165640999636298319901173288498449178922,
        -0.46457074137596094,
        0.4645707413759609457172671481041023679762,
        -0.600545304661681,
        0.6005453046616810234696381649462392798683,
        -0.7209661773352294,
        0.7209661773352293786170958608237816296571,
        -0.8227146565371428,
        0.8227146565371428249789224867127139017745,
        -0.9031559036148179,
        0.9031559036148179016426609285323124878093,
        -0.96020815213483,
        0.960208152134830030852778840687651526615,
        -0.9924068438435844,
        0.9924068438435844031890176702532604935893,
    ],
    [
        -0.07652652113349734,
        0.0765265211334973337546404093988382110047,
        -0.22778585114164507,
        0.227785851141645078080496195368574624743,
        -0.37370608871541955,
        0.3737060887154195606725481770249272373957,
        -0.5108670019508271,
        0.5108670019508270980043640509552509984254,
        -0.636053680726515,
        0.6360536807265150254528366962262859367433,
        -0.7463319064601508,
        0.7463319064601507926143050703556415903107,
        -0.8391169718222188,
        0.8391169718222188233945290617015206853296,
        -0.912234428251326,
        0.9122344282513259058677524412032981130491,
        -0.9639719272779138,
        0.963971927277913791267666131197277221912,
        -0.9931285991850949,
        0.9931285991850949247861223884713202782226,
    ],
    [
        0, -0.1455618541608951,
        0.1455618541608950909370309823386863301163,
        -0.2880213168024011,
        0.288021316802401096600792516064600319909,
        -0.4243421202074388,
        0.4243421202074387835736688885437880520964,
        -0.5516188358872198,
        0.551618835887219807059018796724313286622,
        -0.6671388041974123,
        0.667138804197412319305966669990339162597,
        -0.7684399634756779,
        0.7684399634756779086158778513062280348209,
        -0.8533633645833173,
        0.8533633645833172836472506385875676702761,
        -0.9200993341504008,
        0.9200993341504008287901871337149688941591,
        -0.9672268385663063,
        0.9672268385663062943166222149076951614246,
        -0.9937521706203895,
        0.9937521706203895002602420359379409291933,
    ],
    [
        -0.06973927331972223,
        0.0697392733197222212138417961186280818222,
        -0.20786042668822127,
        0.2078604266882212854788465339195457342156,
        -0.34193582089208424,
        0.3419358208920842251581474204273796195591,
        -0.469355837986757,
        0.4693558379867570264063307109664063460953,
        -0.5876404035069116,
        0.5876404035069115929588769276386473488776,
        -0.6944872631866827,
        0.6944872631866827800506898357622567712673,
        -0.7878168059792081,
        0.7878168059792081620042779554083515213881,
        -0.8658125777203002,
        0.8658125777203001365364256370193787290847,
        -0.926956772187174,
        0.9269567721871740005206929392590531966353,
        -0.9700604978354287,
        0.9700604978354287271239509867652687108059,
        -0.9942945854823992,
        0.994294585482399292073031421161298980393,
    ],
    [
        0, -0.1332568242984661,
        0.1332568242984661109317426822417661370104,
        -0.26413568097034495,
        0.264135680970344930533869538283309602979,
        -0.3903010380302908,
        0.390301038030290831421488872880605458578,
        -0.5095014778460075,
        0.5095014778460075496897930478668464305448,
        -0.6196098757636461,
        0.6196098757636461563850973116495956533871,
        -0.7186613631319502,
        0.7186613631319501944616244837486188483299,
        -0.8048884016188399,
        0.8048884016188398921511184069967785579414,
        -0.8767523582704416,
        0.8767523582704416673781568859341456716389,
        -0.9329710868260161,
        0.9329710868260161023491969890384229782357,
        -0.9725424712181152,
        0.9725424712181152319560240768207773751816,
        -0.9947693349975522,
        0.9947693349975521235239257154455743605736,
    ],
    [
        -0.06405689286260563,
        0.0640568928626056260850430826247450385909,
        -0.1911188674736163,
        0.1911188674736163091586398207570696318404,
        -0.3150426796961634,
        0.3150426796961633743867932913198102407864,
        -0.4337935076260451,
        0.4337935076260451384870842319133497124524,
        -0.5454214713888396,
        0.5454214713888395356583756172183723700107,
        -0.6480936519369755,
        0.6480936519369755692524957869107476266696,
        -0.7401241915785544,
        0.7401241915785543642438281030999784255232,
        -0.820001985973903,
        0.8200019859739029219539498726697452080761,
        -0.8864155270044011,
        0.8864155270044010342131543419821967550873,
        -0.9382745520027328,
        0.9382745520027327585236490017087214496548,
        -0.9747285559713095,
        0.9747285559713094981983919930081690617411,
        -0.9951872199970213,
        0.9951872199970213601799974097007368118745,
    ],
];
const cValues = [
    [],
    [],
    [1.0, 1.0],
    [
        0.8888888888888888888888888888888888888888,
        0.5555555555555555555555555555555555555555,
        0.5555555555555555555555555555555555555555,
    ],
    [
        0.6521451548625461426269360507780005927646,
        0.6521451548625461426269360507780005927646,
        0.3478548451374538573730639492219994072353,
        0.3478548451374538573730639492219994072353,
    ],
    [
        0.5688888888888888888888888888888888888888,
        0.4786286704993664680412915148356381929122,
        0.4786286704993664680412915148356381929122,
        0.2369268850561890875142640407199173626432,
        0.2369268850561890875142640407199173626432,
    ],
    [
        0.3607615730481386075698335138377161116615,
        0.3607615730481386075698335138377161116615,
        0.4679139345726910473898703439895509948116,
        0.4679139345726910473898703439895509948116,
        0.1713244923791703450402961421727328935268,
        0.1713244923791703450402961421727328935268,
    ],
    [
        0.4179591836734693877551020408163265306122,
        0.3818300505051189449503697754889751338783,
        0.3818300505051189449503697754889751338783,
        0.2797053914892766679014677714237795824869,
        0.2797053914892766679014677714237795824869,
        0.1294849661688696932706114326790820183285,
        0.1294849661688696932706114326790820183285,
    ],
    [
        0.3626837833783619829651504492771956121941,
        0.3626837833783619829651504492771956121941,
        0.3137066458778872873379622019866013132603,
        0.3137066458778872873379622019866013132603,
        0.2223810344533744705443559944262408844301,
        0.2223810344533744705443559944262408844301,
        0.1012285362903762591525313543099621901153,
        0.1012285362903762591525313543099621901153,
    ],
    [
        0.3302393550012597631645250692869740488788,
        0.1806481606948574040584720312429128095143,
        0.1806481606948574040584720312429128095143,
        0.0812743883615744119718921581105236506756,
        0.0812743883615744119718921581105236506756,
        0.3123470770400028400686304065844436655987,
        0.3123470770400028400686304065844436655987,
        0.2606106964029354623187428694186328497718,
        0.2606106964029354623187428694186328497718,
    ],
    [
        0.295524224714752870173892994651338329421,
        0.295524224714752870173892994651338329421,
        0.2692667193099963550912269215694693528597,
        0.2692667193099963550912269215694693528597,
        0.2190863625159820439955349342281631924587,
        0.2190863625159820439955349342281631924587,
        0.1494513491505805931457763396576973324025,
        0.1494513491505805931457763396576973324025,
        0.0666713443086881375935688098933317928578,
        0.0666713443086881375935688098933317928578,
    ],
    [
        0.272925086777900630714483528336342189156,
        0.2628045445102466621806888698905091953727,
        0.2628045445102466621806888698905091953727,
        0.2331937645919904799185237048431751394317,
        0.2331937645919904799185237048431751394317,
        0.1862902109277342514260976414316558916912,
        0.1862902109277342514260976414316558916912,
        0.1255803694649046246346942992239401001976,
        0.1255803694649046246346942992239401001976,
        0.0556685671161736664827537204425485787285,
        0.0556685671161736664827537204425485787285,
    ],
    [
        0.2491470458134027850005624360429512108304,
        0.2491470458134027850005624360429512108304,
        0.2334925365383548087608498989248780562594,
        0.2334925365383548087608498989248780562594,
        0.2031674267230659217490644558097983765065,
        0.2031674267230659217490644558097983765065,
        0.160078328543346226334652529543359071872,
        0.160078328543346226334652529543359071872,
        0.1069393259953184309602547181939962242145,
        0.1069393259953184309602547181939962242145,
        0.047175336386511827194615961485017060317,
        0.047175336386511827194615961485017060317,
    ],
    [
        0.2325515532308739101945895152688359481566,
        0.2262831802628972384120901860397766184347,
        0.2262831802628972384120901860397766184347,
        0.2078160475368885023125232193060527633865,
        0.2078160475368885023125232193060527633865,
        0.1781459807619457382800466919960979955128,
        0.1781459807619457382800466919960979955128,
        0.1388735102197872384636017768688714676218,
        0.1388735102197872384636017768688714676218,
        0.0921214998377284479144217759537971209236,
        0.0921214998377284479144217759537971209236,
        0.0404840047653158795200215922009860600419,
        0.0404840047653158795200215922009860600419,
    ],
    [
        0.2152638534631577901958764433162600352749,
        0.2152638534631577901958764433162600352749,
        0.2051984637212956039659240656612180557103,
        0.2051984637212956039659240656612180557103,
        0.1855383974779378137417165901251570362489,
        0.1855383974779378137417165901251570362489,
        0.1572031671581935345696019386238421566056,
        0.1572031671581935345696019386238421566056,
        0.1215185706879031846894148090724766259566,
        0.1215185706879031846894148090724766259566,
        0.0801580871597602098056332770628543095836,
        0.0801580871597602098056332770628543095836,
        0.0351194603317518630318328761381917806197,
        0.0351194603317518630318328761381917806197,
    ],
    [
        0.2025782419255612728806201999675193148386,
        0.1984314853271115764561183264438393248186,
        0.1984314853271115764561183264438393248186,
        0.1861610000155622110268005618664228245062,
        0.1861610000155622110268005618664228245062,
        0.1662692058169939335532008604812088111309,
        0.1662692058169939335532008604812088111309,
        0.1395706779261543144478047945110283225208,
        0.1395706779261543144478047945110283225208,
        0.1071592204671719350118695466858693034155,
        0.1071592204671719350118695466858693034155,
        0.0703660474881081247092674164506673384667,
        0.0703660474881081247092674164506673384667,
        0.0307532419961172683546283935772044177217,
        0.0307532419961172683546283935772044177217,
    ],
    [
        0.1894506104550684962853967232082831051469,
        0.1894506104550684962853967232082831051469,
        0.1826034150449235888667636679692199393835,
        0.1826034150449235888667636679692199393835,
        0.1691565193950025381893120790303599622116,
        0.1691565193950025381893120790303599622116,
        0.1495959888165767320815017305474785489704,
        0.1495959888165767320815017305474785489704,
        0.1246289712555338720524762821920164201448,
        0.1246289712555338720524762821920164201448,
        0.0951585116824927848099251076022462263552,
        0.0951585116824927848099251076022462263552,
        0.0622535239386478928628438369943776942749,
        0.0622535239386478928628438369943776942749,
        0.0271524594117540948517805724560181035122,
        0.0271524594117540948517805724560181035122,
    ],
    [
        0.1794464703562065254582656442618856214487,
        0.1765627053669926463252709901131972391509,
        0.1765627053669926463252709901131972391509,
        0.1680041021564500445099706637883231550211,
        0.1680041021564500445099706637883231550211,
        0.1540457610768102880814315948019586119404,
        0.1540457610768102880814315948019586119404,
        0.1351363684685254732863199817023501973721,
        0.1351363684685254732863199817023501973721,
        0.1118838471934039710947883856263559267358,
        0.1118838471934039710947883856263559267358,
        0.0850361483171791808835353701910620738504,
        0.0850361483171791808835353701910620738504,
        0.0554595293739872011294401653582446605128,
        0.0554595293739872011294401653582446605128,
        0.0241483028685479319601100262875653246916,
        0.0241483028685479319601100262875653246916,
    ],
    [
        0.1691423829631435918406564701349866103341,
        0.1691423829631435918406564701349866103341,
        0.1642764837458327229860537764659275904123,
        0.1642764837458327229860537764659275904123,
        0.1546846751262652449254180038363747721932,
        0.1546846751262652449254180038363747721932,
        0.1406429146706506512047313037519472280955,
        0.1406429146706506512047313037519472280955,
        0.1225552067114784601845191268002015552281,
        0.1225552067114784601845191268002015552281,
        0.1009420441062871655628139849248346070628,
        0.1009420441062871655628139849248346070628,
        0.0764257302548890565291296776166365256053,
        0.0764257302548890565291296776166365256053,
        0.0497145488949697964533349462026386416808,
        0.0497145488949697964533349462026386416808,
        0.0216160135264833103133427102664524693876,
        0.0216160135264833103133427102664524693876,
    ],
    [
        0.1610544498487836959791636253209167350399,
        0.1589688433939543476499564394650472016787,
        0.1589688433939543476499564394650472016787,
        0.152766042065859666778855400897662998461,
        0.152766042065859666778855400897662998461,
        0.1426067021736066117757461094419029724756,
        0.1426067021736066117757461094419029724756,
        0.1287539625393362276755157848568771170558,
        0.1287539625393362276755157848568771170558,
        0.1115666455473339947160239016817659974813,
        0.1115666455473339947160239016817659974813,
        0.0914900216224499994644620941238396526609,
        0.0914900216224499994644620941238396526609,
        0.0690445427376412265807082580060130449618,
        0.0690445427376412265807082580060130449618,
        0.0448142267656996003328381574019942119517,
        0.0448142267656996003328381574019942119517,
        0.0194617882297264770363120414644384357529,
        0.0194617882297264770363120414644384357529,
    ],
    [
        0.1527533871307258506980843319550975934919,
        0.1527533871307258506980843319550975934919,
        0.1491729864726037467878287370019694366926,
        0.1491729864726037467878287370019694366926,
        0.1420961093183820513292983250671649330345,
        0.1420961093183820513292983250671649330345,
        0.1316886384491766268984944997481631349161,
        0.1316886384491766268984944997481631349161,
        0.118194531961518417312377377711382287005,
        0.118194531961518417312377377711382287005,
        0.1019301198172404350367501354803498761666,
        0.1019301198172404350367501354803498761666,
        0.0832767415767047487247581432220462061001,
        0.0832767415767047487247581432220462061001,
        0.0626720483341090635695065351870416063516,
        0.0626720483341090635695065351870416063516,
        0.040601429800386941331039952274932109879,
        0.040601429800386941331039952274932109879,
        0.0176140071391521183118619623518528163621,
        0.0176140071391521183118619623518528163621,
    ],
    [
        0.1460811336496904271919851476833711882448,
        0.1445244039899700590638271665537525436099,
        0.1445244039899700590638271665537525436099,
        0.1398873947910731547221334238675831108927,
        0.1398873947910731547221334238675831108927,
        0.132268938633337461781052574496775604329,
        0.132268938633337461781052574496775604329,
        0.1218314160537285341953671771257335983563,
        0.1218314160537285341953671771257335983563,
        0.1087972991671483776634745780701056420336,
        0.1087972991671483776634745780701056420336,
        0.0934444234560338615532897411139320884835,
        0.0934444234560338615532897411139320884835,
        0.0761001136283793020170516533001831792261,
        0.0761001136283793020170516533001831792261,
        0.0571344254268572082836358264724479574912,
        0.0571344254268572082836358264724479574912,
        0.0369537897708524937999506682993296661889,
        0.0369537897708524937999506682993296661889,
        0.0160172282577743333242246168584710152658,
        0.0160172282577743333242246168584710152658,
    ],
    [
        0.1392518728556319933754102483418099578739,
        0.1392518728556319933754102483418099578739,
        0.1365414983460151713525738312315173965863,
        0.1365414983460151713525738312315173965863,
        0.1311735047870623707329649925303074458757,
        0.1311735047870623707329649925303074458757,
        0.1232523768105124242855609861548144719594,
        0.1232523768105124242855609861548144719594,
        0.1129322960805392183934006074217843191142,
        0.1129322960805392183934006074217843191142,
        0.1004141444428809649320788378305362823508,
        0.1004141444428809649320788378305362823508,
        0.0859416062170677274144436813727028661891,
        0.0859416062170677274144436813727028661891,
        0.0697964684245204880949614189302176573987,
        0.0697964684245204880949614189302176573987,
        0.0522933351526832859403120512732112561121,
        0.0522933351526832859403120512732112561121,
        0.0337749015848141547933022468659129013491,
        0.0337749015848141547933022468659129013491,
        0.0146279952982722006849910980471854451902,
        0.0146279952982722006849910980471854451902,
    ],
    [
        0.1336545721861061753514571105458443385831,
        0.132462039404696617371642464703316925805,
        0.132462039404696617371642464703316925805,
        0.1289057221880821499785953393997936532597,
        0.1289057221880821499785953393997936532597,
        0.1230490843067295304675784006720096548158,
        0.1230490843067295304675784006720096548158,
        0.1149966402224113649416435129339613014914,
        0.1149966402224113649416435129339613014914,
        0.1048920914645414100740861850147438548584,
        0.1048920914645414100740861850147438548584,
        0.0929157660600351474770186173697646486034,
        0.0929157660600351474770186173697646486034,
        0.0792814117767189549228925247420432269137,
        0.0792814117767189549228925247420432269137,
        0.0642324214085258521271696151589109980391,
        0.0642324214085258521271696151589109980391,
        0.0480376717310846685716410716320339965612,
        0.0480376717310846685716410716320339965612,
        0.0309880058569794443106942196418845053837,
        0.0309880058569794443106942196418845053837,
        0.0134118594871417720813094934586150649766,
        0.0134118594871417720813094934586150649766,
    ],
    [
        0.1279381953467521569740561652246953718517,
        0.1279381953467521569740561652246953718517,
        0.1258374563468282961213753825111836887264,
        0.1258374563468282961213753825111836887264,
        0.121670472927803391204463153476262425607,
        0.121670472927803391204463153476262425607,
        0.1155056680537256013533444839067835598622,
        0.1155056680537256013533444839067835598622,
        0.1074442701159656347825773424466062227946,
        0.1074442701159656347825773424466062227946,
        0.0976186521041138882698806644642471544279,
        0.0976186521041138882698806644642471544279,
        0.086190161531953275917185202983742667185,
        0.086190161531953275917185202983742667185,
        0.0733464814110803057340336152531165181193,
        0.0733464814110803057340336152531165181193,
        0.0592985849154367807463677585001085845412,
        0.0592985849154367807463677585001085845412,
        0.0442774388174198061686027482113382288593,
        0.0442774388174198061686027482113382288593,
        0.0285313886289336631813078159518782864491,
        0.0285313886289336631813078159518782864491,
        0.0123412297999871995468056670700372915759,
        0.0123412297999871995468056670700372915759,
    ],
];
const binomialCoefficients = [[1], [1, 1], [1, 2, 1], [1, 3, 3, 1]];
const getCubicArcLength = (xs, ys, t) => {
    let sum;
    let correctedT;
    const n = 20;
    const z = t / 2;
    sum = 0;
    for (let i = 0; i < n; i++) {
        correctedT = z * tValues[n][i] + z;
        sum += cValues[n][i] * BFunc(xs, ys, correctedT);
    }
    return z * sum;
};
const getQuadraticArcLength = (xs, ys, t) => {
    if (t === undefined) {
        t = 1;
    }
    const ax = xs[0] - 2 * xs[1] + xs[2];
    const ay = ys[0] - 2 * ys[1] + ys[2];
    const bx = 2 * xs[1] - 2 * xs[0];
    const by = 2 * ys[1] - 2 * ys[0];
    const A = 4 * (ax * ax + ay * ay);
    const B = 4 * (ax * bx + ay * by);
    const C = bx * bx + by * by;
    if (A === 0) {
        return (t * Math.sqrt(Math.pow(xs[2] - xs[0], 2) + Math.pow(ys[2] - ys[0], 2)));
    }
    const b = B / (2 * A);
    const c = C / A;
    const u = t + b;
    const k = c - b * b;
    const uuk = u * u + k > 0 ? Math.sqrt(u * u + k) : 0;
    const bbk = b * b + k > 0 ? Math.sqrt(b * b + k) : 0;
    const term = b + Math.sqrt(b * b + k) !== 0
        ? k * Math.log(Math.abs((u + uuk) / (b + bbk)))
        : 0;
    return (Math.sqrt(A) / 2) * (u * uuk - b * bbk + term);
};
function BFunc(xs, ys, t) {
    const xbase = getDerivative(1, t, xs);
    const ybase = getDerivative(1, t, ys);
    const combined = xbase * xbase + ybase * ybase;
    return Math.sqrt(combined);
}
const getDerivative = (derivative, t, vs) => {
    const n = vs.length - 1;
    let _vs;
    let value;
    if (n === 0) {
        return 0;
    }
    if (derivative === 0) {
        value = 0;
        for (let k = 0; k <= n; k++) {
            value +=
                binomialCoefficients[n][k] *
                    Math.pow(1 - t, n - k) *
                    Math.pow(t, k) *
                    vs[k];
        }
        return value;
    }
    else {
        _vs = new Array(n);
        for (let k = 0; k < n; k++) {
            _vs[k] = n * (vs[k + 1] - vs[k]);
        }
        return getDerivative(derivative - 1, t, _vs);
    }
};
const t2length = (length, totalLength, func) => {
    let error = 1;
    let t = length / totalLength;
    let step = (length - func(t)) / totalLength;
    let numIterations = 0;
    while (error > 0.001) {
        const increasedTLength = func(t + step);
        const increasedTError = Math.abs(length - increasedTLength) / totalLength;
        if (increasedTError < error) {
            error = increasedTError;
            t += step;
        }
        else {
            const decreasedTLength = func(t - step);
            const decreasedTError = Math.abs(length - decreasedTLength) / totalLength;
            if (decreasedTError < error) {
                error = decreasedTError;
                t -= step;
            }
            else {
                step /= 2;
            }
        }
        numIterations++;
        if (numIterations > 500) {
            break;
        }
    }
    return t;
};

class Path extends Shape {
    constructor(config) {
        super(config);
        this.dataArray = [];
        this.pathLength = 0;
        this._readDataAttribute();
        this.on('dataChange.konva', function () {
            this._readDataAttribute();
        });
    }
    _readDataAttribute() {
        this.dataArray = Path.parsePathData(this.data());
        this.pathLength = Path.getPathLength(this.dataArray);
    }
    _sceneFunc(context) {
        const ca = this.dataArray;
        context.beginPath();
        let isClosed = false;
        for (let n = 0; n < ca.length; n++) {
            const c = ca[n].command;
            const p = ca[n].points;
            switch (c) {
                case 'L':
                    context.lineTo(p[0], p[1]);
                    break;
                case 'M':
                    context.moveTo(p[0], p[1]);
                    break;
                case 'C':
                    context.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]);
                    break;
                case 'Q':
                    context.quadraticCurveTo(p[0], p[1], p[2], p[3]);
                    break;
                case 'A':
                    const cx = p[0], cy = p[1], rx = p[2], ry = p[3], theta = p[4], dTheta = p[5], psi = p[6], fs = p[7];
                    const r = rx > ry ? rx : ry;
                    const scaleX = rx > ry ? 1 : rx / ry;
                    const scaleY = rx > ry ? ry / rx : 1;
                    context.translate(cx, cy);
                    context.rotate(psi);
                    context.scale(scaleX, scaleY);
                    context.arc(0, 0, r, theta, theta + dTheta, 1 - fs);
                    context.scale(1 / scaleX, 1 / scaleY);
                    context.rotate(-psi);
                    context.translate(-cx, -cy);
                    break;
                case 'z':
                    isClosed = true;
                    context.closePath();
                    break;
            }
        }
        if (!isClosed && !this.hasFill()) {
            context.strokeShape(this);
        }
        else {
            context.fillStrokeShape(this);
        }
    }
    getSelfRect() {
        let points = [];
        this.dataArray.forEach(function (data) {
            if (data.command === 'A') {
                const start = data.points[4];
                const dTheta = data.points[5];
                const end = data.points[4] + dTheta;
                let inc = Math.PI / 180.0;
                if (Math.abs(start - end) < inc) {
                    inc = Math.abs(start - end);
                }
                if (dTheta < 0) {
                    for (let t = start - inc; t > end; t -= inc) {
                        const point = Path.getPointOnEllipticalArc(data.points[0], data.points[1], data.points[2], data.points[3], t, 0);
                        points.push(point.x, point.y);
                    }
                }
                else {
                    for (let t = start + inc; t < end; t += inc) {
                        const point = Path.getPointOnEllipticalArc(data.points[0], data.points[1], data.points[2], data.points[3], t, 0);
                        points.push(point.x, point.y);
                    }
                }
            }
            else if (data.command === 'C') {
                for (let t = 0.0; t <= 1; t += 0.01) {
                    const point = Path.getPointOnCubicBezier(t, data.start.x, data.start.y, data.points[0], data.points[1], data.points[2], data.points[3], data.points[4], data.points[5]);
                    points.push(point.x, point.y);
                }
            }
            else {
                points = points.concat(data.points);
            }
        });
        let minX = points[0];
        let maxX = points[0];
        let minY = points[1];
        let maxY = points[1];
        let x, y;
        for (let i = 0; i < points.length / 2; i++) {
            x = points[i * 2];
            y = points[i * 2 + 1];
            if (!isNaN(x)) {
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
            }
            if (!isNaN(y)) {
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
            }
        }
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
        };
    }
    getLength() {
        return this.pathLength;
    }
    getPointAtLength(length) {
        return Path.getPointAtLengthOfDataArray(length, this.dataArray);
    }
    static getLineLength(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    }
    static getPathLength(dataArray) {
        let pathLength = 0;
        for (let i = 0; i < dataArray.length; ++i) {
            pathLength += dataArray[i].pathLength;
        }
        return pathLength;
    }
    static getPointAtLengthOfDataArray(length, dataArray) {
        let points, i = 0, ii = dataArray.length;
        if (!ii) {
            return null;
        }
        while (i < ii && length > dataArray[i].pathLength) {
            length -= dataArray[i].pathLength;
            ++i;
        }
        if (i === ii) {
            points = dataArray[i - 1].points.slice(-2);
            return {
                x: points[0],
                y: points[1],
            };
        }
        if (length < 0.01) {
            const cmd = dataArray[i].command;
            if (cmd === 'M') {
                points = dataArray[i].points.slice(0, 2);
                return {
                    x: points[0],
                    y: points[1],
                };
            }
            else {
                return {
                    x: dataArray[i].start.x,
                    y: dataArray[i].start.y,
                };
            }
        }
        const cp = dataArray[i];
        const p = cp.points;
        switch (cp.command) {
            case 'L':
                return Path.getPointOnLine(length, cp.start.x, cp.start.y, p[0], p[1]);
            case 'C':
                return Path.getPointOnCubicBezier(t2length(length, Path.getPathLength(dataArray), (i) => {
                    return getCubicArcLength([cp.start.x, p[0], p[2], p[4]], [cp.start.y, p[1], p[3], p[5]], i);
                }), cp.start.x, cp.start.y, p[0], p[1], p[2], p[3], p[4], p[5]);
            case 'Q':
                return Path.getPointOnQuadraticBezier(t2length(length, Path.getPathLength(dataArray), (i) => {
                    return getQuadraticArcLength([cp.start.x, p[0], p[2]], [cp.start.y, p[1], p[3]], i);
                }), cp.start.x, cp.start.y, p[0], p[1], p[2], p[3]);
            case 'A':
                const cx = p[0], cy = p[1], rx = p[2], ry = p[3], dTheta = p[5], psi = p[6];
                let theta = p[4];
                theta += (dTheta * length) / cp.pathLength;
                return Path.getPointOnEllipticalArc(cx, cy, rx, ry, theta, psi);
        }
        return null;
    }
    static getPointOnLine(dist, P1x, P1y, P2x, P2y, fromX, fromY) {
        fromX = fromX !== null && fromX !== void 0 ? fromX : P1x;
        fromY = fromY !== null && fromY !== void 0 ? fromY : P1y;
        const len = this.getLineLength(P1x, P1y, P2x, P2y);
        if (len < 1e-10) {
            return { x: P1x, y: P1y };
        }
        if (P2x === P1x) {
            return { x: fromX, y: fromY + (P2y > P1y ? dist : -dist) };
        }
        const m = (P2y - P1y) / (P2x - P1x);
        const run = Math.sqrt((dist * dist) / (1 + m * m)) * (P2x < P1x ? -1 : 1);
        const rise = m * run;
        if (Math.abs(fromY - P1y - m * (fromX - P1x)) < 1e-10) {
            return { x: fromX + run, y: fromY + rise };
        }
        const u = ((fromX - P1x) * (P2x - P1x) + (fromY - P1y) * (P2y - P1y)) / (len * len);
        const ix = P1x + u * (P2x - P1x);
        const iy = P1y + u * (P2y - P1y);
        const pRise = this.getLineLength(fromX, fromY, ix, iy);
        const pRun = Math.sqrt(dist * dist - pRise * pRise);
        const adjustedRun = Math.sqrt((pRun * pRun) / (1 + m * m)) * (P2x < P1x ? -1 : 1);
        const adjustedRise = m * adjustedRun;
        return { x: ix + adjustedRun, y: iy + adjustedRise };
    }
    static getPointOnCubicBezier(pct, P1x, P1y, P2x, P2y, P3x, P3y, P4x, P4y) {
        function CB1(t) {
            return t * t * t;
        }
        function CB2(t) {
            return 3 * t * t * (1 - t);
        }
        function CB3(t) {
            return 3 * t * (1 - t) * (1 - t);
        }
        function CB4(t) {
            return (1 - t) * (1 - t) * (1 - t);
        }
        const x = P4x * CB1(pct) + P3x * CB2(pct) + P2x * CB3(pct) + P1x * CB4(pct);
        const y = P4y * CB1(pct) + P3y * CB2(pct) + P2y * CB3(pct) + P1y * CB4(pct);
        return { x, y };
    }
    static getPointOnQuadraticBezier(pct, P1x, P1y, P2x, P2y, P3x, P3y) {
        function QB1(t) {
            return t * t;
        }
        function QB2(t) {
            return 2 * t * (1 - t);
        }
        function QB3(t) {
            return (1 - t) * (1 - t);
        }
        const x = P3x * QB1(pct) + P2x * QB2(pct) + P1x * QB3(pct);
        const y = P3y * QB1(pct) + P2y * QB2(pct) + P1y * QB3(pct);
        return { x, y };
    }
    static getPointOnEllipticalArc(cx, cy, rx, ry, theta, psi) {
        const cosPsi = Math.cos(psi), sinPsi = Math.sin(psi);
        const pt = {
            x: rx * Math.cos(theta),
            y: ry * Math.sin(theta),
        };
        return {
            x: cx + (pt.x * cosPsi - pt.y * sinPsi),
            y: cy + (pt.x * sinPsi + pt.y * cosPsi),
        };
    }
    static parsePathData(data) {
        if (!data) {
            return [];
        }
        let cs = data;
        const cc = [
            'm',
            'M',
            'l',
            'L',
            'v',
            'V',
            'h',
            'H',
            'z',
            'Z',
            'c',
            'C',
            'q',
            'Q',
            't',
            'T',
            's',
            'S',
            'a',
            'A',
        ];
        cs = cs.replace(new RegExp(' ', 'g'), ',');
        for (let n = 0; n < cc.length; n++) {
            cs = cs.replace(new RegExp(cc[n], 'g'), '|' + cc[n]);
        }
        const arr = cs.split('|');
        const ca = [];
        const coords = [];
        let cpx = 0;
        let cpy = 0;
        const re = /([-+]?((\d+\.\d+)|((\d+)|(\.\d+)))(?:e[-+]?\d+)?)/gi;
        let match;
        for (let n = 1; n < arr.length; n++) {
            let str = arr[n];
            let c = str.charAt(0);
            str = str.slice(1);
            coords.length = 0;
            while ((match = re.exec(str))) {
                coords.push(match[0]);
            }
            let p = [];
            let arcParamIndex = c === 'A' || c === 'a' ? 0 : -1;
            for (let j = 0, jlen = coords.length; j < jlen; j++) {
                const token = coords[j];
                if (token === '00') {
                    p.push(0, 0);
                    if (arcParamIndex >= 0) {
                        arcParamIndex += 2;
                        if (arcParamIndex >= 7)
                            arcParamIndex -= 7;
                    }
                    continue;
                }
                if (arcParamIndex >= 0) {
                    if (arcParamIndex === 3) {
                        if (/^[01]{2}\d+(?:\.\d+)?$/.test(token)) {
                            p.push(parseInt(token[0], 10));
                            p.push(parseInt(token[1], 10));
                            p.push(parseFloat(token.slice(2)));
                            arcParamIndex += 3;
                            if (arcParamIndex >= 7)
                                arcParamIndex -= 7;
                            continue;
                        }
                        if (token === '11' || token === '10' || token === '01') {
                            p.push(parseInt(token[0], 10));
                            p.push(parseInt(token[1], 10));
                            arcParamIndex += 2;
                            if (arcParamIndex >= 7)
                                arcParamIndex -= 7;
                            continue;
                        }
                        if (token === '0' || token === '1') {
                            p.push(parseInt(token, 10));
                            arcParamIndex += 1;
                            if (arcParamIndex >= 7)
                                arcParamIndex -= 7;
                            continue;
                        }
                    }
                    else if (arcParamIndex === 4) {
                        if (/^[01]\d+(?:\.\d+)?$/.test(token)) {
                            p.push(parseInt(token[0], 10));
                            p.push(parseFloat(token.slice(1)));
                            arcParamIndex += 2;
                            if (arcParamIndex >= 7)
                                arcParamIndex -= 7;
                            continue;
                        }
                        if (token === '0' || token === '1') {
                            p.push(parseInt(token, 10));
                            arcParamIndex += 1;
                            if (arcParamIndex >= 7)
                                arcParamIndex -= 7;
                            continue;
                        }
                    }
                    const parsedArc = parseFloat(token);
                    if (!isNaN(parsedArc)) {
                        p.push(parsedArc);
                    }
                    else {
                        p.push(0);
                    }
                    arcParamIndex += 1;
                    if (arcParamIndex >= 7)
                        arcParamIndex -= 7;
                }
                else {
                    const parsed = parseFloat(token);
                    if (!isNaN(parsed)) {
                        p.push(parsed);
                    }
                    else {
                        p.push(0);
                    }
                }
            }
            while (p.length > 0) {
                if (isNaN(p[0])) {
                    break;
                }
                let cmd = '';
                let points = [];
                const startX = cpx, startY = cpy;
                let prevCmd, ctlPtx, ctlPty;
                let rx, ry, psi, fa, fs, x1, y1;
                switch (c) {
                    case 'l':
                        cpx += p.shift();
                        cpy += p.shift();
                        cmd = 'L';
                        points.push(cpx, cpy);
                        break;
                    case 'L':
                        cpx = p.shift();
                        cpy = p.shift();
                        points.push(cpx, cpy);
                        break;
                    case 'm':
                        const dx = p.shift();
                        const dy = p.shift();
                        cpx += dx;
                        cpy += dy;
                        cmd = 'M';
                        if (ca.length > 2 && ca[ca.length - 1].command === 'z') {
                            for (let idx = ca.length - 2; idx >= 0; idx--) {
                                if (ca[idx].command === 'M') {
                                    cpx = ca[idx].points[0] + dx;
                                    cpy = ca[idx].points[1] + dy;
                                    break;
                                }
                            }
                        }
                        points.push(cpx, cpy);
                        c = 'l';
                        break;
                    case 'M':
                        cpx = p.shift();
                        cpy = p.shift();
                        cmd = 'M';
                        points.push(cpx, cpy);
                        c = 'L';
                        break;
                    case 'h':
                        cpx += p.shift();
                        cmd = 'L';
                        points.push(cpx, cpy);
                        break;
                    case 'H':
                        cpx = p.shift();
                        cmd = 'L';
                        points.push(cpx, cpy);
                        break;
                    case 'v':
                        cpy += p.shift();
                        cmd = 'L';
                        points.push(cpx, cpy);
                        break;
                    case 'V':
                        cpy = p.shift();
                        cmd = 'L';
                        points.push(cpx, cpy);
                        break;
                    case 'C':
                        points.push(p.shift(), p.shift(), p.shift(), p.shift());
                        cpx = p.shift();
                        cpy = p.shift();
                        points.push(cpx, cpy);
                        break;
                    case 'c':
                        points.push(cpx + p.shift(), cpy + p.shift(), cpx + p.shift(), cpy + p.shift());
                        cpx += p.shift();
                        cpy += p.shift();
                        cmd = 'C';
                        points.push(cpx, cpy);
                        break;
                    case 'S':
                        ctlPtx = cpx;
                        ctlPty = cpy;
                        prevCmd = ca[ca.length - 1];
                        if (prevCmd.command === 'C') {
                            ctlPtx = cpx + (cpx - prevCmd.points[2]);
                            ctlPty = cpy + (cpy - prevCmd.points[3]);
                        }
                        points.push(ctlPtx, ctlPty, p.shift(), p.shift());
                        cpx = p.shift();
                        cpy = p.shift();
                        cmd = 'C';
                        points.push(cpx, cpy);
                        break;
                    case 's':
                        ctlPtx = cpx;
                        ctlPty = cpy;
                        prevCmd = ca[ca.length - 1];
                        if (prevCmd.command === 'C') {
                            ctlPtx = cpx + (cpx - prevCmd.points[2]);
                            ctlPty = cpy + (cpy - prevCmd.points[3]);
                        }
                        points.push(ctlPtx, ctlPty, cpx + p.shift(), cpy + p.shift());
                        cpx += p.shift();
                        cpy += p.shift();
                        cmd = 'C';
                        points.push(cpx, cpy);
                        break;
                    case 'Q':
                        points.push(p.shift(), p.shift());
                        cpx = p.shift();
                        cpy = p.shift();
                        points.push(cpx, cpy);
                        break;
                    case 'q':
                        points.push(cpx + p.shift(), cpy + p.shift());
                        cpx += p.shift();
                        cpy += p.shift();
                        cmd = 'Q';
                        points.push(cpx, cpy);
                        break;
                    case 'T':
                        ctlPtx = cpx;
                        ctlPty = cpy;
                        prevCmd = ca[ca.length - 1];
                        if (prevCmd.command === 'Q') {
                            ctlPtx = cpx + (cpx - prevCmd.points[0]);
                            ctlPty = cpy + (cpy - prevCmd.points[1]);
                        }
                        cpx = p.shift();
                        cpy = p.shift();
                        cmd = 'Q';
                        points.push(ctlPtx, ctlPty, cpx, cpy);
                        break;
                    case 't':
                        ctlPtx = cpx;
                        ctlPty = cpy;
                        prevCmd = ca[ca.length - 1];
                        if (prevCmd.command === 'Q') {
                            ctlPtx = cpx + (cpx - prevCmd.points[0]);
                            ctlPty = cpy + (cpy - prevCmd.points[1]);
                        }
                        cpx += p.shift();
                        cpy += p.shift();
                        cmd = 'Q';
                        points.push(ctlPtx, ctlPty, cpx, cpy);
                        break;
                    case 'A':
                        rx = p.shift();
                        ry = p.shift();
                        psi = p.shift();
                        fa = p.shift();
                        fs = p.shift();
                        x1 = cpx;
                        y1 = cpy;
                        cpx = p.shift();
                        cpy = p.shift();
                        cmd = 'A';
                        points = this.convertEndpointToCenterParameterization(x1, y1, cpx, cpy, fa, fs, rx, ry, psi);
                        break;
                    case 'a':
                        rx = p.shift();
                        ry = p.shift();
                        psi = p.shift();
                        fa = p.shift();
                        fs = p.shift();
                        x1 = cpx;
                        y1 = cpy;
                        cpx += p.shift();
                        cpy += p.shift();
                        cmd = 'A';
                        points = this.convertEndpointToCenterParameterization(x1, y1, cpx, cpy, fa, fs, rx, ry, psi);
                        break;
                }
                ca.push({
                    command: cmd || c,
                    points: points,
                    start: {
                        x: startX,
                        y: startY,
                    },
                    pathLength: this.calcLength(startX, startY, cmd || c, points),
                });
            }
            if (c === 'z' || c === 'Z') {
                ca.push({
                    command: 'z',
                    points: [],
                    start: undefined,
                    pathLength: 0,
                });
            }
        }
        return ca;
    }
    static calcLength(x, y, cmd, points) {
        let len, p1, p2, t;
        const path = Path;
        switch (cmd) {
            case 'L':
                return path.getLineLength(x, y, points[0], points[1]);
            case 'C':
                return getCubicArcLength([x, points[0], points[2], points[4]], [y, points[1], points[3], points[5]], 1);
            case 'Q':
                return getQuadraticArcLength([x, points[0], points[2]], [y, points[1], points[3]], 1);
            case 'A':
                len = 0.0;
                const start = points[4];
                const dTheta = points[5];
                const end = points[4] + dTheta;
                let inc = Math.PI / 180.0;
                if (Math.abs(start - end) < inc) {
                    inc = Math.abs(start - end);
                }
                p1 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], start, 0);
                if (dTheta < 0) {
                    for (t = start - inc; t > end; t -= inc) {
                        p2 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
                        len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                        p1 = p2;
                    }
                }
                else {
                    for (t = start + inc; t < end; t += inc) {
                        p2 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
                        len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                        p1 = p2;
                    }
                }
                p2 = path.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], end, 0);
                len += path.getLineLength(p1.x, p1.y, p2.x, p2.y);
                return len;
        }
        return 0;
    }
    static convertEndpointToCenterParameterization(x1, y1, x2, y2, fa, fs, rx, ry, psiDeg) {
        const psi = psiDeg * (Math.PI / 180.0);
        const xp = (Math.cos(psi) * (x1 - x2)) / 2.0 + (Math.sin(psi) * (y1 - y2)) / 2.0;
        const yp = (-1 * Math.sin(psi) * (x1 - x2)) / 2.0 +
            (Math.cos(psi) * (y1 - y2)) / 2.0;
        const lambda = (xp * xp) / (rx * rx) + (yp * yp) / (ry * ry);
        if (lambda > 1) {
            rx *= Math.sqrt(lambda);
            ry *= Math.sqrt(lambda);
        }
        let f = Math.sqrt((rx * rx * (ry * ry) - rx * rx * (yp * yp) - ry * ry * (xp * xp)) /
            (rx * rx * (yp * yp) + ry * ry * (xp * xp)));
        if (fa === fs) {
            f *= -1;
        }
        if (isNaN(f)) {
            f = 0;
        }
        const cxp = (f * rx * yp) / ry;
        const cyp = (f * -ry * xp) / rx;
        const cx = (x1 + x2) / 2.0 + Math.cos(psi) * cxp - Math.sin(psi) * cyp;
        const cy = (y1 + y2) / 2.0 + Math.sin(psi) * cxp + Math.cos(psi) * cyp;
        const vMag = function (v) {
            return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
        };
        const vRatio = function (u, v) {
            return (u[0] * v[0] + u[1] * v[1]) / (vMag(u) * vMag(v));
        };
        const vAngle = function (u, v) {
            return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(vRatio(u, v));
        };
        const theta = vAngle([1, 0], [(xp - cxp) / rx, (yp - cyp) / ry]);
        const u = [(xp - cxp) / rx, (yp - cyp) / ry];
        const v = [(-1 * xp - cxp) / rx, (-1 * yp - cyp) / ry];
        let dTheta = vAngle(u, v);
        if (vRatio(u, v) <= -1) {
            dTheta = Math.PI;
        }
        if (vRatio(u, v) >= 1) {
            dTheta = 0;
        }
        if (fs === 0 && dTheta > 0) {
            dTheta = dTheta - 2 * Math.PI;
        }
        if (fs === 1 && dTheta < 0) {
            dTheta = dTheta + 2 * Math.PI;
        }
        return [cx, cy, rx, ry, theta, dTheta, psi, fs];
    }
}
Path.prototype.className = 'Path';
Path.prototype._attrsAffectingSize = ['data'];
_registerNode(Path);
Factory.addGetterSetter(Path, 'data');

class Arrow extends Line$1 {
    _sceneFunc(ctx) {
        super._sceneFunc(ctx);
        const PI2 = Math.PI * 2;
        const points = this.points();
        let tp = points;
        const fromTension = this.tension() !== 0 && points.length > 4;
        if (fromTension) {
            tp = this.getTensionPoints();
        }
        const length = this.pointerLength();
        const n = points.length;
        let dx, dy;
        if (fromTension) {
            const lp = [
                tp[tp.length - 4],
                tp[tp.length - 3],
                tp[tp.length - 2],
                tp[tp.length - 1],
                points[n - 2],
                points[n - 1],
            ];
            const lastLength = Path.calcLength(tp[tp.length - 4], tp[tp.length - 3], 'C', lp);
            const previous = Path.getPointOnQuadraticBezier(Math.min(1, 1 - length / lastLength), lp[0], lp[1], lp[2], lp[3], lp[4], lp[5]);
            dx = points[n - 2] - previous.x;
            dy = points[n - 1] - previous.y;
        }
        else {
            dx = points[n - 2] - points[n - 4];
            dy = points[n - 1] - points[n - 3];
        }
        const radians = (Math.atan2(dy, dx) + PI2) % PI2;
        const width = this.pointerWidth();
        if (this.pointerAtEnding()) {
            ctx.save();
            ctx.beginPath();
            ctx.translate(points[n - 2], points[n - 1]);
            ctx.rotate(radians);
            ctx.moveTo(0, 0);
            ctx.lineTo(-length, width / 2);
            ctx.lineTo(-length, -width / 2);
            ctx.closePath();
            ctx.restore();
            this.__fillStroke(ctx);
        }
        if (this.pointerAtBeginning()) {
            ctx.save();
            ctx.beginPath();
            ctx.translate(points[0], points[1]);
            if (fromTension) {
                dx = (tp[0] + tp[2]) / 2 - points[0];
                dy = (tp[1] + tp[3]) / 2 - points[1];
            }
            else {
                dx = points[2] - points[0];
                dy = points[3] - points[1];
            }
            ctx.rotate((Math.atan2(-dy, -dx) + PI2) % PI2);
            ctx.moveTo(0, 0);
            ctx.lineTo(-length, width / 2);
            ctx.lineTo(-length, -width / 2);
            ctx.closePath();
            ctx.restore();
            this.__fillStroke(ctx);
        }
    }
    __fillStroke(ctx) {
        const isDashEnabled = this.dashEnabled();
        if (isDashEnabled) {
            this.attrs.dashEnabled = false;
            ctx.setLineDash([]);
        }
        ctx.fillStrokeShape(this);
        if (isDashEnabled) {
            this.attrs.dashEnabled = true;
        }
    }
    getSelfRect() {
        const lineRect = super.getSelfRect();
        const offset = this.pointerWidth() / 2;
        return {
            x: lineRect.x,
            y: lineRect.y - offset,
            width: lineRect.width,
            height: lineRect.height + offset * 2,
        };
    }
}
Arrow.prototype.className = 'Arrow';
_registerNode(Arrow);
Factory.addGetterSetter(Arrow, 'pointerLength', 10, getNumberValidator());
Factory.addGetterSetter(Arrow, 'pointerWidth', 10, getNumberValidator());
Factory.addGetterSetter(Arrow, 'pointerAtBeginning', false);
Factory.addGetterSetter(Arrow, 'pointerAtEnding', true);

let Circle$1 = class Circle extends Shape {
    _sceneFunc(context) {
        context.beginPath();
        context.arc(0, 0, this.attrs.radius || 0, 0, Math.PI * 2, false);
        context.closePath();
        context.fillStrokeShape(this);
    }
    getWidth() {
        return this.radius() * 2;
    }
    getHeight() {
        return this.radius() * 2;
    }
    setWidth(width) {
        if (this.radius() !== width / 2) {
            this.radius(width / 2);
        }
    }
    setHeight(height) {
        if (this.radius() !== height / 2) {
            this.radius(height / 2);
        }
    }
};
Circle$1.prototype._centroid = true;
Circle$1.prototype.className = 'Circle';
Circle$1.prototype._attrsAffectingSize = ['radius'];
_registerNode(Circle$1);
Factory.addGetterSetter(Circle$1, 'radius', 0, getNumberValidator());

class Ellipse extends Shape {
    _sceneFunc(context) {
        const rx = this.radiusX(), ry = this.radiusY();
        context.beginPath();
        context.save();
        if (rx !== ry) {
            context.scale(1, ry / rx);
        }
        context.arc(0, 0, rx, 0, Math.PI * 2, false);
        context.restore();
        context.closePath();
        context.fillStrokeShape(this);
    }
    getWidth() {
        return this.radiusX() * 2;
    }
    getHeight() {
        return this.radiusY() * 2;
    }
    setWidth(width) {
        this.radiusX(width / 2);
    }
    setHeight(height) {
        this.radiusY(height / 2);
    }
}
Ellipse.prototype.className = 'Ellipse';
Ellipse.prototype._centroid = true;
Ellipse.prototype._attrsAffectingSize = ['radiusX', 'radiusY'];
_registerNode(Ellipse);
Factory.addComponentsGetterSetter(Ellipse, 'radius', ['x', 'y']);
Factory.addGetterSetter(Ellipse, 'radiusX', 0, getNumberValidator());
Factory.addGetterSetter(Ellipse, 'radiusY', 0, getNumberValidator());

let Image$1 = class Image extends Shape {
    constructor(attrs) {
        super(attrs);
        this._loadListener = () => {
            this._requestDraw();
        };
        this.on('imageChange.konva', (props) => {
            this._removeImageLoad(props.oldVal);
            this._setImageLoad();
        });
        this._setImageLoad();
    }
    _setImageLoad() {
        const image = this.image();
        if (image && image.complete) {
            return;
        }
        if (image && image.readyState === 4) {
            return;
        }
        if (image && image['addEventListener']) {
            image['addEventListener']('load', this._loadListener);
        }
    }
    _removeImageLoad(image) {
        if (image && image['removeEventListener']) {
            image['removeEventListener']('load', this._loadListener);
        }
    }
    destroy() {
        this._removeImageLoad(this.image());
        super.destroy();
        return this;
    }
    _useBufferCanvas() {
        const hasCornerRadius = !!this.cornerRadius();
        const hasShadow = this.hasShadow();
        if (hasCornerRadius && hasShadow) {
            return true;
        }
        return super._useBufferCanvas(true);
    }
    _sceneFunc(context) {
        const width = this.getWidth();
        const height = this.getHeight();
        const cornerRadius = this.cornerRadius();
        const image = this.attrs.image;
        let params;
        if (image) {
            const cropWidth = this.attrs.cropWidth;
            const cropHeight = this.attrs.cropHeight;
            if (cropWidth && cropHeight) {
                params = [
                    image,
                    this.cropX(),
                    this.cropY(),
                    cropWidth,
                    cropHeight,
                    0,
                    0,
                    width,
                    height,
                ];
            }
            else {
                params = [image, 0, 0, width, height];
            }
        }
        if (this.hasFill() || this.hasStroke() || cornerRadius) {
            context.beginPath();
            cornerRadius
                ? Util.drawRoundedRectPath(context, width, height, cornerRadius)
                : context.rect(0, 0, width, height);
            context.closePath();
            context.fillStrokeShape(this);
        }
        if (image) {
            if (cornerRadius) {
                context.clip();
            }
            context.drawImage.apply(context, params);
        }
    }
    _hitFunc(context) {
        const width = this.width(), height = this.height(), cornerRadius = this.cornerRadius();
        context.beginPath();
        if (!cornerRadius) {
            context.rect(0, 0, width, height);
        }
        else {
            Util.drawRoundedRectPath(context, width, height, cornerRadius);
        }
        context.closePath();
        context.fillStrokeShape(this);
    }
    getWidth() {
        var _a, _b, _c;
        return (_c = (_a = this.attrs.width) !== null && _a !== void 0 ? _a : (_b = this.image()) === null || _b === void 0 ? void 0 : _b.width) !== null && _c !== void 0 ? _c : 0;
    }
    getHeight() {
        var _a, _b, _c;
        return (_c = (_a = this.attrs.height) !== null && _a !== void 0 ? _a : (_b = this.image()) === null || _b === void 0 ? void 0 : _b.height) !== null && _c !== void 0 ? _c : 0;
    }
    static fromURL(url, callback, onError = null) {
        const img = Util.createImageElement();
        img.onload = function () {
            const image = new Image({
                image: img,
            });
            callback(image);
        };
        img.onerror = onError;
        img.crossOrigin = 'Anonymous';
        img.src = url;
    }
};
Image$1.prototype.className = 'Image';
Image$1.prototype._attrsAffectingSize = ['image'];
_registerNode(Image$1);
Factory.addGetterSetter(Image$1, 'cornerRadius', 0, getNumberOrArrayOfNumbersValidator(4));
Factory.addGetterSetter(Image$1, 'image');
Factory.addComponentsGetterSetter(Image$1, 'crop', ['x', 'y', 'width', 'height']);
Factory.addGetterSetter(Image$1, 'cropX', 0, getNumberValidator());
Factory.addGetterSetter(Image$1, 'cropY', 0, getNumberValidator());
Factory.addGetterSetter(Image$1, 'cropWidth', 0, getNumberValidator());
Factory.addGetterSetter(Image$1, 'cropHeight', 0, getNumberValidator());

const ATTR_CHANGE_LIST$2 = [
    'fontFamily',
    'fontSize',
    'fontStyle',
    'padding',
    'lineHeight',
    'text',
    'width',
    'height',
    'pointerDirection',
    'pointerWidth',
    'pointerHeight',
], CHANGE_KONVA$1 = 'Change.konva', NONE$1 = 'none', UP = 'up', RIGHT$1 = 'right', DOWN = 'down', LEFT$1 = 'left', attrChangeListLen$1 = ATTR_CHANGE_LIST$2.length;
class Label extends Group$1 {
    constructor(config) {
        super(config);
        this.on('add.konva', function (evt) {
            this._addListeners(evt.child);
            this._sync();
        });
    }
    getText() {
        return this.find('Text')[0];
    }
    getTag() {
        return this.find('Tag')[0];
    }
    _addListeners(text) {
        let that = this, n;
        const func = function () {
            that._sync();
        };
        for (n = 0; n < attrChangeListLen$1; n++) {
            text.on(ATTR_CHANGE_LIST$2[n] + CHANGE_KONVA$1, func);
        }
    }
    getWidth() {
        return this.getText().width();
    }
    getHeight() {
        return this.getText().height();
    }
    _sync() {
        let text = this.getText(), tag = this.getTag(), width, height, pointerDirection, pointerWidth, x, y, pointerHeight;
        if (text && tag) {
            width = text.width();
            height = text.height();
            pointerDirection = tag.pointerDirection();
            pointerWidth = tag.pointerWidth();
            pointerHeight = tag.pointerHeight();
            x = 0;
            y = 0;
            switch (pointerDirection) {
                case UP:
                    x = width / 2;
                    y = -1 * pointerHeight;
                    break;
                case RIGHT$1:
                    x = width + pointerWidth;
                    y = height / 2;
                    break;
                case DOWN:
                    x = width / 2;
                    y = height + pointerHeight;
                    break;
                case LEFT$1:
                    x = -1 * pointerWidth;
                    y = height / 2;
                    break;
            }
            tag.setAttrs({
                x: -1 * x,
                y: -1 * y,
                width: width,
                height: height,
            });
            text.setAttrs({
                x: -1 * x,
                y: -1 * y,
            });
        }
    }
}
Label.prototype.className = 'Label';
_registerNode(Label);
class Tag extends Shape {
    _sceneFunc(context) {
        const width = this.width(), height = this.height(), pointerDirection = this.pointerDirection(), pointerWidth = this.pointerWidth(), pointerHeight = this.pointerHeight(), cornerRadius = this.cornerRadius();
        let topLeft = 0;
        let topRight = 0;
        let bottomLeft = 0;
        let bottomRight = 0;
        if (typeof cornerRadius === 'number') {
            topLeft =
                topRight =
                    bottomLeft =
                        bottomRight =
                            Math.min(cornerRadius, width / 2, height / 2);
        }
        else {
            topLeft = Math.min(cornerRadius[0] || 0, width / 2, height / 2);
            topRight = Math.min(cornerRadius[1] || 0, width / 2, height / 2);
            bottomRight = Math.min(cornerRadius[2] || 0, width / 2, height / 2);
            bottomLeft = Math.min(cornerRadius[3] || 0, width / 2, height / 2);
        }
        context.beginPath();
        context.moveTo(topLeft, 0);
        if (pointerDirection === UP) {
            context.lineTo((width - pointerWidth) / 2, 0);
            context.lineTo(width / 2, -1 * pointerHeight);
            context.lineTo((width + pointerWidth) / 2, 0);
        }
        context.lineTo(width - topRight, 0);
        context.arc(width - topRight, topRight, topRight, (Math.PI * 3) / 2, 0, false);
        if (pointerDirection === RIGHT$1) {
            context.lineTo(width, (height - pointerHeight) / 2);
            context.lineTo(width + pointerWidth, height / 2);
            context.lineTo(width, (height + pointerHeight) / 2);
        }
        context.lineTo(width, height - bottomRight);
        context.arc(width - bottomRight, height - bottomRight, bottomRight, 0, Math.PI / 2, false);
        if (pointerDirection === DOWN) {
            context.lineTo((width + pointerWidth) / 2, height);
            context.lineTo(width / 2, height + pointerHeight);
            context.lineTo((width - pointerWidth) / 2, height);
        }
        context.lineTo(bottomLeft, height);
        context.arc(bottomLeft, height - bottomLeft, bottomLeft, Math.PI / 2, Math.PI, false);
        if (pointerDirection === LEFT$1) {
            context.lineTo(0, (height + pointerHeight) / 2);
            context.lineTo(-1 * pointerWidth, height / 2);
            context.lineTo(0, (height - pointerHeight) / 2);
        }
        context.lineTo(0, topLeft);
        context.arc(topLeft, topLeft, topLeft, Math.PI, (Math.PI * 3) / 2, false);
        context.closePath();
        context.fillStrokeShape(this);
    }
    getSelfRect() {
        let x = 0, y = 0, pointerWidth = this.pointerWidth(), pointerHeight = this.pointerHeight(), direction = this.pointerDirection(), width = this.width(), height = this.height();
        if (direction === UP) {
            y -= pointerHeight;
            height += pointerHeight;
        }
        else if (direction === DOWN) {
            height += pointerHeight;
        }
        else if (direction === LEFT$1) {
            x -= pointerWidth * 1.5;
            width += pointerWidth;
        }
        else if (direction === RIGHT$1) {
            width += pointerWidth * 1.5;
        }
        return {
            x: x,
            y: y,
            width: width,
            height: height,
        };
    }
}
Tag.prototype.className = 'Tag';
_registerNode(Tag);
Factory.addGetterSetter(Tag, 'pointerDirection', NONE$1);
Factory.addGetterSetter(Tag, 'pointerWidth', 0, getNumberValidator());
Factory.addGetterSetter(Tag, 'pointerHeight', 0, getNumberValidator());
Factory.addGetterSetter(Tag, 'cornerRadius', 0, getNumberOrArrayOfNumbersValidator(4));

let Rect$1 = class Rect extends Shape {
    _sceneFunc(context) {
        const cornerRadius = this.cornerRadius(), width = this.width(), height = this.height();
        context.beginPath();
        if (!cornerRadius) {
            context.rect(0, 0, width, height);
        }
        else {
            Util.drawRoundedRectPath(context, width, height, cornerRadius);
        }
        context.closePath();
        context.fillStrokeShape(this);
    }
};
Rect$1.prototype.className = 'Rect';
_registerNode(Rect$1);
Factory.addGetterSetter(Rect$1, 'cornerRadius', 0, getNumberOrArrayOfNumbersValidator(4));

class RegularPolygon extends Shape {
    _sceneFunc(context) {
        const points = this._getPoints(), radius = this.radius(), sides = this.sides(), cornerRadius = this.cornerRadius();
        context.beginPath();
        if (!cornerRadius) {
            context.moveTo(points[0].x, points[0].y);
            for (let n = 1; n < points.length; n++) {
                context.lineTo(points[n].x, points[n].y);
            }
        }
        else {
            Util.drawRoundedPolygonPath(context, points, sides, radius, cornerRadius);
        }
        context.closePath();
        context.fillStrokeShape(this);
    }
    _getPoints() {
        const sides = this.attrs.sides;
        const radius = this.attrs.radius || 0;
        const points = [];
        for (let n = 0; n < sides; n++) {
            points.push({
                x: radius * Math.sin((n * 2 * Math.PI) / sides),
                y: -1 * radius * Math.cos((n * 2 * Math.PI) / sides),
            });
        }
        return points;
    }
    getSelfRect() {
        const points = this._getPoints();
        let minX = points[0].x;
        let maxX = points[0].x;
        let minY = points[0].y;
        let maxY = points[0].y;
        points.forEach((point) => {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
        });
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
        };
    }
    getWidth() {
        return this.radius() * 2;
    }
    getHeight() {
        return this.radius() * 2;
    }
    setWidth(width) {
        this.radius(width / 2);
    }
    setHeight(height) {
        this.radius(height / 2);
    }
}
RegularPolygon.prototype.className = 'RegularPolygon';
RegularPolygon.prototype._centroid = true;
RegularPolygon.prototype._attrsAffectingSize = ['radius'];
_registerNode(RegularPolygon);
Factory.addGetterSetter(RegularPolygon, 'radius', 0, getNumberValidator());
Factory.addGetterSetter(RegularPolygon, 'sides', 0, getNumberValidator());
Factory.addGetterSetter(RegularPolygon, 'cornerRadius', 0, getNumberOrArrayOfNumbersValidator(4));

const PIx2 = Math.PI * 2;
class Ring extends Shape {
    _sceneFunc(context) {
        context.beginPath();
        context.arc(0, 0, this.innerRadius(), 0, PIx2, false);
        context.moveTo(this.outerRadius(), 0);
        context.arc(0, 0, this.outerRadius(), PIx2, 0, true);
        context.closePath();
        context.fillStrokeShape(this);
    }
    getWidth() {
        return this.outerRadius() * 2;
    }
    getHeight() {
        return this.outerRadius() * 2;
    }
    setWidth(width) {
        this.outerRadius(width / 2);
    }
    setHeight(height) {
        this.outerRadius(height / 2);
    }
}
Ring.prototype.className = 'Ring';
Ring.prototype._centroid = true;
Ring.prototype._attrsAffectingSize = ['innerRadius', 'outerRadius'];
_registerNode(Ring);
Factory.addGetterSetter(Ring, 'innerRadius', 0, getNumberValidator());
Factory.addGetterSetter(Ring, 'outerRadius', 0, getNumberValidator());

class Sprite extends Shape {
    constructor(config) {
        super(config);
        this._updated = true;
        this.anim = new Animation(() => {
            const updated = this._updated;
            this._updated = false;
            return updated;
        });
        this.on('animationChange.konva', function () {
            this.frameIndex(0);
        });
        this.on('frameIndexChange.konva', function () {
            this._updated = true;
        });
        this.on('frameRateChange.konva', function () {
            if (!this.anim.isRunning()) {
                return;
            }
            clearInterval(this.interval);
            this._setInterval();
        });
    }
    _sceneFunc(context) {
        const anim = this.animation(), index = this.frameIndex(), ix4 = index * 4, set = this.animations()[anim], offsets = this.frameOffsets(), x = set[ix4 + 0], y = set[ix4 + 1], width = set[ix4 + 2], height = set[ix4 + 3], image = this.image();
        if (this.hasFill() || this.hasStroke()) {
            context.beginPath();
            context.rect(0, 0, width, height);
            context.closePath();
            context.fillStrokeShape(this);
        }
        if (image) {
            if (offsets) {
                const offset = offsets[anim], ix2 = index * 2;
                context.drawImage(image, x, y, width, height, offset[ix2 + 0], offset[ix2 + 1], width, height);
            }
            else {
                context.drawImage(image, x, y, width, height, 0, 0, width, height);
            }
        }
    }
    _hitFunc(context) {
        const anim = this.animation(), index = this.frameIndex(), ix4 = index * 4, set = this.animations()[anim], offsets = this.frameOffsets(), width = set[ix4 + 2], height = set[ix4 + 3];
        context.beginPath();
        if (offsets) {
            const offset = offsets[anim];
            const ix2 = index * 2;
            context.rect(offset[ix2 + 0], offset[ix2 + 1], width, height);
        }
        else {
            context.rect(0, 0, width, height);
        }
        context.closePath();
        context.fillShape(this);
    }
    _useBufferCanvas() {
        return super._useBufferCanvas(true);
    }
    _setInterval() {
        const that = this;
        this.interval = setInterval(function () {
            that._updateIndex();
        }, 1000 / this.frameRate());
    }
    start() {
        if (this.isRunning()) {
            return;
        }
        const layer = this.getLayer();
        this.anim.setLayers(layer);
        this._setInterval();
        this.anim.start();
    }
    stop() {
        this.anim.stop();
        clearInterval(this.interval);
    }
    isRunning() {
        return this.anim.isRunning();
    }
    _updateIndex() {
        const index = this.frameIndex(), animation = this.animation(), animations = this.animations(), anim = animations[animation], len = anim.length / 4;
        if (index < len - 1) {
            this.frameIndex(index + 1);
        }
        else {
            this.frameIndex(0);
        }
    }
}
Sprite.prototype.className = 'Sprite';
_registerNode(Sprite);
Factory.addGetterSetter(Sprite, 'animation');
Factory.addGetterSetter(Sprite, 'animations');
Factory.addGetterSetter(Sprite, 'frameOffsets');
Factory.addGetterSetter(Sprite, 'image');
Factory.addGetterSetter(Sprite, 'frameIndex', 0, getNumberValidator());
Factory.addGetterSetter(Sprite, 'frameRate', 17, getNumberValidator());
Factory.backCompat(Sprite, {
    index: 'frameIndex',
    getIndex: 'getFrameIndex',
    setIndex: 'setFrameIndex',
});

class Star extends Shape {
    _sceneFunc(context) {
        const innerRadius = this.innerRadius(), outerRadius = this.outerRadius(), numPoints = this.numPoints();
        context.beginPath();
        context.moveTo(0, 0 - outerRadius);
        for (let n = 1; n < numPoints * 2; n++) {
            const radius = n % 2 === 0 ? outerRadius : innerRadius;
            const x = radius * Math.sin((n * Math.PI) / numPoints);
            const y = -1 * radius * Math.cos((n * Math.PI) / numPoints);
            context.lineTo(x, y);
        }
        context.closePath();
        context.fillStrokeShape(this);
    }
    getWidth() {
        return this.outerRadius() * 2;
    }
    getHeight() {
        return this.outerRadius() * 2;
    }
    setWidth(width) {
        this.outerRadius(width / 2);
    }
    setHeight(height) {
        this.outerRadius(height / 2);
    }
}
Star.prototype.className = 'Star';
Star.prototype._centroid = true;
Star.prototype._attrsAffectingSize = ['innerRadius', 'outerRadius'];
_registerNode(Star);
Factory.addGetterSetter(Star, 'numPoints', 5, getNumberValidator());
Factory.addGetterSetter(Star, 'innerRadius', 0, getNumberValidator());
Factory.addGetterSetter(Star, 'outerRadius', 0, getNumberValidator());

function stringToArray(string) {
  return [...string].reduce((acc, char, index, array) => {
    if (/\p{Emoji}/u.test(char)) {
      const nextChar = array[index + 1];
      if (nextChar && /\p{Emoji_Modifier}|\u200D/u.test(nextChar)) {
        acc.push(char + nextChar);
        array[index + 1] = "";
      } else {
        acc.push(char);
      }
    } else if (/\p{Regional_Indicator}{2}/u.test(char + (array[index + 1] || ""))) {
      acc.push(char + array[index + 1]);
    } else if (index > 0 && /\p{Mn}|\p{Me}|\p{Mc}/u.test(char)) {
      acc[acc.length - 1] += char;
    } else if (char) {
      acc.push(char);
    }
    return acc;
  }, []);
}
const AUTO = "auto", CENTER = "center", INHERIT = "inherit", JUSTIFY = "justify", CHANGE_KONVA = "Change.konva", CONTEXT_2D = "2d", DASH = "-", LEFT = "left", TEXT = "text", TEXT_UPPER = "Text", TOP = "top", BOTTOM = "bottom", MIDDLE = "middle", NORMAL$1 = "normal", PX_SPACE = "px ", SPACE = " ", RIGHT = "right", RTL = "rtl", WORD = "word", CHAR = "char", NONE = "none", ELLIPSIS = "…", ATTR_CHANGE_LIST$1 = [
  "direction",
  "fontFamily",
  "fontSize",
  "fontStyle",
  "fontVariant",
  "padding",
  "align",
  "verticalAlign",
  "lineHeight",
  "text",
  "width",
  "height",
  "wrap",
  "ellipsis",
  "letterSpacing"
], attrChangeListLen = ATTR_CHANGE_LIST$1.length;
let _shadowOpacityBuggy = null;
function hasShadowOpacityBug() {
  if (_shadowOpacityBuggy !== null) {
    return _shadowOpacityBuggy;
  }
  _shadowOpacityBuggy = false;
  try {
    const c = document.createElement("canvas");
    c.width = 10;
    c.height = 10;
    const ctx = c.getContext(CONTEXT_2D);
    if (ctx) {
      ctx.globalAlpha = 0;
      ctx.shadowColor = "black";
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 5;
      ctx.shadowOffsetY = 5;
      ctx.fillStyle = "black";
      ctx.font = "10px Arial";
      ctx.fillText("X", 0, 10);
      const data = ctx.getImageData(0, 0, 10, 10).data;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) {
          _shadowOpacityBuggy = true;
          break;
        }
      }
    }
  } catch (e) {
  }
  return _shadowOpacityBuggy;
}
function normalizeFontFamily(fontFamily) {
  return fontFamily.split(",").map((family) => {
    family = family.trim();
    const hasSpace = family.indexOf(" ") >= 0;
    const hasQuotes = family.indexOf('"') >= 0 || family.indexOf("'") >= 0;
    if (hasSpace && !hasQuotes) {
      family = `"${family}"`;
    }
    return family;
  }).join(", ");
}
let dummyContext;
function getDummyContext() {
  if (dummyContext) {
    return dummyContext;
  }
  dummyContext = Util.createCanvasElement().getContext(CONTEXT_2D);
  return dummyContext;
}
function _fillFunc$1(context) {
  context.fillText(this._partialText, this._partialTextX, this._partialTextY);
}
function _strokeFunc$1(context) {
  context.setAttr("miterLimit", 2);
  context.strokeText(this._partialText, this._partialTextX, this._partialTextY);
}
function checkDefaultFill(config) {
  config = config || {};
  if (!config.fillLinearGradientColorStops && !config.fillRadialGradientColorStops && !config.fillPatternImage) {
    config.fill = config.fill || "black";
  }
  return config;
}
let Text$1 = class Text extends Shape {
  constructor(config) {
    super(checkDefaultFill(config));
    this._partialTextX = 0;
    this._partialTextY = 0;
    for (let n = 0; n < attrChangeListLen; n++) {
      this.on(ATTR_CHANGE_LIST$1[n] + CHANGE_KONVA, this._setTextData);
    }
    this._setTextData();
  }
  _sceneFunc(context) {
    var _a, _b;
    const textArr = this.textArr, textArrLen = textArr.length;
    if (!this.text()) {
      return;
    }
    let padding = this.padding(), fontSize = this.fontSize(), lineHeightPx = this.lineHeight() * fontSize, verticalAlign = this.verticalAlign(), direction = this.direction(), alignY = 0, align = this.align(), totalWidth = this.getWidth(), letterSpacing = this.letterSpacing(), charRenderFunc = this.charRenderFunc(), fill = this.fill(), textDecoration = this.textDecoration(), underlineOffset = this.underlineOffset(), shouldUnderline = textDecoration.indexOf("underline") !== -1, shouldLineThrough = textDecoration.indexOf("line-through") !== -1, n;
    direction = direction === INHERIT ? context.direction : direction;
    let translateY = lineHeightPx / 2;
    let baseline = MIDDLE;
    if (!Konva$2.legacyTextRendering) {
      const metrics = this.measureSize("M");
      baseline = "alphabetic";
      const ascent = (_a = metrics.fontBoundingBoxAscent) !== null && _a !== void 0 ? _a : metrics.actualBoundingBoxAscent;
      const descent = (_b = metrics.fontBoundingBoxDescent) !== null && _b !== void 0 ? _b : metrics.actualBoundingBoxDescent;
      translateY = (ascent - descent) / 2 + lineHeightPx / 2;
    }
    if (direction === RTL) {
      context.setAttr("direction", direction);
    }
    context.setAttr("font", this._getContextFont());
    context.setAttr("textBaseline", baseline);
    context.setAttr("textAlign", LEFT);
    if (verticalAlign === MIDDLE) {
      alignY = (this.getHeight() - textArrLen * lineHeightPx - padding * 2) / 2;
    } else if (verticalAlign === BOTTOM) {
      alignY = this.getHeight() - textArrLen * lineHeightPx - padding * 2;
    }
    context.translate(padding, alignY + padding);
    for (n = 0; n < textArrLen; n++) {
      let lineTranslateX = 0;
      let lineTranslateY = 0;
      const obj = textArr[n], text = obj.text, width = obj.width, lastLine = obj.lastInParagraph;
      context.save();
      if (align === RIGHT) {
        lineTranslateX += totalWidth - width - padding * 2;
      } else if (align === CENTER) {
        lineTranslateX += (totalWidth - width - padding * 2) / 2;
      }
      if (shouldUnderline) {
        context.save();
        context.beginPath();
        const yOffset = underlineOffset !== null && underlineOffset !== void 0 ? underlineOffset : !Konva$2.legacyTextRendering ? Math.round(fontSize / 4) : Math.round(fontSize / 2);
        const x = lineTranslateX;
        const y = translateY + lineTranslateY + yOffset;
        context.moveTo(x, y);
        const lineWidth = align === JUSTIFY && !lastLine ? totalWidth - padding * 2 : width;
        context.lineTo(x + Math.round(lineWidth), y);
        context.lineWidth = fontSize / 15;
        const gradient = this._getLinearGradient();
        context.strokeStyle = gradient || fill;
        context.stroke();
        context.restore();
      }
      const lineThroughStartX = lineTranslateX;
      if (direction !== RTL && (letterSpacing !== 0 || align === JUSTIFY || charRenderFunc)) {
        const spacesNumber = text.split(" ").length - 1;
        const array = stringToArray(text);
        for (let li = 0; li < array.length; li++) {
          const letter = array[li];
          if (letter === " " && !lastLine && align === JUSTIFY) {
            lineTranslateX += (totalWidth - padding * 2 - width) / spacesNumber;
          }
          this._partialTextX = lineTranslateX;
          this._partialTextY = translateY + lineTranslateY;
          this._partialText = letter;
          if (charRenderFunc) {
            context.save();
            const previousLines = textArr.slice(0, n);
            const previousGraphemes = previousLines.reduce((acc, line) => acc + stringToArray(line.text).length, 0);
            const charIndex = li + previousGraphemes;
            charRenderFunc({
              char: letter,
              index: charIndex,
              x: lineTranslateX,
              y: translateY + lineTranslateY,
              lineIndex: n,
              column: li,
              isLastInLine: lastLine,
              width: this.measureSize(letter).width,
              context
            });
          }
          context.fillStrokeShape(this);
          if (charRenderFunc) {
            context.restore();
          }
          lineTranslateX += this.measureSize(letter).width + letterSpacing;
        }
      } else {
        if (letterSpacing !== 0) {
          context.setAttr("letterSpacing", `${letterSpacing}px`);
        }
        this._partialTextX = lineTranslateX;
        this._partialTextY = translateY + lineTranslateY;
        this._partialText = text;
        context.fillStrokeShape(this);
      }
      if (shouldLineThrough) {
        context.save();
        context.beginPath();
        const yOffset = !Konva$2.legacyTextRendering ? -Math.round(fontSize / 4) : 0;
        const x = lineThroughStartX;
        context.moveTo(x, translateY + lineTranslateY + yOffset);
        const lineWidth = align === JUSTIFY && !lastLine ? totalWidth - padding * 2 : width;
        context.lineTo(x + Math.round(lineWidth), translateY + lineTranslateY + yOffset);
        context.lineWidth = fontSize / 15;
        const gradient = this._getLinearGradient();
        context.strokeStyle = gradient || fill;
        context.stroke();
        context.restore();
      }
      context.restore();
      if (textArrLen > 1) {
        translateY += lineHeightPx;
      }
    }
  }
  _hitFunc(context) {
    const width = this.getWidth(), height = this.getHeight();
    context.beginPath();
    context.rect(0, 0, width, height);
    context.closePath();
    context.fillStrokeShape(this);
  }
  setText(text) {
    const str = Util._isString(text) ? text : text === null || text === void 0 ? "" : text + "";
    this._setAttr(TEXT, str);
    return this;
  }
  getWidth() {
    const isAuto = this.attrs.width === AUTO || this.attrs.width === void 0;
    return isAuto ? this.getTextWidth() + this.padding() * 2 : this.attrs.width;
  }
  getHeight() {
    const isAuto = this.attrs.height === AUTO || this.attrs.height === void 0;
    return isAuto ? this.fontSize() * this.textArr.length * this.lineHeight() + this.padding() * 2 : this.attrs.height;
  }
  getTextWidth() {
    return this.textWidth;
  }
  getTextHeight() {
    Util.warn("text.getTextHeight() method is deprecated. Use text.height() - for full height and text.fontSize() - for one line height.");
    return this.textHeight;
  }
  measureSize(text) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    let _context = getDummyContext(), fontSize = this.fontSize(), metrics;
    _context.save();
    _context.font = this._getContextFont();
    metrics = _context.measureText(text);
    _context.restore();
    const scaleFactor = fontSize / 100;
    return {
      actualBoundingBoxAscent: (_a = metrics.actualBoundingBoxAscent) !== null && _a !== void 0 ? _a : 71.58203125 * scaleFactor,
      actualBoundingBoxDescent: (_b = metrics.actualBoundingBoxDescent) !== null && _b !== void 0 ? _b : 0,
      actualBoundingBoxLeft: (_c = metrics.actualBoundingBoxLeft) !== null && _c !== void 0 ? _c : -7.421875 * scaleFactor,
      actualBoundingBoxRight: (_d = metrics.actualBoundingBoxRight) !== null && _d !== void 0 ? _d : 75.732421875 * scaleFactor,
      alphabeticBaseline: (_e = metrics.alphabeticBaseline) !== null && _e !== void 0 ? _e : 0,
      emHeightAscent: (_f = metrics.emHeightAscent) !== null && _f !== void 0 ? _f : 100 * scaleFactor,
      emHeightDescent: (_g = metrics.emHeightDescent) !== null && _g !== void 0 ? _g : -20 * scaleFactor,
      fontBoundingBoxAscent: (_h = metrics.fontBoundingBoxAscent) !== null && _h !== void 0 ? _h : 91 * scaleFactor,
      fontBoundingBoxDescent: (_j = metrics.fontBoundingBoxDescent) !== null && _j !== void 0 ? _j : 21 * scaleFactor,
      hangingBaseline: (_k = metrics.hangingBaseline) !== null && _k !== void 0 ? _k : 72.80000305175781 * scaleFactor,
      ideographicBaseline: (_l = metrics.ideographicBaseline) !== null && _l !== void 0 ? _l : -21 * scaleFactor,
      width: metrics.width,
      height: fontSize
    };
  }
  _getContextFont() {
    return this.fontStyle() + SPACE + this.fontVariant() + SPACE + (this.fontSize() + PX_SPACE) + normalizeFontFamily(this.fontFamily());
  }
  _addTextLine(line) {
    const align = this.align();
    if (align === JUSTIFY) {
      line = line.trim();
    }
    const width = this._getTextWidth(line);
    return this.textArr.push({
      text: line,
      width,
      lastInParagraph: false
    });
  }
  _getTextWidth(text) {
    const letterSpacing = this.letterSpacing();
    const length = text.length;
    return getDummyContext().measureText(text).width + letterSpacing * length;
  }
  _setTextData() {
    let lines = this.text().split("\n"), fontSize = +this.fontSize(), textWidth = 0, lineHeightPx = this.lineHeight() * fontSize, width = this.attrs.width, height = this.attrs.height, fixedWidth = width !== AUTO && width !== void 0, fixedHeight = height !== AUTO && height !== void 0, padding = this.padding(), maxWidth = width - padding * 2, maxHeightPx = height - padding * 2, currentHeightPx = 0, wrap = this.wrap(), shouldWrap = wrap !== NONE, wrapAtWord = wrap !== CHAR && shouldWrap, shouldAddEllipsis = this.ellipsis();
    this.textArr = [];
    getDummyContext().font = this._getContextFont();
    const additionalWidth = shouldAddEllipsis ? this._getTextWidth(ELLIPSIS) : 0;
    for (let i = 0, max = lines.length; i < max; ++i) {
      let line = lines[i];
      let lineWidth = this._getTextWidth(line);
      if (fixedWidth && lineWidth > maxWidth) {
        while (line.length > 0) {
          let low = 0, high = stringToArray(line).length, match = "", matchWidth = 0;
          while (low < high) {
            const mid = low + high >>> 1, lineArray = stringToArray(line), substr = lineArray.slice(0, mid + 1).join(""), substrWidth = this._getTextWidth(substr);
            const shouldConsiderEllipsis = shouldAddEllipsis && fixedHeight && currentHeightPx + lineHeightPx > maxHeightPx;
            const effectiveWidth = shouldConsiderEllipsis ? substrWidth + additionalWidth : substrWidth;
            if (effectiveWidth <= maxWidth) {
              low = mid + 1;
              match = substr;
              matchWidth = substrWidth;
            } else {
              high = mid;
            }
          }
          if (match) {
            if (wrapAtWord) {
              const lineArray2 = stringToArray(line);
              const matchArray = stringToArray(match);
              const nextChar = lineArray2[matchArray.length];
              const nextIsSpaceOrDash = nextChar === SPACE || nextChar === DASH;
              let wrapIndex;
              if (nextIsSpaceOrDash && matchWidth <= maxWidth) {
                wrapIndex = matchArray.length;
              } else {
                const lastSpaceIndex = matchArray.lastIndexOf(SPACE);
                const lastDashIndex = matchArray.lastIndexOf(DASH);
                wrapIndex = Math.max(lastSpaceIndex, lastDashIndex) + 1;
              }
              if (wrapIndex > 0) {
                low = wrapIndex;
                match = lineArray2.slice(0, low).join("");
                matchWidth = this._getTextWidth(match);
              }
            }
            match = match.trimRight();
            this._addTextLine(match);
            textWidth = Math.max(textWidth, matchWidth);
            currentHeightPx += lineHeightPx;
            const shouldHandleEllipsis = this._shouldHandleEllipsis(currentHeightPx);
            if (shouldHandleEllipsis) {
              this._tryToAddEllipsisToLastLine();
              break;
            }
            const lineArray = stringToArray(line);
            line = lineArray.slice(low).join("").trimLeft();
            if (line.length > 0) {
              lineWidth = this._getTextWidth(line);
              if (lineWidth <= maxWidth) {
                this._addTextLine(line);
                currentHeightPx += lineHeightPx;
                textWidth = Math.max(textWidth, lineWidth);
                break;
              }
            }
          } else {
            break;
          }
        }
      } else {
        this._addTextLine(line);
        currentHeightPx += lineHeightPx;
        textWidth = Math.max(textWidth, lineWidth);
        if (this._shouldHandleEllipsis(currentHeightPx) && i < max - 1) {
          this._tryToAddEllipsisToLastLine();
        }
      }
      if (this.textArr[this.textArr.length - 1]) {
        this.textArr[this.textArr.length - 1].lastInParagraph = true;
      }
      if (fixedHeight && currentHeightPx + lineHeightPx > maxHeightPx) {
        break;
      }
    }
    this.textHeight = fontSize;
    this.textWidth = textWidth;
  }
  _shouldHandleEllipsis(currentHeightPx) {
    const fontSize = +this.fontSize(), lineHeightPx = this.lineHeight() * fontSize, height = this.attrs.height, fixedHeight = height !== AUTO && height !== void 0, padding = this.padding(), maxHeightPx = height - padding * 2, wrap = this.wrap(), shouldWrap = wrap !== NONE;
    return !shouldWrap || fixedHeight && currentHeightPx + lineHeightPx > maxHeightPx;
  }
  _tryToAddEllipsisToLastLine() {
    const width = this.attrs.width, fixedWidth = width !== AUTO && width !== void 0, padding = this.padding(), maxWidth = width - padding * 2, shouldAddEllipsis = this.ellipsis();
    const lastLine = this.textArr[this.textArr.length - 1];
    if (!lastLine || !shouldAddEllipsis) {
      return;
    }
    if (fixedWidth) {
      const haveSpace = this._getTextWidth(lastLine.text + ELLIPSIS) < maxWidth;
      if (!haveSpace) {
        lastLine.text = lastLine.text.slice(0, lastLine.text.length - 3);
      }
    }
    this.textArr.splice(this.textArr.length - 1, 1);
    this._addTextLine(lastLine.text + ELLIPSIS);
  }
  getStrokeScaleEnabled() {
    return true;
  }
  _useBufferCanvas() {
    const hasLine = this.textDecoration().indexOf("underline") !== -1 || this.textDecoration().indexOf("line-through") !== -1;
    const hasShadow = this.hasShadow();
    if (hasLine && hasShadow) {
      return true;
    }
    if (hasShadow && this.getAbsoluteOpacity() !== 1 && hasShadowOpacityBug()) {
      return true;
    }
    return super._useBufferCanvas();
  }
};
Text$1.prototype._fillFunc = _fillFunc$1;
Text$1.prototype._strokeFunc = _strokeFunc$1;
Text$1.prototype.className = TEXT_UPPER;
Text$1.prototype._attrsAffectingSize = [
  "text",
  "fontSize",
  "padding",
  "wrap",
  "lineHeight",
  "letterSpacing"
];
_registerNode(Text$1);
Factory.overWriteSetter(Text$1, "width", getNumberOrAutoValidator());
Factory.overWriteSetter(Text$1, "height", getNumberOrAutoValidator());
Factory.addGetterSetter(Text$1, "direction", INHERIT);
Factory.addGetterSetter(Text$1, "fontFamily", "Arial");
Factory.addGetterSetter(Text$1, "fontSize", 12, getNumberValidator());
Factory.addGetterSetter(Text$1, "fontStyle", NORMAL$1);
Factory.addGetterSetter(Text$1, "fontVariant", NORMAL$1);
Factory.addGetterSetter(Text$1, "padding", 0, getNumberValidator());
Factory.addGetterSetter(Text$1, "align", LEFT);
Factory.addGetterSetter(Text$1, "verticalAlign", TOP);
Factory.addGetterSetter(Text$1, "lineHeight", 1, getNumberValidator());
Factory.addGetterSetter(Text$1, "wrap", WORD);
Factory.addGetterSetter(Text$1, "ellipsis", false, getBooleanValidator());
Factory.addGetterSetter(Text$1, "letterSpacing", 0, getNumberValidator());
Factory.addGetterSetter(Text$1, "text", "", getStringValidator());
Factory.addGetterSetter(Text$1, "textDecoration", "");
Factory.addGetterSetter(Text$1, "underlineOffset", void 0, getNumberValidator());
Factory.addGetterSetter(Text$1, "charRenderFunc", void 0);

const EMPTY_STRING = '', NORMAL = 'normal';
function _fillFunc(context) {
    context.fillText(this.partialText, 0, 0);
}
function _strokeFunc(context) {
    context.strokeText(this.partialText, 0, 0);
}
class TextPath extends Shape {
    constructor(config) {
        super(config);
        this.dummyCanvas = Util.createCanvasElement();
        this.dataArray = [];
        this._readDataAttribute();
        this.on('dataChange.konva', function () {
            this._readDataAttribute();
            this._setTextData();
        });
        this.on('textChange.konva alignChange.konva letterSpacingChange.konva kerningFuncChange.konva fontSizeChange.konva fontFamilyChange.konva directionChange.konva', this._setTextData);
        this._setTextData();
    }
    _getTextPathLength() {
        return Path.getPathLength(this.dataArray);
    }
    _getPointAtLength(length) {
        if (!this.attrs.data) {
            return null;
        }
        const totalLength = this.pathLength;
        if (length > totalLength) {
            return null;
        }
        return Path.getPointAtLengthOfDataArray(length, this.dataArray);
    }
    _readDataAttribute() {
        this.dataArray = Path.parsePathData(this.attrs.data);
        this.pathLength = this._getTextPathLength();
    }
    _sceneFunc(context) {
        context.setAttr('font', this._getContextFont());
        context.setAttr('textBaseline', this.textBaseline());
        context.setAttr('textAlign', 'left');
        context.save();
        const textDecoration = this.textDecoration();
        const fill = this.fill();
        const fontSize = this.fontSize();
        const glyphInfo = this.glyphInfo;
        const hasUnderline = textDecoration.indexOf('underline') !== -1;
        const hasLineThrough = textDecoration.indexOf('line-through') !== -1;
        if (hasUnderline) {
            context.beginPath();
        }
        for (let i = 0; i < glyphInfo.length; i++) {
            context.save();
            const p0 = glyphInfo[i].p0;
            context.translate(p0.x, p0.y);
            context.rotate(glyphInfo[i].rotation);
            this.partialText = glyphInfo[i].text;
            context.fillStrokeShape(this);
            if (hasUnderline) {
                if (i === 0) {
                    context.moveTo(0, fontSize / 2 + 1);
                }
                context.lineTo(glyphInfo[i].width, fontSize / 2 + 1);
            }
            context.restore();
        }
        if (hasUnderline) {
            context.strokeStyle = fill;
            context.lineWidth = fontSize / 20;
            context.stroke();
        }
        if (hasLineThrough) {
            context.beginPath();
            for (let i = 0; i < glyphInfo.length; i++) {
                context.save();
                const p0 = glyphInfo[i].p0;
                context.translate(p0.x, p0.y);
                context.rotate(glyphInfo[i].rotation);
                if (i === 0) {
                    context.moveTo(0, 0);
                }
                context.lineTo(glyphInfo[i].width, 0);
                context.restore();
            }
            context.strokeStyle = fill;
            context.lineWidth = fontSize / 20;
            context.stroke();
        }
        context.restore();
    }
    _hitFunc(context) {
        context.beginPath();
        const glyphInfo = this.glyphInfo;
        if (glyphInfo.length >= 1) {
            const p0 = glyphInfo[0].p0;
            context.moveTo(p0.x, p0.y);
        }
        for (let i = 0; i < glyphInfo.length; i++) {
            const p1 = glyphInfo[i].p1;
            context.lineTo(p1.x, p1.y);
        }
        context.setAttr('lineWidth', this.fontSize());
        context.setAttr('strokeStyle', this.colorKey);
        context.stroke();
    }
    getTextWidth() {
        return this.textWidth;
    }
    getTextHeight() {
        Util.warn('text.getTextHeight() method is deprecated. Use text.height() - for full height and text.fontSize() - for one line height.');
        return this.textHeight;
    }
    setText(text) {
        return Text$1.prototype.setText.call(this, text);
    }
    _getContextFont() {
        return Text$1.prototype._getContextFont.call(this);
    }
    _getTextSize(text) {
        const dummyCanvas = this.dummyCanvas;
        const _context = dummyCanvas.getContext('2d');
        _context.save();
        _context.font = this._getContextFont();
        const metrics = _context.measureText(text);
        _context.restore();
        return {
            width: metrics.width,
            height: parseInt(`${this.fontSize()}`, 10),
        };
    }
    _setTextData() {
        const charArr = stringToArray(this.text());
        if (this.direction() === 'rtl') {
            charArr.reverse();
        }
        const chars = [];
        let width = 0;
        for (let i = 0; i < charArr.length; i++) {
            chars.push({
                char: charArr[i],
                width: this._getTextSize(charArr[i]).width,
            });
            width += chars[i].width;
        }
        const { width: fullTextWidth, height } = this._getTextSize(this.attrs.text);
        this.textWidth = width;
        this.textHeight = height;
        this.glyphInfo = [];
        if (!this.attrs.data) {
            return null;
        }
        const letterSpacing = this.letterSpacing();
        const align = this.align();
        const kerningFunc = this.kerningFunc();
        const kerningAdjustment = Math.max(0, width - fullTextWidth);
        const textWidth = Math.max(this.textWidth + ((this.attrs.text || '').length - 1) * letterSpacing, 0);
        let offset = 0;
        if (align === 'center') {
            offset = Math.max(0, this.pathLength / 2 - textWidth / 2);
        }
        if (align === 'right') {
            offset = Math.max(0, this.pathLength - textWidth);
        }
        let offsetToGlyph = offset;
        for (let i = 0; i < chars.length; i++) {
            const charStartPoint = this._getPointAtLength(offsetToGlyph);
            if (!charStartPoint)
                return;
            const char = chars[i].char;
            let glyphWidth = chars[i].width + letterSpacing;
            if (char === ' ' && align === 'justify') {
                const numberOfSpaces = this.text().split(' ').length - 1;
                glyphWidth += (this.pathLength - textWidth) / numberOfSpaces;
            }
            const charEndLength = offsetToGlyph + glyphWidth;
            const charEndPoint = this._getPointAtLength(charEndLength > this.pathLength &&
                charEndLength - this.pathLength <= kerningAdjustment
                ? this.pathLength
                : charEndLength);
            if (!charEndPoint) {
                return;
            }
            const width = Path.getLineLength(charStartPoint.x, charStartPoint.y, charEndPoint.x, charEndPoint.y);
            let kern = 0;
            if (kerningFunc) {
                try {
                    kern = kerningFunc(chars[i - 1].char, char) * this.fontSize();
                }
                catch (e) {
                    kern = 0;
                }
            }
            charStartPoint.x += kern;
            charEndPoint.x += kern;
            this.textWidth += kern;
            const midpoint = Path.getPointOnLine(kern + width / 2.0, charStartPoint.x, charStartPoint.y, charEndPoint.x, charEndPoint.y);
            const rotation = Math.atan2(charEndPoint.y - charStartPoint.y, charEndPoint.x - charStartPoint.x);
            this.glyphInfo.push({
                transposeX: midpoint.x,
                transposeY: midpoint.y,
                text: charArr[i],
                rotation: rotation,
                p0: charStartPoint,
                p1: charEndPoint,
                width: width,
            });
            offsetToGlyph += glyphWidth;
        }
    }
    getSelfRect() {
        if (!this.glyphInfo.length) {
            return {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            };
        }
        const points = [];
        this.glyphInfo.forEach(function (info) {
            points.push(info.p0.x);
            points.push(info.p0.y);
            points.push(info.p1.x);
            points.push(info.p1.y);
        });
        let minX = points[0] || 0;
        let maxX = points[0] || 0;
        let minY = points[1] || 0;
        let maxY = points[1] || 0;
        let x, y;
        for (let i = 0; i < points.length / 2; i++) {
            x = points[i * 2];
            y = points[i * 2 + 1];
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
        }
        const fontSize = this.fontSize();
        return {
            x: minX - fontSize / 2,
            y: minY - fontSize / 2,
            width: maxX - minX + fontSize,
            height: maxY - minY + fontSize,
        };
    }
    destroy() {
        Util.releaseCanvas(this.dummyCanvas);
        return super.destroy();
    }
}
TextPath.prototype._fillFunc = _fillFunc;
TextPath.prototype._strokeFunc = _strokeFunc;
TextPath.prototype._fillFuncHit = _fillFunc;
TextPath.prototype._strokeFuncHit = _strokeFunc;
TextPath.prototype.className = 'TextPath';
TextPath.prototype._attrsAffectingSize = ['text', 'fontSize', 'data'];
_registerNode(TextPath);
Factory.addGetterSetter(TextPath, 'data');
Factory.addGetterSetter(TextPath, 'fontFamily', 'Arial');
Factory.addGetterSetter(TextPath, 'fontSize', 12, getNumberValidator());
Factory.addGetterSetter(TextPath, 'fontStyle', NORMAL);
Factory.addGetterSetter(TextPath, 'align', 'left');
Factory.addGetterSetter(TextPath, 'letterSpacing', 0, getNumberValidator());
Factory.addGetterSetter(TextPath, 'textBaseline', 'middle');
Factory.addGetterSetter(TextPath, 'fontVariant', NORMAL);
Factory.addGetterSetter(TextPath, 'text', EMPTY_STRING);
Factory.addGetterSetter(TextPath, 'textDecoration', '');
Factory.addGetterSetter(TextPath, 'kerningFunc', undefined);
Factory.addGetterSetter(TextPath, 'direction', 'inherit');

const EVENTS_NAME = "tr-konva";
const ATTR_CHANGE_LIST = [
  "resizeEnabledChange",
  "rotateAnchorOffsetChange",
  "rotateAnchorAngleChange",
  "rotateEnabledChange",
  "enabledAnchorsChange",
  "anchorSizeChange",
  "borderEnabledChange",
  "borderStrokeChange",
  "borderStrokeWidthChange",
  "borderDashChange",
  "anchorStrokeChange",
  "anchorStrokeWidthChange",
  "anchorFillChange",
  "anchorCornerRadiusChange",
  "ignoreStrokeChange",
  "anchorStyleFuncChange"
].map((e) => e + `.${EVENTS_NAME}`).join(" ");
const NODES_RECT = "nodesRect";
const TRANSFORM_CHANGE_STR = [
  "widthChange",
  "heightChange",
  "scaleXChange",
  "scaleYChange",
  "skewXChange",
  "skewYChange",
  "rotationChange",
  "offsetXChange",
  "offsetYChange",
  "transformsEnabledChange",
  "strokeWidthChange",
  "draggableChange"
];
const ANGLES = {
  "top-left": -45,
  "top-center": 0,
  "top-right": 45,
  "middle-right": -90,
  "middle-left": 90,
  "bottom-left": -135,
  "bottom-center": 180,
  "bottom-right": 135
};
const TOUCH_DEVICE = "ontouchstart" in Konva$2._global;
function getCursor(anchorName, rad, rotateCursor) {
  if (anchorName === "rotater") {
    return rotateCursor;
  }
  rad += Util.degToRad(ANGLES[anchorName] || 0);
  const angle = (Util.radToDeg(rad) % 360 + 360) % 360;
  if (Util._inRange(angle, 315 + 22.5, 360) || Util._inRange(angle, 0, 22.5)) {
    return "ns-resize";
  } else if (Util._inRange(angle, 45 - 22.5, 45 + 22.5)) {
    return "nesw-resize";
  } else if (Util._inRange(angle, 90 - 22.5, 90 + 22.5)) {
    return "ew-resize";
  } else if (Util._inRange(angle, 135 - 22.5, 135 + 22.5)) {
    return "nwse-resize";
  } else if (Util._inRange(angle, 180 - 22.5, 180 + 22.5)) {
    return "ns-resize";
  } else if (Util._inRange(angle, 225 - 22.5, 225 + 22.5)) {
    return "nesw-resize";
  } else if (Util._inRange(angle, 270 - 22.5, 270 + 22.5)) {
    return "ew-resize";
  } else if (Util._inRange(angle, 315 - 22.5, 315 + 22.5)) {
    return "nwse-resize";
  } else {
    Util.error("Transformer has unknown angle for cursor detection: " + angle);
    return "pointer";
  }
}
const ANCHORS_NAMES = [
  "top-left",
  "top-center",
  "top-right",
  "middle-right",
  "middle-left",
  "bottom-left",
  "bottom-center",
  "bottom-right"
];
function getCenter(shape) {
  return {
    x: shape.x + shape.width / 2 * Math.cos(shape.rotation) + shape.height / 2 * Math.sin(-shape.rotation),
    y: shape.y + shape.height / 2 * Math.cos(shape.rotation) + shape.width / 2 * Math.sin(shape.rotation)
  };
}
function rotateAroundPoint(shape, angleRad, point) {
  const x = point.x + (shape.x - point.x) * Math.cos(angleRad) - (shape.y - point.y) * Math.sin(angleRad);
  const y = point.y + (shape.x - point.x) * Math.sin(angleRad) + (shape.y - point.y) * Math.cos(angleRad);
  return {
    ...shape,
    rotation: shape.rotation + angleRad,
    x,
    y
  };
}
function rotateAroundCenter(shape, deltaRad) {
  const center = getCenter(shape);
  return rotateAroundPoint(shape, deltaRad, center);
}
function getSnap(snaps, newRotationRad, tol) {
  let snapped = newRotationRad;
  for (let i = 0; i < snaps.length; i++) {
    const angle = Konva$2.getAngle(snaps[i]);
    const absDiff = Math.abs(angle - newRotationRad) % (Math.PI * 2);
    const dif = Math.min(absDiff, Math.PI * 2 - absDiff);
    if (dif < tol) {
      snapped = angle;
    }
  }
  return snapped;
}
let activeTransformersCount = 0;
class Transformer extends Group$1 {
  constructor(config) {
    super(config);
    this._movingAnchorName = null;
    this._transforming = false;
    this._elementsCreated = false;
    this._createElements();
    this._handleMouseMove = this._handleMouseMove.bind(this);
    this._handleMouseUp = this._handleMouseUp.bind(this);
    this.update = this.update.bind(this);
    this.on(ATTR_CHANGE_LIST, this.update);
    if (this.getNode()) {
      this.update();
    }
  }
  attachTo(node) {
    this.setNode(node);
    return this;
  }
  setNode(node) {
    Util.warn("tr.setNode(shape), tr.node(shape) and tr.attachTo(shape) methods are deprecated. Please use tr.nodes(nodesArray) instead.");
    return this.setNodes([node]);
  }
  getNode() {
    return this._nodes && this._nodes[0];
  }
  _getEventNamespace() {
    return EVENTS_NAME + this._id;
  }
  setNodes(nodes = []) {
    if (this._nodes && this._nodes.length) {
      this.detach();
    }
    const filteredNodes = nodes.filter((node) => {
      if (node.isAncestorOf(this)) {
        Util.error("Konva.Transformer cannot be an a child of the node you are trying to attach");
        return false;
      }
      return true;
    });
    this._nodes = nodes = filteredNodes;
    if (nodes.length === 1 && this.useSingleNodeRotation()) {
      this.rotation(nodes[0].getAbsoluteRotation());
    } else {
      this.rotation(0);
    }
    this._nodes.forEach((node) => {
      const onChange = () => {
        if (this.nodes().length === 1 && this.useSingleNodeRotation()) {
          this.rotation(this.nodes()[0].getAbsoluteRotation());
        }
        this._resetTransformCache();
        if (!this._transforming && !this.isDragging()) {
          this.update();
        }
      };
      if (node._attrsAffectingSize.length) {
        const additionalEvents = node._attrsAffectingSize.map((prop) => prop + "Change." + this._getEventNamespace()).join(" ");
        node.on(additionalEvents, onChange);
      }
      node.on(TRANSFORM_CHANGE_STR.map((e) => e + `.${this._getEventNamespace()}`).join(" "), onChange);
      node.on(`absoluteTransformChange.${this._getEventNamespace()}`, onChange);
      this._proxyDrag(node);
    });
    this._resetTransformCache();
    const elementsCreated = !!this.findOne(".top-left");
    if (elementsCreated) {
      this.update();
    }
    return this;
  }
  _proxyDrag(node) {
    let lastPos;
    node.on(`dragstart.${this._getEventNamespace()}`, (e) => {
      lastPos = node.getAbsolutePosition();
      if (!this.isDragging() && node !== this.findOne(".back")) {
        this.startDrag(e, false);
      }
    });
    node.on(`dragmove.${this._getEventNamespace()}`, (e) => {
      if (!lastPos) {
        return;
      }
      const abs = node.getAbsolutePosition();
      const dx = abs.x - lastPos.x;
      const dy = abs.y - lastPos.y;
      this.nodes().forEach((otherNode) => {
        if (otherNode === node) {
          return;
        }
        if (otherNode.isDragging()) {
          return;
        }
        const otherAbs = otherNode.getAbsolutePosition();
        otherNode.setAbsolutePosition({
          x: otherAbs.x + dx,
          y: otherAbs.y + dy
        });
        otherNode.startDrag(e);
      });
      lastPos = null;
    });
  }
  getNodes() {
    return this._nodes || [];
  }
  getActiveAnchor() {
    return this._movingAnchorName;
  }
  detach() {
    if (this._nodes) {
      this._nodes.forEach((node) => {
        node.off("." + this._getEventNamespace());
      });
    }
    this._nodes = [];
    this._resetTransformCache();
  }
  _resetTransformCache() {
    this._clearCache(NODES_RECT);
    this._clearCache("transform");
    this._clearSelfAndDescendantCache("absoluteTransform");
  }
  _getNodeRect() {
    return this._getCache(NODES_RECT, this.__getNodeRect);
  }
  __getNodeShape(node, rot = this.rotation(), relative) {
    const rect = node.getClientRect({
      skipTransform: true,
      skipShadow: true,
      skipStroke: this.ignoreStroke()
    });
    const absScale = node.getAbsoluteScale(relative);
    const absPos = node.getAbsolutePosition(relative);
    const dx = rect.x * absScale.x - node.offsetX() * absScale.x;
    const dy = rect.y * absScale.y - node.offsetY() * absScale.y;
    const rotation = (Konva$2.getAngle(node.getAbsoluteRotation()) + Math.PI * 2) % (Math.PI * 2);
    const box = {
      x: absPos.x + dx * Math.cos(rotation) + dy * Math.sin(-rotation),
      y: absPos.y + dy * Math.cos(rotation) + dx * Math.sin(rotation),
      width: rect.width * absScale.x,
      height: rect.height * absScale.y,
      rotation
    };
    return rotateAroundPoint(box, -Konva$2.getAngle(rot), {
      x: 0,
      y: 0
    });
  }
  __getNodeRect() {
    const node = this.getNode();
    if (!node) {
      return {
        x: -1e8,
        y: -1e8,
        width: 0,
        height: 0,
        rotation: 0
      };
    }
    const totalPoints = [];
    this.nodes().map((node2) => {
      const box = node2.getClientRect({
        skipTransform: true,
        skipShadow: true,
        skipStroke: this.ignoreStroke()
      });
      const points = [
        { x: box.x, y: box.y },
        { x: box.x + box.width, y: box.y },
        { x: box.x + box.width, y: box.y + box.height },
        { x: box.x, y: box.y + box.height }
      ];
      const trans = node2.getAbsoluteTransform();
      points.forEach(function(point) {
        const transformed = trans.point(point);
        totalPoints.push(transformed);
      });
    });
    const tr = new Transform();
    tr.rotate(-Konva$2.getAngle(this.rotation()));
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    totalPoints.forEach(function(point) {
      const transformed = tr.point(point);
      if (minX === void 0) {
        minX = maxX = transformed.x;
        minY = maxY = transformed.y;
      }
      minX = Math.min(minX, transformed.x);
      minY = Math.min(minY, transformed.y);
      maxX = Math.max(maxX, transformed.x);
      maxY = Math.max(maxY, transformed.y);
    });
    tr.invert();
    const p = tr.point({ x: minX, y: minY });
    return {
      x: p.x,
      y: p.y,
      width: maxX - minX,
      height: maxY - minY,
      rotation: Konva$2.getAngle(this.rotation())
    };
  }
  getX() {
    return this._getNodeRect().x;
  }
  getY() {
    return this._getNodeRect().y;
  }
  getWidth() {
    return this._getNodeRect().width;
  }
  getHeight() {
    return this._getNodeRect().height;
  }
  _createElements() {
    this._createBack();
    ANCHORS_NAMES.forEach((name) => {
      this._createAnchor(name);
    });
    this._createAnchor("rotater");
    this._elementsCreated = true;
  }
  _createAnchor(name) {
    const anchor = new Rect$1({
      stroke: "rgb(0, 161, 255)",
      fill: "white",
      strokeWidth: 1,
      name: name + " _anchor",
      dragDistance: 0,
      draggable: true,
      hitStrokeWidth: TOUCH_DEVICE ? 10 : "auto"
    });
    const self = this;
    anchor.on("mousedown touchstart", function(e) {
      self._handleMouseDown(e);
    });
    anchor.on("dragstart", (e) => {
      anchor.stopDrag();
      e.cancelBubble = true;
    });
    anchor.on("dragend", (e) => {
      e.cancelBubble = true;
    });
    anchor.on("mouseenter", () => {
      const rad = Konva$2.getAngle(this.rotation());
      const rotateCursor = this.rotateAnchorCursor();
      const cursor = getCursor(name, rad, rotateCursor);
      anchor.getStage().content && (anchor.getStage().content.style.cursor = cursor);
      this._cursorChange = true;
    });
    anchor.on("mouseout", () => {
      anchor.getStage().content && (anchor.getStage().content.style.cursor = "");
      this._cursorChange = false;
    });
    this.add(anchor);
  }
  _createBack() {
    const back = new Shape({
      name: "back",
      width: 0,
      height: 0,
      sceneFunc(ctx, shape) {
        const tr = shape.getParent();
        const padding = tr.padding();
        const width = shape.width();
        const height = shape.height();
        ctx.beginPath();
        ctx.rect(-padding, -padding, width + padding * 2, height + padding * 2);
        if (tr.rotateEnabled() && tr.rotateLineVisible()) {
          const rotateAnchorAngle = tr.rotateAnchorAngle();
          const rotateAnchorOffset = tr.rotateAnchorOffset();
          const rad = Util.degToRad(rotateAnchorAngle);
          const dirX = Math.sin(rad);
          const dirY = -Math.cos(rad);
          const cx = width / 2;
          const cy = height / 2;
          let t = Infinity;
          if (dirY < 0) {
            t = Math.min(t, -cy / dirY);
          } else if (dirY > 0) {
            t = Math.min(t, (height - cy) / dirY);
          }
          if (dirX < 0) {
            t = Math.min(t, -cx / dirX);
          } else if (dirX > 0) {
            t = Math.min(t, (width - cx) / dirX);
          }
          const edgeX = cx + dirX * t;
          const edgeY = cy + dirY * t;
          const sign = Util._sign(height);
          const endX = edgeX + dirX * rotateAnchorOffset * sign;
          const endY = edgeY + dirY * rotateAnchorOffset * sign;
          ctx.moveTo(edgeX, edgeY);
          ctx.lineTo(endX, endY);
        }
        ctx.fillStrokeShape(shape);
      },
      hitFunc: (ctx, shape) => {
        if (!this.shouldOverdrawWholeArea()) {
          return;
        }
        const padding = this.padding();
        ctx.beginPath();
        ctx.rect(-padding, -padding, shape.width() + padding * 2, shape.height() + padding * 2);
        ctx.fillStrokeShape(shape);
      }
    });
    this.add(back);
    this._proxyDrag(back);
    back.on("dragstart", (e) => {
      e.cancelBubble = true;
    });
    back.on("dragmove", (e) => {
      e.cancelBubble = true;
    });
    back.on("dragend", (e) => {
      e.cancelBubble = true;
    });
    this.on("dragmove", (e) => {
      this.update();
    });
  }
  _handleMouseDown(e) {
    if (this._transforming) {
      return;
    }
    this._movingAnchorName = e.target.name().split(" ")[0];
    const attrs = this._getNodeRect();
    const width = attrs.width;
    const height = attrs.height;
    const hypotenuse = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
    this.sin = Math.abs(height / hypotenuse);
    this.cos = Math.abs(width / hypotenuse);
    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", this._handleMouseMove);
      window.addEventListener("touchmove", this._handleMouseMove);
      window.addEventListener("mouseup", this._handleMouseUp, true);
      window.addEventListener("touchend", this._handleMouseUp, true);
    }
    this._transforming = true;
    const ap = e.target.getAbsolutePosition();
    const pos = e.target.getStage().getPointerPosition();
    this._anchorDragOffset = {
      x: pos.x - ap.x,
      y: pos.y - ap.y
    };
    activeTransformersCount++;
    this._fire("transformstart", { evt: e.evt, target: this.getNode() });
    this._nodes.forEach((target) => {
      target._fire("transformstart", { evt: e.evt, target });
    });
  }
  _handleMouseMove(e) {
    let x, y, newHypotenuse;
    const anchorNode = this.findOne("." + this._movingAnchorName);
    const stage = anchorNode.getStage();
    stage.setPointersPositions(e);
    const pp = stage.getPointerPosition();
    let newNodePos = {
      x: pp.x - this._anchorDragOffset.x,
      y: pp.y - this._anchorDragOffset.y
    };
    const oldAbs = anchorNode.getAbsolutePosition();
    if (this.anchorDragBoundFunc()) {
      newNodePos = this.anchorDragBoundFunc()(oldAbs, newNodePos, e);
    }
    anchorNode.setAbsolutePosition(newNodePos);
    const newAbs = anchorNode.getAbsolutePosition();
    if (oldAbs.x === newAbs.x && oldAbs.y === newAbs.y) {
      return;
    }
    if (this._movingAnchorName === "rotater") {
      const attrs = this._getNodeRect();
      x = anchorNode.x() - attrs.width / 2;
      y = -anchorNode.y() + attrs.height / 2;
      const rotateAnchorAngleRad = Konva$2.getAngle(this.rotateAnchorAngle());
      let delta = Math.atan2(-y, x) + Math.PI / 2 - rotateAnchorAngleRad;
      if (attrs.height < 0) {
        delta -= Math.PI;
      }
      const oldRotation = Konva$2.getAngle(this.rotation());
      const newRotation = oldRotation + delta;
      const tol = Konva$2.getAngle(this.rotationSnapTolerance());
      const snappedRot = getSnap(this.rotationSnaps(), newRotation, tol);
      const diff = snappedRot - attrs.rotation;
      const shape = rotateAroundCenter(attrs, diff);
      this._fitNodesInto(shape, e);
      return;
    }
    const shiftBehavior = this.shiftBehavior();
    let keepProportion;
    if (shiftBehavior === "inverted") {
      keepProportion = this.keepRatio() && !e.shiftKey;
    } else if (shiftBehavior === "none") {
      keepProportion = this.keepRatio();
    } else {
      keepProportion = this.keepRatio() || e.shiftKey;
    }
    let centeredScaling = this.centeredScaling() || e.altKey;
    if (this._movingAnchorName === "top-left") {
      if (keepProportion) {
        const comparePoint = centeredScaling ? {
          x: this.width() / 2,
          y: this.height() / 2
        } : {
          x: this.findOne(".bottom-right").x(),
          y: this.findOne(".bottom-right").y()
        };
        newHypotenuse = Math.sqrt(Math.pow(comparePoint.x - anchorNode.x(), 2) + Math.pow(comparePoint.y - anchorNode.y(), 2));
        const reverseX = this.findOne(".top-left").x() > comparePoint.x ? -1 : 1;
        const reverseY = this.findOne(".top-left").y() > comparePoint.y ? -1 : 1;
        x = newHypotenuse * this.cos * reverseX;
        y = newHypotenuse * this.sin * reverseY;
        this.findOne(".top-left").x(comparePoint.x - x);
        this.findOne(".top-left").y(comparePoint.y - y);
      }
    } else if (this._movingAnchorName === "top-center") {
      this.findOne(".top-left").y(anchorNode.y());
    } else if (this._movingAnchorName === "top-right") {
      if (keepProportion) {
        const comparePoint = centeredScaling ? {
          x: this.width() / 2,
          y: this.height() / 2
        } : {
          x: this.findOne(".bottom-left").x(),
          y: this.findOne(".bottom-left").y()
        };
        newHypotenuse = Math.sqrt(Math.pow(anchorNode.x() - comparePoint.x, 2) + Math.pow(comparePoint.y - anchorNode.y(), 2));
        const reverseX = this.findOne(".top-right").x() < comparePoint.x ? -1 : 1;
        const reverseY = this.findOne(".top-right").y() > comparePoint.y ? -1 : 1;
        x = newHypotenuse * this.cos * reverseX;
        y = newHypotenuse * this.sin * reverseY;
        this.findOne(".top-right").x(comparePoint.x + x);
        this.findOne(".top-right").y(comparePoint.y - y);
      }
      var pos = anchorNode.position();
      this.findOne(".top-left").y(pos.y);
      this.findOne(".bottom-right").x(pos.x);
    } else if (this._movingAnchorName === "middle-left") {
      this.findOne(".top-left").x(anchorNode.x());
    } else if (this._movingAnchorName === "middle-right") {
      this.findOne(".bottom-right").x(anchorNode.x());
    } else if (this._movingAnchorName === "bottom-left") {
      if (keepProportion) {
        const comparePoint = centeredScaling ? {
          x: this.width() / 2,
          y: this.height() / 2
        } : {
          x: this.findOne(".top-right").x(),
          y: this.findOne(".top-right").y()
        };
        newHypotenuse = Math.sqrt(Math.pow(comparePoint.x - anchorNode.x(), 2) + Math.pow(anchorNode.y() - comparePoint.y, 2));
        const reverseX = comparePoint.x < anchorNode.x() ? -1 : 1;
        const reverseY = anchorNode.y() < comparePoint.y ? -1 : 1;
        x = newHypotenuse * this.cos * reverseX;
        y = newHypotenuse * this.sin * reverseY;
        anchorNode.x(comparePoint.x - x);
        anchorNode.y(comparePoint.y + y);
      }
      pos = anchorNode.position();
      this.findOne(".top-left").x(pos.x);
      this.findOne(".bottom-right").y(pos.y);
    } else if (this._movingAnchorName === "bottom-center") {
      this.findOne(".bottom-right").y(anchorNode.y());
    } else if (this._movingAnchorName === "bottom-right") {
      if (keepProportion) {
        const comparePoint = centeredScaling ? {
          x: this.width() / 2,
          y: this.height() / 2
        } : {
          x: this.findOne(".top-left").x(),
          y: this.findOne(".top-left").y()
        };
        newHypotenuse = Math.sqrt(Math.pow(anchorNode.x() - comparePoint.x, 2) + Math.pow(anchorNode.y() - comparePoint.y, 2));
        const reverseX = this.findOne(".bottom-right").x() < comparePoint.x ? -1 : 1;
        const reverseY = this.findOne(".bottom-right").y() < comparePoint.y ? -1 : 1;
        x = newHypotenuse * this.cos * reverseX;
        y = newHypotenuse * this.sin * reverseY;
        this.findOne(".bottom-right").x(comparePoint.x + x);
        this.findOne(".bottom-right").y(comparePoint.y + y);
      }
    } else {
      console.error(new Error("Wrong position argument of selection resizer: " + this._movingAnchorName));
    }
    centeredScaling = this.centeredScaling() || e.altKey;
    if (centeredScaling) {
      const topLeft = this.findOne(".top-left");
      const bottomRight = this.findOne(".bottom-right");
      const topOffsetX = topLeft.x();
      const topOffsetY = topLeft.y();
      const bottomOffsetX = this.getWidth() - bottomRight.x();
      const bottomOffsetY = this.getHeight() - bottomRight.y();
      bottomRight.move({
        x: -topOffsetX,
        y: -topOffsetY
      });
      topLeft.move({
        x: bottomOffsetX,
        y: bottomOffsetY
      });
    }
    const absPos = this.findOne(".top-left").getAbsolutePosition();
    x = absPos.x;
    y = absPos.y;
    const width = this.findOne(".bottom-right").x() - this.findOne(".top-left").x();
    const height = this.findOne(".bottom-right").y() - this.findOne(".top-left").y();
    this._fitNodesInto({
      x,
      y,
      width,
      height,
      rotation: Konva$2.getAngle(this.rotation())
    }, e);
  }
  _handleMouseUp(e) {
    this._removeEvents(e);
  }
  getAbsoluteTransform() {
    return this.getTransform();
  }
  _removeEvents(e) {
    var _a;
    if (this._transforming) {
      this._transforming = false;
      if (typeof window !== "undefined") {
        window.removeEventListener("mousemove", this._handleMouseMove);
        window.removeEventListener("touchmove", this._handleMouseMove);
        window.removeEventListener("mouseup", this._handleMouseUp, true);
        window.removeEventListener("touchend", this._handleMouseUp, true);
      }
      const node = this.getNode();
      activeTransformersCount--;
      this._fire("transformend", { evt: e, target: node });
      (_a = this.getLayer()) === null || _a === void 0 ? void 0 : _a.batchDraw();
      if (node) {
        this._nodes.forEach((target) => {
          var _a2;
          target._fire("transformend", { evt: e, target });
          (_a2 = target.getLayer()) === null || _a2 === void 0 ? void 0 : _a2.batchDraw();
        });
      }
      this._movingAnchorName = null;
    }
  }
  _fitNodesInto(newAttrs, evt) {
    const oldAttrs = this._getNodeRect();
    const minSize = 1;
    if (Util._inRange(newAttrs.width, -this.padding() * 2 - minSize, minSize)) {
      this.update();
      return;
    }
    if (Util._inRange(newAttrs.height, -this.padding() * 2 - minSize, minSize)) {
      this.update();
      return;
    }
    const t = new Transform();
    t.rotate(Konva$2.getAngle(this.rotation()));
    if (this._movingAnchorName && newAttrs.width < 0 && this._movingAnchorName.indexOf("left") >= 0) {
      const offset = t.point({
        x: -this.padding() * 2,
        y: 0
      });
      newAttrs.x += offset.x;
      newAttrs.y += offset.y;
      newAttrs.width += this.padding() * 2;
      this._movingAnchorName = this._movingAnchorName.replace("left", "right");
      this._anchorDragOffset.x -= offset.x;
      this._anchorDragOffset.y -= offset.y;
    } else if (this._movingAnchorName && newAttrs.width < 0 && this._movingAnchorName.indexOf("right") >= 0) {
      const offset = t.point({
        x: this.padding() * 2,
        y: 0
      });
      this._movingAnchorName = this._movingAnchorName.replace("right", "left");
      this._anchorDragOffset.x -= offset.x;
      this._anchorDragOffset.y -= offset.y;
      newAttrs.width += this.padding() * 2;
    }
    if (this._movingAnchorName && newAttrs.height < 0 && this._movingAnchorName.indexOf("top") >= 0) {
      const offset = t.point({
        x: 0,
        y: -this.padding() * 2
      });
      newAttrs.x += offset.x;
      newAttrs.y += offset.y;
      this._movingAnchorName = this._movingAnchorName.replace("top", "bottom");
      this._anchorDragOffset.x -= offset.x;
      this._anchorDragOffset.y -= offset.y;
      newAttrs.height += this.padding() * 2;
    } else if (this._movingAnchorName && newAttrs.height < 0 && this._movingAnchorName.indexOf("bottom") >= 0) {
      const offset = t.point({
        x: 0,
        y: this.padding() * 2
      });
      this._movingAnchorName = this._movingAnchorName.replace("bottom", "top");
      this._anchorDragOffset.x -= offset.x;
      this._anchorDragOffset.y -= offset.y;
      newAttrs.height += this.padding() * 2;
    }
    if (this.boundBoxFunc()) {
      const bounded = this.boundBoxFunc()(oldAttrs, newAttrs);
      if (bounded) {
        newAttrs = bounded;
      } else {
        Util.warn("boundBoxFunc returned falsy. You should return new bound rect from it!");
      }
    }
    const baseSize = 1e7;
    const oldTr = new Transform();
    oldTr.translate(oldAttrs.x, oldAttrs.y);
    oldTr.rotate(oldAttrs.rotation);
    oldTr.scale(oldAttrs.width / baseSize, oldAttrs.height / baseSize);
    const newTr = new Transform();
    const newScaleX = newAttrs.width / baseSize;
    const newScaleY = newAttrs.height / baseSize;
    if (this.flipEnabled() === false) {
      newTr.translate(newAttrs.x, newAttrs.y);
      newTr.rotate(newAttrs.rotation);
      newTr.translate(newAttrs.width < 0 ? newAttrs.width : 0, newAttrs.height < 0 ? newAttrs.height : 0);
      newTr.scale(Math.abs(newScaleX), Math.abs(newScaleY));
    } else {
      newTr.translate(newAttrs.x, newAttrs.y);
      newTr.rotate(newAttrs.rotation);
      newTr.scale(newScaleX, newScaleY);
    }
    const delta = newTr.multiply(oldTr.invert());
    this._nodes.forEach((node) => {
      var _a;
      if (!node.getStage()) {
        return;
      }
      const parentTransform = node.getParent().getAbsoluteTransform();
      const localTransform = node.getTransform().copy();
      localTransform.translate(node.offsetX(), node.offsetY());
      const newLocalTransform = new Transform();
      newLocalTransform.multiply(parentTransform.copy().invert()).multiply(delta).multiply(parentTransform).multiply(localTransform);
      const attrs = newLocalTransform.decompose();
      node.setAttrs(attrs);
      (_a = node.getLayer()) === null || _a === void 0 ? void 0 : _a.batchDraw();
    });
    this.rotation(Util._getRotation(newAttrs.rotation));
    this._nodes.forEach((node) => {
      this._fire("transform", { evt, target: node });
      node._fire("transform", { evt, target: node });
    });
    this._resetTransformCache();
    this.update();
    this.getLayer().batchDraw();
  }
  forceUpdate() {
    this._resetTransformCache();
    this.update();
  }
  _batchChangeChild(selector, attrs) {
    const anchor = this.findOne(selector);
    anchor.setAttrs(attrs);
  }
  update() {
    var _a;
    const attrs = this._getNodeRect();
    this.rotation(Util._getRotation(attrs.rotation));
    const width = attrs.width;
    const height = attrs.height;
    const enabledAnchors = this.enabledAnchors();
    const resizeEnabled = this.resizeEnabled();
    const padding = this.padding();
    const anchorSize = this.anchorSize();
    const anchors = this.find("._anchor");
    anchors.forEach((node) => {
      node.setAttrs({
        width: anchorSize,
        height: anchorSize,
        offsetX: anchorSize / 2,
        offsetY: anchorSize / 2,
        stroke: this.anchorStroke(),
        strokeWidth: this.anchorStrokeWidth(),
        fill: this.anchorFill(),
        cornerRadius: this.anchorCornerRadius()
      });
    });
    this._batchChangeChild(".top-left", {
      x: 0,
      y: 0,
      offsetX: anchorSize / 2 + padding,
      offsetY: anchorSize / 2 + padding,
      visible: resizeEnabled && enabledAnchors.indexOf("top-left") >= 0
    });
    this._batchChangeChild(".top-center", {
      x: width / 2,
      y: 0,
      offsetY: anchorSize / 2 + padding,
      visible: resizeEnabled && enabledAnchors.indexOf("top-center") >= 0
    });
    this._batchChangeChild(".top-right", {
      x: width,
      y: 0,
      offsetX: anchorSize / 2 - padding,
      offsetY: anchorSize / 2 + padding,
      visible: resizeEnabled && enabledAnchors.indexOf("top-right") >= 0
    });
    this._batchChangeChild(".middle-left", {
      x: 0,
      y: height / 2,
      offsetX: anchorSize / 2 + padding,
      visible: resizeEnabled && enabledAnchors.indexOf("middle-left") >= 0
    });
    this._batchChangeChild(".middle-right", {
      x: width,
      y: height / 2,
      offsetX: anchorSize / 2 - padding,
      visible: resizeEnabled && enabledAnchors.indexOf("middle-right") >= 0
    });
    this._batchChangeChild(".bottom-left", {
      x: 0,
      y: height,
      offsetX: anchorSize / 2 + padding,
      offsetY: anchorSize / 2 - padding,
      visible: resizeEnabled && enabledAnchors.indexOf("bottom-left") >= 0
    });
    this._batchChangeChild(".bottom-center", {
      x: width / 2,
      y: height,
      offsetY: anchorSize / 2 - padding,
      visible: resizeEnabled && enabledAnchors.indexOf("bottom-center") >= 0
    });
    this._batchChangeChild(".bottom-right", {
      x: width,
      y: height,
      offsetX: anchorSize / 2 - padding,
      offsetY: anchorSize / 2 - padding,
      visible: resizeEnabled && enabledAnchors.indexOf("bottom-right") >= 0
    });
    const rotateAnchorAngle = this.rotateAnchorAngle();
    const rotateAnchorOffset = this.rotateAnchorOffset();
    const rad = Util.degToRad(rotateAnchorAngle);
    const dirX = Math.sin(rad);
    const dirY = -Math.cos(rad);
    const cx = width / 2;
    const cy = height / 2;
    let t = Infinity;
    if (dirY < 0) {
      t = Math.min(t, -cy / dirY);
    } else if (dirY > 0) {
      t = Math.min(t, (height - cy) / dirY);
    }
    if (dirX < 0) {
      t = Math.min(t, -cx / dirX);
    } else if (dirX > 0) {
      t = Math.min(t, (width - cx) / dirX);
    }
    const edgeX = cx + dirX * t;
    const edgeY = cy + dirY * t;
    const sign = Util._sign(height);
    this._batchChangeChild(".rotater", {
      x: edgeX + dirX * rotateAnchorOffset * sign,
      y: edgeY + dirY * rotateAnchorOffset * sign - padding * dirY,
      visible: this.rotateEnabled()
    });
    this._batchChangeChild(".back", {
      width,
      height,
      visible: this.borderEnabled(),
      stroke: this.borderStroke(),
      strokeWidth: this.borderStrokeWidth(),
      dash: this.borderDash(),
      draggable: this.nodes().some((node) => node.draggable()),
      x: 0,
      y: 0
    });
    const styleFunc = this.anchorStyleFunc();
    if (styleFunc) {
      anchors.forEach((node) => {
        styleFunc(node);
      });
    }
    (_a = this.getLayer()) === null || _a === void 0 ? void 0 : _a.batchDraw();
  }
  isTransforming() {
    return this._transforming;
  }
  stopTransform() {
    if (this._transforming) {
      this._removeEvents();
      const anchorNode = this.findOne("." + this._movingAnchorName);
      if (anchorNode) {
        anchorNode.stopDrag();
      }
    }
  }
  destroy() {
    if (this.getStage() && this._cursorChange) {
      this.getStage().content && (this.getStage().content.style.cursor = "");
    }
    Group$1.prototype.destroy.call(this);
    this.detach();
    this._removeEvents();
    return this;
  }
  add(...children) {
    if (this._elementsCreated) {
      Util.error("You cannot add external nodes to the Transformer. Use tr.nodes([node]) instead.");
      return this;
    }
    return super.add(...children);
  }
  toObject() {
    return Node.prototype.toObject.call(this);
  }
  clone(obj) {
    const node = Node.prototype.clone.call(this, obj);
    return node;
  }
  getClientRect() {
    if (this.nodes().length > 0) {
      return super.getClientRect();
    } else {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
  }
}
Transformer.isTransforming = () => {
  return activeTransformersCount > 0;
};
function validateAnchors(val) {
  if (!(val instanceof Array)) {
    Util.warn("enabledAnchors value should be an array");
  }
  if (val instanceof Array) {
    val.forEach(function(name) {
      if (ANCHORS_NAMES.indexOf(name) === -1) {
        Util.warn("Unknown anchor name: " + name + ". Available names are: " + ANCHORS_NAMES.join(", "));
      }
    });
  }
  return val || [];
}
Transformer.prototype.className = "Transformer";
_registerNode(Transformer);
Factory.addGetterSetter(Transformer, "enabledAnchors", ANCHORS_NAMES, validateAnchors);
Factory.addGetterSetter(Transformer, "flipEnabled", true, getBooleanValidator());
Factory.addGetterSetter(Transformer, "resizeEnabled", true);
Factory.addGetterSetter(Transformer, "anchorSize", 10, getNumberValidator());
Factory.addGetterSetter(Transformer, "rotateEnabled", true);
Factory.addGetterSetter(Transformer, "rotateLineVisible", true);
Factory.addGetterSetter(Transformer, "rotationSnaps", []);
Factory.addGetterSetter(Transformer, "rotateAnchorOffset", 50, getNumberValidator());
Factory.addGetterSetter(Transformer, "rotateAnchorAngle", 0, getNumberValidator());
Factory.addGetterSetter(Transformer, "rotateAnchorCursor", "crosshair");
Factory.addGetterSetter(Transformer, "rotationSnapTolerance", 5, getNumberValidator());
Factory.addGetterSetter(Transformer, "borderEnabled", true);
Factory.addGetterSetter(Transformer, "anchorStroke", "rgb(0, 161, 255)");
Factory.addGetterSetter(Transformer, "anchorStrokeWidth", 1, getNumberValidator());
Factory.addGetterSetter(Transformer, "anchorFill", "white");
Factory.addGetterSetter(Transformer, "anchorCornerRadius", 0, getNumberValidator());
Factory.addGetterSetter(Transformer, "borderStroke", "rgb(0, 161, 255)");
Factory.addGetterSetter(Transformer, "borderStrokeWidth", 1, getNumberValidator());
Factory.addGetterSetter(Transformer, "borderDash");
Factory.addGetterSetter(Transformer, "keepRatio", true);
Factory.addGetterSetter(Transformer, "shiftBehavior", "default");
Factory.addGetterSetter(Transformer, "centeredScaling", false);
Factory.addGetterSetter(Transformer, "ignoreStroke", false);
Factory.addGetterSetter(Transformer, "padding", 0, getNumberValidator());
Factory.addGetterSetter(Transformer, "nodes");
Factory.addGetterSetter(Transformer, "node");
Factory.addGetterSetter(Transformer, "boundBoxFunc");
Factory.addGetterSetter(Transformer, "anchorDragBoundFunc");
Factory.addGetterSetter(Transformer, "anchorStyleFunc");
Factory.addGetterSetter(Transformer, "shouldOverdrawWholeArea", false);
Factory.addGetterSetter(Transformer, "useSingleNodeRotation", true);
Factory.backCompat(Transformer, {
  lineEnabled: "borderEnabled",
  rotateHandlerOffset: "rotateAnchorOffset",
  enabledHandlers: "enabledAnchors"
});

class Wedge extends Shape {
    _sceneFunc(context) {
        context.beginPath();
        context.arc(0, 0, this.radius(), 0, Konva$2.getAngle(this.angle()), this.clockwise());
        context.lineTo(0, 0);
        context.closePath();
        context.fillStrokeShape(this);
    }
    getWidth() {
        return this.radius() * 2;
    }
    getHeight() {
        return this.radius() * 2;
    }
    setWidth(width) {
        this.radius(width / 2);
    }
    setHeight(height) {
        this.radius(height / 2);
    }
}
Wedge.prototype.className = 'Wedge';
Wedge.prototype._centroid = true;
Wedge.prototype._attrsAffectingSize = ['radius'];
_registerNode(Wedge);
Factory.addGetterSetter(Wedge, 'radius', 0, getNumberValidator());
Factory.addGetterSetter(Wedge, 'angle', 0, getNumberValidator());
Factory.addGetterSetter(Wedge, 'clockwise', false);
Factory.backCompat(Wedge, {
    angleDeg: 'angle',
    getAngleDeg: 'getAngle',
    setAngleDeg: 'setAngle',
});

function BlurStack() {
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.a = 0;
    this.next = null;
}
const mul_table = [
    512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292,
    512, 454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292,
    273, 512, 482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259,
    496, 475, 456, 437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292,
    282, 273, 265, 512, 497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373,
    364, 354, 345, 337, 328, 320, 312, 305, 298, 291, 284, 278, 271, 265, 259,
    507, 496, 485, 475, 465, 456, 446, 437, 428, 420, 412, 404, 396, 388, 381,
    374, 367, 360, 354, 347, 341, 335, 329, 323, 318, 312, 307, 302, 297, 292,
    287, 282, 278, 273, 269, 265, 261, 512, 505, 497, 489, 482, 475, 468, 461,
    454, 447, 441, 435, 428, 422, 417, 411, 405, 399, 394, 389, 383, 378, 373,
    368, 364, 359, 354, 350, 345, 341, 337, 332, 328, 324, 320, 316, 312, 309,
    305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271, 268, 265, 262, 259,
    257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456, 451, 446, 442,
    437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388, 385, 381,
    377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335, 332,
    329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292,
    289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259,
];
const shg_table = [
    9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 17,
    17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19,
    19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20,
    20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
    21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22,
    22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
    22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
    23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
    24, 24, 24, 24, 24, 24, 24,
];
function filterGaussBlurRGBA(imageData, radius) {
    const pixels = imageData.data, width = imageData.width, height = imageData.height;
    let p, yi, yw, r_sum, g_sum, b_sum, a_sum, r_out_sum, g_out_sum, b_out_sum, a_out_sum, r_in_sum, g_in_sum, b_in_sum, a_in_sum, pr, pg, pb, pa, rbs;
    const div = radius + radius + 1, widthMinus1 = width - 1, heightMinus1 = height - 1, radiusPlus1 = radius + 1, sumFactor = (radiusPlus1 * (radiusPlus1 + 1)) / 2, stackStart = new BlurStack(), mul_sum = mul_table[radius], shg_sum = shg_table[radius];
    let stackEnd = null, stack = stackStart, stackIn = null, stackOut = null;
    for (let i = 1; i < div; i++) {
        stack = stack.next = new BlurStack();
        if (i === radiusPlus1) {
            stackEnd = stack;
        }
    }
    stack.next = stackStart;
    yw = yi = 0;
    for (let y = 0; y < height; y++) {
        r_in_sum =
            g_in_sum =
                b_in_sum =
                    a_in_sum =
                        r_sum =
                            g_sum =
                                b_sum =
                                    a_sum =
                                        0;
        r_out_sum = radiusPlus1 * (pr = pixels[yi]);
        g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
        b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
        a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);
        r_sum += sumFactor * pr;
        g_sum += sumFactor * pg;
        b_sum += sumFactor * pb;
        a_sum += sumFactor * pa;
        stack = stackStart;
        for (let i = 0; i < radiusPlus1; i++) {
            stack.r = pr;
            stack.g = pg;
            stack.b = pb;
            stack.a = pa;
            stack = stack.next;
        }
        for (let i = 1; i < radiusPlus1; i++) {
            p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
            r_sum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - i);
            g_sum += (stack.g = pg = pixels[p + 1]) * rbs;
            b_sum += (stack.b = pb = pixels[p + 2]) * rbs;
            a_sum += (stack.a = pa = pixels[p + 3]) * rbs;
            r_in_sum += pr;
            g_in_sum += pg;
            b_in_sum += pb;
            a_in_sum += pa;
            stack = stack.next;
        }
        stackIn = stackStart;
        stackOut = stackEnd;
        for (let x = 0; x < width; x++) {
            pixels[yi + 3] = pa = (a_sum * mul_sum) >> shg_sum;
            if (pa !== 0) {
                pa = 255 / pa;
                pixels[yi] = ((r_sum * mul_sum) >> shg_sum) * pa;
                pixels[yi + 1] = ((g_sum * mul_sum) >> shg_sum) * pa;
                pixels[yi + 2] = ((b_sum * mul_sum) >> shg_sum) * pa;
            }
            else {
                pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
            }
            r_sum -= r_out_sum;
            g_sum -= g_out_sum;
            b_sum -= b_out_sum;
            a_sum -= a_out_sum;
            r_out_sum -= stackIn.r;
            g_out_sum -= stackIn.g;
            b_out_sum -= stackIn.b;
            a_out_sum -= stackIn.a;
            p = (yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1)) << 2;
            r_in_sum += stackIn.r = pixels[p];
            g_in_sum += stackIn.g = pixels[p + 1];
            b_in_sum += stackIn.b = pixels[p + 2];
            a_in_sum += stackIn.a = pixels[p + 3];
            r_sum += r_in_sum;
            g_sum += g_in_sum;
            b_sum += b_in_sum;
            a_sum += a_in_sum;
            stackIn = stackIn.next;
            r_out_sum += pr = stackOut.r;
            g_out_sum += pg = stackOut.g;
            b_out_sum += pb = stackOut.b;
            a_out_sum += pa = stackOut.a;
            r_in_sum -= pr;
            g_in_sum -= pg;
            b_in_sum -= pb;
            a_in_sum -= pa;
            stackOut = stackOut.next;
            yi += 4;
        }
        yw += width;
    }
    for (let x = 0; x < width; x++) {
        g_in_sum =
            b_in_sum =
                a_in_sum =
                    r_in_sum =
                        g_sum =
                            b_sum =
                                a_sum =
                                    r_sum =
                                        0;
        yi = x << 2;
        r_out_sum = radiusPlus1 * (pr = pixels[yi]);
        g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
        b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
        a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);
        r_sum += sumFactor * pr;
        g_sum += sumFactor * pg;
        b_sum += sumFactor * pb;
        a_sum += sumFactor * pa;
        stack = stackStart;
        for (let i = 0; i < radiusPlus1; i++) {
            stack.r = pr;
            stack.g = pg;
            stack.b = pb;
            stack.a = pa;
            stack = stack.next;
        }
        let yp = width;
        for (let i = 1; i <= radius; i++) {
            yi = (yp + x) << 2;
            r_sum += (stack.r = pr = pixels[yi]) * (rbs = radiusPlus1 - i);
            g_sum += (stack.g = pg = pixels[yi + 1]) * rbs;
            b_sum += (stack.b = pb = pixels[yi + 2]) * rbs;
            a_sum += (stack.a = pa = pixels[yi + 3]) * rbs;
            r_in_sum += pr;
            g_in_sum += pg;
            b_in_sum += pb;
            a_in_sum += pa;
            stack = stack.next;
            if (i < heightMinus1) {
                yp += width;
            }
        }
        yi = x;
        stackIn = stackStart;
        stackOut = stackEnd;
        for (let y = 0; y < height; y++) {
            p = yi << 2;
            pixels[p + 3] = pa = (a_sum * mul_sum) >> shg_sum;
            if (pa > 0) {
                pa = 255 / pa;
                pixels[p] = ((r_sum * mul_sum) >> shg_sum) * pa;
                pixels[p + 1] = ((g_sum * mul_sum) >> shg_sum) * pa;
                pixels[p + 2] = ((b_sum * mul_sum) >> shg_sum) * pa;
            }
            else {
                pixels[p] = pixels[p + 1] = pixels[p + 2] = 0;
            }
            r_sum -= r_out_sum;
            g_sum -= g_out_sum;
            b_sum -= b_out_sum;
            a_sum -= a_out_sum;
            r_out_sum -= stackIn.r;
            g_out_sum -= stackIn.g;
            b_out_sum -= stackIn.b;
            a_out_sum -= stackIn.a;
            p =
                (x +
                    ((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width) <<
                    2;
            r_sum += r_in_sum += stackIn.r = pixels[p];
            g_sum += g_in_sum += stackIn.g = pixels[p + 1];
            b_sum += b_in_sum += stackIn.b = pixels[p + 2];
            a_sum += a_in_sum += stackIn.a = pixels[p + 3];
            stackIn = stackIn.next;
            r_out_sum += pr = stackOut.r;
            g_out_sum += pg = stackOut.g;
            b_out_sum += pb = stackOut.b;
            a_out_sum += pa = stackOut.a;
            r_in_sum -= pr;
            g_in_sum -= pg;
            b_in_sum -= pb;
            a_in_sum -= pa;
            stackOut = stackOut.next;
            yi += width;
        }
    }
}
const Blur = function Blur(imageData) {
    const radius = Math.round(this.blurRadius());
    if (radius > 0) {
        filterGaussBlurRGBA(imageData, radius);
    }
};
Factory.addGetterSetter(Node, 'blurRadius', 0, getNumberValidator(), Factory.afterSetFilter);

const Brighten = function (imageData) {
    const brightness = this.brightness() * 255, data = imageData.data, len = data.length;
    for (let i = 0; i < len; i += 4) {
        data[i] += brightness;
        data[i + 1] += brightness;
        data[i + 2] += brightness;
    }
};
Factory.addGetterSetter(Node, 'brightness', 0, getNumberValidator(), Factory.afterSetFilter);

const Brightness = function (imageData) {
    const brightness = this.brightness(), data = imageData.data, len = data.length;
    for (let i = 0; i < len; i += 4) {
        data[i] = Math.min(255, data[i] * brightness);
        data[i + 1] = Math.min(255, data[i + 1] * brightness);
        data[i + 2] = Math.min(255, data[i + 2] * brightness);
    }
};

const Contrast = function (imageData) {
    const adjust = Math.pow((this.contrast() + 100) / 100, 2);
    const data = imageData.data, nPixels = data.length;
    let red = 150, green = 150, blue = 150;
    for (let i = 0; i < nPixels; i += 4) {
        red = data[i];
        green = data[i + 1];
        blue = data[i + 2];
        red /= 255;
        red -= 0.5;
        red *= adjust;
        red += 0.5;
        red *= 255;
        green /= 255;
        green -= 0.5;
        green *= adjust;
        green += 0.5;
        green *= 255;
        blue /= 255;
        blue -= 0.5;
        blue *= adjust;
        blue += 0.5;
        blue *= 255;
        red = red < 0 ? 0 : red > 255 ? 255 : red;
        green = green < 0 ? 0 : green > 255 ? 255 : green;
        blue = blue < 0 ? 0 : blue > 255 ? 255 : blue;
        data[i] = red;
        data[i + 1] = green;
        data[i + 2] = blue;
    }
};
Factory.addGetterSetter(Node, 'contrast', 0, getNumberValidator(), Factory.afterSetFilter);

const Emboss = function (imageData) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const data = imageData.data;
    const w = imageData.width;
    const h = imageData.height;
    const strength01 = Math.min(1, Math.max(0, (_b = (_a = this.embossStrength) === null || _a === void 0 ? void 0 : _a.call(this)) !== null && _b !== void 0 ? _b : 0.5));
    const whiteLevel01 = Math.min(1, Math.max(0, (_d = (_c = this.embossWhiteLevel) === null || _c === void 0 ? void 0 : _c.call(this)) !== null && _d !== void 0 ? _d : 0.5));
    const directionMap = {
        'top-left': 315,
        top: 270,
        'top-right': 225,
        right: 180,
        'bottom-right': 135,
        bottom: 90,
        'bottom-left': 45,
        left: 0,
    };
    const directionDeg = (_g = directionMap[(_f = (_e = this.embossDirection) === null || _e === void 0 ? void 0 : _e.call(this)) !== null && _f !== void 0 ? _f : 'top-left']) !== null && _g !== void 0 ? _g : 315;
    const blend = !!((_j = (_h = this.embossBlend) === null || _h === void 0 ? void 0 : _h.call(this)) !== null && _j !== void 0 ? _j : false);
    const strength = strength01 * 10;
    const bias = whiteLevel01 * 255;
    const dirRad = (directionDeg * Math.PI) / 180;
    const cx = Math.cos(dirRad);
    const cy = Math.sin(dirRad);
    const SCALE = (128 / 1020) * strength;
    const src = new Uint8ClampedArray(data);
    const lum = new Float32Array(w * h);
    for (let p = 0, i = 0; i < data.length; i += 4, p++) {
        lum[p] = 0.2126 * src[i] + 0.7152 * src[i + 1] + 0.0722 * src[i + 2];
    }
    const Gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const Gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    const OFF = [-w - 1, -w, -w + 1, -1, 0, 1, w - 1, w, w + 1];
    const clamp8 = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);
    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
            const p = y * w + x;
            let sx = 0, sy = 0;
            sx += lum[p + OFF[0]] * Gx[0];
            sy += lum[p + OFF[0]] * Gy[0];
            sx += lum[p + OFF[1]] * Gx[1];
            sy += lum[p + OFF[1]] * Gy[1];
            sx += lum[p + OFF[2]] * Gx[2];
            sy += lum[p + OFF[2]] * Gy[2];
            sx += lum[p + OFF[3]] * Gx[3];
            sy += lum[p + OFF[3]] * Gy[3];
            sx += lum[p + OFF[5]] * Gx[5];
            sy += lum[p + OFF[5]] * Gy[5];
            sx += lum[p + OFF[6]] * Gx[6];
            sy += lum[p + OFF[6]] * Gy[6];
            sx += lum[p + OFF[7]] * Gx[7];
            sy += lum[p + OFF[7]] * Gy[7];
            sx += lum[p + OFF[8]] * Gx[8];
            sy += lum[p + OFF[8]] * Gy[8];
            const r = cx * sx + cy * sy;
            const outGray = clamp8(bias + r * SCALE);
            const o = p * 4;
            if (blend) {
                const delta = outGray - bias;
                data[o] = clamp8(src[o] + delta);
                data[o + 1] = clamp8(src[o + 1] + delta);
                data[o + 2] = clamp8(src[o + 2] + delta);
                data[o + 3] = src[o + 3];
            }
            else {
                data[o] = data[o + 1] = data[o + 2] = outGray;
                data[o + 3] = src[o + 3];
            }
        }
    }
    for (let x = 0; x < w; x++) {
        let oTop = x * 4, oBot = ((h - 1) * w + x) * 4;
        data[oTop] = src[oTop];
        data[oTop + 1] = src[oTop + 1];
        data[oTop + 2] = src[oTop + 2];
        data[oTop + 3] = src[oTop + 3];
        data[oBot] = src[oBot];
        data[oBot + 1] = src[oBot + 1];
        data[oBot + 2] = src[oBot + 2];
        data[oBot + 3] = src[oBot + 3];
    }
    for (let y = 1; y < h - 1; y++) {
        let oL = y * w * 4, oR = (y * w + (w - 1)) * 4;
        data[oL] = src[oL];
        data[oL + 1] = src[oL + 1];
        data[oL + 2] = src[oL + 2];
        data[oL + 3] = src[oL + 3];
        data[oR] = src[oR];
        data[oR + 1] = src[oR + 1];
        data[oR + 2] = src[oR + 2];
        data[oR + 3] = src[oR + 3];
    }
    return imageData;
};
Factory.addGetterSetter(Node, 'embossStrength', 0.5, getNumberValidator(), Factory.afterSetFilter);
Factory.addGetterSetter(Node, 'embossWhiteLevel', 0.5, getNumberValidator(), Factory.afterSetFilter);
Factory.addGetterSetter(Node, 'embossDirection', 'top-left', undefined, Factory.afterSetFilter);
Factory.addGetterSetter(Node, 'embossBlend', false, undefined, Factory.afterSetFilter);

function remap(fromValue, fromMin, fromMax, toMin, toMax) {
    const fromRange = fromMax - fromMin, toRange = toMax - toMin;
    if (fromRange === 0) {
        return toMin + toRange / 2;
    }
    if (toRange === 0) {
        return toMin;
    }
    let toValue = (fromValue - fromMin) / fromRange;
    toValue = toRange * toValue + toMin;
    return toValue;
}
const Enhance = function (imageData) {
    const data = imageData.data, nSubPixels = data.length;
    let rMin = data[0], rMax = rMin, r, gMin = data[1], gMax = gMin, g, bMin = data[2], bMax = bMin, b;
    const enhanceAmount = this.enhance();
    if (enhanceAmount === 0) {
        return;
    }
    for (let i = 0; i < nSubPixels; i += 4) {
        r = data[i + 0];
        if (r < rMin) {
            rMin = r;
        }
        else if (r > rMax) {
            rMax = r;
        }
        g = data[i + 1];
        if (g < gMin) {
            gMin = g;
        }
        else if (g > gMax) {
            gMax = g;
        }
        b = data[i + 2];
        if (b < bMin) {
            bMin = b;
        }
        else if (b > bMax) {
            bMax = b;
        }
    }
    if (rMax === rMin) {
        rMax = 255;
        rMin = 0;
    }
    if (gMax === gMin) {
        gMax = 255;
        gMin = 0;
    }
    if (bMax === bMin) {
        bMax = 255;
        bMin = 0;
    }
    let rGoalMax, rGoalMin, gGoalMax, gGoalMin, bGoalMax, bGoalMin;
    if (enhanceAmount > 0) {
        rGoalMax = rMax + enhanceAmount * (255 - rMax);
        rGoalMin = rMin - enhanceAmount * (rMin - 0);
        gGoalMax = gMax + enhanceAmount * (255 - gMax);
        gGoalMin = gMin - enhanceAmount * (gMin - 0);
        bGoalMax = bMax + enhanceAmount * (255 - bMax);
        bGoalMin = bMin - enhanceAmount * (bMin - 0);
    }
    else {
        const rMid = (rMax + rMin) * 0.5;
        rGoalMax = rMax + enhanceAmount * (rMax - rMid);
        rGoalMin = rMin + enhanceAmount * (rMin - rMid);
        const gMid = (gMax + gMin) * 0.5;
        gGoalMax = gMax + enhanceAmount * (gMax - gMid);
        gGoalMin = gMin + enhanceAmount * (gMin - gMid);
        const bMid = (bMax + bMin) * 0.5;
        bGoalMax = bMax + enhanceAmount * (bMax - bMid);
        bGoalMin = bMin + enhanceAmount * (bMin - bMid);
    }
    for (let i = 0; i < nSubPixels; i += 4) {
        data[i + 0] = remap(data[i + 0], rMin, rMax, rGoalMin, rGoalMax);
        data[i + 1] = remap(data[i + 1], gMin, gMax, gGoalMin, gGoalMax);
        data[i + 2] = remap(data[i + 2], bMin, bMax, bGoalMin, bGoalMax);
    }
};
Factory.addGetterSetter(Node, 'enhance', 0, getNumberValidator(), Factory.afterSetFilter);

const Grayscale = function (imageData) {
    const data = imageData.data, len = data.length;
    for (let i = 0; i < len; i += 4) {
        const brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
        data[i] = brightness;
        data[i + 1] = brightness;
        data[i + 2] = brightness;
    }
};

Factory.addGetterSetter(Node, 'hue', 0, getNumberValidator(), Factory.afterSetFilter);
Factory.addGetterSetter(Node, 'saturation', 0, getNumberValidator(), Factory.afterSetFilter);
Factory.addGetterSetter(Node, 'luminance', 0, getNumberValidator(), Factory.afterSetFilter);
const HSL = function (imageData) {
    const data = imageData.data, nPixels = data.length, v = 1, s = Math.pow(2, this.saturation()), h = Math.abs(this.hue() + 360) % 360, l = this.luminance() * 127;
    const vsu = v * s * Math.cos((h * Math.PI) / 180), vsw = v * s * Math.sin((h * Math.PI) / 180);
    const rr = 0.299 * v + 0.701 * vsu + 0.167 * vsw, rg = 0.587 * v - 0.587 * vsu + 0.33 * vsw, rb = 0.114 * v - 0.114 * vsu - 0.497 * vsw;
    const gr = 0.299 * v - 0.299 * vsu - 0.328 * vsw, gg = 0.587 * v + 0.413 * vsu + 0.035 * vsw, gb = 0.114 * v - 0.114 * vsu + 0.293 * vsw;
    const br = 0.299 * v - 0.3 * vsu + 1.25 * vsw, bg = 0.587 * v - 0.586 * vsu - 1.05 * vsw, bb = 0.114 * v + 0.886 * vsu - 0.2 * vsw;
    let r, g, b, a;
    for (let i = 0; i < nPixels; i += 4) {
        r = data[i + 0];
        g = data[i + 1];
        b = data[i + 2];
        a = data[i + 3];
        data[i + 0] = rr * r + rg * g + rb * b + l;
        data[i + 1] = gr * r + gg * g + gb * b + l;
        data[i + 2] = br * r + bg * g + bb * b + l;
        data[i + 3] = a;
    }
};

const HSV = function (imageData) {
    const data = imageData.data, nPixels = data.length, v = Math.pow(2, this.value()), s = Math.pow(2, this.saturation()), h = Math.abs(this.hue() + 360) % 360;
    const vsu = v * s * Math.cos((h * Math.PI) / 180), vsw = v * s * Math.sin((h * Math.PI) / 180);
    const rr = 0.299 * v + 0.701 * vsu + 0.167 * vsw, rg = 0.587 * v - 0.587 * vsu + 0.33 * vsw, rb = 0.114 * v - 0.114 * vsu - 0.497 * vsw;
    const gr = 0.299 * v - 0.299 * vsu - 0.328 * vsw, gg = 0.587 * v + 0.413 * vsu + 0.035 * vsw, gb = 0.114 * v - 0.114 * vsu + 0.293 * vsw;
    const br = 0.299 * v - 0.3 * vsu + 1.25 * vsw, bg = 0.587 * v - 0.586 * vsu - 1.05 * vsw, bb = 0.114 * v + 0.886 * vsu - 0.2 * vsw;
    for (let i = 0; i < nPixels; i += 4) {
        const r = data[i + 0];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        data[i + 0] = rr * r + rg * g + rb * b;
        data[i + 1] = gr * r + gg * g + gb * b;
        data[i + 2] = br * r + bg * g + bb * b;
        data[i + 3] = a;
    }
};
Factory.addGetterSetter(Node, 'hue', 0, getNumberValidator(), Factory.afterSetFilter);
Factory.addGetterSetter(Node, 'saturation', 0, getNumberValidator(), Factory.afterSetFilter);
Factory.addGetterSetter(Node, 'value', 0, getNumberValidator(), Factory.afterSetFilter);

const Invert = function (imageData) {
    const data = imageData.data, len = data.length;
    for (let i = 0; i < len; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
    }
};

const ToPolar = function (src, dst, opt) {
    const srcPixels = src.data, dstPixels = dst.data, xSize = src.width, ySize = src.height, xMid = opt.polarCenterX || xSize / 2, yMid = opt.polarCenterY || ySize / 2;
    let rMax = Math.sqrt(xMid * xMid + yMid * yMid);
    let x = xSize - xMid;
    let y = ySize - yMid;
    const rad = Math.sqrt(x * x + y * y);
    rMax = rad > rMax ? rad : rMax;
    const rSize = ySize, tSize = xSize;
    const conversion = ((360 / tSize) * Math.PI) / 180;
    for (let theta = 0; theta < tSize; theta += 1) {
        const sin = Math.sin(theta * conversion);
        const cos = Math.cos(theta * conversion);
        for (let radius = 0; radius < rSize; radius += 1) {
            x = Math.floor(xMid + ((rMax * radius) / rSize) * cos);
            y = Math.floor(yMid + ((rMax * radius) / rSize) * sin);
            let i = (y * xSize + x) * 4;
            const r = srcPixels[i + 0];
            const g = srcPixels[i + 1];
            const b = srcPixels[i + 2];
            const a = srcPixels[i + 3];
            i = (theta + radius * xSize) * 4;
            dstPixels[i + 0] = r;
            dstPixels[i + 1] = g;
            dstPixels[i + 2] = b;
            dstPixels[i + 3] = a;
        }
    }
};
const FromPolar = function (src, dst, opt) {
    const srcPixels = src.data, dstPixels = dst.data, xSize = src.width, ySize = src.height, xMid = opt.polarCenterX || xSize / 2, yMid = opt.polarCenterY || ySize / 2;
    let rMax = Math.sqrt(xMid * xMid + yMid * yMid);
    let x = xSize - xMid;
    let y = ySize - yMid;
    const rad = Math.sqrt(x * x + y * y);
    rMax = rad > rMax ? rad : rMax;
    const rSize = ySize, tSize = xSize, phaseShift = 0;
    let x1, y1;
    for (x = 0; x < xSize; x += 1) {
        for (y = 0; y < ySize; y += 1) {
            const dx = x - xMid;
            const dy = y - yMid;
            const radius = (Math.sqrt(dx * dx + dy * dy) * rSize) / rMax;
            let theta = ((Math.atan2(dy, dx) * 180) / Math.PI + 360 + phaseShift) % 360;
            theta = (theta * tSize) / 360;
            x1 = Math.floor(theta);
            y1 = Math.floor(radius);
            let i = (y1 * xSize + x1) * 4;
            const r = srcPixels[i + 0];
            const g = srcPixels[i + 1];
            const b = srcPixels[i + 2];
            const a = srcPixels[i + 3];
            i = (y * xSize + x) * 4;
            dstPixels[i + 0] = r;
            dstPixels[i + 1] = g;
            dstPixels[i + 2] = b;
            dstPixels[i + 3] = a;
        }
    }
};
const Kaleidoscope = function (imageData) {
    const xSize = imageData.width, ySize = imageData.height;
    let x, y, xoff, i, r, g, b, a, srcPos, dstPos;
    let power = Math.round(this.kaleidoscopePower());
    const angle = Math.round(this.kaleidoscopeAngle());
    const offset = Math.floor((xSize * (angle % 360)) / 360);
    if (power < 1) {
        return;
    }
    const tempCanvas = Util.createCanvasElement();
    tempCanvas.width = xSize;
    tempCanvas.height = ySize;
    const scratchData = tempCanvas
        .getContext('2d')
        .getImageData(0, 0, xSize, ySize);
    Util.releaseCanvas(tempCanvas);
    ToPolar(imageData, scratchData, {
        polarCenterX: xSize / 2,
        polarCenterY: ySize / 2,
    });
    let minSectionSize = xSize / Math.pow(2, power);
    while (minSectionSize <= 8) {
        minSectionSize = minSectionSize * 2;
        power -= 1;
    }
    minSectionSize = Math.ceil(minSectionSize);
    let sectionSize = minSectionSize;
    let xStart = 0, xEnd = sectionSize, xDelta = 1;
    if (offset + minSectionSize > xSize) {
        xStart = sectionSize;
        xEnd = 0;
        xDelta = -1;
    }
    for (y = 0; y < ySize; y += 1) {
        for (x = xStart; x !== xEnd; x += xDelta) {
            xoff = Math.round(x + offset) % xSize;
            srcPos = (xSize * y + xoff) * 4;
            r = scratchData.data[srcPos + 0];
            g = scratchData.data[srcPos + 1];
            b = scratchData.data[srcPos + 2];
            a = scratchData.data[srcPos + 3];
            dstPos = (xSize * y + x) * 4;
            scratchData.data[dstPos + 0] = r;
            scratchData.data[dstPos + 1] = g;
            scratchData.data[dstPos + 2] = b;
            scratchData.data[dstPos + 3] = a;
        }
    }
    for (y = 0; y < ySize; y += 1) {
        sectionSize = Math.floor(minSectionSize);
        for (i = 0; i < power; i += 1) {
            for (x = 0; x < sectionSize + 1; x += 1) {
                srcPos = (xSize * y + x) * 4;
                r = scratchData.data[srcPos + 0];
                g = scratchData.data[srcPos + 1];
                b = scratchData.data[srcPos + 2];
                a = scratchData.data[srcPos + 3];
                dstPos = (xSize * y + sectionSize * 2 - x - 1) * 4;
                scratchData.data[dstPos + 0] = r;
                scratchData.data[dstPos + 1] = g;
                scratchData.data[dstPos + 2] = b;
                scratchData.data[dstPos + 3] = a;
            }
            sectionSize *= 2;
        }
    }
    FromPolar(scratchData, imageData, { });
};
Factory.addGetterSetter(Node, 'kaleidoscopePower', 2, getNumberValidator(), Factory.afterSetFilter);
Factory.addGetterSetter(Node, 'kaleidoscopeAngle', 0, getNumberValidator(), Factory.afterSetFilter);

function pixelAt(idata, x, y) {
    let idx = (y * idata.width + x) * 4;
    const d = [];
    d.push(idata.data[idx++], idata.data[idx++], idata.data[idx++], idata.data[idx++]);
    return d;
}
function rgbDistance(p1, p2) {
    return Math.sqrt(Math.pow(p1[0] - p2[0], 2) +
        Math.pow(p1[1] - p2[1], 2) +
        Math.pow(p1[2] - p2[2], 2));
}
function rgbMean(pTab) {
    const m = [0, 0, 0];
    for (let i = 0; i < pTab.length; i++) {
        m[0] += pTab[i][0];
        m[1] += pTab[i][1];
        m[2] += pTab[i][2];
    }
    m[0] /= pTab.length;
    m[1] /= pTab.length;
    m[2] /= pTab.length;
    return m;
}
function backgroundMask(idata, threshold) {
    const rgbv_no = pixelAt(idata, 0, 0);
    const rgbv_ne = pixelAt(idata, idata.width - 1, 0);
    const rgbv_so = pixelAt(idata, 0, idata.height - 1);
    const rgbv_se = pixelAt(idata, idata.width - 1, idata.height - 1);
    const thres = threshold || 10;
    if (rgbDistance(rgbv_no, rgbv_ne) < thres &&
        rgbDistance(rgbv_ne, rgbv_se) < thres &&
        rgbDistance(rgbv_se, rgbv_so) < thres &&
        rgbDistance(rgbv_so, rgbv_no) < thres) {
        const mean = rgbMean([rgbv_ne, rgbv_no, rgbv_se, rgbv_so]);
        const mask = [];
        for (let i = 0; i < idata.width * idata.height; i++) {
            const d = rgbDistance(mean, [
                idata.data[i * 4],
                idata.data[i * 4 + 1],
                idata.data[i * 4 + 2],
            ]);
            mask[i] = d < thres ? 0 : 255;
        }
        return mask;
    }
}
function applyMask(idata, mask) {
    for (let i = 0; i < idata.width * idata.height; i++) {
        idata.data[4 * i + 3] = mask[i];
    }
}
function erodeMask(mask, sw, sh) {
    const weights = [1, 1, 1, 1, 0, 1, 1, 1, 1];
    const side = Math.round(Math.sqrt(weights.length));
    const halfSide = Math.floor(side / 2);
    const maskResult = [];
    for (let y = 0; y < sh; y++) {
        for (let x = 0; x < sw; x++) {
            const so = y * sw + x;
            let a = 0;
            for (let cy = 0; cy < side; cy++) {
                for (let cx = 0; cx < side; cx++) {
                    const scy = y + cy - halfSide;
                    const scx = x + cx - halfSide;
                    if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                        const srcOff = scy * sw + scx;
                        const wt = weights[cy * side + cx];
                        a += mask[srcOff] * wt;
                    }
                }
            }
            maskResult[so] = a === 255 * 8 ? 255 : 0;
        }
    }
    return maskResult;
}
function dilateMask(mask, sw, sh) {
    const weights = [1, 1, 1, 1, 1, 1, 1, 1, 1];
    const side = Math.round(Math.sqrt(weights.length));
    const halfSide = Math.floor(side / 2);
    const maskResult = [];
    for (let y = 0; y < sh; y++) {
        for (let x = 0; x < sw; x++) {
            const so = y * sw + x;
            let a = 0;
            for (let cy = 0; cy < side; cy++) {
                for (let cx = 0; cx < side; cx++) {
                    const scy = y + cy - halfSide;
                    const scx = x + cx - halfSide;
                    if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                        const srcOff = scy * sw + scx;
                        const wt = weights[cy * side + cx];
                        a += mask[srcOff] * wt;
                    }
                }
            }
            maskResult[so] = a >= 255 * 4 ? 255 : 0;
        }
    }
    return maskResult;
}
function smoothEdgeMask(mask, sw, sh) {
    const weights = [
        1 / 9,
        1 / 9,
        1 / 9,
        1 / 9,
        1 / 9,
        1 / 9,
        1 / 9,
        1 / 9,
        1 / 9,
    ];
    const side = Math.round(Math.sqrt(weights.length));
    const halfSide = Math.floor(side / 2);
    const maskResult = [];
    for (let y = 0; y < sh; y++) {
        for (let x = 0; x < sw; x++) {
            const so = y * sw + x;
            let a = 0;
            for (let cy = 0; cy < side; cy++) {
                for (let cx = 0; cx < side; cx++) {
                    const scy = y + cy - halfSide;
                    const scx = x + cx - halfSide;
                    if (scy >= 0 && scy < sh && scx >= 0 && scx < sw) {
                        const srcOff = scy * sw + scx;
                        const wt = weights[cy * side + cx];
                        a += mask[srcOff] * wt;
                    }
                }
            }
            maskResult[so] = a;
        }
    }
    return maskResult;
}
const Mask = function (imageData) {
    const threshold = this.threshold();
    let mask = backgroundMask(imageData, threshold);
    if (mask) {
        mask = erodeMask(mask, imageData.width, imageData.height);
        mask = dilateMask(mask, imageData.width, imageData.height);
        mask = smoothEdgeMask(mask, imageData.width, imageData.height);
        applyMask(imageData, mask);
    }
    return imageData;
};
Factory.addGetterSetter(Node, 'threshold', 0, getNumberValidator(), Factory.afterSetFilter);

const Noise = function (imageData) {
    const amount = this.noise() * 255, data = imageData.data, nPixels = data.length, half = amount / 2;
    for (let i = 0; i < nPixels; i += 4) {
        data[i + 0] += half - 2 * half * Math.random();
        data[i + 1] += half - 2 * half * Math.random();
        data[i + 2] += half - 2 * half * Math.random();
    }
};
Factory.addGetterSetter(Node, 'noise', 0.2, getNumberValidator(), Factory.afterSetFilter);

const Pixelate = function (imageData) {
    let pixelSize = Math.ceil(this.pixelSize()), width = imageData.width, height = imageData.height, nBinsX = Math.ceil(width / pixelSize), nBinsY = Math.ceil(height / pixelSize), data = imageData.data;
    if (pixelSize <= 0) {
        Util.error('pixelSize value can not be <= 0');
        return;
    }
    for (let xBin = 0; xBin < nBinsX; xBin += 1) {
        for (let yBin = 0; yBin < nBinsY; yBin += 1) {
            let red = 0;
            let green = 0;
            let blue = 0;
            let alpha = 0;
            const xBinStart = xBin * pixelSize;
            const xBinEnd = xBinStart + pixelSize;
            const yBinStart = yBin * pixelSize;
            const yBinEnd = yBinStart + pixelSize;
            let pixelsInBin = 0;
            for (let x = xBinStart; x < xBinEnd; x += 1) {
                if (x >= width) {
                    continue;
                }
                for (let y = yBinStart; y < yBinEnd; y += 1) {
                    if (y >= height) {
                        continue;
                    }
                    const i = (width * y + x) * 4;
                    red += data[i + 0];
                    green += data[i + 1];
                    blue += data[i + 2];
                    alpha += data[i + 3];
                    pixelsInBin += 1;
                }
            }
            red = red / pixelsInBin;
            green = green / pixelsInBin;
            blue = blue / pixelsInBin;
            alpha = alpha / pixelsInBin;
            for (let x = xBinStart; x < xBinEnd; x += 1) {
                if (x >= width) {
                    continue;
                }
                for (let y = yBinStart; y < yBinEnd; y += 1) {
                    if (y >= height) {
                        continue;
                    }
                    const i = (width * y + x) * 4;
                    data[i + 0] = red;
                    data[i + 1] = green;
                    data[i + 2] = blue;
                    data[i + 3] = alpha;
                }
            }
        }
    }
};
Factory.addGetterSetter(Node, 'pixelSize', 8, getNumberValidator(), Factory.afterSetFilter);

const Posterize = function (imageData) {
    const levels = Math.round(this.levels() * 254) + 1, data = imageData.data, len = data.length, scale = 255 / levels;
    for (let i = 0; i < len; i += 1) {
        data[i] = Math.floor(data[i] / scale) * scale;
    }
};
Factory.addGetterSetter(Node, 'levels', 0.5, getNumberValidator(), Factory.afterSetFilter);

const RGB = function (imageData) {
    const data = imageData.data, nPixels = data.length, red = this.red(), green = this.green(), blue = this.blue();
    for (let i = 0; i < nPixels; i += 4) {
        const brightness = (0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2]) / 255;
        data[i] = brightness * red;
        data[i + 1] = brightness * green;
        data[i + 2] = brightness * blue;
        data[i + 3] = data[i + 3];
    }
};
Factory.addGetterSetter(Node, 'red', 0, function (val) {
    this._filterUpToDate = false;
    if (val > 255) {
        return 255;
    }
    else if (val < 0) {
        return 0;
    }
    else {
        return Math.round(val);
    }
});
Factory.addGetterSetter(Node, 'green', 0, function (val) {
    this._filterUpToDate = false;
    if (val > 255) {
        return 255;
    }
    else if (val < 0) {
        return 0;
    }
    else {
        return Math.round(val);
    }
});
Factory.addGetterSetter(Node, 'blue', 0, RGBComponent, Factory.afterSetFilter);

const RGBA = function (imageData) {
    const data = imageData.data, nPixels = data.length, red = this.red(), green = this.green(), blue = this.blue(), alpha = this.alpha();
    for (let i = 0; i < nPixels; i += 4) {
        const ia = 1 - alpha;
        data[i] = red * alpha + data[i] * ia;
        data[i + 1] = green * alpha + data[i + 1] * ia;
        data[i + 2] = blue * alpha + data[i + 2] * ia;
    }
};
Factory.addGetterSetter(Node, 'red', 0, function (val) {
    this._filterUpToDate = false;
    if (val > 255) {
        return 255;
    }
    else if (val < 0) {
        return 0;
    }
    else {
        return Math.round(val);
    }
});
Factory.addGetterSetter(Node, 'green', 0, function (val) {
    this._filterUpToDate = false;
    if (val > 255) {
        return 255;
    }
    else if (val < 0) {
        return 0;
    }
    else {
        return Math.round(val);
    }
});
Factory.addGetterSetter(Node, 'blue', 0, RGBComponent, Factory.afterSetFilter);
Factory.addGetterSetter(Node, 'alpha', 1, function (val) {
    this._filterUpToDate = false;
    if (val > 1) {
        return 1;
    }
    else if (val < 0) {
        return 0;
    }
    else {
        return val;
    }
});

const Sepia = function (imageData) {
    const data = imageData.data, nPixels = data.length;
    for (let i = 0; i < nPixels; i += 4) {
        const r = data[i + 0];
        const g = data[i + 1];
        const b = data[i + 2];
        data[i + 0] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
        data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
        data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
    }
};

const Solarize = function (imageData) {
    const threshold = 128;
    const d = imageData.data;
    for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        if (L >= threshold) {
            d[i] = 255 - r;
            d[i + 1] = 255 - g;
            d[i + 2] = 255 - b;
        }
    }
    return imageData;
};

const Threshold = function (imageData) {
    const level = this.threshold() * 255, data = imageData.data, len = data.length;
    for (let i = 0; i < len; i += 1) {
        data[i] = data[i] < level ? 0 : 255;
    }
};
Factory.addGetterSetter(Node, 'threshold', 0.5, getNumberValidator(), Factory.afterSetFilter);

const Konva = Konva$1.Util._assign(Konva$1, {
    Arc,
    Arrow,
    Circle: Circle$1,
    Ellipse,
    Image: Image$1,
    Label,
    Tag,
    Line: Line$1,
    Path,
    Rect: Rect$1,
    RegularPolygon,
    Ring,
    Sprite,
    Star,
    Text: Text$1,
    TextPath,
    Transformer,
    Wedge,
    Filters: {
        Blur,
        Brightness,
        Brighten,
        Contrast,
        Emboss,
        Enhance,
        Grayscale,
        HSL,
        HSV,
        Invert,
        Kaleidoscope,
        Mask,
        Noise,
        Pixelate,
        Posterize,
        RGB,
        RGBA,
        Sepia,
        Solarize,
        Threshold,
    },
});

var reactReconciler = {exports: {}};

var reactReconciler_production = {exports: {}};

var hasRequiredReactReconciler_production;

function requireReactReconciler_production () {
	if (hasRequiredReactReconciler_production) return reactReconciler_production.exports;
	hasRequiredReactReconciler_production = 1;
	(function (module) {
		/**
		 * @license React
		 * react-reconciler.production.js
		 *
		 * Copyright (c) Meta Platforms, Inc. and affiliates.
		 *
		 * This source code is licensed under the MIT license found in the
		 * LICENSE file in the root directory of this source tree.
		 */
		module.exports = function($$$config) {
		  function createFiber(tag, pendingProps, key, mode) {
		    return new FiberNode(tag, pendingProps, key, mode);
		  }
		  function noop() {
		  }
		  function formatProdErrorMessage(code) {
		    var url = "https://react.dev/errors/" + code;
		    if (1 < arguments.length) {
		      url += "?args[]=" + encodeURIComponent(arguments[1]);
		      for (var i = 2; i < arguments.length; i++)
		        url += "&args[]=" + encodeURIComponent(arguments[i]);
		    }
		    return "Minified React error #" + code + "; visit " + url + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
		  }
		  function getNearestMountedFiber(fiber) {
		    var node = fiber, nearestMounted = fiber;
		    if (fiber.alternate) for (; node.return; ) node = node.return;
		    else {
		      fiber = node;
		      do
		        node = fiber, 0 !== (node.flags & 4098) && (nearestMounted = node.return), fiber = node.return;
		      while (fiber);
		    }
		    return 3 === node.tag ? nearestMounted : null;
		  }
		  function assertIsMounted(fiber) {
		    if (getNearestMountedFiber(fiber) !== fiber)
		      throw Error(formatProdErrorMessage(188));
		  }
		  function findCurrentFiberUsingSlowPath(fiber) {
		    var alternate = fiber.alternate;
		    if (!alternate) {
		      alternate = getNearestMountedFiber(fiber);
		      if (null === alternate) throw Error(formatProdErrorMessage(188));
		      return alternate !== fiber ? null : fiber;
		    }
		    for (var a = fiber, b = alternate; ; ) {
		      var parentA = a.return;
		      if (null === parentA) break;
		      var parentB = parentA.alternate;
		      if (null === parentB) {
		        b = parentA.return;
		        if (null !== b) {
		          a = b;
		          continue;
		        }
		        break;
		      }
		      if (parentA.child === parentB.child) {
		        for (parentB = parentA.child; parentB; ) {
		          if (parentB === a) return assertIsMounted(parentA), fiber;
		          if (parentB === b) return assertIsMounted(parentA), alternate;
		          parentB = parentB.sibling;
		        }
		        throw Error(formatProdErrorMessage(188));
		      }
		      if (a.return !== b.return) a = parentA, b = parentB;
		      else {
		        for (var didFindChild = false, child$0 = parentA.child; child$0; ) {
		          if (child$0 === a) {
		            didFindChild = true;
		            a = parentA;
		            b = parentB;
		            break;
		          }
		          if (child$0 === b) {
		            didFindChild = true;
		            b = parentA;
		            a = parentB;
		            break;
		          }
		          child$0 = child$0.sibling;
		        }
		        if (!didFindChild) {
		          for (child$0 = parentB.child; child$0; ) {
		            if (child$0 === a) {
		              didFindChild = true;
		              a = parentB;
		              b = parentA;
		              break;
		            }
		            if (child$0 === b) {
		              didFindChild = true;
		              b = parentB;
		              a = parentA;
		              break;
		            }
		            child$0 = child$0.sibling;
		          }
		          if (!didFindChild) throw Error(formatProdErrorMessage(189));
		        }
		      }
		      if (a.alternate !== b) throw Error(formatProdErrorMessage(190));
		    }
		    if (3 !== a.tag) throw Error(formatProdErrorMessage(188));
		    return a.stateNode.current === a ? fiber : alternate;
		  }
		  function findCurrentHostFiberImpl(node) {
		    var tag = node.tag;
		    if (5 === tag || 26 === tag || 27 === tag || 6 === tag) return node;
		    for (node = node.child; null !== node; ) {
		      tag = findCurrentHostFiberImpl(node);
		      if (null !== tag) return tag;
		      node = node.sibling;
		    }
		    return null;
		  }
		  function findCurrentHostFiberWithNoPortalsImpl(node) {
		    var tag = node.tag;
		    if (5 === tag || 26 === tag || 27 === tag || 6 === tag) return node;
		    for (node = node.child; null !== node; ) {
		      if (4 !== node.tag && (tag = findCurrentHostFiberWithNoPortalsImpl(node), null !== tag))
		        return tag;
		      node = node.sibling;
		    }
		    return null;
		  }
		  function getIteratorFn(maybeIterable) {
		    if (null === maybeIterable || "object" !== typeof maybeIterable)
		      return null;
		    maybeIterable = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable["@@iterator"];
		    return "function" === typeof maybeIterable ? maybeIterable : null;
		  }
		  function getComponentNameFromType(type) {
		    if (null == type) return null;
		    if ("function" === typeof type)
		      return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
		    if ("string" === typeof type) return type;
		    switch (type) {
		      case REACT_FRAGMENT_TYPE:
		        return "Fragment";
		      case REACT_PROFILER_TYPE:
		        return "Profiler";
		      case REACT_STRICT_MODE_TYPE:
		        return "StrictMode";
		      case REACT_SUSPENSE_TYPE:
		        return "Suspense";
		      case REACT_SUSPENSE_LIST_TYPE:
		        return "SuspenseList";
		      case REACT_ACTIVITY_TYPE:
		        return "Activity";
		    }
		    if ("object" === typeof type)
		      switch (type.$$typeof) {
		        case REACT_PORTAL_TYPE:
		          return "Portal";
		        case REACT_CONTEXT_TYPE:
		          return type.displayName || "Context";
		        case REACT_CONSUMER_TYPE:
		          return (type._context.displayName || "Context") + ".Consumer";
		        case REACT_FORWARD_REF_TYPE:
		          var innerType = type.render;
		          type = type.displayName;
		          type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
		          return type;
		        case REACT_MEMO_TYPE:
		          return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
		        case REACT_LAZY_TYPE:
		          innerType = type._payload;
		          type = type._init;
		          try {
		            return getComponentNameFromType(type(innerType));
		          } catch (x) {
		          }
		      }
		    return null;
		  }
		  function createCursor(defaultValue) {
		    return { current: defaultValue };
		  }
		  function pop(cursor) {
		    0 > index$jscomp$0 || (cursor.current = valueStack[index$jscomp$0], valueStack[index$jscomp$0] = null, index$jscomp$0--);
		  }
		  function push(cursor, value) {
		    index$jscomp$0++;
		    valueStack[index$jscomp$0] = cursor.current;
		    cursor.current = value;
		  }
		  function clz32Fallback(x) {
		    x >>>= 0;
		    return 0 === x ? 32 : 31 - (log$1(x) / LN2 | 0) | 0;
		  }
		  function getHighestPriorityLanes(lanes) {
		    var pendingSyncLanes = lanes & 42;
		    if (0 !== pendingSyncLanes) return pendingSyncLanes;
		    switch (lanes & -lanes) {
		      case 1:
		        return 1;
		      case 2:
		        return 2;
		      case 4:
		        return 4;
		      case 8:
		        return 8;
		      case 16:
		        return 16;
		      case 32:
		        return 32;
		      case 64:
		        return 64;
		      case 128:
		        return 128;
		      case 256:
		      case 512:
		      case 1024:
		      case 2048:
		      case 4096:
		      case 8192:
		      case 16384:
		      case 32768:
		      case 65536:
		      case 131072:
		        return lanes & 261888;
		      case 262144:
		      case 524288:
		      case 1048576:
		      case 2097152:
		        return lanes & 3932160;
		      case 4194304:
		      case 8388608:
		      case 16777216:
		      case 33554432:
		        return lanes & 62914560;
		      case 67108864:
		        return 67108864;
		      case 134217728:
		        return 134217728;
		      case 268435456:
		        return 268435456;
		      case 536870912:
		        return 536870912;
		      case 1073741824:
		        return 0;
		      default:
		        return lanes;
		    }
		  }
		  function getNextLanes(root, wipLanes, rootHasPendingCommit) {
		    var pendingLanes = root.pendingLanes;
		    if (0 === pendingLanes) return 0;
		    var nextLanes = 0, suspendedLanes = root.suspendedLanes, pingedLanes = root.pingedLanes;
		    root = root.warmLanes;
		    var nonIdlePendingLanes = pendingLanes & 134217727;
		    0 !== nonIdlePendingLanes ? (pendingLanes = nonIdlePendingLanes & ~suspendedLanes, 0 !== pendingLanes ? nextLanes = getHighestPriorityLanes(pendingLanes) : (pingedLanes &= nonIdlePendingLanes, 0 !== pingedLanes ? nextLanes = getHighestPriorityLanes(pingedLanes) : rootHasPendingCommit || (rootHasPendingCommit = nonIdlePendingLanes & ~root, 0 !== rootHasPendingCommit && (nextLanes = getHighestPriorityLanes(rootHasPendingCommit))))) : (nonIdlePendingLanes = pendingLanes & ~suspendedLanes, 0 !== nonIdlePendingLanes ? nextLanes = getHighestPriorityLanes(nonIdlePendingLanes) : 0 !== pingedLanes ? nextLanes = getHighestPriorityLanes(pingedLanes) : rootHasPendingCommit || (rootHasPendingCommit = pendingLanes & ~root, 0 !== rootHasPendingCommit && (nextLanes = getHighestPriorityLanes(rootHasPendingCommit))));
		    return 0 === nextLanes ? 0 : 0 !== wipLanes && wipLanes !== nextLanes && 0 === (wipLanes & suspendedLanes) && (suspendedLanes = nextLanes & -nextLanes, rootHasPendingCommit = wipLanes & -wipLanes, suspendedLanes >= rootHasPendingCommit || 32 === suspendedLanes && 0 !== (rootHasPendingCommit & 4194048)) ? wipLanes : nextLanes;
		  }
		  function checkIfRootIsPrerendering(root, renderLanes2) {
		    return 0 === (root.pendingLanes & ~(root.suspendedLanes & ~root.pingedLanes) & renderLanes2);
		  }
		  function computeExpirationTime(lane, currentTime) {
		    switch (lane) {
		      case 1:
		      case 2:
		      case 4:
		      case 8:
		      case 64:
		        return currentTime + 250;
		      case 16:
		      case 32:
		      case 128:
		      case 256:
		      case 512:
		      case 1024:
		      case 2048:
		      case 4096:
		      case 8192:
		      case 16384:
		      case 32768:
		      case 65536:
		      case 131072:
		      case 262144:
		      case 524288:
		      case 1048576:
		      case 2097152:
		        return currentTime + 5e3;
		      case 4194304:
		      case 8388608:
		      case 16777216:
		      case 33554432:
		        return -1;
		      case 67108864:
		      case 134217728:
		      case 268435456:
		      case 536870912:
		      case 1073741824:
		        return -1;
		      default:
		        return -1;
		    }
		  }
		  function claimNextRetryLane() {
		    var lane = nextRetryLane;
		    nextRetryLane <<= 1;
		    0 === (nextRetryLane & 62914560) && (nextRetryLane = 4194304);
		    return lane;
		  }
		  function createLaneMap(initial) {
		    for (var laneMap = [], i = 0; 31 > i; i++) laneMap.push(initial);
		    return laneMap;
		  }
		  function markRootUpdated$1(root, updateLane) {
		    root.pendingLanes |= updateLane;
		    268435456 !== updateLane && (root.suspendedLanes = 0, root.pingedLanes = 0, root.warmLanes = 0);
		  }
		  function markRootFinished(root, finishedLanes, remainingLanes, spawnedLane, updatedLanes, suspendedRetryLanes) {
		    var previouslyPendingLanes = root.pendingLanes;
		    root.pendingLanes = remainingLanes;
		    root.suspendedLanes = 0;
		    root.pingedLanes = 0;
		    root.warmLanes = 0;
		    root.expiredLanes &= remainingLanes;
		    root.entangledLanes &= remainingLanes;
		    root.errorRecoveryDisabledLanes &= remainingLanes;
		    root.shellSuspendCounter = 0;
		    var entanglements = root.entanglements, expirationTimes = root.expirationTimes, hiddenUpdates = root.hiddenUpdates;
		    for (remainingLanes = previouslyPendingLanes & ~remainingLanes; 0 < remainingLanes; ) {
		      var index$5 = 31 - clz32(remainingLanes), lane = 1 << index$5;
		      entanglements[index$5] = 0;
		      expirationTimes[index$5] = -1;
		      var hiddenUpdatesForLane = hiddenUpdates[index$5];
		      if (null !== hiddenUpdatesForLane)
		        for (hiddenUpdates[index$5] = null, index$5 = 0; index$5 < hiddenUpdatesForLane.length; index$5++) {
		          var update = hiddenUpdatesForLane[index$5];
		          null !== update && (update.lane &= -536870913);
		        }
		      remainingLanes &= ~lane;
		    }
		    0 !== spawnedLane && markSpawnedDeferredLane(root, spawnedLane, 0);
		    0 !== suspendedRetryLanes && 0 === updatedLanes && 0 !== root.tag && (root.suspendedLanes |= suspendedRetryLanes & ~(previouslyPendingLanes & ~finishedLanes));
		  }
		  function markSpawnedDeferredLane(root, spawnedLane, entangledLanes) {
		    root.pendingLanes |= spawnedLane;
		    root.suspendedLanes &= ~spawnedLane;
		    var spawnedLaneIndex = 31 - clz32(spawnedLane);
		    root.entangledLanes |= spawnedLane;
		    root.entanglements[spawnedLaneIndex] = root.entanglements[spawnedLaneIndex] | 1073741824 | entangledLanes & 261930;
		  }
		  function markRootEntangled(root, entangledLanes) {
		    var rootEntangledLanes = root.entangledLanes |= entangledLanes;
		    for (root = root.entanglements; rootEntangledLanes; ) {
		      var index$6 = 31 - clz32(rootEntangledLanes), lane = 1 << index$6;
		      lane & entangledLanes | root[index$6] & entangledLanes && (root[index$6] |= entangledLanes);
		      rootEntangledLanes &= ~lane;
		    }
		  }
		  function getBumpedLaneForHydration(root, renderLanes2) {
		    var renderLane = renderLanes2 & -renderLanes2;
		    renderLane = 0 !== (renderLane & 42) ? 1 : getBumpedLaneForHydrationByLane(renderLane);
		    return 0 !== (renderLane & (root.suspendedLanes | renderLanes2)) ? 0 : renderLane;
		  }
		  function getBumpedLaneForHydrationByLane(lane) {
		    switch (lane) {
		      case 2:
		        lane = 1;
		        break;
		      case 8:
		        lane = 4;
		        break;
		      case 32:
		        lane = 16;
		        break;
		      case 256:
		      case 512:
		      case 1024:
		      case 2048:
		      case 4096:
		      case 8192:
		      case 16384:
		      case 32768:
		      case 65536:
		      case 131072:
		      case 262144:
		      case 524288:
		      case 1048576:
		      case 2097152:
		      case 4194304:
		      case 8388608:
		      case 16777216:
		      case 33554432:
		        lane = 128;
		        break;
		      case 268435456:
		        lane = 134217728;
		        break;
		      default:
		        lane = 0;
		    }
		    return lane;
		  }
		  function lanesToEventPriority(lanes) {
		    lanes &= -lanes;
		    return 2 < lanes ? 8 < lanes ? 0 !== (lanes & 134217727) ? 32 : 268435456 : 8 : 2;
		  }
		  function setIsStrictModeForDevtools(newIsStrictMode) {
		    "function" === typeof log && unstable_setDisableYieldValue(newIsStrictMode);
		    if (injectedHook && "function" === typeof injectedHook.setStrictMode)
		      try {
		        injectedHook.setStrictMode(rendererID, newIsStrictMode);
		      } catch (err) {
		      }
		  }
		  function is(x, y) {
		    return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
		  }
		  function describeBuiltInComponentFrame(name) {
		    if (void 0 === prefix)
		      try {
		        throw Error();
		      } catch (x) {
		        var match = x.stack.trim().match(/\n( *(at )?)/);
		        prefix = match && match[1] || "";
		        suffix = -1 < x.stack.indexOf("\n    at") ? " (<anonymous>)" : -1 < x.stack.indexOf("@") ? "@unknown:0:0" : "";
		      }
		    return "\n" + prefix + name + suffix;
		  }
		  function describeNativeComponentFrame(fn, construct) {
		    if (!fn || reentry) return "";
		    reentry = true;
		    var previousPrepareStackTrace = Error.prepareStackTrace;
		    Error.prepareStackTrace = void 0;
		    try {
		      var RunInRootFrame = {
		        DetermineComponentFrameRoot: function() {
		          try {
		            if (construct) {
		              var Fake = function() {
		                throw Error();
		              };
		              Object.defineProperty(Fake.prototype, "props", {
		                set: function() {
		                  throw Error();
		                }
		              });
		              if ("object" === typeof Reflect && Reflect.construct) {
		                try {
		                  Reflect.construct(Fake, []);
		                } catch (x) {
		                  var control = x;
		                }
		                Reflect.construct(fn, [], Fake);
		              } else {
		                try {
		                  Fake.call();
		                } catch (x$8) {
		                  control = x$8;
		                }
		                fn.call(Fake.prototype);
		              }
		            } else {
		              try {
		                throw Error();
		              } catch (x$9) {
		                control = x$9;
		              }
		              (Fake = fn()) && "function" === typeof Fake.catch && Fake.catch(function() {
		              });
		            }
		          } catch (sample) {
		            if (sample && control && "string" === typeof sample.stack)
		              return [sample.stack, control.stack];
		          }
		          return [null, null];
		        }
		      };
		      RunInRootFrame.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
		      var namePropDescriptor = Object.getOwnPropertyDescriptor(
		        RunInRootFrame.DetermineComponentFrameRoot,
		        "name"
		      );
		      namePropDescriptor && namePropDescriptor.configurable && Object.defineProperty(
		        RunInRootFrame.DetermineComponentFrameRoot,
		        "name",
		        { value: "DetermineComponentFrameRoot" }
		      );
		      var _RunInRootFrame$Deter = RunInRootFrame.DetermineComponentFrameRoot(), sampleStack = _RunInRootFrame$Deter[0], controlStack = _RunInRootFrame$Deter[1];
		      if (sampleStack && controlStack) {
		        var sampleLines = sampleStack.split("\n"), controlLines = controlStack.split("\n");
		        for (namePropDescriptor = RunInRootFrame = 0; RunInRootFrame < sampleLines.length && !sampleLines[RunInRootFrame].includes("DetermineComponentFrameRoot"); )
		          RunInRootFrame++;
		        for (; namePropDescriptor < controlLines.length && !controlLines[namePropDescriptor].includes(
		          "DetermineComponentFrameRoot"
		        ); )
		          namePropDescriptor++;
		        if (RunInRootFrame === sampleLines.length || namePropDescriptor === controlLines.length)
		          for (RunInRootFrame = sampleLines.length - 1, namePropDescriptor = controlLines.length - 1; 1 <= RunInRootFrame && 0 <= namePropDescriptor && sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]; )
		            namePropDescriptor--;
		        for (; 1 <= RunInRootFrame && 0 <= namePropDescriptor; RunInRootFrame--, namePropDescriptor--)
		          if (sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
		            if (1 !== RunInRootFrame || 1 !== namePropDescriptor) {
		              do
		                if (RunInRootFrame--, namePropDescriptor--, 0 > namePropDescriptor || sampleLines[RunInRootFrame] !== controlLines[namePropDescriptor]) {
		                  var frame = "\n" + sampleLines[RunInRootFrame].replace(" at new ", " at ");
		                  fn.displayName && frame.includes("<anonymous>") && (frame = frame.replace("<anonymous>", fn.displayName));
		                  return frame;
		                }
		              while (1 <= RunInRootFrame && 0 <= namePropDescriptor);
		            }
		            break;
		          }
		      }
		    } finally {
		      reentry = false, Error.prepareStackTrace = previousPrepareStackTrace;
		    }
		    return (previousPrepareStackTrace = fn ? fn.displayName || fn.name : "") ? describeBuiltInComponentFrame(previousPrepareStackTrace) : "";
		  }
		  function describeFiber(fiber, childFiber) {
		    switch (fiber.tag) {
		      case 26:
		      case 27:
		      case 5:
		        return describeBuiltInComponentFrame(fiber.type);
		      case 16:
		        return describeBuiltInComponentFrame("Lazy");
		      case 13:
		        return fiber.child !== childFiber && null !== childFiber ? describeBuiltInComponentFrame("Suspense Fallback") : describeBuiltInComponentFrame("Suspense");
		      case 19:
		        return describeBuiltInComponentFrame("SuspenseList");
		      case 0:
		      case 15:
		        return describeNativeComponentFrame(fiber.type, false);
		      case 11:
		        return describeNativeComponentFrame(fiber.type.render, false);
		      case 1:
		        return describeNativeComponentFrame(fiber.type, true);
		      case 31:
		        return describeBuiltInComponentFrame("Activity");
		      default:
		        return "";
		    }
		  }
		  function getStackByFiberInDevAndProd(workInProgress2) {
		    try {
		      var info = "", previous = null;
		      do
		        info += describeFiber(workInProgress2, previous), previous = workInProgress2, workInProgress2 = workInProgress2.return;
		      while (workInProgress2);
		      return info;
		    } catch (x) {
		      return "\nError generating stack: " + x.message + "\n" + x.stack;
		    }
		  }
		  function createCapturedValueAtFiber(value, source) {
		    if ("object" === typeof value && null !== value) {
		      var existing = CapturedStacks.get(value);
		      if (void 0 !== existing) return existing;
		      source = {
		        value,
		        source,
		        stack: getStackByFiberInDevAndProd(source)
		      };
		      CapturedStacks.set(value, source);
		      return source;
		    }
		    return {
		      value,
		      source,
		      stack: getStackByFiberInDevAndProd(source)
		    };
		  }
		  function pushTreeFork(workInProgress2, totalChildren) {
		    forkStack[forkStackIndex++] = treeForkCount;
		    forkStack[forkStackIndex++] = treeForkProvider;
		    treeForkProvider = workInProgress2;
		    treeForkCount = totalChildren;
		  }
		  function pushTreeId(workInProgress2, totalChildren, index) {
		    idStack[idStackIndex++] = treeContextId;
		    idStack[idStackIndex++] = treeContextOverflow;
		    idStack[idStackIndex++] = treeContextProvider;
		    treeContextProvider = workInProgress2;
		    var baseIdWithLeadingBit = treeContextId;
		    workInProgress2 = treeContextOverflow;
		    var baseLength = 32 - clz32(baseIdWithLeadingBit) - 1;
		    baseIdWithLeadingBit &= ~(1 << baseLength);
		    index += 1;
		    var length = 32 - clz32(totalChildren) + baseLength;
		    if (30 < length) {
		      var numberOfOverflowBits = baseLength - baseLength % 5;
		      length = (baseIdWithLeadingBit & (1 << numberOfOverflowBits) - 1).toString(32);
		      baseIdWithLeadingBit >>= numberOfOverflowBits;
		      baseLength -= numberOfOverflowBits;
		      treeContextId = 1 << 32 - clz32(totalChildren) + baseLength | index << baseLength | baseIdWithLeadingBit;
		      treeContextOverflow = length + workInProgress2;
		    } else
		      treeContextId = 1 << length | index << baseLength | baseIdWithLeadingBit, treeContextOverflow = workInProgress2;
		  }
		  function pushMaterializedTreeId(workInProgress2) {
		    null !== workInProgress2.return && (pushTreeFork(workInProgress2, 1), pushTreeId(workInProgress2, 1, 0));
		  }
		  function popTreeContext(workInProgress2) {
		    for (; workInProgress2 === treeForkProvider; )
		      treeForkProvider = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null, treeForkCount = forkStack[--forkStackIndex], forkStack[forkStackIndex] = null;
		    for (; workInProgress2 === treeContextProvider; )
		      treeContextProvider = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextOverflow = idStack[--idStackIndex], idStack[idStackIndex] = null, treeContextId = idStack[--idStackIndex], idStack[idStackIndex] = null;
		  }
		  function restoreSuspendedTreeContext(workInProgress2, suspendedContext) {
		    idStack[idStackIndex++] = treeContextId;
		    idStack[idStackIndex++] = treeContextOverflow;
		    idStack[idStackIndex++] = treeContextProvider;
		    treeContextId = suspendedContext.id;
		    treeContextOverflow = suspendedContext.overflow;
		    treeContextProvider = workInProgress2;
		  }
		  function pushHostContainer(fiber, nextRootInstance) {
		    push(rootInstanceStackCursor, nextRootInstance);
		    push(contextFiberStackCursor, fiber);
		    push(contextStackCursor, null);
		    fiber = getRootHostContext(nextRootInstance);
		    pop(contextStackCursor);
		    push(contextStackCursor, fiber);
		  }
		  function popHostContainer() {
		    pop(contextStackCursor);
		    pop(contextFiberStackCursor);
		    pop(rootInstanceStackCursor);
		  }
		  function pushHostContext(fiber) {
		    null !== fiber.memoizedState && push(hostTransitionProviderCursor, fiber);
		    var context = contextStackCursor.current, nextContext = getChildHostContext(context, fiber.type);
		    context !== nextContext && (push(contextFiberStackCursor, fiber), push(contextStackCursor, nextContext));
		  }
		  function popHostContext(fiber) {
		    contextFiberStackCursor.current === fiber && (pop(contextStackCursor), pop(contextFiberStackCursor));
		    hostTransitionProviderCursor.current === fiber && (pop(hostTransitionProviderCursor), isPrimaryRenderer ? HostTransitionContext._currentValue = NotPendingTransition : HostTransitionContext._currentValue2 = NotPendingTransition);
		  }
		  function throwOnHydrationMismatch(fiber) {
		    var error = Error(
		      formatProdErrorMessage(
		        418,
		        1 < arguments.length && void 0 !== arguments[1] && arguments[1] ? "text" : "HTML",
		        ""
		      )
		    );
		    queueHydrationError(createCapturedValueAtFiber(error, fiber));
		    throw HydrationMismatchException;
		  }
		  function prepareToHydrateHostInstance(fiber, hostContext) {
		    if (!supportsHydration) throw Error(formatProdErrorMessage(175));
		    hydrateInstance(
		      fiber.stateNode,
		      fiber.type,
		      fiber.memoizedProps,
		      hostContext,
		      fiber
		    ) || throwOnHydrationMismatch(fiber, true);
		  }
		  function popToNextHostParent(fiber) {
		    for (hydrationParentFiber = fiber.return; hydrationParentFiber; )
		      switch (hydrationParentFiber.tag) {
		        case 5:
		        case 31:
		        case 13:
		          rootOrSingletonContext = false;
		          return;
		        case 27:
		        case 3:
		          rootOrSingletonContext = true;
		          return;
		        default:
		          hydrationParentFiber = hydrationParentFiber.return;
		      }
		  }
		  function popHydrationState(fiber) {
		    if (!supportsHydration || fiber !== hydrationParentFiber) return false;
		    if (!isHydrating) return popToNextHostParent(fiber), isHydrating = true, false;
		    var tag = fiber.tag;
		    supportsSingletons ? 3 !== tag && 27 !== tag && (5 !== tag || shouldDeleteUnhydratedTailInstances(fiber.type) && !shouldSetTextContent(fiber.type, fiber.memoizedProps)) && nextHydratableInstance && throwOnHydrationMismatch(fiber) : 3 !== tag && (5 !== tag || shouldDeleteUnhydratedTailInstances(fiber.type) && !shouldSetTextContent(fiber.type, fiber.memoizedProps)) && nextHydratableInstance && throwOnHydrationMismatch(fiber);
		    popToNextHostParent(fiber);
		    if (13 === tag) {
		      if (!supportsHydration) throw Error(formatProdErrorMessage(316));
		      fiber = fiber.memoizedState;
		      fiber = null !== fiber ? fiber.dehydrated : null;
		      if (!fiber) throw Error(formatProdErrorMessage(317));
		      nextHydratableInstance = getNextHydratableInstanceAfterSuspenseInstance(fiber);
		    } else if (31 === tag) {
		      fiber = fiber.memoizedState;
		      fiber = null !== fiber ? fiber.dehydrated : null;
		      if (!fiber) throw Error(formatProdErrorMessage(317));
		      nextHydratableInstance = getNextHydratableInstanceAfterActivityInstance(fiber);
		    } else
		      nextHydratableInstance = supportsSingletons && 27 === tag ? getNextHydratableSiblingAfterSingleton(
		        fiber.type,
		        nextHydratableInstance
		      ) : hydrationParentFiber ? getNextHydratableSibling(fiber.stateNode) : null;
		    return true;
		  }
		  function resetHydrationState() {
		    supportsHydration && (nextHydratableInstance = hydrationParentFiber = null, isHydrating = false);
		  }
		  function upgradeHydrationErrorsToRecoverable() {
		    var queuedErrors = hydrationErrors;
		    null !== queuedErrors && (null === workInProgressRootRecoverableErrors ? workInProgressRootRecoverableErrors = queuedErrors : workInProgressRootRecoverableErrors.push.apply(
		      workInProgressRootRecoverableErrors,
		      queuedErrors
		    ), hydrationErrors = null);
		    return queuedErrors;
		  }
		  function queueHydrationError(error) {
		    null === hydrationErrors ? hydrationErrors = [error] : hydrationErrors.push(error);
		  }
		  function pushProvider(providerFiber, context, nextValue) {
		    isPrimaryRenderer ? (push(valueCursor, context._currentValue), context._currentValue = nextValue) : (push(valueCursor, context._currentValue2), context._currentValue2 = nextValue);
		  }
		  function popProvider(context) {
		    var currentValue = valueCursor.current;
		    isPrimaryRenderer ? context._currentValue = currentValue : context._currentValue2 = currentValue;
		    pop(valueCursor);
		  }
		  function scheduleContextWorkOnParentPath(parent, renderLanes2, propagationRoot) {
		    for (; null !== parent; ) {
		      var alternate = parent.alternate;
		      (parent.childLanes & renderLanes2) !== renderLanes2 ? (parent.childLanes |= renderLanes2, null !== alternate && (alternate.childLanes |= renderLanes2)) : null !== alternate && (alternate.childLanes & renderLanes2) !== renderLanes2 && (alternate.childLanes |= renderLanes2);
		      if (parent === propagationRoot) break;
		      parent = parent.return;
		    }
		  }
		  function propagateContextChanges(workInProgress2, contexts, renderLanes2, forcePropagateEntireTree) {
		    var fiber = workInProgress2.child;
		    null !== fiber && (fiber.return = workInProgress2);
		    for (; null !== fiber; ) {
		      var list = fiber.dependencies;
		      if (null !== list) {
		        var nextFiber = fiber.child;
		        list = list.firstContext;
		        a: for (; null !== list; ) {
		          var dependency = list;
		          list = fiber;
		          for (var i = 0; i < contexts.length; i++)
		            if (dependency.context === contexts[i]) {
		              list.lanes |= renderLanes2;
		              dependency = list.alternate;
		              null !== dependency && (dependency.lanes |= renderLanes2);
		              scheduleContextWorkOnParentPath(
		                list.return,
		                renderLanes2,
		                workInProgress2
		              );
		              forcePropagateEntireTree || (nextFiber = null);
		              break a;
		            }
		          list = dependency.next;
		        }
		      } else if (18 === fiber.tag) {
		        nextFiber = fiber.return;
		        if (null === nextFiber) throw Error(formatProdErrorMessage(341));
		        nextFiber.lanes |= renderLanes2;
		        list = nextFiber.alternate;
		        null !== list && (list.lanes |= renderLanes2);
		        scheduleContextWorkOnParentPath(nextFiber, renderLanes2, workInProgress2);
		        nextFiber = null;
		      } else nextFiber = fiber.child;
		      if (null !== nextFiber) nextFiber.return = fiber;
		      else
		        for (nextFiber = fiber; null !== nextFiber; ) {
		          if (nextFiber === workInProgress2) {
		            nextFiber = null;
		            break;
		          }
		          fiber = nextFiber.sibling;
		          if (null !== fiber) {
		            fiber.return = nextFiber.return;
		            nextFiber = fiber;
		            break;
		          }
		          nextFiber = nextFiber.return;
		        }
		      fiber = nextFiber;
		    }
		  }
		  function propagateParentContextChanges(current, workInProgress2, renderLanes2, forcePropagateEntireTree) {
		    current = null;
		    for (var parent = workInProgress2, isInsidePropagationBailout = false; null !== parent; ) {
		      if (!isInsidePropagationBailout) {
		        if (0 !== (parent.flags & 524288)) isInsidePropagationBailout = true;
		        else if (0 !== (parent.flags & 262144)) break;
		      }
		      if (10 === parent.tag) {
		        var currentParent = parent.alternate;
		        if (null === currentParent) throw Error(formatProdErrorMessage(387));
		        currentParent = currentParent.memoizedProps;
		        if (null !== currentParent) {
		          var context = parent.type;
		          objectIs(parent.pendingProps.value, currentParent.value) || (null !== current ? current.push(context) : current = [context]);
		        }
		      } else if (parent === hostTransitionProviderCursor.current) {
		        currentParent = parent.alternate;
		        if (null === currentParent) throw Error(formatProdErrorMessage(387));
		        currentParent.memoizedState.memoizedState !== parent.memoizedState.memoizedState && (null !== current ? current.push(HostTransitionContext) : current = [HostTransitionContext]);
		      }
		      parent = parent.return;
		    }
		    null !== current && propagateContextChanges(
		      workInProgress2,
		      current,
		      renderLanes2,
		      forcePropagateEntireTree
		    );
		    workInProgress2.flags |= 262144;
		  }
		  function checkIfContextChanged(currentDependencies) {
		    for (currentDependencies = currentDependencies.firstContext; null !== currentDependencies; ) {
		      var context = currentDependencies.context;
		      if (!objectIs(
		        isPrimaryRenderer ? context._currentValue : context._currentValue2,
		        currentDependencies.memoizedValue
		      ))
		        return true;
		      currentDependencies = currentDependencies.next;
		    }
		    return false;
		  }
		  function prepareToReadContext(workInProgress2) {
		    currentlyRenderingFiber$1 = workInProgress2;
		    lastContextDependency = null;
		    workInProgress2 = workInProgress2.dependencies;
		    null !== workInProgress2 && (workInProgress2.firstContext = null);
		  }
		  function readContext(context) {
		    return readContextForConsumer(currentlyRenderingFiber$1, context);
		  }
		  function readContextDuringReconciliation(consumer, context) {
		    null === currentlyRenderingFiber$1 && prepareToReadContext(consumer);
		    return readContextForConsumer(consumer, context);
		  }
		  function readContextForConsumer(consumer, context) {
		    var value = isPrimaryRenderer ? context._currentValue : context._currentValue2;
		    context = { context, memoizedValue: value, next: null };
		    if (null === lastContextDependency) {
		      if (null === consumer) throw Error(formatProdErrorMessage(308));
		      lastContextDependency = context;
		      consumer.dependencies = { lanes: 0, firstContext: context };
		      consumer.flags |= 524288;
		    } else lastContextDependency = lastContextDependency.next = context;
		    return value;
		  }
		  function createCache() {
		    return {
		      controller: new AbortControllerLocal(),
		      data: /* @__PURE__ */ new Map(),
		      refCount: 0
		    };
		  }
		  function releaseCache(cache) {
		    cache.refCount--;
		    0 === cache.refCount && scheduleCallback$2(NormalPriority, function() {
		      cache.controller.abort();
		    });
		  }
		  function noop$1() {
		  }
		  function ensureRootIsScheduled(root) {
		    root !== lastScheduledRoot && null === root.next && (null === lastScheduledRoot ? firstScheduledRoot = lastScheduledRoot = root : lastScheduledRoot = lastScheduledRoot.next = root);
		    mightHavePendingSyncWork = true;
		    didScheduleMicrotask || (didScheduleMicrotask = true, scheduleImmediateRootScheduleTask());
		  }
		  function flushSyncWorkAcrossRoots_impl(syncTransitionLanes, onlyLegacy) {
		    if (!isFlushingWork && mightHavePendingSyncWork) {
		      isFlushingWork = true;
		      do {
		        var didPerformSomeWork = false;
		        for (var root = firstScheduledRoot; null !== root; ) {
		          if (0 !== syncTransitionLanes) {
		              var pendingLanes = root.pendingLanes;
		              if (0 === pendingLanes) var JSCompiler_inline_result = 0;
		              else {
		                var suspendedLanes = root.suspendedLanes, pingedLanes = root.pingedLanes;
		                JSCompiler_inline_result = (1 << 31 - clz32(42 | syncTransitionLanes) + 1) - 1;
		                JSCompiler_inline_result &= pendingLanes & ~(suspendedLanes & ~pingedLanes);
		                JSCompiler_inline_result = JSCompiler_inline_result & 201326741 ? JSCompiler_inline_result & 201326741 | 1 : JSCompiler_inline_result ? JSCompiler_inline_result | 2 : 0;
		              }
		              0 !== JSCompiler_inline_result && (didPerformSomeWork = true, performSyncWorkOnRoot(root, JSCompiler_inline_result));
		            } else
		              JSCompiler_inline_result = workInProgressRootRenderLanes, JSCompiler_inline_result = getNextLanes(
		                root,
		                root === workInProgressRoot ? JSCompiler_inline_result : 0,
		                null !== root.cancelPendingCommit || root.timeoutHandle !== noTimeout
		              ), 0 === (JSCompiler_inline_result & 3) || checkIfRootIsPrerendering(root, JSCompiler_inline_result) || (didPerformSomeWork = true, performSyncWorkOnRoot(root, JSCompiler_inline_result));
		          root = root.next;
		        }
		      } while (didPerformSomeWork);
		      isFlushingWork = false;
		    }
		  }
		  function processRootScheduleInImmediateTask() {
		    processRootScheduleInMicrotask();
		  }
		  function processRootScheduleInMicrotask() {
		    mightHavePendingSyncWork = didScheduleMicrotask = false;
		    var syncTransitionLanes = 0;
		    0 !== currentEventTransitionLane && shouldAttemptEagerTransition() && (syncTransitionLanes = currentEventTransitionLane);
		    for (var currentTime = now(), prev = null, root = firstScheduledRoot; null !== root; ) {
		      var next = root.next, nextLanes = scheduleTaskForRootDuringMicrotask(root, currentTime);
		      if (0 === nextLanes)
		        root.next = null, null === prev ? firstScheduledRoot = next : prev.next = next, null === next && (lastScheduledRoot = prev);
		      else if (prev = root, 0 !== syncTransitionLanes || 0 !== (nextLanes & 3))
		        mightHavePendingSyncWork = true;
		      root = next;
		    }
		    0 !== pendingEffectsStatus && 5 !== pendingEffectsStatus || flushSyncWorkAcrossRoots_impl(syncTransitionLanes);
		    0 !== currentEventTransitionLane && (currentEventTransitionLane = 0);
		  }
		  function scheduleTaskForRootDuringMicrotask(root, currentTime) {
		    for (var suspendedLanes = root.suspendedLanes, pingedLanes = root.pingedLanes, expirationTimes = root.expirationTimes, lanes = root.pendingLanes & -62914561; 0 < lanes; ) {
		      var index$3 = 31 - clz32(lanes), lane = 1 << index$3, expirationTime = expirationTimes[index$3];
		      if (-1 === expirationTime) {
		        if (0 === (lane & suspendedLanes) || 0 !== (lane & pingedLanes))
		          expirationTimes[index$3] = computeExpirationTime(lane, currentTime);
		      } else expirationTime <= currentTime && (root.expiredLanes |= lane);
		      lanes &= ~lane;
		    }
		    currentTime = workInProgressRoot;
		    suspendedLanes = workInProgressRootRenderLanes;
		    suspendedLanes = getNextLanes(
		      root,
		      root === currentTime ? suspendedLanes : 0,
		      null !== root.cancelPendingCommit || root.timeoutHandle !== noTimeout
		    );
		    pingedLanes = root.callbackNode;
		    if (0 === suspendedLanes || root === currentTime && (2 === workInProgressSuspendedReason || 9 === workInProgressSuspendedReason) || null !== root.cancelPendingCommit)
		      return null !== pingedLanes && null !== pingedLanes && cancelCallback$1(pingedLanes), root.callbackNode = null, root.callbackPriority = 0;
		    if (0 === (suspendedLanes & 3) || checkIfRootIsPrerendering(root, suspendedLanes)) {
		      currentTime = suspendedLanes & -suspendedLanes;
		      if (currentTime === root.callbackPriority) return currentTime;
		      null !== pingedLanes && cancelCallback$1(pingedLanes);
		      switch (lanesToEventPriority(suspendedLanes)) {
		        case 2:
		        case 8:
		          suspendedLanes = UserBlockingPriority;
		          break;
		        case 32:
		          suspendedLanes = NormalPriority$1;
		          break;
		        case 268435456:
		          suspendedLanes = IdlePriority;
		          break;
		        default:
		          suspendedLanes = NormalPriority$1;
		      }
		      pingedLanes = performWorkOnRootViaSchedulerTask.bind(null, root);
		      suspendedLanes = scheduleCallback$3(suspendedLanes, pingedLanes);
		      root.callbackPriority = currentTime;
		      root.callbackNode = suspendedLanes;
		      return currentTime;
		    }
		    null !== pingedLanes && null !== pingedLanes && cancelCallback$1(pingedLanes);
		    root.callbackPriority = 2;
		    root.callbackNode = null;
		    return 2;
		  }
		  function performWorkOnRootViaSchedulerTask(root, didTimeout) {
		    if (0 !== pendingEffectsStatus && 5 !== pendingEffectsStatus)
		      return root.callbackNode = null, root.callbackPriority = 0, null;
		    var originalCallbackNode = root.callbackNode;
		    if (flushPendingEffects() && root.callbackNode !== originalCallbackNode)
		      return null;
		    var workInProgressRootRenderLanes$jscomp$0 = workInProgressRootRenderLanes;
		    workInProgressRootRenderLanes$jscomp$0 = getNextLanes(
		      root,
		      root === workInProgressRoot ? workInProgressRootRenderLanes$jscomp$0 : 0,
		      null !== root.cancelPendingCommit || root.timeoutHandle !== noTimeout
		    );
		    if (0 === workInProgressRootRenderLanes$jscomp$0) return null;
		    performWorkOnRoot(root, workInProgressRootRenderLanes$jscomp$0, didTimeout);
		    scheduleTaskForRootDuringMicrotask(root, now());
		    return null != root.callbackNode && root.callbackNode === originalCallbackNode ? performWorkOnRootViaSchedulerTask.bind(null, root) : null;
		  }
		  function performSyncWorkOnRoot(root, lanes) {
		    if (flushPendingEffects()) return null;
		    performWorkOnRoot(root, lanes, true);
		  }
		  function scheduleImmediateRootScheduleTask() {
		    supportsMicrotasks ? scheduleMicrotask(function() {
		      0 !== (executionContext & 6) ? scheduleCallback$3(
		        ImmediatePriority,
		        processRootScheduleInImmediateTask
		      ) : processRootScheduleInMicrotask();
		    }) : scheduleCallback$3(
		      ImmediatePriority,
		      processRootScheduleInImmediateTask
		    );
		  }
		  function requestTransitionLane() {
		    if (0 === currentEventTransitionLane) {
		      var actionScopeLane = currentEntangledLane;
		      0 === actionScopeLane && (actionScopeLane = nextTransitionUpdateLane, nextTransitionUpdateLane <<= 1, 0 === (nextTransitionUpdateLane & 261888) && (nextTransitionUpdateLane = 256));
		      currentEventTransitionLane = actionScopeLane;
		    }
		    return currentEventTransitionLane;
		  }
		  function entangleAsyncAction(transition, thenable) {
		    if (null === currentEntangledListeners) {
		      var entangledListeners = currentEntangledListeners = [];
		      currentEntangledPendingCount = 0;
		      currentEntangledLane = requestTransitionLane();
		      currentEntangledActionThenable = {
		        status: "pending",
		        value: void 0,
		        then: function(resolve) {
		          entangledListeners.push(resolve);
		        }
		      };
		    }
		    currentEntangledPendingCount++;
		    thenable.then(pingEngtangledActionScope, pingEngtangledActionScope);
		    return thenable;
		  }
		  function pingEngtangledActionScope() {
		    if (0 === --currentEntangledPendingCount && null !== currentEntangledListeners) {
		      null !== currentEntangledActionThenable && (currentEntangledActionThenable.status = "fulfilled");
		      var listeners = currentEntangledListeners;
		      currentEntangledListeners = null;
		      currentEntangledLane = 0;
		      currentEntangledActionThenable = null;
		      for (var i = 0; i < listeners.length; i++) (0, listeners[i])();
		    }
		  }
		  function chainThenableValue(thenable, result) {
		    var listeners = [], thenableWithOverride = {
		      status: "pending",
		      value: null,
		      reason: null,
		      then: function(resolve) {
		        listeners.push(resolve);
		      }
		    };
		    thenable.then(
		      function() {
		        thenableWithOverride.status = "fulfilled";
		        thenableWithOverride.value = result;
		        for (var i = 0; i < listeners.length; i++) (0, listeners[i])(result);
		      },
		      function(error) {
		        thenableWithOverride.status = "rejected";
		        thenableWithOverride.reason = error;
		        for (error = 0; error < listeners.length; error++)
		          (0, listeners[error])(void 0);
		      }
		    );
		    return thenableWithOverride;
		  }
		  function peekCacheFromPool() {
		    var cacheResumedFromPreviousRender = resumedCache.current;
		    return null !== cacheResumedFromPreviousRender ? cacheResumedFromPreviousRender : workInProgressRoot.pooledCache;
		  }
		  function pushTransition(offscreenWorkInProgress, prevCachePool) {
		    null === prevCachePool ? push(resumedCache, resumedCache.current) : push(resumedCache, prevCachePool.pool);
		  }
		  function getSuspendedCache() {
		    var cacheFromPool = peekCacheFromPool();
		    return null === cacheFromPool ? null : {
		      parent: isPrimaryRenderer ? CacheContext._currentValue : CacheContext._currentValue2,
		      pool: cacheFromPool
		    };
		  }
		  function shallowEqual(objA, objB) {
		    if (objectIs(objA, objB)) return true;
		    if ("object" !== typeof objA || null === objA || "object" !== typeof objB || null === objB)
		      return false;
		    var keysA = Object.keys(objA), keysB = Object.keys(objB);
		    if (keysA.length !== keysB.length) return false;
		    for (keysB = 0; keysB < keysA.length; keysB++) {
		      var currentKey = keysA[keysB];
		      if (!hasOwnProperty.call(objB, currentKey) || !objectIs(objA[currentKey], objB[currentKey]))
		        return false;
		    }
		    return true;
		  }
		  function isThenableResolved(thenable) {
		    thenable = thenable.status;
		    return "fulfilled" === thenable || "rejected" === thenable;
		  }
		  function trackUsedThenable(thenableState2, thenable, index) {
		    index = thenableState2[index];
		    void 0 === index ? thenableState2.push(thenable) : index !== thenable && (thenable.then(noop$1, noop$1), thenable = index);
		    switch (thenable.status) {
		      case "fulfilled":
		        return thenable.value;
		      case "rejected":
		        throw thenableState2 = thenable.reason, checkIfUseWrappedInAsyncCatch(thenableState2), thenableState2;
		      default:
		        if ("string" === typeof thenable.status) thenable.then(noop$1, noop$1);
		        else {
		          thenableState2 = workInProgressRoot;
		          if (null !== thenableState2 && 100 < thenableState2.shellSuspendCounter)
		            throw Error(formatProdErrorMessage(482));
		          thenableState2 = thenable;
		          thenableState2.status = "pending";
		          thenableState2.then(
		            function(fulfilledValue) {
		              if ("pending" === thenable.status) {
		                var fulfilledThenable = thenable;
		                fulfilledThenable.status = "fulfilled";
		                fulfilledThenable.value = fulfilledValue;
		              }
		            },
		            function(error) {
		              if ("pending" === thenable.status) {
		                var rejectedThenable = thenable;
		                rejectedThenable.status = "rejected";
		                rejectedThenable.reason = error;
		              }
		            }
		          );
		        }
		        switch (thenable.status) {
		          case "fulfilled":
		            return thenable.value;
		          case "rejected":
		            throw thenableState2 = thenable.reason, checkIfUseWrappedInAsyncCatch(thenableState2), thenableState2;
		        }
		        suspendedThenable = thenable;
		        throw SuspenseException;
		    }
		  }
		  function resolveLazy(lazyType) {
		    try {
		      var init = lazyType._init;
		      return init(lazyType._payload);
		    } catch (x) {
		      if (null !== x && "object" === typeof x && "function" === typeof x.then)
		        throw suspendedThenable = x, SuspenseException;
		      throw x;
		    }
		  }
		  function getSuspendedThenable() {
		    if (null === suspendedThenable) throw Error(formatProdErrorMessage(459));
		    var thenable = suspendedThenable;
		    suspendedThenable = null;
		    return thenable;
		  }
		  function checkIfUseWrappedInAsyncCatch(rejectedReason) {
		    if (rejectedReason === SuspenseException || rejectedReason === SuspenseActionException)
		      throw Error(formatProdErrorMessage(483));
		  }
		  function unwrapThenable(thenable) {
		    var index = thenableIndexCounter$1;
		    thenableIndexCounter$1 += 1;
		    null === thenableState$1 && (thenableState$1 = []);
		    return trackUsedThenable(thenableState$1, thenable, index);
		  }
		  function coerceRef(workInProgress2, element) {
		    element = element.props.ref;
		    workInProgress2.ref = void 0 !== element ? element : null;
		  }
		  function throwOnInvalidObjectTypeImpl(returnFiber, newChild) {
		    if (newChild.$$typeof === REACT_LEGACY_ELEMENT_TYPE)
		      throw Error(formatProdErrorMessage(525));
		    returnFiber = Object.prototype.toString.call(newChild);
		    throw Error(
		      formatProdErrorMessage(
		        31,
		        "[object Object]" === returnFiber ? "object with keys {" + Object.keys(newChild).join(", ") + "}" : returnFiber
		      )
		    );
		  }
		  function createChildReconciler(shouldTrackSideEffects) {
		    function deleteChild(returnFiber, childToDelete) {
		      if (shouldTrackSideEffects) {
		        var deletions = returnFiber.deletions;
		        null === deletions ? (returnFiber.deletions = [childToDelete], returnFiber.flags |= 16) : deletions.push(childToDelete);
		      }
		    }
		    function deleteRemainingChildren(returnFiber, currentFirstChild) {
		      if (!shouldTrackSideEffects) return null;
		      for (; null !== currentFirstChild; )
		        deleteChild(returnFiber, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
		      return null;
		    }
		    function mapRemainingChildren(currentFirstChild) {
		      for (var existingChildren = /* @__PURE__ */ new Map(); null !== currentFirstChild; )
		        null !== currentFirstChild.key ? existingChildren.set(currentFirstChild.key, currentFirstChild) : existingChildren.set(currentFirstChild.index, currentFirstChild), currentFirstChild = currentFirstChild.sibling;
		      return existingChildren;
		    }
		    function useFiber(fiber, pendingProps) {
		      fiber = createWorkInProgress(fiber, pendingProps);
		      fiber.index = 0;
		      fiber.sibling = null;
		      return fiber;
		    }
		    function placeChild(newFiber, lastPlacedIndex, newIndex) {
		      newFiber.index = newIndex;
		      if (!shouldTrackSideEffects)
		        return newFiber.flags |= 1048576, lastPlacedIndex;
		      newIndex = newFiber.alternate;
		      if (null !== newIndex)
		        return newIndex = newIndex.index, newIndex < lastPlacedIndex ? (newFiber.flags |= 67108866, lastPlacedIndex) : newIndex;
		      newFiber.flags |= 67108866;
		      return lastPlacedIndex;
		    }
		    function placeSingleChild(newFiber) {
		      shouldTrackSideEffects && null === newFiber.alternate && (newFiber.flags |= 67108866);
		      return newFiber;
		    }
		    function updateTextNode(returnFiber, current, textContent, lanes) {
		      if (null === current || 6 !== current.tag)
		        return current = createFiberFromText(textContent, returnFiber.mode, lanes), current.return = returnFiber, current;
		      current = useFiber(current, textContent);
		      current.return = returnFiber;
		      return current;
		    }
		    function updateElement(returnFiber, current, element, lanes) {
		      var elementType = element.type;
		      if (elementType === REACT_FRAGMENT_TYPE)
		        return updateFragment(
		          returnFiber,
		          current,
		          element.props.children,
		          lanes,
		          element.key
		        );
		      if (null !== current && (current.elementType === elementType || "object" === typeof elementType && null !== elementType && elementType.$$typeof === REACT_LAZY_TYPE && resolveLazy(elementType) === current.type))
		        return current = useFiber(current, element.props), coerceRef(current, element), current.return = returnFiber, current;
		      current = createFiberFromTypeAndProps(
		        element.type,
		        element.key,
		        element.props,
		        null,
		        returnFiber.mode,
		        lanes
		      );
		      coerceRef(current, element);
		      current.return = returnFiber;
		      return current;
		    }
		    function updatePortal(returnFiber, current, portal, lanes) {
		      if (null === current || 4 !== current.tag || current.stateNode.containerInfo !== portal.containerInfo || current.stateNode.implementation !== portal.implementation)
		        return current = createFiberFromPortal(portal, returnFiber.mode, lanes), current.return = returnFiber, current;
		      current = useFiber(current, portal.children || []);
		      current.return = returnFiber;
		      return current;
		    }
		    function updateFragment(returnFiber, current, fragment, lanes, key) {
		      if (null === current || 7 !== current.tag)
		        return current = createFiberFromFragment(
		          fragment,
		          returnFiber.mode,
		          lanes,
		          key
		        ), current.return = returnFiber, current;
		      current = useFiber(current, fragment);
		      current.return = returnFiber;
		      return current;
		    }
		    function createChild(returnFiber, newChild, lanes) {
		      if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild)
		        return newChild = createFiberFromText(
		          "" + newChild,
		          returnFiber.mode,
		          lanes
		        ), newChild.return = returnFiber, newChild;
		      if ("object" === typeof newChild && null !== newChild) {
		        switch (newChild.$$typeof) {
		          case REACT_ELEMENT_TYPE:
		            return lanes = createFiberFromTypeAndProps(
		              newChild.type,
		              newChild.key,
		              newChild.props,
		              null,
		              returnFiber.mode,
		              lanes
		            ), coerceRef(lanes, newChild), lanes.return = returnFiber, lanes;
		          case REACT_PORTAL_TYPE:
		            return newChild = createFiberFromPortal(
		              newChild,
		              returnFiber.mode,
		              lanes
		            ), newChild.return = returnFiber, newChild;
		          case REACT_LAZY_TYPE:
		            return newChild = resolveLazy(newChild), createChild(returnFiber, newChild, lanes);
		        }
		        if (isArrayImpl(newChild) || getIteratorFn(newChild))
		          return newChild = createFiberFromFragment(
		            newChild,
		            returnFiber.mode,
		            lanes,
		            null
		          ), newChild.return = returnFiber, newChild;
		        if ("function" === typeof newChild.then)
		          return createChild(returnFiber, unwrapThenable(newChild), lanes);
		        if (newChild.$$typeof === REACT_CONTEXT_TYPE)
		          return createChild(
		            returnFiber,
		            readContextDuringReconciliation(returnFiber, newChild),
		            lanes
		          );
		        throwOnInvalidObjectTypeImpl(returnFiber, newChild);
		      }
		      return null;
		    }
		    function updateSlot(returnFiber, oldFiber, newChild, lanes) {
		      var key = null !== oldFiber ? oldFiber.key : null;
		      if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild)
		        return null !== key ? null : updateTextNode(returnFiber, oldFiber, "" + newChild, lanes);
		      if ("object" === typeof newChild && null !== newChild) {
		        switch (newChild.$$typeof) {
		          case REACT_ELEMENT_TYPE:
		            return newChild.key === key ? updateElement(returnFiber, oldFiber, newChild, lanes) : null;
		          case REACT_PORTAL_TYPE:
		            return newChild.key === key ? updatePortal(returnFiber, oldFiber, newChild, lanes) : null;
		          case REACT_LAZY_TYPE:
		            return newChild = resolveLazy(newChild), updateSlot(returnFiber, oldFiber, newChild, lanes);
		        }
		        if (isArrayImpl(newChild) || getIteratorFn(newChild))
		          return null !== key ? null : updateFragment(returnFiber, oldFiber, newChild, lanes, null);
		        if ("function" === typeof newChild.then)
		          return updateSlot(
		            returnFiber,
		            oldFiber,
		            unwrapThenable(newChild),
		            lanes
		          );
		        if (newChild.$$typeof === REACT_CONTEXT_TYPE)
		          return updateSlot(
		            returnFiber,
		            oldFiber,
		            readContextDuringReconciliation(returnFiber, newChild),
		            lanes
		          );
		        throwOnInvalidObjectTypeImpl(returnFiber, newChild);
		      }
		      return null;
		    }
		    function updateFromMap(existingChildren, returnFiber, newIdx, newChild, lanes) {
		      if ("string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild)
		        return existingChildren = existingChildren.get(newIdx) || null, updateTextNode(returnFiber, existingChildren, "" + newChild, lanes);
		      if ("object" === typeof newChild && null !== newChild) {
		        switch (newChild.$$typeof) {
		          case REACT_ELEMENT_TYPE:
		            return existingChildren = existingChildren.get(
		              null === newChild.key ? newIdx : newChild.key
		            ) || null, updateElement(returnFiber, existingChildren, newChild, lanes);
		          case REACT_PORTAL_TYPE:
		            return existingChildren = existingChildren.get(
		              null === newChild.key ? newIdx : newChild.key
		            ) || null, updatePortal(returnFiber, existingChildren, newChild, lanes);
		          case REACT_LAZY_TYPE:
		            return newChild = resolveLazy(newChild), updateFromMap(
		              existingChildren,
		              returnFiber,
		              newIdx,
		              newChild,
		              lanes
		            );
		        }
		        if (isArrayImpl(newChild) || getIteratorFn(newChild))
		          return existingChildren = existingChildren.get(newIdx) || null, updateFragment(returnFiber, existingChildren, newChild, lanes, null);
		        if ("function" === typeof newChild.then)
		          return updateFromMap(
		            existingChildren,
		            returnFiber,
		            newIdx,
		            unwrapThenable(newChild),
		            lanes
		          );
		        if (newChild.$$typeof === REACT_CONTEXT_TYPE)
		          return updateFromMap(
		            existingChildren,
		            returnFiber,
		            newIdx,
		            readContextDuringReconciliation(returnFiber, newChild),
		            lanes
		          );
		        throwOnInvalidObjectTypeImpl(returnFiber, newChild);
		      }
		      return null;
		    }
		    function reconcileChildrenArray(returnFiber, currentFirstChild, newChildren, lanes) {
		      for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null; null !== oldFiber && newIdx < newChildren.length; newIdx++) {
		        oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
		        var newFiber = updateSlot(
		          returnFiber,
		          oldFiber,
		          newChildren[newIdx],
		          lanes
		        );
		        if (null === newFiber) {
		          null === oldFiber && (oldFiber = nextOldFiber);
		          break;
		        }
		        shouldTrackSideEffects && oldFiber && null === newFiber.alternate && deleteChild(returnFiber, oldFiber);
		        currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
		        null === previousNewFiber ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
		        previousNewFiber = newFiber;
		        oldFiber = nextOldFiber;
		      }
		      if (newIdx === newChildren.length)
		        return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
		      if (null === oldFiber) {
		        for (; newIdx < newChildren.length; newIdx++)
		          oldFiber = createChild(returnFiber, newChildren[newIdx], lanes), null !== oldFiber && (currentFirstChild = placeChild(
		            oldFiber,
		            currentFirstChild,
		            newIdx
		          ), null === previousNewFiber ? resultingFirstChild = oldFiber : previousNewFiber.sibling = oldFiber, previousNewFiber = oldFiber);
		        isHydrating && pushTreeFork(returnFiber, newIdx);
		        return resultingFirstChild;
		      }
		      for (oldFiber = mapRemainingChildren(oldFiber); newIdx < newChildren.length; newIdx++)
		        nextOldFiber = updateFromMap(
		          oldFiber,
		          returnFiber,
		          newIdx,
		          newChildren[newIdx],
		          lanes
		        ), null !== nextOldFiber && (shouldTrackSideEffects && null !== nextOldFiber.alternate && oldFiber.delete(
		          null === nextOldFiber.key ? newIdx : nextOldFiber.key
		        ), currentFirstChild = placeChild(
		          nextOldFiber,
		          currentFirstChild,
		          newIdx
		        ), null === previousNewFiber ? resultingFirstChild = nextOldFiber : previousNewFiber.sibling = nextOldFiber, previousNewFiber = nextOldFiber);
		      shouldTrackSideEffects && oldFiber.forEach(function(child) {
		        return deleteChild(returnFiber, child);
		      });
		      isHydrating && pushTreeFork(returnFiber, newIdx);
		      return resultingFirstChild;
		    }
		    function reconcileChildrenIterator(returnFiber, currentFirstChild, newChildren, lanes) {
		      if (null == newChildren) throw Error(formatProdErrorMessage(151));
		      for (var resultingFirstChild = null, previousNewFiber = null, oldFiber = currentFirstChild, newIdx = currentFirstChild = 0, nextOldFiber = null, step = newChildren.next(); null !== oldFiber && !step.done; newIdx++, step = newChildren.next()) {
		        oldFiber.index > newIdx ? (nextOldFiber = oldFiber, oldFiber = null) : nextOldFiber = oldFiber.sibling;
		        var newFiber = updateSlot(returnFiber, oldFiber, step.value, lanes);
		        if (null === newFiber) {
		          null === oldFiber && (oldFiber = nextOldFiber);
		          break;
		        }
		        shouldTrackSideEffects && oldFiber && null === newFiber.alternate && deleteChild(returnFiber, oldFiber);
		        currentFirstChild = placeChild(newFiber, currentFirstChild, newIdx);
		        null === previousNewFiber ? resultingFirstChild = newFiber : previousNewFiber.sibling = newFiber;
		        previousNewFiber = newFiber;
		        oldFiber = nextOldFiber;
		      }
		      if (step.done)
		        return deleteRemainingChildren(returnFiber, oldFiber), isHydrating && pushTreeFork(returnFiber, newIdx), resultingFirstChild;
		      if (null === oldFiber) {
		        for (; !step.done; newIdx++, step = newChildren.next())
		          step = createChild(returnFiber, step.value, lanes), null !== step && (currentFirstChild = placeChild(
		            step,
		            currentFirstChild,
		            newIdx
		          ), null === previousNewFiber ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
		        isHydrating && pushTreeFork(returnFiber, newIdx);
		        return resultingFirstChild;
		      }
		      for (oldFiber = mapRemainingChildren(oldFiber); !step.done; newIdx++, step = newChildren.next())
		        step = updateFromMap(
		          oldFiber,
		          returnFiber,
		          newIdx,
		          step.value,
		          lanes
		        ), null !== step && (shouldTrackSideEffects && null !== step.alternate && oldFiber.delete(null === step.key ? newIdx : step.key), currentFirstChild = placeChild(step, currentFirstChild, newIdx), null === previousNewFiber ? resultingFirstChild = step : previousNewFiber.sibling = step, previousNewFiber = step);
		      shouldTrackSideEffects && oldFiber.forEach(function(child) {
		        return deleteChild(returnFiber, child);
		      });
		      isHydrating && pushTreeFork(returnFiber, newIdx);
		      return resultingFirstChild;
		    }
		    function reconcileChildFibersImpl(returnFiber, currentFirstChild, newChild, lanes) {
		      "object" === typeof newChild && null !== newChild && newChild.type === REACT_FRAGMENT_TYPE && null === newChild.key && (newChild = newChild.props.children);
		      if ("object" === typeof newChild && null !== newChild) {
		        switch (newChild.$$typeof) {
		          case REACT_ELEMENT_TYPE:
		            a: {
		              for (var key = newChild.key; null !== currentFirstChild; ) {
		                if (currentFirstChild.key === key) {
		                  key = newChild.type;
		                  if (key === REACT_FRAGMENT_TYPE) {
		                    if (7 === currentFirstChild.tag) {
		                      deleteRemainingChildren(
		                        returnFiber,
		                        currentFirstChild.sibling
		                      );
		                      lanes = useFiber(
		                        currentFirstChild,
		                        newChild.props.children
		                      );
		                      lanes.return = returnFiber;
		                      returnFiber = lanes;
		                      break a;
		                    }
		                  } else if (currentFirstChild.elementType === key || "object" === typeof key && null !== key && key.$$typeof === REACT_LAZY_TYPE && resolveLazy(key) === currentFirstChild.type) {
		                    deleteRemainingChildren(
		                      returnFiber,
		                      currentFirstChild.sibling
		                    );
		                    lanes = useFiber(currentFirstChild, newChild.props);
		                    coerceRef(lanes, newChild);
		                    lanes.return = returnFiber;
		                    returnFiber = lanes;
		                    break a;
		                  }
		                  deleteRemainingChildren(returnFiber, currentFirstChild);
		                  break;
		                } else deleteChild(returnFiber, currentFirstChild);
		                currentFirstChild = currentFirstChild.sibling;
		              }
		              newChild.type === REACT_FRAGMENT_TYPE ? (lanes = createFiberFromFragment(
		                newChild.props.children,
		                returnFiber.mode,
		                lanes,
		                newChild.key
		              ), lanes.return = returnFiber, returnFiber = lanes) : (lanes = createFiberFromTypeAndProps(
		                newChild.type,
		                newChild.key,
		                newChild.props,
		                null,
		                returnFiber.mode,
		                lanes
		              ), coerceRef(lanes, newChild), lanes.return = returnFiber, returnFiber = lanes);
		            }
		            return placeSingleChild(returnFiber);
		          case REACT_PORTAL_TYPE:
		            a: {
		              for (key = newChild.key; null !== currentFirstChild; ) {
		                if (currentFirstChild.key === key)
		                  if (4 === currentFirstChild.tag && currentFirstChild.stateNode.containerInfo === newChild.containerInfo && currentFirstChild.stateNode.implementation === newChild.implementation) {
		                    deleteRemainingChildren(
		                      returnFiber,
		                      currentFirstChild.sibling
		                    );
		                    lanes = useFiber(
		                      currentFirstChild,
		                      newChild.children || []
		                    );
		                    lanes.return = returnFiber;
		                    returnFiber = lanes;
		                    break a;
		                  } else {
		                    deleteRemainingChildren(returnFiber, currentFirstChild);
		                    break;
		                  }
		                else deleteChild(returnFiber, currentFirstChild);
		                currentFirstChild = currentFirstChild.sibling;
		              }
		              lanes = createFiberFromPortal(newChild, returnFiber.mode, lanes);
		              lanes.return = returnFiber;
		              returnFiber = lanes;
		            }
		            return placeSingleChild(returnFiber);
		          case REACT_LAZY_TYPE:
		            return newChild = resolveLazy(newChild), reconcileChildFibersImpl(
		              returnFiber,
		              currentFirstChild,
		              newChild,
		              lanes
		            );
		        }
		        if (isArrayImpl(newChild))
		          return reconcileChildrenArray(
		            returnFiber,
		            currentFirstChild,
		            newChild,
		            lanes
		          );
		        if (getIteratorFn(newChild)) {
		          key = getIteratorFn(newChild);
		          if ("function" !== typeof key)
		            throw Error(formatProdErrorMessage(150));
		          newChild = key.call(newChild);
		          return reconcileChildrenIterator(
		            returnFiber,
		            currentFirstChild,
		            newChild,
		            lanes
		          );
		        }
		        if ("function" === typeof newChild.then)
		          return reconcileChildFibersImpl(
		            returnFiber,
		            currentFirstChild,
		            unwrapThenable(newChild),
		            lanes
		          );
		        if (newChild.$$typeof === REACT_CONTEXT_TYPE)
		          return reconcileChildFibersImpl(
		            returnFiber,
		            currentFirstChild,
		            readContextDuringReconciliation(returnFiber, newChild),
		            lanes
		          );
		        throwOnInvalidObjectTypeImpl(returnFiber, newChild);
		      }
		      return "string" === typeof newChild && "" !== newChild || "number" === typeof newChild || "bigint" === typeof newChild ? (newChild = "" + newChild, null !== currentFirstChild && 6 === currentFirstChild.tag ? (deleteRemainingChildren(returnFiber, currentFirstChild.sibling), lanes = useFiber(currentFirstChild, newChild), lanes.return = returnFiber, returnFiber = lanes) : (deleteRemainingChildren(returnFiber, currentFirstChild), lanes = createFiberFromText(newChild, returnFiber.mode, lanes), lanes.return = returnFiber, returnFiber = lanes), placeSingleChild(returnFiber)) : deleteRemainingChildren(returnFiber, currentFirstChild);
		    }
		    return function(returnFiber, currentFirstChild, newChild, lanes) {
		      try {
		        thenableIndexCounter$1 = 0;
		        var firstChildFiber = reconcileChildFibersImpl(
		          returnFiber,
		          currentFirstChild,
		          newChild,
		          lanes
		        );
		        thenableState$1 = null;
		        return firstChildFiber;
		      } catch (x) {
		        if (x === SuspenseException || x === SuspenseActionException) throw x;
		        var fiber = createFiber(29, x, null, returnFiber.mode);
		        fiber.lanes = lanes;
		        fiber.return = returnFiber;
		        return fiber;
		      } finally {
		      }
		    };
		  }
		  function finishQueueingConcurrentUpdates() {
		    for (var endIndex = concurrentQueuesIndex, i = concurrentlyUpdatedLanes = concurrentQueuesIndex = 0; i < endIndex; ) {
		      var fiber = concurrentQueues[i];
		      concurrentQueues[i++] = null;
		      var queue = concurrentQueues[i];
		      concurrentQueues[i++] = null;
		      var update = concurrentQueues[i];
		      concurrentQueues[i++] = null;
		      var lane = concurrentQueues[i];
		      concurrentQueues[i++] = null;
		      if (null !== queue && null !== update) {
		        var pending = queue.pending;
		        null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
		        queue.pending = update;
		      }
		      0 !== lane && markUpdateLaneFromFiberToRoot(fiber, update, lane);
		    }
		  }
		  function enqueueUpdate$1(fiber, queue, update, lane) {
		    concurrentQueues[concurrentQueuesIndex++] = fiber;
		    concurrentQueues[concurrentQueuesIndex++] = queue;
		    concurrentQueues[concurrentQueuesIndex++] = update;
		    concurrentQueues[concurrentQueuesIndex++] = lane;
		    concurrentlyUpdatedLanes |= lane;
		    fiber.lanes |= lane;
		    fiber = fiber.alternate;
		    null !== fiber && (fiber.lanes |= lane);
		  }
		  function enqueueConcurrentHookUpdate(fiber, queue, update, lane) {
		    enqueueUpdate$1(fiber, queue, update, lane);
		    return getRootForUpdatedFiber(fiber);
		  }
		  function enqueueConcurrentRenderForLane(fiber, lane) {
		    enqueueUpdate$1(fiber, null, null, lane);
		    return getRootForUpdatedFiber(fiber);
		  }
		  function markUpdateLaneFromFiberToRoot(sourceFiber, update, lane) {
		    sourceFiber.lanes |= lane;
		    var alternate = sourceFiber.alternate;
		    null !== alternate && (alternate.lanes |= lane);
		    for (var isHidden = false, parent = sourceFiber.return; null !== parent; )
		      parent.childLanes |= lane, alternate = parent.alternate, null !== alternate && (alternate.childLanes |= lane), 22 === parent.tag && (sourceFiber = parent.stateNode, null === sourceFiber || sourceFiber._visibility & 1 || (isHidden = true)), sourceFiber = parent, parent = parent.return;
		    return 3 === sourceFiber.tag ? (parent = sourceFiber.stateNode, isHidden && null !== update && (isHidden = 31 - clz32(lane), sourceFiber = parent.hiddenUpdates, alternate = sourceFiber[isHidden], null === alternate ? sourceFiber[isHidden] = [update] : alternate.push(update), update.lane = lane | 536870912), parent) : null;
		  }
		  function getRootForUpdatedFiber(sourceFiber) {
		    if (50 < nestedUpdateCount)
		      throw nestedUpdateCount = 0, rootWithNestedUpdates = null, Error(formatProdErrorMessage(185));
		    for (var parent = sourceFiber.return; null !== parent; )
		      sourceFiber = parent, parent = sourceFiber.return;
		    return 3 === sourceFiber.tag ? sourceFiber.stateNode : null;
		  }
		  function initializeUpdateQueue(fiber) {
		    fiber.updateQueue = {
		      baseState: fiber.memoizedState,
		      firstBaseUpdate: null,
		      lastBaseUpdate: null,
		      shared: { pending: null, lanes: 0, hiddenCallbacks: null },
		      callbacks: null
		    };
		  }
		  function cloneUpdateQueue(current, workInProgress2) {
		    current = current.updateQueue;
		    workInProgress2.updateQueue === current && (workInProgress2.updateQueue = {
		      baseState: current.baseState,
		      firstBaseUpdate: current.firstBaseUpdate,
		      lastBaseUpdate: current.lastBaseUpdate,
		      shared: current.shared,
		      callbacks: null
		    });
		  }
		  function createUpdate(lane) {
		    return { lane, tag: 0, payload: null, callback: null, next: null };
		  }
		  function enqueueUpdate(fiber, update, lane) {
		    var updateQueue = fiber.updateQueue;
		    if (null === updateQueue) return null;
		    updateQueue = updateQueue.shared;
		    if (0 !== (executionContext & 2)) {
		      var pending = updateQueue.pending;
		      null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
		      updateQueue.pending = update;
		      update = getRootForUpdatedFiber(fiber);
		      markUpdateLaneFromFiberToRoot(fiber, null, lane);
		      return update;
		    }
		    enqueueUpdate$1(fiber, updateQueue, update, lane);
		    return getRootForUpdatedFiber(fiber);
		  }
		  function entangleTransitions(root, fiber, lane) {
		    fiber = fiber.updateQueue;
		    if (null !== fiber && (fiber = fiber.shared, 0 !== (lane & 4194048))) {
		      var queueLanes = fiber.lanes;
		      queueLanes &= root.pendingLanes;
		      lane |= queueLanes;
		      fiber.lanes = lane;
		      markRootEntangled(root, lane);
		    }
		  }
		  function enqueueCapturedUpdate(workInProgress2, capturedUpdate) {
		    var queue = workInProgress2.updateQueue, current = workInProgress2.alternate;
		    if (null !== current && (current = current.updateQueue, queue === current)) {
		      var newFirst = null, newLast = null;
		      queue = queue.firstBaseUpdate;
		      if (null !== queue) {
		        do {
		          var clone = {
		            lane: queue.lane,
		            tag: queue.tag,
		            payload: queue.payload,
		            callback: null,
		            next: null
		          };
		          null === newLast ? newFirst = newLast = clone : newLast = newLast.next = clone;
		          queue = queue.next;
		        } while (null !== queue);
		        null === newLast ? newFirst = newLast = capturedUpdate : newLast = newLast.next = capturedUpdate;
		      } else newFirst = newLast = capturedUpdate;
		      queue = {
		        baseState: current.baseState,
		        firstBaseUpdate: newFirst,
		        lastBaseUpdate: newLast,
		        shared: current.shared,
		        callbacks: current.callbacks
		      };
		      workInProgress2.updateQueue = queue;
		      return;
		    }
		    workInProgress2 = queue.lastBaseUpdate;
		    null === workInProgress2 ? queue.firstBaseUpdate = capturedUpdate : workInProgress2.next = capturedUpdate;
		    queue.lastBaseUpdate = capturedUpdate;
		  }
		  function suspendIfUpdateReadFromEntangledAsyncAction() {
		    if (didReadFromEntangledAsyncAction) {
		      var entangledActionThenable = currentEntangledActionThenable;
		      if (null !== entangledActionThenable) throw entangledActionThenable;
		    }
		  }
		  function processUpdateQueue(workInProgress$jscomp$0, props, instance$jscomp$0, renderLanes2) {
		    didReadFromEntangledAsyncAction = false;
		    var queue = workInProgress$jscomp$0.updateQueue;
		    hasForceUpdate = false;
		    var firstBaseUpdate = queue.firstBaseUpdate, lastBaseUpdate = queue.lastBaseUpdate, pendingQueue = queue.shared.pending;
		    if (null !== pendingQueue) {
		      queue.shared.pending = null;
		      var lastPendingUpdate = pendingQueue, firstPendingUpdate = lastPendingUpdate.next;
		      lastPendingUpdate.next = null;
		      null === lastBaseUpdate ? firstBaseUpdate = firstPendingUpdate : lastBaseUpdate.next = firstPendingUpdate;
		      lastBaseUpdate = lastPendingUpdate;
		      var current = workInProgress$jscomp$0.alternate;
		      null !== current && (current = current.updateQueue, pendingQueue = current.lastBaseUpdate, pendingQueue !== lastBaseUpdate && (null === pendingQueue ? current.firstBaseUpdate = firstPendingUpdate : pendingQueue.next = firstPendingUpdate, current.lastBaseUpdate = lastPendingUpdate));
		    }
		    if (null !== firstBaseUpdate) {
		      var newState = queue.baseState;
		      lastBaseUpdate = 0;
		      current = firstPendingUpdate = lastPendingUpdate = null;
		      pendingQueue = firstBaseUpdate;
		      do {
		        var updateLane = pendingQueue.lane & -536870913, isHiddenUpdate = updateLane !== pendingQueue.lane;
		        if (isHiddenUpdate ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes2 & updateLane) === updateLane) {
		          0 !== updateLane && updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction = true);
		          null !== current && (current = current.next = {
		            lane: 0,
		            tag: pendingQueue.tag,
		            payload: pendingQueue.payload,
		            callback: null,
		            next: null
		          });
		          a: {
		            var workInProgress2 = workInProgress$jscomp$0, update = pendingQueue;
		            updateLane = props;
		            var instance = instance$jscomp$0;
		            switch (update.tag) {
		              case 1:
		                workInProgress2 = update.payload;
		                if ("function" === typeof workInProgress2) {
		                  newState = workInProgress2.call(
		                    instance,
		                    newState,
		                    updateLane
		                  );
		                  break a;
		                }
		                newState = workInProgress2;
		                break a;
		              case 3:
		                workInProgress2.flags = workInProgress2.flags & -65537 | 128;
		              case 0:
		                workInProgress2 = update.payload;
		                updateLane = "function" === typeof workInProgress2 ? workInProgress2.call(instance, newState, updateLane) : workInProgress2;
		                if (null === updateLane || void 0 === updateLane) break a;
		                newState = assign({}, newState, updateLane);
		                break a;
		              case 2:
		                hasForceUpdate = true;
		            }
		          }
		          updateLane = pendingQueue.callback;
		          null !== updateLane && (workInProgress$jscomp$0.flags |= 64, isHiddenUpdate && (workInProgress$jscomp$0.flags |= 8192), isHiddenUpdate = queue.callbacks, null === isHiddenUpdate ? queue.callbacks = [updateLane] : isHiddenUpdate.push(updateLane));
		        } else
		          isHiddenUpdate = {
		            lane: updateLane,
		            tag: pendingQueue.tag,
		            payload: pendingQueue.payload,
		            callback: pendingQueue.callback,
		            next: null
		          }, null === current ? (firstPendingUpdate = current = isHiddenUpdate, lastPendingUpdate = newState) : current = current.next = isHiddenUpdate, lastBaseUpdate |= updateLane;
		        pendingQueue = pendingQueue.next;
		        if (null === pendingQueue)
		          if (pendingQueue = queue.shared.pending, null === pendingQueue)
		            break;
		          else
		            isHiddenUpdate = pendingQueue, pendingQueue = isHiddenUpdate.next, isHiddenUpdate.next = null, queue.lastBaseUpdate = isHiddenUpdate, queue.shared.pending = null;
		      } while (1);
		      null === current && (lastPendingUpdate = newState);
		      queue.baseState = lastPendingUpdate;
		      queue.firstBaseUpdate = firstPendingUpdate;
		      queue.lastBaseUpdate = current;
		      null === firstBaseUpdate && (queue.shared.lanes = 0);
		      workInProgressRootSkippedLanes |= lastBaseUpdate;
		      workInProgress$jscomp$0.lanes = lastBaseUpdate;
		      workInProgress$jscomp$0.memoizedState = newState;
		    }
		  }
		  function callCallback(callback, context) {
		    if ("function" !== typeof callback)
		      throw Error(formatProdErrorMessage(191, callback));
		    callback.call(context);
		  }
		  function commitCallbacks(updateQueue, context) {
		    var callbacks = updateQueue.callbacks;
		    if (null !== callbacks)
		      for (updateQueue.callbacks = null, updateQueue = 0; updateQueue < callbacks.length; updateQueue++)
		        callCallback(callbacks[updateQueue], context);
		  }
		  function pushHiddenContext(fiber, context) {
		    fiber = entangledRenderLanes;
		    push(prevEntangledRenderLanesCursor, fiber);
		    push(currentTreeHiddenStackCursor, context);
		    entangledRenderLanes = fiber | context.baseLanes;
		  }
		  function reuseHiddenContextOnStack() {
		    push(prevEntangledRenderLanesCursor, entangledRenderLanes);
		    push(currentTreeHiddenStackCursor, currentTreeHiddenStackCursor.current);
		  }
		  function popHiddenContext() {
		    entangledRenderLanes = prevEntangledRenderLanesCursor.current;
		    pop(currentTreeHiddenStackCursor);
		    pop(prevEntangledRenderLanesCursor);
		  }
		  function pushPrimaryTreeSuspenseHandler(handler) {
		    var current = handler.alternate;
		    push(suspenseStackCursor, suspenseStackCursor.current & 1);
		    push(suspenseHandlerStackCursor, handler);
		    null === shellBoundary && (null === current || null !== currentTreeHiddenStackCursor.current ? shellBoundary = handler : null !== current.memoizedState && (shellBoundary = handler));
		  }
		  function pushDehydratedActivitySuspenseHandler(fiber) {
		    push(suspenseStackCursor, suspenseStackCursor.current);
		    push(suspenseHandlerStackCursor, fiber);
		    null === shellBoundary && (shellBoundary = fiber);
		  }
		  function pushOffscreenSuspenseHandler(fiber) {
		    22 === fiber.tag ? (push(suspenseStackCursor, suspenseStackCursor.current), push(suspenseHandlerStackCursor, fiber), null === shellBoundary && (shellBoundary = fiber)) : reuseSuspenseHandlerOnStack();
		  }
		  function reuseSuspenseHandlerOnStack() {
		    push(suspenseStackCursor, suspenseStackCursor.current);
		    push(suspenseHandlerStackCursor, suspenseHandlerStackCursor.current);
		  }
		  function popSuspenseHandler(fiber) {
		    pop(suspenseHandlerStackCursor);
		    shellBoundary === fiber && (shellBoundary = null);
		    pop(suspenseStackCursor);
		  }
		  function findFirstSuspended(row) {
		    for (var node = row; null !== node; ) {
		      if (13 === node.tag) {
		        var state = node.memoizedState;
		        if (null !== state && (state = state.dehydrated, null === state || isSuspenseInstancePending(state) || isSuspenseInstanceFallback(state)))
		          return node;
		      } else if (19 === node.tag && ("forwards" === node.memoizedProps.revealOrder || "backwards" === node.memoizedProps.revealOrder || "unstable_legacy-backwards" === node.memoizedProps.revealOrder || "together" === node.memoizedProps.revealOrder)) {
		        if (0 !== (node.flags & 128)) return node;
		      } else if (null !== node.child) {
		        node.child.return = node;
		        node = node.child;
		        continue;
		      }
		      if (node === row) break;
		      for (; null === node.sibling; ) {
		        if (null === node.return || node.return === row) return null;
		        node = node.return;
		      }
		      node.sibling.return = node.return;
		      node = node.sibling;
		    }
		    return null;
		  }
		  function throwInvalidHookError() {
		    throw Error(formatProdErrorMessage(321));
		  }
		  function areHookInputsEqual(nextDeps, prevDeps) {
		    if (null === prevDeps) return false;
		    for (var i = 0; i < prevDeps.length && i < nextDeps.length; i++)
		      if (!objectIs(nextDeps[i], prevDeps[i])) return false;
		    return true;
		  }
		  function renderWithHooks(current, workInProgress2, Component, props, secondArg, nextRenderLanes) {
		    renderLanes = nextRenderLanes;
		    currentlyRenderingFiber = workInProgress2;
		    workInProgress2.memoizedState = null;
		    workInProgress2.updateQueue = null;
		    workInProgress2.lanes = 0;
		    ReactSharedInternals.H = null === current || null === current.memoizedState ? HooksDispatcherOnMount : HooksDispatcherOnUpdate;
		    shouldDoubleInvokeUserFnsInHooksDEV = false;
		    nextRenderLanes = Component(props, secondArg);
		    shouldDoubleInvokeUserFnsInHooksDEV = false;
		    didScheduleRenderPhaseUpdateDuringThisPass && (nextRenderLanes = renderWithHooksAgain(
		      workInProgress2,
		      Component,
		      props,
		      secondArg
		    ));
		    finishRenderingHooks(current);
		    return nextRenderLanes;
		  }
		  function finishRenderingHooks(current) {
		    ReactSharedInternals.H = ContextOnlyDispatcher;
		    var didRenderTooFewHooks = null !== currentHook && null !== currentHook.next;
		    renderLanes = 0;
		    workInProgressHook = currentHook = currentlyRenderingFiber = null;
		    didScheduleRenderPhaseUpdate = false;
		    thenableIndexCounter = 0;
		    thenableState = null;
		    if (didRenderTooFewHooks) throw Error(formatProdErrorMessage(300));
		    null === current || didReceiveUpdate || (current = current.dependencies, null !== current && checkIfContextChanged(current) && (didReceiveUpdate = true));
		  }
		  function renderWithHooksAgain(workInProgress2, Component, props, secondArg) {
		    currentlyRenderingFiber = workInProgress2;
		    var numberOfReRenders = 0;
		    do {
		      didScheduleRenderPhaseUpdateDuringThisPass && (thenableState = null);
		      thenableIndexCounter = 0;
		      didScheduleRenderPhaseUpdateDuringThisPass = false;
		      if (25 <= numberOfReRenders) throw Error(formatProdErrorMessage(301));
		      numberOfReRenders += 1;
		      workInProgressHook = currentHook = null;
		      if (null != workInProgress2.updateQueue) {
		        var children = workInProgress2.updateQueue;
		        children.lastEffect = null;
		        children.events = null;
		        children.stores = null;
		        null != children.memoCache && (children.memoCache.index = 0);
		      }
		      ReactSharedInternals.H = HooksDispatcherOnRerender;
		      children = Component(props, secondArg);
		    } while (didScheduleRenderPhaseUpdateDuringThisPass);
		    return children;
		  }
		  function TransitionAwareHostComponent() {
		    var dispatcher = ReactSharedInternals.H, maybeThenable = dispatcher.useState()[0];
		    maybeThenable = "function" === typeof maybeThenable.then ? useThenable(maybeThenable) : maybeThenable;
		    dispatcher = dispatcher.useState()[0];
		    (null !== currentHook ? currentHook.memoizedState : null) !== dispatcher && (currentlyRenderingFiber.flags |= 1024);
		    return maybeThenable;
		  }
		  function checkDidRenderIdHook() {
		    var didRenderIdHook = 0 !== localIdCounter;
		    localIdCounter = 0;
		    return didRenderIdHook;
		  }
		  function bailoutHooks(current, workInProgress2, lanes) {
		    workInProgress2.updateQueue = current.updateQueue;
		    workInProgress2.flags &= -2053;
		    current.lanes &= ~lanes;
		  }
		  function resetHooksOnUnwind(workInProgress2) {
		    if (didScheduleRenderPhaseUpdate) {
		      for (workInProgress2 = workInProgress2.memoizedState; null !== workInProgress2; ) {
		        var queue = workInProgress2.queue;
		        null !== queue && (queue.pending = null);
		        workInProgress2 = workInProgress2.next;
		      }
		      didScheduleRenderPhaseUpdate = false;
		    }
		    renderLanes = 0;
		    workInProgressHook = currentHook = currentlyRenderingFiber = null;
		    didScheduleRenderPhaseUpdateDuringThisPass = false;
		    thenableIndexCounter = localIdCounter = 0;
		    thenableState = null;
		  }
		  function mountWorkInProgressHook() {
		    var hook = {
		      memoizedState: null,
		      baseState: null,
		      baseQueue: null,
		      queue: null,
		      next: null
		    };
		    null === workInProgressHook ? currentlyRenderingFiber.memoizedState = workInProgressHook = hook : workInProgressHook = workInProgressHook.next = hook;
		    return workInProgressHook;
		  }
		  function updateWorkInProgressHook() {
		    if (null === currentHook) {
		      var nextCurrentHook = currentlyRenderingFiber.alternate;
		      nextCurrentHook = null !== nextCurrentHook ? nextCurrentHook.memoizedState : null;
		    } else nextCurrentHook = currentHook.next;
		    var nextWorkInProgressHook = null === workInProgressHook ? currentlyRenderingFiber.memoizedState : workInProgressHook.next;
		    if (null !== nextWorkInProgressHook)
		      workInProgressHook = nextWorkInProgressHook, currentHook = nextCurrentHook;
		    else {
		      if (null === nextCurrentHook) {
		        if (null === currentlyRenderingFiber.alternate)
		          throw Error(formatProdErrorMessage(467));
		        throw Error(formatProdErrorMessage(310));
		      }
		      currentHook = nextCurrentHook;
		      nextCurrentHook = {
		        memoizedState: currentHook.memoizedState,
		        baseState: currentHook.baseState,
		        baseQueue: currentHook.baseQueue,
		        queue: currentHook.queue,
		        next: null
		      };
		      null === workInProgressHook ? currentlyRenderingFiber.memoizedState = workInProgressHook = nextCurrentHook : workInProgressHook = workInProgressHook.next = nextCurrentHook;
		    }
		    return workInProgressHook;
		  }
		  function createFunctionComponentUpdateQueue() {
		    return { lastEffect: null, events: null, stores: null, memoCache: null };
		  }
		  function useThenable(thenable) {
		    var index = thenableIndexCounter;
		    thenableIndexCounter += 1;
		    null === thenableState && (thenableState = []);
		    thenable = trackUsedThenable(thenableState, thenable, index);
		    index = currentlyRenderingFiber;
		    null === (null === workInProgressHook ? index.memoizedState : workInProgressHook.next) && (index = index.alternate, ReactSharedInternals.H = null === index || null === index.memoizedState ? HooksDispatcherOnMount : HooksDispatcherOnUpdate);
		    return thenable;
		  }
		  function use(usable) {
		    if (null !== usable && "object" === typeof usable) {
		      if ("function" === typeof usable.then) return useThenable(usable);
		      if (usable.$$typeof === REACT_CONTEXT_TYPE) return readContext(usable);
		    }
		    throw Error(formatProdErrorMessage(438, String(usable)));
		  }
		  function useMemoCache(size) {
		    var memoCache = null, updateQueue = currentlyRenderingFiber.updateQueue;
		    null !== updateQueue && (memoCache = updateQueue.memoCache);
		    if (null == memoCache) {
		      var current = currentlyRenderingFiber.alternate;
		      null !== current && (current = current.updateQueue, null !== current && (current = current.memoCache, null != current && (memoCache = {
		        data: current.data.map(function(array) {
		          return array.slice();
		        }),
		        index: 0
		      })));
		    }
		    null == memoCache && (memoCache = { data: [], index: 0 });
		    null === updateQueue && (updateQueue = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = updateQueue);
		    updateQueue.memoCache = memoCache;
		    updateQueue = memoCache.data[memoCache.index];
		    if (void 0 === updateQueue)
		      for (updateQueue = memoCache.data[memoCache.index] = Array(size), current = 0; current < size; current++)
		        updateQueue[current] = REACT_MEMO_CACHE_SENTINEL;
		    memoCache.index++;
		    return updateQueue;
		  }
		  function basicStateReducer(state, action) {
		    return "function" === typeof action ? action(state) : action;
		  }
		  function updateReducer(reducer) {
		    var hook = updateWorkInProgressHook();
		    return updateReducerImpl(hook, currentHook, reducer);
		  }
		  function updateReducerImpl(hook, current, reducer) {
		    var queue = hook.queue;
		    if (null === queue) throw Error(formatProdErrorMessage(311));
		    queue.lastRenderedReducer = reducer;
		    var baseQueue = hook.baseQueue, pendingQueue = queue.pending;
		    if (null !== pendingQueue) {
		      if (null !== baseQueue) {
		        var baseFirst = baseQueue.next;
		        baseQueue.next = pendingQueue.next;
		        pendingQueue.next = baseFirst;
		      }
		      current.baseQueue = baseQueue = pendingQueue;
		      queue.pending = null;
		    }
		    pendingQueue = hook.baseState;
		    if (null === baseQueue) hook.memoizedState = pendingQueue;
		    else {
		      current = baseQueue.next;
		      var newBaseQueueFirst = baseFirst = null, newBaseQueueLast = null, update = current, didReadFromEntangledAsyncAction$51 = false;
		      do {
		        var updateLane = update.lane & -536870913;
		        if (updateLane !== update.lane ? (workInProgressRootRenderLanes & updateLane) === updateLane : (renderLanes & updateLane) === updateLane) {
		          var revertLane = update.revertLane;
		          if (0 === revertLane)
		            null !== newBaseQueueLast && (newBaseQueueLast = newBaseQueueLast.next = {
		              lane: 0,
		              revertLane: 0,
		              gesture: null,
		              action: update.action,
		              hasEagerState: update.hasEagerState,
		              eagerState: update.eagerState,
		              next: null
		            }), updateLane === currentEntangledLane && (didReadFromEntangledAsyncAction$51 = true);
		          else if ((renderLanes & revertLane) === revertLane) {
		            update = update.next;
		            revertLane === currentEntangledLane && (didReadFromEntangledAsyncAction$51 = true);
		            continue;
		          } else
		            updateLane = {
		              lane: 0,
		              revertLane: update.revertLane,
		              gesture: null,
		              action: update.action,
		              hasEagerState: update.hasEagerState,
		              eagerState: update.eagerState,
		              next: null
		            }, null === newBaseQueueLast ? (newBaseQueueFirst = newBaseQueueLast = updateLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = updateLane, currentlyRenderingFiber.lanes |= revertLane, workInProgressRootSkippedLanes |= revertLane;
		          updateLane = update.action;
		          shouldDoubleInvokeUserFnsInHooksDEV && reducer(pendingQueue, updateLane);
		          pendingQueue = update.hasEagerState ? update.eagerState : reducer(pendingQueue, updateLane);
		        } else
		          revertLane = {
		            lane: updateLane,
		            revertLane: update.revertLane,
		            gesture: update.gesture,
		            action: update.action,
		            hasEagerState: update.hasEagerState,
		            eagerState: update.eagerState,
		            next: null
		          }, null === newBaseQueueLast ? (newBaseQueueFirst = newBaseQueueLast = revertLane, baseFirst = pendingQueue) : newBaseQueueLast = newBaseQueueLast.next = revertLane, currentlyRenderingFiber.lanes |= updateLane, workInProgressRootSkippedLanes |= updateLane;
		        update = update.next;
		      } while (null !== update && update !== current);
		      null === newBaseQueueLast ? baseFirst = pendingQueue : newBaseQueueLast.next = newBaseQueueFirst;
		      if (!objectIs(pendingQueue, hook.memoizedState) && (didReceiveUpdate = true, didReadFromEntangledAsyncAction$51 && (reducer = currentEntangledActionThenable, null !== reducer)))
		        throw reducer;
		      hook.memoizedState = pendingQueue;
		      hook.baseState = baseFirst;
		      hook.baseQueue = newBaseQueueLast;
		      queue.lastRenderedState = pendingQueue;
		    }
		    null === baseQueue && (queue.lanes = 0);
		    return [hook.memoizedState, queue.dispatch];
		  }
		  function rerenderReducer(reducer) {
		    var hook = updateWorkInProgressHook(), queue = hook.queue;
		    if (null === queue) throw Error(formatProdErrorMessage(311));
		    queue.lastRenderedReducer = reducer;
		    var dispatch = queue.dispatch, lastRenderPhaseUpdate = queue.pending, newState = hook.memoizedState;
		    if (null !== lastRenderPhaseUpdate) {
		      queue.pending = null;
		      var update = lastRenderPhaseUpdate = lastRenderPhaseUpdate.next;
		      do
		        newState = reducer(newState, update.action), update = update.next;
		      while (update !== lastRenderPhaseUpdate);
		      objectIs(newState, hook.memoizedState) || (didReceiveUpdate = true);
		      hook.memoizedState = newState;
		      null === hook.baseQueue && (hook.baseState = newState);
		      queue.lastRenderedState = newState;
		    }
		    return [newState, dispatch];
		  }
		  function updateSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
		    var fiber = currentlyRenderingFiber, hook = updateWorkInProgressHook(), isHydrating$jscomp$0 = isHydrating;
		    if (isHydrating$jscomp$0) {
		      if (void 0 === getServerSnapshot)
		        throw Error(formatProdErrorMessage(407));
		      getServerSnapshot = getServerSnapshot();
		    } else getServerSnapshot = getSnapshot();
		    var snapshotChanged = !objectIs(
		      (currentHook || hook).memoizedState,
		      getServerSnapshot
		    );
		    snapshotChanged && (hook.memoizedState = getServerSnapshot, didReceiveUpdate = true);
		    hook = hook.queue;
		    updateEffect(subscribeToStore.bind(null, fiber, hook, subscribe), [
		      subscribe
		    ]);
		    if (hook.getSnapshot !== getSnapshot || snapshotChanged || null !== workInProgressHook && workInProgressHook.memoizedState.tag & 1) {
		      fiber.flags |= 2048;
		      pushSimpleEffect(
		        9,
		        { destroy: void 0 },
		        updateStoreInstance.bind(
		          null,
		          fiber,
		          hook,
		          getServerSnapshot,
		          getSnapshot
		        ),
		        null
		      );
		      if (null === workInProgressRoot) throw Error(formatProdErrorMessage(349));
		      isHydrating$jscomp$0 || 0 !== (renderLanes & 127) || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
		    }
		    return getServerSnapshot;
		  }
		  function pushStoreConsistencyCheck(fiber, getSnapshot, renderedSnapshot) {
		    fiber.flags |= 16384;
		    fiber = { getSnapshot, value: renderedSnapshot };
		    getSnapshot = currentlyRenderingFiber.updateQueue;
		    null === getSnapshot ? (getSnapshot = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = getSnapshot, getSnapshot.stores = [fiber]) : (renderedSnapshot = getSnapshot.stores, null === renderedSnapshot ? getSnapshot.stores = [fiber] : renderedSnapshot.push(fiber));
		  }
		  function updateStoreInstance(fiber, inst, nextSnapshot, getSnapshot) {
		    inst.value = nextSnapshot;
		    inst.getSnapshot = getSnapshot;
		    checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
		  }
		  function subscribeToStore(fiber, inst, subscribe) {
		    return subscribe(function() {
		      checkIfSnapshotChanged(inst) && forceStoreRerender(fiber);
		    });
		  }
		  function checkIfSnapshotChanged(inst) {
		    var latestGetSnapshot = inst.getSnapshot;
		    inst = inst.value;
		    try {
		      var nextValue = latestGetSnapshot();
		      return !objectIs(inst, nextValue);
		    } catch (error) {
		      return true;
		    }
		  }
		  function forceStoreRerender(fiber) {
		    var root = enqueueConcurrentRenderForLane(fiber, 2);
		    null !== root && scheduleUpdateOnFiber(root, fiber, 2);
		  }
		  function mountStateImpl(initialState) {
		    var hook = mountWorkInProgressHook();
		    if ("function" === typeof initialState) {
		      var initialStateInitializer = initialState;
		      initialState = initialStateInitializer();
		      if (shouldDoubleInvokeUserFnsInHooksDEV) {
		        setIsStrictModeForDevtools(true);
		        try {
		          initialStateInitializer();
		        } finally {
		          setIsStrictModeForDevtools(false);
		        }
		      }
		    }
		    hook.memoizedState = hook.baseState = initialState;
		    hook.queue = {
		      pending: null,
		      lanes: 0,
		      dispatch: null,
		      lastRenderedReducer: basicStateReducer,
		      lastRenderedState: initialState
		    };
		    return hook;
		  }
		  function updateOptimisticImpl(hook, current, passthrough, reducer) {
		    hook.baseState = passthrough;
		    return updateReducerImpl(
		      hook,
		      currentHook,
		      "function" === typeof reducer ? reducer : basicStateReducer
		    );
		  }
		  function dispatchActionState(fiber, actionQueue, setPendingState, setState, payload) {
		    if (isRenderPhaseUpdate(fiber)) throw Error(formatProdErrorMessage(485));
		    fiber = actionQueue.action;
		    if (null !== fiber) {
		      var actionNode = {
		        payload,
		        action: fiber,
		        next: null,
		        isTransition: true,
		        status: "pending",
		        value: null,
		        reason: null,
		        listeners: [],
		        then: function(listener) {
		          actionNode.listeners.push(listener);
		        }
		      };
		      null !== ReactSharedInternals.T ? setPendingState(true) : actionNode.isTransition = false;
		      setState(actionNode);
		      setPendingState = actionQueue.pending;
		      null === setPendingState ? (actionNode.next = actionQueue.pending = actionNode, runActionStateAction(actionQueue, actionNode)) : (actionNode.next = setPendingState.next, actionQueue.pending = setPendingState.next = actionNode);
		    }
		  }
		  function runActionStateAction(actionQueue, node) {
		    var action = node.action, payload = node.payload, prevState = actionQueue.state;
		    if (node.isTransition) {
		      var prevTransition = ReactSharedInternals.T, currentTransition = {};
		      ReactSharedInternals.T = currentTransition;
		      try {
		        var returnValue = action(prevState, payload), onStartTransitionFinish = ReactSharedInternals.S;
		        null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
		        handleActionReturnValue(actionQueue, node, returnValue);
		      } catch (error) {
		        onActionError(actionQueue, node, error);
		      } finally {
		        null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
		      }
		    } else
		      try {
		        prevTransition = action(prevState, payload), handleActionReturnValue(actionQueue, node, prevTransition);
		      } catch (error$55) {
		        onActionError(actionQueue, node, error$55);
		      }
		  }
		  function handleActionReturnValue(actionQueue, node, returnValue) {
		    null !== returnValue && "object" === typeof returnValue && "function" === typeof returnValue.then ? returnValue.then(
		      function(nextState) {
		        onActionSuccess(actionQueue, node, nextState);
		      },
		      function(error) {
		        return onActionError(actionQueue, node, error);
		      }
		    ) : onActionSuccess(actionQueue, node, returnValue);
		  }
		  function onActionSuccess(actionQueue, actionNode, nextState) {
		    actionNode.status = "fulfilled";
		    actionNode.value = nextState;
		    notifyActionListeners(actionNode);
		    actionQueue.state = nextState;
		    actionNode = actionQueue.pending;
		    null !== actionNode && (nextState = actionNode.next, nextState === actionNode ? actionQueue.pending = null : (nextState = nextState.next, actionNode.next = nextState, runActionStateAction(actionQueue, nextState)));
		  }
		  function onActionError(actionQueue, actionNode, error) {
		    var last = actionQueue.pending;
		    actionQueue.pending = null;
		    if (null !== last) {
		      last = last.next;
		      do
		        actionNode.status = "rejected", actionNode.reason = error, notifyActionListeners(actionNode), actionNode = actionNode.next;
		      while (actionNode !== last);
		    }
		    actionQueue.action = null;
		  }
		  function notifyActionListeners(actionNode) {
		    actionNode = actionNode.listeners;
		    for (var i = 0; i < actionNode.length; i++) (0, actionNode[i])();
		  }
		  function actionStateReducer(oldState, newState) {
		    return newState;
		  }
		  function mountActionState(action, initialStateProp) {
		    if (isHydrating) {
		      var ssrFormState = workInProgressRoot.formState;
		      if (null !== ssrFormState) {
		        a: {
		          var JSCompiler_inline_result = currentlyRenderingFiber;
		          if (isHydrating) {
		            if (nextHydratableInstance) {
		              var markerInstance = canHydrateFormStateMarker(
		                nextHydratableInstance,
		                rootOrSingletonContext
		              );
		              if (markerInstance) {
		                nextHydratableInstance = getNextHydratableSibling(markerInstance);
		                JSCompiler_inline_result = isFormStateMarkerMatching(markerInstance);
		                break a;
		              }
		            }
		            throwOnHydrationMismatch(JSCompiler_inline_result);
		          }
		          JSCompiler_inline_result = false;
		        }
		        JSCompiler_inline_result && (initialStateProp = ssrFormState[0]);
		      }
		    }
		    ssrFormState = mountWorkInProgressHook();
		    ssrFormState.memoizedState = ssrFormState.baseState = initialStateProp;
		    JSCompiler_inline_result = {
		      pending: null,
		      lanes: 0,
		      dispatch: null,
		      lastRenderedReducer: actionStateReducer,
		      lastRenderedState: initialStateProp
		    };
		    ssrFormState.queue = JSCompiler_inline_result;
		    ssrFormState = dispatchSetState.bind(
		      null,
		      currentlyRenderingFiber,
		      JSCompiler_inline_result
		    );
		    JSCompiler_inline_result.dispatch = ssrFormState;
		    JSCompiler_inline_result = mountStateImpl(false);
		    var setPendingState = dispatchOptimisticSetState.bind(
		      null,
		      currentlyRenderingFiber,
		      false,
		      JSCompiler_inline_result.queue
		    );
		    JSCompiler_inline_result = mountWorkInProgressHook();
		    markerInstance = {
		      state: initialStateProp,
		      dispatch: null,
		      action,
		      pending: null
		    };
		    JSCompiler_inline_result.queue = markerInstance;
		    ssrFormState = dispatchActionState.bind(
		      null,
		      currentlyRenderingFiber,
		      markerInstance,
		      setPendingState,
		      ssrFormState
		    );
		    markerInstance.dispatch = ssrFormState;
		    JSCompiler_inline_result.memoizedState = action;
		    return [initialStateProp, ssrFormState, false];
		  }
		  function updateActionState(action) {
		    var stateHook = updateWorkInProgressHook();
		    return updateActionStateImpl(stateHook, currentHook, action);
		  }
		  function updateActionStateImpl(stateHook, currentStateHook, action) {
		    currentStateHook = updateReducerImpl(
		      stateHook,
		      currentStateHook,
		      actionStateReducer
		    )[0];
		    stateHook = updateReducer(basicStateReducer)[0];
		    if ("object" === typeof currentStateHook && null !== currentStateHook && "function" === typeof currentStateHook.then)
		      try {
		        var state = useThenable(currentStateHook);
		      } catch (x) {
		        if (x === SuspenseException) throw SuspenseActionException;
		        throw x;
		      }
		    else state = currentStateHook;
		    currentStateHook = updateWorkInProgressHook();
		    var actionQueue = currentStateHook.queue, dispatch = actionQueue.dispatch;
		    action !== currentStateHook.memoizedState && (currentlyRenderingFiber.flags |= 2048, pushSimpleEffect(
		      9,
		      { destroy: void 0 },
		      actionStateActionEffect.bind(null, actionQueue, action),
		      null
		    ));
		    return [state, dispatch, stateHook];
		  }
		  function actionStateActionEffect(actionQueue, action) {
		    actionQueue.action = action;
		  }
		  function rerenderActionState(action) {
		    var stateHook = updateWorkInProgressHook(), currentStateHook = currentHook;
		    if (null !== currentStateHook)
		      return updateActionStateImpl(stateHook, currentStateHook, action);
		    updateWorkInProgressHook();
		    stateHook = stateHook.memoizedState;
		    currentStateHook = updateWorkInProgressHook();
		    var dispatch = currentStateHook.queue.dispatch;
		    currentStateHook.memoizedState = action;
		    return [stateHook, dispatch, false];
		  }
		  function pushSimpleEffect(tag, inst, create, deps) {
		    tag = { tag, create, deps, inst, next: null };
		    inst = currentlyRenderingFiber.updateQueue;
		    null === inst && (inst = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = inst);
		    create = inst.lastEffect;
		    null === create ? inst.lastEffect = tag.next = tag : (deps = create.next, create.next = tag, tag.next = deps, inst.lastEffect = tag);
		    return tag;
		  }
		  function updateRef() {
		    return updateWorkInProgressHook().memoizedState;
		  }
		  function mountEffectImpl(fiberFlags, hookFlags, create, deps) {
		    var hook = mountWorkInProgressHook();
		    currentlyRenderingFiber.flags |= fiberFlags;
		    hook.memoizedState = pushSimpleEffect(
		      1 | hookFlags,
		      { destroy: void 0 },
		      create,
		      void 0 === deps ? null : deps
		    );
		  }
		  function updateEffectImpl(fiberFlags, hookFlags, create, deps) {
		    var hook = updateWorkInProgressHook();
		    deps = void 0 === deps ? null : deps;
		    var inst = hook.memoizedState.inst;
		    null !== currentHook && null !== deps && areHookInputsEqual(deps, currentHook.memoizedState.deps) ? hook.memoizedState = pushSimpleEffect(hookFlags, inst, create, deps) : (currentlyRenderingFiber.flags |= fiberFlags, hook.memoizedState = pushSimpleEffect(
		      1 | hookFlags,
		      inst,
		      create,
		      deps
		    ));
		  }
		  function mountEffect(create, deps) {
		    mountEffectImpl(8390656, 8, create, deps);
		  }
		  function updateEffect(create, deps) {
		    updateEffectImpl(2048, 8, create, deps);
		  }
		  function useEffectEventImpl(payload) {
		    currentlyRenderingFiber.flags |= 4;
		    var componentUpdateQueue = currentlyRenderingFiber.updateQueue;
		    if (null === componentUpdateQueue)
		      componentUpdateQueue = createFunctionComponentUpdateQueue(), currentlyRenderingFiber.updateQueue = componentUpdateQueue, componentUpdateQueue.events = [payload];
		    else {
		      var events = componentUpdateQueue.events;
		      null === events ? componentUpdateQueue.events = [payload] : events.push(payload);
		    }
		  }
		  function updateEvent(callback) {
		    var ref = updateWorkInProgressHook().memoizedState;
		    useEffectEventImpl({ ref, nextImpl: callback });
		    return function() {
		      if (0 !== (executionContext & 2))
		        throw Error(formatProdErrorMessage(440));
		      return ref.impl.apply(void 0, arguments);
		    };
		  }
		  function updateInsertionEffect(create, deps) {
		    return updateEffectImpl(4, 2, create, deps);
		  }
		  function updateLayoutEffect(create, deps) {
		    return updateEffectImpl(4, 4, create, deps);
		  }
		  function imperativeHandleEffect(create, ref) {
		    if ("function" === typeof ref) {
		      create = create();
		      var refCleanup = ref(create);
		      return function() {
		        "function" === typeof refCleanup ? refCleanup() : ref(null);
		      };
		    }
		    if (null !== ref && void 0 !== ref)
		      return create = create(), ref.current = create, function() {
		        ref.current = null;
		      };
		  }
		  function updateImperativeHandle(ref, create, deps) {
		    deps = null !== deps && void 0 !== deps ? deps.concat([ref]) : null;
		    updateEffectImpl(
		      4,
		      4,
		      imperativeHandleEffect.bind(null, create, ref),
		      deps
		    );
		  }
		  function mountDebugValue() {
		  }
		  function updateCallback(callback, deps) {
		    var hook = updateWorkInProgressHook();
		    deps = void 0 === deps ? null : deps;
		    var prevState = hook.memoizedState;
		    if (null !== deps && areHookInputsEqual(deps, prevState[1]))
		      return prevState[0];
		    hook.memoizedState = [callback, deps];
		    return callback;
		  }
		  function updateMemo(nextCreate, deps) {
		    var hook = updateWorkInProgressHook();
		    deps = void 0 === deps ? null : deps;
		    var prevState = hook.memoizedState;
		    if (null !== deps && areHookInputsEqual(deps, prevState[1]))
		      return prevState[0];
		    prevState = nextCreate();
		    if (shouldDoubleInvokeUserFnsInHooksDEV) {
		      setIsStrictModeForDevtools(true);
		      try {
		        nextCreate();
		      } finally {
		        setIsStrictModeForDevtools(false);
		      }
		    }
		    hook.memoizedState = [prevState, deps];
		    return prevState;
		  }
		  function mountDeferredValueImpl(hook, value, initialValue) {
		    if (void 0 === initialValue || 0 !== (renderLanes & 1073741824) && 0 === (workInProgressRootRenderLanes & 261930))
		      return hook.memoizedState = value;
		    hook.memoizedState = initialValue;
		    hook = requestDeferredLane();
		    currentlyRenderingFiber.lanes |= hook;
		    workInProgressRootSkippedLanes |= hook;
		    return initialValue;
		  }
		  function updateDeferredValueImpl(hook, prevValue, value, initialValue) {
		    if (objectIs(value, prevValue)) return value;
		    if (null !== currentTreeHiddenStackCursor.current)
		      return hook = mountDeferredValueImpl(hook, value, initialValue), objectIs(hook, prevValue) || (didReceiveUpdate = true), hook;
		    if (0 === (renderLanes & 42) || 0 !== (renderLanes & 1073741824) && 0 === (workInProgressRootRenderLanes & 261930))
		      return didReceiveUpdate = true, hook.memoizedState = value;
		    hook = requestDeferredLane();
		    currentlyRenderingFiber.lanes |= hook;
		    workInProgressRootSkippedLanes |= hook;
		    return prevValue;
		  }
		  function startTransition(fiber, queue, pendingState, finishedState, callback) {
		    var previousPriority = getCurrentUpdatePriority();
		    setCurrentUpdatePriority(
		      0 !== previousPriority && 8 > previousPriority ? previousPriority : 8
		    );
		    var prevTransition = ReactSharedInternals.T, currentTransition = {};
		    ReactSharedInternals.T = currentTransition;
		    dispatchOptimisticSetState(fiber, false, queue, pendingState);
		    try {
		      var returnValue = callback(), onStartTransitionFinish = ReactSharedInternals.S;
		      null !== onStartTransitionFinish && onStartTransitionFinish(currentTransition, returnValue);
		      if (null !== returnValue && "object" === typeof returnValue && "function" === typeof returnValue.then) {
		        var thenableForFinishedState = chainThenableValue(
		          returnValue,
		          finishedState
		        );
		        dispatchSetStateInternal(
		          fiber,
		          queue,
		          thenableForFinishedState,
		          requestUpdateLane(fiber)
		        );
		      } else
		        dispatchSetStateInternal(
		          fiber,
		          queue,
		          finishedState,
		          requestUpdateLane(fiber)
		        );
		    } catch (error) {
		      dispatchSetStateInternal(
		        fiber,
		        queue,
		        { then: function() {
		        }, status: "rejected", reason: error },
		        requestUpdateLane()
		      );
		    } finally {
		      setCurrentUpdatePriority(previousPriority), null !== prevTransition && null !== currentTransition.types && (prevTransition.types = currentTransition.types), ReactSharedInternals.T = prevTransition;
		    }
		  }
		  function ensureFormComponentIsStateful(formFiber) {
		    var existingStateHook = formFiber.memoizedState;
		    if (null !== existingStateHook) return existingStateHook;
		    existingStateHook = {
		      memoizedState: NotPendingTransition,
		      baseState: NotPendingTransition,
		      baseQueue: null,
		      queue: {
		        pending: null,
		        lanes: 0,
		        dispatch: null,
		        lastRenderedReducer: basicStateReducer,
		        lastRenderedState: NotPendingTransition
		      },
		      next: null
		    };
		    var initialResetState = {};
		    existingStateHook.next = {
		      memoizedState: initialResetState,
		      baseState: initialResetState,
		      baseQueue: null,
		      queue: {
		        pending: null,
		        lanes: 0,
		        dispatch: null,
		        lastRenderedReducer: basicStateReducer,
		        lastRenderedState: initialResetState
		      },
		      next: null
		    };
		    formFiber.memoizedState = existingStateHook;
		    formFiber = formFiber.alternate;
		    null !== formFiber && (formFiber.memoizedState = existingStateHook);
		    return existingStateHook;
		  }
		  function useHostTransitionStatus() {
		    return readContext(HostTransitionContext);
		  }
		  function updateId() {
		    return updateWorkInProgressHook().memoizedState;
		  }
		  function updateRefresh() {
		    return updateWorkInProgressHook().memoizedState;
		  }
		  function refreshCache(fiber) {
		    for (var provider = fiber.return; null !== provider; ) {
		      switch (provider.tag) {
		        case 24:
		        case 3:
		          var lane = requestUpdateLane();
		          fiber = createUpdate(lane);
		          var root = enqueueUpdate(provider, fiber, lane);
		          null !== root && (scheduleUpdateOnFiber(root, provider, lane), entangleTransitions(root, provider, lane));
		          provider = { cache: createCache() };
		          fiber.payload = provider;
		          return;
		      }
		      provider = provider.return;
		    }
		  }
		  function dispatchReducerAction(fiber, queue, action) {
		    var lane = requestUpdateLane();
		    action = {
		      lane,
		      revertLane: 0,
		      gesture: null,
		      action,
		      hasEagerState: false,
		      eagerState: null,
		      next: null
		    };
		    isRenderPhaseUpdate(fiber) ? enqueueRenderPhaseUpdate(queue, action) : (action = enqueueConcurrentHookUpdate(fiber, queue, action, lane), null !== action && (scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane)));
		  }
		  function dispatchSetState(fiber, queue, action) {
		    var lane = requestUpdateLane();
		    dispatchSetStateInternal(fiber, queue, action, lane);
		  }
		  function dispatchSetStateInternal(fiber, queue, action, lane) {
		    var update = {
		      lane,
		      revertLane: 0,
		      gesture: null,
		      action,
		      hasEagerState: false,
		      eagerState: null,
		      next: null
		    };
		    if (isRenderPhaseUpdate(fiber)) enqueueRenderPhaseUpdate(queue, update);
		    else {
		      var alternate = fiber.alternate;
		      if (0 === fiber.lanes && (null === alternate || 0 === alternate.lanes) && (alternate = queue.lastRenderedReducer, null !== alternate))
		        try {
		          var currentState = queue.lastRenderedState, eagerState = alternate(currentState, action);
		          update.hasEagerState = true;
		          update.eagerState = eagerState;
		          if (objectIs(eagerState, currentState))
		            return enqueueUpdate$1(fiber, queue, update, 0), null === workInProgressRoot && finishQueueingConcurrentUpdates(), false;
		        } catch (error) {
		        } finally {
		        }
		      action = enqueueConcurrentHookUpdate(fiber, queue, update, lane);
		      if (null !== action)
		        return scheduleUpdateOnFiber(action, fiber, lane), entangleTransitionUpdate(action, queue, lane), true;
		    }
		    return false;
		  }
		  function dispatchOptimisticSetState(fiber, throwIfDuringRender, queue, action) {
		    action = {
		      lane: 2,
		      revertLane: requestTransitionLane(),
		      gesture: null,
		      action,
		      hasEagerState: false,
		      eagerState: null,
		      next: null
		    };
		    if (isRenderPhaseUpdate(fiber)) {
		      if (throwIfDuringRender) throw Error(formatProdErrorMessage(479));
		    } else
		      throwIfDuringRender = enqueueConcurrentHookUpdate(
		        fiber,
		        queue,
		        action,
		        2
		      ), null !== throwIfDuringRender && scheduleUpdateOnFiber(throwIfDuringRender, fiber, 2);
		  }
		  function isRenderPhaseUpdate(fiber) {
		    var alternate = fiber.alternate;
		    return fiber === currentlyRenderingFiber || null !== alternate && alternate === currentlyRenderingFiber;
		  }
		  function enqueueRenderPhaseUpdate(queue, update) {
		    didScheduleRenderPhaseUpdateDuringThisPass = didScheduleRenderPhaseUpdate = true;
		    var pending = queue.pending;
		    null === pending ? update.next = update : (update.next = pending.next, pending.next = update);
		    queue.pending = update;
		  }
		  function entangleTransitionUpdate(root, queue, lane) {
		    if (0 !== (lane & 4194048)) {
		      var queueLanes = queue.lanes;
		      queueLanes &= root.pendingLanes;
		      lane |= queueLanes;
		      queue.lanes = lane;
		      markRootEntangled(root, lane);
		    }
		  }
		  function applyDerivedStateFromProps(workInProgress2, ctor, getDerivedStateFromProps, nextProps) {
		    ctor = workInProgress2.memoizedState;
		    getDerivedStateFromProps = getDerivedStateFromProps(nextProps, ctor);
		    getDerivedStateFromProps = null === getDerivedStateFromProps || void 0 === getDerivedStateFromProps ? ctor : assign({}, ctor, getDerivedStateFromProps);
		    workInProgress2.memoizedState = getDerivedStateFromProps;
		    0 === workInProgress2.lanes && (workInProgress2.updateQueue.baseState = getDerivedStateFromProps);
		  }
		  function checkShouldComponentUpdate(workInProgress2, ctor, oldProps, newProps, oldState, newState, nextContext) {
		    workInProgress2 = workInProgress2.stateNode;
		    return "function" === typeof workInProgress2.shouldComponentUpdate ? workInProgress2.shouldComponentUpdate(newProps, newState, nextContext) : ctor.prototype && ctor.prototype.isPureReactComponent ? !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState) : true;
		  }
		  function callComponentWillReceiveProps(workInProgress2, instance, newProps, nextContext) {
		    workInProgress2 = instance.state;
		    "function" === typeof instance.componentWillReceiveProps && instance.componentWillReceiveProps(newProps, nextContext);
		    "function" === typeof instance.UNSAFE_componentWillReceiveProps && instance.UNSAFE_componentWillReceiveProps(newProps, nextContext);
		    instance.state !== workInProgress2 && classComponentUpdater.enqueueReplaceState(instance, instance.state, null);
		  }
		  function resolveClassComponentProps(Component, baseProps) {
		    var newProps = baseProps;
		    if ("ref" in baseProps) {
		      newProps = {};
		      for (var propName in baseProps)
		        "ref" !== propName && (newProps[propName] = baseProps[propName]);
		    }
		    if (Component = Component.defaultProps) {
		      newProps === baseProps && (newProps = assign({}, newProps));
		      for (var propName$57 in Component)
		        void 0 === newProps[propName$57] && (newProps[propName$57] = Component[propName$57]);
		    }
		    return newProps;
		  }
		  function logUncaughtError(root, errorInfo) {
		    try {
		      var onUncaughtError = root.onUncaughtError;
		      onUncaughtError(errorInfo.value, { componentStack: errorInfo.stack });
		    } catch (e) {
		      setTimeout(function() {
		        throw e;
		      });
		    }
		  }
		  function logCaughtError(root, boundary, errorInfo) {
		    try {
		      var onCaughtError = root.onCaughtError;
		      onCaughtError(errorInfo.value, {
		        componentStack: errorInfo.stack,
		        errorBoundary: 1 === boundary.tag ? boundary.stateNode : null
		      });
		    } catch (e) {
		      setTimeout(function() {
		        throw e;
		      });
		    }
		  }
		  function createRootErrorUpdate(root, errorInfo, lane) {
		    lane = createUpdate(lane);
		    lane.tag = 3;
		    lane.payload = { element: null };
		    lane.callback = function() {
		      logUncaughtError(root, errorInfo);
		    };
		    return lane;
		  }
		  function createClassErrorUpdate(lane) {
		    lane = createUpdate(lane);
		    lane.tag = 3;
		    return lane;
		  }
		  function initializeClassErrorUpdate(update, root, fiber, errorInfo) {
		    var getDerivedStateFromError = fiber.type.getDerivedStateFromError;
		    if ("function" === typeof getDerivedStateFromError) {
		      var error = errorInfo.value;
		      update.payload = function() {
		        return getDerivedStateFromError(error);
		      };
		      update.callback = function() {
		        logCaughtError(root, fiber, errorInfo);
		      };
		    }
		    var inst = fiber.stateNode;
		    null !== inst && "function" === typeof inst.componentDidCatch && (update.callback = function() {
		      logCaughtError(root, fiber, errorInfo);
		      "function" !== typeof getDerivedStateFromError && (null === legacyErrorBoundariesThatAlreadyFailed ? legacyErrorBoundariesThatAlreadyFailed = /* @__PURE__ */ new Set([this]) : legacyErrorBoundariesThatAlreadyFailed.add(this));
		      var stack = errorInfo.stack;
		      this.componentDidCatch(errorInfo.value, {
		        componentStack: null !== stack ? stack : ""
		      });
		    });
		  }
		  function throwException(root, returnFiber, sourceFiber, value, rootRenderLanes) {
		    sourceFiber.flags |= 32768;
		    if (null !== value && "object" === typeof value && "function" === typeof value.then) {
		      returnFiber = sourceFiber.alternate;
		      null !== returnFiber && propagateParentContextChanges(
		        returnFiber,
		        sourceFiber,
		        rootRenderLanes,
		        true
		      );
		      sourceFiber = suspenseHandlerStackCursor.current;
		      if (null !== sourceFiber) {
		        switch (sourceFiber.tag) {
		          case 31:
		          case 13:
		            return null === shellBoundary ? renderDidSuspendDelayIfPossible() : null === sourceFiber.alternate && 0 === workInProgressRootExitStatus && (workInProgressRootExitStatus = 3), sourceFiber.flags &= -257, sourceFiber.flags |= 65536, sourceFiber.lanes = rootRenderLanes, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, null === returnFiber ? sourceFiber.updateQueue = /* @__PURE__ */ new Set([value]) : returnFiber.add(value), attachPingListener(root, value, rootRenderLanes)), false;
		          case 22:
		            return sourceFiber.flags |= 65536, value === noopSuspenseyCommitThenable ? sourceFiber.flags |= 16384 : (returnFiber = sourceFiber.updateQueue, null === returnFiber ? (returnFiber = {
		              transitions: null,
		              markerInstances: null,
		              retryQueue: /* @__PURE__ */ new Set([value])
		            }, sourceFiber.updateQueue = returnFiber) : (sourceFiber = returnFiber.retryQueue, null === sourceFiber ? returnFiber.retryQueue = /* @__PURE__ */ new Set([value]) : sourceFiber.add(value)), attachPingListener(root, value, rootRenderLanes)), false;
		        }
		        throw Error(formatProdErrorMessage(435, sourceFiber.tag));
		      }
		      attachPingListener(root, value, rootRenderLanes);
		      renderDidSuspendDelayIfPossible();
		      return false;
		    }
		    if (isHydrating)
		      return returnFiber = suspenseHandlerStackCursor.current, null !== returnFiber ? (0 === (returnFiber.flags & 65536) && (returnFiber.flags |= 256), returnFiber.flags |= 65536, returnFiber.lanes = rootRenderLanes, value !== HydrationMismatchException && (root = Error(formatProdErrorMessage(422), { cause: value }), queueHydrationError(
		        createCapturedValueAtFiber(root, sourceFiber)
		      ))) : (value !== HydrationMismatchException && (returnFiber = Error(formatProdErrorMessage(423), {
		        cause: value
		      }), queueHydrationError(
		        createCapturedValueAtFiber(returnFiber, sourceFiber)
		      )), root = root.current.alternate, root.flags |= 65536, rootRenderLanes &= -rootRenderLanes, root.lanes |= rootRenderLanes, value = createCapturedValueAtFiber(value, sourceFiber), rootRenderLanes = createRootErrorUpdate(
		        root.stateNode,
		        value,
		        rootRenderLanes
		      ), enqueueCapturedUpdate(root, rootRenderLanes), 4 !== workInProgressRootExitStatus && (workInProgressRootExitStatus = 2)), false;
		    var wrapperError = Error(formatProdErrorMessage(520), { cause: value });
		    wrapperError = createCapturedValueAtFiber(wrapperError, sourceFiber);
		    null === workInProgressRootConcurrentErrors ? workInProgressRootConcurrentErrors = [wrapperError] : workInProgressRootConcurrentErrors.push(wrapperError);
		    4 !== workInProgressRootExitStatus && (workInProgressRootExitStatus = 2);
		    if (null === returnFiber) return true;
		    value = createCapturedValueAtFiber(value, sourceFiber);
		    sourceFiber = returnFiber;
		    do {
		      switch (sourceFiber.tag) {
		        case 3:
		          return sourceFiber.flags |= 65536, root = rootRenderLanes & -rootRenderLanes, sourceFiber.lanes |= root, root = createRootErrorUpdate(sourceFiber.stateNode, value, root), enqueueCapturedUpdate(sourceFiber, root), false;
		        case 1:
		          if (returnFiber = sourceFiber.type, wrapperError = sourceFiber.stateNode, 0 === (sourceFiber.flags & 128) && ("function" === typeof returnFiber.getDerivedStateFromError || null !== wrapperError && "function" === typeof wrapperError.componentDidCatch && (null === legacyErrorBoundariesThatAlreadyFailed || !legacyErrorBoundariesThatAlreadyFailed.has(
		            wrapperError
		          ))))
		            return sourceFiber.flags |= 65536, rootRenderLanes &= -rootRenderLanes, sourceFiber.lanes |= rootRenderLanes, rootRenderLanes = createClassErrorUpdate(rootRenderLanes), initializeClassErrorUpdate(
		              rootRenderLanes,
		              root,
		              sourceFiber,
		              value
		            ), enqueueCapturedUpdate(sourceFiber, rootRenderLanes), false;
		      }
		      sourceFiber = sourceFiber.return;
		    } while (null !== sourceFiber);
		    return false;
		  }
		  function reconcileChildren(current, workInProgress2, nextChildren, renderLanes2) {
		    workInProgress2.child = null === current ? mountChildFibers(workInProgress2, null, nextChildren, renderLanes2) : reconcileChildFibers(
		      workInProgress2,
		      current.child,
		      nextChildren,
		      renderLanes2
		    );
		  }
		  function updateForwardRef(current, workInProgress2, Component, nextProps, renderLanes2) {
		    Component = Component.render;
		    var ref = workInProgress2.ref;
		    if ("ref" in nextProps) {
		      var propsWithoutRef = {};
		      for (var key in nextProps)
		        "ref" !== key && (propsWithoutRef[key] = nextProps[key]);
		    } else propsWithoutRef = nextProps;
		    prepareToReadContext(workInProgress2);
		    nextProps = renderWithHooks(
		      current,
		      workInProgress2,
		      Component,
		      propsWithoutRef,
		      ref,
		      renderLanes2
		    );
		    key = checkDidRenderIdHook();
		    if (null !== current && !didReceiveUpdate)
		      return bailoutHooks(current, workInProgress2, renderLanes2), bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
		    isHydrating && key && pushMaterializedTreeId(workInProgress2);
		    workInProgress2.flags |= 1;
		    reconcileChildren(current, workInProgress2, nextProps, renderLanes2);
		    return workInProgress2.child;
		  }
		  function updateMemoComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
		    if (null === current) {
		      var type = Component.type;
		      if ("function" === typeof type && !shouldConstruct(type) && void 0 === type.defaultProps && null === Component.compare)
		        return workInProgress2.tag = 15, workInProgress2.type = type, updateSimpleMemoComponent(
		          current,
		          workInProgress2,
		          type,
		          nextProps,
		          renderLanes2
		        );
		      current = createFiberFromTypeAndProps(
		        Component.type,
		        null,
		        nextProps,
		        workInProgress2,
		        workInProgress2.mode,
		        renderLanes2
		      );
		      current.ref = workInProgress2.ref;
		      current.return = workInProgress2;
		      return workInProgress2.child = current;
		    }
		    type = current.child;
		    if (!checkScheduledUpdateOrContext(current, renderLanes2)) {
		      var prevProps = type.memoizedProps;
		      Component = Component.compare;
		      Component = null !== Component ? Component : shallowEqual;
		      if (Component(prevProps, nextProps) && current.ref === workInProgress2.ref)
		        return bailoutOnAlreadyFinishedWork(
		          current,
		          workInProgress2,
		          renderLanes2
		        );
		    }
		    workInProgress2.flags |= 1;
		    current = createWorkInProgress(type, nextProps);
		    current.ref = workInProgress2.ref;
		    current.return = workInProgress2;
		    return workInProgress2.child = current;
		  }
		  function updateSimpleMemoComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
		    if (null !== current) {
		      var prevProps = current.memoizedProps;
		      if (shallowEqual(prevProps, nextProps) && current.ref === workInProgress2.ref)
		        if (didReceiveUpdate = false, workInProgress2.pendingProps = nextProps = prevProps, checkScheduledUpdateOrContext(current, renderLanes2))
		          0 !== (current.flags & 131072) && (didReceiveUpdate = true);
		        else
		          return workInProgress2.lanes = current.lanes, bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
		    }
		    return updateFunctionComponent(
		      current,
		      workInProgress2,
		      Component,
		      nextProps,
		      renderLanes2
		    );
		  }
		  function updateOffscreenComponent(current, workInProgress2, renderLanes2, nextProps) {
		    var nextChildren = nextProps.children, prevState = null !== current ? current.memoizedState : null;
		    null === current && null === workInProgress2.stateNode && (workInProgress2.stateNode = {
		      _visibility: 1,
		      _pendingMarkers: null,
		      _retryCache: null,
		      _transitions: null
		    });
		    if ("hidden" === nextProps.mode) {
		      if (0 !== (workInProgress2.flags & 128)) {
		        prevState = null !== prevState ? prevState.baseLanes | renderLanes2 : renderLanes2;
		        if (null !== current) {
		          nextProps = workInProgress2.child = current.child;
		          for (nextChildren = 0; null !== nextProps; )
		            nextChildren = nextChildren | nextProps.lanes | nextProps.childLanes, nextProps = nextProps.sibling;
		          nextProps = nextChildren & ~prevState;
		        } else nextProps = 0, workInProgress2.child = null;
		        return deferHiddenOffscreenComponent(
		          current,
		          workInProgress2,
		          prevState,
		          renderLanes2,
		          nextProps
		        );
		      }
		      if (0 !== (renderLanes2 & 536870912))
		        workInProgress2.memoizedState = { baseLanes: 0, cachePool: null }, null !== current && pushTransition(
		          workInProgress2,
		          null !== prevState ? prevState.cachePool : null
		        ), null !== prevState ? pushHiddenContext(workInProgress2, prevState) : reuseHiddenContextOnStack(), pushOffscreenSuspenseHandler(workInProgress2);
		      else
		        return nextProps = workInProgress2.lanes = 536870912, deferHiddenOffscreenComponent(
		          current,
		          workInProgress2,
		          null !== prevState ? prevState.baseLanes | renderLanes2 : renderLanes2,
		          renderLanes2,
		          nextProps
		        );
		    } else
		      null !== prevState ? (pushTransition(workInProgress2, prevState.cachePool), pushHiddenContext(workInProgress2, prevState), reuseSuspenseHandlerOnStack(), workInProgress2.memoizedState = null) : (null !== current && pushTransition(workInProgress2, null), reuseHiddenContextOnStack(), reuseSuspenseHandlerOnStack());
		    reconcileChildren(current, workInProgress2, nextChildren, renderLanes2);
		    return workInProgress2.child;
		  }
		  function bailoutOffscreenComponent(current, workInProgress2) {
		    null !== current && 22 === current.tag || null !== workInProgress2.stateNode || (workInProgress2.stateNode = {
		      _visibility: 1,
		      _pendingMarkers: null,
		      _retryCache: null,
		      _transitions: null
		    });
		    return workInProgress2.sibling;
		  }
		  function deferHiddenOffscreenComponent(current, workInProgress2, nextBaseLanes, renderLanes2, remainingChildLanes) {
		    var JSCompiler_inline_result = peekCacheFromPool();
		    JSCompiler_inline_result = null === JSCompiler_inline_result ? null : {
		      parent: isPrimaryRenderer ? CacheContext._currentValue : CacheContext._currentValue2,
		      pool: JSCompiler_inline_result
		    };
		    workInProgress2.memoizedState = {
		      baseLanes: nextBaseLanes,
		      cachePool: JSCompiler_inline_result
		    };
		    null !== current && pushTransition(workInProgress2, null);
		    reuseHiddenContextOnStack();
		    pushOffscreenSuspenseHandler(workInProgress2);
		    null !== current && propagateParentContextChanges(current, workInProgress2, renderLanes2, true);
		    workInProgress2.childLanes = remainingChildLanes;
		    return null;
		  }
		  function mountActivityChildren(workInProgress2, nextProps) {
		    nextProps = mountWorkInProgressOffscreenFiber(
		      { mode: nextProps.mode, children: nextProps.children },
		      workInProgress2.mode
		    );
		    nextProps.ref = workInProgress2.ref;
		    workInProgress2.child = nextProps;
		    nextProps.return = workInProgress2;
		    return nextProps;
		  }
		  function retryActivityComponentWithoutHydrating(current, workInProgress2, renderLanes2) {
		    reconcileChildFibers(workInProgress2, current.child, null, renderLanes2);
		    current = mountActivityChildren(
		      workInProgress2,
		      workInProgress2.pendingProps
		    );
		    current.flags |= 2;
		    popSuspenseHandler(workInProgress2);
		    workInProgress2.memoizedState = null;
		    return current;
		  }
		  function updateActivityComponent(current, workInProgress2, renderLanes2) {
		    var nextProps = workInProgress2.pendingProps, didSuspend = 0 !== (workInProgress2.flags & 128);
		    workInProgress2.flags &= -129;
		    if (null === current) {
		      if (isHydrating) {
		        if ("hidden" === nextProps.mode)
		          return current = mountActivityChildren(workInProgress2, nextProps), workInProgress2.lanes = 536870912, bailoutOffscreenComponent(null, current);
		        pushDehydratedActivitySuspenseHandler(workInProgress2);
		        (current = nextHydratableInstance) ? (current = canHydrateActivityInstance(
		          current,
		          rootOrSingletonContext
		        ), null !== current && (workInProgress2.memoizedState = {
		          dehydrated: current,
		          treeContext: null !== treeContextProvider ? { id: treeContextId, overflow: treeContextOverflow } : null,
		          retryLane: 536870912,
		          hydrationErrors: null
		        }, renderLanes2 = createFiberFromDehydratedFragment(current), renderLanes2.return = workInProgress2, workInProgress2.child = renderLanes2, hydrationParentFiber = workInProgress2, nextHydratableInstance = null)) : current = null;
		        if (null === current) throw throwOnHydrationMismatch(workInProgress2);
		        workInProgress2.lanes = 536870912;
		        return null;
		      }
		      return mountActivityChildren(workInProgress2, nextProps);
		    }
		    var prevState = current.memoizedState;
		    if (null !== prevState) {
		      var dehydrated = prevState.dehydrated;
		      pushDehydratedActivitySuspenseHandler(workInProgress2);
		      if (didSuspend)
		        if (workInProgress2.flags & 256)
		          workInProgress2.flags &= -257, workInProgress2 = retryActivityComponentWithoutHydrating(
		            current,
		            workInProgress2,
		            renderLanes2
		          );
		        else if (null !== workInProgress2.memoizedState)
		          workInProgress2.child = current.child, workInProgress2.flags |= 128, workInProgress2 = null;
		        else throw Error(formatProdErrorMessage(558));
		      else if (didReceiveUpdate || propagateParentContextChanges(
		        current,
		        workInProgress2,
		        renderLanes2,
		        false
		      ), didSuspend = 0 !== (renderLanes2 & current.childLanes), didReceiveUpdate || didSuspend) {
		        nextProps = workInProgressRoot;
		        if (null !== nextProps && (dehydrated = getBumpedLaneForHydration(nextProps, renderLanes2), 0 !== dehydrated && dehydrated !== prevState.retryLane))
		          throw prevState.retryLane = dehydrated, enqueueConcurrentRenderForLane(current, dehydrated), scheduleUpdateOnFiber(nextProps, current, dehydrated), SelectiveHydrationException;
		        renderDidSuspendDelayIfPossible();
		        workInProgress2 = retryActivityComponentWithoutHydrating(
		          current,
		          workInProgress2,
		          renderLanes2
		        );
		      } else
		        current = prevState.treeContext, supportsHydration && (nextHydratableInstance = getFirstHydratableChildWithinActivityInstance(dehydrated), hydrationParentFiber = workInProgress2, isHydrating = true, hydrationErrors = null, rootOrSingletonContext = false, null !== current && restoreSuspendedTreeContext(workInProgress2, current)), workInProgress2 = mountActivityChildren(workInProgress2, nextProps), workInProgress2.flags |= 4096;
		      return workInProgress2;
		    }
		    current = createWorkInProgress(current.child, {
		      mode: nextProps.mode,
		      children: nextProps.children
		    });
		    current.ref = workInProgress2.ref;
		    workInProgress2.child = current;
		    current.return = workInProgress2;
		    return current;
		  }
		  function markRef(current, workInProgress2) {
		    var ref = workInProgress2.ref;
		    if (null === ref)
		      null !== current && null !== current.ref && (workInProgress2.flags |= 4194816);
		    else {
		      if ("function" !== typeof ref && "object" !== typeof ref)
		        throw Error(formatProdErrorMessage(284));
		      if (null === current || current.ref !== ref)
		        workInProgress2.flags |= 4194816;
		    }
		  }
		  function updateFunctionComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
		    prepareToReadContext(workInProgress2);
		    Component = renderWithHooks(
		      current,
		      workInProgress2,
		      Component,
		      nextProps,
		      void 0,
		      renderLanes2
		    );
		    nextProps = checkDidRenderIdHook();
		    if (null !== current && !didReceiveUpdate)
		      return bailoutHooks(current, workInProgress2, renderLanes2), bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
		    isHydrating && nextProps && pushMaterializedTreeId(workInProgress2);
		    workInProgress2.flags |= 1;
		    reconcileChildren(current, workInProgress2, Component, renderLanes2);
		    return workInProgress2.child;
		  }
		  function replayFunctionComponent(current, workInProgress2, nextProps, Component, secondArg, renderLanes2) {
		    prepareToReadContext(workInProgress2);
		    workInProgress2.updateQueue = null;
		    nextProps = renderWithHooksAgain(
		      workInProgress2,
		      Component,
		      nextProps,
		      secondArg
		    );
		    finishRenderingHooks(current);
		    Component = checkDidRenderIdHook();
		    if (null !== current && !didReceiveUpdate)
		      return bailoutHooks(current, workInProgress2, renderLanes2), bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
		    isHydrating && Component && pushMaterializedTreeId(workInProgress2);
		    workInProgress2.flags |= 1;
		    reconcileChildren(current, workInProgress2, nextProps, renderLanes2);
		    return workInProgress2.child;
		  }
		  function updateClassComponent(current, workInProgress2, Component, nextProps, renderLanes2) {
		    prepareToReadContext(workInProgress2);
		    if (null === workInProgress2.stateNode) {
		      var context = emptyContextObject, contextType = Component.contextType;
		      "object" === typeof contextType && null !== contextType && (context = readContext(contextType));
		      context = new Component(nextProps, context);
		      workInProgress2.memoizedState = null !== context.state && void 0 !== context.state ? context.state : null;
		      context.updater = classComponentUpdater;
		      workInProgress2.stateNode = context;
		      context._reactInternals = workInProgress2;
		      context = workInProgress2.stateNode;
		      context.props = nextProps;
		      context.state = workInProgress2.memoizedState;
		      context.refs = {};
		      initializeUpdateQueue(workInProgress2);
		      contextType = Component.contextType;
		      context.context = "object" === typeof contextType && null !== contextType ? readContext(contextType) : emptyContextObject;
		      context.state = workInProgress2.memoizedState;
		      contextType = Component.getDerivedStateFromProps;
		      "function" === typeof contextType && (applyDerivedStateFromProps(
		        workInProgress2,
		        Component,
		        contextType,
		        nextProps
		      ), context.state = workInProgress2.memoizedState);
		      "function" === typeof Component.getDerivedStateFromProps || "function" === typeof context.getSnapshotBeforeUpdate || "function" !== typeof context.UNSAFE_componentWillMount && "function" !== typeof context.componentWillMount || (contextType = context.state, "function" === typeof context.componentWillMount && context.componentWillMount(), "function" === typeof context.UNSAFE_componentWillMount && context.UNSAFE_componentWillMount(), contextType !== context.state && classComponentUpdater.enqueueReplaceState(
		        context,
		        context.state,
		        null
		      ), processUpdateQueue(workInProgress2, nextProps, context, renderLanes2), suspendIfUpdateReadFromEntangledAsyncAction(), context.state = workInProgress2.memoizedState);
		      "function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308);
		      nextProps = true;
		    } else if (null === current) {
		      context = workInProgress2.stateNode;
		      var unresolvedOldProps = workInProgress2.memoizedProps, oldProps = resolveClassComponentProps(Component, unresolvedOldProps);
		      context.props = oldProps;
		      var oldContext = context.context, contextType$jscomp$0 = Component.contextType;
		      contextType = emptyContextObject;
		      "object" === typeof contextType$jscomp$0 && null !== contextType$jscomp$0 && (contextType = readContext(contextType$jscomp$0));
		      var getDerivedStateFromProps = Component.getDerivedStateFromProps;
		      contextType$jscomp$0 = "function" === typeof getDerivedStateFromProps || "function" === typeof context.getSnapshotBeforeUpdate;
		      unresolvedOldProps = workInProgress2.pendingProps !== unresolvedOldProps;
		      contextType$jscomp$0 || "function" !== typeof context.UNSAFE_componentWillReceiveProps && "function" !== typeof context.componentWillReceiveProps || (unresolvedOldProps || oldContext !== contextType) && callComponentWillReceiveProps(
		        workInProgress2,
		        context,
		        nextProps,
		        contextType
		      );
		      hasForceUpdate = false;
		      var oldState = workInProgress2.memoizedState;
		      context.state = oldState;
		      processUpdateQueue(workInProgress2, nextProps, context, renderLanes2);
		      suspendIfUpdateReadFromEntangledAsyncAction();
		      oldContext = workInProgress2.memoizedState;
		      unresolvedOldProps || oldState !== oldContext || hasForceUpdate ? ("function" === typeof getDerivedStateFromProps && (applyDerivedStateFromProps(
		        workInProgress2,
		        Component,
		        getDerivedStateFromProps,
		        nextProps
		      ), oldContext = workInProgress2.memoizedState), (oldProps = hasForceUpdate || checkShouldComponentUpdate(
		        workInProgress2,
		        Component,
		        oldProps,
		        nextProps,
		        oldState,
		        oldContext,
		        contextType
		      )) ? (contextType$jscomp$0 || "function" !== typeof context.UNSAFE_componentWillMount && "function" !== typeof context.componentWillMount || ("function" === typeof context.componentWillMount && context.componentWillMount(), "function" === typeof context.UNSAFE_componentWillMount && context.UNSAFE_componentWillMount()), "function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308)) : ("function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308), workInProgress2.memoizedProps = nextProps, workInProgress2.memoizedState = oldContext), context.props = nextProps, context.state = oldContext, context.context = contextType, nextProps = oldProps) : ("function" === typeof context.componentDidMount && (workInProgress2.flags |= 4194308), nextProps = false);
		    } else {
		      context = workInProgress2.stateNode;
		      cloneUpdateQueue(current, workInProgress2);
		      contextType = workInProgress2.memoizedProps;
		      contextType$jscomp$0 = resolveClassComponentProps(Component, contextType);
		      context.props = contextType$jscomp$0;
		      getDerivedStateFromProps = workInProgress2.pendingProps;
		      oldState = context.context;
		      oldContext = Component.contextType;
		      oldProps = emptyContextObject;
		      "object" === typeof oldContext && null !== oldContext && (oldProps = readContext(oldContext));
		      unresolvedOldProps = Component.getDerivedStateFromProps;
		      (oldContext = "function" === typeof unresolvedOldProps || "function" === typeof context.getSnapshotBeforeUpdate) || "function" !== typeof context.UNSAFE_componentWillReceiveProps && "function" !== typeof context.componentWillReceiveProps || (contextType !== getDerivedStateFromProps || oldState !== oldProps) && callComponentWillReceiveProps(
		        workInProgress2,
		        context,
		        nextProps,
		        oldProps
		      );
		      hasForceUpdate = false;
		      oldState = workInProgress2.memoizedState;
		      context.state = oldState;
		      processUpdateQueue(workInProgress2, nextProps, context, renderLanes2);
		      suspendIfUpdateReadFromEntangledAsyncAction();
		      var newState = workInProgress2.memoizedState;
		      contextType !== getDerivedStateFromProps || oldState !== newState || hasForceUpdate || null !== current && null !== current.dependencies && checkIfContextChanged(current.dependencies) ? ("function" === typeof unresolvedOldProps && (applyDerivedStateFromProps(
		        workInProgress2,
		        Component,
		        unresolvedOldProps,
		        nextProps
		      ), newState = workInProgress2.memoizedState), (contextType$jscomp$0 = hasForceUpdate || checkShouldComponentUpdate(
		        workInProgress2,
		        Component,
		        contextType$jscomp$0,
		        nextProps,
		        oldState,
		        newState,
		        oldProps
		      ) || null !== current && null !== current.dependencies && checkIfContextChanged(current.dependencies)) ? (oldContext || "function" !== typeof context.UNSAFE_componentWillUpdate && "function" !== typeof context.componentWillUpdate || ("function" === typeof context.componentWillUpdate && context.componentWillUpdate(nextProps, newState, oldProps), "function" === typeof context.UNSAFE_componentWillUpdate && context.UNSAFE_componentWillUpdate(
		        nextProps,
		        newState,
		        oldProps
		      )), "function" === typeof context.componentDidUpdate && (workInProgress2.flags |= 4), "function" === typeof context.getSnapshotBeforeUpdate && (workInProgress2.flags |= 1024)) : ("function" !== typeof context.componentDidUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 4), "function" !== typeof context.getSnapshotBeforeUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 1024), workInProgress2.memoizedProps = nextProps, workInProgress2.memoizedState = newState), context.props = nextProps, context.state = newState, context.context = oldProps, nextProps = contextType$jscomp$0) : ("function" !== typeof context.componentDidUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 4), "function" !== typeof context.getSnapshotBeforeUpdate || contextType === current.memoizedProps && oldState === current.memoizedState || (workInProgress2.flags |= 1024), nextProps = false);
		    }
		    context = nextProps;
		    markRef(current, workInProgress2);
		    nextProps = 0 !== (workInProgress2.flags & 128);
		    context || nextProps ? (context = workInProgress2.stateNode, Component = nextProps && "function" !== typeof Component.getDerivedStateFromError ? null : context.render(), workInProgress2.flags |= 1, null !== current && nextProps ? (workInProgress2.child = reconcileChildFibers(
		      workInProgress2,
		      current.child,
		      null,
		      renderLanes2
		    ), workInProgress2.child = reconcileChildFibers(
		      workInProgress2,
		      null,
		      Component,
		      renderLanes2
		    )) : reconcileChildren(current, workInProgress2, Component, renderLanes2), workInProgress2.memoizedState = context.state, current = workInProgress2.child) : current = bailoutOnAlreadyFinishedWork(
		      current,
		      workInProgress2,
		      renderLanes2
		    );
		    return current;
		  }
		  function mountHostRootWithoutHydrating(current, workInProgress2, nextChildren, renderLanes2) {
		    resetHydrationState();
		    workInProgress2.flags |= 256;
		    reconcileChildren(current, workInProgress2, nextChildren, renderLanes2);
		    return workInProgress2.child;
		  }
		  function mountSuspenseOffscreenState(renderLanes2) {
		    return { baseLanes: renderLanes2, cachePool: getSuspendedCache() };
		  }
		  function getRemainingWorkInPrimaryTree(current, primaryTreeDidDefer, renderLanes2) {
		    current = null !== current ? current.childLanes & ~renderLanes2 : 0;
		    primaryTreeDidDefer && (current |= workInProgressDeferredLane);
		    return current;
		  }
		  function updateSuspenseComponent(current, workInProgress2, renderLanes2) {
		    var nextProps = workInProgress2.pendingProps, showFallback = false, didSuspend = 0 !== (workInProgress2.flags & 128), JSCompiler_temp;
		    (JSCompiler_temp = didSuspend) || (JSCompiler_temp = null !== current && null === current.memoizedState ? false : 0 !== (suspenseStackCursor.current & 2));
		    JSCompiler_temp && (showFallback = true, workInProgress2.flags &= -129);
		    JSCompiler_temp = 0 !== (workInProgress2.flags & 32);
		    workInProgress2.flags &= -33;
		    if (null === current) {
		      if (isHydrating) {
		        showFallback ? pushPrimaryTreeSuspenseHandler(workInProgress2) : reuseSuspenseHandlerOnStack();
		        (current = nextHydratableInstance) ? (current = canHydrateSuspenseInstance(
		          current,
		          rootOrSingletonContext
		        ), null !== current && (workInProgress2.memoizedState = {
		          dehydrated: current,
		          treeContext: null !== treeContextProvider ? { id: treeContextId, overflow: treeContextOverflow } : null,
		          retryLane: 536870912,
		          hydrationErrors: null
		        }, renderLanes2 = createFiberFromDehydratedFragment(current), renderLanes2.return = workInProgress2, workInProgress2.child = renderLanes2, hydrationParentFiber = workInProgress2, nextHydratableInstance = null)) : current = null;
		        if (null === current) throw throwOnHydrationMismatch(workInProgress2);
		        isSuspenseInstanceFallback(current) ? workInProgress2.lanes = 32 : workInProgress2.lanes = 536870912;
		        return null;
		      }
		      var nextPrimaryChildren = nextProps.children;
		      nextProps = nextProps.fallback;
		      if (showFallback)
		        return reuseSuspenseHandlerOnStack(), showFallback = workInProgress2.mode, nextPrimaryChildren = mountWorkInProgressOffscreenFiber(
		          { mode: "hidden", children: nextPrimaryChildren },
		          showFallback
		        ), nextProps = createFiberFromFragment(
		          nextProps,
		          showFallback,
		          renderLanes2,
		          null
		        ), nextPrimaryChildren.return = workInProgress2, nextProps.return = workInProgress2, nextPrimaryChildren.sibling = nextProps, workInProgress2.child = nextPrimaryChildren, nextProps = workInProgress2.child, nextProps.memoizedState = mountSuspenseOffscreenState(renderLanes2), nextProps.childLanes = getRemainingWorkInPrimaryTree(
		          current,
		          JSCompiler_temp,
		          renderLanes2
		        ), workInProgress2.memoizedState = SUSPENDED_MARKER, bailoutOffscreenComponent(null, nextProps);
		      pushPrimaryTreeSuspenseHandler(workInProgress2);
		      return mountSuspensePrimaryChildren(workInProgress2, nextPrimaryChildren);
		    }
		    var prevState = current.memoizedState;
		    if (null !== prevState && (nextPrimaryChildren = prevState.dehydrated, null !== nextPrimaryChildren)) {
		      if (didSuspend)
		        workInProgress2.flags & 256 ? (pushPrimaryTreeSuspenseHandler(workInProgress2), workInProgress2.flags &= -257, workInProgress2 = retrySuspenseComponentWithoutHydrating(
		          current,
		          workInProgress2,
		          renderLanes2
		        )) : null !== workInProgress2.memoizedState ? (reuseSuspenseHandlerOnStack(), workInProgress2.child = current.child, workInProgress2.flags |= 128, workInProgress2 = null) : (reuseSuspenseHandlerOnStack(), nextPrimaryChildren = nextProps.fallback, showFallback = workInProgress2.mode, nextProps = mountWorkInProgressOffscreenFiber(
		          { mode: "visible", children: nextProps.children },
		          showFallback
		        ), nextPrimaryChildren = createFiberFromFragment(
		          nextPrimaryChildren,
		          showFallback,
		          renderLanes2,
		          null
		        ), nextPrimaryChildren.flags |= 2, nextProps.return = workInProgress2, nextPrimaryChildren.return = workInProgress2, nextProps.sibling = nextPrimaryChildren, workInProgress2.child = nextProps, reconcileChildFibers(
		          workInProgress2,
		          current.child,
		          null,
		          renderLanes2
		        ), nextProps = workInProgress2.child, nextProps.memoizedState = mountSuspenseOffscreenState(renderLanes2), nextProps.childLanes = getRemainingWorkInPrimaryTree(
		          current,
		          JSCompiler_temp,
		          renderLanes2
		        ), workInProgress2.memoizedState = SUSPENDED_MARKER, workInProgress2 = bailoutOffscreenComponent(null, nextProps));
		      else if (pushPrimaryTreeSuspenseHandler(workInProgress2), isSuspenseInstanceFallback(nextPrimaryChildren))
		        JSCompiler_temp = getSuspenseInstanceFallbackErrorDetails(nextPrimaryChildren).digest, nextProps = Error(formatProdErrorMessage(419)), nextProps.stack = "", nextProps.digest = JSCompiler_temp, queueHydrationError({ value: nextProps, source: null, stack: null }), workInProgress2 = retrySuspenseComponentWithoutHydrating(
		          current,
		          workInProgress2,
		          renderLanes2
		        );
		      else if (didReceiveUpdate || propagateParentContextChanges(
		        current,
		        workInProgress2,
		        renderLanes2,
		        false
		      ), JSCompiler_temp = 0 !== (renderLanes2 & current.childLanes), didReceiveUpdate || JSCompiler_temp) {
		        JSCompiler_temp = workInProgressRoot;
		        if (null !== JSCompiler_temp && (nextProps = getBumpedLaneForHydration(
		          JSCompiler_temp,
		          renderLanes2
		        ), 0 !== nextProps && nextProps !== prevState.retryLane))
		          throw prevState.retryLane = nextProps, enqueueConcurrentRenderForLane(current, nextProps), scheduleUpdateOnFiber(JSCompiler_temp, current, nextProps), SelectiveHydrationException;
		        isSuspenseInstancePending(nextPrimaryChildren) || renderDidSuspendDelayIfPossible();
		        workInProgress2 = retrySuspenseComponentWithoutHydrating(
		          current,
		          workInProgress2,
		          renderLanes2
		        );
		      } else
		        isSuspenseInstancePending(nextPrimaryChildren) ? (workInProgress2.flags |= 192, workInProgress2.child = current.child, workInProgress2 = null) : (current = prevState.treeContext, supportsHydration && (nextHydratableInstance = getFirstHydratableChildWithinSuspenseInstance(
		          nextPrimaryChildren
		        ), hydrationParentFiber = workInProgress2, isHydrating = true, hydrationErrors = null, rootOrSingletonContext = false, null !== current && restoreSuspendedTreeContext(workInProgress2, current)), workInProgress2 = mountSuspensePrimaryChildren(
		          workInProgress2,
		          nextProps.children
		        ), workInProgress2.flags |= 4096);
		      return workInProgress2;
		    }
		    if (showFallback)
		      return reuseSuspenseHandlerOnStack(), nextPrimaryChildren = nextProps.fallback, showFallback = workInProgress2.mode, prevState = current.child, didSuspend = prevState.sibling, nextProps = createWorkInProgress(prevState, {
		        mode: "hidden",
		        children: nextProps.children
		      }), nextProps.subtreeFlags = prevState.subtreeFlags & 65011712, null !== didSuspend ? nextPrimaryChildren = createWorkInProgress(
		        didSuspend,
		        nextPrimaryChildren
		      ) : (nextPrimaryChildren = createFiberFromFragment(
		        nextPrimaryChildren,
		        showFallback,
		        renderLanes2,
		        null
		      ), nextPrimaryChildren.flags |= 2), nextPrimaryChildren.return = workInProgress2, nextProps.return = workInProgress2, nextProps.sibling = nextPrimaryChildren, workInProgress2.child = nextProps, bailoutOffscreenComponent(null, nextProps), nextProps = workInProgress2.child, nextPrimaryChildren = current.child.memoizedState, null === nextPrimaryChildren ? nextPrimaryChildren = mountSuspenseOffscreenState(renderLanes2) : (showFallback = nextPrimaryChildren.cachePool, null !== showFallback ? (prevState = isPrimaryRenderer ? CacheContext._currentValue : CacheContext._currentValue2, showFallback = showFallback.parent !== prevState ? { parent: prevState, pool: prevState } : showFallback) : showFallback = getSuspendedCache(), nextPrimaryChildren = {
		        baseLanes: nextPrimaryChildren.baseLanes | renderLanes2,
		        cachePool: showFallback
		      }), nextProps.memoizedState = nextPrimaryChildren, nextProps.childLanes = getRemainingWorkInPrimaryTree(
		        current,
		        JSCompiler_temp,
		        renderLanes2
		      ), workInProgress2.memoizedState = SUSPENDED_MARKER, bailoutOffscreenComponent(current.child, nextProps);
		    pushPrimaryTreeSuspenseHandler(workInProgress2);
		    renderLanes2 = current.child;
		    current = renderLanes2.sibling;
		    renderLanes2 = createWorkInProgress(renderLanes2, {
		      mode: "visible",
		      children: nextProps.children
		    });
		    renderLanes2.return = workInProgress2;
		    renderLanes2.sibling = null;
		    null !== current && (JSCompiler_temp = workInProgress2.deletions, null === JSCompiler_temp ? (workInProgress2.deletions = [current], workInProgress2.flags |= 16) : JSCompiler_temp.push(current));
		    workInProgress2.child = renderLanes2;
		    workInProgress2.memoizedState = null;
		    return renderLanes2;
		  }
		  function mountSuspensePrimaryChildren(workInProgress2, primaryChildren) {
		    primaryChildren = mountWorkInProgressOffscreenFiber(
		      { mode: "visible", children: primaryChildren },
		      workInProgress2.mode
		    );
		    primaryChildren.return = workInProgress2;
		    return workInProgress2.child = primaryChildren;
		  }
		  function mountWorkInProgressOffscreenFiber(offscreenProps, mode) {
		    offscreenProps = createFiber(22, offscreenProps, null, mode);
		    offscreenProps.lanes = 0;
		    return offscreenProps;
		  }
		  function retrySuspenseComponentWithoutHydrating(current, workInProgress2, renderLanes2) {
		    reconcileChildFibers(workInProgress2, current.child, null, renderLanes2);
		    current = mountSuspensePrimaryChildren(
		      workInProgress2,
		      workInProgress2.pendingProps.children
		    );
		    current.flags |= 2;
		    workInProgress2.memoizedState = null;
		    return current;
		  }
		  function scheduleSuspenseWorkOnFiber(fiber, renderLanes2, propagationRoot) {
		    fiber.lanes |= renderLanes2;
		    var alternate = fiber.alternate;
		    null !== alternate && (alternate.lanes |= renderLanes2);
		    scheduleContextWorkOnParentPath(fiber.return, renderLanes2, propagationRoot);
		  }
		  function initSuspenseListRenderState(workInProgress2, isBackwards, tail, lastContentRow, tailMode, treeForkCount2) {
		    var renderState = workInProgress2.memoizedState;
		    null === renderState ? workInProgress2.memoizedState = {
		      isBackwards,
		      rendering: null,
		      renderingStartTime: 0,
		      last: lastContentRow,
		      tail,
		      tailMode,
		      treeForkCount: treeForkCount2
		    } : (renderState.isBackwards = isBackwards, renderState.rendering = null, renderState.renderingStartTime = 0, renderState.last = lastContentRow, renderState.tail = tail, renderState.tailMode = tailMode, renderState.treeForkCount = treeForkCount2);
		  }
		  function updateSuspenseListComponent(current, workInProgress2, renderLanes2) {
		    var nextProps = workInProgress2.pendingProps, revealOrder = nextProps.revealOrder, tailMode = nextProps.tail;
		    nextProps = nextProps.children;
		    var suspenseContext = suspenseStackCursor.current, shouldForceFallback = 0 !== (suspenseContext & 2);
		    shouldForceFallback ? (suspenseContext = suspenseContext & 1 | 2, workInProgress2.flags |= 128) : suspenseContext &= 1;
		    push(suspenseStackCursor, suspenseContext);
		    reconcileChildren(current, workInProgress2, nextProps, renderLanes2);
		    nextProps = isHydrating ? treeForkCount : 0;
		    if (!shouldForceFallback && null !== current && 0 !== (current.flags & 128))
		      a: for (current = workInProgress2.child; null !== current; ) {
		        if (13 === current.tag)
		          null !== current.memoizedState && scheduleSuspenseWorkOnFiber(current, renderLanes2, workInProgress2);
		        else if (19 === current.tag)
		          scheduleSuspenseWorkOnFiber(current, renderLanes2, workInProgress2);
		        else if (null !== current.child) {
		          current.child.return = current;
		          current = current.child;
		          continue;
		        }
		        if (current === workInProgress2) break a;
		        for (; null === current.sibling; ) {
		          if (null === current.return || current.return === workInProgress2)
		            break a;
		          current = current.return;
		        }
		        current.sibling.return = current.return;
		        current = current.sibling;
		      }
		    switch (revealOrder) {
		      case "forwards":
		        renderLanes2 = workInProgress2.child;
		        for (revealOrder = null; null !== renderLanes2; )
		          current = renderLanes2.alternate, null !== current && null === findFirstSuspended(current) && (revealOrder = renderLanes2), renderLanes2 = renderLanes2.sibling;
		        renderLanes2 = revealOrder;
		        null === renderLanes2 ? (revealOrder = workInProgress2.child, workInProgress2.child = null) : (revealOrder = renderLanes2.sibling, renderLanes2.sibling = null);
		        initSuspenseListRenderState(
		          workInProgress2,
		          false,
		          revealOrder,
		          renderLanes2,
		          tailMode,
		          nextProps
		        );
		        break;
		      case "backwards":
		      case "unstable_legacy-backwards":
		        renderLanes2 = null;
		        revealOrder = workInProgress2.child;
		        for (workInProgress2.child = null; null !== revealOrder; ) {
		          current = revealOrder.alternate;
		          if (null !== current && null === findFirstSuspended(current)) {
		            workInProgress2.child = revealOrder;
		            break;
		          }
		          current = revealOrder.sibling;
		          revealOrder.sibling = renderLanes2;
		          renderLanes2 = revealOrder;
		          revealOrder = current;
		        }
		        initSuspenseListRenderState(
		          workInProgress2,
		          true,
		          renderLanes2,
		          null,
		          tailMode,
		          nextProps
		        );
		        break;
		      case "together":
		        initSuspenseListRenderState(
		          workInProgress2,
		          false,
		          null,
		          null,
		          void 0,
		          nextProps
		        );
		        break;
		      default:
		        workInProgress2.memoizedState = null;
		    }
		    return workInProgress2.child;
		  }
		  function bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2) {
		    null !== current && (workInProgress2.dependencies = current.dependencies);
		    workInProgressRootSkippedLanes |= workInProgress2.lanes;
		    if (0 === (renderLanes2 & workInProgress2.childLanes))
		      if (null !== current) {
		        if (propagateParentContextChanges(
		          current,
		          workInProgress2,
		          renderLanes2,
		          false
		        ), 0 === (renderLanes2 & workInProgress2.childLanes))
		          return null;
		      } else return null;
		    if (null !== current && workInProgress2.child !== current.child)
		      throw Error(formatProdErrorMessage(153));
		    if (null !== workInProgress2.child) {
		      current = workInProgress2.child;
		      renderLanes2 = createWorkInProgress(current, current.pendingProps);
		      workInProgress2.child = renderLanes2;
		      for (renderLanes2.return = workInProgress2; null !== current.sibling; )
		        current = current.sibling, renderLanes2 = renderLanes2.sibling = createWorkInProgress(current, current.pendingProps), renderLanes2.return = workInProgress2;
		      renderLanes2.sibling = null;
		    }
		    return workInProgress2.child;
		  }
		  function checkScheduledUpdateOrContext(current, renderLanes2) {
		    if (0 !== (current.lanes & renderLanes2)) return true;
		    current = current.dependencies;
		    return null !== current && checkIfContextChanged(current) ? true : false;
		  }
		  function attemptEarlyBailoutIfNoScheduledUpdate(current, workInProgress2, renderLanes2) {
		    switch (workInProgress2.tag) {
		      case 3:
		        pushHostContainer(
		          workInProgress2,
		          workInProgress2.stateNode.containerInfo
		        );
		        pushProvider(workInProgress2, CacheContext, current.memoizedState.cache);
		        resetHydrationState();
		        break;
		      case 27:
		      case 5:
		        pushHostContext(workInProgress2);
		        break;
		      case 4:
		        pushHostContainer(
		          workInProgress2,
		          workInProgress2.stateNode.containerInfo
		        );
		        break;
		      case 10:
		        pushProvider(
		          workInProgress2,
		          workInProgress2.type,
		          workInProgress2.memoizedProps.value
		        );
		        break;
		      case 31:
		        if (null !== workInProgress2.memoizedState)
		          return workInProgress2.flags |= 128, pushDehydratedActivitySuspenseHandler(workInProgress2), null;
		        break;
		      case 13:
		        var state$82 = workInProgress2.memoizedState;
		        if (null !== state$82) {
		          if (null !== state$82.dehydrated)
		            return pushPrimaryTreeSuspenseHandler(workInProgress2), workInProgress2.flags |= 128, null;
		          if (0 !== (renderLanes2 & workInProgress2.child.childLanes))
		            return updateSuspenseComponent(
		              current,
		              workInProgress2,
		              renderLanes2
		            );
		          pushPrimaryTreeSuspenseHandler(workInProgress2);
		          current = bailoutOnAlreadyFinishedWork(
		            current,
		            workInProgress2,
		            renderLanes2
		          );
		          return null !== current ? current.sibling : null;
		        }
		        pushPrimaryTreeSuspenseHandler(workInProgress2);
		        break;
		      case 19:
		        var didSuspendBefore = 0 !== (current.flags & 128);
		        state$82 = 0 !== (renderLanes2 & workInProgress2.childLanes);
		        state$82 || (propagateParentContextChanges(
		          current,
		          workInProgress2,
		          renderLanes2,
		          false
		        ), state$82 = 0 !== (renderLanes2 & workInProgress2.childLanes));
		        if (didSuspendBefore) {
		          if (state$82)
		            return updateSuspenseListComponent(
		              current,
		              workInProgress2,
		              renderLanes2
		            );
		          workInProgress2.flags |= 128;
		        }
		        didSuspendBefore = workInProgress2.memoizedState;
		        null !== didSuspendBefore && (didSuspendBefore.rendering = null, didSuspendBefore.tail = null, didSuspendBefore.lastEffect = null);
		        push(suspenseStackCursor, suspenseStackCursor.current);
		        if (state$82) break;
		        else return null;
		      case 22:
		        return workInProgress2.lanes = 0, updateOffscreenComponent(
		          current,
		          workInProgress2,
		          renderLanes2,
		          workInProgress2.pendingProps
		        );
		      case 24:
		        pushProvider(workInProgress2, CacheContext, current.memoizedState.cache);
		    }
		    return bailoutOnAlreadyFinishedWork(current, workInProgress2, renderLanes2);
		  }
		  function beginWork(current, workInProgress2, renderLanes2) {
		    if (null !== current)
		      if (current.memoizedProps !== workInProgress2.pendingProps)
		        didReceiveUpdate = true;
		      else {
		        if (!checkScheduledUpdateOrContext(current, renderLanes2) && 0 === (workInProgress2.flags & 128))
		          return didReceiveUpdate = false, attemptEarlyBailoutIfNoScheduledUpdate(
		            current,
		            workInProgress2,
		            renderLanes2
		          );
		        didReceiveUpdate = 0 !== (current.flags & 131072) ? true : false;
		      }
		    else
		      didReceiveUpdate = false, isHydrating && 0 !== (workInProgress2.flags & 1048576) && pushTreeId(workInProgress2, treeForkCount, workInProgress2.index);
		    workInProgress2.lanes = 0;
		    switch (workInProgress2.tag) {
		      case 16:
		        a: {
		          var props = workInProgress2.pendingProps;
		          current = resolveLazy(workInProgress2.elementType);
		          workInProgress2.type = current;
		          if ("function" === typeof current)
		            shouldConstruct(current) ? (props = resolveClassComponentProps(current, props), workInProgress2.tag = 1, workInProgress2 = updateClassComponent(
		              null,
		              workInProgress2,
		              current,
		              props,
		              renderLanes2
		            )) : (workInProgress2.tag = 0, workInProgress2 = updateFunctionComponent(
		              null,
		              workInProgress2,
		              current,
		              props,
		              renderLanes2
		            ));
		          else {
		            if (void 0 !== current && null !== current) {
		              var $$typeof = current.$$typeof;
		              if ($$typeof === REACT_FORWARD_REF_TYPE) {
		                workInProgress2.tag = 11;
		                workInProgress2 = updateForwardRef(
		                  null,
		                  workInProgress2,
		                  current,
		                  props,
		                  renderLanes2
		                );
		                break a;
		              } else if ($$typeof === REACT_MEMO_TYPE) {
		                workInProgress2.tag = 14;
		                workInProgress2 = updateMemoComponent(
		                  null,
		                  workInProgress2,
		                  current,
		                  props,
		                  renderLanes2
		                );
		                break a;
		              }
		            }
		            workInProgress2 = getComponentNameFromType(current) || current;
		            throw Error(formatProdErrorMessage(306, workInProgress2, ""));
		          }
		        }
		        return workInProgress2;
		      case 0:
		        return updateFunctionComponent(
		          current,
		          workInProgress2,
		          workInProgress2.type,
		          workInProgress2.pendingProps,
		          renderLanes2
		        );
		      case 1:
		        return props = workInProgress2.type, $$typeof = resolveClassComponentProps(
		          props,
		          workInProgress2.pendingProps
		        ), updateClassComponent(
		          current,
		          workInProgress2,
		          props,
		          $$typeof,
		          renderLanes2
		        );
		      case 3:
		        a: {
		          pushHostContainer(
		            workInProgress2,
		            workInProgress2.stateNode.containerInfo
		          );
		          if (null === current) throw Error(formatProdErrorMessage(387));
		          var nextProps = workInProgress2.pendingProps;
		          $$typeof = workInProgress2.memoizedState;
		          props = $$typeof.element;
		          cloneUpdateQueue(current, workInProgress2);
		          processUpdateQueue(workInProgress2, nextProps, null, renderLanes2);
		          var nextState = workInProgress2.memoizedState;
		          nextProps = nextState.cache;
		          pushProvider(workInProgress2, CacheContext, nextProps);
		          nextProps !== $$typeof.cache && propagateContextChanges(
		            workInProgress2,
		            [CacheContext],
		            renderLanes2,
		            true
		          );
		          suspendIfUpdateReadFromEntangledAsyncAction();
		          nextProps = nextState.element;
		          if (supportsHydration && $$typeof.isDehydrated)
		            if ($$typeof = {
		              element: nextProps,
		              isDehydrated: false,
		              cache: nextState.cache
		            }, workInProgress2.updateQueue.baseState = $$typeof, workInProgress2.memoizedState = $$typeof, workInProgress2.flags & 256) {
		              workInProgress2 = mountHostRootWithoutHydrating(
		                current,
		                workInProgress2,
		                nextProps,
		                renderLanes2
		              );
		              break a;
		            } else if (nextProps !== props) {
		              props = createCapturedValueAtFiber(
		                Error(formatProdErrorMessage(424)),
		                workInProgress2
		              );
		              queueHydrationError(props);
		              workInProgress2 = mountHostRootWithoutHydrating(
		                current,
		                workInProgress2,
		                nextProps,
		                renderLanes2
		              );
		              break a;
		            } else
		              for (supportsHydration && (nextHydratableInstance = getFirstHydratableChildWithinContainer(
		                workInProgress2.stateNode.containerInfo
		              ), hydrationParentFiber = workInProgress2, isHydrating = true, hydrationErrors = null, rootOrSingletonContext = true), renderLanes2 = mountChildFibers(
		                workInProgress2,
		                null,
		                nextProps,
		                renderLanes2
		              ), workInProgress2.child = renderLanes2; renderLanes2; )
		                renderLanes2.flags = renderLanes2.flags & -3 | 4096, renderLanes2 = renderLanes2.sibling;
		          else {
		            resetHydrationState();
		            if (nextProps === props) {
		              workInProgress2 = bailoutOnAlreadyFinishedWork(
		                current,
		                workInProgress2,
		                renderLanes2
		              );
		              break a;
		            }
		            reconcileChildren(current, workInProgress2, nextProps, renderLanes2);
		          }
		          workInProgress2 = workInProgress2.child;
		        }
		        return workInProgress2;
		      case 26:
		        if (supportsResources)
		          return markRef(current, workInProgress2), null === current ? (renderLanes2 = getResource(
		            workInProgress2.type,
		            null,
		            workInProgress2.pendingProps,
		            null
		          )) ? workInProgress2.memoizedState = renderLanes2 : isHydrating || (workInProgress2.stateNode = createHoistableInstance(
		            workInProgress2.type,
		            workInProgress2.pendingProps,
		            rootInstanceStackCursor.current,
		            workInProgress2
		          )) : workInProgress2.memoizedState = getResource(
		            workInProgress2.type,
		            current.memoizedProps,
		            workInProgress2.pendingProps,
		            current.memoizedState
		          ), null;
		      case 27:
		        if (supportsSingletons)
		          return pushHostContext(workInProgress2), null === current && supportsSingletons && isHydrating && (props = workInProgress2.stateNode = resolveSingletonInstance(
		            workInProgress2.type,
		            workInProgress2.pendingProps,
		            rootInstanceStackCursor.current,
		            contextStackCursor.current,
		            false
		          ), hydrationParentFiber = workInProgress2, rootOrSingletonContext = true, nextHydratableInstance = getFirstHydratableChildWithinSingleton(
		            workInProgress2.type,
		            props,
		            nextHydratableInstance
		          )), reconcileChildren(
		            current,
		            workInProgress2,
		            workInProgress2.pendingProps.children,
		            renderLanes2
		          ), markRef(current, workInProgress2), null === current && (workInProgress2.flags |= 4194304), workInProgress2.child;
		      case 5:
		        if (null === current && isHydrating) {
		          validateHydratableInstance(
		            workInProgress2.type,
		            workInProgress2.pendingProps,
		            contextStackCursor.current
		          );
		          if ($$typeof = props = nextHydratableInstance)
		            props = canHydrateInstance(
		              props,
		              workInProgress2.type,
		              workInProgress2.pendingProps,
		              rootOrSingletonContext
		            ), null !== props ? (workInProgress2.stateNode = props, hydrationParentFiber = workInProgress2, nextHydratableInstance = getFirstHydratableChild(props), rootOrSingletonContext = false, $$typeof = true) : $$typeof = false;
		          $$typeof || throwOnHydrationMismatch(workInProgress2);
		        }
		        pushHostContext(workInProgress2);
		        $$typeof = workInProgress2.type;
		        nextProps = workInProgress2.pendingProps;
		        nextState = null !== current ? current.memoizedProps : null;
		        props = nextProps.children;
		        shouldSetTextContent($$typeof, nextProps) ? props = null : null !== nextState && shouldSetTextContent($$typeof, nextState) && (workInProgress2.flags |= 32);
		        null !== workInProgress2.memoizedState && ($$typeof = renderWithHooks(
		          current,
		          workInProgress2,
		          TransitionAwareHostComponent,
		          null,
		          null,
		          renderLanes2
		        ), isPrimaryRenderer ? HostTransitionContext._currentValue = $$typeof : HostTransitionContext._currentValue2 = $$typeof);
		        markRef(current, workInProgress2);
		        reconcileChildren(current, workInProgress2, props, renderLanes2);
		        return workInProgress2.child;
		      case 6:
		        if (null === current && isHydrating) {
		          validateHydratableTextInstance(
		            workInProgress2.pendingProps,
		            contextStackCursor.current
		          );
		          if (current = renderLanes2 = nextHydratableInstance)
		            renderLanes2 = canHydrateTextInstance(
		              renderLanes2,
		              workInProgress2.pendingProps,
		              rootOrSingletonContext
		            ), null !== renderLanes2 ? (workInProgress2.stateNode = renderLanes2, hydrationParentFiber = workInProgress2, nextHydratableInstance = null, current = true) : current = false;
		          current || throwOnHydrationMismatch(workInProgress2);
		        }
		        return null;
		      case 13:
		        return updateSuspenseComponent(current, workInProgress2, renderLanes2);
		      case 4:
		        return pushHostContainer(
		          workInProgress2,
		          workInProgress2.stateNode.containerInfo
		        ), props = workInProgress2.pendingProps, null === current ? workInProgress2.child = reconcileChildFibers(
		          workInProgress2,
		          null,
		          props,
		          renderLanes2
		        ) : reconcileChildren(current, workInProgress2, props, renderLanes2), workInProgress2.child;
		      case 11:
		        return updateForwardRef(
		          current,
		          workInProgress2,
		          workInProgress2.type,
		          workInProgress2.pendingProps,
		          renderLanes2
		        );
		      case 7:
		        return reconcileChildren(
		          current,
		          workInProgress2,
		          workInProgress2.pendingProps,
		          renderLanes2
		        ), workInProgress2.child;
		      case 8:
		        return reconcileChildren(
		          current,
		          workInProgress2,
		          workInProgress2.pendingProps.children,
		          renderLanes2
		        ), workInProgress2.child;
		      case 12:
		        return reconcileChildren(
		          current,
		          workInProgress2,
		          workInProgress2.pendingProps.children,
		          renderLanes2
		        ), workInProgress2.child;
		      case 10:
		        return props = workInProgress2.pendingProps, pushProvider(workInProgress2, workInProgress2.type, props.value), reconcileChildren(
		          current,
		          workInProgress2,
		          props.children,
		          renderLanes2
		        ), workInProgress2.child;
		      case 9:
		        return $$typeof = workInProgress2.type._context, props = workInProgress2.pendingProps.children, prepareToReadContext(workInProgress2), $$typeof = readContext($$typeof), props = props($$typeof), workInProgress2.flags |= 1, reconcileChildren(current, workInProgress2, props, renderLanes2), workInProgress2.child;
		      case 14:
		        return updateMemoComponent(
		          current,
		          workInProgress2,
		          workInProgress2.type,
		          workInProgress2.pendingProps,
		          renderLanes2
		        );
		      case 15:
		        return updateSimpleMemoComponent(
		          current,
		          workInProgress2,
		          workInProgress2.type,
		          workInProgress2.pendingProps,
		          renderLanes2
		        );
		      case 19:
		        return updateSuspenseListComponent(
		          current,
		          workInProgress2,
		          renderLanes2
		        );
		      case 31:
		        return updateActivityComponent(current, workInProgress2, renderLanes2);
		      case 22:
		        return updateOffscreenComponent(
		          current,
		          workInProgress2,
		          renderLanes2,
		          workInProgress2.pendingProps
		        );
		      case 24:
		        return prepareToReadContext(workInProgress2), props = readContext(CacheContext), null === current ? ($$typeof = peekCacheFromPool(), null === $$typeof && ($$typeof = workInProgressRoot, nextProps = createCache(), $$typeof.pooledCache = nextProps, nextProps.refCount++, null !== nextProps && ($$typeof.pooledCacheLanes |= renderLanes2), $$typeof = nextProps), workInProgress2.memoizedState = {
		          parent: props,
		          cache: $$typeof
		        }, initializeUpdateQueue(workInProgress2), pushProvider(workInProgress2, CacheContext, $$typeof)) : (0 !== (current.lanes & renderLanes2) && (cloneUpdateQueue(current, workInProgress2), processUpdateQueue(workInProgress2, null, null, renderLanes2), suspendIfUpdateReadFromEntangledAsyncAction()), $$typeof = current.memoizedState, nextProps = workInProgress2.memoizedState, $$typeof.parent !== props ? ($$typeof = { parent: props, cache: props }, workInProgress2.memoizedState = $$typeof, 0 === workInProgress2.lanes && (workInProgress2.memoizedState = workInProgress2.updateQueue.baseState = $$typeof), pushProvider(workInProgress2, CacheContext, props)) : (props = nextProps.cache, pushProvider(workInProgress2, CacheContext, props), props !== $$typeof.cache && propagateContextChanges(
		          workInProgress2,
		          [CacheContext],
		          renderLanes2,
		          true
		        ))), reconcileChildren(
		          current,
		          workInProgress2,
		          workInProgress2.pendingProps.children,
		          renderLanes2
		        ), workInProgress2.child;
		      case 29:
		        throw workInProgress2.pendingProps;
		    }
		    throw Error(formatProdErrorMessage(156, workInProgress2.tag));
		  }
		  function markUpdate(workInProgress2) {
		    workInProgress2.flags |= 4;
		  }
		  function markCloned(workInProgress2) {
		    supportsPersistence && (workInProgress2.flags |= 8);
		  }
		  function doesRequireClone(current, completedWork) {
		    if (null !== current && current.child === completedWork.child) return false;
		    if (0 !== (completedWork.flags & 16)) return true;
		    for (current = completedWork.child; null !== current; ) {
		      if (0 !== (current.flags & 8218) || 0 !== (current.subtreeFlags & 8218))
		        return true;
		      current = current.sibling;
		    }
		    return false;
		  }
		  function appendAllChildren(parent, workInProgress2, needsVisibilityToggle, isHidden) {
		    if (supportsMutation)
		      for (needsVisibilityToggle = workInProgress2.child; null !== needsVisibilityToggle; ) {
		        if (5 === needsVisibilityToggle.tag || 6 === needsVisibilityToggle.tag)
		          appendInitialChild(parent, needsVisibilityToggle.stateNode);
		        else if (!(4 === needsVisibilityToggle.tag || supportsSingletons && 27 === needsVisibilityToggle.tag) && null !== needsVisibilityToggle.child) {
		          needsVisibilityToggle.child.return = needsVisibilityToggle;
		          needsVisibilityToggle = needsVisibilityToggle.child;
		          continue;
		        }
		        if (needsVisibilityToggle === workInProgress2) break;
		        for (; null === needsVisibilityToggle.sibling; ) {
		          if (null === needsVisibilityToggle.return || needsVisibilityToggle.return === workInProgress2)
		            return;
		          needsVisibilityToggle = needsVisibilityToggle.return;
		        }
		        needsVisibilityToggle.sibling.return = needsVisibilityToggle.return;
		        needsVisibilityToggle = needsVisibilityToggle.sibling;
		      }
		    else if (supportsPersistence)
		      for (var node$85 = workInProgress2.child; null !== node$85; ) {
		        if (5 === node$85.tag) {
		          var instance = node$85.stateNode;
		          needsVisibilityToggle && isHidden && (instance = cloneHiddenInstance(
		            instance,
		            node$85.type,
		            node$85.memoizedProps
		          ));
		          appendInitialChild(parent, instance);
		        } else if (6 === node$85.tag)
		          instance = node$85.stateNode, needsVisibilityToggle && isHidden && (instance = cloneHiddenTextInstance(
		            instance,
		            node$85.memoizedProps
		          )), appendInitialChild(parent, instance);
		        else if (4 !== node$85.tag) {
		          if (22 === node$85.tag && null !== node$85.memoizedState)
		            instance = node$85.child, null !== instance && (instance.return = node$85), appendAllChildren(parent, node$85, true, true);
		          else if (null !== node$85.child) {
		            node$85.child.return = node$85;
		            node$85 = node$85.child;
		            continue;
		          }
		        }
		        if (node$85 === workInProgress2) break;
		        for (; null === node$85.sibling; ) {
		          if (null === node$85.return || node$85.return === workInProgress2)
		            return;
		          node$85 = node$85.return;
		        }
		        node$85.sibling.return = node$85.return;
		        node$85 = node$85.sibling;
		      }
		  }
		  function appendAllChildrenToContainer(containerChildSet, workInProgress2, needsVisibilityToggle, isHidden) {
		    var hasOffscreenComponentChild = false;
		    if (supportsPersistence)
		      for (var node = workInProgress2.child; null !== node; ) {
		        if (5 === node.tag) {
		          var instance = node.stateNode;
		          needsVisibilityToggle && isHidden && (instance = cloneHiddenInstance(
		            instance,
		            node.type,
		            node.memoizedProps
		          ));
		          appendChildToContainerChildSet(containerChildSet, instance);
		        } else if (6 === node.tag)
		          instance = node.stateNode, needsVisibilityToggle && isHidden && (instance = cloneHiddenTextInstance(
		            instance,
		            node.memoizedProps
		          )), appendChildToContainerChildSet(containerChildSet, instance);
		        else if (4 !== node.tag) {
		          if (22 === node.tag && null !== node.memoizedState)
		            hasOffscreenComponentChild = node.child, null !== hasOffscreenComponentChild && (hasOffscreenComponentChild.return = node), appendAllChildrenToContainer(containerChildSet, node, true, true), hasOffscreenComponentChild = true;
		          else if (null !== node.child) {
		            node.child.return = node;
		            node = node.child;
		            continue;
		          }
		        }
		        if (node === workInProgress2) break;
		        for (; null === node.sibling; ) {
		          if (null === node.return || node.return === workInProgress2)
		            return hasOffscreenComponentChild;
		          node = node.return;
		        }
		        node.sibling.return = node.return;
		        node = node.sibling;
		      }
		    return hasOffscreenComponentChild;
		  }
		  function updateHostContainer(current, workInProgress2) {
		    if (supportsPersistence && doesRequireClone(current, workInProgress2)) {
		      current = workInProgress2.stateNode;
		      var container = current.containerInfo, newChildSet = createContainerChildSet();
		      appendAllChildrenToContainer(newChildSet, workInProgress2, false, false);
		      current.pendingChildren = newChildSet;
		      markUpdate(workInProgress2);
		      finalizeContainerChildren(container, newChildSet);
		    }
		  }
		  function updateHostComponent(current, workInProgress2, type, newProps) {
		    if (supportsMutation)
		      current.memoizedProps !== newProps && markUpdate(workInProgress2);
		    else if (supportsPersistence) {
		      var currentInstance = current.stateNode, oldProps$88 = current.memoizedProps;
		      if ((current = doesRequireClone(current, workInProgress2)) || oldProps$88 !== newProps) {
		        var currentHostContext = contextStackCursor.current;
		        oldProps$88 = cloneInstance(
		          currentInstance,
		          type,
		          oldProps$88,
		          newProps,
		          !current,
		          null
		        );
		        oldProps$88 === currentInstance ? workInProgress2.stateNode = currentInstance : (markCloned(workInProgress2), finalizeInitialChildren(
		          oldProps$88,
		          type,
		          newProps,
		          currentHostContext
		        ) && markUpdate(workInProgress2), workInProgress2.stateNode = oldProps$88, current && appendAllChildren(oldProps$88, workInProgress2, false, false));
		      } else workInProgress2.stateNode = currentInstance;
		    }
		  }
		  function preloadInstanceAndSuspendIfNeeded(workInProgress2, type, oldProps, newProps, renderLanes2) {
		    if (0 !== (workInProgress2.mode & 32) && (null === oldProps ? maySuspendCommit(type, newProps) : maySuspendCommitOnUpdate(type, oldProps, newProps))) {
		      if (workInProgress2.flags |= 16777216, (renderLanes2 & 335544128) === renderLanes2 || maySuspendCommitInSyncRender(type, newProps))
		        if (preloadInstance(workInProgress2.stateNode, type, newProps))
		          workInProgress2.flags |= 8192;
		        else if (shouldRemainOnPreviousScreen()) workInProgress2.flags |= 8192;
		        else
		          throw suspendedThenable = noopSuspenseyCommitThenable, SuspenseyCommitException;
		    } else workInProgress2.flags &= -16777217;
		  }
		  function preloadResourceAndSuspendIfNeeded(workInProgress2, resource) {
		    if (mayResourceSuspendCommit(resource)) {
		      if (workInProgress2.flags |= 16777216, !preloadResource(resource))
		        if (shouldRemainOnPreviousScreen()) workInProgress2.flags |= 8192;
		        else
		          throw suspendedThenable = noopSuspenseyCommitThenable, SuspenseyCommitException;
		    } else workInProgress2.flags &= -16777217;
		  }
		  function scheduleRetryEffect(workInProgress2, retryQueue) {
		    null !== retryQueue && (workInProgress2.flags |= 4);
		    workInProgress2.flags & 16384 && (retryQueue = 22 !== workInProgress2.tag ? claimNextRetryLane() : 536870912, workInProgress2.lanes |= retryQueue, workInProgressSuspendedRetryLanes |= retryQueue);
		  }
		  function cutOffTailIfNeeded(renderState, hasRenderedATailFallback) {
		    if (!isHydrating)
		      switch (renderState.tailMode) {
		        case "hidden":
		          hasRenderedATailFallback = renderState.tail;
		          for (var lastTailNode = null; null !== hasRenderedATailFallback; )
		            null !== hasRenderedATailFallback.alternate && (lastTailNode = hasRenderedATailFallback), hasRenderedATailFallback = hasRenderedATailFallback.sibling;
		          null === lastTailNode ? renderState.tail = null : lastTailNode.sibling = null;
		          break;
		        case "collapsed":
		          lastTailNode = renderState.tail;
		          for (var lastTailNode$90 = null; null !== lastTailNode; )
		            null !== lastTailNode.alternate && (lastTailNode$90 = lastTailNode), lastTailNode = lastTailNode.sibling;
		          null === lastTailNode$90 ? hasRenderedATailFallback || null === renderState.tail ? renderState.tail = null : renderState.tail.sibling = null : lastTailNode$90.sibling = null;
		      }
		  }
		  function bubbleProperties(completedWork) {
		    var didBailout = null !== completedWork.alternate && completedWork.alternate.child === completedWork.child, newChildLanes = 0, subtreeFlags = 0;
		    if (didBailout)
		      for (var child$91 = completedWork.child; null !== child$91; )
		        newChildLanes |= child$91.lanes | child$91.childLanes, subtreeFlags |= child$91.subtreeFlags & 65011712, subtreeFlags |= child$91.flags & 65011712, child$91.return = completedWork, child$91 = child$91.sibling;
		    else
		      for (child$91 = completedWork.child; null !== child$91; )
		        newChildLanes |= child$91.lanes | child$91.childLanes, subtreeFlags |= child$91.subtreeFlags, subtreeFlags |= child$91.flags, child$91.return = completedWork, child$91 = child$91.sibling;
		    completedWork.subtreeFlags |= subtreeFlags;
		    completedWork.childLanes = newChildLanes;
		    return didBailout;
		  }
		  function completeWork(current, workInProgress2, renderLanes2) {
		    var newProps = workInProgress2.pendingProps;
		    popTreeContext(workInProgress2);
		    switch (workInProgress2.tag) {
		      case 16:
		      case 15:
		      case 0:
		      case 11:
		      case 7:
		      case 8:
		      case 12:
		      case 9:
		      case 14:
		        return bubbleProperties(workInProgress2), null;
		      case 1:
		        return bubbleProperties(workInProgress2), null;
		      case 3:
		        renderLanes2 = workInProgress2.stateNode;
		        newProps = null;
		        null !== current && (newProps = current.memoizedState.cache);
		        workInProgress2.memoizedState.cache !== newProps && (workInProgress2.flags |= 2048);
		        popProvider(CacheContext);
		        popHostContainer();
		        renderLanes2.pendingContext && (renderLanes2.context = renderLanes2.pendingContext, renderLanes2.pendingContext = null);
		        if (null === current || null === current.child)
		          popHydrationState(workInProgress2) ? markUpdate(workInProgress2) : null === current || current.memoizedState.isDehydrated && 0 === (workInProgress2.flags & 256) || (workInProgress2.flags |= 1024, upgradeHydrationErrorsToRecoverable());
		        updateHostContainer(current, workInProgress2);
		        bubbleProperties(workInProgress2);
		        return null;
		      case 26:
		        if (supportsResources) {
		          var type = workInProgress2.type, nextResource = workInProgress2.memoizedState;
		          null === current ? (markUpdate(workInProgress2), null !== nextResource ? (bubbleProperties(workInProgress2), preloadResourceAndSuspendIfNeeded(
		            workInProgress2,
		            nextResource
		          )) : (bubbleProperties(workInProgress2), preloadInstanceAndSuspendIfNeeded(
		            workInProgress2,
		            type,
		            null,
		            newProps,
		            renderLanes2
		          ))) : nextResource ? nextResource !== current.memoizedState ? (markUpdate(workInProgress2), bubbleProperties(workInProgress2), preloadResourceAndSuspendIfNeeded(
		            workInProgress2,
		            nextResource
		          )) : (bubbleProperties(workInProgress2), workInProgress2.flags &= -16777217) : (nextResource = current.memoizedProps, supportsMutation ? nextResource !== newProps && markUpdate(workInProgress2) : updateHostComponent(
		            current,
		            workInProgress2,
		            type,
		            newProps
		          ), bubbleProperties(workInProgress2), preloadInstanceAndSuspendIfNeeded(
		            workInProgress2,
		            type,
		            nextResource,
		            newProps,
		            renderLanes2
		          ));
		          return null;
		        }
		      case 27:
		        if (supportsSingletons) {
		          popHostContext(workInProgress2);
		          renderLanes2 = rootInstanceStackCursor.current;
		          type = workInProgress2.type;
		          if (null !== current && null != workInProgress2.stateNode)
		            supportsMutation ? current.memoizedProps !== newProps && markUpdate(workInProgress2) : updateHostComponent(current, workInProgress2, type, newProps);
		          else {
		            if (!newProps) {
		              if (null === workInProgress2.stateNode)
		                throw Error(formatProdErrorMessage(166));
		              bubbleProperties(workInProgress2);
		              return null;
		            }
		            current = contextStackCursor.current;
		            popHydrationState(workInProgress2) ? prepareToHydrateHostInstance(workInProgress2, current) : (current = resolveSingletonInstance(
		              type,
		              newProps,
		              renderLanes2,
		              current,
		              true
		            ), workInProgress2.stateNode = current, markUpdate(workInProgress2));
		          }
		          bubbleProperties(workInProgress2);
		          return null;
		        }
		      case 5:
		        popHostContext(workInProgress2);
		        type = workInProgress2.type;
		        if (null !== current && null != workInProgress2.stateNode)
		          updateHostComponent(current, workInProgress2, type, newProps);
		        else {
		          if (!newProps) {
		            if (null === workInProgress2.stateNode)
		              throw Error(formatProdErrorMessage(166));
		            bubbleProperties(workInProgress2);
		            return null;
		          }
		          nextResource = contextStackCursor.current;
		          if (popHydrationState(workInProgress2))
		            prepareToHydrateHostInstance(workInProgress2, nextResource), finalizeHydratedChildren(
		              workInProgress2.stateNode,
		              type,
		              newProps,
		              nextResource
		            ) && (workInProgress2.flags |= 64);
		          else {
		            var instance$101 = createInstance(
		              type,
		              newProps,
		              rootInstanceStackCursor.current,
		              nextResource,
		              workInProgress2
		            );
		            markCloned(workInProgress2);
		            appendAllChildren(instance$101, workInProgress2, false, false);
		            workInProgress2.stateNode = instance$101;
		            finalizeInitialChildren(
		              instance$101,
		              type,
		              newProps,
		              nextResource
		            ) && markUpdate(workInProgress2);
		          }
		        }
		        bubbleProperties(workInProgress2);
		        preloadInstanceAndSuspendIfNeeded(
		          workInProgress2,
		          workInProgress2.type,
		          null === current ? null : current.memoizedProps,
		          workInProgress2.pendingProps,
		          renderLanes2
		        );
		        return null;
		      case 6:
		        if (current && null != workInProgress2.stateNode)
		          renderLanes2 = current.memoizedProps, supportsMutation ? renderLanes2 !== newProps && markUpdate(workInProgress2) : supportsPersistence && (renderLanes2 !== newProps ? (current = rootInstanceStackCursor.current, renderLanes2 = contextStackCursor.current, markCloned(workInProgress2), workInProgress2.stateNode = createTextInstance(
		            newProps,
		            current,
		            renderLanes2,
		            workInProgress2
		          )) : workInProgress2.stateNode = current.stateNode);
		        else {
		          if ("string" !== typeof newProps && null === workInProgress2.stateNode)
		            throw Error(formatProdErrorMessage(166));
		          current = rootInstanceStackCursor.current;
		          renderLanes2 = contextStackCursor.current;
		          if (popHydrationState(workInProgress2)) {
		            if (!supportsHydration) throw Error(formatProdErrorMessage(176));
		            current = workInProgress2.stateNode;
		            renderLanes2 = workInProgress2.memoizedProps;
		            newProps = null;
		            type = hydrationParentFiber;
		            if (null !== type)
		              switch (type.tag) {
		                case 27:
		                case 5:
		                  newProps = type.memoizedProps;
		              }
		            hydrateTextInstance(
		              current,
		              renderLanes2,
		              workInProgress2,
		              newProps
		            ) || throwOnHydrationMismatch(workInProgress2, true);
		          } else
		            markCloned(workInProgress2), workInProgress2.stateNode = createTextInstance(
		              newProps,
		              current,
		              renderLanes2,
		              workInProgress2
		            );
		        }
		        bubbleProperties(workInProgress2);
		        return null;
		      case 31:
		        renderLanes2 = workInProgress2.memoizedState;
		        if (null === current || null !== current.memoizedState) {
		          newProps = popHydrationState(workInProgress2);
		          if (null !== renderLanes2) {
		            if (null === current) {
		              if (!newProps) throw Error(formatProdErrorMessage(318));
		              if (!supportsHydration) throw Error(formatProdErrorMessage(556));
		              current = workInProgress2.memoizedState;
		              current = null !== current ? current.dehydrated : null;
		              if (!current) throw Error(formatProdErrorMessage(557));
		              hydrateActivityInstance(current, workInProgress2);
		            } else
		              resetHydrationState(), 0 === (workInProgress2.flags & 128) && (workInProgress2.memoizedState = null), workInProgress2.flags |= 4;
		            bubbleProperties(workInProgress2);
		            current = false;
		          } else
		            renderLanes2 = upgradeHydrationErrorsToRecoverable(), null !== current && null !== current.memoizedState && (current.memoizedState.hydrationErrors = renderLanes2), current = true;
		          if (!current) {
		            if (workInProgress2.flags & 256)
		              return popSuspenseHandler(workInProgress2), workInProgress2;
		            popSuspenseHandler(workInProgress2);
		            return null;
		          }
		          if (0 !== (workInProgress2.flags & 128))
		            throw Error(formatProdErrorMessage(558));
		        }
		        bubbleProperties(workInProgress2);
		        return null;
		      case 13:
		        newProps = workInProgress2.memoizedState;
		        if (null === current || null !== current.memoizedState && null !== current.memoizedState.dehydrated) {
		          type = popHydrationState(workInProgress2);
		          if (null !== newProps && null !== newProps.dehydrated) {
		            if (null === current) {
		              if (!type) throw Error(formatProdErrorMessage(318));
		              if (!supportsHydration) throw Error(formatProdErrorMessage(344));
		              type = workInProgress2.memoizedState;
		              type = null !== type ? type.dehydrated : null;
		              if (!type) throw Error(formatProdErrorMessage(317));
		              hydrateSuspenseInstance(type, workInProgress2);
		            } else
		              resetHydrationState(), 0 === (workInProgress2.flags & 128) && (workInProgress2.memoizedState = null), workInProgress2.flags |= 4;
		            bubbleProperties(workInProgress2);
		            type = false;
		          } else
		            type = upgradeHydrationErrorsToRecoverable(), null !== current && null !== current.memoizedState && (current.memoizedState.hydrationErrors = type), type = true;
		          if (!type) {
		            if (workInProgress2.flags & 256)
		              return popSuspenseHandler(workInProgress2), workInProgress2;
		            popSuspenseHandler(workInProgress2);
		            return null;
		          }
		        }
		        popSuspenseHandler(workInProgress2);
		        if (0 !== (workInProgress2.flags & 128))
		          return workInProgress2.lanes = renderLanes2, workInProgress2;
		        renderLanes2 = null !== newProps;
		        current = null !== current && null !== current.memoizedState;
		        renderLanes2 && (newProps = workInProgress2.child, type = null, null !== newProps.alternate && null !== newProps.alternate.memoizedState && null !== newProps.alternate.memoizedState.cachePool && (type = newProps.alternate.memoizedState.cachePool.pool), nextResource = null, null !== newProps.memoizedState && null !== newProps.memoizedState.cachePool && (nextResource = newProps.memoizedState.cachePool.pool), nextResource !== type && (newProps.flags |= 2048));
		        renderLanes2 !== current && renderLanes2 && (workInProgress2.child.flags |= 8192);
		        scheduleRetryEffect(workInProgress2, workInProgress2.updateQueue);
		        bubbleProperties(workInProgress2);
		        return null;
		      case 4:
		        return popHostContainer(), updateHostContainer(current, workInProgress2), null === current && preparePortalMount(workInProgress2.stateNode.containerInfo), bubbleProperties(workInProgress2), null;
		      case 10:
		        return popProvider(workInProgress2.type), bubbleProperties(workInProgress2), null;
		      case 19:
		        pop(suspenseStackCursor);
		        newProps = workInProgress2.memoizedState;
		        if (null === newProps) return bubbleProperties(workInProgress2), null;
		        type = 0 !== (workInProgress2.flags & 128);
		        nextResource = newProps.rendering;
		        if (null === nextResource)
		          if (type) cutOffTailIfNeeded(newProps, false);
		          else {
		            if (0 !== workInProgressRootExitStatus || null !== current && 0 !== (current.flags & 128))
		              for (current = workInProgress2.child; null !== current; ) {
		                nextResource = findFirstSuspended(current);
		                if (null !== nextResource) {
		                  workInProgress2.flags |= 128;
		                  cutOffTailIfNeeded(newProps, false);
		                  current = nextResource.updateQueue;
		                  workInProgress2.updateQueue = current;
		                  scheduleRetryEffect(workInProgress2, current);
		                  workInProgress2.subtreeFlags = 0;
		                  current = renderLanes2;
		                  for (renderLanes2 = workInProgress2.child; null !== renderLanes2; )
		                    resetWorkInProgress(renderLanes2, current), renderLanes2 = renderLanes2.sibling;
		                  push(
		                    suspenseStackCursor,
		                    suspenseStackCursor.current & 1 | 2
		                  );
		                  isHydrating && pushTreeFork(workInProgress2, newProps.treeForkCount);
		                  return workInProgress2.child;
		                }
		                current = current.sibling;
		              }
		            null !== newProps.tail && now() > workInProgressRootRenderTargetTime && (workInProgress2.flags |= 128, type = true, cutOffTailIfNeeded(newProps, false), workInProgress2.lanes = 4194304);
		          }
		        else {
		          if (!type)
		            if (current = findFirstSuspended(nextResource), null !== current) {
		              if (workInProgress2.flags |= 128, type = true, current = current.updateQueue, workInProgress2.updateQueue = current, scheduleRetryEffect(workInProgress2, current), cutOffTailIfNeeded(newProps, true), null === newProps.tail && "hidden" === newProps.tailMode && !nextResource.alternate && !isHydrating)
		                return bubbleProperties(workInProgress2), null;
		            } else
		              2 * now() - newProps.renderingStartTime > workInProgressRootRenderTargetTime && 536870912 !== renderLanes2 && (workInProgress2.flags |= 128, type = true, cutOffTailIfNeeded(newProps, false), workInProgress2.lanes = 4194304);
		          newProps.isBackwards ? (nextResource.sibling = workInProgress2.child, workInProgress2.child = nextResource) : (current = newProps.last, null !== current ? current.sibling = nextResource : workInProgress2.child = nextResource, newProps.last = nextResource);
		        }
		        if (null !== newProps.tail)
		          return current = newProps.tail, newProps.rendering = current, newProps.tail = current.sibling, newProps.renderingStartTime = now(), current.sibling = null, renderLanes2 = suspenseStackCursor.current, push(
		            suspenseStackCursor,
		            type ? renderLanes2 & 1 | 2 : renderLanes2 & 1
		          ), isHydrating && pushTreeFork(workInProgress2, newProps.treeForkCount), current;
		        bubbleProperties(workInProgress2);
		        return null;
		      case 22:
		      case 23:
		        return popSuspenseHandler(workInProgress2), popHiddenContext(), newProps = null !== workInProgress2.memoizedState, null !== current ? null !== current.memoizedState !== newProps && (workInProgress2.flags |= 8192) : newProps && (workInProgress2.flags |= 8192), newProps ? 0 !== (renderLanes2 & 536870912) && 0 === (workInProgress2.flags & 128) && (bubbleProperties(workInProgress2), workInProgress2.subtreeFlags & 6 && (workInProgress2.flags |= 8192)) : bubbleProperties(workInProgress2), renderLanes2 = workInProgress2.updateQueue, null !== renderLanes2 && scheduleRetryEffect(workInProgress2, renderLanes2.retryQueue), renderLanes2 = null, null !== current && null !== current.memoizedState && null !== current.memoizedState.cachePool && (renderLanes2 = current.memoizedState.cachePool.pool), newProps = null, null !== workInProgress2.memoizedState && null !== workInProgress2.memoizedState.cachePool && (newProps = workInProgress2.memoizedState.cachePool.pool), newProps !== renderLanes2 && (workInProgress2.flags |= 2048), null !== current && pop(resumedCache), null;
		      case 24:
		        return renderLanes2 = null, null !== current && (renderLanes2 = current.memoizedState.cache), workInProgress2.memoizedState.cache !== renderLanes2 && (workInProgress2.flags |= 2048), popProvider(CacheContext), bubbleProperties(workInProgress2), null;
		      case 25:
		        return null;
		      case 30:
		        return null;
		    }
		    throw Error(formatProdErrorMessage(156, workInProgress2.tag));
		  }
		  function unwindWork(current, workInProgress2) {
		    popTreeContext(workInProgress2);
		    switch (workInProgress2.tag) {
		      case 1:
		        return current = workInProgress2.flags, current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
		      case 3:
		        return popProvider(CacheContext), popHostContainer(), current = workInProgress2.flags, 0 !== (current & 65536) && 0 === (current & 128) ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
		      case 26:
		      case 27:
		      case 5:
		        return popHostContext(workInProgress2), null;
		      case 31:
		        if (null !== workInProgress2.memoizedState) {
		          popSuspenseHandler(workInProgress2);
		          if (null === workInProgress2.alternate)
		            throw Error(formatProdErrorMessage(340));
		          resetHydrationState();
		        }
		        current = workInProgress2.flags;
		        return current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
		      case 13:
		        popSuspenseHandler(workInProgress2);
		        current = workInProgress2.memoizedState;
		        if (null !== current && null !== current.dehydrated) {
		          if (null === workInProgress2.alternate)
		            throw Error(formatProdErrorMessage(340));
		          resetHydrationState();
		        }
		        current = workInProgress2.flags;
		        return current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
		      case 19:
		        return pop(suspenseStackCursor), null;
		      case 4:
		        return popHostContainer(), null;
		      case 10:
		        return popProvider(workInProgress2.type), null;
		      case 22:
		      case 23:
		        return popSuspenseHandler(workInProgress2), popHiddenContext(), null !== current && pop(resumedCache), current = workInProgress2.flags, current & 65536 ? (workInProgress2.flags = current & -65537 | 128, workInProgress2) : null;
		      case 24:
		        return popProvider(CacheContext), null;
		      case 25:
		        return null;
		      default:
		        return null;
		    }
		  }
		  function unwindInterruptedWork(current, interruptedWork) {
		    popTreeContext(interruptedWork);
		    switch (interruptedWork.tag) {
		      case 3:
		        popProvider(CacheContext);
		        popHostContainer();
		        break;
		      case 26:
		      case 27:
		      case 5:
		        popHostContext(interruptedWork);
		        break;
		      case 4:
		        popHostContainer();
		        break;
		      case 31:
		        null !== interruptedWork.memoizedState && popSuspenseHandler(interruptedWork);
		        break;
		      case 13:
		        popSuspenseHandler(interruptedWork);
		        break;
		      case 19:
		        pop(suspenseStackCursor);
		        break;
		      case 10:
		        popProvider(interruptedWork.type);
		        break;
		      case 22:
		      case 23:
		        popSuspenseHandler(interruptedWork);
		        popHiddenContext();
		        null !== current && pop(resumedCache);
		        break;
		      case 24:
		        popProvider(CacheContext);
		    }
		  }
		  function commitHookEffectListMount(flags, finishedWork) {
		    try {
		      var updateQueue = finishedWork.updateQueue, lastEffect = null !== updateQueue ? updateQueue.lastEffect : null;
		      if (null !== lastEffect) {
		        var firstEffect = lastEffect.next;
		        updateQueue = firstEffect;
		        do {
		          if ((updateQueue.tag & flags) === flags) {
		            lastEffect = void 0;
		            var create = updateQueue.create, inst = updateQueue.inst;
		            lastEffect = create();
		            inst.destroy = lastEffect;
		          }
		          updateQueue = updateQueue.next;
		        } while (updateQueue !== firstEffect);
		      }
		    } catch (error) {
		      captureCommitPhaseError(finishedWork, finishedWork.return, error);
		    }
		  }
		  function commitHookEffectListUnmount(flags, finishedWork, nearestMountedAncestor$jscomp$0) {
		    try {
		      var updateQueue = finishedWork.updateQueue, lastEffect = null !== updateQueue ? updateQueue.lastEffect : null;
		      if (null !== lastEffect) {
		        var firstEffect = lastEffect.next;
		        updateQueue = firstEffect;
		        do {
		          if ((updateQueue.tag & flags) === flags) {
		            var inst = updateQueue.inst, destroy = inst.destroy;
		            if (void 0 !== destroy) {
		              inst.destroy = void 0;
		              lastEffect = finishedWork;
		              var nearestMountedAncestor = nearestMountedAncestor$jscomp$0, destroy_ = destroy;
		              try {
		                destroy_();
		              } catch (error) {
		                captureCommitPhaseError(
		                  lastEffect,
		                  nearestMountedAncestor,
		                  error
		                );
		              }
		            }
		          }
		          updateQueue = updateQueue.next;
		        } while (updateQueue !== firstEffect);
		      }
		    } catch (error) {
		      captureCommitPhaseError(finishedWork, finishedWork.return, error);
		    }
		  }
		  function commitClassCallbacks(finishedWork) {
		    var updateQueue = finishedWork.updateQueue;
		    if (null !== updateQueue) {
		      var instance = finishedWork.stateNode;
		      try {
		        commitCallbacks(updateQueue, instance);
		      } catch (error) {
		        captureCommitPhaseError(finishedWork, finishedWork.return, error);
		      }
		    }
		  }
		  function safelyCallComponentWillUnmount(current, nearestMountedAncestor, instance) {
		    instance.props = resolveClassComponentProps(
		      current.type,
		      current.memoizedProps
		    );
		    instance.state = current.memoizedState;
		    try {
		      instance.componentWillUnmount();
		    } catch (error) {
		      captureCommitPhaseError(current, nearestMountedAncestor, error);
		    }
		  }
		  function safelyAttachRef(current, nearestMountedAncestor) {
		    try {
		      var ref = current.ref;
		      if (null !== ref) {
		        switch (current.tag) {
		          case 26:
		          case 27:
		          case 5:
		            var instanceToUse = getPublicInstance(current.stateNode);
		            break;
		          case 30:
		            instanceToUse = current.stateNode;
		            break;
		          default:
		            instanceToUse = current.stateNode;
		        }
		        "function" === typeof ref ? current.refCleanup = ref(instanceToUse) : ref.current = instanceToUse;
		      }
		    } catch (error) {
		      captureCommitPhaseError(current, nearestMountedAncestor, error);
		    }
		  }
		  function safelyDetachRef(current, nearestMountedAncestor) {
		    var ref = current.ref, refCleanup = current.refCleanup;
		    if (null !== ref)
		      if ("function" === typeof refCleanup)
		        try {
		          refCleanup();
		        } catch (error) {
		          captureCommitPhaseError(current, nearestMountedAncestor, error);
		        } finally {
		          current.refCleanup = null, current = current.alternate, null != current && (current.refCleanup = null);
		        }
		      else if ("function" === typeof ref)
		        try {
		          ref(null);
		        } catch (error$124) {
		          captureCommitPhaseError(current, nearestMountedAncestor, error$124);
		        }
		      else ref.current = null;
		  }
		  function commitHostMount(finishedWork) {
		    var type = finishedWork.type, props = finishedWork.memoizedProps, instance = finishedWork.stateNode;
		    try {
		      commitMount(instance, type, props, finishedWork);
		    } catch (error) {
		      captureCommitPhaseError(finishedWork, finishedWork.return, error);
		    }
		  }
		  function commitHostUpdate(finishedWork, newProps, oldProps) {
		    try {
		      commitUpdate(
		        finishedWork.stateNode,
		        finishedWork.type,
		        oldProps,
		        newProps,
		        finishedWork
		      );
		    } catch (error) {
		      captureCommitPhaseError(finishedWork, finishedWork.return, error);
		    }
		  }
		  function isHostParent(fiber) {
		    return 5 === fiber.tag || 3 === fiber.tag || (supportsResources ? 26 === fiber.tag : false) || (supportsSingletons ? 27 === fiber.tag && isSingletonScope(fiber.type) : false) || 4 === fiber.tag;
		  }
		  function getHostSibling(fiber) {
		    a: for (; ; ) {
		      for (; null === fiber.sibling; ) {
		        if (null === fiber.return || isHostParent(fiber.return)) return null;
		        fiber = fiber.return;
		      }
		      fiber.sibling.return = fiber.return;
		      for (fiber = fiber.sibling; 5 !== fiber.tag && 6 !== fiber.tag && 18 !== fiber.tag; ) {
		        if (supportsSingletons && 27 === fiber.tag && isSingletonScope(fiber.type))
		          continue a;
		        if (fiber.flags & 2) continue a;
		        if (null === fiber.child || 4 === fiber.tag) continue a;
		        else fiber.child.return = fiber, fiber = fiber.child;
		      }
		      if (!(fiber.flags & 2)) return fiber.stateNode;
		    }
		  }
		  function insertOrAppendPlacementNodeIntoContainer(node, before, parent) {
		    var tag = node.tag;
		    if (5 === tag || 6 === tag)
		      node = node.stateNode, before ? insertInContainerBefore(parent, node, before) : appendChildToContainer(parent, node);
		    else if (4 !== tag && (supportsSingletons && 27 === tag && isSingletonScope(node.type) && (parent = node.stateNode, before = null), node = node.child, null !== node))
		      for (insertOrAppendPlacementNodeIntoContainer(node, before, parent), node = node.sibling; null !== node; )
		        insertOrAppendPlacementNodeIntoContainer(node, before, parent), node = node.sibling;
		  }
		  function insertOrAppendPlacementNode(node, before, parent) {
		    var tag = node.tag;
		    if (5 === tag || 6 === tag)
		      node = node.stateNode, before ? insertBefore(parent, node, before) : appendChild(parent, node);
		    else if (4 !== tag && (supportsSingletons && 27 === tag && isSingletonScope(node.type) && (parent = node.stateNode), node = node.child, null !== node))
		      for (insertOrAppendPlacementNode(node, before, parent), node = node.sibling; null !== node; )
		        insertOrAppendPlacementNode(node, before, parent), node = node.sibling;
		  }
		  function commitHostPortalContainerChildren(portal, finishedWork, pendingChildren) {
		    portal = portal.containerInfo;
		    try {
		      replaceContainerChildren(portal, pendingChildren);
		    } catch (error) {
		      captureCommitPhaseError(finishedWork, finishedWork.return, error);
		    }
		  }
		  function commitHostSingletonAcquisition(finishedWork) {
		    var singleton = finishedWork.stateNode, props = finishedWork.memoizedProps;
		    try {
		      acquireSingletonInstance(
		        finishedWork.type,
		        props,
		        singleton,
		        finishedWork
		      );
		    } catch (error) {
		      captureCommitPhaseError(finishedWork, finishedWork.return, error);
		    }
		  }
		  function commitBeforeMutationEffects(root, firstChild) {
		    prepareForCommit(root.containerInfo);
		    for (nextEffect = firstChild; null !== nextEffect; )
		      if (root = nextEffect, firstChild = root.child, 0 !== (root.subtreeFlags & 1028) && null !== firstChild)
		        firstChild.return = root, nextEffect = firstChild;
		      else
		        for (; null !== nextEffect; ) {
		          root = nextEffect;
		          var current = root.alternate;
		          firstChild = root.flags;
		          switch (root.tag) {
		            case 0:
		              if (0 !== (firstChild & 4) && (firstChild = root.updateQueue, firstChild = null !== firstChild ? firstChild.events : null, null !== firstChild))
		                for (var ii = 0; ii < firstChild.length; ii++) {
		                  var _eventPayloads$ii = firstChild[ii];
		                  _eventPayloads$ii.ref.impl = _eventPayloads$ii.nextImpl;
		                }
		              break;
		            case 11:
		            case 15:
		              break;
		            case 1:
		              if (0 !== (firstChild & 1024) && null !== current) {
		                firstChild = void 0;
		                ii = root;
		                _eventPayloads$ii = current.memoizedProps;
		                current = current.memoizedState;
		                var instance = ii.stateNode;
		                try {
		                  var resolvedPrevProps = resolveClassComponentProps(
		                    ii.type,
		                    _eventPayloads$ii
		                  );
		                  firstChild = instance.getSnapshotBeforeUpdate(
		                    resolvedPrevProps,
		                    current
		                  );
		                  instance.__reactInternalSnapshotBeforeUpdate = firstChild;
		                } catch (error) {
		                  captureCommitPhaseError(ii, ii.return, error);
		                }
		              }
		              break;
		            case 3:
		              0 !== (firstChild & 1024) && supportsMutation && clearContainer(root.stateNode.containerInfo);
		              break;
		            case 5:
		            case 26:
		            case 27:
		            case 6:
		            case 4:
		            case 17:
		              break;
		            default:
		              if (0 !== (firstChild & 1024))
		                throw Error(formatProdErrorMessage(163));
		          }
		          firstChild = root.sibling;
		          if (null !== firstChild) {
		            firstChild.return = root.return;
		            nextEffect = firstChild;
		            break;
		          }
		          nextEffect = root.return;
		        }
		  }
		  function commitLayoutEffectOnFiber(finishedRoot, current, finishedWork) {
		    var flags = finishedWork.flags;
		    switch (finishedWork.tag) {
		      case 0:
		      case 11:
		      case 15:
		        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
		        flags & 4 && commitHookEffectListMount(5, finishedWork);
		        break;
		      case 1:
		        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
		        if (flags & 4)
		          if (finishedRoot = finishedWork.stateNode, null === current)
		            try {
		              finishedRoot.componentDidMount();
		            } catch (error) {
		              captureCommitPhaseError(finishedWork, finishedWork.return, error);
		            }
		          else {
		            var prevProps = resolveClassComponentProps(
		              finishedWork.type,
		              current.memoizedProps
		            );
		            current = current.memoizedState;
		            try {
		              finishedRoot.componentDidUpdate(
		                prevProps,
		                current,
		                finishedRoot.__reactInternalSnapshotBeforeUpdate
		              );
		            } catch (error$123) {
		              captureCommitPhaseError(
		                finishedWork,
		                finishedWork.return,
		                error$123
		              );
		            }
		          }
		        flags & 64 && commitClassCallbacks(finishedWork);
		        flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
		        break;
		      case 3:
		        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
		        if (flags & 64 && (flags = finishedWork.updateQueue, null !== flags)) {
		          finishedRoot = null;
		          if (null !== finishedWork.child)
		            switch (finishedWork.child.tag) {
		              case 27:
		              case 5:
		                finishedRoot = getPublicInstance(finishedWork.child.stateNode);
		                break;
		              case 1:
		                finishedRoot = finishedWork.child.stateNode;
		            }
		          try {
		            commitCallbacks(flags, finishedRoot);
		          } catch (error) {
		            captureCommitPhaseError(finishedWork, finishedWork.return, error);
		          }
		        }
		        break;
		      case 27:
		        supportsSingletons && null === current && flags & 4 && commitHostSingletonAcquisition(finishedWork);
		      case 26:
		      case 5:
		        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
		        if (null === current) {
		          if (flags & 4) commitHostMount(finishedWork);
		          else if (flags & 64) {
		            finishedRoot = finishedWork.type;
		            current = finishedWork.memoizedProps;
		            prevProps = finishedWork.stateNode;
		            try {
		              commitHydratedInstance(
		                prevProps,
		                finishedRoot,
		                current,
		                finishedWork
		              );
		            } catch (error) {
		              captureCommitPhaseError(finishedWork, finishedWork.return, error);
		            }
		          }
		        }
		        flags & 512 && safelyAttachRef(finishedWork, finishedWork.return);
		        break;
		      case 12:
		        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
		        break;
		      case 31:
		        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
		        flags & 4 && commitActivityHydrationCallbacks(finishedRoot, finishedWork);
		        break;
		      case 13:
		        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
		        flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
		        flags & 64 && (flags = finishedWork.memoizedState, null !== flags && (flags = flags.dehydrated, null !== flags && (finishedWork = retryDehydratedSuspenseBoundary.bind(
		          null,
		          finishedWork
		        ), registerSuspenseInstanceRetry(flags, finishedWork))));
		        break;
		      case 22:
		        flags = null !== finishedWork.memoizedState || offscreenSubtreeIsHidden;
		        if (!flags) {
		          current = null !== current && null !== current.memoizedState || offscreenSubtreeWasHidden;
		          prevProps = offscreenSubtreeIsHidden;
		          var prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden;
		          offscreenSubtreeIsHidden = flags;
		          (offscreenSubtreeWasHidden = current) && !prevOffscreenSubtreeWasHidden ? recursivelyTraverseReappearLayoutEffects(
		            finishedRoot,
		            finishedWork,
		            0 !== (finishedWork.subtreeFlags & 8772)
		          ) : recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
		          offscreenSubtreeIsHidden = prevProps;
		          offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
		        }
		        break;
		      case 30:
		        break;
		      default:
		        recursivelyTraverseLayoutEffects(finishedRoot, finishedWork);
		    }
		  }
		  function detachFiberAfterEffects(fiber) {
		    var alternate = fiber.alternate;
		    null !== alternate && (fiber.alternate = null, detachFiberAfterEffects(alternate));
		    fiber.child = null;
		    fiber.deletions = null;
		    fiber.sibling = null;
		    5 === fiber.tag && (alternate = fiber.stateNode, null !== alternate && detachDeletedInstance(alternate));
		    fiber.stateNode = null;
		    fiber.return = null;
		    fiber.dependencies = null;
		    fiber.memoizedProps = null;
		    fiber.memoizedState = null;
		    fiber.pendingProps = null;
		    fiber.stateNode = null;
		    fiber.updateQueue = null;
		  }
		  function recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, parent) {
		    for (parent = parent.child; null !== parent; )
		      commitDeletionEffectsOnFiber(
		        finishedRoot,
		        nearestMountedAncestor,
		        parent
		      ), parent = parent.sibling;
		  }
		  function commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, deletedFiber) {
		    if (injectedHook && "function" === typeof injectedHook.onCommitFiberUnmount)
		      try {
		        injectedHook.onCommitFiberUnmount(rendererID, deletedFiber);
		      } catch (err) {
		      }
		    switch (deletedFiber.tag) {
		      case 26:
		        if (supportsResources) {
		          offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
		          recursivelyTraverseDeletionEffects(
		            finishedRoot,
		            nearestMountedAncestor,
		            deletedFiber
		          );
		          deletedFiber.memoizedState ? releaseResource(deletedFiber.memoizedState) : deletedFiber.stateNode && unmountHoistable(deletedFiber.stateNode);
		          break;
		        }
		      case 27:
		        if (supportsSingletons) {
		          offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
		          var prevHostParent = hostParent, prevHostParentIsContainer = hostParentIsContainer;
		          isSingletonScope(deletedFiber.type) && (hostParent = deletedFiber.stateNode, hostParentIsContainer = false);
		          recursivelyTraverseDeletionEffects(
		            finishedRoot,
		            nearestMountedAncestor,
		            deletedFiber
		          );
		          releaseSingletonInstance(deletedFiber.stateNode);
		          hostParent = prevHostParent;
		          hostParentIsContainer = prevHostParentIsContainer;
		          break;
		        }
		      case 5:
		        offscreenSubtreeWasHidden || safelyDetachRef(deletedFiber, nearestMountedAncestor);
		      case 6:
		        if (supportsMutation) {
		          if (prevHostParent = hostParent, prevHostParentIsContainer = hostParentIsContainer, hostParent = null, recursivelyTraverseDeletionEffects(
		            finishedRoot,
		            nearestMountedAncestor,
		            deletedFiber
		          ), hostParent = prevHostParent, hostParentIsContainer = prevHostParentIsContainer, null !== hostParent)
		            if (hostParentIsContainer)
		              try {
		                removeChildFromContainer(hostParent, deletedFiber.stateNode);
		              } catch (error) {
		                captureCommitPhaseError(
		                  deletedFiber,
		                  nearestMountedAncestor,
		                  error
		                );
		              }
		            else
		              try {
		                removeChild(hostParent, deletedFiber.stateNode);
		              } catch (error) {
		                captureCommitPhaseError(
		                  deletedFiber,
		                  nearestMountedAncestor,
		                  error
		                );
		              }
		        } else
		          recursivelyTraverseDeletionEffects(
		            finishedRoot,
		            nearestMountedAncestor,
		            deletedFiber
		          );
		        break;
		      case 18:
		        supportsMutation && null !== hostParent && (hostParentIsContainer ? clearSuspenseBoundaryFromContainer(
		          hostParent,
		          deletedFiber.stateNode
		        ) : clearSuspenseBoundary(hostParent, deletedFiber.stateNode));
		        break;
		      case 4:
		        supportsMutation ? (prevHostParent = hostParent, prevHostParentIsContainer = hostParentIsContainer, hostParent = deletedFiber.stateNode.containerInfo, hostParentIsContainer = true, recursivelyTraverseDeletionEffects(
		          finishedRoot,
		          nearestMountedAncestor,
		          deletedFiber
		        ), hostParent = prevHostParent, hostParentIsContainer = prevHostParentIsContainer) : (supportsPersistence && commitHostPortalContainerChildren(
		          deletedFiber.stateNode,
		          deletedFiber,
		          createContainerChildSet()
		        ), recursivelyTraverseDeletionEffects(
		          finishedRoot,
		          nearestMountedAncestor,
		          deletedFiber
		        ));
		        break;
		      case 0:
		      case 11:
		      case 14:
		      case 15:
		        commitHookEffectListUnmount(2, deletedFiber, nearestMountedAncestor);
		        offscreenSubtreeWasHidden || commitHookEffectListUnmount(4, deletedFiber, nearestMountedAncestor);
		        recursivelyTraverseDeletionEffects(
		          finishedRoot,
		          nearestMountedAncestor,
		          deletedFiber
		        );
		        break;
		      case 1:
		        offscreenSubtreeWasHidden || (safelyDetachRef(deletedFiber, nearestMountedAncestor), prevHostParent = deletedFiber.stateNode, "function" === typeof prevHostParent.componentWillUnmount && safelyCallComponentWillUnmount(
		          deletedFiber,
		          nearestMountedAncestor,
		          prevHostParent
		        ));
		        recursivelyTraverseDeletionEffects(
		          finishedRoot,
		          nearestMountedAncestor,
		          deletedFiber
		        );
		        break;
		      case 21:
		        recursivelyTraverseDeletionEffects(
		          finishedRoot,
		          nearestMountedAncestor,
		          deletedFiber
		        );
		        break;
		      case 22:
		        offscreenSubtreeWasHidden = (prevHostParent = offscreenSubtreeWasHidden) || null !== deletedFiber.memoizedState;
		        recursivelyTraverseDeletionEffects(
		          finishedRoot,
		          nearestMountedAncestor,
		          deletedFiber
		        );
		        offscreenSubtreeWasHidden = prevHostParent;
		        break;
		      default:
		        recursivelyTraverseDeletionEffects(
		          finishedRoot,
		          nearestMountedAncestor,
		          deletedFiber
		        );
		    }
		  }
		  function commitActivityHydrationCallbacks(finishedRoot, finishedWork) {
		    if (supportsHydration && null === finishedWork.memoizedState && (finishedRoot = finishedWork.alternate, null !== finishedRoot && (finishedRoot = finishedRoot.memoizedState, null !== finishedRoot))) {
		      finishedRoot = finishedRoot.dehydrated;
		      try {
		        commitHydratedActivityInstance(finishedRoot);
		      } catch (error) {
		        captureCommitPhaseError(finishedWork, finishedWork.return, error);
		      }
		    }
		  }
		  function commitSuspenseHydrationCallbacks(finishedRoot, finishedWork) {
		    if (supportsHydration && null === finishedWork.memoizedState && (finishedRoot = finishedWork.alternate, null !== finishedRoot && (finishedRoot = finishedRoot.memoizedState, null !== finishedRoot && (finishedRoot = finishedRoot.dehydrated, null !== finishedRoot))))
		      try {
		        commitHydratedSuspenseInstance(finishedRoot);
		      } catch (error) {
		        captureCommitPhaseError(finishedWork, finishedWork.return, error);
		      }
		  }
		  function getRetryCache(finishedWork) {
		    switch (finishedWork.tag) {
		      case 31:
		      case 13:
		      case 19:
		        var retryCache = finishedWork.stateNode;
		        null === retryCache && (retryCache = finishedWork.stateNode = new PossiblyWeakSet());
		        return retryCache;
		      case 22:
		        return finishedWork = finishedWork.stateNode, retryCache = finishedWork._retryCache, null === retryCache && (retryCache = finishedWork._retryCache = new PossiblyWeakSet()), retryCache;
		      default:
		        throw Error(formatProdErrorMessage(435, finishedWork.tag));
		    }
		  }
		  function attachSuspenseRetryListeners(finishedWork, wakeables) {
		    var retryCache = getRetryCache(finishedWork);
		    wakeables.forEach(function(wakeable) {
		      if (!retryCache.has(wakeable)) {
		        retryCache.add(wakeable);
		        var retry = resolveRetryWakeable.bind(null, finishedWork, wakeable);
		        wakeable.then(retry, retry);
		      }
		    });
		  }
		  function recursivelyTraverseMutationEffects(root$jscomp$0, parentFiber) {
		    var deletions = parentFiber.deletions;
		    if (null !== deletions)
		      for (var i = 0; i < deletions.length; i++) {
		        var childToDelete = deletions[i], root = root$jscomp$0, returnFiber = parentFiber;
		        if (supportsMutation) {
		          var parent = returnFiber;
		          a: for (; null !== parent; ) {
		            switch (parent.tag) {
		              case 27:
		                if (supportsSingletons) {
		                  if (isSingletonScope(parent.type)) {
		                    hostParent = parent.stateNode;
		                    hostParentIsContainer = false;
		                    break a;
		                  }
		                  break;
		                }
		              case 5:
		                hostParent = parent.stateNode;
		                hostParentIsContainer = false;
		                break a;
		              case 3:
		              case 4:
		                hostParent = parent.stateNode.containerInfo;
		                hostParentIsContainer = true;
		                break a;
		            }
		            parent = parent.return;
		          }
		          if (null === hostParent) throw Error(formatProdErrorMessage(160));
		          commitDeletionEffectsOnFiber(root, returnFiber, childToDelete);
		          hostParent = null;
		          hostParentIsContainer = false;
		        } else commitDeletionEffectsOnFiber(root, returnFiber, childToDelete);
		        root = childToDelete.alternate;
		        null !== root && (root.return = null);
		        childToDelete.return = null;
		      }
		    if (parentFiber.subtreeFlags & 13886)
		      for (parentFiber = parentFiber.child; null !== parentFiber; )
		        commitMutationEffectsOnFiber(parentFiber, root$jscomp$0), parentFiber = parentFiber.sibling;
		  }
		  function commitMutationEffectsOnFiber(finishedWork, root) {
		    var current = finishedWork.alternate, flags = finishedWork.flags;
		    switch (finishedWork.tag) {
		      case 0:
		      case 11:
		      case 14:
		      case 15:
		        recursivelyTraverseMutationEffects(root, finishedWork);
		        commitReconciliationEffects(finishedWork);
		        flags & 4 && (commitHookEffectListUnmount(3, finishedWork, finishedWork.return), commitHookEffectListMount(3, finishedWork), commitHookEffectListUnmount(5, finishedWork, finishedWork.return));
		        break;
		      case 1:
		        recursivelyTraverseMutationEffects(root, finishedWork);
		        commitReconciliationEffects(finishedWork);
		        flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
		        flags & 64 && offscreenSubtreeIsHidden && (finishedWork = finishedWork.updateQueue, null !== finishedWork && (flags = finishedWork.callbacks, null !== flags && (current = finishedWork.shared.hiddenCallbacks, finishedWork.shared.hiddenCallbacks = null === current ? flags : current.concat(flags))));
		        break;
		      case 26:
		        if (supportsResources) {
		          var hoistableRoot = currentHoistableRoot;
		          recursivelyTraverseMutationEffects(root, finishedWork);
		          commitReconciliationEffects(finishedWork);
		          flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
		          if (flags & 4) {
		            flags = null !== current ? current.memoizedState : null;
		            var newResource = finishedWork.memoizedState;
		            null === current ? null === newResource ? null === finishedWork.stateNode ? finishedWork.stateNode = hydrateHoistable(
		              hoistableRoot,
		              finishedWork.type,
		              finishedWork.memoizedProps,
		              finishedWork
		            ) : mountHoistable(
		              hoistableRoot,
		              finishedWork.type,
		              finishedWork.stateNode
		            ) : finishedWork.stateNode = acquireResource(
		              hoistableRoot,
		              newResource,
		              finishedWork.memoizedProps
		            ) : flags !== newResource ? (null === flags ? null !== current.stateNode && unmountHoistable(current.stateNode) : releaseResource(flags), null === newResource ? mountHoistable(
		              hoistableRoot,
		              finishedWork.type,
		              finishedWork.stateNode
		            ) : acquireResource(
		              hoistableRoot,
		              newResource,
		              finishedWork.memoizedProps
		            )) : null === newResource && null !== finishedWork.stateNode && commitHostUpdate(
		              finishedWork,
		              finishedWork.memoizedProps,
		              current.memoizedProps
		            );
		          }
		          break;
		        }
		      case 27:
		        if (supportsSingletons) {
		          recursivelyTraverseMutationEffects(root, finishedWork);
		          commitReconciliationEffects(finishedWork);
		          flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
		          null !== current && flags & 4 && commitHostUpdate(
		            finishedWork,
		            finishedWork.memoizedProps,
		            current.memoizedProps
		          );
		          break;
		        }
		      case 5:
		        recursivelyTraverseMutationEffects(root, finishedWork);
		        commitReconciliationEffects(finishedWork);
		        flags & 512 && (offscreenSubtreeWasHidden || null === current || safelyDetachRef(current, current.return));
		        if (supportsMutation) {
		          if (finishedWork.flags & 32) {
		            hoistableRoot = finishedWork.stateNode;
		            try {
		              resetTextContent(hoistableRoot);
		            } catch (error) {
		              captureCommitPhaseError(finishedWork, finishedWork.return, error);
		            }
		          }
		          flags & 4 && null != finishedWork.stateNode && (hoistableRoot = finishedWork.memoizedProps, commitHostUpdate(
		            finishedWork,
		            hoistableRoot,
		            null !== current ? current.memoizedProps : hoistableRoot
		          ));
		          flags & 1024 && (needsFormReset = true);
		        } else
		          supportsPersistence && null !== finishedWork.alternate && (finishedWork.alternate.stateNode = finishedWork.stateNode);
		        break;
		      case 6:
		        recursivelyTraverseMutationEffects(root, finishedWork);
		        commitReconciliationEffects(finishedWork);
		        if (flags & 4 && supportsMutation) {
		          if (null === finishedWork.stateNode)
		            throw Error(formatProdErrorMessage(162));
		          flags = finishedWork.memoizedProps;
		          current = null !== current ? current.memoizedProps : flags;
		          hoistableRoot = finishedWork.stateNode;
		          try {
		            commitTextUpdate(hoistableRoot, current, flags);
		          } catch (error) {
		            captureCommitPhaseError(finishedWork, finishedWork.return, error);
		          }
		        }
		        break;
		      case 3:
		        supportsResources ? (prepareToCommitHoistables(), hoistableRoot = currentHoistableRoot, currentHoistableRoot = getHoistableRoot(root.containerInfo), recursivelyTraverseMutationEffects(root, finishedWork), currentHoistableRoot = hoistableRoot) : recursivelyTraverseMutationEffects(root, finishedWork);
		        commitReconciliationEffects(finishedWork);
		        if (flags & 4) {
		          if (supportsMutation && supportsHydration && null !== current && current.memoizedState.isDehydrated)
		            try {
		              commitHydratedContainer(root.containerInfo);
		            } catch (error) {
		              captureCommitPhaseError(finishedWork, finishedWork.return, error);
		            }
		          if (supportsPersistence) {
		            flags = root.containerInfo;
		            current = root.pendingChildren;
		            try {
		              replaceContainerChildren(flags, current);
		            } catch (error) {
		              captureCommitPhaseError(finishedWork, finishedWork.return, error);
		            }
		          }
		        }
		        needsFormReset && (needsFormReset = false, recursivelyResetForms(finishedWork));
		        break;
		      case 4:
		        supportsResources ? (current = currentHoistableRoot, currentHoistableRoot = getHoistableRoot(
		          finishedWork.stateNode.containerInfo
		        ), recursivelyTraverseMutationEffects(root, finishedWork), commitReconciliationEffects(finishedWork), currentHoistableRoot = current) : (recursivelyTraverseMutationEffects(root, finishedWork), commitReconciliationEffects(finishedWork));
		        flags & 4 && supportsPersistence && commitHostPortalContainerChildren(
		          finishedWork.stateNode,
		          finishedWork,
		          finishedWork.stateNode.pendingChildren
		        );
		        break;
		      case 12:
		        recursivelyTraverseMutationEffects(root, finishedWork);
		        commitReconciliationEffects(finishedWork);
		        break;
		      case 31:
		        recursivelyTraverseMutationEffects(root, finishedWork);
		        commitReconciliationEffects(finishedWork);
		        flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, flags)));
		        break;
		      case 13:
		        recursivelyTraverseMutationEffects(root, finishedWork);
		        commitReconciliationEffects(finishedWork);
		        finishedWork.child.flags & 8192 && null !== finishedWork.memoizedState !== (null !== current && null !== current.memoizedState) && (globalMostRecentFallbackTime = now());
		        flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, flags)));
		        break;
		      case 22:
		        hoistableRoot = null !== finishedWork.memoizedState;
		        var wasHidden = null !== current && null !== current.memoizedState, prevOffscreenSubtreeIsHidden = offscreenSubtreeIsHidden, prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden;
		        offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden || hoistableRoot;
		        offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden || wasHidden;
		        recursivelyTraverseMutationEffects(root, finishedWork);
		        offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
		        offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden;
		        commitReconciliationEffects(finishedWork);
		        if (flags & 8192 && (root = finishedWork.stateNode, root._visibility = hoistableRoot ? root._visibility & -2 : root._visibility | 1, hoistableRoot && (null === current || wasHidden || offscreenSubtreeIsHidden || offscreenSubtreeWasHidden || recursivelyTraverseDisappearLayoutEffects(finishedWork)), supportsMutation)) {
		          a: if (current = null, supportsMutation)
		            for (root = finishedWork; ; ) {
		              if (5 === root.tag || supportsResources && 26 === root.tag) {
		                if (null === current) {
		                  wasHidden = current = root;
		                  try {
		                    newResource = wasHidden.stateNode, hoistableRoot ? hideInstance(newResource) : unhideInstance(
		                      wasHidden.stateNode,
		                      wasHidden.memoizedProps
		                    );
		                  } catch (error) {
		                    captureCommitPhaseError(wasHidden, wasHidden.return, error);
		                  }
		                }
		              } else if (6 === root.tag) {
		                if (null === current) {
		                  wasHidden = root;
		                  try {
		                    var instance = wasHidden.stateNode;
		                    hoistableRoot ? hideTextInstance(instance) : unhideTextInstance(instance, wasHidden.memoizedProps);
		                  } catch (error) {
		                    captureCommitPhaseError(wasHidden, wasHidden.return, error);
		                  }
		                }
		              } else if (18 === root.tag) {
		                if (null === current) {
		                  wasHidden = root;
		                  try {
		                    var instance$jscomp$0 = wasHidden.stateNode;
		                    hoistableRoot ? hideDehydratedBoundary(instance$jscomp$0) : unhideDehydratedBoundary(wasHidden.stateNode);
		                  } catch (error) {
		                    captureCommitPhaseError(wasHidden, wasHidden.return, error);
		                  }
		                }
		              } else if ((22 !== root.tag && 23 !== root.tag || null === root.memoizedState || root === finishedWork) && null !== root.child) {
		                root.child.return = root;
		                root = root.child;
		                continue;
		              }
		              if (root === finishedWork) break a;
		              for (; null === root.sibling; ) {
		                if (null === root.return || root.return === finishedWork)
		                  break a;
		                current === root && (current = null);
		                root = root.return;
		              }
		              current === root && (current = null);
		              root.sibling.return = root.return;
		              root = root.sibling;
		            }
		        }
		        flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (current = flags.retryQueue, null !== current && (flags.retryQueue = null, attachSuspenseRetryListeners(finishedWork, current))));
		        break;
		      case 19:
		        recursivelyTraverseMutationEffects(root, finishedWork);
		        commitReconciliationEffects(finishedWork);
		        flags & 4 && (flags = finishedWork.updateQueue, null !== flags && (finishedWork.updateQueue = null, attachSuspenseRetryListeners(finishedWork, flags)));
		        break;
		      case 30:
		        break;
		      case 21:
		        break;
		      default:
		        recursivelyTraverseMutationEffects(root, finishedWork), commitReconciliationEffects(finishedWork);
		    }
		  }
		  function commitReconciliationEffects(finishedWork) {
		    var flags = finishedWork.flags;
		    if (flags & 2) {
		      try {
		        for (var hostParentFiber, parentFiber = finishedWork.return; null !== parentFiber; ) {
		          if (isHostParent(parentFiber)) {
		            hostParentFiber = parentFiber;
		            break;
		          }
		          parentFiber = parentFiber.return;
		        }
		        if (supportsMutation) {
		          if (null == hostParentFiber) throw Error(formatProdErrorMessage(160));
		          switch (hostParentFiber.tag) {
		            case 27:
		              if (supportsSingletons) {
		                var parent = hostParentFiber.stateNode, before = getHostSibling(finishedWork);
		                insertOrAppendPlacementNode(finishedWork, before, parent);
		                break;
		              }
		            case 5:
		              var parent$125 = hostParentFiber.stateNode;
		              hostParentFiber.flags & 32 && (resetTextContent(parent$125), hostParentFiber.flags &= -33);
		              var before$126 = getHostSibling(finishedWork);
		              insertOrAppendPlacementNode(finishedWork, before$126, parent$125);
		              break;
		            case 3:
		            case 4:
		              var parent$127 = hostParentFiber.stateNode.containerInfo, before$128 = getHostSibling(finishedWork);
		              insertOrAppendPlacementNodeIntoContainer(
		                finishedWork,
		                before$128,
		                parent$127
		              );
		              break;
		            default:
		              throw Error(formatProdErrorMessage(161));
		          }
		        }
		      } catch (error) {
		        captureCommitPhaseError(finishedWork, finishedWork.return, error);
		      }
		      finishedWork.flags &= -3;
		    }
		    flags & 4096 && (finishedWork.flags &= -4097);
		  }
		  function recursivelyResetForms(parentFiber) {
		    if (parentFiber.subtreeFlags & 1024)
		      for (parentFiber = parentFiber.child; null !== parentFiber; ) {
		        var fiber = parentFiber;
		        recursivelyResetForms(fiber);
		        5 === fiber.tag && fiber.flags & 1024 && resetFormInstance(fiber.stateNode);
		        parentFiber = parentFiber.sibling;
		      }
		  }
		  function recursivelyTraverseLayoutEffects(root, parentFiber) {
		    if (parentFiber.subtreeFlags & 8772)
		      for (parentFiber = parentFiber.child; null !== parentFiber; )
		        commitLayoutEffectOnFiber(root, parentFiber.alternate, parentFiber), parentFiber = parentFiber.sibling;
		  }
		  function recursivelyTraverseDisappearLayoutEffects(parentFiber) {
		    for (parentFiber = parentFiber.child; null !== parentFiber; ) {
		      var finishedWork = parentFiber;
		      switch (finishedWork.tag) {
		        case 0:
		        case 11:
		        case 14:
		        case 15:
		          commitHookEffectListUnmount(4, finishedWork, finishedWork.return);
		          recursivelyTraverseDisappearLayoutEffects(finishedWork);
		          break;
		        case 1:
		          safelyDetachRef(finishedWork, finishedWork.return);
		          var instance = finishedWork.stateNode;
		          "function" === typeof instance.componentWillUnmount && safelyCallComponentWillUnmount(
		            finishedWork,
		            finishedWork.return,
		            instance
		          );
		          recursivelyTraverseDisappearLayoutEffects(finishedWork);
		          break;
		        case 27:
		          supportsSingletons && releaseSingletonInstance(finishedWork.stateNode);
		        case 26:
		        case 5:
		          safelyDetachRef(finishedWork, finishedWork.return);
		          recursivelyTraverseDisappearLayoutEffects(finishedWork);
		          break;
		        case 22:
		          null === finishedWork.memoizedState && recursivelyTraverseDisappearLayoutEffects(finishedWork);
		          break;
		        case 30:
		          recursivelyTraverseDisappearLayoutEffects(finishedWork);
		          break;
		        default:
		          recursivelyTraverseDisappearLayoutEffects(finishedWork);
		      }
		      parentFiber = parentFiber.sibling;
		    }
		  }
		  function recursivelyTraverseReappearLayoutEffects(finishedRoot$jscomp$0, parentFiber, includeWorkInProgressEffects) {
		    includeWorkInProgressEffects = includeWorkInProgressEffects && 0 !== (parentFiber.subtreeFlags & 8772);
		    for (parentFiber = parentFiber.child; null !== parentFiber; ) {
		      var current = parentFiber.alternate, finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags;
		      switch (finishedWork.tag) {
		        case 0:
		        case 11:
		        case 15:
		          recursivelyTraverseReappearLayoutEffects(
		            finishedRoot,
		            finishedWork,
		            includeWorkInProgressEffects
		          );
		          commitHookEffectListMount(4, finishedWork);
		          break;
		        case 1:
		          recursivelyTraverseReappearLayoutEffects(
		            finishedRoot,
		            finishedWork,
		            includeWorkInProgressEffects
		          );
		          current = finishedWork;
		          finishedRoot = current.stateNode;
		          if ("function" === typeof finishedRoot.componentDidMount)
		            try {
		              finishedRoot.componentDidMount();
		            } catch (error) {
		              captureCommitPhaseError(current, current.return, error);
		            }
		          current = finishedWork;
		          finishedRoot = current.updateQueue;
		          if (null !== finishedRoot) {
		            var instance = current.stateNode;
		            try {
		              var hiddenCallbacks = finishedRoot.shared.hiddenCallbacks;
		              if (null !== hiddenCallbacks)
		                for (finishedRoot.shared.hiddenCallbacks = null, finishedRoot = 0; finishedRoot < hiddenCallbacks.length; finishedRoot++)
		                  callCallback(hiddenCallbacks[finishedRoot], instance);
		            } catch (error) {
		              captureCommitPhaseError(current, current.return, error);
		            }
		          }
		          includeWorkInProgressEffects && flags & 64 && commitClassCallbacks(finishedWork);
		          safelyAttachRef(finishedWork, finishedWork.return);
		          break;
		        case 27:
		          supportsSingletons && commitHostSingletonAcquisition(finishedWork);
		        case 26:
		        case 5:
		          recursivelyTraverseReappearLayoutEffects(
		            finishedRoot,
		            finishedWork,
		            includeWorkInProgressEffects
		          );
		          includeWorkInProgressEffects && null === current && flags & 4 && commitHostMount(finishedWork);
		          safelyAttachRef(finishedWork, finishedWork.return);
		          break;
		        case 12:
		          recursivelyTraverseReappearLayoutEffects(
		            finishedRoot,
		            finishedWork,
		            includeWorkInProgressEffects
		          );
		          break;
		        case 31:
		          recursivelyTraverseReappearLayoutEffects(
		            finishedRoot,
		            finishedWork,
		            includeWorkInProgressEffects
		          );
		          includeWorkInProgressEffects && flags & 4 && commitActivityHydrationCallbacks(finishedRoot, finishedWork);
		          break;
		        case 13:
		          recursivelyTraverseReappearLayoutEffects(
		            finishedRoot,
		            finishedWork,
		            includeWorkInProgressEffects
		          );
		          includeWorkInProgressEffects && flags & 4 && commitSuspenseHydrationCallbacks(finishedRoot, finishedWork);
		          break;
		        case 22:
		          null === finishedWork.memoizedState && recursivelyTraverseReappearLayoutEffects(
		            finishedRoot,
		            finishedWork,
		            includeWorkInProgressEffects
		          );
		          safelyAttachRef(finishedWork, finishedWork.return);
		          break;
		        case 30:
		          break;
		        default:
		          recursivelyTraverseReappearLayoutEffects(
		            finishedRoot,
		            finishedWork,
		            includeWorkInProgressEffects
		          );
		      }
		      parentFiber = parentFiber.sibling;
		    }
		  }
		  function commitOffscreenPassiveMountEffects(current, finishedWork) {
		    var previousCache = null;
		    null !== current && null !== current.memoizedState && null !== current.memoizedState.cachePool && (previousCache = current.memoizedState.cachePool.pool);
		    current = null;
		    null !== finishedWork.memoizedState && null !== finishedWork.memoizedState.cachePool && (current = finishedWork.memoizedState.cachePool.pool);
		    current !== previousCache && (null != current && current.refCount++, null != previousCache && releaseCache(previousCache));
		  }
		  function commitCachePassiveMountEffect(current, finishedWork) {
		    current = null;
		    null !== finishedWork.alternate && (current = finishedWork.alternate.memoizedState.cache);
		    finishedWork = finishedWork.memoizedState.cache;
		    finishedWork !== current && (finishedWork.refCount++, null != current && releaseCache(current));
		  }
		  function recursivelyTraversePassiveMountEffects(root, parentFiber, committedLanes, committedTransitions) {
		    if (parentFiber.subtreeFlags & 10256)
		      for (parentFiber = parentFiber.child; null !== parentFiber; )
		        commitPassiveMountOnFiber(
		          root,
		          parentFiber,
		          committedLanes,
		          committedTransitions
		        ), parentFiber = parentFiber.sibling;
		  }
		  function commitPassiveMountOnFiber(finishedRoot, finishedWork, committedLanes, committedTransitions) {
		    var flags = finishedWork.flags;
		    switch (finishedWork.tag) {
		      case 0:
		      case 11:
		      case 15:
		        recursivelyTraversePassiveMountEffects(
		          finishedRoot,
		          finishedWork,
		          committedLanes,
		          committedTransitions
		        );
		        flags & 2048 && commitHookEffectListMount(9, finishedWork);
		        break;
		      case 1:
		        recursivelyTraversePassiveMountEffects(
		          finishedRoot,
		          finishedWork,
		          committedLanes,
		          committedTransitions
		        );
		        break;
		      case 3:
		        recursivelyTraversePassiveMountEffects(
		          finishedRoot,
		          finishedWork,
		          committedLanes,
		          committedTransitions
		        );
		        flags & 2048 && (finishedRoot = null, null !== finishedWork.alternate && (finishedRoot = finishedWork.alternate.memoizedState.cache), finishedWork = finishedWork.memoizedState.cache, finishedWork !== finishedRoot && (finishedWork.refCount++, null != finishedRoot && releaseCache(finishedRoot)));
		        break;
		      case 12:
		        if (flags & 2048) {
		          recursivelyTraversePassiveMountEffects(
		            finishedRoot,
		            finishedWork,
		            committedLanes,
		            committedTransitions
		          );
		          finishedRoot = finishedWork.stateNode;
		          try {
		            var _finishedWork$memoize2 = finishedWork.memoizedProps, id = _finishedWork$memoize2.id, onPostCommit = _finishedWork$memoize2.onPostCommit;
		            "function" === typeof onPostCommit && onPostCommit(
		              id,
		              null === finishedWork.alternate ? "mount" : "update",
		              finishedRoot.passiveEffectDuration,
		              -0
		            );
		          } catch (error) {
		            captureCommitPhaseError(finishedWork, finishedWork.return, error);
		          }
		        } else
		          recursivelyTraversePassiveMountEffects(
		            finishedRoot,
		            finishedWork,
		            committedLanes,
		            committedTransitions
		          );
		        break;
		      case 31:
		        recursivelyTraversePassiveMountEffects(
		          finishedRoot,
		          finishedWork,
		          committedLanes,
		          committedTransitions
		        );
		        break;
		      case 13:
		        recursivelyTraversePassiveMountEffects(
		          finishedRoot,
		          finishedWork,
		          committedLanes,
		          committedTransitions
		        );
		        break;
		      case 23:
		        break;
		      case 22:
		        _finishedWork$memoize2 = finishedWork.stateNode;
		        id = finishedWork.alternate;
		        null !== finishedWork.memoizedState ? _finishedWork$memoize2._visibility & 2 ? recursivelyTraversePassiveMountEffects(
		          finishedRoot,
		          finishedWork,
		          committedLanes,
		          committedTransitions
		        ) : recursivelyTraverseAtomicPassiveEffects(
		          finishedRoot,
		          finishedWork
		        ) : _finishedWork$memoize2._visibility & 2 ? recursivelyTraversePassiveMountEffects(
		          finishedRoot,
		          finishedWork,
		          committedLanes,
		          committedTransitions
		        ) : (_finishedWork$memoize2._visibility |= 2, recursivelyTraverseReconnectPassiveEffects(
		          finishedRoot,
		          finishedWork,
		          committedLanes,
		          committedTransitions,
		          0 !== (finishedWork.subtreeFlags & 10256) || false
		        ));
		        flags & 2048 && commitOffscreenPassiveMountEffects(id, finishedWork);
		        break;
		      case 24:
		        recursivelyTraversePassiveMountEffects(
		          finishedRoot,
		          finishedWork,
		          committedLanes,
		          committedTransitions
		        );
		        flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
		        break;
		      default:
		        recursivelyTraversePassiveMountEffects(
		          finishedRoot,
		          finishedWork,
		          committedLanes,
		          committedTransitions
		        );
		    }
		  }
		  function recursivelyTraverseReconnectPassiveEffects(finishedRoot$jscomp$0, parentFiber, committedLanes$jscomp$0, committedTransitions$jscomp$0, includeWorkInProgressEffects) {
		    includeWorkInProgressEffects = includeWorkInProgressEffects && (0 !== (parentFiber.subtreeFlags & 10256) || false);
		    for (parentFiber = parentFiber.child; null !== parentFiber; ) {
		      var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, committedLanes = committedLanes$jscomp$0, committedTransitions = committedTransitions$jscomp$0, flags = finishedWork.flags;
		      switch (finishedWork.tag) {
		        case 0:
		        case 11:
		        case 15:
		          recursivelyTraverseReconnectPassiveEffects(
		            finishedRoot,
		            finishedWork,
		            committedLanes,
		            committedTransitions,
		            includeWorkInProgressEffects
		          );
		          commitHookEffectListMount(8, finishedWork);
		          break;
		        case 23:
		          break;
		        case 22:
		          var instance = finishedWork.stateNode;
		          null !== finishedWork.memoizedState ? instance._visibility & 2 ? recursivelyTraverseReconnectPassiveEffects(
		            finishedRoot,
		            finishedWork,
		            committedLanes,
		            committedTransitions,
		            includeWorkInProgressEffects
		          ) : recursivelyTraverseAtomicPassiveEffects(
		            finishedRoot,
		            finishedWork
		          ) : (instance._visibility |= 2, recursivelyTraverseReconnectPassiveEffects(
		            finishedRoot,
		            finishedWork,
		            committedLanes,
		            committedTransitions,
		            includeWorkInProgressEffects
		          ));
		          includeWorkInProgressEffects && flags & 2048 && commitOffscreenPassiveMountEffects(
		            finishedWork.alternate,
		            finishedWork
		          );
		          break;
		        case 24:
		          recursivelyTraverseReconnectPassiveEffects(
		            finishedRoot,
		            finishedWork,
		            committedLanes,
		            committedTransitions,
		            includeWorkInProgressEffects
		          );
		          includeWorkInProgressEffects && flags & 2048 && commitCachePassiveMountEffect(finishedWork.alternate, finishedWork);
		          break;
		        default:
		          recursivelyTraverseReconnectPassiveEffects(
		            finishedRoot,
		            finishedWork,
		            committedLanes,
		            committedTransitions,
		            includeWorkInProgressEffects
		          );
		      }
		      parentFiber = parentFiber.sibling;
		    }
		  }
		  function recursivelyTraverseAtomicPassiveEffects(finishedRoot$jscomp$0, parentFiber) {
		    if (parentFiber.subtreeFlags & 10256)
		      for (parentFiber = parentFiber.child; null !== parentFiber; ) {
		        var finishedRoot = finishedRoot$jscomp$0, finishedWork = parentFiber, flags = finishedWork.flags;
		        switch (finishedWork.tag) {
		          case 22:
		            recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
		            flags & 2048 && commitOffscreenPassiveMountEffects(
		              finishedWork.alternate,
		              finishedWork
		            );
		            break;
		          case 24:
		            recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
		            flags & 2048 && commitCachePassiveMountEffect(
		              finishedWork.alternate,
		              finishedWork
		            );
		            break;
		          default:
		            recursivelyTraverseAtomicPassiveEffects(finishedRoot, finishedWork);
		        }
		        parentFiber = parentFiber.sibling;
		      }
		  }
		  function recursivelyAccumulateSuspenseyCommit(parentFiber, committedLanes, suspendedState) {
		    if (parentFiber.subtreeFlags & suspenseyCommitFlag)
		      for (parentFiber = parentFiber.child; null !== parentFiber; )
		        accumulateSuspenseyCommitOnFiber(
		          parentFiber,
		          committedLanes,
		          suspendedState
		        ), parentFiber = parentFiber.sibling;
		  }
		  function accumulateSuspenseyCommitOnFiber(fiber, committedLanes, suspendedState) {
		    switch (fiber.tag) {
		      case 26:
		        recursivelyAccumulateSuspenseyCommit(
		          fiber,
		          committedLanes,
		          suspendedState
		        );
		        if (fiber.flags & suspenseyCommitFlag)
		          if (null !== fiber.memoizedState)
		            suspendResource(
		              suspendedState,
		              currentHoistableRoot,
		              fiber.memoizedState,
		              fiber.memoizedProps
		            );
		          else {
		            var instance = fiber.stateNode, type = fiber.type;
		            fiber = fiber.memoizedProps;
		            ((committedLanes & 335544128) === committedLanes || maySuspendCommitInSyncRender(type, fiber)) && suspendInstance(suspendedState, instance, type, fiber);
		          }
		        break;
		      case 5:
		        recursivelyAccumulateSuspenseyCommit(
		          fiber,
		          committedLanes,
		          suspendedState
		        );
		        fiber.flags & suspenseyCommitFlag && (instance = fiber.stateNode, type = fiber.type, fiber = fiber.memoizedProps, ((committedLanes & 335544128) === committedLanes || maySuspendCommitInSyncRender(type, fiber)) && suspendInstance(suspendedState, instance, type, fiber));
		        break;
		      case 3:
		      case 4:
		        supportsResources ? (instance = currentHoistableRoot, currentHoistableRoot = getHoistableRoot(
		          fiber.stateNode.containerInfo
		        ), recursivelyAccumulateSuspenseyCommit(
		          fiber,
		          committedLanes,
		          suspendedState
		        ), currentHoistableRoot = instance) : recursivelyAccumulateSuspenseyCommit(
		          fiber,
		          committedLanes,
		          suspendedState
		        );
		        break;
		      case 22:
		        null === fiber.memoizedState && (instance = fiber.alternate, null !== instance && null !== instance.memoizedState ? (instance = suspenseyCommitFlag, suspenseyCommitFlag = 16777216, recursivelyAccumulateSuspenseyCommit(
		          fiber,
		          committedLanes,
		          suspendedState
		        ), suspenseyCommitFlag = instance) : recursivelyAccumulateSuspenseyCommit(
		          fiber,
		          committedLanes,
		          suspendedState
		        ));
		        break;
		      default:
		        recursivelyAccumulateSuspenseyCommit(
		          fiber,
		          committedLanes,
		          suspendedState
		        );
		    }
		  }
		  function detachAlternateSiblings(parentFiber) {
		    var previousFiber = parentFiber.alternate;
		    if (null !== previousFiber && (parentFiber = previousFiber.child, null !== parentFiber)) {
		      previousFiber.child = null;
		      do
		        previousFiber = parentFiber.sibling, parentFiber.sibling = null, parentFiber = previousFiber;
		      while (null !== parentFiber);
		    }
		  }
		  function recursivelyTraversePassiveUnmountEffects(parentFiber) {
		    var deletions = parentFiber.deletions;
		    if (0 !== (parentFiber.flags & 16)) {
		      if (null !== deletions)
		        for (var i = 0; i < deletions.length; i++) {
		          var childToDelete = deletions[i];
		          nextEffect = childToDelete;
		          commitPassiveUnmountEffectsInsideOfDeletedTree_begin(
		            childToDelete,
		            parentFiber
		          );
		        }
		      detachAlternateSiblings(parentFiber);
		    }
		    if (parentFiber.subtreeFlags & 10256)
		      for (parentFiber = parentFiber.child; null !== parentFiber; )
		        commitPassiveUnmountOnFiber(parentFiber), parentFiber = parentFiber.sibling;
		  }
		  function commitPassiveUnmountOnFiber(finishedWork) {
		    switch (finishedWork.tag) {
		      case 0:
		      case 11:
		      case 15:
		        recursivelyTraversePassiveUnmountEffects(finishedWork);
		        finishedWork.flags & 2048 && commitHookEffectListUnmount(9, finishedWork, finishedWork.return);
		        break;
		      case 3:
		        recursivelyTraversePassiveUnmountEffects(finishedWork);
		        break;
		      case 12:
		        recursivelyTraversePassiveUnmountEffects(finishedWork);
		        break;
		      case 22:
		        var instance = finishedWork.stateNode;
		        null !== finishedWork.memoizedState && instance._visibility & 2 && (null === finishedWork.return || 13 !== finishedWork.return.tag) ? (instance._visibility &= -3, recursivelyTraverseDisconnectPassiveEffects(finishedWork)) : recursivelyTraversePassiveUnmountEffects(finishedWork);
		        break;
		      default:
		        recursivelyTraversePassiveUnmountEffects(finishedWork);
		    }
		  }
		  function recursivelyTraverseDisconnectPassiveEffects(parentFiber) {
		    var deletions = parentFiber.deletions;
		    if (0 !== (parentFiber.flags & 16)) {
		      if (null !== deletions)
		        for (var i = 0; i < deletions.length; i++) {
		          var childToDelete = deletions[i];
		          nextEffect = childToDelete;
		          commitPassiveUnmountEffectsInsideOfDeletedTree_begin(
		            childToDelete,
		            parentFiber
		          );
		        }
		      detachAlternateSiblings(parentFiber);
		    }
		    for (parentFiber = parentFiber.child; null !== parentFiber; ) {
		      deletions = parentFiber;
		      switch (deletions.tag) {
		        case 0:
		        case 11:
		        case 15:
		          commitHookEffectListUnmount(8, deletions, deletions.return);
		          recursivelyTraverseDisconnectPassiveEffects(deletions);
		          break;
		        case 22:
		          i = deletions.stateNode;
		          i._visibility & 2 && (i._visibility &= -3, recursivelyTraverseDisconnectPassiveEffects(deletions));
		          break;
		        default:
		          recursivelyTraverseDisconnectPassiveEffects(deletions);
		      }
		      parentFiber = parentFiber.sibling;
		    }
		  }
		  function commitPassiveUnmountEffectsInsideOfDeletedTree_begin(deletedSubtreeRoot, nearestMountedAncestor) {
		    for (; null !== nextEffect; ) {
		      var fiber = nextEffect;
		      switch (fiber.tag) {
		        case 0:
		        case 11:
		        case 15:
		          commitHookEffectListUnmount(8, fiber, nearestMountedAncestor);
		          break;
		        case 23:
		        case 22:
		          if (null !== fiber.memoizedState && null !== fiber.memoizedState.cachePool) {
		            var cache = fiber.memoizedState.cachePool.pool;
		            null != cache && cache.refCount++;
		          }
		          break;
		        case 24:
		          releaseCache(fiber.memoizedState.cache);
		      }
		      cache = fiber.child;
		      if (null !== cache) cache.return = fiber, nextEffect = cache;
		      else
		        a: for (fiber = deletedSubtreeRoot; null !== nextEffect; ) {
		          cache = nextEffect;
		          var sibling = cache.sibling, returnFiber = cache.return;
		          detachFiberAfterEffects(cache);
		          if (cache === fiber) {
		            nextEffect = null;
		            break a;
		          }
		          if (null !== sibling) {
		            sibling.return = returnFiber;
		            nextEffect = sibling;
		            break a;
		          }
		          nextEffect = returnFiber;
		        }
		    }
		  }
		  function findFiberRootForHostRoot(hostRoot) {
		    var maybeFiber = getInstanceFromNode(hostRoot);
		    if (null != maybeFiber) {
		      if ("string" !== typeof maybeFiber.memoizedProps["data-testname"])
		        throw Error(formatProdErrorMessage(364));
		      return maybeFiber;
		    }
		    hostRoot = findFiberRoot(hostRoot);
		    if (null === hostRoot) throw Error(formatProdErrorMessage(362));
		    return hostRoot.stateNode.current;
		  }
		  function matchSelector(fiber$jscomp$0, selector) {
		    var tag = fiber$jscomp$0.tag;
		    switch (selector.$$typeof) {
		      case COMPONENT_TYPE:
		        if (fiber$jscomp$0.type === selector.value) return true;
		        break;
		      case HAS_PSEUDO_CLASS_TYPE:
		        a: {
		          selector = selector.value;
		          fiber$jscomp$0 = [fiber$jscomp$0, 0];
		          for (tag = 0; tag < fiber$jscomp$0.length; ) {
		            var fiber = fiber$jscomp$0[tag++], tag$jscomp$0 = fiber.tag, selectorIndex = fiber$jscomp$0[tag++], selector$jscomp$0 = selector[selectorIndex];
		            if (5 !== tag$jscomp$0 && 26 !== tag$jscomp$0 && 27 !== tag$jscomp$0 || !isHiddenSubtree(fiber)) {
		              for (; null != selector$jscomp$0 && matchSelector(fiber, selector$jscomp$0); )
		                selectorIndex++, selector$jscomp$0 = selector[selectorIndex];
		              if (selectorIndex === selector.length) {
		                selector = true;
		                break a;
		              } else
		                for (fiber = fiber.child; null !== fiber; )
		                  fiber$jscomp$0.push(fiber, selectorIndex), fiber = fiber.sibling;
		            }
		          }
		          selector = false;
		        }
		        return selector;
		      case ROLE_TYPE:
		        if ((5 === tag || 26 === tag || 27 === tag) && matchAccessibilityRole(fiber$jscomp$0.stateNode, selector.value))
		          return true;
		        break;
		      case TEXT_TYPE:
		        if (5 === tag || 6 === tag || 26 === tag || 27 === tag) {
		          if (fiber$jscomp$0 = getTextContent(fiber$jscomp$0), null !== fiber$jscomp$0 && 0 <= fiber$jscomp$0.indexOf(selector.value))
		            return true;
		        }
		        break;
		      case TEST_NAME_TYPE:
		        if (5 === tag || 26 === tag || 27 === tag) {
		          if (fiber$jscomp$0 = fiber$jscomp$0.memoizedProps["data-testname"], "string" === typeof fiber$jscomp$0 && fiber$jscomp$0.toLowerCase() === selector.value.toLowerCase())
		            return true;
		        }
		        break;
		      default:
		        throw Error(formatProdErrorMessage(365));
		    }
		    return false;
		  }
		  function selectorToString(selector) {
		    switch (selector.$$typeof) {
		      case COMPONENT_TYPE:
		        return "<" + (getComponentNameFromType(selector.value) || "Unknown") + ">";
		      case HAS_PSEUDO_CLASS_TYPE:
		        return ":has(" + (selectorToString(selector) || "") + ")";
		      case ROLE_TYPE:
		        return '[role="' + selector.value + '"]';
		      case TEXT_TYPE:
		        return '"' + selector.value + '"';
		      case TEST_NAME_TYPE:
		        return '[data-testname="' + selector.value + '"]';
		      default:
		        throw Error(formatProdErrorMessage(365));
		    }
		  }
		  function findPaths(root, selectors) {
		    var matchingFibers = [];
		    root = [root, 0];
		    for (var index = 0; index < root.length; ) {
		      var fiber = root[index++], tag = fiber.tag, selectorIndex = root[index++], selector = selectors[selectorIndex];
		      if (5 !== tag && 26 !== tag && 27 !== tag || !isHiddenSubtree(fiber)) {
		        for (; null != selector && matchSelector(fiber, selector); )
		          selectorIndex++, selector = selectors[selectorIndex];
		        if (selectorIndex === selectors.length) matchingFibers.push(fiber);
		        else
		          for (fiber = fiber.child; null !== fiber; )
		            root.push(fiber, selectorIndex), fiber = fiber.sibling;
		      }
		    }
		    return matchingFibers;
		  }
		  function findAllNodes(hostRoot, selectors) {
		    if (!supportsTestSelectors) throw Error(formatProdErrorMessage(363));
		    hostRoot = findFiberRootForHostRoot(hostRoot);
		    hostRoot = findPaths(hostRoot, selectors);
		    selectors = [];
		    hostRoot = Array.from(hostRoot);
		    for (var index = 0; index < hostRoot.length; ) {
		      var node = hostRoot[index++], tag = node.tag;
		      if (5 === tag || 26 === tag || 27 === tag)
		        isHiddenSubtree(node) || selectors.push(node.stateNode);
		      else
		        for (node = node.child; null !== node; )
		          hostRoot.push(node), node = node.sibling;
		    }
		    return selectors;
		  }
		  function requestUpdateLane() {
		    return 0 !== (executionContext & 2) && 0 !== workInProgressRootRenderLanes ? workInProgressRootRenderLanes & -workInProgressRootRenderLanes : null !== ReactSharedInternals.T ? requestTransitionLane() : resolveUpdatePriority();
		  }
		  function requestDeferredLane() {
		    if (0 === workInProgressDeferredLane)
		      if (0 === (workInProgressRootRenderLanes & 536870912) || isHydrating) {
		        var lane = nextTransitionDeferredLane;
		        nextTransitionDeferredLane <<= 1;
		        0 === (nextTransitionDeferredLane & 3932160) && (nextTransitionDeferredLane = 262144);
		        workInProgressDeferredLane = lane;
		      } else workInProgressDeferredLane = 536870912;
		    lane = suspenseHandlerStackCursor.current;
		    null !== lane && (lane.flags |= 32);
		    return workInProgressDeferredLane;
		  }
		  function scheduleUpdateOnFiber(root, fiber, lane) {
		    if (root === workInProgressRoot && (2 === workInProgressSuspendedReason || 9 === workInProgressSuspendedReason) || null !== root.cancelPendingCommit)
		      prepareFreshStack(root, 0), markRootSuspended(
		        root,
		        workInProgressRootRenderLanes,
		        workInProgressDeferredLane,
		        false
		      );
		    markRootUpdated$1(root, lane);
		    if (0 === (executionContext & 2) || root !== workInProgressRoot)
		      root === workInProgressRoot && (0 === (executionContext & 2) && (workInProgressRootInterleavedUpdatedLanes |= lane), 4 === workInProgressRootExitStatus && markRootSuspended(
		        root,
		        workInProgressRootRenderLanes,
		        workInProgressDeferredLane,
		        false
		      )), ensureRootIsScheduled(root);
		  }
		  function performWorkOnRoot(root$jscomp$0, lanes, forceSync) {
		    if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(327));
		    var shouldTimeSlice = !forceSync && 0 === (lanes & 127) && 0 === (lanes & root$jscomp$0.expiredLanes) || checkIfRootIsPrerendering(root$jscomp$0, lanes), exitStatus = shouldTimeSlice ? renderRootConcurrent(root$jscomp$0, lanes) : renderRootSync(root$jscomp$0, lanes, true), renderWasConcurrent = shouldTimeSlice;
		    do {
		      if (0 === exitStatus) {
		        workInProgressRootIsPrerendering && !shouldTimeSlice && markRootSuspended(root$jscomp$0, lanes, 0, false);
		        break;
		      } else {
		        forceSync = root$jscomp$0.current.alternate;
		        if (renderWasConcurrent && !isRenderConsistentWithExternalStores(forceSync)) {
		          exitStatus = renderRootSync(root$jscomp$0, lanes, false);
		          renderWasConcurrent = false;
		          continue;
		        }
		        if (2 === exitStatus) {
		          renderWasConcurrent = lanes;
		          if (root$jscomp$0.errorRecoveryDisabledLanes & renderWasConcurrent)
		            var JSCompiler_inline_result = 0;
		          else
		            JSCompiler_inline_result = root$jscomp$0.pendingLanes & -536870913, JSCompiler_inline_result = 0 !== JSCompiler_inline_result ? JSCompiler_inline_result : JSCompiler_inline_result & 536870912 ? 536870912 : 0;
		          if (0 !== JSCompiler_inline_result) {
		            lanes = JSCompiler_inline_result;
		            a: {
		              var root = root$jscomp$0;
		              exitStatus = workInProgressRootConcurrentErrors;
		              var wasRootDehydrated = supportsHydration && root.current.memoizedState.isDehydrated;
		              wasRootDehydrated && (prepareFreshStack(root, JSCompiler_inline_result).flags |= 256);
		              JSCompiler_inline_result = renderRootSync(
		                root,
		                JSCompiler_inline_result,
		                false
		              );
		              if (2 !== JSCompiler_inline_result) {
		                if (workInProgressRootDidAttachPingListener && !wasRootDehydrated) {
		                  root.errorRecoveryDisabledLanes |= renderWasConcurrent;
		                  workInProgressRootInterleavedUpdatedLanes |= renderWasConcurrent;
		                  exitStatus = 4;
		                  break a;
		                }
		                renderWasConcurrent = workInProgressRootRecoverableErrors;
		                workInProgressRootRecoverableErrors = exitStatus;
		                null !== renderWasConcurrent && (null === workInProgressRootRecoverableErrors ? workInProgressRootRecoverableErrors = renderWasConcurrent : workInProgressRootRecoverableErrors.push.apply(
		                  workInProgressRootRecoverableErrors,
		                  renderWasConcurrent
		                ));
		              }
		              exitStatus = JSCompiler_inline_result;
		            }
		            renderWasConcurrent = false;
		            if (2 !== exitStatus) continue;
		          }
		        }
		        if (1 === exitStatus) {
		          prepareFreshStack(root$jscomp$0, 0);
		          markRootSuspended(root$jscomp$0, lanes, 0, true);
		          break;
		        }
		        a: {
		          shouldTimeSlice = root$jscomp$0;
		          renderWasConcurrent = exitStatus;
		          switch (renderWasConcurrent) {
		            case 0:
		            case 1:
		              throw Error(formatProdErrorMessage(345));
		            case 4:
		              if ((lanes & 4194048) !== lanes) break;
		            case 6:
		              markRootSuspended(
		                shouldTimeSlice,
		                lanes,
		                workInProgressDeferredLane,
		                !workInProgressRootDidSkipSuspendedSiblings
		              );
		              break a;
		            case 2:
		              workInProgressRootRecoverableErrors = null;
		              break;
		            case 3:
		            case 5:
		              break;
		            default:
		              throw Error(formatProdErrorMessage(329));
		          }
		          if ((lanes & 62914560) === lanes && (exitStatus = globalMostRecentFallbackTime + 300 - now(), 10 < exitStatus)) {
		            markRootSuspended(
		              shouldTimeSlice,
		              lanes,
		              workInProgressDeferredLane,
		              !workInProgressRootDidSkipSuspendedSiblings
		            );
		            if (0 !== getNextLanes(shouldTimeSlice, 0, true)) break a;
		            pendingEffectsLanes = lanes;
		            shouldTimeSlice.timeoutHandle = scheduleTimeout(
		              commitRootWhenReady.bind(
		                null,
		                shouldTimeSlice,
		                forceSync,
		                workInProgressRootRecoverableErrors,
		                workInProgressTransitions,
		                workInProgressRootDidIncludeRecursiveRenderUpdate,
		                lanes,
		                workInProgressDeferredLane,
		                workInProgressRootInterleavedUpdatedLanes,
		                workInProgressSuspendedRetryLanes,
		                workInProgressRootDidSkipSuspendedSiblings,
		                renderWasConcurrent,
		                "Throttled",
		                -0,
		                0
		              ),
		              exitStatus
		            );
		            break a;
		          }
		          commitRootWhenReady(
		            shouldTimeSlice,
		            forceSync,
		            workInProgressRootRecoverableErrors,
		            workInProgressTransitions,
		            workInProgressRootDidIncludeRecursiveRenderUpdate,
		            lanes,
		            workInProgressDeferredLane,
		            workInProgressRootInterleavedUpdatedLanes,
		            workInProgressSuspendedRetryLanes,
		            workInProgressRootDidSkipSuspendedSiblings,
		            renderWasConcurrent,
		            null,
		            -0,
		            0
		          );
		        }
		      }
		      break;
		    } while (1);
		    ensureRootIsScheduled(root$jscomp$0);
		  }
		  function commitRootWhenReady(root, finishedWork, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, lanes, spawnedLane, updatedLanes, suspendedRetryLanes, didSkipSuspendedSiblings, exitStatus, suspendedCommitReason, completedRenderStartTime, completedRenderEndTime) {
		    root.timeoutHandle = noTimeout;
		    suspendedCommitReason = finishedWork.subtreeFlags;
		    if (suspendedCommitReason & 8192 || 16785408 === (suspendedCommitReason & 16785408)) {
		      suspendedCommitReason = startSuspendingCommit();
		      accumulateSuspenseyCommitOnFiber(
		        finishedWork,
		        lanes,
		        suspendedCommitReason
		      );
		      var timeoutOffset = (lanes & 62914560) === lanes ? globalMostRecentFallbackTime - now() : (lanes & 4194048) === lanes ? globalMostRecentTransitionTime - now() : 0;
		      timeoutOffset = waitForCommitToBeReady(
		        suspendedCommitReason,
		        timeoutOffset
		      );
		      if (null !== timeoutOffset) {
		        pendingEffectsLanes = lanes;
		        root.cancelPendingCommit = timeoutOffset(
		          commitRoot.bind(
		            null,
		            root,
		            finishedWork,
		            lanes,
		            recoverableErrors,
		            transitions,
		            didIncludeRenderPhaseUpdate,
		            spawnedLane,
		            updatedLanes,
		            suspendedRetryLanes,
		            exitStatus,
		            suspendedCommitReason,
		            null,
		            completedRenderStartTime,
		            completedRenderEndTime
		          )
		        );
		        markRootSuspended(root, lanes, spawnedLane, !didSkipSuspendedSiblings);
		        return;
		      }
		    }
		    commitRoot(
		      root,
		      finishedWork,
		      lanes,
		      recoverableErrors,
		      transitions,
		      didIncludeRenderPhaseUpdate,
		      spawnedLane,
		      updatedLanes,
		      suspendedRetryLanes
		    );
		  }
		  function isRenderConsistentWithExternalStores(finishedWork) {
		    for (var node = finishedWork; ; ) {
		      var tag = node.tag;
		      if ((0 === tag || 11 === tag || 15 === tag) && node.flags & 16384 && (tag = node.updateQueue, null !== tag && (tag = tag.stores, null !== tag)))
		        for (var i = 0; i < tag.length; i++) {
		          var check = tag[i], getSnapshot = check.getSnapshot;
		          check = check.value;
		          try {
		            if (!objectIs(getSnapshot(), check)) return false;
		          } catch (error) {
		            return false;
		          }
		        }
		      tag = node.child;
		      if (node.subtreeFlags & 16384 && null !== tag)
		        tag.return = node, node = tag;
		      else {
		        if (node === finishedWork) break;
		        for (; null === node.sibling; ) {
		          if (null === node.return || node.return === finishedWork) return true;
		          node = node.return;
		        }
		        node.sibling.return = node.return;
		        node = node.sibling;
		      }
		    }
		    return true;
		  }
		  function markRootSuspended(root, suspendedLanes, spawnedLane, didAttemptEntireTree) {
		    suspendedLanes &= ~workInProgressRootPingedLanes;
		    suspendedLanes &= ~workInProgressRootInterleavedUpdatedLanes;
		    root.suspendedLanes |= suspendedLanes;
		    root.pingedLanes &= ~suspendedLanes;
		    didAttemptEntireTree && (root.warmLanes |= suspendedLanes);
		    didAttemptEntireTree = root.expirationTimes;
		    for (var lanes = suspendedLanes; 0 < lanes; ) {
		      var index$4 = 31 - clz32(lanes), lane = 1 << index$4;
		      didAttemptEntireTree[index$4] = -1;
		      lanes &= ~lane;
		    }
		    0 !== spawnedLane && markSpawnedDeferredLane(root, spawnedLane, suspendedLanes);
		  }
		  function flushSyncWork() {
		    return 0 === (executionContext & 6) ? (flushSyncWorkAcrossRoots_impl(0), false) : true;
		  }
		  function resetWorkInProgressStack() {
		    if (null !== workInProgress) {
		      if (0 === workInProgressSuspendedReason)
		        var interruptedWork = workInProgress.return;
		      else
		        interruptedWork = workInProgress, lastContextDependency = currentlyRenderingFiber$1 = null, resetHooksOnUnwind(interruptedWork), thenableState$1 = null, thenableIndexCounter$1 = 0, interruptedWork = workInProgress;
		      for (; null !== interruptedWork; )
		        unwindInterruptedWork(interruptedWork.alternate, interruptedWork), interruptedWork = interruptedWork.return;
		      workInProgress = null;
		    }
		  }
		  function prepareFreshStack(root, lanes) {
		    var timeoutHandle = root.timeoutHandle;
		    timeoutHandle !== noTimeout && (root.timeoutHandle = noTimeout, cancelTimeout(timeoutHandle));
		    timeoutHandle = root.cancelPendingCommit;
		    null !== timeoutHandle && (root.cancelPendingCommit = null, timeoutHandle());
		    pendingEffectsLanes = 0;
		    resetWorkInProgressStack();
		    workInProgressRoot = root;
		    workInProgress = timeoutHandle = createWorkInProgress(root.current, null);
		    workInProgressRootRenderLanes = lanes;
		    workInProgressSuspendedReason = 0;
		    workInProgressThrownValue = null;
		    workInProgressRootDidSkipSuspendedSiblings = false;
		    workInProgressRootIsPrerendering = checkIfRootIsPrerendering(root, lanes);
		    workInProgressRootDidAttachPingListener = false;
		    workInProgressSuspendedRetryLanes = workInProgressDeferredLane = workInProgressRootPingedLanes = workInProgressRootInterleavedUpdatedLanes = workInProgressRootSkippedLanes = workInProgressRootExitStatus = 0;
		    workInProgressRootRecoverableErrors = workInProgressRootConcurrentErrors = null;
		    workInProgressRootDidIncludeRecursiveRenderUpdate = false;
		    0 !== (lanes & 8) && (lanes |= lanes & 32);
		    var allEntangledLanes = root.entangledLanes;
		    if (0 !== allEntangledLanes)
		      for (root = root.entanglements, allEntangledLanes &= lanes; 0 < allEntangledLanes; ) {
		        var index$2 = 31 - clz32(allEntangledLanes), lane = 1 << index$2;
		        lanes |= root[index$2];
		        allEntangledLanes &= ~lane;
		      }
		    entangledRenderLanes = lanes;
		    finishQueueingConcurrentUpdates();
		    return timeoutHandle;
		  }
		  function handleThrow(root, thrownValue) {
		    currentlyRenderingFiber = null;
		    ReactSharedInternals.H = ContextOnlyDispatcher;
		    thrownValue === SuspenseException || thrownValue === SuspenseActionException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 3) : thrownValue === SuspenseyCommitException ? (thrownValue = getSuspendedThenable(), workInProgressSuspendedReason = 4) : workInProgressSuspendedReason = thrownValue === SelectiveHydrationException ? 8 : null !== thrownValue && "object" === typeof thrownValue && "function" === typeof thrownValue.then ? 6 : 1;
		    workInProgressThrownValue = thrownValue;
		    null === workInProgress && (workInProgressRootExitStatus = 1, logUncaughtError(
		      root,
		      createCapturedValueAtFiber(thrownValue, root.current)
		    ));
		  }
		  function shouldRemainOnPreviousScreen() {
		    var handler = suspenseHandlerStackCursor.current;
		    return null === handler ? true : (workInProgressRootRenderLanes & 4194048) === workInProgressRootRenderLanes ? null === shellBoundary ? true : false : (workInProgressRootRenderLanes & 62914560) === workInProgressRootRenderLanes || 0 !== (workInProgressRootRenderLanes & 536870912) ? handler === shellBoundary : false;
		  }
		  function pushDispatcher() {
		    var prevDispatcher = ReactSharedInternals.H;
		    ReactSharedInternals.H = ContextOnlyDispatcher;
		    return null === prevDispatcher ? ContextOnlyDispatcher : prevDispatcher;
		  }
		  function pushAsyncDispatcher() {
		    var prevAsyncDispatcher = ReactSharedInternals.A;
		    ReactSharedInternals.A = DefaultAsyncDispatcher;
		    return prevAsyncDispatcher;
		  }
		  function renderDidSuspendDelayIfPossible() {
		    workInProgressRootExitStatus = 4;
		    workInProgressRootDidSkipSuspendedSiblings || (workInProgressRootRenderLanes & 4194048) !== workInProgressRootRenderLanes && null !== suspenseHandlerStackCursor.current || (workInProgressRootIsPrerendering = true);
		    0 === (workInProgressRootSkippedLanes & 134217727) && 0 === (workInProgressRootInterleavedUpdatedLanes & 134217727) || null === workInProgressRoot || markRootSuspended(
		      workInProgressRoot,
		      workInProgressRootRenderLanes,
		      workInProgressDeferredLane,
		      false
		    );
		  }
		  function renderRootSync(root, lanes, shouldYieldForPrerendering) {
		    var prevExecutionContext = executionContext;
		    executionContext |= 2;
		    var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
		    if (workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes)
		      workInProgressTransitions = null, prepareFreshStack(root, lanes);
		    lanes = false;
		    var exitStatus = workInProgressRootExitStatus;
		    a: do
		      try {
		        if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
		          var unitOfWork = workInProgress, thrownValue = workInProgressThrownValue;
		          switch (workInProgressSuspendedReason) {
		            case 8:
		              resetWorkInProgressStack();
		              exitStatus = 6;
		              break a;
		            case 3:
		            case 2:
		            case 9:
		            case 6:
		              null === suspenseHandlerStackCursor.current && (lanes = true);
		              var reason = workInProgressSuspendedReason;
		              workInProgressSuspendedReason = 0;
		              workInProgressThrownValue = null;
		              throwAndUnwindWorkLoop(root, unitOfWork, thrownValue, reason);
		              if (shouldYieldForPrerendering && workInProgressRootIsPrerendering) {
		                exitStatus = 0;
		                break a;
		              }
		              break;
		            default:
		              reason = workInProgressSuspendedReason, workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root, unitOfWork, thrownValue, reason);
		          }
		        }
		        workLoopSync();
		        exitStatus = workInProgressRootExitStatus;
		        break;
		      } catch (thrownValue$152) {
		        handleThrow(root, thrownValue$152);
		      }
		    while (1);
		    lanes && root.shellSuspendCounter++;
		    lastContextDependency = currentlyRenderingFiber$1 = null;
		    executionContext = prevExecutionContext;
		    ReactSharedInternals.H = prevDispatcher;
		    ReactSharedInternals.A = prevAsyncDispatcher;
		    null === workInProgress && (workInProgressRoot = null, workInProgressRootRenderLanes = 0, finishQueueingConcurrentUpdates());
		    return exitStatus;
		  }
		  function workLoopSync() {
		    for (; null !== workInProgress; ) performUnitOfWork(workInProgress);
		  }
		  function renderRootConcurrent(root, lanes) {
		    var prevExecutionContext = executionContext;
		    executionContext |= 2;
		    var prevDispatcher = pushDispatcher(), prevAsyncDispatcher = pushAsyncDispatcher();
		    workInProgressRoot !== root || workInProgressRootRenderLanes !== lanes ? (workInProgressTransitions = null, workInProgressRootRenderTargetTime = now() + 500, prepareFreshStack(root, lanes)) : workInProgressRootIsPrerendering = checkIfRootIsPrerendering(
		      root,
		      lanes
		    );
		    a: do
		      try {
		        if (0 !== workInProgressSuspendedReason && null !== workInProgress) {
		          lanes = workInProgress;
		          var thrownValue = workInProgressThrownValue;
		          b: switch (workInProgressSuspendedReason) {
		            case 1:
		              workInProgressSuspendedReason = 0;
		              workInProgressThrownValue = null;
		              throwAndUnwindWorkLoop(root, lanes, thrownValue, 1);
		              break;
		            case 2:
		            case 9:
		              if (isThenableResolved(thrownValue)) {
		                workInProgressSuspendedReason = 0;
		                workInProgressThrownValue = null;
		                replaySuspendedUnitOfWork(lanes);
		                break;
		              }
		              lanes = function() {
		                2 !== workInProgressSuspendedReason && 9 !== workInProgressSuspendedReason || workInProgressRoot !== root || (workInProgressSuspendedReason = 7);
		                ensureRootIsScheduled(root);
		              };
		              thrownValue.then(lanes, lanes);
		              break a;
		            case 3:
		              workInProgressSuspendedReason = 7;
		              break a;
		            case 4:
		              workInProgressSuspendedReason = 5;
		              break a;
		            case 7:
		              isThenableResolved(thrownValue) ? (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, replaySuspendedUnitOfWork(lanes)) : (workInProgressSuspendedReason = 0, workInProgressThrownValue = null, throwAndUnwindWorkLoop(root, lanes, thrownValue, 7));
		              break;
		            case 5:
		              var resource = null;
		              switch (workInProgress.tag) {
		                case 26:
		                  resource = workInProgress.memoizedState;
		                case 5:
		                case 27:
		                  var hostFiber = workInProgress, type = hostFiber.type, props = hostFiber.pendingProps;
		                  if (resource ? preloadResource(resource) : preloadInstance(hostFiber.stateNode, type, props)) {
		                    workInProgressSuspendedReason = 0;
		                    workInProgressThrownValue = null;
		                    var sibling = hostFiber.sibling;
		                    if (null !== sibling) workInProgress = sibling;
		                    else {
		                      var returnFiber = hostFiber.return;
		                      null !== returnFiber ? (workInProgress = returnFiber, completeUnitOfWork(returnFiber)) : workInProgress = null;
		                    }
		                    break b;
		                  }
		              }
		              workInProgressSuspendedReason = 0;
		              workInProgressThrownValue = null;
		              throwAndUnwindWorkLoop(root, lanes, thrownValue, 5);
		              break;
		            case 6:
		              workInProgressSuspendedReason = 0;
		              workInProgressThrownValue = null;
		              throwAndUnwindWorkLoop(root, lanes, thrownValue, 6);
		              break;
		            case 8:
		              resetWorkInProgressStack();
		              workInProgressRootExitStatus = 6;
		              break a;
		            default:
		              throw Error(formatProdErrorMessage(462));
		          }
		        }
		        workLoopConcurrentByScheduler();
		        break;
		      } catch (thrownValue$154) {
		        handleThrow(root, thrownValue$154);
		      }
		    while (1);
		    lastContextDependency = currentlyRenderingFiber$1 = null;
		    ReactSharedInternals.H = prevDispatcher;
		    ReactSharedInternals.A = prevAsyncDispatcher;
		    executionContext = prevExecutionContext;
		    if (null !== workInProgress) return 0;
		    workInProgressRoot = null;
		    workInProgressRootRenderLanes = 0;
		    finishQueueingConcurrentUpdates();
		    return workInProgressRootExitStatus;
		  }
		  function workLoopConcurrentByScheduler() {
		    for (; null !== workInProgress && !shouldYield(); )
		      performUnitOfWork(workInProgress);
		  }
		  function performUnitOfWork(unitOfWork) {
		    var next = beginWork(
		      unitOfWork.alternate,
		      unitOfWork,
		      entangledRenderLanes
		    );
		    unitOfWork.memoizedProps = unitOfWork.pendingProps;
		    null === next ? completeUnitOfWork(unitOfWork) : workInProgress = next;
		  }
		  function replaySuspendedUnitOfWork(unitOfWork) {
		    var next = unitOfWork;
		    var current = next.alternate;
		    switch (next.tag) {
		      case 15:
		      case 0:
		        next = replayFunctionComponent(
		          current,
		          next,
		          next.pendingProps,
		          next.type,
		          void 0,
		          workInProgressRootRenderLanes
		        );
		        break;
		      case 11:
		        next = replayFunctionComponent(
		          current,
		          next,
		          next.pendingProps,
		          next.type.render,
		          next.ref,
		          workInProgressRootRenderLanes
		        );
		        break;
		      case 5:
		        resetHooksOnUnwind(next);
		      default:
		        unwindInterruptedWork(current, next), next = workInProgress = resetWorkInProgress(next, entangledRenderLanes), next = beginWork(current, next, entangledRenderLanes);
		    }
		    unitOfWork.memoizedProps = unitOfWork.pendingProps;
		    null === next ? completeUnitOfWork(unitOfWork) : workInProgress = next;
		  }
		  function throwAndUnwindWorkLoop(root, unitOfWork, thrownValue, suspendedReason) {
		    lastContextDependency = currentlyRenderingFiber$1 = null;
		    resetHooksOnUnwind(unitOfWork);
		    thenableState$1 = null;
		    thenableIndexCounter$1 = 0;
		    var returnFiber = unitOfWork.return;
		    try {
		      if (throwException(
		        root,
		        returnFiber,
		        unitOfWork,
		        thrownValue,
		        workInProgressRootRenderLanes
		      )) {
		        workInProgressRootExitStatus = 1;
		        logUncaughtError(
		          root,
		          createCapturedValueAtFiber(thrownValue, root.current)
		        );
		        workInProgress = null;
		        return;
		      }
		    } catch (error) {
		      if (null !== returnFiber) throw workInProgress = returnFiber, error;
		      workInProgressRootExitStatus = 1;
		      logUncaughtError(
		        root,
		        createCapturedValueAtFiber(thrownValue, root.current)
		      );
		      workInProgress = null;
		      return;
		    }
		    if (unitOfWork.flags & 32768) {
		      if (isHydrating || 1 === suspendedReason) root = true;
		      else if (workInProgressRootIsPrerendering || 0 !== (workInProgressRootRenderLanes & 536870912))
		        root = false;
		      else if (workInProgressRootDidSkipSuspendedSiblings = root = true, 2 === suspendedReason || 9 === suspendedReason || 3 === suspendedReason || 6 === suspendedReason)
		        suspendedReason = suspenseHandlerStackCursor.current, null !== suspendedReason && 13 === suspendedReason.tag && (suspendedReason.flags |= 16384);
		      unwindUnitOfWork(unitOfWork, root);
		    } else completeUnitOfWork(unitOfWork);
		  }
		  function completeUnitOfWork(unitOfWork) {
		    var completedWork = unitOfWork;
		    do {
		      if (0 !== (completedWork.flags & 32768)) {
		        unwindUnitOfWork(
		          completedWork,
		          workInProgressRootDidSkipSuspendedSiblings
		        );
		        return;
		      }
		      unitOfWork = completedWork.return;
		      var next = completeWork(
		        completedWork.alternate,
		        completedWork,
		        entangledRenderLanes
		      );
		      if (null !== next) {
		        workInProgress = next;
		        return;
		      }
		      completedWork = completedWork.sibling;
		      if (null !== completedWork) {
		        workInProgress = completedWork;
		        return;
		      }
		      workInProgress = completedWork = unitOfWork;
		    } while (null !== completedWork);
		    0 === workInProgressRootExitStatus && (workInProgressRootExitStatus = 5);
		  }
		  function unwindUnitOfWork(unitOfWork, skipSiblings) {
		    do {
		      var next = unwindWork(unitOfWork.alternate, unitOfWork);
		      if (null !== next) {
		        next.flags &= 32767;
		        workInProgress = next;
		        return;
		      }
		      next = unitOfWork.return;
		      null !== next && (next.flags |= 32768, next.subtreeFlags = 0, next.deletions = null);
		      if (!skipSiblings && (unitOfWork = unitOfWork.sibling, null !== unitOfWork)) {
		        workInProgress = unitOfWork;
		        return;
		      }
		      workInProgress = unitOfWork = next;
		    } while (null !== unitOfWork);
		    workInProgressRootExitStatus = 6;
		    workInProgress = null;
		  }
		  function commitRoot(root, finishedWork, lanes, recoverableErrors, transitions, didIncludeRenderPhaseUpdate, spawnedLane, updatedLanes, suspendedRetryLanes) {
		    root.cancelPendingCommit = null;
		    do
		      flushPendingEffects();
		    while (0 !== pendingEffectsStatus);
		    if (0 !== (executionContext & 6)) throw Error(formatProdErrorMessage(327));
		    if (null !== finishedWork) {
		      if (finishedWork === root.current)
		        throw Error(formatProdErrorMessage(177));
		      didIncludeRenderPhaseUpdate = finishedWork.lanes | finishedWork.childLanes;
		      didIncludeRenderPhaseUpdate |= concurrentlyUpdatedLanes;
		      markRootFinished(
		        root,
		        lanes,
		        didIncludeRenderPhaseUpdate,
		        spawnedLane,
		        updatedLanes,
		        suspendedRetryLanes
		      );
		      root === workInProgressRoot && (workInProgress = workInProgressRoot = null, workInProgressRootRenderLanes = 0);
		      pendingFinishedWork = finishedWork;
		      pendingEffectsRoot = root;
		      pendingEffectsLanes = lanes;
		      pendingEffectsRemainingLanes = didIncludeRenderPhaseUpdate;
		      pendingPassiveTransitions = transitions;
		      pendingRecoverableErrors = recoverableErrors;
		      0 !== (finishedWork.subtreeFlags & 10256) || 0 !== (finishedWork.flags & 10256) ? (root.callbackNode = null, root.callbackPriority = 0, scheduleCallback(NormalPriority$1, function() {
		        flushPassiveEffects();
		        return null;
		      })) : (root.callbackNode = null, root.callbackPriority = 0);
		      recoverableErrors = 0 !== (finishedWork.flags & 13878);
		      if (0 !== (finishedWork.subtreeFlags & 13878) || recoverableErrors) {
		        recoverableErrors = ReactSharedInternals.T;
		        ReactSharedInternals.T = null;
		        transitions = getCurrentUpdatePriority();
		        setCurrentUpdatePriority(2);
		        spawnedLane = executionContext;
		        executionContext |= 4;
		        try {
		          commitBeforeMutationEffects(root, finishedWork, lanes);
		        } finally {
		          executionContext = spawnedLane, setCurrentUpdatePriority(transitions), ReactSharedInternals.T = recoverableErrors;
		        }
		      }
		      pendingEffectsStatus = 1;
		      flushMutationEffects();
		      flushLayoutEffects();
		      flushSpawnedWork();
		    }
		  }
		  function flushMutationEffects() {
		    if (1 === pendingEffectsStatus) {
		      pendingEffectsStatus = 0;
		      var root = pendingEffectsRoot, finishedWork = pendingFinishedWork, rootMutationHasEffect = 0 !== (finishedWork.flags & 13878);
		      if (0 !== (finishedWork.subtreeFlags & 13878) || rootMutationHasEffect) {
		        rootMutationHasEffect = ReactSharedInternals.T;
		        ReactSharedInternals.T = null;
		        var previousPriority = getCurrentUpdatePriority();
		        setCurrentUpdatePriority(2);
		        var prevExecutionContext = executionContext;
		        executionContext |= 4;
		        try {
		          commitMutationEffectsOnFiber(finishedWork, root), resetAfterCommit(root.containerInfo);
		        } finally {
		          executionContext = prevExecutionContext, setCurrentUpdatePriority(previousPriority), ReactSharedInternals.T = rootMutationHasEffect;
		        }
		      }
		      root.current = finishedWork;
		      pendingEffectsStatus = 2;
		    }
		  }
		  function flushLayoutEffects() {
		    if (2 === pendingEffectsStatus) {
		      pendingEffectsStatus = 0;
		      var root = pendingEffectsRoot, finishedWork = pendingFinishedWork, rootHasLayoutEffect = 0 !== (finishedWork.flags & 8772);
		      if (0 !== (finishedWork.subtreeFlags & 8772) || rootHasLayoutEffect) {
		        rootHasLayoutEffect = ReactSharedInternals.T;
		        ReactSharedInternals.T = null;
		        var previousPriority = getCurrentUpdatePriority();
		        setCurrentUpdatePriority(2);
		        var prevExecutionContext = executionContext;
		        executionContext |= 4;
		        try {
		          commitLayoutEffectOnFiber(root, finishedWork.alternate, finishedWork);
		        } finally {
		          executionContext = prevExecutionContext, setCurrentUpdatePriority(previousPriority), ReactSharedInternals.T = rootHasLayoutEffect;
		        }
		      }
		      pendingEffectsStatus = 3;
		    }
		  }
		  function flushSpawnedWork() {
		    if (4 === pendingEffectsStatus || 3 === pendingEffectsStatus) {
		      pendingEffectsStatus = 0;
		      requestPaint();
		      var root = pendingEffectsRoot, finishedWork = pendingFinishedWork, lanes = pendingEffectsLanes, recoverableErrors = pendingRecoverableErrors;
		      0 !== (finishedWork.subtreeFlags & 10256) || 0 !== (finishedWork.flags & 10256) ? pendingEffectsStatus = 5 : (pendingEffectsStatus = 0, pendingFinishedWork = pendingEffectsRoot = null, releaseRootPooledCache(root, root.pendingLanes));
		      var remainingLanes = root.pendingLanes;
		      0 === remainingLanes && (legacyErrorBoundariesThatAlreadyFailed = null);
		      lanesToEventPriority(lanes);
		      finishedWork = finishedWork.stateNode;
		      if (injectedHook && "function" === typeof injectedHook.onCommitFiberRoot)
		        try {
		          injectedHook.onCommitFiberRoot(
		            rendererID,
		            finishedWork,
		            void 0,
		            128 === (finishedWork.current.flags & 128)
		          );
		        } catch (err) {
		        }
		      if (null !== recoverableErrors) {
		        finishedWork = ReactSharedInternals.T;
		        remainingLanes = getCurrentUpdatePriority();
		        setCurrentUpdatePriority(2);
		        ReactSharedInternals.T = null;
		        try {
		          for (var onRecoverableError = root.onRecoverableError, i = 0; i < recoverableErrors.length; i++) {
		            var recoverableError = recoverableErrors[i];
		            onRecoverableError(recoverableError.value, {
		              componentStack: recoverableError.stack
		            });
		          }
		        } finally {
		          ReactSharedInternals.T = finishedWork, setCurrentUpdatePriority(remainingLanes);
		        }
		      }
		      0 !== (pendingEffectsLanes & 3) && flushPendingEffects();
		      ensureRootIsScheduled(root);
		      remainingLanes = root.pendingLanes;
		      0 !== (lanes & 261930) && 0 !== (remainingLanes & 42) ? root === rootWithNestedUpdates ? nestedUpdateCount++ : (nestedUpdateCount = 0, rootWithNestedUpdates = root) : nestedUpdateCount = 0;
		      supportsHydration && flushHydrationEvents();
		      flushSyncWorkAcrossRoots_impl(0);
		    }
		  }
		  function releaseRootPooledCache(root, remainingLanes) {
		    0 === (root.pooledCacheLanes &= remainingLanes) && (remainingLanes = root.pooledCache, null != remainingLanes && (root.pooledCache = null, releaseCache(remainingLanes)));
		  }
		  function flushPendingEffects() {
		    flushMutationEffects();
		    flushLayoutEffects();
		    flushSpawnedWork();
		    return flushPassiveEffects();
		  }
		  function flushPassiveEffects() {
		    if (5 !== pendingEffectsStatus) return false;
		    var root = pendingEffectsRoot, remainingLanes = pendingEffectsRemainingLanes;
		    pendingEffectsRemainingLanes = 0;
		    var renderPriority = lanesToEventPriority(pendingEffectsLanes), priority = 32 > renderPriority ? 32 : renderPriority;
		    renderPriority = ReactSharedInternals.T;
		    var previousPriority = getCurrentUpdatePriority();
		    try {
		      setCurrentUpdatePriority(priority);
		      ReactSharedInternals.T = null;
		      priority = pendingPassiveTransitions;
		      pendingPassiveTransitions = null;
		      var root$jscomp$0 = pendingEffectsRoot, lanes = pendingEffectsLanes;
		      pendingEffectsStatus = 0;
		      pendingFinishedWork = pendingEffectsRoot = null;
		      pendingEffectsLanes = 0;
		      if (0 !== (executionContext & 6))
		        throw Error(formatProdErrorMessage(331));
		      var prevExecutionContext = executionContext;
		      executionContext |= 4;
		      commitPassiveUnmountOnFiber(root$jscomp$0.current);
		      commitPassiveMountOnFiber(
		        root$jscomp$0,
		        root$jscomp$0.current,
		        lanes,
		        priority
		      );
		      executionContext = prevExecutionContext;
		      flushSyncWorkAcrossRoots_impl(0, false);
		      if (injectedHook && "function" === typeof injectedHook.onPostCommitFiberRoot)
		        try {
		          injectedHook.onPostCommitFiberRoot(rendererID, root$jscomp$0);
		        } catch (err) {
		        }
		      return true;
		    } finally {
		      setCurrentUpdatePriority(previousPriority), ReactSharedInternals.T = renderPriority, releaseRootPooledCache(root, remainingLanes);
		    }
		  }
		  function captureCommitPhaseErrorOnRoot(rootFiber, sourceFiber, error) {
		    sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
		    sourceFiber = createRootErrorUpdate(rootFiber.stateNode, sourceFiber, 2);
		    rootFiber = enqueueUpdate(rootFiber, sourceFiber, 2);
		    null !== rootFiber && (markRootUpdated$1(rootFiber, 2), ensureRootIsScheduled(rootFiber));
		  }
		  function captureCommitPhaseError(sourceFiber, nearestMountedAncestor, error) {
		    if (3 === sourceFiber.tag)
		      captureCommitPhaseErrorOnRoot(sourceFiber, sourceFiber, error);
		    else
		      for (; null !== nearestMountedAncestor; ) {
		        if (3 === nearestMountedAncestor.tag) {
		          captureCommitPhaseErrorOnRoot(
		            nearestMountedAncestor,
		            sourceFiber,
		            error
		          );
		          break;
		        } else if (1 === nearestMountedAncestor.tag) {
		          var instance = nearestMountedAncestor.stateNode;
		          if ("function" === typeof nearestMountedAncestor.type.getDerivedStateFromError || "function" === typeof instance.componentDidCatch && (null === legacyErrorBoundariesThatAlreadyFailed || !legacyErrorBoundariesThatAlreadyFailed.has(instance))) {
		            sourceFiber = createCapturedValueAtFiber(error, sourceFiber);
		            error = createClassErrorUpdate(2);
		            instance = enqueueUpdate(nearestMountedAncestor, error, 2);
		            null !== instance && (initializeClassErrorUpdate(
		              error,
		              instance,
		              nearestMountedAncestor,
		              sourceFiber
		            ), markRootUpdated$1(instance, 2), ensureRootIsScheduled(instance));
		            break;
		          }
		        }
		        nearestMountedAncestor = nearestMountedAncestor.return;
		      }
		  }
		  function attachPingListener(root, wakeable, lanes) {
		    var pingCache = root.pingCache;
		    if (null === pingCache) {
		      pingCache = root.pingCache = new PossiblyWeakMap();
		      var threadIDs = /* @__PURE__ */ new Set();
		      pingCache.set(wakeable, threadIDs);
		    } else
		      threadIDs = pingCache.get(wakeable), void 0 === threadIDs && (threadIDs = /* @__PURE__ */ new Set(), pingCache.set(wakeable, threadIDs));
		    threadIDs.has(lanes) || (workInProgressRootDidAttachPingListener = true, threadIDs.add(lanes), root = pingSuspendedRoot.bind(null, root, wakeable, lanes), wakeable.then(root, root));
		  }
		  function pingSuspendedRoot(root, wakeable, pingedLanes) {
		    var pingCache = root.pingCache;
		    null !== pingCache && pingCache.delete(wakeable);
		    root.pingedLanes |= root.suspendedLanes & pingedLanes;
		    root.warmLanes &= ~pingedLanes;
		    workInProgressRoot === root && (workInProgressRootRenderLanes & pingedLanes) === pingedLanes && (4 === workInProgressRootExitStatus || 3 === workInProgressRootExitStatus && (workInProgressRootRenderLanes & 62914560) === workInProgressRootRenderLanes && 300 > now() - globalMostRecentFallbackTime ? 0 === (executionContext & 2) && prepareFreshStack(root, 0) : workInProgressRootPingedLanes |= pingedLanes, workInProgressSuspendedRetryLanes === workInProgressRootRenderLanes && (workInProgressSuspendedRetryLanes = 0));
		    ensureRootIsScheduled(root);
		  }
		  function retryTimedOutBoundary(boundaryFiber, retryLane) {
		    0 === retryLane && (retryLane = claimNextRetryLane());
		    boundaryFiber = enqueueConcurrentRenderForLane(boundaryFiber, retryLane);
		    null !== boundaryFiber && (markRootUpdated$1(boundaryFiber, retryLane), ensureRootIsScheduled(boundaryFiber));
		  }
		  function retryDehydratedSuspenseBoundary(boundaryFiber) {
		    var suspenseState = boundaryFiber.memoizedState, retryLane = 0;
		    null !== suspenseState && (retryLane = suspenseState.retryLane);
		    retryTimedOutBoundary(boundaryFiber, retryLane);
		  }
		  function resolveRetryWakeable(boundaryFiber, wakeable) {
		    var retryLane = 0;
		    switch (boundaryFiber.tag) {
		      case 31:
		      case 13:
		        var retryCache = boundaryFiber.stateNode;
		        var suspenseState = boundaryFiber.memoizedState;
		        null !== suspenseState && (retryLane = suspenseState.retryLane);
		        break;
		      case 19:
		        retryCache = boundaryFiber.stateNode;
		        break;
		      case 22:
		        retryCache = boundaryFiber.stateNode._retryCache;
		        break;
		      default:
		        throw Error(formatProdErrorMessage(314));
		    }
		    null !== retryCache && retryCache.delete(wakeable);
		    retryTimedOutBoundary(boundaryFiber, retryLane);
		  }
		  function scheduleCallback(priorityLevel, callback) {
		    return scheduleCallback$3(priorityLevel, callback);
		  }
		  function FiberNode(tag, pendingProps, key, mode) {
		    this.tag = tag;
		    this.key = key;
		    this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null;
		    this.index = 0;
		    this.refCleanup = this.ref = null;
		    this.pendingProps = pendingProps;
		    this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null;
		    this.mode = mode;
		    this.subtreeFlags = this.flags = 0;
		    this.deletions = null;
		    this.childLanes = this.lanes = 0;
		    this.alternate = null;
		  }
		  function shouldConstruct(Component) {
		    Component = Component.prototype;
		    return !(!Component || !Component.isReactComponent);
		  }
		  function createWorkInProgress(current, pendingProps) {
		    var workInProgress2 = current.alternate;
		    null === workInProgress2 ? (workInProgress2 = createFiber(
		      current.tag,
		      pendingProps,
		      current.key,
		      current.mode
		    ), workInProgress2.elementType = current.elementType, workInProgress2.type = current.type, workInProgress2.stateNode = current.stateNode, workInProgress2.alternate = current, current.alternate = workInProgress2) : (workInProgress2.pendingProps = pendingProps, workInProgress2.type = current.type, workInProgress2.flags = 0, workInProgress2.subtreeFlags = 0, workInProgress2.deletions = null);
		    workInProgress2.flags = current.flags & 65011712;
		    workInProgress2.childLanes = current.childLanes;
		    workInProgress2.lanes = current.lanes;
		    workInProgress2.child = current.child;
		    workInProgress2.memoizedProps = current.memoizedProps;
		    workInProgress2.memoizedState = current.memoizedState;
		    workInProgress2.updateQueue = current.updateQueue;
		    pendingProps = current.dependencies;
		    workInProgress2.dependencies = null === pendingProps ? null : {
		      lanes: pendingProps.lanes,
		      firstContext: pendingProps.firstContext
		    };
		    workInProgress2.sibling = current.sibling;
		    workInProgress2.index = current.index;
		    workInProgress2.ref = current.ref;
		    workInProgress2.refCleanup = current.refCleanup;
		    return workInProgress2;
		  }
		  function resetWorkInProgress(workInProgress2, renderLanes2) {
		    workInProgress2.flags &= 65011714;
		    var current = workInProgress2.alternate;
		    null === current ? (workInProgress2.childLanes = 0, workInProgress2.lanes = renderLanes2, workInProgress2.child = null, workInProgress2.subtreeFlags = 0, workInProgress2.memoizedProps = null, workInProgress2.memoizedState = null, workInProgress2.updateQueue = null, workInProgress2.dependencies = null, workInProgress2.stateNode = null) : (workInProgress2.childLanes = current.childLanes, workInProgress2.lanes = current.lanes, workInProgress2.child = current.child, workInProgress2.subtreeFlags = 0, workInProgress2.deletions = null, workInProgress2.memoizedProps = current.memoizedProps, workInProgress2.memoizedState = current.memoizedState, workInProgress2.updateQueue = current.updateQueue, workInProgress2.type = current.type, renderLanes2 = current.dependencies, workInProgress2.dependencies = null === renderLanes2 ? null : {
		      lanes: renderLanes2.lanes,
		      firstContext: renderLanes2.firstContext
		    });
		    return workInProgress2;
		  }
		  function createFiberFromTypeAndProps(type, key, pendingProps, owner, mode, lanes) {
		    var fiberTag = 0;
		    owner = type;
		    if ("function" === typeof type) shouldConstruct(type) && (fiberTag = 1);
		    else if ("string" === typeof type)
		      fiberTag = supportsResources && supportsSingletons ? isHostHoistableType(type, pendingProps, contextStackCursor.current) ? 26 : isHostSingletonType(type) ? 27 : 5 : supportsResources ? isHostHoistableType(
		        type,
		        pendingProps,
		        contextStackCursor.current
		      ) ? 26 : 5 : supportsSingletons ? isHostSingletonType(type) ? 27 : 5 : 5;
		    else
		      a: switch (type) {
		        case REACT_ACTIVITY_TYPE:
		          return type = createFiber(31, pendingProps, key, mode), type.elementType = REACT_ACTIVITY_TYPE, type.lanes = lanes, type;
		        case REACT_FRAGMENT_TYPE:
		          return createFiberFromFragment(
		            pendingProps.children,
		            mode,
		            lanes,
		            key
		          );
		        case REACT_STRICT_MODE_TYPE:
		          fiberTag = 8;
		          mode |= 24;
		          break;
		        case REACT_PROFILER_TYPE:
		          return type = createFiber(12, pendingProps, key, mode | 2), type.elementType = REACT_PROFILER_TYPE, type.lanes = lanes, type;
		        case REACT_SUSPENSE_TYPE:
		          return type = createFiber(13, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_TYPE, type.lanes = lanes, type;
		        case REACT_SUSPENSE_LIST_TYPE:
		          return type = createFiber(19, pendingProps, key, mode), type.elementType = REACT_SUSPENSE_LIST_TYPE, type.lanes = lanes, type;
		        default:
		          if ("object" === typeof type && null !== type)
		            switch (type.$$typeof) {
		              case REACT_CONTEXT_TYPE:
		                fiberTag = 10;
		                break a;
		              case REACT_CONSUMER_TYPE:
		                fiberTag = 9;
		                break a;
		              case REACT_FORWARD_REF_TYPE:
		                fiberTag = 11;
		                break a;
		              case REACT_MEMO_TYPE:
		                fiberTag = 14;
		                break a;
		              case REACT_LAZY_TYPE:
		                fiberTag = 16;
		                owner = null;
		                break a;
		            }
		          fiberTag = 29;
		          pendingProps = Error(
		            formatProdErrorMessage(
		              130,
		              null === type ? "null" : typeof type,
		              ""
		            )
		          );
		          owner = null;
		      }
		    key = createFiber(fiberTag, pendingProps, key, mode);
		    key.elementType = type;
		    key.type = owner;
		    key.lanes = lanes;
		    return key;
		  }
		  function createFiberFromFragment(elements, mode, lanes, key) {
		    elements = createFiber(7, elements, key, mode);
		    elements.lanes = lanes;
		    return elements;
		  }
		  function createFiberFromText(content, mode, lanes) {
		    content = createFiber(6, content, null, mode);
		    content.lanes = lanes;
		    return content;
		  }
		  function createFiberFromDehydratedFragment(dehydratedNode) {
		    var fiber = createFiber(18, null, null, 0);
		    fiber.stateNode = dehydratedNode;
		    return fiber;
		  }
		  function createFiberFromPortal(portal, mode, lanes) {
		    mode = createFiber(
		      4,
		      null !== portal.children ? portal.children : [],
		      portal.key,
		      mode
		    );
		    mode.lanes = lanes;
		    mode.stateNode = {
		      containerInfo: portal.containerInfo,
		      pendingChildren: null,
		      implementation: portal.implementation
		    };
		    return mode;
		  }
		  function FiberRootNode(containerInfo, tag, hydrate, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator, formState) {
		    this.tag = 1;
		    this.containerInfo = containerInfo;
		    this.pingCache = this.current = this.pendingChildren = null;
		    this.timeoutHandle = noTimeout;
		    this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null;
		    this.callbackPriority = 0;
		    this.expirationTimes = createLaneMap(-1);
		    this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0;
		    this.entanglements = createLaneMap(0);
		    this.hiddenUpdates = createLaneMap(null);
		    this.identifierPrefix = identifierPrefix;
		    this.onUncaughtError = onUncaughtError;
		    this.onCaughtError = onCaughtError;
		    this.onRecoverableError = onRecoverableError;
		    this.pooledCache = null;
		    this.pooledCacheLanes = 0;
		    this.formState = formState;
		    this.incompleteTransitions = /* @__PURE__ */ new Map();
		  }
		  function createFiberRoot(containerInfo, tag, hydrate, initialChildren, hydrationCallbacks, isStrictMode, identifierPrefix, formState, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator) {
		    containerInfo = new FiberRootNode(
		      containerInfo,
		      tag,
		      hydrate,
		      identifierPrefix,
		      onUncaughtError,
		      onCaughtError,
		      onRecoverableError,
		      onDefaultTransitionIndicator,
		      formState
		    );
		    tag = 1;
		    true === isStrictMode && (tag |= 24);
		    isStrictMode = createFiber(3, null, null, tag);
		    containerInfo.current = isStrictMode;
		    isStrictMode.stateNode = containerInfo;
		    tag = createCache();
		    tag.refCount++;
		    containerInfo.pooledCache = tag;
		    tag.refCount++;
		    isStrictMode.memoizedState = {
		      element: initialChildren,
		      isDehydrated: hydrate,
		      cache: tag
		    };
		    initializeUpdateQueue(isStrictMode);
		    return containerInfo;
		  }
		  function getContextForSubtree(parentComponent) {
		    if (!parentComponent) return emptyContextObject;
		    parentComponent = emptyContextObject;
		    return parentComponent;
		  }
		  function findHostInstance(component) {
		    var fiber = component._reactInternals;
		    if (void 0 === fiber) {
		      if ("function" === typeof component.render)
		        throw Error(formatProdErrorMessage(188));
		      component = Object.keys(component).join(",");
		      throw Error(formatProdErrorMessage(268, component));
		    }
		    component = findCurrentFiberUsingSlowPath(fiber);
		    component = null !== component ? findCurrentHostFiberImpl(component) : null;
		    return null === component ? null : getPublicInstance(component.stateNode);
		  }
		  function updateContainerImpl(rootFiber, lane, element, container, parentComponent, callback) {
		    parentComponent = getContextForSubtree(parentComponent);
		    null === container.context ? container.context = parentComponent : container.pendingContext = parentComponent;
		    container = createUpdate(lane);
		    container.payload = { element };
		    callback = void 0 === callback ? null : callback;
		    null !== callback && (container.callback = callback);
		    element = enqueueUpdate(rootFiber, container, lane);
		    null !== element && (scheduleUpdateOnFiber(element, rootFiber, lane), entangleTransitions(element, rootFiber, lane));
		  }
		  function markRetryLaneImpl(fiber, retryLane) {
		    fiber = fiber.memoizedState;
		    if (null !== fiber && null !== fiber.dehydrated) {
		      var a = fiber.retryLane;
		      fiber.retryLane = 0 !== a && a < retryLane ? a : retryLane;
		    }
		  }
		  function markRetryLaneIfNotHydrated(fiber, retryLane) {
		    markRetryLaneImpl(fiber, retryLane);
		    (fiber = fiber.alternate) && markRetryLaneImpl(fiber, retryLane);
		  }
		  var exports$1 = {};
		  var React = requireReact(), Scheduler = requireScheduler(), assign = Object.assign, REACT_LEGACY_ELEMENT_TYPE = Symbol.for("react.element"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy");
		  var REACT_ACTIVITY_TYPE = Symbol.for("react.activity");
		  var REACT_MEMO_CACHE_SENTINEL = Symbol.for("react.memo_cache_sentinel");
		  var MAYBE_ITERATOR_SYMBOL = Symbol.iterator, REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), isArrayImpl = Array.isArray, ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, rendererVersion = $$$config.rendererVersion, rendererPackageName = $$$config.rendererPackageName, extraDevToolsConfig = $$$config.extraDevToolsConfig, getPublicInstance = $$$config.getPublicInstance, getRootHostContext = $$$config.getRootHostContext, getChildHostContext = $$$config.getChildHostContext, prepareForCommit = $$$config.prepareForCommit, resetAfterCommit = $$$config.resetAfterCommit, createInstance = $$$config.createInstance;
		  $$$config.cloneMutableInstance;
		  var appendInitialChild = $$$config.appendInitialChild, finalizeInitialChildren = $$$config.finalizeInitialChildren, shouldSetTextContent = $$$config.shouldSetTextContent, createTextInstance = $$$config.createTextInstance;
		  $$$config.cloneMutableTextInstance;
		  var scheduleTimeout = $$$config.scheduleTimeout, cancelTimeout = $$$config.cancelTimeout, noTimeout = $$$config.noTimeout, isPrimaryRenderer = $$$config.isPrimaryRenderer;
		  $$$config.warnsIfNotActing;
		  var supportsMutation = $$$config.supportsMutation, supportsPersistence = $$$config.supportsPersistence, supportsHydration = $$$config.supportsHydration, getInstanceFromNode = $$$config.getInstanceFromNode;
		  $$$config.beforeActiveInstanceBlur;
		  var preparePortalMount = $$$config.preparePortalMount;
		  $$$config.prepareScopeUpdate;
		  $$$config.getInstanceFromScope;
		  var setCurrentUpdatePriority = $$$config.setCurrentUpdatePriority, getCurrentUpdatePriority = $$$config.getCurrentUpdatePriority, resolveUpdatePriority = $$$config.resolveUpdatePriority;
		  $$$config.trackSchedulerEvent;
		  $$$config.resolveEventType;
		  $$$config.resolveEventTimeStamp;
		  var shouldAttemptEagerTransition = $$$config.shouldAttemptEagerTransition, detachDeletedInstance = $$$config.detachDeletedInstance;
		  $$$config.requestPostPaintCallback;
		  var maySuspendCommit = $$$config.maySuspendCommit, maySuspendCommitOnUpdate = $$$config.maySuspendCommitOnUpdate, maySuspendCommitInSyncRender = $$$config.maySuspendCommitInSyncRender, preloadInstance = $$$config.preloadInstance, startSuspendingCommit = $$$config.startSuspendingCommit, suspendInstance = $$$config.suspendInstance;
		  $$$config.suspendOnActiveViewTransition;
		  var waitForCommitToBeReady = $$$config.waitForCommitToBeReady;
		  $$$config.getSuspendedCommitReason;
		  var NotPendingTransition = $$$config.NotPendingTransition, HostTransitionContext = $$$config.HostTransitionContext, resetFormInstance = $$$config.resetFormInstance;
		  $$$config.bindToConsole;
		  var supportsMicrotasks = $$$config.supportsMicrotasks, scheduleMicrotask = $$$config.scheduleMicrotask, supportsTestSelectors = $$$config.supportsTestSelectors, findFiberRoot = $$$config.findFiberRoot, getBoundingRect = $$$config.getBoundingRect, getTextContent = $$$config.getTextContent, isHiddenSubtree = $$$config.isHiddenSubtree, matchAccessibilityRole = $$$config.matchAccessibilityRole, setFocusIfFocusable = $$$config.setFocusIfFocusable, setupIntersectionObserver = $$$config.setupIntersectionObserver, appendChild = $$$config.appendChild, appendChildToContainer = $$$config.appendChildToContainer, commitTextUpdate = $$$config.commitTextUpdate, commitMount = $$$config.commitMount, commitUpdate = $$$config.commitUpdate, insertBefore = $$$config.insertBefore, insertInContainerBefore = $$$config.insertInContainerBefore, removeChild = $$$config.removeChild, removeChildFromContainer = $$$config.removeChildFromContainer, resetTextContent = $$$config.resetTextContent, hideInstance = $$$config.hideInstance, hideTextInstance = $$$config.hideTextInstance, unhideInstance = $$$config.unhideInstance, unhideTextInstance = $$$config.unhideTextInstance;
		  $$$config.cancelViewTransitionName;
		  $$$config.cancelRootViewTransitionName;
		  $$$config.restoreRootViewTransitionName;
		  $$$config.cloneRootViewTransitionContainer;
		  $$$config.removeRootViewTransitionClone;
		  $$$config.measureClonedInstance;
		  $$$config.hasInstanceChanged;
		  $$$config.hasInstanceAffectedParent;
		  $$$config.startViewTransition;
		  $$$config.startGestureTransition;
		  $$$config.stopViewTransition;
		  $$$config.getCurrentGestureOffset;
		  $$$config.createViewTransitionInstance;
		  var clearContainer = $$$config.clearContainer;
		  $$$config.createFragmentInstance;
		  $$$config.updateFragmentInstanceFiber;
		  $$$config.commitNewChildToFragmentInstance;
		  $$$config.deleteChildFromFragmentInstance;
		  var cloneInstance = $$$config.cloneInstance, createContainerChildSet = $$$config.createContainerChildSet, appendChildToContainerChildSet = $$$config.appendChildToContainerChildSet, finalizeContainerChildren = $$$config.finalizeContainerChildren, replaceContainerChildren = $$$config.replaceContainerChildren, cloneHiddenInstance = $$$config.cloneHiddenInstance, cloneHiddenTextInstance = $$$config.cloneHiddenTextInstance, isSuspenseInstancePending = $$$config.isSuspenseInstancePending, isSuspenseInstanceFallback = $$$config.isSuspenseInstanceFallback, getSuspenseInstanceFallbackErrorDetails = $$$config.getSuspenseInstanceFallbackErrorDetails, registerSuspenseInstanceRetry = $$$config.registerSuspenseInstanceRetry, canHydrateFormStateMarker = $$$config.canHydrateFormStateMarker, isFormStateMarkerMatching = $$$config.isFormStateMarkerMatching, getNextHydratableSibling = $$$config.getNextHydratableSibling, getNextHydratableSiblingAfterSingleton = $$$config.getNextHydratableSiblingAfterSingleton, getFirstHydratableChild = $$$config.getFirstHydratableChild, getFirstHydratableChildWithinContainer = $$$config.getFirstHydratableChildWithinContainer, getFirstHydratableChildWithinActivityInstance = $$$config.getFirstHydratableChildWithinActivityInstance, getFirstHydratableChildWithinSuspenseInstance = $$$config.getFirstHydratableChildWithinSuspenseInstance, getFirstHydratableChildWithinSingleton = $$$config.getFirstHydratableChildWithinSingleton, canHydrateInstance = $$$config.canHydrateInstance, canHydrateTextInstance = $$$config.canHydrateTextInstance, canHydrateActivityInstance = $$$config.canHydrateActivityInstance, canHydrateSuspenseInstance = $$$config.canHydrateSuspenseInstance, hydrateInstance = $$$config.hydrateInstance, hydrateTextInstance = $$$config.hydrateTextInstance, hydrateActivityInstance = $$$config.hydrateActivityInstance, hydrateSuspenseInstance = $$$config.hydrateSuspenseInstance, getNextHydratableInstanceAfterActivityInstance = $$$config.getNextHydratableInstanceAfterActivityInstance, getNextHydratableInstanceAfterSuspenseInstance = $$$config.getNextHydratableInstanceAfterSuspenseInstance, commitHydratedInstance = $$$config.commitHydratedInstance, commitHydratedContainer = $$$config.commitHydratedContainer, commitHydratedActivityInstance = $$$config.commitHydratedActivityInstance, commitHydratedSuspenseInstance = $$$config.commitHydratedSuspenseInstance, finalizeHydratedChildren = $$$config.finalizeHydratedChildren, flushHydrationEvents = $$$config.flushHydrationEvents;
		  $$$config.clearActivityBoundary;
		  var clearSuspenseBoundary = $$$config.clearSuspenseBoundary;
		  $$$config.clearActivityBoundaryFromContainer;
		  var clearSuspenseBoundaryFromContainer = $$$config.clearSuspenseBoundaryFromContainer, hideDehydratedBoundary = $$$config.hideDehydratedBoundary, unhideDehydratedBoundary = $$$config.unhideDehydratedBoundary, shouldDeleteUnhydratedTailInstances = $$$config.shouldDeleteUnhydratedTailInstances;
		  $$$config.diffHydratedPropsForDevWarnings;
		  $$$config.diffHydratedTextForDevWarnings;
		  $$$config.describeHydratableInstanceForDevWarnings;
		  var validateHydratableInstance = $$$config.validateHydratableInstance, validateHydratableTextInstance = $$$config.validateHydratableTextInstance, supportsResources = $$$config.supportsResources, isHostHoistableType = $$$config.isHostHoistableType, getHoistableRoot = $$$config.getHoistableRoot, getResource = $$$config.getResource, acquireResource = $$$config.acquireResource, releaseResource = $$$config.releaseResource, hydrateHoistable = $$$config.hydrateHoistable, mountHoistable = $$$config.mountHoistable, unmountHoistable = $$$config.unmountHoistable, createHoistableInstance = $$$config.createHoistableInstance, prepareToCommitHoistables = $$$config.prepareToCommitHoistables, mayResourceSuspendCommit = $$$config.mayResourceSuspendCommit, preloadResource = $$$config.preloadResource, suspendResource = $$$config.suspendResource, supportsSingletons = $$$config.supportsSingletons, resolveSingletonInstance = $$$config.resolveSingletonInstance, acquireSingletonInstance = $$$config.acquireSingletonInstance, releaseSingletonInstance = $$$config.releaseSingletonInstance, isHostSingletonType = $$$config.isHostSingletonType, isSingletonScope = $$$config.isSingletonScope, valueStack = [], index$jscomp$0 = -1, emptyContextObject = {}, clz32 = Math.clz32 ? Math.clz32 : clz32Fallback, log$1 = Math.log, LN2 = Math.LN2, nextTransitionUpdateLane = 256, nextTransitionDeferredLane = 262144, nextRetryLane = 4194304, scheduleCallback$3 = Scheduler.unstable_scheduleCallback, cancelCallback$1 = Scheduler.unstable_cancelCallback, shouldYield = Scheduler.unstable_shouldYield, requestPaint = Scheduler.unstable_requestPaint, now = Scheduler.unstable_now, ImmediatePriority = Scheduler.unstable_ImmediatePriority, UserBlockingPriority = Scheduler.unstable_UserBlockingPriority, NormalPriority$1 = Scheduler.unstable_NormalPriority, IdlePriority = Scheduler.unstable_IdlePriority, log = Scheduler.log, unstable_setDisableYieldValue = Scheduler.unstable_setDisableYieldValue, rendererID = null, injectedHook = null, objectIs = "function" === typeof Object.is ? Object.is : is, reportGlobalError = "function" === typeof reportError ? reportError : function(error) {
		    if ("object" === typeof window && "function" === typeof window.ErrorEvent) {
		      var event = new window.ErrorEvent("error", {
		        bubbles: true,
		        cancelable: true,
		        message: "object" === typeof error && null !== error && "string" === typeof error.message ? String(error.message) : String(error),
		        error
		      });
		      if (!window.dispatchEvent(event)) return;
		    } else if ("object" === typeof process && "function" === typeof process.emit) {
		      process.emit("uncaughtException", error);
		      return;
		    }
		    console.error(error);
		  }, hasOwnProperty = Object.prototype.hasOwnProperty, prefix, suffix, reentry = false, CapturedStacks = /* @__PURE__ */ new WeakMap(), forkStack = [], forkStackIndex = 0, treeForkProvider = null, treeForkCount = 0, idStack = [], idStackIndex = 0, treeContextProvider = null, treeContextId = 1, treeContextOverflow = "", contextStackCursor = createCursor(null), contextFiberStackCursor = createCursor(null), rootInstanceStackCursor = createCursor(null), hostTransitionProviderCursor = createCursor(null), hydrationParentFiber = null, nextHydratableInstance = null, isHydrating = false, hydrationErrors = null, rootOrSingletonContext = false, HydrationMismatchException = Error(formatProdErrorMessage(519)), valueCursor = createCursor(null), currentlyRenderingFiber$1 = null, lastContextDependency = null, AbortControllerLocal = "undefined" !== typeof AbortController ? AbortController : function() {
		    var listeners = [], signal = this.signal = {
		      aborted: false,
		      addEventListener: function(type, listener) {
		        listeners.push(listener);
		      }
		    };
		    this.abort = function() {
		      signal.aborted = true;
		      listeners.forEach(function(listener) {
		        return listener();
		      });
		    };
		  }, scheduleCallback$2 = Scheduler.unstable_scheduleCallback, NormalPriority = Scheduler.unstable_NormalPriority, CacheContext = {
		    $$typeof: REACT_CONTEXT_TYPE,
		    Consumer: null,
		    Provider: null,
		    _currentValue: null,
		    _currentValue2: null,
		    _threadCount: 0
		  }, firstScheduledRoot = null, lastScheduledRoot = null, didScheduleMicrotask = false, mightHavePendingSyncWork = false, isFlushingWork = false, currentEventTransitionLane = 0, currentEntangledListeners = null, currentEntangledPendingCount = 0, currentEntangledLane = 0, currentEntangledActionThenable = null, prevOnStartTransitionFinish = ReactSharedInternals.S;
		  ReactSharedInternals.S = function(transition, returnValue) {
		    globalMostRecentTransitionTime = now();
		    "object" === typeof returnValue && null !== returnValue && "function" === typeof returnValue.then && entangleAsyncAction(transition, returnValue);
		    null !== prevOnStartTransitionFinish && prevOnStartTransitionFinish(transition, returnValue);
		  };
		  var resumedCache = createCursor(null), SuspenseException = Error(formatProdErrorMessage(460)), SuspenseyCommitException = Error(formatProdErrorMessage(474)), SuspenseActionException = Error(formatProdErrorMessage(542)), noopSuspenseyCommitThenable = { then: function() {
		  } }, suspendedThenable = null, thenableState$1 = null, thenableIndexCounter$1 = 0, reconcileChildFibers = createChildReconciler(true), mountChildFibers = createChildReconciler(false), concurrentQueues = [], concurrentQueuesIndex = 0, concurrentlyUpdatedLanes = 0, hasForceUpdate = false, didReadFromEntangledAsyncAction = false, currentTreeHiddenStackCursor = createCursor(null), prevEntangledRenderLanesCursor = createCursor(0), suspenseHandlerStackCursor = createCursor(null), shellBoundary = null, suspenseStackCursor = createCursor(0), renderLanes = 0, currentlyRenderingFiber = null, currentHook = null, workInProgressHook = null, didScheduleRenderPhaseUpdate = false, didScheduleRenderPhaseUpdateDuringThisPass = false, shouldDoubleInvokeUserFnsInHooksDEV = false, localIdCounter = 0, thenableIndexCounter = 0, thenableState = null, globalClientIdCounter = 0, ContextOnlyDispatcher = {
		    readContext,
		    use,
		    useCallback: throwInvalidHookError,
		    useContext: throwInvalidHookError,
		    useEffect: throwInvalidHookError,
		    useImperativeHandle: throwInvalidHookError,
		    useLayoutEffect: throwInvalidHookError,
		    useInsertionEffect: throwInvalidHookError,
		    useMemo: throwInvalidHookError,
		    useReducer: throwInvalidHookError,
		    useRef: throwInvalidHookError,
		    useState: throwInvalidHookError,
		    useDebugValue: throwInvalidHookError,
		    useDeferredValue: throwInvalidHookError,
		    useTransition: throwInvalidHookError,
		    useSyncExternalStore: throwInvalidHookError,
		    useId: throwInvalidHookError,
		    useHostTransitionStatus: throwInvalidHookError,
		    useFormState: throwInvalidHookError,
		    useActionState: throwInvalidHookError,
		    useOptimistic: throwInvalidHookError,
		    useMemoCache: throwInvalidHookError,
		    useCacheRefresh: throwInvalidHookError
		  };
		  ContextOnlyDispatcher.useEffectEvent = throwInvalidHookError;
		  var HooksDispatcherOnMount = {
		    readContext,
		    use,
		    useCallback: function(callback, deps) {
		      mountWorkInProgressHook().memoizedState = [
		        callback,
		        void 0 === deps ? null : deps
		      ];
		      return callback;
		    },
		    useContext: readContext,
		    useEffect: mountEffect,
		    useImperativeHandle: function(ref, create, deps) {
		      deps = null !== deps && void 0 !== deps ? deps.concat([ref]) : null;
		      mountEffectImpl(
		        4194308,
		        4,
		        imperativeHandleEffect.bind(null, create, ref),
		        deps
		      );
		    },
		    useLayoutEffect: function(create, deps) {
		      return mountEffectImpl(4194308, 4, create, deps);
		    },
		    useInsertionEffect: function(create, deps) {
		      mountEffectImpl(4, 2, create, deps);
		    },
		    useMemo: function(nextCreate, deps) {
		      var hook = mountWorkInProgressHook();
		      deps = void 0 === deps ? null : deps;
		      var nextValue = nextCreate();
		      if (shouldDoubleInvokeUserFnsInHooksDEV) {
		        setIsStrictModeForDevtools(true);
		        try {
		          nextCreate();
		        } finally {
		          setIsStrictModeForDevtools(false);
		        }
		      }
		      hook.memoizedState = [nextValue, deps];
		      return nextValue;
		    },
		    useReducer: function(reducer, initialArg, init) {
		      var hook = mountWorkInProgressHook();
		      if (void 0 !== init) {
		        var initialState = init(initialArg);
		        if (shouldDoubleInvokeUserFnsInHooksDEV) {
		          setIsStrictModeForDevtools(true);
		          try {
		            init(initialArg);
		          } finally {
		            setIsStrictModeForDevtools(false);
		          }
		        }
		      } else initialState = initialArg;
		      hook.memoizedState = hook.baseState = initialState;
		      reducer = {
		        pending: null,
		        lanes: 0,
		        dispatch: null,
		        lastRenderedReducer: reducer,
		        lastRenderedState: initialState
		      };
		      hook.queue = reducer;
		      reducer = reducer.dispatch = dispatchReducerAction.bind(
		        null,
		        currentlyRenderingFiber,
		        reducer
		      );
		      return [hook.memoizedState, reducer];
		    },
		    useRef: function(initialValue) {
		      var hook = mountWorkInProgressHook();
		      initialValue = { current: initialValue };
		      return hook.memoizedState = initialValue;
		    },
		    useState: function(initialState) {
		      initialState = mountStateImpl(initialState);
		      var queue = initialState.queue, dispatch = dispatchSetState.bind(
		        null,
		        currentlyRenderingFiber,
		        queue
		      );
		      queue.dispatch = dispatch;
		      return [initialState.memoizedState, dispatch];
		    },
		    useDebugValue: mountDebugValue,
		    useDeferredValue: function(value, initialValue) {
		      var hook = mountWorkInProgressHook();
		      return mountDeferredValueImpl(hook, value, initialValue);
		    },
		    useTransition: function() {
		      var stateHook = mountStateImpl(false);
		      stateHook = startTransition.bind(
		        null,
		        currentlyRenderingFiber,
		        stateHook.queue,
		        true,
		        false
		      );
		      mountWorkInProgressHook().memoizedState = stateHook;
		      return [false, stateHook];
		    },
		    useSyncExternalStore: function(subscribe, getSnapshot, getServerSnapshot) {
		      var fiber = currentlyRenderingFiber, hook = mountWorkInProgressHook();
		      if (isHydrating) {
		        if (void 0 === getServerSnapshot)
		          throw Error(formatProdErrorMessage(407));
		        getServerSnapshot = getServerSnapshot();
		      } else {
		        getServerSnapshot = getSnapshot();
		        if (null === workInProgressRoot)
		          throw Error(formatProdErrorMessage(349));
		        0 !== (workInProgressRootRenderLanes & 127) || pushStoreConsistencyCheck(fiber, getSnapshot, getServerSnapshot);
		      }
		      hook.memoizedState = getServerSnapshot;
		      var inst = { value: getServerSnapshot, getSnapshot };
		      hook.queue = inst;
		      mountEffect(subscribeToStore.bind(null, fiber, inst, subscribe), [
		        subscribe
		      ]);
		      fiber.flags |= 2048;
		      pushSimpleEffect(
		        9,
		        { destroy: void 0 },
		        updateStoreInstance.bind(
		          null,
		          fiber,
		          inst,
		          getServerSnapshot,
		          getSnapshot
		        ),
		        null
		      );
		      return getServerSnapshot;
		    },
		    useId: function() {
		      var hook = mountWorkInProgressHook(), identifierPrefix = workInProgressRoot.identifierPrefix;
		      if (isHydrating) {
		        var JSCompiler_inline_result = treeContextOverflow;
		        var idWithLeadingBit = treeContextId;
		        JSCompiler_inline_result = (idWithLeadingBit & ~(1 << 32 - clz32(idWithLeadingBit) - 1)).toString(32) + JSCompiler_inline_result;
		        identifierPrefix = "_" + identifierPrefix + "R_" + JSCompiler_inline_result;
		        JSCompiler_inline_result = localIdCounter++;
		        0 < JSCompiler_inline_result && (identifierPrefix += "H" + JSCompiler_inline_result.toString(32));
		        identifierPrefix += "_";
		      } else
		        JSCompiler_inline_result = globalClientIdCounter++, identifierPrefix = "_" + identifierPrefix + "r_" + JSCompiler_inline_result.toString(32) + "_";
		      return hook.memoizedState = identifierPrefix;
		    },
		    useHostTransitionStatus,
		    useFormState: mountActionState,
		    useActionState: mountActionState,
		    useOptimistic: function(passthrough) {
		      var hook = mountWorkInProgressHook();
		      hook.memoizedState = hook.baseState = passthrough;
		      var queue = {
		        pending: null,
		        lanes: 0,
		        dispatch: null,
		        lastRenderedReducer: null,
		        lastRenderedState: null
		      };
		      hook.queue = queue;
		      hook = dispatchOptimisticSetState.bind(
		        null,
		        currentlyRenderingFiber,
		        true,
		        queue
		      );
		      queue.dispatch = hook;
		      return [passthrough, hook];
		    },
		    useMemoCache,
		    useCacheRefresh: function() {
		      return mountWorkInProgressHook().memoizedState = refreshCache.bind(
		        null,
		        currentlyRenderingFiber
		      );
		    },
		    useEffectEvent: function(callback) {
		      var hook = mountWorkInProgressHook(), ref = { impl: callback };
		      hook.memoizedState = ref;
		      return function() {
		        if (0 !== (executionContext & 2))
		          throw Error(formatProdErrorMessage(440));
		        return ref.impl.apply(void 0, arguments);
		      };
		    }
		  }, HooksDispatcherOnUpdate = {
		    readContext,
		    use,
		    useCallback: updateCallback,
		    useContext: readContext,
		    useEffect: updateEffect,
		    useImperativeHandle: updateImperativeHandle,
		    useInsertionEffect: updateInsertionEffect,
		    useLayoutEffect: updateLayoutEffect,
		    useMemo: updateMemo,
		    useReducer: updateReducer,
		    useRef: updateRef,
		    useState: function() {
		      return updateReducer(basicStateReducer);
		    },
		    useDebugValue: mountDebugValue,
		    useDeferredValue: function(value, initialValue) {
		      var hook = updateWorkInProgressHook();
		      return updateDeferredValueImpl(
		        hook,
		        currentHook.memoizedState,
		        value,
		        initialValue
		      );
		    },
		    useTransition: function() {
		      var booleanOrThenable = updateReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
		      return [
		        "boolean" === typeof booleanOrThenable ? booleanOrThenable : useThenable(booleanOrThenable),
		        start
		      ];
		    },
		    useSyncExternalStore: updateSyncExternalStore,
		    useId: updateId,
		    useHostTransitionStatus,
		    useFormState: updateActionState,
		    useActionState: updateActionState,
		    useOptimistic: function(passthrough, reducer) {
		      var hook = updateWorkInProgressHook();
		      return updateOptimisticImpl(hook, currentHook, passthrough, reducer);
		    },
		    useMemoCache,
		    useCacheRefresh: updateRefresh
		  };
		  HooksDispatcherOnUpdate.useEffectEvent = updateEvent;
		  var HooksDispatcherOnRerender = {
		    readContext,
		    use,
		    useCallback: updateCallback,
		    useContext: readContext,
		    useEffect: updateEffect,
		    useImperativeHandle: updateImperativeHandle,
		    useInsertionEffect: updateInsertionEffect,
		    useLayoutEffect: updateLayoutEffect,
		    useMemo: updateMemo,
		    useReducer: rerenderReducer,
		    useRef: updateRef,
		    useState: function() {
		      return rerenderReducer(basicStateReducer);
		    },
		    useDebugValue: mountDebugValue,
		    useDeferredValue: function(value, initialValue) {
		      var hook = updateWorkInProgressHook();
		      return null === currentHook ? mountDeferredValueImpl(hook, value, initialValue) : updateDeferredValueImpl(
		        hook,
		        currentHook.memoizedState,
		        value,
		        initialValue
		      );
		    },
		    useTransition: function() {
		      var booleanOrThenable = rerenderReducer(basicStateReducer)[0], start = updateWorkInProgressHook().memoizedState;
		      return [
		        "boolean" === typeof booleanOrThenable ? booleanOrThenable : useThenable(booleanOrThenable),
		        start
		      ];
		    },
		    useSyncExternalStore: updateSyncExternalStore,
		    useId: updateId,
		    useHostTransitionStatus,
		    useFormState: rerenderActionState,
		    useActionState: rerenderActionState,
		    useOptimistic: function(passthrough, reducer) {
		      var hook = updateWorkInProgressHook();
		      if (null !== currentHook)
		        return updateOptimisticImpl(hook, currentHook, passthrough, reducer);
		      hook.baseState = passthrough;
		      return [passthrough, hook.queue.dispatch];
		    },
		    useMemoCache,
		    useCacheRefresh: updateRefresh
		  };
		  HooksDispatcherOnRerender.useEffectEvent = updateEvent;
		  var classComponentUpdater = {
		    enqueueSetState: function(inst, payload, callback) {
		      inst = inst._reactInternals;
		      var lane = requestUpdateLane(), update = createUpdate(lane);
		      update.payload = payload;
		      void 0 !== callback && null !== callback && (update.callback = callback);
		      payload = enqueueUpdate(inst, update, lane);
		      null !== payload && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
		    },
		    enqueueReplaceState: function(inst, payload, callback) {
		      inst = inst._reactInternals;
		      var lane = requestUpdateLane(), update = createUpdate(lane);
		      update.tag = 1;
		      update.payload = payload;
		      void 0 !== callback && null !== callback && (update.callback = callback);
		      payload = enqueueUpdate(inst, update, lane);
		      null !== payload && (scheduleUpdateOnFiber(payload, inst, lane), entangleTransitions(payload, inst, lane));
		    },
		    enqueueForceUpdate: function(inst, callback) {
		      inst = inst._reactInternals;
		      var lane = requestUpdateLane(), update = createUpdate(lane);
		      update.tag = 2;
		      void 0 !== callback && null !== callback && (update.callback = callback);
		      callback = enqueueUpdate(inst, update, lane);
		      null !== callback && (scheduleUpdateOnFiber(callback, inst, lane), entangleTransitions(callback, inst, lane));
		    }
		  }, SelectiveHydrationException = Error(formatProdErrorMessage(461)), didReceiveUpdate = false, SUSPENDED_MARKER = {
		    dehydrated: null,
		    treeContext: null,
		    retryLane: 0,
		    hydrationErrors: null
		  }, offscreenSubtreeIsHidden = false, offscreenSubtreeWasHidden = false, needsFormReset = false, PossiblyWeakSet = "function" === typeof WeakSet ? WeakSet : Set, nextEffect = null, hostParent = null, hostParentIsContainer = false, currentHoistableRoot = null, suspenseyCommitFlag = 8192, DefaultAsyncDispatcher = {
		    getCacheForType: function(resourceType) {
		      var cache = readContext(CacheContext), cacheForType = cache.data.get(resourceType);
		      void 0 === cacheForType && (cacheForType = resourceType(), cache.data.set(resourceType, cacheForType));
		      return cacheForType;
		    },
		    cacheSignal: function() {
		      return readContext(CacheContext).controller.signal;
		    }
		  }, COMPONENT_TYPE = 0, HAS_PSEUDO_CLASS_TYPE = 1, ROLE_TYPE = 2, TEST_NAME_TYPE = 3, TEXT_TYPE = 4;
		  if ("function" === typeof Symbol && Symbol.for) {
		    var symbolFor = Symbol.for;
		    COMPONENT_TYPE = symbolFor("selector.component");
		    HAS_PSEUDO_CLASS_TYPE = symbolFor("selector.has_pseudo_class");
		    ROLE_TYPE = symbolFor("selector.role");
		    TEST_NAME_TYPE = symbolFor("selector.test_id");
		    TEXT_TYPE = symbolFor("selector.text");
		  }
		  var PossiblyWeakMap = "function" === typeof WeakMap ? WeakMap : Map, executionContext = 0, workInProgressRoot = null, workInProgress = null, workInProgressRootRenderLanes = 0, workInProgressSuspendedReason = 0, workInProgressThrownValue = null, workInProgressRootDidSkipSuspendedSiblings = false, workInProgressRootIsPrerendering = false, workInProgressRootDidAttachPingListener = false, entangledRenderLanes = 0, workInProgressRootExitStatus = 0, workInProgressRootSkippedLanes = 0, workInProgressRootInterleavedUpdatedLanes = 0, workInProgressRootPingedLanes = 0, workInProgressDeferredLane = 0, workInProgressSuspendedRetryLanes = 0, workInProgressRootConcurrentErrors = null, workInProgressRootRecoverableErrors = null, workInProgressRootDidIncludeRecursiveRenderUpdate = false, globalMostRecentFallbackTime = 0, globalMostRecentTransitionTime = 0, workInProgressRootRenderTargetTime = Infinity, workInProgressTransitions = null, legacyErrorBoundariesThatAlreadyFailed = null, pendingEffectsStatus = 0, pendingEffectsRoot = null, pendingFinishedWork = null, pendingEffectsLanes = 0, pendingEffectsRemainingLanes = 0, pendingPassiveTransitions = null, pendingRecoverableErrors = null, nestedUpdateCount = 0, rootWithNestedUpdates = null;
		  exports$1.attemptContinuousHydration = function(fiber) {
		    if (13 === fiber.tag || 31 === fiber.tag) {
		      var root = enqueueConcurrentRenderForLane(fiber, 67108864);
		      null !== root && scheduleUpdateOnFiber(root, fiber, 67108864);
		      markRetryLaneIfNotHydrated(fiber, 67108864);
		    }
		  };
		  exports$1.attemptHydrationAtCurrentPriority = function(fiber) {
		    if (13 === fiber.tag || 31 === fiber.tag) {
		      var lane = requestUpdateLane();
		      lane = getBumpedLaneForHydrationByLane(lane);
		      var root = enqueueConcurrentRenderForLane(fiber, lane);
		      null !== root && scheduleUpdateOnFiber(root, fiber, lane);
		      markRetryLaneIfNotHydrated(fiber, lane);
		    }
		  };
		  exports$1.attemptSynchronousHydration = function(fiber) {
		    switch (fiber.tag) {
		      case 3:
		        fiber = fiber.stateNode;
		        if (fiber.current.memoizedState.isDehydrated) {
		          var lanes = getHighestPriorityLanes(fiber.pendingLanes);
		          if (0 !== lanes) {
		            fiber.pendingLanes |= 2;
		            for (fiber.entangledLanes |= 2; lanes; ) {
		              var lane = 1 << 31 - clz32(lanes);
		              fiber.entanglements[1] |= lane;
		              lanes &= ~lane;
		            }
		            ensureRootIsScheduled(fiber);
		            0 === (executionContext & 6) && (workInProgressRootRenderTargetTime = now() + 500, flushSyncWorkAcrossRoots_impl(0));
		          }
		        }
		        break;
		      case 31:
		      case 13:
		        lanes = enqueueConcurrentRenderForLane(fiber, 2), null !== lanes && scheduleUpdateOnFiber(lanes, fiber, 2), flushSyncWork(), markRetryLaneIfNotHydrated(fiber, 2);
		    }
		  };
		  exports$1.batchedUpdates = function(fn, a) {
		    return fn(a);
		  };
		  exports$1.createComponentSelector = function(component) {
		    return { $$typeof: COMPONENT_TYPE, value: component };
		  };
		  exports$1.createContainer = function(containerInfo, tag, hydrationCallbacks, isStrictMode, concurrentUpdatesByDefaultOverride, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator) {
		    return createFiberRoot(
		      containerInfo,
		      tag,
		      false,
		      null,
		      hydrationCallbacks,
		      isStrictMode,
		      identifierPrefix,
		      null,
		      onUncaughtError,
		      onCaughtError,
		      onRecoverableError,
		      onDefaultTransitionIndicator
		    );
		  };
		  exports$1.createHasPseudoClassSelector = function(selectors) {
		    return { $$typeof: HAS_PSEUDO_CLASS_TYPE, value: selectors };
		  };
		  exports$1.createHydrationContainer = function(initialChildren, callback, containerInfo, tag, hydrationCallbacks, isStrictMode, concurrentUpdatesByDefaultOverride, identifierPrefix, onUncaughtError, onCaughtError, onRecoverableError, onDefaultTransitionIndicator, transitionCallbacks, formState) {
		    initialChildren = createFiberRoot(
		      containerInfo,
		      tag,
		      true,
		      initialChildren,
		      hydrationCallbacks,
		      isStrictMode,
		      identifierPrefix,
		      formState,
		      onUncaughtError,
		      onCaughtError,
		      onRecoverableError,
		      onDefaultTransitionIndicator
		    );
		    initialChildren.context = getContextForSubtree(null);
		    containerInfo = initialChildren.current;
		    tag = requestUpdateLane();
		    tag = getBumpedLaneForHydrationByLane(tag);
		    hydrationCallbacks = createUpdate(tag);
		    hydrationCallbacks.callback = void 0 !== callback && null !== callback ? callback : null;
		    enqueueUpdate(containerInfo, hydrationCallbacks, tag);
		    callback = tag;
		    initialChildren.current.lanes = callback;
		    markRootUpdated$1(initialChildren, callback);
		    ensureRootIsScheduled(initialChildren);
		    return initialChildren;
		  };
		  exports$1.createPortal = function(children, containerInfo, implementation) {
		    var key = 3 < arguments.length && void 0 !== arguments[3] ? arguments[3] : null;
		    return {
		      $$typeof: REACT_PORTAL_TYPE,
		      key: null == key ? null : "" + key,
		      children,
		      containerInfo,
		      implementation
		    };
		  };
		  exports$1.createRoleSelector = function(role) {
		    return { $$typeof: ROLE_TYPE, value: role };
		  };
		  exports$1.createTestNameSelector = function(id) {
		    return { $$typeof: TEST_NAME_TYPE, value: id };
		  };
		  exports$1.createTextSelector = function(text) {
		    return { $$typeof: TEXT_TYPE, value: text };
		  };
		  exports$1.defaultOnCaughtError = function(error) {
		    console.error(error);
		  };
		  exports$1.defaultOnRecoverableError = function(error) {
		    reportGlobalError(error);
		  };
		  exports$1.defaultOnUncaughtError = function(error) {
		    reportGlobalError(error);
		  };
		  exports$1.deferredUpdates = function(fn) {
		    var prevTransition = ReactSharedInternals.T, previousPriority = getCurrentUpdatePriority();
		    try {
		      return setCurrentUpdatePriority(32), ReactSharedInternals.T = null, fn();
		    } finally {
		      setCurrentUpdatePriority(previousPriority), ReactSharedInternals.T = prevTransition;
		    }
		  };
		  exports$1.discreteUpdates = function(fn, a, b, c, d) {
		    var prevTransition = ReactSharedInternals.T, previousPriority = getCurrentUpdatePriority();
		    try {
		      return setCurrentUpdatePriority(2), ReactSharedInternals.T = null, fn(a, b, c, d);
		    } finally {
		      setCurrentUpdatePriority(previousPriority), ReactSharedInternals.T = prevTransition, 0 === executionContext && (workInProgressRootRenderTargetTime = now() + 500);
		    }
		  };
		  exports$1.findAllNodes = findAllNodes;
		  exports$1.findBoundingRects = function(hostRoot, selectors) {
		    if (!supportsTestSelectors) throw Error(formatProdErrorMessage(363));
		    selectors = findAllNodes(hostRoot, selectors);
		    hostRoot = [];
		    for (var i = 0; i < selectors.length; i++)
		      hostRoot.push(getBoundingRect(selectors[i]));
		    for (selectors = hostRoot.length - 1; 0 < selectors; selectors--) {
		      i = hostRoot[selectors];
		      for (var targetLeft = i.x, targetRight = targetLeft + i.width, targetTop = i.y, targetBottom = targetTop + i.height, j = selectors - 1; 0 <= j; j--)
		        if (selectors !== j) {
		          var otherRect = hostRoot[j], otherLeft = otherRect.x, otherRight = otherLeft + otherRect.width, otherTop = otherRect.y, otherBottom = otherTop + otherRect.height;
		          if (targetLeft >= otherLeft && targetTop >= otherTop && targetRight <= otherRight && targetBottom <= otherBottom) {
		            hostRoot.splice(selectors, 1);
		            break;
		          } else if (!(targetLeft !== otherLeft || i.width !== otherRect.width || otherBottom < targetTop || otherTop > targetBottom)) {
		            otherTop > targetTop && (otherRect.height += otherTop - targetTop, otherRect.y = targetTop);
		            otherBottom < targetBottom && (otherRect.height = targetBottom - otherTop);
		            hostRoot.splice(selectors, 1);
		            break;
		          } else if (!(targetTop !== otherTop || i.height !== otherRect.height || otherRight < targetLeft || otherLeft > targetRight)) {
		            otherLeft > targetLeft && (otherRect.width += otherLeft - targetLeft, otherRect.x = targetLeft);
		            otherRight < targetRight && (otherRect.width = targetRight - otherLeft);
		            hostRoot.splice(selectors, 1);
		            break;
		          }
		        }
		    }
		    return hostRoot;
		  };
		  exports$1.findHostInstance = findHostInstance;
		  exports$1.findHostInstanceWithNoPortals = function(fiber) {
		    fiber = findCurrentFiberUsingSlowPath(fiber);
		    fiber = null !== fiber ? findCurrentHostFiberWithNoPortalsImpl(fiber) : null;
		    return null === fiber ? null : getPublicInstance(fiber.stateNode);
		  };
		  exports$1.findHostInstanceWithWarning = function(component) {
		    return findHostInstance(component);
		  };
		  exports$1.flushPassiveEffects = flushPendingEffects;
		  exports$1.flushSyncFromReconciler = function(fn) {
		    var prevExecutionContext = executionContext;
		    executionContext |= 1;
		    var prevTransition = ReactSharedInternals.T, previousPriority = getCurrentUpdatePriority();
		    try {
		      if (setCurrentUpdatePriority(2), ReactSharedInternals.T = null, fn)
		        return fn();
		    } finally {
		      setCurrentUpdatePriority(previousPriority), ReactSharedInternals.T = prevTransition, executionContext = prevExecutionContext, 0 === (executionContext & 6) && flushSyncWorkAcrossRoots_impl(0);
		    }
		  };
		  exports$1.flushSyncWork = flushSyncWork;
		  exports$1.focusWithin = function(hostRoot, selectors) {
		    if (!supportsTestSelectors) throw Error(formatProdErrorMessage(363));
		    hostRoot = findFiberRootForHostRoot(hostRoot);
		    selectors = findPaths(hostRoot, selectors);
		    selectors = Array.from(selectors);
		    for (hostRoot = 0; hostRoot < selectors.length; ) {
		      var fiber = selectors[hostRoot++], tag = fiber.tag;
		      if (!isHiddenSubtree(fiber)) {
		        if ((5 === tag || 26 === tag || 27 === tag) && setFocusIfFocusable(fiber.stateNode))
		          return true;
		        for (fiber = fiber.child; null !== fiber; )
		          selectors.push(fiber), fiber = fiber.sibling;
		      }
		    }
		    return false;
		  };
		  exports$1.getFindAllNodesFailureDescription = function(hostRoot, selectors) {
		    if (!supportsTestSelectors) throw Error(formatProdErrorMessage(363));
		    var maxSelectorIndex = 0, matchedNames = [];
		    hostRoot = [findFiberRootForHostRoot(hostRoot), 0];
		    for (var index = 0; index < hostRoot.length; ) {
		      var fiber = hostRoot[index++], tag = fiber.tag, selectorIndex = hostRoot[index++], selector = selectors[selectorIndex];
		      if (5 !== tag && 26 !== tag && 27 !== tag || !isHiddenSubtree(fiber)) {
		        if (matchSelector(fiber, selector) && (matchedNames.push(selectorToString(selector)), selectorIndex++, selectorIndex > maxSelectorIndex && (maxSelectorIndex = selectorIndex)), selectorIndex < selectors.length)
		          for (fiber = fiber.child; null !== fiber; )
		            hostRoot.push(fiber, selectorIndex), fiber = fiber.sibling;
		      }
		    }
		    if (maxSelectorIndex < selectors.length) {
		      for (hostRoot = []; maxSelectorIndex < selectors.length; maxSelectorIndex++)
		        hostRoot.push(selectorToString(selectors[maxSelectorIndex]));
		      return "findAllNodes was able to match part of the selector:\n  " + (matchedNames.join(" > ") + "\n\nNo matching component was found for:\n  ") + hostRoot.join(" > ");
		    }
		    return null;
		  };
		  exports$1.getPublicRootInstance = function(container) {
		    container = container.current;
		    if (!container.child) return null;
		    switch (container.child.tag) {
		      case 27:
		      case 5:
		        return getPublicInstance(container.child.stateNode);
		      default:
		        return container.child.stateNode;
		    }
		  };
		  exports$1.injectIntoDevTools = function() {
		    var internals = {
		      bundleType: 0,
		      version: rendererVersion,
		      rendererPackageName,
		      currentDispatcherRef: ReactSharedInternals,
		      reconcilerVersion: "19.2.0"
		    };
		    null !== extraDevToolsConfig && (internals.rendererConfig = extraDevToolsConfig);
		    if ("undefined" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__) internals = false;
		    else {
		      var hook = __REACT_DEVTOOLS_GLOBAL_HOOK__;
		      if (hook.isDisabled || !hook.supportsFiber) internals = true;
		      else {
		        try {
		          rendererID = hook.inject(internals), injectedHook = hook;
		        } catch (err) {
		        }
		        internals = hook.checkDCE ? true : false;
		      }
		    }
		    return internals;
		  };
		  exports$1.isAlreadyRendering = function() {
		    return 0 !== (executionContext & 6);
		  };
		  exports$1.observeVisibleRects = function(hostRoot, selectors, callback, options) {
		    if (!supportsTestSelectors) throw Error(formatProdErrorMessage(363));
		    hostRoot = findAllNodes(hostRoot, selectors);
		    var disconnect = setupIntersectionObserver(
		      hostRoot,
		      callback,
		      options
		    ).disconnect;
		    return {
		      disconnect: function() {
		        disconnect();
		      }
		    };
		  };
		  exports$1.shouldError = function() {
		    return null;
		  };
		  exports$1.shouldSuspend = function() {
		    return false;
		  };
		  exports$1.startHostTransition = function(formFiber, pendingState, action, formData) {
		    if (5 !== formFiber.tag) throw Error(formatProdErrorMessage(476));
		    var queue = ensureFormComponentIsStateful(formFiber).queue;
		    startTransition(
		      formFiber,
		      queue,
		      pendingState,
		      NotPendingTransition,
		      null === action ? noop : function() {
		        var stateHook = ensureFormComponentIsStateful(formFiber);
		        null === stateHook.next && (stateHook = formFiber.alternate.memoizedState);
		        dispatchSetStateInternal(
		          formFiber,
		          stateHook.next.queue,
		          {},
		          requestUpdateLane()
		        );
		        return action(formData);
		      }
		    );
		  };
		  exports$1.updateContainer = function(element, container, parentComponent, callback) {
		    var current = container.current, lane = requestUpdateLane();
		    updateContainerImpl(
		      current,
		      lane,
		      element,
		      container,
		      parentComponent,
		      callback
		    );
		    return lane;
		  };
		  exports$1.updateContainerSync = function(element, container, parentComponent, callback) {
		    updateContainerImpl(
		      container.current,
		      2,
		      element,
		      container,
		      parentComponent,
		      callback
		    );
		    return 2;
		  };
		  return exports$1;
		};
		module.exports.default = module.exports;
		Object.defineProperty(module.exports, "__esModule", { value: true }); 
	} (reactReconciler_production));
	return reactReconciler_production.exports;
}

var hasRequiredReactReconciler;

function requireReactReconciler () {
	if (hasRequiredReactReconciler) return reactReconciler.exports;
	hasRequiredReactReconciler = 1;
	{
	  reactReconciler.exports = requireReactReconciler_production();
	}
	return reactReconciler.exports;
}

var reactReconcilerExports = requireReactReconciler();
const ReactFiberReconciler = /*@__PURE__*/getDefaultExportFromCjs(reactReconcilerExports);

var constants = {exports: {}};

var reactReconcilerConstants_production = {};

/**
 * @license React
 * react-reconciler-constants.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var hasRequiredReactReconcilerConstants_production;

function requireReactReconcilerConstants_production () {
	if (hasRequiredReactReconcilerConstants_production) return reactReconcilerConstants_production;
	hasRequiredReactReconcilerConstants_production = 1;
	reactReconcilerConstants_production.ConcurrentRoot = 1;
	reactReconcilerConstants_production.ContinuousEventPriority = 8;
	reactReconcilerConstants_production.DefaultEventPriority = 32;
	reactReconcilerConstants_production.DiscreteEventPriority = 2;
	reactReconcilerConstants_production.IdleEventPriority = 268435456;
	reactReconcilerConstants_production.LegacyRoot = 0;
	reactReconcilerConstants_production.NoEventPriority = 0;
	return reactReconcilerConstants_production;
}

var hasRequiredConstants;

function requireConstants () {
	if (hasRequiredConstants) return constants.exports;
	hasRequiredConstants = 1;
	{
	  constants.exports = requireReactReconcilerConstants_production();
	}
	return constants.exports;
}

var constantsExports = requireConstants();

const propsToSkip = {
    children: true,
    ref: true,
    key: true,
    style: true,
    forwardedRef: true,
    unstable_applyCache: true,
    unstable_applyDrawHitFromCache: true,
};
let zIndexWarningShowed = false;
let dragWarningShowed = false;
const EVENTS_NAMESPACE = '.react-konva-event';
const DRAGGABLE_WARNING = `ReactKonva: You have a Konva node with draggable = true and position defined but no onDragMove or onDragEnd events are handled.
Position of a node will be changed during drag&drop, so you should update state of the react app as well.
Consider to add onDragMove or onDragEnd events.
For more info see: https://github.com/konvajs/react-konva/issues/256
`;
const Z_INDEX_WARNING = `ReactKonva: You are using "zIndex" attribute for a Konva node.
react-konva may get confused with ordering. Just define correct order of elements in your render function of a component.
For more info see: https://github.com/konvajs/react-konva/issues/194
`;
const EMPTY_PROPS = {};
function applyNodeProps(instance, props, oldProps = EMPTY_PROPS) {
    // don't use zIndex in react-konva
    if (!zIndexWarningShowed && 'zIndex' in props) {
        console.warn(Z_INDEX_WARNING);
        zIndexWarningShowed = true;
    }
    // check correct draggable usage
    if (!dragWarningShowed && props.draggable) {
        var hasPosition = props.x !== undefined || props.y !== undefined;
        var hasEvents = props.onDragEnd || props.onDragMove;
        if (hasPosition && !hasEvents) {
            console.warn(DRAGGABLE_WARNING);
            dragWarningShowed = true;
        }
    }
    // check old props
    // we need to unset properties that are not in new props
    // and remove all events
    for (var key in oldProps) {
        if (propsToSkip[key]) {
            continue;
        }
        var isEvent = key.slice(0, 2) === 'on';
        var propChanged = oldProps[key] !== props[key];
        // if that is a changed event, we need to remove it
        if (isEvent && propChanged) {
            var eventName = key.substr(2).toLowerCase();
            if (eventName.substr(0, 7) === 'content') {
                eventName =
                    'content' +
                        eventName.substr(7, 1).toUpperCase() +
                        eventName.substr(8);
            }
            instance.off(eventName, oldProps[key]);
        }
        var toRemove = !props.hasOwnProperty(key);
        if (toRemove) {
            instance.setAttr(key, undefined);
        }
    }
    var strictUpdate = props._useStrictMode;
    var updatedProps = {};
    var hasUpdates = false;
    const newEvents = {};
    for (var key in props) {
        if (propsToSkip[key]) {
            continue;
        }
        var isEvent = key.slice(0, 2) === 'on';
        var toAdd = oldProps[key] !== props[key];
        if (isEvent && toAdd) {
            var eventName = key.substr(2).toLowerCase();
            if (eventName.substr(0, 7) === 'content') {
                eventName =
                    'content' +
                        eventName.substr(7, 1).toUpperCase() +
                        eventName.substr(8);
            }
            // check that event is not undefined
            if (props[key]) {
                newEvents[eventName] = props[key];
            }
        }
        if (!isEvent &&
            (props[key] !== oldProps[key] ||
                (strictUpdate && props[key] !== instance.getAttr(key)))) {
            hasUpdates = true;
            updatedProps[key] = props[key];
        }
    }
    if (hasUpdates) {
        instance.setAttrs(updatedProps);
        updatePicture(instance);
    }
    // subscribe to events AFTER we set attrs
    // we need it to fix https://github.com/konvajs/react-konva/issues/471
    // settings attrs may add events. Like "draggable: true" will add "mousedown" listener
    for (var eventName in newEvents) {
        // first clear any existing listeners, it is required for strict mode
        instance.off(eventName + EVENTS_NAMESPACE);
        // then attach new one
        instance.on(eventName + EVENTS_NAMESPACE, newEvents[eventName]);
    }
}
function updatePicture(node) {
    if (!Konva$2.autoDrawEnabled) {
        var drawingNode = node.getLayer() || node.getStage();
        drawingNode && drawingNode.batchDraw();
    }
}

const NO_CONTEXT = {};
const UPDATE_SIGNAL = {};
// for react-spring capability
Konva$1.Node.prototype._applyProps = applyNodeProps;
// let currentUpdatePriority: number = NoEventPriority;
let currentUpdatePriority = constantsExports.DefaultEventPriority;
function appendInitialChild(parentInstance, child) {
    if (typeof child === 'string') {
        // Noop for string children of Text (eg <Text>foo</Text>)
        console.error(`Do not use plain text as child of Konva.Node. You are using text: ${child}`);
        return;
    }
    parentInstance.add(child);
    updatePicture(parentInstance);
}
function createInstance(type, props, internalInstanceHandle) {
    let NodeClass = Konva$1[type];
    if (!NodeClass) {
        console.error(`Konva has no node with the type ${type}. Group will be used instead. If you use minimal version of react-konva, just import required nodes into Konva: "import "konva/lib/shapes/${type}"  If you want to render DOM elements as part of canvas tree take a look into this demo: https://konvajs.github.io/docs/react/DOM_Portal.html`);
        NodeClass = Konva$1.Group;
    }
    // we need to split props into events and non events
    // we we can pass non events into constructor directly
    // that way the performance should be better
    // we we apply change "applyNodeProps"
    // then it will trigger change events on first run
    // but we don't need them!
    const propsWithoutEvents = {};
    const propsWithOnlyEvents = {};
    for (var key in props) {
        // ignore ref
        if (key === 'ref') {
            continue;
        }
        var isEvent = key.slice(0, 2) === 'on';
        if (isEvent) {
            propsWithOnlyEvents[key] = props[key];
        }
        else {
            propsWithoutEvents[key] = props[key];
        }
    }
    const instance = new NodeClass(propsWithoutEvents);
    applyNodeProps(instance, propsWithOnlyEvents);
    return instance;
}
function createTextInstance(text, rootContainerInstance, internalInstanceHandle) {
    console.error(`Text components are not supported for now in ReactKonva. Your text is: "${text}"`);
}
function finalizeInitialChildren(domElement, type, props) {
    return false;
}
function getPublicInstance(instance) {
    return instance;
}
function prepareForCommit() {
    return null;
}
function preparePortalMount() {
    return null;
}
function prepareUpdate(domElement, type, oldProps, newProps) {
    return UPDATE_SIGNAL;
}
function resetAfterCommit() {
    // Noop
}
function resetTextContent(domElement) {
    // Noop
}
function shouldDeprioritizeSubtree(type, props) {
    return false;
}
function getRootHostContext() {
    return NO_CONTEXT;
}
function getChildHostContext() {
    return NO_CONTEXT;
}
const scheduleTimeout = setTimeout;
const cancelTimeout = clearTimeout;
const supportsMicrotasks = true;
// Run microtasks synchronously for immediate updates
const scheduleMicrotask = (fn) => {
    fn();
};
const noTimeout = -1;
// export const schedulePassiveEffects = scheduleDeferredCallback;
// export const cancelPassiveEffects = cancelDeferredCallback;
function shouldSetTextContent(type, props) {
    return false;
}
// The Konva renderer is secondary to the React DOM renderer.
const isPrimaryRenderer = false;
const warnsIfNotActing = false;
const supportsMutation = true;
const supportsPersistence = false;
const supportsHydration = false;
function appendChild(parentInstance, child) {
    if (child.parent === parentInstance) {
        child.moveToTop();
    }
    else {
        parentInstance.add(child);
    }
    updatePicture(parentInstance);
}
function appendChildToContainer(parentInstance, child) {
    if (child.parent === parentInstance) {
        child.moveToTop();
    }
    else {
        parentInstance.add(child);
    }
    updatePicture(parentInstance);
}
function insertBefore(parentInstance, child, beforeChild) {
    // child._remove() will not stop dragging
    // but child.remove() will stop it, but we don't need it
    // removing will reset zIndexes
    child._remove();
    parentInstance.add(child);
    child.setZIndex(beforeChild.getZIndex());
    updatePicture(parentInstance);
}
function insertInContainerBefore(parentInstance, child, beforeChild) {
    insertBefore(parentInstance, child, beforeChild);
}
function removeChild(parentInstance, child) {
    child.destroy();
    child.off(EVENTS_NAMESPACE);
    updatePicture(parentInstance);
}
function removeChildFromContainer(parentInstance, child) {
    child.destroy();
    child.off(EVENTS_NAMESPACE);
    updatePicture(parentInstance);
}
function commitTextUpdate(textInstance, oldText, newText) {
    console.error(`Text components are not yet supported in ReactKonva. You text is: "${newText}"`);
}
function commitMount(instance, type, newProps) {
    // Noop
}
function commitUpdate(instance, type, oldProps, newProps) {
    applyNodeProps(instance, newProps, oldProps);
}
function hideInstance(instance) {
    instance.hide();
    updatePicture(instance);
}
function hideTextInstance(textInstance) {
    // Noop
}
function unhideInstance(instance, props) {
    if (props.visible == null || props.visible) {
        instance.show();
    }
}
function unhideTextInstance(textInstance, text) {
    // Noop
}
function clearContainer(container) {
    // Noop
}
function detachDeletedInstance() { }
function getInstanceFromNode() {
    return null;
}
function beforeActiveInstanceBlur() { }
function afterActiveInstanceBlur() { }
function getCurrentEventPriority() {
    return constantsExports.DefaultEventPriority;
}
function prepareScopeUpdate() { }
function getInstanceFromScope() {
    return null;
}
function setCurrentUpdatePriority(newPriority) {
    currentUpdatePriority = newPriority;
}
function getCurrentUpdatePriority() {
    return currentUpdatePriority;
}
function resolveUpdatePriority() {
    return constantsExports.DiscreteEventPriority;
}
function shouldAttemptEagerTransition() {
    return false;
}
function trackSchedulerEvent() { }
function resolveEventType() {
    return null;
}
function resolveEventTimeStamp() {
    return -1.1;
}
function requestPostPaintCallback() { }
function maySuspendCommit() {
    return false;
}
function preloadInstance() {
    return true;
}
function startSuspendingCommit() { }
function suspendInstance() { }
function waitForCommitToBeReady() {
    return null;
}
const NotPendingTransition = null;
// React 19 transition context - create as React context that can be cast by reconciler
const HostTransitionContext = /* @__PURE__ */ React.createContext(null);
function resetFormInstance() { }

const HostConfig = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    HostTransitionContext,
    NotPendingTransition,
    afterActiveInstanceBlur,
    appendChild,
    appendChildToContainer,
    appendInitialChild,
    beforeActiveInstanceBlur,
    cancelTimeout,
    clearContainer,
    commitMount,
    commitTextUpdate,
    commitUpdate,
    createInstance,
    createTextInstance,
    detachDeletedInstance,
    finalizeInitialChildren,
    getChildHostContext,
    getCurrentEventPriority,
    getCurrentUpdatePriority,
    getInstanceFromNode,
    getInstanceFromScope,
    getPublicInstance,
    getRootHostContext,
    hideInstance,
    hideTextInstance,
    idlePriority: schedulerExports.unstable_IdlePriority,
    insertBefore,
    insertInContainerBefore,
    isPrimaryRenderer,
    maySuspendCommit,
    noTimeout,
    now: schedulerExports.unstable_now,
    preloadInstance,
    prepareForCommit,
    preparePortalMount,
    prepareScopeUpdate,
    prepareUpdate,
    removeChild,
    removeChildFromContainer,
    requestPostPaintCallback,
    resetAfterCommit,
    resetFormInstance,
    resetTextContent,
    resolveEventTimeStamp,
    resolveEventType,
    resolveUpdatePriority,
    run: schedulerExports.unstable_runWithPriority,
    scheduleMicrotask,
    scheduleTimeout,
    setCurrentUpdatePriority,
    shouldAttemptEagerTransition,
    shouldDeprioritizeSubtree,
    shouldSetTextContent,
    startSuspendingCommit,
    supportsHydration,
    supportsMicrotasks,
    supportsMutation,
    supportsPersistence,
    suspendInstance,
    trackSchedulerEvent,
    unhideInstance,
    unhideTextInstance,
    waitForCommitToBeReady,
    warnsIfNotActing
}, Symbol.toStringTag, { value: 'Module' }));

/**
 * Based on ReactArt.js
 * Copyright (c) 2017-present Lavrenov Anton.
 * All rights reserved.
 *
 * MIT
 */
if (React.version.indexOf('19') === -1) {
    throw new Error('react-konva version 19 is only compatible with React 19. Make sure to have the last version of react-konva and react or downgrade react-konva to version 18.');
}
function usePrevious(value) {
    const ref = React.useRef({});
    React.useLayoutEffect(() => {
        ref.current = value;
    });
    React.useLayoutEffect(() => {
        return () => {
            // when using suspense it is possible that stage is unmounted
            // but React still keep component ref
            // in that case we need to manually flush props
            // we have a special test for that
            ref.current = {};
        };
    }, []);
    return ref.current;
}
const useIsReactStrictMode = () => {
    const memoCount = React.useRef(0);
    // in strict mode, memo will be called twice
    React.useMemo(() => {
        memoCount.current++;
    }, []);
    return memoCount.current > 1;
};
const StageWrap = (props) => {
    const container = React.useRef(null);
    const stage = React.useRef(null);
    const fiberRef = React.useRef(null);
    const oldProps = usePrevious(props);
    const Bridge = x();
    const pendingDestroy = React.useRef(null);
    const _setRef = (stage) => {
        const { forwardedRef } = props;
        if (!forwardedRef) {
            return;
        }
        if (typeof forwardedRef === 'function') {
            forwardedRef(stage);
        }
        else {
            forwardedRef.current = stage;
        }
    };
    const isStrictMode = useIsReactStrictMode();
    const destroyStage = () => {
        _setRef(null);
        // CRITICAL: flushSyncFromReconciler is required here to ensure pending work
        // (e.g. stale MobX updates on child components) is flushed synchronously
        // before the tree is torn down. Without it, unmounting a Stage can leave
        // pending Konva work that runs after the stage is already destroyed.
        KonvaRenderer.flushSyncFromReconciler(() => {
            KonvaRenderer.updateContainer(null, fiberRef.current, null);
        });
        stage.current?.destroy();
        stage.current = null;
    };
    React.useLayoutEffect(() => {
        // Cancel any pending destruction (happens during re-ordering in strict mode)
        if (pendingDestroy.current) {
            clearTimeout(pendingDestroy.current);
            pendingDestroy.current = null;
        }
        // If stage already exists (re-ordering scenario), reuse it
        if (stage.current) {
            _setRef(stage.current);
        }
        else {
            stage.current = new Konva$1.Stage({
                width: props.width,
                height: props.height,
                container: container.current,
            });
            _setRef(stage.current);
            // @ts-ignore
            fiberRef.current = KonvaRenderer.createContainer(stage.current, constantsExports.ConcurrentRoot, null, false, null, '', console.error, console.error, console.error, null);
            KonvaRenderer.updateContainer(React.createElement(Bridge, {}, props.children), fiberRef.current, null, () => { });
        }
        return () => {
            if (isStrictMode) {
                // Delay destruction to allow cancellation on remount
                pendingDestroy.current = setTimeout(destroyStage, 0);
            }
            else {
                destroyStage();
            }
        };
    }, []);
    React.useLayoutEffect(() => {
        _setRef(stage.current);
        applyNodeProps(stage.current, props, oldProps);
        // =============================================================================
        // CRITICAL FIX - DO NOT REMOVE
        // =============================================================================
        // This flushSyncFromReconciler wrapper is CRITICAL for React 19 compatibility.
        //
        // THE BUG:
        // When using useSyncExternalStore (MobX, Zustand, etc.) with react-konva,
        // parent component's useLayoutEffect couldn't find newly added Konva nodes.
        // The nodes were added to the store, but not yet rendered to the canvas.
        //
        // ROOT CAUSE:
        // React 19's updateContainer can defer Konva reconciler work to a later
        // microtask. Combined with Bridge component (from its-fine) and Html components
        // that create secondary React roots, this caused child components to render
        // AFTER parent's useLayoutEffect completed.
        //
        // THE FIX:
        // flushSyncFromReconciler forces ALL scheduled Konva reconciler work to
        // complete synchronously within this useLayoutEffect, ensuring child
        // components render before any parent effects run.
        //
        // WARNING - NOT COVERED BY TESTS:
        // This bug CANNOT be reproduced in local test environments (Vitest/Playwright).
        // It only manifests in production builds with specific conditions:
        // - MobX/useSyncExternalStore for state management
        // - Html components with secondary React roots using Bridge
        // - Complex component hierarchies (multiple pages/stages)
        // The fix was verified in Polotno production app.
        // =============================================================================
        KonvaRenderer.flushSyncFromReconciler(() => {
            KonvaRenderer.updateContainer(React.createElement(Bridge, {}, props.children), fiberRef.current, null);
        });
    });
    return React.createElement('div', {
        ref: container,
        id: props.id,
        accessKey: props.accessKey,
        className: props.className,
        role: props.role,
        style: props.style,
        tabIndex: props.tabIndex,
        title: props.title,
    });
};
const Layer = 'Layer';
const Group = 'Group';
const Rect = 'Rect';
const Circle = 'Circle';
const Line = 'Line';
const Image = 'Image';
const Text = 'Text';
// @ts-ignore
const KonvaRenderer = ReactFiberReconciler(HostConfig);
// Update Stage component declaration
const Stage = React.forwardRef((props, ref) => {
    return React.createElement(m, {}, React.createElement(StageWrap, { ...props, forwardedRef: ref }));
});

let wbCache = {
  layers: [{ id: "layer-1", name: "Ebene 1 (Basis)", visible: true, items: [] }],
  activeLayerId: "layer-1",
  bgImageSrc: null,
  bgImagePos: { x: 0, y: 0 },
  stageScale: 1,
  stagePos: { x: 0, y: 0 },
  activeColor: "#3b82f6"
};
const localTranslations = {
  en: { title: "Whiteboard & Audio Hub", desc: "Interactive canvas for ideation and AI-transcribed voice notes.", import_media: "Import Media", export_pdf: "Export PDF", export_img: "Export Image", save_cloud: "Save to Cloud", saving_cloud: "Saving...", saved_cloud: "Saved to Documents!", send_slides: "Send to Pitch Deck", sending: "Sending...", sent: "Sent to Slides!", draw_polygon: "Draw Polygon", img_adjust: "Image Adjustments", brightness: "Brightness", contrast: "Contrast", saturation: "Saturation", delete_btn: "Delete", close_shape: "Close shape", ai_analyzing: "AI is analyzing...", no_data: "No voice notes yet.", ai_summary: "AI Summary", full_transcript: "Full Transcription", info_text: "The AI will transcribe your voice note and extract key tasks automatically.", stop_rec: "Stop Recording", start_rec: "Record Voice Note", click_points: "Click to add points...", clear_canvas: "Clear Canvas?", mic_error: "Microphone access denied.", ai_error: "Failed to analyze audio.", pdf_success: "PDF exported successfully!", add_text: "Insert Text", enter_text: "Add Text", type_text_here: "Enter text...", cancel: "Cancel", delete_note: "Delete Note", confirm_delete_note: "Are you sure you want to delete this voice note?", note_deleted: "Voice note deleted!", tool_pan: "Pan Canvas", tool_select: "Select / Move", reset_zoom: "Reset Zoom & Pan", fullscreen: "Fullscreen", exit_fullscreen: "Exit Fullscreen", layers: "Layers", add_layer: "Add Layer", base_layer: "Base Layer", ai_render: "AI Rendering", ai_render_desc: "Transform your sketch into a photorealistic concept render.", describe_vision: "Describe your vision (e.g. Futuristic sports car, neon colors, cyberpunk style)...", generate_render: "Generate Concept", rendering: "Rendering...", add_to_canvas: "Add to Canvas as Base Layer", your_sketch: "Your Sketch" },
  de: { title: "Whiteboard & Audio Hub", desc: "Interaktive Zeichenfläche und KI-transkribierte Sprachnotizen.", import_media: "Import (Bild/PDF)", export_pdf: "Als PDF Exportieren", export_img: "Als Bild Exportieren", save_cloud: "In Cloud speichern", saving_cloud: "Speichert...", saved_cloud: "Im Dokumenten-Ordner gespeichert!", send_slides: "An Pitch Deck", sending: "Sende...", sent: "Gesendet!", draw_polygon: "Polygon", img_adjust: "Bildbearbeitung", brightness: "Helligkeit", contrast: "Kontrast", saturation: "Sättigung", delete_btn: "Löschen", close_shape: "Schließen", ai_analyzing: "KI analysiert...", no_data: "Noch keine Sprachnotizen.", ai_summary: "KI Zusammenfassung", full_transcript: "Transkription", info_text: "Die KI analysiert deine Aufnahme und leitet automatisch Aufgaben ab.", stop_rec: "Aufnahme stoppen", start_rec: "Sprachnotiz aufnehmen", click_points: "Klicke auf Punkte...", clear_canvas: "Canvas komplett löschen?", mic_error: "Mikrofon blockiert.", ai_error: "KI-Analyse fehlgeschlagen.", pdf_success: "PDF erfolgreich exportiert!", add_text: "Einfügen", enter_text: "Text hinzufügen", type_text_here: "Text eingeben...", cancel: "Abbrechen", delete_note: "Notiz löschen", confirm_delete_note: "Bist du sicher, dass du diese Sprachnotiz unwiderruflich löschen möchtest?", note_deleted: "Sprachnotiz gelöscht!", tool_pan: "Ansicht verschieben (Pan)", tool_select: "Auswählen / Bewegen", reset_zoom: "Ansicht zentrieren", fullscreen: "Vollbild", exit_fullscreen: "Vollbild verlassen", layers: "Ebenen", add_layer: "Neue Ebene", base_layer: "Basis-Ebene", ai_render: "AI Rendering", ai_render_desc: "Verwandle deine Skizze in ein fotorealistisches Konzept-Design.", describe_vision: "Beschreibe deine Vision (z.B. Comicfigur, Neonfarben, Cyberpunk Stil)...", generate_render: "Skizze Rendern", rendering: "KI generiert Bild...", add_to_canvas: "Als neue Basis-Ebene einfügen", your_sketch: "Deine Skizze" }
};
const AVAILABLE_COLORS = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#3b82f6", "#a855f7", "#ec4899", "#fafafa", "#18181b"];
const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
const pdfStyles = StyleSheet.create({
  page: { backgroundColor: "#ffffff", fontFamily: "Helvetica" },
  safeArea: { flex: 1, margin: 30, marginBottom: 50, display: "flex", flexDirection: "column" },
  headerContainer: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 2, paddingBottom: 10, marginBottom: 15 },
  headerLeft: { flex: 1 },
  title: { fontSize: 20, fontWeight: "bold", color: "#000000", textTransform: "uppercase", marginBottom: 8 },
  metaGrid: { flexDirection: "row" },
  metaBlock: { flexDirection: "column", marginRight: 20 },
  metaLabel: { fontSize: 7, color: "#6b7280", textTransform: "uppercase", fontWeight: "bold" },
  metaValue: { fontSize: 10, color: "#000000", fontWeight: "bold" },
  logo: { width: 100, height: 40, objectFit: "contain" },
  content: { flex: 1, width: "100%", backgroundColor: "#f9fafb", borderRadius: 8, borderWidth: 1, borderColor: "#e5e7eb", justifyContent: "center", alignItems: "center", overflow: "hidden" },
  snapshot: { width: "98%", height: "98%", objectFit: "contain" },
  noImageText: { color: "#9ca3af", fontStyle: "italic", alignSelf: "center", marginTop: 20 },
  footer: { position: "absolute", bottom: 20, left: 30, right: 30, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 5 },
  footerText: { fontSize: 7, color: "#9ca3af" }
});
const WhiteboardPDFDocument = ({ settings, pdfRenderImage, projectHeader }) => /* @__PURE__ */ jsxRuntimeExports.jsx(Document, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Page, { size: settings.format, orientation: settings.orientation, style: pdfStyles.page, children: [
  /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.safeArea, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: [pdfStyles.headerContainer, { borderBottomColor: settings.accentColor }], fixed: true, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.headerLeft, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Text$2, { style: [pdfStyles.title, { color: settings.accentColor }], children: "Whiteboard Skizze" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.metaGrid, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.metaBlock, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text$2, { style: pdfStyles.metaLabel, children: "Projekt:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text$2, { style: pdfStyles.metaValue, children: projectHeader.project })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.metaBlock, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text$2, { style: pdfStyles.metaLabel, children: "Datum:" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Text$2, { style: pdfStyles.metaValue, children: new Date(projectHeader.date).toLocaleDateString("de-CH") })
          ] })
        ] })
      ] }),
      settings.logo && /* @__PURE__ */ jsxRuntimeExports.jsx(Image$2, { src: settings.logo, style: pdfStyles.logo })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(View, { style: [pdfStyles.content, { borderColor: settings.accentColor }], children: pdfRenderImage ? /* @__PURE__ */ jsxRuntimeExports.jsx(Image$2, { src: pdfRenderImage, style: pdfStyles.snapshot }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Text$2, { style: pdfStyles.noImageText, children: "Keine Skizze vorhanden." }) })
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(View, { style: pdfStyles.footer, fixed: true, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text$2, { style: pdfStyles.footerText, children: settings.footerText }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text$2, { style: pdfStyles.footerText, render: ({ pageNumber, totalPages }) => `Seite ${pageNumber} von ${totalPages}` })
  ] })
] }) });
function Whiteboard({ projectId: propProjectId }) {
  const { id: routeProjectId } = useParams();
  const { currentUser } = useAuth();
  const { addToast } = useToast();
  const { language, t: globalT } = useLanguage();
  const { projects, activeProjectId } = useProject();
  const projectId = propProjectId || routeProjectId || activeProjectId;
  const activeProject = projects?.find((p) => p.id === projectId);
  const t = (key) => localTranslations[language][key] || globalT(key);
  const [mobileTab, setMobileTab] = reactExports.useState("whiteboard");
  const [tool, setTool] = reactExports.useState("pen");
  const [activeColor, setActiveColor] = reactExports.useState(wbCache.activeColor);
  const [selectedShapeId, setSelectedShapeId] = reactExports.useState(null);
  const [layers, setLayers] = reactExports.useState(wbCache.layers);
  const [activeLayerId, setActiveLayerId] = reactExports.useState(wbCache.activeLayerId);
  const [showLayersPanel, setShowLayersPanel] = reactExports.useState(false);
  const [stageScale, setStageScale] = reactExports.useState(wbCache.stageScale);
  const [stagePos, setStagePos] = reactExports.useState(wbCache.stagePos);
  const [bgImagePos, setBgImagePos] = reactExports.useState(wbCache.bgImagePos);
  const [bgImageSrc, setBgImageSrc] = reactExports.useState(wbCache.bgImageSrc);
  const [bgImage, setBgImage] = reactExports.useState(null);
  const isDrawing = reactExports.useRef(false);
  const [stageSize, setStageSize] = reactExports.useState({ width: 0, height: 0 });
  const containerRef = reactExports.useRef(null);
  const stageRef = reactExports.useRef(null);
  const lastDist = reactExports.useRef(null);
  const lastCenter = reactExports.useRef(null);
  const [isSending, setIsSending] = reactExports.useState(false);
  const [sendSuccess, setSendSuccess] = reactExports.useState(false);
  const [isSavingToCloud, setIsSavingToCloud] = reactExports.useState(false);
  const [isFullscreen, setIsFullscreen] = reactExports.useState(false);
  const [imageFilters, setImageFilters] = reactExports.useState({ brightness: 0, contrast: 0, saturation: 0 });
  const [showFilters, setShowFilters] = reactExports.useState(false);
  const imageNodeRef = reactExports.useRef(null);
  const fileInputRef = reactExports.useRef(null);
  const [currentPolygon, setCurrentPolygon] = reactExports.useState([]);
  const [isPdfStudioOpen, setIsPdfStudioOpen] = reactExports.useState(false);
  const [pdfRenderImage, setPdfRenderImage] = reactExports.useState(null);
  const [showAiRender, setShowAiRender] = reactExports.useState(false);
  const [renderPrompt, setRenderPrompt] = reactExports.useState("");
  const [isRendering, setIsRendering] = reactExports.useState(false);
  const [renderedImage, setRenderedImage] = reactExports.useState(null);
  const [sketchDataUrl, setSketchDataUrl] = reactExports.useState(null);
  const [isRecording, setIsRecording] = reactExports.useState(false);
  const [recordingTime, setRecordingTime] = reactExports.useState(0);
  const timerRef = reactExports.useRef(null);
  const mediaRecorderRef = reactExports.useRef(null);
  const audioChunksRef = reactExports.useRef([]);
  const [audioNotes, setAudioNotes] = reactExports.useState([]);
  const [activeNoteId, setActiveNoteId] = reactExports.useState(null);
  const [isAnalyzingAudio, setIsAnalyzingAudio] = reactExports.useState(false);
  const canvasBgColor = "#ffffff";
  const addItemToActiveLayer = (item) => {
    setLayers((prev) => prev.map((layer) => {
      if (layer.id === activeLayerId) return { ...layer, items: [...layer.items, item] };
      return layer;
    }));
  };
  const updateLastItemInActiveLayer = (updateFn) => {
    setLayers((prev) => prev.map((layer) => {
      if (layer.id === activeLayerId && layer.items.length > 0) {
        const newItems = [...layer.items];
        newItems[newItems.length - 1] = updateFn(newItems[newItems.length - 1]);
        return { ...layer, items: newItems };
      }
      return layer;
    }));
  };
  const updateItemById = (itemId, updateFn) => {
    setLayers((prev) => prev.map((layer) => {
      const itemIndex = layer.items.findIndex((i) => i.id === itemId);
      if (itemIndex > -1) {
        const newItems = [...layer.items];
        newItems[itemIndex] = updateFn(newItems[itemIndex]);
        return { ...layer, items: newItems };
      }
      return layer;
    }));
  };
  reactExports.useEffect(() => {
    wbCache = { layers, activeLayerId, bgImageSrc, bgImagePos, stageScale, stagePos, activeColor };
  }, [layers, activeLayerId, bgImageSrc, bgImagePos, stageScale, stagePos, activeColor]);
  reactExports.useEffect(() => {
    if (bgImageSrc) {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.src = bgImageSrc;
      img.onload = () => setBgImage(img);
    } else {
      setBgImage(null);
    }
  }, [bgImageSrc]);
  reactExports.useEffect(() => {
    if (currentUser && currentUser.companyId && db) {
      const q = query(collection(db, "audioNotes"), where("companyId", "==", currentUser.companyId), where("ownerId", "==", currentUser.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const notes = snapshot.docs.map((doc2) => doc2.data()).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setAudioNotes(notes);
      });
      return () => unsubscribe();
    }
  }, [currentUser]);
  reactExports.useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) containerRef.current?.requestFullscreen().catch((err) => console.error(err));
    else document.exitFullscreen();
  };
  reactExports.useEffect(() => {
    const checkSize = () => {
      if (containerRef.current) setStageSize({ width: containerRef.current.offsetWidth, height: containerRef.current.offsetHeight });
    };
    checkSize();
    const timeout = setTimeout(checkSize, 50);
    const observer = new ResizeObserver(checkSize);
    if (containerRef.current) observer.observe(containerRef.current);
    window.addEventListener("resize", checkSize);
    return () => {
      window.removeEventListener("resize", checkSize);
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [mobileTab]);
  reactExports.useEffect(() => {
    if (bgImage && imageNodeRef.current) imageNodeRef.current.cache();
  }, [bgImage, imageFilters]);
  const [textPrompt, setTextPrompt] = reactExports.useState(null);
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBgImageSrc(reader.result);
    };
    reader.readAsDataURL(file);
  };
  const getDistance = (p1, p2) => Math.sqrt(Math.pow(p2.clientX - p1.clientX, 2) + Math.pow(p2.clientY - p1.clientY, 2));
  const getCenter = (p1, p2) => ({ x: (p1.clientX + p2.clientX) / 2, y: (p1.clientY + p2.clientY) / 2 });
  const handleTouchStart = (e) => {
    if (e.evt.touches && e.evt.touches.length >= 2) {
      e.evt.preventDefault();
      isDrawing.current = false;
      const t1 = e.evt.touches[0];
      const t2 = e.evt.touches[1];
      lastDist.current = getDistance(t1, t2);
      lastCenter.current = getCenter(t1, t2);
      return;
    }
    handleMouseDown(e);
  };
  const handleTouchMove = (e) => {
    if (e.evt.touches && e.evt.touches.length >= 2) {
      e.evt.preventDefault();
      const t1 = e.evt.touches[0];
      const t2 = e.evt.touches[1];
      const dist = getDistance(t1, t2);
      const center = getCenter(t1, t2);
      if (lastDist.current !== null && lastCenter.current !== null && stageRef.current) {
        const stage = stageRef.current;
        const oldScale = stage.scaleX();
        const oldPos = stage.position();
        const scaleBy = dist / lastDist.current;
        const newScale = Math.min(Math.max(oldScale * scaleBy, 0.1), 10);
        const dx = center.x - lastCenter.current.x;
        const dy = center.y - lastCenter.current.y;
        const pointTo = { x: (center.x - oldPos.x) / oldScale, y: (center.y - oldPos.y) / oldScale };
        const newPos = { x: center.x - pointTo.x * newScale + dx, y: center.y - pointTo.y * newScale + dy };
        stage.scale({ x: newScale, y: newScale });
        stage.position(newPos);
        stage.batchDraw();
        setStageScale(newScale);
        setStagePos(newPos);
      }
      lastDist.current = dist;
      lastCenter.current = center;
      return;
    }
    if (isDrawing.current) {
      handleMouseMove(e);
    }
  };
  const handleTouchEnd = (e) => {
    lastDist.current = null;
    lastCenter.current = null;
    handleMouseUp();
  };
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const mousePointTo = { x: (pointer.x - stage.x()) / oldScale, y: (pointer.y - stage.y()) / oldScale };
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    if (newScale < 0.1 || newScale > 10) return;
    setStageScale(newScale);
    setStagePos({ x: pointer.x - mousePointTo.x * newScale, y: pointer.y - mousePointTo.y * newScale });
  };
  const handleZoomButton = (scaleMultiplier) => {
    const oldScale = stageScale;
    const newScale = oldScale * scaleMultiplier;
    if (newScale < 0.1 || newScale > 10) return;
    const center = { x: stageSize.width / 2, y: stageSize.height / 2 };
    const relatedTo = { x: (center.x - stagePos.x) / oldScale, y: (center.y - stagePos.y) / oldScale };
    setStageScale(newScale);
    setStagePos({ x: center.x - relatedTo.x * newScale, y: center.y - relatedTo.y * newScale });
  };
  const handleMouseDown = (e) => {
    if (e.target === e.target.getStage() || e.target.name() === "background-rect") setSelectedShapeId(null);
    if (tool === "select" || tool === "pan") return;
    const activeLayer = layers.find((l) => l.id === activeLayerId);
    if (!activeLayer || !activeLayer.visible) {
      addToast("Bitte eine sichtbare Ebene auswählen.", "info");
      return;
    }
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const pos = { x: (pointer.x - stage.x()) / stage.scaleX(), y: (pointer.y - stage.y()) / stage.scaleY() };
    if (tool === "polygon") {
      if (currentPolygon.length > 2) {
        const dist = Math.hypot(pos.x - currentPolygon[0], pos.y - currentPolygon[1]);
        if (dist < 15 / stageScale) {
          finishPolygon();
          return;
        }
      }
      if (currentPolygon.length === 0) setCurrentPolygon([pos.x, pos.y, pos.x, pos.y]);
      else setCurrentPolygon([...currentPolygon, pos.x, pos.y]);
      return;
    }
    isDrawing.current = true;
    const id = Date.now().toString();
    if (tool === "pen" || tool === "eraser") addItemToActiveLayer({ type: "line", tool, points: [pos.x, pos.y], id, x: 0, y: 0, color: tool === "eraser" ? canvasBgColor : activeColor });
    else if (tool === "rect") addItemToActiveLayer({ type: "rect", x: pos.x, y: pos.y, width: 0, height: 0, id, color: activeColor });
    else if (tool === "circle") addItemToActiveLayer({ type: "circle", x: pos.x, y: pos.y, radius: 0, id, color: activeColor });
    else if (tool === "text") {
      setTextPrompt({ isOpen: true, x: pos.x, y: pos.y, value: "" });
      isDrawing.current = false;
    }
  };
  const handleMouseMove = (e) => {
    if (tool === "select" || tool === "pan") return;
    const stage = e.target.getStage();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    const point = { x: (pointer.x - stage.x()) / stage.scaleX(), y: (pointer.y - stage.y()) / stage.scaleY() };
    if (tool === "polygon" && currentPolygon.length > 0) {
      const newPoly = [...currentPolygon];
      newPoly[newPoly.length - 2] = point.x;
      newPoly[newPoly.length - 1] = point.y;
      setCurrentPolygon(newPoly);
      return;
    }
    if (!isDrawing.current) return;
    if (tool === "pen" || tool === "eraser") updateLastItemInActiveLayer((item) => ({ ...item, points: item.points.concat([point.x, point.y]) }));
    else if (tool === "rect") updateLastItemInActiveLayer((item) => ({ ...item, width: point.x - item.x, height: point.y - item.y }));
    else if (tool === "circle") updateLastItemInActiveLayer((item) => ({ ...item, radius: Math.sqrt(Math.pow(point.x - item.x, 2) + Math.pow(point.y - item.y, 2)) }));
  };
  const handleMouseUp = () => isDrawing.current = false;
  const finishPolygon = () => {
    if (currentPolygon.length > 4) {
      const finalPoly = currentPolygon.slice(0, -2);
      const newId = Date.now().toString();
      addItemToActiveLayer({ type: "polygon", points: finalPoly, id: newId, x: 0, y: 0, color: activeColor });
      setSelectedShapeId(newId);
    }
    setCurrentPolygon([]);
    setTool("select");
  };
  const handleTextSubmit = (e) => {
    e.preventDefault();
    if (textPrompt && textPrompt.value) addItemToActiveLayer({ type: "text", x: textPrompt.x, y: textPrompt.y, text: textPrompt.value, id: Date.now().toString(), color: activeColor });
    setTextPrompt(null);
    setTool("select");
  };
  const clearBoard = () => {
    if (window.confirm(t("clear_canvas"))) {
      setLayers([{ id: "layer-1", name: t("base_layer"), visible: true, items: [] }]);
      setActiveLayerId("layer-1");
      setBgImageSrc(null);
      setBgImage(null);
      setCurrentPolygon([]);
      setTool("pen");
      setStageScale(1);
      setStagePos({ x: 0, y: 0 });
      setSelectedShapeId(null);
    }
  };
  const handleAddLayer = () => {
    const newId = `layer-${Date.now()}`;
    setLayers([...layers, { id: newId, name: `${t("layers")} ${layers.length + 1}`, visible: true, items: [] }]);
    setActiveLayerId(newId);
  };
  const toggleLayerVisibility = (id) => setLayers((prev) => prev.map((l) => l.id === id ? { ...l, visible: !l.visible } : l));
  const deleteLayer = (id) => {
    if (layers.length <= 1) return addToast("Die letzte Ebene kann nicht gelöscht werden.", "info");
    if (window.confirm("Ebene inkl. aller Inhalte löschen?")) {
      const newLayers = layers.filter((l) => l.id !== id);
      setLayers(newLayers);
      if (activeLayerId === id) setActiveLayerId(newLayers[newLayers.length - 1].id);
    }
  };
  const getCanvasDataUrl = (scale, mimeType = "image/png") => {
    if (!stageRef.current) return null;
    const bgRect = stageRef.current.findOne(".background-rect");
    if (bgRect) {
      bgRect.fill(canvasBgColor);
      stageRef.current.draw();
    }
    const dataUrl = stageRef.current.toDataURL({ pixelRatio: scale, mimeType });
    if (bgRect) {
      bgRect.fill("transparent");
      stageRef.current.draw();
    }
    return dataUrl;
  };
  const openAiRenderStudio = () => {
    setSelectedShapeId(null);
    setTimeout(() => {
      if (stageRef.current) {
        const safeScale = Math.min(1, 800 / stageRef.current.width());
        const dataUrl = getCanvasDataUrl(safeScale, "image/png");
        if (dataUrl) setSketchDataUrl(dataUrl);
      }
      setShowAiRender(true);
    }, 100);
  };
  const executeAiRender = async () => {
    if (!renderPrompt.trim()) return addToast("Bitte Prompt eingeben.", "info");
    setIsRendering(true);
    try {
      const base64Data = sketchDataUrl ? sketchDataUrl.split(",")[1] : "";
      if (!base64Data) throw new Error("No image data available");
      const prompt = `Transform this hand-drawn sketch into a high-quality rendering. Follow this user instruction exactly: "${renderPrompt}". Do not limit yourself to architecture. Render characters, products, scenes, or comics exactly as requested by the user, matching the shape and flow of the sketch.`;
      const response = await callGeminiAPI("gemini-2.5-flash-image", [{ inlineData: { data: base64Data, mimeType: "image/png" } }, { text: prompt }]);
      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          setRenderedImage(`data:image/png;base64,${part.inlineData.data}`);
          foundImage = true;
          break;
        }
      }
      if (foundImage) {
        addToast("Design erfolgreich generiert!", "success");
      } else {
        throw new Error("No valid image data returned from API.");
      }
    } catch (error) {
      console.error("AI Render API Error:", error);
      addToast("Fehler bei der Bildgenerierung.", "error");
      setRenderedImage("https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=2000&q=80");
    } finally {
      setIsRendering(false);
    }
  };
  const addRenderToCanvas = () => {
    if (renderedImage) {
      setBgImageSrc(renderedImage);
      setStageScale(1);
      setStagePos({ x: 0, y: 0 });
      setShowAiRender(false);
      setRenderedImage(null);
      setRenderPrompt("");
      addToast("Rendering als Basis-Ebene eingefügt.", "success");
    }
  };
  const ensureFolder = async (folderName, docCategory) => {
    if (!currentUser || !currentUser.companyId) return "";
    const currentProjectId = activeProject?.id || "global";
    const folderQ = query(collection(db, "documents"), where("companyId", "==", currentUser.companyId), where("name", "==", folderName), where("isFolder", "==", true), where("projectId", "==", currentProjectId));
    const folderSnap = await getDocs(folderQ);
    if (!folderSnap.empty) return folderSnap.docs[0].id;
    const newFolderRef = await addDoc(collection(db, "documents"), { name: folderName, isFolder: true, category: docCategory, ownerId: currentUser.uid, companyId: currentUser.companyId, projectId: currentProjectId, createdAt: (/* @__PURE__ */ new Date()).toISOString() });
    return newFolderRef.id;
  };
  const handleSavePdfToCloud = async (blob) => {
    if (!currentUser || !currentUser.companyId) return;
    try {
      const fileName = `Whiteboard_${(activeProject?.name || "Unbenannt").replace(/\.[^/.]+$/, "")}_${Date.now()}.pdf`;
      const storageRef = ref(storage, `documents/${currentUser.uid}/${fileName}`);
      await uploadBytes(storageRef, blob);
      const downloadUrl = await getDownloadURL(storageRef);
      const docCategory = activeProject?.id === "global" ? "company" : "projects";
      const targetFolderId = await ensureFolder("Whiteboards", docCategory);
      await addDoc(collection(db, "documents"), {
        name: fileName,
        url: downloadUrl,
        fileUrl: downloadUrl,
        projectId: activeProject?.id || null,
        folderId: targetFolderId,
        category: docCategory,
        ownerId: currentUser.uid,
        companyId: currentUser.companyId,
        uploadedBy: currentUser.uid,
        type: "application/pdf",
        size: formatBytes(blob.size),
        isFolder: false,
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
        date: (/* @__PURE__ */ new Date()).toLocaleDateString("de-CH")
      });
      addToast(t("saved_cloud"), "success");
      setIsPdfStudioOpen(false);
    } catch (error) {
      console.error(error);
      addToast("Fehler beim Speichern in der Cloud.", "error");
    }
  };
  const handleSaveToCloud = async () => {
    if (!stageRef.current || !currentUser || !currentUser.companyId || !db) return;
    setIsSavingToCloud(true);
    setSelectedShapeId(null);
    try {
      setTimeout(async () => {
        try {
          const dataUrl = getCanvasDataUrl(1.5, "image/png");
          if (!dataUrl) throw new Error("Konnte Bild nicht erstellen");
          const fileName = `Whiteboard_Skizze_${(/* @__PURE__ */ new Date()).getTime()}.png`;
          const storageReference = ref(storage, `documents/${currentUser.uid}/${fileName}`);
          const fetchRes = await fetch(dataUrl);
          const blob = await fetchRes.blob();
          await uploadBytes(storageReference, blob);
          const downloadUrl = await getDownloadURL(storageReference);
          let targetFolderId = "";
          if (projectId) {
            try {
              const folderQ = query(collection(db, "documents"), where("companyId", "==", currentUser.companyId), where("name", "==", `Projekt: ${activeProject?.name || "Unbenannt"}`), where("isFolder", "==", true));
              const folderSnap = await getDocs(folderQ);
              if (!folderSnap.empty) {
                targetFolderId = folderSnap.docs[0].id;
              }
            } catch (e) {
              console.error(e);
            }
          }
          await addDoc(collection(db, "documents"), {
            name: fileName,
            url: downloadUrl,
            // Der Link zum Cloud Storage
            fileUrl: downloadUrl,
            size: formatBytes(blob.size),
            type: "image/png",
            ownerId: currentUser.uid,
            companyId: currentUser.companyId,
            createdAt: (/* @__PURE__ */ new Date()).toISOString(),
            uploadedAt: (/* @__PURE__ */ new Date()).toISOString(),
            isFolder: false,
            projectId: projectId || null,
            folderId: targetFolderId || null,
            category: "projects"
          });
          setIsSavingToCloud(false);
          addToast(t("saved_cloud"), "success");
        } catch (error) {
          setIsSavingToCloud(false);
          addToast(globalT("error") || "Error", "error");
        }
      }, 100);
    } catch (err) {
      setIsSavingToCloud(false);
      addToast(globalT("error") || "Error", "error");
    }
  };
  const handleExportImage = () => {
    if (stageRef.current) {
      setSelectedShapeId(null);
      setTimeout(() => {
        const uri = getCanvasDataUrl(2, "image/jpeg");
        if (!uri) return;
        const link = document.createElement("a");
        link.download = "Whiteboard_Export.jpg";
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        addToast(t("pdf_success") || "Exportiert!", "success");
      }, 50);
    }
  };
  const executePdfExport = () => {
    if (!stageRef.current) return;
    setSelectedShapeId(null);
    setTimeout(() => {
      try {
        const uri = getCanvasDataUrl(2, "image/jpeg");
        if (!uri) return;
        setPdfRenderImage(uri);
        setIsPdfStudioOpen(true);
      } catch (e) {
        addToast(globalT("error"), "error");
      }
    }, 50);
  };
  const handleSendToSlides = async () => {
    if (!stageRef.current || !currentUser || !currentUser.companyId || !db) return;
    setIsSending(true);
    setSendSuccess(false);
    setSelectedShapeId(null);
    try {
      setTimeout(async () => {
        const uri = getCanvasDataUrl(2, "image/jpeg");
        if (!uri) return;
        const fileName = `PitchDeck_Slide_${Date.now()}.jpg`;
        const storageReference = ref(storage, `whiteboardExports/${currentUser.uid}/${fileName}`);
        const fetchRes = await fetch(uri);
        const blob = await fetchRes.blob();
        await uploadBytes(storageReference, blob);
        const downloadUrl = await getDownloadURL(storageReference);
        const id = `wb-${Date.now()}`;
        await setDoc(doc(db, "whiteboardExports", id), {
          id,
          imageUrl: downloadUrl,
          // Der Link, nicht der String!
          ownerId: currentUser.uid,
          companyId: currentUser.companyId,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        setIsSending(false);
        setSendSuccess(true);
        setTimeout(() => setSendSuccess(false), 3e3);
      }, 50);
    } catch (err) {
      setIsSending(false);
      addToast(globalT("error"), "error");
    }
  };
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime((prev) => prev + 1), 1e3);
    } catch (err) {
      addToast(t("mic_error"), "error");
    }
  };
  const stopRecording = async () => {
    if (!mediaRecorderRef.current || !currentUser || !currentUser.companyId) return;
    return new Promise((resolve) => {
      mediaRecorderRef.current.onstop = async () => {
        setIsRecording(false);
        if (timerRef.current) clearInterval(timerRef.current);
        setIsAnalyzingAudio(true);
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            try {
              const base64Audio = reader.result.split(",")[1];
              const prompt = language === "de" ? `Transkribiere exakt. Erstelle Zusammenfassung (max 2 Sätze). Format JSON: { "transcription": "...", "summary": "..." }` : `Transcribe exactly. Provide summary (max 2 sentences). Format JSON: { "transcription": "...", "summary": "..." }`;
              const response = await callGeminiAPI("gemini-1.5-pro", [{ inlineData: { data: base64Audio, mimeType: "audio/webm" } }, { text: prompt }]);
              let resultText = response.text || "{}";
              const jsonRegex = new RegExp("`{3}json", "g");
              const backtickRegex = new RegExp("`{3}", "g");
              resultText = resultText.replace(jsonRegex, "").replace(backtickRegex, "").trim();
              const result = JSON.parse(resultText);
              const id = `an-${Date.now()}`;
              await setDoc(doc(db, "audioNotes", id), {
                id,
                title: `Field Note ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`,
                time: "Gerade eben",
                duration: `0:${recordingTime.toString().padStart(2, "0")}`,
                aiSummary: result.summary || "Summary failed.",
                transcription: result.transcription || "Transcription failed.",
                audioData: base64Audio,
                ownerId: currentUser.uid,
                companyId: currentUser.companyId,
                createdAt: (/* @__PURE__ */ new Date()).toISOString()
              });
              setActiveNoteId(id);
              resolve();
            } catch (error) {
              addToast(t("ai_error"), "error");
              resolve();
            } finally {
              setIsAnalyzingAudio(false);
              setRecordingTime(0);
              mediaRecorderRef.current?.stream.getTracks().forEach((track) => track.stop());
            }
          };
        } catch (error) {
          setIsAnalyzingAudio(false);
          resolve();
        }
      };
      mediaRecorderRef.current.stop();
    });
  };
  const handleDeleteNote = async (e, noteId) => {
    e.stopPropagation();
    if (window.confirm(t("confirm_delete_note"))) {
      try {
        await deleteDoc(doc(db, "audioNotes", noteId));
        if (activeNoteId === noteId) setActiveNoteId(null);
        addToast(t("note_deleted"), "success");
      } catch (err) {
        addToast(globalT("error"), "error");
      }
    }
  };
  const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 }, className: "flex-1 w-full h-full min-h-0 flex flex-col bg-background text-text-primary overflow-hidden", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-row items-center justify-between gap-4 shrink-0 p-4 md:p-6 border-b border-border/50 bg-surface/50 w-full overflow-hidden flex-wrap", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "shrink-0 flex flex-col min-w-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl md:text-2xl font-semibold tracking-tight truncate", children: t("title") }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-text-muted text-sm mt-1 hidden sm:block truncate", children: t("desc") })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-2 shrink-0", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: openAiRenderStudio, className: "px-3 md:px-4 py-2 bg-accent-ai/10 text-accent-ai border border-accent-ai/20 rounded-md text-sm font-bold hover:bg-accent-ai/20 transition-colors flex items-center gap-2 shadow-sm", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(WandSparkles, { size: 16 }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden md:inline", children: t("ai_render") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-6 bg-border mx-1 hidden sm:block" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleSaveToCloud, disabled: isSavingToCloud, className: "px-3 md:px-4 py-2 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-md text-sm font-bold hover:bg-blue-500/20 transition-colors flex items-center gap-2 disabled:opacity-50", children: [
            isSavingToCloud ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Cloud, { size: 16 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden md:inline", children: isSavingToCloud ? t("saving_cloud") : t("save_cloud") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-6 bg-border mx-1 hidden sm:block" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "file", ref: fileInputRef, accept: "image/*,application/pdf", onChange: handleImageUpload, className: "hidden" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => fileInputRef.current?.click(), className: "px-3 md:px-4 py-2 bg-surface border border-border rounded-md text-sm font-bold hover:bg-white/5 transition-colors flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(CloudUpload, { size: 16 }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden md:inline", children: t("import_media") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: executePdfExport, className: "hidden md:flex px-3 md:px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md text-sm font-bold hover:bg-red-500/20 transition-colors items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(FileDown, { size: 16 }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden md:inline", children: "PDF Studio" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleExportImage, className: "hidden md:flex px-3 md:px-4 py-2 bg-surface border border-border rounded-md text-sm font-bold hover:bg-white/5 transition-colors items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { size: 16 }),
            " ",
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden md:inline", children: t("export_img") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-6 bg-border mx-1 hidden lg:block" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: handleSendToSlides, disabled: isSending || sendSuccess, className: cn("px-3 md:px-4 py-2 border rounded-md text-sm font-bold transition-colors flex items-center gap-2 disabled:opacity-80", sendSuccess ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500" : "bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20"), children: [
            isSending ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 16, className: "animate-spin" }) : sendSuccess ? /* @__PURE__ */ jsxRuntimeExports.jsx(CircleCheck, { size: 16 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 16 }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden lg:inline", children: isSending ? t("sending") : sendSuccess ? t("sent") : t("send_slides") })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex lg:hidden bg-surface border-b border-border/50 p-1 shrink-0 shadow-sm", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setMobileTab("whiteboard"), className: cn("flex-1 py-2.5 text-sm font-bold rounded-md transition-colors flex justify-center items-center gap-2", mobileTab === "whiteboard" ? "bg-background text-text-primary shadow-sm border border-border/50" : "text-text-muted hover:text-text-primary"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(PenTool, { size: 16 }),
          " Skizze"
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: () => setMobileTab("audio"), className: cn("flex-1 py-2.5 text-sm font-bold rounded-md transition-colors flex justify-center items-center gap-2", mobileTab === "audio" ? "bg-background text-text-primary shadow-sm border border-border/50" : "text-text-muted hover:text-text-primary"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { size: 16 }),
          " Audio Hub"
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col lg:flex-row min-h-0 h-full overflow-hidden", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("flex-1 relative overflow-hidden flex-col bg-[#f9fafb] dark:bg-[#09090b]", mobileTab === "whiteboard" ? "flex h-full" : "hidden lg:flex h-full"), ref: containerRef, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-4 md:top-4 md:bottom-auto left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-xl border border-border rounded-xl p-1.5 flex items-center gap-1 z-20 shadow-2xl overflow-x-auto w-max max-w-[calc(100%-2rem)] custom-scrollbar", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-1 px-1.5 border-r border-border mr-1 shrink-0", children: AVAILABLE_COLORS.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setActiveColor(c), className: cn("w-4 h-4 md:w-5 md:h-5 rounded-full border-2 transition-all shrink-0", activeColor === c ? "border-text-primary scale-110" : "border-transparent hover:scale-110"), style: { backgroundColor: c }, title: "Farbe wählen" }, c)) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTool("pan"), className: cn("p-1.5 md:p-2 rounded-lg transition-all shrink-0", tool === "pan" ? "bg-accent-ai text-white shadow-lg" : "text-text-muted hover:bg-white/5"), title: t("tool_pan"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Hand, { size: 16 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTool("select"), className: cn("p-1.5 md:p-2 rounded-lg transition-all shrink-0", tool === "select" ? "bg-accent-ai text-white shadow-lg" : "text-text-muted hover:bg-white/5"), title: t("tool_select"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(MousePointer2, { size: 16 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-5 bg-border mx-1 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTool("pen"), className: cn("p-1.5 md:p-2 rounded-lg transition-all shrink-0", tool === "pen" ? "bg-accent-ai text-white shadow-lg" : "text-text-muted hover:bg-white/5"), title: "Stift", children: /* @__PURE__ */ jsxRuntimeExports.jsx(PenTool, { size: 16 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTool("eraser"), className: cn("p-1.5 md:p-2 rounded-lg transition-all shrink-0", tool === "eraser" ? "bg-accent-ai text-white shadow-lg" : "text-text-muted hover:bg-white/5"), title: "Radierer", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Eraser, { size: 16 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-5 bg-border mx-1 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTool("polygon"), className: cn("p-1.5 md:p-2 rounded-lg transition-all shrink-0", tool === "polygon" ? "bg-accent-ai text-white shadow-lg" : "text-text-muted hover:bg-white/5"), title: t("draw_polygon"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Hexagon, { size: 16 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTool("rect"), className: cn("p-1.5 md:p-2 rounded-lg transition-all shrink-0", tool === "rect" ? "bg-accent-ai text-white shadow-lg" : "text-text-muted hover:bg-white/5"), title: "Rechteck", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { size: 16 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTool("circle"), className: cn("p-1.5 md:p-2 rounded-lg transition-all shrink-0", tool === "circle" ? "bg-accent-ai text-white shadow-lg" : "text-text-muted hover:bg-white/5"), title: "Kreis", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Circle$2, { size: 16 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTool("text"), className: cn("p-1.5 md:p-2 rounded-lg transition-all shrink-0", tool === "text" ? "bg-accent-ai text-white shadow-lg" : "text-text-muted hover:bg-white/5"), title: "Text", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Type, { size: 16 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-5 bg-border mx-1 shrink-0 hidden sm:block" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowFilters(!showFilters), className: cn("p-1.5 md:p-2 rounded-lg transition-all shrink-0 hidden sm:block", showFilters ? "bg-blue-500/20 text-blue-400" : "text-text-muted hover:bg-white/5"), title: t("img_adjust"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersHorizontal, { size: 16 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-5 bg-border mx-1 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: clearBoard, className: "p-1.5 md:p-2 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors text-[10px] md:text-xs font-bold uppercase tracking-wider shrink-0", children: globalT("delete") })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-16 md:top-auto md:bottom-4 left-4 bg-background/90 backdrop-blur-md border border-border rounded-lg p-1.5 flex items-center gap-1 z-20 shadow-lg", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleZoomButton(1 / 1.2), className: "p-1.5 text-text-muted hover:text-text-primary transition-colors hover:bg-white/5 rounded-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ZoomOut, { size: 14 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] md:text-xs font-bold w-10 md:w-12 text-center text-text-primary select-none", children: [
              Math.round(stageScale * 100),
              "%"
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleZoomButton(1.2), className: "p-1.5 text-text-muted hover:text-text-primary transition-colors hover:bg-white/5 rounded-md", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ZoomIn, { size: 14 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-px h-4 bg-border mx-1 shrink-0" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
              setStageScale(1);
              setStagePos({ x: 0, y: 0 });
            }, className: "p-1.5 text-text-muted hover:text-text-primary transition-colors hover:bg-white/5 rounded-md", title: t("reset_zoom"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Focus, { size: 14 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: toggleFullscreen, className: "p-1.5 text-text-muted hover:text-text-primary transition-colors hover:bg-white/5 rounded-md", title: isFullscreen ? t("exit_fullscreen") : t("fullscreen"), children: isFullscreen ? /* @__PURE__ */ jsxRuntimeExports.jsx(Minimize, { size: 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize, { size: 14 }) })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-16 md:top-auto md:bottom-4 right-4 z-20", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowLayersPanel(!showLayersPanel), className: cn("p-2.5 md:p-3 rounded-full shadow-lg transition-all border", showLayersPanel ? "bg-accent-ai text-white border-accent-ai" : "bg-background/90 backdrop-blur-md text-text-primary border-border hover:bg-surface"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { size: 18 }) }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showLayersPanel && /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, y: 10, scale: 0.95 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: 10, scale: 0.95 }, className: "absolute top-12 md:top-auto md:bottom-14 right-0 w-56 md:w-64 bg-background/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-3 border-b border-border/50 flex justify-between items-center bg-surface/50", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-[10px] md:text-xs font-bold uppercase tracking-widest", children: t("layers") }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: handleAddLayer, className: "p-1.5 bg-accent-ai/10 text-accent-ai hover:bg-accent-ai/20 rounded-md transition-colors", title: t("add_layer"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { size: 14 }) })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 max-h-64 overflow-y-auto custom-scrollbar p-2 space-y-1", children: [...layers].reverse().map((layer) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => setActiveLayerId(layer.id), className: cn("flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors border", activeLayerId === layer.id ? "bg-accent-ai/10 border-accent-ai/30" : "bg-surface border-transparent hover:border-border"), children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-1 min-w-0", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                    e.stopPropagation();
                    toggleLayerVisibility(layer.id);
                  }, className: "text-text-muted hover:text-text-primary", children: layer.visible ? /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { size: 14 }) : /* @__PURE__ */ jsxRuntimeExports.jsx(EyeOff, { size: 14, className: "opacity-50" }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: cn("text-[10px] md:text-xs font-bold truncate", activeLayerId === layer.id ? "text-accent-ai" : "text-text-primary", !layer.visible && "opacity-50"), children: layer.name })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => {
                  e.stopPropagation();
                  deleteLayer(layer.id);
                }, className: "text-text-muted hover:text-red-500 opacity-0 hover:opacity-100 transition-opacity ml-2", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 12 }) })
              ] }, layer.id)) })
            ] }) })
          ] }),
          tool === "polygon" && currentPolygon.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-20 md:top-24 left-1/2 -translate-x-1/2 z-20 bg-accent-ai text-white px-4 md:px-6 py-2 md:py-3 rounded-full shadow-2xl flex items-center gap-3 md:gap-4 animate-in slide-in-from-top-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs md:text-sm font-bold tracking-wide", children: t("click_points") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: finishPolygon, className: "bg-white/20 hover:bg-white/30 text-white px-2 md:px-3 py-1.5 rounded-md text-[10px] md:text-xs font-bold transition-colors", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { size: 14 }),
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:inline", children: t("close_shape") })
            ] })
          ] }),
          showFilters && bgImage && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute top-20 left-4 w-56 md:w-64 bg-background/95 backdrop-blur-xl border border-border rounded-2xl p-4 md:p-5 shadow-2xl z-20 animate-in slide-in-from-left-4", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-4 border-b border-border/50 pb-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("h4", { className: "text-xs md:text-sm font-bold flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(SlidersHorizontal, { size: 14, className: "text-accent-ai" }),
                " ",
                t("img_adjust")
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowFilters(false), className: "text-text-muted hover:text-text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 14 }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("brightness") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: imageFilters.brightness })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", min: "-1", max: "1", step: "0.05", value: imageFilters.brightness, onChange: (e) => setImageFilters({ ...imageFilters, brightness: parseFloat(e.target.value) }), className: "w-full accent-accent-ai" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("contrast") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: imageFilters.contrast })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", min: "-100", max: "100", step: "5", value: imageFilters.contrast, onChange: (e) => setImageFilters({ ...imageFilters, contrast: parseFloat(e.target.value) }), className: "w-full accent-accent-ai" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "text-[10px] font-bold text-text-muted uppercase tracking-widest mb-2 flex justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: t("saturation") }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: imageFilters.saturation })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "range", min: "-2", max: "2", step: "0.1", value: imageFilters.saturation, onChange: (e) => setImageFilters({ ...imageFilters, saturation: parseFloat(e.target.value) }), className: "w-full accent-accent-ai" })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setImageFilters({ brightness: 0, contrast: 0, saturation: 0 }), className: "w-full mt-2 py-1.5 md:py-2 bg-surface border border-border rounded-lg text-[10px] md:text-xs font-bold hover:bg-white/5 transition-colors", children: "Reset" })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 relative w-full h-full overflow-hidden bg-white", style: { cursor: tool === "pan" ? "grab" : tool === "select" ? "default" : "crosshair", touchAction: "none" }, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-[radial-gradient(#e5e5e5_1px,transparent_1px)] bg-[size:30px_30px] opacity-100 pointer-events-none" }),
            stageSize.width > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs(
              Stage,
              {
                width: stageSize.width,
                height: stageSize.height,
                ref: stageRef,
                onMouseDown: handleMouseDown,
                onMousemove: handleMouseMove,
                onMouseup: handleMouseUp,
                onTouchStart: handleTouchStart,
                onTouchMove: handleTouchMove,
                onTouchEnd: handleTouchEnd,
                onWheel: handleWheel,
                scaleX: stageScale,
                scaleY: stageScale,
                x: stagePos.x,
                y: stagePos.y,
                draggable: tool === "pan",
                onDragEnd: (e) => {
                  if (e.target === stageRef.current) setStagePos({ x: e.target.x(), y: e.target.y() });
                },
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(Layer, { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Rect, { className: "background-rect", name: "background-rect", x: -stagePos.x / stageScale, y: -stagePos.y / stageScale, width: stageSize.width / stageScale, height: stageSize.height / stageScale, fill: "transparent" }),
                    bgImage && /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { image: bgImage, ref: imageNodeRef, x: bgImagePos.x, y: bgImagePos.y, draggable: tool === "select", onDragEnd: (e) => {
                      e.cancelBubble = true;
                      setBgImagePos({ x: e.target.x(), y: e.target.y() });
                    }, filters: [Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.HSL], brightness: imageFilters.brightness, contrast: imageFilters.contrast, luminance: imageFilters.saturation })
                  ] }),
                  layers.map((layer) => layer.visible && /* @__PURE__ */ jsxRuntimeExports.jsx(Layer, { children: layer.items.map((item, i) => {
                    if (item.type === "line") return /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { points: item.points, x: item.x || 0, y: item.y || 0, stroke: item.color, strokeWidth: item.tool === "eraser" ? 20 / stageScale : 3 / stageScale, tension: 0.5, lineCap: "round", lineJoin: "round", globalCompositeOperation: item.tool === "eraser" ? "destination-out" : "source-over", draggable: tool === "select", onClick: () => tool === "select" && setSelectedShapeId(item.id), onDragEnd: (e) => {
                      e.cancelBubble = true;
                      updateItemById(item.id, (old) => ({ ...old, x: e.target.x(), y: e.target.y() }));
                    } }, item.id || i);
                    if (item.type === "rect") return /* @__PURE__ */ jsxRuntimeExports.jsx(Rect, { x: item.x, y: item.y, width: item.width, height: item.height, stroke: item.color, strokeWidth: 3 / stageScale, fill: `${item.color}33`, draggable: tool === "select", onClick: () => tool === "select" && setSelectedShapeId(item.id), onDragEnd: (e) => {
                      e.cancelBubble = true;
                      updateItemById(item.id, (old) => ({ ...old, x: e.target.x(), y: e.target.y() }));
                    } }, item.id || i);
                    if (item.type === "circle") return /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { x: item.x, y: item.y, radius: item.radius, stroke: item.color, strokeWidth: 3 / stageScale, fill: `${item.color}33`, draggable: tool === "select", onClick: () => tool === "select" && setSelectedShapeId(item.id), onDragEnd: (e) => {
                      e.cancelBubble = true;
                      updateItemById(item.id, (old) => ({ ...old, x: e.target.x(), y: e.target.y() }));
                    } }, item.id || i);
                    if (item.type === "text") return /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { x: item.x, y: item.y, text: item.text, fontSize: 24 / stageScale, fill: item.color, fontStyle: "bold", draggable: tool === "select", onClick: () => tool === "select" && setSelectedShapeId(item.id), onDragEnd: (e) => {
                      e.cancelBubble = true;
                      updateItemById(item.id, (old) => ({ ...old, x: e.target.x(), y: e.target.y() }));
                    } }, item.id || i);
                    if (item.type === "polygon") {
                      const isSelected = selectedShapeId === item.id && tool === "select";
                      return /* @__PURE__ */ jsxRuntimeExports.jsxs(Group, { children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { points: item.points, x: item.x || 0, y: item.y || 0, closed: true, stroke: item.color, strokeWidth: 3 / stageScale, fill: `${item.color}33`, draggable: tool === "select", onClick: () => tool === "select" && setSelectedShapeId(item.id), onDragEnd: (e) => {
                          e.cancelBubble = true;
                          updateItemById(item.id, (old) => ({ ...old, x: e.target.x(), y: e.target.y() }));
                        } }),
                        isSelected && Array.from({ length: item.points.length / 2 }).map((_, ptIndex) => /* @__PURE__ */ jsxRuntimeExports.jsx(Circle, { x: item.points[ptIndex * 2] + (item.x || 0), y: item.points[ptIndex * 2 + 1] + (item.y || 0), radius: 6 / stageScale, fill: "white", stroke: "#ef4444", strokeWidth: 2 / stageScale, draggable: true, onDragMove: (e) => {
                          const newPoints = [...item.points];
                          newPoints[ptIndex * 2] = e.target.x() - (item.x || 0);
                          newPoints[ptIndex * 2 + 1] = e.target.y() - (item.y || 0);
                          updateItemById(item.id, (old) => ({ ...old, points: newPoints }));
                        }, onDragEnd: (e) => {
                          e.cancelBubble = true;
                        } }, `anchor-${item.id}-${ptIndex}`))
                      ] }, item.id || i);
                    }
                    return null;
                  }) }, layer.id)),
                  tool === "polygon" && currentPolygon.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx(Layer, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(Line, { points: currentPolygon, stroke: activeColor, strokeWidth: 3 / stageScale, strokeDasharray: [5 / stageScale, 5 / stageScale] }) })
                ]
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: cn("w-full lg:w-96 bg-surface border-l border-border flex-col shrink-0 overflow-hidden h-full lg:h-auto", mobileTab === "audio" ? "flex" : "hidden lg:flex"), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-b border-border flex items-center justify-between bg-surface shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-bold text-text-primary flex items-center gap-2", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { size: 18, className: "text-accent-ai" }),
              " Audio Hub"
            ] }),
            isAnalyzingAudio && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] font-bold uppercase tracking-widest text-accent-ai flex items-center gap-2 bg-accent-ai/10 px-2 py-1 rounded-md", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 12, className: "animate-spin" }),
              " ",
              t("ai_analyzing")
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 overflow-y-auto p-4 space-y-4 bg-background custom-scrollbar", children: [
            audioNotes.length === 0 && !isAnalyzingAudio && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "h-full flex flex-col items-center justify-center text-center opacity-50", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(FileAudio, { size: 48, className: "mb-4 text-text-muted" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium", children: t("no_data") })
            ] }),
            audioNotes.map((note) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { onClick: () => setActiveNoteId(note.id === activeNoteId ? null : note.id), className: cn("p-4 border rounded-xl transition-all cursor-pointer group", activeNoteId === note.id ? "bg-white/5 border-accent-ai/50 shadow-md" : "bg-surface border-border hover:bg-white/5"), children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: cn("p-2.5 rounded-lg", activeNoteId === note.id ? "bg-accent-ai/20 text-accent-ai" : "bg-background border border-border text-text-muted"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileAudio, { size: 16 }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold text-text-primary", children: note.title }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] uppercase font-bold tracking-widest text-text-muted mt-0.5", children: note.time })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: (e) => handleDeleteNote(e, note.id), className: "p-1.5 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100", title: t("delete_note"), children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { size: 14 }) }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs font-mono font-bold text-accent-ai bg-accent-ai/10 px-2 py-1 rounded-md border border-accent-ai/20", children: note.duration })
                ] })
              ] }),
              note.audioData && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mb-3", onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx("audio", { controls: true, src: `data:audio/webm;base64,${note.audioData}`, className: "w-full h-8 outline-none grayscale" }) }),
              activeNoteId === note.id && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-4 pt-4 border-t border-border/50 space-y-4 animate-in fade-in slide-in-from-top-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-accent-ai/10 border border-accent-ai/20 rounded-xl p-4", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("h5", { className: "text-[10px] font-bold text-accent-ai flex items-center gap-1.5 mb-2 uppercase tracking-widest", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { size: 14 }),
                    " ",
                    t("ai_summary")
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-text-primary leading-relaxed", children: note.aiSummary })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("h5", { className: "text-[10px] font-bold text-text-muted flex items-center gap-1.5 mb-2 uppercase tracking-widest", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { size: 14 }),
                    " ",
                    t("full_transcript")
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-text-muted leading-relaxed font-medium bg-surface p-3 rounded-lg border border-border/50", children: [
                    '"',
                    note.transcription,
                    '"'
                  ] })
                ] })
              ] })
            ] }, note.id))
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 border-t border-border bg-surface text-center shrink-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs font-medium text-text-muted mb-4", children: t("info_text") }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: isRecording ? stopRecording : startRecording, className: cn("w-full py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2", isRecording ? "bg-red-500 hover:bg-red-600 text-white shadow-red-500/20 animate-pulse" : "bg-accent-ai text-white hover:bg-accent-ai/90 shadow-accent-ai/20"), children: [
              isRecording ? /* @__PURE__ */ jsxRuntimeExports.jsx(Square, { size: 18, className: "fill-current" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Mic, { size: 18 }),
              isRecording ? `${t("stop_rec")} (${formatTime(recordingTime)})` : t("start_rec")
            ] })
          ] })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      UniversalPDFStudio,
      {
        isOpen: isPdfStudioOpen,
        onClose: () => setIsPdfStudioOpen(false),
        title: "Whiteboard Export",
        fileName: `Whiteboard_${Date.now()}`,
        onSaveCloud: handleSavePdfToCloud,
        defaultOrientation: "landscape",
        children: (settings) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          WhiteboardPDFDocument,
          {
            settings,
            pdfRenderImage,
            projectHeader: { project: activeProject?.name || "Projekt", date: (/* @__PURE__ */ new Date()).toISOString() }
          }
        )
      }
    ),
    typeof document !== "undefined" && reactDomExports.createPortal(
      /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showAiRender && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(motion.div, { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 }, className: "bg-surface border border-border rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col md:flex-row overflow-hidden", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-full md:w-1/2 bg-background border-r border-border p-6 flex flex-col items-center justify-center min-h-[300px] relative", children: renderedImage ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: renderedImage, alt: "Rendered Result", className: "w-full h-full object-contain rounded-xl shadow-lg animate-in fade-in" }) : isRendering ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center text-accent-ai z-10", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 48, className: "animate-spin mb-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold tracking-widest uppercase text-xs", children: t("rendering") })
          ] }) : sketchDataUrl ? /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute top-4 left-4 bg-background/80 backdrop-blur-md px-3 py-1 rounded-md border border-border text-xs font-bold text-text-muted", children: t("your_sketch") }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: sketchDataUrl, alt: "Sketch", className: "w-full h-full object-contain opacity-50" })
          ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center opacity-50", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(WandSparkles, { size: 48, className: "mx-auto mb-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-medium text-sm", children: "Bereit für die Transformation." })
          ] }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "w-full md:w-1/2 p-8 flex flex-col", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between items-start mb-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xl font-bold text-text-primary flex items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "text-accent-ai" }),
                  " ",
                  t("ai_render")
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-text-muted mt-1", children: t("ai_render_desc") })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setShowAiRender(false), className: "text-text-muted hover:text-text-primary", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { size: 20 }) })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 flex flex-col justify-center", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "textarea",
                {
                  value: renderPrompt,
                  onChange: (e) => setRenderPrompt(e.target.value),
                  placeholder: t("describe_vision"),
                  className: "w-full h-32 bg-background border border-border rounded-xl p-4 text-sm font-medium text-text-primary focus:outline-none focus:border-accent-ai resize-none custom-scrollbar mb-6"
                }
              ),
              renderedImage ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-3", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: addRenderToCanvas, className: "w-full py-3 bg-accent-ai text-white rounded-xl text-sm font-bold shadow-lg hover:bg-accent-ai/90 transition-colors flex justify-center items-center gap-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ImagePlus, { size: 18 }),
                  " ",
                  t("add_to_canvas")
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => {
                  setRenderedImage(null);
                  setRenderPrompt("");
                }, className: "w-full py-3 bg-surface border border-border text-text-primary rounded-xl text-sm font-bold hover:bg-white/5 transition-colors", children: "Neues Rendering starten" })
              ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("button", { onClick: executeAiRender, disabled: isRendering || !renderPrompt.trim(), className: "w-full py-3 bg-accent-ai text-white rounded-xl text-sm font-bold shadow-lg hover:bg-accent-ai/90 transition-colors disabled:opacity-50 flex justify-center items-center gap-2", children: [
                isRendering ? /* @__PURE__ */ jsxRuntimeExports.jsx(LoaderCircle, { size: 18, className: "animate-spin" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(WandSparkles, { size: 18 }),
                t("generate_render")
              ] })
            ] })
          ] })
        ] }) }) }),
        textPrompt && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-lg font-bold text-text-primary mb-4 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Type, { size: 18, className: "text-accent-ai" }),
            " ",
            t("enter_text")
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleTextSubmit, children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("input", { type: "text", value: textPrompt.value, onChange: (e) => setTextPrompt({ ...textPrompt, value: e.target.value }), className: "w-full bg-background border border-border/50 rounded-lg px-4 py-3 text-text-primary font-medium focus:outline-none focus:border-accent-ai mb-6", placeholder: t("type_text_here"), autoFocus: true }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setTextPrompt(null), className: "px-4 py-2 text-sm font-bold text-text-muted hover:text-text-primary transition-colors", children: t("cancel") }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "px-6 py-2 bg-accent-ai text-white rounded-lg text-sm font-bold shadow-lg hover:bg-accent-ai/90 transition-colors", children: t("add_text") })
            ] })
          ] })
        ] }) })
      ] }),
      document.body
    )
  ] });
}

export { Whiteboard as default };
