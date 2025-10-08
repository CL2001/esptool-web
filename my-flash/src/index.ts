const baudrates = document.getElementById("baudrates") as HTMLSelectElement;
const consoleBaudrates = document.getElementById("consoleBaudrates") as HTMLSelectElement;
const connectButton = document.getElementById("connectButton") as HTMLButtonElement;
const traceButton = document.getElementById("copyTraceButton") as HTMLButtonElement;
const disconnectButton = document.getElementById("disconnectButton") as HTMLButtonElement;
const resetButton = document.getElementById("resetButton") as HTMLButtonElement;
const consoleStartButton = document.getElementById("consoleStartButton") as HTMLButtonElement;
const consoleStopButton = document.getElementById("consoleStopButton") as HTMLButtonElement;
const eraseButton = document.getElementById("eraseButton") as HTMLButtonElement;
const programButton = document.getElementById("programButton") as HTMLButtonElement;
const filesDiv = document.getElementById("files");
const terminal = document.getElementById("terminal");
const programDiv = document.getElementById("program");
const consoleDiv = document.getElementById("console");
const lblBaudrate = document.getElementById("lblBaudrate");
const lblConsoleBaudrate = document.getElementById("lblConsoleBaudrate");
const lblConsoleFor = document.getElementById("lblConsoleFor");
const lblConnTo = document.getElementById("lblConnTo");
const table = document.getElementById("fileTable") as HTMLTableElement;
const alertDiv = document.getElementById("alertDiv");

const debugLogging = document.getElementById("debugLogging") as HTMLInputElement;

import { ESPLoader, FlashOptions, LoaderOptions, Transport } from "../../lib";
import { serial } from "web-serial-polyfill";

const serialLib = !navigator.serial && navigator.usb ? serial : navigator.serial;

declare let Terminal;
declare let CryptoJS;

const term = new Terminal({ cols: 120, rows: 40 });
term.open(terminal);

let device = null;
let transport: Transport;
let chip: string = null;
let esploader: ESPLoader;

disconnectButton.style.display = "none";
traceButton.style.display = "none";
eraseButton.style.display = "none";
consoleStopButton.style.display = "none";
resetButton.style.display = "none";
filesDiv.style.display = "none";

// Set fixed baud rates and hide the selects
baudrates.value = "921600";
consoleBaudrates.value = "115200";
baudrates.style.display = "none";
consoleBaudrates.style.display = "none";
lblBaudrate.style.display = "none";
lblConsoleBaudrate.style.display = "none";

/**
 * File reader handler
 */
function handleFileSelect(evt) {
  const file = evt.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev: ProgressEvent<FileReader>) => {
    evt.target.data = ev.target.result;
  };
  reader.readAsBinaryString(file);
}

const espLoaderTerminal = {
  clean() {
    term.clear();
  },
  writeLine(data) {
    term.writeln(data);
  },
  write(data) {
    term.write(data);
  },
};

// Initialize fixed 3 files
function initializeFileRows() {
  const addresses = ["0x0000", "0x8000", "0x10000"];
  const labels = ["Add bootloader.bin", "Add partitions.bin", "Add firmware.bin"];

  addresses.forEach((addr, index) => {
    const row = table.insertRow(index + 1);

    // Column 1 - Offset
    const cell1 = row.insertCell(0);
    const element1 = document.createElement("input");
    element1.type = "text";
    element1.value = addr;
    element1.disabled = true;
    cell1.appendChild(element1);

    // Column 2 - File selector
    const cell2 = row.insertCell(1);
    const element2 = document.createElement("input");
    element2.type = "file";
    element2.addEventListener("change", handleFileSelect, false);
    cell2.appendChild(element2);

    // Column 3 - Progress
    const cell3 = row.insertCell(2);
    cell3.classList.add("progress-cell");
    cell3.style.display = "none";
    cell3.innerHTML = `<progress value="0" max="100"></progress>`;

    // Column 4 - Empty (action cell)
    const cell4 = row.insertCell(3);
    cell4.classList.add("action-cell");

    // Column 5 - Label text (new column on the right)
    const cell5 = row.insertCell(4);
    cell5.textContent = labels[index];
    cell5.style.fontWeight = "bold";
    cell5.style.color = "#007bff";
  });
}

initializeFileRows();

connectButton.onclick = async () => {
  try {
    if (device === null) {
      device = await serialLib.requestPort({});
      transport = new Transport(device, true);
    }
    const flashOptions = {
      transport,
      baudrate: parseInt(baudrates.value),
      terminal: espLoaderTerminal,
      debugLogging: debugLogging.checked,
    } as LoaderOptions;
    esploader = new ESPLoader(flashOptions);

    traceButton.style.display = "initial";
    chip = await esploader.main();

    console.log("Settings done for :" + chip);
    lblBaudrate.style.display = "none";
    lblConnTo.innerHTML = "Connected to device: " + chip;
    lblConnTo.style.display = "block";
    baudrates.style.display = "none";
    connectButton.style.display = "none";
    disconnectButton.style.display = "initial";
    eraseButton.style.display = "initial";
    filesDiv.style.display = "initial";
    consoleDiv.style.display = "none";
  } catch (e) {
    console.error(e);
    term.writeln(`Error: ${e.message}`);
  }
};

traceButton.onclick = async () => {
  if (transport) transport.returnTrace();
};

resetButton.onclick = async () => {
  if (transport) {
    await transport.setDTR(false);
    await new Promise((resolve) => setTimeout(resolve, 100));
    await transport.setDTR(true);
  }
};

eraseButton.onclick = async () => {
  eraseButton.disabled = true;
  try {
    await esploader.eraseFlash();
  } catch (e) {
    console.error(e);
    term.writeln(`Error: ${e.message}`);
  } finally {
    eraseButton.disabled = false;
  }
};

function cleanUp() {
  device = null;
  transport = null;
  chip = null;
}

disconnectButton.onclick = async () => {
  if (transport) await transport.disconnect();

  term.reset();
  lblBaudrate.style.display = "initial";
  baudrates.style.display = "initial";
  consoleBaudrates.style.display = "initial";
  connectButton.style.display = "initial";
  disconnectButton.style.display = "none";
  traceButton.style.display = "none";
  eraseButton.style.display = "none";
  lblConnTo.style.display = "none";
  filesDiv.style.display = "none";
  alertDiv.style.display = "none";
  consoleDiv.style.display = "initial";
  cleanUp();
};

let isConsoleClosed = false;
consoleStartButton.onclick = async () => {
  if (device === null) {
    device = await serialLib.requestPort({});
    transport = new Transport(device, true);
  }
  lblConsoleFor.style.display = "block";
  lblConsoleBaudrate.style.display = "none";
  consoleBaudrates.style.display = "none";
  consoleStartButton.style.display = "none";
  consoleStopButton.style.display = "initial";
  resetButton.style.display = "initial";
  programDiv.style.display = "none";

  await transport.connect(parseInt(consoleBaudrates.value));
  isConsoleClosed = false;

  while (true && !isConsoleClosed) {
    const readLoop = transport.rawRead();
    const { value, done } = await readLoop.next();
    if (done || !value) break;
    term.write(value);
  }
  console.log("quitting console");
};

consoleStopButton.onclick = async () => {
  isConsoleClosed = true;
  if (transport) {
    await transport.disconnect();
    await transport.waitForUnlock(1500);
  }
  term.reset();
  lblConsoleBaudrate.style.display = "initial";
  consoleBaudrates.style.display = "initial";
  consoleStartButton.style.display = "initial";
  consoleStopButton.style.display = "none";
  resetButton.style.display = "none";
  lblConsoleFor.style.display = "none";
  programDiv.style.display = "initial";
  cleanUp();
};

function validateProgramInputs() {
  const rowCount = table.rows.length;
  for (let index = 1; index < rowCount; index++) {
    const row = table.rows[index];
    const fileObj = row.cells[1].childNodes[0] as any;
    if (!fileObj.data) return `No file selected for row ${index}!`;
  }
  return "success";
}

programButton.onclick = async () => {
  const alertMsg = document.getElementById("alertmsg");
  const err = validateProgramInputs();

  if (err != "success") {
    alertMsg.innerHTML = "<strong>" + err + "</strong>";
    alertDiv.style.display = "block";
    return;
  }

  alertDiv.style.display = "none";

  const fileArray = [];
  const progressBars = [];

  for (let index = 1; index < table.rows.length; index++) {
    const row = table.rows[index];

    const offSetObj = row.cells[0].childNodes[0] as HTMLInputElement;
    const offset = parseInt(offSetObj.value);

    const fileObj = row.cells[1].childNodes[0] as any;
    const progressBar = row.cells[2].childNodes[0];

    progressBar.textContent = "0";
    progressBars.push(progressBar);

    row.cells[2].style.display = "initial";
    row.cells[3].style.display = "none";

    fileArray.push({ data: fileObj.data, address: offset });
  }

  try {
    const flashOptions: FlashOptions = {
      fileArray: fileArray,
      eraseAll: false,
      compress: true,
      reportProgress: (fileIndex, written, total) => {
        progressBars[fileIndex].value = (written / total) * 100;
      },
      calculateMD5Hash: (image) => CryptoJS.MD5(CryptoJS.enc.Latin1.parse(image)),
    } as FlashOptions;
    await esploader.writeFlash(flashOptions);
    await esploader.after();
  } catch (e) {
    console.error(e);
    term.writeln(`Error: ${e.message}`);
  } finally {
    for (let index = 1; index < table.rows.length; index++) {
      table.rows[index].cells[2].style.display = "none";
      table.rows[index].cells[3].style.display = "initial";
    }
  }
};
