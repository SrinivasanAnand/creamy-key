/**
 * Browser-compatible CSV parser and data loader
 * This version uses fetch() instead of Node.js fs module
 */

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

/**
 * Populate database with people and groups from CSV
 * @param {string} csvText - CSV file content as string
 * @returns {Database} Populated database instance
 */
function populate_database(csvText) {
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

    // Parse CSV data
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

/**
 * Load CSV file and populate database (browser version using fetch)
 * @param {string} csvPath - Path to CSV file (relative to HTML file)
 * @returns {Promise<Database>} Promise that resolves to populated database
 */
async function loadDatabaseFromCSV(csvPath) {
    try {
        const response = await fetch(csvPath);
        if (!response.ok) {
            throw new Error(`Failed to load CSV: ${response.statusText}`);
        }
        const csvText = await response.text();
        return populate_database(csvText);
    } catch (error) {
        console.error('Error loading database:', error);
        throw error;
    }
}

