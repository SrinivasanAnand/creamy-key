// Import classes (for Node.js - in browser, these would be loaded via script tags)
const Person = require('./person.js');
const GroupChat = require('./groupchat.js');
const Database = require('./database.js');
const fs = require('fs');
const path = require('path');

/**
 * Simple CSV parser for this specific use case
 * @param {string} csvText - Raw CSV text
 * @returns {Array} Array of objects with keys from header row
 */
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    
    // Parse header
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Parse data rows
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const values = [];
        let current = '';
        let inQuotes = false;
        
        // Handle quoted fields (which may contain commas)
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                if (inQuotes && line[j + 1] === '"') {
                    // Escaped quote
                    current += '"';
                    j++; // Skip next quote
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim()); // Add last value
        
        // Create object from row
        const rowObj = {};
        headers.forEach((header, index) => {
            rowObj[header] = values[index] || '';
        });
        rows.push(rowObj);
    }
    
    return rows;
}

function create_member_list(members_entry, database) {
    const all_member_names = members_entry.split(",");
    const trimmed_names = all_member_names.map(name => name.trim());
    const all_members = database.get_members_from_names(trimmed_names);
    return all_members;
}

function populate_database() {
    const database = new Database("Creamy Database");
    
    // Create all people
    const anand = new Person("Anand");
    const vivek = new Person("Vivek");
    const lizzie = new Person("Lizzie");
    const drew = new Person("Drew");
    const luke = new Person("Luke");
    const malaika = new Person("Malaika");
    const quinn = new Person("Quinn");
    const rishika = new Person("Rishika");
    const will = new Person("Will");
    const abigail = new Person("Abigail");
    const idone = new Person("Idone");
    const riley = new Person("Riley");

    const all_people = [anand, vivek, lizzie, drew, luke, malaika, quinn, rishika, will, abigail, idone, riley];
    database.add_people(all_people);

    // Read and parse CSV file
    const csvPath = path.join(__dirname, '..', 'creamy-key.csv');
    const csvText = fs.readFileSync(csvPath, 'utf8');
    const creamy_key = parseCSV(csvText);

    // Create groups from CSV data
    for (let row of creamy_key) {
        const name = row["Name"];
        const members = row["Members"];
        const purpose = row["Purpose"] || null;
        const notes = row["Notes"] || null;
        
        const member_list = create_member_list(members, database);
        const group = new GroupChat(name, member_list, purpose, notes);
        database.add_group(group);
    }

    return database;
}

// Test the functionality (equivalent to if __name__ == "__main__")
if (require.main === module) {
    const creamy_database = populate_database();
    const creamy_team_members = ["Vivek", "Lizzie", "anand", "Quinn", "Will"];
    const creamy_team_group = creamy_database.lookup_group_from_member_names(creamy_team_members);

    console.log("Found group:");
    console.log(creamy_team_group.name);
    console.log("--------------------------------");
    
    // Uncomment to see all groups:
    // for (let group of creamy_database.get_groups()) {
    //     console.log(group.name);
    //     console.log(group.members.map(m => m.name));
    //     console.log(group.purpose);
    //     console.log(group.notes);
    //     console.log("--------------------------------");
    // }
}

// Export for use in other modules
module.exports = { populate_database, parseCSV };

