class Database {
    constructor(name) {
        this.name = name; // string
        this.groups = []; // array of GroupChat objects
        this.people = []; // array of Person objects
    }

    add_group(group) {
        this.groups.push(group);
    }

    add_person(person) {
        this.people.push(person);
    }
    
    remove_person(person) {
        const index = this.people.indexOf(person);
        if (index > -1) {
            this.people.splice(index, 1);
        }
    }
    
    get_people() {
        return this.people;
    }
    
    add_people(people) {
        this.people.push(...people);
    }
    
    lookup_person_from_name(name) {
        for (let person of this.people) {
            if (person.name.toLowerCase() === name.toLowerCase()) {
                return person;
            }
        }
        return null;
    }
    
    get_members_from_names(names) {
        const members = names.map(name => this.lookup_person_from_name(name));
        return members;
    }

    remove_group(group) {
        const index = this.groups.indexOf(group);
        if (index > -1) {
            this.groups.splice(index, 1);
        }
    }

    get_groups() {
        return this.groups;
    }
    
    /**
     * Helper function to check if two arrays contain the same elements (set comparison)
     * @param {Array} arr1 - First array
     * @param {Array} arr2 - Second array
     * @returns {boolean} - True if arrays contain the same elements
     */
    _arraysEqualAsSets(arr1, arr2) {
        if (arr1.length !== arr2.length) {
            return false;
        }
        // Create sets of object references for comparison
        const set1 = new Set(arr1);
        const set2 = new Set(arr2);
        
        // Check if all elements in set1 are in set2
        for (let item of set1) {
            if (!set2.has(item)) {
                return false;
            }
        }
        return true;
    }

    _arraysIsSubsetOf(arr1, arr2) {
        // Check if all items in arr1 are in arr2
        // This works with object references
        return arr1.every(item => {
            if (item === null || item === undefined) {
                return false;
            }
            return arr2.includes(item);
        });
    }
    
    lookup_group_from_members(members) {
        for (let group of this.groups) {
            if (this._arraysEqualAsSets(group.members, members)) {
                return group;
            }
        }
        return null;
    }
    
    lookup_group_from_name(name) {
        for (let group of this.groups) {
            if (group.name === name) {
                return group;
            }
        }
        return null;
    }
    
    lookup_group_from_member_names(names) {
        const members = this.get_members_from_names(names);
        return this.lookup_group_from_members(members);
    }

    potential_group_chats_from_members(members) {
        const valid_group_chats = [];
        for (let group of this.groups) {
            if (this._arraysIsSubsetOf(members, group.members)) {
                valid_group_chats.push(group);
            }
        }
        return valid_group_chats;
    }
}

// Export for Node.js (for browser, this would be omitted or handled differently)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Database;
}

