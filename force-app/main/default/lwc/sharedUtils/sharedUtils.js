import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// Dispatch Toast Event
const dispatchToastEvent = (title, message, variant, mode = 'dismissable', messageData = []) => {
    dispatchEvent(
        new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: mode,
            messageData: messageData
        }),
    );
}

// Reduce Errors
const reduceErrors = (errors) => {

    if (!Array.isArray(errors)) {
        errors = [errors];
    }

    return (
        errors
            // Remove null/undefined items
            .filter((error) => !!error)
            // Extract an error message
            .map((error) => {

                // UI API read errors
                if (error.body) {
                    if (error.body.duplicateResults && error.body.duplicateResults.length) {
                        return error.body.duplicateResults.map((err) => err.message);
                    }
                    else if (error.body.fieldErrors && error.body.fieldErrors.length && Array.isArray(error.body.fieldErrors)) {
                        return error.body.fieldErrors.map((err) => err.message);
                    }
                    else if (error.body.pageErrors && error.body.pageErrors.length && Array.isArray(error.body.pageErrors)) {
                        return error.body.pageErrors.map((err) => err.message);
                    }
                    else if (Array.isArray(error.body)) {
                        return error.body.map((err) => err.message);
                    }
                    // UI API DML, Apex and network errors
                    else if (error.body && typeof error.body.message === 'string') {
                        return error.body.message;
                    }
                }
                else if (error.detail) {
                    if (error.detail.output.fieldErrors && Object.keys(error.detail.output.fieldErrors).length) {
                        return Object.entries(error.detail.output.fieldErrors).map(([key, value]) => {
                            return value.map((err) => err.message);
                        });
                    }
                    else if (error.detail.detail && typeof error.detail.detail === 'string') {
                        return error.detail.detail;
                    }
                    else if (error.detail.message && typeof error.detail.message === 'string') {
                        return error.detail.message;
                    }
                }
                // JS errors
                else if (typeof error.message === 'string') {
                    return error.message;
                }
                
                // Unknown error shape so try HTTP status text
                return error.statusText;
            })
            // Flatten
            .reduce((prev, curr) => prev.concat(curr), [])
            // Remove empty strings
            .filter((message) => !!message)
    );
}

// Meant to concatenate a message with reduced errors / seperator value 
const joinErrors = (reducedErrors, seperator) => {
    if (!seperator) {
        seperator = ', ';
    }
    
    if (Array.isArray(reducedErrors)) {
        reducedErrors = reducedErrors.join(seperator);
    }

    return reducedErrors;
}

export {
    dispatchToastEvent,
    reduceErrors,
    joinErrors    
}