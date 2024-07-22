let table;
let tableData = [];
let tableHeaders = [];

function preload() {
  console.log("Loading CSV...");
  try {
    table = loadTable('output.csv', 'csv', 'header', function() {
      console.log("CSV loaded successfully");
    }, function() {
      console.error("Error loading CSV");
    });
  } catch (e) {
    console.error("Exception while loading CSV: ", e);
  }
}

function setup() {
  createCanvas(1000, 800);
  console.log("Setup started...");
  if (table) {
    console.log(table.getRowCount() + ' total rows in table');
    console.log(table.getColumnCount() + ' total columns in table');
    tableHeaders = table.columns;
    loadLastRow();
  } else {
    console.log("Table not loaded");
  }
}

function loadLastRow() {
  try {
    let lastRow = table.getRowCount() - 1;
    let rowData = [];
    for (let c = 0; c < table.getColumnCount(); c++) {
      let cellValue = table.getString(lastRow, c);
      if (cellValue !== undefined) {
        rowData.push(cellValue);
        console.log(`Row ${lastRow} Column ${c}: ${cellValue}`);
      } else {
        console.warn(`Row ${lastRow} Column ${c} is undefined`);
        rowData.push("");
      }
    }
    tableData.push(rowData);
  } catch (e) {
    console.error("Error loading last row: ", e);
  }
}

function draw() {
  background(220);
  textSize(16);
  fill(0);
  text('Check console for CSV data', 10, 30);

  drawTable();
}

function drawTable() {
  textSize(12);
  fill(0);

  // Draw table headers
  for (let c = 0; c < tableHeaders.length; c++) {
    text(tableHeaders[c], 10 + c * 120, 70);
  }

  // Draw the last row
  if (tableData.length > 0) {
    let rowData = tableData[0];
    for (let c = 0; c < rowData.length; c++) {
      text(rowData[c], 10 + c * 120, 90);
    }
  }
}
