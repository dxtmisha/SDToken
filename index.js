const {promises} = require('fs');
const {registerTransforms} = require('@tokens-studio/sd-transforms');

const StyleDictionary = require('style-dictionary');

registerTransforms(StyleDictionary);

StyleDictionary.registerTransform({
    type: `attribute`,
    name: `attribute/my`,
    transformer: (token) => {
        const attrNames = ['item', 'category', 'type', 'subitem', 'state'];
        const originalAttrs = token.attributes || {};
        const generatedAttrs =  {}

        for(let i=0; i<token.path.length && i<attrNames.length; i++) {
            generatedAttrs[attrNames[i]] = token.path[i];
        }

        return Object.assign(generatedAttrs, originalAttrs);
    }
})

const sd = StyleDictionary.extend({
    source: ['tokens/**/*.json'],
    platforms: {
        json: {
            transforms: [
                'attribute/my',
                'ts/descriptionToComment',
                'ts/size/px',
                'ts/opacity',
                'ts/size/lineheight',
                'ts/typography/fontWeight',
                'ts/resolveMath',
                'ts/size/css/letterspacing',
                'ts/typography/css/fontFamily',
                'ts/typography/css/shorthand',
                'ts/border/css/shorthand',
                'ts/shadow/css/shorthand',
                'ts/color/css/hexrgba',
                'ts/color/modifiers',
                'name/cti/kebab',
            ],
            buildPath: 'build/json/',
            files: [
                {
                    destination: 'variables.json',
                    format: 'json',
                },
            ],
        },
        css: {
            transforms: [
                'attribute/cti',
                'ts/descriptionToComment',
                'ts/size/px',
                'ts/opacity',
                'ts/size/lineheight',
                'ts/typography/fontWeight',
                'ts/resolveMath',
                'ts/size/css/letterspacing',
                'ts/typography/css/fontFamily',
                'ts/typography/css/shorthand',
                'ts/border/css/shorthand',
                'ts/shadow/css/shorthand',
                'ts/color/css/hexrgba',
                'ts/color/modifiers',
                'name/cti/kebab',
            ],
            buildPath: 'build/css/',
            files: [
                {
                    destination: 'variables.css',
                    format: 'css/variables',
                },
            ],
        },
    },
});

async function run() {
    const $themes = JSON.parse(await promises.readFile('tokens/$themes.json', 'utf-8'));
    const configs = $themes.map(theme => ({
        source: Object.entries(theme.selectedTokenSets)
            .filter(([, val]) => val !== 'disabled')
            .map(([tokenset]) => `tokens/${tokenset}.json`),
        platforms: {
            css: {
                transformGroup: 'tokens-studio',
                transforms: ['attribute/cti'],
                buildPath: 'build/css/',
                files: [
                    {
                        destination: `vars-${theme.name}.css`,
                        format: 'css/variables',
                    },
                ],
            },
        },
    }));

    configs.forEach(cfg => {
        const sd = StyleDictionary.extend(cfg);
        sd.cleanAllPlatforms(); // optionally, cleanup files first..
        sd.buildAllPlatforms();
    });
}

sd.cleanAllPlatforms(); // optionally, cleanup files first..
sd.buildAllPlatforms();

//run().then()
