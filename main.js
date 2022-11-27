var color = {
    "normal": {
        "teal": "#7ADBBC",
        "lgreen": "#B9E87E",
        "orange": "#E7896D",
        "yellow": "#FDF380",
        "lavender": "#B58EFD",
        "pink": "#EF99C3",
        "vlgrey": "#E8EBF7",
        "lgrey": "#AA9F9E",
        "guiwhite": "#FFFFFF",
        "black": "#484848",
        "blue": "#3CA4CB",
        "green": "#8ABC3F",
        "red": "#E03E41",
        "gold": "#EFC74B",
        "purple": "#8D6ADF",
        "magenta": "#CC669C",
        "grey": "#A7A7AF",
        "dgrey": "#726F6F",
        "white": "#DBDBDB",
        "guiblack": "#000000",
        "paletteSize": 10,
        "border": 0.65
    }
};
//a
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

function fullscreenCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
//fullscreenCanvas()
//test commit

var keys = {
};
var mouseX = 0;
var mouseY = 0;
var mouseDownX = 0;
var mouseDownY = 0;
var mouseUpX = false;
var mouseUpY = false;
var mouseDown = false;
var mouseJustDown = false;
var ignoreInput = false;
var timer = 0;
var globalZoom = getComputedStyle(document.documentElement).getPropertyValue('--global-zoom');
addEventListener("keydown", function (e) {
    if (ignoreInput) {
        return;
    }
    keys[e.key] = true;
}
);
addEventListener("keyup", function (e) {
    if (ignoreInput) {
        return;
    }
    keys[e.key] = false;
}
);
addEventListener("mousemove", function (e) {
    if (ignoreInput) {
        return;
    }
    globalZoom = getComputedStyle(document.documentElement).getPropertyValue('--global-zoom');
    mouseX = (e.clientX/globalZoom-canvas.offsetLeft+window.pageXOffset);
    mouseY = (e.clientY/globalZoom-canvas.offsetTop+window.pageYOffset);
}
);
addEventListener("mousedown", function (e) {
    if (ignoreInput) {
        return;
    }
    mouseDown = true;
    mouseDownX = mouseX;
    mouseDownY = mouseY;
    console.log("mouseDown");
    console.log("mouseDownX: " + mouseDownX);
    console.log("mouseDownY: " + mouseDownY);
}
);
addEventListener("mouseup", function (e) {
    if (ignoreInput) {
        return;
    }
    mouseDown = false;
    mouseUpX = mouseX;
    mouseUpY = mouseY;
    console.log("mouseUp");
    console.log("mouseUpX: " + mouseUpX);
    console.log("mouseUpY: " + mouseUpY);
}
);
t = 0
function isMouseJustDown() {
    if (mouseDown) {
        t++
    } else {
        t=0
    }
    if (t==1) {
        return true
    }
    return false
}


//Arras.io tank builder
//Provides a visual way to make tanks for arras.io private servers
//You will be able to change any value, press a button to see what it means
//place barrels ect ect

const barrelColor = color.normal.grey;

var pointyGraphics = false;
var size = 12;
var shape = 0;
var currentColor = "default";
var colorID = -1;
const base = { //The base values for each body value
    ACCEL: 1.6,
    SPEED: 5.25,
    HEALTH: 20,
    DAMAGE: 3,
    RESIST: 1,
    PENETRATION: 1.05,
    SHIELD: 8,
    REGEN: 0.025,
    FOV: 1,
    DENSITY: 0.5,
};
var body = { //A varible thats used for the export function
    ACCELERATION: 1,
    SPEED: 1,
    HEALTH: 1, 
    DAMAGE: 1, 
    PENETRATION: 1, 
    SHIELD: 1,
    REGEN: 1,
    FOV: 1,
    DENSITY: 1,
    PUSHABILITY: 0.9,
    HETERO: 3,
};

function drawPoly(context, centerX, centerY, radius, sides, angle = 0, fill = true) { //the function that Arras.io uses to draw the tank
    angle += (sides % 2) ? 0 : Math.PI / sides;
    // Start drawing
    context.beginPath();
    if (!sides) { // Circle
        let fillcolor = context.fillStyle;
        let strokecolor = context.strokeStyle;
        radius += context.lineWidth / 4;
        context.arc(centerX, centerY, radius + context.lineWidth / 4, 0, 2 * Math.PI, false);
        context.fillStyle = strokecolor;
        context.fill();
        context.closePath();
        context.beginPath();
        context.arc(centerX, centerY, radius - context.lineWidth / 4, 0, 2 * Math.PI, false);
        context.fillStyle = fillcolor;
        context.fill();
        context.closePath();
        return;
    } else if (sides < 0) { // Star
        if (pointyGraphics) context.lineJoin = 'miter';
        let dip = 1 - (6 / sides / sides);
        sides = -sides;
        context.moveTo(centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle));
        for (let i = 0; i < sides; i++) {
            var theta = (i + 1) / sides * 2 * Math.PI;
            var htheta = (i + 0.5) / sides * 2 * Math.PI;
            var c = {
                x: centerX + radius * dip * Math.cos(htheta + angle),
                y: centerY + radius * dip * Math.sin(htheta + angle),
            };
            var p = {
                x: centerX + radius * Math.cos(theta + angle),
                y: centerY + radius * Math.sin(theta + angle),
            };
            context.quadraticCurveTo(c.x, c.y, p.x, p.y);
        }
    } else if (sides === 600) {
        for (let i = 0; i < 6; i++) {
            let theta = (i / 6) * 2 * Math.PI,
                x = centerX + radius * 1.1 * Math.cos(180 / 6 + theta + angle + 0.385),
                y = centerY + radius * 1.1 * Math.sin(180 / 6 + theta + angle + 0.385);
            context.lineTo(x, y);
        } 
    } else if (sides > 0) { // Polygon
        for (let i = 0; i < sides; i++) {
            let theta = (i / sides) * 2 * Math.PI;
            let x = centerX + radius * Math.cos(theta + angle);
            let y = centerY + radius * Math.sin(theta + angle);
            context.lineTo(x, y);
        }
    } 
    context.closePath();
    context.stroke();
    if (fill) {
        context.fill();
    }
    context.lineJoin = 'round';
}

function drawTrapezoid(context, x, y, length, height, aspect, angle) { //The function that Arras.io uses to draw guns
    let h = [];
    h = (aspect > 0) ? [height * aspect, height] : [height, -height * aspect];
    let r = [
        Math.atan2(h[0], length),
        Math.atan2(h[1], length)
    ];
    let l = [
        Math.sqrt(length * length + h[0] * h[0]),
        Math.sqrt(length * length + h[1] * h[1])
    ];
    context.beginPath();
    context.lineTo(x + l[0] * Math.cos(angle + r[0]), y + l[0] * Math.sin(angle + r[0]));
    context.lineTo(x + l[1] * Math.cos(angle + Math.PI - r[1]), y + l[1] * Math.sin(angle + Math.PI - r[1]));
    context.lineTo(x + l[1] * Math.cos(angle + Math.PI + r[1]), y + l[1] * Math.sin(angle + Math.PI + r[1]));
    context.lineTo(x + l[0] * Math.cos(angle - r[0]), y + l[0] * Math.sin(angle - r[0]));
    context.closePath();
    context.stroke();
    context.fill();
}

function mixColors(color1, color2, amount) { // The mix color function, input 1 and 2 are swapped. 
    let c1 = color1.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    let c2 = color2.match(/^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    let c = [
        Math.round(parseInt(c1[1], 16) * amount + parseInt(c2[1], 16) * (1 - amount)),
        Math.round(parseInt(c1[2], 16) * amount + parseInt(c2[2], 16) * (1 - amount)),
        Math.round(parseInt(c1[3], 16) * amount + parseInt(c2[3], 16) * (1 - amount))
    ];
    return '#' + c[0].toString(16) + c[1].toString(16) + c[2].toString(16);
}

function getColorDark(givenColor) { // Gets the darker color of a given color, its exactly how the game does it but input 1 and 2 are swapped
    return mixColors(color.normal.black, givenColor, 0.65);
}

function getColorTransparent(givenColor) {
    return givenColor + '77';
}

function updateSides() { // Update the number of sides of the tank from the html input
    shape = document.getElementById("sides").value;
    document.getElementById("sides").value = shape;
    var sidesValue = document.getElementById("sidesValue");
    sidesValue.innerHTML = shape;
}

function setColor(num)  { //A function thats only used for the color buttons.
    switch (num) {
        case 1:
            currentColor = color.normal.teal;
            colorID = 0;
            break;
        case 2:
            currentColor = color.normal.lgreen;
            colorID = 1;
            break;
        case 3:
            currentColor = color.normal.orange;
            colorID = 2;
            break;
        case 4:
            currentColor = color.normal.yellow;
            colorID = 3;
            break;
        case 5:
            currentColor = color.normal.lavender;
            colorID = 4;
            break;
        case 6:
            currentColor = color.normal.pink;
            colorID = 5;
            break;
        case 7:
            currentColor = color.normal.vlgrey;
            colorID = 6;
            break;
        case 8:
            currentColor = color.normal.lgrey;
            colorID = 7;
            break;
        case 9:
            currentColor = color.normal.guiwhite;
            colorID = 8;
            break;
        case 10:
            currentColor = color.normal.black;
            colorID = 9;
            break;
        case 11:
            currentColor = color.normal.blue;
            colorID = 10;
            break;
        case 12:
            currentColor = color.normal.green;
            colorID = 11;
            break;
        case 13:
            currentColor = color.normal.red;
            colorID = 12;
            break;
        case 14:
            currentColor = color.normal.gold;
            colorID = 13;
            break;
        case 15:
            currentColor = color.normal.purple;
            colorID = 14;
            break;
        case 16:
            currentColor = color.normal.magenta;
            colorID = 15;
            break;
        case 17:
            currentColor = color.normal.grey;
            colorID = 16;
            break;
        case 18:
            currentColor = color.normal.dgrey;
            colorID = 17;
            break;
        case 19:
            currentColor = color.normal.white;
            colorID = 18;
            break;
        case 20:
            currentColor = color.normal.guiblack;
            colorID = 19;
            break;
        default:
            currentColor = "default";
            colorID = -1;
            break;
    }
}

function updateSize() { //Update the number input when the slider is changed
    size = Math.round(document.getElementById("size").value);
    if (typeof size !== "number")  {
        size = Math.round(parseInt(size));
        document.getElementById("size").value = Math.round(size)
    } 
    document.getElementById("sizeNumInput").value = Math.round(size);
}

function updateSizeNum() { //Update the slider when the number input is changed
    size = document.getElementById("sizeNumInput").value
    if (typeof size !== "number")  {
        size = parseInt(size);
        document.getElementById("sizeNumInput").value = size
    } 
    document.getElementById("size").value = size;
}

/*BODY: { // def
        ACCELERATION: base.ACCEL,
        SPEED: base.SPEED,
        HEALTH: base.HEALTH, 
        DAMAGE: base.DAMAGE, 
        PENETRATION: base.PENETRATION, 
        SHIELD: base.SHIELD,
        REGEN: base.REGEN,
        FOV: base.FOV,
        DENSITY: base.DENSITY,
        PUSHABILITY: 0.9,
        HETERO: 3,
    },
*/


//Basic
//var guns = [  /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
//    { POSITION:   [  18,     8,      1,      0,      0,      0,      0,   ] }, 
//];

//Gunner
// var guns = [ { /*** LENGTH  WIDTH   ASPECT    X       Y     ANGLE   DELAY */
//         POSITION: [  12,    3.5,     1,      0,     7.25,    0,     0.5,  ], 
//     PROPERTIES: {
//     }, }, { 
//         POSITION: [  12,    3.5,     1,      0,    -7.25,    0,     0.75, ], 
//     PROPERTIES: {
//     }, }, { 
//         POSITION: [  16,    3.5,     1,      0,     3.75,    0,      0,   ], 
//     PROPERTIES: {
//     }, }, { 
//         POSITION: [  16,    3.5,     1,      0,    -3.75,    0,     0.25, ], 
//     PROPERTIES: {
//     }, }, 
// ];

//Empty
var guns = [
];

function drawGuns(){ //Everything is fixed, just not sure if the units are the same as actual Arras units
    for (var i = 0; i < guns.length; i++) {
        var [LENGTH, WIDTH, ASPECT, X, Y, ANGLE, DELAY] = guns[i].POSITION;
        ANGLE = ANGLE * Math.PI / 180;
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        var drawSize = size / 3.6; //arbritrary value, need to figure out how the game actually determines what size to draw the gun
        drawTrapezoid(
            ctx,
            canvas.width / 2 + ((Math.cos(ANGLE) * (LENGTH / 2 + X))+(Math.cos(ANGLE+-1.5708) * (-Y)))*drawSize, // x
            canvas.height/ 2 + ((Math.sin(ANGLE) * (LENGTH / 2 + X))+(Math.sin(ANGLE+-1.5708) * (-Y)))*drawSize, // y
            drawSize * LENGTH / 2, // length
            drawSize * WIDTH / 2, // height
            ASPECT,
            ANGLE
        ); 
    }
}

function drawGhostGun(length, width, aspect, x, y, angle, delay) { //draws a transparent version of the gun
    angle = angle * Math.PI / 180;
    ctx.lineWidth = 8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    var drawSize = size / 3.6; //arbritrary value, need to figure out how the game actually determines what size to draw the gun
    drawTrapezoid(
        ctx,
        canvas.width / 2 + ((Math.cos(angle) * (length / 2 + x))+(Math.cos(angle+-1.5708) * (-y)))*drawSize, // x
        canvas.height/ 2 + ((Math.sin(angle) * (length / 2 + x))+(Math.sin(angle+-1.5708) * (-y)))*drawSize, // y
        drawSize * length / 2, // length
        drawSize * width / 2, // height
        aspect,
        angle,
    );
}

var shootSettings = null
var shootType = null
var shootLabel = null
function updateGunProperties(){
    if (document.getElementById("shootSettingsEnable").checked) {
        shootSettings = document.getElementById("shootSettings").value;
        shootType = document.getElementById("shootType").options[document.getElementById("shootType").selectedIndex].value;
    } else {
        shootSettings = null;
        shootType = null;
    }
    if (document.getElementById("shootLabelEnable").checked) {
        shootLabel = document.getElementById("shootLabel").value;
    } else {
        shootLabel = null;
    }
}

function camelCaseString(string) {
    return string.toLowerCase().replace(/\s(.)/g, function($1) { return $1.toUpperCase(); }).replace(/\s/g, '');
}


function exportTank() { //Uses our varibles and sets "it" to the export code
    var exportName = document.getElementById("exportName").value;
    var parent = document.getElementById("parent").value;
    var label = document.getElementById("label").value;

    if (exportName == "") {
        exportName = camelCaseString(label);
    }

    var type = document.getElementById("type").value;
    var shape = document.getElementById("sides").value;
    var damageClass = document.getElementById("damageClass").value;
    var danger = document.getElementById("danger").value;
    var motionType = document.getElementById("motionType").options[document.getElementById("motionType").selectedIndex].value;
    var facingType = document.getElementById("facingType").options[document.getElementById("facingType").selectedIndex].value;
    var maxChildren = document.getElementById("maxChildren").value;
    var damageEffects = document.getElementById("damageEffects").checked;
    var it = "exports." + exportName + " = {\n"
    if (parent !== "") {
    it += "   PARENT: [exports." + parent + "],\n"
    }
    it += "   LABEL: \'" + label + "\',\n"
    if (type != "tank"||parent != "genericTank") {
        it += "   TYPE: \'" + type + "\',\n"
    }
    if (shape != "0"||parent != "genericTank") {
        it += "   SHAPE: " + shape + ",\n"
    }
    if (damageClass != "2"||parent != "genericTank") {
        it += "   DAMAGE_CLASS: " + damageClass + ",\n";
    }
    if (danger != "5"||parent != "genericTank") {
        it += "   DANGER: " + danger + ",\n";
    }
    if (motionType != "motor"||parent != "genericTank") {
        it += "   MOTION_TYPE: \'" + motionType + "\',\n";
    }
    if (facingType != "toTarget"||parent != "genericTank") {
        it += "   FACING_TYPE: \'" + facingType + "\',\n";
    }
    if (document.getElementById("sizeNumInput").value != "12"||parent != "genericTank") {
    it += "   SIZE: " + document.getElementById("sizeNumInput").value + ",\n"
    }
    if (maxChildren != "0"||parent != "genericTank") {
        it += "   MAX_CHILDREN: " + maxChildren + ",\n";
    }
    if (damageEffects != false||parent != "genericTank") {
        it += "   DAMAGE_EFFECTS: " + damageEffects + ",\n";
    }
    if (colorID != -1) {
        it += "   COLOR: " + colorID + ",\n";
    }
    if (document.getElementById("accelerationenable").checked||document.getElementById("speedenable").checked||document.getElementById("healthenable").checked||document.getElementById("damageenable").checked||document.getElementById("penetrationenable").checked||document.getElementById("shieldenable").checked||document.getElementById("regenenable").checked||document.getElementById("fovenable").checked||document.getElementById("densityenable").checked||document.getElementById("pushabilityenable").checked||document.getElementById("heteroenable").checked) {
        it += "   BODY: {\n"
            if (document.getElementById("accelerationenable").checked) {
                if (document.getElementById("accelerationbasemulti").checked) {
                    if (document.getElementById("acceleration").value!=1) {
                        it += "      ACCELERATION: base.ACCEL * " + document.getElementById("acceleration").value + ",\n";
                    } else {
                        it += "      ACCELERATION: base.ACCEL,\n";
                    }
                } else {
                    it += "      ACCELERATION: " + document.getElementById("acceleration").value + ",\n";
                }
            }
            if (document.getElementById("speedenable").checked) {
                if (document.getElementById("speedbasemulti").checked) {
                    if (document.getElementById("speed").value!=1) {
                        it += "      SPEED: base.SPEED * " + document.getElementById("speed").value + ",\n";
                    } else {
                        it += "      SPEED: base.SPEED,\n";
                    }
                } else {
                    it += "      SPEED: " + document.getElementById("speed").value + ",\n";
                }
            }
            if (document.getElementById("healthenable").checked) {
                if (document.getElementById("healthbasemulti").checked) {
                    if (document.getElementById("health").value!=1) {
                        it += "      HEALTH: base.HEALTH * " + document.getElementById("health").value + ",\n";
                    } else {
                        it += "      HEALTH: base.HEALTH,\n";
                    }
                } else {
                    it += "      HEALTH: " + document.getElementById("health").value + ",\n";
                }
            }
            if (document.getElementById("damageenable").checked) {
                if (document.getElementById("damagebasemulti").checked) {
                    if (document.getElementById("damage").value!=1) {
                        it += "      DAMAGE: base.DAMAGE * " + document.getElementById("damage").value + ",\n";
                    } else {
                        it += "      DAMAGE: base.DAMAGE,\n";
                    }
                } else {
                    it += "      DAMAGE: " + document.getElementById("damage").value + ",\n";
                }
            }
            if (document.getElementById("penetrationenable").checked) {
                if (document.getElementById("penetrationbasemulti").checked) {
                    if (document.getElementById("penetration").value!=1) {
                        it += "      PENETRATION: base.PENETRATION * " + document.getElementById("penetration").value + ",\n";
                    } else {
                        it += "      PENETRATION: base.PENETRATION,\n";
                    }
                } else {
                    it += "      PENETRATION: " + document.getElementById("penetration").value + ",\n";
                }
            }
            if (document.getElementById("shieldenable").checked) {
                if (document.getElementById("shieldbasemulti").checked) {
                    if (document.getElementById("shield").value!=1) {
                        it += "      SHIELD: base.SHIELD * " + document.getElementById("shield").value + ",\n";
                    } else {
                        it += "      SHIELD: base.SHIELD,\n";
                    }
                } else {
                    it += "      SHIELD: " + document.getElementById("shield").value + ",\n";
                }
            }
            if (document.getElementById("regenenable").checked) {
                if (document.getElementById("regenbasemulti").checked) {
                    if (document.getElementById("regen").value!=1) {
                        it += "      REGEN: base.REGEN * " + document.getElementById("regen").value + ",\n";
                    } else {
                        it += "      REGEN: base.REGEN,\n";
                    }
                } else {
                    it += "      REGEN: " + document.getElementById("regen").value + ",\n";
                }
            }
            if (document.getElementById("fovenable").checked) {
                if (document.getElementById("fovbasemulti").checked) {
                    if (document.getElementById("fov").value!=1) {
                        it += "      FOV: base.FOV * " + document.getElementById("fov").value + ",\n";
                    } else {
                        it += "      FOV: base.FOV,\n";
                    }
                } else {
                    it += "      FOV: " + document.getElementById("fov").value + ",\n";
                }
            }
            if (document.getElementById("densityenable").checked) {
                if (document.getElementById("densitybasemulti").checked) {
                    if (document.getElementById("density").value!=1) {
                        it += "      DENSITY: base.DENSITY * " + document.getElementById("density").value + ",\n";
                    } else {
                        it += "      DENSITY: base.DENSITY,\n";
                    }
                } else {
                    it += "      DENSITY: " + document.getElementById("density").value + ",\n";
                }
            }
            if (document.getElementById("pushabilityenable").checked) {
                it += "      PUSHABLE: " + document.getElementById("pushability").value + ",\n";
            }
            if (document.getElementById("heteroenable").checked) {
                it += "      HETERO: " + document.getElementById("hetero").value + ",\n";
            }
        it += "   },\n"
    }
    if (guns.length > 0) {
        it += "   GUNS: [ ";
        for (var i = 0; i < guns.length; i++) {
            var [LENGTH, WIDTH, ASPECT, X, Y, ANGLE, DELAY] = guns[i].POSITION;
            it += "{\n         POSITION: [ " + LENGTH + ", " + WIDTH + ", " + ASPECT + ", " + X + ", " + Y + ", " + ANGLE + ", " + DELAY + ", ],\n";
            var showProperties = false;
            //PROPERTIES is an object
            for (var j = 0; j < Object.keys(guns[i].PROPERTIES).length; j++) {
                if (Object.values(guns[i].PROPERTIES)[j] != null) {
                    showProperties = true;
                    break;
                }
            }
            if (showProperties) {
                it += "         PROPERTIES: {\n";
                if (guns[i].PROPERTIES.SHOOT_SETTINGS!=null) {
                    it += "            SHOOT_SETTINGS: combineStats([" + guns[i].PROPERTIES.SHOOT_SETTINGS + "]),\n";
                }
                if (guns[i].PROPERTIES.TYPE!=null) {
                    it += "            TYPE: exports." + guns[i].PROPERTIES.TYPE + ",\n";
                }
                if (guns[i].PROPERTIES.LABEL!=null) {
                    it += "            LABEL: \'" + guns[i].PROPERTIES.LABEL + "\',\n";
                }
                it += "         }, }, ";
            } else {
            it += "         }, ";
            }
        }
        
        it += "\n     ],\n";
    }

    it += "};\n";
    return it;
}

function importTank() {
    var prompt = window.prompt("Paste the tank code here:");
    if (prompt != null) {
    }
}

/*BODY: { // def
        ACCELERATION: base.ACCEL,
        SPEED: base.SPEED,
        HEALTH: base.HEALTH, 
        DAMAGE: base.DAMAGE, 
        PENETRATION: base.PENETRATION, 
        SHIELD: base.SHIELD,
        REGEN: base.REGEN,
        FOV: base.FOV,
        DENSITY: base.DENSITY,
        PUSHABILITY: 0.9,
        HETERO: 3,
    },
*/

//body functions
//Just updates our varibles for the export function from the html
function updateAcceleration() {
    if (document.getElementById("accelerationenable").checked) {
        document.getElementById("accelerationbasemulti").disabled = false;
        document.getElementById("acceleration").disabled = false;
    } else {
        document.getElementById("accelerationbasemulti").disabled = true;
        document.getElementById("acceleration").disabled = true;
    }
    body.ACCELERATION = document.getElementById("acceleration").value;
    if (document.getElementById("accelerationbasemulti").checked) {
        body.ACCELERATION = base.ACCEL * document.getElementById("accelerationbasemulti").value;
    }
}
function updateSpeed() {
    if (document.getElementById("speedenable").checked) {
        document.getElementById("speedbasemulti").disabled = false;
        document.getElementById("speed").disabled = false;
    } else {
        document.getElementById("speedbasemulti").disabled = true;
        document.getElementById("speed").disabled = true;
    }
    body.SPEED = document.getElementById("speed").value;
    if (document.getElementById("speedbasemulti").checked) {
        body.SPEED = base.SPEED * document.getElementById("speedbasemulti").value;
    }
}
function updateHealth() {
    if (document.getElementById("healthenable").checked) {
        document.getElementById("healthbasemulti").disabled = false;
        document.getElementById("health").disabled = false;
    } else {
        document.getElementById("healthbasemulti").disabled = true;
        document.getElementById("health").disabled = true;
    }
    body.HEALTH = document.getElementById("health").value;
    if (document.getElementById("healthbasemulti").checked) {
        body.HEALTH = base.HEALTH * document.getElementById("healthbasemulti").value;
    }
}
function updateDamage() {
    if (document.getElementById("damageenable").checked) {
        document.getElementById("damagebasemulti").disabled = false;
        document.getElementById("damage").disabled = false;
    } else {
        document.getElementById("damagebasemulti").disabled = true;
        document.getElementById("damage").disabled = true;
    }
    body.DAMAGE = document.getElementById("damage").value;
    if (document.getElementById("damagebasemulti").checked) {
        body.DAMAGE = base.DAMAGE * document.getElementById("damagebasemulti").value;
    }
}
function updatePenetration() {
    if (document.getElementById("penetrationenable").checked) {
        document.getElementById("penetrationbasemulti").disabled = false;
        document.getElementById("penetration").disabled = false;
    } else {
        document.getElementById("penetrationbasemulti").disabled = true;
        document.getElementById("penetration").disabled = true;
    }
    body.PENETRATION = document.getElementById("penetration").value;
    if (document.getElementById("penetrationbasemulti").checked) {
        body.PENETRATION = base.PENETRATION * document.getElementById("penetrationbasemulti").value;
    }
}
function updateShield() {
    if (document.getElementById("shieldenable").checked) {
        document.getElementById("shieldbasemulti").disabled = false;
        document.getElementById("shield").disabled = false;
    } else {
        document.getElementById("shieldbasemulti").disabled = true;
        document.getElementById("shield").disabled = true;
    }
    body.SHIELD = document.getElementById("shield").value;
    if (document.getElementById("shieldbasemulti").checked) {
        body.SHIELD = base.SHIELD * document.getElementById("shieldbasemulti").value;
    }
}
function updateRegen() {
    if (document.getElementById("regenenable").checked) {
        document.getElementById("regenbasemulti").disabled = false;
        document.getElementById("regen").disabled = false;
    } else {
        document.getElementById("regenbasemulti").disabled = true;
        document.getElementById("regen").disabled = true;
    }
    body.REGEN = document.getElementById("regen").value;
    if (document.getElementById("regenbasemulti").checked) {
        body.REGEN = base.REGEN * document.getElementById("regenbasemulti").value;
    }
}
function updateFOV() {
    if (document.getElementById("fovenable").checked) {
        document.getElementById("fovbasemulti").disabled = false;
        document.getElementById("fov").disabled = false;
    } else {
        document.getElementById("fovbasemulti").disabled = true;
        document.getElementById("fov").disabled = true;
    }
    body.FOV = document.getElementById("fov").value;
    if (document.getElementById("fovbasemulti").checked) {
        body.FOV = base.FOV * document.getElementById("fovbasemulti").value;
    }
}
function updateDensity() {
    if (document.getElementById("densityenable").checked) {
        document.getElementById("densitybasemulti").disabled = false;
        document.getElementById("density").disabled = false;
    } else {
        document.getElementById("densitybasemulti").disabled = true;
        document.getElementById("density").disabled = true;
    }
    body.DENSITY = document.getElementById("density").value;
    if (document.getElementById("densitybasemulti").checked) {
        body.DENSITY = base.DENSITY * document.getElementById("densitybasemulti").value;
    }
}
function updatePushability() {
    if (document.getElementById("pushabilityenable").checked) {
        document.getElementById("pushability").disabled = false;
    } else {
        document.getElementById("pushability").disabled = true;
    }
    body.PUSHABILITY = document.getElementById("pushability").value;
}
function updateHetero() {
    if (document.getElementById("heteroenable").checked) {
        document.getElementById("hetero").disabled = false;
    } else {
        document.getElementById("hetero").disabled = true;
    }
    body.HETERO = document.getElementById("hetero").value;
}


function drawFacingLine(){  //draws a red line from the center to the right edge of the screen
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.moveTo(canvas.width/2, canvas.height/2);
    ctx.lineTo(canvas.width, canvas.height/2);
    ctx.stroke();
}
        

function addRandomGuns(){
    if (mouseDown) {
        guns.push({ /***            LENGTH          WIDTH                   ASPECT                      X                          Y                       ANGLE           DELAY */
            POSITION: [      Math.random()*24,     Math.random()*12,    Math.random()*2,      12*Math.random()-0.5*2,     12*Math.random()-0.5*2,    360*Math.random(),     0.5,  ],  
        })
    }
}

function closestCirclePoint(x, y, cx, cy, r) { //finds the closest point on a circle to a point
    var dx = x - cx;
    var dy = y - cy;
    var dist = Math.sqrt(dx * dx + dy * dy);
    var angle = Math.acos(dx / dist);
    if (dy < 0) {
        angle = -angle;
    }
    return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

var gunLength = 18
var gunWidth = 8
var gunAspect = 1
var gunX = 0
var gunY = 0
var gunDelay = 0

function updateGunLengthSlider() {
    document.getElementById("gunLengthNum").value = document.getElementById("gunLength").value;
}
function updateGunWidthSlider() {
    document.getElementById("gunWidthNum").value = document.getElementById("gunWidth").value;
}
function updateGunXSlider() {
    document.getElementById("gunXNum").value = document.getElementById("gunX").value;
}
function updateGunYSlider() {
    document.getElementById("gunYNum").value = document.getElementById("gunY").value;
}

function updateGunLengthNum() {
    document.getElementById("gunLength").value = document.getElementById("gunLengthNum").value;
}
function updateGunWidthNum() {
    document.getElementById("gunWidth").value = document.getElementById("gunWidthNum").value;
}
function updateGunXNum() {
    document.getElementById("gunX").value = document.getElementById("gunXNum").value;
}
function updateGunYNum() {
    document.getElementById("gunY").value = document.getElementById("gunYNum").value;
}

function updateGunSettings() {
    gunLength = parseFloat(document.getElementById("gunLengthNum").value);
    gunWidth = parseFloat(document.getElementById("gunWidthNum").value);
    gunAspect = parseFloat(document.getElementById("gunAspect").value);
    gunX = parseFloat(document.getElementById("gunXNum").value);
    gunY = parseFloat(document.getElementById("gunYNum").value);
    gunDelay = parseFloat(document.getElementById("gunDelay").value);
}

function updateShootSettingsEnable(){
    var shootSettings = document.getElementById("shootSettings");
    var shootType = document.getElementById("shootType");
    var shootSettingsEnable = document.getElementById("shootSettingsEnable");
    shootSettings.disabled = !shootSettingsEnable.checked;
    shootType.disabled = !shootSettingsEnable.checked;
}

function updateShootLabelEnable(){
    var shootLabel = document.getElementById("shootLabel");
    var shootLabelEnable = document.getElementById("shootLabelEnable");
    shootLabel.disabled = !shootLabelEnable.checked;
}


var highlightGunID = -1;

function offsetDelay(){
    gunDelay += parseFloat(document.getElementById("delayOffset").value);
    gunDelay = gunDelay%1
    gunDelay = Math.round(gunDelay*100000)/100000
    document.getElementById("gunDelay").value = gunDelay;
}

function updateDelayOffset(){
    gunDelay = -parseFloat(document.getElementById("delayOffset").value)
    document.getElementById("gunDelay").value = gunDelay;
}

function barrelEditor() { //place guns on mouse down
    var mirroredGuns = document.getElementById("mirrorGuns").checked;
    //check if the mouse is actually inside the canvas
    if (mouseX < canvas.width && mouseY < canvas.height && mouseX > 0 && mouseY > 0) {  
        var GNPLCgunAngle = Math.atan2(mouseY - canvas.height/2, mouseX - canvas.width/2);
        var GNPLCgunAngle = GNPLCgunAngle * (180 / Math.PI);
        //snap angle to 7.5 degrees if holding shift
        if (keys["Shift"]) {
            GNPLCgunAngle = Math.round(GNPLCgunAngle / 7.5) * 7.5;
        }
        GNPLCgunAngle = Math.round(GNPLCgunAngle / 0.5) * 0.5;
        ctx.fillStyle = getColorTransparent("#ff0000")
        ctx.strokeStyle = "#FF0000";
        if (highlightGunID == -1) {
        drawGhostGun(  gunLength,     gunWidth,      gunAspect,    gunX,  gunY,  GNPLCgunAngle,      gunDelay,)
        if(mirroredGuns){drawGhostGun(  gunLength,     gunWidth,      gunAspect,    gunX,  -gunY,  -GNPLCgunAngle,      gunDelay,)}
        }
        if (isMouseJustDown()) {
            offsetDelay()
            guns.push(/***     LENGTH              WIDTH     ASPECT            X      Y        ANGLE             DELAY */
                { POSITION:   [  gunLength,     gunWidth,      gunAspect,    gunX,  gunY,  GNPLCgunAngle,      gunDelay,   ],
                  PROPERTIES: {
                    SHOOT_SETTINGS: shootSettings,
                    TYPE: shootType,
                    LABEL: shootLabel,
                }, }, 
            )

            if(mirroredGuns){offsetDelay(); guns.push(/***     LENGTH              WIDTH     ASPECT            X      Y        ANGLE             DELAY */
                { POSITION:   [  gunLength,     gunWidth,      gunAspect,    gunX,  -gunY,  -GNPLCgunAngle,      gunDelay,   ], 
                  PROPERTIES: {
                  SHOOT_SETTINGS: shootSettings,
                  TYPE: shootType,
                  LABEL: shootLabel,
                }, }, 
            )}
            gunSelection()
            }
    } else {
        ctx.fillStyle = "#0000FF77";
        ctx.strokeStyle = "#0000FF";
        if (highlightGunID == -1) {
                         drawGhostGun(  gunLength,     gunWidth,      gunAspect,    gunX,  gunY,   0,      gunDelay,)
        if(mirroredGuns){drawGhostGun(  gunLength,     gunWidth,      gunAspect,    gunX,  -gunY,  0,      gunDelay,)}
        }
    }
    if (highlightGunID != -1) {
        ctx.fillStyle = "#00FF00"//"rgba(0,255,0,"+(Math.cos(timer/30)+1)/5+")";
        ctx.strokeStyle = "#00FF0077";
        var [highlightLength, highlightWidth, highlightAspect, highlightX, highlightY, highlightAngle, highlightDelay] = guns[highlightGunID].POSITION;
        drawGhostGun(  highlightLength,     highlightWidth,      highlightAspect,    highlightX,  highlightY,  highlightAngle,   highlightDelay,)
    }
}

function gunSelection(){//Adds an option to the "guns" select box for every gun in the guns array
    var gunsSelect = document.getElementById("guns");
    gunsSelect.disabled = false;

    while (gunsSelect.options.length > 0) {
        gunsSelect.remove(0);
    }

    var selection = document.createElement("option");
    selection.value = "selection";
    selection.hidden = true;
    selection.disabled = true;
    selection.selected = true;
    selection.innerHTML = "Select A Gun";
    gunsSelect.appendChild(selection);

    var noGuns = document.createElement("option");
    noGuns.value = "YOU SHOULDNT SEE THIS BALLS BALLS BALLS";
    noGuns.hidden = true;
    noGuns.disabled = true;
    noGuns.innerHTML = "No Guns";
    gunsSelect.appendChild(noGuns);

    for (var i = 0; i < guns.length; i++) {
        var option = document.createElement("option");
        option.text = "Gun " + (i + 1);
        if (guns[i].PROPERTIES.LABEL!=null&&guns[i].PROPERTIES.LABEL!=='') {
            option.text += " ("+guns[i].PROPERTIES.LABEL+")";
        } else {
            option.text += " (Unnamed)";
        }
        option.value = i;
        gunsSelect.add(option);
    }
}

//ideally it would be nice to be able to select a gun by clicking on it, but I'm not sure how to do that
//for now i want to have the dropdown highlight the gun just by hovering over the option instead of when the popup is open

var selectedGun = -1;
function updateGunsDropdown() {
    var gunsSelect = document.getElementById("guns");
    if (gunsSelect.selectedIndex == 0) {
        return;
    }
    selectedGun = gunsSelect.selectedIndex;
    console.log(selectedGun)
    //change the dropdown back to select a gun, or if there are no guns, change it back to no guns
    if (guns.length == 0) {
        gunsSelect.selectedIndex = 1;
        gunsSelect.disabled = true;
    } else {
        gunsSelect.selectedIndex = 0;
        document.getElementById("gunPopup").style.display = "block";
        ignoreInput = true;
        highlightGunID = selectedGun-2;
    }
}

function cancelGunPopup() {
    document.getElementById("gunPopup").style.display = "none";
    ignoreInput = false;
    highlightGunID = -1;
}

function deleteGun() {
    var gunsSelect = document.getElementById("guns");
    guns.splice(selectedGun-2, 1);
    gunSelection();
    updateGunsDropdown();
    cancelGunPopup() 
    if (guns.length == 0) {
        gunsSelect.selectedIndex = 1;
        gunsSelect.disabled = true;
    }
}

function drawLoop(){ //Main loop that draws everything
    let screenshotMode = document.getElementById("screenshotMode").checked
    //fullscreenCanvas()
    //addRandomGuns()
    timer++;
    ctx.fillStyle = color.normal.vlgrey
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (!screenshotMode){
    drawFacingLine();
    }
    ctx.fillStyle = barrelColor
    ctx.strokeStyle = getColorDark(barrelColor);
    drawGuns()
    if (!screenshotMode){
    barrelEditor()
    }
    if (currentColor != "default") {
    ctx.fillStyle = currentColor;
    ctx.strokeStyle = getColorDark(currentColor);
    } else {
        ctx.fillStyle = color.normal.blue;
        ctx.strokeStyle = getColorDark(color.normal.blue);
    }
    ctx.lineWidth = 8;
    drawPoly(ctx, canvas.width / 2, canvas.height / 2, size*2.8, Math.round(shape), 0, true);
    //the size of the tank is an arbitrary value, need to figure out how the game actually determines what size to draw the tank
    document.getElementById("exportCode").value = exportTank();
    requestAnimationFrame(drawLoop);
}
drawLoop();
