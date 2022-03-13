//jshint esnext:true

/**
 * Determines if an object is array, object, or null. 
 * Useful later for specifying in error messages if the object is an array, an object, or null.
 * @param {Object} obj 
 */
const objType = obj => Array.isArray(obj) ? "Array" : obj === null ? "Null" : "Object";

/**
 * Asserts "expected" versus "actual", 
 * 'failing' the assertion (via Error) if a difference is found.
 *
 * @param {String} message The comparison message passed by the user
 * @param {*} expected The expected item
 * @param {*} actual The actual item
 * @param {String[]} [keyTrace] The current trace of keys indicating at what level of the object/array the the inequality was found. This should not need to be passed explicitly, occurs via recursive calls within assertEquals.
 */

// Note: Currently not *intentionally* handling Symbol comparisons. 
// Confirm if more checks are required for type Symbol
// Confrm the most semantic error you should return in each case
function assertEquals(message, expected, actual, keyTrace = [], map = new Map()) {
    // Simple equality check
    if (expected === actual) {
        return `${message}: Pass!`
    }

    // Prevent recursive object definitions from causing infinite call stack
    // We're using maps here because we can use an object as the key, rather than only strings as would be allowed by objects
    if (map.has(expected) || map.has(actual)) {
        return `${message}: Pass!`
    }
    map.set(expected, actual);

    // Simple type checking 
    if (typeof expected !== typeof actual) {
        throw new TypeError(`${message}: Expected type "${typeof expected}" but found type "${typeof actual}"`)
    }

    // Checking object vs array types, as arrays have type "object" in JS
    if (Array.isArray(expected) !== Array.isArray(actual)) {
        throw new TypeError(`${message}: Expected type "${objType(expected)}" but found type "${objType(actual)}"`)
    }

    // From here on, types of both expected and actual should be identical
    // For anything but objects (incl arrays), equality operator is sufficient
    if (typeof actual !== "object") {
        if (expected !== actual) {
            throw new Error(`${message}: Expected "${expected}" but found "${actual}"`)
        }
    } else {
        // Only objects, arrays, and null reach here
        // Handle null being of type object in JS
        if (expected === null || actual === null) {
            if (expected !== actual) {
                throw new TypeError(`${message}: Expected type ${objType(expected)} but found ${objType(actual)}`)
            }
        }

        // Arrays with different number of keys are handled here
        if (expected?.length !== actual?.length) {
            throw new Error(`${message}: Expected array length "${expected?.length}" but found length "${actual?.length}"`)
        }

        // Objects with different number of keys are handled here
        const expectedKeys = Object.keys(expected);
        const actualKeys = Object.keys(actual);
        if (expectedKeys.length !== actualKeys.length) {
            if (expectedKeys.length > actualKeys.length) {
                // Check every key in expected until we find the one that is missing from actual
                for (key in expected) {
                    if (actual[key] === undefined) throw new Error(`${message}: Expected ${[...keyTrace, key].join(".")} but was not found`)
                }
            } else {
                // Check every key in actual until we find the one that we did not expect (ie does not exist on expected)
                for (key in actual) {
                    if (expected[key] === undefined) throw new Error(`${message}: Found unexpected ${[...keyTrace, key].join(".")}`)
                }
            }
        }

        // Only arrays of same length or objects with same no. of keys reach here
        for (let key in expected) {
            if (typeof expected[key] === "object" || typeof actual[key] === "object") {
                // When calling recursively, we include the current trace of keys so we can keep track of where we are in the object,
                // always adding on the current key to the trace
                assertEquals(message, expected[key], actual[key], [...keyTrace, key], map);
            } else if (expected[key] !== actual[key]) {
                // Only non-objects should reach here
                if (actual[key] === undefined) {
                    throw new Error(`${message}: Expected ${[...keyTrace, key].join(".")} but was not found`)
                } else {
                    throw new Error(`${message}: Expected ${[...keyTrace, key].join(".")} "${expected[key]}" but found "${actual[key]}"`)
                }
            }
            // }
        }


    }
    // Included for testing purposes
    return `${message}: Pass!`
}


/* -- Test running code:  --- */

/**
 * Runs a "assertEquals" test.
 * 
 * @param {String} message The initial message to pass
 * @param {*} expected Expected item
 * @param {*} actual The actual item
 */
function runTest({ message, expected, actual }) {
    try {
        return assertEquals(message, expected, actual);
    } catch (error) {
        return error.message;
    }
}

function runAll() {
    var complexObject1 = {
        propA: 1,
        propB: {
            propA: [1, { propA: 'a', propB: 'b' }, 3],
            propB: 1,
            propC: 2
        }
    };
    var complexObject1Copy = {
        propA: 1,
        propB: {
            propA: [1, { propA: 'a', propB: 'b' }, 3],
            propB: 1,
            propC: 2
        }
    };
    var complexObject2 = {
        propA: 1,
        propB: {
            propB: 1,
            propA: [1, { propA: 'a', propB: 'c' }, 3],
            propC: 2
        }
    };
    var complexObject3 = {
        propA: 1,
        propB: {
            propA: [1, { propA: 'a', propB: 'b' }, 3],
            propB: 1
        }
    };
    const a = {}
    a.self = a
    const b = { self: a }
    const c = {}
    c.self = c
    const d = { self: { self: a } }
    const e = { self: { self: b } }

    var testCases = [
        { message: 'Test 01', expected: 'abc', actual: 'abc' },
        { message: 'Test 02', expected: 'abcdef', actual: 'abc' },
        { message: 'Test 03', expected: ['a'], actual: { 0: 'a' } },
        { message: 'Test 04', expected: ['a', 'b'], actual: ['a', 'b', 'c'] },
        { message: 'Test 05', expected: ['a', 'b', 'c'], actual: ['a', 'b', 'c'] },
        { message: 'Test 06', expected: complexObject1, actual: complexObject1Copy },
        { message: 'Test 07', expected: complexObject1, actual: complexObject2 },
        { message: 'Test 08', expected: complexObject1, actual: complexObject3 },
        { message: 'Test 09', expected: null, actual: {} },

        // Additional tests
        // Same no. of keys but actual is missing a key from expected
        { message: 'Test 10', expected: { a: 'a', b: 'b' }, actual: { a: 'a', c: 'c' } },
        // Actual has more keys than expected
        { message: 'Test 11', expected: { a: 'a' }, actual: { a: 'a', c: 'c' } },

        // Self referencial objects of various depth
        { message: 'Test 12', expected: a, actual: b },
        { message: 'Test 13', expected: a, actual: c },
        { message: 'Test 14', expected: a, actual: d },
        { message: 'Test 15', expected: a, actual: e },
        { message: 'Test 16', expected: b, actual: a },
        { message: 'Test 16', expected: b, actual: c },
        { message: 'Test 17', expected: b, actual: d },
        { message: 'Test 18', expected: b, actual: e },
        { message: 'Test 19', expected: c, actual: d },
        { message: 'Test 20', expected: c, actual: e },
        { message: 'Test 21', expected: d, actual: e },
    ];

    const assertionFailures = testCases.map(runTest)
        .filter(result => result !== undefined)
        .forEach(addToList)
}

function addToList(message) {
    var messagesEl = document.getElementById('messages');
    var newListEl = document.createElement('li');
    newListEl.innerHTML = message;
    messagesEl.appendChild(newListEl);
}

runAll();