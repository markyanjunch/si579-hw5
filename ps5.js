/**
 * Returns a list of objects grouped by some property. For example:
 * groupBy([{name: 'Steve', team:'blue'}, {name: 'Jack', team: 'red'}, {name: 'Carol', team: 'blue'}], 'team')
 *
 * returns:
 * { 'blue': [{name: 'Steve', team: 'blue'}, {name: 'Carol', team: 'blue'}],
 *    'red': [{name: 'Jack', team: 'red'}]
 * }
 *
 * @param {any[]} objects: An array of objects
 * @param {string|Function} property: A property to group objects by
 * @returns  An object where the keys representing group names and the values are the items in objects that are in that group
 */
 function groupBy(objects, property) {
    // If property is not a function, convert it to a function that accepts one argument (an object) and returns that object's
    // value for property (obj[property])
    if(typeof property !== 'function') {
        const propName = property;
        property = (obj) => obj[propName];
    }

    const groupedObjects = new Map(); // Keys: group names, value: list of items in that group
    for(const object of objects) {
        const groupName = property(object);
        //Make sure that the group exists
        if(!groupedObjects.has(groupName)) {
            groupedObjects.set(groupName, []);
        }
        groupedObjects.get(groupName).push(object);
    }

    // Create an object with the results. Sort the keys so that they are in a sensible "order"
    const result = {};
    for(const key of Array.from(groupedObjects.keys()).sort()) {
        result[key] = groupedObjects.get(key);
    }
    return result;
}

// Initialize DOM elements that will be used.
const outputDescription = document.querySelector('#output_description');
const wordOutput = document.querySelector('#word_output');
const showRhymesButton = document.querySelector('#show_rhymes');
const showSynonymsButton = document.querySelector('#show_synonyms');
const wordInput = document.querySelector('#word_input');
const savedWords = document.querySelector('#saved_words');

// Stores saved words.
const savedWordsArray = [];

/**
 * Makes a request to Datamuse and updates the page with the
 * results.
 * 
 * Use the getDatamuseRhymeUrl()/getDatamuseSimilarToUrl() functions to make
 * calling a given endpoint easier:
 * - RHYME: `datamuseRequest(getDatamuseRhymeUrl(), () => { <your callback> })
 * - SIMILAR TO: `datamuseRequest(getDatamuseRhymeUrl(), () => { <your callback> })
 *
 * @param {String} url
 *   The URL being fetched.
 * @param {Function} callback
 *   A function that updates the page.
 */
function datamuseRequest(url, callback) {
    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            // This invokes the callback that updates the page.
            callback(data);
        }, (err) => {
            console.error(err);
        });
}

/**
 * Gets a URL to fetch rhymes from Datamuse
 *
 * @param {string} rel_rhy
 *   The word to be rhymed with.
 *
 * @returns {string}
 *   The Datamuse request URL.
 */
function getDatamuseRhymeUrl(rel_rhy) {
    return `https://api.datamuse.com/words?${(new URLSearchParams({'rel_rhy': wordInput.value})).toString()}`;
}

/**
 * Gets a URL to fetch 'similar to' from Datamuse.
 *
 * @param {string} ml
 *   The word to find similar words for.
 *
 * @returns {string}
 *   The Datamuse request URL.
 */
function getDatamuseSimilarToUrl(ml) {
    return `https://api.datamuse.com/words?${(new URLSearchParams({'ml': wordInput.value})).toString()}`;
}

/**
 * Add a word to the saved words array and update the #saved_words `<span>`.
 *
 * @param {string} word
 *   The word to add.
 */
function addToSavedWords(word) {
    // You'll need to finish this...
    if (!savedWordsArray.includes(word)) {
        savedWordsArray.push(word);
        savedWords.innerHTML = savedWordsArray.join(', '); 
    }        
}

// Add additional functions/callbacks here.
savedWords.innerHTML = '(none)';
function rhymeCallBack(data) {
    wordOutput.innerHTML = '';
    if (data.length === 0) {
        wordOutput.innerHTML = '(no results)'
    }
    else {
        const groups = groupBy(data, 'numSyllables');
        for (let group in groups) {
            const syllable = document.createElement('h3');
            syllable.textContent = `Syllables: ${group}`;
            wordOutput.appendChild(syllable);
            let words =  document.createElement('ul');
            for (let w in groups[group]) {
                const item = document.createElement('li');
                item.textContent = groups[group][w].word;
                item.innerHTML += `<button type="button" class="btn btn-outline-success" onclick="addToSavedWords('${item.textContent}')">(Save)</button>`;
                words.appendChild(item);
            }
            wordOutput.appendChild(words);
        }
    }
}
function show_rhymes_trigger() {
    outputDescription.innerHTML = `Words that rhyme with ${wordInput.value}`;
    wordOutput.innerHTML = '...loading';
    datamuseRequest(getDatamuseRhymeUrl(),rhymeCallBack);
}
function synonymCallBack(data) {
    wordOutput.innerHTML = '';
    if (data.length === 0) {
        wordOutput.innerHTML = '(no results)'
    }
    else {
        let words =  document.createElement('ul');
        for (let w in data) {
            const item = document.createElement('li');
            item.textContent = data[w].word;
            item.innerHTML += `<button type="button" class="btn btn-outline-success" onclick="addToSavedWords('${item.textContent}')">(Save)</button>`;
            words.appendChild(item); 
        }
        wordOutput.appendChild(words);
    }
}
function show_synonyms_trigger() {
    outputDescription.innerHTML = `Words with a meaning similar to ${wordInput.value}`;
    wordOutput.innerHTML = '...loading';
    datamuseRequest(getDatamuseSimilarToUrl(),synonymCallBack);
}
// Add event listeners here.
showRhymesButton.addEventListener('click', show_rhymes_trigger);
wordInput.addEventListener('keyup', (e) => {
    if (e.keyCode === 13) {
        show_rhymes_trigger();
    }
});
showSynonymsButton.addEventListener('click', show_synonyms_trigger);
