import Fuse from 'fuse.js';

export function search(json, query) {
    const options = {
        shouldSort: true,
        threshold: 0.4,
        includeScore: true,
        keys: [
            "name",
            "url",
            "tags"
        ]
    };
    const fuse = new Fuse(json, options);
    let res = fuse.search(query);
    return res
}