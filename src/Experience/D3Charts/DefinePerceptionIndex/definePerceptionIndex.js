const semanticTags = ['building', 'water', 'road', 'sidewalk', 'surface', 'tree', 'sky', 'miscellaneous']
let formula = [];
const formulaLibrary = {}; // Store all defined formulas

function define() {

    if (document.getElementById('formulaName').style.display == "none") {
        // alert("Collapsing");    
        document.getElementById("defineButton").innerHTML = '<i class="fa fa-caret-down"></i>'//' Define Index'
        // Show dropdowns and buttons
        document.getElementById("semanticsDropdown").style.display = "inline";
        document.getElementById("operationsDropdown").style.display = "inline";
        document.getElementById("undoButton").style.display = "inline";
        document.getElementById("formulaName").style.display = "inline";
        document.getElementById("finishButton").style.display = "inline";
        // document.getElementById("formulaName").value = "";
        // formula = [];
        updateFormulaDisplay();
    }
    else {
        // alert("Already collapsed, folding it back"); 
        document.getElementById("defineButton").innerHTML = '<i class="fa fa-caret-right"></i>'//' Define Index'  
        document.getElementById("semanticsDropdown").style.display = "none";
        document.getElementById("operationsDropdown").style.display = "none";
        document.getElementById("undoButton").style.display = "none";
        document.getElementById("formulaName").style.display = "none";
        document.getElementById("finishButton").style.display = "none";
        document.getElementById("formulaName").value = "";
        // Clear formula and display
        document.getElementById("formulaDisplay").innerHTML = "";
    }

    // Populate the semantics dropdown with a default option and tags
    const semanticsDropdown = document.getElementById("semanticsDropdown");
    semanticsDropdown.innerHTML = "<option value=''>Semantic</option>";
    semanticTags.forEach(tag => {
        let option = document.createElement("option");
        option.value = tag;
        option.text = tag;
        semanticsDropdown.add(option);
    });
}

function addTag() {
    const semanticsDropdown = document.getElementById("semanticsDropdown");
    const selectedTag = semanticsDropdown.value;

    if (selectedTag) {
        formula.push(selectedTag);
        updateFormulaDisplay();
    }

    // Reset dropdown to default option
    semanticsDropdown.value = "";
}

function addSymbol() {
    const operationsDropdown = document.getElementById("operationsDropdown");
    const selectedSymbol = operationsDropdown.value;

    if (selectedSymbol) {
        formula.push(selectedSymbol);
        updateFormulaDisplay();
    }

    // Reset dropdown to default option
    operationsDropdown.value = "";
}

function updateFormulaDisplay() {
    document.getElementById("formulaDisplay").innerText = "Index formula: " + formula.join(" ");
}

function undo() {
    if (formula.length > 0) {
        formula.pop();
        updateFormulaDisplay();
    }
}

function finishFormula() {
    const formulaName = document.getElementById("formulaName").value.trim();
    if (!formulaName) {
        alert("Please name your formula before finishing.");
        return;
    }

    try {
        // Create the compiled function
        const compiledFunction = new Function("values", `
          const [${semanticTags.join(",")}] = values;
          return ${formula.join(" ").replace(/\s/g, '')};
        `);

        // Save the formula in the formula library object
        formulaLibrary[formulaName] = {
            name: formulaName,
            expression: formula.join(" "),
            semanticIdExpression: formula.map(t => semanticTags.includes(t) ? semanticTags.indexOf(t) : t).join(" "),
            compiledFormula: compiledFunction
        };

        console.log(`Formula "${formulaName}" created and saved to formulaLibrary.`);
        alert(`Formula "${formulaName}" compiled and saved successfully!`);
        console.log({ formulaLibrary })
        document.getElementById("formulaName").value = "";
        // Clear formula and display
        document.getElementById("formulaDisplay").innerHTML = "";
        formula = [];
        updateFormulaDisplay();
    } catch (error) {
        alert("There was an error in your formula syntax. Please review it.");
    }
}

// To test: Access each formula by calling `formulaLibrary["formulaName"]` in the console
// Example: formulaLibrary["myFormula"].compiledFormula([value1, value2, value3])