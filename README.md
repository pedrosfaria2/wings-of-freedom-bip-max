# Wings of Freedom Bip Max

Animated Wings of Freedom watch face for the Amazfit Bip Max.

Use [Node.js 22 LTS](https://nodejs.org/en/download).

## 1. Download and install dependencies

```bash
git clone https://github.com/pedrosfaria2/wings-of-freedom-bip-max.git
cd wings-of-freedom-bip-max
npm ci
```

## 2. Sign in to Zepp

```bash
node scripts/zeus.cjs login
```

Sign in with your Zepp account in the browser.

## 3. Compile and generate the installation QR code

```bash
node scripts/zeus.cjs preview -t "Amazfit Bip Max"
```
