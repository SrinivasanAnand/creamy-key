// Main application logic
let database = null;
let selectedPeople = new Set(); // Store selected person names

// Initialize the application
async function init() {
    try {
        // Load the database
        database = await loadDatabaseFromCSV('creamy-key.csv');
        console.log('Database loaded successfully!');
        
        // Populate the people buttons
        populatePeopleButtons();
        
        // Populate the group chat buttons
        populateGroupChatButtons();
        
        // Set up event listeners
        setupEventListeners();
    } catch (error) {
        console.error('Failed to initialize application:', error);
        document.getElementById('results-container').innerHTML = 
            '<div class="no-results"><p>Error loading database. Please refresh the page.</p></div>';
    }
}

// Populate the left column with person buttons
function populatePeopleButtons() {
    const people = database.get_people();
    const container = document.getElementById('people-container');
    
    // Sort people alphabetically by name
    const sortedPeople = [...people].sort((a, b) => 
        a.name.localeCompare(b.name)
    );
    
    container.innerHTML = ''; // Clear container
    
    sortedPeople.forEach(person => {
        const button = document.createElement('button');
        button.className = 'person-button button-54';
        button.textContent = person.name;
        button.dataset.personName = person.name;
        
        // Add click handler
        button.addEventListener('click', () => togglePerson(person.name));
        
        container.appendChild(button);
    });
}

// Toggle a person's selection state
function togglePerson(personName) {
    const button = document.querySelector(`[data-person-name="${personName}"]`);
    
    if (selectedPeople.has(personName)) {
        // Deselect
        selectedPeople.delete(personName);
        button.classList.remove('selected');
    } else {
        // Select
        selectedPeople.add(personName);
        button.classList.add('selected');
    }
    
    // Update results
    updateResults();
}


// Populate the right column with all group chat buttons
function populateGroupChatButtons() {
    const groups = database.get_groups();
    const container = document.getElementById('results-container');
    
    // Sort groups alphabetically by name
    const sortedGroups = [...groups].sort((a, b) => 
        a.name.localeCompare(b.name)
    );
    
    container.innerHTML = ''; // Clear container
    
    sortedGroups.forEach(group => {
        const button = document.createElement('button');
        button.className = 'group-chat-button button-54';
        button.textContent = group.name;
        button.dataset.groupName = group.name;
        
        // Add click handler to select members of this group
        button.addEventListener('click', () => toggleGroupMembers(group));
        
        container.appendChild(button);
    });
}

// Toggle group members selection - if already selected, deselect all
function toggleGroupMembers(group) {
    const groupButton = document.querySelector(`[data-group-name="${group.name}"]`);
    const isCurrentlySelected = groupButton.classList.contains('highlighted');
    
    if (isCurrentlySelected) {
        // If already selected, deselect everything
        deselectAll();
    } else {
        // Select all members of this group
        selectGroupMembers(group);
    }
}

// Select all members of a group chat and deselect all others
function selectGroupMembers(group) {
    // Clear all selections
    selectedPeople.clear();
    
    // Remove selected class from all person buttons
    const allPersonButtons = document.querySelectorAll('.person-button');
    allPersonButtons.forEach(button => {
        button.classList.remove('selected');
    });
    
    // Remove highlight from all group chat buttons first
    const allGroupButtons = document.querySelectorAll('.group-chat-button');
    allGroupButtons.forEach(button => {
        button.classList.remove('highlighted');
        button.classList.remove('potential');
    });
    
    // Select only the members of this group
    group.members.forEach(member => {
        selectedPeople.add(member.name);
        const personButton = document.querySelector(`[data-person-name="${member.name}"]`);
        if (personButton) {
            personButton.classList.add('selected');
        }
    });
    
    // Highlight the group chat button directly
    const groupButton = document.querySelector(`[data-group-name="${group.name}"]`);
    if (groupButton) {
        groupButton.classList.add('highlighted');
    }
    
}

// Deselect all members and group chats
function deselectAll() {
    // Clear all selections
    selectedPeople.clear();
    
    // Remove selected class from all person buttons
    const allPersonButtons = document.querySelectorAll('.person-button');
    allPersonButtons.forEach(button => {
        button.classList.remove('selected');
    });
    
    // Remove highlight from all group chat buttons
    const allGroupButtons = document.querySelectorAll('.group-chat-button');
    allGroupButtons.forEach(button => {
        button.classList.remove('highlighted');
        button.classList.remove('potential');
    });
    
}

// Update the results based on selected people - highlight matching and potential group chats
function updateResults() {
    console.log('updateResults called, selectedPeople.size:', selectedPeople.size);
    
    // Remove all highlights from group chat buttons
    const allGroupButtons = document.querySelectorAll('.group-chat-button');
    allGroupButtons.forEach(button => {
        button.classList.remove('highlighted');
        button.classList.remove('potential');
    });
    
    if (selectedPeople.size === 0) {
        console.log('No people selected, returning');
        return;
    }
    
    // Convert Set to Array for lookup
    const selectedNames = Array.from(selectedPeople);
    console.log('Selected names:', selectedNames);
    
    // Get selected members as Person objects (filter out any null values)
    const selectedMembers = database.get_members_from_names(selectedNames).filter(member => member !== null);
    console.log('Selected members (Person objects):', selectedMembers);
    console.log('Selected member names:', selectedMembers.map(m => m ? m.name : 'null'));
    
    // Only proceed if we have valid members
    if (selectedMembers.length === 0) {
        console.log('No valid members found, returning');
        return;
    }
    
    // Get potential group chats that could be formed from selected members
    const potentialGroups = database.potential_group_chats_from_members(selectedMembers);
    console.log('Potential groups found:', potentialGroups);
    console.log('Potential group names:', potentialGroups.map(g => g.name));
    
    // Highlight all potential group chats in blue
    potentialGroups.forEach(group => {
        const groupButton = document.querySelector(`[data-group-name="${group.name}"]`);
        console.log(`Looking for button for group: ${group.name}, found:`, groupButton);
        if (groupButton) {
            groupButton.classList.add('potential');
            console.log(`Added potential class to: ${group.name}`);
        } else {
            console.log(`Button not found for group: ${group.name}`);
        }
    });
    
    // Also check for exact match and highlight it in yellow
    const exactGroup = database.lookup_group_from_member_names(selectedNames);
    if (exactGroup) {
        const exactButton = document.querySelector(`[data-group-name="${exactGroup.name}"]`);
        if (exactButton) {
            // Remove potential class and add highlighted class for exact match
            exactButton.classList.remove('potential');
            exactButton.classList.add('highlighted');
        }
    }
}

// Set up any additional event listeners
function setupEventListeners() {
    // Add clear all button listener
    const clearAllButton = document.getElementById('clear-all-button');
    if (clearAllButton) {
        clearAllButton.addEventListener('click', deselectAll);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

