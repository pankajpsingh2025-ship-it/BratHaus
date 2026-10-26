import { defineConfig } from "@playwright/test";

// Round 3 checks (tests/round3.spec.ts), against a running PRODUCTION build:
//   npm run build && npm start -- -H 127.0.0.1 -p 5196
//   BASE=http://127.0.0.1:5196 npx playwright test            (normal)
//   BASE=http://127.0.0.1:5196 THROTTLE=6 npx playwright test (CPU ×6, like Responsively / older phones)
const sizes: [string, number, number][] = [
  ["390x844", 390, 844], ["375x667", 375, 667], ["768x1024", 768, 1024], ["1024x768", 1024, 768],
  ["1280x800", 1280, 800], ["1440x900", 1440, 900], ["1920x1080", 1920, 1080], ["844x390", 844, 390],
];
export default defineConfig({
  testDir: "tests",
  timeout: 240_000,
  workers: 4,
  reporter: [["list"], ["json", { outputFile: "_reports/round3/results.json" }]],
  use: {
    baseURL: process.env.BASE || "http://127.0.0.1:5196",
    launchOptions: { executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] },
  },
  projects: sizes.map(([name, width, height]) => ({ name, use: { viewport: { width, height }, isMobile: width < 900 && height > width, hasTouch: width < 900 } })),
});
