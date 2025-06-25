const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    name: 'DB Visualizer Pro Alpha',
    executableName: 'db-visualizer-pro',
    productName: 'DB Visualizer Pro',
    appVersion: '0.1.0-alpha',
    buildVersion: '0.1.0-alpha',
    appCopyright: 'Copyright © 2024 DB Visualizer Pro Team',
    // icon: './assets/icon', // Uncomment when you add an icon
    ignore: [
      /^\/src\/renderer/,
      /^\/\.vscode/,
      /^\/\.git/,
      /tailwind\.config\.js/,
      /postcss\.config\.js/,
      /vite\.config\.js/,
      /tsconfig.*\.json/,
      /^\/CHANGELOG\.md/,
      /^\/README\.md/
    ],
    win32metadata: {
      CompanyName: 'DB Visualizer Pro Team',
      FileDescription: 'Modern database visualization tool',
      OriginalFilename: 'db-visualizer-pro.exe',
      ProductName: 'DB Visualizer Pro Alpha',
      InternalName: 'db-visualizer-pro'
    }
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name: 'db_visualizer_pro_alpha',
        setupExe: 'DB Visualizer Pro Alpha Setup.exe',
        // setupIcon: './assets/icon.ico', // Uncomment when you add an icon
        loadingGif: false,
        authors: 'DB Visualizer Pro Team',
        description: 'Modern database visualization tool built with Vue.js, TypeScript, and Electron',
        version: '0.1.0-alpha'
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux'],
      config: {
        name: 'db-visualizer-pro-alpha-{{version}}-{{platform}}-{{arch}}'
      }
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'DB Visualizer Pro Team <info@dbvisualizer.dev>',
          homepage: 'https://github.com/yourusername/db-visualizer-pro',
          description: 'Modern database visualization tool built with Vue.js, TypeScript, and Electron. Alpha version 0.1.0.',
          productName: 'DB Visualizer Pro Alpha',
          genericName: 'Database Visualizer',
          categories: ['Development', 'Database'],
          section: 'devel',
          priority: 'optional',
          depends: ['mysql-client']
        }
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          maintainer: 'DB Visualizer Pro Team <info@dbvisualizer.dev>',
          homepage: 'https://github.com/yourusername/db-visualizer-pro',
          description: 'Modern database visualization tool built with Vue.js, TypeScript, and Electron. Alpha version 0.1.0.',
          productName: 'DB Visualizer Pro Alpha',
          genericName: 'Database Visualizer',
          categories: ['Development', 'Database'],
          license: 'MIT'
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
