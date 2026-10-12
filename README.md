# Wings of Freedom Bip Max

Animated Wings of Freedom watch face for the Amazfit Bip Max.

## 1. Download and install dependencies

```bash
git clone https://github.com/pedrosfaria2/wings-of-freedom-bip-max.git
cd wings-of-freedom-bip-max
npm install
```

## 2. Sign in to Zepp

```bash
node scripts/zeus.cjs login
```

Follow the terminal prompts using your Zepp account.

## 3. Compile and generate the installation QR code

```bash
node scripts/zeus.cjs preview -t "Amazfit Bip Max"
```
