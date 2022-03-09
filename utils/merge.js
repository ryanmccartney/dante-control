//NAME: merge.js
//AUTH: Ryan McCartney (rmccartney856@gmail.com)
//DESC: Deep merge of two objects
//DATE: 07/03/2022

const isObject = (item) => {
    return item && typeof item === "object" && !Array.isArray(item);
};

const merge = (target, ...sources) => {
    if (!sources.length) return target;
    const source = sources.shift();

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                merge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }

    return merge(target, ...sources);
};

module.exports = merge;
