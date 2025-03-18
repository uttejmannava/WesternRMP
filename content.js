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
                        console.log(`Found professor: ${name}`);
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


function getProfessorData(professorName, department) {
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

// add tooltips with professor info
async function displayProfessorRating(professorCell, professorName, department) {
    try {
        const professorData = await getProfessorData(professorName, department);
        console.log(`Professor ${professorName} data:`, professorData.node);
        data = professorData.node;

        const textNodes = Array.from(professorCell.childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE);
        
        let targetNode = null;
        for (const textNode of textNodes) {
            if (textNode.textContent.trim() === professorName) {
                targetNode = textNode;
                break;
            }
        }
        
        if (!targetNode) {
            console.warn(`Could not find text node for professor: ${professorName}`);
            return;
        }
        
        // wrapper to replace text node
        const wrapperSpan = document.createElement('span');
        wrapperSpan.className = 'professor-name-wrapper';
        wrapperSpan.textContent = professorName;
        wrapperSpan.style.position = 'relative';
        wrapperSpan.style.cursor = 'default';
        wrapperSpan.style.borderBottom = '1px dotted #666';
        
        // tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'professor-tooltip';
        tooltip.style.display = 'none';
        tooltip.style.position = 'absolute';
        tooltip.style.bottom = '100%';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translateX(-50%)';
        tooltip.style.width = '300px';
        tooltip.style.backgroundColor = 'white';
        tooltip.style.border = '1px solid #ccc';
        tooltip.style.borderRadius = '4px';
        tooltip.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
        tooltip.style.padding = '12px';
        tooltip.style.zIndex = '1000';
        tooltip.style.fontSize = '14px';
        tooltip.style.color = '#333';
        
        // format professor data for tooltip
        const fullName = `${data.firstName} ${data.lastName}`;
        const professorId = atob(data.id).split('-')[1]; // decode base64 string and remove prefix
        const professorLink = `https://www.ratemyprofessors.com/professor/${professorId}`;
        const avgRating = data.avgRatingRounded.toFixed(2) || 'N/A';
        const numRatings = data.numRatings || 0;
        const wouldTakeAgain = data.wouldTakeAgainPercentRounded !== null 
            ? `${data.wouldTakeAgainPercentRounded.toFixed(1)}%` 
            : 'N/A';
        const avgDifficulty = data.avgDifficultyRounded.toFixed(2) || 'N/A';
        const profDepartment = data.department || department || 'N/A';
        
        // get most useful rating if available
        let mostUsefulRatingHTML = '<p>No ratings available</p>';
        if (data.mostUsefulRating) {
            const rating = data.mostUsefulRating;
            const date = rating.date ? new Date(rating.date).toLocaleDateString() : 'Unknown date';
            const comment = rating.comment || 'No comment provided';
            const course = rating.class || 'Unknown course';
            const quality = rating.qualityRating || 'N/A';
            
            mostUsefulRatingHTML = `
                <div class="most-useful-rating">
                    <p><strong>Course:</strong> ${course}</p>
                    <p><strong>Rating:</strong> ${quality}/5 (${date})</p>
                    <p><strong>Comment:</strong> "${comment.substring(0, 150)}${comment.length > 150 ? '...' : ''}"</p>
                </div>
            `;
        }
        
        // top tags
        let tagsHTML = '';
        if (data.teacherRatingTags && data.teacherRatingTags.length > 0) {
            const topTags = data.teacherRatingTags
                .sort((a, b) => b.tagCount - a.tagCount)
                .slice(0, 3);
                
            tagsHTML = `
                <div class="top-tags">
                    <p><strong>Top Tags:</strong> ${topTags.map(tag => tag.tagName).join(', ')}</p>
                </div>
            `;
        }
        
        // add tooltip content
        tooltip.innerHTML = `
            <div class="tooltip-header" style="margin-bottom:8px; border-bottom:1px solid #eee; padding-bottom:8px;">
                <h3 style="margin:0; font-size:16px;">${fullName}</h3>
                <p style="margin:4px 0 0 0; color:#666;">${profDepartment}</p>
            </div>
            <div class="tooltip-body">
                <div class="rating-stats" style="display:flex; justify-content:space-between; margin-bottom:10px;">
                    <div>
                        <p style="margin:0;"><strong>Overall:</strong> <span style="color:#2196F3; font-weight:bold;">${avgRating}/5</span></p>
                        <p style="margin:4px 0 0 0;"><strong>Difficulty:</strong> ${avgDifficulty}/5</p>
                    </div>
                    <div>
                        <p style="margin:0;"><strong>Would take again:</strong> ${wouldTakeAgain}</p>
                        <p style="margin:4px 0 0 0;"><strong>Total ratings:</strong> ${numRatings}</p>
                    </div>
                </div>
                ${tagsHTML}
                <div class="most-useful" style="margin-top:10px; border-top:1px solid #eee; padding-top:8px;">
                    <h4 style="margin:0 0 6px 0; font-size:14px;">Most Helpful Rating</h4>
                    ${mostUsefulRatingHTML}
                </div>
            </div>
            <div class="tooltip-footer" style="margin-top:8px; font-size:12px; color:#666; text-align:right;">
                <p style="margin:0;"><a href="${professorLink}" target="_blank">Data from RateMyProfessors.com</a></p>
            </div>
        `;
        
        wrapperSpan.appendChild(tooltip);
        
        targetNode.parentNode.replaceChild(wrapperSpan, targetNode);
        
        // show/hide tooltip
        wrapperSpan.addEventListener('mouseenter', () => {
            tooltip.style.display = 'block';
        });
        
        wrapperSpan.addEventListener('mouseleave', () => {
            tooltip.style.display = 'none';
        });
        
        // indicator that a professor has rating
        const ratingIndicator = document.createElement('span');
        ratingIndicator.className = 'rating-indicator';
        ratingIndicator.textContent = ` (${avgRating})`;
        ratingIndicator.style.color = getRatingColor(avgRating);
        ratingIndicator.style.fontWeight = 'bold';
        ratingIndicator.style.fontSize = '0.9em';
        wrapperSpan.appendChild(ratingIndicator);
        
    } catch (error) {
        console.error(`Error getting rating for ${professorName}:`, error);
    }
}


function getRatingColor(rating) {
    rating = parseFloat(rating);
    if (isNaN(rating)) return '#999'; // gray for N/A
    
    if (rating >= 4.5) return '#4CAF50'; // green
    if (rating >= 3.5) return '#8BC34A'; // light green
    if (rating >= 2.5) return '#FFC107'; // amber
    if (rating >= 1.5) return '#FF9800'; // orange
    return '#F44336'; // red
}

scanPageForProfessors();