function scanPageForProfessors() {
    const tables = document.querySelectorAll('.table.table-condensed.table-hover');
    
    tables.forEach(table => {
        const rows = table.querySelectorAll('tr');
        
        rows.forEach(row => {
            const professorCell = row.querySelectorAll('td')[3];
            
            if (professorCell && professorCell.childNodes.length > 0) { // child node is text or br
                const professorNames = extractProfessorNames(professorCell);
                const department = extractDepartment();

                professorNames.forEach(name => {
                    if (name) {
                        console.log(`Found professor: ${name} in department: ${department}`);
                        displayProfessorRating(professorCell, name, department); // bake in a 200ms delay here
                    }
                });
            }
        });
    });
}

function extractDepartment() {
    const selectElement = document.querySelector('select#Subject.form-control');
    
    if (selectElement) {
        const selectedOption = selectElement.options[selectElement.selectedIndex];
        if (selectedOption) {
            return selectedOption.text.trim();
        }
    }
    
    return ""; // if no dept found
}

function extractProfessorNames(cell) {
    const names = [];
    let currentName = '';
    
    cell.childNodes.forEach(node => {

        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent.trim();
            if (text) {
                currentName = text;
            }
        } else if (node.nodeName === 'BR' && currentName) { // br element signals the end of a professor name
            names.push(currentName);
            currentName = '';
        }
    });
    
    if (currentName) {
        names.push(currentName);
    }
    
    return names;
}

// Function to request professor data from background script
function getProfessorRating(professorName, department) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
            action: "searchProfessor",
            professorName: professorName,
            department: department
        }, response => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
                return;
            }
            
            if (response.success) {
                resolve(response.professor);
            } else {
                reject(new Error(response.error || "Unknown error"));
            }
        });
    });
}

// Updated to accept both the element and the professor name
async function displayProfessorRating(professorElement, professorName, department) {
    try {
        const professorData = await getProfessorRating(professorName, department);
        
        // Display the rating in the UI
        console.log(`Professor ${professorName} has rating: ${professorData.avgRatingRounded}`);
        
        // Create and add a rating element
        const ratingElement = document.createElement('span');
        ratingElement.className = 'professor-rating';
        ratingElement.textContent = `Rating: ${professorData.avgRatingRounded}/5`;
        
        // Add the rating after the professor's name
        // Find where this professor's name appears in the cell
        const textNodes = Array.from(professorElement.childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE);
            
        for (const textNode of textNodes) {
            if (textNode.textContent.trim() === professorName) {
                // Insert after this text node
                if (textNode.nextSibling) {
                    professorElement.insertBefore(ratingElement, textNode.nextSibling);
                } else {
                    professorElement.appendChild(ratingElement);
                }
                break;
            }
        }
        
    } catch (error) {
        console.error(`Error getting rating for ${professorName}:`, error);
    }
}
scanPageForProfessors();

