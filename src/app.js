/**
 * Created by Alice Paquette on 12/27/2017
 */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/* -- Modules ----------- */
const calculations_module_1 = require("./modules/calculations.module");
const key_combinations_module_1 = require("./modules/key-combinations.module");
(() => {
    /*** Variables ***/
    /* -- Keyboard Shortcuts and Keypad Functionality -------------
     * Shortcuts work by listening to the keydown event, converting it into a key combination, and binding that to
     * a value (via 'keyBindings'); that value is then associated to a button (via keypadButtons),
     * which is then clicked programmatically. Finally, the value of the clicked button is evaluated and either
     * executed as a function or written to the expression as a character. */
    /* Hash table for key combinations and keypad button values ( keyCombination: keypadButtonValue ) */
    const keyBindings = {
        '1': '1', '2': '2', '3': '3', '4': '4', '5': '5', '6': '6', '7': '7', '8': '8', '9': '9', '0': '0',
        '.': '.', '(': '(', ')': ')', '+': '+', '-': '-', '*': '*', 'x': '*', 'X': '*', '/': '/',
        'Delete': 'delete', 'Backspace': 'delete', 'Control+Delete': 'allclear', 'Control+Backspace': 'allclear',
        'Enter': 'wrap'
    };
    /* Hash table for keypad button values and keypad buttons ( keypadButtonValue: keypadButton ) */
    const keypadButtons = {};
    document.querySelectorAll('button.kpad-btn').forEach(button => {
        keypadButtons[button.value] = button;
    });
    /* Calculator display functionality ------------ */
    const resultDiv = document.getElementById('result');
    const expressionDiv = document.getElementById('expression');
    let composing = false; // True if there was a user input in the last second
    let timeoutId; // The ID of the current Window.timeout used to determine if the user is composing
    /* -- A tiny version of a redux store ------------ */
    const store = {
        expression: {
            dispatch: (action, payload) => {
                const oldState = expressionDiv.textContent || '';
                let newState = oldState;
                switch (action) {
                    case 'write':
                        newState = oldState + payload;
                        break;
                    case 'delete':
                        newState = oldState.slice(0, -1);
                        break;
                    case 'wrap':
                        if (oldState !== '') {
                            newState = `(${oldState})`;
                        }
                        break;
                    case 'allclear':
                        newState = '';
                        break;
                }
                expressionDiv.textContent = newState;
                expressionDiv.dispatchEvent(new CustomEvent('change', { detail: newState }));
            }
        },
        result: {
            dispatch: (action, payload) => {
                switch (action) {
                    case 'update':
                        resultDiv.textContent = payload;
                        break;
                }
            }
        }
    };
    /*** Functions ***/
    /* -- Event Handlers --------- */
    /* Expression changes */
    function expressionChanged(e) {
        let result;
        let resultIsValid = true;
        if (e.detail !== '') {
            try {
                result = calculations_module_1.CalculationsModule.resolveExpression(e.detail);
                resultIsValid = calculations_module_1.CalculationsModule.isDecimalFormat(result);
            }
            catch (e) {
                resultIsValid = false;
            }
        }
        else
            result = '-';
        /* Update the result state or notify the user of an invalid expression */
        if (resultIsValid) {
            store.result.dispatch('update', result);
            /* If the result is valid, we want the display to show it immediately. Because of this, the 'invalid' class is
             * removed immediately instead of in the callback to startOrResetComposingTimer, as below. */
            startOrResetComposingTimer();
            animateElement(resultDiv, 100);
            expressionDiv.classList.remove('invalid');
        }
        else {
            /* If the result is invalid, we want to wait a second before updating the display. Because of this, the 'invalid'
             * class is added in the callback of startOrResetComposingTimer. */
            startOrResetComposingTimer(() => {
                expressionDiv.classList.add('invalid');
            });
        }
    }
    /* Keypad button clicks */
    function keypadButtonClicked(e) {
        animateElement(e.target, 100);
        /* Check if it's a function, execute it if so */
        if (e.target.classList.contains('kpad-fn')) {
            switch (e.target.value) {
                case 'delete':
                    store.expression.dispatch('delete');
                    break;
                case 'wrap':
                    store.expression.dispatch('wrap');
                    break;
                case 'allclear':
                    store.expression.dispatch('allclear');
                    break;
            }
        }
        else
            store.expression.dispatch('write', e.target.value);
    }
    /* -- Animation and styling ---------- **/
    /* Adds the class 'highlight' to a button for a user-defined amount of time (in ms) for the purposes of animation. */
    function animateElement(el, timeout = 200) {
        el.classList.add('animate');
        window.setTimeout(() => {
            el.classList.remove('animate');
        }, timeout);
    }
    /* Starts the timer if it's not running, resets it if it is, and calls 'callback' when/if the timer ends. */
    function startOrResetComposingTimer(callback) {
        clearTimeout(timeoutId);
        composing = true;
        timeoutId = window.setTimeout(() => {
            composing = false;
            if (callback)
                callback();
        }, 1000);
    }
    /*** MAIN ------------------------- ***/
    /* -- Add Listeners ---------- */
    /* Expression changes */
    expressionDiv.addEventListener('change', expressionChanged);
    /* Keypad button clicks */
    Object.keys(keypadButtons).forEach(k => {
        keypadButtons[k].addEventListener('click', keypadButtonClicked);
    });
    /* Keydown */
    document.addEventListener('keydown', (e) => {
        const keybindFunction = keyBindings[key_combinations_module_1.KeyCombinationsModule.convertToKeyCombination(e)];
        if (keybindFunction) {
            keypadButtons[keybindFunction].click();
            e.preventDefault(); /* Prevent browser keyboard shortcuts from conflicting with the app's */
        }
    });
    /* Check for OS and browser to fix scrollbar issues on Firefox Quantum on Windows */
    if (navigator.appVersion.indexOf("Win") != -1)
        document.getElementById('app-container').classList.add('windows');
    if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1)
        document.getElementById('app-container').classList.add('firefox');
    /*** ------------------------------- ***/
})();
//# sourceMappingURL=app.js.map