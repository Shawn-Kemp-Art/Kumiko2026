document.body.innerHTML = '<style>div{color: grey;text-align:center;position:absolute;margin:auto;top:0;right:0;bottom:0;left:0;width:500px;height:100px;}</style><body><div id="loading"><p>This could take a while, please give it at least 5 minutes to render.</p><br><h1 class="spin">⏳</h1><br><h3>Press <strong>?</strong> for shortcut keys</h3><br><p><small>Output contains an embedded blueprint for creating an IRL wall sculpture</small></p></div></body>';
paper.install(window);
window.onload = function() {

document.body.innerHTML = '<style>body {margin: 0px;text-align: center;}</style><canvas resize="true" style="display:block;width:100%;" id="myCanvas"></canvas>';

setquery("fxhash",$fx.hash);
var initialTime = new Date().getTime();

//file name 
var fileName = $fx.hash;

var canvas = document.getElementById("myCanvas");

paper.setup('myCanvas');
paper.activate();

//console.log(tokenData.hash)
console.log('#'+$fx.iteration)

canvas.style.background = "white";

//Set a seed value for Perlin
var seed = Math.floor($fx.rand()*10000000000000000);

//initialize perlin noise 
var noise = new perlinNoise3d();
noise.noiseSeed(seed);


//read in query strings
var qcolor1 = "AllColors";
if(new URLSearchParams(window.location.search).get('c1')){qcolor1 = new URLSearchParams(window.location.search).get('c1')}; //colors1
var qcolor2 = "None";
if(new URLSearchParams(window.location.search).get('c2')){qcolor2 = new URLSearchParams(window.location.search).get('c2')}; //colors2
var qcolor3 = "None";
if(new URLSearchParams(window.location.search).get('c3')){qcolor3 = new URLSearchParams(window.location.search).get('c3')}; //colors3
var qcolors = R.random_int(1,6);
if(new URLSearchParams(window.location.search).get('c')){qcolors = new URLSearchParams(window.location.search).get('c')}; //number of colors
var qsize = "2";
if(new URLSearchParams(window.location.search).get('s')){qsize = new URLSearchParams(window.location.search).get('s')}; //size
var qcomplexity = R.random_int(1,15);
if(new URLSearchParams(window.location.search).get('d')){qcomplexity = new URLSearchParams(window.location.search).get('d')}; //size

var qorientation =R.random_int(1,2) < 2 ? "portrait" : "landscape";
var qframecolor = R.random_int(0,3) < 1 ? "White" : R.random_int(1,3) < 2 ? "Mocha" : "Random";

var qdensity = qcomplexity;
var qmatwidth = R.random_int(50,75);




definitions = [
    {
        id: "layers",
        name: "Layers",
        type: "number",
        default: 10,
        options: {
            min: 1,
            max: 24,
            step: 1,
        },  
    },
    {
        id: "orientation",
        name: "Orientation",
        type: "select",
        default: qorientation,
        options: {options: ["portrait", "landscape"]},
    },
    {
        id: "aspectratio",
        name: "Aspect ratio",
        type: "select",
        default: "4:5",
        options: {options: ["1:1", "2:5","3:5","4:5","54:86","296:420"]},
    },
    {
        id: "size",
        name: "Size",
        type: "select",
        default: qsize,
        options: {options: ["1", "2", "3"]},
    },
    {
        id: "colors",
        name: "Max # of colors",
        type: "number",
        default: qcolors,
        options: {
            min: 1,
            max: 6,
            step: 1,
        },  
    },
    {
        id: "colors1",
        name: "Pallete 1",
        type: "select",
        default: qcolor1,
        options: {options: palleteNames},
    },
    {
        id: "colors2",
        name: "Pallete 2",
        type: "select",
        default: qcolor2,
        options: {options: palleteNames},
    },
    {
        id: "colors3",
        name: "Pallete 3",
        type: "select",
        default: qcolor3,
        options: {options: palleteNames},
    },
    {
        id: "framecolor",
        name: "Frame color",
        type: "select",
        default: qframecolor,
        options: {options: ["Random","White","Mocha"]},
    },
    {
        id: "density",
        name: "Detail",
        type: "number",
        default: qdensity,
        options: {
            min: 1,
            max: 15,
            step: 1,
        },  
    },
    {
        id: "matwidth",
        name: "Mat size",
        type: "number",
        default: qmatwidth,
        options: {
            min: 50,
            max: 200,
            step: 10,
        },  
    },

    ]





$fx.params(definitions)
var scale = $fx.getParam('size');
var stacks = $fx.getParam('layers'); 
var numofcolors = $fx.getParam('colors');
var meshDensity = $fx.getParam("density");
console.log("density: "+meshDensity)




//Set the properties for the artwork where 100 = 1 inch
var wide = 800; 
var high = 1000; 

if ($fx.getParam('aspectratio')== "1:1"){wide = 800; high = 800};
if ($fx.getParam('aspectratio')== "2:5"){wide = 400; high = 1000};
if ($fx.getParam('aspectratio')== "3:5"){wide = 600; high = 1000};
if ($fx.getParam('aspectratio')== "4:5"){wide = 800; high = 1000};
if ($fx.getParam('aspectratio')== "54:86"){wide = 540; high = 860};
if ($fx.getParam('aspectratio')== "296:420"){wide =705; high = 1000};



var ratio = 1/scale;//use 1/4 for 32x40 - 1/3 for 24x30 - 1/2 for 16x20 - 1/1 for 8x10
var minOffset = ~~(7*ratio); //this is aproximatly .125"
var framewidth = ~~($fx.getParam('matwidth')*ratio*scale); 
var framradius = 0;


// Set a canvas size for when layers are exploded where 100=1in
var panelWide = 1600; 
var panelHigh = 2000; 
 
paper.view.viewSize.width = 2400;
paper.view.viewSize.height = 2400;


var colors = []; var palette = []; 

// set a pallete based on color schemes
var newPalette = [];
newPalette = this[$fx.getParam('colors1')].concat(this[$fx.getParam('colors2')],this[$fx.getParam('colors3')]);

//Set palette from query sting
//newPalette = this[qcolor1].concat(this[qcolor2],this[qcolor3]);


for (c=0; c<numofcolors; c=c+1){palette[c] = newPalette[R.random_int(0, newPalette.length-1)]}  
console.log(newPalette);

//randomly assign colors to layers
for (c=0; c<stacks; c=c+1){colors[c] = palette[R.random_int(0, palette.length-1)];};

//or alternate colors
p=0;for (var c=0; c<stacks; c=c+1){colors[c] = palette[p];p=p+1;if(p==palette.length){p=0};}

console.log(colors);
//p=0;for (var c=0; c<stacks; c=c+1){colors[c] = palette[p];p=p+1;if(p==palette.length){p=0};}

if ($fx.getParam('framecolor')=="White"){colors[stacks-1]={"Hex":"#FFFFFF", "Name":"Smooth White"}};
if ($fx.getParam('framecolor')=="Mocha"){colors[stacks-1]={"Hex":"#4C4638", "Name":"Mocha"}};


var woodframe = new Path();var framegap = new Path();
var fColor = frameColors[0];
fColor = {"Hex":"#60513D","Name":"Walnut"};
var frameColor = fColor.Hex;

//adjust the canvas dimensions
w=wide;h=high;
var orientation="Portrait";
 
if ($fx.getParam('orientation')=="landscape"){wide = h;high = w;orientation="Landscape";};
if ($fx.getParam('orientation')=="square"){wide = w;high = w;orientation="Square";};
if ($fx.getParam('orientation')=="portrait"){wide = w;high = h;orientation="Portrait";};



console.log(orientation+': '+~~(wide/100/ratio)+' x '+~~(high/100/ratio))  
console.log(stacks+" layers");
console.log(numofcolors+" colors");








    
//Set the line color
linecolor={"Hex":"#4C4638", "Name":"Mocha"};
//var frameColor = {"Hex":"#60513D","Name":"Walnut"},



//************* Draw the layers *************

var features = {};

sheet = []; //This will hold each layer

var px=0;var py=0;var pz=0;var prange=.3; 

// iterate through and draw each layer in the stacks
(async () => {

    paper.view.autoUpdate = false;

    for (z = 0; z < stacks; z++) {
    pz=pz+prange;

    drawFrame(z); // Draw the initial frame
    if (z!= stacks-1 ){
        
        hexGrid(z,meshDensity);var backgrounds = "Hex";
    }  

    //if (z == 0) {solid(z)}
        
    frameIt(z);// finish the layer with a final frame cleanup 

    cutMarks(z);hanger(z);// add cut marks and hanger holes
    if (z == stacks-1) {signature(z);}// sign the top layer
    var layerCenter = new Point(wide / 2, high / 2);
    var canvasCenter = new Point(paper.view.viewSize.width / 2, paper.view.viewSize.height / 2);
    sheet[z].scale(2.2, layerCenter);
    sheet[z].translate(canvasCenter.subtract(layerCenter));
    var group = new Group(sheet[z]);
    
    console.log(z)//Show layer completed in console

    paper.view.update();
    await new Promise(resolve => setTimeout(resolve, 0));
    }//end z loop

//--------- Finish up the preview ----------------------- 

    // Build the features and trigger an fxhash preview
    features = {};
    features.Size =  ~~(wide/100/ratio)+" x "+~~(high/100/ratio)+" inches";
    features.Width = ~~(wide/100/ratio);
    features.Height = ~~(high/100/ratio);
    features.Depth = stacks*0.0625;
    features.Layers = stacks;
    features.Orientation = orientation;
    features.Background = backgrounds;
    for (l=stacks;l>0;l--){
    var key = "layer: "+(stacks-l+1)
    features[key] = colors[l-1].Name
    }
    console.log(features);
    $fx.features(features);
    //$fx.preview();


    outsideframe = new Path.Rectangle(new Point(0,0),new Size(wide, high), framradius)
    sheet[stacks+1] = outsideframe;
    sheet[stacks+1].style = {fillColor: "#ffffff", strokeColor: linecolor.Hex, strokeWidth: 1*ratio,shadowColor: new Color(0,0,0,[0.3]),shadowBlur: 20,shadowOffset: new Point((stacks-z)*2.3, (stacks-z)*2.3)};
    sheet[stacks+1].scale(2.2);
    sheet[stacks+1].position = new Point(paper.view.viewSize.width/2, paper.view.viewSize.height/2);
    sheet[stacks+1].sendToBack();

    
//Begin send to studio.shawnkemp.art **************************************************************
     studioAPI.setApiBase('https://studio-shawnkemp-art.vercel.app');
     if(new URLSearchParams(window.location.search).get('skart')){sendAllExports()};
//End send to studio.shawnkemp.art **************************************************************

    paper.view.autoUpdate = true;
    paper.view.update();

    var finalTime = new Date().getTime();
    var renderTime = (finalTime - initialTime)/1000
    console.log ('this took : ' +  renderTime.toFixed(2) + ' seconds' );

        //if (testingGo == 'true'){refreshit();}

        async function refreshit() {
        //setquery("fxhash",null);
        await new Promise(resolve => setTimeout(resolve, 5000)); // 3 sec
        canvas.toBlob(function(blob) {saveAs(blob, tokenData.hash+' - '+renderTime.toFixed(0)+'secs.png');});
        await new Promise(resolve => setTimeout(resolve, 5000)); // 3 sec
        window.open('file:///Users/shawnkemp/dev/Wild%20Dahlias%20v2/index.html?testing=true', '_blank');
        }

})(); // end async IIFE


async function sendAllExports() {

    paper.view.update();
    // Send canvas as PNG
    await studioAPI.sendCanvas(myCanvas, $fx.hash, $fx.hash+".png");

    // Send SVG
    await studioAPI.sendSVG(project.exportSVG({asString: true}), $fx.hash, $fx.hash+".svg");

    // send colors
    var content = JSON.stringify(features,null,2);

    // Send text/JSON
    await studioAPI.sendText(JSON.stringify(colors), $fx.hash, "Colors-"+$fx.hash+".json");

    // 2. Add frame
    floatingframe();
    paper.view.update();
    // 3. Framed PNGs (Black, White, Walnut, Maple)
    var frameOptions = [
        { name: "Black", hex: "#1f1f1f" },
        { name: "White", hex: "#f9f9f9" },
        { name: "Walnut", hex: "#60513D" },
        { name: "Maple", hex: "#ebd9c0" }
    ];
    for (var i = 0; i < frameOptions.length; i++) {
        woodframe.style = { fillColor: frameOptions[i].hex };
        var fileName = "Framed" + frameOptions[i].name + "-" + $fx.hash;
        paper.view.update();

        await studioAPI.sendCanvas(myCanvas, $fx.hash, fileName+".png");
    }
    // 4. Remove frame
    floatingframe();
    // 5. Blueprint SVG
    for (var z = 0; z < stacks; z++) {
        sheet[z].style = {
            fillColor: null,
            strokeWidth: 0.1,
            strokeColor: lightburn[stacks - z - 1].Hex,
            shadowColor: null,
            shadowBlur: null,
            shadowOffset: null
        };
        sheet[z].selected = true;
    }
    paper.view.update();

    // Send SVG
    await studioAPI.sendSVG(project.exportSVG({asString: true}), $fx.hash, "Blueprint-" + $fx.hash+".svg");
    // 6. Plotting SVG
    for (var z = 0; z < stacks; z++) {
        sheet[z].style = {
            fillColor: null,
            strokeWidth: 0.1,
            strokeColor: plottingColors[stacks - z - 1].Hex,
            shadowColor: null,
            shadowBlur: null,
            shadowOffset: null
        };
        sheet[z].selected = true;
    }
    for (var z = 0; z < stacks; z++) {
        if (z < stacks - 1) {
            for (var zs = z + 1; zs < stacks; zs++) {
                var newSheet = clipSubtract(sheet[z], sheet[zs]);
                sheet[z].remove();
                sheet[z] = newSheet;
            }
        }
    }
    paper.view.update();
    // Send SVG
    await studioAPI.sendSVG(project.exportSVG({asString: true}), $fx.hash, "Plotting-" + $fx.hash+".svg");

    // Send features
    await studioAPI.sendFeatures($fx.hash, features);

    console.log("All exports sent!");
    studioAPI.signalComplete();
}


//vvvvvvvvvvvvvvv CLIPPER BOOLEAN ENGINE vvvvvvvvvvvvvvv
var CLIP_SCALE = 100;   // Integer precision for Clipper (100 = 0.01 unit resolution)
var CLIP_FLATTEN = 0.1; // Bezier-to-polygon tolerance (lower = smoother, more points)

function _toClipperPaths(paperItem) {
    var clone = paperItem.clone({ insert: false });
    clone.flatten(CLIP_FLATTEN);
    var children = (clone.className === 'CompoundPath') ? clone.children : [clone];
    var result = [];
    for (var i = 0; i < children.length; i++) {
        var segs = children[i].segments;
        if (segs.length < 3) continue;
        var pts = new Array(segs.length);
        for (var j = 0; j < segs.length; j++) {
            pts[j] = { X: Math.round(segs[j].point.x * CLIP_SCALE),
                       Y: Math.round(segs[j].point.y * CLIP_SCALE) };
        }
        result.push(pts);
    }
    clone.remove();
    return result;
}

function _fromClipperPaths(clipperPaths) {
    if (!clipperPaths || clipperPaths.length === 0) return new Path();
    var compound = new CompoundPath({});
    for (var i = 0; i < clipperPaths.length; i++) {
        var pts = clipperPaths[i];
        if (pts.length < 3) continue;
        var paperPts = new Array(pts.length);
        for (var j = 0; j < pts.length; j++) {
            paperPts[j] = new Point(pts[j].X / CLIP_SCALE, pts[j].Y / CLIP_SCALE);
        }
        compound.addChild(new Path({ segments: paperPts, closed: true, insert: false }));
    }
    // Use non-zero winding — matches Paper.js canvas default and Clipper's output orientation.
    // CleanPolygons removes near-degenerate edges that can cause winding flips at fine tolerances.
    ClipperLib.Clipper.CleanPolygons(clipperPaths, 0.5);
    compound.reorient(true, true);
    return compound;
}

function _clipBool(a, b, clipType) {
    var savedStyle = a.style;
    var clipper = new ClipperLib.Clipper();
    clipper.AddPaths(_toClipperPaths(a), ClipperLib.PolyType.ptSubject, true);
    clipper.AddPaths(_toClipperPaths(b), ClipperLib.PolyType.ptClip, true);
    var solution = new ClipperLib.Paths();
    clipper.Execute(clipType, solution,
        ClipperLib.PolyFillType.pftNonZero,
        ClipperLib.PolyFillType.pftNonZero);
    var result = _fromClipperPaths(solution);
    result.style = savedStyle;
    return result;
}

function clipUnite(a, b)     { return _clipBool(a, b, ClipperLib.ClipType.ctUnion); }
function clipSubtract(a, b)  { return _clipBool(a, b, ClipperLib.ClipType.ctDifference); }
function clipIntersect(a, b) { return _clipBool(a, b, ClipperLib.ClipType.ctIntersection); }
//^^^^^^^^^^^^^ END CLIPPER BOOLEAN ENGINE ^^^^^^^^^^^^^


//vvvvvvvvvvvvvvv PROJECT FUNCTIONS vvvvvvvvvvvvvvv





function hexGrid(z,across){
    //z is the layer to render it to
    //across is the number of hexs to draw across the width
    radius = ~~(wide/((3/2*across)));
    oset = ~~(radius/(stacks-1));
    ystart = ~~(high%(Math.sqrt(3)*radius))/2
    r=0;
    for (y=ystart;y<high;y=y+~~(Math.sqrt(3)*radius)/2){
        //if (r%2 == 0) {xstart=~~(3/2*radius)}else{xstart=~~(3/2*radius)*2}
        if (r%2 == 0) {xstart=~~(3/2*radius)}else{xstart=~~(3/2*radius)*-2}
        for (x=xstart;x<wide;x=x+~~(3/2*radius)*2){
            center = new Point(x, y);
            sides = 6; 
            hex=new Path.RegularPolygon(center, sides, radius);
            hex.rotate(30)
            mesh = PaperOffset.offsetStroke(hex, ~~(minOffset),{ cap: 'round' });
            hex.remove();
            join(z,mesh); 
            mesh.remove();


            var vertices = [];
            for (var i = 0; i < hex.segments.length; i++) {
            var segment = hex.segments[i];
            var vertexPoint = segment.point;
            vertices.push(vertexPoint);
            }
            //for testing

            //if (z == stacks-2){triangles(vertices,center,z)}

            //if (z == stacks-3){triangles(vertices,center,z)}
            //if (z == stacks-3){burst(vertices,center,z)}
            //if (z == stacks-3){hempleaf(vertices,center,z)}
            //if (z == stacks-3){starfish(vertices,center,z)}
            //if (z == stacks-3){flower(vertices,center,z)}
            //if (z == stacks-3){swirls(vertices,center,z)}
            //if (z == stacks-3){bows(vertices,center,z)}
            //if (z == stacks-3){petals(vertices,center,z)}
            //if (z == stacks-3){web(vertices,center,z)}


            

            if (z < stacks-1 && Math.floor(noise.get(x,y,pz)*10) > 5){triangles(vertices,center,z)}
            if (z < stacks-3 && Math.floor(noise.get(x,y,pz)*10) == 2){burst(vertices,center,z)}
            if (z < stacks-3 && Math.floor(noise.get(x,y,pz)*10) == 3){hempleaf(vertices,center,z)}
            if (z < stacks-3 && Math.floor(noise.get(x,y,pz)*10) == 4){starfish(vertices,center,z)}
            if (z < stacks-3 && Math.floor(noise.get(x,y,pz)*10) == 5){flower(vertices,center,z)}
            if (z < stacks-3 && Math.floor(noise.get(x,y,pz)*10) == 6){swirls(vertices,center,z)}
            if (z < stacks-3 && Math.floor(noise.get(x,y,pz)*10) == 7){bows(vertices,center,z)}
            if (z < stacks-3 && Math.floor(noise.get(x,y,pz)*10) == 8){petals(vertices,center,z)}
            if (z < stacks-3 && Math.floor(noise.get(x,y,pz)*10) == 9){web(vertices,center,z)}
            //if (z<stacks-3 && noise.get(x,y,z)<.4){burst(vertices,center,z)}
            //if (z<stacks-3 && noise.get(x,y,z)<.5){hempleaf(vertices,center,z)}
            //if (z<stacks-3 && noise.get(x,y,z)>.5){starfish(vertices,center,z)}
            //if (z<stacks-3 && noise.get(x,y,z)>.5){bows(vertices,center,z)}

        }
        r++
    }
}

function triangles(vertix,center,z){
    for (h=0;h<6;h++){
        lines = new Path(vertix[h],center); 
        mesh = PaperOffset.offsetStroke(lines, minOffset,{ cap: 'round' });
        lines.remove();join(z,mesh);mesh.remove();
         }
}

function flower(vertix,center,z){
    for (h=0;h<6;h++){
        a = vertix[h];
        b = vertix[h+1]; if(h==5){b = vertix[0]}
        lines = new Path.Arc(a,center,b)
        mesh = PaperOffset.offsetStroke(lines, minOffset,{ cap: 'round' });
        lines.remove();join(z,mesh);mesh.remove();
         }
}

function swirls(vertix,center,z){
    for (h=0;h<6;h++){
        a = vertix[h];
        b = vertix[h+1]; if(h==5){b = vertix[0]}
        pc = equallySpacedPointsBetween(a, b, 1);
        pc1=equallySpacedPointsBetween(pc[0], center, 2);
        lines = new Path.Arc(a,pc1[1],b)
        mesh = PaperOffset.offsetStroke(lines, minOffset,{ cap: 'round' });
        lines.remove();join(z,mesh);mesh.remove();
         }
}

function bows(vertix,center,z){
    for (h=0;h<6;h++){
        a = vertix[h];
        b = vertix[h+1]; if(h==5){b = vertix[0]}
        pc = equallySpacedPointsBetween(a, b, 1);
        pc1=equallySpacedPointsBetween(pc[0], center, 16);
        lines = new Path.Arc(a,pc1[1],b)
        mesh = PaperOffset.offsetStroke(lines, minOffset,{ cap: 'round' });
        lines.remove();join(z,mesh);mesh.remove();

        d = pc[0].getDistance(pc1[1]);
        p= equallySpacedPointsBetween(a, center, 1);
        dir = a.subtract(center);                 // direction of the line
        normal = dir.rotate(90).normalize(d);// 90° left normal of length d
        b = p[0].add(normal);         // offset point on the "left" side
        lines = new Path.Arc(a,b,center)
        mesh = PaperOffset.offsetStroke(lines, minOffset,{ cap: 'round' });
        lines.remove();join(z,mesh);mesh.remove();

        normal = dir.rotate(-90).normalize(d);// 90° left normal of length d
        b = p[0].add(normal);         // offset point on the "left" side
        lines = new Path.Arc(a,b,center)
        mesh = PaperOffset.offsetStroke(lines, minOffset,{ cap: 'round' });
        lines.remove();join(z,mesh);mesh.remove();
         }
}

function petals(vertix,center,z){
    for (h=0;h<6;h++){
        a = vertix[h];
        b = vertix[h+1]; if(h==5){b = vertix[0]}
        pc = equallySpacedPointsBetween(a, b, 1);
        pc1=equallySpacedPointsBetween(pc[0], center, 10);
        lines = new Path.Arc(a,pc1[1],b)
        mesh = PaperOffset.offsetStroke(lines, minOffset,{ cap: 'round' });
        lines.remove();join(z,mesh);mesh.remove();

        d = pc[0].getDistance(pc1[1]);
        p= equallySpacedPointsBetween(a, center, 1);
        dir = a.subtract(center);                 // direction of the line
        normal = dir.rotate(90).normalize(d);// 90° left normal of length d
        b = p[0].add(normal);         // offset point on the "left" side
        lines = new Path.Arc(a,b,center)
        mesh = PaperOffset.offsetStroke(lines, minOffset,{ cap: 'round' });
        lines.remove();join(z,mesh);mesh.remove();

        normal = dir.rotate(-90).normalize(d);// 90° left normal of length d
        b = p[0].add(normal);         // offset point on the "left" side
        lines = new Path.Arc(a,b,center)
        mesh = PaperOffset.offsetStroke(lines, minOffset,{ cap: 'round' });
        lines.remove();join(z,mesh);mesh.remove();
         }
}


function burst(vertix,center,z){
    for (h=0;h<6;h++){
        a = vertix[h];
        b = vertix[h+1]; if(h==5){b = vertix[0]}
        p = equallySpacedPointsBetween(a, b, 3);
         for (t=0;t<p.length;t++){
            lines = new Path(p[t],center); 
            mesh = PaperOffset.offsetStroke(lines, minOffset,{ cap: 'round' });
            lines.remove();join(z,mesh);mesh.remove();
         }
    }
}

function hempleaf(vertix,center,z){
    for (h=0;h<6;h++){
        a = vertix[h];
        b = vertix[h+1]; if(h==5){b = vertix[0]}
        pc = equallySpacedPointsBetween(a, b, 1);
        pc1=equallySpacedPointsBetween(pc[0], center, 4);
            lines = new Path(pc1[0],center); 
            mesh = PaperOffset.offsetStroke(lines, minOffset,{ cap: 'round' });
            lines.remove();join(z,mesh);mesh.remove();
        p1 = equallySpacedPointsBetween(a, center, 4);
        p2 = equallySpacedPointsBetween(b, center, 4);
            lines = new Path(a,pc1[0],b); 
            mesh = PaperOffset.offsetStroke(lines, minOffset,{ cap: 'round' });
            lines.remove();join(z,mesh);mesh.remove();
    }
}



function starfish(vertix,center,z){
    for (h=0;h<6;h++){
        a = vertix[h];
        b = vertix[h+1]; if(h==5){b = vertix[0]}
        pc = equallySpacedPointsBetween(a, b, 1);
            lines = new Path(pc[0],center); 
            mesh = PaperOffset.offsetStroke(lines, minOffset,{ cap: 'round' });
            lines.remove();join(z,mesh);mesh.remove();
            p1 = equallySpacedPointsBetween(a, center, 2);
            p2 = equallySpacedPointsBetween(b, center, 2);
            lines = new Path(p1[0],pc[0],p2[0]); 
            mesh = PaperOffset.offsetStroke(lines, minOffset,{ cap: 'round' });
            lines.remove();join(z,mesh);mesh.remove();
    }
}

function web(vertix,center,z){
    for (h=0;h<6;h++){
        a = vertix[h];
        b = vertix[h+1]; if(h==5){b = vertix[0]}
        c1 = vertix[h+2]; if(h==4){c1 = vertix[0]};if(h==5){c1 = vertix[1]}
        pc = equallySpacedPointsBetween(a, b, 1);
        pc2 = equallySpacedPointsBetween(pc[0], center, 2);
        pb = equallySpacedPointsBetween(b, c1, 1);
        pb1 = equallySpacedPointsBetween(pb[0], center, 2);
        //pb2 = equallySpacedPointsBetween(pb[0], center, 1);
        
        lines = new Path(pc[0],pc2[0]); 
        
        
        lines.add(pb1[0])
        //lines.add(pc4[2])
        //lines.add(pc3[0])
        mesh = PaperOffset.offsetStroke(lines, minOffset,{ cap: 'round' });
        lines.remove();join(z,mesh);mesh.remove();
         }
}

function equallySpacedPointsBetween(a, b, count) {
    let ab = b.subtract(a);
    let step = ab.divide(count + 1);
    let pts = [];
    for (let i = 1; i <= count; i++) {
      pts.push(a.add(step.multiply(i)));
    }
    return pts;
  }


//^^^^^^^^^^^^^ END PROJECT FUNCTIONS ^^^^^^^^^^^^^ 




//--------- Helper functions ----------------------- 
function floatingframe(){
    var frameWide=~~(34*ratio);var frameReveal = ~~(12*ratio);
  if (framegap.isEmpty()){
        var outsideframe = new Path.Rectangle(new Point(0, 0),new Size(~~(wide+frameReveal*2), ~~(high+frameReveal*2)), framradius)
        var insideframe = new Path.Rectangle(new Point(frameReveal, frameReveal),new Size(wide, high)) 
        framegap = clipSubtract(outsideframe, insideframe);
        outsideframe.remove();insideframe.remove();
        framegap.scale(2.2);
        framegap.position = new Point(paper.view.viewSize.width/2, paper.view.viewSize.height/2);
        framegap.style = {fillColor: '#1A1A1A', strokeColor: "#1A1A1A", strokeWidth: 1*ratio};
    } else {framegap.removeChildren()} 
    
    if (woodframe.isEmpty()){
        var outsideframe = new Path.Rectangle(new Point(0, 0),new Size(wide+frameWide*2+frameReveal*2, high+frameWide*2+frameReveal*2), framradius)
        var insideframe = new Path.Rectangle(new Point(frameWide, frameWide),new Size(wide+frameReveal*2, high+frameReveal*2)) 
        woodframe = clipSubtract(outsideframe, insideframe);
        outsideframe.remove();insideframe.remove();
        woodframe.scale(2.2);
        woodframe.position = new Point(paper.view.viewSize.width/2, paper.view.viewSize.height/2);
        var framegroup = new Group(woodframe);
        woodframe.style = {fillColor: frameColor, strokeColor: frameColor, strokeWidth: 1*ratio,shadowColor: new Color(0,0,0,[0.5]),shadowBlur: 20,shadowOffset: new Point(10*2.2, 10*2.2)};
    } else {woodframe.removeChildren()} 
    //fileName = "Framed-"+$fx.hash;
}


function rangeInt(range,x,y,z){
    var v = ~~(range-(noise.get(x,y,z)*range*2));
    return (v);
}

// Add shape s to sheet z
function join(z,s){
    var newSheet = clipUnite(sheet[z], s);
    sheet[z].remove();
    s.remove();
    sheet[z] = newSheet;
}

// Subtract shape s from sheet z
function cut(z,s){
    var newSheet = clipSubtract(sheet[z], s);
    sheet[z].remove();
    s.remove();
    sheet[z] = newSheet;
}

function drawFrame(z){
    var outsideframe = new Path.Rectangle(new Point(0, 0),new Size(wide, high), framradius)
    var insideframe = new Path.Rectangle(new Point(framewidth, framewidth),new Size(wide-framewidth*2, high-framewidth*2))
    sheet[z] = clipSubtract(outsideframe, insideframe);
    outsideframe.remove();insideframe.remove();
}


function solid(z){
    outsideframe = new Path.Rectangle(new Point(1,1),new Size(wide-1, high-1), framradius)
    var newSheet = clipUnite(sheet[z], outsideframe);
    sheet[z].remove();
    outsideframe.remove();
    sheet[z] = newSheet;
}



function frameIt(z){
        //Trim to size
        var outsideframe = new Path.Rectangle(new Point(0, 0),new Size(wide, high), framradius)
        var trimmed = clipIntersect(outsideframe, sheet[z]);
        outsideframe.remove();
        sheet[z].remove();
        sheet[z] = trimmed;

        //Make sure there is still a solid frame
        var outsideframe = new Path.Rectangle(new Point(0, 0),new Size(wide, high), framradius)
        var insideframe = new Path.Rectangle(new Point(framewidth, framewidth),new Size(wide-framewidth*2, high-framewidth*2))
        var frame = clipSubtract(outsideframe, insideframe);
        outsideframe.remove();insideframe.remove();
        var newSheet = clipUnite(sheet[z], frame);
        sheet[z].remove();
        frame.remove();
        sheet[z] = newSheet;

        sheet[z].style = {fillColor: colors[z].Hex, strokeColor: linecolor.Hex, strokeWidth: 1*ratio,shadowColor: new Color(0,0,0,[0.3]),shadowBlur: 20,shadowOffset: new Point((stacks-z)*2.3, (stacks-z)*2.3)};
}

function cutMarks(z){
    if (z<stacks-1 && z!=0) {
          for (etch=0;etch<stacks-z;etch++){
                var layerEtch = new Path.Circle(new Point(50+etch*10,25),2)
                cut(z,layerEtch)
            } 
        }
}

function signature(z){
    shawn = new CompoundPath(sig);
    shawn.strokeColor = 'green';
    shawn.fillColor = 'green';
    shawn.strokeWidth = 1;
    shawn.scale(ratio*.9)
    shawn.position = new Point(wide-framewidth-~~(shawn.bounds.width/2), high-framewidth+~~(shawn.bounds.height));
    cut(z,shawn)
}

function hanger (z){
    if (z < stacks-2 && scale>0){
        var r = 30*ratio;
        rt = 19*ratio;
        if (z<3){r = 19*ratio}
        layerEtch = new Path.Rectangle(new Point(framewidth/2, framewidth),new Size(r*2, r*3), r)
        layerEtch.position = new Point(framewidth/2,framewidth);   
        cut(z,layerEtch)

        layerEtch = new Path.Rectangle(new Point(wide-framewidth/2, framewidth),new Size(r*2, r*3), r)
        layerEtch.position = new Point(wide-framewidth/2,framewidth);   
        cut(z,layerEtch)

        layerEtch = new Path.Rectangle(new Point(wide/2, framewidth/2),new Size(r*4, r*2), r)
        layerEtch.position = new Point(wide/2,framewidth/2);   
        cut(z,layerEtch)
    }
}




//--------- Interaction functions -----------------------
var interactiontext = "Interactions\nB = Blueprint mode\nV = Export SVG\nP = Export PNG\nC = Export colors as TXT\nE = Show layers\nF = Add floating frame\nL = Format for plotting"

view.onDoubleClick = function(event) {
    alert(interactiontext);
    console.log(project.exportJSON());
    //canvas.toBlob(function(blob) {saveAs(blob, tokenData.hash+'.png');});
};

document.addEventListener('keypress', (event) => {

       //Save as SVG 
       if(event.key == "v") {
        sheet[stacks+1].remove();
            var url = "data:image/svg+xml;utf8," + encodeURIComponent(paper.project.exportSVG({asString:true}));
            var key = [];for (l=stacks;l>0;l--){key[stacks-l] = colors[l-1].Name;}; 
            var svg1 = "<!--"+key+"-->" + paper.project.exportSVG({asString:true})
            var url = "data:image/svg+xml;utf8," + encodeURIComponent(svg1);
            var link = document.createElement("a");
            link.download = fileName;
            link.href = url;
            link.click();
            }


        if(event.key == "f") {
            floatingframe();
            
        }
        
        if(event.key == "1") {
            frameColor = {"Hex":"#4C46380", "Name":"Black"};
            fileName = "FramedBlack-"+$fx.hash;
            woodframe.style = {fillColor: frameColor.Hex}
        }
        if(event.key == "2") {
            frameColor = {"Hex":"#f9f9f9","Name":"White"};
            fileName = "FramedWhite-"+$fx.hash;
            woodframe.style = {fillColor: frameColor.Hex}
        }
        if(event.key == "3") {
            frameColor = {"Hex":"#60513D","Name":"Walnut"};
            fileName = "FramedWalnut-"+$fx.hash;
            woodframe.style = {fillColor: frameColor.Hex}
        }
        if(event.key == "4") {
            frameColor = {"Hex":"#ebd9c0","Name":"Maple"};
            fileName = "FramedMaple-"+$fx.hash;
            woodframe.style = {fillColor: frameColor.Hex}
        }
            
        if(event.key == "V") {
            fileName = "Vector-"+$fx.hash;
        }   


       //Format for Lightburn
       if(event.key == "b") {
        fileName = "blueprint-"+$fx.hash;
            for (z=0;z<stacks;z++){
                sheet[z].style = {fillColor: null,strokeWidth: .1,strokeColor: lightburn[stacks-z-1].Hex,shadowColor: null,shadowBlur: null,shadowOffset: null}
                sheet[z].selected = true;}
            }

       //Format for plotting
       if(event.key == "l") {
            fileName = "Plotting-"+$fx.hash;

            for (z=0;z<stacks;z++){
            sheet[z].style = {fillColor: null,strokeWidth: .1,strokeColor: plottingColors[stacks-z-1].Hex,shadowColor: null,shadowBlur: null,shadowOffset: null}
            sheet[z].selected = true;
            }
        
            for (z=0;z<stacks;z++){
                if (z<stacks-1){
                    for (zs=z+1;zs<stacks;zs++){
                        var newSheet = clipSubtract(sheet[z], sheet[zs]);
                        sheet[z].remove();
                        sheet[z] = newSheet;
                    }
                }
                console.log("optimizing")
            }
        }

        //new hash
        if(event.key == " ") {
            setquery("fxhash",null);
            location.reload();
            }

        //help
       if(event.key == "h" || event.key == "/") {
            alert(interactiontext);
            }
             
        //Save as PNG
        if(event.key == "p") {
            canvas.toBlob(function(blob) {saveAs(blob, fileName+'.png');});
            }

        //Export colors as txt
        if(event.key == "c") {
            content = JSON.stringify(features,null,2);
            console.log(content);
            var filename = "Colors-"+$fx.hash + ".txt";
            var blob = new Blob([content], {type: "text/plain;charset=utf-8"});
            saveAs(blob, filename);
            }

        //send to studio.shawnkemp.art
        if(event.key == "s") {
            sendAllExports()
            }  

       //Explode the layers     
       if(event.key == "e") {   
            //floatingframe();  
            h=0;t=0;maxwidth=3000;
               for (z=0; z<sheet.length; z++) { 
               sheet[z].scale(1000/2300)   
               sheet[z].position = new Point(wide/2,high/2);        
                    sheet[z].position.x += wide*h;
                    sheet[z].position.y += high*t;
                    sheet[z].selected = true;
                    if (wide*(h+2) > panelWide) {maxwidth=wide*(h+1);h=0;t++;} else{h++};
                    }  
            paper.view.viewSize.width = maxwidth;
            paper.view.viewSize.height = high*(t+1);
           }
 
}, false); 
}
