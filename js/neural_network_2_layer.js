$(document).ready(function () {
    // Globalni promenne NEURONOVÝCH SÍTÍ
    var mu_x = 0;
    var mu_y = 0;
    var mu_z = 0;
    var V = [];
    var V0 = [];
    var W = [];
    var W0 = [];
    var b = [];
    var b0 = [];
    var d = [];
    var d0 = [];

    var k = 1;
    var p = 1;
    var q = 0;
    var E = [];
    var E_max = 0;
    var Ec_all = [];
    var lambda1 = 0;
    var lambda2 = 0;
    
    var x = [];
    var y = [];
    var z = [];
    var u = [];
    var pairs = [];

    /**
     * VYKRESLENÍ
     */
    //vykreslení chyby
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

    drawError = function () {
        drawGraphError(document.getElementById("graph-error"), q, Ec_all, E_max);
    }
    /**
     * ÚPRAVA ELEMENTÙ STRÁNKY
     */
    //pøidávání/odebírání souøadnic trénovacích dvojic
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

                cel = row.insertCell(3);
                cel.innerHTML = '<select id="y' + String(i - 1) + ',0"><option>-1</option><option>1</option></select>';
                cel = row.insertCell(4);
                cel.innerHTML = '<select id="y' + String(i - 1) + ',1"><option>-1</option><option>1</option></select>';
                cel = row.insertCell(5);
                cel.innerHTML = '<select id="y' + String(i - 1) + ',2"><option>-1</option><option>1</option></select>';
                cel = row.insertCell(6);
                cel.innerHTML = '<select id="y' + String(i - 1) + ',3"><option>-1</option><option>1</option></select>';
                cel = row.insertCell(7);
                cel.innerHTML = '<select id="y' + String(i - 1) + ',4"><option>-1</option><option>1</option></select>';
                cel = row.insertCell(8);
                cel.innerHTML = '<select id="y' + String(i - 1) + ',5"><option>-1</option><option>1</option></select>';
                cel = row.insertCell(9);
                cel.innerHTML = '<select id="y' + String(i - 1) + ',6"><option>-1</option><option>1</option></select>';
            }
        else if (table.rows.length - 1 > nbr)
            for (i = table.rows.length - 1; i > nbr; i--) {
                table.deleteRow(i);
            }
    }
    
    //zobrazení / skrytí trénovací množiny
    collapsePairs = function () {
        var div = document.getElementById("pairs");
        if (div.style.display === "none")
            div.style.display = "block";
        else
            div.style.display = "none";
    }

    collapseOutput = function () {
        var table = document.getElementById("outputs");
        if (table.style.display === "none")
            table.style.display = "block";
        else
            table.style.display = "none";
    }

    //testování sítì
    test = function () {
        var x = new Array(3);
        x[0] = Number(document.getElementById("x1-test").value - mu_x);
        x[1] = Number(document.getElementById("x2-test").value - mu_y);
        x[2] = Number(document.getElementById("x3-test").value - mu_z);

        z = [];
        for (i = 0; i < W.length; i++) {
            var z_i = 0;
            for (j = 0; j < W[i].length; j++) {
                z_i += W[i][j] * x[j];
            }
            z.push(bipol_spoj(z_i + b[i], lambda1));
        }

        y = []; //2. vrstva
        for (i = 0; i < V.length; i++) {
            var y_i = 0;
            for (j = 0; j < V[i].length; j++) {
                y_i += V[i][j] * z[j];
            }
            y.push(Math.round(bipol_spoj(y_i + d[i], lambda2) * 100) / 100);
        }
        document.getElementById("result-test").innerHTML = y;
    }

    /**
     * ÈTENÍ ZE SOUBORU
     */
    //naètení trénovacích dvojic ze souboru
    loadPairs = function (event) {
        var file = event.target;

        var reader = new FileReader();
        reader.onload = function () {
            var lines = reader.result.split('\n');
            document.getElementById("numberOfPairs").value = lines.length;
            numberOfPairs();
            var line = 0
            while (line < lines.length) {
                var items = lines[line].replace(/\s\s+/g, ' ');
                items = items.split(' ');
                if (items.length < 10) {
                    lines.splice(line, 1);
                    continue;
                }
                var item = 0;
                while (item < items.length) {
                    if (items[item] == '') {
                        items.splice(item, 1);
                        continue;
                    }
                    if (item < 3)
                        document.getElementById("x" + line + "," + item).value = Number(items[item++]);
                    else
                        document.getElementById("y" + line + "," + (item - 3)).value = Number(items[item++]);
                }
                ++line;
            }
            document.getElementById("numberOfPairs").value = line;
            numberOfPairs();     
        }
        reader.readAsText(file.files[0]);
    }

    /**
     * ÈTENÍ PROMÌNNÝCH ZE STRÁNKY
     */
    //pøeètení vstupních a výstupních souøadnic ze stránky
    function getPairs () {
        pairs = new Array(document.getElementById("numberOfPairs").value);
        for (i = 0; i < document.getElementById("numberOfPairs").value; i++) {
            pairs[i] = new Array(10);
            for (j = 0; j < 10; j++) {
                if (j < 3)
                    pairs[i][j] = Number(document.getElementById('x' + i + ',' + j).value);
                else
                    pairs[i][j] = Number(document.getElementById('y' + i + ',' + String(j - 3)).value);
            }
        }
    }
    
    /**
     * NEURONOVÁ SÍ + VÝPOÈTY
     */
    //výpoèet neuronové sítì
    function startNeuralNetwork(nw_error, nw_cycles, nw_c, nw_neurons_in_HL, lambda1, lambda2) {
        //1. (skrytá) vrstva
        W = new Array(nw_neurons_in_HL);
        W0 = new Array(nw_neurons_in_HL)
        for (i = 0; i < nw_neurons_in_HL; i++) {
            W[i] = new Array(3);
            W0[i] = new Array(3)
            for (j = 0; j < 3; j++) {
                var x = Math.random() * 10;
                W[i][j] = x;
                W0[i][j] = x;
            }
        }
        b = new Array(nw_neurons_in_HL);
        b0 = new Array(nw_neurons_in_HL);
        for (i = 0; i < nw_neurons_in_HL; i++) {
            var x = Math.random() * 10;
            b[i] = x;
            b0[i] = x;
        }

        //2. vrstva
        V = new Array(7);
        V0 = new Array(7)
        for (i = 0; i < 7; i++) {
            V[i] = new Array(nw_neurons_in_HL);
            V0[i] = new Array(nw_neurons_in_HL)
            for (j = 0; j < nw_neurons_in_HL; j++) {
                var x = Math.random() * 10;
                V[i][j] = x;
                V0[i][j] = x;
            }
        }
        d = new Array(7);
        d0 = new Array(7);
        for (i = 0; i < 7; i++) {
            var x = Math.random() * 10;
            d[i] = x;
            d0[i] = x;
        }

        q = 0; //cyklus
        var Ec = 80; //inicializace max chyby - aby prošel první while
        Ec_all = []; //uložení všech chyb cyklù
        E_max = 0; //uložení nejvyšší chyby

        while (Ec > nw_error && q < nw_cycles) { //ukonèovcí podmínky neuronové sítì
            ++q;
            k = 0;
            E = []; E.push(0);
            x = [];
            u = [];
            
            while (pairs.length != 0) {
                //výpoèet výstupu   
                p = Math.floor(Math.random() * (pairs.length));
                x.push(pairs[p]);
                pairs.splice(p, 1);

                z = []; //1. (skrytá) vrstva
                for (i = 0; i < W.length; i++) {
                    var z_ij = 0;
                    for (j = 0; j < W[i].length; j++) {
                        z_ij += W[i][j] * x[k][j];
                    }
                    z.push(bipol_spoj(z_ij + b[i], lambda1));
                }
                
                y = []; //2. vrstva
                for (i = 0; i < V.length; i++) {
                    var y_i = 0;
                    for (j = 0; j < V[i].length; j++) {
                        y_i += V[i][j] * z[j];
                    }
                    y.push(bipol_spoj(y_i + d[i], lambda2));
                }

                u = [x[k][3], x[k][4], x[k][5], x[k][6], x[k][7], x[k][8], x[k][9]]; // uèitel

                //výpoèet chyby
                var uy = [];
                var uy_i2 = 0;
                for (i = 0; i < u.length; i++) {
                    uy.push(u[i] - y[i]);
                    uy_i2 += (u[i] - y[i]) * (u[i] - y[i]);
                }
                E.push(E[k] + 1 / 2 * uy_i2);

                //výpoèet V(k) * z(k) + d(k)
                var vzd = [];
                for (i = 0; i < V.length; i++) {
                    var v_i = 0;
                    for (j = 0; j < V[i].length; j++) {
                        v_i += V[i][j] * z[j];
                    }
                    vzd.push(Number(v_i + d[i]));
                }

                //výpoèet W(k) * x(k) + b(k)
                var wxb = [];
                for (i = 0; i < W.length; i++) {
                    var w_i = 0;
                    for (j = 0; j < W[i].length; j++) {
                        w_i += W[i][j] * x[k][j];
                    }
                    wxb.push(Number(w_i + b[i]));
                }

                //výpoèet vektoru s derivacema
                var uy_gder_v_fder = [];
                for (i = 0; i < V[0].length; i++) {
                    var uy_gder_v_fder_i = 0;
                    for (j = 0; j < V.length; j++) {
                        uy_gder_v_fder_i += uy[j] * bipol_spoj_der(vzd[j], lambda2) * V[j][i] * bipol_spoj_der(wxb[i], lambda1);
                    }
                    uy_gder_v_fder.push(uy_gder_v_fder_i);
                }

                //Modifikace vah a prahù
                for (i = 0; i < W.length; i++) {
                    for (j = 0; j < W[i].length; j++) {
                        W[i][j] = W[i][j] + nw_c * uy_gder_v_fder[i] * x[k][j];
                    }
                    b[i] = b[i] + nw_c * uy_gder_v_fder[i];
                }

                for (i = 0; i < V.length; i++) {
                    var vzd_der = bipol_spoj_der(vzd[i], lambda2);
                    for (j = 0; j < V[i].length; j++) {
                        V[i][j] = V[i][j] + nw_c * uy[i] * vzd_der * z[j];
                    }
                    d[i] = d[i] + nw_c * uy[i] * vzd_der;
                }
                ++k;
            }
            pairs = x;
            Ec = E[k];
            if (E_max < E[k])
                E_max = E[k];
            Ec_all.push(E[k]);
        }
    }

    //výpoèet spojité bipolární funkce
    function bipol_spoj(xi, lambda) {
        return 2 / (1 + Math.exp(-lambda * xi)) - 1;
    }

    //výpoèet derivace spojité bipolární funkce
    function bipol_spoj_der(xi, lambda) {
        return lambda / 2 * (1 - Math.pow((2 / (1 + Math.exp(-lambda * xi)) - 1), 2));
    }

    //výpoèet spojité lineární funkce
    function lin_spoj(xi, lambda) {
        return lambda * xi;
    }

    //výpoèet derivace spojité lineární funkce
    function lin_spoj_der(xi, lambda) {
        return lambda;
    }
     
    //získání støední hodnoty     
    function getMu() {
        mu_x = 0;
        mu_y = 0;
        mu_z = 0;
        for (i = 0; i < pairs.length; i++) {
            mu_x += pairs[i][0];
            mu_y += pairs[i][1];
            mu_z += pairs[i][2];
        }
        mu_x /= pairs.length;
        mu_y /= pairs.length;
        mu_z /= pairs.length;
    }

    function addMuToPairs(x, y, z) {
        for (i = 0; i < pairs.length; i++) {
            pairs[i][0] -= x;
            pairs[i][1] -= y;
            pairs[i][2] -= z;
        }
    }

    //kliknutí na tlaèítko pro spuštìní neuronové sítì
    start = function () {
        var graph_error = document.getElementById("graph-error");

        //inicializace
        getPairs(); //vstupní a výstupní vektory
        if (document.getElementById("faster").checked == true) {
            getMu();
            addMuToPairs(mu_x, mu_y, mu_z);
        } else {
            mu_x = 0;
            mu_y = 0;
            mu_z = 0;
        }

        document.getElementById("mu").innerHTML = "[" + (Math.round(mu_x * 100) / 100) + ", " + (Math.round(mu_y * 100) / 100) + ", " + (Math.round(mu_z * 100) / 100) + "]";

        var nbr_cycles = document.getElementById("numberOfTrainingCycles").value;
        var const_learning = document.getElementById("constantOfLearning").value;
        var max_error = document.getElementById("maxError").value;
        var nbr_neuronsHL = document.getElementById("numberOfNeuronsInTheHiddenLayer").value;
        lambda1 = document.getElementById("lambda1").value;
        lambda2 = document.getElementById("lambda2").value;

        startNeuralNetwork(Number(max_error), Number(nbr_cycles), Number(const_learning), Number(nbr_neuronsHL), Number(lambda1), Number(lambda2));

        //výpis
        document.getElementById("E_end").innerHTML = Math.round(E[E.length - 1] * 100) / 100;

        var w0_table = document.getElementById("W0");
        var w_table = document.getElementById("W");
        var b0_table = document.getElementById("b0");
        var b_table = document.getElementById("b");
        w0_table.innerHTML = "";
        w_table.innerHTML = "";
        b0_table.innerHTML = "";
        b_table.innerHTML = "";
        for (i = 0; i < W.length; i++) {
            var row_w0 = w0_table.insertRow(i);
            var row_w = w_table.insertRow(i);
            var row_b0 = b0_table.insertRow(i);
            var row_b = b_table.insertRow(i);
            for (j = 0; j < W[i].length; j++) {
                var cel = row_w0.insertCell(j);
                cel.innerHTML = (Math.round(100 * W0[i][j]) / 100);
                cel = row_w.insertCell(j);
                cel.innerHTML = (Math.round(100 * W[i][j]) / 100);
            }
            var cel = row_b0.insertCell(0);
            cel.innerHTML = (Math.round(100 * b0[i]) / 100);
            cel = row_b.insertCell(0);
            cel.innerHTML = (Math.round(100 * b[i]) / 100);
        }
        var v0_table = document.getElementById("V0");
        var v_table = document.getElementById("V");
        var d0_table = document.getElementById("d0");
        var d_table = document.getElementById("d");
        v0_table.innerHTML = "";
        v_table.innerHTML = "";
        d0_table.innerHTML = "";
        d_table.innerHTML = "";
        for (i = 0; i < V.length; i++) {
            var row_v0 = v0_table.insertRow(i);
            var row_v = v_table.insertRow(i);
            var row_d0 = d0_table.insertRow(i);
            var row_d = d_table.insertRow(i);
            for (j = 0; j < V[i].length; j++) {
                var cel = row_v0.insertCell(j);
                cel.innerHTML = (Math.round(100 * V0[i][j]) / 100);
                cel = row_v.insertCell(j);
                cel.innerHTML = (Math.round(100 * V[i][j]) / 100);
            }
            var cel = row_d0.insertCell(0);
            cel.innerHTML = (Math.round(100 * d0[i]) / 100);
            cel = row_d.insertCell(0);
            cel.innerHTML = (Math.round(100 * d[i]) / 100);
        }
    }

    //hlídání mezí jednotlivých políèek pro zadávání hodnot
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

        var const_learning = document.getElementById("constantOfLearning");
        if (Number(const_learning.value) > Number(const_learning.max))
            const_learning.value = const_learning.max;
        else if (Number(const_learning.value) < Number(const_learning.min))
            const_learning.value = const_learning.min;

        var nbr_neuronsHL = document.getElementById("numberOfNeuronsInTheHiddenLayer");
        if (Number(nbr_neuronsHL.value) > Number(nbr_neuronsHL.max))
            nbr_neuronsHL.value = nbr_neuronsHL.max;
        else if (Number(nbr_neuronsHL.value) < Number(nbr_neuronsHL.min))
            nbr_neuronsHL.value = nbr_neuronsHL.min;

        var nbr_lambda1 = document.getElementById("lambda1");
        if (Number(nbr_lambda1.value) > Number(nbr_lambda1.max))
            nbr_lambda1.value = nbr_lambda1.max;
        else if (Number(nbr_lambda1.value) < Number(nbr_lambda1.min))
            nbr_lambda1.value = nbr_lambda1.min;

        var nbr_lambda2 = document.getElementById("lambda2");
        if (Number(nbr_lambda2.value) > Number(nbr_lambda2.max))
            nbr_lambda2.value = nbr_lambda2.max;
        else if (Number(nbr_lambda2.value) < Number(nbr_lambda2.min))
            nbr_lambda2.value = nbr_lambda2.min;  
        
        var max_error = document.getElementById("maxError");
        if(Number(max_error.value) > Number(max_error.max))
            max_error.value = max_error.max;
        else if(Number(max_error.value) < Number(max_error.min))
            max_error.value = max_error.min;  
    }
});