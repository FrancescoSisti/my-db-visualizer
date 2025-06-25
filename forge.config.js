const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    name: 'DB Visualizer Pro',
    executableName: 'db-visualizer-pro',
    icon: './assets/icon', // You can add an icon later
    ignore: [
      /^\/src\/renderer/,
      /^\/\.vscode/,
      /^\/\.git/,
      /^\/node_modules\/(?!.*\.(node|dll|dylib|so)$)/,
      /tailwind\.config\.js/,
      /postcss\.config\.js/,
      /vite\.config\.js/,
      /tsconfig.*\.json/
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'db_visualizer_pro',
        setupExe: 'DB Visualizer Pro Setup.exe',
        setupIcon: './assets/icon.ico'
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'Francesco Sisti',
          homepage: 'https://github.com/francescosisti/db-visualizer-pro',
          description: 'Modern local database visualizer with intuitive UI/UX'
        }
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          maintainer: 'Francesco Sisti',
          homepage: 'https://github.com/francescosisti/db-visualizer-pro',
          description: 'Modern local database visualizer with intuitive UI/UX'
        }
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};
