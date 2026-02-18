module.exports = {
    presets: ['module:metro-react-native-babel-preset'],
    plugins: [
        [
            'module-resolver',
            {
                root: ['./src'],
                extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
                alias: {
                    '@': './src',
                    '@components': './src/components',
                    '@screens': './src/screens',
                    '@navigation': './src/navigation',
                    '@store': './src/store',
                    '@api': './src/api',
                    '@utils': './src/utils',
                    '@hooks': './src/hooks',
                    '@theme': './src/theme',
                    '@types': './src/types',
                },
            },
        ],
        'react-native-reanimated/plugin',
    ],
    env: {
        production: {
            plugins: ['react-native-paper/babel'],
        },
    },
};
