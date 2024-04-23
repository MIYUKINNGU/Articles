const canvas = document.getElementById("3DProgram");
const ctx = canvas.getContext("2d");


// @ts-check
class Vector2 {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.length = (this.x**2 + this.y**2)**0.5;
        this.Type = "Vector2";
        Object.freeze(this);
    }

    static add(A, B) {
        return new Vector2(A.x+B.x, A.y+B.y);
    }
    
    static minus(A, B) {
        return new Vector2(A.x-B.x, A.y-B.y);
    }
}

class Vector3 {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.length = (this.x**2 + this.y**2 + this.z**2)**0.5;
        this.Type = "Vector3";
        Object.freeze(this);
    }

    static add(A, B, C=new Vector3(0,0,0), D=new Vector3(0,0,0)) {
        return new Vector3(A.x+B.x+C.x+D.x, A.y+B.y+C.y+D.y, A.z+B.z+C.z+D.z);
    }
    
    static minus(A, B) {
        return new Vector3(A.x-B.x, A.y-B.y, A.z-B.z);
    }

    static ScalarMulti(a, B) {
        return new Vector3(a*B.x, a*B.y, a*B.z);
    }
    
    ObjectRotation(rotation) {
        if (rotation.Type != "Quaternion") throw TypeError();

        let Rotation = new Quaternion(0, 0, 0, 1);
        if (rotation.norm != 0) {
            Rotation = Quaternion.ScalarMulti(1/rotation.norm, rotation);
        }
        return Quaternion.Multiple(Quaternion.Multiple(Rotation, this.ToQuaternion()), Rotation.RotationInverse()).ToVector3();
    }

    To2DAnyAxis(AxisID) {
        switch (AxisID) {
        case 0:
            return new Vector3(0, this.y, this.z);
        case 1:
            return new Vector3(this.x, 0, this.z);
        case 2:
            return new Vector3(this.x, this.y, 0);
        default:
            return this;
        }
    }

    ToQuaternion() {
        return new Quaternion(this.x, this.y, this.z, 0);
    }
}

class Quaternion {
    constructor(x, y, z, w) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        this.norm = (this.x**2 + this.y**2 + this.z**2 + this.w**2)**0.5;
        this.Type = "Quaternion";
        Object.freeze(this);
    }

    static Multiple(A, B) {
        if (A.Type != "Quaternion") throw TypeError();
        if (B.Type != "Quaternion") throw TypeError();
        return new Quaternion(
            A.w * B.x - A.z * B.y + A.y * B.z + A.x * B.w,
            A.z * B.x + A.w * B.y - A.x * B.z + A.y * B.w,
            -A.y * B.x + A.x * B.y + A.w * B.z + A.z * B.w,
            -A.x * B.x - A.y * B.y - A.z * B.z + A.w * B.w
        );
    }

    static ScalarMulti(a, B) {
        return new Quaternion(a*B.x, a*B.y, a*B.z, a*B.w);
    }
    
    RotationInverse() {
        return new Quaternion(-this.x, -this.y, -this.z, this.w);
    }

    static ArbitraryAngle(axis, rotation) {
        if (axis.Type != "Vector3") throw TypeError();

        let uvAxis = Vector3.ScalarMulti(1/axis.length, axis);
        let dRotation = Math.PI * rotation / 180;

        let NewObj = new Quaternion(0,0,0,0);

        NewObj = new Quaternion(uvAxis.x * Math.sin(dRotation / 2),
                                uvAxis.y * Math.sin(dRotation / 2),
                                uvAxis.z * Math.sin(dRotation / 2),
                                           Math.cos(dRotation / 2)
        );

        return NewObj;
    }
    
    RotatedArbitraryAngle(axis, rotation) {
        if (axis.Type != "Vector3") throw TypeError();

        let uvAxis = Vector3.ScalarMulti(1/axis.length, axis).ObjectRotation(this);
        let dRotation = Math.PI * rotation / 180;

        let NewObj = new Quaternion(0,0,0,0);

        NewObj = new Quaternion(uvAxis.x * Math.sin(dRotation / 2),
                                uvAxis.y * Math.sin(dRotation / 2),
                                uvAxis.z * Math.sin(dRotation / 2),
                                           Math.cos(dRotation / 2)
        );

        return Quaternion.Multiple(NewObj, this);
    }

    ToVector3() {
        return new Vector3(this.x, this.y, this.z);
    }
}

function Color(r, g, b, a=1) {
    return {r: r, g: g, b: b, a: a};
}

function CalcFocalLen(viewingAngle, height) {
    return (height / (2 * Math.tan(Math.PI * (viewingAngle / 2) / 180)));
}

const CubePolygons = [
    [new Vector3( -1, -1, -1 ), new Vector3( 1, -1, -1 ), new Vector3( 1, 1, -1 ), new Vector3( -1, 1, -1 ), Color( 255, 0, 0 )],
    [new Vector3( -1, -1, -1 ), new Vector3( 1, -1, -1 ), new Vector3( 1, -1, 1 ), new Vector3( -1, -1, 1 ), Color( 0, 255, 0 )],
    [new Vector3( -1, -1, 1 ), new Vector3( 1, -1, 1 ), new Vector3( 1, 1, 1 ), new Vector3( -1, 1, 1 ), Color( 0, 0, 255 )],
    [new Vector3( 1, 1, 1 ), new Vector3( -1, 1, 1 ), new Vector3( -1, 1, -1 ), new Vector3( 1, 1, -1 ), Color( 255, 0, 255 )],
    [new Vector3( -1, -1, -1 ), new Vector3( -1, 1, -1 ), new Vector3( -1, 1, 1 ), new Vector3( -1, -1, 1 ), Color( 255, 255, 0 )],
    [new Vector3( 1, 1, 1 ), new Vector3( 1, -1, 1 ), new Vector3( 1, -1, -1 ), new Vector3( 1, 1, -1 ), Color( 0, 255, 255 )]
];

const WtoScPosScaleValue = 200;
const WIDTH = canvas.width;
const HEIGHT = canvas.height;

let ScreenPosOffset = new Vector2(WIDTH / 2, HEIGHT / 2);
let ViewingAngle = 90;
let Wheight = 1;
let FocalLength = 0;
let DrawingLength = 10;
let CameraPos = new Vector3(0, 0, 0);
let CameraRotation = new Quaternion(0, 0, 0, 1);
let DrawPosPolyStack = [];

FocalLength = CalcFocalLen(ViewingAngle, Wheight);

let Cube = {
    Polygons: CubePolygons,
    Position: new Vector3(0.0, 0.0, 2.0)
};

function DrawLine(x0, y0, x1, y1) {
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
}

function DrawQuad(P0, P1, P2, P3) {
    ctx.beginPath();
    ctx.moveTo(P0.x, P0.y);
    ctx.lineTo(P1.x, P1.y);
    ctx.lineTo(P3.x, P3.y);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(P2.x, P2.y);
    ctx.lineTo(P1.x, P1.y);
    ctx.lineTo(P3.x, P3.y);
    ctx.fill();
    ctx.stroke();
}

function SetDrawColor(color) {
    ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
    ctx.strokeStyle = `rgba(${color.r},${color.g},${color.b},${color.a})`;
}

function Clear() {
    ctx.fillStyle = 'rgb(0,0,0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function WorldPToScreenP(P) {
    let Point = Vector3.minus(P, CameraPos).ObjectRotation(CameraRotation.RotationInverse());
    let p = new Vector2(
        Math.floor(FocalLength * Point.x * WtoScPosScaleValue / Point.z),
        Math.floor(FocalLength * Point.y * WtoScPosScaleValue / Point.z)
    );
    return p;
}

function IsinCameraRange(P) {
    let vec = Vector3.minus(P, CameraPos).ObjectRotation(CameraRotation.RotationInverse());
    let CameraRange = new Vector3(3.2 * FocalLength, 2 * WIDTH * Wheight / (2 * HEIGHT), Wheight / 2);
    let a = Math.abs(vec.x) / CameraRange.x <= vec.z / CameraRange.z;
    let b = Math.abs(vec.y) / CameraRange.y <= vec.z / CameraRange.z;
    return 0 <= vec.z && vec.z <= DrawingLength && a && b;
}

function RenderQuadPolygon(Poly, Position) {
    SetDrawColor(Poly[4]);
    let ScP0 = Vector2.add(WorldPToScreenP(Vector3.add(Poly[0], Position)), ScreenPosOffset);
    let ScP1 = Vector2.add(WorldPToScreenP(Vector3.add(Poly[1], Position)), ScreenPosOffset);
    let ScP2 = Vector2.add(WorldPToScreenP(Vector3.add(Poly[2], Position)), ScreenPosOffset);
    let ScP3 = Vector2.add(WorldPToScreenP(Vector3.add(Poly[3], Position)), ScreenPosOffset);
    let a = 0;
    if ((IsinCameraRange(Vector3.add(Poly[0], Position)) && IsinCameraRange(Vector3.add(Poly[1], Position)))) { DrawLine(ScP0.x, ScP0.y, ScP1.x, ScP1.y); a++; }
    if ((IsinCameraRange(Vector3.add(Poly[1], Position)) && IsinCameraRange(Vector3.add(Poly[2], Position)))) { DrawLine(ScP1.x, ScP1.y, ScP2.x, ScP2.y); a++; }
    if ((IsinCameraRange(Vector3.add(Poly[2], Position)) && IsinCameraRange(Vector3.add(Poly[3], Position)))) { DrawLine(ScP2.x, ScP2.y, ScP3.x, ScP3.y); a++; }
    if ((IsinCameraRange(Vector3.add(Poly[3], Position)) && IsinCameraRange(Vector3.add(Poly[0], Position)))) { DrawLine(ScP3.x, ScP3.y, ScP0.x, ScP0.y); a++; }
    if (a == 4) { DrawQuad(ScP0, ScP1, ScP2, ScP3) }
    
    return 0;
}

function AddObjStack(Pos, Poly) {
    DrawPosPolyStack.push([Pos, Poly]);

    return 0;
}

function RenderQuadObject(obj) {
    let Arrsize = obj.Polygons.length;
    for (let i = 0; i < Arrsize; i++) {
        AddObjStack(obj.Position, obj.Polygons[i]);
    }
    return 0;
}

function SortStackAndDraw() {
    DrawPosPolyStack.sort((a, b)=>Vector3.minus(Vector3.add(Vector3.ScalarMulti(0.25, Vector3.add(a[1][0], a[1][1], a[1][2], a[1][3])), a[0]), CameraPos).length
    -
    Vector3.minus(Vector3.add(Vector3.ScalarMulti(0.25, Vector3.add(b[1][0], b[1][1], b[1][2], b[1][3])), b[0]), CameraPos).length)

    for (let i = DrawPosPolyStack.length - 1; i > -1; i--) {
        RenderQuadPolygon(DrawPosPolyStack[i][1], DrawPosPolyStack[i][0]);
    }

    DrawPosPolyStack = [];

    return 0;
}

function Abs(val) {
    return Vector3.ScalarMulti(1 / val.length, val);
}

function Reset() {
    Cube = {
        Polygons: CubePolygons,
        Position: new Vector3(0.0, 0.0, 2.0)
    };
    CameraPos = new Vector3(0, 0, 0);
    CameraRotation = new Quaternion(0, 0, 0, 1);
}

let KeyPushing = [];

function IsPush(key) {
    return KeyPushing.includes(key);
}

function update() {
    Clear();

    if ( IsPush("KeyD") ) {
        CameraPos = Vector3.add(CameraPos, Vector3.ScalarMulti(0.05, Abs(new Vector3(0.05, 0, 0).ObjectRotation(CameraRotation).To2DAnyAxis(1))));
    }
    if ( IsPush("KeyA") ) {
        CameraPos = Vector3.add(CameraPos, Vector3.ScalarMulti(0.05, Abs(new Vector3(-0.05, 0, 0).ObjectRotation(CameraRotation).To2DAnyAxis(1))));
    }
    if ( IsPush("Space") ) {
        CameraPos = Vector3.minus(CameraPos, new Vector3(0, 0.05, 0));
    }
    if ( IsPush("ShiftLeft") ) {
        CameraPos = Vector3.minus(CameraPos, new Vector3(0, -0.05, 0));
    }
    if ( IsPush("KeyW") ) {
        CameraPos = Vector3.add(CameraPos, Vector3.ScalarMulti(0.05, Abs(new Vector3(0, 0, 0.05).ObjectRotation(CameraRotation).To2DAnyAxis(1))));
    }
    if ( IsPush("KeyS") ) {
        CameraPos = Vector3.add(CameraPos, Vector3.ScalarMulti(0.05, Abs(new Vector3(0, 0, -0.05).ObjectRotation(CameraRotation).To2DAnyAxis(1))));
    }
    // Rotate
    if ( IsPush("ArrowUp") ) {
        CameraRotation = CameraRotation.RotatedArbitraryAngle(new Vector3(1, 0, 0), 2);
    }
    if ( IsPush("ArrowDown") ) {
        CameraRotation = CameraRotation.RotatedArbitraryAngle(new Vector3(1, 0, 0), -2);
    }
    if ( IsPush("ArrowLeft") ) {
        CameraRotation = Quaternion.Multiple(Quaternion.ArbitraryAngle(new Vector3(0, 1, 0), -2), CameraRotation);
    }
    if ( IsPush("ArrowRight") ) {
        CameraRotation = Quaternion.Multiple(Quaternion.ArbitraryAngle(new Vector3(0, 1, 0), 2), CameraRotation);
    }
    if ( IsPush("KeyN") ) {
        CameraRotation = CameraRotation.RotatedArbitraryAngle(new Vector3(0, 0, 1), -2);
    }
    if ( IsPush("KeyM") ) {
        CameraRotation = CameraRotation.RotatedArbitraryAngle(new Vector3(0, 0, 1), 2);
    }
    
    RenderQuadObject(Cube);
    
    SortStackAndDraw();
}

setInterval(update, 1000/60);

document.body.addEventListener('keydown', e=>{
    if (KeyPushing.includes(e.code)) return;
    KeyPushing.push(e.code);
    switch(e.code) {
        case "ArrowUp":
        case "ArrowDown":
        case "ArrowRight":
        case "ArrowLeft":
        case "Space":
            e.preventDefault();
    }
});

document.body.addEventListener('keyup', e=>{
    KeyPushing = KeyPushing.filter(n => n !== e.code);
});