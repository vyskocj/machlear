$(document).ready(function () {
    // Globalni promenne NEURONOV›CH SÕTÕ
    var valuesOfClasses = [];
    var coordinates = [];
    var x_min = 0;
    var x_max = 0;
    var y_min = 0;
    var y_max = 0;
    var axis_x_min = 0;
    var axis_y_min = 0;
    var mu_x = 0;
    var mu_y = 0;
    var W = [];
    var W0 = [];
    var b = [];
    var b0 = [];
    var k = 1;
    var p = 1;
    var q = 0;
    var E = [];
    var E_max = 0;
    var Ec_all = [];
    var colors = ["grey", "red", "DarkOrange", "blue", "green", "pink", "black", "brown", "goldenrod", "cyan", "lime", "purple"];
    var lines = [];
    var krok = 0;
    var cyklus = 0;
    
    var x = [];
    var y = [];
    var u = [];
    var pairs = [];

    /**
     * VYKRESLENÕ
     */
    //inicializace grafu
    function drawGraphLinesAndPoints2D(graph, pairs) {
        graph.innerHTML = ''; //vymaz·nÌ vöech element˘

        // p¯evzorkov·nÌ na 1 bod
        var pointX = (graph.getAttribute("width") - 40) / (x_max - x_min);
        var pointY = (graph.getAttribute("height") - 40) / (y_max - y_min);

        // vykreslenÌ bod˘ trÈnovacÌ mnoûiny
        for (i = 0; i < pairs.length; i++) {
            graph.innerHTML += '<circle cx="' + Number(pointX * (pairs[i][0] - x_min) + 35) + '" cy="' + Number(pointY * (y_max - pairs[i][1]) + 5) + '" r="2" fill="' + colors[pairs[i][2]] + '" />';
        }

        // inicializace neuron˘
        for (i = 0; i < W.length; i++) {
            graph.innerHTML += '<line id="' + graph.getAttribute("id") + '-line' + i + '" x1="0" y1="0" x2="0" y2="0" style="stroke:' + colors[colors.length - i - 1] + '; stroke-width:2;" />';
        }

        // vykreslenÌ st¯ednÌ hodnoty
        if (mu_x + mu_y != 0) {
            var mx = (pointX * (-x_min) + 35);
            var my = (pointY * y_max + 5);
            graph.innerHTML += '<line x1="30" y1="' + my + '" x2="' + (graph.getAttribute("width") - 5) + '" y2="' + my + '" style="stroke:lightgrey; stroke-width:1;" />';
            graph.innerHTML += '<line x1="' + mx + '" y1="5" x2="' + mx + '" y2="' + (graph.getAttribute("height") - 30) + '" style="stroke:lightgrey; stroke-width:1;" />';
            graph.innerHTML += '<text x="5" y="' + (my + 5) + '" fill="black" font-size="10px">' + (Math.round(mu_y * 100) / 100) + '</text>';
            graph.innerHTML += '<text x="' + (mx - 10) + '" y="' + (graph.getAttribute("height") - 10) + '" fill="black" font-size="10px">' + (Math.round(mu_x * 100) / 100) + '</text>';
        }

        // inicializace testovacÌ mnoûiny
        graph.innerHTML += '<line id="test_x" x1="0" y1="0" x2="0" y2="0" style="stroke:Chartreuse; stroke-width:1;" />';
        graph.innerHTML += '<line id="test_y" x1="0" y1="0" x2="0" y2="0" style="stroke:Chartreuse; stroke-width:1;" />';

        // vypoËtenÌ x-ovÈ a y-ovÈ osy, kterÈ jsou posunuty o 5 px od minima
        axis_y_min = y_min - 5 / pointY;
        axis_x_min = x_min - 5 / pointX;
        graph.innerHTML += '<line x1="30" y1="5" x2="30" y2="' + (graph.getAttribute("height") - 10) + '" style="stroke:black; stroke-width:1" />';
        graph.innerHTML += '<line x1="10" y1="' + (graph.getAttribute("height") - 30) + '" x2="' + (graph.getAttribute("width") - 5) + '" y2="' + (graph.getAttribute("height") - 30) + '"  style="stroke:black; stroke-width:1" />';
        graph.innerHTML += '<text x="5" y="' + (graph.getAttribute("height") - 33) + '" fill="black" font-size="10px">' + (Math.round((axis_y_min + mu_y) * 100) / 100) + '</text>';
        graph.innerHTML += '<text x="5" y="10" fill="black" font-size="10px">' + (Math.round((y_max + mu_y) * 100) / 100) + '</text>';
        graph.innerHTML += '<text x="33" y="' + (graph.getAttribute("height") - 10) + '" fill="black" font-size="10px">' + (Math.round((axis_x_min + mu_x) * 100) / 100) + '</text>';
        graph.innerHTML += '<text x="' + (graph.getAttribute("width") - 30) + '" y="' + (graph.getAttribute("height") - 10) + '" fill="black" font-size="10px">' + (Math.round((x_max + mu_x) * 100) / 100) + '</text>';
    }

    function drawTestInput(x, y, graph) {
        var pointX = (graph.getAttribute("width") - 40) / (x_max - x_min);
        var pointY = (graph.getAttribute("height") - 40) / (y_max - y_min);

        document.getElementById("test_x").setAttribute("x1", 30);
        document.getElementById("test_x").setAttribute("y1", Number(pointY * (y_max - y) + 5));
        document.getElementById("test_x").setAttribute("x2", graph.getAttribute("width") - 5);
        document.getElementById("test_x").setAttribute("y2", Number(pointY * (y_max - y) + 5));

        document.getElementById("test_y").setAttribute("x1", Number(pointX * (x - x_min) + 35));
        document.getElementById("test_y").setAttribute("y1", 5);
        document.getElementById("test_y").setAttribute("x2", Number(pointX * (x - x_min) + 35));
        document.getElementById("test_y").setAttribute("y2", graph.getAttribute("height") - 30);
    }
    
    //p¯ekreslenÌ p¯Ìmek
    function drawGraphLines2D(graph, lines) {
        for (i = 0; i < lines.length; i++) {
            document.getElementById(graph.getAttribute("id") + "-line" + i).setAttribute("x1", lines[i][0]);
            document.getElementById(graph.getAttribute("id") + "-line" + i).setAttribute("y1", lines[i][1]);
            document.getElementById(graph.getAttribute("id") + "-line" + i).setAttribute("x2", lines[i][2]);
            document.getElementById(graph.getAttribute("id") + "-line" + i).setAttribute("y2", lines[i][3]);
        }
    }

    //vykreslenÌ chyby
    function drawGraphError(graph, cycle, errors, max_error) {
        if (cycle < 1)
            return;
        var pointX = (graph.getAttribute("width") - 35) / (cycle - 1);
        var pointY = (graph.getAttribute("height") - 35) / max_error;
        graph.innerHTML = "";
        graph.innerHTML += '<line x1="30" y1="5" x2="30" y2="' + (graph.getAttribute("height") - 10) + '" style="stroke:black; stroke-width:1" />';
        graph.innerHTML += '<line x1="10" y1="' + (graph.getAttribute("height") - 30) + '" x2="' + (graph.getAttribute("width") - 5) + '" y2="' + (graph.getAttribute("height") - 30) + '"  style="stroke:black; stroke-width:1" />';
        graph.innerHTML += '<text x="5" y="' + (graph.getAttribute("height") - 33) + '" fill="black" font-size="10px">0</text>';
        graph.innerHTML += '<text x="5" y="10" fill="black" font-size="10px">' + max_error + '</text>';
        graph.innerHTML += '<text x="33" y="' + (graph.getAttribute("height") - 10) + '" fill="black" font-size="10px">0</text>';
        graph.innerHTML += '<text x="' + (graph.getAttribute("width") - 20) + '" y="' + (graph.getAttribute("height") - 10) + '" fill="black" font-size="10px">' + cycle + '</text>';

        for (i = 0; i < cycle - 1; i++) {
            graph.innerHTML += '<line x1="' + Number(pointX * i + 30) + '" y1="' + Number(pointY * (max_error - errors[i]) + 5) + '" x2="' + Number(pointX * (i + 1) + 30) + '" y2="' + Number(pointY * (max_error - errors[i + 1]) + 5) + '" style="stroke:black; stroke-width:2;" />';
        }
        
    }

    /**
     * ⁄PRAVA ELEMENTŸ STR¡NKY
     */
    //p¯id·v·nÌ/odebÌr·nÌ sou¯adnic trÈnovacÌch dvojic
    function numberOfPairs() {
        var table = document.getElementById("pairs-table");
        var nbr = document.getElementById("numberOfPairs").value;
        if (table.rows.length - 1 < nbr)
            for (i = table.rows.length; i <= nbr; i++) {
                var row = table.insertRow(i);
                var cel = row.insertCell(0);
                cel.innerHTML = '<input type="number" id="x' + String(i - 1) + ',0" step="0.1">';
                cel = row.insertCell(1);
                cel.innerHTML = '<input type="number" id="x' + String(i - 1) + ',1" step="0.1">';
                cel = row.insertCell(2);
                cel.innerHTML = '<input type="number" id="x' + String(i - 1) + ',2" step="0.1">';
            }
        else if (table.rows.length - 1 > nbr)
            for (i = table.rows.length - 1; i > nbr; i--) {
                table.deleteRow(i);
            }
    }

    //P¯epoËet, kolik neuron˘ m˘ûe sÌù obsahovat
    function listOfNeurons() {
        valuesOfClasses = [];
        var nbr_neurons = document.getElementById("numberOfNeurons");

        for (i = 0; i < document.getElementById("numberOfPairs").value; i++) {
            var c = Number(document.getElementById("x" + i + ",2").value);
            if (valuesOfClasses.indexOf(c) == -1)
                valuesOfClasses.push(c);
        }
        var min = Math.ceil(Math.log2(valuesOfClasses.length));
        var max = valuesOfClasses.length;
        if (min == 0 && max > min)
            min = 1;
        while (nbr_neurons.length != 0) {
            nbr_neurons.remove(0);
        }
        for (i = min; i <= max; i++) {
            var option = document.createElement("option");
            option.text = i;
            nbr_neurons.add(option);
        }
        reinitializeOutputCoordinates();
    }

    //P¯epoËet, kolik neuron˘ m˘ûe sÌù obsahovat - vol·nÌ z venku
    recalculateListOfNeurons = function () {
        listOfNeurons();
    }

    //vytvo¯enÌ tabulky v˝stupnÌch sou¯adnic - vol·nÌ z venku
    reinitializeOutputCoordinates = function () {
        var coor_table = document.getElementById("coor-table");
        coor_table.innerHTML = "";
        var nbr_neurons = document.getElementById("numberOfNeurons").value;

        //prvnÌ ¯·dek - popisek
        var row = coor_table.insertRow(0);
        var cel = row.insertCell(0);
        cel.innerHTML = 'u \\ y';
        for (j = 1; j <= nbr_neurons; j++) {
            var cel = row.insertCell(j);
            cel.innerHTML = "y" + j;
        }
        for (i = 1; i <= valuesOfClasses.length; i++) {
            row = coor_table.insertRow(i);
            cel = row.insertCell(0);
            cel.innerHTML = "u" + i + " = " + valuesOfClasses[i - 1];
            for (j = 1; j <= nbr_neurons; j++) {
                cel = row.insertCell(j);
                cel.innerHTML = '<select id="uy' + String(i) + ',' + String(j) + '"><option>-1</option><option>1</option></select>';
            }
        }
    }

    //vol·nÌ funkce pro vytvo¯enÌ tabulky v˝stupnÌch sou¯adnic
    function initializeOutputCoordinates() {
        reinitializeOutputCoordinates();
    }

    //zobrazenÌ / skrytÌ trÈnovacÌ mnoûiny
    collapsePairs = function () {
        var div = document.getElementById("pairs");
        if (div.style.display === "none")
            div.style.display = "block";
        else
            div.style.display = "none";
    }

    //kliknutÌ sou¯adnic
    test_by_click = function (event) {
        var graph = document.getElementById("graph-network");
        var graph_coords = graph.getBoundingClientRect();
        var x = event.clientX - graph_coords.left;
        var y = event.clientY - graph_coords.top;
        //zakreslenÌ sou¯adnic
        document.getElementById("test_x").setAttribute("x1", 30);
        document.getElementById("test_x").setAttribute("y1", y);
        document.getElementById("test_x").setAttribute("x2", graph.getAttribute("width") - 5);
        document.getElementById("test_x").setAttribute("y2", y);

        document.getElementById("test_y").setAttribute("x1", x);
        document.getElementById("test_y").setAttribute("y1", 5);
        document.getElementById("test_y").setAttribute("x2", x);
        document.getElementById("test_y").setAttribute("y2", graph.getAttribute("height") - 30);

        //p¯epoËet sou¯adnic
        var pointX = (x_max - x_min) / (graph.getAttribute("width") - 40);
        var pointY = (y_max - y_min) / (graph.getAttribute("height") - 40);
        x = (pointX * x + x_min - pointX * 5 - 1);
        y = (y_max - pointY * y + pointY * 5);
        document.getElementById("x1-test").value = x;
        document.getElementById("x2-test").value = y;

        //v˝poËet
        document.getElementById("result-test").innerHTML = "";
        var y_i = new Array(W.length);
        for (i = 0; i < W.length; i++) {
            var y_ij = W[i][0] * x + W[i][1] * y;
            y_i[i] = (Number(y_ij + b[i]) >= 0 ? 1 : -1);
            document.getElementById("result-test").innerHTML += '<span style="color:white; background:' + colors[colors.length - i - 1] + '">' + y_i[i] + '</span>';
        }
    }

    //testov·nÌ sÌtÏ
    test = function () {
        var x = new Array(2);
        x[0] = Number(document.getElementById("x1-test").value - mu_x);
        x[1] = Number(document.getElementById("x2-test").value - mu_y);
        drawTestInput(x[0], x[1], document.getElementById("graph-network"));
        document.getElementById("result-test").innerHTML = "";

        var y_i = new Array(W.length);
        for (i = 0; i < W.length; i++) {
            var y_ij = 0;
            for (j = 0; j < W[i].length; j++) {
                y_ij += W[i][j] * x[j];
            }
            y_i[i] = (Number(y_ij + b[i]) >= 0 ? 1 : -1);
            document.getElementById("result-test").innerHTML += '<span style="color:white; background:' + colors[colors.length - i - 1] + '">' + y_i[i] + '</span>';
        }
    }

    /**
     * »TENÕ ZE SOUBORU
     */
    //naËtenÌ trÈnovacÌch dvojic ze souboru
    loadPairs = function (event) {
        var file = event.target;

        var reader = new FileReader();
        reader.onload = function () {
            var lines = reader.result.split('\n');
            var real_lines = 0;
            document.getElementById("numberOfPairs").value = lines.length;
            numberOfPairs();
            var line = 0
            while (line < lines.length) {
                var items = lines[line].replace(/\s\s+/g, ' ');
                items = items.split(' ');
                if (items.length < 3) {
                    lines.splice(line, 1);
                    continue;
                }
                var item = 0;
                while (item < items.length) {
                    if (items[item] == '') {
                        items.splice(item, 1);
                        continue;
                    }
                    document.getElementById("x" + line + "," + item).value = Number(items[item++]);
                }
                ++line;
            }
            document.getElementById("numberOfPairs").value = line;
            numberOfPairs();
            listOfNeurons();       
        }
        reader.readAsText(file.files[0]);
    }

    /**
     * »TENÕ PROMÃNN›CH ZE STR¡NKY
     */
    //p¯eËtenÌ v˝stupnÌch sou¯adnic ze str·nky
    function getCoordinates() {
        coordinates = new Array(valuesOfClasses.length);
        var nbr_neurons = document.getElementById("numberOfNeurons").value;
        for (i = 0; i < valuesOfClasses.length; i++) {
            coordinates[i] = new Array(nbr_neurons);
            for (j = 0; j < nbr_neurons; j++) {
                coordinates[i][j] = Number(document.getElementById('uy' + String(i + 1) + ',' + String(j + 1)).value);
            }
        }
    }

    //p¯eËtenÌ trÈnovacÌch dvojic ze str·nky
    function getPairs () {
        pairs = new Array(document.getElementById("numberOfPairs").value);
        x_min = Number(document.getElementById('x' + 0 + ',' + 0).value);
        x_max = Number(document.getElementById('x' + 0 + ',' + 0).value);
        y_min = Number(document.getElementById('x' + 0 + ',' + 1).value);
        y_max = Number(document.getElementById('x' + 0 + ',' + 1).value);
        for (i = 0; i < document.getElementById("numberOfPairs").value; i++) {
            pairs[i] = new Array(3);
            for (j = 0; j < 3; j++) {
                pairs[i][j] = Number(document.getElementById('x' + i + ',' + j).value);
                if (j == 0) { //x-ov· osa
                    if (pairs[i][j] < x_min)
                        x_min = Number(pairs[i][j]);
                    else if (pairs[i][j] > x_max)
                        x_max = Number(pairs[i][j]);
                } else if (j == 1) { //y-ov· osa
                    if (pairs[i][j] < y_min)
                        y_min = Number(pairs[i][j]);
                    else if (pairs[i][j] > y_max)
                        y_max = Number(pairs[i][j]);
                }
            }
        }
    }
    
    /**
     * NEURONOV¡ SÕç + V›PO»TY
     */
    //v˝poËet neuronovÈ sÌtÏ
    function startNeuralNetwork(graph, nw_neurons, nw_error, nw_cycles, nw_c) {
        W = new Array(nw_neurons);
        W0 = new Array(nw_neurons)
        for (i = 0; i < nw_neurons; i++) {
            W[i] = new Array(2);
            W0[i] = new Array(2)
            for (j = 0; j < 2; j++) {
                var x = Math.random() * 10;
                W[i][j] = x;
                W0[i][j] = x;
            }
        }
        b = new Array(nw_neurons);
        b0 = new Array(nw_neurons);
        for (i = 0; i < nw_neurons; i++) {
            var x = Math.random() * 10;
            b[i] = x;
            b0[i] = x;
        }
        q = 0; //cyklus
        var Ec = 80; //inicializace max chyby - aby proöel prvnÌ while
        Ec_all = []; //uloûenÌ vöech chyb cykl˘
        E_max = 0; //uloûenÌ nejvyööÌ chyby

        lines = []; //pole, ve kterÈm jsou uloûeny krajnÌ sou¯adnice p¯Ìmek vypoËtenÈ z matice W a vektoru b
        drawGraphLinesAndPoints2D(graph, pairs);

        while (Ec > nw_error && q < nw_cycles) { //ukonËovcÌ podmÌnky neuronovÈ sÌtÏ
            ++q;
            k = 0;
            E = []; E.push(0);
            x = [];
            y = [];
            u = [];

            while (pairs.length != 0) {
                //v˝poËet v˝stupu   
                p = Math.floor(Math.random() * (pairs.length));
                x.push(pairs[p]);
                pairs.splice(p, 1);

                var y_i = []
                for (i = 0; i < W.length; i++) {
                    var y_ij = 0;
                    for (j = 0; j < W[i].length; j++) {
                        y_ij += W[i][j] * x[k][j];
                    }
                    y_i.push(Number(y_ij + b[i]) >= 0 ? 1 : -1);
                }
                y.push(y_i);
                u.push(coordinates[valuesOfClasses.indexOf(Number(x[k][2]))]);

                //v˝poËet chyby
                var uy = [];
                var uy_i2 = 0;
                for (i = 0; i < u[k].length; i++) {
                    uy.push(u[k][i] - y[k][i]);
                    uy_i2 += (u[k][i] - y[k][i]) * (u[k][i] - y[k][i]);
                }
                E.push(E[k] + 1 / 2 * uy_i2);

                //Modifikace vah a prah˘
                for (i = 0; i < W.length; i++) {
                    for (j = 0; j < W[i].length; j++) {
                        W[i][j] = W[i][j] + nw_c * uy[i] * x[k][j];
                    }
                    b[i] = b[i] + nw_c * uy[i];
                }

                writeLines(graph);
                ++k;
            }
            pairs = x;
            Ec = E[k];
            if (E_max < E[k])
                E_max = E[k];
            Ec_all.push(E[k]);
        }
    }
     
    //zÌsk·nÌ st¯ednÌ hodnoty     
    function getMu() {
        mu_x = 0;
        mu_y = 0;
        for (i = 0; i < pairs.length; i++) {
            mu_x += pairs[i][0];
            mu_y += pairs[i][1];
        }
        mu_x /= pairs.length;
        mu_y /= pairs.length;
    }

    function addMuToPairs(x, y) {
        for (i = 0; i < pairs.length; i++) {
            pairs[i][0] -= x;
            pairs[i][1] -= y;
        }
    }

    //kliknutÌ na tlaËÌtko pro spuötÏnÌ neuronovÈ sÌtÏ
    start = function () {
        var graph_error = document.getElementById("graph-error");
        var graph_network = document.getElementById("graph-network");
        //inicializace
        getCoordinates(); //v˝stupnÌ vektory
        getPairs(); //vstupnÌ vektory
        if (document.getElementById("faster").checked == true) {
            getMu();
            addMuToPairs(mu_x, mu_y);
        } else {
            mu_x = 0;
            mu_y = 0;
        }
        x_max -= mu_x;
        x_min -= mu_x;
        y_max -= mu_y;
        y_min -= mu_y;
        var nbr_cycles = document.getElementById("numberOfTrainingCycles").value;
        var nbr_neurons = document.getElementById("numberOfNeurons").value;
        var const_learning = document.getElementById("constantOfLearning").value;
        var max_error = document.getElementById("maxError").value;

        startNeuralNetwork(graph_network, Number(nbr_neurons), Number(max_error), Number(nbr_cycles), Number(const_learning));

        //nastavenÌ rozhranÌ
        krok = lines.length - 1;
        var nbr_step = document.getElementById("garph-numberOfStep");
        nbr_step.setAttribute("min", 1);
        nbr_step.setAttribute("max", krok + 1);
        nbr_step.value = krok + 1;

        cyklus = q;
        var nbr_cycle = document.getElementById("garph-numberOfCycle");
        nbr_cycle.setAttribute("min", 1);
        nbr_cycle.setAttribute("max", cyklus);
        nbr_cycle.value = cyklus;

        drawGraphLines2D(graph_network, lines[krok]);
        drawGraphError(graph_error, cyklus, Ec_all, E_max);
        //v˝pis
        document.getElementById("W0").innerHTML = "";
        document.getElementById("W").innerHTML = "";
        document.getElementById("b0").innerHTML = "";
        document.getElementById("b").innerHTML = "";
        for (i = 0; i < W.length; i++) {
            for (j = 0; j < W[i].length; j++) {
                document.getElementById("W0").innerHTML += W0[i][j] + " ";
                document.getElementById("W").innerHTML += W[i][j] + " ";
            }
            document.getElementById("b0").innerHTML += b0[i] + "<br />";
            document.getElementById("b").innerHTML += b[i] + "<br />";
            document.getElementById("W0").innerHTML += "<br />";
            document.getElementById("W").innerHTML += "<br />";
        }
    }

    //zapisov·nÌ sou¯adnic neuronov˝ch sÌtÌ
    function writeLines(graph) {
        var pointX = (graph.getAttribute("width") - 35) / (x_max - axis_x_min);
        var pointY = (graph.getAttribute("height") - 35) / (y_max - axis_y_min);
        var lines_i = [];
        for (i = 0; i < W.length; i++) {
            var x1 = -(W[i][1] * axis_y_min + b[i]) / W[i][0];
            var y1 = -(W[i][0] * x1 + b[i]) / W[i][1];
            var x2 = -(W[i][1] * y_max + b[i]) / W[i][0];
            var y2 = -(W[i][0] * x2 + b[i]) / W[i][1];

            if (x1 > x_max || x1 < axis_x_min) {
                y1 = -(W[i][0] * x_max + b[i]) / W[i][1];
                if (y1 > y_max || y1 < axis_y_min || (y1 - y2) * (y1 - y2) < 1)
                    y1 = -(W[i][0] * axis_x_min + b[i]) / W[i][1];
                x1 = -(W[i][1] * y1 + b[i]) / W[i][0];
            }
            if (x2 > x_max || x2 < axis_x_min) {
                y2 = -(W[i][0] * x_max + b[i]) / W[i][1];
                if (y2 > y_max || y2 < axis_y_min || (y1 - y2) * (y1 - y2) < 1)
                    y2 = -(W[i][0] * axis_x_min + b[i]) / W[i][1];
                x2 = -(W[i][1] * y2 + b[i]) / W[i][0];
            }
            lines_i.push([Number(pointX * (x1 - axis_x_min) + 30), Number(pointY * (y_max - y1) + 5), Number(pointX * (x2 - axis_x_min) + 30), Number(pointY * (y_max - y2) + 5)]);
        }
        lines.push(lines_i);
    }     

    //krokov·nÌ
    getOnTheStep = function () {
        var graph_error = document.getElementById("graph-error");
        var graph_network = document.getElementById("graph-network");
        var nbr_step = document.getElementById("garph-numberOfStep");
        var nbr_cycle = document.getElementById("garph-numberOfCycle");
        neuralNetworkSettings();
        krok = nbr_step.value - 1;
        cyklus = Math.ceil(nbr_cycle.max / nbr_step.max * (krok + 1));
        if (nbr_cycle.value != cyklus) {
            nbr_cycle.value = cyklus;
            drawGraphError(graph_error, cyklus, Ec_all, E_max);
        }
        nbr_cycle.value = cyklus;
        drawGraphLines2D(graph_network, lines[krok]);
    }

    //cyklov·nÌ
    getOnTheCycle = function () {
        var graph_error = document.getElementById("graph-error");
        var graph_network = document.getElementById("graph-network");
        var nbr_step = document.getElementById("garph-numberOfStep");
        var nbr_cycle = document.getElementById("garph-numberOfCycle");
        neuralNetworkSettings();
        cyklus = nbr_cycle.value;
        krok = nbr_step.max / nbr_cycle.max * (cyklus - 1) + 1;
        nbr_step.value = krok;
        drawGraphError(graph_error, cyklus, Ec_all, E_max);
        drawGraphLines2D(graph_network, lines[krok]);
    }

    //animace
    anim = function () {
        var nbr_ms = document.getElementById("garph-animate");
        if (Number(nbr_ms.value) > Number(nbr_ms.max))
            nbr_ms.value = nbr_ms.max;
        else if (nbr_ms.value < nbr_ms.min)
            nbr_ms.value = nbr_ms.min;

        var nbr_cycle = document.getElementById("garph-numberOfCycle");
        var nbr_step = document.getElementById("garph-numberOfStep");
        var graph_error = document.getElementById("graph-error");
        var graph_network = document.getElementById("graph-network");
        var i = setInterval(frame, nbr_ms.value);
        var qi = 0;
        function frame() {
            if (qi == nbr_cycle.max) {
                clearInterval(i);
            } else {
                qi++;
                krok = nbr_step.max / nbr_cycle.max * (qi - 1) + 1;
                nbr_step.value = krok;
                nbr_cycle.value = qi;
                drawGraphError(graph_error, qi, Ec_all, E_max);
                drawGraphLines2D(graph_network, lines[krok]);
            }
        }
    }

    //hlÌd·nÌ mezÌ jednotliv˝ch polÌËek pro zad·v·nÌ hodnot
    neuralNetworkSettings = function () {          
        var nbr_pairs = document.getElementById("numberOfPairs");
        if(Number(nbr_pairs.value) > Number(nbr_pairs.max))      
            nbr_pairs.value = nbr_pairs.max;
        else if(nbr_pairs.value < nbr_pairs.min)
            nbr_pairs.value = nbr_pairs.min;
        numberOfPairs()  

        var nbr_cycles = document.getElementById("numberOfTrainingCycles");
        if(Number(nbr_cycles.value) > Number(nbr_cycles.max))
            nbr_cycles.value = nbr_cycles.max;
        else if(Number(nbr_cycles.value) < Number(nbr_cycles.min))
            nbr_cycles.value = nbr_cycles.min;

        var nbr_neurons = document.getElementById("numberOfNeurons");
        if(Number(nbr_neurons.value) > Number(nbr_neurons.max))
            nbr_neurons.value = nbr_neurons.max;
        else if(Number(nbr_neurons.value) < Number(nbr_neurons.min))
            nbr_neurons.value = nbr_neurons.min;     

        var const_learning = document.getElementById("constantOfLearning");
        if(Number(const_learning.value) > Number(const_learning.max))
            const_learning.value = const_learning.max;
        else if(Number(const_learning.value) < Number(const_learning.min))
            const_learning.value = const_learning.min;  

        var max_error = document.getElementById("maxError");
        if(Number(max_error.value) > Number(max_error.max))
            max_error.value = max_error.max;
        else if(Number(max_error.value) < Number(max_error.min))
            max_error.value = max_error.min;  

        var nbr_step = document.getElementById("garph-numberOfStep");
        if (Number(nbr_step.value) > Number(nbr_step.max))
            nbr_step.value = nbr_step.max;
        else if (Number(nbr_step.value) < Number(nbr_step.min))
            nbr_step.value = nbr_step.min;

        var nbr_cycle = document.getElementById("garph-numberOfCycle");
        if (Number(nbr_cycle.value) > Number(nbr_cycle.max))
            nbr_cycle.value = nbr_cycle.max;
        else if (Number(nbr_cycle.value) < Number(nbr_cycle.min))
            nbr_cycle.value = nbr_cycle.min;
    }   

    /**
     * SPECI¡LNÕ FUNKCE PRO STR¡NKU S PÿÕKLADY
     */
    // PÿÕKLAD 1
    var krok_ex1 = 0;
    var lines_ex1 = 0;
    var E_ex1 = [];
    var Emax_ex1 = 0;
    function example1inputs() {
        pairs = new Array(16);
        valuesOfClasses = [];
        //t¯Ìda 1
        valuesOfClasses.push(1);
        pairs[0] = new Array(Number(0 - 15), Number(0), Number(1));
        pairs[1] = new Array(Number(1 - 15), Number(1), Number(1));
        pairs[2] = new Array(Number(2 - 15), Number(0), Number(1));
        pairs[3] = new Array(Number(1 - 15), Number(-1), Number(1));

        //t¯Ìda 2
        valuesOfClasses.push(2);
        pairs[4] = new Array(Number(10 - 15), Number(0), Number(2));
        pairs[5] = new Array(Number(11 - 15), Number(1), Number(2));
        pairs[6] = new Array(Number(12 - 15), Number(0), Number(2));
        pairs[7] = new Array(Number(11 - 15), Number(-1), Number(2));

        //t¯Ìda 3
        valuesOfClasses.push(3);
        pairs[8] = new Array(Number(20 - 15), Number(0), Number(3));
        pairs[9] = new Array(Number(21 - 15), Number(1), Number(3));
        pairs[10] = new Array(Number(22 - 15), Number(0), Number(3));
        pairs[11] = new Array(Number(21 - 15), Number(-1), Number(3));

        //t¯Ìda 4
        valuesOfClasses.push(4);
        pairs[12] = new Array(Number(30 - 15), Number(0), Number(4));
        pairs[13] = new Array(Number(31 - 15), Number(1), Number(4));
        pairs[14] = new Array(Number(32 - 15), Number(0), Number(4));
        pairs[15] = new Array(Number(31 - 15), Number(-1), Number(4));

        x_min = -5 - 15;
        x_max = 37 - 15;
        y_min = -15;
        y_max = 15;
    }

    startExample1 = function () {  
        krok_ex1 = 0;
        lines_ex1 = 0;
        E_ex1 = [];
        Emax_ex1 = 0;
        
        example1inputs();
        var neurons = 0;
        if (document.getElementById("list-example1").value == "2 neurony") {
            coordinates = [];
            coordinates.push(new Array(1, 1));
            coordinates.push(new Array(1, -1));
            coordinates.push(new Array(-1, -1));
            coordinates.push(new Array(-1, 1));
            neurons = 2;
        } else if (document.getElementById("list-example1").value == "3 neurony") {
            coordinates = new Array(3);
            coordinates[0] = new Array(1, 1, 1);
            coordinates[1] = new Array(-1, 1, 1);
            coordinates[2] = new Array(-1, -1, 1);
            coordinates[3] = new Array(-1, -1, -1);
            neurons = 3;
        } else if (document.getElementById("list-example1").value == "4 neurony") {
            coordinates = [];
            coordinates.push(new Array(1, 1, 1, 1));
            coordinates.push(new Array(-1, 1, 1, 1));
            coordinates.push(new Array(-1, -1, 1, 1));
            coordinates.push(new Array(-1, -1, -1, 1));
            neurons = 4;
        }
        startNeuralNetwork(document.getElementById("graph-example1"), neurons, 0, 100, 1);

        //nastavenÌ rozhranÌ
        lines_ex1 = lines;
        E_ex1 = Ec_all;
        Emax_ex1 = E_max;
        
        krok_ex1 = lines_ex1.length - 1;
        document.getElementById("step-example1").setAttribute("min", 1);
        document.getElementById("step-example1").setAttribute("max", krok_ex1 + 1);
        document.getElementById("step-example1").value = krok_ex1 + 1;
        
        cyklus = q;
        document.getElementById("cycle-example1").setAttribute("min", 1);
        document.getElementById("cycle-example1").setAttribute("max", cyklus);
        document.getElementById("cycle-example1").value = cyklus;

        drawGraphLines2D(document.getElementById("graph-example1"), lines_ex1[krok_ex1]); 
        drawGraphError(document.getElementById("error-example1"), cyklus, E_ex1, Emax_ex1);
    }   
    
    step_example1 = function () {
        var cyc = document.getElementById("cycle-example1");  
        var step = document.getElementById("step-example1");
        if (Number(cyc.value) > Number(cyc.max))
            cyc.value = cyc.max;
        else if (Number(cyc.value) < Number(cyc.min))
            cyc.value = cyc.min;  
        if (Number(step.value) > Number(step.max))
            step.value = step.max;
        else if (Number(cyc.value) < Number(cyc.min))
            step.value = step.min;
                           
        krok_ex1 = step.value - 1;
        cyklus = Math.ceil(cyc.max / step.max * (krok_ex1 + 1)); 
        if (cyc.value != cyklus) {
            cyc.value = cyklus;
            drawGraphError(document.getElementById("error-example1"), cyklus, E_ex1, Emax_ex1);
        }
        drawGraphLines2D(document.getElementById("graph-example1"), lines_ex1[krok_ex1]);
    }   
    
    cycle_example1 = function () {
        var cyc = document.getElementById("cycle-example1");  
        var step = document.getElementById("step-example1"); 
        if (Number(cyc.value) > Number(cyc.max))
            cyc.value = cyc.max;
        else if (Number(cyc.value) < Number(cyc.min))
            cyc.value = cyc.min;   
        if (Number(step.value) > Number(step.max))
            step.value = step.max;
        else if (Number(cyc.value) < Number(cyc.min))
            step.value = step.min;

        cyklus = cyc.value;
        krok_ex1 = step.max / cyc.max * (cyklus - 1) + 1;
        step.value = krok_ex1;
        drawGraphLines2D(document.getElementById("graph-example1"), lines_ex1[krok_ex1]);
        drawGraphError(document.getElementById("error-example1"), cyklus, E_ex1, Emax_ex1);
    }  
    
    //PÿÕKLAD 2
    var krok_ex2 = 0;
    var lines_ex2 = 0;
    var E_ex2 = [];
    var Emax_ex2 = 0;
    
    function example2inputs() {
        pairs = new Array(16);
        valuesOfClasses = [];
        //t¯Ìda 1
        valuesOfClasses.push(1);
        pairs[0] = new Array(Number(-11), Number(0), Number(1));
        pairs[1] = new Array(Number(-10), Number(1), Number(1));
        pairs[2] = new Array(Number(-9), Number(0), Number(1));
        pairs[3] = new Array(Number(-10), Number(-1), Number(1));

        //t¯Ìda 2
        valuesOfClasses.push(2);
        pairs[4] = new Array(Number(-1), Number(0), Number(2));
        pairs[5] = new Array(Number(0), Number(1), Number(2));
        pairs[6] = new Array(Number(1), Number(0), Number(2));
        pairs[7] = new Array(Number(0), Number(-1), Number(2));

        //t¯Ìda 3
        valuesOfClasses.push(3);
        pairs[8] = new Array(Number(9), Number(0), Number(3));
        pairs[9] = new Array(Number(10), Number(1), Number(3));
        pairs[10] = new Array(Number(11), Number(0), Number(3));
        pairs[11] = new Array(Number(10), Number(-1), Number(3));

        //t¯Ìda 4
        valuesOfClasses.push(4);
        pairs[12] = new Array(Number(-1), Number(10), Number(4));
        pairs[13] = new Array(Number(0), Number(11), Number(4));
        pairs[14] = new Array(Number(1), Number(10), Number(4));
        pairs[15] = new Array(Number(0), Number(9), Number(4));

        x_min = -16;
        x_max = 16;
        y_min = -5;
        y_max = 15;
    }

    startExample2 = function () {  
        krok_ex2 = 0;
        lines_ex2 = 0;
        E_ex2 = [];
        Emax_ex2 = 0;
        
        example2inputs();
        var neurons = 0;
        if (document.getElementById("list-example2").value == "2 neurony") {
            coordinates = [];
            coordinates.push(new Array(1, 1));
            coordinates.push(new Array(-1, 1));
            coordinates.push(new Array(-1, -1));
            coordinates.push(new Array(1, -1));
            neurons = 2;
        } else if (document.getElementById("list-example2").value == "3 neurony") {
            coordinates = new Array(3);
            coordinates[0] = new Array(1, 1, 1);
            coordinates[1] = new Array(1, -1, 1);
            coordinates[2] = new Array(1, -1, -1);
            coordinates[3] = new Array(-1, -1, 1);
            neurons = 3;
        } else if (document.getElementById("list-example2").value == "4 neurony") {
            coordinates = [];
            coordinates.push(new Array(1, 1, 1, 1));
            coordinates.push(new Array(1, -1, 1, 1));
            coordinates.push(new Array(1, -1, -1, -1));
            coordinates.push(new Array(-1, 1, -1, 1));
            neurons = 4;
        }
        startNeuralNetwork(document.getElementById("graph-example2"), neurons, 0, 100, 1);

        //nastavenÌ rozhranÌ
        lines_ex2 = lines;
        E_ex2 = Ec_all;
        Emax_ex2 = E_max;
        
        krok_ex2 = lines_ex2.length - 1;
        document.getElementById("step-example2").setAttribute("min", 1);
        document.getElementById("step-example2").setAttribute("max", krok_ex2 + 1);
        document.getElementById("step-example2").value = krok_ex2 + 1;
        
        cyklus = q;
        document.getElementById("cycle-example2").setAttribute("min", 1);
        document.getElementById("cycle-example2").setAttribute("max", cyklus);
        document.getElementById("cycle-example2").value = cyklus;

        drawGraphLines2D(document.getElementById("graph-example2"), lines_ex2[krok_ex2]); 
        drawGraphError(document.getElementById("error-example2"), cyklus, E_ex2, Emax_ex2);
    }   
    
    step_example2 = function () {
        var cyc = document.getElementById("cycle-example2");  
        var step = document.getElementById("step-example2");
        if (Number(cyc.value) > Number(cyc.max))
            cyc.value = cyc.max;
        else if (Number(cyc.value) < Number(cyc.min))
            cyc.value = cyc.min;  
        if (Number(step.value) > Number(step.max))
            step.value = step.max;
        else if (Number(cyc.value) < Number(cyc.min))
            step.value = step.min;
                           
        krok_ex2 = step.value - 1;
        cyklus = Math.ceil(cyc.max / step.max * (krok_ex2 + 1)); 
        if (cyc.value != cyklus) {
            cyc.value = cyklus;
            drawGraphError(document.getElementById("error-example2"), cyklus, E_ex2, Emax_ex2);
        }
        drawGraphLines2D(document.getElementById("graph-example2"), lines_ex2[krok_ex2]);
    }   
    
    cycle_example2 = function () {
        var cyc = document.getElementById("cycle-example2");  
        var step = document.getElementById("step-example2"); 
        if (Number(cyc.value) > Number(cyc.max))
            cyc.value = cyc.max;
        else if (Number(cyc.value) < Number(cyc.min))
            cyc.value = cyc.min;   
        if (Number(step.value) > Number(step.max))
            step.value = step.max;
        else if (Number(cyc.value) < Number(cyc.min))
            step.value = step.min;

        cyklus = cyc.value;
        krok_ex2 = step.max / cyc.max * (cyklus - 1) + 1;
        step.value = krok_ex2;
        drawGraphLines2D(document.getElementById("graph-example2"), lines_ex2[krok_ex2]);
        drawGraphError(document.getElementById("error-example2"), cyklus, E_ex2, Emax_ex2);
    }  
        
    //PÿÕKLAD 3
    var krok_ex3 = 0;
    var lines_ex3 = 0;
    var E_ex3 = [];
    var Emax_ex3 = 0;
    
    function example3inputs() {
        pairs = new Array(16);
        valuesOfClasses = [];
        //t¯Ìda 1
        valuesOfClasses.push(1);
        pairs[0] = new Array(Number(-11), Number(0), Number(1));
        pairs[1] = new Array(Number(-10), Number(1), Number(1));
        pairs[2] = new Array(Number(-9), Number(0), Number(1));
        pairs[3] = new Array(Number(-10), Number(-1), Number(1));

        //t¯Ìda 2
        valuesOfClasses.push(2);
        pairs[4] = new Array(Number(-1), Number(-10), Number(2));
        pairs[5] = new Array(Number(0), Number(-9), Number(2));
        pairs[6] = new Array(Number(1), Number(-10), Number(2));
        pairs[7] = new Array(Number(0), Number(-11), Number(2));

        //t¯Ìda 3
        valuesOfClasses.push(3);
        pairs[8] = new Array(Number(9), Number(0), Number(3));
        pairs[9] = new Array(Number(10), Number(1), Number(3));
        pairs[10] = new Array(Number(11), Number(0), Number(3));
        pairs[11] = new Array(Number(10), Number(-1), Number(3));

        //t¯Ìda 4
        valuesOfClasses.push(4);
        pairs[12] = new Array(Number(-1), Number(10), Number(4));
        pairs[13] = new Array(Number(0), Number(11), Number(4));
        pairs[14] = new Array(Number(1), Number(10), Number(4));
        pairs[15] = new Array(Number(0), Number(9), Number(4));

        x_min = -26;
        x_max = 26;
        y_min = -15;
        y_max = 15;
    }

    startExample3 = function () {  
        krok_ex3 = 0;
        lines_ex3 = 0;
        E_ex3 = [];
        Emax_ex3 = 0;
        
        example3inputs();
        var neurons = 0;
        if (document.getElementById("list-example3").value == "2 neurony") {
            coordinates = [];
            coordinates.push(new Array(1, 1));
            coordinates.push(new Array(-1, 1));
            coordinates.push(new Array(-1, -1));
            coordinates.push(new Array(1, -1));
            neurons = 2;
        } else if (document.getElementById("list-example3").value == "3 neurony") {
            coordinates = new Array(3);
            coordinates[0] = new Array(1, 1, 1);
            coordinates[1] = new Array(-1, -1, 1);
            coordinates[2] = new Array(1, -1, -1);
            coordinates[3] = new Array(1, 1, -1);
            neurons = 3;
        } else if (document.getElementById("list-example3").value == "4 neurony") {
            coordinates = [];
            coordinates.push(new Array(1, -1, -1, -1));
            coordinates.push(new Array(-1, 1, -1, -1));
            coordinates.push(new Array(-1, -1, 1, -1));
            coordinates.push(new Array(-1, -1, -1, 1));
            neurons = 4;
        }
        startNeuralNetwork(document.getElementById("graph-example3"), neurons, 0, 100, 1);

        //nastavenÌ rozhranÌ
        lines_ex3 = lines;
        E_ex3 = Ec_all;
        Emax_ex3 = E_max;
        
        krok_ex3 = lines_ex3.length - 1;
        document.getElementById("step-example3").setAttribute("min", 1);
        document.getElementById("step-example3").setAttribute("max", krok_ex3 + 1);
        document.getElementById("step-example3").value = krok_ex3 + 1;
        
        cyklus = q;
        document.getElementById("cycle-example3").setAttribute("min", 1);
        document.getElementById("cycle-example3").setAttribute("max", cyklus);
        document.getElementById("cycle-example3").value = cyklus;

        drawGraphLines2D(document.getElementById("graph-example3"), lines_ex3[krok_ex3]); 
        drawGraphError(document.getElementById("error-example3"), cyklus, E_ex3, Emax_ex3);
    }   
    
    step_example3 = function () {
        var cyc = document.getElementById("cycle-example3");  
        var step = document.getElementById("step-example3");
        if (Number(cyc.value) > Number(cyc.max))
            cyc.value = cyc.max;
        else if (Number(cyc.value) < Number(cyc.min))
            cyc.value = cyc.min;  
        if (Number(step.value) > Number(step.max))
            step.value = step.max;
        else if (Number(cyc.value) < Number(cyc.min))
            step.value = step.min;
                           
        krok_ex3 = step.value - 1;
        cyklus = Math.ceil(cyc.max / step.max * (krok_ex3 + 1)); 
        if (cyc.value != cyklus) {
            cyc.value = cyklus;
            drawGraphError(document.getElementById("error-example3"), cyklus, E_ex3, Emax_ex3);
        }
        drawGraphLines2D(document.getElementById("graph-example3"), lines_ex3[krok_ex3]);
    }   
    
    cycle_example3 = function () {
        var cyc = document.getElementById("cycle-example3");  
        var step = document.getElementById("step-example3"); 
        if (Number(cyc.value) > Number(cyc.max))
            cyc.value = cyc.max;
        else if (Number(cyc.value) < Number(cyc.min))
            cyc.value = cyc.min;   
        if (Number(step.value) > Number(step.max))
            step.value = step.max;
        else if (Number(cyc.value) < Number(cyc.min))
            step.value = step.min;

        cyklus = cyc.value;
        krok_ex3 = step.max / cyc.max * (cyklus - 1) + 1;
        step.value = krok_ex3;
        drawGraphLines2D(document.getElementById("graph-example3"), lines_ex3[krok_ex3]);
        drawGraphError(document.getElementById("error-example3"), cyklus, E_ex3, Emax_ex3);
    }

    //PÿÕKLAD 4
    var krok_ex4 = 0;
    var lines_ex4 = 0;
    var E_ex4 = [];
    var Emax_ex4 = 0;

    function example4inputs(x, y) {
        pairs = new Array(16);
        valuesOfClasses = [];
        //t¯Ìda 1
        valuesOfClasses.push(1);
        pairs[0] = new Array(Number(-11 + x), Number(y), Number(1));
        pairs[1] = new Array(Number(-10 + x), Number(1 + y), Number(1));
        pairs[2] = new Array(Number(-9 + x), Number(y), Number(1));
        pairs[3] = new Array(Number(-10 + x), Number(-1 + y), Number(1));

        //t¯Ìda 2
        valuesOfClasses.push(2);
        pairs[4] = new Array(Number(-1 + x), Number(-10 + y), Number(2));
        pairs[5] = new Array(Number(x), Number(-9 + y), Number(2));
        pairs[6] = new Array(Number(1 + x), Number(-10 + y), Number(2));
        pairs[7] = new Array(Number(x), Number(-11 + y), Number(2));

        //t¯Ìda 3
        valuesOfClasses.push(3);
        pairs[8] = new Array(Number(9 + x), Number(y), Number(3));
        pairs[9] = new Array(Number(10 + x), Number(1 + y), Number(3));
        pairs[10] = new Array(Number(11 + x), Number(y), Number(3));
        pairs[11] = new Array(Number(10 + x), Number(-1 + y), Number(3));

        //t¯Ìda 4
        valuesOfClasses.push(4);
        pairs[12] = new Array(Number(-1 + x), Number(10 + y), Number(4));
        pairs[13] = new Array(Number(x), Number(11 + y), Number(4));
        pairs[14] = new Array(Number(1 + x), Number(10 + y), Number(4));
        pairs[15] = new Array(Number(x), Number(9 + y), Number(4));

        x_min = -26 + x;
        x_max = 26 + x;
        y_min = -15 + y;
        y_max = 15 + y;
    }

    startExample4 = function () {
        krok_ex4 = 0;
        lines_ex4 = 0;
        E_ex4 = [];
        Emax_ex4 = 0;

        var neurons = 3;
        coordinates = new Array(3);
        coordinates[0] = new Array(1, 1, 1);
        coordinates[1] = new Array(-1, -1, 1);
        coordinates[2] = new Array(1, -1, -1);
        coordinates[3] = new Array(1, 1, -1);
        if (document.getElementById("list-example4").value == "1.")
            example4inputs(2, -10);
        else if (document.getElementById("list-example4").value == "2.")
            example4inputs(0, 0);

        startNeuralNetwork(document.getElementById("graph-example4"), neurons, 0, 100, 1);

        //nastavenÌ rozhranÌ
        lines_ex4 = lines;
        E_ex4 = Ec_all;
        Emax_ex4 = E_max;

        krok_ex4 = lines_ex4.length - 1;
        document.getElementById("step-example4").setAttribute("min", 1);
        document.getElementById("step-example4").setAttribute("max", krok_ex4 + 1);
        document.getElementById("step-example4").value = krok_ex4 + 1;

        cyklus = q;
        document.getElementById("cycle-example4").setAttribute("min", 1);
        document.getElementById("cycle-example4").setAttribute("max", cyklus);
        document.getElementById("cycle-example4").value = cyklus;

        drawGraphLines2D(document.getElementById("graph-example4"), lines_ex4[krok_ex4]);
        drawGraphError(document.getElementById("error-example4"), cyklus, E_ex4, Emax_ex4);
    }

    step_example4 = function () {
        var cyc = document.getElementById("cycle-example4");
        var step = document.getElementById("step-example4");
        if (Number(cyc.value) > Number(cyc.max))
            cyc.value = cyc.max;
        else if (Number(cyc.value) < Number(cyc.min))
            cyc.value = cyc.min;
        if (Number(step.value) > Number(step.max))
            step.value = step.max;
        else if (Number(cyc.value) < Number(cyc.min))
            step.value = step.min;

        krok_ex4 = step.value - 1;
        cyklus = Math.ceil(cyc.max / step.max * (krok_ex4 + 1));
        if (cyc.value != cyklus) {
            cyc.value = cyklus;
            drawGraphError(document.getElementById("error-example4"), cyklus, E_ex4, Emax_ex4);
        }
        drawGraphLines2D(document.getElementById("graph-example4"), lines_ex4[krok_ex4]);
    }

    cycle_example4 = function () {
        var cyc = document.getElementById("cycle-example4");
        var step = document.getElementById("step-example4");
        if (Number(cyc.value) > Number(cyc.max))
            cyc.value = cyc.max;
        else if (Number(cyc.value) < Number(cyc.min))
            cyc.value = cyc.min;
        if (Number(step.value) > Number(step.max))
            step.value = step.max;
        else if (Number(cyc.value) < Number(cyc.min))
            step.value = step.min;

        cyklus = cyc.value;
        krok_ex4 = step.max / cyc.max * (cyklus - 1) + 1;
        step.value = krok_ex4;
        drawGraphLines2D(document.getElementById("graph-example4"), lines_ex4[krok_ex4]);
        drawGraphError(document.getElementById("error-example4"), cyklus, E_ex4, Emax_ex4);
    }  
});