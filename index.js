//jshint esnext:true

/**
 * Asserts "expected" versus "actual", 
 * 'failing' the assertion (via Error) if a difference is found.
 *
 * @param {String} message The comparison message passed by the user
 * @param {*} expected The expected item
 * @param {*} actual The actual item
 */

const deepEquals = (object1, object2) => {
    if (Object.keys(object1).length !== Object.keys(object2).length) {
        identical = false;
        throw new Error(`${message}: Expected ${object1.length} keys but found ${object2.length} keys`)
    }

    //Only Arrays of equal length and Objects of equal amount of keys will reach here
    for (let i in object1) {
        for (let j in object2) {
            if (typeof object1[i] === "object" || typeof object2[j] === "object") {
                deepEquals(object1[i], object2[j]);
            }

            if (object1[i] !== object2[j]) {
                identical = false;
                return identical
            }
        }
        return identical
    }
}

// Note: Currently not *intentionally* handling Symbol comparisons. 
// Confirm if more checks are required for type Symbol
// Confrm the most semantic error you should return in each case
function assertEquals(message, expected, actual, keyTrace) {
    // Useful later for indicating in error messages if the object is an array, an object, or null.
    const objType = obj => Array.isArray(obj) ? "Array" : obj === null ? "Null" : "Object";

    // Start with simple type checking 
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
                throw new Error(`${message}: Expected type ${objType(expected)} but found ${objType(actual)}`)
            }
        }


        // We could use just the second conditional here, but by doing the two, we differentiate for the user
        // when the error is due to arrays and when it is due to objects. (also part of requirements)
        if (expected?.length !== actual?.length) {
            throw new Error(`${message}: Expected array length "${expected?.length}" but found length "${actual?.length}"`)
        }

        // This will be caught more specifically in the for loop below.
        // const keysLen = obj => Object.keys(obj).length
        // if (keysLen(expected) !== keysLen(actual)) {
        //     throw new Error(`${message}: Expected ${keysLen(expected)} keys but found ${keysLen(actual)} keys`)
        // }

        // Only arrays of same length or objects with same no. of keys reach here
        for (let key in expected) {
            // If expected key does not exist in actual, throw.
            // If key exists in actual that does not exist in expected, separate error.
            // if () {
            // }
            if (typeof expected[key] === "object" || typeof actual[key] === "object") {
                // When calling recursively, include the current trace of keys so we can keep track of where we are in the object,
                // adding on the most current key to the trace
                assertEquals(message, expected[key], actual[key], `${keyTrace ? keyTrace + "." : ""}${key}`);
            } else if (expected[key] !== actual[key]) {
                // Only nested non-objects should reach here
                throw new Error(`${message}: Expected ${keyTrace}.${key} "${expected[key]}" but found "${actual[key]}"`)
            }
            // }
        }


    }

    // Only arrays and strings can pass this conditional
    // STRINGS WILL FAIL HERE ALSO. CATCH IN TDD LATER



    // This may be better placed at top? How could this fail as first test? DOes it matter if it follows type checks?
    // This will still fail for differnt instances of objects with identical key/values

    return `${message}: Pass! "${expected}" equals "${actual}"`
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
        { message: 'Test 10', expected: { a: 'a', b: 'b' }, actual: { a: 'a' } },
    ];

    const assertionFailures = testCases.map(runTest)
        //     .filter(result => result !== undefined)
        .forEach(addToList)
}

function addToList(message) {
    var messagesEl = document.getElementById('messages');
    var newListEl = document.createElement('li');
    newListEl.innerHTML = message;
    messagesEl.appendChild(newListEl);
}

runAll();