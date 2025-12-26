class GroupChat {
    constructor(name, members, purpose = null, notes = null) {
        this.name = name; // string
        this.members = members; // array of Person objects
        this.purpose = purpose; // string
        this.notes = notes; // string
    }

    add_member(member) {
        this.members.push(member);
    }

    remove_member(member) {
        const index = this.members.indexOf(member);
        if (index > -1) {
            this.members.splice(index, 1);
        }
    }

    get_members() {
        return this.members;
    }
}

// Export for Node.js (for browser, this would be omitted or handled differently)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GroupChat;
}

