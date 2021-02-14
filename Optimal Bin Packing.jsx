
//ArtLayer prototypes (x1,y1,x2,y2,width,height)
try {

    // Референс към худ. слой за да се изградят прототипите //
    var lay0 = app.activeDocument.activeLayer.parent.artLayers[0];

    /*
        ArtLayer.prototype.setParams = function () {
            this.x1 = this.bounds[0].value;
            this.x2 = this.bounds[2].value;
            this.y1 = this.bounds[1].value;
            this.y2 = this.bounds[3].value;
            this.width() = this.x2 - this.x1;
            this.height() = this.y2 - this.y1;
        }
    */

    //*
    // x1 //
    ArtLayer.prototype.x1 = function () {

        return this.bounds[0].value

    }

    // x2 //
    ArtLayer.prototype.x2 = function () {

        return this.bounds[2].value

    }

    // y1 //
    ArtLayer.prototype.y1 = function () {

        return this.bounds[1].value

    }

    // y2 //
    ArtLayer.prototype.y2 = function () {

        return this.bounds[3].value

    }

    // Широчина //
    ArtLayer.prototype.width = function () {

        return this.bounds[2].value - this.bounds[0].value

    }

    // Височина //
    ArtLayer.prototype.height = function () {

        return this.bounds[3].value - this.bounds[1].value

    }
}
catch (e) {
}


//LayerSet prototypes (x1,y1,x2,y2,width,height)
try {

    // Референс към група за да се изградят прототипите //
    var set0 = app.activeDocument.activeLayer.parent.layerSets[0];
    /*
        LayerSet.prototype.setParams = function () {
            this.x1 = this.bounds[0].value;
            this.x2 = this.bounds[2].value;
            this.y1 = this.bounds[1].value;
            this.y2 = this.bounds[3].value;
            this.width() = this.x2 - this.x1;
            this.height() = this.y2 - this.y1;
        }
    */

    //*
    // x1 //
    LayerSet.prototype.x1 = function () {

        return this.bounds[0].value

    }

    // x2 //
    LayerSet.prototype.x2 = function () {

        return this.bounds[2].value

    }

    // y1 //
    LayerSet.prototype.y1 = function () {

        return this.bounds[1].value

    }

    // y2 //
    LayerSet.prototype.y2 = function () {

        return this.bounds[3].value

    }

    // Широчина //
    LayerSet.prototype.width = function () {

        return this.bounds[2].value - this.bounds[0].value

    }

    // Височина //
    LayerSet.prototype.height = function () {

        return this.bounds[3].value - this.bounds[1].value

    }
}
catch (er) {
}

function main() {
    var docRef = app.activeDocument;
    var actLay = docRef.activeLayer;
    var newSet = actLay.parent;

    //Test for number of images
    if (newSet.layers.length < 2) {
        alert("Images Should be at least two");
        return;
    }

    //Convert to pixel units, otherwise images wont be arranged in the right x1, y1
    var startUnits = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.PIXELS;

    function getDimension(dim1, dim2, size) {
        //Depending on the dimension return the first number if it's <=>
        if ((size === "bigger" && dim1 >= dim2) || (size === "smaller" && dim1 <= dim2)) {
            return dim1;
        }
        else {
            return dim2;
        }
    }
    function ifOverlap(imageL, imageR, binL, binR) {
        //If one of the rectangles is outside to left or right
        if (imageL.x >= binR.x || imageR.x <= binL.x) {
            return false;
        }

        //If one of the rectangles is outside to top or bottom
        if (imageL.y >= binR.y || imageR.y <= binL.y) {
            return false;
        }

        return true;
    }
    function makePoint(x, y) {
        return { x: x, y: y }
    }
    function makeFit(bin, image) {
        var newWidth = bin.x1 + image.width();
        var newHeight = bin.y1 + image.height();
        var differenceWidth = bin.x2 - newWidth;
        var differenceHeight = bin.y2 - newHeight;
        //Test the image in the given bin and measure the square that will form
        //Get the squares that will be bigger or equal to the last one
        var square = getDimension(newWidth, newHeight, "bigger");
        square = getDimension(square, square3, "bigger");
        //Get the difference between the two dimensions, this helps for deciding the best bin if squares are equal
        var resultDimension = getDimension(Math.abs(differenceWidth), Math.abs(differenceHeight), "smaller");

        //If the given bin is enclosed by images and the current image exceeds the bin in one of the dimensions
        if ((newWidth > bin.x2 && bin.x2 < square3) || (newHeight > bin.y2 && bin.y2 < square3)) {
            return false;
        }

        /*
        //TEST CODE
        var layR = squareSet.artLayers.add();
        layR.name = image.name + ", bin: " + bin.num + ", Square";
        makeSelectionAndStroke([[0, 0], [square, 0], [square, square], [0, square]], binColors[5]);
        makeSelectionAndStroke([[bin.x1, bin.y1], [newWidth, bin.y1], [newWidth, newHeight], [bin.x1, newHeight]], binColors[4]);
        //END
        //*/

        //Return the fit object and compare all fits in findBin function
        //If the bin can't hold the image (returns false), just skip to the next one
        //Adding the additional bottom and right bins assures there is at least one bin (fit) that can hold the image
        return { x1: bin.x1, y1: bin.y1, differenceWidth: differenceWidth, differenceHeight: differenceHeight, square: square, resultDimension: resultDimension };
    }
    function makeBin(side, bin, image) {
        //Splitting the bestBin for the current image boils down to two special cases
        //Case1: image crosses the bin horizontally
        //Case2: image crosses the bin vertically
        //Depending on these two cases get the bigger dimension for one of the coordinates (x1,y1,x2,y2)
        if (side !== "square") {
            var x1 = getDimension(bin.x1, image.x1(), "bigger");
            var y1 = getDimension(bin.y1, image.y1(), "bigger");
            var x2 = getDimension(bin.x2, bin.x1 + image.width(), "bigger");
            var y2 = getDimension(bin.y2, bin.y1 + image.height(), "bigger");
        }

        //Make new bin with new number and split flag set to true as all bins coming from this function should be splitted if image overlaps them
        var type = side;
        var newBin = { x1: false, y1: false, x2: false, y2: false, ind: false, num: ++binNum, split: true, type: type };

        //Make left bin
        if (side === "left") {
            newBin.x1 = bin.x1;
            newBin.y1 = bin.y1
            newBin.x2 = image.x1();
            newBin.y2 = image.y2();
            newBin.ind = 0;
            newBin.from = bin.num;
        }
        //Make top bin
        else if (side === "top") {
            //Top bins right side should be equal to the current square if not enclosed with images
            x2 = getDimension(x2, bin.square, "bigger");
            newBin.x1 = bin.x1;
            newBin.y1 = bin.y1
            newBin.x2 = x2;
            newBin.y2 = image.y1();
            newBin.ind = 1;
            newBin.from = bin.num;
        }
        //Make right bin
        else if (side === "right") {
            //If the bestBin is left, dont expand the new one to the square boundary
            if (bin.type === "left") {
                x2 = bin.x2;
            }
            else {
                x2 = getDimension(x2, bin.square, "bigger");
            }
            y2 = getDimension(y2, bin.square, "bigger");
            newBin.x1 = image.x2();
            newBin.y1 = y1;
            newBin.x2 = x2;
            newBin.y2 = y2;
            newBin.ind = 2;
            newBin.from = bin.num;
        }
        //Make bottom bin
        else if (side === "bottom") {
            if (bin.type === "right") {
                x1 = image.x1();
            }
            else {
                x1 = bin.x1;
            }

            x2 = getDimension(x2, bin.square, "bigger");
            y2 = getDimension(y2, bin.square, "bigger");
            newBin.x1 = x1;
            newBin.y1 = image.y2();
            newBin.x2 = x2;
            newBin.y2 = y2;
            newBin.ind = 3;
            newBin.from = bin.num;
        }
        //Make square bin
        else if (side === "square") {
            newBin.x1 = 0;
            newBin.y1 = 0;
            newBin.x2 = square3;
            newBin.y2 = square3;
            newBin.ind = 5;
            newBin.from = "Square";
        }
        else {
            alert("cant make bin, invalid side");
            return;
        }

        return newBin;
    }
    function putImage(bin, image) {
        image.translate(bin.x1 - image.x1(), bin.y1 - image.y1());

        //Whenever a bin is choosen for bestBin, make it splittable
        bin.split = true;

        //If the current image exceeds the right boundary
        if (image.x2() > rightBoundary) {
            rightBoundary = image.x2();
        }

        //If the current image exceeds the bottom boundary
        if (image.y2() > bottomBoundary) {
            bottomBoundary = image.y2();
        }

        //Whenever a bin is choosen, change the square to the bin's square
        square3 = bin.square;
    }
    function findBin(bins, image) {
        //Make two additional bins: one to the right and one to the bottom
        var x2 = rightBoundary + image.width();
        var y2 = bottomBoundary + image.height();

        //This assures there is at least one bin that can hold the image
        //Set the split flag to false as those bins should be splitted only if the image is placed in them
        //Sometimes placing the image in one of these bins gives a smaller square rather than the splittable bins
        var rightBin = { x1: rightBoundary, y1: 0, x2: x2, y2: y2, ind: 2, num: ++binNum, split: false, type: "right", from: "addRight" };
        var bottomBin = { x1: 0, y1: bottomBoundary, x2: x2, y2: y2, ind: 3, num: ++binNum, split: false, type: "bottom", from: "addBottom" };

        //Place the bins in the bins array as the last two
        bins.push(rightBin, bottomBin);

        //Set bestFit to false and find the first bin that can hold the image
        var bestFit = false;
        var fitNum = -1;

        while (bestFit === false) {
            fitNum++;
            bestFit = makeFit(bins[fitNum], image);
        }

        var fits = [bestFit];
        fits[0].ind = fitNum;

        for (var ind = fitNum + 1; ind < bins.length; ind++) {
            //Get the current bin
            var bin = bins[ind];

            //If the current bin/fit returns false, push the next one to the array of fits
            //Check if best fit holds the last one in the array, this prevents from not finding a best fit
            if (bestFit !== fits[fits.length - 1]) {
                bestFit = fits[fits.length - 1];
            }

            //Make the current bin as fit
            var fit = makeFit(bin, image);

            //If the fit is valid, compare to the best one
            if (fit !== false) {
                fit.ind = ind;

                //If the current fit forms a smaller square
                if (fit.square < bestFit.square) {
                    fits.push(fit);
                }

                //If the two squares are equal, compare to the smallest difference according to the two dimensions
                //It doesn't matter if the image exceeds the bin
                //The algotithm finds the bin that will be filled the most
                else if (fit.square === bestFit.square) {
                    if (fit.resultDimension < bestFit.resultDimension) {
                        fits.push(fit);
                    }

                    //If the two bins are going to be filled equally
                    //Find the one with the smallest x and y values as it will give a better result
                    else if (fit.resultDimension === bestFit.resultDimension) {
                        if (fit.y1 < bestFit.y1) {
                            fits.push(fit);
                        }
                        else {
                            if (fit.x1 < bestFit.x1) {
                                fits.push(fit);
                            }
                        }
                    }
                }
            }
        }

        bestFit = fits[fits.length - 1];
        var bestBin = bins[bestFit.ind];
        bestBin.square = bestFit.square;

        return bestBin;
    }
    function splitBins(bins, image) {
        //Make an empty array for the subdivisions and add it two the not splittet bins when done splitting
        var subBins = [];

        //Iterrate trough all the bins and test if the image overlaps them, and split
        for (var ind = 0; ind < bins.length; ind++) {
            var bin = bins[ind];

            var imageLeft = makePoint(image.x1(), image.y1());
            var imageRight = makePoint(image.x2(), image.y2());
            var binLeft = makePoint(bin.x1, bin.y1);
            var binRight = makePoint(bin.x2, bin.y2);

            //Check if image and bin overlap
            //The pattern of overlapping boils down to 2 special cases - if the image crosses the bin horizontally or vertically;
            //If the image is placed inside the bin this will subdivide it into 4 subBins (left,top,right,bottom)/(red,green,blue,magenta)
            if (ifOverlap(imageLeft, imageRight, binLeft, binRight)) {
                if (bin.split === true) {
                    //Return leftBin
                    if (image.x1() > bin.x1) {
                        subBins.push(makeBin("left", bin, image));
                    }

                    //Return topBin
                    if (image.y1() > bin.y1) {
                        subBins.push(makeBin("top", bin, image));
                    }

                    //Return rightBin
                    if (image.x2() < bin.x2) {
                        subBins.push(makeBin("right", bin, image));
                    }

                    //Return bottomBin
                    if (image.y2() < bin.y2) {
                        subBins.push(makeBin("bottom", bin, image));
                    }
                }
                //If image overlaps and the bin is subdivided, remove it from the array
                //Decrement the index and continue
                bins.splice(ind, 1);
                ind--;
            }
            else {
                //If the bin shouldn't be splitted, just remove it from the array
                //This matters only for the additional right and bottom bins if not choosen for best bin
                if (bin.split === false) {
                    bins.splice(ind, 1);
                    ind--;
                }
                else {
                    //If image doesnt overlaps and the bin is not enclosed by other images
                    //Expand the boundaries of the bin
                    if (bin.type === "top") {
                        bin.x2 = square3;
                    }
                    if (bin.type === "right") {
                        bin.x2 = square3;
                        bin.y2 = square3;
                    }
                    if (bin.type === "bottom") {
                        bin.y2 = square3;
                    }
                }
            }
        }

        allBins = subBins.concat(bins);

        /*
        for (var ind = 0; ind < allBins.length; ind++) {
            var newBin = allBins[ind];
            var binLay = subBinsSet.artLayers.add();
            binLay.name = image.name + ": Bin: " + newBin.num + ", from: " + newBin.from;
            makeSelectionAndStroke([[newBin.x1, newBin.y1], [newBin.x2, newBin.y1], [newBin.x2, newBin.y2], [newBin.x1, newBin.y2]], binColors[newBin.ind]);
        }
        //*/
    }
    function makeColor(r, g, b) {
        var color = new SolidColor();
        color.rgb.red = r;
        color.rgb.green = g;
        color.rgb.blue = b;
        return color;
    }
    function makeSelectionAndStroke(arr, color) {
        docRef.selection.select(arr, SelectionType.REPLACE);
        docRef.selection.stroke(color, 1, StrokeLocation.INSIDE, ColorBlendMode.NORMAL, 100);
        docRef.selection.deselect();
    }

    var binColors = [
        makeColor(255, 0, 0),	//Red, Make Bin: Left
        makeColor(0, 255, 0),	//Green, Make Bin: Top
        makeColor(0, 0, 255),	//Blue, Make Bin: Right
        makeColor(255, 0, 255),	//Magenta, Make Bin: Bottom
        makeColor(255, 255, 0),	//Yellow, Image Position
        makeColor(0, 255, 255)	//Cyan, Square
    ];
    var num = 0;
    var binNum = 0;
    var bottomBoundary = 0;
    var rightBoundary = 0;
    var firstImage = undefined;

    //The two first images are taken and tested for the best combination/square they can form
    //1: Get the wider image
    //2: Get the taller image
    //3: Measure the squares
    var wider = getDimension(newSet.layers[0].width(), newSet.layers[1].width(), "bigger");
    var taller = getDimension(newSet.layers[0].height(), newSet.layers[1].height(), "bigger");
    var square1 = getDimension(newSet.layers[0].width() + newSet.layers[1].width(), taller, "bigger");
    var square2 = getDimension(newSet.layers[0].height() + newSet.layers[1].height(), wider, "bigger");
    var square3 = getDimension(square1, square2, "smaller");

    //Make the first bin according to the smallest square
    var allBins = [makeBin("square", undefined, newSet.layers[0])];

    var difference0 = getDimension(allBins[0].x2 - (allBins[0].x1 + newSet.layers[0].width()), allBins[0].y2 - (allBins[0].y1 + newSet.layers[0].height()), "smaller");
    var difference1 = getDimension(allBins[0].x2 - (allBins[0].x1 + newSet.layers[1].width()), allBins[0].y2 - (allBins[0].y1 + newSet.layers[1].height()), "smaller");

    //The first image should be the one that fills the bin the most (according to the two dimensions)
    if (difference0 <= difference1) {
        firstImage = newSet.layers[0];
    }
    else {
        firstImage = newSet.layers[1];
    }

    //Stroke the possible squares and image positions in this folder
    //var squareSet = docRef.layerSets.add();
    //squareSet.name = "Squares";

    //Stroke all subBins/subdivisions in this folder
    //var subBinsSet = docRef.layerSets.add();
    //subBinsSet.name = "SubBins";

    //Place the first image in the first bin/square
    //The first sub bins are always right and bottom
    putImage(findBin(allBins, firstImage), firstImage);
    splitBins(allBins, firstImage);

    //Iterate trough all images
    for (var ind = 0; ind < newSet.layers.length; ind++) {
        var image = newSet.layers[ind];

        //Skip the first image as it's already placed
        if (image !== firstImage && image.width() > 0) {
            var bestBin = findBin(allBins, image);
            putImage(bestBin, image);

            if (ind < newSet.layers.length - 1) {
                splitBins(allBins, newSet.layers[ind]);
            }
        }
    }

    //Set the units to the starting ones
    app.preferences.rulerUnits = startUnits;
}

main();