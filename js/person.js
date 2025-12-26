class Person {
    constructor(name, phone = null, email = null) {
        this.name = name; // string
        this.email = email; // string
        this.phone = phone; // string
    }

    get_name() {
        return this.name;
    }
    
    get_email() {
        return this.email;
    }
    
    get_phone() {
        return this.phone;
    }
}

// Export for Node.js (for browser, this would be omitted or handled differently)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Person;
}

