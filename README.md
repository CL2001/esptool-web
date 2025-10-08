# Compile the firmware after modifications
## First time set up
Download pipx and add to path
```bash
sudo apt install pipx
pipx ensurepath
```
Install plaform io
```bash
pipx install platformio
```

Open a new terminal and verify the install is successful.
You should see the PlatformIO Core version printed, e.g., 'PlatformIO Core, version 6.x.x'.
```bash
pio --version
```

## Compile
1. Compile the Firmware
Compile using the following command
```bash
pio run --project-dir ./firmware
```



# Running the code
## First time set up
```bash
npm install
npm run build
```
```bash
cd my-flash
npm install
```

## Run website
```bash
npm run dev
```

Then open `http://localhost:1234` in a Chrome browser.



All credits goes to the esptool-web project.
I have simply modified their example project and placed it into my-flash