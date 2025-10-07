









Steps took to init project
mkdir esptool-web
cd esptool-web
npm init -y
npm install esptool-js
npm install web-serial-polyfill
npm install typescript vite --save-dev
npx tsc --init


Install node v20+
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20
node -v




To run
npm run dev
