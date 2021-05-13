// Variables related to Rendering
document.getElementById("screen").width = '64';
document.getElementById("screen").height = '32';
var canvas = document.getElementById("screen");
var ctx = canvas.getContext('2d');


// Variables related to Chip-8
var instructionsRan;
var RAM = new Uint8Array(0x1000);
var R = new Uint8Array(0x8);
for(var x = 0; x < 8; x++)
{
    R[x] = 0;
}

var display = new Array(128);
for(var i = 0; i < display.length; i++)
{
    display[i] = new Array(64);
}

var displayRGB = new Array(128);
for(var i = 0; i < displayRGB.length; i++)
{
    displayRGB[i] = new Array(64);
}

var controls = new Array(16);
var quirks;
var quirksJ;
var quirksL;
var quirksS;

window.addEventListener("keyup", function (event) {
    switch(event.key)
    {
        case '1': // 1
            controls[0] = 1;
        break;

        case '2': // 2
            controls[1] = 1;
        break;

        case '3': // 3
            controls[2] = 1;
        break;

        case '4': // 4
            controls[3] = 1;
        break;

        case 'q': // Q
            controls[4] = 1;
        break;

        case 'w': // W
            controls[5] = 1;
        break;

        case 'e': // E
            controls[6] = 1;
        break;

        case 'r': // R
            controls[7] = 1;
        break;

        case 'a': // A
            controls[8] = 1;
        break;

        case 's': // S
            controls[9] = 1;
        break;

        case 'd': // D
            controls[10] = 1;
        break;

        case 'f': // F
            controls[11] = 1;
        break;

        case 'z': // Z
            controls[12] = 1;
        break;

        case 'x': // X
            controls[13] = 1;
        break;

        case 'c': // C
            controls[14] = 1;
        break;

        case 'v': // V
            controls[15] = 1;
        break;
    }
}, true);

window.addEventListener("keypress", function (event) {
    if(event.defaultPrevented)
    {
        return;
    }

    switch(event.key)
    {
        case '1': // 1
            controls[0] = 0;
        break;

        case '2': // 2
            controls[1] = 0;
        break;

        case '3': // 3
            controls[2] = 0;
        break;

        case '4': // 4
            controls[3] = 0;
        break;

        case 'q': // Q
            controls[4] = 0;
        break;

        case 'w': // W
            controls[5] = 0;
        break;

        case 'e': // E
            controls[6] = 0;
        break;

        case 'r': // R
            controls[7] = 0;
        break;

        case 'a': // A
            controls[8] = 0;
        break;

        case 's': // S
            controls[9] = 0;
        break;

        case 'd': // D
            controls[10] = 0;
        break;

        case 'f': // F
            controls[11] = 0;
        break;

        case 'z': // Z
            controls[12] = 0;
        break;

        case 'x': // X
            controls[13] = 0;
        break;

        case 'c': // C
            controls[14] = 0;
        break;

        case 'v': // V
            controls[15] = 0;
        break;
    }
}, true);


var frameLength = 15;
var V = new Uint8Array(0x10);
var breakpoint;
var opcode = new Uint16Array(1);
var I = new Uint16Array(1);
var dTimer = new Uint8Array(1);
var sTimer = new Uint8Array(1);
var PC = new Uint16Array(1);
var pPC = new Uint16Array(1);
var SP = new Uint8Array(1);
var spStack = new Uint16Array(0x10);
var byteGet = new Uint8Array(8);
byteGet[0] = 0x1;
byteGet[1] = 0x2;
byteGet[2] = 0x4;
byteGet[3] = 0x8;
byteGet[4] = 0x10;
byteGet[5] = 0x20;
byteGet[6] = 0x40;
byteGet[7] = 0x80;
byteGet[8] = 0x100;
byteGet[9] = 0x200;
byteGet[10] = 0x400;
byteGet[11] = 0x800;
byteGet[12] = 0x1000;
byteGet[13] = 0x2000;
byteGet[14] = 0x4000;
byteGet[15] = 0x8000;
var font = [
	0xF0, 0x90, 0x90, 0x90, 0xF0,		// 0
	0x20, 0x60, 0x20, 0x20, 0x70,		// 1
	0xF0, 0x10, 0xF0, 0x80, 0xF0,		// 2
	0xF0, 0x10, 0xF0, 0x10, 0xF0,		// 3
	0x90, 0x90, 0xF0, 0x10, 0x10,		// 4
	0xF0, 0x80, 0xF0, 0x10, 0xF0,		// 5
	0xF0, 0x80, 0xF0, 0x90, 0xF0,		// 6
	0xF0, 0x10, 0x20, 0x40, 0x40,		// 7
	0xF0, 0x90, 0xF0, 0x90, 0xF0,		// 8
	0xF0, 0x90, 0xF0, 0x10, 0xF0,		// 9
	0xF0, 0x90, 0xF0, 0x90, 0x90,		// A
	0xE0, 0x90, 0xE0, 0x90, 0xE0,		// B
	0xF0, 0x80, 0x80, 0x80, 0xF0,		// C
	0xE0, 0x90, 0x90, 0x90, 0xE0,		// D
	0xF0, 0x80, 0xF0, 0x80, 0xF0,		// E
	0xF0, 0x80, 0xF0, 0x80, 0x80		// F
];
var controlLookup = [
    13, // 0 = 
    0, // 1 = 0
    1, // 2 = 1
    2, // 3 = 2
    4, // 4 = 5
    5, // 5 = 6
    6, // 6 = 7
    8, // 7 = 8
    9, // 8 = 9
    10, // 9 = A
    12, // A = 12
    14, // B =
    3, // C =
    7, // D =
    11, // E =
    15 // F =
];
var forceRender = false;
var getScreenX = 64;
var getScreenY = 32;

function runOpcode()
{
    switch(opcode[0] & 0xF000)
    {
        case 0x0000:
            switch(opcode[0] & 0x00FF)
            {
                case 0xE0:
                    CLS();
                break;

                case 0xEE:
                    RET();
                break;

                case 0xFB:
                    SCR();
                break;

                case 0xFC:
                    SCL();
                break;

                case 0xFE:
                    DECM();
                break;

                case 0xFF:
                    EECM();
                break;

                default:
                    alert("Unknown Opcode 0x" + opcode[0].toString(16));
                    romLoaded = false;
                break;
            }
        break;

        case 0x1000:
            JP();
        break;

        case 0x2000:
            CALL();
        break;

        case 0x3000:
            SEVXB();
        break;

        case 0x4000:
            SNEVXB();
        break;

        case 0x5000:
            SEVXVY();
        break;

        case 0x6000:
            LDVXB();
        break;

        case 0x7000:
            ADDVXB();
            //PC[0] += 2;
        break;

        case 0x8000:
            switch(opcode[0] & 0xF)
            {
                case 0:
                    LDVXVY();
                break;

                case 1:
                    ORVXVY();
                break;

                case 2:
                    ANDVXVY();
                break;

                case 3:
                    XORVXVY();
                break;

                case 4:
                    ADDVXVY();
                break;

                case 5:
                    SUBVXVY();
                break;

                case 6:
                    SHRVXVY();
                break;

                case 7:
                    SUBNVXVY();
                break;

                case 0xE:
                    SHLVXVY();
                break;

                default:
                    alert("Unknown Opcode 0x" + opcode[0].toString(16));
                     romLoaded = false;
                break;
            }
        break;

        case 0x9000:
            SNE();
        break;

        case 0xA000:
            LDI();
        break;

        case 0xB000:
            JPV0();
        break;

        case 0xC000:
            RNDVXB();
        break;

        case 0xD000:
            DRW();
        break;

        case 0xE000:
            switch(opcode[0] & 0x00FF)
            {
                case 0x9E:
                    SKP();
                break;

                case 0xA1:
                    SKNP();
                break;

                default:
                    alert("Unknown Opcode 0x" + opcode[0].toString(16));
                    romLoaded = false;
                break;
            }
        break;

        case 0xF000:
            switch(opcode[0] & 0x00FF)
            {

                case 0x07:
                    LDVXDT();
                break;

                case 0x0A:
                    LDVXK();
                break;

                case 0x15:
                    LDDTVX();
                break;

                case 0x18:
                    LDSTVX();
                break;

                case 0x1E:
                    ADDIVX();
                break;

                case 0x29:
                    LDFVX();
                break;

                case 0x30:
                    LDFVXS();
                break;

                case 0x33:
                    LDBVX();
                break;

                case 0x55:
                    LDIVX();
                break;

                case 0x65:
                    LDVXI();
                break;

                case 0x75:
                    SV0VXRPL();
                break;

                case 0x85:
                    RV0VXRPL();
                break;

                default:
                    alert("Unknown Opcode 0x" + opcode[0].toString(16));
                    romLoaded = false;
                break;
            }
        break;

        default:
            alert("Unknown Opcode 0x" + opcode[0].toString(16));
            romLoaded = false;
        break;
    }
}


function sChipQuirks()
{
    quirks = 1;
    quirksJ = 0;
    quirksL = 0;
    quirksS = 1;
    document.getElementById("quirks").checked = true;
    document.getElementById("quirksJ").checked = false;
    document.getElementById("quirksL").checked = false;
    document.getElementById("quirksS").checked = true;
}

// Beginning of Opcodes

function CLS()
{
    for(var y = 0; y < getScreenY; y++)
    {
        for(var x = 0; x < getScreenX; x++)
        {
            display[x][y] = 0;
        }
    }
    PC[0] += 2;
}

function RET()
{
    SP[0]--;
    PC[0] = spStack[SP[0]];
    //PC[0] += 2;
}

var screenMode = 0;

function DECM() //SCHIP
{
    sChipQuirks();
    getScreenX = 64;
    getScreenY = 32;
    screenMode = 0;
    PC[0] += 2;
    document.getElementById("screen").width = '64';
    document.getElementById("screen").height = '32';
}

function EECM() //SCHIP
{
    sChipQuirks();
    getScreenX = 128;
    getScreenY = 64;
    screenMode = 1;
    PC[0] += 2;
    document.getElementById("screen").width = '128';
    document.getElementById("screen").height = '64';
}

function SCL() //SCHIP
{
    sChipQuirks();
    if(screenMode == 0)
    {
        for(var y = 0; y < 32; y++)
        {
            for(var x = 0; x < 64; x++)
            {
                if(x < 62)
                {
                    display[x][y] = display[x + 2][y];
                }
                if(x >= 62)
                {
                    display[x][y] = 0;
                }
            }
        }
    }
    if(screenMode == 1)
    {
        for(var y = 0; y < 64; y++)
        {
            for(var x = 0; x < 128; x++)
            {
                if(x < 124)
                {
                    display[x][y] = display[x + 4][y];
                }
                if(x >= 124)
                {
                    display[x][y] = 0;
                }
            }
        }
    }
    PC[0] += 2;
}

function SCR() //SCHIP
{
    sChipQuirks();
    if(screenMode == 0)
    {
        for(var y = 0; y < 32; y++)
        {
            for(var x = 0; x < 64; x++)
            {
                if(x > 1)
                {
                    display[x][y] = display[x - 2][y];
                }
            }
        }
        for(var y = 0; y < 32; y++)
        {
            for(var x = 0; x < 2; x++)
            {
                display[x][y] = 0;
            }
        }
    }
    if(screenMode == 1)
    {
        for(var y = 0; y < 64; y++)
        {
            for(var x = 127; x != 3; x--)
            {
                if(x >= 4)
                {
                    display[x][y] = display[x - 4][y];
                }
            }
        }
        for(var y = 0; y < 64; y++)
        {
            for(var x = 0; x < 4; x++)
            {
                display[x][y] = 0;
            }
        }
    }
    PC[0] += 2;
}

function JP()
{
    PC[0] = opcode[0] & 0x0FFF;
}

function CALL()
{
    spStack[SP[0]] = PC[0] + 2;
    SP[0]++;
    PC[0] = opcode[0] & 0x0FFF;
}

function SEVXB()
{
    PC[0] += 2;
    if(V[(opcode[0] & 0x0F00) >> 8] == (opcode[0] & 0x00FF))
    {
        PC[0] += 2;
    }
}

function SNEVXB()
{
    PC[0] += 2;
    if(V[(opcode[0] & 0x0F00) >> 8] != (opcode[0] & 0x00FF))
    {
        PC[0] += 2;
    }
}

function SEVXVY()
{
    PC[0] += 2;
    if(V[(opcode[0] & 0x0F00) >> 8] == V[(opcode[0] & 0x00F0) >> 4])
    {
        PC[0] += 2;
    }
}

function LDVXB()
{
    V[(opcode[0] & 0x0F00) >> 8] = opcode[0] & 0x00FF;
    PC[0] += 2;
}

function ADDVXB()
{
    V[(opcode[0] & 0x0F00) >> 8] = V[(opcode[0] & 0x0F00) >> 8] + (opcode[0] & 0x00FF);
    PC[0] += 2;
}



function LDVXVY()
{
    V[(opcode[0] & 0x0F00) >> 8] = V[(opcode[0] & 0x00F0) >> 4];
    PC[0] += 2;
}

function ORVXVY()
{
    V[(opcode[0] & 0x0F00) >> 8] |= V[(opcode[0] & 0x00F0) >> 4];
    if(quirksL == false && (V[(opcode[0] & 0x0F00) >> 8] == 0))
    {
        V[0xF] = 1;
    }
    if(quirksL == false && (V[(opcode[0] & 0x0F00) >> 8] != 0))
    {
        V[0xF] = 0;
    }
    if(quirksL == true)
    {
        V[0xF] = 0;
    }
    PC[0] += 2;
}

function ANDVXVY()
{
    V[(opcode[0] & 0x0F00) >> 8] &= V[(opcode[0] & 0x00F0) >> 4];
    if(quirksL == false && (V[(opcode[0] & 0x0F00) >> 8] == 0))
    {
        V[0xF] = 1;
    }
    if(quirksL == false && (V[(opcode[0] & 0x0F00) >> 8] != 0))
    {
        V[0xF] = 0;
    }
    if(quirksL == true)
    {
        V[0xF] = 0;
    }
    PC[0] += 2;
}

function XORVXVY()
{
    V[(opcode[0] & 0x0F00) >> 8] ^= V[(opcode[0] & 0x00F0) >> 4];
    if(quirksL == false && (V[(opcode[0] & 0x0F00) >> 8] == 0))
    {
        V[0xF] = 1;
    }
    if(quirksL == false && (V[(opcode[0] & 0x0F00) >> 8] != 0))
    {
        V[0xF] = 0;
    }
    if(quirksL == true)
    {
        V[0xF] = 0;
    }
    PC[0] += 2;
}

function ADDVXVY()
{
    V[0xF] = 0;
    var compare1 = V[(opcode[0] & 0x0F00) >> 8];
    var compare2 = V[(opcode[0] & 0x00F0) >> 4];
    V[(opcode[0] & 0x0F00) >> 8] = V[(opcode[0] & 0x0F00) >> 8] + V[(opcode[0] & 0x00F0) >> 4];
    compare1 += compare2;
    if(compare1 > 255) // Normally I would use type casting for this, but I don't know if Javascript has typecasting, and I'll check later.
    {
        V[0xF] = 1;
    }
    PC[0] += 2;
}

function SUBVXVY()
{
    V[0xF] = 0;
    if(V[(opcode[0] & 0x0F00) >> 8] >= V[(opcode[0] & 0x00F0) >> 4]) // Normally I would use type casting for this, but I don't know if Javascript has typecasting, and I'll check later.
    {
        V[0xF] = 1;
    }
    V[(opcode[0] & 0x0F00) >> 8] -= V[(opcode[0] & 0x00F0) >> 4];
    PC[0] += 2;
}

function SHRVXVY()
{
    if(quirks == true)
    {
        V[0xF] = (V[(opcode[0] & 0x00F0) >> 4] & 1);
        V[(opcode[0] & 0x0F00) >> 8] = V[(opcode[0] & 0x00F0) >> 4] >> 1;
    }
    if(quirks == false)
    {
        V[0xF] = (V[(opcode[0] & 0x0F00) >> 8] & 1);
        V[(opcode[0] & 0x0F00) >> 8] = V[(opcode[0] & 0x0F00) >> 8] >> 1;
    }
    
    PC[0] += 2;
}

function SUBNVXVY()
{
    V[0xF] = 0;
    if(V[(opcode[0] & 0x00F0) >> 4] >= V[(opcode[0] & 0x0F00) >> 8]) // Normally I would use type casting for this, but I don't know if Javascript has typecasting, and I'll check later.
    {
        V[0xF] = 1;
    }
    V[(opcode[0] & 0x0F00) >> 8] = (V[(opcode[0] & 0x00F0) >> 4] - V[(opcode[0] & 0x0F00) >> 8]);
    PC[0] += 2;
}

function SHLVXVY()
{
    if(quirks == true)
    {
       // console.log(((opcode[0] & 0x00F0) >> 4));
        V[0xF] = ((V[(opcode[0] & 0x00F0) >> 4] & 0x80) != 0);
        V[(opcode[0] & 0x0F00) >> 8] = V[(opcode[0] & 0x00F0) >> 4] << 1;
    }
    if(quirks == false)
    {
        V[0xF] = ((V[(opcode[0] & 0x0F00) >> 8] & 0x80) != 0);
        V[(opcode[0] & 0x0F00) >> 8] = V[(opcode[0] & 0x0F00) >> 8] << 1;
    }
    PC[0] += 2;
}



function SNE()
{
    PC[0] += 2;
    if(V[(opcode[0] & 0x0F00) >> 8] != V[(opcode[0] & 0x00F0) >> 4])
    {
        PC[0] += 2;
    }
}

function LDI()
{
    I[0] = opcode[0] & 0x0FFF;
    PC[0] += 2;
}

function DRW()
{
    V[0xF] = 0;
    var x4 = 0;
    var height = 0;
    height = opcode[0] & 0x000F;
    x4 = V[(opcode[0] & 0x0F00) >> 8];
    var location = new Uint16Array(1);
    location[0] = I[0];
    var x3 = 0;
    var y2 = V[(opcode[0] & 0x00F0) >> 4];
    var width = 7;
    //printf("XY: 0x%X 0x%X 0x%X 0x%X\n", x, y2, height, location);
    /*
    if(screenMode == 0)
    {
        for(var y = y2; y < height + y2; y++)
        {
            for(var x2 = width; x2 != (0 - 1); x2--)
            {
                if(display[(x4 + x3) & 0x3F][y] != 0)
                {
                    if(((RAM[location[0]] & byteGet[x2]) != 0))
                    {
                        V[0xF] = 1;
                    }
                }
                //display[x + x3][y] = display[x + x3][y] ^ ((RAM[location[0]] & byteGet[x2]) != 0);
                display[(x4 + x3) & 0x3F][y] ^= ((RAM[location[0]] & byteGet[x2]) != 0);
                //alert("X: 0x" + (x + x3) + "  Y: 0x" + y)
                x3++;
            }
            x3 = 0;
            location[0]++;
        }
    }
    */
    //if(screenMode != 0)
    //{
        if(height == 0)
        {
            height = 16;
            width = 15;
        }
        for(var y = y2; y < height + y2; y++)
        {
            var newRow = 0;
            for(var x2 = width; x2 != (0 - 1); x2--)
            {
                if(display[(x4 + x3) & 0x7F][y % 64] != 0)
                {

                    if(width == 15)
                    {
                        if(x2 > 7)
                        {
                            var dataG = RAM[location[0]];
                        }
                        if(x2 <= 7)
                        {
                            var dataG = RAM[location[0] + 1];
                            //display[(x4 + x3) & 0x7F][y] ^= ((dataG & byteGet[x2 & 0x7]) != 0);
                        }
                    }
                    if(width != 15)
                    {
                        var dataG = RAM[location[0]];
                    }
                    if(display[(x4 + x3) & 0x7F][y % 64] == 1)
                    {
                        if(((dataG & byteGet[x2 % 8]) != 0) == 1)
                        {
                            if(newRow == 0)
                            {
                                V[0xF]++;
                                newRow = 1;
                            }
                            if(screenMode == 0)
                            {
                                V[0xF] = 1;
                            }
                        }
                    }
                }
                if(width == 15)
                {
                    if(x2 > 7)
                    {
                        var dataG = RAM[location[0]];
                    }
                    if(x2 <= 7)
                    {
                        var dataG = RAM[location[0] + 1];
                    }
                }
                if(width != 15)
                {
                    var dataG = RAM[location[0]];
                }
                display[(x4 + x3) & 0x7F][y % 64] ^= ((dataG & byteGet[x2 % 8]) != 0);
                //alert("X: 0x" + (x + x3) + "  Y: 0x" + y)
                x3++;
            }
            x3 = 0;
            location[0]++;
            if(width == 15)
            {
                location[0]++;
            }
        }
    //}

    //chip8.breakpoint = true;
    PC[0] += 2;
    //screen.convertAndRenderScreen();
}


function JPV0()
{
    if(quirksJ == false)
    {
        PC[0] = ((opcode[0] & 0x0FFF) + V[0]);
    }
    if(quirksJ == true)
    {
        PC[0] = ((opcode[0] & 0x0FFF) + V[((opcode[0] & 0x0F00) >> 8)]);
    }
    
}

function RNDVXB()
{
    V[(opcode[0] & 0x0F00) >> 8] = ((Math.random() * 256) & (opcode[0] & 0xFF));
    PC[0] += 2;
}


function SKP()
{
    //alert("KEY POLL");
    PC[0] += 2;
    //alert(V[(opcode[0] & 0x0F00) >> 8]);
    //alert(controlLookup[V[(opcode[0] & 0x0F00) >> 8]]);
    //alert(controls[controlLookup[V[(opcode[0] & 0x0F00) >> 8]]]);
    //breakpoint = 1;
    if(controls[controlLookup[V[(opcode[0] & 0x0F00) >> 8]]] == 0)
    {
        PC[0] += 2;
    }
}

function SKNP()
{
    //alert("KEY POLL2");
    PC[0] += 2;
    if(controls[controlLookup[V[(opcode[0] & 0x0F00) >> 8]]] == 1)
    {
        PC[0] += 2;
    }
}

function LDVXDT()
{
    V[(opcode[0] & 0x0F00) >> 8] = dTimer[0];
    PC[0] += 2;
}

function LDVXK()
{
    for(var x = 0; x < 16; x++)
    {
        if(controls[controlLookup[x]] == 0)
        {
            PC[0] += 2;
            V[(opcode[0] & 0x0F00) >> 8] = x;
            break;
        }
    }
}

function LDDTVX()
{
    dTimer[0] = V[(opcode[0] & 0x0F00) >> 8];
    PC[0] += 2;
}

function LDSTVX()
{
    sTimer[0] = V[(opcode[0] & 0x0F00) >> 8];
    PC[0] += 2;
}

function ADDIVX()
{
    I[0] += V[(opcode[0] & 0x0F00) >> 8];
    PC[0] += 2;
}

function LDFVX()
{
    I[0] = (( V[(opcode[0] & 0x0F00) >> 8]) * 5);
    PC[0] += 2;
}

function LDFVXS()
{
    sChipQuirks();
    I[0] = (( V[(opcode[0] & 0x0F00) >> 8]) * 10);
    PC[0] += 2;
}

function LDBVX()
{
    RAM[I[0]] = ((V[(opcode[0] & 0x0F00) >> 8] / 100) % 10);
    RAM[I[0] + 1] = ((V[(opcode[0] & 0x0F00) >> 8] / 10) % 10);
    RAM[I[0] + 2] = ((V[(opcode[0] & 0x0F00) >> 8]) % 10);
    PC[0] += 2;
}

function LDIVX()
{
    var location = new Uint16Array(1);
    location[0] = I[0];
    for(var x = 0; x <= ((opcode[0] & 0x0F00) >> 8); x++)
    {
        RAM[location[0]] = V[x];
        location[0]++;
    }
    if(quirksS == true)
    {
        I[0] = location[0];
    }
    PC[0] += 2;
}
function LDVXI()
{
    var location = new Uint16Array(1);
    location[0] = I[0];
    for(var x = 0; x <= ((opcode[0] & 0x0F00) >> 8); x++)
    {
        V[x] = RAM[location[0]];
        location[0]++;
    }
    if(quirksS == true)
    {
        I[0] = location[0];
    }
    PC[0] += 2;
}

function SV0VXRPL()
{
    sChipQuirks();
    for(var x = 0; x <= ((opcode[0] & 0x0F00) >> 8); x++)
    {
        R[x] = V[x];
    }
    PC[0] += 2;
}

function RV0VXRPL()
{
    sChipQuirks();
    for(var x = 0; x <= ((opcode[0] & 0x0F00) >> 8); x++)
    {
        V[x] = R[x];
    }
    PC[0] += 2;
}




// End of Opcodes

var romLoaded = false;

// Rom List
var fileList = [
    "rom/15PUZZLE",
    "rom/BLINKY",
    "rom/BLITZ",
    "rom/BRIX",
    "rom/CONNECT4",
    "rom/GUESS",
    "rom/HIDDEN",
    "rom/INVADERS",
    "rom/KALEID",
    "rom/MAZE",
    "rom/MERLIN",
    "rom/MISSILE",
    "rom/PONG",
    "rom/PONG2",
    "rom/PUZZLE",
    "rom/SYZYGY",
    "rom/TANK",
    "rom/TETRIS",
    "rom/TICTAC",
    "rom/UFO",
    "rom/VBRIX",
    "rom/VERS",
    "rom/WIPEOFF",
    "rom/8CE1",
    "rom/8CE2",
    "rom/8CE3",
    "rom/RPS",
    "rom/DANMAKU",
    "rom/FLIGHT",
    "rom/SNAKE",
    "rom/BadKaiJuJu.ch8",
    "rom/br8kout.ch8",
    "rom/caveexplorer.ch8",
    "rom/chipwar.ch8",
    "rom/down8.ch8",
    "rom/fuse.ch8",
    "rom/ghostEscape.ch8",
    "rom/masquer8.ch8",
    "rom/mastermind.ch8",
    "rom/mini-lights-out.ch8",
    "rom/octojam1title.ch8",
    "rom/octojam2title.ch8",
    "rom/octojam3title.ch8",
    "rom/octojam4title.ch8",
    "rom/octojam5title.ch8",
    "rom/octojam6title.ch8",
    "rom/octojam7title.ch8",
    "rom/octorancher.ch8",
    "rom/outlaw.ch8",
    "rom/petdog.ch8",
    "rom/piper.ch8",
    "rom/pumpkindressup.ch8",
    "rom/slipperyslope.ch8",
    "rom/spacejam.ch8",
    "rom/tank.ch8",
    "rom/tombstontipp.ch8",
    "rom/rockto.ch8",
    "rom/supersquare.ch8",
    "rom/turnover77.ch8",
    "rom/ultimatetictactoe.ch8",
    "rom/BLINKYS",
    "rom/DVN8",
    "rom/EATY.ch8",
    "rom/HORSE.ch8",
    "rom/MONDRIAN.ch8",
    "rom/SWEET COPTER.ch8",
    "rom/PONG1.ch8",
    "rom/BOWLING.ch8"
];

var gameDesc = [
    "Description Unfinished", // 15 Puzzle
    "A Pacman Clone for Chip-8<br>Controls:<br>3: Up<br>E: Down<br>A: Left<br>S: Right", // BLINKY
    "Description Unfinished", // BLITZ
    "Description Unfinished", // BRIX
    "Description Unfinished", // CONNECT 4
    "Description Unfinished", // GUESS
    "Description Unfinished", // HIDDEN
    "Space Invaders for the Chip-8<br>Controls:<br>Q: Move Left<br>E: Move Right<br>W: Shoot", // INVADERS
    "Description Unfinished", // KALEID
    "Description Unfinished", // MAZE
    "Description Unfinished", // MERLIN
    "Description Unfinished", // MISSILE
    "Pong for the Chip-8<br>Controls:<br>Player 1:<br>1: Up<br>Q: Down<br>Player 2:<br>4: Up<br>R: Down", // PONG
    "Pong for the Chip-8<br>Controls:<br>Player 1:<br>1: Up<br>Q: Down<br>Player 2:<br>4: Up<br>R: Down", // PONG2
    "Description Unfinished", // PUZZLE
    "Description Unfinished", // SYZYGY
    "Description Unfinished", // TANK
    "Tetris for the Chip-8<br>Controls:<br>Q: Rotate<br>W: Move Left<br>E: Move Right<br>A: Soft Drop", // TETRIS
    "Tic Tac Toe for the Chip-8<br>Controls:<br>1,2,3,Q,W,E,A,S,D: Place piece", // TICTAC
    "Description Unfinished", // UFO
    "Description Unfinished", // VBRIX
    "Description Unfinished", // VERS
    "Description Unfinished" // WIPEOFF
];

var rom;

function loadRomDrop()
{
    document.getElementById("screen").width = '64';
    document.getElementById("screen").height = '32';
    var e2 = document.getElementById("romSelect");
    var value = e2.value;

    document.getElementById("description").innerHTML = gameDesc[value];
    if(gameDesc[value] == undefined)
    {
        document.getElementById("description").innerHTML = "Description Unfinished";
    }
    
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", fileList[value], true);
    xmlHttp.responseType = "arraybuffer";
    xmlHttp.send();
    xmlHttp.onload = function (oEvent)
    {
        var arrayBuffer2 = xmlHttp.response;
        if(arrayBuffer2)
        {
            rom = new Uint8Array(arrayBuffer2);
            
        }
        romLoaded = true;

        for(var i = 0; i < rom.length; i++)
        {
            RAM[i + 0x200] = rom[i];
        }

        for(var y = 0; y < 64; y++)
        {
            for(var x = 0; x < 128; x++)
            {
                display[x][y] = 0;
            }
        }

        PC[0] = 0x200;
        screenMode = 0;
        instructionsRan = 0;
        for(var location = 0; location < 80; location++)
        {
            RAM[location] = font[location];
        }
        for(var x = 0; x < 0x10; x++)
        {
            V[x] = 0;
        }
        for(var x = 0; x < 16; x++)
        {
            controls[x] = 1;
        }
    };
    

    quirks = 0;
    quirksJ = 0;
    quirksL = 0;
    quirksS = 0;
    document.getElementById("quirks").checked = false;
    document.getElementById("quirksJ").checked = false;
    document.getElementById("quirksL").checked = false;
    document.getElementById("quirksS").checked = false;
}


function showFile(input)
{
    document.getElementById("screen").width = '64';
    document.getElementById("screen").height = '32';
    let file = input.files[0];
    let reader = new FileReader();
    reader.onload = function(e) {
        var romf = reader.result;
        rom = new Uint8Array(romf);
        romLoaded = true;
        for(var i = 0; i < rom.length; i++)
        {
            RAM[i + 0x200] = rom[i];
        }

        for(var y = 0; y < 64; y++)
        {
            for(var x = 0; x < 128; x++)
            {
                display[x][y] = 0;
            }
        }

        PC[0] = 0x200;
        screenMode = 0;
        instructionsRan = 0;
        for(var location = 0; location < 80; location++)
        {
            RAM[location] = font[location];
        }
        for(var x = 0; x < 0x10; x++)
        {
            V[x] = 0;
        }
        for(var x = 0; x < 16; x++)
        {
            controls[x] = 1;
        }

    }
    reader.readAsArrayBuffer(file);
    quirks = 0;
    quirksJ = 0;
    quirksL = 0;
    quirksS = 0;
    document.getElementById("quirks").checked = false;
    document.getElementById("quirksJ").checked = false;
    document.getElementById("quirksL").checked = false;
    document.getElementById("quirksS").checked = false;
}


function loadOpFrame()
{
    document.getElementById("perFrame").value = frameLength;
}

function saveOpFrame()
{
    frameLength = document.getElementById("perFrame").value;
}


var breakpoint = 0;

setInterval(function mainLoop(){
if(romLoaded == true)
{
    if(document.getElementById("perFrame").value != 0)
    {
        frameLength = document.getElementById("perFrame").value
    }
    document.getElementById("perFrame").value = frameLength;
    quirks = document.getElementById("quirks").checked;
    quirksJ = document.getElementById("quirksJ").checked;
    quirksL = document.getElementById("quirksL").checked;
    quirksS = document.getElementById("quirksS").checked;
    //alert(document.getElementById("quirks").checked);
    for(var l = 0; l != frameLength; l++)
    {
        opcode[0] = ((RAM[PC[0]] << 8) | (RAM[PC[0] + 1]));
        pPC[0] = PC[0];
        runOpcode();
        if(romLoaded == false)
        {
            break;
        }
        instructionsRan++;
        if(breakpoint == 1)
        {
            document.getElementById("Opcode").innerHTML = "0x" + opcode[0].toString(16);

            for(var i = 0; i < 0x10; i++)
            {
                document.getElementById("V" + i).innerHTML = "V" + i + ": 0x" + V[i].toString(16);
            }
            document.getElementById("I").innerHTML = "I: 0x" + I[0].toString(16);
            document.getElementById("PC").innerHTML = "PC: 0x" + PC[0].toString(16);
            document.getElementById("Prev PC").innerHTML = "Prev PC: 0x" + pPC[0].toString(16);
            alert("Look at Regs!");
        }
    }
    if(romLoaded == false)
    {
        document.getElementById("Opcode").innerHTML = "0x" + opcode[0].toString(16);

        for(var i = 0; i < 0x10; i++)
        {
            document.getElementById("V" + i).innerHTML = "V" + i + ": 0x" + V[i].toString(16);
        }
        document.getElementById("I").innerHTML = "I: 0x" + I[0].toString(16);
        document.getElementById("PC").innerHTML = "PC: 0x" + PC[0].toString(16);
        document.getElementById("Prev PC").innerHTML = "Prev PC: 0x" + pPC[0].toString(16);
    }
    for(var y = 0; y < getScreenY; y++)
    {
        for(var x = 0; x < getScreenX; x++)
        {
            if(display[x][y] != 0 && display[x][y] != 1)
            {
                alert("BAD DISPLAY VAR!");
                alert(display[x][y]);
            }
        }
    }
    forceRender = false;
    var imageData = ctx.getImageData(0,0,getScreenX,getScreenY);
    var data = imageData.data

    for(var y = 0; y < imageData.height; y++)
    {
        for(var x = 0; x < imageData.width; x++)
        {
            var i = ((y * imageData.width) + x) * 4;
            if(display[x][y] == 0)
            {
                data[i] = 0x00;
                data[i + 1] = 0x00;
                data[i + 2] = 0x00;
                data[i + 3] = 0xFF;
            }
            if(display[x][y] == 1)
            {
                data[i] = 0xFF;
                data[i + 1] = 0xFF;
                data[i + 2] = 0xFF;
                data[i + 3] = 0xFF;
            }
            if(display[x][y] != 0 && display[x][y] != 1 )
            {
                data[i] = 0xFF;
                data[i + 1] = 0x00;
                data[i + 2] = 0x00;
                data[i + 3] = 0xFF;
                alert("X: " + x + " Y: " + y);
            }
        }
    }

    document.getElementById("Opcode").innerHTML = "0x" + opcode[0].toString(16);

        for(var i = 0; i < 0x10; i++)
        {
            document.getElementById("V" + i).innerHTML = "V" + i + ": 0x" + V[i].toString(16);
        }
        document.getElementById("I").innerHTML = "I: 0x" + I[0].toString(16);
        document.getElementById("PC").innerHTML = "PC: 0x" + PC[0].toString(16);
        document.getElementById("Prev PC").innerHTML = "Prev PC: 0x" + pPC[0].toString(16);
    ctx.putImageData(imageData, 0, 0);
}


}, ((16.6666666666666666)))

setInterval(function updateTimer(){
    if(romLoaded == true)
    {
        if(dTimer[0] != 0)
        {
             dTimer[0]--;
         }
    }
}, (16.6666666666666666))
