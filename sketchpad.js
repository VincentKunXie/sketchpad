    var Drawing = false;
    var tool = 'pencil';
    var drawboard = document.getElementById("drawboard");
    var pencil = document.getElementById('drawboard').getContext("2d");
    var color = document.getElementById('color');
    var pencilwidth = document.getElementById('linewidth');
    var toolbox = document.getElementById('toolbox');
    var editbox = document.getElementById('editbox');
    var img = new Image();
    var start_x = null;
    var start_y = null;
    var coordinates = [];
    var canvasArray = new Array();
    var step = -1;
    var canvasPic = new Image();
    var inputimg = document.getElementById('loadimg');
    var btns = document.querySelectorAll('.btn');

    // bind tools selection
    toolbox.addEventListener('click', function (event) {
        clearAllBtnFocus();
        if (event.target.classList.contains('btn')) {
            event.target.classList.add('focusbtn');
        }

        if (event.target.id == 'pencil') {
            tool = 'pencil';
        } else if (event.target.id == 'line') {
            tool = 'line';
        } else if (event.target.id == 'poly') {
            tool = 'poly';

        } else if (event.target.id == 'rect') {
            tool = 'rect';
        } else if (event.target.id == 'oval') {
            tool = 'oval';
        } else if (event.target.id == 'square') {
            tool = 'square';
        } else if (event.target.id == 'circle') {
            tool = 'circle';
        } else if (event.target.id == 'eraser') {
            tool = 'eraser';
        }


        if (tool !== 'poly') {
            if (coordinates.length > 0) {
                polygon = new Polygon();
                var points = jQuery.extend(true, [], coordinates);
                polygon.setPoints(points);
                coordinates.splice(0, coordinates.length);
                paths.push(polygon);
            }
        }
    });

    //bind tools selection
    editbox.addEventListener('click', function (event) {

        clearAllBtnFocus();
        if (event.target.classList.contains('btn')) {
            event.target.classList.add('focusbtn');
        }

        if (event.target.id == 'move') {
            tool = 'move';
        } else if (event.target.id == 'delete') {
            tool = 'delete';
            for (var i = paths.length - 1; i >= 0; i--) {
                var path = paths[i];
                if (path.selected) {
                    paths.splice(i, 1);
                }
            }
            redrawCanvas();
        } else if (event.target.id == 'copy') {
            tool = 'copy';
            for (var i in paths) {
                var path = paths[i];
                if (path.selected) {
                    var pathcopy = jQuery.extend(true, {}, path);
                    pathcopy.setMouseXYChange(20, 20);
                    paths.push(pathcopy);
                    path.selected = false;
                }
            }
            redrawCanvas();
            tool = 'move';

        } else if (event.target.id == 'undo') {
            tool = 'undo';
            canvasUndo();
        } else if (event.target.id == 'redo') {
            tool = 'redo';
            canvasRedo();
        } else if (event.target.id == 'reset') {
            location.reload();
        } else if (event.target.id == 'save') {
            var link = document.createElement('a');
            link.download = "myCanvas.png";
            link.href = drawboard.toDataURL("image/png").replace("image/png", "image/octet-stream");;
            link.click();
        } else if (event.target.id == 'load') {
            inputimg.click();
            inputimg.addEventListener('change', readFile, false);
        }

        if (coordinates.length > 0) {
            polygon = new Polygon();
            var points = jQuery.extend(true, [], coordinates);
            polygon.setPoints(points);
            coordinates.splice(0, coordinates.length);
            paths.push(polygon);
        }
    });

    //handle mousedown event
    drawboard.addEventListener('mousedown', function (event) {
        Drawing = true;

        // create new object to store drawing elements
        if (tool == 'pencil') {
            freeline = new Freeline();
            pencil.beginPath();
        } else if (tool == 'line') {
            line = new Line();
        } else if (tool == 'rect') {
            rect = new Rect();
        } else if (tool == 'oval') {
            oval = new Oval();
        } else if (tool == 'square') {
            square = new Square();
        } else if (tool == 'circle') {
            circle = new Circle();
        }

        if (tool != 'robber') {
            img.src = drawboard.toDataURL('image/png');
        }

        start_x = event.clientX - drawboard.offsetLeft;
        start_y = event.clientY - drawboard.offsetTop;

        mouseX = parseInt(start_x);
        mouseY = parseInt(start_y);

        pencil.moveTo(start_x, start_y);
        pencil.strokeStyle = color.value;
        pencil.lineWidth = pencilwidth.value;


        if (tool == 'poly') {
            coordinates.push({
                x: mouseX,
                y: mouseY
            });
            drawPolygon();
        }

    });

    drawboard.addEventListener('dblclick', function (e) {
        // select mode
        if (tool == 'move') {
            for (var i in paths) {
                var path = paths[i];
                var isSelected = checkSelected(path, mouseX, mouseY);
                if (isSelected) {
                    if (path.selected) {
                        path.selected = false;
                    } else {
                        path.selected = true;
                    }
                    path.render();
                }
            }
        }

    });

    function checkSelected(path, mouseX, mouseY) {
        path.outline();
        var isSelected = pencil.isPointInPath(mouseX, mouseY) ||
            pencil.isPointInStroke(mouseX, mouseY);
        if (isSelected) {
            console.log('selected');
        }
        return isSelected;
    }

    //stack used to store drawn objects
    var paths = []

    function Freeline() {
        this.xd = null;
        this.yd = null;
        this.color = color.value;
        this.dwidth = pencilwidth.value;

        this.setMouseXYChange = function (x, y) {
            this.xd = x;
            this.yd = y;

            for (var i in this.points) {
                var p = this.points[i];
                p.x += this.xd;
                p.y += this.yd;
            }
        }
        this.points = [];
        this.addPoint = function (mx, my) {
            this.points.push({
                x: mx,
                y: my
            })
        };
        this.isValid = function () {
            return this.points.length > 2;
        }

        this.outline = function () {
            if (this.points.length >= 2) {
                pencil.beginPath();
                pencil.moveTo(this.points[0].x, this.points[0].y);

                for (var i in this.points) {
                    var p = this.points[i];
                    pencil.lineTo(p.x, p.y);
                }
                pencil.lineWidth = this.dwidth;
                pencil.strokeStyle = 'rgba(0,0,0,0)';
                pencil.stroke();
            }
        }

        this.render = function () {
            if (this.points.length >= 2) {
                pencil.beginPath();
                pencil.moveTo(this.points[0].x, this.points[0].y);

                for (var i in this.points) {
                    var p = this.points[i];
                    pencil.lineTo(p.x, p.y);
                }

                pencil.lineWidth = this.dwidth;
                if (this.selected) {
                    pencil.strokeStyle = 'tomato';
                } else {
                    pencil.strokeStyle = this.color;
                }
                pencil.stroke();
            }
        }
    }

    function Line() {
        this.xd = null;
        this.yd = null;
        this.x1 = null;
        this.y1 = null;
        this.x2 = null;
        this.y2 = null;
        this.color = color.value;
        this.dwidth = pencilwidth.value;


        this.setMouseXYChange = function (x, y) {
            this.xd = x;
            this.yd = y;
            this.x1 += this.xd;
            this.y1 += this.yd;
            this.x2 += this.xd;
            this.y2 += this.yd;
        };

        this.isValid = function () {
            return this.x1 !== null && this.y1 !== null && this.x2 !== null && this.y2 !== null;
        }
        this.outline = function () {
            //
            if (this.x1 !== null && this.y1 !== null && this.x2 !== null && this.y2 !== null) {
                pencil.beginPath();
                pencil.moveTo(this.x1, this.y1);
                pencil.lineTo(this.x2, this.y2);
                pencil.lineWidth = this.dwidth;
                pencil.strokeStyle = 'rgba(0,0,0,0)';
                pencil.stroke();
                pencil.closePath();
            }
        }
        this.render = function () {
            //
            if (this.x1 !== null && this.y1 !== null && this.x2 !== null && this.y2 !== null) {
                pencil.beginPath();
                pencil.moveTo(this.x1, this.y1);
                pencil.lineTo(this.x2, this.y2);
                pencil.lineWidth = this.dwidth;
                if (this.selected) {
                    pencil.strokeStyle = 'tomato';
                } else {
                    pencil.strokeStyle = this.color;
                }
                pencil.stroke();
                pencil.closePath();
            }
        }
    }

    function Rect() {
        this.xd = null;
        this.yd = null;
        this.color = color.value;
        this.dwidth = pencilwidth.value;

        this.setMouseXYChange = function (x, y) {
            this.xd = x;
            this.yd = y;

            this.x += this.xd;
            this.y += this.yd;
        }
        this.x = null;
        this.y = null;
        this.width = null;
        this.height = null;

        this.isValid = function () {
            return this.x !== null && this.y !== null && this.width !== null && this.height !== null;
        }
        this.outline = function () {
            pencil.beginPath();
            pencil.rect(this.x, this.y, this.width, this.height);
            pencil.lineWidth = this.dwidth;
            pencil.strokeStyle = 'rgba(0,0,0,0)';
            pencil.stroke();
            pencil.closePath();
        }
        this.render = function () {
            pencil.beginPath();
            pencil.rect(this.x, this.y, this.width, this.height);
            pencil.lineWidth = this.dwidth;
            if (this.selected) {
                pencil.strokeStyle = 'tomato';
            } else {
                pencil.strokeStyle = this.color;
            }
            pencil.stroke();
            pencil.closePath();
        }

    }

    function Oval() {
        this.xd = null;
        this.yd = null;
        this.color = color.value;
        this.dwidth = pencilwidth.value;

        this.setMouseXYChange = function (x, y) {
            this.xd = x;
            this.yd = y;

            this.x += this.xd;
            this.y += this.yd;
            this.newX += this.xd;
            this.newY += this.yd;
        }
        this.x = null;
        this.y = null;
        this.newX = null;
        this.newY = null;

        this.isValid = function () {
            return this.x !== null && this.y !== null && this.newX !== null && this.newY !== null;
        }

        this.outline = function () {
            pencil.beginPath();
            pencil.moveTo(this.newX, this.newY + Math.abs(this.y - this.newY) / 2);

            pencil.bezierCurveTo(
                this.newX, this.newY, this.x, this.newY, this.x, this.newY + Math.abs(this.y - this.newY) / 2);

            pencil.bezierCurveTo(
                this.x, this.y, this.newX, this.y, this.newX, this.newY + Math.abs(this.y - this.newY) / 2);

            pencil.lineWidth = this.dwidth;
            pencil.strokeStyle = 'rgba(0,0,0,0)';
            pencil.stroke();
            pencil.closePath();

        }
        this.render = function () {
            pencil.beginPath();
            pencil.moveTo(this.newX, this.newY + Math.abs(this.y - this.newY) / 2);

            pencil.bezierCurveTo(
                this.newX, this.newY, this.x, this.newY, this.x, this.newY + Math.abs(this.y - this.newY) / 2);

            pencil.bezierCurveTo(
                this.x, this.y, this.newX, this.y, this.newX, this.newY + Math.abs(this.y - this.newY) / 2);

            pencil.lineWidth = this.dwidth;
            if (this.selected) {
                pencil.strokeStyle = 'tomato';
            } else {
                pencil.strokeStyle = this.color;
            }
            pencil.stroke();
            pencil.closePath();

        }

    }

    function Polygon() {
        this.xd = null;
        this.yd = null;
        this.color = color.value;
        this.dwidth = pencilwidth.value;

        this.setMouseXYChange = function (x, y) {
            this.xd = x;
            this.yd = y;

            for (var i in this.points) {
                var p = this.points[i];
                p.x += this.xd;
                p.y += this.yd;
            }
        }
        this.points = [];
        this.setPoints = function (points) {
            this.points = points;
        }

        this.isValid = function () {
            return this.points.length > 2;
        }
        this.outline = function () {
            pencil.beginPath();
            pencil.moveTo(this.points[0].x, this.points[0].y);

            pencil.lineWidth = this.dwidth;
            for (var index = 1; index < this.points.length; index++) {
                pencil.lineTo(this.points[index].x, this.points[index].y);
            }
            pencil.strokeStyle = 'rgba(0,0,0,0)';
            pencil.stroke();
        }
        this.render = function () {
            pencil.beginPath();
            pencil.moveTo(this.points[0].x, this.points[0].y);

            pencil.lineWidth = this.dwidth;
            for (var index = 1; index < this.points.length; index++) {
                pencil.lineTo(this.points[index].x, this.points[index].y);
            }
            if (this.selected) {
                pencil.strokeStyle = 'tomato';
            } else {
                pencil.strokeStyle = this.color;
            }
            pencil.stroke();
        }
    }

    function Square() {
        this.xd = null;
        this.yd = null;
        this.color = color.value;
        this.dwidth = pencilwidth.value;

        this.setMouseXYChange = function (x, y) {
            this.xd = x;
            this.yd = y;

            this.x += this.xd;
            this.y += this.yd;
        }
        this.x = null;
        this.y = null;
        this.size = null;

        this.isValid = function () {
            return this.x !== null && this.y !== null;
        }
        this.outline = function () {
            pencil.beginPath();
            pencil.rect(this.x, this.y, this.size, this.size);
            pencil.fillStyle = this.color;
            pencil.fill();
            if (this.selected) {
                pencil.strokeStyle = 'rgba(0,0,0,0)';
                pencil.lineWidth = this.dwidth;
                pencil.strokeRect(this.x, this.y, this.size, this.size);
            }
            pencil.closePath();
        }
        this.render = function () {
            pencil.beginPath();
            pencil.rect(this.x, this.y, this.size, this.size);
            pencil.fillStyle = this.color;
            pencil.fill();
            if (this.selected) {
                pencil.strokeStyle = 'tomato';
                pencil.lineWidth = this.dwidth;
                pencil.strokeRect(this.x, this.y, this.size, this.size);
            }
            pencil.closePath();
        }
    }

    function Circle() {
        this.xd = null;
        this.yd = null;
        this.color = color.value;
        this.dwidth = pencilwidth.value;

        this.setMouseXYChange = function (x, y) {
            this.xd = x;
            this.yd = y;

            this.x += this.xd;
            this.y += this.yd;
        }
        this.x = null;
        this.y = null;
        this.r = null;

        this.isValid = function () {
            return this.x !== null && this.y !== null && this.r !== null;
        }
        this.outline = function () {
            pencil.beginPath();
            pencil.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
            pencil.fillStyle = this.color;
            pencil.fill();
            if (this.selected) {
                pencil.strokeStyle = 'rgba(0,0,0,0)';
                pencil.lineWidth = this.dwidth;
                pencil.stroke();
            }
            pencil.closePath();
        }
        this.render = function () {
            pencil.beginPath();
            pencil.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
            pencil.fillStyle = this.color;
            pencil.fill();
            if (this.selected) {
                pencil.strokeStyle = 'tomato';
                pencil.lineWidth = this.dwidth;
                pencil.stroke();
            }
            pencil.closePath();
        }
    }

    function redrawCanvas() {
        pencil.clearRect(0, 0, 900, 600);
        for (var i in paths) {
            var path = paths[i];
            path.render();
        }
    }

    var preX = null;
    var preY = null;

    drawboard.addEventListener('mousemove', function (event) {
        if (Drawing) {
            var x = event.clientX - drawboard.offsetLeft;
            var y = event.clientY - drawboard.offsetTop;
            var newX = start_x;
            var newY = start_y;

            if (tool == 'move') {
                // move
                if (preX === null) {
                    preX = start_x;
                }
                if (preY === null) {
                    preY = start_y;
                }
                var xd = x - preX;
                var yd = y - preY;
                preX = x;
                preY = y;

                for (var i in paths) {
                    var path = paths[i];
                    if (path.selected) {
                        path.setMouseXYChange(xd, yd);
                        redrawCanvas();
                    }
                }
            }

            if (tool == 'pencil') {
                pencil.lineTo(x, y);
                pencil.lineWidth = pencilwidth.value;
                pencil.stroke();
                freeline.addPoint(x, y);
            } else if (tool == 'eraser') {
                var size = 2;
                pencil.strokeStyle = 'white';
                pencil.clearRect(x - size * 10, y - size * 10, size * 20, size * 20);
            } else if (tool == 'line') {
                pencil.clearRect(0, 0, 900, 600);
                pencil.drawImage(img, 0, 0);
                pencil.beginPath();
                pencil.moveTo(start_x, start_y);
                pencil.lineTo(x, y);
                pencil.lineWidth = pencilwidth.value;
                pencil.stroke();
                pencil.closePath();

                // record
                line.x1 = start_x;
                line.y1 = start_y;
                line.x2 = x;
                line.y2 = y;
            } else if (tool == 'rect') {
                pencil.clearRect(0, 0, 900, 600);
                pencil.drawImage(img, 0, 0);
                pencil.beginPath();

                if (x < start_x) {
                    newX = x;
                }
                if (y < start_y) {
                    newY = y;
                }
                var width = Math.abs(x - start_x);
                var height = Math.abs(y - start_y);
                pencil.rect(newX, newY, width, height);
                pencil.lineWidth = pencilwidth.value;
                pencil.stroke();
                pencil.closePath();

                // record
                rect.x = newX;
                rect.y = newY;
                rect.width = width;
                rect.height = height;
            } else if (tool == 'oval') {
                pencil.clearRect(0, 0, 900, 600);
                pencil.drawImage(img, 0, 0);
                pencil.beginPath();

                if (x < start_x) {
                    newX = x;
                }
                if (y < start_y) {
                    newY = y;
                }
                pencil.moveTo(newX, newY + Math.abs(y - newY) / 2);

                pencil.bezierCurveTo(
                    newX, newY, x, newY, x, newY + Math.abs(y - newY) / 2);

                pencil.bezierCurveTo(
                    x, y, newX, y, newX, newY + Math.abs(y - newY) / 2);

                pencil.lineWidth = pencilwidth.value;
                pencil.stroke();
                pencil.closePath();

                // record
                oval.x = x;
                oval.y = y;
                oval.newX = newX;
                oval.newY = newY;
            } else if (tool == 'square') {
                pencil.clearRect(0, 0, 900, 600);
                pencil.drawImage(img, 0, 0);
                pencil.beginPath();

                if (x < start_x) {
                    newX = x;
                }
                if (y < start_y) {
                    newY = y;
                }
                var width = Math.abs((x - start_x) * (x - start_x ? -1 : 1));
                var height = Math.abs((width) * (y - start_y ? -1 : 1));
                pencil.rect(newX, newY, width, height);
                pencil.fillStyle = color.value;
                pencil.fill();
                pencil.closePath();

                // record
                square.x = newX;
                square.y = newY;
                square.size = width;
            } else if (tool == 'circle') {
                pencil.clearRect(0, 0, 900, 600);
                pencil.drawImage(img, 0, 0);
                pencil.beginPath();
                if (x < start_x) {
                    newX = x;
                }
                if (y < start_y) {
                    newY = y;
                }
                var r = Math.sqrt(Math.abs(x - start_x) * Math.abs(x - start_x) +
                    Math.abs(y - start_y) * Math.abs(y - start_y))
                pencil.arc(newX, newY, r, 0, 2 * Math.PI);
                pencil.fillStyle = color.value;
                pencil.fill();
                pencil.closePath();

                //record
                circle.x = newX;
                circle.y = newY;
                circle.r = r;
            }
        }

    });


    drawboard.addEventListener('mouseup', function (event) {

        if (tool == 'pencil') {
            if (freeline.isValid()) {
                paths.push(freeline);
            }
        } else if (tool == 'line') {
            if (line.isValid()) {
                paths.push(line);
            }
        } else if (tool == 'rect') {
            if (rect.isValid()) {
                paths.push(rect);
            }
        } else if (tool == 'oval') {
            if (oval.isValid()) {
                paths.push(oval);
            }
        } else if (tool == 'square') {
            if (square.isValid()) {
                paths.push(square);
            }
        } else if (tool == 'circle') {
            if (circle.isValid()) {
                paths.push(circle);
            }
        }

        Drawing = false;
        canvasPush();
    });


    function drawPolygon() {
        pencil.beginPath();
        pencil.moveTo(coordinates[0].x, coordinates[0].y);

        for (var index = 1; index < coordinates.length; index++) {
            pencil.lineTo(coordinates[index].x, coordinates[index].y);
        }
        pencil.lineWidth = pencilwidth.value;
        pencil.stroke();
    }

    function canvasPush() {
        step++;
        if (step < canvasArray.length) {
            canvasArray.length = step;
        }
        canvasArray.push(drawboard.toDataURL());
    }

    function canvasUndo() {
        if (step > 0) {
            step--;
            canvasPic.src = canvasArray[step];
            canvasPic.onload = function () {
                pencil.clearRect(0, 0, 900, 600);
                pencil.drawImage(canvasPic, 0, 0);
            }
        } else if (step === 0) {
            pencil.clearRect(0, 0, 900, 600);
        }
    }

    function canvasRedo() {
        if (step < canvasArray.length - 1) {
            step++;
            canvasPic.src = canvasArray[step];
            canvasPic.onload = function () {
                pencil.drawImage(canvasPic, 0, 0);
            }
        }
    }

    function readFile() {
        var file = this.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (e) {
            var image = new Image();
            image.src = e.target.result;
            image.onload = function () {
                pencil.clearRect(0, 0, 900, 600);
                pencil.drawImage(image, 0, 0, 900, 600);
                canvasPush();
            }
        }
    }

    function clearAllBtnFocus() {
        btns.forEach(function (btn) {
            btn.classList.remove('focusbtn');
        });
    }
